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
  @Output() clickCard = new EventEmitter();
  @Input() fidelityCard!: any;
  @Input() discountPresent: boolean = false;
  @Input() isSuggested: boolean = false;
  public referral$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  public intervalEnded = false;
  public loading = false;
  public step = 1;
  public reservationId!: number;
  public intervalId: any;
  public stop = false;
  public fidelityCardEvent = false;
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
  public reviewForm = this.fb.group({
    rating: [null, Validators.required],
    text: [null, Validators.required]
  });

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
      this.fidelityCardEvent = true;
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

  call(number: string) {
    window.open('tel:'+number, '_system');
  }

  web() {
    window.open(this.fidelityCard?.business_website, '_system');
  }

  menu(link: string) {
    if (link.includes('comeback')) link = link + `?token=${this.apiService.TOKEN}`;
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
        alert('Carta aggiunta!');
        this.appService.goToBusinessId$.next(this.fidelityCard.business_id);
        this.close.emit();
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
