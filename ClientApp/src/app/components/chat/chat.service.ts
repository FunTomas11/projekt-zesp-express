import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { Observable, catchError, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private readonly httpClient: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  public sendMessage(message: string, drink?: string): Observable<any> {
    const payload: any = { message };
    if (drink) {
      payload.drink = drink;
    }
    console.log(payload)
    return this.httpClient.post(`${environment.apiUrl}/chat`, payload)
      .pipe(catchError(this.handleError));
  }
}
