import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { cloneDeep } from 'lodash';

import { Usuario } from '../interfaces/usuario';
import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { TipoEstoque } from '../enums/tipo-estoque.enum';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private usuariosSubject = new BehaviorSubject<Usuario[]>([]);
  usuarios$ = this.usuariosSubject.asObservable();

  constructor(private apiService: ApiService) {}

  find(nome: string, tipo: TipoUsuario[]): void {
    this.apiService
      .get<Usuario[]>('users', { nome, tipo })
      .subscribe((usuarios: Usuario[]) => {
        this.usuariosSubject.next(usuarios);
      });
  }

  findById(id: number): Observable<Usuario> {
    return this.apiService.get<Usuario>(`users/${id}`);
  }

  create(
    login: string,
    nome: string,
    senha: string,
    tipo: TipoUsuario,
    id_empresa?: number[],
    tipo_estoque?: TipoEstoque,
  ): Observable<Usuario> {
    const body = { login, nome, senha, tipo, id_empresa, tipo_estoque };
    return this.apiService.post<Usuario>('users', body);
  }

  update(
    id: number,
    nome: string,
    login: string,
    tipo: TipoUsuario,
    id_empresa?: number[],
    tipo_estoque?: TipoEstoque,
  ): Observable<Usuario> {
    const body = { nome, login, tipo, id_empresa, tipo_estoque };
    return this.apiService.put<Usuario>(`users/${id}`, body);
  }

  delete(id: number): Observable<Usuario> {
    return this.apiService.delete<Usuario>(`users/${id}`);
  }

  userDeleted(usuario: Usuario): void {
    const usuarios = cloneDeep(this.usuariosSubject.value);
    const index = usuarios.findIndex((u) => u.id == usuario.id);
    if (index >= 0) {
      usuarios.splice(index, 1);
      this.usuariosSubject.next(usuarios);
    }
  }

  resetSenha(id: number, senha: string): Observable<Usuario> {
    const body = { senha };
    return this.apiService.put<Usuario>(`users/${id}/reset/password`, body);
  }
}
