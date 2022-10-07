import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FidelityQrComponent } from './fidelity-qr/fidelity-qr.component';
import { DiscountQrComponent } from './discount-qr/discount-qr.component';
import { IncIntroComponent } from './inc-intro/inc-intro.component';
import { IgPostComponent } from './ig-post/ig-post.component';
import { DiscountPreviewComponent } from './discount-preview/discount-preview.component';
import { FidelityPreviewComponent } from './fidelity-preview/fidelity-preview.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusinessesListComponent } from './businesses-list/businesses-list.component';
import { NewBusinessComponent } from './new-business/new-business.component';
import { BusinessComponent } from './business/business.component';
import { BusinessDiscountsComponent } from './business-discounts/business-discounts.component';
import { BusinessCardsComponent } from './business-cards/business-cards.component';
import { BusinessSocialPostsComponent } from './business-social-posts/business-social-posts.component';
import { BusinessReviewsComponent } from './business-reviews/business-reviews.component';
import { NewBusinessDiscountComponent } from './new-business-discount/new-business-discount.component';
import { BusinessDiscountComponent } from './business-discount/business-discount.component';
import { BusinessCheckComponent } from './business-check/business-check.component';
import { QRCodeModule } from 'angularx-qrcode';
import { SettingsComponent } from './settings/settings.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ReservationPreviewComponent } from './reservation-preview/reservation-preview.component';
import { BusinessQrComponent } from './business-qr/business-qr.component';
import { ReservationComponent } from './reservation/reservation.component';
import { OverlayComponent } from './overlay/overlay.component';
import { UserReservationsComponent } from './user-reservations/user-reservations.component';
import { RedeemComponent } from './redeem/redeem.component';
import { BusinessEmployeesComponent } from './business-employees/business-employees.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FidelityQrComponent,
    DiscountQrComponent,
    IncIntroComponent,
    IgPostComponent,
    DiscountPreviewComponent,
    FidelityPreviewComponent,
    HeaderComponent,
    LoginComponent,
    SignupComponent,
    BusinessesListComponent,
    NewBusinessComponent,
    BusinessComponent,
    BusinessDiscountsComponent,
    BusinessCardsComponent,
    BusinessSocialPostsComponent,
    BusinessReviewsComponent,
    NewBusinessDiscountComponent,
    BusinessDiscountComponent,
    BusinessCheckComponent,
    SettingsComponent,
    ReservationsComponent,
    ReservationPreviewComponent,
    BusinessQrComponent,
    ReservationComponent,
    OverlayComponent,
    UserReservationsComponent,
    RedeemComponent,
    BusinessEmployeesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    QRCodeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
