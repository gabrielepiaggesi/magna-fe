import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-new-business',
  templateUrl: './new-business.component.html',
  styleUrls: ['./new-business.component.scss']
})
export class NewBusinessComponent implements OnInit {
  public loading = false;
  public newBusinessForm = this.fb.group({
    name: [null, Validators.required]
  });

  constructor(
    private apiService: ApiService, 
    private appService: AppService, 
    private fb: FormBuilder, 
    public router: Router,
    private location: Location) { }

  ngOnInit(): void {
  }

  public addNewBusinessi() {
    this.loading = true;
    this.apiService.createNewBusiness(this.newBusinessForm.getRawValue())
      .then(() => {
        this.location.back()
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }
}
