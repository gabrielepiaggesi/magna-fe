import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-discount-qr',
  templateUrl: './discount-qr.component.html',
  styleUrls: ['./discount-qr.component.scss']
})
export class DiscountQrComponent implements OnInit {
  @Output() close = new EventEmitter();
  @Input() discount!: any;
  public fidelityCardEvent = false;

  constructor(public loc: Location) {
    (window as any).addEventListener('fidelityCardEvent', (e: any) => {
      this.fidelityCardEvent = true;
    }, false);
  }
  ngOnInit(): void {
  }

  public getQrRaw() {
    return `https://comebackwebapp.web.app/?businessId=${this.discount.business_id}&entityId=${this.discount.id}&entityType=discount`;
  }

}
