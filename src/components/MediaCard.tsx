import React from 'react';
import { Play, Star, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaItem } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
  isWatchlist?: boolean;
  onToggleWatchlist?: (id: string) => void;
  progress?: number;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onSelect,
  onPlay,
  isWatchlist = false,
  onToggleWatchlist,
  progress,
}) => {
  return (
    <motion.div
      id={`media-card-${item.id}`}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative flex-shrink-0 w-36 sm:w-44 md:w-52 cursor-pointer select-none rounded-md overflow-hidden bg-neutral-900 border border-neutral-800/80 shadow-md hover:shadow-2xl hover:border-neutral-600 transition-all"
    >
      {/* Aspect Ratio 2:3 for Cinematic Posters */}
      <div
        onClick={() => onSelect(item)}
        className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950"
      >
        <img
          src={item.poster_path}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {/* Rating */}
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[11px] font-bold text-yellow-400 border border-yellow-500/20">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {item.vote_average.toFixed(1)}
          </span>

          {/* Quality badge (4K or HD) */}
          <span className="px-1 py-0.5 rounded bg-red-600/90 text-white text-[9px] font-black uppercase tracking-wider">
            {item.release_year >= 2023 ? '4K' : 'HD'}
          </span>
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 sm:p-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(item);
              }}
              className="p-2 sm:p-2.5 rounded-full bg-white text-black hover:bg-neutral-200 transition-transform active:scale-90 shadow-lg"
              title="Assistir Agora"
            >
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            </button>

            {onToggleWatchlist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist(item.id);
                }}
                className={`p-2 rounded-full border transition-colors ${
                  isWatchlist
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-black/60 border-neutral-400 text-white hover:border-white'
                }`}
                title={isWatchlist ? 'Remover da lista' : 'Adicionar à lista'}
              >
                {isWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <div className="text-[11px] text-neutral-300 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-white">{item.release_year}</span>
            <span>•</span>
            <span className="px-1 py-0.2 text-[9px] border border-neutral-500 rounded text-neutral-300">
              {item.content_rating || 'L'}
            </span>
            <span>•</span>
            <span className="capitalize">{item.genres[0] || 'Filme'}</span>
          </div>
        </div>

        {/* Progress bar for continue watching if present */}
        {typeof progress === 'number' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800">
            <div
              className="h-full bg-red-600"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>

      {/* Title Below Card */}
      <div onClick={() => onSelect(item)} className="p-2 sm:p-2.5">
        <h3 className="text-xs sm:text-sm font-medium text-neutral-100 line-clamp-1 group-hover:text-red-400 transition-colors">
          {item.media_type === 'tv' && 'Série: '}
          {item.media_type === 'anime' && 'Anime: '}
          {item.title}
        </h3>
        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
          {item.genres.slice(0, 2).join(' • ')}
        </p>
      </div>
    </motion.div>
  );
};
