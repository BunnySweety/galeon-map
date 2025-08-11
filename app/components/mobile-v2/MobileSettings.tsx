'use client';

import { useCallback, useState } from 'react';
import { useLingui } from '@lingui/react';
import { useMapStore } from '../../store/useMapStore';
import { motion } from 'framer-motion';
import { exportFilteredHospitals } from '../../utils/export-utils';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function MobileSettings() {
  const { i18n } = useLingui();
  const { language, setLanguage, hospitals, currentDate, selectedFilters } = useMapStore();
  const [showExportOptions, setShowExportOptions] = useState(false);

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

  const handleLanguageChange = useCallback((lang: 'en' | 'fr') => {
    setLanguage(lang);
    // Force reload to apply language change
    window.location.reload();
  }, [setLanguage]);

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
      };

      exportFilteredHospitals(
        hospitals,
        currentDate,
        selectedFilters,
        i18n.locale || 'en',
        translations,
        format
      );

      toast.success(_(`Export ${format.toUpperCase()} completed!`), {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#1e293b',
          color: '#fff',
          borderRadius: '0.5rem',
          border: '1px solid rgb(51 65 85 / 0.5)',
        },
      });

      setShowExportOptions(false);
    } catch (error) {
      toast.error(_('Export failed. Please try again.'), {
        duration: 4000,
        position: 'bottom-center',
        style: {
          background: '#1e293b',
          color: '#fff',
          borderRadius: '0.5rem',
          border: '1px solid rgb(239 68 68 / 0.5)',
        },
      });
    }
  }, [hospitals, currentDate, selectedFilters, i18n.locale, _]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: _('Galeon Hospitals Map'),
      text: _('Check out this interactive map of Galeon hospitals!'),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href);
        toast.success(_('Link copied to clipboard!'), {
          duration: 2000,
          position: 'bottom-center',
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '0.5rem',
            border: '1px solid rgb(51 65 85 / 0.5)',
          },
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [_]);

  const settingsSections = [
    {
      title: _('Language'),
      content: (
        <div className="flex space-x-2">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              language === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLanguageChange('fr')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              language === 'fr'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            Français
          </button>
        </div>
      ),
    },
    {
      title: _('Export Data'),
      content: (
        <div className="space-y-2">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="w-full py-2 px-4 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors flex items-center justify-between"
          >
            <span>{_('Choose format')}</span>
            <svg className={`w-5 h-5 transition-transform ${showExportOptions ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showExportOptions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 pl-4"
            >
              <button
                onClick={() => handleExport('pdf')}
                className="w-full py-2 px-4 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
              >
                📄 {_('Export as PDF')}
              </button>
              <button
                onClick={() => handleExport('xls')}
                className="w-full py-2 px-4 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
              >
                📊 {_('Export as Excel')}
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full py-2 px-4 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
              >
                💾 {_('Export as JSON')}
              </button>
            </motion.div>
          )}
        </div>
      ),
    },
    {
      title: _('Share'),
      content: (
        <button
          onClick={handleShare}
          className="w-full py-2 px-4 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>{_('Share Map')}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="h-full bg-slate-900 overflow-auto">
      {/* Header */}
      <div className="px-4 py-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <Image
            src="/logo-white.svg"
            alt="Galeon"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <div>
            <h1 className="text-white font-semibold text-xl">{_('Galeon Hospitals Map')}</h1>
            <p className="text-slate-400 text-sm">v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="p-4 space-y-4">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50"
          >
            <h3 className="text-white font-medium mb-3">{section.title}</h3>
            {section.content}
          </motion.div>
        ))}

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50"
        >
          <h3 className="text-white font-medium mb-3">{_('About')}</h3>
          <p className="text-slate-400 text-sm mb-4">
            {_('A community-driven map of deployed hospitals, with support from the Galeon team.')}
          </p>
          
          {/* Links */}
          <div className="space-y-2">
            <a
              href="https://github.com/galeon/hospital-map"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-slate-300 text-sm">{_('GitHub Repository')}</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <a
              href="https://galeon.care"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-slate-300 text-sm">{_('Visit Galeon')}</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center py-4"
        >
          <p className="text-slate-500 text-sm">
            {_('Made with')} ❤️ {_('by')} BunnySweety
          </p>
          <p className="text-slate-600 text-xs mt-1">
            {_('Last updated')}: 26/02/2025
          </p>
        </motion.div>
      </div>
    </div>
  );
}
