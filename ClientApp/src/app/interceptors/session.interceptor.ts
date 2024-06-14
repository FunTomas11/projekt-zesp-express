import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
/**
 * Klasa SessionInterceptor implementująca interfejs HttpInterceptor,
 * służy do przechwytywania żądań HTTP i dodawania tokenu sesji do nagłówków żądań,
 * a także aktualizacji tokenu sesji na podstawie odpowiedzi serwera.
 */
export class SessionInterceptor implements HttpInterceptor {
  private static readonly SESSION_ID_KEY = 'token';

  /**
   * Metoda intercept przechwytuje każde żądanie HTTP, dodaje do niego token sesji (jeśli jest dostępny),
   * a następnie przetwarza odpowiedź, aby zaktualizować token sesji, jeśli jest obecny w nagłówkach odpowiedzi.
   *
   * @param {HttpRequest<any>} req - Przechwycone żądanie HTTP.
   * @param {HttpHandler} next - Następnik, do którego przekazywane jest zmodyfikowane żądanie.
   * @returns {Observable<HttpEvent<any>>} - Observable reprezentujące strumień zdarzeń HTTP.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let sessionId = sessionStorage.getItem(SessionInterceptor.SESSION_ID_KEY);
    console.log(`Retrieved Session ID from session storage: ${sessionId}`);

    let modifiedReq = req;
    if (sessionId) {
      modifiedReq = req.clone({
        setHeaders: {
          'token': sessionId
        }
      });
    }

    return next.handle(modifiedReq).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const newSessionId = event.headers.get('token');
          if (newSessionId) {
            console.log(`Setting new Session ID to session storage: ${newSessionId}`);
            sessionStorage.setItem(SessionInterceptor.SESSION_ID_KEY, newSessionId);
          }
        }
      })
    );
  }
}
