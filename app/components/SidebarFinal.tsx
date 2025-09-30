// File: app/components/SidebarFinal.tsx
'use client';


import Image from 'next/image';
import { useCallback } from 'react';
import { useMapStore } from '../store/useMapStore';
import { LocaleType } from '../i18n';

interface SidebarFinalProps {
  className?: string;
}

const SidebarFinal: React.FC<SidebarFinalProps> = ({ className = '' }) => {
  const { hospitals, selectedFilters, toggleFilter, language, setLanguage, searchTerm, setSearchTerm } = useMapStore();

  const handleLanguageChange = useCallback((newLanguage: LocaleType) => {
    if (newLanguage !== language) {
      setLanguage(newLanguage);
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLanguage);
      }
    }
  }, [language, setLanguage]);

  const deployedCount = hospitals.filter(h => h.status === 'Deployed').length;
  const signedCount = hospitals.filter(h => h.status === 'Signed').length;
  const totalCount = deployedCount + signedCount;

  return (
    <div 
      className={className}
      style={{
        width: 'clamp(260px, 18vw, 320px)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Container principal qui remplit tout l'espace disponible */}
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        border: '2px solid rgba(71, 154, 243, 0.3)',
        backdropFilter: 'blur(17.5px)',
        WebkitBackdropFilter: 'blur(17.5px)',
        background: 'rgba(217, 217, 217, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        gap: '16px' // Espace interne entre sections
      }}>
        
        {/* SECTION 1: Header */}
        <div style={{
          textAlign: 'center',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(71, 154, 243, 0.2)',
          flexShrink: 0
        }}>
          {/* Logo + GALEON */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '12px' 
          }}>
            <Image
              src="/logo-white.svg"
              alt="Galeon Logo"
              width={28}
              height={28}
              style={{ marginRight: '8px' }}
            />
            <span style={{ 
              color: 'white', 
              fontSize: '22px', 
              fontWeight: '600'
            }}>
              GALEON
            </span>
          </div>

          {/* HOSPITALS MAP néon */}
          <h1 style={{
            color: '#3b82f6',
            fontSize: '18px',
            fontWeight: '400',
            letterSpacing: '1px',
            marginBottom: '12px',
            textShadow: '0 0 8px rgba(59, 130, 246, 0.8), 0 0 16px rgba(59, 130, 246, 0.4)'
          }}>
            HOSPITALS MAP
          </h1>

          {/* Description */}
          <p style={{
            color: '#d1d5db',
            fontSize: '12px',
            lineHeight: '1.5',
            marginBottom: '12px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
            fontWeight: '400'
          }}>
            A community-driven map of deployed hospitals, with support from the Galeon team. Data is not official and may evolve over time.
          </p>

          {/* Last updated */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: '11px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
            fontWeight: '400'
          }}>
            <svg style={{ width: '12px', height: '12px', marginRight: '6px' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Last updated: on {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        {/* SECTION 2: Search - Au-dessus de Distribution */}
        <div style={{ 
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(71, 154, 243, 0.2)',
          flexShrink: 0
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value), [setSearchTerm])}
            placeholder="🔍 Search by name, address, city..."
            className="sidebar-search-input"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(71, 154, 243, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#f3f4f6',
              fontSize: '13px',
              outline: 'none',
              fontWeight: '400',
              textShadow: '0 1px 1px rgba(0, 0, 0, 0.4)',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(255, 255, 255, 0.05)'
            }}
          />
        </div>

        {/* SECTION 3: Distribution */}
        <div style={{
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(71, 154, 243, 0.2)',
          flexShrink: 0
        }}>
          <h2 style={{
            color: '#f9fafb',
            fontSize: '17px',
            fontWeight: '600',
            marginBottom: '16px',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 0 8px rgba(59, 130, 246, 0.2)',
            letterSpacing: '0.5px'
          }}>
            Distribution
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Jauge segmentée deployed/signed */}
            <div style={{
              width: '80px',
              height: '80px',
              position: 'relative',
              flexShrink: 0
            }}>
              <svg width="80" height="80" viewBox="0 0 80 80" style={{
                transform: 'rotate(-90deg)'
              }}>
                {/* Cercle de base (gris) */}
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="rgba(107, 114, 128, 0.3)"
                  strokeWidth="6"
                />
                {/* Arc bleu pour deployed */}
                {deployedCount > 0 && (
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="6"
                    strokeDasharray={`${(deployedCount / totalCount) * 226} 226`}
                    strokeLinecap="round"
                  />
                )}
                {/* Arc vert pour signed */}
                {signedCount > 0 && (
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="6"
                    strokeDasharray={`${(signedCount / totalCount) * 226} 226`}
                    strokeDashoffset={`-${(deployedCount / totalCount) * 226}`}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              {/* Nombre total au centre */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ 
                  color: 'white', 
                  fontSize: '28px', 
                  fontWeight: '700' 
                }}>
                  {totalCount}
                </span>
              </div>
            </div>

            {/* Filtres */}
            <div style={{ flex: 1 }}>
              {/* Deployed */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  opacity: 1,
                  transition: 'all 0.2s ease'
                }}
                onClick={useCallback(() => toggleFilter('deployed'), [toggleFilter])}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: selectedFilters.deployed ? '#3b82f6' : 'transparent',
                    border: selectedFilters.deployed ? '2.5px solid #ffffff' : '2px solid #3b82f6',
                    marginRight: '8px',
                    transition: 'all 0.2s ease',
                    opacity: 1
                  }}></div>
                  <span style={{ 
                    color: selectedFilters.deployed ? '#3b82f6' : '#9ca3af', 
                    fontSize: '15px',
                    transition: 'color 0.2s ease',
                    fontWeight: '500',
                    textShadow: selectedFilters.deployed ? '0 1px 2px rgba(59, 130, 246, 0.3)' : '0 1px 1px rgba(0, 0, 0, 0.3)'
                  }}>
                    Deployed
                  </span>
                </div>
                <span style={{ 
                  color: selectedFilters.deployed ? '#3b82f6' : '#9ca3af', 
                  fontSize: '17px', 
                  fontWeight: '700',
                  transition: 'color 0.2s ease',
                  textShadow: selectedFilters.deployed ? '0 1px 2px rgba(59, 130, 246, 0.3)' : '0 1px 1px rgba(0, 0, 0, 0.3)'
                }}>
                  {deployedCount}
                </span>
              </div>

              {/* Signed */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  opacity: 1,
                  transition: 'all 0.2s ease'
                }}
                onClick={useCallback(() => toggleFilter('signed'), [toggleFilter])}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: selectedFilters.signed ? '#10b981' : 'transparent',
                    border: selectedFilters.signed ? '2.5px solid #ffffff' : '2px solid #10b981',
                    marginRight: '8px',
                    transition: 'all 0.2s ease',
                    opacity: 1
                  }}></div>
                  <span style={{ 
                    color: selectedFilters.signed ? '#10b981' : '#9ca3af', 
                    fontSize: '15px',
                    transition: 'color 0.2s ease',
                    fontWeight: '500',
                    textShadow: selectedFilters.signed ? '0 1px 2px rgba(16, 185, 129, 0.3)' : '0 1px 1px rgba(0, 0, 0, 0.3)'
                  }}>
                    Signed
                  </span>
                </div>
                <span style={{ 
                  color: selectedFilters.signed ? '#10b981' : '#9ca3af', 
                  fontSize: '17px', 
                  fontWeight: '700',
                  transition: 'color 0.2s ease',
                  textShadow: selectedFilters.signed ? '0 1px 2px rgba(16, 185, 129, 0.3)' : '0 1px 1px rgba(0, 0, 0, 0.3)'
                }}>
                  {signedCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Zone flexible pour expansion */}
        <div style={{ 
          flex: 1
        }}>
          {/* Espace flexible qui pousse Language et Footer vers le bas */}
        </div>

        {/* SECTION 5: Language - En bas au-dessus des réseaux */}
        <div style={{
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(71, 154, 243, 0.2)',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <svg style={{ width: '14px', height: '14px', color: 'white', marginRight: '6px' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span style={{ 
              color: '#f3f4f6', 
              fontSize: '15px', 
              fontWeight: '500',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
            }}>
              Language
            </span>
          </div>
          
          <select
            value={language}
            onChange={useCallback((e: React.ChangeEvent<HTMLSelectElement>) => handleLanguageChange(e.target.value as LocaleType), [handleLanguageChange])}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(71, 154, 243, 0.5)',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#f3f4f6',
              fontSize: '14px',
              outline: 'none',
              fontWeight: '500',
              textShadow: '0 1px 1px rgba(0, 0, 0, 0.4)',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(255, 255, 255, 0.05)'
            }}
          >
            <option value="en" style={{ backgroundColor: '#1e293b' }}>🇺🇸 English</option>
            <option value="fr" style={{ backgroundColor: '#1e293b' }}>🇫🇷 Français</option>
          </select>
        </div>

        {/* SECTION 6: Footer social - Icônes simplifiées */}
        <div style={{
          textAlign: 'center',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '12px'
          }}>
            <a
              href="https://www.galeon.care/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </a>

            <a
              href="https://twitter.com/galeoncare"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            <a
              href="https://linkedin.com/company/galeon"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>

            <a
              href="https://youtube.com/@galeoncare"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            <a
              href="https://t.me/galeoncare"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
          </div>

          <p style={{
            color: '#9ca3af',
            fontSize: '11px',
            textShadow: '0 1px 1px rgba(0, 0, 0, 0.4)',
            fontWeight: '400'
          }}>
            © 2025 Galeon Community
          </p>
        </div>
      </div>
    </div>
  );
};

export default SidebarFinal;
