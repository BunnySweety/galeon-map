/**
 * @fileoverview Security configuration and management for the hospital map application
 * @author BunnySweety
 * @version 2.0.0
 * @license MIT
 * @module security
 */

/**
 * Security configuration constants
 * @constant
 * @type {Object}
 */
const SecurityConfig = {
  /**
   * Content Security Policy headers configuration
   * @type {Object.<string, Array<string>>}
   */
  CSP_HEADERS: {
      'default-src': ["'self'"],
      'script-src': ["'self'", 'https://unpkg.com'],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'font-src': ["'self'", 'https://unpkg.com'],
      'worker-src': ["'self'"],
      'manifest-src': ["'self'"],
      'media-src': ["'self'"]
  },

  /**
   * Security validation settings
   * @type {Object}
   */
  VALIDATION: {
      MAX_ZOOM_LEVEL: 18,
      MIN_ZOOM_LEVEL: 3,
      MAX_BOUNDS: [[-90, -180], [90, 180]],
      INPUT_MAX_LENGTH: 100,
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'p', 'br', 'hr'],
      ALLOWED_ATTRS: ['href', 'title', 'target', 'rel', 'class', 'id'],
      URL_PROTOCOLS: ['http:', 'https:', 'mailto:', 'tel:'],
      MAX_URL_LENGTH: 2083,
      SAFE_DOMAINS: [
          'localhost',
          'cdnjs.cloudflare.com',
          'unpkg.com',
          'cartodb.com',
          'openstreetmap.org'
      ],
      COORDINATE_PRECISION: 6,
      PASSWORD_MIN_LENGTH: 8,
      SESSION_TIMEOUT: 3600000 // 1 hour
  },

  /**
   * Rate limiting configuration
   * @type {Object}
   */
  RATE_LIMIT: {
      MAX_REQUESTS: 100,
      TIME_WINDOW: 60000, // 1 minute
      CLEANUP_INTERVAL: 300000, // 5 minutes
      BLOCKED_DURATION: 900000, // 15 minutes
      MAX_VIOLATIONS: 5
  },

  /**
   * Error messages
   * @type {Object.<string, string>}
   */
  ERROR_MESSAGES: {
      RATE_LIMIT: 'Too many requests. Please try again later.',
      INVALID_INPUT: 'Invalid input detected.',
      INVALID_COORDINATES: 'Invalid coordinates provided.',
      UNAUTHORIZED: 'Unauthorized access.',
      VALIDATION_FAILED: 'Input validation failed.',
      XSS_DETECTED: 'Potentially malicious content detected.',
      INVALID_URL: 'Invalid or unsafe URL provided.',
      CSP_VIOLATION: 'Content Security Policy violation detected.',
      INVALID_TOKEN: 'Invalid security token.',
      SESSION_EXPIRED: 'Your session has expired. Please refresh.',
      BLOCKED_IP: 'Access temporarily blocked due to suspicious activity.'
  },

  /**
   * Security enhancement settings
   * @type {Object}
   */
  ENHANCEMENTS: {
      ENABLE_XSS_AUDITOR: true,
      ENABLE_CLICKJACKING_PROTECTION: true,
      ENABLE_MIME_SNIFFING_PROTECTION: true,
      ENABLE_REFERRER_POLICY: true,
      ENABLE_HSTS: true,
      ENABLE_IP_BLOCKING: true,
      ENABLE_REQUEST_LOGGING: true
  }
};

/**
* Security Manager Class
* Handles all security-related operations
* @class
*/
class SecurityManager {
  /**
   * @private
   * @type {SecurityManager}
   */
  static #instance = null;

  /**
   * @private
   * @type {Map<string, Array<number>>}
   */
  #requestCount = new Map();

  /**
   * @private
   * @type {number|null}
   */
  #cleanupInterval = null;

  /**
   * @private
   * @type {Map<string, Object>}
   */
  #securityCache = new Map();

  /**
   * @private
   * @type {Set<string>}
   */
  #blockedIPs = new Set();

