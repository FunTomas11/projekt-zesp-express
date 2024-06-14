import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatDialogModule} from "@angular/material/dialog";
import { ChatComponent } from './components/chat/chat.component';
import { HttpClientModule } from '@angular/common/http';
import {MatButton} from "@angular/material/button";
import {LoginService} from "./services/login.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatDialogModule, ChatComponent, HttpClientModule, MatButton],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
/**
 * Główny komponent aplikacji AppComponent.
 *
 * Zawiera metodę sprawdzającą, czy użytkownik jest zalogowany,
 * oraz metodę wylogowującą użytkownika.
 */
export class AppComponent {

  /**
   * Sprawdza, czy użytkownik jest zalogowany, na podstawie stanu z serwisu LoginService.
   */
  get isUserLoggedIn(): boolean {
    return this._auth.isUserLoggedIn;
  }

  constructor(private _auth: LoginService) {}

  /**
   * Wylogowuje użytkownika, wywołując metodę logout z serwisu LoginService.
   */
  logout() {
    this._auth.logout();
  }
}
