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
export class AppComponent {

  get isUserLoggedIn(): boolean {
    return this._auth.isUserLoggedIn;
  }
  constructor(private _auth: LoginService) {
  }

  logout() {
    this._auth.logout();
  }
}
