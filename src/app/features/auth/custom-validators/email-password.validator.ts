import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { switchMap, map, catchError, first, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { IEmailCheckResponse } from '../models/auth.model';
import { AUTH_STATUS } from '../constants/auth.constant';

interface ICheckingState {
  setCheckingState: (checkState: string) => void;
}

interface IEmailExistState {
  setEmailExistState: (emailState: boolean) => void;
}
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

  static checkEmailExist(authService: AuthService, checkingState: ICheckingState, emailExistState: IEmailExistState, isExpectEmailExist: boolean): AsyncValidatorFn | null {
    return (formControl: AbstractControl): Observable<ValidationErrors | null> => {
      if (formControl.pristine && formControl.value) return of(null);
      if (!formControl.value) return of(null);
      return formControl.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((email: string) => {
          if (!email) { return of(null); }
          checkingState.setCheckingState(AUTH_STATUS.EMAIL.CHECKING);
          return authService.checkEmailExist(email).pipe(
            map((checkEmailResponse: IEmailCheckResponse) => {
              checkingState.setCheckingState(AUTH_STATUS.EMAIL.CHECKED);
              const isEmailExist = checkEmailResponse.checkEmail.code === 'EMAIL_EXIST';
              formControl.markAsTouched();
              emailExistState.setEmailExistState(!isEmailExist);
              if (isExpectEmailExist && isEmailExist)
                return { emailExists: true };
              else if (!isEmailExist && !isExpectEmailExist)
                return { emailNotExist: true };
              return null;
            }),
            catchError(() => { emailExistState.setEmailExistState(false); checkingState.setCheckingState(AUTH_STATUS.EMAIL.FAILED); return of(null); })
          );
        }),
        first()
      );
    };
  }
}