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
    rating: [null, Validators.required],
    text: [null, Validators.required]
  });
  public denied = false;

  public lang = 'it';
  public tr!: any;

  public ch = {
    title: '写入本地代码, 或扫描本地二维码。',
    conferma: '确认',
    scan: '本地二维码扫描'
  };

  public it = {
    title: 'Scrivi il codice del locale, o INQUADRA il QR-CODE del locale.',
    conferma: 'CONFERMA',
    scan: 'SCAN QR LOCALE'
  };

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
        if (params['businessId']) {
          this.appService.headerData.next({title: 'Recensione'});
          this.businessId = +params['businessId'];
          this.incForm.get('id')?.setValue(+this.businessId);
          this.step = 5;
          this.getBusiness(5);
        }
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

  ngOnInit(): void {
    this.lang = navigator.language || 'it';
    // this.lang = 'zh';
    if (this.lang.includes('zh') || this.lang.includes('ch')) {
      this.tr = this.ch;
      this.lang = 'ch';
    } else {
      this.tr = this.it;
      this.lang = 'it';
    }
    try {
      (window as any)['QRScanner'].getStatus((status: any) => {
        const authorized = status?.authorized;
        const denied = status?.denied;
        this.denied = denied;
        if (!authorized && !denied) {
          (window as any)['QRScanner'].prepare((err: any, status: any) => {
            if (err) {
             // here we can handle errors and clean up any loose ends.
             console.error(err);
            }
            if (status.authorized) {
              // W00t, you have camera access and the scanner is initialized.
              // QRscanner.show() should feel very fast.
            } else if (status.denied) {
              this.denied = true;
             // The video preview will remain black, and scanning is disabled. We can
             // try to ask the user to change their mind, but we'll have to send them
             // to their device settings with `QRScanner.openSettings()`.
            } else {
              // we didn't get permission, but we didn't get permanently denied. (On
              // Android, a denial isn't permanent unless the user checks the "Don't
              // ask again" box.) We can ask again at the next relevant opportunity.
            }
            (window as any)['QRScanner'].destroy((status: any) => {
              this.scanning = false;
              document.body.style.backgroundColor = "#F5F5F5";
              (window as any)?.changeColor();
              this.resetColor();
            });
          });
        }
      });
    } catch(e) {
      console.error(e);
    }
  }

  public scanQR() {
    if (this.denied) {
      alert('Non hai dato il permesso a COMEBACK di usare la fotocamera. Cambia questo dalle impostazioni del telefono. Grazie!');
      try { (window as any)['QRScanner'].openSettings(); } catch(e) { console.error((e)); }
      return;
    }
    this.scanning = true;
    this.step = 6;
    (window as any)?.transp();
    document.body.style.backgroundColor = "rgba(245,245,245,0)";
    (window as any)['QRScanner'].scan((err: any, businessUrl: any) => {
      console.log('SCANNING', this.step);
      (window as any)?.changeColor();
      if(err) {
        this.resetColor();
        console.error(err);
        if(err.name === 'SCAN_CANCELED') {
          console.error('The scan was canceled before a QR code was found.');
        } else if (err.name === 'CAMERA_ACCESS_DENIED' || err.name === 'CAMERA_ACCESS_RESTRICTED') {
          alert('Non hai dato il permesso a COMEBACK di usare la fotocamera. Cambia questo dalle impostazioni del telefono. Grazie!');
          (window as any)['QRScanner'].destroy((status: any) => {
            console.log('CAMERA_ACCESS_DENIED');
            this.scanning = false;
            console.log(status);
            this.resetColor();
            this.step = 1;
            try { (window as any)['QRScanner'].openSettings(); } catch(e) { console.error((e)); }
          });
        } else if (err.name === 'BACK_CAMERA_UNAVAILABLE' || err.name === 'CAMERA_UNAVAILABLE') {
          alert('Errore, fotocamera non disponibile ora, prova a chiudere e riaprire COMEBACK o a dare i permessi dalle impostazioni del telefono.');
        } else {
          console.error(err);
          alert('Errore, prova a chiudere e riaprire COMEBACK o a dare gli accessi alla fotocamera dalle impostazioni del telefono.');
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
    }, 300);
  }

  public getBusiness(step: any = null) {
    this.resetColor();
    window.document.body.style.backgroundColor = "#F5F5F5";
    (window as any)?.changeColor();
    this.loading = true;
    this.apiService
      .getUserBusiness(this.incForm.getRawValue().id || this.businessId)
      .then((business: any) => {
        if (!business) {
          alert('Locale inesistente');
          this.step = 1;
        }
        this.businessId = business.id;
        this.business$.next(business);
        // this.appService.headerData.next({ title: business.name });
        // if (!step) this.step = 2;
        // if (step) this.step = step;
        this.addFidelityCard();
      })
      .catch((e: any) => {
        alert('Errore');
        this.step = 1;
        this.loading = false;
      });
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
      .then(() => {
        alert('Fatto!');
        this.goHome();
      })
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
