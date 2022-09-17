import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessesListComponent } from './businesses-list.component';

describe('BusinessesListComponent', () => {
  let component: BusinessesListComponent;
  let fixture: ComponentFixture<BusinessesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
