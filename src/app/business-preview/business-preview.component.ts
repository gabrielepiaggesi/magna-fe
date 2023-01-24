import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-business-preview',
  templateUrl: './business-preview.component.html',
  styleUrls: ['./business-preview.component.scss']
})
export class BusinessPreviewComponent implements OnInit {
  public _fidelity!: any;
  @Input() discountPresent: boolean = false;
  @Input() set fidelity(fid: any) {
    this._fidelity = fid;
    this._fidelity['expenses_array'] = new Array(this._fidelity.business_expenses_amount);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
