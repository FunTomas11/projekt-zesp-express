import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
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
export class ChatComponent implements AfterViewChecked {
  protected readonly Role = Role;
  messages: Message[] = [];
  loading: boolean = false;
  recommendedDrink: any = null;
  drinkNames: string[] = [];

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private readonly chatService: ChatService, private drinkService: DrinkService) {}

  ngAfterViewChecked() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  ngOnInit() {
    this.drinkService.getAvailableDrinks().subscribe(
      (response: any) => {
        this.drinkNames = response.response;
      },
      (error: any) => {
        console.error('Error fetching drink names:', error);
      }
    );

    const initialMessage: Message = {
      role: Role.Assistant,
      content: 'Welcome to the Mixology Chat! Ask me about any drink and I will provide you with recipes, ingredients, and recommendations.'
    };
    this.messages.push(initialMessage);
  }

  sendMessage(msg: string, drink?: string) {
    if (!msg) return;

    this.messages.push({ role: Role.User, content: msg });
    this.loading = true;

    this.chatService.sendMessage(msg, drink)
      .pipe(catchError((error: any) => {
        this.loading = false;
        return error;
      }))
      .subscribe((response: any): void => {
        this.messages.push({ role: Role.Assistant, content: response.response.msg });
        if (response.response.json) {
          const drinkMessage: Message = {
            role: Role.Assistant,
            content: response.response.msg,
            drink: response.response.json
          };
          this.messages.push(drinkMessage);
        }
        this.loading = false;
      });
  }

  handleDrinkSelected(drink: any) {
    console.log('Selected drink:', drink);
    const assistantMessage: Message = {
      role: Role.Assistant,
      content: `Here's the information for the drink ${drink.name}`,
      drink: drink
    };
    this.messages.push(assistantMessage);
    this.drinkService.updateHistory(drink).subscribe(
      (response: any) => {
        console.log('History updated successfully:', response);
      },
      (error: any) => {
        console.error('Error updating history:', error);
      }
    );
  }

  addUserMessage(userMsg: string) {
    const userMessage: Message = {
      role: Role.User,
      content: userMsg
    };
    this.messages.push(userMessage);
  }

  trackByMessage(index: number, message: Message): string {
    return message.role + message.content;
  }
}
