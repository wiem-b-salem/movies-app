import { AppUser } from '../models/user.model';
import { matchRate } from './match-rate';

export interface Match {
  user: AppUser;
  rate: number;
}

export const MATCH_THRESHOLD = 75;

export function findMatches(
  currentUid: string,
  users: AppUser[],
  favoritesByUid: Record<string, string[]>,
  threshold = MATCH_THRESHOLD
): Match[] {
  const mine = favoritesByUid[currentUid] ?? [];

  return users
    .filter(u => u.uid !== currentUid && u.active)
    .map(user => ({ user, rate: matchRate(mine, favoritesByUid[user.uid] ?? []) }))
    .filter(m => m.rate > threshold)
    .sort((a, b) => b.rate - a.rate);
}
