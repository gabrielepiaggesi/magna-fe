import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public loading = false;
  public discounts$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public fidelityCards$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public discounts = [
    {
      incName: 'Lekker Bistrot',
      value: 10,
      type: 'PERC',
      minPrice: 10,
      status: 'VALID'
    },
    {
      incName: 'Ristorante Komi Sushi',
      value: 5,
      type: 'EUR',
      minPrice: 30,
      status: 'VALID'
    },
    {
      incName: 'Santa Maria di Galeria',
      value: 5,
      type: 'EUR',
      minPrice: 50,
      status: 'VALID'
    }
  ];
  public fidelityCards = [
    {
      incName: 'Lekker Bistrot',
      totalSlots: new Array(8),
      countdown: 3,
      value: 20,
      type: 'PERC',
      minPrice: 30,
    },
    {
      incName: 'Ristorante Komi Sushi',
      totalSlots: new Array(5),
      countdown: 3,
      value: 20,
      type: 'PERC',
      minPrice: 60,
    },
    {
      incName: 'Santa Maria di Galeria',
      totalSlots: new Array(10),
      countdown: 3,
      value: 10,
      type: 'EUR',
      minPrice: 70,
    }
  ];

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
    this.getDiscounts();
    this.getFidelityCards();
  }

  go(path: string) {
    this.router.navigateByUrl(path);
  }

  public getDiscounts() {
    this.loading = true;
    this.apiService.getUserDiscounts()
      .then((discounts: any) => {
        this.discounts$.next(discounts);
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public getFidelityCards() {
    this.loading = true;
    this.apiService.getUserFidelityCards()
      .then((fidelityCards: any) => {
        this.fidelityCards$.next(fidelityCards);
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

}
