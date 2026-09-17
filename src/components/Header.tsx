import React, { useState } from 'react';
import { Search, Menu, X, Film, Tv, PlaySquare, Radio, Bookmark, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteSettings } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  onOpenSearch,
  isAdmin,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Início', icon: Film },
    { id: 'movies', label: 'Filmes', icon: Film },
    { id: 'tv', label: 'Séries', icon: Tv },
    { id: 'anime', label: 'Animes', icon: PlaySquare },
    { id: 'channels', label: 'Canais Ao Vivo', icon: Radio },
    { id: 'watchlist', label: 'Minha Lista', icon: Bookmark },
  ];

  return (
    <>
      <header
        id="app-header"
        className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-xs transition-all duration-300 px-4 sm:px-8 py-3.5 flex items-center justify-between"
      >
        {/* Logo and primary navigation */}
        <div className="flex items-center gap-6 sm:gap-10">
          <button
            id="brand-logo-btn"
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.site_name}
                className="h-8 sm:h-9 object-contain"
              />
            ) : (
              <span className="font-bebas text-2xl sm:text-3xl text-red-600 tracking-wider font-extrabold group-hover:scale-105 transition-transform drop-shadow-[0_2px_10px_rgba(229,9,20,0.5)]">
                {settings.logo_text || 'CINE FANIO'}
              </span>
            )}
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`transition-colors cursor-pointer py-1 relative ${
                  activeTab === item.id
                    ? 'text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {item.label}
                {activeTab === item.id && (
                  <motion.div
                    layoutId="header-active-tab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right side controls: Search & Mobile Menu (Notice: NO profile icon for regular users as demanded) */}
        <div className="flex items-center gap-3">
          {/* If already logged in as Admin, show quick badge */}
          {isAdmin && (
            <button
              id="admin-active-badge-btn"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-400 text-xs rounded-full font-semibold hover:bg-red-600/30 transition-colors"
              title="Painel Administrativo Ativo"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin (ADMV)</span>
            </button>
          )}

          {/* Search button with ADMV trigger */}
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full sm:rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
            aria-label="Pesquisar ou Código de Acesso"
            title="Pesquisar filmes, séries ou código ADMV"
          >
            <Search className="w-5 h-5 text-neutral-200" />
            <span className="hidden md:inline text-xs text-neutral-400 font-normal">
              Pesquisar...
            </span>
          </button>

          {/* Mobile hamburger menu */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-0 z-50 bg-[#0c0c11]/95 backdrop-blur-md lg:hidden flex flex-col p-6 pt-20"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <span className="font-bebas text-3xl text-red-600 tracking-wider font-extrabold">
                {settings.logo_text || 'CINE FANIO'}
              </span>
              <p className="text-xs text-neutral-400 mt-1">
                Streaming 100% Grátis sem cadastro
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === item.id
                        ? 'bg-red-600 text-white font-semibold'
                        : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-base">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {isAdmin && (
              <div className="mt-8 pt-4 border-t border-neutral-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl font-medium"
                >
                  <Shield className="w-5 h-5" />
                  Painel Administrativo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
