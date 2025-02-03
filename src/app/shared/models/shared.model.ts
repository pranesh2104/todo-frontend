export interface ICommonAPIResponse {
  [key: string]: ICommonResponse
}

export interface ICommonSuccessResponse extends ICommonResponse {
  attempt?: string;
}

export interface ICommonErrorResponse {
  message: string;
}

export interface ICommonResponse {
  code: string;
  message: string;
  success: string;
}