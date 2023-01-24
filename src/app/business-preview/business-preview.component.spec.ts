import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessPreviewComponent } from './business-preview.component';

describe('BusinessPreviewComponent', () => {
  let component: BusinessPreviewComponent;
  let fixture: ComponentFixture<BusinessPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
