import { describe, it, expect } from 'vitest';
import { findMatches } from './find-matches';
import { AppUser } from '../models/user.model';

const user = (uid: string, active = true): AppUser => ({
  uid, nom: uid, prenom: uid, age: 20, email: `${uid}@x.com`, photo: '', role: 'user', active,
});

describe('findMatches', () => {
  const favs = {
    me: ['1', '2', '3', '4'],
    a: ['1', '2', '3', '4'],      // 100%
    b: ['1', '2', '3', '4', '5'], // 80%
    c: ['1', '2', '3', '5'],      // 60%
    d: ['1', '2', '3'],           // 75% (not above)
  };
  const users = [user('me'), user('a'), user('b'), user('c'), user('d')];

  it('keeps only rates strictly above 75%, sorted descending', () => {
    const res = findMatches('me', users, favs);
    expect(res.map(m => m.user.uid)).toEqual(['a', 'b']);
    expect(res.map(m => m.rate)).toEqual([100, 80]);
  });

  it('excludes the current user', () => {
    expect(findMatches('me', users, favs).some(m => m.user.uid === 'me')).toBe(false);
  });

  it('excludes deactivated users', () => {
    const res = findMatches('me', [user('me'), user('a', false)], favs);
    expect(res).toEqual([]);
  });

  it('returns nothing when the current user has no favorites', () => {
    expect(findMatches('x', users, favs)).toEqual([]);
  });
});
