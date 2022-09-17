import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessDiscountComponent } from './business-discount.component';

describe('BusinessDiscountComponent', () => {
  let component: BusinessDiscountComponent;
  let fixture: ComponentFixture<BusinessDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessDiscountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
