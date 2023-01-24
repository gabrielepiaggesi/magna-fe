import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('email') emailInput!: ElementRef; 
  @ViewChild('password') passwordInput!: ElementRef; 
  public loading = false;
  public signupForm = this.fb.group({
    email: [null],
    password: [null],
    birthdate: [null],
    hasAccepted: [false, Validators.requiredTrue]
  });

  public lang = 'it';
  public tr!: any;

  public ch = {
    title: '选择电子邮件和密码。',
    cta: '进入',
    accept: '我接受我',
    terms: "条款和条件",
    privacy: "隐私政策。",
    hasAccount: '你是不是已经有一个账号? 登录'
  };

  public it = {
    title: "Scegli un'email e una password.",
    cta: 'ENTRA',
    accept: 'Accetto i ',
    terms: "Termini e Condizioni D'uso",
    privacy: "Privacy Policy.",
    hasAccount: 'Hai gia un account? Accedi'
  };

  constructor(private apiService: ApiService, private appService: AppService, private fb: FormBuilder, public router: Router) { }

  ngOnInit(): void {
    this.lang = navigator.language || 'it';
    // this.lang = 'zh';
    if (this.lang.includes('zh') || this.lang.includes('ch')) {
      this.tr = this.ch;
      this.lang = 'ch';
    } else {
      this.tr = this.it;
      this.lang = 'it';
    }
  }

  openPP() {
    window.open('https://www.privacypolicygenerator.info/live.php?token=mOLA0Ev7jn72bwua8S32T2okWN9Kr8EY', '_system');
  }
  openTC() {
    window.open('https://www.termsandconditionsgenerator.com/live.php?token=jzp3iiuSJl969TaRga5tJ3duI9Xz0zwg', '_system');
  }

  public signup() {
    const email = this.emailInput.nativeElement.value;
    const pwd = this.passwordInput.nativeElement.value;
    this.signupForm.get('email')?.setValue(email);
    this.signupForm.get('password')?.setValue(pwd);
    
    const body = {
      ...this.signupForm.getRawValue(),
      lang: window?.navigator?.language ? window?.navigator?.language.substring(0, 2) : (navigator.language ? navigator.language.substring(0, 2) : null)
    };
    console.log(body);
    
    // const diff = getDatesDiffIn(body.birthdate, Date.now(), 'years');
    // if (diff <= 4) {
    //   body.birthdate = null;
    // }
    if (!body.email.includes('@') || !body.email.includes('.') || body.email.length <= 5) {
      alert(this.lang == 'ch' ? '不合规电邮!' : 'Email non valida!');
      return;
    }
    if (!body.password || body.password.length <= 5) {
      alert(this.lang == 'ch' ? '密码太短!' : 'Password troppo corta!');
      return;
    }
    if (!body.hasAccepted) {
      alert(this.lang == 'ch' ? '接受条款和隐私' : 'Accetta i termini e la privacy');
      return;
    }
    this.loading = true;
    this.apiService.signup(body)
      .then((dto: any) => {
        if (dto.msg ==='user_exists') {
          let msg = this.lang == 'ch' ? 
            '您不能使用此邮箱注册, 该邮箱已被使用, 请尝试访问。凭据是在您注册时通过电子邮件发送给您的, 请在一段时间前查看您的电子邮件。' : 
            'Non puoi registrarti con questa email, è gia in uso, prova ad accedere. Le credenziali ti sono state inviate per email quando ti sei iscritto, controlla la tua posta di tempo fa.';
          alert(msg);
          return;
        } else {
          alert(this.lang == 'ch' ? '欢迎!' : 'Benvenuto!');
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
