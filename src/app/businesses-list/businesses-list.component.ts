import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-businesses-list',
  templateUrl: './businesses-list.component.html',
  styleUrls: ['./businesses-list.component.scss']
})
export class BusinessesListComponent implements OnInit {
  public loading = false;
  public businesses$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(private router: Router, private apiService: ApiService, public appService: AppService) { }

  ngOnInit(): void {
    this.getBusinessesList();
  }

  go(path: string) {
    this.router.navigateByUrl(path);
  }

  public getBusinessesList() {
    this.loading = true;
    this.apiService.getUserBusinessesList(this.appService.user?.id)
      .then((businesses: any) => {
        this.businesses$.next(businesses);
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }
}
