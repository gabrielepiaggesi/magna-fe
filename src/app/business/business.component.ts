import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss'],
})
export class BusinessComponent implements OnInit {
  public loading = false;
  public businessId!: number;
  public business$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

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
    this.businessId && this.getBusiness();
  }

  go(path: string) {
    this.router.navigateByUrl(path);
  }

  public getBusiness() {
    this.loading = true;
    this.apiService
      .getUserBusiness(this.businessId)
      .then((business: any) => {
        this.business$.next(business);
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }
}
