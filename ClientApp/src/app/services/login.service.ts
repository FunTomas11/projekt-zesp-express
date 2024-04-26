import { Injectable } from '@angular/core';
import {User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private _apiUrl = 'http://localhost:3000';
  private _userUrl = `${this._apiUrl}/users`;

  constructor(private _http: HttpClient) { }

  registerUser(user: User) {
    return this._http.post<any>(`${this._userUrl}/register`, user);
  }

}
