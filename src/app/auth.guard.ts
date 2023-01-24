import { Injectable } from '@angular/core';
import { ActivatedRoute, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public router: Router, public route: ActivatedRoute, public appService: AppService) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {

    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('MagnaToken');
      const can = !!token;
      if (can) resolve(true);

      if (!can) {
        this.router.navigate(['/signup']);
        resolve(false);
      }
    });
  }
  
}
