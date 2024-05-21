import {
  ActivatedRouteSnapshot, CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import {LoginService} from "../services/login.service";
import {noop} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(private _auth: LoginService, private _router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this._auth.isUserLoggedIn) {
      return true;
    } else {
      this._router.navigate(['/login']).then(noop);
      return false;
    }
  }
}
