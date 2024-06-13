import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from "@angular/material/card";
import { Drink } from "../../models/drink.model";
import { NgOptimizedImage } from "@angular/common";
import { MatListModule } from "@angular/material/list";

@Component({
  selector: 'app-drink-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    NgOptimizedImage,
    MatListModule
  ],
  templateUrl: './drink-card.component.html',
  styleUrls: ['./drink-card.component.scss']
})
export class DrinkCardComponent {
  @Input({ required: true }) drink!: Drink;

   ngOnChanges(changes: SimpleChanges) {
    if (changes['drink']) {
      console.log('Drink input changed:', changes['drink'].currentValue);
    }
  }
}
