import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MediaItem, AdConfig, SiteSettings } from '../types';
import { DEFAULT_SETTINGS, INITIAL_ADS, INITIAL_MEDIA } from '../data/initialData';

const SETTINGS_KEY = 'cinefanio_settings';
const MEDIA_KEY = 'cinefanio_catalog';
const ADS_KEY = 'cinefanio_ads';
const WATCHLIST_KEY = 'cinefanio_watchlist';
const HISTORY_KEY = 'cinefanio_continue_watching';

class StorageService {
  private supabase: SupabaseClient | null = null;
  private settings: SiteSettings;

  constructor() {
    this.settings = this.loadSettings();
    this.initSupabase();
    this.applyDocumentBranding(this.settings);
  }

  private initSupabase() {
    try {
      if (this.settings.supabase_url && this.settings.supabase_anon_key) {
        this.supabase = createClient(this.settings.supabase_url, this.settings.supabase_anon_key);
      } else {
        this.supabase = null;
      }
    } catch (e) {
      console.warn('Supabase not yet configured or invalid key:', e);
      this.supabase = null;
    }
  }

  public getSupabaseClient(): SupabaseClient | null {
    return this.supabase;
  }

  public loadSettings(): SiteSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(newSettings: SiteSettings): void {
    this.settings = newSettings;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      this.initSupabase();
      this.applyDocumentBranding(newSettings);
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }

  public applyDocumentBranding(settings: SiteSettings) {
    if (typeof document === 'undefined') return;

    // Update document title
    document.title = `${settings.site_name} - Filmes, Séries e Animes Online Grátis`;

    // Update favicon
    let faviconEl = document.getElementById('app-favicon') as HTMLLinkElement | null;
    if (!faviconEl) {
      faviconEl = document.createElement('link');
      faviconEl.id = 'app-favicon';
      faviconEl.rel = 'icon';
      document.head.appendChild(faviconEl);
    }

    if (settings.favicon_url && settings.favicon_url.trim() !== '') {
      faviconEl.href = settings.favicon_url;
    } else {
      // Default red play icon
      faviconEl.href =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23E50914'%3E%3Cpath d='M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm6 4v10l8-5-8-5z'/%3E%3C/svg%3E";
    }
  }

  public loadMedia(): MediaItem[] {
    try {
      const stored = localStorage.getItem(MEDIA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading media catalog:', e);
    }
    // Seed initial media
    this.saveMedia(INITIAL_MEDIA);
    return INITIAL_MEDIA;
  }

  public saveMedia(items: MediaItem[]): void {
    try {
      localStorage.setItem(MEDIA_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving media catalog:', e);
    }
  }

  public addMediaItem(item: MediaItem): MediaItem[] {
    const current = this.loadMedia();
    // Avoid duplicates by tmdb_id if available
    const existingIndex = item.tmdb_id
      ? current.findIndex((m) => m.tmdb_id === item.tmdb_id)
      : current.findIndex((m) => m.id === item.id);

    let updated: MediaItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = item;
    } else {
      updated = [item, ...current];
    }

    this.saveMedia(updated);
    return updated;
  }

  public removeMediaItem(id: string): MediaItem[] {
    const current = this.loadMedia();
    const updated = current.filter((m) => m.id !== id);
    this.saveMedia(updated);
    return updated;
  }

  public loadAds(): AdConfig[] {
    try {
      const stored = localStorage.getItem(ADS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading ads:', e);
    }
    this.saveAds(INITIAL_ADS);
    return INITIAL_ADS;
  }

  public saveAds(ads: AdConfig[]): void {
    try {
      localStorage.setItem(ADS_KEY, JSON.stringify(ads));
    } catch (e) {
      console.error('Error saving ads:', e);
    }
  }

  public loadContinueWatching(): { media: MediaItem; progress: number; last_watched: string }[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    // Sample continue watching for instant aesthetics like in the screenshot
    const catalog = this.loadMedia();
    const neagley = catalog.find((m) => m.title.includes('Neagley')) || catalog[1] || catalog[0];
    if (neagley) {
      return [
        {
          media: neagley,
          progress: 68,
          last_watched: new Date().toISOString(),
        },
      ];
    }
    return [];
  }

  public updateContinueWatching(media: MediaItem, progress: number): void {
    const list = this.loadContinueWatching().filter((item) => item.media.id !== media.id);
    const updated = [{ media, progress, last_watched: new Date().toISOString() }, ...list].slice(0, 10);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  public loadWatchlist(): string[] {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  public toggleWatchlist(id: string): string[] {
    const current = this.loadWatchlist();
    const exists = current.includes(id);
    const updated = exists ? current.filter((i) => i !== id) : [...current, id];
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return updated;
  }
}

export const storage = new StorageService();
