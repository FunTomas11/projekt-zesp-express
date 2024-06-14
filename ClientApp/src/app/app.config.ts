import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SessionInterceptor } from './interceptors/session.interceptor';

import { routes } from './app.routes';

/**
 * Konfiguracja aplikacji.
 *
 * @property {Array} providers - Lista dostawców usług używanych przez aplikację.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Dostawca usług routera z konfiguracją tras.
    provideAnimationsAsync(), // Dostawca usług animacji.
    provideHttpClient(), // Dostawca usług HTTP klienta.
    { provide: HTTP_INTERCEPTORS, useClass: SessionInterceptor, multi: true }, // Dostawca interceptorów HTTP z klasą SessionInterceptor.
  ],
};
