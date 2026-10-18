import { Injectable, computed, signal } from '@angular/core';
import {
  createUserWithEmailAndPassword, onAuthStateChanged,
  signInWithEmailAndPassword, signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AppUser } from '../models/user.model';

export type RegisterData = Omit<AppUser, 'uid' | 'role' | 'active'> & { password: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _profile = signal<AppUser | null>(null);
  readonly profile = this._profile.asReadonly();
  readonly isAdmin = computed(() => this._profile()?.role === 'admin');

  /** Resolves once Firebase has restored the session (used by guards). */
  readonly ready: Promise<void>;

  // true during register/login so the listener doesn't race with them
  private busy = false;

  constructor() {
    this.ready = new Promise<void>(resolve => {
      onAuthStateChanged(auth, async user => {
        if (!this.busy) {
          const profile = user ? await this.loadProfile(user.uid) : null;
          if (user && (!profile || !profile.active)) {
            await signOut(auth);
            this._profile.set(null);
          } else {
            this._profile.set(profile);
          }
        }
        resolve();
      });
    });
  }

  private async loadProfile(uid: string): Promise<AppUser | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as AppUser) : null;
  }

  async register(data: RegisterData): Promise<void> {
    this.busy = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const { password, ...rest } = data;
      const profile: AppUser = { ...rest, uid: cred.user.uid, role: 'user', active: true };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      this._profile.set(profile);
    } finally {
      this.busy = false;
    }
  }

  async login(email: string, password: string): Promise<void> {
    this.busy = true;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await this.loadProfile(cred.user.uid);
      if (!profile) {
        await signOut(auth);
        throw new Error('NO_PROFILE');
      }
      if (profile.active === false) {
        await signOut(auth);
        throw new Error('ACCOUNT_DISABLED');
      }
      this._profile.set(profile);
    } finally {
      this.busy = false;
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    this._profile.set(null);
  }
}

export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string }).code ?? (e as Error).message;
  switch (code) {
    case 'ACCOUNT_DISABLED': return 'Votre compte est désactivé. Contactez un administrateur.';
    case 'NO_PROFILE': return 'Profil introuvable. Contactez un administrateur.';
    case 'auth/email-already-in-use': return 'Cet email est déjà utilisé.';
    case 'auth/weak-password': return 'Mot de passe trop faible (6 caractères minimum).';
    case 'auth/invalid-email': return 'Email invalide.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Email ou mot de passe incorrect.';
    default: return 'Une erreur est survenue. Réessayez.';
  }
}