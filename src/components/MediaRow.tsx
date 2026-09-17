import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface MediaRowProps {
  id?: string;
  title: string;
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
  watchlist?: string[];
  onToggleWatchlist?: (id: string) => void;
  progressMap?: Record<string, number>;
}

export const MediaRow: React.FC<MediaRowProps> = ({
  id,
  title,
  items,
  onSelect,
  onPlay,
  watchlist = [],
  onToggleWatchlist,
  progressMap = {},
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section id={id || `row-${title.replace(/\s+/g, '-').toLowerCase()}`} className="my-6 sm:my-8 px-4 sm:px-8 relative group/row">
      {/* Section Header with Signature Red Bar matching screenshot */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="flex items-center text-base sm:text-lg md:text-xl font-bold tracking-wide uppercase text-white font-montserrat">
          <span className="w-1 sm:w-1.5 h-4 sm:h-5 bg-red-600 rounded-xs mr-2 sm:mr-2.5 inline-block shadow-[0_0_8px_rgba(220,38,38,0.7)]" />
          {title}
        </h2>
        <span className="text-xs text-neutral-400 font-normal hover:text-red-400 cursor-pointer transition-colors">
          Ver Todos ({items.length})
        </span>
      </div>

      {/* Row Container with Navigation Arrows */}
      <div className="relative">
        {/* Left Arrow Button (Desktop / TV) */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/80 text-white border border-neutral-700/80 shadow-xl opacity-0 group-hover/row:opacity-100 hover:bg-red-600 hover:border-red-600 transition-all duration-200 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Horizontal Cards Scroll list */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        >
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={onSelect}
              onPlay={onPlay}
              isWatchlist={watchlist.includes(item.id)}
              onToggleWatchlist={onToggleWatchlist}
              progress={progressMap[item.id]}
            />
          ))}
        </div>

        {/* Right Arrow Button (Desktop / TV) */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/80 text-white border border-neutral-700/80 shadow-xl opacity-0 group-hover/row:opacity-100 hover:bg-red-600 hover:border-red-600 transition-all duration-200 hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
