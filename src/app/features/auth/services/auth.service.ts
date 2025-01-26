import { computed, Injectable, signal } from '@angular/core';
import { GraphqlClientService } from '../../../shared/services/graphql-client.service';
import { CHECK_EMAIL, CREATE_USER, SEND_EMAIL_OTP, SEND_RESET_PASSWORD_LINK, UPDATE_PASSWORD, VERIFY_OTP } from '../graphql/auth.query';
import { Observable } from 'rxjs';
import { CreateUserArguments, ICreateUserDetails, SendEmailOTPArguments, UpdatePasswordArguments, VerifyOTPArguments } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private registrationEmail = signal('raavana@yopmail.com');

  readonly registerEmail = computed(() => this.registrationEmail());

  constructor(private graphqlClientService: GraphqlClientService) { }

  setRegistrationEmail(email: string) {
    this.registrationEmail.set(email);
  }

  getRegistrationEmail() {
    return this.registerEmail;
  }

  clearRegistrationEmail() {
    this.registrationEmail.set('');
  }
  createUser(userDetails: CreateUserArguments): Observable<ICreateUserDetails> {
    return this.graphqlClientService.executeMutation(CREATE_USER, userDetails);
  }

  checkEmailExist(email: string) {
    return this.graphqlClientService.executeQuery(CHECK_EMAIL, { email });
  }

  sendEmailOTP(userDetails: SendEmailOTPArguments) {
    return this.graphqlClientService.executeMutation(SEND_EMAIL_OTP, { userDetails })
  }

  verifyOTP(otpDetails: VerifyOTPArguments) {
    return this.graphqlClientService.executeMutation(VERIFY_OTP, { otpDetails });
  }

  sendResetPasswordLink(email: string) {
    return this.graphqlClientService.executeMutation(SEND_RESET_PASSWORD_LINK, { email });
  }

  updatePassword(passwordDetails: UpdatePasswordArguments) {
    return this.graphqlClientService.executeMutation(UPDATE_PASSWORD, { passwordDetails });

  }
}
