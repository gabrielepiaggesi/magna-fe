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
  public discountType: string|null = null;
  public discount$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public discountForm = this.fb.group({
    type: [null, Validators.required],
    amount: [null, Validators.required],
    minimum_expense: [0, Validators.required],
    slogan: [null]
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

  public onTypeChange(event: any) {
    const discount = this.discount$.getValue();

    if (event.target.value === 'discount') {
      this.discountType = 'discount';
      this.discountForm.setControl('type', new FormControl(discount.type, Validators.required));
      this.discountForm.setControl('amount', new FormControl(discount.amount, Validators.required));
      this.discountForm.setControl('minimum_expense', new FormControl(discount.minimum_expense, Validators.required));
      this.discountForm.setControl('slogan', new FormControl(discount.slogan || null));
      this.origin = discount.origin;
      if (discount.origin === 'IG_POST') {
        this.discountForm.addControl('monthly_limit', new FormControl(discount.monthly_limit || 100, Validators.required));
      }
    }
    if (event.target.value === 'free') {
      this.discountType = 'free';
      this.discountForm.setControl('type', new FormControl('EUR', Validators.required));
      this.discountForm.setControl('amount', new FormControl(0, Validators.required));
      this.discountForm.setControl('minimum_expense', new FormControl(0, Validators.required));
      this.discountForm.setControl('slogan', new FormControl(discount.slogan || null, Validators.required));
      this.origin = discount.origin;
      if (discount.origin === 'IG_POST') {
        this.discountForm.addControl('monthly_limit', new FormControl(discount.monthly_limit || 100, Validators.required));
      }
    }
  }

  public getDiscount() {
    this.loading = true;
    this.apiService
      .getBusinessDiscount(this.discountId)
      .then((discount: any) => {
        this.discount$.next(discount);
        if (discount.amount) this.discountType = 'discount';
        if (!discount.amount && !discount.minimum_expense && !!discount.slogan) this.discountType = 'free';
        this.discountForm.setControl('type', new FormControl(discount.type, Validators.required));
        this.discountForm.setControl('amount', new FormControl(discount.amount, Validators.required));
        this.discountForm.setControl('minimum_expense', new FormControl(discount.minimum_expense, Validators.required));
        this.discountType ===  'discount' ? this.discountForm.setControl('slogan', new FormControl(discount.slogan || null)) : this.discountForm.setControl('slogan', new FormControl(discount.slogan || null, Validators.required))
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
    const formValue = this.discountForm.getRawValue();
    const body = {
      ...this.discount$.getValue(),
      type: formValue.type,
      amount: formValue.amount,
      minimum_expense: formValue.minimum_expense,
      slogan: formValue.slogan && !formValue.amount ? formValue.slogan?.substring(0,50) : null
    };
    this.apiService.updateBusinessDiscount(body, this.discountId)
      .then(() => this.location.back())
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }
}
