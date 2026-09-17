import React, { useEffect, useRef } from 'react';
import { AdConfig } from '../types';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  ad?: AdConfig;
  slotName?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ ad, slotName = 'hero_banner' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If ad has raw script or HTML code, inject it safely
    if (ad && ad.active && ad.code && containerRef.current) {
      containerRef.current.innerHTML = '';
      const range = document.createRange();
      const fragment = range.createContextualFragment(ad.code);
      containerRef.current.appendChild(fragment);
    }
  }, [ad]);

  if (!ad || !ad.active) {
    return null;
  }

  return (
    <div
      id={`ad-container-${ad.id || slotName}`}
      className="w-full bg-[#111116] border-y border-neutral-800/80 overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col items-center">
        {/* Ad network / badge */}
        <div className="w-full flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-widest mb-1">
          <span>Publicidade • {ad.network.toUpperCase()}</span>
          <span className="flex items-center gap-1 text-[9px] hover:text-neutral-400">
            Anúncio Patrocinado <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </div>

        {/* If custom HTML/JS code exists */}
        {ad.code ? (
          <div ref={containerRef} className="w-full min-h-[60px] flex items-center justify-center" />
        ) : (
          /* Default visual banner matching screenshot bonus aesthetic */
          <a
            href={ad.link_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block group relative overflow-hidden rounded-md bg-gradient-to-r from-amber-600 via-rose-700 to-indigo-900 p-3 sm:p-4 text-white shadow-lg transition-transform hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="px-2.5 py-1 bg-yellow-400 text-black font-extrabold text-xs sm:text-sm uppercase rounded shadow-sm">
                  PROMO
                </div>
                <div>
                  <h4 className="font-bebas text-lg sm:text-2xl tracking-wide text-yellow-300 font-bold uppercase drop-shadow">
                    SPECIAL BONUS • BÔNUS EXCLUSIVO DE ATÉ 100%
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-200 line-clamp-1">
                    Cadastre-se na parceira oficial e resgate recompensas instantâneas para assinantes.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center justify-center px-4 py-2 bg-white text-black font-bold text-xs sm:text-sm rounded hover:bg-neutral-100 whitespace-nowrap shadow">
                Aproveitar Agora
              </div>
            </div>
          </a>
        )}
      </div>
    </div>
  );
};
