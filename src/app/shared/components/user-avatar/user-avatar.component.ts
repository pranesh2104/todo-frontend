import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-user-avatar',
  imports: [CommonModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss'
})
export class UserAvatarComponent {

  size = input.required<'small' | 'medium' | 'large'>();

  classBinding = computed(() => {
    const s = this.size();
    if (s === 'small') return 'w-8 h-8';
    if (s === 'medium') return 'w-12 h-12';
    return 'w-16 h-16';
  });

  user = inject(UserService).currentUser;

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
