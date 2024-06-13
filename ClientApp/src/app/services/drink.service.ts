import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment.development";
import { Observable } from 'rxjs';
import { ChatService } from '../components/chat/chat.service';

@Injectable({
  providedIn: 'root'
})
export class DrinkService {
  constructor(private http: HttpClient, private chatService: ChatService) {}

  getAvailableDrinks(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/getAvailableDrinks`);
  }

  getDrinkInfo(drinkName: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/getDrinkInfo`, { params: { drinkName } });
  }

  updateHistory(drink: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/updateHistory`, { drink });
  }

  sendDrinkRequest(drink: string): Observable<any> {
    console.log(`Sending drink request for drink: ${drink}`)
    const message = `Can you tell me more about ${drink}?`;
    return this.chatService.sendMessage(message, drink);
  }
}
