import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss'],
})
export class ReservationsComponent implements OnInit, OnDestroy {
  public loading = false;
  public tab: 'all' | 'pending' | 'canceled' | 'declined' | 'accepted' | 'completed' = 'pending';
  public reservations$: BehaviorSubject<any> = new BehaviorSubject<any>(
    undefined
  );
  public businessId!: number;
  public currentRes$: BehaviorSubject<any> = new BehaviorSubject<any>(
    undefined
  );
  public intervalId: any;
  public stop = false;
  public openOverlay = false;
  public newPending = false;
  public newAccepted = false;
  public newCompleted = false;
  public newDeclined = false;

  public allRes: any[] = [];
  public pendingRes: any[] = [];
  public acceptedRes: any[] = [];
  public completedRes: any[] = [];
  public declinedRes: any[] = [];

  public currentDate = 'Tutte';
  public today = new Date(Date.now());
  public dateOptions$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public showRes$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public manualResOpen = false;
  public manualRes = this.fb.group({
    name: [null, Validators.required],
    peopleAmount: [null, Validators.required],
    userDate: [
      new Date(Date.now()).toISOString().substring(0, 10),
      Validators.required,
    ],
    userTime: ['20:00', Validators.required],
    phoneNumber: [null, Validators.required],
    tableNumber: [null],
    type: ['manual'],
    note: [null],
  });

  constructor(
    private router: Router,
    private apiService: ApiService,
    private appService: AppService,
    private activateRouter: ActivatedRoute,
    public fb: FormBuilder
  ) {
    this.activateRouter.params.subscribe((params) => {
      this.businessId = +params['businessId'];
      this.appService.businessId$.next(this.businessId);
    });
  }

  ngOnDestroy(): void {
    this.stop = true;
    clearInterval(this.intervalId);
  }

  ngOnInit(): void {
    this.businessId && this.getReservations();
  }

  public go(path: string) {
    this.router.navigateByUrl(path);
  }

  public openRes(res: any) {
    this.currentRes$.next(res);
    this.stop = true;
    this.openOverlay = true;
  }

  public close(res: any) {
    const oldResStateIdx = this.allRes.findIndex((r) => r.id === res.id);
    const oldResState = this.allRes[oldResStateIdx];
    if (oldResState.status != res.status) {
      res.new = 0;
      if (res.status === 'accepted') this.acceptedRes.push(res);
      if (res.status === 'completed') this.completedRes.push(res);
      if (res.status === 'declined') this.declinedRes.push(res);

      if (oldResState.status === 'pending')
        this.pendingRes = this.pendingRes.filter((r) => r.id != oldResState.id);
      if (oldResState.status === 'declined')
        this.declinedRes = this.declinedRes.filter(
          (r) => r.id != oldResState.id
        );
      if (oldResState.status === 'accepted')
        this.acceptedRes = this.acceptedRes.filter(
          (r) => r.id != oldResState.id
        );
        if (oldResState.status === 'completed')
        this.completedRes = this.completedRes.filter(
          (r) => r.id != oldResState.id
        );

      this.allRes[oldResStateIdx] = res;
    }

    this.currentRes$.next(undefined);
    this.setTab(this.tab);
    this.stop = false;
    this.openOverlay = false;
  }

  public closeOverlay() {
    this.manualResOpen = false;
    this.stop = false;
    this.currentRes$.next(undefined);
    this.openOverlay = false;
  }

