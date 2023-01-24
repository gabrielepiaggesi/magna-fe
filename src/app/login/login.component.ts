import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('email') emailInput!: ElementRef; 
  @ViewChild('password') passwordInput!: ElementRef; 
  public loading = false;
  public loginForm = this.fb.group({
    email: [null],
    password: [null]
  });

  constructor(private apiService: ApiService, private appService: AppService, private fb: FormBuilder, public router: Router) { }

  ngOnInit(): void {
  }

  public login() {
    this.loading = true;

    const email = this.emailInput.nativeElement.value;
    const pwd = this.passwordInput.nativeElement.value;
    this.loginForm.get('email')?.setValue(email);
    this.loginForm.get('password')?.setValue(pwd);
    const body = {
      ...this.loginForm.getRawValue()
    };
    console.log(body);

    
    if (!body.email) {
      alert('Email non valida!');
      return;
    }
    if (!body.password) {
      alert('Password troppo corta!');
      return;
    }
    this.apiService.login(body)
      .then((dto: any) => {
        this.appService.logUser(dto);
        this.apiService.setToken(dto.token);
        try {
          (window as any).plugins.OneSignal.setExternalUserId(dto.user.id + '');
          (window as any).plugins.OneSignal.setEmail(dto.user.email);
        } catch(e) { console.error('ONESIGNAL_ERROR', e); }
        this.router.navigateByUrl('home');
      })
      .catch((e: any) => alert('Email o Password sbagliata.'))
      .finally(() => this.loading = false);
  }
}
