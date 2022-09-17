import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FidelityQrComponent } from './fidelity-qr.component';

describe('FidelityQrComponent', () => {
  let component: FidelityQrComponent;
  let fixture: ComponentFixture<FidelityQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FidelityQrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FidelityQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
