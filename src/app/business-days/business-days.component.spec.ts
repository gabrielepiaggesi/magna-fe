import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessDaysComponent } from './business-days.component';

describe('BusinessDaysComponent', () => {
  let component: BusinessDaysComponent;
  let fixture: ComponentFixture<BusinessDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessDaysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
