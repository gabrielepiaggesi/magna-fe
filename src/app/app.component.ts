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
  public appMode: 'app'|'business' = 'app';

  constructor(private router: Router, public appService: AppService, public apiService: ApiService, public act: ActivatedRoute) {
    const token = localStorage.getItem('MagnaToken');
    const user = localStorage.getItem('MagnaUser');
    if (!!token && !!user) {
      this.apiService.setToken(token);
      this.appService.loggedIn.next(!!token);
      this.appService.user = JSON.parse(user);
      this.getUserInfo();
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
    if ((window as any).cordova) {
      window.open = (window as any)['cordova'].InAppBrowser?.open;
      this.loading = true;
      (window as any).cordova.getAppVersion.getVersionNumber().then((version: any) => {
        console.log('APP VERSION', version);

        this.apiService
          .getLastAppVersion()
          .then((appVersion: any) => {
            this.appService.showHack.next(!!appVersion.show_hack);
            console.log(appVersion);
            let updateVersion = 0;
            let deviceVersion = +(version.replace('.', '').replace('.', ''));
            if (appVersion.obsolete_version) {
              updateVersion = +(appVersion.obsolete_version.replace('.', '').replace('.', ''));
            }
            this.updateApp = appVersion && appVersion.check_version && updateVersion > deviceVersion;
          })
          .catch((e: any) => console.error(e))
          .finally(() => (this.loading = false));
      })
      .catch((e: any) => (this.loading = false));
    }
  }

  public getUserInfo() {
    // this.loading = true;
    this.apiService.getLoggedUser()
      .then((user: any) => {
        try {
          (window as any).plugins.OneSignal.setExternalUserId(user.id + '');
          (window as any).plugins.OneSignal.setEmail(user.email);
        } catch(e) { console.error('ONESIGNAL_ERROR', e); }
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
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
}
