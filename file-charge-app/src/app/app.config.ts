import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Routes } from '@angular/router';

export const routes: Routes = [];

export default {
  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ]
};