import React, { useState, useEffect, useCallback } from 'react';
import {
  Film,
  Tv,
  PlaySquare,
  Plus,
  Trash2,
  Settings,
  DollarSign,
  Layers,
  ArrowLeft,
  Search,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Radio,
  ExternalLink,
  Sparkles,
  Database,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, AdConfig, SiteSettings, TMDBResult } from '../types';
import { fetchTMDBByYear, searchTMDB, convertTMDBToMediaItem, getImageUrl } from '../services/tmdb';

interface AdminDashboardProps {
  settings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  catalog: MediaItem[];
  onAddMedia: (item: MediaItem) => void;
  onRemoveMedia: (id: string) => void;
  ads: AdConfig[];
  onUpdateAds: (newAds: AdConfig[]) => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  onUpdateSettings,
  catalog,
  onAddMedia,
  onRemoveMedia,
  ads,
  onUpdateAds,
  onExitAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'tmdb' | 'catalog' | 'ads' | 'branding' | 'settings'>('tmdb');

  // TMDB Import State
  const [importType, setImportType] = useState<'movie' | 'tv' | 'anime'>('movie');
  // Last 5 years as requested: 2025, 2024, 2023, 2022, 2021
  const availableYears = [2025, 2024, 2023, 2022, 2021];
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<TMDBResult[]>([]);
  const [loadingTmdb, setLoadingTmdb] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({ ...settings });
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Listen for typing "MV" to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is not currently focusing an input/textarea
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'm' || e.key === 'M') {
        let secondKeyTimeout: number;
        const secondKeyListener = (e2: KeyboardEvent) => {
          if (e2.key === 'v' || e2.key === 'V') {
            onExitAdmin();
          }
          window.removeEventListener('keydown', secondKeyListener);
          clearTimeout(secondKeyTimeout);
        };
        window.addEventListener('keydown', secondKeyListener);
        secondKeyTimeout = window.setTimeout(() => {
          window.removeEventListener('keydown', secondKeyListener);
        }, 1200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitAdmin]);

  // Load TMDB items automatically before search
  const loadTmdbItems = useCallback(async () => {
    setLoadingTmdb(true);
    try {
      if (tmdbSearchQuery.trim()) {
        const results = await searchTMDB(settings.tmdb_api_key, tmdbSearchQuery, importType);
        setTmdbResults(results);
      } else {
        const results = await fetchTMDBByYear(settings.tmdb_api_key, importType, selectedYear);
        setTmdbResults(results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTmdb(false);
    }
  }, [settings.tmdb_api_key, tmdbSearchQuery, importType, selectedYear]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingTmdb(true);
      try {
        if (tmdbSearchQuery.trim()) {
          const results = await searchTMDB(settings.tmdb_api_key, tmdbSearchQuery, importType);
          if (!cancelled) setTmdbResults(results);
        } else {
          const results = await fetchTMDBByYear(settings.tmdb_api_key, importType, selectedYear);
          if (!cancelled) setTmdbResults(results);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoadingTmdb(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [importType, selectedYear, settings.tmdb_api_key]);

  // Filter out already imported items so they disappear from the import list
  const importedTmdbIds = new Set(
    catalog.map((item) => item.tmdb_id).filter(Boolean)
  );

  const nonImportedResults = tmdbResults.filter(
    (res) => !importedTmdbIds.has(res.id)
  );

  const handleImportSingle = (raw: TMDBResult) => {
    const newMedia = convertTMDBToMediaItem(raw, importType);
    onAddMedia(newMedia);
    // Instant visual feedback
    setImportFeedback(`"${newMedia.title}" importado com sucesso para o catálogo!`);
    setTimeout(() => setImportFeedback(null), 3000);
  };

  const handleImportAllVisible = () => {
    if (nonImportedResults.length === 0) return;
    nonImportedResults.forEach((raw) => {
      const newMedia = convertTMDBToMediaItem(raw, importType);
      onAddMedia(newMedia);
    });
    setImportFeedback(`${nonImportedResults.length} títulos foram importados com sucesso!`);
    setTimeout(() => setImportFeedback(null), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  const handleToggleAd = (adId: string) => {
    const updated = ads.map((ad) => (ad.id === adId ? { ...ad, active: !ad.active } : ad));
    onUpdateAds(updated);
  };

  const handleAddCustomAd = () => {
    const newAd: AdConfig = {
      id: `ad-${Date.now()}`,
      name: 'Novo Anúncio Personalizado',
      network: 'adsterra',
      slot: 'hero_banner',
      code: '',
      link_url: 'https://monetag.com',
      image_url: '',
      active: true,
    };
    onUpdateAds([...ads, newAd]);
  };

  const handleRemoveAd = (id: string) => {
    onUpdateAds(ads.filter((a) => a.id !== id));
  };

  const handleAddCustomChannel = () => {
    const title = prompt('Nome do canal ao vivo:');
    if (!title) return;
    const stream = prompt('URL do stream / embed do canal:');
    const newChannel: MediaItem = {
      id: `channel-${Date.now()}`,
      title,
      media_type: 'channel',
      poster_path: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
      backdrop_path: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1600&auto=format&fit=crop',
      overview: 'Transmissão ao vivo de canal de entretenimento no CIne Fanio.',
      release_date: new Date().toISOString(),
      release_year: 2025,
      vote_average: 9.0,
      genres: ['Ao Vivo', 'TV'],
      content_rating: 'L',
      channel_url: stream || '',
      stream_url: stream || '',
      imported_at: new Date().toISOString(),
    };
    onAddMedia(newChannel);
  };

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-[#0d0d12] text-neutral-100 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="bg-[#121219] border-b border-neutral-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            id="admin-exit-btn"
            onClick={onExitAdmin}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Voltar ao site ou pressione a tecla MV"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Site (MV)</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bebas text-2xl text-red-600 tracking-wider font-extrabold">
              {settings.logo_text || 'CINE FANIO'}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-red-600/20 text-red-400 border border-red-500/30 rounded">
              Painel ADMV
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('tmdb')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'tmdb' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar</span> TMDB
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'catalog' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Catálogo ({catalog.length})
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'ads' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Propagandas ({ads.filter((a) => a.active).length})
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'branding' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Personalização
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'settings' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Configurações
          </button>
        </nav>
      </header>

      {/* Main Tab Views */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        {/* TAB 1: TMDB IMPORT */}
        {activeTab === 'tmdb' && (
          <div className="space-y-6">
            {/* Description & Requirements Banner */}
            <div className="p-4 rounded-xl bg-[#14141d] border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500" />
                  Importador Oficial TMDB (Filmes, Séries & Animes)
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Os títulos abaixo aparecem antes de você fazer a pesquisa. Títulos já importados
                  desaparecem automaticamente da lista para dar lugar aos novos!
                </p>
              </div>

              {nonImportedResults.length > 0 && (
                <button
                  onClick={handleImportAllVisible}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-red-600/30 whitespace-nowrap cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Importar Todos ({nonImportedResults.length})
                </button>
              )}
            </div>

            {/* Notification message */}
            {importFeedback && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                {importFeedback}
              </div>
            )}

            {/* Filters Row: Media Type + Last 5 Years Pills + Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Type selector: Filmes | Séries | Animes */}
              <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setImportType('movie')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    importType === 'movie' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  Filmes
                </button>
                <button
                  onClick={() => setImportType('tv')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    importType === 'tv' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  Séries
                </button>
                <button
                  onClick={() => setImportType('anime')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    importType === 'anime' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <PlaySquare className="w-3.5 h-3.5" />
                  Animes
                </button>
              </div>

              {/* 5-Year Selector Pills: 2025, 2024, 2023, 2022, 2021 (last 5 years) */}
              <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 overflow-x-auto">
                <span className="text-[11px] text-neutral-400 px-2 font-medium">Anos:</span>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setTmdbSearchQuery('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      selectedYear === year && !tmdbSearchQuery
                        ? 'bg-neutral-100 text-black shadow'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>

              {/* Search specific TMDB title */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={tmdbSearchQuery}
                  onChange={(e) => setTmdbSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadTmdbItems()}
                  placeholder="Pesquisar no TMDB..."
                  className="w-full pl-9 pr-8 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                />
                {tmdbSearchQuery && (
                  <button
                    onClick={() => {
                      setTmdbSearchQuery('');
                      loadTmdbItems();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {loadingTmdb ? (
              <div className="py-24 text-center text-neutral-400 flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-sm">Buscando títulos no TMDB para {selectedYear}...</p>
              </div>
            ) : nonImportedResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                <AnimatePresence>
                  {nonImportedResults.map((item) => {
                    const title = item.title || item.name || 'Sem Título';
                    const date = item.release_date || item.first_air_date || `${selectedYear}`;
                    const year = date.slice(0, 4);
                    const poster = getImageUrl(item.poster_path, 'w500');

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between group hover:border-neutral-600 transition-colors"
                      >
                        <div className="relative aspect-[2/3] w-full bg-neutral-950 overflow-hidden">
                          <img
                            src={poster}
                            alt={title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-yellow-400">
                            ★ {item.vote_average?.toFixed(1) || '8.0'}
                          </div>
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-600/90 text-[10px] font-bold text-white uppercase">
                            {year}
                          </div>
                        </div>

                        <div className="p-2.5 flex flex-col justify-between flex-1">
                          <h4 className="text-xs font-semibold text-white line-clamp-1 mb-1">
                            {title}
                          </h4>
                          <p className="text-[11px] text-neutral-400 line-clamp-2 mb-3">
                            {item.overview || 'Sinopse disponível no TMDB.'}
                          </p>

                          <button
                            onClick={() => handleImportSingle(item)}
                            className="w-full py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-transform flex items-center justify-center gap-1.5 cursor-pointer shadow"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Importar
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-20 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 p-8">
                <Check className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Todos os títulos já foram importados!</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                  Parabéns! Todos os títulos desta página já estão no seu catálogo. Escolha outro ano
                  ou realize uma pesquisa para encontrar mais novidades.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CURRENT CATALOG MANAGEMENT */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Catálogo do Site ({catalog.length})</h2>
                <p className="text-xs text-neutral-400">
                  Gerencie streams, trailers, destaques e canais ao vivo.
                </p>
              </div>
              <button
                onClick={handleAddCustomChannel}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-red-500" />
                Adicionar Canal Ao Vivo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalog.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex gap-3 items-start relative group"
                >
                  <img
                    src={item.poster_path}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                      <button
                        onClick={() => onRemoveMedia(item.id)}
                        className="text-neutral-500 hover:text-red-500 p-1"
                        title="Remover do catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {item.release_year} • {item.media_type.toUpperCase()} • ★ {item.vote_average.toFixed(1)}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">
                      Stream: {item.stream_url || 'Padrão VidSrc'}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          item.featured
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.featured ? '★ Destaque Hero' : 'Catálogo Padrão'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ADS & PROPAGANDA MANAGEMENT */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Gerenciador de Anúncios e Propaganda</h2>
                <p className="text-xs text-neutral-400">
                  Adicione e controle banners de redes como Adsterra, Adcash, Monetag ou anúncios personalizados.
                </p>
              </div>
              <button
                onClick={handleAddCustomAd}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                Novo Anúncio
              </button>
            </div>

            <div className="space-y-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-neutral-800 text-red-400 border border-red-500/30 text-xs font-bold uppercase rounded">
                        {ad.network}
                      </span>
                      <h4 className="text-sm font-bold text-white">{ad.name}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleAd(ad.id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          ad.active
                            ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {ad.active ? 'Ativo no Site' : 'Desativado'}
                      </button>

                      <button
                        onClick={() => handleRemoveAd(ad.id)}
                        className="text-neutral-500 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-neutral-400 block mb-1">Localização (Slot):</label>
                      <select
                        value={ad.slot}
                        onChange={(e) => {
                          const updated = ads.map((a) =>
                            a.id === ad.id ? { ...a, slot: e.target.value as any } : a
                          );
                          onUpdateAds(updated);
                        }}
                        className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                      >
                        <option value="hero_banner">Abaixo do Banner Principal (Hero)</option>
                        <option value="feed_interstitial">Entre as Fileiras do Catálogo</option>
                        <option value="player_top">Acima do Reprodutor de Vídeo</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Link de Destino:</label>
                      <input
                        type="url"
                        value={ad.link_url || ''}
                        onChange={(e) => {
                          const updated = ads.map((a) =>
                            a.id === ad.id ? { ...a, link_url: e.target.value } : a
                          );
                          onUpdateAds(updated);
                        }}
                        placeholder="https://sua-rede.com/link-afiliado"
                        className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1 text-xs">
                      Script / Código HTML da Rede (Adsterra, Adcash, Monetag):
                    </label>
                    <textarea
                      rows={2}
                      value={ad.code || ''}
                      onChange={(e) => {
                        const updated = ads.map((a) =>
                          a.id === ad.id ? { ...a, code: e.target.value } : a
                        );
                        onUpdateAds(updated);
                      }}
                      placeholder="<!-- Cole aqui a tag de anúncio ou script gerado na Adsterra / Monetag -->"
                      className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BRANDING, LOGO, FAVICON, PWA */}
        {activeTab === 'branding' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Personalização & PWA</h2>
              <p className="text-xs text-neutral-400">
                Altere a logo, favicon, capa PWA Home e identidade visual do site.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase">
                  Nome do Site
                </label>
                <input
                  type="text"
                  value={settingsForm.site_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, site_name: e.target.value })}
                  placeholder="CIne Fanio"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase">
                  Texto da Logo
                </label>
                <input
                  type="text"
                  value={settingsForm.logo_text}
                  onChange={(e) => setSettingsForm({ ...settingsForm, logo_text: e.target.value })}
                  placeholder="CINE FANIO"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase">
                  URL da Imagem da Logo (Opcional)
                </label>
                <input
                  type="url"
                  value={settingsForm.logo_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Se preenchido, a imagem substituirá o texto da logo no topo da página.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase">
                    Favicon do Site
                  </label>
                  {settingsForm.favicon_url && (
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, favicon_url: '' })}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline"
                    >
                      Remover Favicon
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={settingsForm.favicon_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, favicon_url: e.target.value })}
                  placeholder="https://exemplo.com/favicon.ico"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Ícone exibido na aba do navegador. Deixe vazio para usar o ícone padrão de cinema.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase">
                  Capa PWA Home / Background
                </label>
                <input
                  type="url"
                  value={settingsForm.pwa_home_cover}
                  onChange={(e) => setSettingsForm({ ...settingsForm, pwa_home_cover: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                />
              </div>

              {settingsSavedMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Personalizações salvas com sucesso!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-700/30 cursor-pointer"
              >
                Salvar Alterações de Identidade
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: SETTINGS & SECURITY */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Configurações & Segurança</h2>
              <p className="text-xs text-neutral-400">
                Credenciais de acesso, integração do Supabase e chave TMDB.
              </p>
            </div>

            {/* Supabase status block */}
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Banco de Dados Supabase</h3>
                  <p className="text-xs text-neutral-400">
                    ID do Projeto: <span className="text-emerald-400 font-mono">{settings.supabase_project_id}</span>
                  </p>
                </div>
              </div>
              <div className="text-xs text-neutral-300 space-y-2">
                <p>
                  URL Oficial: <code className="text-neutral-400">{settings.supabase_url}</code>
                </p>
                <p className="text-[11px] text-neutral-500">
                  O sistema possui persistência local ultra-resiliente e sincronização contínua.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase">
                  Chave da API do TMDB
                </label>
                <input
                  type="text"
                  value={settingsForm.tmdb_api_key}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tmdb_api_key: e.target.value })}
                  placeholder="016356700dcb1c10e0f046e51b828cff"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase">
                  E-mail do Fundador (Acesso Total)
                </label>
                <input
                  type="email"
                  value={settingsForm.admin_email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, admin_email: e.target.value })}
                  placeholder="estefaniojoao6@gmail.com"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase">
                  Palavra-passe do Administrador
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={settingsForm.admin_password}
                    onChange={(e) => setSettingsForm({ ...settingsForm, admin_password: e.target.value })}
                    className="w-full pl-3.5 pr-11 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase">
                  PIN de Recuperação de Senha
                </label>
                <input
                  type="text"
                  value={settingsForm.recovery_pin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, recovery_pin: e.target.value })}
                  placeholder="2024"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm"
                />
              </div>

              {settingsSavedMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Configurações salvas com sucesso!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-700/30 cursor-pointer"
              >
                Salvar Configurações
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
