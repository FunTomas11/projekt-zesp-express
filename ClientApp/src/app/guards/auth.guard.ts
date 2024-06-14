import {
  ActivatedRouteSnapshot, CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import {LoginService} from "../services/login.service";
import {noop} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
/**
 * Klasa AuthGuard, która implementuje interfejs CanActivate,
 * służy do ochrony tras w aplikacji Angular przed nieautoryzowanym dostępem.
 */
export class AuthGuard implements CanActivate {

  constructor(private _auth: LoginService, private _router: Router) {}

  /**
   * Metoda canActivate sprawdza, czy użytkownik jest zalogowany.
   * Jeśli użytkownik jest zalogowany, zwraca true, umożliwiając dostęp do chronionej trasy.
   * Jeśli użytkownik nie jest zalogowany, przekierowuje go na stronę logowania i zwraca false.
   *
   * @param {ActivatedRouteSnapshot} route - Informacje o aktualnie aktywowanej trasie.
   * @param {RouterStateSnapshot} state - Stan routera w momencie aktywacji trasy.
   * @returns {boolean} - Czy użytkownik może aktywować trasę.
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this._auth.isUserLoggedIn) {
      return true;
    } else {
      this._router.navigate(['/login']).then(noop);
      return false;
    }
  }
}

