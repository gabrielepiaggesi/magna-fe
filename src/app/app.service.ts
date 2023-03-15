import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showHack: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public headerData: BehaviorSubject<{ title?: string, type?: string }|undefined> = new BehaviorSubject<{ title?: string, type?: string }|undefined>(undefined);
  public user: any;
  public appVersion!: number;
  public userInfo: any;
  public lastQRScanId!: number;
  public goToBusinessId!: number;
  public shouldAutoTimber: boolean = false;
  public welcomeMessage!: string;
  public latestUserPosition!: any;
  public businessId$: BehaviorSubject<number|undefined> = new BehaviorSubject<number|undefined>(undefined);
  public cardsId: { cardId: number, date: Date }[] = [];

  public goToBusinessIdFromExternalQR$: BehaviorSubject<number|undefined> = new BehaviorSubject<number|undefined>(undefined);

  constructor() {
    (window as any).addEventListener('goToBusiness', (e: any) => {
      const goToBusinessId = (window as any)['goToBusinessId'];
      this.prepareBusinessToOpen(goToBusinessId, true);
      console.log('goToBusiness', goToBusinessId);
      goToBusinessId && this.goToBusinessIdFromExternalQR$.next(goToBusinessId);
    }, false);
  }

  public logUser(dto: any) {
    this.user = dto.user;
    this.userInfo = dto.user;
    localStorage.setItem('MagnaUser', JSON.stringify(this.user));
    localStorage.setItem('MagnaToken', dto.token);
    this.loggedIn.next(!!dto.token);
  }

  public logOut() {
    localStorage.removeItem('MagnaToken');
    localStorage.removeItem('MagnaUser');
    localStorage.clear();
    this.loggedIn.next(false);
    this.user = null;
  }

  public prepareBusinessToOpen(businessId: number, shouldAutoTimber: boolean = false) {
    this.goToBusinessId = businessId;
    this.shouldAutoTimber = shouldAutoTimber;
  }

  public resetBusinessToOpen() {
    this.goToBusinessId = 0;
    this.shouldAutoTimber = false;
  }

  private getMinsDiff(dat1: Date, dat2: Date) {
    if (!dat1 || !dat2) return 1000000;
    const date1 = dat1.getTime();
    const date2 = dat2.getTime();
    const mins = Math.abs(date1 - date2) / 60000;
    return mins;
  }

  public getUserPosition(forBusinessId: number, force = false): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      const now = new Date(Date.now());
      console.log('getUserPosition', forBusinessId, force);
      
      if (!force && this.latestUserPosition && this.latestUserPosition.forBusinessId == forBusinessId) {
        const minsDiff = this.getMinsDiff(now, this.latestUserPosition.date);
        const validMinsDiff = !minsDiff || minsDiff < 10;
        const oldLatestUserPosition = this.latestUserPosition;
        if (validMinsDiff) resolve({  
          ...oldLatestUserPosition,
          ignore: true
        });
      }

      const platform = (window as any).cordova.platformId;
      const geoOptions = platform == 'ios' ? { maximumAge: 5000, enableHighAccuracy: true } : { maximumAge: 5000, timeout: 5000, enableHighAccuracy: true };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          position?.coords && console.log(position?.coords.toString());
          const currentUserPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            forBusinessId,
            status: 'success',
            date: new Date(Date.now())
          };
          this.latestUserPosition = currentUserPosition
          resolve(this.latestUserPosition);
        }
        , 
        (error) => {
          console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
          const currentUserPosition = {
            status: 'error',
            code: error.code,
            forBusinessId,
            message: error.message,
            date: new Date(Date.now())
          };
          this.latestUserPosition = currentUserPosition
          reject(this.latestUserPosition);
        },
        geoOptions
      );
    });
  }
}
