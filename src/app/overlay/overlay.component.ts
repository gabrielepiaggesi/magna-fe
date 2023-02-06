import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {
  @Output() close = new EventEmitter();
  @Input() showCross = true;
  @Input() absoluteMode = false;

  constructor() {
    (window as any).addEventListener('closeOverlay', (e: any) => {
      console.log('closing overlay');
      this.close.emit();
    }, false);
  }

  ngOnInit(): void {
  }

}
