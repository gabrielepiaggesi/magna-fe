import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { BusinessCardsComponent } from './business-cards/business-cards.component';
import { BusinessCheckComponent } from './business-check/business-check.component';
import { BusinessDiscountComponent } from './business-discount/business-discount.component';
import { BusinessDiscountsComponent } from './business-discounts/business-discounts.component';
import { BusinessReviewsComponent } from './business-reviews/business-reviews.component';
import { BusinessSocialPostsComponent } from './business-social-posts/business-social-posts.component';
import { BusinessComponent } from './business/business.component';
import { BusinessesListComponent } from './businesses-list/businesses-list.component';
import { DiscountQrComponent } from './discount-qr/discount-qr.component';
import { FidelityQrComponent } from './fidelity-qr/fidelity-qr.component';
import { HomeComponent } from './home/home.component';
import { IncIntroComponent } from './inc-intro/inc-intro.component';
import { LoginComponent } from './login/login.component';
import { NewBusinessDiscountComponent } from './new-business-discount/new-business-discount.component';
import { NewBusinessComponent } from './new-business/new-business.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'businesses',
    component: BusinessesListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'new-business',
    component: NewBusinessComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'business/:businessId',
    component: BusinessComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'business-discounts/:businessId',
    component: BusinessDiscountsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'business-cards/:businessId',
    component: BusinessCardsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'business-discount/:businessId/:discountId',
    component: BusinessDiscountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'business-social-posts/:businessId',
    component: BusinessSocialPostsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'new-business-discount/:businessId/:origin',
    component: NewBusinessDiscountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'business-check/:checkType/:businessId',
    component: BusinessCheckComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'business-reviews/:businessId',
    component: BusinessReviewsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'incIntro',
    component: IncIntroComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'discount/:discountId/:businessName',
    component: DiscountQrComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'fidelity/:fidelityCardId/:businessName',
    component: FidelityQrComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '404',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
