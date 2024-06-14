import {Routes} from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {ChatComponent} from './components/chat/chat.component';
import {AuthGuard} from "./guards/auth.guard";

/**
 * Konfiguracja tras dla aplikacji.
 *
 * @property {Array} routes - Lista obiektów konfigurujących trasy aplikacji.
 */
export const routes: Routes = [
  { path: 'login', component: LoginComponent }, // Trasa dla komponentu logowania.
  { path: '', redirectTo: 'chat', pathMatch: 'full' }, // Domyślna trasa przekierowująca do komponentu czatu.
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] } // Trasa dla komponentu czatu z ochroną AuthGuard.
];
