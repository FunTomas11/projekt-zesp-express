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
export class DrinkButtonsComponent {
  @Input() drinkNames: string[] = [];
  @Output() drinkSelected = new EventEmitter<any>(); // EventEmitter to emit selected drink info
  @Output() userMessage = new EventEmitter<string>();

  constructor(private drinkService: DrinkService) {}

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
