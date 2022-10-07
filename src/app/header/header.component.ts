import { Component, Input, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { AppService } from '../app.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() showBack = false;

  constructor(private _location: Location, public appService: AppService) {
  }

  ngOnInit(): void {
  }

  changeFFamily() {
    const t = document.getElementById('appTitle');
  }

  back() {
    this._location.back();
  }

}
