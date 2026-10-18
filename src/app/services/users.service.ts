import { Injectable } from '@angular/core';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AppUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  async getUsers(): Promise<AppUser[]> {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ ...(d.data() as AppUser), uid: d.id }));
  }

  // Active ou désactive un compte (jamais de suppression)
  async setActive(uid: string, active: boolean): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { active });
  }
}
