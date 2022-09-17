import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  public loading = false;
  public signupForm = this.fb.group({
    email: [null, Validators.required]
  });

  constructor(private apiService: ApiService, private appService: AppService, private fb: FormBuilder, public router: Router) { }

  ngOnInit(): void {
  }

  public signup() {
    this.loading = true;
    const body = {
      ...this.signupForm.getRawValue(),
      hasAccepted: 1,
      age: 25,
      birthdate: '1997-02-28'
    };
    this.apiService.signup(body)
      .then((dto: any) => {
        this.appService.logUser(dto);
        this.apiService.setToken(dto.token);
        this.router.navigateByUrl('home');
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

}
