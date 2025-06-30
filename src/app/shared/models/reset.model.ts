/**
 * Interface describing the dynamic data structure returned by getMessage.
 */
export interface EMAIL_DYNAMIC_DATA {
  /**
   * Icon name (e.g., material icon string)
   */
  icon: string;
  /**
   * Title of the message
   */
  title: string;
  /**
   * Detailed message text
   */
  message: string;
  /**
   * Text color CSS class
   */
  color: string;
  /**
   * Background color CSS class
   */
  bgColor: string;
  /**
   * Border color CSS class
   */
  borderColor: string;
  /**
   * Icon color CSS class
   */
  iconColor: string;
}