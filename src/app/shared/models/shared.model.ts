/**
 * Represents the base structure for common API response properties.
 * 
 * - `code`: A string representing the response code (e.g., HTTP status or custom code).
 * - `message`: A descriptive message about the response.
 * - `success`: A string indicating whether the operation was successful (e.g., 'true'/'false').
*/
export interface ICommonResponse {
  code: string;
  message: string;
  success: string;
}
/**
 * Generic interface representing a common API response object.
 * 
 * This interface is an index signature with dynamic keys, where each key maps to a value
 * that merges a generic type `T` with the `ICommonResponse` base interface.
 * 
 * For example, if `T` defines the data shape, this interface represents an API response
 * object that contains one or more keys, each holding a data payload combined with response metadata.
 * 
 * @template T - The type of the payload data included in the response.
 */
export interface ICommonAPIResponse<T = {}> {
  [key: string]: T & ICommonResponse;
}
/**
 * Represents a common error response structure.
 * 
 * - `message`: A string describing the error.
 */
export interface ICommonErrorResponse {
  message: string;
}
/**
 * Extends ICommonResponse for successful API responses.
 * 
 * - `attempt` (optional): Additional info, such as retry attempt count or status.
 */
export interface ICommonSuccessResponse extends ICommonResponse {
  attempt?: string;
}