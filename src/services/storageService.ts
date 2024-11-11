interface StorageItem<T> {
    value: T;
    timestamp: number;
    version: string;
  }
  
  class StorageService {
    private readonly VERSION = '1.0.0';
    private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
    setItem<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): void {
      try {
        const item: StorageItem<T> = {
          value,
          timestamp: Date.now(),
          version: this.VERSION
        };
  
        localStorage.setItem(key, JSON.stringify(item));
  
        // Set expiration
        this.setExpiration(key, ttl);
      } catch (error) {
        console.error('Failed to store item:', error);
        // Try to remove the item if storage is full
        this.removeOldestItem();
        // Retry storage
        try {
          localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
        } catch (retryError) {
          console.error('Storage retry failed:', retryError);
        }
      }
    }
  
    getItem<T>(key: string): T | null {
      try {
        const item = localStorage.getItem(key);
        if (!item) return null;
  
        const parsedItem: StorageItem<T> = JSON.parse(item);
  
        // Version check
        if (parsedItem.version !== this.VERSION) {
          this.removeItem(key);
          return null;
        }
  
        // Check expiration
        if (this.isExpired(key)) {
          this.removeItem(key);
          return null;
        }
  
        return parsedItem.value;
      } catch (error) {
        console.error('Failed to retrieve item:', error);
        return null;
      }
    }
  
    removeItem(key: string): void {
      try {
        localStorage.removeItem(key);
        this.removeExpiration(key);
      } catch (error) {
        console.error('Failed to remove item:', error);
      }
    }
  
    clear(): void {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Failed to clear storage:', error);
      }
    }
  
    private setExpiration(key: string, ttl: number): void {
      const expirationKey = `${key}_expiration`;
      const expirationTime = Date.now() + ttl;
      localStorage.setItem(expirationKey, expirationTime.toString());
    }
  
    private isExpired(key: string): boolean {
      const expirationKey = `${key}_expiration`;
      const expirationTime = localStorage.getItem(expirationKey);
      
      if (!expirationTime) return true;
      
      return Date.now() > parseInt(expirationTime);
    }
  
    private removeExpiration(key: string): void {
      const expirationKey = `${key}_expiration`;
      localStorage.removeItem(expirationKey);
    }
  
    private removeOldestItem(): void {
      let oldestKey: string | null = null;
      let oldestTimestamp = Date.now();
  
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
  
        try {
          const item = localStorage.getItem(key);
          if (!item) continue;
  
          const parsedItem: StorageItem<any> = JSON.parse(item);
          if (parsedItem.timestamp < oldestTimestamp) {
            oldestTimestamp = parsedItem.timestamp;
            oldestKey = key;
          }
        } catch (error) {
          continue;
        }
      }
  
      if (oldestKey) {
        this.removeItem(oldestKey);
      }
    }
  
    // Utility methods
    setUserPreferences(preferences: Record<string, any>): void {
      this.setItem('user_preferences', preferences, 365 * 24 * 60 * 60 * 1000); // 1 year
    }
  
    getUserPreferences(): Record<string, any> | null {
      return this.getItem('user_preferences');
    }
  
    setMapState(state: Record<string, any>): void {
      this.setItem('map_state', state);
    }
  
    getMapState(): Record<string, any> | null {
      return this.getItem('map_state');
    }
  }
  
  export const storageService = new StorageService();
  export default storageService;