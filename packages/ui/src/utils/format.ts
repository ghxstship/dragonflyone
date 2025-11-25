export const formatters = {
  currency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  number: (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  percentage: (value: number, decimals: number = 0): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  date: (date: Date | string, format: 'short' | 'long' | 'iso' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'iso') {
      return d.toISOString();
    }
    
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: format === 'long' ? 'long' : 'medium',
    }).format(d);
  },

  datetime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  },

  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return phone;
  },

  truncate: (text: string, length: number, suffix: string = '...'): string => {
    if (text.length <= length) return text;
    return text.slice(0, length) + suffix;
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  titleCase: (text: string): string => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  fileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },

  pluralize: (count: number, singular: string, plural?: string): string => {
    if (count === 1) return singular;
    return plural || `${singular}s`;
  },
};
