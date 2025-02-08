import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { CoreAuthService } from '@core/services/core-auth.service';
import { IUserReponse } from 'app/features/auth/models/auth.model';

@Component({
  selector: 'app-side-nav',
  imports: [CommonModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent implements OnInit {

  user: WritableSignal<IUserReponse> = signal({ name: '', email: '', updatedAt: '' });

  private coreAuthService = inject(CoreAuthService);

  private colors: string[] = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#EC4899'];

  private platformId = inject(PLATFORM_ID);


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.coreAuthService.user.subscribe({
        next: (userResponse: IUserReponse | null) => {
          console.log('userResponse ', userResponse);
          if (userResponse) {
            this.user.set(userResponse);
          }
        }

      });
    }
  }

  getStyles() {
    return {
      'background-color': this.getColorFromName(),
      'display': 'flex'
    };
  }

  getInitial(): string {
    return this.user()?.name?.charAt(0)?.toUpperCase() || '?';
  }

  private getColorFromName(): string {
    let hash = 0;
    let color = '#3B82F6'
    const userName = this.user().name || '';
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    color = this.colors[Math.abs(hash) % this.colors.length]!;
    return color;
  }
}
