import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-logout',
  template: '<div class="container"><mat-spinner></mat-spinner></div>',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.logout();
    setTimeout(() => {
      this.router.navigate(['']);
    }, 1000);
  }

}
