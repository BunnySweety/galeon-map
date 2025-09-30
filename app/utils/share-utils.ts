import { toast } from 'react-hot-toast';
import logger from './logger';

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export interface ShareOptions {
  showToast?: boolean;
  toastDuration?: number;
  fallbackToClipboard?: boolean;
}

// Enhanced clipboard copy with better error handling
export const copyToClipboard = async (
  text: string,
  successMessage: string = 'Link copied to clipboard!',
  options: ShareOptions = {}
): Promise<boolean> => {
  const { showToast = true, toastDuration = 3000 } = options;

  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      if (showToast) {
        toast.success(successMessage, { duration: toastDuration });
      }
      return true;
    }

    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      if (showToast) {
        toast.success(successMessage, { duration: toastDuration });
      }
      return true;
    } else {
      throw new Error('Copy command failed');
    }
  } catch (error) {
    logger.error('Failed to copy to clipboard:', error);
    if (showToast) {
      toast.error('Failed to copy link. Please copy manually.', { duration: toastDuration });
    }
    return false;
  }
};

// Native share with fallback
export const shareNative = async (
  data: ShareData,
  fallbackMessage: string = 'Sharing not supported on this device',
  options: ShareOptions = {}
): Promise<boolean> => {
  const { showToast = true, toastDuration = 3000, fallbackToClipboard = true } = options;

  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    } else {
      // Fallback to clipboard if requested
      if (fallbackToClipboard) {
        const shareText = `${data.title}\n${data.text}\n${data.url}`;
        return await copyToClipboard(shareText, 'Share content copied to clipboard!', options);
      } else {
        if (showToast) {
          toast.error(fallbackMessage, { duration: toastDuration });
        }
        return false;
      }
    }
  } catch (error) {
    logger.error('Native share failed:', error);

    // Try clipboard fallback on error
    if (fallbackToClipboard) {
      const shareText = `${data.title}\n${data.text}\n${data.url}`;
      return await copyToClipboard(shareText, 'Share content copied to clipboard!', options);
    }

    if (showToast) {
      toast.error('Sharing failed. Please try again.', { duration: toastDuration });
    }
    return false;
  }
};

// Email share
export const shareViaEmail = (data: ShareData, options: ShareOptions = {}): boolean => {
  const { showToast = true, toastDuration = 3000 } = options;

  try {
    const subject = encodeURIComponent(data.title);
    const body = encodeURIComponent(`${data.text}\n\n${data.url}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

    // Open email client
    window.open(mailtoUrl, '_blank');

    if (showToast) {
      toast.success('Email client opened', { duration: toastDuration });
    }
    return true;
  } catch (error) {
    logger.error('Email share failed:', error);
    if (showToast) {
      toast.error('Failed to open email client', { duration: toastDuration });
    }
    return false;
  }
};

// Social media sharing
export const shareOnSocialMedia = (
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'telegram',
  data: ShareData,
  options: ShareOptions = {}
): boolean => {
  const { showToast = true, toastDuration = 3000 } = options;

  let shareUrl = '';

  try {
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${data.text} ${data.url}`)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}`;
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Open in new window
    const popup = window.open(
      shareUrl,
      'share-popup',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );

    if (popup) {
      if (showToast) {
        toast.success(`Sharing on ${platform}`, { duration: toastDuration });
      }
      return true;
    } else {
      throw new Error('Popup blocked');
    }
  } catch (error) {
    logger.error(`${platform} share failed:`, error);
    if (showToast) {
      toast.error(`Failed to share on ${platform}`, { duration: toastDuration });
    }
    return false;
  }
};

// Generate QR code data URL (simple implementation)
export const generateQRCodeDataURL = (text: string, size: number = 200): string => {
  // Using a simple QR code service - in production, you might want to use a proper QR library
  const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  return qrServiceUrl;
};

// Share with QR code
export const shareWithQRCode = async (
  data: ShareData,
  options: ShareOptions = {}
): Promise<void> => {
  const { showToast = true, toastDuration = 5000 } = options;

  try {
    const qrCodeUrl = generateQRCodeDataURL(data.url);

    // Create a modal or popup with QR code
    const qrModal = document.createElement('div');
    qrModal.className = 'modal-overlay';

    qrModal.innerHTML = `
      <div class="modal-content" style="max-width: 400px; text-align: center;">
        <div class="modal-header">
          <h3 class="modal-title">Scan QR Code to Share</h3>
          <button id="closeQR" class="modal-close-button">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <img src="${qrCodeUrl}" alt="QR Code" style="
          max-width: 100%;
          height: auto;
          border: 1px solid rgba(71, 154, 243, 0.3);
          border-radius: 12px;
          margin-bottom: 16px;
          background: white;
          padding: 16px;
        " />
        <p style="margin: 0; color: #A1CBF9; font-size: 14px;">
          ${data.title}
        </p>
      </div>
    `;

    // Add click handlers
    qrModal.addEventListener('click', e => {
      if (e.target === qrModal || (e.target as HTMLElement).id === 'closeQR') {
        document.body.removeChild(qrModal);
      }
    });

    document.body.appendChild(qrModal);

    if (showToast) {
      toast.success('QR code generated', { duration: toastDuration });
    }
  } catch (error) {
    logger.error('QR code generation failed:', error);
    if (showToast) {
      toast.error('Failed to generate QR code', { duration: toastDuration });
    }
  }
};

// Comprehensive share function with multiple options
export const shareContent = async (
  method:
    | 'native'
    | 'email'
    | 'copy'
    | 'qr'
    | 'twitter'
    | 'facebook'
    | 'linkedin'
    | 'whatsapp'
    | 'telegram',
  data: ShareData,
  options: ShareOptions = {}
): Promise<boolean> => {
  switch (method) {
    case 'native':
      return await shareNative(data, undefined, options);
    case 'email':
      return shareViaEmail(data, options);
    case 'copy':
      return await copyToClipboard(data.url, 'Link copied to clipboard!', options);
    case 'qr':
      await shareWithQRCode(data, options);
      return true;
    case 'twitter':
    case 'facebook':
    case 'linkedin':
    case 'whatsapp':
    case 'telegram':
      return shareOnSocialMedia(method, data, options);
    default:
      logger.error(`Unsupported share method: ${method}`);
      return false;
  }
};

// Get current page share data
export const getCurrentPageShareData = (
  title?: string,
  text?: string,
  customUrl?: string
): ShareData => {
  return {
    title: title ?? document.title ?? 'Galeon Hospitals Map',
    text: text ?? 'Check out this interactive map of Galeon hospitals!',
    url: customUrl ?? window.location.href,
  };
};
