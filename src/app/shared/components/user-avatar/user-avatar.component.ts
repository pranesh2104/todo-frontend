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
  /**
   * Define a reactive required input property 'size' with allowed values: 'small', 'medium', or 'large'.
   */
  size = input.required<'small' | 'medium' | 'large'>();
  /**
   * Compute a CSS class string based on the current size.
   * 
   * Maps:
   * - 'small' => 'w-8 h-8'
   * - 'medium' => 'w-12 h-12'
   * - 'large' (or default) => 'w-16 h-16'
   */
  classBinding = computed(() => {
    const s = this.size();
    if (s === 'small') return 'w-8 h-8';
    if (s === 'medium') return 'w-12 h-12';
    return 'w-16 h-16';
  });
  /**
   * Inject a UserService instance and access its reactive `currentUser` property.
   */
  currentUser = inject(UserService).currentUser;
  /**
   * Define an array of hex colors for user background color selection.
   */
  private colors: string[] = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#EC4899'];
  /**
   * Compute the background color for the user dynamically based on their name.
   * - If a user with a name exists, derive a color based on their name hash.
   * - Otherwise, default to the first color '#3B82F6'.
   */
  userBGColor = computed(() => {
    if (this.currentUser() && this.currentUser()?.name) return this.getColorFromName();
    return '#3B82F6';
  });
  /**
   * Generates a deterministic color from the current user's name.
   * 
   * Uses a simple hash function on the username string to produce an index,
   * which is then mapped into the colors array.
   * 
   * This ensures the same user name always yields the same background color.
   * 
   * @returns A hex color string selected from the `colors` array.
   */
  private getColorFromName(): string {
    let hash = 0;
    let color = '#3B82F6'
    const userName = this.currentUser()?.name || '';
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    color = this.colors[Math.abs(hash) % this.colors.length]!;
    return color;
  }
}
