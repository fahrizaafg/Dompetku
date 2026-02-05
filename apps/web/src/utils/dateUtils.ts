
/**
 * Returns a date object representing the current time in the user's local timezone
 */
export const getLocalTime = (): Date => {
  return new Date();
};

/**
 * Returns an ISO-like string (YYYY-MM-DDTHH:mm:ss.sss) preserving the local time values
 * This is useful for storing timestamps that should appear as the user sees them locally,
 * avoiding UTC conversion shifts.
 */
export const getLocalISOString = (): string => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const localTime = new Date(now.getTime() - offsetMs);
  return localTime.toISOString().slice(0, -1); // Remove 'Z'
};

/**
 * Formats a date string or object into a display string
 * @param date Date object or string
 * @param options Intl.DateTimeFormatOptions
 */
export const formatDate = (date: string | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', options);
};

/**
 * Formats a date string or object into a time string (HH:mm)
 */
export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
};
