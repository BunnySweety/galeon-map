'use client';

import { useCallback } from 'react';
import { useLingui } from '@lingui/react';
import Image from 'next/image';
import { useMapStore } from '../store/useMapStore';
import { LocaleType } from '../i18n';

interface MobileSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onLanguageChange: (language: LocaleType) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  isVisible, 
  onClose, 
  onLanguageChange 
}) => {
  const { i18n } = useLingui();
  const { hospitals, selectedFilters, toggleFilter, language } = useMapStore();

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

  const deployedCount = hospitals.filter(h => h.status === 'Deployed').length;
  const signedCount = hospitals.filter(h => h.status === 'Signed').length;
  const totalCount = deployedCount + signedCount;

  const deployedColor = '#3b82f6';
  const signedColor = '#10b981';

  const handleLanguageSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onLanguageChange(e.target.value as LocaleType);
  }, [onLanguageChange]);

  if (!isVisible) return null;

  return (
    <div className="mobile-sidebar-overlay">
      <div className="mobile-sidebar-content">
        {/* Header avec logo */}
        <div className="mobile-sidebar-header">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo-white.svg"
              alt={_('Galeon Logo')}
              width={28}
              height={28}
              className="mr-2"
            />
            <span className="text-white font-bold text-xl">GALEON</span>
          </div>
          
          <h1 className="text-blue-400 text-center text-lg font-medium mb-4">
            {_('HOSPITALS MAP')}
          </h1>

          <button
            onClick={onClose}
            className="mobile-sidebar-close"
            aria-label={_('Close menu')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <div className="mobile-sidebar-section">
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {_('A community-driven map of deployed hospitals, with support from the Galeon team. Data is not official and may evolve over time.')}
          </p>
          
          <div className="flex items-center text-gray-400 text-xs mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{_('Last updated')}: {_('on')} 26/02/2025</span>
          </div>
        </div>

        {/* Distribution */}
        <div className="mobile-sidebar-section">
          <h2 className="text-white font-medium text-base mb-4">
            {_('Distribution')}
          </h2>

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                <svg viewBox="-2 -2 104 104" className="absolute inset-0">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke={deployedColor}
                    strokeWidth="12"
                  />
                  {signedCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke={signedColor}
                      strokeWidth="12"
                      strokeDasharray={`${(signedCount / totalCount) * 289}, 289`}
                      transform="rotate(-90 50 50)"
                    />
                  )}
                </svg>
                <span className="text-lg font-bold text-white z-10">{totalCount}</span>
              </div>
            </div>
          </div>

          {/* Légende */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white mr-3 cursor-pointer"
                  style={{ 
                    backgroundColor: deployedColor,
                    opacity: selectedFilters.deployed ? 1 : 0.5 
                  }}
                  onClick={() => toggleFilter('deployed')}
                />
                <span className="text-white text-sm">{_('Deployed')}</span>
              </div>
              <span className="text-gray-400 text-sm">{deployedCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white mr-3 cursor-pointer"
                  style={{ 
                    backgroundColor: signedColor,
                    opacity: selectedFilters.signed ? 1 : 0.5 
                  }}
                  onClick={() => toggleFilter('signed')}
                />
                <span className="text-white text-sm">{_('Signed')}</span>
              </div>
              <span className="text-gray-400 text-sm">{signedCount}</span>
            </div>
          </div>
        </div>

        {/* Sélecteur de langue */}
        <div className="mobile-sidebar-section">
          <h3 className="text-white font-medium text-sm mb-3">
            {_('Language')}
          </h3>
          <select
            value={language}
            onChange={handleLanguageSelectChange}
            className="mobile-language-select"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>

        {/* Liens sociaux */}
        <div className="mobile-sidebar-section">
          <h3 className="text-white font-medium text-sm mb-3">
            {_('Community')}
          </h3>
          <div className="flex space-x-4">
            <a
              href="https://discord.gg/galeon"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-social-link"
              aria-label="Discord"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/galeon"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-social-link"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar; 