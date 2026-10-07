import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TMDB_API_KEY } from '../tmdb.config';
import { Movie } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageUrl = 'https://image.tmdb.org/t/p/w500';

  private params(extra: Record<string, any> = {}) {
    return { api_key: TMDB_API_KEY, language: 'fr-FR', ...extra };
  }

  // Convertit un film TMDB vers le format Movie de Wiem
  private toMovie(m: any): Movie {
    return {
      id: 'tmdb_' + m.id,
      title: m.title,
      overview: m.overview ?? '',
      posterUrl: this.getImageUrl(m.poster_path),
      releaseDate: m.release_date ?? '',
      rating: m.vote_average ?? 0,
      source: 'tmdb',
    };
  }

  getPopularMovies(page = 1): Observable<Movie[]> {
    return this.http
      .get<any>(`${this.baseUrl}/movie/popular`, { params: this.params({ page }) })
      .pipe(map((res) => res.results.map((m: any) => this.toMovie(m))));
  }

  searchMovies(query: string, page = 1): Observable<Movie[]> {
    return this.http
      .get<any>(`${this.baseUrl}/search/movie`, { params: this.params({ query, page }) })
      .pipe(map((res) => res.results.map((m: any) => this.toMovie(m))));
  }

  // tmdbId = le numéro TMDB seul (550), sans le préfixe "tmdb_"
  getMovieDetails(tmdbId: number): Observable<Movie> {
    return this.http
      .get<any>(`${this.baseUrl}/movie/${tmdbId}`, { params: this.params() })
      .pipe(map((m) => this.toMovie(m)));
  }

  getImageUrl(path: string | null): string {
    return path ? this.imageUrl + path : '';
  }
}