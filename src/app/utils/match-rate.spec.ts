import { describe, it, expect } from 'vitest';
import { matchRate } from './match-rate';

describe('matchRate', () => {
  it('returns 100 for identical favorites', () => {
    expect(matchRate([1, 2, 3], [3, 2, 1])).toBe(100);
  });

  it('returns 0 when nothing is in common', () => {
    expect(matchRate([1, 2], [3, 4])).toBe(0);
  });

  it('returns common / distinct total × 100', () => {
    expect(matchRate([1, 2, 3], [2, 3, 4])).toBe(50);
  });

  it('returns 0 when both lists are empty', () => {
    expect(matchRate([], [])).toBe(0);
  });

  it('ignores duplicates', () => {
    expect(matchRate([1, 1, 2], [1, 2, 2])).toBe(100);
  });
});
