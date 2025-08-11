'use client';

import { useCallback } from 'react';
import type { ReactElement } from 'react';
import { useLingui } from '@lingui/react';
import { motion } from 'framer-motion';

type ViewType = 'map' | 'list' | 'timeline' | 'settings';

interface MobileBottomNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function MobileBottomNav({ activeView, onViewChange }: MobileBottomNavProps) {
  const { i18n } = useLingui();

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

  const navItems: Array<{ id: ViewType; label: string; icon: ReactElement }> = [
    {
      id: 'map',
      label: _('Map'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'list',
      label: _('List'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      id: 'timeline',
      label: _('Timeline'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: _('More'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className="relative flex flex-col items-center justify-center p-2 min-w-[60px] group"
            aria-label={item.label}
          >
            {/* Active Indicator */}
            {activeView === item.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-500/20 rounded-lg"
                transition={{ type: "spring", bounce: 0.25, duration: 0.3 }}
              />
            )}

            {/* Icon & Label */}
            <div className={`relative z-10 flex flex-col items-center justify-center transition-colors ${
              activeView === item.id ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
            }`}>
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </div>

            {/* Active Dot */}
            {activeView === item.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 right-1/2 translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Safe Area Padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-slate-800/95"></div>
    </nav>
  );
}
