'use client';

import { useState, useCallback } from 'react';
import { useLingui } from '@lingui/react';
import { useMobileContext } from './MobileProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface MobileHeaderProps {
  isOffline?: boolean;
}

export default function MobileHeader({ isOffline = false }: MobileHeaderProps) {
  const { i18n } = useLingui();
  const { searchQuery, setSearchQuery, isFilterOpen, setIsFilterOpen, filters, toggleFilter } = useMobileContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery('');
    }
  }, [isSearchOpen, setSearchQuery]);

  return (
    <header className="mobile-header bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/logo-white.svg"
            alt="Galeon"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <span className="text-white font-semibold text-sm">GALEON</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Search Button */}
          <button
            onClick={handleSearchToggle}
            className="p-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50 transition-colors"
            aria-label={_('Search')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Filter Button with Badge */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="relative p-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50 transition-colors"
            aria-label={_('Filter')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {(!filters.deployed || !filters.signed) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-700/50 overflow-hidden"
          >
            <div className="px-4 py-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={_('Search hospitals...')}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-700/50 overflow-hidden"
          >
            <div className="px-4 py-3 flex items-center space-x-4">
              <button
                onClick={() => toggleFilter('deployed')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors ${
                  filters.deployed 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span className="text-sm font-medium">{_('Deployed')}</span>
              </button>

              <button
                onClick={() => toggleFilter('signed')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors ${
                  filters.signed 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span className="text-sm font-medium">{_('Signed')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Indicator */}
      {isOffline && (
        <div className="bg-orange-500/20 border-t border-orange-500/30 px-4 py-2">
          <p className="text-orange-400 text-xs text-center">
            {_('Offline mode - Limited functionality')}
          </p>
        </div>
      )}
    </header>
  );
}
