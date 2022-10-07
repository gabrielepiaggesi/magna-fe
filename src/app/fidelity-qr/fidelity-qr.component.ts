import { Location } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, OnDestroy, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-fidelity-qr',
  templateUrl: './fidelity-qr.component.html',
  styleUrls: ['./fidelity-qr.component.scss'],
})
export class FidelityQrComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter();
  @Input() fidelityCard!: any;
  @Input() discountPresent: boolean = false;
  public referral$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  public intervalEnded = false;
  public loading = false;
  public step = 1;
  public reservationId!: number;
  public intervalId: any;
  public stop = false;
  public today = (new Date(Date.now()).toISOString().substring(0, 10));
  public reservation$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public newRes = this.fb.group({
    name: [null, Validators.required],
    peopleAmount: [null, Validators.required],
    userDate: [(new Date(Date.now()).toISOString().substring(0, 10)), Validators.required],
    userTime: ['20:00', Validators.required],
    phoneNumber: [null, Validators.required],
    note: [null],
  });

  constructor(
    private apiService: ApiService, 
    private fb: FormBuilder,
    public loc: Location
  ) {
  }

  ngOnDestroy(): void {
    this.stop = true;
    clearInterval(this.intervalId);
  }

  ngOnInit(): void {}

  public isDateBeforeToday(date: string) {
    const yesterday = new Date(date.toString().replace(' ', 'T'));
    const today = new Date(Date.now());
    const isInThePast = yesterday.getTime() < today.getTime();
    return isInThePast;
  }

  call() {
    window.open('tel:'+this.fidelityCard?.business_phone_number, '_system');
  }

  web() {
    window.open(this.fidelityCard?.business_website, '_system');
  }

  map() {
    window.open('https://google.com/search?q=' + encodeURI(this.fidelityCard?.business_address), '_system');
  }

  public addReservation() {
    this.loading = true;
    const formValue = this.newRes.getRawValue();
    const date = formValue.userDate + ' ' + formValue.userTime + ':00';
    if (!formValue.peopleAmount || formValue.peopleAmount <= 0) {
      alert('Specifica il numero delle persone!');
      return;
    }
    if (this.isDateBeforeToday(date)) {
      alert('Non puoi prenotare per un tempo passato!'); 
      return;
    }
    formValue.userDate = date;
    this.apiService
      .addUserReservation(formValue, this.fidelityCard.business_id)
      .then((res) => {
        if (res.old) {
          alert('Hai gia prenotato in questo locale oggi, la tua prenotazione è ancora in attesa, vai alle tue prenotazioni (quarta icona nel menu sotto) e controlla da li. Se hai problemi contatta il locale.');
          return;
        }
        if (res.disabled_reservations) {
          alert('Il Locale ancora non ha abilitato le prenotazioni! Contattalo e incoraggialo ad usare Comeback!.');
          return;
        }
        if (res.disable_reservation_today) {
          alert('Ops! Purtroppo oggi il Locale è pieno...ci dispiace tanto :(');
          return;
        }
        this.getCurrentReservation(res.id);
      })
      .catch((e: any) => alert('Errore'))
      .finally(() => (this.loading = false));
  }

  public getQrRaw() {
    return `https://comebackwebapp.web.app/?businessId=${this.fidelityCard.business_id}&entityId=${this.fidelityCard.id}&entityType=fidelityCard`;
  }

  public getCurrentReservation(reservationId: number) {
    this.step = 4;
    this.reservationId = reservationId;
    this.loading = true;
    // this.startingCurrentReservation();
    let count = 0
    this.intervalId = setInterval(() => {
      if (count <= 30) { // ogni 10 secondi per 5 minuti
        !this.stop && this.startingCurrentReservation();
        count = count+1;
      } else if (count <= 60) { // ogni 1 minuto dopo 5 minuti per 5 minuti
        if ((count/10) % 1 === 0) {
          !this.stop && this.startingCurrentReservation();
        }
        count = count+1;
      } else {
        this.intervalEnded = true;
        clearInterval(this.intervalId);
      }
    }, 10000); // ogni 10 secondi
  }

  public startingCurrentReservation() { // chiama get reservation ogni 10 secondi
    this.loading = true;
    this.apiService
      .getReservation(this.reservationId)
      .then((res) => this.processRes(res))
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public generate() { // chiama get reservation ogni 10 secondi
    this.loading = true;
    this.apiService
      .generateUserReferral(this.fidelityCard.business_id, this.fidelityCard.user_id)
      .then((res: any) => this.referral$.next(res))
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public getReferral() { // chiama get reservation ogni 10 secondi
    this.step = 5;
    this.loading = true;
    this.apiService
      .getUserReferral(this.fidelityCard.business_id, this.fidelityCard.user_id)
      .then((res: any) => this.referral$.next(res))
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public copy() {
    navigator.clipboard.writeText(this.referral$.getValue().uuid);
    this.close.emit();
  }

  private processRes(res: any) {
    if (res.status != 'pending') {
      this.stop = true;
      clearInterval(this.intervalId);
      this.reservation$.next(res);
    }
  }
}
