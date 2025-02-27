// File: app/components/Sidebar.tsx
'use client';

import { useLingui } from '@lingui/react';
import { useCallback } from 'react';
import { useMapStore } from '../store/useMapStore';
import { activateLocale, LocaleType } from '../i18n';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  
  // Create a safe translation function that handles undefined i18n
  const _ = (text: string) => {
    try {
      return i18n && i18n._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  };
  
  const { 
    hospitals, 
    selectedFilters, 
    toggleFilter, 
    language, 
    setLanguage 
  } = useMapStore();
  
  const deployedCount = hospitals.filter(h => h.status === 'Deployed').length;
  const signedCount = hospitals.filter(h => h.status === 'Signed').length;
  const totalCount = deployedCount + signedCount;
  
  // Handle language change
  const handleLanguageChange = useCallback(async (newLanguage: LocaleType) => {
    await activateLocale(newLanguage);
    setLanguage(newLanguage);
    
    // Safely log the language change
    console.log(`Language switched to: ${newLanguage}`);
    try {
      if (i18n && i18n.locale) {
        console.log(`Current locale: ${i18n.locale}`);
      }
    } catch {
      // Ignore errors when accessing i18n.locale
    }
  }, [i18n, setLanguage]);

  return (
    <div className={`w-full h-full flex flex-col gap-6 p-6 bg-slate-800 text-white ${className}`}>
      {/* Logo and title */}
      <div>
        <div className="flex items-center mb-4">
          <span className="text-3xl font-bold mr-2">Ω</span>
          <span className="text-3xl font-bold">GALEON</span>
        </div>
        <h1 className="text-3xl font-bold text-blue-400">{_('Hospitals Map')}</h1>
        <p className="mt-4 text-sm text-gray-300">
          {_('A community-driven map of deployed hospitals, with support from the Galeon team. Data is not official and may evolve over time.')}
        </p>
        <div className="mt-4 text-sm text-gray-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{_('Last updated')}: 26/02/2025</span>
        </div>
      </div>

      {/* Distribution */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-4">{_('Distribution')}</h2>
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-blue-400 flex items-center justify-center relative">
            <span className="text-2xl font-bold">{totalCount}</span>
            <div className="absolute -bottom-2 bg-slate-800 px-2">
              <span className="text-lg font-semibold">{totalCount}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full bg-blue-400 mr-2 cursor-pointer"
              onClick={() => toggleFilter('deployed')}
              style={{ opacity: selectedFilters.deployed ? 1 : 0.5 }}
            />
            <span className="mr-auto">{_('Deployed')}</span>
            <span>{deployedCount}</span>
          </div>
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full bg-green-400 mr-2 cursor-pointer"
              onClick={() => toggleFilter('signed')}
              style={{ opacity: selectedFilters.signed ? 1 : 0.5 }}
            />
            <span className="mr-auto">{_('Signed')}</span>
            <span>{signedCount}</span>
          </div>
        </div>
      </div>

      {/* Language selection */}
      <div className="mt-4">
        <label className="text-gray-300">{_('Language')}</label>
        <div className="relative mt-1">
          <select 
            className="block w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white appearance-none pr-8"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as LocaleType)}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Social links and footer */}
      <div className="mt-auto">
        <div className="flex space-x-4 mb-4">
          <a href="#" className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
              <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.03 10.03 0 01-3.127 1.184A4.92 4.92 0 0012.32 8.58a13.94 13.94 0 01-10.121-5.13 4.92 4.92 0 001.526 6.57 4.9 4.9 0 01-2.23-.618v.063a4.92 4.92 0 003.946 4.827 4.924 4.924 0 01-2.224.085 4.93 4.93 0 004.6 3.42A9.873 9.873 0 010 19.54a13.9 13.9 0 007.548 2.208c9.054 0 14-7.5 14-14 0-.21-.005-.42-.014-.63A10.012 10.012 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm2.168 18.672c-.235.052-.478.072-.72.072-1.776 0-3.064-1.518-3.064-3.39 0-.238.018-.475.063-.698A8.19 8.19 0 016.6 16.843a5.6 5.6 0 01-.249-.304c-.513-.69-.768-1.537-.768-2.508 0-2.188 1.784-3.97 3.97-3.97.8 0 1.532.234 2.145.62a8.221 8.221 0 012.606-2.573A5.61 5.61 0 0012.36 7.7c0-3.116 2.534-5.65 5.65-5.65 3.116 0 5.65 2.534 5.65 5.65 0 1.545-.626 2.945-1.633 3.962.115.425.18.87.18 1.33 0 2.152-1.22 4.028-3.004 4.997l.395 1.494c.114.429-.143.873-.572.986z"/>
            </svg>
          </a>
        </div>
        <p className="text-xs text-gray-400">
          © 2025 Galeon Community - <a href="#" className="text-blue-400 hover:underline">{_('Open source project')}</a>
        </p>
        <p className="text-xs text-gray-400 mt-2">
          {_('Made with')} <span className="text-red-400">♥</span> {_('by')} BunnySweety
        </p>
        <div className="mt-2">
          <span className="text-xs bg-gray-700 rounded-full px-2 py-1">
            Version Pre-Release
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;