import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MovieService } from './movie.service';
import { FirebaseMovieService } from './firebase-movie.service';
import { Movie } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private movieService = inject(MovieService);
  private firebaseMovieService = inject(FirebaseMovieService);

  // Retrouve un film à partir de son id préfixé ("tmdb_550" ou "fb_Ab12Cd")
  private async getMovieById(id: string): Promise<Movie | null> {
    if (id.startsWith('tmdb_')) {
      const tmdbId = Number(id.replace('tmdb_', ''));
      return firstValueFrom(this.movieService.getMovieDetails(tmdbId));
    }
    if (id.startsWith('fb_')) {
      return this.firebaseMovieService.getMovieById(id.replace('fb_', ''));
    }
    return null;
  }

  // Transforme une liste d'ids en liste de films (les films introuvables sont ignorés)
  async getMoviesByIds(ids: string[]): Promise<Movie[]> {
    const results = await Promise.allSettled(ids.map((id) => this.getMovieById(id)));

    return results.flatMap((r) =>
      r.status === 'fulfilled' && r.value ? [r.value] : []
    );
  }
}