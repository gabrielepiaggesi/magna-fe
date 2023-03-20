import { Location } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, OnDestroy, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-fidelity-qr',
  templateUrl: './fidelity-qr.component.html',
  styleUrls: ['./fidelity-qr.component.scss'],
})
export class FidelityQrComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter();
  @Output() autoTimber = new EventEmitter();
  @Output() autoTimberFromTakeCard = new EventEmitter();
  @Output() clickCard = new EventEmitter();
  @Input() fidelityCard!: any;
  @Input() discountPresent: boolean = false;
  @Input() fromQR: number = 0;
  @Input() isSuggested: boolean = false;
  public referral$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public canDiscountEnded = false;
  public intervalEnded = false;
  public loading = false;
  public step = 1;
  public reservationId!: number;
  public intervalId: any;
  public nToday = new Date(Date.now());
  public stop = false;
  public fidelityCardEvent: null|'cassa'|'geo' = null;
  public noPointsAdded = false;
  public today = (new Date(Date.now()).toISOString().substring(0, 10));
  public reservation$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public newRes = this.fb.group({
    name: [null, Validators.required],
    peopleAmount: [null, Validators.required],
    userDate: [(new Date(Date.now()).toISOString().substring(0, 10)), Validators.required],
    userTime: ['20:00', Validators.required],
    phoneNumber: [null, Validators.required],
    note: [null],
    withDiscount: [false],
    discountAmount: [null],
    discountType: [null],
    discountSlogan: [null]
  });
  public discResForm = this.fb.group({
    userDate: [null, Validators.required],
    withDiscount: [false, Validators.required],
    discountAmount: [null],
    discountType: [null],
    discountSlogan: [null]
  });
  public reviewForm = this.fb.group({
    rating: [null, Validators.required],
    text: [null, Validators.required]
  });
  public availableDates: any[] = [];
  public moreDates: any[] = [];
  public showMoreDates = false;
  public fromDiscRes = false;

  public lang = 'it';
  public tr!: any;

  public ch = {
    timbra: '邮票纸',
    newCard: '添加会员卡',
    discount: '显示折扣',
    cassa: "在结账时出示二维码"
  };

  public it = {
    timbra: 'TIMBRA CARTA',
    newCard: 'AGGIUNGI CARTA FEDELTÀ',
    discount: 'MOSTRA SCONTO',
    cassa: "Mostra il QR alla cassa"
  };

  constructor(
    private apiService: ApiService, 
    private fb: FormBuilder,
    public loc: Location,
    private router: Router,
    protected _sanitizer: DomSanitizer,
    public appService: AppService
  ) {
    (window as any).addEventListener('fidelityCardEvent', (e: any) => {
      this.fidelityCardEvent = 'cassa';
      this.noPointsAdded = false;
    }, false);
    (window as any).addEventListener('fidelityCardGeoEvent', (e: any) => {
      this.fidelityCardEvent = 'geo';
      this.noPointsAdded = false;
    }, false);
    (window as any).addEventListener('noPointsAddedEvent', (e: any) => {
      this.fidelityCardEvent = null;
      this.noPointsAdded = true;
    }, false);
  }

  ngOnDestroy(): void {
    this.stop = true;
    clearInterval(this.intervalId);
  }

  ngOnInit(): void {
    this.lang = navigator.language || 'it';
    // this.lang = 'zh';
    if (this.lang.includes('zh') || this.lang.includes('ch')) {
      this.tr = this.ch;
      this.lang = 'ch';
    } else {
      this.tr = this.it;
      this.lang = 'it';
    }

    // this.availableDates = [
    //   {
    //     date: new Date(Date.now()).toISOString().substring(0, 10),
    //     discount: {
    //       amount: 10,
    //       type: 'PERC'
    //     }
    //   },
    //   {
    //     date: (new Date(new Date().getTime() + ((24 * 60 * 60 * 1000) * 1))).toISOString().substring(0, 10),
    //     discount: {
    //       amount: 10,
    //       type: 'PERC'
    //     }
    //   },
    //   {
    //     date: (new Date(new Date().getTime() + ((24 * 60 * 60 * 1000) * 2))).toISOString().substring(0, 10),
    //     discount: null
    //   }
    // ].map(d => ({ ...d, dateParsed: this.getDate(d.date, true) }));
    // this.moreDates = [
    //   {
    //     date: (new Date(new Date().getTime() + ((24 * 60 * 60 * 1000) * 3))).toISOString().substring(0, 10),
    //     discount: {
    //       amount: 10,
    //       type: 'PERC'
    //     }
    //   },
    //   {
    //     date: (new Date(new Date().getTime() + ((24 * 60 * 60 * 1000) * 4))).toISOString().substring(0, 10),
    //     close: true
    //   },
    //   {
    //     date: (new Date(new Date().getTime() + ((24 * 60 * 60 * 1000) * 5))).toISOString().substring(0, 10),
    //     discount: {
    //       amount: 10,
    //       type: 'PERC'
    //     }
    //   },
    //   {
    //     date: (new Date(new Date().getTime() + ((24 * 60 * 60 * 1000) * 6))).toISOString().substring(0, 10),
    //     discount: {
    //       amount: 10,
    //       type: 'PERC'
    //     }
    //   }
    // ].map(d => ({ ...d, dateParsed: this.getDate(d.date, true) }));

    !!this.fidelityCard.business_can_reserv_with_discount && this.getBusinessDaysForReservations();
  }

  public getBusinessDaysForReservations(autoShow = false) {
    this.loading = true;
    this.apiService.getBusinessDayAvailableForReservation(this.fidelityCard.business_id)
      .then((bDays: any) => {
        console.log('bDays', bDays);
        const bDaysValues = Object.values(bDays).map((bDay: any) => {
          return {
            date: bDay.dayFormatted,
            discount: bDay.can_discount ? { amount: bDay.discount_amount, type: bDay.discount_type, slogan: bDay.discount_slogan } : null,
            close: bDay.closed,
            dayIdx: bDay.dayIdx,
            dateParsed: this.getDate(bDay.dayFormatted, true)
          }
        });
        this.availableDates = bDaysValues.slice(0, 3);
        this.moreDates = bDaysValues.slice(3);
        this.canDiscountEnded = [...this.availableDates, ...this.moreDates].every(el => !el.discount);
        console.log(this.availableDates);
        if (autoShow) this.step = 3.0;
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false)
  }

  setUserDate(date: any) {
    if (date.close) {
      alert('Siamo chiusi in questo giorno.');
      return;
    }
    this.discResForm.setValue({ 
      userDate: date.date.substring(0, 10),
      withDiscount: !!date.discount,
      discountAmount: date.discount?.amount,
      discountType: date.discount?.type,
      discountSlogan: date.discount?.slogan,
    });
  }

  goToRes() {
    this.fromDiscRes = true;
    this.newRes.get('userDate')?.setValue(this.discResForm.getRawValue().userDate);
    this.newRes.get('userDate')?.disable();
    this.newRes.get('withDiscount')?.setValue(this.discResForm.getRawValue().withDiscount);
    this.newRes.get('withDiscount')?.disable();
    this.newRes.get('discountAmount')?.setValue(this.discResForm.getRawValue().discountAmount);
    this.newRes.get('discountAmount')?.disable();
    this.newRes.get('discountType')?.setValue(this.discResForm.getRawValue().discountType);
    this.newRes.get('discountType')?.disable();
    this.newRes.get('discountSlogan')?.setValue(this.discResForm.getRawValue().discountSlogan);
    this.newRes.get('discountSlogan')?.disable();
    this.step = 3.1;
  }

  goBackFromRes() {
    this.step = this.fromDiscRes ? 3.0 : 1;
  }

  forceNormalRes() {
    this.fromDiscRes = false;
    this.newRes.reset();
    this.newRes.get('userDate')?.setValue((new Date(Date.now()).toISOString().substring(0, 10)));
    this.newRes.get('userTime')?.setValue('20:00');
    this.step = 3.1;
  }

  goReview() {
    this.router.navigateByUrl('incIntro/'+ this.fidelityCard.business_id);
  }

  goMenu() {
    this.router.navigateByUrl('menu/'+ this.fidelityCard.business_id);
  }

  public isDateBeforeToday(date: string) {
    const yesterday = new Date(date.toString().replace(' ', 'T'));
    const today = new Date(Date.now());
    const isInThePast = yesterday.getTime() < today.getTime();
    return isInThePast;
  }

  public reservMsg() {
    alert("Per prenotare clicca il bottone \n'Prenota ora', in basso a destra.");
  }

  public showQRMsg() {
    if (this.appService.goToBusinessId) {
      alert("Useremo la tua posizione per timbrare la tua carta in sicurezza :)");
      this.autoTimber.emit();
    } else {
      alert("Inquadra il QR sul tavolo, e poi useremo la tua posizione per timbrare la tua carta in sicurezza :)");
      this.router.navigateByUrl('incIntro/2');
    }
  }

  call(number: string) {
    window.open('tel:'+number, '_system');
  }

  web() {
    window.open(this.fidelityCard?.business_website, '_system');
  }

  menu(link: string) {
    if (link.includes('comeback')) link = link + `?token=${this.apiService.TOKEN}`;
    if (link.includes('comebackapp.it')) link = link.replace('comebackapp.it', 'comebackwebapp.web.app');
    window.open(link, '_system');
  }

  open(link: string) {
    window.open(link, '_system');
  }

  map() {
    window.open('https://google.com/search?q=' + encodeURI(this.fidelityCard?.business_address), '_system');
  }

  clickSignCard() {
    this.step = 2;
    this.clickCard.emit();
  }

  clickSconto() {
    this.clickCard.emit();
    this.close.emit('discount');
  }

  public getQrDiscRaw() {
    return `https://comebackwebapp.web.app/?businessId=${this.fidelityCard.business_id}&entityId=${this.fidelityCard.user_discount_id}&entityType=discount`;
  }

  getDate(date: string, forReserv = false) {
    if (!date) return date;
    // new Date(Date.now()).toLocaleString('sv', {timeZone: 'Europe/Rome'})
    const userDate = new Date(Date.parse(date.replace(' ', 'T')));

    const userDateISO = date.substring(0, 10);
    const todayISO = this.nToday.toISOString().substring(0, 10);

    if (userDateISO == todayISO) {
      const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit'};
      return !forReserv ? 'Oggi, ' + userDate.toLocaleString('it-IT', options) : 'oggi';
    }

    if (userDate.getFullYear() == this.nToday.getFullYear() && userDate.getMonth() == this.nToday.getMonth() && userDate.getDate() == (this.nToday.getDate() + 1)) {
        return "domani"; // date2 is one day after date1.
    }

    let options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'};
    if (forReserv) {
      options = { weekday: 'short', day: '2-digit' };
    }
    console.log(typeof date, date, userDate, userDateISO, todayISO);
    
    return userDate.toLocaleString('it-IT', options);
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
        if (res.discount_limit_reached) {
          alert("Ops! Qualcuno ha prenotato prima di te con l'ultimo sconto, riprova senza sconto!");
          this.newRes.get('userDate')?.setValue((new Date(Date.now()).toISOString().substring(0, 10)));
          this.newRes.get('withDiscount')?.setValue(false);
          this.newRes.get('discountAmount')?.setValue(null);
          this.newRes.get('discountType')?.setValue(null);
          this.newRes.get('discountSlogan')?.setValue(null);
          this.discResForm.reset();
          this.getBusinessDaysForReservations(true);
          return;
        }
        alert('Grazie! Controlla la prenotazione dalla pagina prenotazioni.')
        // this.getCurrentReservation(res.id);
        this.router.navigateByUrl('user-reservations', { replaceUrl: true});
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

  public getGoogleMapsIfraeLink(address: string) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(`https://maps.google.com/maps?q=${ encodeURI(address) }&t=&z=14&sensor=false&maptype=roadmap&ie=UTF8&iwloc=&output=embed`);
  }

  public openMaps(address: string) {
    const url = `https://maps.google.com/maps?q=${ encodeURI(address) }&t=&z=14&ie=UTF8&iwloc=`;
    window.open(url, '_system');
  }

  public generate() { // chiama get reservation ogni 10 secondi
    this.loading = true;
    this.apiService
      .generateUserReferral(this.fidelityCard.business_id, this.fidelityCard.user_id)
      .then((res: any) => this.referral$.next(res))
      .catch((e: any) => { 
        if (e && e.not_exists) {
          alert('Il Locale non ha impostato nessun premio se inviti amici qui...');
        }
        console.error(e);
      })
      .finally(() => (this.loading = false));
  }

  public getReferral() { // chiama get reservation ogni 10 secondi
    this.step = 5;
    this.loading = true;
    this.apiService
      .getUserReferral(this.fidelityCard.business_id, this.fidelityCard.user_id)
      .then((res: any) => this.referral$.next(res))
      .catch((e: any) => { 
        if (e && e.not_exists) {
          alert('Il Locale non ha impostato nessun premio se inviti amici qui...');
        }
        console.error(e);
      })
      .finally(() => (this.loading = false));
  }

  public copy() {
    navigator.clipboard.writeText(this.referral$.getValue().uuid);
    this.close.emit();
  }

  public addFidelityCard() {
    this.clickCard.emit();
    this.loading = true;
    this.apiService.addUserFidelityCard(this.fidelityCard.business_id)
      .then(() => {
        // alert('Carta aggiunta!');
        // this.appService.goToBusinessId$.next(this.fidelityCard.business_id);
        this.appService.prepareBusinessToOpen(this.fidelityCard.business_id);
      })
      .catch((e: any) => {
        alert('Errore');
      })
      .finally(() => {
        this.loading = false;
        try {
          let bodyTag: any = { 
            user_event: "add_fidelity_card", 
            business_id: this.fidelityCard.business_id, 
            business_name: this.fidelityCard.business_name, 
            business_key: this.fidelityCard.business_name.replace(' ', '_').toLowerCase()
          };
          bodyTag['business_id_' + (this.fidelityCard.business_id+'')] = this.fidelityCard.business_id;
          (window as any).plugins.OneSignal.sendTags(bodyTag);
        } catch(e) { console.error('ONESIGNAL_ERROR', e); }
        this.close.emit();
      });
  }

  public sendReview() {
    this.loading = true;
    this.apiService.addBusinessReview(this.reviewForm.getRawValue(), this.fidelityCard.business_id)
      .then(() => {
        alert('Fatto!');
        this.step = 1;
      })
      .catch((e: any) => {
        alert('Errore');
        this.step = 1;
      })
      .finally(() => this.loading = false);
  }

  private processRes(res: any) {
    if (res.status != 'pending') {
      this.stop = true;
      clearInterval(this.intervalId);
      this.reservation$.next(res);
    }
  }
}
