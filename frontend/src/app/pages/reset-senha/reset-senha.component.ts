import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  Validators,
} from '@angular/forms';

import { TipoUsuario } from '../../enums/tipo-usuario.enum';
import { UsuarioService } from '../../services/usuario.service';
import { AlertService } from '../../services/alert/alert.service';
import { PasswordValidation } from '../../validation/password.validator';

@Component({
  selector: 'app-reset-senha',
  templateUrl: './reset-senha.component.html',
  styleUrls: ['./reset-senha.component.css']
})
export class ResetSenhaComponent implements OnInit {
  tipos: string[] = [
    TipoUsuario.Administrador,
    TipoUsuario.Faturista,
    TipoUsuario.Estoquista,
  ];

  form = this.formBuilder.group({
    senha: ['', Validators.required],
    confirmarSenha: ['', Validators.required],
  });

  hidePassword = true;
  hideConfirmPassword = true;

  private userId: number = -1;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.form.setValidators([
      PasswordValidation.match('senha', 'confirmarSenha'),
    ]);

    this.route.params.subscribe((params) => {
      this.userId = +params?.id;
    });
  }

  cancelar(): void {
    this.router.navigate(['usuarios']);
  }

  salvar(): void {
    const { senha } = this.form.value;

    this.usuarioService.resetSenha(this.userId, senha).subscribe(() => {
      this.router.navigate(['usuarios']);
    }, ((error) => {
      const title = 'Ocorreu um erro ao mudar a senha do usuário';

      if (error.message instanceof Array) {
        this.alertService.showErrors(title, error.message);
      } else {
        this.alertService.showError(title, error.message);
      }
    }));
  }
}
