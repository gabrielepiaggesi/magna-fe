import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit, OnDestroy {
  @Input() reservation: any;
  @Input() mode: 'user'|'business' = 'business';
  @Output() close = new EventEmitter();
  public step = 1;
  public stop = false;
  public intervalId: any;
  public loading = false;
  public today = new Date(Date.now());
  public newDateForm = this.fb.group({
    businessDate: [null, Validators.required]
  });
  public acceptForm = this.fb.group({
    tableNumber: [null]
  });
  public declineForm = this.fb.group({
    businessMessage: [null]
  });

  constructor(private apiService: ApiService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.mode === 'user' && this.reservation && this.reservation.status === 'pending' && this.getCurrentReservation();
    if (this.reservation) {
      const userTime = new Date(this.reservation.user_date).toLocaleString('sv', {timeZone: 'Europe/Rome'}).substring(11,16);
      console.log(userTime);
      this.newDateForm.get('businessDate')?.setValue(userTime);
    }
  }

  getDate(date: string) {
    const userDate = new Date(date);

    const userDateISO = userDate.toDateString().substring(0, 10);
    const todayISO = this.today.toDateString().substring(0, 10);

    if (userDateISO == todayISO) {
      const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit'};
      return 'Oggi, ' + userDate.toLocaleString('it-IT', options);
    }

    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'};
    return userDate.toLocaleString('it-IT', options);
  }

  ngOnDestroy(): void {
    this.stop = true;
    clearInterval(this.intervalId);
  }

  call() {
    window.open('tel:'+this.reservation?.phone_number, '_system');
  }
  wa() {
    window.open('https://wa.me/'+(this.reservation?.phone_number.startsWith('+39') ? this.reservation?.phone_number : '+39' + this.reservation?.phone_number), '_system');
  }

  public isDateBeforeToday() {
    const yesterday = new Date(this.reservation.user_date.toString().replace(' ', 'T'));
    const today = new Date(Date.now());
    const isInThePast = yesterday.getTime() < today.getTime();
    return isInThePast;
  }

  public cancel() {
    this.loading = true;
    this.apiService
      .updateBusinessReservation({ status: 'declined', subStatus: 'user_canceled' }, this.reservation.id)
      .then((res: any) => this.close.emit({ ...this.reservation, ...res }))
      .catch((e: any) => alert('Errore'))
      .finally(() => (this.loading = false));
  }

  public accept() {
    this.loading = true;
    this.apiService
      .updateBusinessReservation({ status: 'accepted', ...this.acceptForm.getRawValue() }, this.reservation.id)
      .then((res: any) => this.close.emit({ ...this.reservation, ...res }))
      .catch((e: any) => alert('Errore'))
      .finally(() => (this.loading = false));
  }

  public finish() {
    this.loading = true;
    this.apiService
      .updateBusinessReservation({ status: 'completed' }, this.reservation.id)
      .then((res: any) => this.close.emit({ ...this.reservation, ...res }))
      .catch((e: any) => alert('Errore'))
      .finally(() => (this.loading = false));
  }

  public changeTable() {
    this.loading = true;
    this.apiService
      .updateBusinessReservation({ ...this.acceptForm.getRawValue() }, this.reservation.id)
      .then((res: any) => this.close.emit({ ...this.reservation, ...res }))
      .catch((e: any) => alert('Errore'))
      .finally(() => (this.loading = false));
  }

  public decline() {
    this.loading = true;
    this.apiService
      .updateBusinessReservation({ status: 'declined', ...this.declineForm.getRawValue() }, this.reservation.id)
      .then((res: any) => this.close.emit({ ...this.reservation, ...res }))
      .catch((e: any) => alert('Errore'))
      .finally(() => (this.loading = false));
  }

  public newDate() {
    this.loading = true;
    this.apiService
      .updateBusinessReservation({ status: 'declined', subStatus: 'new_date', ...this.newDateForm.getRawValue() }, this.reservation.id)
      .then((res: any) => this.close.emit({ ...this.reservation, ...res }))
      .catch((e: any) => alert('Errore'))
      .finally(() => (this.loading = false));
  }

  public full() {
    this.loading = true;
    this.apiService
      .updateBusinessReservation({ status: 'declined', subStatus: 'full' }, this.reservation.id)
      .then((res: any) => this.close.emit({ ...this.reservation, ...res }))
      .catch((e: any) => alert('Errore'))
      .finally(() => (this.loading = false));
  }

  public remove() {
    this.loading = true;
    this.apiService
      .updateBusinessReservation({ status: 'declined', subStatus: 'business_canceled' }, this.reservation.id)
      .then((res: any) => this.close.emit({ ...this.reservation, ...res }))
      .catch((e: any) => alert('Errore'))
      .finally(() => (this.loading = false));
  }

  public getCurrentReservation() {
    // this.startingCurrentReservation();
    if (this.isDateBeforeToday()) return;
    this.intervalId = setInterval(() => !this.stop && this.startingCurrentReservation(), 10000); // ogni 10 secondi
  }

  public startingCurrentReservation() { // chiama get reservation ogni 10 secondi
    // this.loading = true;
    this.apiService
      .getReservation(this.reservation.id)
      .then((res) => this.processRes(res))
      .catch((e: any) => console.error(e));
      // .finally(() => (this.loading = false));
  }

  private processRes(res: any) {
    if (res.status != 'pending') {
      this.stop = true;
      clearInterval(this.intervalId);
      this.reservation = res;
    }
  }

}
