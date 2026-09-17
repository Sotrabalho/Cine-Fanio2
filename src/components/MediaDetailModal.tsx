import React from 'react';
import { X, Play, Star, Plus, Check, Calendar, Film, Tv, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';

interface MediaDetailModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onPlay: (item: MediaItem) => void;
  isWatchlist: boolean;
  onToggleWatchlist: (id: string) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  onClose,
  onPlay,
  isWatchlist,
  onToggleWatchlist,
}) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div
        id="media-detail-modal-overlay"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-[#14141b] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl text-neutral-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Backdrop Header Banner */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={item.backdrop_path || item.poster_path}
              alt={item.title}
              className="w-full h-full object-cover object-center filter brightness-[0.8]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14141b] via-[#14141b]/40 to-transparent" />

            {/* Quick Actions on Backdrop */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider font-extrabold drop-shadow">
                  {item.title}
                </h2>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold mt-2 text-neutral-300">
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    {item.vote_average.toFixed(1)}
                  </span>
                  <span>{item.release_year}</span>
                  <span className="px-1.5 py-0.5 border border-neutral-400 rounded text-[11px]">
                    {item.content_rating || 'L'}
                  </span>
                  <span className="capitalize px-2 py-0.5 bg-red-600/30 text-red-400 border border-red-500/30 rounded text-xs font-bold">
                    {item.media_type.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onPlay(item);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span className="text-sm uppercase tracking-wide">Assistir</span>
                </button>

                <button
                  onClick={() => onToggleWatchlist(item.id)}
                  className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                    isWatchlist
                      ? 'bg-red-600/20 border-red-500 text-red-400'
                      : 'bg-black/60 border-neutral-700 text-neutral-300 hover:bg-black/80'
                  }`}
                  title={isWatchlist ? 'Remover da Lista' : 'Adicionar à Lista'}
                >
                  {isWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Details & Synopsis */}
          <div className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
              Sinopse
            </h3>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-6">
              {item.overview || 'Nenhuma descrição detalhada disponível.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800/80 text-xs sm:text-sm">
              <div>
                <span className="text-neutral-500 block mb-1">Gêneros:</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.genres.map((g, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-md text-xs font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-neutral-500 block mb-1">Detalhes de Reprodução:</span>
                <p className="text-neutral-300">
                  {item.media_type === 'tv' || item.media_type === 'anime'
                    ? `${item.seasons_count || 1} Temporada(s) • ${item.episodes_count || 12} Episódios`
                    : item.duration || 'Filme Completo em HD / 4K'}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Importado pelo TMDB • Disponível Grátis
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
