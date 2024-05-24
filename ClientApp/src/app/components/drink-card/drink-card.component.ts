import {Component, Input} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {Drink} from "../../models/drink.model";
import {NgOptimizedImage} from "@angular/common";
import {MatListModule} from "@angular/material/list";

@Component({
  selector: 'app-drink-card',
  standalone: true,
  imports: [
    MatCardModule,
    NgOptimizedImage,
    MatListModule
  ],
  templateUrl: './drink-card.component.html',
  styleUrl: './drink-card.component.scss'
})
export class DrinkCardComponent {
  @Input({required: true}) drink!: Drink;

}
