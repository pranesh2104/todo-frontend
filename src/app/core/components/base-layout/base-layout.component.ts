import { ChangeDetectionStrategy, Component, Inject, inject, OnDestroy, OnInit, Optional, PLATFORM_ID, REQUEST, signal, WritableSignal } from '@angular/core';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { UserService } from '@core/services/user.service';
import { IGetOneUserResponse, IUserReponse } from 'app/features/auth/models/auth.model';
import { Router, RouterOutlet } from '@angular/router';
import { ICommonErrorResponse, ICommonResponse } from '@shared/models/shared.model';
import { Subscription } from 'rxjs';
import { DrawerModule } from 'primeng/drawer';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-base-layout',
  imports: [SideNavComponent, RouterOutlet, DrawerModule, CommonModule, ButtonModule],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseLayoutComponent implements OnInit, OnDestroy {
  /**
   * Injects the UserService instance
   */
  private readonly userService = inject(UserService);
  /**
   * Signal to control the visibility state of the drawer (open/close)
   */
  drawerVisible: WritableSignal<boolean> = signal(false);
  /**
   * Signal to identify whether app in Mobile or Desktop.
   */
  isMobile: WritableSignal<boolean> = signal(false);
  /**
   * Signal to manage the user data.
   */
  user: WritableSignal<IUserReponse> = signal<IUserReponse>({} as IUserReponse);
  /**
   * Inject the Router Instance.
   */
  private readonly router = inject(Router);
  /**
   * Manages observable subscriptions.
   */
  private subscription: Subscription = new Subscription();

  constructor(@Inject(PLATFORM_ID) private platformId: Object, @Optional() @Inject(REQUEST) req: Request | null) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreen();
      window.addEventListener('resize', () => this.checkScreen());
    }
    else {
      if (req) {
        const userAgent = req.headers.get('user-agent') || '';
        const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
        this.isMobile.set(isMobile);
      }
    }
  }
  /**
   * Fetch the User data.
   */
  ngOnInit(): void {
    this.subscription = this.userService.getCurrentUser().subscribe({
      next: (res: IGetOneUserResponse) => {
        this.userService.currentUser.set(res.getOneUser);
      },
      error: (error: ICommonErrorResponse) => {
        const parsedError: ICommonResponse = JSON.parse(error.message);
        if (parsedError.code === 'USER_NOT_FOUND') {
          console.log('in Base layout ');

          this.router.navigate(['/signin']);
        }
      }
    });
  }
  /**
   * UnSubscribe the Observable streams.
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  /**
   * Change the visibility of drawer based on screen width.
   */
  checkScreen(): void {
    this.isMobile.set(window.innerWidth < 640);
    if (!this.isMobile()) {
      this.drawerVisible.set(false);
    }
  }
  /**
   * Update the drawer visiblity based on click.
   */
  toggleDrawer(): void {
    this.drawerVisible.update(v => !v);
  }
}
