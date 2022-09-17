import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-discount-preview',
  templateUrl: './discount-preview.component.html',
  styleUrls: ['./discount-preview.component.scss']
})
export class DiscountPreviewComponent implements OnInit {
  @Input() discount: any;

  constructor() { }

  ngOnInit(): void {
  }

}
