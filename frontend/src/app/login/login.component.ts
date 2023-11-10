import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthService, AuthToken } from '../services/auth.service';
import { AlertService } from '../services/alert/alert.service';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  hidePassword = true;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private localStorageService: LocalStorageService,
  ) {}

  ngOnInit(): void {}

  login(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;
    const { username, password } = this.form.value;
    this.authService.login(username, password).subscribe((result: AuthToken) => {
      this.localStorageService.clear();
      this.authService.registerToken(result.access_token);
      this.router.navigate(['']);
    }, () => {
      this.loading = false;
      this.alertService.showError(
        'Não foi possível fazer o login!',
        'Verifique os dados de acesso e tente novamente.'
      );
    });
  }

  isFormValid(): boolean {
    return this.form.valid && !this.form.errors;
  }
}
