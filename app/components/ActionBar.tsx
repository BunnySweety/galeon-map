'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLingui } from '@lingui/react';
import ReactDOM from 'react-dom';
import { toast } from 'react-hot-toast';
import { useMapStore } from '../store/useMapStore';
import { exportFilteredHospitals } from '../utils/export-utils';
import { shareContent, getCurrentPageShareData } from '../utils/share-utils';
import { RateLimiters, getClientIdentifier } from '../utils/rate-limiter';
import logger from '../utils/logger';

interface ActionBarProps {
  className?: string;
}

// Composant réutilisable pour les menus déroulants
const PopupMenu = ({
  title,
  children,
  isVisible,
  anchorRef,
}: {
  title: string;
  children: React.ReactNode;
  isVisible: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
}) => {
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (isVisible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 24, // 24px sous la barre d'action
        left: rect.left + rect.width / 2,
      });
    }
  }, [isVisible, anchorRef]);

  if (!isVisible || !menuPos) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: menuPos.top,
        left: menuPos.left,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(217,217,217,0.05)',
        minWidth:
          title === 'Export data' ||
          title === 'Exporter les données' ||
          title === 'Share' ||
          title === 'Partager'
            ? 320
            : undefined,
      }}
      className="action-menu border-2 border-[rgba(71,154,243,0.3)] rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-[#A1CBF9] text-[clamp(10px,0.8vw,13px)] transition-all duration-200 whitespace-nowrap inline-block"
    >
      <div className="flex justify-center items-center border-b border-color-[rgba(71,154,243,0.3)] px-0 py-2">
        <h3 className="text-[#A1CBF9] text-[clamp(12px,0.9vw,15px)] font-medium">{title}</h3>
      </div>
      <div className="py-2">{children}</div>
    </div>,
    document.body
  );
};

