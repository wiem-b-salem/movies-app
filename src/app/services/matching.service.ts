import { Injectable } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { AppUser } from '../models/user.model';
import { Favorites } from '../models/favorites.model';
import { findMatches, Match } from '../utils/find-matches';

@Injectable({ providedIn: 'root' })
export class MatchingService {
  async getMatches(currentUid: string): Promise<Match[]> {
    const [usersSnap, favsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'favorites')),
    ]);

    const users = usersSnap.docs.map(d => ({ ...(d.data() as AppUser), uid: d.id }));
    const favoritesByUid: Record<string, string[]> = {};
    favsSnap.docs.forEach(d => {
      favoritesByUid[d.id] = (d.data() as Favorites).movieIds ?? [];
    });

    return findMatches(currentUid, users, favoritesByUid);
  }
}
