interface GeocodingResult {
    lat: number;
    lon: number;
    address: string;
    country: string;
    city: string;
    confidence: number;
  }
  
  class GeocodingService {
    private static instance: GeocodingService;
    private cache: Map<string, GeocodingResult>;
    private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    private readonly API_URL = 'https://nominatim.openstreetmap.org';
    private lastRequest: number = 0;
    private readonly REQUEST_DELAY = 1000; // 1 second between requests
  
    private constructor() {
      this.cache = new Map();
      this.loadCacheFromStorage();
    }
  
    public static getInstance(): GeocodingService {
      if (!GeocodingService.instance) {
        GeocodingService.instance = new GeocodingService();
      }
      return GeocodingService.instance;
    }
  
    public async geocode(address: string): Promise<GeocodingResult> {
      const cacheKey = this.createCacheKey(address);
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) return cachedResult;
  
      await this.throttleRequest();
  
      try {
        const result = await this.makeGeocodeRequest(address);
        this.addToCache(cacheKey, result);
        return result;
      } catch (error) {
        console.error('Geocoding failed:', error);
        throw new Error('Failed to geocode address');
      }
    }
  
    public async reverseGeocode(lat: number, lon: number): Promise<GeocodingResult> {
      const cacheKey = this.createCacheKey(`${lat},${lon}`);
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) return cachedResult;
  
      await this.throttleRequest();
  
      try {
        const result = await this.makeReverseGeocodeRequest(lat, lon);
        this.addToCache(cacheKey, result);
        return result;
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        throw new Error('Failed to reverse geocode coordinates');
      }
    }
  
    private async makeGeocodeRequest(address: string): Promise<GeocodingResult> {
      const params = new URLSearchParams({
        q: address,
        format: 'json',
        addressdetails: '1',
        limit: '1'
      });
  
      const response = await fetch(`${this.API_URL}/search?${params}`);
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
  
      const data = await response.json();
      if (!data.length) {
        throw new Error('No results found');
      }
  
      return this.formatResult(data[0]);
    }
  
    private async makeReverseGeocodeRequest(lat: number, lon: number): Promise<GeocodingResult> {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        addressdetails: '1'
      });
  
      const response = await fetch(`${this.API_URL}/reverse?${params}`);
      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }
  
      const data = await response.json();
      return this.formatResult(data);
    }
  
    private formatResult(data: any): GeocodingResult {
      return {
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        address: data.display_name,
        country: data.address?.country || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        confidence: parseFloat(data.importance || 0)
      };
    }
  
    private createCacheKey(input: string): string {
      return input.toLowerCase().trim();
    }
  
    private getFromCache(key: string): GeocodingResult | undefined {
      const cached = this.cache.get(key);
      if (cached) {
        if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
          this.cache.delete(key);
          return undefined;
        }
        return cached.result;
      }
      return undefined;
    }
  
    private addToCache(key: string, result: GeocodingResult): void {
      this.cache.set(key, {
        result,
        timestamp: Date.now()
      });
      this.saveCacheToStorage();
    }
  
    private async throttleRequest(): Promise<void> {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;
      
      if (timeSinceLastRequest < this.REQUEST_DELAY) {
        await new Promise(resolve => 
          setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest)
        );
      }
      
      this.lastRequest = Date.now();
    }
  
    private saveCacheToStorage(): void {
      try {
        const cacheData = Array.from(this.cache.entries()).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
    interface GeocodingResult {
  lat: number;
  lon: number;
  address: string;
  country: string;
  city: string;
  confidence: number;
}

class GeocodingService {
  private static instance: GeocodingService;
  private cache: Map<string, GeocodingResult>;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly API_URL = 'https://nominatim.openstreetmap.org';
  private lastRequest: number = 0;
  private readonly REQUEST_DELAY = 1000; // 1 second between requests

  private constructor() {
    this.cache = new Map();
    this.loadCacheFromStorage();
  }

  public static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  public async geocode(address: string): Promise<GeocodingResult> {
    const cacheKey = this.createCacheKey(address);
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) return cachedResult;

    await this.throttleRequest();

    try {
      const result = await this.makeGeocodeRequest(address);
      this.addToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Geocoding failed:', error);
      throw new Error('Failed to geocode address');
    }
  }

  public async reverseGeocode(lat: number, lon: number): Promise<GeocodingResult> {
    const cacheKey = this.createCacheKey(`${lat},${lon}`);
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) return cachedResult;

    await this.throttleRequest();

    try {
      const result = await this.makeReverseGeocodeRequest(lat, lon);
      this.addToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  private async makeGeocodeRequest(address: string): Promise<GeocodingResult> {
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      addressdetails: '1',
      limit: '1'
    });

    const response = await fetch(`${this.API_URL}/search?${params}`);
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    if (!data.length) {
      throw new Error('No results found');
    }

    return this.formatResult(data[0]);
  }

  private async makeReverseGeocodeRequest(lat: number, lon: number): Promise<GeocodingResult> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'json',
      addressdetails: '1'
    });

    const response = await fetch(`${this.API_URL}/reverse?${params}`);
    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data = await response.json();
    return this.formatResult(data);
  }

  private formatResult(data: any): GeocodingResult {
    return {
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      address: data.display_name,
      country: data.address?.country || '',
      city: data.address?.city || data.address?.town || data.address?.village || '',
      confidence: parseFloat(data.importance || 0)
    };
  }

  private createCacheKey(input: string): string {
    return input.toLowerCase().trim();
  }

  private getFromCache(key: string): GeocodingResult | undefined {
    const cached = this.cache.get(key);
    if (cached) {
      if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
        return undefined;
      }
      return cached.result;
    }
    return undefined;
  }

  private addToCache(key: string, result: GeocodingResult): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
    this.saveCacheToStorage();
  }

  private async throttleRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest)
      );
    }
    
    this.lastRequest = Date.now();
  }

  private saveCacheToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {} as Record<string, any>);

    localStorage.setItem('geocoding-cache', JSON.stringify(cacheData));
} catch (error) {
  console.error('Failed to save geocoding cache:', error);
}
}

private loadCacheFromStorage(): void {
try {
  const cached = localStorage.getItem('geocoding-cache');
  if (cached) {
    const data = JSON.parse(cached);
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      if (Date.now() - value.timestamp <= this.CACHE_DURATION) {
        this.cache.set(key, value);
      }
    });
  }
} catch (error) {
  console.error('Failed to load geocoding cache:', error);
}
}

public clearCache(): void {
this.cache.clear();
localStorage.removeItem('geocoding-cache');
}
}

export const geocodingService = GeocodingService.getInstance();
export default geocodingService;