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
  public fidelityCard$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public cardForm = this.fb.group({
    expenses_amount: [null, Validators.required]
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
    this.businessId && this.getFidelityCard();
  }

  public getFidelityCard() {
    this.loading = true;
    this.apiService
      .getBusinessFidelityCard(this.businessId)
      .then((fCard: any) => {
        this.fidelityCard$.next(fCard);
        !!fCard && this.cardForm
          .setControl('expenses_amount', new FormControl(fCard.expenses_amount, Validators.required));
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public updateFidelityCard() {
    this.loading = true;
    const body = {
      ...this.cardForm.getRawValue(),
    };
    this.apiService.updateBusinessFidelityCard(body, this.fidelityCard$.getValue().id)
      .then(() => {
        this.location.back()
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public createFidelityCard() {
    this.loading = true;
    const body = {
      ...this.cardForm.getRawValue(),
    };
    this.apiService.createBusinessFidelityCard(body, this.businessId)
      .then(() => {
        this.location.back()
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }
}
