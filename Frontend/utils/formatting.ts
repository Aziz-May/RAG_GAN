/**
 * Formatting utilities - Date, phone, currency, and text formatters
 */

/**
 * Format date to readable string
 * @example formatDate("2024-11-02T10:30:00") => "Nov 2, 2024 at 10:30 AM"
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'long'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return 'Invalid date';

  let options: Intl.DateTimeFormatOptions;
  
  switch (format) {
    case 'short':
      options = { month: 'short', day: 'numeric', year: 'numeric' };
      break;
    case 'long':
      options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      break;
    case 'time':
      options = { hour: '2-digit', minute: '2-digit', hour12: true };
      break;
  }

  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Format time difference (e.g., "2 hours ago")
 */
export const formatTimeAgo = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

/**
 * Format phone number
 * @example formatPhone("1234567890") => "(123) 456-7890"
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
};

/**
 * Format currency
 * @example formatCurrency(99.99) => "$99.99"
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format percentage
 * @example formatPercentage(0.85) => "85%"
 */
export const formatPercentage = (decimal: number): string => {
  return `${Math.round(decimal * 100)}%`;
};

/**
 * Truncate text
 * @example truncate("Hello World", 5) => "Hello..."
 */
export const truncate = (text: string, length: number, suffix = '...'): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + suffix;
};

/**
 * Capitalize first letter
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Title case (capitalize each word)
 */
export const titleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Format bytes to human readable
 * @example formatBytes(1024) => "1.00 KB"
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
