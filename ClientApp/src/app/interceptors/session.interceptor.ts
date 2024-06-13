import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  private static readonly SESSION_ID_KEY = 'token';

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
