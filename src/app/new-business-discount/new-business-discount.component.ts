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
  public newDiscountForm = this.fb.group({
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
          this.origin = params['origin'];
        }
      );
    }

  ngOnInit(): void { 
    if (this.origin === 'IG_POST') {
      this.newDiscountForm.addControl('monthly_limit', new FormControl(null, Validators.required));
    }
  }

  public addNewBusinessi() {
    this.loading = true;
    const body = {
      ...this.newDiscountForm.getRawValue(),
      origin: this.origin
    }
    this.apiService.createNewBusinessDiscount(body, this.businessId)
      .then(() => {
        this.location.back()
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }
}
