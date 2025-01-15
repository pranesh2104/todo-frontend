import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CustomValidators } from '../../custom-validators/email-password.validator';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { GraphqlClientService } from '../../../../shared/services/graphlql-client.service';
import { debounceTime, distinctUntilChanged, filter, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { SnackBarService } from '../../../../shared/services/snack-bar.service';
import { IEmailCheckResponse, IOTPForm, IUserDetails } from '../../models/auth.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-sign-up',
  imports: [MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  providers: [GraphqlClientService]
})
export class SignUpComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private snackBarService: SnackBarService, private formBuilder: FormBuilder, private elementRef: ElementRef) { }

  isPasswordVisible: boolean = false;

  isRepeatPasswordVisible: boolean = false;

  isEmailVerified: boolean = false; //TODO: it will true after the OTP verification completed\

  isEmailCheckLoading: boolean = false;

  isEmailAvailable: boolean | undefined;

  isOTPSending!: boolean;

  isOTPSended: boolean = false;

  signupForm = new FormGroup({
    firstName: new FormControl('', [Validators.required,]),
    lastName: new FormControl(''),
    email: new FormControl('', [Validators.required, CustomValidators.emailValidator]),
    password: new FormControl('', [Validators.required, CustomValidators.passwordValidator]),
    repeatPassword: new FormControl('', [Validators.required])
  }, { validators: CustomValidators.matchPasswordValidator() });


  otpForm!: FormGroup<IOTPForm>;

  ngOnInit(): void {
    this.signupForm.get('email')?.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), filter((email: string | null) => { return !!email && this.signupForm.get('email')?.valid === true; }),
      switchMap((email) => {
        if (!email) return of(null)
        this.isEmailCheckLoading = true;
        return this.authService.checkEmailExist(email);
      })
    ).subscribe({
      next: (res: IEmailCheckResponse | null) => {
        if (res && res.checkEmail) {
          const emailExists = res.checkEmail.code === 'EMAIL_EXIST';
          this.updateEmailValidationError(emailExists);
        }
      }
    });
  }

  private updateEmailValidationError(emailExists: boolean) {
    const emailControl = this.signupForm.get('email');
    if (!emailControl) return;
    const currentErrors = emailControl.errors || {};
    this.isEmailCheckLoading = false;
    if (emailExists) {
      this.isEmailAvailable = false;
      emailControl.markAsTouched();
      emailControl.setErrors({ ...currentErrors, emailExists: true });
    } else {
      this.isEmailAvailable = true;
      delete currentErrors['emailExists'];
      emailControl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
    }
  }

  onSendOTP() {
    const emailFormControl = this.signupForm.get('email');
    const firstNameFormControl = this.signupForm.get('firstName');
    const lastNameFormControl = this.signupForm.get('lastName');
    if (emailFormControl && emailFormControl.value && emailFormControl.valid && firstNameFormControl && firstNameFormControl.value && firstNameFormControl.valid) {
      this.isOTPSending = true
      this.authService.sendEmailOTP({ email: emailFormControl.value, firstName: firstNameFormControl.value, lastName: lastNameFormControl?.value || '' }).subscribe({
        next: (emailResponse) => {
          this.signupForm.get('email')?.disable();
          this.isOTPSending = false;
          this.isOTPSended = true;
          this.otpForm = this.formBuilder.group({
            digit0: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
            digit1: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
            digit2: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
            digit3: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
            digit4: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
            digit5: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
          });
          console.log('emailResponse ', emailResponse);
          // this.isOTPCheckLoading = false;
        },
        error: (emailError) => {
          this.isOTPSended = true;
          this.isOTPSending = false;
          console.log('emailError ', emailError);
          // this.isOTPCheckLoading = false;
        }
      })
    }
  }


  get otpControls(): string[] {
    return Object.keys(this.otpForm.controls);
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const key = event.key;

    if (!/^\d$/.test(key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      event.preventDefault();
      return;
    }

    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
    } else if (key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.focusInput(index + 1);
    }

    if (key === 'Backspace') {
      if (input.value === '' && index > 0) {
        event.preventDefault();
        this.focusInput(index - 1);
        const controlName = `digit${index - 1}` as keyof IOTPForm;
        const control = this.otpForm.get(controlName);
        if (control) {
          control.setValue('');
        }
      }
    }
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (value.length > 1) { // If user enter more than 1 number in one field.
      value = value.slice(-1);
      input.value = value;
      const controlName = `digit${index + 1}` as keyof IOTPForm;
      const control = this.otpForm.get(controlName);
      if (control)
        control.setValue(value);
    }

    if (value && index < 5)
      this.focusInput(index + 1);
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();

    const pastedData = event.clipboardData?.getData('text');
    if (!pastedData) return;

    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);

    numbers.split('').forEach((num, index) => {
      if (index < 6) {
        const controlName = `digit${index}` as keyof IOTPForm;
        const control = this.otpForm.get(controlName);
        if (control) {
          control.setValue(num);
        }
      }
    });
    const focusIndex = Math.min(numbers.length, 5);
    this.focusInput(focusIndex);
  }

  private focusInput(index: number) {
    const focusInputField = this.elementRef.nativeElement.querySelector(`#otp-input-${index}`);
    if (focusInputField)
      focusInputField.focus();
  }

  getOtpValue(): string {
    return Object.values(this.otpForm.value).join('');
  }

  onVerifyOTP() {
    const emailFormControl = this.signupForm.get('email');
    if (this.otpForm && this.otpForm.valid && emailFormControl && emailFormControl.value) {
      const otp = this.getOtpValue();
      this.authService.verifyOTP({ email: emailFormControl.value, otp: +otp }).subscribe({
        next: (res) => {
          this.isOTPSended = false;
          this.isEmailVerified = true;
          console.log('otpVerify res ', res);
        },
        error: (err) => {
          this.isOTPSended = false;
          this.isEmailVerified = true;
          console.log('otypVerify error', err);
        }
      })
    }
  }

  onUserRegister() {
    if (this.signupForm.value && this.signupForm.valid) {
      const firstName = this.signupForm.value.firstName;
      const lastName = this.signupForm.value.lastName || '';
      const email = this.signupForm.value.email;
      const password = this.signupForm.value.password;
      if (firstName && email && password) {
        const data = { userDetails: { firstName, lastName, email, password } };
        this.authService.createUser(data).subscribe({
          next: (res: IUserDetails) => {
            if (res && res.email) {
              this.authService.setRegistrationEmail(res.email);
              this.router.navigate(['/login']);
            }
          },
          error: (error) => {
            console.log('error ', error);
          }
        });
      }
    }
  }
}
