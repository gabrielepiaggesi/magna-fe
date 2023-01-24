import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { ApiService } from './api.service';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Comeback';
  public page = 'home';
  public loading = false;
  public updateApp = false;
  public mustUpdateAppEnabled = false;
  public appMode: 'app'|'business' = 'app';

  constructor(private router: Router, public appService: AppService, public apiService: ApiService, public act: ActivatedRoute) {
    (window as any).addEventListener('notification', (e: any) => { this.go('redeem'); }, false);
    const token = localStorage.getItem('MagnaToken');
    const user = localStorage.getItem('MagnaUser');
    if (!!token && !!user) {
      this.apiService.setToken(token);
      this.appService.loggedIn.next(!!token);
      this.appService.user = JSON.parse(user);
      // this.getUserInfo();
    }
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        const url = val.url.replace('/', '');
        this.page = url;
        if (url.includes('reservations') && !url.includes('user')) {
          this.appMode = 'business';
        }
        if (url === 'home') {
          this.appMode = 'app';
        }
      }
      if (val instanceof RoutesRecognized) {
        let route = val.state.root.firstChild;
        const data = route?.data;
        if (data && data['title']) {
          console.log(data);
          this.appService.headerData.next(data);
        } else {
          this.appService.headerData.next(undefined);
        }
      }
    });
  }

  ngOnInit(): void {
    console.log('2', (window as any)['destination']);
    if ((window as any).cordova) {
      window.open = (window as any)['cordova'].InAppBrowser?.open;
      this.loading = true;
      (window as any).cordova.getAppVersion.getVersionNumber().then((version: any) => {
        console.log('APP VERSION', version);
        this.getUserInfo(+(version.replace('.', '').replace('.', '')));

        this.apiService
          .getLastAppVersion()
          .then((appVersion: any) => {
            this.appService.showHack.next(!!appVersion.show_hack);
            console.log(appVersion);
            let latestVersion = 0;
            let obsoleteVersion = 0;
            let deviceVersion = +(version.replace('.', '').replace('.', ''));

            if (appVersion.version_number) {
              latestVersion = +(appVersion.version_number.replace('.', '').replace('.', ''));
            }
            if (appVersion.obsolete_version) {
              obsoleteVersion = +(appVersion.obsolete_version.replace('.', '').replace('.', ''));
            }

            this.updateApp = appVersion && appVersion.check_version && latestVersion > deviceVersion && obsoleteVersion >= deviceVersion;
            this.mustUpdateAppEnabled = appVersion && latestVersion > deviceVersion;
          })
          .catch((e: any) => console.error(e))
          .finally(() => (this.loading = false));
      })
      .catch((e: any) => {
        this.getUserInfo();
        this.loading = false;
      });
    } else {
      this.getUserInfo();
    }
    const dest = (window as any)['destination'];
    if (dest && dest === 'promotions') {
      this.go('redeem');
    }
  }

  public getUserInfo(currentAppVersion: number|null = null) {
    // this.loading = true;
    const token = localStorage.getItem('MagnaToken');
    const user = localStorage.getItem('MagnaUser');
    if (!!token && !!user) {
      const lang = (navigator.language || window?.navigator?.language).substring(0, 2);
    this.apiService.getLoggedUser(lang, currentAppVersion)
      .then((user: any) => {
        this.appService.userInfo = user;
        this.updateApp = this.mustUpdateAppEnabled && user.must_update_app;
        try {
          (window as any).plugins.OneSignal.setExternalUserId(user.id + '');
          (window as any).plugins.OneSignal.setEmail(user.email);
        } catch(e) { console.error('ONESIGNAL_ERROR', e); }
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
    }
  }

  go(path: string, withId = false) {
    console.log(path);
    
    if (path === 'home') {
      this.appMode = 'app';
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      if (path === 'reservations') {
        this.appMode = 'business';
      }
      this.router.navigateByUrl(path + (withId ? '/'+this.appService.businessId$.getValue() : ''));
    }
  }

  isPage(pages: string[]) {
    return pages.some(p => this.page.includes(p));
  }
  isNotPage(pages: string[]) {
    return pages.every(p => !this.page.includes(p));
  }

  public goAppStore() {
    const platform = (window as any)['cordova'].platformId;
    console.log(platform);
    if (platform && platform.toString().toLowerCase() === 'ios') {
      window.open('https://apps.apple.com/it/app/comeback-sconti-e-carte/id6443738691', '_system')
    } else if (platform && platform.toString().toLowerCase() === 'android') {
      window.open('https://play.google.com/store/apps/details?id=com.comeback.card&gl=IT', '_system')
    } else {
      window.open('https://comebackwebapp.web.app/update', '_system')
    }
  }
}
