import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IUserReponse } from 'app/features/auth/models/auth.model';

@Component({
  selector: 'app-user-avatar',
  imports: [CommonModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss'
})
export class UserAvatarComponent {

  user = input<IUserReponse>();

  private colors: string[] = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#EC4899'];

  userBGColor = computed(() => {
    if (this.user() && this.user()?.name) return this.getColorFromName();
    return '#3B82F6';
  });

  private getColorFromName(): string {
    let hash = 0;
    let color = '#3B82F6'
    const userName = this.user()?.name || '';
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    color = this.colors[Math.abs(hash) % this.colors.length]!;
    return color;
  }
}
