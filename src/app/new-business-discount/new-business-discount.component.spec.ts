import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBusinessDiscountComponent } from './new-business-discount.component';

describe('NewBusinessDiscountComponent', () => {
  let component: NewBusinessDiscountComponent;
  let fixture: ComponentFixture<NewBusinessDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewBusinessDiscountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewBusinessDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
