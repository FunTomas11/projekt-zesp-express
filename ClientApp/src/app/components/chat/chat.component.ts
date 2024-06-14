import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ChatService } from './chat.service';
import { CdkScrollable } from "@angular/cdk/overlay";
import { Message, Role } from "../../models/message.model";
import { DrinkCardComponent } from "../drink-card/drink-card.component";
import { DrinkButtonsComponent } from '../drink-buttons/drink-buttons.component';
import { MarkdownComponent, provideMarkdown } from "ngx-markdown";
import { catchError } from "rxjs";
import { DrinkService } from '../../services/drink.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatCardModule,
    CdkScrollable,
    DrinkCardComponent,
    DrinkButtonsComponent,
    MarkdownComponent
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  providers: [ChatService, DrinkService, provideMarkdown()]
})
export class ChatComponent implements AfterViewChecked, OnInit {
  protected readonly Role = Role;
  messages: Message[] = [];
  loading: boolean = false;
  recommendedDrink: any = null;
  drinkNames: string[] = [];

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private readonly chatService: ChatService, private drinkService: DrinkService) {}

  /**
   * Funkcja ngAfterViewChecked jest metodą cyklu życia komponentu, która uruchamia się po każdym sprawdzeniu widoku przez Angular.
   * Automatycznie przewija zawartość scrollContainer na dół po każdej zmianie widoku.
   * Ignoruje wszelkie błędy związane z przewijaniem.
   */
  ngAfterViewChecked() {
    try {
      // Automatycznie przewija zawartość scrollContainer na dół po każdej zmianie widoku.
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }


  /**
   * Funkcja ngOnInit jest metodą inicjującą, która uruchamia się po załadowaniu komponentu.
   * Pobiera dostępne drinki z serwisu drinkService i zapisuje je do zmiennej drinkNames.
   * Obsługuje ewentualne błędy podczas pobierania danych.
   * Tworzy początkową wiadomość powitalną i dodaje ją do listy wiadomości.
   */
  ngOnInit() {
    // Pobiera dostępne drinki z serwisu drinkService i zapisuje je do zmiennej drinkNames.
    this.drinkService.getAvailableDrinks().subscribe(
      (response: any) => {
        this.drinkNames = response.response;
      },
      // Obsługuje błąd w przypadku problemów z pobieraniem nazw drinków.
      (error: any) => {
        console.error('Error fetching drink names:', error);
      }
    );

    // Tworzy początkową wiadomość powitalną i dodaje ją do listy wiadomości.
    const initialMessage: Message = {
      role: Role.Assistant,
      content: 'Welcome to the Mixology Chat! Ask me about any drink and I will provide you with recipes, ingredients, and recommendations.'
    };
    this.messages.push(initialMessage);
  }


  /**
   * Funkcja sendMessage wysyła wiadomość użytkownika do backendu poprzez serwis chatService,
   * a następnie obsługuje odpowiedź, dodając ją do listy wiadomości.
   * Jeśli odpowiedź zawiera informacje o drinku, dodaje dodatkową wiadomość z tymi informacjami.
   * Funkcja obsługuje również wskaźnik ładowania oraz błędy.
   *
   * @param {string} msg - Treść wiadomości wysyłanej przez użytkownika.
   * @param {string} [drink] - (Opcjonalnie) Informacje o drinku do wysłania.
   */
  sendMessage(msg: string, drink?: string) {
    // Jeśli wiadomość jest pusta, funkcja kończy działanie.
    if (!msg) return;

    // Dodaje wiadomość użytkownika do listy wiadomości.
    this.messages.push({ role: Role.User, content: msg });
    this.loading = true;

    // Wysyła wiadomość za pomocą chatService.
    this.chatService.sendMessage(msg, drink)
      .pipe(catchError((error: any) => {
        // W przypadku błędu, zatrzymuje wskaźnik ładowania i zwraca błąd.
        this.loading = false;
        return error;
      }))
      .subscribe((response: any): void => {
        // Dodaje odpowiedź asystenta do listy wiadomości.
        this.messages.push({ role: Role.Assistant, content: response.response.msg });
        if (response.response.json) {
          // Jeśli odpowiedź zawiera dane drinka, dodaje dodatkową wiadomość z informacjami o drinku.
          const drinkMessage: Message = {
            role: Role.Assistant,
            content: response.response.msg,
            drink: response.response.json
          };
          this.messages.push(drinkMessage);
        }
        // Wyłącza wskaźnik ładowania.
        this.loading = false;
      });
  }



  /**
   * Obsługuje wybór drinka przez użytkownika, dodaje wiadomość z informacjami
   * o drinku do listy wiadomości oraz aktualizuje historię drinków za pomocą
   * serwisu drinkService.
   *
   * @param {any} drink - Obiekt reprezentujący wybrany drink.
   */
  handleDrinkSelected(drink: any) {
    // Wyświetla w konsoli wybrany drink.
    console.log('Selected drink:', drink);

    // Tworzy wiadomość asystenta z informacjami o wybranym drinku i dodaje ją do listy wiadomości.
    const assistantMessage: Message = {
      role: Role.Assistant,
      content: `Here's the information for the drink ${drink.name}`,
      drink: drink
    };
    this.messages.push(assistantMessage);

    // Aktualizuje historię drinków za pomocą serwisu drinkService.
    this.drinkService.updateHistory(drink).subscribe(
      (response: any) => {
        // Wyświetla w konsoli informację o pomyślnym zaktualizowaniu historii.
        console.log('History updated successfully:', response);
      },
      (error: any) => {
        // Wyświetla w konsoli błąd, jeśli aktualizacja historii się nie powiedzie.
        console.error('Error updating history:', error);
      }
    );
  }



  /**
   * Funkcja addUserMessage dodaje wiadomość użytkownika do listy wiadomości.
   *
   * @param {string} userMsg - Treść wiadomości użytkownika.
   */
  addUserMessage(userMsg: string) {
    const userMessage: Message = {
      role: Role.User,
      content: userMsg
    };
    this.messages.push(userMessage);
  }


  /**
   * Funkcja trackByMessage służy do śledzenia wiadomości w ngFor w celu optymalizacji wydajności.
   * Zwraca unikalny identyfikator dla każdej wiadomości na podstawie jej roli i treści.
   *
   * @param {number} index - Indeks wiadomości w tablicy.
   * @param {Message} message - Obiekt wiadomości.
   * @returns {string} - Unikalny identyfikator wiadomości składający się z roli i treści wiadomości.
   */
  trackByMessage(index: number, message: Message): string {
    return message.role + message.content;
  }

}
