// File: app/components/Sidebar.tsx
'use client';

import { useLingui } from '@lingui/react';
import { useMapStore } from '../store/useMapStore';
import { LocaleType } from '../i18n';
import Image from 'next/image';
import { useEffect } from 'react';

interface SidebarProps {
  className?: string;
}

const LANGUAGE_NAMES = {
  en: 'English',
  fr: 'Français'
} as const;

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  
  const { 
    hospitals, 
    selectedFilters, 
    toggleFilter, 
    language, 
    setLanguage 
  } = useMapStore();

  // Update i18n locale when language changes
  useEffect(() => {
    if (i18n && i18n.locale !== language) {
      console.log(`Language changed to ${language}, updating i18n locale`);
      setLanguage(language);
    }
  }, [i18n, language, setLanguage]);
  
  const handleLanguageChange = (newLanguage: LocaleType) => {
    if (newLanguage !== language) {
      console.log(`Language change requested: ${language} -> ${newLanguage}`);
      setLanguage(newLanguage);
    }
  };
  
  const deployedCount = hospitals.filter(h => h.status === 'Deployed').length;
  const signedCount = hospitals.filter(h => h.status === 'Signed').length;
  const totalCount = deployedCount + signedCount;
  
  // Set the exact colors matching the map markers
  const deployedColor = "#3b82f6"; // Blue
  const signedColor = "#10b981";   // Green - using the exact marker green
  
  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Premier bloc - with neon title effect */}
      <div className="box-border flex flex-col justify-center p-[clamp(20px,5vw,38px)] w-[clamp(300px,30vw,360px)] rounded-[16px] border border-white/15 backdrop-blur-[17.5px] bg-[rgba(217,217,217,0.05)]">
        <div className="flex items-center justify-center mb-4">
         {/* Logo from SVG file */}
         <Image 
            src="/logo-white.svg" 
            alt={i18n._('Galeon Logo')} 
            width={40} 
            height={40} 
            className="mr-3"
            style={{ width: 'auto', height: 'auto' }}
          />
          <span className="text-[clamp(24px,4vw,36px)] font-normal tracking-wide text-white font-[var(--font-minion)]">
            {i18n._('GALEON')}
          </span>
        </div>
        
        {/* Neon title effect for "HOSPITALS MAP" */}
        <h1 className="text-[clamp(16px,2.5vw,24px)] font-normal tracking-wide text-[#60a5fa] mb-5 text-center"
            style={{
              textShadow: "0 0 5px rgba(96, 165, 250, 0.7), 0 0 10px rgba(96, 165, 250, 0.5), 0 0 15px rgba(96, 165, 250, 0.3)"
            }}
        >
          {i18n._('HOSPITALS MAP')}
        </h1>
        
        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-400 mb-5 leading-relaxed">
          {i18n._('A community-driven map of deployed hospitals, with support from the Galeon team. Data is not official and may evolve over time.')}
        </p>
        <div className="text-[clamp(10px,1vw,12px)] text-white flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{i18n._('Last updated')}: {i18n._('on')} 26/02/2025</span>
        </div>
      </div>

      {/* Deuxième bloc */}
      <div className="box-border w-[clamp(300px,30vw,360px)] min-h-[clamp(600px,80vh,800px)] max-h-[90vh] overflow-y-auto p-6 rounded-[16px] border border-white/15 backdrop-blur-[17.5px] bg-[rgba(217,217,217,0.05)]">
        {/* Distribution */}
        <div className="mb-12">
          <h2 className="text-[clamp(18px,2vw,24px)] font-medium text-white mb-8">{i18n._('Distribution')}</h2>
          
          <div className="flex mb-10">
            {/* Circle Gauge */}
            <div className="relative w-[100px] h-[100px]">
              <div className="w-[100px] h-[100px] rounded-full bg-[#2e3a59] flex items-center justify-center">
                {/* Base blue circle representing deployed */}
                <svg viewBox="0 0 100 100" className="absolute inset-0">
                  <circle cx="50" cy="50" r="46" fill="none" stroke={deployedColor} strokeWidth="8" />
                  
                  {/* Green arc for signed - placed on top */}
                  {signedCount > 0 && (
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="46" 
                      fill="none" 
                      stroke={signedColor} 
                      strokeWidth="8"
                      strokeDasharray={`${(signedCount / totalCount) * 289}, 289`} 
                      transform="rotate(-90 50 50)"
                    />
                  )}
                </svg>
                {/* Centered text */}
                <span className="text-[clamp(24px,3vw,36px)] font-bold text-white z-10">{totalCount}</span>
              </div>
            </div>
            
            {/* Legend on right */}
            <div className="flex flex-col justify-center ml-6 space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full bg-[#3b82f6] border-2 border-white mr-2 cursor-pointer"
                    onClick={() => toggleFilter('deployed')}
                    style={{ opacity: selectedFilters.deployed ? 1 : 0.5 }}
                    role="checkbox"
                    aria-checked={selectedFilters.deployed}
                    aria-label={i18n._('Toggle deployed hospitals')}
                  />
                  <span className="text-[clamp(12px,1.2vw,14px)] text-[#3b82f6] font-medium">
                    {i18n.locale === 'fr' ? i18n._('Deployed_sidebar') : i18n._('Deployed')}
                  </span>
                </div>
                <span className="text-[clamp(12px,1.2vw,14px)] text-[#3b82f6] font-bold">{deployedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full bg-[#10b981] border-2 border-white mr-2 cursor-pointer"
                    onClick={() => toggleFilter('signed')}
                    style={{ opacity: selectedFilters.signed ? 1 : 0.5 }}
                    role="checkbox"
                    aria-checked={selectedFilters.signed}
                    aria-label={i18n._('Toggle signed hospitals')}
                  />
                  <span className="text-[clamp(12px,1.2vw,14px)] text-[#10b981] font-medium">
                    {i18n.locale === 'fr' ? i18n._('Signed_sidebar') : i18n._('Signed')}
                  </span>
                </div>
                <span className="text-[clamp(12px,1.2vw,14px)] text-[#10b981] font-bold">{signedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Large empty space - Reduced */}
        <div className="h-[320px]"></div>

        {/* Language selection */}
        <div className="mb-10">
          <label className="text-white flex items-center mb-3 text-[clamp(12px,1.2vw,14px)]">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
            </svg>
            {i18n._('Language')}
          </label>
          <div className="relative">
            <select 
              className="block w-full px-4 py-2 bg-[#313b50]/90 border border-[#FFFFFF] rounded text-white appearance-none pr-8 text-[clamp(12px,1.2vw,14px)]"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as LocaleType)}
              aria-label={i18n._('Select language')}
            >
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#FFFFFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Social links and footer */}
        <div className="relative bottom-0 left-0 right-0 mt-auto">
          <div className="flex justify-between items-center mb-6 px-4">
            {/* Social links */}
            <a href="#" className="text-[#3b82f6] hover:text-blue-300" aria-label={i18n._('Visit our website')}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </a>
            <a href="#" className="text-[#3b82f6] hover:text-blue-300" aria-label={i18n._('Follow us on Twitter')}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.03 10.03 0 01-3.127 1.184A4.92 4.92 0 0012.32 8.58a13.94 13.94 0 01-10.121-5.13 4.92 4.92 0 001.526 6.57 4.9 4.9 0 01-2.23-.618v.063a4.92 4.92 0 003.946 4.827 4.924 4.924 0 01-2.224.085 4.93 4.93 0 004.6 3.42A9.873 9.873 0 010 19.54a13.9 13.9 0 007.548 2.208c9.054 0 14-7.5 14-14 0-.21-.005-.42-.014-.63A10.012 10.012 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="text-[#3b82f6] hover:text-blue-300" aria-label={i18n._('Connect on LinkedIn')}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" className="text-[#3b82f6] hover:text-blue-300" aria-label={i18n._('Watch us on YouTube')}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="#" className="text-[#3b82f6] hover:text-blue-300" aria-label={i18n._('Join us on Telegram')}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
              </svg>
            </a>
          </div>
          <p className="text-[clamp(12px,1.2vw,14px)] text-white text-center">
            © {currentYear} {i18n._('Galeon Community')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;