  /**
   * Creates an instance of SecurityManager
   * @constructor
   * @throws {Error} If instance already exists (Singleton pattern)
   */
  constructor() {
      if (SecurityManager.#instance) {
          return SecurityManager.#instance;
      }
      SecurityManager.#instance = this;
      this.initializeSecurityMeasures();
  }

  /**
   * Gets singleton instance
   * @static
   * @returns {SecurityManager} Singleton instance
   */
  static getInstance() {
      if (!SecurityManager.#instance) {
          SecurityManager.#instance = new SecurityManager();
      }
      return SecurityManager.#instance;
  }

  /**
   * Initializes security measures
   * @private
   */
  initializeSecurityMeasures() {
      this.setupRateLimitCleanup();
      this.setupCSPHeaders();
      this.setupEventListeners();
      this.setupSecurityCache();
      this.setupSecureHeaders();
  }

  /**
   * Sets up rate limit cleanup
   * @private
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
   * Sets up CSP headers
   * @private
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
   * Sets up secure headers
   * @private
   */
  setupSecureHeaders() {
      const securityHeaders = {
          'X-XSS-Protection': '1; mode=block',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'Feature-Policy': "geolocation 'self'; microphone 'none'; camera 'none'",
          'Access-Control-Allow-Origin': window.location.origin
      };

      // Simulate header setup for frontend
      Object.entries(securityHeaders).forEach(([header, value]) => {
          console.info(`Security header set: ${header}`);
      });
  }

  /**
   * Sets up security event listeners
   * @private
   */
  setupEventListeners() {
      window.addEventListener('securitypolicyviolation', this.handleCSPViolation.bind(this));
      document.addEventListener('input', this.handleUserInput.bind(this));
  }

  /**
   * Sets up security cache
   * @private
   */
  setupSecurityCache() {
      setInterval(() => {
          const now = Date.now();
          for (const [key, value] of this.#securityCache.entries()) {
              if (now - value.timestamp > SecurityConfig.VALIDATION.SESSION_TIMEOUT) {
                  this.#securityCache.delete(key);
              }
          }
      }, SecurityConfig.VALIDATION.SESSION_TIMEOUT);
  }

  /**
   * Sanitizes input string
   * @param {string} input - Input to sanitize
   * @param {Object} [options={}] - Sanitization options
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
      if (!input) return '';

      let sanitized = String(input)
          .slice(0, SecurityConfig.VALIDATION.INPUT_MAX_LENGTH)
          .replace(/<\/?[^>]+(>|$)/g, '')
          .replace(/javascript:/gi, '')
          .replace(/data:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/on\w+=/gi, '')
          .replace(/\\/g, '&#92;')
          .trim();

      // Additional XSS protection
      sanitized = sanitized
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');

      return sanitized;
  }

  /**
   * Validates coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {boolean} Whether coordinates are valid
   */
  validateCoordinates(lat, lon) {
      if (typeof lat !== 'number' || typeof lon !== 'number') return false;

      const validLat = !isNaN(lat) &&
          lat >= SecurityConfig.VALIDATION.MAX_BOUNDS[0][0] &&
          lat <= SecurityConfig.VALIDATION.MAX_BOUNDS[1][0];

      const validLon = !isNaN(lon) &&
          lon >= SecurityConfig.VALIDATION.MAX_BOUNDS[0][1] &&
          lon <= SecurityConfig.VALIDATION.MAX_BOUNDS[1][1];

      return validLat && validLon;
  }

  /**
   * Validates URL
   * @param {string} url - URL to validate
   * @returns {boolean} Whether URL is valid
   */
  validateUrl(url) {
      if (!url || typeof url !== 'string') return false;
      if (url.length > SecurityConfig.VALIDATION.MAX_URL_LENGTH) return false;

      try {
          const urlObject = new URL(url);
          return SecurityConfig.VALIDATION.URL_PROTOCOLS.includes(urlObject.protocol) &&
              this.isAllowedDomain(urlObject.hostname);
      } catch {
          return false;
      }
  }

  /**
   * Checks if domain is allowed
   * @private
   * @param {string} domain - Domain to check
   * @returns {boolean} Whether domain is allowed
   */
  isAllowedDomain(domain) {
      return SecurityConfig.VALIDATION.SAFE_DOMAINS.some(safeDomain =>
          domain === safeDomain || domain.endsWith('.' + safeDomain)
      );
  }

