export interface ICommonAPIResponse<T = {}> {
  [key: string]: T & ICommonResponse;
}

export interface ICommonErrorResponse {
  message: string;
}

export interface ICommonSuccessResponse extends ICommonResponse {
  attempt?: string;
}

export interface ICommonResponse {
  code: string;
  message: string;
  success: string;
}