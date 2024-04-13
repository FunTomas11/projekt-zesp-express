import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {LoginComponent} from "./components/login/login.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ClientApp';

  private _isLoggedIn = false; // TODO: Change after login implemented

  constructor(private _dialog: MatDialog) {
  }

  ngOnInit(): void {
    if (!this._isLoggedIn) {
      this._openLoginDialog();
    }
  }

  private _openLoginDialog() {
    this._dialog.open(LoginComponent, {
      width: '250px',
      data: {name: 'test'}
    });
  }
}
