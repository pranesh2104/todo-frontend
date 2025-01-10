import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('../app/features/auth/components/sign-in/sign-in.component').then((c) => c.SignInComponent), data: { title: 'Login' } },
  { path: 'login/:id', loadComponent: () => import('../app/features/auth/components/sign-in/sign-in.component').then((c) => c.SignInComponent), data: { title: 'Login' } }

];
