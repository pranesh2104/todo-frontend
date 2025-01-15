// validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EMAIL_PATTERN, PASSWORD_PATTERN } from '../constants/auth.constant';

export class CustomValidators {

  static emailValidator(emailFormControl: AbstractControl): ValidationErrors | null {
    const email = emailFormControl.value;
    if (!email) return null;
    if (!EMAIL_PATTERN.test(email)) {
      emailFormControl.markAsTouched();
      return { invalidEmail: true };
    }
    return null;
  }

  static passwordValidator(passwordFormControl: AbstractControl): ValidationErrors | null {
    const password = passwordFormControl.value;
    if (!password) return null;
    if (!PASSWORD_PATTERN.test(password)) {
      passwordFormControl.markAsTouched();
      return { invalidPassword: true };
    }
    return null;
  }

  static matchPasswordValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const passwordFormControl = formGroup.get('password');
      const repeatPasswordFormControl = formGroup.get('repeatPassword');
      if (repeatPasswordFormControl?.value)
        repeatPasswordFormControl.markAsTouched();
      else return null;
      if (!passwordFormControl || !repeatPasswordFormControl || !repeatPasswordFormControl.touched) return null;
      if (passwordFormControl.value !== repeatPasswordFormControl.value) {
        repeatPasswordFormControl.setErrors({ notMatching: true });
        return { notMatching: true };
      }
      else if (passwordFormControl.value === repeatPasswordFormControl.value) {
        const currentErrors = repeatPasswordFormControl.errors;
        if (currentErrors) {
          delete currentErrors['notMatching'];
          repeatPasswordFormControl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
        }
        return null;
      }
      return null;
    }
  }
}