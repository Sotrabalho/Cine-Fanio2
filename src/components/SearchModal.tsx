import React, { useState, useEffect } from 'react';
import { Search, X, Film, Tv, PlaySquare, Shield, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  onPlayMedia: (item: MediaItem) => void;
  onTriggerAdmin: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onSelectMedia,
  onPlayMedia,
  onTriggerAdmin,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'movie' | 'tv' | 'anime'>('all');

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.trim().toUpperCase() === 'ADMV') {
      setQuery('');
      onClose();
      onTriggerAdmin();
      return;
    }
    setQuery(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = query.trim().toUpperCase();
      if (trimmed === 'ADMV') {
        e.preventDefault();
        setQuery('');
        onClose();
        onTriggerAdmin();
      }
    }
  };

  if (!isOpen) return null;

  const filtered = catalog.filter((item) => {
    const matchesFilter = selectedFilter === 'all' || item.media_type === selectedFilter;
    if (!matchesFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.genres.some((g) => g.toLowerCase().includes(q)) ||
      (item.original_title && item.original_title.toLowerCase().includes(q))
    );
  });

  return (
    <AnimatePresence>
      <div
        id="search-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-8 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto w-full">
          {/* Top Bar with Input & Close */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                id="search-input"
                type="text"
                autoFocus
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Pesquisar títulos, gêneros ou digite o código..."
                className="w-full pl-12 pr-10 py-3.5 bg-neutral-900/90 text-white rounded-xl border border-neutral-700/80 focus:border-red-500 focus:outline-none text-base placeholder:text-neutral-500 shadow-xl"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleClose}
              className="p-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedFilter('movie')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                selectedFilter === 'movie'
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              Filmes
            </button>
            <button
              onClick={() => setSelectedFilter('tv')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                selectedFilter === 'tv'
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              Séries
            </button>
            <button
              onClick={() => setSelectedFilter('anime')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                selectedFilter === 'anime'
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              Animes
            </button>
          </div>

          {/* Secret Trigger Hint (Discreet badge) */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-4 px-1">
            <span>Resultados encontrados: {filtered.length}</span>
            <span className="text-[11px] text-neutral-600 flex items-center gap-1">
              <Key className="w-3 h-3 text-neutral-600" /> Dica: Administrador digita ADMV
            </span>
          </div>

          {/* Search Results Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-12">
              {filtered.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onSelect={(m) => {
                    onClose();
                    onSelectMedia(m);
                  }}
                  onPlay={(m) => {
                    onClose();
                    onPlayMedia(m);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-neutral-400">
              <p className="text-base font-semibold">Nenhum título encontrado para "{query}"</p>
              <p className="text-xs text-neutral-500 mt-1">
                Tente buscar por outro termo ou nome de série/filme.
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
