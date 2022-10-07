import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-business-employees',
  templateUrl: './business-employees.component.html',
  styleUrls: ['./business-employees.component.scss']
})
export class BusinessEmployeesComponent implements OnInit {
  public loading = false;
  public newEmployee = false;
  public businessId!: number;
  public currentEmployee: any = undefined;
  public employees$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public employeeForm = this.fb.group({
    userId: [null, Validators.required]
  });

  constructor(
    private activateRouter: ActivatedRoute,
    private apiService: ApiService,
    public appService: AppService,
    private fb: FormBuilder
  ) {
    this.activateRouter.params.subscribe(
      (params) => {
        this.businessId = +params['businessId'];
      }
    );
  }

  ngOnInit(): void {
    this.businessId && this.getEmployees();
  }

  public getEmployees() {
    this.closeEmp();
    this.newEmployee = false;
    this.loading = true;
    this.apiService
      .getBusinessEmployees(this.businessId)
      .then((business: any) => {
        this.employees$.next(business);
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  openEmplyee(emp: any) {
    this.employeeForm.get('userId')?.setValue(emp.user_id);
    this.currentEmployee = emp;
  }

  closeEmp() {
    this.employeeForm.get('userId')?.setValue(null);
    this.currentEmployee = null;
  }

  public addEmployee() {
    this.loading = true;
    this.apiService
      .addUserBusiness(this.businessId, this.employeeForm.getRawValue().userId)
      .then(() => this.getEmployees())
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public removeEmployee() {
    this.loading = true;
    this.apiService
      .removeUserBusiness(this.businessId, (this.employeeForm.getRawValue().userId || this.currentEmployee.user_id))
      .then(() => this.getEmployees())
      .catch((e: any) => { console.error(e); alert('Errore non puoi, se stai eliminando te stesso, fallo fare da un altro dipendente.')})
      .finally(() => (this.loading = false));
  }

}
