import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment.development";
import {Observable, catchError, of, throwError} from "rxjs";

@Injectable()
export class ChatService {
  constructor(private readonly httpClient: HttpClient) {
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  public sendMessage(message: string): Observable<any> {
    const sessionId = '424c9d01-255d-4420-a5f9-56ad2ecde3a4';

    return this.httpClient.post(
      `${environment.apiUrl}/chat`,
      {message},
    ).pipe(
      catchError((error: any) => {
        console.log('dupa1', error);

        return of('');
      })
    );
  }
}
