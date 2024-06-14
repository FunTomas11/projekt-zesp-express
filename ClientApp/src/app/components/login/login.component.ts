import {Component} from '@angular/core';
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {LoginService} from "../../services/login.service";
import {User} from "../../models/user.model";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
/**
 * Komponent LoginComponent odpowiedzialny za obsługę logowania i rejestracji użytkowników.
 */
export class LoginComponent {

  // Formularz logowania z polami użytkownika i hasła, oba pola są wymagane.
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  // Formularz rejestracji z polami użytkownika i hasła, oba pola są wymagane.
  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor(private _backend: LoginService) {}

  /**
   * Metoda logowania użytkownika. Sprawdza, czy wszystkie pola formularza logowania są wypełnione.
   * Jeśli nie, wyświetla komunikat błędu. Jeśli tak, wysyła dane użytkownika do serwisu backendowego.
   */
  login() {
    if (!this.loginForm.value.username ||
      !this.loginForm.value.password ||
      this.loginForm.value.username === '' ||
      this.loginForm.value.password === '') {
      console.error('Please fill in all fields', this.loginForm.value);
      return;
    }
    const user: User = {username: this.loginForm.value.username, password: this.loginForm.value.password};

    this._backend.loginUser(user).subscribe((res) => {
      console.log('Co backend ma na myśli', res);
    });
  }

  /**
   * Metoda rejestracji użytkownika. Sprawdza, czy wszystkie pola formularza rejestracji są wypełnione.
   * Jeśli nie, wyświetla komunikat błędu. Jeśli tak, wysyła dane użytkownika do serwisu backendowego.
   */
  register() {
    if (!this.registerForm.value.username ||
      !this.registerForm.value.password ||
      this.registerForm.value.username === '' ||
      this.registerForm.value.password === '') {
      console.error('Please fill in all fields', this.registerForm.value);
      return;
    }
    const user: User = {username: this.registerForm.value.username, password: this.registerForm.value.password};

    this._backend.registerUser(user).subscribe();
  }
}

