import { analytics } from './analyticsService';
import { notificationService } from './notificationService';
import { ErrorType, ErrorContext, ErrorMetadata } from '@/types/errors';

/**
 * Service for handling, tracking, and managing errors across the application.
 * Provides centralized error handling, logging, and user notification.
 */
class ErrorService {
  private static instance: ErrorService;
  private readonly MAX_ERROR_LOGS = 100;
  private errorLogs: Array<{ 
    error: Error; 
    context?: ErrorContext; 
    timestamp: Date;
    metadata?: ErrorMetadata;
  }> = [];

  // Error categories for better organization and handling
  private readonly ERROR_CATEGORIES = {
    MAP: 'map',
    API: 'api',
    DATA: 'data',
    UI: 'ui',
    NETWORK: 'network'
  } as const;

  private constructor() {
    this.initializeGlobalErrorHandlers();
  }

  // Singleton pattern implementation
  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Initialize global error handlers for uncaught errors and promise rejections
   */
  private initializeGlobalErrorHandlers(): void {
    window.onerror = (message, source, lineno, colno, error) => {
      this.handleGlobalError(message, source, lineno, colno, error);
    };

    window.onunhandledrejection = (event) => {
      this.handleUnhandledRejection(event);
    };
  }

  /**
   * Main error handling method
   * @param error - Error object or error message
   * @param context - Additional context about where/how the error occurred
   * @param metadata - Any additional data relevant to the error
   */
  public handleError(
    error: Error | string,
    context?: ErrorContext,
    metadata?: ErrorMetadata
  ): void {
    const errorObject = typeof error === 'string' ? new Error(error) : error;
    const timestamp = new Date();
    const errorInfo = { error: errorObject, context, timestamp, metadata };

    // Log error internally
    this.logError(errorInfo);

    // Track in analytics
    analytics.trackError({
      name: errorObject.name,
      message: errorObject.message,
      context,
      metadata,
      timestamp: timestamp.toISOString()
    });

    // Show UI notification if necessary
    if (this.shouldShowNotification(errorObject, context)) {
      this.showErrorNotification(errorObject, context);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(errorInfo);
    }
  }

  /**
   * Determine if an error should be shown to the user
   */
  private shouldShowNotification(error: Error, context?: ErrorContext): boolean {
    // Ignore temporary network errors
    if (error.name === 'NetworkError' || error instanceof TypeError && error.message.includes('network')) {
      return false;
    }

    // Ignore non-critical resource loading errors
    if (error.name === 'ResourceError' && context?.severity !== 'high') {
      return false;
    }

    // Always show critical errors
    if (context?.severity === 'high') {
      return true;
    }

    // Default behavior based on category
    return context?.category !== this.ERROR_CATEGORIES.MAP;
  }

  /**
   * Show error notification to user
   */
  private showErrorNotification(error: Error, context?: ErrorContext): void {
    const message = this.getErrorMessage(error, context);
    notificationService.error(message, {
      title: context?.userMessage || 'An error occurred',
      duration: context?.severity === 'high' ? 0 : 5000, // 0 = stays until user closes
      action: context?.action ? {
        label: context.action.label,
        onClick: context.action.handler
      } : undefined
    });
  }

  /**
   * Get user-friendly error message based on error type and context
   */
  private getErrorMessage(error: Error, context?: ErrorContext): string {
    if (context?.userMessage) return context.userMessage;

    switch (error.name) {
      case 'NetworkError':
        return 'Connection problem. Please check your network.';
      case 'ValidationError':
        return 'Invalid data provided. Please check your input.';
      case 'AuthError':
        return 'Authentication error. Please log in again.';
      default:
        return process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Specialized handler for map-related errors
   */
  public handleMapError(error: Error, operation: string, metadata?: ErrorMetadata): void {
    this.handleError(error, {
      category: this.ERROR_CATEGORIES.MAP,
      operation,
      severity: 'medium',
      userMessage: `Error during map ${operation}. Please try again.`,
      action: {
        label: 'Retry',
        handler: () => window.location.reload()
      }
    }, {
      ...metadata,
      mapState: {
        zoom: this.map?.getZoom(),
        center: this.map?.getCenter(),
        bounds: this.map?.getBounds()
      }
    });
  }

  /**
   * Specialized handler for API errors
   */
  public handleAPIError(error: Error | Response, endpoint: string): void {
    const errorObject = error instanceof Error ? error : new Error(`API Error: ${error.status}`);
    
    this.handleError(errorObject, {
      category: this.ERROR_CATEGORIES.API,
      operation: `Request to ${endpoint}`,
      severity: 'high',
      userMessage: 'Failed to communicate with the server.'
    });
  }

  /**
   * Internal error logging
   */
  private logError(errorInfo: { 
    error: Error; 
    context?: ErrorContext; 
    timestamp: Date;
    metadata?: ErrorMetadata;
  }): void {
    // Add to start for most recent errors
    this.errorLogs.unshift(errorInfo);
    
    // Maintain maximum size
    if (this.errorLogs.length > this.MAX_ERROR_LOGS) {
      this.errorLogs = this.errorLogs.slice(0, this.MAX_ERROR_LOGS);
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.group('Error logged:');
      console.error(errorInfo.error);
      console.info('Context:', errorInfo.context);
      console.info('Metadata:', errorInfo.metadata);
      console.info('Timestamp:', errorInfo.timestamp);
      console.groupEnd();
    }
  }

  /**
   * Send error to monitoring service
   */
  private async sendToMonitoring(errorInfo: {
    error: Error;
    context?: ErrorContext;
    timestamp: Date;
    metadata?: ErrorMetadata;
  }): Promise<void> {
    if (!process.env.VITE_MONITORING_ENDPOINT) return;

    try {
      const response = await fetch(process.env.VITE_MONITORING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: errorInfo.error.name,
          message: errorInfo.error.message,
          stack: errorInfo.error.stack,
          context: errorInfo.context,
          metadata: errorInfo.metadata,
          timestamp: errorInfo.timestamp.toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });

      if (!response.ok) {
        console.error('Failed to send error to monitoring service');
      }
    } catch (err) {
      console.error('Error while sending to monitoring service:', err);
    }
  }

  // Public utilities
  public getErrorLogs(): typeof this.errorLogs {
    return [...this.errorLogs];
  }

  public clearErrorLogs(): void {
    this.errorLogs = [];
  }
}

export const errorService = ErrorService.getInstance();
export default errorService;