import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { Observable, catchError, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})
/**
 * Serwis ChatService odpowiedzialny za komunikację z backendem w celu wysyłania wiadomości czatu.
 */
export class ChatService {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Obsługuje błędy HTTP, loguje odpowiednie komunikaty i zwraca rzucany błąd.
   *
   * @param {HttpErrorResponse} error - Błąd HTTP, który wystąpił.
   * @returns {Observable<Error>} - Rzucany błąd.
   */
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // Loguje błąd klienta lub sieci.
      console.error('An error occurred:', error.error);
    } else {
      // Loguje błąd backendu.
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    // Zwraca rzucany błąd z odpowiednim komunikatem.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  /**
   * Wysyła wiadomość czatu do backendu.
   *
   * @param {string} message - Treść wiadomości wysyłanej do backendu.
   * @param {string} [drink] - (Opcjonalnie) Informacje o drinku do wysłania.
   * @returns {Observable<any>} - Observable, które emitowane jest po otrzymaniu odpowiedzi z backendu.
   */
  public sendMessage(message: string, drink?: string): Observable<any> {
    const payload: any = { message };
    if (drink) {
      payload.drink = drink;
    }
    console.log(payload);
    return this.httpClient.post(`${environment.apiUrl}/chat`, payload)
      .pipe(catchError(this.handleError));
  }
}

