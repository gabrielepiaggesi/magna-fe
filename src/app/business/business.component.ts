import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss'],
})
export class BusinessComponent implements OnInit {
  public loading = false;
  public editMode = false;
  public sendNot = false;
  public businessId!: number;
  public business$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public editBusinessForm = this.fb.group({
    name: [null, Validators.required],
    address: [null, Validators.required],
    phoneNumber: [null, Validators.required],
    secondPhoneNumber: [null],
    acceptReservations: [false, Validators.required],
    disableReservationToday: [false, Validators.required],
    cap: [null],
    description: [null],
    cardDescription: [null],
    website: [null],
    menuLink: [null],
    instagramPage: [null],
    discountOnFirstReview: [false, Validators.required],
    discountOnFirstReservation: [false, Validators.required],
  });
  public notForm = this.fb.group({
    title: [null, Validators.required],
    msg: [null],
  });

  constructor(
    private router: Router,
    private activateRouter: ActivatedRoute,
    private apiService: ApiService,
    public appService: AppService,
    private fb: FormBuilder
  ) {
    this.activateRouter.params.subscribe(
      (params) => {
        this.businessId = +params['businessId'];
        this.appService.businessId$.next(this.businessId);
      }
    );
  }

  ngOnInit(): void {
    // this.appService.headerData.next({ title: 'Caricamento...'});
    this.businessId && this.getBusiness();
  }

  goToInsight() {
    const business = this.business$.getValue();
    business.can_see_insight && window.open(`https://comebackwebapp.web.app/business-insight/${this.businessId}/?token=${this.apiService.TOKEN}`, '_system');
    if (!business.can_see_insight) alert('Funzione ancora non abilitata');
  }

  go(path: string) {
    this.appService.headerData.next(undefined);
    this.router.navigateByUrl(path);
  }

  public isDateBeforeToday(date: string) {
    const yesterday = new Date(date.toString().replace(' ', 'T'));
    const today = new Date(Date.now());
    const isInThePast = yesterday.getTime() < today.getTime();
    return isInThePast;
  }

  public getBusiness() {
    this.loading = true;
    this.apiService
      .getUserBusiness(this.businessId)
      .then((business: any) => {
        this.appService.headerData.next({ title: business.name });
        this.business$.next(business);
        this.editBusinessForm.get('name')?.setValue(business.name || null);
        this.editBusinessForm.get('address')?.setValue(business.address || null);
        this.editBusinessForm.get('phoneNumber')?.setValue(business.phone_number || null);
        this.editBusinessForm.get('secondPhoneNumber')?.setValue(business.second_phone_number || null);
        this.editBusinessForm.get('cap')?.setValue(business.cap || null);
        this.editBusinessForm.get('description')?.setValue(business.description || null);
        this.editBusinessForm.get('cardDescription')?.setValue(business.card_description || null);
        this.editBusinessForm.get('website')?.setValue(business.website || null);
        this.editBusinessForm.get('menuLink')?.setValue(business.menu_link || null);
        this.editBusinessForm.get('instagramPage')?.setValue(business.instagram_page || null);
        this.editBusinessForm.get('acceptReservations')?.setValue(Boolean(business.accept_reservations));
        this.editBusinessForm.get('discountOnFirstReview')?.setValue(Boolean(business.discount_on_first_review));
        this.editBusinessForm.get('discountOnFirstReservation')?.setValue(Boolean(business.discount_on_first_reservation));
        if (business.disable_reservation_today) {
          const isTodayDisabled = !this.isDateBeforeToday(business.disable_reservation_today);
          console.log(business, isTodayDisabled);
          
          this.editBusinessForm.get('disableReservationToday')?.setValue(Boolean(isTodayDisabled));
        }
      })
      .catch((e: any) => console.error(e))
      .finally(() => (this.loading = false));
  }

  public editBusiness() {
    this.loading = true;
    const formValue = this.editBusinessForm.getRawValue();
    const body = {
      ...formValue,
      acceptReservations: formValue.acceptReservations ? 1 : 0,
      disableReservationToday: formValue.disableReservationToday ? 1 : 0,
      discountOnFirstReview: formValue.discountOnFirstReview ? 1 : 0,
      discountOnFirstReservation: formValue.discountOnFirstReservation ? 1 : 0,
    };
    this.apiService.updateBusiness(body, this.businessId)
      .then((business: any) => {
        this.appService.headerData.next({ title: business.name });
        this.editMode = false;
      })
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public sendNotification() {
    this.loading = true;
    const formValue = this.notForm.getRawValue();
    const body = {
      ...formValue,
    };
    this.apiService.sendNotificationToClients(body, this.businessId)
      .then((business: any) => {
        this.sendNot = false;
        alert('Fatto! Notifica mandata ai tuoi clienti.')
      })
      .catch((e: any) => alert('Errore!'))
      .finally(() => this.loading = false);
  }

  public editMenu() {
    window.open(`https://comebackwebapp.web.app/menu-list/${this.businessId}/?token=${this.apiService.TOKEN}`, '_system');
  }
}
