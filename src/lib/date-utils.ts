import { formatDistanceToNow } from 'date-fns';

/**
 * Safely formats a date using formatDistanceToNow with proper error handling
 * @param dateInput - The date to format (string, number, or Date object)
 * @param options - Options to pass to formatDistanceToNow
 * @returns Formatted date string or "Unknown" if the date is invalid
 */
export function safeFormatDistanceToNow(
  dateInput: string | number | Date,
  options?: { addSuffix?: boolean }
): string {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return "Unknown";
    }
    return formatDistanceToNow(date, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown";
  }
}

/**
 * Safely formats a date using toLocaleDateString with proper error handling
 * @param dateInput - The date to format (string, number, or Date object)
 * @param options - Options to pass to toLocaleDateString
 * @returns Formatted date string or "Unknown" if the date is invalid
 */
export function safeFormatDate(
  dateInput: string | number | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return "Unknown";
    }
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown";
  }
}