const ActionBar: React.FC<ActionBarProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  const { hospitals, currentDate, selectedFilters } = useMapStore();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const exportBtnRef = useRef<HTMLButtonElement>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const actionBarRef = useRef<HTMLDivElement>(null);

  // Create a safe translation function that handles undefined i18n
  const _ = useCallback(
    (text: string) => {
      try {
        return i18n?._ ? i18n._(text) : text;
      } catch {
        return text;
      }
    },
    [i18n]
  );

  // Fermer les menus lorsque l'utilisateur clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Ne pas fermer si on clique sur un élément du menu ou un bouton d'action
      if (
        target.closest('.action-menu') ||
        target.closest('.action-button') ||
        target.closest('[style*="position: fixed"]') || // Menu popup
        target.closest('button')
      ) {
        // Tous les boutons
        return;
      }

      // Fermer les menus seulement si on clique vraiment en dehors
      setShowExportMenu(false);
      setShowShareMenu(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour exporter les données des hôpitaux avec rate limiting
  const exportHospitalData = useCallback(
    (format: 'pdf' | 'xls' | 'json') => {
      try {
        // Vérifier le rate limiting pour les exports
        const clientId = getClientIdentifier();
        const rateLimitResult = RateLimiters.export.isAllowed(clientId);
        
        if (!rateLimitResult.allowed) {
          const resetDate = new Date(rateLimitResult.resetTime!);
          const message = _(`Export limit reached. Try again at ${resetDate.toLocaleTimeString()}`);
          toast.error(message, {
            duration: 5000,
            position: 'bottom-center',
          });
          setShowExportMenu(false);
          return;
        }

        logger.debug(`Starting ${format} export... (${rateLimitResult.remaining} exports remaining)`);

        // Créer un objet de traductions pour les exports
        const translations = {
          'Galeon Hospitals Map': _('Galeon Hospitals Map'),
          'Export Date': _('Export Date'),
          'Total Hospitals': _('Total Hospitals'),
          'Hospital Name': _('Hospital Name'),
          Status: _('Status'),
          Address: _('Address'),
          'Deployment Date': _('Deployment Date'),
          Website: _('Website'),
          Coordinates: _('Coordinates'),
          Page: _('Page'),
          of: _('of'),
          Hospitals: _('Hospitals'),
          'Export Information': _('Export Information'),
          'Deployed Hospitals': _('Deployed Hospitals'),
          'Signed Hospitals': _('Signed Hospitals'),
          'Status Distribution': _('Status Distribution'),
          Deployed: _('Deployed'),
          Signed: _('Signed'),
          Metadata: _('Metadata'),
        };

        // Utiliser la fonction d'export avec filtrage
        exportFilteredHospitals(
          hospitals,
          currentDate,
          selectedFilters,
          i18n.locale ?? 'en',
          translations,
          format
        );

        // Afficher un message de succès avec info rate limiting
        const successMessage = (rateLimitResult.remaining !== undefined && rateLimitResult.remaining > 0)
          ? _(`${format.toUpperCase()} export completed successfully! (${rateLimitResult.remaining} exports remaining)`)
          : _(`${format.toUpperCase()} export completed successfully!`);
        
        toast.success(successMessage, {
          duration: 3000,
          position: 'bottom-center',
        });

        logger.debug(`${format} export completed successfully`);

        // Fermer le menu d'export après l'export
        setTimeout(() => setShowExportMenu(false), 500);
      } catch (error) {
        logger.error(`Export failed:`, error);
        toast.error(_(`Failed to export ${format.toUpperCase()}. Please try again.`), {
          duration: 4000,
          position: 'bottom-center',
        });
        // Fermer le menu même en cas d'erreur
        setTimeout(() => setShowExportMenu(false), 500);
      }
    },
    [hospitals, currentDate, selectedFilters, i18n.locale, _]
  );

  // Fonction pour fermer tous les menus
  const closeAllMenus = useCallback(() => {
    setShowExportMenu(false);
    setShowShareMenu(false);
  }, []);

  // Handlers optimisés pour les boutons principaux
  const handleExportClick = useCallback(() => {
    setShowExportMenu(!showExportMenu);
    setShowShareMenu(false); // Ferme le menu de partage si ouvert
  }, [showExportMenu]);

  const handleShareClick = useCallback(() => {
    setShowShareMenu(!showShareMenu);
    setShowExportMenu(false); // Ferme le menu d'export si ouvert
  }, [showShareMenu]);

  // Handlers optimisés pour les boutons d'export
  const handlePdfExport = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      exportHospitalData('pdf');
    },
    [exportHospitalData]
  );

  const handleXlsExport = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      exportHospitalData('xls');
    },
    [exportHospitalData]
  );

  const handleJsonExport = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      exportHospitalData('json');
    },
    [exportHospitalData]
  );

  // Fonction pour partager le lien de la carte
  const shareMap = useCallback(
    async (
      method:
        | 'email'
        | 'copy'
        | 'native'
        | 'qr'
        | 'twitter'
        | 'facebook'
        | 'linkedin'
        | 'whatsapp'
        | 'telegram' = 'native'
    ) => {
      try {
        logger.debug(`Starting ${method} share...`);

        // Obtenir les données de partage
        const shareData = getCurrentPageShareData(
          _('Galeon Hospitals Map'),
          _('Check out this interactive map of Galeon hospitals!')
        );

        // Utiliser la fonction de partage améliorée
        await shareContent(method, shareData, {
          showToast: true,
          toastDuration: 3000,
          fallbackToClipboard: true,
        });

        logger.debug(`${method} share completed successfully`);

        // Fermer le menu de partage après l'action
        setTimeout(() => closeAllMenus(), 500);
      } catch (error) {
        logger.error('Share failed:', error);
        toast.error(_('Sharing failed. Please try again.'), {
          duration: 3000,
          position: 'bottom-center',
        });
        // Fermer le menu même en cas d'erreur
        setTimeout(() => closeAllMenus(), 500);
      }
    },
    [_, closeAllMenus]
  );

  // Handlers optimisés pour les boutons de partage principaux
  const handleNativeShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shareMap('native');
    },
    [shareMap]
  );

  const handleEmailShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shareMap('email');
    },
    [shareMap]
  );

  const handleCopyShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shareMap('copy');
    },
    [shareMap]
  );

  const handleQrShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shareMap('qr');
    },
    [shareMap]
  );

  // Handlers optimisés pour les réseaux sociaux
  const handleWhatsappShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shareMap('whatsapp');
    },
    [shareMap]
  );

  const handleTwitterShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shareMap('twitter');
    },
    [shareMap]
  );

  const handleFacebookShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shareMap('facebook');
    },
    [shareMap]
  );

  const handleLinkedinShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shareMap('linkedin');
    },
    [shareMap]
  );

  const handleTelegramShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shareMap('telegram');
    },
    [shareMap]
  );

  return (
    <div className={`${className}`}>
      {/* Barre d'action principale - Taille fixe à partir de md */}
      <div
        ref={actionBarRef}
        className="relative flex flex-row items-center justify-between px-3 md:px-4 w-[130px] h-[52px] md:w-[140px] md:h-[55px] bg-[rgba(217,217,217,0.05)] border-2 border-[rgba(71,154,243,0.3)] backdrop-blur-[17.5px] rounded-xl"
      >
        {/* Export button with dropdown */}
        <div className="flex items-center justify-center w-[clamp(36px,40px,44px)]">
          <button
            ref={exportBtnRef}
            className="flex items-center justify-center bg-transparent border-none p-2 action-button"
            onClick={handleExportClick}
            aria-label={_('Export')}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              touchAction: 'manipulation'
            }}
          >
            {/* Icône Export - Taille fixe à partir de md */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]"
            >
              <path
                d="M34.25 18V33C34.25 33.663 33.9866 34.2989 33.5178 34.7678C33.0489 35.2366 32.413 35.5 31.75 35.5H9.25C8.58696 35.5 7.95107 35.2366 7.48223 34.7678C7.01339 34.2989 6.75 33.663 6.75 33V18C6.75 17.337 7.01339 16.7011 7.48223 16.2322C7.95107 15.7634 8.58696 15.5 9.25 15.5H19.25V23C19.25 23.3315 19.3817 23.6495 19.6161 23.8839C19.8505 24.1183 20.1685 24.25 20.5 24.25C20.8315 24.25 21.1495 24.1183 21.3839 23.8839C21.6183 23.6495 21.75 23.3315 21.75 23V15.5H31.75C32.413 15.5 33.0489 15.7634 33.5178 16.2322C33.9866 16.7011 34.25 17.337 34.25 18ZM21.75 7.26719L25.8656 11.3844C26.1002 11.6189 26.4183 11.7507 26.75 11.7507C27.0817 11.7507 27.3998 11.6189 27.6344 11.3844C27.8689 11.1498 28.0007 10.8317 28.0007 10.5C28.0007 10.1683 27.8689 9.85018 27.6344 9.61563L21.3844 3.36563C21.2683 3.24941 21.1304 3.15721 20.9787 3.09431C20.8269 3.0314 20.6643 2.99902 20.5 2.99902C20.3357 2.99902 20.1731 3.0314 20.0213 3.09431C19.8696 3.15721 19.7317 3.24941 19.6156 3.36563L13.3656 9.61563C13.1311 9.85018 12.9993 10.1683 12.9993 10.5C12.9993 10.8317 13.1311 11.1498 13.3656 11.3844C13.6002 11.6189 13.9183 11.7507 14.25 11.7507C14.5817 11.7507 14.8998 11.6189 15.1344 11.3844L19.25 7.26719V15.5H21.75V7.26719Z"
                fill="#479AF3"
              />
            </svg>
          </button>

          {/* Export format dropdown - using the reusable component */}
          <PopupMenu title={_('Export data')} isVisible={showExportMenu} anchorRef={actionBarRef}>
            <div className="text-[#A1CBF9] text-xs sm:text-sm mb-4">
              {_('Choose export format')}
            </div>
            <div className="flex justify-between items-center gap-3 py-3">
              <button
                className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-3"
                onClick={handlePdfExport}
                style={{
                  minWidth: '48px',
                  minHeight: '48px',
                  touchAction: 'manipulation'
                }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-color-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-2 md:mb-3 lg:mb-4">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px]"
                  >
                    <path
                      d="M14 3v4a1 1 0 001 1h4"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 17h6M9 13h6"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-xs md:text-sm lg:text-base h-6 md:h-8 lg:h-10 flex items-center justify-center" style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                  PDF
                </span>
              </button>
              <button
                className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-3"
                onClick={handleXlsExport}
                style={{
                  minWidth: '48px',
                  minHeight: '48px',
                  touchAction: 'manipulation'
                }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-color-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-2 md:mb-3 lg:mb-4">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px]"
                  >
                    <path
                      d="M14 3v4a1 1 0 001 1h4"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 12l3 3 3-3M11 9v6"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-xs md:text-sm lg:text-base h-6 md:h-8 lg:h-10 flex items-center justify-center" style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                  XLS
                </span>
              </button>
              <button
                className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-3"
                onClick={handleJsonExport}
                style={{
                  minWidth: '48px',
                  minHeight: '48px',
                  touchAction: 'manipulation'
                }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-color-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-2 md:mb-3 lg:mb-4">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px]"
                  >
                    <path
                      d="M14 3v4a1 1 0 001 1h4"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 15h2M14 15h2M8 11h2M14 11h2"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-xs md:text-sm lg:text-base h-6 md:h-8 lg:h-10 flex items-center justify-center" style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                  JSON
                </span>
              </button>
            </div>
          </PopupMenu>
        </div>

        {/* Séparateur - Taille fixe à partir de md */}
        <div className="h-[16px] md:h-[18px] w-0 border-l border-[#A1CBF9]"></div>

        {/* Share button */}
        <div className="flex items-center justify-center w-[clamp(36px,40px,44px)]">
          <button
            ref={shareBtnRef}
            className="flex items-center justify-center bg-transparent border-none p-2 action-button"
            onClick={handleShareClick}
            aria-label={_('Share')}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              touchAction: 'manipulation'
            }}
          >
            {/* Icône Share - Taille fixe à partir de md */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]"
            >
              <path
                d="M37.6343 18.8844L25.1343 31.3844C24.9595 31.5594 24.7366 31.6786 24.494 31.7269C24.2514 31.7752 23.9999 31.7505 23.7714 31.6558C23.5429 31.5611 23.3476 31.4007 23.2103 31.195C23.0729 30.9892 22.9997 30.7474 22.9999 30.5V24.2859C14.078 24.7922 7.96084 30.5781 6.24365 32.4109C5.97402 32.6989 5.62042 32.8945 5.23319 32.9698C4.84596 33.0452 4.44482 32.9965 4.08687 32.8307C3.72892 32.6649 3.43238 32.3904 3.23947 32.0463C3.04656 31.7021 2.9671 31.306 3.01241 30.9141C3.59209 25.8734 6.35303 21.025 10.7874 17.2625C14.4702 14.1375 18.9468 12.1547 22.9999 11.8078V5.50001C22.9997 5.25264 23.0729 5.01077 23.2103 4.80503C23.3476 4.59929 23.5429 4.43892 23.7714 4.34423C23.9999 4.24954 24.2514 4.22478 24.494 4.2731C24.7366 4.32141 24.9595 4.44062 25.1343 4.61563L37.6343 17.1156C37.7505 17.2317 37.8427 17.3696 37.9056 17.5213C37.9685 17.6731 38.0009 17.8357 38.0009 18C38.0009 18.1643 37.9685 18.3269 37.9056 18.4787C37.8427 18.6304 37.7505 18.7683 37.6343 18.8844Z"
                fill="#A1CBF9"
              />
            </svg>
          </button>

          {/* Share menu popup - using the reusable component */}
          <PopupMenu title={_('Share')} isVisible={showShareMenu} anchorRef={actionBarRef}>
            <div className="text-[#A1CBF9] text-xs sm:text-sm mb-4">{_('Share with others')}</div>

            {/* Primary sharing options */}
            <div className="flex justify-between items-center gap-3 py-3 mb-4">
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-2"
                  onClick={handleNativeShare}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-2">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        stroke="#A1CBF9"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-[#A1CBF9] text-xs text-center">{_('Share')}</span>
                </button>
              )}
              <button
                className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-2"
                onClick={handleEmailShare}
              >
                <div className="w-10 h-10 rounded-full border-2 border-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-xs text-center">{_('Email')}</span>
              </button>
              <button
                className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-2"
                onClick={handleCopyShare}
              >
                <div className="w-10 h-10 rounded-full border-2 border-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      stroke="#A1CBF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-xs text-center">{_('Copy Link')}</span>
              </button>
              <button
                className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-2"
                onClick={handleQrShare}
              >
                <div className="w-10 h-10 rounded-full border-2 border-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="3" y="3" width="5" height="5" stroke="#A1CBF9" strokeWidth="2" />
                    <rect x="16" y="3" width="5" height="5" stroke="#A1CBF9" strokeWidth="2" />
                    <rect x="3" y="16" width="5" height="5" stroke="#A1CBF9" strokeWidth="2" />
                    <rect x="5" y="5" width="1" height="1" fill="#A1CBF9" />
                    <rect x="18" y="5" width="1" height="1" fill="#A1CBF9" />
                    <rect x="5" y="18" width="1" height="1" fill="#A1CBF9" />
                    <path d="M13 13h3v3h-3zM16 16h2v2h-2zM13 16h1v1h-1z" fill="#A1CBF9" />
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-xs text-center">{_('QR Code')}</span>
              </button>
            </div>

            {/* Social media options */}
            <div className="border-t border-[rgba(71,154,243,0.3)] pt-4">
              <div className="text-[#A1CBF9] text-xs mb-3">{_('Social Media')}</div>
              <div className="flex justify-between items-center gap-2 py-2">
                <button
                  className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-2"
                  onClick={handleWhatsappShare}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"
                        fill="#A1CBF9"
                      />
                    </svg>
                  </div>
                  <span className="text-[#A1CBF9] text-[10px] text-center">WhatsApp</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-2"
                  onClick={handleTwitterShare}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                        fill="#A1CBF9"
                      />
                    </svg>
                  </div>
                  <span className="text-[#A1CBF9] text-[10px] text-center">Twitter</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-2"
                  onClick={handleFacebookShare}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        fill="#A1CBF9"
                      />
                    </svg>
                  </div>
                  <span className="text-[#A1CBF9] text-[10px] text-center">Facebook</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-2"
                  onClick={handleLinkedinShare}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                        fill="#A1CBF9"
                      />
                    </svg>
                  </div>
                  <span className="text-[#A1CBF9] text-[10px] text-center">LinkedIn</span>
                </button>
                <button
                  className="flex flex-col items-center justify-center flex-1 hover:bg-[rgba(71,154,243,0.2)] transition-colors rounded-lg p-2"
                  onClick={handleTelegramShare}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] flex items-center justify-center mb-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                        fill="#A1CBF9"
                      />
                    </svg>
                  </div>
                  <span className="text-[#A1CBF9] text-[10px] text-center">Telegram</span>
                </button>
              </div>
            </div>
          </PopupMenu>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
