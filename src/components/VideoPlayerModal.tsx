import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Maximize, AlertCircle, Tv, Film, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, AdConfig } from '../types';

interface VideoPlayerModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onUpdateProgress?: (media: MediaItem, progress: number) => void;
  playerAd?: AdConfig;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  item,
  onClose,
  onUpdateProgress,
  playerAd,
}) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [serverSource, setServerSource] = useState<'principal' | 'secundario' | 'trailer'>('principal');
  const reportedItemRef = useRef<string | null>(null);

  useEffect(() => {
    if (item && onUpdateProgress && reportedItemRef.current !== item.id) {
      reportedItemRef.current = item.id;
      onUpdateProgress(item, 15);
    }
  }, [item, onUpdateProgress]);

  if (!item) return null;

  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';

  // Construct dynamic embed URL for movies and series
  const getEmbedUrl = () => {
    if (serverSource === 'trailer' && item.trailer_url) {
      return item.trailer_url;
    }

    if (item.channel_url && item.media_type === 'channel') {
      return item.channel_url;
    }

    if (item.stream_url && !item.stream_url.includes('vidsrc.to')) {
      return item.stream_url;
    }

    // Default multi-embed player provider with TMDB id
    if (item.tmdb_id) {
      if (serverSource === 'secundario') {
        return isSeriesOrAnime
          ? `https://vidsrc.me/embed/tv?tmdb=${item.tmdb_id}&season=${selectedSeason}&episode=${selectedEpisode}`
          : `https://vidsrc.me/embed/movie?tmdb=${item.tmdb_id}`;
      }
      return isSeriesOrAnime
        ? `https://vidsrc.to/embed/tv/${item.tmdb_id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.to/embed/movie/${item.tmdb_id}`;
    }

    return item.stream_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  };

  // Generate episodes list if series
  const episodesCount = item.episodes_count || 12;
  const episodesList = item.episodes && item.episodes.length > 0
    ? item.episodes
    : Array.from({ length: episodesCount }, (_, i) => ({
        id: `ep-${i + 1}`,
        season: selectedSeason,
        episode: i + 1,
        title: `Episódio ${i + 1}`,
        duration: '24m',
      }));

  return (
    <AnimatePresence>
      <div
        id="video-player-modal"
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between overflow-y-auto"
      >
        {/* Top Player Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 bg-black/80 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
              title="Voltar"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                {item.title}
              </h2>
              {isSeriesOrAnime && (
                <p className="text-xs text-red-500 font-medium">
                  Temporada {selectedSeason} • Episódio {selectedEpisode}
                </p>
              )}
            </div>
          </div>

          {/* Server Switchers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServerSource('principal')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                serverSource === 'principal' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Player 1
            </button>
            <button
              onClick={() => setServerSource('secundario')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                serverSource === 'secundario' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Player 2
            </button>
            {item.trailer_url && (
              <button
                onClick={() => setServerSource('trailer')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  serverSource === 'trailer' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Trailer
              </button>
            )}
          </div>
        </div>

        {/* Video Player Container */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 max-w-6xl mx-auto w-full">
          <div className="relative w-full aspect-video bg-neutral-950 rounded-lg overflow-hidden shadow-2xl border border-neutral-800">
            <iframe
              src={getEmbedUrl()}
              title={item.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          </div>

          {/* Tip / Notice */}
          <div className="w-full flex items-center justify-between text-xs text-neutral-400 mt-2 px-1">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-neutral-500" />
              Se o reprodutor travar, alterne para o Player 2 ou atualize a página.
            </span>
            <span className="text-red-500 font-semibold">100% Grátis • CIne Fanio</span>
          </div>

          {/* Player Ad Slot if configured */}
          {playerAd && playerAd.active && (
            <div className="w-full mt-3 p-2 bg-neutral-900/80 rounded border border-neutral-800 text-center">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                Patrocinador Oficial • {playerAd.network}
              </p>
              {playerAd.link_url && (
                <a
                  href={playerAd.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-yellow-400 font-semibold hover:underline"
                >
                  {playerAd.name || 'Clique aqui para conhecer ofertas especiais e bônus'}
                </a>
              )}
            </div>
          )}

          {/* Episodes selector for series and animes */}
          {isSeriesOrAnime && (
            <div className="w-full mt-6 bg-neutral-900/60 p-4 sm:p-5 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-red-500" />
                  Lista de Episódios
                </h3>
                <div className="text-xs text-neutral-400">
                  Temporada {selectedSeason} ({episodesList.length} episódios)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 max-h-48 overflow-y-auto pr-1">
                {episodesList.map((ep) => (
                  <button
                    key={ep.id || ep.episode}
                    onClick={() => setSelectedEpisode(ep.episode)}
                    className={`p-2.5 rounded-lg text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                      selectedEpisode === ep.episode
                        ? 'bg-red-600 text-white font-bold shadow-md'
                        : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    <span className="truncate">{ep.title || `Episódio ${ep.episode}`}</span>
                    <Play className="w-3 h-3 flex-shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
