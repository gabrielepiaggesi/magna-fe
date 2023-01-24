import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-business-notifications',
  templateUrl: './business-notifications.component.html',
  styleUrls: ['./business-notifications.component.scss']
})
export class BusinessNotificationsComponent implements OnInit {
  public loading = false;
  public businessId!: number;
  public nots$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(
    private apiService: ApiService, 
    private activateRouter: ActivatedRoute, 
    public router: Router) {
      this.activateRouter.params.subscribe(
        (params) => {
          this.businessId = +params['businessId'];
        }
      );
    }

  ngOnInit(): void { 
    this.businessId && this.getReviews();
  }

  public getReviews() {
    this.loading = true;
    this.apiService
      .getBusinessNotifications(this.businessId)
      .then((reviews: any) => this.nots$.next(reviews))
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public removeNot(notId: number) {
    this.loading = true;
    this.apiService
      .deleteBusinessNotification(notId)
      .then((reviews: any) => {
        const nots = this.nots$.getValue().filter(n => n.id !== notId);
        this.nots$.next(nots);
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }
}
