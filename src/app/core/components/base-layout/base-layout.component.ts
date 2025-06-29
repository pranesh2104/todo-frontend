import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
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

  private readonly userService = inject(UserService);

  drawerVisible = signal(false);

  isMobile = signal(false);
  isHydrated = signal(false);
  user = signal<IUserReponse>({} as IUserReponse)

  private router = inject(Router);

  private subscription!: Subscription;

  private cdr = inject(ChangeDetectorRef);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.isHydrated.set(true); // ✅ Mark as hydrated
      this.checkScreen();
      window.addEventListener('resize', () => this.checkScreen());
    }
  }

  ngOnInit(): void {
    this.subscription = this.userService.getCurrentUser().subscribe({
      next: (res: IGetOneUserResponse) => {
        this.user.set(res.getOneUser);
        this.userService.currentUser.set(res.getOneUser);
        this.cdr.markForCheck();
      },
      error: (error: ICommonErrorResponse) => {
        const parsedError: ICommonResponse = JSON.parse(error.message);
        if (parsedError.code === 'USER_NOT_FOUND') {
          this.router.navigate(['/signin']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  checkScreen() {
    this.isMobile.set(window.innerWidth < 640);
    console.log('inside ', this.isMobile());

    if (!this.isMobile()) {
      this.drawerVisible.set(false);
    }
  }

  toggleDrawer() {
    this.drawerVisible.update(v => !v);
  }
}
