import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-profile',
  imports: [CardModule, Divider, UserAvatarComponent, ReactiveFormsModule, InputTextModule, Message],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ProfileComponent {

  userForm = new FormGroup({
    name: new FormControl<string>(''),
    email: new FormControl<string>(''),
    currentPassword: new FormControl<string>(''),
    newPassword: new FormControl<string>(''),
    repeatPassword: new FormControl<string>('')
  });
}
