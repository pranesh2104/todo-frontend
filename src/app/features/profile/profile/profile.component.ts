import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-profile',
  imports: [CardModule, Divider, ReactiveFormsModule, InputTextModule, IconField, InputIcon, Message, PasswordModule, Button],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {

  userForm = new FormGroup({
    name: new FormControl<string>(''),
    email: new FormControl<string>(''),
    currentPassword: new FormControl<string>(''),
    newPassword: new FormControl<string>(''),
    repeatPassword: new FormControl<string>('')
  });

  ngOnInit(): void {
    if (this.userForm) {
      this.userForm.get('newPassword')?.disable();
      this.userForm.get('repeatPassword')?.disable();
    }
  }
}
