export type MediaType = 'movie' | 'tv' | 'anime' | 'channel';

export interface MediaItem {
  id: string;
  tmdb_id?: number;
  title: string;
  original_title?: string;
  media_type: MediaType;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  release_year: number;
  vote_average: number;
  vote_count?: number;
  genres: string[];
  content_rating: string; // e.g. "L", "10", "12", "14", "16", "18"
  featured?: boolean;
  stream_url?: string;
  trailer_url?: string;
  duration?: string;
  channel_url?: string;
  seasons_count?: number;
  episodes_count?: number;
  episodes?: {
    id: string;
    season: number;
    episode: number;
    title: string;
    overview?: string;
    stream_url?: string;
    duration?: string;
  }[];
  imported_at: string;
}

export interface AdConfig {
  id: string;
  name: string;
  network: 'adsterra' | 'adcash' | 'monetag' | 'custom';
  slot: 'hero_banner' | 'feed_interstitial' | 'player_top' | 'popunder';
  code: string;
  image_url?: string;
  link_url?: string;
  active: boolean;
}

export interface SiteSettings {
  site_name: string;
  logo_text: string;
  logo_url: string;
  favicon_url: string;
  pwa_home_cover: string;
  tmdb_api_key: string;
  supabase_project_id: string;
  supabase_url: string;
  supabase_anon_key: string;
  admin_email: string;
  admin_password: string;
  recovery_pin: string;
  recovery_question: string;
  recovery_answer: string;
}

export interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  media_type?: string;
}
