import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-businesses-list',
  templateUrl: './businesses-list.component.html',
  styleUrls: ['./businesses-list.component.scss']
})
export class BusinessesListComponent implements OnInit {
  public loading = false;
  public deleting = false;
  public outing = false;
  public user$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public businesses$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public fidelityCards$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(private router: Router, private apiService: ApiService, public appService: AppService) {
  }

  ngOnInit(): void {
    this.getUserInfo();
    this.getBusinessesList();
    setTimeout(() => {
      this.getFidelityCards();
    }, 500);
    const icon = document.getElementById('gearIcon');
    icon?.click();
  }

  go(path: string) {
    this.router.navigateByUrl(path);
  }

  public getUserInfo() {
    this.loading = true;
    this.apiService.getLoggedUser()
      .then((user: any) => this.user$.next(user))
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

  public logout() {
    this.deleting = false;
    this.apiService.setToken(undefined);
    this.appService.logOut();
    this.router.navigateByUrl('login');
  }
}
