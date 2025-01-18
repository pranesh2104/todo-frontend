import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {

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