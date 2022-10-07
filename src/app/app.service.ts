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
  public appVersion = undefined;
  public businessId$: BehaviorSubject<number|undefined> = new BehaviorSubject<number|undefined>(undefined);

  constructor() {
  }

  public logUser(dto: any) {
    this.user = dto.user;
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
}
