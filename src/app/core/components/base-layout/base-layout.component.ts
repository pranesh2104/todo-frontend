import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { UserService } from '@core/services/user.service';
import { CoreAuthService } from '@core/services/core-auth.service';
import { IGetOneUserResponse } from 'app/features/auth/models/auth.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-base-layout',
  imports: [SideNavComponent],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.scss'
})
export class BaseLayoutComponent implements OnInit {

  private readonly userService = inject(UserService);

  user = inject(CoreAuthService).user;

  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (this.user && this.user.value) {

    }
    else {
      if (isPlatformBrowser(this.platformId)) {
        this.userService.getCurrentUser().subscribe({
          next: (res: IGetOneUserResponse) => {
            this.user.next(res.getOneUser);
          },
          error: (error) => {
            console.log('current user error ', error);
          }
        });
      }
    }
  }
}
