import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TMDB_API_KEY } from '../tmdb.config';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageUrl = 'https://image.tmdb.org/t/p/w500';

  private params(extra: Record<string, any> = {}) {
    return { api_key: TMDB_API_KEY, language: 'fr-FR', ...extra };
  }

  getPopularMovies(page = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/popular`, { params: this.params({ page }) });
  }

  searchMovies(query: string, page = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/movie`, { params: this.params({ query, page }) });
  }

  getMovieDetails(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/${id}`, { params: this.params() });
  }

  getImageUrl(path: string | null): string {
    return path ? this.imageUrl + path : 'assets/no-poster.png';
  }
}