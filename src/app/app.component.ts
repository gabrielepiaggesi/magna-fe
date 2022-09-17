import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ApiService } from './api.service';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'magna';
  public page = 'home';

  constructor(private router: Router, public appService: AppService, public apiService: ApiService) {
    const token = localStorage.getItem('MagnaToken');
    const user = localStorage.getItem('MagnaUser');
    if (!!token && !!user) {
      this.apiService.setToken(token);
      this.appService.loggedIn.next(!!token);
      this.appService.user = JSON.parse(user);
    }
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        const url = val.url.replace('/', '');
        this.page = url;
      }
    });
  }
}
