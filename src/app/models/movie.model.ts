export interface Movie {
  id: string;            // "tmdb_550" or "fb_Ab12Cd"
  title: string;
  overview: string;
  posterUrl: string;
  releaseDate: string;
  rating: number;
  source: 'tmdb' | 'firebase';
}
