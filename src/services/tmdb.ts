import { MediaItem, TMDBResult } from '../types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null | undefined, size: 'w500' | 'original' = 'w500'): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop';
  }
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Genre mapper helper
const GENRE_MAP: Record<number, string> = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  10770: 'Cinema TV',
  53: 'Suspense',
  10752: 'Guerra',
  37: 'Faroeste',
  10759: 'Ação & Aventura',
  10762: 'Kids',
  10763: 'Notícias',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasia',
  10766: 'Novela',
  10767: 'Talk Show',
  10768: 'Guerra & Política',
};

export const mapGenreIds = (ids?: number[]): string[] => {
  if (!ids || ids.length === 0) return ['Geral'];
  return ids.map((id) => GENRE_MAP[id] || 'Entretenimento').slice(0, 3);
};

export const fetchTMDBByYear = async (
  apiKey: string,
  type: 'movie' | 'tv' | 'anime',
  year: number,
  page: number = 1
): Promise<TMDBResult[]> => {
  try {
    let endpoint = '';
    const params = new URLSearchParams({
      api_key: apiKey,
      language: 'pt-BR',
      sort_by: 'popularity.desc',
      include_adult: 'false',
      page: page.toString(),
    });

    if (type === 'movie') {
      endpoint = `${TMDB_BASE_URL}/discover/movie`;
      params.append('primary_release_year', year.toString());
    } else if (type === 'tv') {
      endpoint = `${TMDB_BASE_URL}/discover/tv`;
      params.append('first_air_date_year', year.toString());
    } else if (type === 'anime') {
      // Anime filter: Animation genre 16 + origin country JP or language ja
      endpoint = `${TMDB_BASE_URL}/discover/tv`;
      params.append('first_air_date_year', year.toString());
      params.append('with_genres', '16');
      params.append('with_original_language', 'ja');
    }

    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`TMDB error: ${response.status}`);
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch from TMDB by year:', error);
    return [];
  }
};

export const searchTMDB = async (
  apiKey: string,
  query: string,
  type: 'movie' | 'tv' | 'anime'
): Promise<TMDBResult[]> => {
  if (!query.trim()) return [];
  try {
    let endpoint = `${TMDB_BASE_URL}/search/multi`;
    if (type === 'movie') endpoint = `${TMDB_BASE_URL}/search/movie`;
    if (type === 'tv') endpoint = `${TMDB_BASE_URL}/search/tv`;

    const params = new URLSearchParams({
      api_key: apiKey,
      language: 'pt-BR',
      query: query.trim(),
      include_adult: 'false',
      page: '1',
    });

    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`TMDB Search error: ${response.status}`);
    }
    const data = await response.json();
    let results: TMDBResult[] = data.results || [];

    if (type === 'anime') {
      // Prioritize animated Japanese works or results containing query
      results = results.filter((item) => {
        const isAnime =
          item.genre_ids?.includes(16) ||
          (item as { original_language?: string }).original_language === 'ja';
        return isAnime;
      });
    }

    return results;
  } catch (error) {
    console.error('Failed to search TMDB:', error);
    return [];
  }
};

export const convertTMDBToMediaItem = (
  raw: TMDBResult,
  requestedType: 'movie' | 'tv' | 'anime'
): MediaItem => {
  const isMovie = requestedType === 'movie' || raw.title !== undefined;
  const title = raw.title || raw.name || 'Sem Título';
  const originalTitle = raw.original_title || raw.original_name || title;
  const dateStr = raw.release_date || raw.first_air_date || `${new Date().getFullYear()}-01-01`;
  const year = parseInt(dateStr.slice(0, 4), 10) || new Date().getFullYear();
  const posterPath = getImageUrl(raw.poster_path, 'w500');
  const backdropPath = getImageUrl(raw.backdrop_path || raw.poster_path, 'original');
  const voteAvg = raw.vote_average ? Number(raw.vote_average.toFixed(1)) : 8.0;

  // Determine age rating estimate
  const ratingChoices = ['L', '10', '12', '14', '16'];
  const contentRating = voteAvg > 8.0 ? (year > 2020 ? '14' : '12') : ratingChoices[Math.floor(Math.random() * ratingChoices.length)];

  // Default embed player link (e.g. standard multi-embed or trailer)
  const defaultEmbed = `https://vidsrc.to/embed/${isMovie ? 'movie' : 'tv'}/${raw.id}`;

  return {
    id: `tmdb-${requestedType}-${raw.id}-${Date.now()}`,
    tmdb_id: raw.id,
    title,
    original_title: originalTitle,
    media_type: requestedType,
    poster_path: posterPath,
    backdrop_path: backdropPath,
    overview: raw.overview || 'Sinopse não disponível no momento. Assista para conferir!',
    release_date: dateStr,
    release_year: year,
    vote_average: voteAvg,
    vote_count: raw.vote_count || 100,
    genres: mapGenreIds(raw.genre_ids),
    content_rating: contentRating,
    featured: voteAvg >= 8.2,
    stream_url: defaultEmbed,
    seasons_count: requestedType !== 'movie' ? 1 : undefined,
    episodes_count: requestedType !== 'movie' ? 12 : undefined,
    imported_at: new Date().toISOString(),
  };
};
