import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-business-check',
  templateUrl: './business-check.component.html',
  styleUrls: ['./business-check.component.scss']
})
export class BusinessCheckComponent implements OnInit, OnDestroy {
  public loading = false;
  public businessId!: number;
  public manualMode = false;
  public qrMode = true;
  public checkType!: 'fidelityCard'|'discount';
  public fidelityCard$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public entityForm = this.fb.group({
    type: [null, Validators.required],
    id: [null, Validators.required]
  });

  constructor(
    private apiService: ApiService, 
    private appService: AppService, 
    private activateRouter: ActivatedRoute, 
    private fb: FormBuilder, 
    public router: Router,
    private ref: ChangeDetectorRef,
    private location: Location) {
      this.activateRouter.params.subscribe(
        (params) => {
          this.businessId = +params['businessId'];
          this.checkType = params['checkType'];
        }
      );
    }

  ngOnInit(): void {
    // this.loading = true;
    this.scanQR();
  }

  ngOnDestroy(): void {
    this.resetColor();
    (window as any)?.changeColor();
    (window as any)['QRScanner'].cancelScan();
    (window as any)['QRScanner'].destroy((status: any) => {
      console.log('HIDING 1');
      console.log(status);
      (window as any)?.changeColor();
    });
  }

  public scanQR() {
    (window as any)['QRScanner'].scan((err: any, text: any) => {
      console.log('SCANNING', text);
      // (window as any)?.changeColor(); // CHANGE BACK COLOR!
      // this.resetColor();
      if(err) {
        if(err.name === 'SCAN_CANCELED') {
          this.resetColor();
          console.error('The scan was canceled before a QR code was found.');
        } else {
          this.resetColor();
          console.error(err);
          alert('Errore!');
        }
        this.resetColor();
        (window as any)['QRScanner'].destroy((status: any) => {
          console.log('SCAN ERROR');
          console.log(status);
          this.location.back();
        });
        // an error occurred, or the scan was canceled (error code `6`)
      } else {
        // DESTROY AFTER SCAN!
        // (window as any)['QRScanner'].destroy((status: any) => {
        //   console.log('SCAN DATA', text);
        //   console.log(status);
        //   this.autoValidate(text);
        // });
        // console.log('SUCCESS', text);

        this.autoValidate(text); // INFINITE SCANNING MORE COMFORTABLE FOR TITOLARI?? TEST (without destroying)
      }
    });
    (window as any)?.transp();
    document.body.style.backgroundColor = "rgba(245,245,245,0)";
    (window as any)['QRScanner'].show();
  }

  public manualValidate() {
    const form = this.entityForm.getRawValue();
    form.type === 'discount' ? this.checkDiscount() : this.checkFidelityCard();
  }

  public infiniteScan() {
    setTimeout(() => {
      this.scanQR();
    }, 500);
  }

  public autoValidate(businessUrl: string) {
    try {
      var search = new URL(businessUrl).search.substring(1);
      const qrObj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
      console.log(qrObj);
      if (!qrObj.entityType || !qrObj.entityId || !qrObj.businessId) return;
      if (!['discount', 'fidelityCard'].includes(qrObj.entityType)) return;
      if (isNaN(qrObj.businessId) || qrObj.businessId != this.businessId) return;
      if (+qrObj.entityId <= 0) return;
      if (isNaN(qrObj.entityId)) return;
      
      const entityType = qrObj.entityType;
      const entityId = qrObj.entityId;
  
      this.checkType = entityType;
      this.entityForm.get('type')?.setValue(entityType);
      this.entityForm.get('id')?.setValue(+entityId);
      entityType === 'discount' ? this.checkDiscount() : this.checkFidelityCard();
    } catch(e) {
      console.error(e);
    }
  }

  resetColor() {
    setTimeout(() => {
      window.document.body.style.backgroundColor = '#F5F5F5';
      document.body.style.backgroundColor = '#F5F5F5';
      this.ref.detectChanges();
    }, 1000);
  }

  public cancelScan(goBack = true) {
    this.resetColor();
    document.body.style.backgroundColor = "#F5F5F5";
    (window as any)?.changeColor();
    // (window as any)['QRScanner'].cancelScan();
    (window as any)['QRScanner'].destroy((status: any) => {
      console.log('CANCEL SCAN');
      console.log(status);
      (window as any)?.changeColor();
      goBack && this.location.back();
    });
  }

  public writeCode() {
    this.cancelScan(false);
    this.manualMode = true;
    this.loading = false;
    this.qrMode = false;
  }

  public checkFidelityCard() {
    this.loading = true;
    this.apiService.checkUserFidelityCardValidity(this.entityForm.getRawValue().id, this.businessId)
      .then(() => { alert('CARTA SEGNATA! Ottimo');  })
      .catch((e: any) => {
        console.error(e);
        alert('Carta NON VALIDA!');
      })
      .finally(() => {
        this.loading = false;
        this.infiniteScan();
      });
  }

  public checkDiscount() {
    this.loading = true;
    this.apiService.checkUserDiscountValidity(this.entityForm.getRawValue().id, this.businessId)
      .then(() => { alert('SCONTO VALIDATO! Ottimo'); this.location.back(); })
      .catch((e: any) => {
        console.error(e);
        alert('Premio NON VALIDO!');
      })
      .finally(() => {
        this.loading = false;
        this.infiniteScan();
      });
  }
}
