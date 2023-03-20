import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-business-days',
  templateUrl: './business-days.component.html',
  styleUrls: ['./business-days.component.scss']
})
export class BusinessDaysComponent implements OnInit {
  public currentDay!: any;
  public loading = false;
  public businessId!: number;
  public discountType: string|null = null;
  public businessDays$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public discountForm = this.fb.group({
    discountType: [null, Validators.required],
    discountAmount: [null, Validators.required],
    discountCount: [null, Validators.required],
    discountOnReservation: [true, Validators.required],
    slogan: [null],
    closed: [false]
  });

  constructor(private fb: FormBuilder, private apiService: ApiService, private activateRouter: ActivatedRoute) {
    this.activateRouter.params.subscribe(
      (params) => {
        this.businessId = +params['businessId'];
      }
    );
  }

  ngOnInit(): void {
    this.businessId && this.getBusinessDays();
  }

  public showDay(dayIdx: number) {
    const bDays = this.businessDays$.getValue();
    const dayFound = bDays.find(bD => bD.day == dayIdx) || {};
    
    if (dayFound.discount_amount || dayFound.slogan) {
      this.discountForm.reset();
      this.discountForm.setValue({
        discountType: dayFound.discount_type,
        discountAmount: dayFound.discount_amount,
        discountCount: dayFound.discount_count,
        discountOnReservation: dayFound.discount_on_reservation,
        slogan: dayFound.slogan,
        closed: dayFound.closed,
      });
    }
    this.discountType = (dayFound.slogan && !dayFound.discount_amount) ? 'free' : 'discount';
    dayFound.name = this.getDayName(dayIdx);
    dayFound.dayIdx = dayIdx;
    this.currentDay = dayFound;
  }

  public saveBusinessDay() {
    this.currentDay.id ? this.updateBusinessDay() : this.createBusinessDay();
  }

  public updateBusinessDay() {
    this.loading = true;
    const formValue = this.discountForm.getRawValue();
    formValue.slogan = this.discountType == 'discount' ? null : formValue.slogan;
    formValue.discountAmount = this.discountType == 'free' ? 0 : formValue.discountAmount;
    this.apiService.updateBusinessDay(this.currentDay.id, formValue)
      .then(() => alert('Fatto'))
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public getBusinessDays() {
    this.loading = true;
    this.apiService.getBusinessDays(this.businessId)
      .then((businessDays: any[]) => this.businessDays$.next(businessDays))
      .catch((e: any) => console.error(e))
      .finally(() => this.loading = false);
  }

  public createBusinessDay() {
    
  }

  public onTypeChange(event: any) {
    const discount = this.currentDay;

    if (event.target.value === 'discount') {
      this.discountType = 'discount';
      this.discountForm.setValue({
        discountType: discount.discount_type,
        discountAmount: discount.discount_amount,
        discountCount: discount.discount_count,
        discountOnReservation: discount.discount_on_reservation,
        slogan: discount.slogan,
        closed: discount.closed,
      });
    }
    if (event.target.value === 'free') {
      this.discountType = 'free';
      this.discountForm.setValue({
        discountType: discount.discount_type,
        discountAmount: 0,
        discountCount: discount.discount_count,
        discountOnReservation: discount.discount_on_reservation,
        slogan: discount.slogan,
        closed: discount.closed,
      });
    }
  }

  private getDayName(dayIdx: number) {
    let name = '';
    switch(dayIdx) {
      case 1: name = 'Lunedi'; break;
      case 2: name = 'Martedi'; break;
      case 3: name = 'Mercoledi'; break;
      case 4: name = 'Giovedi'; break;
      case 5: name = 'Venerdi'; break;
      case 6: name = 'Sabato'; break;
      case 0: name = 'Domenica'; break;
      default: name = 'Domenica'; break;
    }
    return name;
  }

}
