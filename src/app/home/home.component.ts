import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

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
  public discounts$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public fidelityCards$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public businessesSuggested$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public fromQR = 0;

  public lang = 'it';
  public tr!: any;

  public ch = {
    discountSlogan: '完成至少一张忠诚卡以获得奖励!',
    newCard: '+新会员卡',
    cap: '设置您的邮政编码以查找您附近的俱乐部和折扣!'
  };

  public it = {
    discountSlogan: 'Completa almeno una carta cliente per ricevere i tuoi premi!',
    newCard: '+NUOVA CARTA CLIENTE / LEGGI MENÙ',
    cap: 'Imposta il CAP della tua zona per trovare locali e sconti vicino a te!'
  };

  constructor(private router: Router, private apiService: ApiService, public appService: AppService) {
    (window as any).addEventListener('refreshList', (e: any) => { 
      (window as any)['refreshList'] = true; 
      // this.closeOverlay();
      if (!this.entityOpened) {
        this.ngOnInit();
      }
    }, false);
  }

  ngOnInit(): void {
    this.fromQR = 0;
    this.lang = navigator.language || 'it';
    // this.lang = 'zh';
    if (this.lang.includes('zh') || this.lang.includes('ch')) {
      this.tr = this.it;
      this.lang = 'it';
    } else {
      this.tr = this.it;
      this.lang = 'it';
    }
    this.showHack = true;
    this.getDiscounts();
    this.getFidelityCards();
  }

  public go(path: string) {
    this.router.navigateByUrl(path);
  }

  public open(type: 'discount'|'fidelity-card', entity: any, isSuggested = false) {
    console.log('opening', type, entity.business_id);
    this.entityTypeOpened = type;
    if (type == 'fidelity-card') {
      const discs = this.discounts$.getValue();
      const discFound = discs.find(d => d.business_id == entity.business_id);
      entity.user_discount_id = discFound ? discFound.id : null;
      entity.user_discount = discFound;
    }
    this.entityOpened = entity;
    this.isSuggested = isSuggested;
    if (type === 'discount') this.clickCard = true;
  }

  public closeOverlay(event = null, refresh = false) {
    console.log('closing');
    (window as any).addEventListener('refreshList', (e: any) => { (window as any)['refreshList'] = true; }, false);

    const mustRefresh = (refresh || this.clickCard || (window as any)['refreshList']);
    !mustRefresh && this.appService.goToBusinessId$.next(undefined);
    mustRefresh && this.ngOnInit();
    if (event === 'discount') {
      this.entityTypeOpened = 'discount';
      const discountsWithBusinessId = this.discounts$.getValue().filter((d: any) => d.business_id === this.entityOpened.business_id);
      if (discountsWithBusinessId.length) {
        this.entityOpened = discountsWithBusinessId[0];
      } else { this.entityOpened = null; }
    } else {
      this.entityOpened = null;
      this.clickCard = false;
    }
  }

  public getDiscounts() {
    this.loading = true;
    this.apiService.getUserDiscounts()
      .then((discounts: any) => {
        const discountsBusinessIds = discounts.map((d: any) => d.business_id);
        this.discountsBusinessIds = discountsBusinessIds;
        this.discounts$.next(discounts);
      })
      .catch((e: any) => { this.loading = false; console.error(e); });
  }

  public getBusiness(businessId: number) {
    this.loading = true;
    this.apiService
      .getBusinessesByIds([businessId])
      .then((businesses: any) => {
        const business = businesses[0];
        if (!business) {
          alert('Locale inesistente');
          return;
        }
        this.loading = false;
        console.log('getBusiness', businessId, JSON.stringify(business));
        this.open('fidelity-card', business, true);
      })
      .catch((e: any) => {
        alert('Errore');
        this.loading = false;
      });
  }

  public getFidelityCards() {
    this.loading = true;
    this.apiService.getUserFidelityCards()
      .then((fidelityCards: any) => {
        (window as any)['refreshList'] = false;
        fidelityCards = fidelityCards.map((fC: any) => {
          fC['expenses_array'] = new Array(fC.business_expenses_amount - 1);
          if (fC['expenses_array'].length > 10) {
            fC['expenses_array'] = new Array(10);
            fC['expenses_array_too_long'] = true;
          }
          fC['missing_points'] = (fC.business_expenses_amount - (fC.user_expenses_amount - fC.discount_countdown)) - 1;
          return fC;
        });
        fidelityCards = fidelityCards.sort((a: any, b: any) => a['missing_points'] - b['missing_points']);
        this.fidelityCards$.next(fidelityCards);
        const caps = fidelityCards.filter((fC: any) => fC.business_cap).map((fC: any) => fC.business_cap);
        const businessesIds = fidelityCards.map((fC: any) => fC.business_id);

        this.getBusinessSuggestedByCaps(caps, businessesIds);
      })
      .catch((e: any) => { this.loading = false; console.error(e); });
  }

  public getBusinessSuggestedByCaps(caps: string[], businessesIds: number[]) {
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

    console.log(newCaps);
    this.apiService.getBusinessByCaps(newCaps, businessesIds)
      .then((businessSuggested: any) => {
        // businessSuggested = businessSuggested.filter((b: any) => !businessesIds.includes(b.business_id));
        // businessSuggested = businessSuggested.map((b: any) => {
        //   b.hasCard = businessesIds.includes(b.business_id) ? 1 : 0;
        //   return b;
        // });
        // businessSuggested = businessSuggested.sort((a: any, b: any) => { return a.hasCard - b.hasCard});
        this.businessesSuggested$.next(businessSuggested);
        this.appService.goToBusinessId$.subscribe((businessId: number|undefined) => {
          this.fromQR = businessId || 0;
          this.fromQR && this.checkFromQR();
        });
      })
      .catch((e: any) => this.checkFromQR() && console.error(e))
      .finally(() => this.loading = false);
  }

  public checkFromQR() {
    if (this.fromQR) {
      const fCFound = this.fidelityCards$.getValue().find((fC: any) => fC.business_id == this.fromQR);
      console.log('searching card 2...', this.fromQR, JSON.stringify(fCFound));
      if (fCFound) {
        this.open('fidelity-card', fCFound, false);
        return true;
      }
    }

    if (this.fromQR && !this.entityOpened) {
      const fCFound = this.businessesSuggested$.getValue().find((fC: any) => fC.business_id == this.fromQR);
      if (fCFound) {
        this.open('fidelity-card', fCFound, true);
        return true;
      }
      if (!fCFound) {
        this.getBusiness(this.fromQR);
        return true;
      }
    }
    return true;
  }

}
