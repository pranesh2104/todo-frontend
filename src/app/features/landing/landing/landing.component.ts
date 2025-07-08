import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {

  isMobileMenuOpen = signal<boolean>(false);

  features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Add, edit, and complete tasks in seconds. Our intuitive interface keeps you in the flow without breaking your concentration.'
    },
    // {
    //   icon: '🎯',
    //   title: 'Smart Organization',
    //   description: 'Automatically categorize and prioritize your tasks. Let Task Tide\'s intelligent system help you focus on what matters most.'
    // },
    {
      icon: '🎯',
      title: 'Stay Focused',
      description: 'Clean, distraction-free environment that keeps you focused on what matters most. No unnecessary features to overwhelm you.'
    },
    {
      icon: '📱',
      title: 'Cross-Platform Sync',
      description: 'Access your tasks anywhere, anytime. Seamless synchronization across all your devices keeps you productive on the go.'
    },
    {
      icon: '🌊',
      title: 'Fluid Experience',
      description: 'Enjoy smooth animations and transitions that make task management feel natural and enjoyable, not overwhelming.'
    },
    {
      icon: '🔧',
      title: 'Easy to Use',
      description: 'Intuitive design that anyone can master in minutes. No learning curve, no complex setup—just start adding tasks.'
    },
    {
      icon: '🌟',
      title: 'Simply Perfect',
      description: 'We believe in simplicity. No overwhelming features, no complicated setups—just the perfect tool for managing your tasks.'
    },
    // {
    //   icon: '📊',
    //   title: 'Progress Tracking',
    //   description: 'Visualize your productivity with beautiful charts and insights. See how you\'re riding the wave of success.'
    // },
    // {
    //   icon: '🔔',  
    //   title: 'Smart Reminders',
    //   description: 'Never miss a deadline with intelligent notifications that adapt to your schedule and preferences.'
    // }
  ];

  mockTasks = [
    'Complete project proposal',
    'Schedule team meeting',
    'Review quarterly reports',
    'Plan weekend getaway',
    'Buy groceries'
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

}
