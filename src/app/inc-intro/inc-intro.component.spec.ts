import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncIntroComponent } from './inc-intro.component';

describe('IncIntroComponent', () => {
  let component: IncIntroComponent;
  let fixture: ComponentFixture<IncIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncIntroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
