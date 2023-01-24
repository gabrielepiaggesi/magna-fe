import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-businesses-list',
  templateUrl: './businesses-list.component.html',
  styleUrls: ['./businesses-list.component.scss']
})
export class BusinessesListComponent implements OnInit {
  public loading = false;
  public deleting = false;
  public outing = false;
  public deviceAppVersion$: BehaviorSubject<string|undefined> = new BehaviorSubject<string|undefined>(undefined);
  public canUpdateApp$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public user$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public businesses$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public fidelityCards$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public capForm = this.fb.group({
    cap: [null, Validators.required]
  });

  constructor(private router: Router, private apiService: ApiService, private fb: FormBuilder, public appService: AppService) {
  }

  ngOnInit(): void {
    this.getUserInfo();
    this.getBusinessesList();
    setTimeout(() => {
      this.getFidelityCards();
    }, 500);
    const icon = document.getElementById('gearIcon');
    icon?.click();
    this.getAppInfo();
  }

  public getAppInfo() {
    if ((window as any).cordova) {
      (window as any).cordova.getAppVersion.getVersionNumber().then((version: any) => {
        console.log('APP VERSION', version);
        let deviceVersion = +(version.replace('.', '').replace('.', ''));
        this.deviceAppVersion$.next(version);
        this.apiService
          .getLastAppVersion()
          .then((appVersion: any) => {
            let latestVersion = 0;
            if (appVersion.version_number) {
              latestVersion = +(appVersion.version_number.replace('.', '').replace('.', ''));
            }
            this.canUpdateApp$.next(appVersion && appVersion.check_version && latestVersion > deviceVersion);
          })
          .catch((e: any) => console.error(e));
      })
      .catch((e: any) => console.error(e));
    }
  }

  public openAppStore() {
    const platform = (window as any)['cordova'].platformId;
    console.log(platform);
    if (platform && platform.toString().toLowerCase() === 'ios') {
      window.open('https://apps.apple.com/it/app/comeback-sconti-e-carte/id6443738691', '_system');
    } else if (platform && platform.toString().toLowerCase() === 'android') {
      window.open('https://play.google.com/store/apps/details?id=com.comeback.card&gl=IT', '_system');
      try {
        window.open('market://details?id=com.comeback.card', '_system');
      } catch(e) {
        window.open('https://play.google.com/store/apps/details?id=com.comeback.card&gl=IT', '_system');
      }
    } else {
      window.open('https://comebackwebapp.web.app/update', '_system');
    }
  }

  go(path: string) {
    this.router.navigateByUrl(path);
  }

  public getUserInfo() {
    this.loading = true;
    this.apiService.getLoggedUser()
      .then((user: any) => {
        this.capForm.get('cap')?.setValue(user.cap || null);
        this.user$.next(user);
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public getBusinessesList() {
    this.loading = true;
    this.apiService.getUserBusinessesList(this.appService.user?.id)
      .then((businesses: any) => {
        this.businesses$.next(businesses);
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public getFidelityCards() {
    const icon = document.getElementById('gearIcon');
    try {
      (window as any).plugins.OneSignal.getTags((tags: any) => {
        let keys = Object.keys(tags);
        keys = keys.filter((k: string) => k.startsWith('business_id_'));
        let businessIds: number[] = [];
        keys.forEach((key: string) => {
          let arr = key.split('business_id_');
          let bId = +arr[1];
          businessIds.push(bId);
        });
        this.loading = true;
        this.apiService.getUserFidelityCards()
          .then((fidelityCards: any) => {
            fidelityCards = fidelityCards.map((fC: any) => ({ ...fC, notify: businessIds.includes(fC.business_id) }));
            this.fidelityCards$.next(fidelityCards);
          })
          .catch((e: any) => console.error(e))
          .finally(() => {
            this.loading = false;
            icon?.click();
          });
      }, (e: any) => {
        console.error('ONESIGNAL_ERROR', e);
        this.loading = false;
      });
    } catch(e) {
      console.error('ONESIGNAL_ERROR', e);
      this.loading = false;
    }
    icon?.click();
  }

  public manageNotification(event: any, fC: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      try {
        (window as any).plugins.OneSignal.sendTag("business_id_"+fC.business_id, fC.business_id);
      } catch(e) { console.error('ONESIGNAL_ERROR', e); }
    } else {
      try {
        (window as any).plugins.OneSignal.deleteTag("business_id_"+fC.business_id);
      } catch(e) { console.error('ONESIGNAL_ERROR', e); }
    }
  }

  public deleteAccount() {
    this.loading = true;
    this.apiService.deleteUser()
      .then((user: any) => this.logout())
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public updateCap() {
    this.loading = true;
    this.apiService.updateUserCap(this.capForm.getRawValue().cap)
      .then((user: any) => {
        this.appService.userInfo = user;
        alert('CAP aggiornato!');
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public logout() {
    this.deleting = false;
    this.apiService.setToken(undefined);
    this.appService.logOut();
    this.router.navigateByUrl('login');
  }
}
