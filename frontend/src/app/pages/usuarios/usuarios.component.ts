import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../interfaces/usuario';
import { PesquisaUsuarioComponent } from './pesquisa-usuario/pesquisa-usuario.component';
import { AlertService } from '../../services/alert/alert.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'tipo', 'acoes'];
  dataSource: Observable<Usuario[]>;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    public dialog: MatDialog,
    private alertService: AlertService
  ) {
    this.dataSource = this.usuarioService.usuarios$;
  }

  ngOnInit(): void {
    this.usuarioService.find('', []);
  }

  novo(): void {
    this.router.navigate(['usuario']);
  }

  pesquisa(): void {
    const dialogRef = this.dialog.open(PesquisaUsuarioComponent, {
      width: '500px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usuarioService.find(result?.nome, result?.tipo);
      }
    });
  }

  edit(usuario: Usuario): void {
    this.router.navigate(['usuario', usuario.id]);
  }

  resetSenha(usuario: Usuario): void {
    this.router.navigate(['usuario', usuario.id, 'reset-senha']);
  }

  delete(usuario: Usuario): void {
    this.alertService.showYesNo('Confirma a exclusão do usuário?', '').then((result) => {
      if (result) {
        this.usuarioService.delete(usuario.id).subscribe((usuario) => {
          this.usuarioService.userDeleted(usuario);
        }, ((error) => {
          const title = 'Ocorreu um erro ao excluir o usuário';

          if (error.message instanceof Array) {
            this.alertService.showErrors(title, error.message);
          } else {
            this.alertService.showError(title, error.message);
          }
        }));
      }
    });
  }
}
