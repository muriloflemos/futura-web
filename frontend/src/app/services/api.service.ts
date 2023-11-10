import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
  }

  public get<T>(path: string, params: any = {}): Observable<T> {
    return this.http.get<T>(this.baseUrl + path, { params });
  }

  public post<T>(path: string, body: any = {}): Observable<T> {
    return this.http.post<T>(this.baseUrl + path, body);
  }

  public put<T>(path: string, body: any = {}): Observable<T> {
    return this.http.put<T>(this.baseUrl + path, body);
  }

  public delete<T>(path: string, params: any = {}): Observable<T> {
    return this.http.delete<T>(this.baseUrl + path, { params });
  }
}
