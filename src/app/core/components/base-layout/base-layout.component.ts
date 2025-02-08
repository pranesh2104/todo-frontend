import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { UserService } from '@core/services/user.service';
import { CoreAuthService } from '@core/services/core-auth.service';
import { IGetOneUserResponse } from 'app/features/auth/models/auth.model';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ICommonErrorResponse, ICommonResponse } from '@shared/models/shared.model';
import { palette } from '@primeng/themes';

@Component({
  selector: 'app-base-layout',
  imports: [SideNavComponent, RouterOutlet],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.scss'
})
export class BaseLayoutComponent implements OnInit {

  private readonly userService = inject(UserService);

  user = inject(CoreAuthService).user;

  private platformId = inject(PLATFORM_ID);

  private router = inject(Router);

  ngOnInit(): void {
    if (this.user && this.user.value) {

    }
    else {
      if (isPlatformBrowser(this.platformId)) {
        const values1 = palette('#2563EB');
        console.log(values1);

        this.userService.getCurrentUser().subscribe({
          next: (res: IGetOneUserResponse) => {
            this.user.next(res.getOneUser);
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
}
