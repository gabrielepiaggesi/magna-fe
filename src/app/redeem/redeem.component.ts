import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-redeem',
  templateUrl: './redeem.component.html',
  styleUrls: ['./redeem.component.scss']
})
export class RedeemComponent implements OnInit {
  public loading = false;
  public referralForm = this.fb.group({
    uuid: [null, Validators.required]
  });
  public nots$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(
    private apiService: ApiService, 
    public appService: AppService, 
    private fb: FormBuilder, 
    public router: Router,
    private location: Location) { }

  ngOnInit(): void {
    this.getNotifications();
  }

  openHack() {
    window.open('https://comebackwebapp.web.app/referral', '_system')
  }

  public getNotifications() {
    this.loading = true;
    this.apiService.getUserNotifications()
      .then((nots: any) => {
        this.nots$.next(nots);
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public redeem() {
    this.loading = true;
    this.apiService.generateUserDiscountFromReferral(this.referralForm.getRawValue().uuid)
      .then(() => {
        alert('Fatto! Vai alla home ora.');
      })
      .catch((e: any) => alert('Errore'))
      .finally(() => this.loading = false);
  }
}
