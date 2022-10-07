import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private appService: AppService, private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
  }

  logout() {
    this.apiService.setToken(undefined);
    this.appService.logOut();
    this.router.navigateByUrl('login');
  }

}
