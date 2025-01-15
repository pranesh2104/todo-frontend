import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CustomValidators } from '../../custom-validators/email-password.validator';

@Component({
  selector: 'app-sign-in',
  imports: [MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {

  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, CustomValidators.emailValidator]),
    password: new FormControl('', [Validators.required, CustomValidators.passwordValidator])
  });

  isPasswordVisible: boolean = false;
  customerId!: string;


  @Input()
  set id(customerId: string) {
    this.customerId = customerId;
  }

  ngOnInit(): void {
    console.log('this.customerId ', this.customerId);
  }

  onLogin() {

  }
}
