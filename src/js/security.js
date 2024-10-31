/**
 * @fileoverview Security configuration and management for the hospital map application
 * @author BunnySweety
 * @version 1.0.0
 */

/**
 * Security configuration constants
 */
export const SecurityConfig = {
    CSP_HEADERS: {
      'default-src': ["'self'"],
      'script-src': ["'self'", 'https://cdnjs.cloudflare.com'],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"]
    },
    VALIDATION: {
      MAX_ZOOM_LEVEL: 18,
      MIN_ZOOM_LEVEL: 3,
      MAX_BOUNDS: [[-90, -180], [90, 180]],
      INPUT_MAX_LENGTH: 100,
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
      ALLOWED_ATTRS: ['href', 'title', 'target'],
      URL_PROTOCOLS: ['http:', 'https:', 'mailto:', 'tel:']
    },
    RATE_LIMIT: {
      MAX_REQUESTS: 100,
      TIME_WINDOW: 60000, // 1 minute
      CLEANUP_INTERVAL: 300000 // 5 minutes
    },
    ERROR_MESSAGES: {
      RATE_LIMIT: 'Too many requests. Please try again later.',
      INVALID_INPUT: 'Invalid input detected.',
      INVALID_COORDINATES: 'Invalid coordinates provided.',
      UNAUTHORIZED: 'Unauthorized access.',
      VALIDATION_FAILED: 'Input validation failed.'
    }
  };
  
  /**
   * Security Manager Class
   * Handles all security-related operations
   */
  export class SecurityManager {
    static #instance = null;
    #requestCount = new Map();
    #cleanupInterval = null;
  
    constructor() {
      if (SecurityManager.#instance) {
        return SecurityManager.#instance;
      }
      SecurityManager.#instance = this;
      this.initializeSecurityMeasures();
    }
  
    /**
     * Get singleton instance
     */
    static getInstance() {
      if (!SecurityManager.#instance) {
        SecurityManager.#instance = new SecurityManager();
      }
      return SecurityManager.#instance;
    }
  
    /**
     * Initialize security measures
     */
    initializeSecurityMeasures() {
      this.setupRateLimitCleanup();
      this.setupCSPHeaders();
      this.setupEventListeners();
    }
  
    /**
     * Setup CSP headers
     */
    setupCSPHeaders() {
      const cspString = Object.entries(SecurityConfig.CSP_HEADERS)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');
      
      if (document.head) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = cspString;
        document.head.appendChild(meta);
      }
    }
  
    /**
     * Setup rate limit cleanup
     */
    setupRateLimitCleanup() {
      this.#cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [clientId, requests] of this.#requestCount.entries()) {
          const validRequests = requests.filter(
            time => now - time < SecurityConfig.RATE_LIMIT.TIME_WINDOW
          );
          if (validRequests.length === 0) {
            this.#requestCount.delete(clientId);
          } else {
            this.#requestCount.set(clientId, validRequests);
          }
        }
      }, SecurityConfig.RATE_LIMIT.CLEANUP_INTERVAL);
    }
  
    /**
     * Setup security event listeners
     */
    setupEventListeners() {
      window.addEventListener('securitypolicyviolation', this.handleCSPViolation.bind(this));
    }
  
    /**
     * Handle CSP violations
     */
    handleCSPViolation(e) {
      console.error('CSP Violation:', {
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        documentURI: e.documentURI
      });
    }
  
    /**
     * Sanitize input string
     */
    sanitizeInput(input) {
      if (!input) return '';
      
      return input
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .slice(0, SecurityConfig.VALIDATION.INPUT_MAX_LENGTH)
        .trim();
    }
  
    /**
     * Validate coordinates
     */
    validateCoordinates(lat, lon) {
      return !isNaN(lat) && !isNaN(lon) &&
             lat >= SecurityConfig.VALIDATION.MAX_BOUNDS[0][0] &&
             lat <= SecurityConfig.VALIDATION.MAX_BOUNDS[1][0] &&
             lon >= SecurityConfig.VALIDATION.MAX_BOUNDS[0][1] &&
             lon <= SecurityConfig.VALIDATION.MAX_BOUNDS[1][1];
    }
  
    /**
     * Check rate limit
     */
    checkRateLimit(clientId) {
      const now = Date.now();
      const clientRequests = this.#requestCount.get(clientId) || [];
      
      const recentRequests = clientRequests.filter(
        time => now - time < SecurityConfig.RATE_LIMIT.TIME_WINDOW
      );
      
      if (recentRequests.length >= SecurityConfig.RATE_LIMIT.MAX_REQUESTS) {
        return false;
      }
      
      recentRequests.push(now);
      this.#requestCount.set(clientId, recentRequests);
      return true;
    }
  
    /**
     * Validate URL
     */
    validateUrl(url) {
      try {
        const urlObject = new URL(url);
        return SecurityConfig.VALIDATION.URL_PROTOCOLS.includes(urlObject.protocol);
      } catch {
        return false;
      }
    }
  
    /**
     * Cleanup
     */
    destroy() {
      if (this.#cleanupInterval) {
        clearInterval(this.#cleanupInterval);
      }
      this.#requestCount.clear();
      window.removeEventListener('securitypolicyviolation', this.handleCSPViolation);
      SecurityManager.#instance = null;
    }
  }