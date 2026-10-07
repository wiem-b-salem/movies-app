import { Injectable } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Movie } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class FirebaseMovieService {
  // Lit les films ajoutés par l'admin dans la collection "movies"
  async getMovies(): Promise<Movie[]> {
    const snapshot = await getDocs(collection(db, 'movies'));

    return snapshot.docs.map((d): Movie => {
      const data = d.data();
      return {
        id: 'fb_' + d.id,
        title: data['title'] ?? '',
        overview: data['overview'] ?? '',
        posterUrl: data['posterUrl'] ?? '',
        releaseDate: data['releaseDate'] ?? '',
        rating: data['rating'] ?? 0,
        source: 'firebase',
      };
    });
  }
}