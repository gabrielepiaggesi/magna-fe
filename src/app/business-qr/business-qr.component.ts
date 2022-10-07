import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-business-qr',
  templateUrl: './business-qr.component.html',
  styleUrls: ['./business-qr.component.scss'],
})
export class BusinessQrComponent implements OnInit {
  public loading = false;
  public businessId!: number;

  constructor(private router: Router, private activateRouter: ActivatedRoute) {
    this.activateRouter.params.subscribe(
      (params) => {
        this.businessId = +params['businessId'];
      }
    );
  }

  ngOnInit(): void {}

  go(path: string) {
    // this.appService.headerData.next(undefined);
    this.router.navigateByUrl(path);
  }
}
