import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountQrComponent } from './discount-qr.component';

describe('DiscountQrComponent', () => {
  let component: DiscountQrComponent;
  let fixture: ComponentFixture<DiscountQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountQrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
