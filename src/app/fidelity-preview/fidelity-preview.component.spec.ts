import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FidelityPreviewComponent } from './fidelity-preview.component';

describe('FidelityPreviewComponent', () => {
  let component: FidelityPreviewComponent;
  let fixture: ComponentFixture<FidelityPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FidelityPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FidelityPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
