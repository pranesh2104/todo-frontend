import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { IUserReponse } from 'app/features/auth/models/auth.model';

@Component({
  selector: 'app-side-nav',
  imports: [CommonModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent implements OnInit {

  userData = input<IUserReponse>();

  // user: WritableSignal<IUserReponse> = signal({ name: '', email: '', updatedAt: '' });


  // protected profileImage = computed(() => {
  //   const user = this.userData();
  //   return user?.profileImage || 'assets/default-avatar.png';
  // });

  // private coreAuthService = inject(CoreAuthService);

  private colors: string[] = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#EC4899'];

  // private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // if (isPlatformBrowser(this.platformId)) {
    //   this.coreAuthService.user.subscribe({
    //     next: (userResponse: IUserReponse | null) => {
    //       console.log('userResponse ', userResponse);
    //       if (userResponse) {
    //         this.user.set(userResponse);
    //       }
    //     }

    //   });
    // }
  }

  getStyles() {
    return {
      'background-color': this.getColorFromName(),
      'display': 'flex'
    };
  }

  getInitial(): string {
    return this.userData()?.name?.charAt(0)?.toUpperCase() || '?';
  }

  private getColorFromName(): string {
    let hash = 0;
    let color = '#3B82F6'
    const userName = this.userData()?.name || '';
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    color = this.colors[Math.abs(hash) % this.colors.length]!;
    return color;
  }
}
