import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessEmployeesComponent } from './business-employees.component';

describe('BusinessEmployeesComponent', () => {
  let component: BusinessEmployeesComponent;
  let fixture: ComponentFixture<BusinessEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessEmployeesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
