import { Hospital } from '@/types/hospital';

export const validators = {
  coordinates: {
    isValid: (lat: number, lon: number): boolean => {
      return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    },
    format: (lat: number, lon: number): string => {
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  },

  website: {
    isValid: (url: string): boolean => {
      try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
      } catch {
        return false;
      }
    },
    sanitize: (url: string): string => {
      if (!url) return '';
      url = url.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      return url;
    }
  },

  hospital: {
    isValid: (hospital: Partial<Hospital>): boolean => {
      if (!hospital) return false;
      
      // Required fields
      if (!hospital.name?.trim() || 
          !hospital.address?.trim() || 
          typeof hospital.lat !== 'number' || 
          typeof hospital.lon !== 'number') {
        return false;
      }

      // Validate coordinates
      if (!validators.coordinates.isValid(hospital.lat, hospital.lon)) {
        return false;
      }

      // Validate status
      if (!['Deployed', 'In Progress', 'Signed'].includes(hospital.status || '')) {
        return false;
      }

      // Validate website if provided
      if (hospital.website && !validators.website.isValid(hospital.website)) {
        return false;
      }

      return true;
    },

    hasRequiredFields: (hospital: Partial<Hospital>): boolean => {
      return !!(
        hospital.name?.trim() &&
        hospital.address?.trim() &&
        typeof hospital.lat === 'number' &&
        typeof hospital.lon === 'number' &&
        hospital.status
      );
    }
  },

  input: {
    sanitize: (input: string): string => {
      if (!input) return '';
      // Remove HTML tags and special characters
      return input
        .replace(/<[^>]*>/g, '')
        .replace(/[<>'"]/g, '')
        .trim();
    },

    maxLength: (input: string, maxLength: number): string => {
      return input.slice(0, maxLength);
    },

    isValidSearch: (term: string): boolean => {
      return term.length >= 2 && !/[<>]/.test(term);
    }
  },

  image: {
    isValidUrl: (url: string): boolean => {
      if (!url) return false;
      return /^https?:\/\/.*\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url);
    },

    maxSize: 5 * 1024 * 1024, // 5MB

    isValidSize: async (url: string): Promise<boolean> => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const size = parseInt(response.headers.get('content-length') || '0');
        return size > 0 && size <= validators.image.maxSize;
      } catch {
        return false;
      }
    }
  }
};

export const validateHospitalData = (data: Partial<Hospital>): string[] => {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.address?.trim()) {
    errors.push('Address is required');
  }

  if (typeof data.lat !== 'number' || typeof data.lon !== 'number') {
    errors.push('Valid coordinates are required');
  } else if (!validators.coordinates.isValid(data.lat, data.lon)) {
    errors.push('Invalid coordinates');
  }

  if (!data.status) {
    errors.push('Status is required');
  } else if (!['Deployed', 'In Progress', 'Signed'].includes(data.status)) {
    errors.push('Invalid status');
  }

  if (data.website && !validators.website.isValid(data.website)) {
    errors.push('Invalid website URL');
  }

  if (data.imageUrl && !validators.image.isValidUrl(data.imageUrl)) {
    errors.push('Invalid image URL');
  }

  return errors;
};

export default validators;