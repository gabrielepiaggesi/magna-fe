import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-business-discount',
  templateUrl: './business-discount.component.html',
  styleUrls: ['./business-discount.component.scss']
})
export class BusinessDiscountComponent implements OnInit {
  public loading = false;
  public businessId!: number;
  public discountId!: number;
  public origin!: string;
  public discount$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public discountForm = this.fb.group({
    type: [null, Validators.required],
    amount: [null, Validators.required],
    minimum_expense: [null, Validators.required]
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
          this.discountId = +params['discountId'];
        }
      );
    }

  ngOnInit(): void { 
    this.businessId && this.discountId && this.getDiscount();
  }

  public getDiscount() {
    this.loading = true;
    this.apiService
      .getBusinessDiscount(this.discountId)
      .then((discount: any) => {
        this.discount$.next(discount);
        this.discountForm.setControl('type', new FormControl(discount.type, Validators.required));
        this.discountForm.setControl('amount', new FormControl(discount.amount, Validators.required));
        this.discountForm.setControl('minimum_expense', new FormControl(discount.minimum_expense, Validators.required));
        this.origin = discount.origin;
        if (discount.origin === 'IG_POST') {
          this.discountForm.addControl('monthly_limit', new FormControl(discount.monthly_limit || 100, Validators.required));
        }
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public updateDiscount() {
    this.loading = true;
    const body = {
      ...this.discount$.getValue(),
      ...this.discountForm.getRawValue(),
    };
    this.apiService.updateBusinessDiscount(body, this.businessId)
      .then(() => {
        this.location.back()
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }
}
