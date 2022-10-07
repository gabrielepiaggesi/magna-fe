import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-reservation-preview',
  templateUrl: './reservation-preview.component.html',
  styleUrls: ['./reservation-preview.component.scss']
})
export class ReservationPreviewComponent implements OnInit {
  @Input() reservation: any;
  @Input() showDescription = false;
  @Input() showBadge = true;
  @Input() isUser = false;
  public today = new Date(Date.now());

  constructor() { }

  ngOnInit(): void {
  }

  getDate(date: string) {
    const userDate = new Date(date);

    const userDateISO = userDate.toDateString().substring(0, 10);
    const todayISO = this.today.toDateString().substring(0, 10);

    if (userDateISO == todayISO) {
      const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit'};
      return 'Oggi, ' + userDate.toLocaleString('it-IT', options);
    }

    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'};
    return userDate.toLocaleString('it-IT', options);
  }

}
