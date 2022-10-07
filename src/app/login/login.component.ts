import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loading = false;
  public loginForm = this.fb.group({
    email: [null, Validators.required],
    password: [null, Validators.required]
  });

  constructor(private apiService: ApiService, private appService: AppService, private fb: FormBuilder, public router: Router) { }

  ngOnInit(): void {
  }

  public login() {
    this.loading = true;
    this.apiService.login(this.loginForm.getRawValue())
      .then((dto: any) => {
        this.appService.logUser(dto);
        this.apiService.setToken(dto.token);
        try {
          (window as any).plugins.OneSignal.setExternalUserId(dto.user.id + '');
          (window as any).plugins.OneSignal.setEmail(dto.user.email);
        } catch(e) { console.error('ONESIGNAL_ERROR', e); }
        this.router.navigateByUrl('home');
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }
}
