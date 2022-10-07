import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-user-reservations',
  templateUrl: './user-reservations.component.html',
  styleUrls: ['./user-reservations.component.scss'],
})
export class UserReservationsComponent implements OnInit {
  public loading = false;
  public reservations$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public currentRes$: BehaviorSubject<any> = new BehaviorSubject<any>(
    undefined
  );

  constructor(
    private router: Router,
    private apiService: ApiService,
    private appService: AppService,
    private activateRouter: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getReservations();
  }

  public getReservations() {
    this.currentRes$.next(undefined);
    this.loading = true;
    this.apiService
      .getUserReservations()
      .then((reses: any) => this.reservations$.next(reses))
      .catch((e: any) => alert('Errore'))
      .finally(() => (this.loading = false));
  }

  public openRes(res: any) {
    this.currentRes$.next(res);
  }
}
