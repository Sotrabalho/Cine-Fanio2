import React, { useState, useEffect } from 'react';
import { Play, Star, Plus, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';

interface HeroBannerProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onSelect: (item: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  items,
  onPlay,
  onSelect,
  watchlist,
  onToggleWatchlist,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter featured items or fallback to top 6 items
  const heroItems = items.filter((item) => item.featured).slice(0, 8);
  const activeList = heroItems.length > 0 ? heroItems : items.slice(0, 6);

  useEffect(() => {
    if (activeList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeList.length]);

  if (activeList.length === 0) return null;

  const current = activeList[currentIndex] || activeList[0];
  const isInWatchlist = watchlist.includes(current.id);

  // Badge text for media type
  const typeLabel =
    current.media_type === 'tv'
      ? 'SÉRIE'
      : current.media_type === 'anime'
      ? 'ANIME'
      : current.media_type === 'channel'
      ? 'AO VIVO'
      : 'FILME';

  return (
    <div
      id="hero-banner-container"
      className="relative w-full h-[82vh] sm:h-[85vh] lg:h-[88vh] min-h-[560px] overflow-hidden bg-black select-none flex flex-col justify-end"
    >
      {/* Background Image Slides with Motion crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={current.backdrop_path || current.poster_path}
            alt={current.title}
            className="w-full h-full object-cover object-center filter brightness-[0.88]"
          />
          {/* Subtle vignette and Netflix dark gradients matching the uploaded screenshot */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0e]/70 via-transparent to-transparent hidden sm:block" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Section positioned exactly matching screenshot */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 pb-6 sm:pb-8 flex flex-col items-center text-center">
        {/* Title */}
        <motion.h1
          key={`title-${current.id}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-bebas text-3xl sm:text-5xl md:text-6xl text-white tracking-wider uppercase font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] max-w-2xl px-2"
        >
          {current.title}
        </motion.h1>

        {/* Metadata badges matching screenshot: Star + Rating, Year, [L], [SÉRIE] */}
        <motion.div
          key={`meta-${current.id}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-3 mt-3 mb-5 text-sm sm:text-base font-semibold"
        >
          {/* Rating */}
          <div className="flex items-center gap-1 text-red-500 font-bold">
            <Star className="w-4 h-4 fill-red-500 text-red-500" />
            <span>{current.vote_average.toFixed(1)}</span>
          </div>

          {/* Year */}
          <span className="text-neutral-300 font-medium">
            {current.release_year || current.release_date?.slice(0, 4) || '2024'}
          </span>

          {/* Parental Rating badge [L] */}
          <span className="px-1.5 py-0.5 text-xs font-bold border border-neutral-400 text-neutral-300 rounded-sm bg-black/40">
            {current.content_rating || 'L'}
          </span>

          {/* Type badge [SÉRIE] / [FILME] */}
          <span className="px-2 py-0.5 text-xs font-bold tracking-wider uppercase border border-neutral-400/80 text-neutral-200 rounded-sm bg-black/40">
            {typeLabel}
          </span>
        </motion.div>

        {/* Action Buttons: Prominent "ASSISTIR" with Play Icon */}
        <motion.div
          key={`actions-${current.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm"
        >
          <button
            id="hero-watch-btn"
            onClick={() => onPlay(current)}
            className="flex-1 py-3 px-6 bg-white hover:bg-neutral-200 active:scale-95 text-black font-extrabold text-sm sm:text-base tracking-wider uppercase rounded-lg shadow-xl shadow-black/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black text-black" />
            <span>ASSISTIR</span>
          </button>

          <button
            id="hero-info-btn"
            onClick={() => onSelect(current)}
            className="p-3 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 rounded-lg backdrop-blur-xs transition-colors flex items-center justify-center cursor-pointer active:scale-95"
            title="Mais Informações"
          >
            <Info className="w-5 h-5" />
          </button>

          <button
            id="hero-watchlist-btn"
            onClick={() => onToggleWatchlist(current.id)}
            className={`p-3 rounded-lg border backdrop-blur-xs transition-colors flex items-center justify-center cursor-pointer active:scale-95 ${
              isInWatchlist
                ? 'bg-red-600/30 border-red-500 text-red-400'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border-neutral-700/60'
            }`}
            title={isInWatchlist ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
          >
            {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </motion.div>

        {/* Pagination Dots matching screenshot (Red active dot, gray inactive dots) */}
        {activeList.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-5 sm:mt-6">
            {activeList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 h-2 bg-red-600'
                    : 'w-2 h-2 bg-neutral-500/60 hover:bg-neutral-400'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
