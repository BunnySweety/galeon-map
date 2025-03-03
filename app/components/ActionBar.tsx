'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLingui } from '@lingui/react';
import { useMapStore } from '../store/useMapStore';
import { format as dateFormat } from 'date-fns';

interface ActionBarProps {
  className?: string;
}

// Composant réutilisable pour les menus déroulants
const PopupMenu = ({ 
  title, 
  children, 
  isVisible 
}: { 
  title: string; 
  children: React.ReactNode; 
  isVisible: boolean;
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute top-65px left-1/2 -translate-x-1/2 mt-1 z-50 min-w-320px action-menu">
      <div className="border-2 border-color-[rgba(71,154,243,0.3)] rounded-lg px-6 py-2 bg-[rgba(217,217,217,0.05)] text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px transition-all duration-200 whitespace-nowrap">
        <div className="flex justify-center items-center border-b border-color-[rgba(71,154,243,0.3)] px-0 py-4">
          <h3 className="text-[#A1CBF9] text-size-clamp-14px-1vw-16px font-medium">{title}</h3>
        </div>
        <div className="py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const ActionBar: React.FC<ActionBarProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  const { hospitals } = useMapStore();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Create a safe translation function that handles undefined i18n
  const _ = useCallback((text: string) => {
    try {
      return i18n && i18n._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  }, [i18n]);

  // Fermer les menus lorsque l'utilisateur clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Si le clic n'est pas sur un bouton ou un menu, fermer les menus
      if (!target.closest('.action-menu') && !target.closest('.action-button')) {
        setShowExportMenu(false);
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour exporter les données des hôpitaux
  const exportHospitalData = (format: 'pdf' | 'xls' | 'json') => {
    // Préparer les données à exporter
    const data = hospitals.map(hospital => ({
      name: i18n.locale === 'fr' ? hospital.nameFr : hospital.nameEn,
      status: hospital.status,
      address: hospital.address,
      deploymentDate: hospital.deploymentDate ? dateFormat(new Date(hospital.deploymentDate), 'dd/MM/yyyy') : '',
      website: hospital.website || '',
    }));

    console.log(`Exporting ${data.length} hospitals in ${format} format`);
    
    // Logique d'export selon le format
    if (format === 'pdf') {
      console.log('PDF export not implemented yet');
      // TODO: Implémenter l'export PDF
      alert(_('PDF export will be available soon'));
    } else if (format === 'xls') {
      console.log('XLS export not implemented yet');
      // TODO: Implémenter l'export XLS
      alert(_('XLS export will be available soon'));
    } else if (format === 'json') {
      // Export JSON
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = `galeon-hospitals-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    // Fermer le menu d'export
    setShowExportMenu(false);
  };

  // Fonction pour fermer tous les menus
  const closeAllMenus = () => {
    setShowExportMenu(false);
    setShowShareMenu(false);
  };

  // Fonction pour partager le lien de la carte
  const shareMap = (method: 'email' | 'copy' | 'native' = 'native') => {
    // Fermer le menu de partage après l'action
    closeAllMenus();
    
    if (method === 'native' && navigator.share) {
      navigator.share({
        title: _('Galeon Hospitals Map'),
        text: _('Check out this map of Galeon hospitals!'),
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else if (method === 'email') {
      // Partage par email
      const shareUrl = `mailto:?subject=${encodeURIComponent(_('Galeon Hospitals Map'))}&body=${encodeURIComponent(_('Check out this map of Galeon hospitals!') + ' ' + window.location.href)}`;
      window.open(shareUrl);
    } else if (method === 'copy') {
      // Copier le lien dans le presse-papier
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert(_('Link copied to clipboard!'));
        })
        .catch((error) => {
          console.error('Failed to copy link:', error);
        });
    }
  };

  return (
    <div className={`flex justify-center my-4 ${className}`}>
      <div className="absolute flex flex-row items-center justify-between px-4 w-140px h-55px bg-[rgba(217,217,217,0.05)] border-1.5px border-[#A1CBF9] backdrop-blur-17.5px rounded-14px left-1/2 -translate-x-1/2 z-10">
        {/* Export button with dropdown */}
        <div className="relative flex items-center justify-center w-35px">
          <button 
            className="flex items-center justify-center bg-transparent border-none p-0 action-button"
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowShareMenu(false); // Ferme le menu de partage si ouvert
            }}
            aria-label={_('Export')}
          >
            <svg width="24" height="24" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M34.25 18V33C34.25 33.663 33.9866 34.2989 33.5178 34.7678C33.0489 35.2366 32.413 35.5 31.75 35.5H9.25C8.58696 35.5 7.95107 35.2366 7.48223 34.7678C7.01339 34.2989 6.75 33.663 6.75 33V18C6.75 17.337 7.01339 16.7011 7.48223 16.2322C7.95107 15.7634 8.58696 15.5 9.25 15.5H19.25V23C19.25 23.3315 19.3817 23.6495 19.6161 23.8839C19.8505 24.1183 20.1685 24.25 20.5 24.25C20.8315 24.25 21.1495 24.1183 21.3839 23.8839C21.6183 23.6495 21.75 23.3315 21.75 23V15.5H31.75C32.413 15.5 33.0489 15.7634 33.5178 16.2322C33.9866 16.7011 34.25 17.337 34.25 18ZM21.75 7.26719L25.8656 11.3844C26.1002 11.6189 26.4183 11.7507 26.75 11.7507C27.0817 11.7507 27.3998 11.6189 27.6344 11.3844C27.8689 11.1498 28.0007 10.8317 28.0007 10.5C28.0007 10.1683 27.8689 9.85018 27.6344 9.61563L21.3844 3.36563C21.2683 3.24941 21.1304 3.15721 20.9787 3.09431C20.8269 3.0314 20.6643 2.99902 20.5 2.99902C20.3357 2.99902 20.1731 3.0314 20.0213 3.09431C19.8696 3.15721 19.7317 3.24941 19.6156 3.36563L13.3656 9.61563C13.1311 9.85018 12.9993 10.1683 12.9993 10.5C12.9993 10.8317 13.1311 11.1498 13.3656 11.3844C13.6002 11.6189 13.9183 11.7507 14.25 11.7507C14.5817 11.7507 14.8998 11.6189 15.1344 11.3844L19.25 7.26719V15.5H21.75V7.26719Z" fill="#479AF3"/>
            </svg>
          </button>
          
          {/* Export format dropdown - using the reusable component */}
          <PopupMenu title={_('Export data')} isVisible={showExportMenu}>
            <div className="mb-6">
              <p className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px mb-3">{_('Choose export format')}</p>
              <div className="flex items-center justify-between bg-[rgba(71,154,243,0.1)] rounded p-3">
                <span className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px truncate mr-3">{_('Export hospital data')}</span>
              </div>
            </div>
            
            <div className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px mb-4">{_('Export options')}</div>
            <div className="flex justify-between items-center gap-4 py-3">
              <button 
                className="flex flex-col items-center justify-center flex-1"
                onClick={() => {
                  alert(_('PDF export will be available soon'));
                }}
              >
                <div className="w-12 h-12 rounded-full border-2 border-color-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-17.5px flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 3v4a1 1 0 001 1h4" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 9h1v3M12 9h1v3M15 9h-1v3M9 15h6" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px h-40px flex items-center justify-center">PDF</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center flex-1"
                onClick={() => {
                  alert(_('XLS export will be available soon'));
                }}
              >
                <div className="w-12 h-12 rounded-full border-2 border-color-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-17.5px flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 3v4a1 1 0 001 1h4" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12l3 3 3-3M11 9v6" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px h-40px flex items-center justify-center">XLS</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center flex-1"
                onClick={() => exportHospitalData('json')}
              >
                <div className="w-12 h-12 rounded-full border-2 border-color-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-17.5px flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 3v4a1 1 0 001 1h4" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 15h2M14 15h2M8 11h2M14 11h2" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px h-40px flex items-center justify-center">JSON</span>
              </button>
            </div>
          </PopupMenu>
        </div>
        
        {/* Separator */}
        <div className="h-18px w-0 border-l-1.5px border-[#A1CBF9]"></div>
        
        {/* Share button */}
        <div className="relative flex items-center justify-center w-35px">
          <button 
            className="flex items-center justify-center bg-transparent border-none p-0 action-button"
            onClick={() => {
              setShowShareMenu(!showShareMenu);
              setShowExportMenu(false); // Ferme le menu d'export si ouvert
            }}
            aria-label={_('Share')}
          >
            <svg width="24" height="24" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.6343 18.8844L25.1343 31.3844C24.9595 31.5594 24.7366 31.6786 24.494 31.7269C24.2514 31.7752 23.9999 31.7505 23.7714 31.6558C23.5429 31.5611 23.3476 31.4007 23.2103 31.195C23.0729 30.9892 22.9997 30.7474 22.9999 30.5V24.2859C14.078 24.7922 7.96084 30.5781 6.24365 32.4109C5.97402 32.6989 5.62042 32.8945 5.23319 32.9698C4.84596 33.0452 4.44482 32.9965 4.08687 32.8307C3.72892 32.6649 3.43238 32.3904 3.23947 32.0463C3.04656 31.7021 2.9671 31.306 3.01241 30.9141C3.59209 25.8734 6.35303 21.025 10.7874 17.2625C14.4702 14.1375 18.9468 12.1547 22.9999 11.8078V5.50001C22.9997 5.25264 23.0729 5.01077 23.2103 4.80503C23.3476 4.59929 23.5429 4.43892 23.7714 4.34423C23.9999 4.24954 24.2514 4.22478 24.494 4.2731C24.7366 4.32141 24.9595 4.44062 25.1343 4.61563L37.6343 17.1156C37.7505 17.2317 37.8427 17.3696 37.9056 17.5213C37.9685 17.6731 38.0009 17.8357 38.0009 18C38.0009 18.1643 37.9685 18.3269 37.9056 18.4787C37.8427 18.6304 37.7505 18.7683 37.6343 18.8844Z" fill="#A1CBF9"/>
            </svg>
          </button>
          
          {/* Share menu popup - using the reusable component */}
          <PopupMenu title={_('Share')} isVisible={showShareMenu}>
            <div className="mb-6">
              <p className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px mb-3">{_('Galeon Hospitals Map')}</p>
              <div className="flex items-center justify-between bg-[rgba(71,154,243,0.1)] rounded p-3">
                <span className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px truncate mr-3">{window.location.href}</span>
                <button 
                  className="text-[#A1CBF9] hover:text-white bg-[rgba(71,154,243,0.3)] p-2 rounded"
                  onClick={() => shareMap('copy')}
                  aria-label={_('Copy Link')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px mb-4">{_('Share with others')}</div>
            <div className="flex justify-between items-center gap-4 py-3">
              {navigator.share && (
                <button 
                  className="flex flex-col items-center justify-center flex-1"
                  onClick={() => shareMap('native')}
                >
                  <div className="w-12 h-12 rounded-full border-2 border-color-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-17.5px flex items-center justify-center mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px h-40px flex items-center justify-center">{_('Share')}</span>
                </button>
              )}
              <button 
                className="flex flex-col items-center justify-center flex-1"
                onClick={() => shareMap('email')}
              >
                <div className="w-12 h-12 rounded-full border-2 border-color-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-17.5px flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px h-40px flex items-center justify-center">{_('Email')}</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center flex-1"
                onClick={() => shareMap('copy')}
              >
                <div className="w-12 h-12 rounded-full border-2 border-color-[rgba(71,154,243,0.3)] bg-[rgba(217,217,217,0.05)] backdrop-blur-17.5px flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[#A1CBF9] text-size-clamp-12px-0.9vw-14px h-40px flex items-center justify-center">{_('Copy Link')}</span>
              </button>
            </div>
          </PopupMenu>
        </div>
      </div>
    </div>
  );
};

export default ActionBar; 