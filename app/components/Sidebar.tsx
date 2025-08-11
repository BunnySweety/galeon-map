// File: app/components/Sidebar.tsx
'use client';

import { useLingui } from '@lingui/react';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { useMapStore } from '../store/useMapStore';
import { LocaleType } from '../i18n';
import logger from '../utils/logger';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  const [isMobileView, setIsMobileView] = useState(false);

  const { hospitals, selectedFilters, toggleFilter, language, setLanguage } = useMapStore();

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      // Consider mobile if width is narrow OR height is small (landscape mobile)
      const potentiallyMobile = window.innerWidth < 768 || window.innerHeight < 500; // Adjust 500px threshold if needed
      setIsMobileView(potentiallyMobile);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update i18n locale when language changes
  useEffect(() => {
    if (i18n && i18n.locale !== language) {
      logger.debug(`Language changed to ${language}, updating i18n locale`);
      setLanguage(language);
    }
  }, [i18n, language, setLanguage]);

  const handleLanguageChange = useCallback((newLanguage: LocaleType) => {
    if (newLanguage !== language) {
      logger.debug(`Language change requested: ${language} -> ${newLanguage}`);
      setLanguage(newLanguage);
    }
  }, [language, setLanguage]);

  // Handlers optimisés pour les filtres
  const handleDeployedToggle = useCallback(() => {
    toggleFilter('deployed');
  }, [toggleFilter]);

  const handleSignedToggle = useCallback(() => {
    toggleFilter('signed');
  }, [toggleFilter]);

  // Handler optimisé pour le changement de langue
  const handleLanguageSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleLanguageChange(e.target.value as LocaleType);
  }, [handleLanguageChange]);

  const deployedCount = hospitals.filter(h => h.status === 'Deployed').length;
  const signedCount = hospitals.filter(h => h.status === 'Signed').length;
  const totalCount = deployedCount + signedCount;

  // Set the exact colors matching the map markers
  const deployedColor = '#3b82f6'; // Blue
  const signedColor = '#10b981'; // Green - using the exact marker green

  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <div className={`flex flex-col gap-[var(--standard-spacing)] h-full ${className}`}>
      {/* Premier bloc - Adjusted gap for mobile */}
      <div
        className={`sidebar-container box-border flex flex-col justify-center rounded-[16px] border-2 border-[rgba(71,154,243,0.3)] backdrop-blur-[17.5px] bg-[rgba(217,217,217,0.05)] gap-y-2 md:gap-y-3 pt-[var(--standard-spacing)]`}
      >
        <div className="flex items-center justify-center">
          {/* Logo from SVG file */}
          <Image
            src="/logo-white.svg"
            alt={i18n._('Galeon Logo')}
            width={32}
            height={32}
            className="mr-2"
            style={{ width: 'auto', height: 'auto', minWidth: '32px', minHeight: '32px' }}
          />
          <span className="text-white tracking-wide font-[var(--font-minion)] text-2xl lg:text-3xl">
            {i18n._('GALEON')}
          </span>
        </div>

        {/* Neon title effect for "HOSPITALS MAP" - Adjusted size */}
        <h1
          className="text-[#60a5fa] font-normal tracking-wide text-center text-xl lg:text-2xl"
          style={{
            textShadow:
              '0 0 5px rgba(96, 165, 250, 0.7), 0 0 10px rgba(96, 165, 250, 0.5), 0 0 15px rgba(96, 165, 250, 0.3)',
            fontSize: 'clamp(18px, 4vw, 24px)',
          }}
        >
          {i18n._('HOSPITALS MAP')}
        </h1>

        <p className="text-gray-400 leading-relaxed text-xs md:text-sm" style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
          {i18n._(
            'A community-driven map of deployed hospitals, with support from the Galeon team. Data is not official and may evolve over time.'
          )}
        </p>
        <div className="text-white flex items-center text-[10px] md:text-xs" style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>
            {i18n._('Last updated')}: {i18n._('on')} 26/02/2025
          </span>
        </div>
      </div>

      {/* Deuxième bloc - Added overflow-y-auto */}
      <div
        className={`sidebar-container-second box-border flex-1 flex flex-col justify-between rounded-[16px] border-2 border-[rgba(71,154,243,0.3)] backdrop-blur-[17.5px] bg-[rgba(217,217,217,0.05)] overflow-y-auto pb-0`}
      >
        {/* Distribution - Adjusted margin for mobile */}
        <div className="mb-4">
          <h2 className="text-white font-medium flex items-center mb-2 md:mb-4 text-base md:text-lg">
            {/* Removed Distribution Icon */}
            {i18n._('Distribution')}
          </h2>

          {/* Container for Gauge + Legend - Conditional Layout */}
          <div className={`flex items-center mb-10 ${isMobileView ? 'flex-col' : ''}`}>
            {/* Circle Gauge - Made responsive */}
            <div
              className={`relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 ${isMobileView ? 'mb-4' : ''}`}
            >
              {' '}
              {/* Add bottom margin on mobile */}
              <div className="w-full h-full rounded-full bg-[#2e3a59] flex items-center justify-center">
                {' '}
                {/* Use w-full/h-full */}
                {/* Base blue circle representing deployed */}
                <svg viewBox="-2 -2 104 104" className="absolute inset-0">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke={deployedColor}
                    strokeWidth="12"
                  />

                  {/* Green arc for signed - placed on top */}
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
                {/* Centered text - Adjusted clamp */}
                <span className="text-lg lg:text-xl font-bold text-white z-10" style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>{totalCount}</span>
              </div>
            </div>

            {/* Legend - Conditional Margin */}
            <div
              className={`flex flex-col justify-center w-full ${isMobileView ? 'ml-2' : 'ml-6'}`}
            >
              {' '}
              {/* Conditional margin */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-[#3b82f6] border-2 border-white mr-3 cursor-pointer flex-shrink-0"
                    onClick={handleDeployedToggle}
                    style={{ 
                      opacity: selectedFilters.deployed ? 1 : 0.5,
                      minWidth: '20px',
                      minHeight: '20px',
                      touchAction: 'manipulation'
                    }}
                    role="checkbox"
                    aria-checked={selectedFilters.deployed}
                    aria-label={i18n._('Toggle deployed hospitals')}
                  />
                  <span className="text-[#3b82f6] font-medium text-sm lg:text-base" style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
                    {i18n.locale === 'fr' ? i18n._('Deployed_sidebar') : i18n._('Deployed')}
                  </span>
                </div>
                <span className="text-[#3b82f6] font-bold text-sm lg:text-base ml-3" style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
                  {deployedCount}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-[#10b981] border-2 border-white mr-3 cursor-pointer flex-shrink-0"
                    onClick={handleSignedToggle}
                    style={{ 
                      opacity: selectedFilters.signed ? 1 : 0.5,
                      minWidth: '20px',
                      minHeight: '20px',
                      touchAction: 'manipulation'
                    }}
                    role="checkbox"
                    aria-checked={selectedFilters.signed}
                    aria-label={i18n._('Toggle signed hospitals')}
                  />
                  <span className="text-[#10b981] font-medium text-sm lg:text-base" style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
                    {i18n.locale === 'fr' ? i18n._('Signed_sidebar') : i18n._('Signed')}
                  </span>
                </div>
                <span className="text-[#10b981] font-bold text-sm lg:text-base ml-3" style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
                  {signedCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wrapper for Language Selector and Footer - Adjusted gap for mobile */}
        <div className="mt-auto flex flex-col gap-y-3 md:gap-y-4 mb-0">
          {/* Language selector - Removed mt-auto */}
          <div>
            <label className="text-white font-medium flex items-center mb-2 text-sm md:text-base" style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
              <svg
                className="w-6 h-6 mr-3 text-[#3b82f6]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                ></path>
              </svg>
              {i18n._('Language')}
            </label>
            <div className="relative">
              <select
                value={i18n.locale}
                onChange={handleLanguageSelectChange}
                className="w-full p-3 rounded-lg bg-[rgba(217,217,217,0.1)] border border-[rgba(71,154,243,0.3)] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                style={{ 
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  minHeight: '48px',
                  touchAction: 'manipulation'
                }}
              >
                <option value="en" className="bg-[#1e293b] text-white">
                  English
                </option>
                <option value="fr" className="bg-[#1e293b] text-white">
                  Français
                </option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-3 h-3 text-[#FFFFFF]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Social links and footer - Removed mt-auto, now part of the bottom block */}
          <div>
            <div className="flex justify-between items-center px-1 mb-1 md:mb-2">
              {/* Social links - responsive sizing */}
              <a
                href="https://www.galeon.care/"
                className="text-[#3b82f6] hover:text-blue-300 p-2"
                aria-label={i18n._('Visit our website')}
                style={{ 
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'manipulation'
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </a>
              <a
                href="https://x.com/GaleonCare"
                className="text-[#3b82f6] hover:text-blue-300 p-2"
                aria-label={i18n._('Follow us on Twitter')}
                style={{ 
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'manipulation'
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.03 10.03 0 01-3.127 1.184A4.92 4.92 0 0012.32 8.58a13.94 13.94 0 01-10.121-5.13 4.92 4.92 0 001.526 6.57 4.9 4.9 0 01-2.23-.618v.063a4.92 4.92 0 003.946 4.827 4.924 4.924 0 01-2.224.085 4.93 4.93 0 004.6 3.42A9.873 9.873 0 010 19.54a13.9 13.9 0 007.548 2.208c9.054 0 14-7.5 14-14 0-.21-.005-.42-.014-.63A10.012 10.012 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/galeon-care/"
                className="text-[#3b82f6] hover:text-blue-300 p-2"
                aria-label={i18n._('Connect on LinkedIn')}
                style={{ 
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'manipulation'
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@galeoncare"
                className="text-[#3b82f6] hover:text-blue-300 p-2"
                aria-label={i18n._('Watch us on YouTube')}
                style={{ 
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'manipulation'
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://t.me/Galeon_ANN"
                className="text-[#3b82f6] hover:text-blue-300"
                aria-label={i18n._('Join us on Telegram')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                </svg>
              </a>
            </div>
            <p className="text-white text-center text-[10px] md:text-xs">
              © {currentYear} {i18n._('Galeon Community')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
