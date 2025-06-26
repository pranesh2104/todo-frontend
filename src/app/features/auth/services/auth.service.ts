import { Injectable } from '@angular/core';
import { GraphqlClientService } from '../../../shared/services/graphql-client.service';
import { CHECK_EMAIL, CREATE_USER, LOGIN, SEND_EMAIL_OTP, SEND_RESET_EMAIL_LINK, SEND_RESET_PASSWORD_LINK, UPDATE_PASSWORD, VERIFY_OTP } from '../graphql/auth.query';
import { Observable } from 'rxjs';
import { CreateUserArguments, ICreateUserDetails, IEmailCheckResponse, ILoginSuccessResponse, SendEmailOTPArguments, IUpdatePasswordArguments, IVerifyOTPArguments } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private graphqlClientService: GraphqlClientService) { }

  createUser(userDetails: CreateUserArguments): Observable<ICreateUserDetails> {
    return this.graphqlClientService.executeMutation(CREATE_USER, userDetails);
  }

  checkEmailAvailable(email: string): Observable<IEmailCheckResponse> {
    return this.graphqlClientService.executeQuery<IEmailCheckResponse>(CHECK_EMAIL, { email });
  }

  sendEmailOTP(userDetails: SendEmailOTPArguments) {
    return this.graphqlClientService.executeMutation(SEND_EMAIL_OTP, { userDetails })
  }

  verifyOTP<T>(otpDetails: IVerifyOTPArguments) {
    return this.graphqlClientService.executeMutation<T, IVerifyOTPArguments>(VERIFY_OTP, otpDetails);
  }

  sendResetPasswordLink<T>(email: string) {
    return this.graphqlClientService.executeMutation<T, { email: string }>(SEND_RESET_PASSWORD_LINK, { email });
  }

  updatePassword<T>(passwordDetails: IUpdatePasswordArguments) {
    return this.graphqlClientService.executeMutation<T, IUpdatePasswordArguments>(UPDATE_PASSWORD, passwordDetails);
  }

  sendChangeEmailLink<T>(email: string) {
    return this.graphqlClientService.executeMutation<T, { email: string }>(SEND_RESET_EMAIL_LINK, { email });
  }

  login(): Observable<ILoginSuccessResponse> {
    return this.graphqlClientService.executeMutation(LOGIN, {});
  }
}
