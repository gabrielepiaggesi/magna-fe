import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountPreviewComponent } from './discount-preview.component';

describe('DiscountPreviewComponent', () => {
  let component: DiscountPreviewComponent;
  let fixture: ComponentFixture<DiscountPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
