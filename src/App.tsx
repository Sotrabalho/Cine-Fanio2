/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { storage } from './services/storage';
import { MediaItem, AdConfig, SiteSettings } from './types';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { AdBanner } from './components/AdBanner';
import { MediaRow } from './components/MediaRow';
import { MediaCard } from './components/MediaCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { MediaDetailModal } from './components/MediaDetailModal';
import { SearchModal } from './components/SearchModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Film, Tv, PlaySquare, Radio, Bookmark, Key } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(() => storage.loadSettings());
  const [catalog, setCatalog] = useState<MediaItem[]>(() => storage.loadMedia());
  const [ads, setAds] = useState<AdConfig[]>(() => storage.loadAds());
  const [watchlist, setWatchlist] = useState<string[]>(() => storage.loadWatchlist());
  const [continueWatching, setContinueWatching] = useState<{ media: MediaItem; progress: number; last_watched: string }[]>(
    () => storage.loadContinueWatching()
  );

  // App Navigation & View Modes
  const [activeTab, setActiveTab] = useState<string>('home');
  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cinefanio_is_admin') === 'true';
  });

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);

  // Sync settings when modified
  const handleUpdateSettings = useCallback((newSettings: SiteSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  // Sync media items
  const handleAddMedia = useCallback((item: MediaItem) => {
    const updated = storage.addMediaItem(item);
    setCatalog(updated);
  }, []);

  const handleRemoveMedia = useCallback((id: string) => {
    const updated = storage.removeMediaItem(id);
    setCatalog(updated);
  }, []);

  // Sync ads
  const handleUpdateAds = useCallback((newAds: AdConfig[]) => {
    storage.saveAds(newAds);
    setAds(newAds);
  }, []);

  // Watchlist toggle
  const handleToggleWatchlist = useCallback((id: string) => {
    const updated = storage.toggleWatchlist(id);
    setWatchlist(updated);
  }, []);

  // Continue watching tracking
  const handleUpdateProgress = useCallback((media: MediaItem, progress: number) => {
    storage.updateContinueWatching(media, progress);
    setContinueWatching(storage.loadContinueWatching());
  }, []);

  // Admin access triggers
  const handleTriggerAdmin = useCallback(() => {
    if (isAdminAuthenticated) {
      setViewMode('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  }, [isAdminAuthenticated]);

  const handleLoginSuccess = useCallback(() => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('cinefanio_is_admin', 'true');
    setViewMode('admin');
  }, []);

  const handleExitAdmin = useCallback(() => {
    setViewMode('user');
  }, []);

  // Listen for global secret keyboard shortcut: typing "ADMV" opens admin, typing "MV" exits
  useEffect(() => {
    let keyBuffer = '';
    let bufferTimer: number;

    const handleGlobalKey = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      keyBuffer += e.key.toUpperCase();
      clearTimeout(bufferTimer);

      if (keyBuffer.endsWith('ADMV')) {
        keyBuffer = '';
        handleTriggerAdmin();
      } else if (keyBuffer.endsWith('MV') && viewMode === 'admin') {
        keyBuffer = '';
        handleExitAdmin();
      }

      bufferTimer = window.setTimeout(() => {
        keyBuffer = '';
      }, 2000);
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      clearTimeout(bufferTimer);
    };
  }, [viewMode, isAdminAuthenticated]);

  // Active ad slots
  const heroAd = ads.find((a) => a.slot === 'hero_banner' && a.active);
  const feedAd = ads.find((a) => a.slot === 'feed_interstitial' && a.active);
  const playerAd = ads.find((a) => a.slot === 'player_top' && a.active);

  // Filtered rows for sections
  const moviesList = catalog.filter((i) => i.media_type === 'movie');
  const tvList = catalog.filter((i) => i.media_type === 'tv');
  const animeList = catalog.filter((i) => i.media_type === 'anime');
  const channelList = catalog.filter((i) => i.media_type === 'channel');
  const recent2025 = catalog.filter((i) => i.release_year >= 2024);
  const watchlistItems = catalog.filter((i) => watchlist.includes(i.id));

  // Build continue watching media list with progress map
  const continueWatchingItems = continueWatching.map((cw) => cw.media);
  const progressMap: Record<string, number> = {};
  continueWatching.forEach((cw) => {
    progressMap[cw.media.id] = cw.progress;
  });

  // If currently in Admin Dashboard View
  if (viewMode === 'admin') {
    return (
      <AdminDashboard
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        catalog={catalog}
        onAddMedia={handleAddMedia}
        onRemoveMedia={handleRemoveMedia}
        ads={ads}
        onUpdateAds={handleUpdateAds}
        onExitAdmin={handleExitAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-neutral-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Header - Note: Zero profile dropdown for regular users */}
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        isAdmin={isAdminAuthenticated}
        onOpenAdmin={() => setViewMode('admin')}
      />

      {/* Main Streaming Feed */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <>
            {/* Hero Banner inspired directly by the uploaded screenshot */}
            <HeroBanner
              items={catalog}
              onPlay={(item) => setPlayingMedia(item)}
              onSelect={(item) => setSelectedMedia(item)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />

            {/* Ad Banner below Hero, matching screenshot bonus banner style */}
            <AdBanner ad={heroAd} slotName="hero_banner" />

            {/* Row 1: Continuar Assistindo (matching screenshot) */}
            {continueWatchingItems.length > 0 && (
              <MediaRow
                id="row-continuar-assistindo"
                title="CONTINUAR ASSISTINDO"
                items={continueWatchingItems}
                onSelect={(item) => setSelectedMedia(item)}
                onPlay={(item) => setPlayingMedia(item)}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                progressMap={progressMap}
              />
            )}

            {/* Row 2: Filmes em Destaque */}
            {moviesList.length > 0 && (
              <MediaRow
                id="row-filmes-alta"
                title="FILMES EM ALTA"
                items={moviesList}
                onSelect={(item) => setSelectedMedia(item)}
                onPlay={(item) => setPlayingMedia(item)}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* Interstitial Feed Ad */}
            <AdBanner ad={feedAd} slotName="feed_interstitial" />

            {/* Row 3: Séries Populares */}
            {tvList.length > 0 && (
              <MediaRow
                id="row-series-populares"
                title="SÉRIES POPULARES"
                items={tvList}
                onSelect={(item) => setSelectedMedia(item)}
                onPlay={(item) => setPlayingMedia(item)}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* Row 4: Animes em Alta */}
            {animeList.length > 0 && (
              <MediaRow
                id="row-animes-alta"
                title="ANIMES EM ALTA"
                items={animeList}
                onSelect={(item) => setSelectedMedia(item)}
                onPlay={(item) => setPlayingMedia(item)}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* Row 5: Lançamentos Recentes */}
            {recent2025.length > 0 && (
              <MediaRow
                id="row-lancamentos-2025"
                title="LANÇAMENTOS RECENTES"
                items={recent2025}
                onSelect={(item) => setSelectedMedia(item)}
                onPlay={(item) => setPlayingMedia(item)}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* Row 6: Canais Ao Vivo 24h */}
            {channelList.length > 0 && (
              <MediaRow
                id="row-canais-aovivo"
                title="CANAIS AO VIVO 24H"
                items={channelList}
                onSelect={(item) => setSelectedMedia(item)}
                onPlay={(item) => setPlayingMedia(item)}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}
          </>
        )}

        {/* Tab: Filmes */}
        {activeTab === 'movies' && (
          <div className="pt-24 px-4 sm:px-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-6 bg-red-600 rounded-xs inline-block" />
              <h1 className="text-2xl font-bold font-montserrat">Filmes no Catálogo</h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {moviesList.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onSelect={(m) => setSelectedMedia(m)}
                  onPlay={(m) => setPlayingMedia(m)}
                  isWatchlist={watchlist.includes(item.id)}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab: Séries */}
        {activeTab === 'tv' && (
          <div className="pt-24 px-4 sm:px-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-6 bg-red-600 rounded-xs inline-block" />
              <h1 className="text-2xl font-bold font-montserrat">Séries Completas</h1>
            </div>
            <MediaRow
              title="Todas as Séries"
              items={tvList}
              onSelect={(m) => setSelectedMedia(m)}
              onPlay={(m) => setPlayingMedia(m)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          </div>
        )}

        {/* Tab: Animes */}
        {activeTab === 'anime' && (
          <div className="pt-24 px-4 sm:px-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-6 bg-red-600 rounded-xs inline-block" />
              <h1 className="text-2xl font-bold font-montserrat">Animes Dublados e Legendados</h1>
            </div>
            <MediaRow
              title="Animes Disponíveis"
              items={animeList}
              onSelect={(m) => setSelectedMedia(m)}
              onPlay={(m) => setPlayingMedia(m)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          </div>
        )}

        {/* Tab: Canais */}
        {activeTab === 'channels' && (
          <div className="pt-24 px-4 sm:px-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-6 bg-red-600 rounded-xs inline-block" />
              <h1 className="text-2xl font-bold font-montserrat">Canais de TV Ao Vivo</h1>
            </div>
            <MediaRow
              title="Canais de Transmissão Contínua"
              items={channelList}
              onSelect={(m) => setSelectedMedia(m)}
              onPlay={(m) => setPlayingMedia(m)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          </div>
        )}

        {/* Tab: Minha Lista */}
        {activeTab === 'watchlist' && (
          <div className="pt-24 px-4 sm:px-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-6 bg-red-600 rounded-xs inline-block" />
              <h1 className="text-2xl font-bold font-montserrat">Minha Lista ({watchlistItems.length})</h1>
            </div>
            {watchlistItems.length > 0 ? (
              <MediaRow
                title="Títulos Salvos"
                items={watchlistItems}
                onSelect={(m) => setSelectedMedia(m)}
                onPlay={(m) => setPlayingMedia(m)}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            ) : (
              <div className="py-20 text-center text-neutral-400">
                <Bookmark className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-base font-semibold">Sua lista está vazia</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Clique no botão "+" em qualquer filme ou série para adicionar aqui.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-[#09090c] py-8 px-4 sm:px-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bebas text-xl text-red-600 tracking-wider font-extrabold">
              {settings.logo_text || 'CINE FANIO'}
            </span>
            <span>• Streaming Grátis Sem Mensalidade</span>
          </div>

          <p className="text-neutral-500 text-center sm:text-right text-[11px]">
            O site não armazena arquivos em seus servidores; dados catalogados via TMDB.
          </p>

          <button
            onClick={handleTriggerAdmin}
            className="text-[10px] text-neutral-600 hover:text-neutral-400 flex items-center gap-1 cursor-pointer"
            title="Acesso Administrativo (ADMV)"
          >
            <Key className="w-3 h-3" />
            <span>Código de Acesso: ADMV</span>
          </button>
        </div>
      </footer>

      {/* MODALS */}
      {/* Search Modal with ADMV trigger */}
      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          catalog={catalog}
          onSelectMedia={(item) => setSelectedMedia(item)}
          onPlayMedia={(item) => setPlayingMedia(item)}
          onTriggerAdmin={handleTriggerAdmin}
        />
      )}

      {/* Admin Login Modal with eye show/hide and recovery */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          settings={settings}
          onLoginSuccess={handleLoginSuccess}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <MediaDetailModal
          item={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onPlay={(item) => {
            setSelectedMedia(null);
            setPlayingMedia(item);
          }}
          isWatchlist={watchlist.includes(selectedMedia.id)}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* Video Player Modal */}
      {playingMedia && (
        <VideoPlayerModal
          item={playingMedia}
          onClose={() => setPlayingMedia(null)}
          onUpdateProgress={handleUpdateProgress}
          playerAd={playerAd}
        />
      )}
    </div>
  );
}
