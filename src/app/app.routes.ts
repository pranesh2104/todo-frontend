import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
  {
    path: 'app', loadComponent: () => import('../app/core/components/base-layout/base-layout.component').then((c) => c.BaseLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', title: 'Dashboard', loadComponent: () => import('../app/features/dashboard/components/main-dashboard/main-dashboard.component').then((c) => c.MainDashboardComponent) },
      { path: 'profile', loadComponent: () => import('../app/features/profile/profile/profile.component').then((c) => c.ProfileComponent) }
    ]
  },
  { path: 'signup', loadComponent: () => import('../app/features/auth/components/sign-up/sign-up.component').then((c) => c.SignUpComponent), data: { title: 'SignUp' } },
  { path: 'signin', loadComponent: () => import('../app/features/auth/components/sign-in/sign-in.component').then((c) => c.SignInComponent), data: { title: 'Login' } },
  { path: 'resetPassword', loadComponent: () => import('../app/features/auth/components/reset-password/reset-password.component').then((c) => c.ResetPasswordComponent), data: { title: 'Reset Password' } },
];