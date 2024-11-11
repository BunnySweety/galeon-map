import { createRoot } from 'react-dom/client';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * Types for notification configuration
 */
type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Service for managing and displaying application notifications
 */
class NotificationService {
  private container: HTMLElement | null = null;
  private notifications: Map<string, HTMLElement> = new Map();
  private readonly DEFAULT_DURATION = 5000;
  private readonly MAX_NOTIFICATIONS = 5;
  private readonly ANIMATION_DURATION = 300;

  constructor() {
    this.initializeContainer();
  }

  /**
   * Initialize the notification container
   */
  private initializeContainer(): void {
    // Check for existing container
    const existingContainer = document.getElementById('notification-container');
    if (existingContainer) {
      this.container = existingContainer;
      return;
    }

    // Create new container
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.className = 'fixed z-50 space-y-2 pointer-events-none';
    this.setContainerPosition('top-right');
    document.body.appendChild(this.container);
  }

  /**
   * Show a notification
   */
  public show({
    type,
    title,
    message,
    duration = this.DEFAULT_DURATION,
    action,
    position = 'top-right'
  }: NotificationOptions): string {
    if (!this.container) return '';

    // Generate unique ID
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Manage maximum notifications
    if (this.notifications.size >= this.MAX_NOTIFICATIONS) {
      const oldestId = this.notifications.keys().next().value;
      this.close(oldestId);
    }

    // Create notification element
    const notificationElement = document.createElement('div');
    this.container.appendChild(notificationElement);
    this.notifications.set(id, notificationElement);

    // Update container position if needed
    this.setContainerPosition(position);

    // Render notification
    const root = createRoot(notificationElement);
    root.render(
      <NotificationComponent
        id={id}
        type={type}
        title={title}
        message={message}
        action={action}
        onClose={() => this.close(id)}
      />
    );

    // Auto close after duration
    if (duration > 0) {
      setTimeout(() => {
        this.close(id);
      }, duration);
    }

    return id;
  }

  /**
   * Utility methods for different notification types
   */
  public success(message: string, options?: Partial<NotificationOptions>): string {
    return this.show({ type: 'success', message, ...options });
  }

  public error(message: string, options?: Partial<NotificationOptions>): string {
    return this.show({ type: 'error', message, ...options });
  }

  public warning(message: string, options?: Partial<NotificationOptions>): string {
    return this.show({ type: 'warning', message, ...options });
  }

  public info(message: string, options?: Partial<NotificationOptions>): string {
    return this.show({ type: 'info', message, ...options });
  }

  /**
   * Close a specific notification
   */
  public close(id: string): void {
    const element = this.notifications.get(id);
    if (!element) return;

    // Add exit animation
    element.style.animation = `slideOut ${this.ANIMATION_DURATION}ms ease-out`;

    // Remove after animation
    setTimeout(() => {
      if (this.container?.contains(element)) {
        this.container.removeChild(element);
      }
      this.notifications.delete(id);
    }, this.ANIMATION_DURATION);
  }

  /**
   * Close all notifications
   */
  public clearAll(): void {
    this.notifications.forEach((_, id) => this.close(id));
  }

  /**
   * Set container position
   */
  private setContainerPosition(position: string): void {
    if (!this.container) return;

    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4'
    };

    this.container.className = `fixed z-50 space-y-2 pointer-events-none ${positions[position] || positions['top-right']}`;
  }
}

/**
 * Notification component
 */
interface NotificationComponentProps {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({
  type,
  title,
  message,
  action,
  onClose
}) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900',
    error: 'bg-red-50 dark:bg-red-900',
    warning: 'bg-yellow-50 dark:bg-yellow-900',
    info: 'bg-blue-50 dark:bg-blue-900'
  };

  return (
    <div className={`
      pointer-events-auto max-w-sm w-full shadow-lg rounded-lg overflow-hidden
      ${colors[type]}
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {title}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {message}
            </p>
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className="bg-white dark:bg-gray-800 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 px-3 py-2 rounded-md"
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const notificationService = new NotificationService();
export default notificationService;