import { Injectable } from '@angular/core';
import { GraphqlClientService } from '../../../shared/services/graphql-client.service';
import { CHANGE_PASSWORD, CHECK_EMAIL, CREATE_USER, DELETE_ACCOUNT, LOGIN, REQUEST_EMAIL_VERIFICATION, SEND_EMAIL_OTP, SEND_RESET_PASSWORD_LINK, SIGNED_OUT, UPDATE_EMAIL, UPDATE_NAME, UPDATE_PASSWORD, VERIFY_OTP, VERIFY_PASSWORD } from '../graphql/auth.query';
import { Observable } from 'rxjs';
import { CreateUserArguments, ICreateUserDetails, IEmailCheckResponse, ILoginSuccessResponse, SendEmailOTPArguments, IUpdatePasswordArguments, IVerifyOTPArguments } from '../models/auth.model';
import { ICommonAPIResponse } from '@shared/models/shared.model';

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

  updateEmail<ICommonAPIResponse>(token: string) {
    return this.graphqlClientService.executeMutation<ICommonAPIResponse, { token: string }>(UPDATE_EMAIL, { token });
  }

  verifyPasswordToken(token: string) {
    return this.graphqlClientService.executeMutation<ICommonAPIResponse, { token: string }>(UPDATE_EMAIL, { token });
  }

  changePassword<T>(password: string) {
    return this.graphqlClientService.executeMutation<T, { password: string }>(CHANGE_PASSWORD, { password });
  }

  verifyPassword(password: string) {
    return this.graphqlClientService.executeMutation<ICommonAPIResponse, { password: string }>(VERIFY_PASSWORD, { password });
  }

  requestEmailVerification(email: string) {
    return this.graphqlClientService.executeMutation<ICommonAPIResponse, { email: string }>(REQUEST_EMAIL_VERIFICATION, { email });
  }

  updateName(name: string) {
    return this.graphqlClientService.executeMutation<ICommonAPIResponse, { name: string }>(UPDATE_NAME, { name });
  }

  signOut() {
    return this.graphqlClientService.executeMutation<ICommonAPIResponse, {}>(SIGNED_OUT, {});
  }

  deleteAccount() {
    return this.graphqlClientService.executeMutation<ICommonAPIResponse, {}>(DELETE_ACCOUNT, {});
  }

  login(): Observable<ILoginSuccessResponse> {
    return this.graphqlClientService.executeMutation(LOGIN, {});
  }
}
