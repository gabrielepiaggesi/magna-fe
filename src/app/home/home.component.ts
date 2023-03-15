import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { tryRequestLocation } from '../fidelity-qr/helper';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public loading = false;
  public clickCard = false;
  public entityTypeOpened!: 'discount'|'fidelity-card';
  public entityOpened!: any;
  public discountsBusinessIds: number[] = [];
  public showHack = true;
  public isSuggested = false;
  public shouldRefresh = false;
  public discounts$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public fidelityCards$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public businessesSuggested$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public fromQR = 0;
  public lastQRScanId!: number;
  public opened = false;
  public cardToAsk: any;

  public lang = 'it';
  public tr!: any;

  public ch = {
    discountSlogan: '完成至少一张忠诚卡以获得奖励!',
    newCard: '+新会员卡',
    cap: '设置您的邮政编码以查找您附近的俱乐部和折扣!'
  };

  public it = {
    discountSlogan: 'Completa almeno una carta cliente per ricevere i tuoi premi!',
    newCard: '+NUOVA CARTA CLIENTE',
    cap: 'Imposta il CAP della tua zona per trovare locali e sconti vicino a te!'
  };

  constructor(private router: Router, private apiService: ApiService, public appService: AppService) {
    // (window as any).addEventListener('refreshList', (e: any) => { 
    //   (window as any)['refreshList'] = true;
    //   if (!this.entityOpened) {
    //     console.log('refresh ngInit');
    //     this.ngOnInit();
    //   }
    // }, false);
    this.appService.goToBusinessIdFromExternalQR$.subscribe((businessId: number|undefined) => {
      if (businessId && (!this.entityOpened || this.entityOpened.business_id != businessId) && !!this.opened) this.findBusinessToOpenAutomatically(businessId);
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit');
    this.fromQR = 0;
    this.shouldRefresh = false;
    (window as any)['refreshList'] = false;
    this.lang = navigator.language || 'it';
    this.showHack = true;
    this.getDiscounts();
    this.getFidelityCards();
    // this.opened = true;
    // this.appService.goToBusinessId = 0;
  }

  public go(path: string) {
    this.router.navigateByUrl(path);
  }

  public autoTimber() {
    const cardFound = this.entityOpened;
    this.updateQRScanAndAutoTimber(cardFound, true);
  }

  public open(type: 'discount'|'fidelity-card', entity: any, isSuggested = false) {
    console.log('opening', type, entity.business_id);
    if (type == 'discount' && !!entity.validFromTomorrow) {
      alert('Questo sconto lo potrai usare da domani in poi.');
      return;
    }
    if (type == 'fidelity-card') {
      const discs = this.discounts$.getValue();
      const discFound = discs.find(d => d.business_id == entity.business_id);
      entity.user_discount_id = discFound ? discFound.id : null;
      entity.user_discount = discFound;
    } else {
      this.clickCard = true;
      const cards = this.fidelityCards$.getValue();
      const cardFound = cards.find(d => d.business_id == entity.business_id);
      if (cardFound) {
        cardFound.user_discount_id = entity ? entity.id : null;
        cardFound.user_discount = entity;
        type = 'fidelity-card';
        entity = cardFound;
      }
    }
    this.entityTypeOpened = type;
    this.entityOpened = entity;
    this.isSuggested = isSuggested;
  }

  public closeOverlay(event = null, refresh = false) {
    console.log('closeOverlay', event, refresh);
    // (window as any).addEventListener('refreshList', (e: any) => { (window as any)['refreshList'] = true; }, false);
    // const mustRefresh = (refresh || this.clickCard || (window as any)['refreshList']);
    // console.log('closing', mustRefresh);
    // if (!mustRefresh) {
    //   this.appService.goToBusinessId$.next(undefined);
    // }
    (refresh || this.shouldRefresh || (window as any)['refreshList']) && this.ngOnInit();
    this.entityOpened = null;
    !refresh && this.appService.resetBusinessToOpen();
    this.appService.lastQRScanId = 0;
    // if (event === 'discount') {
    //   this.entityTypeOpened = 'discount';
    //   const discountsWithBusinessId = this.discounts$.getValue().filter((d: any) => d.business_id === this.entityOpened.business_id);
    //   if (discountsWithBusinessId.length) {
    //     this.entityOpened = discountsWithBusinessId[0];
    //   } else { this.entityOpened = null; }
    // } else {
    //   this.entityOpened = null;
    //   this.clickCard = false;
    // }
  }

  public getDiscounts() {
    console.log('getDiscounts');
    const now = new Date(Date.now());
    this.loading = true;
    this.apiService.getUserDiscounts()
      .then((discounts: any) => {
        discounts = discounts.map((disc: any) => {
          const userCre = new Date(disc.created_at.toString().replace(' ', 'T'));
          const hoursDiff = this.getHoursDiff(now, userCre);
          disc.validFromTomorrow = hoursDiff <= 12;
          console.log('disc.validFromTomorrow ', disc.validFromTomorrow, userCre, disc.created_at);
          return disc;
        });
        const discountsBusinessIds = discounts.map((d: any) => d.business_id);
        this.discountsBusinessIds = discountsBusinessIds;
        console.log('discountsBusinessIds', discountsBusinessIds);
        this.discounts$.next(discounts);
      })
      .catch((e: any) => { this.loading = false; console.error(e); });
  }

  public getHoursDiff(dat1: Date, dat2: Date) {
    if (!dat1 || !dat2) return 1000000;
    const date1 = dat1.getTime();
    const date2 = dat2.getTime();
    const hours = Math.abs(date1 - date2) / 36e5; // ( / 60*60*1000)
    return hours;
  }

  public getBusiness(businessId: number): any {
    this.loading = true;
    return this.apiService
      .getBusinessesByIds([businessId])
      .then((businesses: any) => {
        const business = businesses[0];
        if (!business) {
          alert('Locale inesistente');
          return null;
        }
        this.loading = false;
        console.log('getBusiness', businessId, JSON.stringify(business));
        this.open('fidelity-card', business, true);
        return business;
      })
      .catch((e: any) => {
        alert('Errore');
        this.loading = false;
        return null;
      });
  }

  public getFidelityCards() {
    console.log('getFidelityCards');
    const now = new Date(Date.now());
    this.loading = true;
    this.apiService.getUserFidelityCards()
      .then((fidelityCards: any) => {
        // (window as any)['refreshList'] = false;
        fidelityCards = fidelityCards.map((fC: any) => {
          fC['expenses_array'] = new Array(fC.business_expenses_amount - 1);
          if (fC['expenses_array'].length > 10) {
            fC['expenses_array'] = new Array(10);
            fC['expenses_array_too_long'] = true;
          }
          fC['missing_points'] = (fC.business_expenses_amount - (fC.user_expenses_amount - fC.discount_countdown)) - 1;
          const cardLastScanIsValid = !fC.last_scan || this.getHoursDiff(now, new Date(fC.last_scan.toString().replace(' ', 'T'))) > 5;
          fC['recentlyScanned'] = fC.last_scan && this.getHoursDiff(now, new Date(fC.last_scan.toString().replace(' ', 'T'))) <= 5;
          fC['scannedHoursAgo'] = fC.last_scan ? this.getHoursDiff(now, new Date(fC.last_scan.toString().replace(' ', 'T'))) : 1000000;
          return fC;
        });
        fidelityCards = fidelityCards.sort((a: any, b: any) => a['missing_points'] - b['missing_points']);
        this.fidelityCards$.next(fidelityCards);
        const caps = fidelityCards.filter((fC: any) => fC.business_cap).map((fC: any) => fC.business_cap);
        const businessesIds = fidelityCards.map((fC: any) => fC.business_id);

        this.getBusinessSuggestedByCaps(caps, businessesIds);
      })
      .catch((e: any) => { this.loading = false; this.opened = true; console.error(e); });
  }

  public getBusinessSuggestedByCaps(caps: string[], businessesIds: number[]) {
    console.log('getBusinessSuggestedByCaps');
    const userInfo = this.appService.userInfo;
    if (userInfo && userInfo.cap) {
      let capAsNum = userInfo.cap.startsWith('000') ? userInfo.cap.replace('000', '') : userInfo.cap.startsWith('00') ? userInfo.cap.replace('00', '') : null;
      if (capAsNum) {
        console.log(userInfo.cap, capAsNum);
        capAsNum = +capAsNum;
        let capPlusOne: any = capAsNum + 1;
        let capMinOne: any = capAsNum - 1;
        if (capPlusOne > 99) capPlusOne = "00"+capPlusOne;
        if (capPlusOne <= 99) capPlusOne = "000"+capPlusOne;
        if (capMinOne > 99) capMinOne = "00"+capMinOne;
        if (capMinOne <= 99) capMinOne = "000"+capMinOne;
  
        if (!caps.includes(userInfo.cap)) caps.push(userInfo.cap);
        if (!caps.includes(capPlusOne)) caps.push(capPlusOne);
        if (!caps.includes(capMinOne)) caps.push(capMinOne);
      }
    }

    let newCaps: string[] = [];
    caps.forEach((cap: string) => {
      let capAsNum: any = cap.startsWith('000') ? cap.replace('000', '') : cap.startsWith('00') ? cap.replace('00', '') : null;
      if (capAsNum) {
        capAsNum = +capAsNum;
        let capPlusOne: any = capAsNum + 1;
        let capMinOne: any = capAsNum - 1;
        if (capPlusOne > 99) capPlusOne = "00"+capPlusOne;
        if (capPlusOne <= 99) capPlusOne = "000"+capPlusOne;
        if (capMinOne > 99) capMinOne = "00"+capMinOne;
        if (capMinOne <= 99) capMinOne = "000"+capMinOne;
  
        if (!newCaps.includes(cap)) newCaps.push(cap);
        if (!newCaps.includes(capPlusOne)) newCaps.push(capPlusOne);
        if (!newCaps.includes(capMinOne)) newCaps.push(capMinOne);
      }
    });

    this.apiService.getBusinessByCaps(newCaps, businessesIds)
      .then((businessSuggested: any) => {
        this.businessesSuggested$.next(businessSuggested);
        // this.appService.goToBusinessId$.subscribe((businessId: number|undefined) => {
        //   this.fromQR = businessId || 0;
        //   window.location.href.includes('home') && this.fromQR && this.checkFromQR();
        // });
        const haveToOpenABusiness = window.location.href.includes('home') && this.appService.goToBusinessId;
        console.log('haveToOpenABusiness', haveToOpenABusiness, this.appService.goToBusinessId);
        haveToOpenABusiness && this.findBusinessToOpenAutomatically(this.appService.goToBusinessId);

        this.opened = true;
      })
      .catch((e: any) => console.error(e))
      .finally(() => {this.loading = false; this.opened = true;});
  }

  private findBusinessToOpenAutomatically(businessId: number) {
    console.log('findBusinessToOpenAutomatically', businessId);
    if (this.entityOpened && this.entityOpened.business_id == businessId) return;
    // this.appService.goToBusinessId = 0;
    const cardFound = this.fidelityCards$.getValue().find((fC: any) => fC.business_id == businessId);
    if (cardFound) {
      this.openCard(cardFound.business_id, true);
      return;
    }

    const cardSuggestedFound = this.businessesSuggested$.getValue().find((fC: any) => fC.business_id == businessId);
    if (cardSuggestedFound) {
      this.openBusiness(cardSuggestedFound);
      return;
    }

    const newBusiness = this.getBusiness(businessId);
    if (newBusiness) {
      this.openBusiness(newBusiness);
      return;
    }
  }

  public openCard(businessId: number, fromAutoOpening = false) {
    let canAskIfIsThere = false;
    if (!fromAutoOpening) {
      const now = new Date(Date.now());
      const userCreationDate = this.appService.userInfo?.created_at ? new Date(this.appService.userInfo?.created_at.toString().replace(' ', 'T')) : now;
      canAskIfIsThere = !fromAutoOpening && this.getHoursDiff(now, userCreationDate) >= 12;
    }

    console.log('openCard', businessId);
    const discountFound = this.discounts$.getValue().find(d => d.business_id == businessId);
    const cardFound = this.fidelityCards$.getValue().find((fC: any) => fC.business_id == businessId);
    if (discountFound) {
      cardFound.user_discount_id = discountFound.id;
      cardFound.user_discount = discountFound;
    }
    this.openBusiness(cardFound);
    (fromAutoOpening) && this.updateQRScanAndAutoTimber(cardFound);
    (!fromAutoOpening) && cardFound.business_can_ask && this.checkIfOpenAsk(cardFound);
  }

  private checkIfOpenAsk(cardFound: any) {
    const now = new Date(Date.now());
    const userCreationDate = this.appService.userInfo?.created_at ? new Date(this.appService.userInfo?.created_at.toString().replace(' ', 'T')) : now;
    const cardLastScanIsValid = !cardFound.last_scan || this.getHoursDiff(now, new Date(cardFound.last_scan.toString().replace(' ', 'T'))) > 5;
    const userIsNotNew = this.getHoursDiff(now, userCreationDate) >= 12;
    const cardAlreadyAsked = this.appService.cardsId.find((c: any) => c.cardId == cardFound.id);
    const cardHasNotBeenAsked = !cardAlreadyAsked || (cardAlreadyAsked.date && this.getHoursDiff(now, cardAlreadyAsked.date) >= (cardFound.business_hour_diff || 1));
    const cardHasDiscount = !!cardFound.discount || !!cardFound.user_discount;

    const range1 = cardFound.business_range1 || '12_14';
    const range2 = cardFound.business_range2 || '19_23';
    const range1From = +range1.split('_')[0];
    const range1To = +range1.split('_')[1];
    const range2From = +range2.split('_')[0];
    const range2To = +range2.split('_')[1];

    const currentHour = now.getHours();
    const currentHourIsValid = (currentHour >= range1From && currentHour <= range1To) || (currentHour >= range2From && currentHour <= range2To);
    const canAskIfIsThere = !cardHasDiscount && cardLastScanIsValid && userIsNotNew && cardHasNotBeenAsked && currentHourIsValid;
    
    if (canAskIfIsThere) {
      this.cardToAsk = cardFound;
      if (cardAlreadyAsked) {
        const idx = this.appService.cardsId.findIndex((c: any) => c.cardId == cardFound.id);
        this.appService.cardsId.splice(idx, 1);
      }
      this.appService.cardsId = (this.appService.cardsId || []).concat([{ cardId: cardFound.id, date: now }]);
    }
  }

  public openQRForCard() {
    const now = new Date(Date.now());
    this.appService.cardsId = [];
    // alert("Inquadra il QR sul tavolo, e poi useremo la tua posizione per timbrare la tua carta in sicurezza :)");
    const cards = this.fidelityCards$.getValue();
    this.appService.cardsId = cards.map(card => ({ cardId: card.id, date: now }));
    this.localyPresentOrNot(this.cardToAsk.id, 1);
    this.router.navigateByUrl('incIntro/2');
  }

  public notPresent() {
    this.localyPresentOrNot(this.cardToAsk.id, 0);
    this.cardToAsk = null;
  }

  public openDiscount(discount: any) {
    if (!!discount.validFromTomorrow) {
      alert('Questo sconto lo potrai usare da domani in poi.');
      return;
    }
    this.openCard(discount.business_id);
  }

  public openBusiness(businessObj: any) {
    console.log('openBusiness', businessObj);
    this.entityOpened = businessObj;
    this.isSuggested = !businessObj.type || businessObj.type != 'points';
    this.entityTypeOpened = 'fidelity-card';
  }

  public updateQRScanAndAutoTimber(cardOpened: any, tryAutoTimber = false) {
    const now = new Date(Date.now());
    // const userCreationDate = this.appService.userInfo?.created_at ? new Date(Date.parse(this.appService.userInfo?.created_at)) : now;
    const userCreationDate = this.appService.userInfo?.created_at ? new Date(this.appService.userInfo?.created_at.toString().replace(' ', 'T')) : now;
    const newUserFirstCard = (this.fidelityCards$.getValue().length == 1 || this.fidelityCards$.getValue().length == 0) && this.getHoursDiff(now, userCreationDate) < 12;
    const cardLastScanIsValid = !cardOpened.last_scan || this.getHoursDiff(now, new Date(cardOpened.last_scan.toString().replace(' ', 'T'))) > 5;
    const businessHasCoor = cardOpened.business_coo_lat && cardOpened.business_coo_long;
    const cardHasDiscount = !!cardOpened.discount || !!cardOpened.user_discount;

    console.log('this.appService.userInfo?.created_at', this.appService.userInfo?.created_at);
    console.log('userCreationDate', userCreationDate);
    console.log('getHoursDiff', this.getHoursDiff(now, userCreationDate));
    console.log('newUserFirstCard', newUserFirstCard);
    console.log('this.appService.shouldAutoTimber', this.appService.shouldAutoTimber);
    console.log('cardLastScanIsValid', cardLastScanIsValid);

    const shouldProceedWithAutoTimber = (this.appService.shouldAutoTimber || newUserFirstCard);
    const canProceedWithAutoTimber = shouldProceedWithAutoTimber && !cardHasDiscount && businessHasCoor && (cardLastScanIsValid || tryAutoTimber); // && cardLastScanIsValid ?
    const justScannedNow = this.appService.lastQRScanId == cardOpened.id && !tryAutoTimber;
    
    console.log('justScannedNow', justScannedNow);
    console.log('canProceedWithAutoTimber', canProceedWithAutoTimber);
    console.log('this.entityOpened', !!this.entityOpened);
    if (!justScannedNow && canProceedWithAutoTimber && !!this.entityOpened) {
      if (cardOpened.business_show_alert_only_first) {
        if (newUserFirstCard && !tryAutoTimber && cardOpened.business_show_alert_for_geo) alert(cardOpened.business_geo_alert_msg || 'Useremo la tua posizione per capire se sei al locale, e darti il punto.\n Poi la spegniamo!');
      } if (cardOpened.business_show_alert_not_first) {
        if (!newUserFirstCard && !tryAutoTimber && cardOpened.business_show_alert_for_geo) alert(cardOpened.business_geo_alert_msg || 'Useremo la tua posizione per capire se sei al locale, e darti il punto.\n Poi la spegniamo!');
      } else {
        if (!tryAutoTimber && cardOpened.business_show_alert_for_geo) alert(cardOpened.business_geo_alert_msg || 'Useremo la tua posizione per capire se sei al locale, e darti il punto.\n Poi la spegniamo!');
      }
      this.requestUserPositionForAutoTimberAndUpdateQRScan(cardOpened, newUserFirstCard, tryAutoTimber);
    }
    if (!justScannedNow && cardLastScanIsValid && !tryAutoTimber && !canProceedWithAutoTimber) this.updateQRScan(cardOpened.id, 'cannot_proceed');
    !!tryAutoTimber && !canProceedWithAutoTimber && alert('Hai gia timbrato la carta poco tempo fa. Se vuoi altri punti mostra il tuo QR in cassa.');
  }

  private checkIfLocationIsOn() {
    (window as any).cordova.plugins.diagnostic.isLocationEnabled((enabled: any) => {
          console.log("Location is " + (enabled ? "enabled" : "disabled"));
            if (!enabled) {
              (window as any).cordova.plugins.navigator.notification.confirm(
                "Possiamo usare la tua posizione per timbrare la carta? \nPoi la spegniamo :)", 
                (result: any) => {
                    if(result == 1){ // Yes
                      (window as any).cordova.plugins.diagnostic.switchToLocationSettings();
                    }
                }, 
                "Open Location Settings?",
                ['No','Ok']
              );
            }
        }, (error: any) => {
            console.error("The following error occurred: "+error);
        }
    );
  }

  private requestUserPositionForAutoTimberAndUpdateQRScan(cardOpened: any, showAlert = false, tryAutoTimber = false) {
    this.appService.lastQRScanId = cardOpened.id;
    // const platform = (window as any).cordova.platformId;
    // console.log('requestUserPositionForAutoTimberAndUpdateQRScan', cardOpened, showAlert, platform);
    // const geoOptions = platform == 'ios' ? { maximumAge: 5000, enableHighAccuracy: true } : { maximumAge: 5000, timeout: 5000, enableHighAccuracy: true };
    try {
      if (cardOpened.business_force_timber_no_gps) {
        this.shouldRefresh = true;
        this.updateQRScanAndTimberCard(cardOpened.id, true);
      } else {
        // navigator.geolocation.getCurrentPosition(
        //   (position) => {
        //     position?.coords && console.log(position?.coords.toString());
        //     const lat1 = cardOpened.business_coo_lat;
        //     const long1 = cardOpened.business_coo_long;
        //     const diffInKm = this.getDistanceFromLatLonInKm(lat1, long1, position.coords.latitude, position.coords.longitude);
        //     const diffInMeters = diffInKm * 1000;
        //     console.log('origjnal min_dist', cardOpened.business_min_dist);
        //     console.log('diff km', diffInKm);
        //     console.log('diff m', diffInMeters);
        //     const minDist = cardOpened.business_min_dist ? (+cardOpened.business_min_dist < 1 ? +cardOpened.business_min_dist * 1000 : +cardOpened.business_min_dist) : 100;
        //     console.log('new min_dist', minDist);
        //     if (diffInMeters <= minDist || cardOpened.business_force_timber) {
        //       this.shouldRefresh = true;
        //       this.appService.lastQRScanId = cardOpened.id;
        //       this.updateQRScanAndTimberCard(cardOpened.id, (showAlert || true));
        //     } else {
        //       this.updateQRScan(cardOpened.id, 'far_away');
        //       alert("La tua posizione ci risulta un po lontana dal locale, non possiamo timbrare in automatico la tua carta cliente, se sei li mostra il qr della tua carta in cassa per pagare,\n o riprova cliccando su '" + (cardOpened.business_card_geo_msg || 'Clicca qui per avere il punto') + "'");
        //       this.appService.lastQRScanId = 0;
        //     }
        //   }
        //   , 
        //   (error) => {
        //     console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
        //     this.appService.lastQRScanId = 0;
        //     this.updateQRScan(cardOpened.id, 'geo_error_'+error.code);
        //     if (error.code == 3) {
        //       alert("Attiva la geolocalizzazione/posizione del telefono. Senza non puoi timbrare da solo la carta. \n Poi riprova cliccano su '" + (cardOpened.business_card_geo_msg || 'Clicca qui per avere il punto') + "'");
        //     } else {
        //       alert("Attiva la geolocalizzazione del telefono o dai il permesso a questa app di usare la tua posizione, dalle impostazioni del telefono.\n Poi riprova cliccano su '" + (cardOpened.business_card_geo_msg || 'Clicca qui per avere il punto') + "'");
        //     }
        //   },
        //   geoOptions
        // );

        this.appService.getUserPosition(cardOpened.business_id, tryAutoTimber)
        .then((userPositionRes) => {
          console.log('userPositionRes', JSON.stringify(userPositionRes));
          if (userPositionRes.status == 'success' && !userPositionRes.ignore) {
            const businessPosition = {
              latitude: cardOpened.business_coo_lat,
              longitude: cardOpened.business_coo_long,
            };
            this.handleUserPosition(cardOpened, userPositionRes, businessPosition, showAlert);
          } else if (userPositionRes.status == 'error' && !userPositionRes.ignore) {
            this.handleUserPositionError(cardOpened, userPositionRes);
          }
        })
        .catch((userPositionRes) => {
          console.log('userPositionRes', JSON.stringify(userPositionRes));
          if (userPositionRes.status == 'error' && !userPositionRes.ignore) {
            this.handleUserPositionError(cardOpened, userPositionRes);
          }
        });
      }
    } catch(e) {
      this.appService.lastQRScanId = 0;
      this.updateQRScan(cardOpened.id, 'geo_general_error');
      console.error('Errore', e);
      !cardOpened.business_force_timber_no_gps && alert('Ops non abbiamo la tua posizione. Mostra il QR della tua carta in cassa per prendere i punti!');
    }
  }

  private handleUserPosition(cardOpened: any, userPositionData: any, businessPositionData: any, showAlert = false) {
    const diffInKm = this.getDistanceFromLatLonInKm(
      businessPositionData.latitude, businessPositionData.longitude, 
      userPositionData.latitude, userPositionData.longitude
    );
    const diffInMeters = diffInKm * 1000;
    console.log('origjnal min_dist', cardOpened.business_min_dist);
    console.log('diff km', diffInKm);
    console.log('diff m', diffInMeters);
    const minDist = cardOpened.business_min_dist ? (+cardOpened.business_min_dist < 1 ? +cardOpened.business_min_dist * 1000 : +cardOpened.business_min_dist) : 100;
    console.log('new min_dist', minDist);
    if (diffInMeters <= minDist || cardOpened.business_force_timber) {
      this.shouldRefresh = true;
      this.appService.lastQRScanId = cardOpened.id;
      this.updateQRScanAndTimberCard(cardOpened.id, (showAlert || true));
    } else {
      this.updateQRScan(cardOpened.id, 'far_away');
      alert("La tua posizione ci risulta un po lontana dal locale, non possiamo timbrare in automatico la tua carta cliente, se sei li mostra il qr della tua carta in cassa per pagare,\n o riprova cliccando su '" + (cardOpened.business_card_geo_msg || 'Clicca qui per avere il punto') + "'");
      this.appService.lastQRScanId = 0;
    }
  }

  private handleUserPositionError(cardOpened: any, positionErrorData: any) {
    this.appService.lastQRScanId = 0;
    this.updateQRScan(cardOpened.id, 'geo_error_'+positionErrorData.code);
    if (positionErrorData.code == 3) {
      alert("Attiva la geolocalizzazione/posizione del telefono. Senza non puoi timbrare da solo la carta. \n Poi riprova cliccano su '" + (cardOpened.business_card_geo_msg || 'Clicca qui per avere il punto') + "'");
    } else {
      alert("Attiva la geolocalizzazione del telefono o dai il permesso a questa app di usare la tua posizione, dalle impostazioni del telefono.\n Poi riprova cliccano su '" + (cardOpened.business_card_geo_msg || 'Clicca qui per avere il punto') + "'");
    }
  }

  private updateQRScan(userFidelityCardId: number, errorMsg: string|null = null) {
    try {
      this.appService.lastQRScanId = userFidelityCardId;
      this.apiService.updateLastQRScannedAt(userFidelityCardId, errorMsg)
      .then(() => console.log('qr scan at updated'))
      .catch((e: any) => console.error('error qr scan at not updated', e));
    } catch(e) {
      console.error('error qr scan at not updated', e);
    }
  }

  private localyPresentOrNot(userFidelityCardId: number, isPresent = 0) {
    this.appService.lastQRScanId = userFidelityCardId;
      this.apiService.updateLocalyPresentOrNot(userFidelityCardId, isPresent)
      .then(() => console.log('localyPresentOrNot updated'))
      .catch((e: any) => console.error('localyPresentOrNot not updated', e));
  }

  private updateQRScanAndTimberCard(userFidelityCardId: number, explicit = false) {
    console.log('updateQRScanAndTimberCard', userFidelityCardId, explicit);
    try {
      this.appService.lastQRScanId = userFidelityCardId;
      this.apiService.updateLastQRScannedAtAndTimberCard(userFidelityCardId)
      .then(() => {
        console.log('updateQRScanAndTimberCard success');
        explicit && alert('Carta cliente aggiornata.');
      })
      .catch((e: any) => console.error('error qr scan at not updated', e));
    } catch(e) {
      console.error('error qr scan at not updated', e);
    }
  }

  public getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  public deg2rad(deg: any) {
    return deg * (Math.PI/180)
  }

}
