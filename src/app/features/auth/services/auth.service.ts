import { Injectable } from '@angular/core';
import { GraphqlClientService } from '../../../shared/services/graphql-client.service';
import { CHECK_EMAIL, CREATE_USER, LOGIN, SEND_EMAIL_OTP, SEND_RESET_PASSWORD_LINK, UPDATE_PASSWORD, VERIFY_OTP } from '../graphql/auth.query';
import { Observable } from 'rxjs';
import { CreateUserArguments, ICreateUserDetails, IEmailCheckResponse, ILoginSuccessResponse, SendEmailOTPArguments, UpdatePasswordArguments, VerifyOTPArguments } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private graphqlClientService: GraphqlClientService) { }

  createUser(userDetails: CreateUserArguments): Observable<ICreateUserDetails> {
    return this.graphqlClientService.executeMutation(CREATE_USER, userDetails);
  }

  checkEmailExist(email: string): Observable<IEmailCheckResponse> {
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

  login(): Observable<ILoginSuccessResponse> {
    return this.graphqlClientService.executeMutation(LOGIN, {});
  }
}
