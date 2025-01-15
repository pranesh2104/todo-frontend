import { Routes } from '@angular/router';
import { otpGuard } from './features/auth/guard/otp.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('../app/features/auth/components/sign-in/sign-in.component').then((c) => c.SignInComponent), data: { title: 'Login' } },
  { path: 'login/:id', loadComponent: () => import('../app/features/auth/components/sign-in/sign-in.component').then((c) => c.SignInComponent), data: { title: 'Login' } },
  { path: 'signup', loadComponent: () => import('../app/features/auth/components/sign-up/sign-up.component').then((c) => c.SignUpComponent), data: { title: 'SignUp' } },
  { path: 'verify-otp', loadComponent: () => import('../app/features/auth/components/verify-email/verify-email.component').then((c) => c.VerifyEmailComponent), data: { title: 'Verify Email' }, canActivate: [otpGuard] }

];
