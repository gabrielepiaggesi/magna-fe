import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-fidelity-qr',
  templateUrl: './fidelity-qr.component.html',
  styleUrls: ['./fidelity-qr.component.scss']
})
export class FidelityQrComponent implements OnInit {
  public fidelityCardId!: number;
  public businessName!: string;

  constructor(private activateRouter: ActivatedRoute) {
    this.activateRouter.params.subscribe(
      (params) => {
        this.fidelityCardId = +params['fidelityCardId'];
        this.businessName = params['businessName'];
      }
    );
  }

  ngOnInit(): void {
  }

}
