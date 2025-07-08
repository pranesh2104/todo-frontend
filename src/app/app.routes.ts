import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('@features/landing/landing/landing.component').then((c) => c.LandingComponent) },
  {
    path: 'app', loadComponent: () => import('@core/components/base-layout/base-layout.component').then((c) => c.BaseLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', title: 'Dashboard', loadComponent: () => import('@features/dashboard/components/main-dashboard/main-dashboard.component').then((c) => c.MainDashboardComponent) },
      { path: 'profile', title: 'Profile', loadComponent: () => import('@features/profile/components/profile/profile.component').then((c) => c.ProfileComponent) }
    ]
  },
  { path: 'signup', title: 'Sign Up', loadComponent: () => import('@features/auth/components/sign-up/sign-up.component').then((c) => c.SignUpComponent), data: { title: 'SignUp' } },
  { path: 'signin', title: 'Sign In', loadComponent: () => import('@features/auth/components/sign-in/sign-in.component').then((c) => c.SignInComponent), data: { title: 'Login' } },
  { path: 'resetPassword', title: 'Reset Password', loadComponent: () => import('@features/auth/components/reset-password/reset-password.component').then((c) => c.ResetPasswordComponent), data: { title: 'Reset Password' } },
  { path: 'reset', title: 'Reset', loadComponent: () => import('@shared/components/common-reset/common-reset.component').then((c) => c.CommonResetComponent), data: { title: 'Reset' } },
];