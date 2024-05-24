import { Injectable } from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {catchError, noop, Observable, tap} from "rxjs";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

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

  constructor(private _http: HttpClient, private _router: Router, private _snack: MatSnackBar ) {
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
        tap(() => this._snack.open('Logged in', 'OK', {duration: 2000})),
        catchError(err => {
          this._snack.open('Unable to login: ' + err.error.error, 'OK', {duration: 2000});
          throw err;
        })
      );
  }

  registerUser(user: User) {
    return this._http.post<any>(`${this._userUrl}/register`, user)
      .pipe(
        tap(res => this.token = res.sessionId),
        tap(() => this._router.navigate(['/chat']).then(noop)),
        tap(() => this._snack.open('Registered and logged in', 'OK', {duration: 2000})),
        catchError(err => {
          this._snack.open('Unable to register: ' + err.error.error, 'OK', {duration: 2000});
          throw err;
        })
        );
  }

  logout() {
    sessionStorage.removeItem('token');
    this._token = null;
    this._router.navigate(['/login']).then(noop);
    this._snack.open('Logged out', 'OK', {duration: 2000});
  }

}
