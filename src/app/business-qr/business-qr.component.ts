import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-business-qr',
  templateUrl: './business-qr.component.html',
  styleUrls: ['./business-qr.component.scss'],
})
export class BusinessQrComponent implements OnInit {
  public loading = false;
  public businessId!: number;
  public denied = false;
  public scanForm = this.fb.group({
    pointsToAdd: [1]
  });

  constructor(private router: Router, private fb: FormBuilder, private activateRouter: ActivatedRoute, private ref: ChangeDetectorRef) {
    this.activateRouter.params.subscribe(
      (params) => {
        this.businessId = +params['businessId'];
      }
    );
  }

  ngOnInit(): void {
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
              document.body.style.backgroundColor = "#FFFFFF";
              (window as any)?.changeColor();
              this.resetColor();
            });
          });
        }
        (window as any)['QRScanner'].destroy((status: any) => {
          document.body.style.backgroundColor = "#FFFFFF";
          (window as any)?.changeColor();
          this.resetColor();
        });
      });
    } catch(e) {
      console.error(e);
    }
  }

  resetColor() {
    setTimeout(() => {
      window.document.body.style.backgroundColor = '#FFFFFF';
      document.body.style.backgroundColor = '#FFFFFF';
      this.ref.detectChanges();
    }, 300);
  }

  go(path: string) {
    if (this.denied) {
      alert('Non hai dato il permesso a COMEBACK di usare la fotocamera. Cambia questo dalle impostazioni del telefono. Grazie!');
      try { (window as any)['QRScanner'].openSettings(); } catch(e) { console.error((e)); }
      return;
    }
    const pointsToAdd = this.scanForm.getRawValue().pointsToAdd;

    if (!pointsToAdd || isNaN(pointsToAdd)) {
      alert('Punti non validi, scrivi un numero da 1 in poi.');
      return;
    }
    // this.appService.headerData.next(undefined);
    this.router.navigateByUrl(path + '/' + pointsToAdd);
  }
}
