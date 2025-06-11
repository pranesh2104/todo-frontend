import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, PLATFORM_ID, TransferState } from '@angular/core';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { UserService } from '@core/services/user.service';
import { IGetOneUserResponse, IUserReponse } from 'app/features/auth/models/auth.model';
import { Router, RouterOutlet } from '@angular/router';
import { ICommonErrorResponse, ICommonResponse } from '@shared/models/shared.model';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { USER_KEY } from '@core/constants/state.constant';
import { Subscription } from 'rxjs';
import { CoreAuthService } from '@core/services/core-auth.service';
// import { SERVER_REQUEST } from 'server.token';

@Component({
  selector: 'app-base-layout',
  imports: [SideNavComponent, RouterOutlet],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseLayoutComponent implements OnInit, OnDestroy {

  private readonly userService = inject(UserService);

  private transferState = inject(TransferState);

  user !: IUserReponse;

  private userData = inject(CoreAuthService).user;

  private platformId = inject(PLATFORM_ID);

  private router = inject(Router);

  // private severToken = inject(SERVER_REQUEST);

  private subscription!: Subscription;

  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    if (this.userData && this.userData.value) {
      this.user = this.userData.value;
    }
    else {
      if (isPlatformBrowser(this.platformId)) {
        this.subscription = this.userService.getCurrentUser().subscribe({
          next: (res: IGetOneUserResponse) => {
            console.log('res ', res);
            if (isPlatformServer(this.platformId)) {
              this.transferState.set(USER_KEY, res);
            }
            this.user = res.getOneUser;
            this.cdr.markForCheck();
          },
          error: (error: ICommonErrorResponse) => {
            const parsedError: ICommonResponse = JSON.parse(error.message);
            if (parsedError.code === 'USER_NOT_FOUND') {
              this.router.navigate(['/login']);
            }
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
