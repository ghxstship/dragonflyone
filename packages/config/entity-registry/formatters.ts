/**
 * Centralized Formatters
 * 
 * Single source of truth for data formatting across all entities.
 * Eliminates inconsistent date, currency, and number formatting.
 */

// ============================================================================
// Date Formatters
// ============================================================================

/**
 * Date format options
 */
export interface DateFormatOptions {
  locale?: string;
  format?: 'short' | 'medium' | 'long' | 'full' | 'relative';
  includeTime?: boolean;
  timeFormat?: '12h' | '24h';
}

/**
 * Format a date string or Date object
 */
export function formatDate(
  value: string | Date | null | undefined,
  options: DateFormatOptions = {}
): string {
  if (!value) return '—';
  
  const {
    locale = 'en-US',
    format = 'medium',
    includeTime = false,
    timeFormat = '12h',
  } = options;
  
  const date = typeof value === 'string' ? new Date(value) : value;
  
  if (isNaN(date.getTime())) return '—';
  
  // Relative formatting
  if (format === 'relative') {
    return formatRelativeDate(date);
  }
  
  // Standard date formats
  const formatMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  };
  const dateOptions: Intl.DateTimeFormatOptions = formatMap[format] || formatMap.medium;
  
  if (includeTime) {
    dateOptions.hour = 'numeric';
    dateOptions.minute = '2-digit';
    dateOptions.hour12 = timeFormat === '12h';
  }
  
  return new Intl.DateTimeFormat(locale, dateOptions).format(date);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
  return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`;
}

/**
 * Format a datetime for display
 */
export function formatDateTime(
  value: string | Date | null | undefined,
  options: DateFormatOptions = {}
): string {
  return formatDate(value, { ...options, includeTime: true });
}

/**
 * Format a time only
 */
export function formatTime(
  value: string | Date | null | undefined,
  options: { locale?: string; format?: '12h' | '24h' } = {}
): string {
  if (!value) return '—';
  
  const { locale = 'en-US', format = '12h' } = options;
  const date = typeof value === 'string' ? new Date(value) : value;
  
  if (isNaN(date.getTime())) return '—';
  
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
  }).format(date);
}

/**
 * Format a date range
 */
export function formatDateRange(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
  options: DateFormatOptions = {}
): string {
  const startStr = formatDate(start, options);
  const endStr = formatDate(end, options);
  
  if (startStr === '—' && endStr === '—') return '—';
  if (startStr === '—') return `Until ${endStr}`;
  if (endStr === '—') return `From ${startStr}`;
  if (startStr === endStr) return startStr;
  
  return `${startStr} – ${endStr}`;
}

// ============================================================================
// Currency Formatters
// ============================================================================

/**
 * Currency format options
 */
export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
  showCurrency?: boolean;
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  if (value === null || value === undefined || value === '') return '$0';
  
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    compact = false,
    showCurrency = true,
  } = options;
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '$0';
  
  const formatOptions: Intl.NumberFormatOptions = {
    style: showCurrency ? 'currency' : 'decimal',
    currency: showCurrency ? currency : undefined,
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
  };
  
  return new Intl.NumberFormat(locale, formatOptions).format(numValue);
}

/**
 * Format currency with compact notation for large values
 */
export function formatCurrencyCompact(
  value: number | string | null | undefined,
  options: Omit<CurrencyFormatOptions, 'compact'> = {}
): string {
  return formatCurrency(value, { ...options, compact: true });
}

// ============================================================================
// Number Formatters
// ============================================================================

/**
 * Number format options
 */
export interface NumberFormatOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
  prefix?: string;
  suffix?: string;
}

/**
 * Format a number
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: NumberFormatOptions = {}
): string {
  if (value === null || value === undefined || value === '') return '0';
  
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    compact = false,
    prefix = '',
    suffix = '',
  } = options;
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
  }).format(numValue);
  
  return `${prefix}${formatted}${suffix}`;
}

/**
 * Format a number with compact notation
 */
export function formatNumberCompact(
  value: number | string | null | undefined,
  options: Omit<NumberFormatOptions, 'compact'> = {}
): string {
  return formatNumber(value, { ...options, compact: true });
}

/**
 * Format a percentage
 */
export function formatPercentage(
  value: number | string | null | undefined,
  options: { locale?: string; decimals?: number; includeSign?: boolean } = {}
): string {
  if (value === null || value === undefined || value === '') return '0%';
  
  const { locale = 'en-US', decimals = 0, includeSign = false } = options;
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  const formatted = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue / 100);
  
  if (includeSign && numValue > 0) {
    return `+${formatted}`;
  }
  
  return formatted;
}

// ============================================================================
// Text Formatters
// ============================================================================

/**
 * Truncate text with ellipsis
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number,
  ellipsis = '...'
): string {
  if (!text) return '—';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Format a name (first + last)
 */
export function formatName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  options: { format?: 'full' | 'firstLast' | 'lastFirst' | 'initials' } = {}
): string {
  const { format = 'full' } = options;
  
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  if (!first && !last) return '—';
  
  switch (format) {
    case 'initials':
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    case 'lastFirst':
      return last ? `${last}, ${first}`.trim() : first;
    case 'firstLast':
    case 'full':
    default:
      return `${first} ${last}`.trim();
  }
}

/**
 * Format a phone number
 */
export function formatPhone(
  phone: string | null | undefined,
  _options: { format?: 'national' | 'international' } = {}
): string {
  if (!phone) return '—';
  
  // Remove all non-digits - format option reserved for future international formatting
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    // US format
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  if (digits.length === 11 && digits.startsWith('1')) {
    // US with country code
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Return as-is for other formats
  return phone;
}

/**
 * Format an email (with optional masking)
 */
export function formatEmail(
  email: string | null | undefined,
  options: { mask?: boolean } = {}
): string {
  if (!email) return '—';
  
  if (options.mask) {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
    return `${maskedLocal}@${domain}`;
  }
  
  return email;
}

/**
 * Format a status string for display
 */
export function formatStatus(status: string | null | undefined): string {
  if (!status) return '—';
  
  return status
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format a slug/key for display
 */
export function formatSlug(slug: string | null | undefined): string {
  if (!slug) return '—';
  
  return slug
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ============================================================================
// ID Formatters
// ============================================================================

/**
 * Format a UUID for display (shortened)
 */
export function formatId(
  id: string | null | undefined,
  options: { length?: number; uppercase?: boolean } = {}
): string {
  if (!id) return '—';
  
  const { length = 8, uppercase = true } = options;
  const shortened = id.replace(/-/g, '').slice(0, length);
  
  return uppercase ? shortened.toUpperCase() : shortened;
}

/**
 * Format an order/reference number
 */
export function formatOrderNumber(
  number: string | null | undefined,
  options: { prefix?: string } = {}
): string {
  if (!number) return '—';
  
  const { prefix } = options;
  
  if (prefix && !number.startsWith(prefix)) {
    return `${prefix}${number}`;
  }
  
  return number;
}

// ============================================================================
// Boolean Formatters
// ============================================================================

/**
 * Format a boolean value
 */
export function formatBoolean(
  value: boolean | null | undefined,
  options: { trueLabel?: string; falseLabel?: string; nullLabel?: string } = {}
): string {
  const { trueLabel = 'Yes', falseLabel = 'No', nullLabel = '—' } = options;
  
  if (value === null || value === undefined) return nullLabel;
  return value ? trueLabel : falseLabel;
}

// ============================================================================
// File Size Formatters
// ============================================================================

/**
 * Format file size in bytes to human readable
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '—';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

// ============================================================================
// Duration Formatters
// ============================================================================

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(
  minutes: number | null | undefined,
  options: { format?: 'short' | 'long' } = {}
): string {
  if (minutes === null || minutes === undefined) return '—';
  
  const { format = 'short' } = options;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (format === 'long') {
    if (hours === 0) return `${mins} minute${mins === 1 ? '' : 's'}`;
    if (mins === 0) return `${hours} hour${hours === 1 ? '' : 's'}`;
    return `${hours} hour${hours === 1 ? '' : 's'} ${mins} minute${mins === 1 ? '' : 's'}`;
  }
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// ============================================================================
// Address Formatters
// ============================================================================

/**
 * Format an address object
 */
export function formatAddress(
  address: {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  } | null | undefined,
  options: { format?: 'single' | 'multi' } = {}
): string {
  if (!address) return '—';
  
  const { format = 'single' } = options;
  const parts: string[] = [];
  
  if (address.street) parts.push(address.street);
  if (address.street2) parts.push(address.street2);
  
  const cityStateZip = [
    address.city,
    address.state,
    address.zip,
  ].filter(Boolean).join(', ');
  
  if (cityStateZip) parts.push(cityStateZip);
  if (address.country) parts.push(address.country);
  
  if (parts.length === 0) return '—';
  
  return format === 'multi' ? parts.join('\n') : parts.join(', ');
}

// ============================================================================
// Export All
// ============================================================================

export const formatters = {
  date: formatDate,
  dateTime: formatDateTime,
  time: formatTime,
  dateRange: formatDateRange,
  relativeDate: formatRelativeDate,
  currency: formatCurrency,
  currencyCompact: formatCurrencyCompact,
  number: formatNumber,
  numberCompact: formatNumberCompact,
  percentage: formatPercentage,
  text: truncateText,
  name: formatName,
  phone: formatPhone,
  email: formatEmail,
  status: formatStatus,
  slug: formatSlug,
  id: formatId,
  orderNumber: formatOrderNumber,
  boolean: formatBoolean,
  fileSize: formatFileSize,
  duration: formatDuration,
  address: formatAddress,
};
