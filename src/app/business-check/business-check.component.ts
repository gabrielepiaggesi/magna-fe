import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-business-check',
  templateUrl: './business-check.component.html',
  styleUrls: ['./business-check.component.scss']
})
export class BusinessCheckComponent implements OnInit {
  public loading = false;
  public businessId!: number;
  public checkType!: 'fidelity-card'|'discount';
  public fidelityCard$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public entityForm = this.fb.group({
    id: [null, Validators.required]
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
          this.checkType = params['checkType'];
        }
      );
    }

  ngOnInit(): void {
  }

  public checkFidelityCard() {
    this.loading = true;
    this.apiService.checkUserFidelityCardValidity(this.entityForm.getRawValue().id, this.businessId)
      .then(() => this.location.back())
      .catch((e: any) => {
        console.error(e);
        alert('Carta NON VALIDA!');
      })
      .finally(() => this.loading = false);
  }

  public checkDiscount() {
    this.loading = true;
    this.apiService.checkUserDiscountValidity(this.entityForm.getRawValue().id, this.businessId)
      .then(() => this.location.back())
      .catch((e: any) => {
        console.error(e);
        alert('Premio NON VALIDO!');
      })
      .finally(() => this.loading = false);
  }
}
