import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessDiscountsComponent } from './business-discounts.component';

describe('BusinessDiscountsComponent', () => {
  let component: BusinessDiscountsComponent;
  let fixture: ComponentFixture<BusinessDiscountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessDiscountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessDiscountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
