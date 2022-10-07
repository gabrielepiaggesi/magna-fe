import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessQrComponent } from './business-qr.component';

describe('BusinessQrComponent', () => {
  let component: BusinessQrComponent;
  let fixture: ComponentFixture<BusinessQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessQrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
