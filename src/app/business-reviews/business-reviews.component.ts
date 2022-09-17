import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-business-reviews',
  templateUrl: './business-reviews.component.html',
  styleUrls: ['./business-reviews.component.scss']
})
export class BusinessReviewsComponent implements OnInit {
  public loading = false;
  public businessId!: number;
  public reviews$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

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
      .getBusinessReviews(this.businessId)
      .then((reviews: any) => this.reviews$.next(reviews))
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }
}
