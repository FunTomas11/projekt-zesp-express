import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatInputModule} from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule, ReactiveFormsModule} from "@angular/forms";
import { MatCardModule, MatCardActions, MatCardHeader, MatCardContent } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ChatService } from './chat.service';
import {CdkScrollable} from "@angular/cdk/overlay";

export interface Message {
  role: string;
  content: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatChipsModule, MatCardActions, MatCardActions, MatCardContent, MatCardModule, MatCardHeader, CdkScrollable],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  providers: [ChatService]
})
export class ChatComponent implements AfterViewChecked {
  messages: Message[] = [
    {
      role: 'assistant',
      content: 'Hi im bot'
    },
    {
      role: 'user',
      content: 'Hi'
    },
    {
      role: 'assistant',
      content: 'How are you'
    },
    {
      role: 'user',
      content: 'Thenk you'
    },
  ];

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private readonly chatService: ChatService) {}

  ngAfterViewChecked() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  sendMessage(msg: string) {
    if (!msg) return;

    this.messages.push({ role: 'user', content: msg });
    this.chatService.sendMessage(msg).subscribe((response: any): void => {
      console.log('response', response);

    });
  }
}
