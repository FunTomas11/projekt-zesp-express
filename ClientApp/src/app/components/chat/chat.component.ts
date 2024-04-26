import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatInputModule} from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import { MatCardModule, MatCardActions, MatCardHeader, MatCardContent } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

interface Message {
  role: string;
  content: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatChipsModule, MatCardActions, MatCardActions, MatCardContent, MatCardModule, MatCardHeader ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  messages: Message[] = [];
  newMessage = '';

  chatInputForm = new FormGroup({
    message: new FormControl(this.newMessage)
  });

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({ role: 'user', content: this.newMessage });
      this.newMessage = '';
    }
  }
}