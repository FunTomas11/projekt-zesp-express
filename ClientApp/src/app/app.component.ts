import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatDialogModule} from "@angular/material/dialog";
import { ChatComponent } from './components/chat/chat.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatDialogModule, ChatComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // private _isLoggedIn = false; // TODO: Change after login implemented
}
