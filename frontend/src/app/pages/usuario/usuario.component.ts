import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';

import { Usuario } from '../../interfaces/usuario';
import { TipoUsuario } from '../../enums/tipo-usuario.enum';
import { UsuarioService } from '../../services/usuario.service';
import { EmpresaService } from '../../services/empresa.service';
import { AlertService } from '../../services/alert/alert.service';
import { PasswordValidation } from '../../validation/password.validator';
import { Empresa } from '../../interfaces/empresa';
import { Option } from '../../interfaces/option';
import { TipoEstoque } from '../../enums/tipo-estoque.enum';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
})
export class UsuarioComponent implements OnInit {
  tipos: Option[] = [
    { key: TipoUsuario.Administrador, label: 'ADMINISTRADOR' },
    { key: TipoUsuario.Faturista, label: 'FATURISTA' },
    { key: TipoUsuario.Estoquista, label: 'ESTOQUISTA' },
    { key: TipoUsuario.AnalistaCredito, label: 'ANALISTA DE CRÉDITO' },
    { key: TipoUsuario.ContasReceber, label: 'CONTAS A RECEBER' },
    { key: TipoUsuario.ContasPagar, label: 'CONTAS A PAGAR' },
  ];

  tiposEstoque: { id: number, label: string }[] = [
    {
      id: TipoEstoque.TODOS,
      label: 'Todos/Geral'
    },
    {
      id: TipoEstoque.MATRIZ,
      label: 'Matriz'
    },
    {
      id: TipoEstoque.HF,
      label: 'HF'
    },
  ];

  form = this.formBuilder.group({
    nome: ['', Validators.required],
    login: ['', Validators.required],
    tipo: ['', Validators.required],
    senha: [''],
    confirmarSenha: [''],
    id_empresa: [0],
    tipo_estoque: [0],
  });

  hidePassword = true;
  hideConfirmPassword = true;
  editing = false;
  isAdmin = false;
  isEstoque = false;
  isContasReceber = false;
  isContasPagar = false;

  private userId: number = -1;
  empresas: Observable<Empresa[]>;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private empresaService: EmpresaService,
    private alertService: AlertService,
  ) {
    this.empresas = this.empresaService.empresas$;
  }

  ngOnInit(): void {
    this.form.setValidators([
      PasswordValidation.match('senha', 'confirmarSenha'),
    ]);
    this.empresaService.find();

    this.form.get('tipo')?.valueChanges.subscribe((value) => {
      this.isAdmin = value == TipoUsuario.Administrador;
      this.isEstoque = [TipoUsuario.Faturista, TipoUsuario.Estoquista].includes(value);
      this.isContasReceber = [TipoUsuario.AnalistaCredito, TipoUsuario.ContasReceber].includes(value);
      this.isContasPagar = [TipoUsuario.ContasPagar].includes(value);
    });

    this.route.params.subscribe((params) => {
      this.userId = +params?.id;

      if (this.userId > 0) {
        this.editing = true;

        this.usuarioService
          .findById(this.userId)
          .subscribe((usuario: Usuario | null) => {
            if (usuario) {
              this.isAdmin = usuario.tipo == TipoUsuario.Administrador;
              this.isEstoque = [TipoUsuario.Faturista, TipoUsuario.Estoquista].includes(usuario.tipo);
              this.isContasReceber = [TipoUsuario.AnalistaCredito, TipoUsuario.ContasReceber].includes(usuario.tipo);
              this.isContasPagar = [TipoUsuario.ContasPagar].includes(usuario.tipo);
              const idEmpresa = usuario.Empresa?.map((value) => value.id_empresa);
              this.form.patchValue({
                nome: usuario.nome,
                login: usuario.login,
                tipo: usuario.tipo,
                id_empresa: idEmpresa,
                tipo_estoque: usuario.tipo_estoque || 0,
              });
            }
          });
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['usuarios']);
  }

  salvar(): void {
    if (!this.form.valid) {
      return;
    }

    const { nome, login, tipo, senha, id_empresa, tipo_estoque } = this.form.value;

    if (this.editing) {
      this.usuarioService
        .update(this.userId, nome, login, tipo, id_empresa, tipo_estoque)
        .subscribe(
          (usuario) => {
            this.router.navigate(['usuarios']);
          },
          (error) => {
            const title = 'Ocorreu um erro ao salvar o usuário';

            if (error.message instanceof Array) {
              this.alertService.showErrors(title, error.message);
            } else {
              this.alertService.showError(title, error.message);
            }
          }
        );
    } else {
      this.usuarioService.create(login, nome, senha, tipo, id_empresa, tipo_estoque).subscribe((usuario) => {
        this.router.navigate(['usuarios']);
      }, ((error) => {
        const title = 'Ocorreu um erro ao salvar o usuário';

        if (error.message instanceof Array) {
          this.alertService.showErrors(title, error.message);
        } else {
          this.alertService.showError(title, error.message);
        }
      }));
    }
  }
}
