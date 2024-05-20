import { Injectable } from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {noop, Observable, tap} from "rxjs";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private _token: string | null;
  private _apiUrl = 'http://localhost:3000';
  private _userUrl = `${this._apiUrl}/users`;

  get isUserLoggedIn(): boolean {
    return !!this._token;
  }

  set token(token: string) {
    sessionStorage.setItem('token', token);
    this._token = token;
  }

  constructor(private _http: HttpClient, private _router: Router ) {
    this._token = sessionStorage.getItem('token');
    if (this._token) {
      this._router.navigate(['/chat']).then(noop);
    }
  }

  loginUser(user: User): Observable<any> {
    return this._http.post<any>(`${this._userUrl}/login`, user)
      .pipe(
        tap(res => this.token = res.sessionId),
        tap(() => this._router.navigate(['/chat']).then(noop)),

      );
  }

  registerUser(user: User) {
    return this._http.post<any>(`${this._userUrl}/register`, user)
      .pipe(
        tap(res => this.token = res.sessionId),
        tap(() => this._router.navigate(['/chat']).then(noop))
        );
  }

  logout() {
    sessionStorage.removeItem('token');
    this._token = null;
    this._router.navigate(['/login']).then(noop);
  }

}
