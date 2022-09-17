import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-inc-intro',
  templateUrl: './inc-intro.component.html',
  styleUrls: ['./inc-intro.component.scss'],
})
export class IncIntroComponent implements OnInit {
  public step = 1;
  public loading = false;
  public businessId!: number;
  public business$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public incForm = this.fb.group({
    id: [null, Validators.required]
  });
  public socialPostForm = this.fb.group({
    url: [null, Validators.required]
  });
  public reviewForm = this.fb.group({
    text: [null, Validators.required]
  });

  constructor(
    private apiService: ApiService,
    private appService: AppService,
    private fb: FormBuilder,
    public router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {}

  public getBusiness() {
    this.loading = true;
    this.apiService
      .getUserBusiness(this.incForm.getRawValue().id)
      .then((business: any) => {
        this.businessId = business.id;
        this.business$.next(business);
        this.step = 2;
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public addFidelityCard() {
    this.loading = true;
    this.apiService.addUserFidelityCard(this.businessId)
      .then(() => this.goHome())
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public sendSocialPostUrl() {
    this.loading = true;
    this.apiService.sendSocialPost(this.socialPostForm.getRawValue(), this.businessId)
      .then(() => this.next())
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public sendReview() {
    this.loading = true;
    this.apiService.addBusinessReview(this.reviewForm.getRawValue(), this.businessId)
      .then(() => this.goHome())
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  next() {
    this.step = this.step + 1;
  }

  goHome() {
    this.location.back();
    // this.router.navigate(['/home'], { replaceUrl: true });
  }
}
