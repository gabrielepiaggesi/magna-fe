import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-discount-qr',
  templateUrl: './discount-qr.component.html',
  styleUrls: ['./discount-qr.component.scss']
})
export class DiscountQrComponent implements OnInit {
  public discountId!: number;
  public businessName!: string;

  constructor(private activateRouter: ActivatedRoute) {
    this.activateRouter.params.subscribe(
      (params) => {
        this.discountId = +params['discountId'];
        this.businessName = params['businessName'];
      }
    );
  }
  ngOnInit(): void {
  }

}
