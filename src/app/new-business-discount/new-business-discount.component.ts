import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-new-business-discount',
  templateUrl: './new-business-discount.component.html',
  styleUrls: ['./new-business-discount.component.scss']
})
export class NewBusinessDiscountComponent implements OnInit {
  public loading = false;
  public businessId!: number;
  public origin!: string;
  public discountType: string|null = null;
  public newDiscountForm = this.fb.group({
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
          this.origin = params['origin'];
        }
      );
    }

  ngOnInit(): void {
  }

  public onTypeChange(event: any) {
    if (event.target.value === 'discount') {
      this.discountType = 'discount';
      this.newDiscountForm.setControl('type', new FormControl(null, Validators.required));
      this.newDiscountForm.setControl('amount', new FormControl(null, Validators.required));
      this.newDiscountForm.setControl('minimum_expense', new FormControl(null, Validators.required));
      this.newDiscountForm.setControl('slogan', new FormControl(null));
    }
    if (event.target.value === 'free') {
      this.discountType = 'free';
      this.newDiscountForm.setControl('type', new FormControl('EUR', Validators.required));
      this.newDiscountForm.setControl('amount', new FormControl(0, Validators.required));
      this.newDiscountForm.setControl('minimum_expense', new FormControl(0, Validators.required));
      this.newDiscountForm.setControl('slogan', new FormControl(null, Validators.required));
    }
  }

  public sendDiscount() {
    this.loading = true;
    const formValue = this.newDiscountForm.getRawValue();
    const body = {
      ...formValue,
      origin: this.origin,
      amount: formValue.amount,
      minimum_expense: formValue.minimum_expense,
      slogan: formValue.slogan ? formValue.slogan?.substring(0,20) : null
    }
    this.apiService.createNewBusinessDiscount(body, this.businessId)
      .then(() => {
        this.location.back()
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }
}
