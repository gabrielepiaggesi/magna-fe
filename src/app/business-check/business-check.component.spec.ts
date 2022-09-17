import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCheckComponent } from './business-check.component';

describe('BusinessCheckComponent', () => {
  let component: BusinessCheckComponent;
  let fixture: ComponentFixture<BusinessCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
