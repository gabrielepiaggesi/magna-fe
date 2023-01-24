import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-business-cards',
  templateUrl: './business-cards.component.html',
  styleUrls: ['./business-cards.component.scss']
})
export class BusinessCardsComponent implements OnInit {
  public loading = false;
  public businessId!: number;
  public isLastCard = false;
  public newCardLevel = false;
  public fidelityCard$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public fidelityCards$: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  public businessCardDiscounts$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public cardForm = this.fb.group({
    type: ['points'],
    expenses_amount: [null, Validators.required],
    discount_id: [null],
    lifes: [0, Validators.required]
  });
  public newCardLevelForm = this.fb.group({
    type: ['points'],
    expenses_amount: [null, Validators.required],
    discount_id: [null],
    lifes: [0]
  });

  constructor(
    private apiService: ApiService, 
    private appService: AppService, 
    private activateRouter: ActivatedRoute, 
    private fb: FormBuilder, 
    public router: Router,
    private location: Location) {
      this.activateRouter.params.subscribe(
        (params) => {
          this.businessId = +params['businessId'];
        }
      );
    }

  ngOnInit(): void { 
    this.businessId && this.getDiscounts();
    this.businessId && this.getFidelityCards();
  }

  public toggleCardLevel() {
    this.newCardLevelForm.reset();
    this.newCardLevel = true;
  }

  public editCard(card: any) {
    const cardsList = this.fidelityCards$.getValue();
    const discsList = this.businessCardDiscounts$.getValue();
    this.isLastCard = cardsList[cardsList.length - 1].id == card.id;
    this.fidelityCard$.next(card);
    if (!!card) {
      this.cardForm.setControl('expenses_amount', new FormControl(card.expenses_amount - 1, Validators.required));
      this.cardForm.setControl('type', new FormControl(card.type));
      this.cardForm.setControl('lifes', new FormControl(card.lifes));
      this.cardForm.setControl('discount_id', new FormControl(card.discount_id || discsList[0]?.id));
    }
  }

  public closeCard() {
    this.newCardLevel = false;
    this.isLastCard = false;
    this.fidelityCard$.next(undefined);
    this.cardForm.reset();
    this.newCardLevelForm.reset();
  }

  public getFidelityCards() {
    this.loading = true;
    this.apiService
      .getBusinessFidelityCards(this.businessId)
      .then((fCards: any) => this.fidelityCards$.next(fCards.sort((fC1: any, fc2: any) => fC1.id - fc2.id)))
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public getDiscounts() {
    this.loading = true;
    this.apiService
      .getBusinessDiscounts(this.businessId)
      .then((discounts: any) => {
        const fidelityCardDiscounts = (discounts || []).filter((d: any) => d.origin === 'FIDELITY_CARD');
        this.businessCardDiscounts$.next(fidelityCardDiscounts.sort((fC1: any, fc2: any) => fC1.id - fc2.id));
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public updateFidelityCard() {
    this.loading = true;
    const body = { ...this.cardForm.getRawValue(), expenses_amount: this.cardForm.getRawValue().expenses_amount + 1 };
    this.apiService.updateBusinessFidelityCard(body, this.fidelityCard$.getValue().id)
      .then(() => this.location.back())
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public createFidelityCard() {
    this.loading = true;
    const body = { ...this.newCardLevelForm.getRawValue(), expenses_amount: this.newCardLevelForm.getRawValue().expenses_amount + 1 };
    this.apiService.createBusinessFidelityCard(body, this.businessId)
      .then(() => this.location.back())
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public getDiscountInfo(card: any) {
    const discsList = this.businessCardDiscounts$.getValue();
    const cardDiscount = card.discount_id ? discsList.find(d => d.id == card.discount_id) : discsList[0];
    if (cardDiscount) {
      return cardDiscount.slogan && !cardDiscount.amount ? 
        cardDiscount.slogan :
        `Sconto ${cardDiscount?.type == 'PERC' ? 'del' : 'di' } ${cardDiscount?.amount} ${cardDiscount?.type == 'PERC' ? '%' : '€'}`;
    }
    return 'Non hai premi impostati, vai alle impostazioni dei premi.'
  }
}
