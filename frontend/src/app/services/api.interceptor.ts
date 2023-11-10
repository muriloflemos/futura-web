import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const accessToken = this.authService.getToken();

    if (accessToken) {
      const authReq = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + accessToken),
      });
      return next.handle(authReq).pipe(catchError((x) => this.handleError(x)));
    } else {
      return next.handle(request);
    }
  }

  private handleError(err: HttpErrorResponse): Observable<any> {
    if (err.status === 401) {
      this.router.navigate(['logout']);
    }

    return throwError(err.error);
  }
}
