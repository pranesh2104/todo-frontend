import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMAIL_PATTERN, PASSWORD_PATTERN } from '../../constants/auth.constant';
import { CardModule } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, CardModule, IconField, InputIcon, InputText, Message, Password, Button],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {

  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(EMAIL_PATTERN)]),
    password: new FormControl('', [Validators.required, Validators.pattern(PASSWORD_PATTERN)])
  });

  isPasswordVisible: boolean = false;

  ngOnInit(): void {
  }

  onLogin() {
    const emailFormControl = this.signInForm.get('email');
    const passwordFormControl = this.signInForm.get('password');
    if (emailFormControl && passwordFormControl && emailFormControl.valid && passwordFormControl.valid) {

    }
    else {
      emailFormControl?.markAsDirty();
      passwordFormControl?.markAsDirty();
    }
  }
}
