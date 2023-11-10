import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  async canActivate(): Promise<boolean> {
    const user = await this.authService.getUser();
    if (!user || !this.authService.isAdmin()) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}