  /**
   * Checks rate limit
   * @param {string} clientId - Client identifier
   * @returns {boolean} Whether request is allowed
   */
  checkRateLimit(clientId) {
      const now = Date.now();
      const clientRequests = this.#requestCount.get(clientId) || [];

      const recentRequests = clientRequests.filter(
          time => now - time < SecurityConfig.RATE_LIMIT.TIME_WINDOW
      );

      if (recentRequests.length >= SecurityConfig.RATE_LIMIT.MAX_REQUESTS) {
          if (!this.#blockedIPs.has(clientId)) {
              this.#blockedIPs.add(clientId);
              setTimeout(() => {
                  this.#blockedIPs.delete(clientId);
              }, SecurityConfig.RATE_LIMIT.BLOCKED_DURATION);
          }
          return false;
      }

      recentRequests.push(now);
      this.#requestCount.set(clientId, recentRequests);
      return true;
  }

  /**
   * Handles CSP violations
   * @private
   * @param {SecurityPolicyViolationEvent} e - Violation event
   */
  handleCSPViolation(e) {
      console.error('CSP Violation:', {
          violatedDirective: e.violatedDirective,
          blockedURI: e.blockedURI,
          documentURI: e.documentURI,
          timestamp: new Date().toISOString()
      });

      // Log violation for monitoring
      this.logSecurityEvent('CSP_VIOLATION', {
          directive: e.violatedDirective,
          source: e.blockedURI
      });
  }

  /**
   * Handles user input for security
   * @private
   * @param {Event} e - Input event
   */
  handleUserInput(e) {
      if (e.target.value && this.detectSuspiciousPattern(e.target.value)) {
          console.warn('Suspicious input pattern detected');
          e.target.value = this.sanitizeInput(e.target.value);
          this.logSecurityEvent('SUSPICIOUS_INPUT', {
              element: e.target.id || e.target.name || 'unknown'
          });
      }
  }

  /**
   * Detects suspicious patterns
   * @private
   * @param {string} input - Input to check
   * @returns {boolean} Whether suspicious pattern was detected
   */
  detectSuspiciousPattern(input) {
      const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /data:/i,
          /vbscript:/i,
          /on\w+=/i,
          /\u0000/, // Null bytes
          /\\x[0-9a-f]{2}/i, // Hex encoding
          /%[0-9a-f]{2}/i // URL encoding
      ];

      return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Logs security events
   * @private
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  logSecurityEvent(type, data) {
      const event = {
          type,
          data,
          timestamp: new Date().toISOString(),
          url: window.location.href
      };

      // In production, send to security monitoring service
      console.warn('Security Event:', event);
  }

  /**
   * Cleans up security manager
   * @public
   */
  destroy() {
      if (this.#cleanupInterval) {
          clearInterval(this.#cleanupInterval);
      }
      this.#requestCount.clear();
      this.#securityCache.clear();
      this.#blockedIPs.clear();
      window.removeEventListener('securitypolicyviolation', this.handleCSPViolation);
      document.removeEventListener('input', this.handleUserInput);
      SecurityManager.#instance = null;
  }
}

/**
 * Enhanced Security Manager with additional security features
 * @class
 * @extends SecurityManager
 */
class EnhancedSecurityManager extends SecurityManager {
  /**
   * @private
   * @type {Map<string, number>}
   */
  #securityViolations = new Map();

  /**
   * @private
   * @type {Set<string>}
   */
  #blockedIPs = new Set();

  /**
   * Creates an EnhancedSecurityManager instance
   * @constructor
   */
  constructor() {
      super();
      this.initializeEnhancedSecurity();
  }

  /**
   * Initializes enhanced security features
   * @private
   */
  initializeEnhancedSecurity() {
      this.setupContentSecurityPolicy();
      this.setupXSSProtection();
      this.setupSecureHeaders();
      this.setupEnhancedEventListeners();
  }

