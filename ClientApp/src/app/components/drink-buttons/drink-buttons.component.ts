import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { DrinkService } from '../../services/drink.service'; // Ensure this import is here
import { ChatService } from '../../components/chat/chat.service'; // Ensure this import is here
import { Message, Role } from '../../models/message.model';

@Component({
  selector: 'app-drink-buttons',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './drink-buttons.component.html',
  styleUrls: ['./drink-buttons.component.scss']
})
/**
 * Komponent DrinkButtonsComponent, który wyświetla listę przycisków z nazwami drinków
 * i obsługuje kliknięcia na te przyciski.
 */
export class DrinkButtonsComponent {
  @Input() drinkNames: string[] = []; // Lista nazw drinków przekazana do komponentu
  @Output() drinkSelected = new EventEmitter<any>(); // EventEmitter do emisji informacji o wybranym drinku
  @Output() userMessage = new EventEmitter<string>(); // EventEmitter do emisji wiadomości użytkownika

  constructor(private drinkService: DrinkService) {}

  /**
   * Metoda uruchamiana po kliknięciu na nazwę drinka.
   * Wyświetla w konsoli kliknięty drink, emituje wiadomość użytkownika,
   * pobiera informacje o drinku z serwisu drinkService i emituje te informacje.
   *
   * @param {string} drink - Nazwa klikniętego drinka.
   */
  onDrinkClick(drink: string): void {
    console.log(`Drink clicked: ${drink}`);
    this.userMessage.emit(`Tell me more about ${drink}`);
    this.drinkService.getDrinkInfo(drink).subscribe(
      (response) => {
        const drinkInfo = response.response;
        this.drinkSelected.emit(drinkInfo); // Emit the drink information
      },
      (error) => {
        console.error('Error fetching drink info:', error);
      }
    );
  }
}

