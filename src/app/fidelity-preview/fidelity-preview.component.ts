import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fidelity-preview',
  templateUrl: './fidelity-preview.component.html',
  styleUrls: ['./fidelity-preview.component.scss']
})
export class FidelityPreviewComponent implements OnInit {
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
