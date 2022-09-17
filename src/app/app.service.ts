import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public user: any;

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
