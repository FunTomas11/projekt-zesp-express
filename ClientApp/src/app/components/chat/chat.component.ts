import {AfterViewChecked, Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {ChatService} from './chat.service';
import {CdkScrollable} from "@angular/cdk/overlay";
import {Message, Role} from "../../models/message.model";
import {DrinkCardComponent} from "../drink-card/drink-card.component";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {catchError} from "rxjs";


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
    MarkdownComponent
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  providers: [ChatService, provideMarkdown()]
})
export class ChatComponent implements AfterViewChecked {
  protected readonly Role = Role;
  messages: Message[] = [];
  loading: boolean = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private readonly chatService: ChatService) {
  }

  ngAfterViewChecked() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  sendMessage(msg: string) {
    if (!msg) return;

    this.messages.push({role: Role.User, content: msg});
    this.loading = true;
    this.chatService.sendMessage(msg)
      .pipe(catchError((error: any) => {
        this.loading = false;
        return error;
      }))
      .subscribe((response: any): void => {
        this.messages.push({role: Role.Assistant, content: response.response});
        this.loading = false;
      });
  }
}
