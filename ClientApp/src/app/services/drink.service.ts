import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment.development";
import { Observable } from 'rxjs';
import { ChatService } from '../components/chat/chat.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Serwis DrinkService odpowiedzialny za komunikację z backendem w celu pobierania informacji o drinkach
 * oraz aktualizację historii i wysyłanie zapytań dotyczących drinków.
 */
export class DrinkService {
  constructor(private http: HttpClient, private chatService: ChatService) {}

  /**
   * Pobiera listę dostępnych drinków z backendu.
   *
   * @returns {Observable<any>} - Observable zawierające odpowiedź z backendu.
   */
  getAvailableDrinks(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/getAvailableDrinks`);
  }

  /**
   * Pobiera informacje o drinku na podstawie nazwy drinka z backendu.
   *
   * @param {string} drinkName - Nazwa drinka.
   * @returns {Observable<any>} - Observable zawierające odpowiedź z backendu.
   */
  getDrinkInfo(drinkName: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/getDrinkInfo`, { params: { drinkName } });
  }

  /**
   * Aktualizuje historię drinków na backendzie.
   *
   * @param {any} drink - Obiekt reprezentujący drinka.
   * @returns {Observable<any>} - Observable zawierające odpowiedź z backendu.
   */
  updateHistory(drink: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/updateHistory`, { drink });
  }

  /**
   * Wysyła zapytanie o drinka do serwisu chatService.
   *
   * @param {string} drink - Nazwa drinka.
   * @returns {Observable<any>} - Observable zawierające odpowiedź z backendu.
   */
  sendDrinkRequest(drink: string): Observable<any> {
    console.log(`Sending drink request for drink: ${drink}`)
    const message = `Can you tell me more about ${drink}?`;
    return this.chatService.sendMessage(message, drink);
  }
}