  /**
   * Enhanced input sanitization
   * @param {string} input - Input to sanitize
   * @param {Object} [options={}] - Sanitization options
   * @param {boolean} [options.allowHtml=false] - Whether to allow certain HTML tags
   * @param {string[]} [options.allowedTags=[]] - Array of allowed HTML tags
   * @returns {string} Sanitized input
   */
  sanitizeInput(input, options = {}) {
      if (!input) return '';

      let sanitized = super.sanitizeInput(input);

      // Additional XSS protection
      sanitized = sanitized
          .replace(/data:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');

      if (options.allowHtml && Array.isArray(options.allowedTags)) {
          options.allowedTags.forEach(tag => {
              if (SecurityConfig.VALIDATION.ALLOWED_TAGS.includes(tag)) {
                  const regex = new RegExp(`&lt;(\/?)${tag}&gt;`, 'g');
                  sanitized = sanitized.replace(regex, '<$1' + tag + '>');
              }
          });
      }

      return sanitized;
  }

  /**
   * Sets up enhanced security headers
   * @private
   */
  setupSecureHeaders() {
      const enhancedHeaders = {
          'X-XSS-Protection': '1; mode=block',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(self), microphone=()',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Resource-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp'
      };

      Object.entries(enhancedHeaders).forEach(([header, value]) => {
          console.log(`Setting enhanced security header: ${header}: ${value}`);
      });
  }

  /**
   * Sets up enhanced event listeners
   * @private
   */
  setupEnhancedEventListeners() {
      window.addEventListener('securitypolicyviolation', this.handleEnhancedCSPViolation.bind(this));
      document.addEventListener('input', this.handleEnhancedUserInput.bind(this));
  }

  /**
   * Handles CSP violations with enhanced logging
   * @private
   * @param {SecurityPolicyViolationEvent} e - Violation event
   */
  handleEnhancedCSPViolation(e) {
      const violationKey = `${e.blockedURI}_${e.violatedDirective}`;
      const currentCount = this.#securityViolations.get(violationKey) || 0;
      this.#securityViolations.set(violationKey, currentCount + 1);

      this.logSecurityEvent('ENHANCED_CSP_VIOLATION', {
          violatedDirective: e.violatedDirective,
          blockedURI: e.blockedURI,
          documentURI: e.documentURI,
          violationCount: currentCount + 1
      });

      if (currentCount + 1 >= SecurityConfig.RATE_LIMIT.MAX_VIOLATIONS) {
          this.handleExcessiveViolations(violationKey);
      }
  }

  /**
   * Handles excessive security violations
   * @private
   * @param {string} violationKey - Violation identifier
   */
  handleExcessiveViolations(violationKey) {
      const clientId = this.getClientIdentifier();
      this.#blockedIPs.add(clientId);
      
      setTimeout(() => {
          this.#blockedIPs.delete(clientId);
      }, SecurityConfig.RATE_LIMIT.BLOCKED_DURATION);

      this.logSecurityEvent('EXCESSIVE_VIOLATIONS', {
          violationKey,
          clientId,
          blockedUntil: new Date(Date.now() + SecurityConfig.RATE_LIMIT.BLOCKED_DURATION)
      });
  }

  /**
   * Gets client identifier
   * @private
   * @returns {string} Client identifier
   */
  getClientIdentifier() {
      // In a real implementation, this would use more sophisticated methods
      return window.navigator.userAgent + window.location.origin;
  }

  /**
   * Enhanced input validation
   * @param {string} input - Input to validate
   * @param {string} type - Type of input
   * @returns {boolean} Whether input is valid
   */
  validateInput(input, type = 'text') {
      if (!input) return false;

      switch (type) {
          case 'coordinates':
              return this.validateCoordinates(...input.split(',').map(Number));
          case 'url':
              return this.validateUrl(input);
          case 'email':
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
          case 'text':
          default:
              return !this.detectSuspiciousPattern(input);
      }
  }

  /**
   * Cleans up enhanced security manager
   * @public
   */
  destroy() {
      super.destroy();
      this.#securityViolations.clear();
      this.#blockedIPs.clear();
  }
}

// Export the modules
export { SecurityManager, EnhancedSecurityManager, SecurityConfig };