  public getDate(date: string) {
    const userDate = new Date(date);

    const userDateISO = userDate.toDateString().substring(0, 10);
    const todayISO = this.today.toDateString().substring(0, 10);

    if (userDateISO == todayISO) return 'Oggi';

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
    };
    return userDate.toLocaleString('it-IT', options);
  }

  public onDateChange(event: any) {
    const date = event.target.value;
    console.log(date);

    this.currentDate = date;
    this.processReservations(this.currentDate);
    this.setTab(this.tab);
  }

  public setTab(tab: 'all' | 'pending' | 'canceled' | 'declined' | 'accepted' | 'completed') {
    this.tab = tab;
    this.loading = true;
    if (tab === 'all') this.showRes$.next(this.allRes);
    if (tab === 'pending') {
      this.showRes$.next(this.pendingRes);
      this.newPending = false;
    }
    if (tab === 'accepted') {
      this.showRes$.next(this.acceptedRes);
      this.newAccepted = false;
    }
    if (tab === 'completed') {
      this.showRes$.next(this.completedRes);
      this.newCompleted = false;
    }
    if (tab === 'declined') {
      this.showRes$.next(this.declinedRes);
      this.newDeclined = false;
    }
    this.loading = false;
  }

  public filterReservetions(
    arr: any[],
    status: 'all' | 'pending' | 'declined' | 'accepted'| 'completed'
  ): any[] {
    if (status === 'all') return arr;
    return [...arr].filter((r) => r.status === status);
  }

  public openManualRes() {
    this.manualResOpen = true;
    this.openOverlay = true;
  }

  public isDateBeforeToday(date: string) {
    const yesterday = new Date(date.toString().replace(' ', 'T'));
    const today = new Date(Date.now());
    const isInThePast = yesterday.getTime() < today.getTime();
    return isInThePast;
  }

  public sendManualReservation() {
    this.loading = true;
    const formValue = this.manualRes.getRawValue();
    if (!formValue.peopleAmount || formValue.peopleAmount <= 0) {
      alert('Specifica il numero delle persone!');
      return;
    }
    if (this.isDateBeforeToday(formValue.userDate)) {
      alert('Non puoi prenotare per un giorno passato!'); 
      return;
    }
    formValue.userDate = formValue.userDate + ' ' + formValue.userTime + ':00';
    this.apiService
      .addUserReservation(formValue, this.businessId)
      .then((res) => {
        this.acceptedRes = [{...res, new: true}].concat(this.acceptedRes);
        this.setTab('accepted');
      })
      .catch((e: any) => alert('Errore'))
      .finally(() => {
        this.loading = false;
        this.closeOverlay();
      });
  }

  public getReservations() {
    this.loading = true;
    this.startingGetReservations(false);
    this.intervalId = setInterval(() => this.startingGetReservations(), 10000); // ogni 10 secondi
  }

  public async startingGetReservations(showNew = true) {
    !this.stop &&
      this.apiService
        .getBusinessReservations(this.businessId)
        .then((reservations: any) => {
          this.reservations$.next(reservations);
          this.processReservations(this.currentDate, showNew);
          this.setTab(this.tab);
        })
        .catch((e: any) => console.error(e))
        .finally(() => (this.loading = false));
  }

  public processReservations(date: string, showNew = true) {
    const reservationsObj: any = this.reservations$.getValue();
    const reservationsObjDates = Object.keys(reservationsObj);
    this.dateOptions$.next(reservationsObjDates);
    if (date != 'Tutte' && !reservationsObjDates.includes(date)) {
      this.allRes = [];
      this.pendingRes = [];
      this.acceptedRes = [];
      this.declinedRes = [];
      return;
    }

    let reservations: any[] = [];
    if (date != 'Tutte') reservations = reservationsObj[date];
    if (date == 'Tutte') {
      reservationsObjDates.forEach(
        (dateKey: string) =>
          (reservations = reservations.concat(reservationsObj[dateKey]))
      );
    }

    this.allRes = this.filterReservetions(reservations, 'all');
    let pendingRes = this.filterReservetions(reservations, 'pending');
    if (pendingRes.length > this.pendingRes.length) {
      this.newPending = showNew;
      pendingRes = [...pendingRes].map((pR) => {
        const oldRes = this.pendingRes.find((p) => p.id === pR.id);
        console.log(pR, oldRes);
        return { ...pR, new: !oldRes && showNew ? 1 : 0 };
      });
    }
    this.pendingRes = pendingRes;

    let acceptedRes = this.filterReservetions(reservations, 'accepted');
    if (acceptedRes.length > this.acceptedRes.length) {
      this.newAccepted = showNew;
      acceptedRes = [...acceptedRes]
        .map((pR) => {
          const oldRes = this.acceptedRes.find((p) => p.id === pR.id);
          return { ...pR, new: !oldRes && showNew ? 1 : 0 };
        })
        .sort((a, b) => b.new - a.new);
    }
    this.acceptedRes = acceptedRes;

    let completedRes = this.filterReservetions(reservations, 'completed');
    if (completedRes.length > this.completedRes.length) {
      this.newCompleted = showNew;
      completedRes = [...completedRes]
        .map((pR) => {
          const oldRes = this.completedRes.find((p) => p.id === pR.id);
          return { ...pR, new: !oldRes && showNew ? 1 : 0 };
        })
        .sort((a, b) => b.new - a.new);
    }
    this.completedRes = completedRes;

    let declinedRes = this.filterReservetions(reservations, 'declined');
    if (declinedRes.length > this.declinedRes.length) {
      this.newDeclined = showNew;
      declinedRes = [...declinedRes]
        .map((pR) => {
          const oldRes = this.declinedRes.find((p) => p.id === pR.id);
          return { ...pR, new: !oldRes && showNew ? 1 : 0 };
        })
        .sort((a, b) => b.new - a.new);
    }
    this.declinedRes = declinedRes;

  }
}
