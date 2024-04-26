import { Injectable } from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private _apiUrl = 'http://localhost:3000';
  private _userUrl = `${this._apiUrl}/users`;

  constructor(private _http: HttpClient) { }

  loginUser(user: User): Observable<any> {
    return this._http.post<any>(`${this._userUrl}/login`, user);
  }

  registerUser(user: User) {
    return this._http.post<any>(`${this._userUrl}/register`, user);
  }

}
