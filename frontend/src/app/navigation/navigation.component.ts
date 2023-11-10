import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  isAdmin = false;
  isEstoque = false;
  isFinanceiroReceber = false;
  isFinanceiroPagar = false;

  constructor(private authService: AuthService) {
    this.isAdmin = this.authService.isAdmin();
    this.isEstoque = this.authService.isEstoque();
    this.isFinanceiroReceber = this.authService.isFinanceiroReceber();
    this.isFinanceiroPagar = this.authService.isFinanceiroPagar();
  }

}
