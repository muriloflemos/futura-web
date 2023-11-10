import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceiroGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  private isAllowed(): boolean {
    return this.authService.isFinanceiroReceber() || this.authService.isAdmin();
  }

  async canActivate(): Promise<boolean> {
    const user = await this.authService.getUser();
    if (!user || !this.isAllowed()) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}
