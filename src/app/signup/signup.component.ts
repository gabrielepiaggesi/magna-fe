import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import * as moment from 'moment';

export function getDatesDiffIn(dateBefore: string|Date|number, dateAfter: string|Date|number, time: 'years' | 'weeks' | 'days' | 'months') {
  const date1 = new Date(dateBefore);
  let date2 = new Date(dateAfter);
  var a = moment([date2.getFullYear(), date2.getMonth(), date2.getDay()]);
  var b = moment([date1.getFullYear(), date1.getMonth(), date1.getDay()]);
  return a.diff(b, time);
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  public loading = false;
  public signupForm = this.fb.group({
    email: [null, Validators.required],
    birthdate: [(new Date(Date.now()).toISOString().substring(0, 10)), Validators.required],
    hasAccepted: [false, Validators.requiredTrue]
  });

  constructor(private apiService: ApiService, private appService: AppService, private fb: FormBuilder, public router: Router) { }

  ngOnInit(): void {
  }

  openPP() {
    window.open('https://www.privacypolicygenerator.info/live.php?token=mOLA0Ev7jn72bwua8S32T2okWN9Kr8EY', '_system');
  }
  openTC() {
    window.open('https://www.termsandconditionsgenerator.com/live.php?token=jzp3iiuSJl969TaRga5tJ3duI9Xz0zwg', '_system');
  }

  public signup() {
    const body = {
      ...this.signupForm.getRawValue()
    };
    const diff = getDatesDiffIn(body.birthdate, Date.now(), 'years');
    if (diff <= 4) {
      alert('Data di Nascita sbagliata, troppo giovane!');
      return;
    }
    if (!body.email.includes('@') || !body.email.includes('.') || body.email.length <= 5) {
      alert('Email non valida!');
      return;
    }
    if (!body.hasAccepted) {
      alert('Spunta non accesa!');
      return;
    }
    this.loading = true;
    this.apiService.signup(body)
      .then((dto: any) => {
        if (dto.msg ==='user_exists') {
          alert('Non puoi registrarti con questa email, è gia in uso, prova ad accedere. Le credenziali ti sono state inviate per email quando ti sei iscritto, controlla la tua posta di tempo fa.');
          return;
        } else {
          alert('Benvenuto, le credenziali di accesso ti sono state inviate per email.');
          this.appService.logUser(dto);
          this.apiService.setToken(dto.token);
          try {
            (window as any).plugins.OneSignal.setExternalUserId(dto.user.id + '');
            (window as any).plugins.OneSignal.setEmail(dto.user.email);
          } catch(e) { console.error('ONESIGNAL_ERROR', e); }
          this.router.navigateByUrl('home');
        }
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

}
