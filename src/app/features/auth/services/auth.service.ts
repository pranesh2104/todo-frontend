import { computed, Injectable, signal } from '@angular/core';
import { GraphqlClientService } from '../../../shared/services/graphlql-client.service';
import { CHECK_EMAIL, CREATE_USER, SEND_EMAIL_OTP, VERIFY_OTP } from '../graphql/auth.query';
import { Observable } from 'rxjs';
import { CreateUserArguments, ICreateUserDetails, SendEmailOTPArguments, VerifyOTPArguments } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private registrationEmalil = signal('raavana@yopmail.com');

  readonly registerEmail = computed(() => this.registrationEmalil());

  constructor(private graphqlClientService: GraphqlClientService) { }

  setRegistrationEmail(email: string) {
    this.registrationEmalil.set(email);
  }

  getRegistrationEmail() {
    return this.registerEmail;
  }

  clearRegistrationEmail() {
    this.registrationEmalil.set('');
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
}
