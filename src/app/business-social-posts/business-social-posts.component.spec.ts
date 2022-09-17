import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessSocialPostsComponent } from './business-social-posts.component';

describe('BusinessSocialPostsComponent', () => {
  let component: BusinessSocialPostsComponent;
  let fixture: ComponentFixture<BusinessSocialPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessSocialPostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessSocialPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
