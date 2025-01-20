export interface CommonAPIResponse {
  [key: string]: CommonResponse
}

export interface CommonResponse {
  code: string;
  message: string;
  success: string;
  attempt?: string;
}