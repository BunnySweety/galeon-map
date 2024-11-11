import { format, isValid } from 'date-fns';
import { Hospital } from '@/types/hospital';

export const formatDate = (date: Date | string | number): string => {
  const parsedDate = new Date(date);
  return isValid(parsedDate) ? format(parsedDate, 'MMM dd, yyyy') : 'Invalid Date';
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const formatAddress = (address: string): {
  street: string;
  city: string;
  country: string;
  postalCode: string;
} => {
  const parts = address.split(',').map(part => part.trim());
  
  return {
    street: parts[0] || '',
    city: parts[1] || '',
    country: parts[parts.length - 1] || '',
    postalCode: extractPostalCode(address) || ''
  };
};

export const formatHospitalName = (name: string): string => {
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/\s+/g, ' ') // Remove extra spaces
    .trim(); // Trim spaces from ends
};

export const formatStatusLabel = (status: string): string => {
  switch (status) {
    case 'Deployed':
      return '✓ Deployed';
    case 'In Progress':
      return '⟳ In Progress';
    case 'Signed':
      return '✎ Signed';
    default:
      return status;
  }
};

export const formatCoordinates = (lat: number, lon: number): string => {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
};

// Helper functions
const extractPostalCode = (address: string): string => {
  // Common postal code patterns
  const patterns = [
    /\b[0-9]{5}\b/, // US ZIP
    /\b[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]\b/i, // Canadian
    /\b[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}\b/i, // UK
    /\b[0-9]{4}\s?[A-Z]{2}\b/i, // Netherlands
    /\b[0-9]{4,6}\b/ // Generic numeric
  ];

  for (const pattern of patterns) {
    const match = address.match(pattern);
    if (match) return match[0];
  }

  return '';
};