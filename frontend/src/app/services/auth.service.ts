import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { Usuario } from '../interfaces/usuario';
import { ApiService } from './api.service';

export type AuthToken = {
  access_token: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storage: Storage;
  private _user: Usuario | null = null;

  constructor(private apiService: ApiService) {
    this.storage = window.localStorage;
  }

  registerToken(token: string): void {
    this.storage.setItem('token', token);
  }

  unregisterToken(): void {
    this.storage.clear();
  }

  getToken(): string | null {
    return this.storage.getItem('token');
  }

  isAuthorized(): boolean {
    return this.storage.getItem('token') != null;
  }

  login(login: string, senha: string): Observable<AuthToken> {
    const body = {
      username: login,
      password: senha,
    };
    return this.apiService.post('auth/login', body);
  }

  logout(): void {
    this.unregisterToken();
    this._user = null;
  }

  profile(): Observable<Usuario> {
    return this.apiService.get<Usuario>('auth/profile');
  }

  getUser(): Promise<Usuario | null> {
    return new Promise((resolve) => {
      if (this._user) {
        resolve(this._user);
      } else {
        this.profile().subscribe((usuario) => {
          this._user = usuario;
          resolve(this._user);
        }, () => {
          resolve(null);
        })
      }
    });
  }

  isAdmin(): boolean {
    return this._user ? this._user.tipo == TipoUsuario.Administrador : false;
  }

  isEstoque(): boolean {
    if (!this._user) return false;
    return [TipoUsuario.Estoquista, TipoUsuario.Faturista].includes(this._user.tipo);
  }

  isFinanceiroReceber(): boolean {
    if (!this._user) return false;
    return [TipoUsuario.ContasReceber, TipoUsuario.AnalistaCredito].includes(this._user.tipo);
  }

  isFinanceiroPagar(): boolean {
    if (!this._user) return false;
    return [TipoUsuario.ContasPagar].includes(this._user.tipo);
  }

  isAnalistaCredito(): boolean {
    if (!this._user) return false;
    return this._user.tipo == TipoUsuario.AnalistaCredito;
  }

  isContasReceber(): boolean {
    if (!this._user) return false;
    return this._user.tipo == TipoUsuario.ContasReceber;
  }
}
