import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { UserService } from '@core/services/user.service';
import { IGetOneUserResponse, IUserReponse } from 'app/features/auth/models/auth.model';
import { Router, RouterOutlet } from '@angular/router';
import { ICommonErrorResponse, ICommonResponse } from '@shared/models/shared.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-base-layout',
  imports: [SideNavComponent, RouterOutlet],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseLayoutComponent implements OnInit, OnDestroy {

  private readonly userService = inject(UserService);

  user = signal<IUserReponse>({} as IUserReponse)

  private router = inject(Router);

  private subscription!: Subscription;

  private cdr = inject(ChangeDetectorRef);

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
}
