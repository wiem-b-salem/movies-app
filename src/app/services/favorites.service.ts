import { Injectable } from '@angular/core';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Favorites } from '../models/favorites.model';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  // Lit la liste des ids favoris d'un utilisateur
  async getFavorites(uid: string): Promise<string[]> {
    const snap = await getDoc(doc(db, 'favorites', uid));
    if (!snap.exists()) return [];
    return (snap.data() as Favorites).movieIds ?? [];
  }

  // Ajoute un film aux favoris (arrayUnion évite les doublons)
  async addFavorite(uid: string, movieId: string): Promise<void> {
    await setDoc(doc(db, 'favorites', uid), { movieIds: arrayUnion(movieId) }, { merge: true });
  }

  // Retire un film des favoris
  async removeFavorite(uid: string, movieId: string): Promise<void> {
    await setDoc(doc(db, 'favorites', uid), { movieIds: arrayRemove(movieId) }, { merge: true });
  }
}