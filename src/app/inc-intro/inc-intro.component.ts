import { Location } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-inc-intro',
  templateUrl: './inc-intro.component.html',
  styleUrls: ['./inc-intro.component.scss'],
})
export class IncIntroComponent implements OnInit, OnDestroy {
  public step = 1;
  public loading = false;
  public businessId!: number;
  public intent!: string;
  public scanning = false;
  public business$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public incForm = this.fb.group({
    id: [null, Validators.required]
  });
  public socialPostForm = this.fb.group({
    url: [null, Validators.required]
  });
  public reviewForm = this.fb.group({
    text: [null, Validators.required]
  });

  constructor(
    private apiService: ApiService,
    private appService: AppService,
    private activateRouter: ActivatedRoute, 
    private fb: FormBuilder,
    public router: Router,
    private location: Location,
    private ref: ChangeDetectorRef
  ) {
    this.activateRouter.params.subscribe(
      (params) => {
        this.intent = params['intent'];
      }
    );
  }

  ngOnDestroy(): void {
    this.resetColor();
    (window as any)?.changeColor();
    if (this.scanning) {
      (window as any)['QRScanner'].cancelScan();
      (window as any)['QRScanner'].destroy((status: any) => {
        console.log('HIDING 1');
        console.log(status);
        (window as any)?.changeColor();
      });
    }
  }

  ngOnInit(): void {}

  public scanQR() {
    this.scanning = true;
    this.step = 6;
    (window as any)?.transp();
    document.body.style.backgroundColor = "rgba(245,245,245,0)";
    (window as any)['QRScanner'].scan((err: any, businessUrl: any) => {
      console.log('SCANNING', this.step);
      (window as any)?.changeColor();
      if(err) {
        if(err.name === 'SCAN_CANCELED') {
          this.resetColor();
          console.error('The scan was canceled before a QR code was found.');
        } else {
          this.resetColor();
          console.error(err);
          alert('Errore!');
        }
        (window as any)['QRScanner'].destroy((status: any) => {
          console.log('SCAN ERROR');
          this.scanning = false;
          console.log(status);
          this.resetColor();
          this.step = 1;
        });
        // an error occurred, or the scan was canceled (error code `6`)
      } else {
        (window as any)['QRScanner'].destroy((status: any) => {
          console.log('SCAN DATA', businessUrl);
          console.log(status);
          this.step = 2;
          this.scanning = false;

          var search = new URL(businessUrl).search.substring(1);
          const params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

          if (params.businessId && !isNaN(params.businessId)) {
            this.incForm.get('id')?.setValue(+params.businessId);
          }
          this.resetColor();
          const btn = document.getElementById('doneButton') as HTMLButtonElement;
          btn?.click();
        });
      }
    });

    (window as any)['QRScanner'].show();
  }

  public cancelScan() {
    document.body.style.backgroundColor = "#F5F5F5";
    (window as any)?.changeColor();
    this.resetColor();
    // (window as any)['QRScanner'].cancelScan();
    (window as any)['QRScanner'].destroy((status: any) => {
      console.log('HIDING 1');
      console.log(status);
      this.scanning = false;
      document.body.style.backgroundColor = "#F5F5F5";
      (window as any)?.changeColor();
      this.step = 1;
    });
    this.step = 1;
  }

  resetColor() {
    setTimeout(() => {
      window.document.body.style.backgroundColor = '#F5F5F5';
      document.body.style.backgroundColor = '#F5F5F5';
      this.ref.detectChanges();
    }, 500);
  }

  public getBusiness() {
    this.resetColor();
    window.document.body.style.backgroundColor = "#F5F5F5";
    (window as any)?.changeColor();
    this.loading = true;
    this.apiService
      .getUserBusiness(this.incForm.getRawValue().id)
      .then((business: any) => {
        if (!business) {
          alert('Locale inesistente');
          this.step = 1;
        }
        this.businessId = business.id;
        this.business$.next(business);
        this.appService.headerData.next({ title: business.name });
        this.step = 2;
      })
      .catch((e: any) => {
        alert('Errore');
        this.step = 1;
      })
      .finally(() => (this.loading = false));
  }

  public addFidelityCard() {
    this.loading = true;
    const business = this.business$.getValue();
    this.apiService.addUserFidelityCard(this.businessId)
      .then(() => {
        this.goHome();
      })
      .catch((e: any) => {
        alert('Errore');
        this.step = 1;
      })
      .finally(() => {
        this.loading = false;
        try {
          let bodyTag: any = { 
            user_event: "add_fidelity_card", 
            business_id: business.id, 
            business_name: business.name, 
            business_key: business.name.replace(' ', '_').toLowerCase()
          };
          bodyTag['business_id_' + (business.id+'')] = business.id;
          (window as any).plugins.OneSignal.sendTags(bodyTag);
        } catch(e) { console.error('ONESIGNAL_ERROR', e); }
      });
  }

  public sendSocialPostUrl() {
    this.loading = true;
    this.apiService.sendSocialPost(this.socialPostForm.getRawValue(), this.businessId)
      .then(() => this.next())
      .catch((e: any) => {
        alert('Errore');
        this.step = 1;
      })
      .finally(() => this.loading = false);
  }

  public sendReview() {
    this.loading = true;
    this.apiService.addBusinessReview(this.reviewForm.getRawValue(), this.businessId)
      .then(() => this.goHome())
      .catch((e: any) => {
        alert('Errore');
        this.step = 1;
      })
      .finally(() => this.loading = false);
  }

  next() {
    this.step = this.step + 1;
  }

  goHome() {
    this.appService.headerData.next(undefined);
    this.location.back();
    // this.router.navigate(['/home'], { replaceUrl: true });
  }
}
