import { Injectable } from '@angular/core';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Movie } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class FirebaseMovieService {
  // Convertit un document Firestore en Movie (format de Wiem)
  private toMovie(docId: string, data: Record<string, any>): Movie {
    return {
      id: 'fb_' + docId,
      title: data['title'] ?? '',
      overview: data['overview'] ?? '',
      posterUrl: data['posterUrl'] ?? '',
      releaseDate: data['releaseDate'] ?? '',
      rating: data['rating'] ?? 0,
      source: 'firebase',
    };
  }

  // Lit tous les films ajoutés par l'admin
  async getMovies(): Promise<Movie[]> {
    const snapshot = await getDocs(collection(db, 'movies'));
    return snapshot.docs.map((d) => this.toMovie(d.id, d.data()));
  }

  // Lit un seul film. firestoreId = l'id Firestore seul, sans le préfixe "fb_"
  async getMovieById(firestoreId: string): Promise<Movie | null> {
    const snap = await getDoc(doc(db, 'movies', firestoreId));
    return snap.exists() ? this.toMovie(snap.id, snap.data()) : null;
  }
}