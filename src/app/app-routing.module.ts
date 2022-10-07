import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { BusinessCardsComponent } from './business-cards/business-cards.component';
import { BusinessCheckComponent } from './business-check/business-check.component';
import { BusinessDiscountComponent } from './business-discount/business-discount.component';
import { BusinessDiscountsComponent } from './business-discounts/business-discounts.component';
import { BusinessEmployeesComponent } from './business-employees/business-employees.component';
import { BusinessQrComponent } from './business-qr/business-qr.component';
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
import { RedeemComponent } from './redeem/redeem.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { SettingsComponent } from './settings/settings.component';
import { SignupComponent } from './signup/signup.component';
import { UserReservationsComponent } from './user-reservations/user-reservations.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Comeback',
      type: 'main'
    }
  },
  {
    path: 'businesses',
    component: BusinessesListComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Impostazioni',
    }
  },
  {
    path: 'redeem',
    component: RedeemComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Riscatta Sconto',
    }
  },
  {
    path: 'new-business',
    component: NewBusinessComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Nuova Attività',
    }
  },
  {
    path: 'business/:businessId',
    component: BusinessComponent,
    canActivate: [AuthGuard],
    data: {
    }
  },
  {
    path: 'business-discounts/:businessId',
    component: BusinessDiscountsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Premi',
    }
  },
  {
    path: 'business-employees/:businessId',
    component: BusinessEmployeesComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Dipendenti',
    }
  },
  {
    path: 'business-cards/:businessId',
    component: BusinessCardsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Carta Fedeltà',
    }
  },
  {
    path: 'business-discount/:businessId/:discountId',
    component: BusinessDiscountComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Premio',
    }
  },
  {
    path: 'business-social-posts/:businessId',
    component: BusinessSocialPostsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Post da gestire',
    }
  },
  {
    path: 'new-business-discount/:businessId/:origin',
    component: NewBusinessDiscountComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Nuovo Premio',
    }
  },
  {
    path: 'business-check/:businessId',
    component: BusinessCheckComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Convalida QR',
    }
  },
  {
    path: 'business-reviews/:businessId',
    component: BusinessReviewsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Commenti',
    }
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Impostazioni',
      
    }
  },
  {
    path: 'reservations/:businessId',
    component: ReservationsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Prenotazioni',
      type: 'name'
    }
  },
  {
    path: 'user-reservations',
    component: UserReservationsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Prenotazioni',
      type: 'name'
    }
  },
  {
    path: 'business-qr/:businessId',
    component: BusinessQrComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Azioni con QR'
    }
  },
  {
    path: 'incIntro/:intent',
    component: IncIntroComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Quale Locale?',
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Comeback',
      type: 'main'
    }
  },
  {
    path: 'signup',
    component: SignupComponent,
    data: {
      title: 'Comeback',
      type: 'main'
    }
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


// {
//   path: 'discount/:discountId/:businessName',
//   component: DiscountQrComponent,
//   canActivate: [AuthGuard],
//   data: {
//     title: 'Usa Premio',
//   }
// },
// {
//   path: 'fidelity/:businessId/:fidelityCardId/:businessName',
//   component: FidelityQrComponent,
//   canActivate: [AuthGuard],
//   data: {
//     title: 'Segna Carta',
//   }
// },