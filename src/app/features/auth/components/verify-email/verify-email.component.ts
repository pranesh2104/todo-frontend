import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IOTPForm } from '../../models/auth.model';
import { interval, Subscription } from 'rxjs';



@Component({
  selector: 'app-verify-email',
  imports: [ReactiveFormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit, OnDestroy {

  otpForm: FormGroup<IOTPForm> = new FormGroup({
    digit0: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
    digit1: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
    digit2: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
    digit3: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
    digit4: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
    digit5: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
  });

  constructor(private authService: AuthService, private elementRef: ElementRef) { }

  email = this.authService.registerEmail;

  resendTimer: number = 30; // 30 seconds cooldown
  canResendOtp: boolean = false;

  isOTPVerified: boolean = false;
  private timerSubscription: Subscription | undefined;
  ngOnInit(): void {
    // this.startResendTimer();
  }

  startResendTimer() {
    // Reset resend timer and canResendOtp flag at the beginning
    this.resendTimer = 30;
    this.canResendOtp = false;

    // Subscribe to the interval observable to update the countdown every second
    this.timerSubscription = interval(1000).subscribe((seconds) => {
      this.resendTimer = 30 - seconds; // Decrease time every second
      if (this.resendTimer <= 0) {
        this.canResendOtp = true; // Allow the user to request OTP again
        this.resendTimer = 0;
        if (this.timerSubscription)
          this.timerSubscription.unsubscribe(); // Stop the timer once it's done
      }
    });
  }

  resendOtp() {
    if (this.canResendOtp) {
      // Call API to resend OTP and reset the timer
      this.canResendOtp = false;
      this.startResendTimer();
      // Add logic to call backend to send the OTP again
    }
  }


  get otpControls(): string[] {
    return Object.keys(this.otpForm.controls);
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const key = event.key;

    // Prevent non-numeric input except for special keys
    if (!/^\d$/.test(key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      event.preventDefault();
      return;
    }

    // Handle arrow key navigation
    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
    } else if (key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.focusInput(index + 1);
    }

    // Handle backspace
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

    // Ensure only last character is kept if multiple characters are somehow entered
    if (value.length > 1) {
      value = value.slice(-1);
      input.value = value;
      const controlName = `digit${index + 1}` as keyof IOTPForm;
      const control = this.otpForm.get(controlName);
      if (control) {
        control.setValue(value);
      }
    }

    // Move to next input if value is entered
    if (value && index < 5) {
      this.focusInput(index + 1);
    }

    if (this.isOtpComplete()) {
      this.onSubmit();
    }
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

    if (this.isOtpComplete()) {
      this.onSubmit();
    }
  }


  private focusInput(index: number) {
    const focusInputField = this.elementRef.nativeElement.querySelector(`#otp-input-${index}`);
    if (focusInputField)
      focusInputField.focus();
  }

  private isOtpComplete(): boolean {
    return Object.values(this.otpForm.value).every((digit) => digit?.length === 1);
  }

  getOtpValue(): string {
    return Object.values(this.otpForm.value).join('');
  }

  onSubmit() {
    if (this.otpForm.valid) {
      const otp = this.getOtpValue();
      console.log('onSubmit ', otp);

      // this.authService.verifyOtp({
      //   email: this.authState.registrationEmail(),
      //   otp
      // }).subscribe({
      //   next: () => {
      //     // Handle success
      // this.isOTPVerified = true;
      //     // this.router.navigate(['/login']);
      //   },
      //   error: (err: any) => {
      //     this.showError(err.message);
      // this.isOTPVerified = false;
      //     // this.authState.setError(err.message);
      //   }
      // });
    }
  }

  ngOnDestroy(): void {
    this.authService.getRegistrationEmail
  }
}
