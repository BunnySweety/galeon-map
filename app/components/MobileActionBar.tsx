'use client';

import { useState, useCallback } from 'react';
import { useLingui } from '@lingui/react';
import { toast } from 'react-hot-toast';
import { useMapStore } from '../store/useMapStore';
import { exportFilteredHospitals } from '../utils/export-utils';
import { shareContent, getCurrentPageShareData } from '../utils/share-utils';

interface MobileActionBarProps {
  isVisible: boolean;
  onClose: () => void;
}

const MobileActionBar: React.FC<MobileActionBarProps> = ({ 
  isVisible, 
  onClose 
}) => {
  const { i18n } = useLingui();
  const { hospitals, currentDate, selectedFilters } = useMapStore();
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

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

  const handleExport = useCallback((format: 'pdf' | 'xls' | 'json') => {
    try {
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

      exportFilteredHospitals(
        hospitals,
        currentDate,
        selectedFilters,
        i18n.locale ?? 'en',
        translations,
        format
      );

      toast.success(_(`${format.toUpperCase()} export completed successfully!`), {
        duration: 3000,
        position: 'bottom-center',
      });

      setShowExportOptions(false);
    } catch (error) {
      toast.error(_(`Failed to export ${format.toUpperCase()}. Please try again.`), {
        duration: 4000,
        position: 'bottom-center',
      });
    }
  }, [hospitals, currentDate, selectedFilters, i18n.locale, _]);

  const handleShare = useCallback(async (method: 'native' | 'copy') => {
    try {
      const shareData = getCurrentPageShareData(
        _('Galeon Hospitals Map'),
        _('Check out this interactive map of Galeon hospitals!')
      );
      
      if (method === 'native' && typeof navigator !== 'undefined' && 'share' in navigator) {
        await shareContent('native', shareData);
      } else {
        await shareContent('copy', shareData);
        toast.success(_('Link copied to clipboard!'), {
          duration: 2000,
          position: 'bottom-center',
        });
      }
      
      setShowShareOptions(false);
    } catch (error) {
      toast.error(_('Failed to share. Please try again.'), {
        duration: 3000,
        position: 'bottom-center',
      });
    }
  }, [_]);

  const handleToggleExportOptions = useCallback(() => {
    setShowExportOptions(!showExportOptions);
  }, [showExportOptions]);

  const handleToggleShareOptions = useCallback(() => {
    setShowShareOptions(!showShareOptions);
  }, [showShareOptions]);

  if (!isVisible) return null;

  return (
    <div className="mobile-actionbar-overlay">
      <div className="mobile-actionbar-content">
        {/* Header */}
        <div className="mobile-actionbar-header">
          <h2 className="text-white font-medium text-lg">{_('Actions')}</h2>
          <button
            onClick={onClose}
            className="mobile-actionbar-close"
            aria-label={_('Close actions')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Actions principales */}
        <div className="mobile-actionbar-section">
          {/* Export */}
          <div className="mobile-action-group">
                      <button
            onClick={handleToggleExportOptions}
            className="mobile-action-button"
          >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{_('Export data')}</span>
              <svg className={`w-4 h-4 ml-auto transition-transform ${showExportOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showExportOptions && (
              <div className="mobile-action-submenu">
                <button
                  onClick={() => handleExport('pdf')}
                  className="mobile-action-subbutton"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {_('Export as PDF')}
                </button>
                <button
                  onClick={() => handleExport('xls')}
                  className="mobile-action-subbutton"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {_('Export as Excel')}
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="mobile-action-subbutton"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  {_('Export as JSON')}
                </button>
              </div>
            )}
          </div>

          {/* Share */}
          <div className="mobile-action-group">
            <button
              onClick={handleToggleShareOptions}
              className="mobile-action-button"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>{_('Share')}</span>
              <svg className={`w-4 h-4 ml-auto transition-transform ${showShareOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showShareOptions && (
              <div className="mobile-action-submenu">
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={() => handleShare('native')}
                    className="mobile-action-subbutton"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {_('Share via device')}
                  </button>
                )}
                <button
                  onClick={() => handleShare('copy')}
                  className="mobile-action-subbutton"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {_('Copy link')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions secondaires */}
        <div className="mobile-actionbar-section">
          <h3 className="text-gray-400 text-sm font-medium mb-3">{_('Quick Actions')}</h3>
          
          <button
            onClick={() => {
              window.open('https://github.com/galeon/hospital-map', '_blank');
              onClose();
            }}
            className="mobile-action-button"
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>{_('View on GitHub')}</span>
          </button>

          <button
            onClick={() => {
              window.open('https://galeon.community', '_blank');
              onClose();
            }}
            className="mobile-action-button"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>{_('Visit Galeon')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileActionBar; 