import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-business-discounts',
  templateUrl: './business-discounts.component.html',
  styleUrls: ['./business-discounts.component.scss']
})
export class BusinessDiscountsComponent implements OnInit {
  public loading = false;
  public showCardDiscounts = false;
  public businessId!: number;
  public socialPostDiscount$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public fidelityCardDiscount$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public referralDiscount$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public firstActionDiscount$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public businessCardDiscounts$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(
    private router: Router,
    private activateRouter: ActivatedRoute,
    private apiService: ApiService,
    public appService: AppService
  ) {
    this.activateRouter.params.subscribe(
      (params) => (this.businessId = +params['businessId'])
    );
  }

  ngOnInit(): void {
    this.businessId && this.getDiscounts();
  }

  go(path: string) {
    this.router.navigateByUrl(path);
  }

  public getDiscounts() {
    this.loading = true;
    this.apiService
      .getBusinessDiscounts(this.businessId)
      .then((discounts: any) => {
        const socialPostDiscounts = discounts.filter((d: any) => d.origin === 'IG_POST');
        const fidelityCardDiscounts = discounts.filter((d: any) => d.origin === 'FIDELITY_CARD');
        this.businessCardDiscounts$.next(fidelityCardDiscounts.sort((fC1: any, fc2: any) => fC1.id - fc2.id));
        const referralDiscounts = discounts.filter((d: any) => d.origin === 'REFERRAL');
        const firstActionDiscounts = discounts.filter((d: any) => d.origin === 'FIRST_ACTION');
        socialPostDiscounts.length && this.socialPostDiscount$.next(socialPostDiscounts[0]);
        fidelityCardDiscounts.length && this.fidelityCardDiscount$.next(fidelityCardDiscounts[0]);
        referralDiscounts.length && this.referralDiscount$.next(referralDiscounts[0]);
        firstActionDiscounts.length && this.firstActionDiscount$.next(firstActionDiscounts[0]);
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }
}
