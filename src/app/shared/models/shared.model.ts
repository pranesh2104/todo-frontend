export interface ICommonAPIResponse {
  [key: string]: ICommonResponse
}

export interface ICommonResponse {
  code: string;
  message: string;
  success: string;
  attempt?: string;
}