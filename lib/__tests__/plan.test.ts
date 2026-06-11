import { canUse } from '@/lib/plan';

describe('canUse', () => {
  it('free plan cannot use any pro feature', () => {
    expect(canUse('export', 'free')).toBe(false);
    expect(canUse('history', 'free')).toBe(false);
    expect(canUse('unlimited', 'free')).toBe(false);
    expect(canUse('noad', 'free')).toBe(false);
    expect(canUse('whitelabel', 'free')).toBe(false);
    expect(canUse('api', 'free')).toBe(false);
  });

  it('pro plan can use pro features', () => {
    expect(canUse('export', 'pro')).toBe(true);
    expect(canUse('history', 'pro')).toBe(true);
    expect(canUse('unlimited', 'pro')).toBe(true);
    expect(canUse('noad', 'pro')).toBe(true);
  });

  it('pro plan cannot use business-only features', () => {
    expect(canUse('whitelabel', 'pro')).toBe(false);
    expect(canUse('api', 'pro')).toBe(false);
  });

  it('business plan can use all features', () => {
    expect(canUse('export', 'business')).toBe(true);
    expect(canUse('history', 'business')).toBe(true);
    expect(canUse('unlimited', 'business')).toBe(true);
    expect(canUse('noad', 'business')).toBe(true);
    expect(canUse('whitelabel', 'business')).toBe(true);
    expect(canUse('api', 'business')).toBe(true);
  });

  it('free plan cannot use multi-winner', () => {
    expect(canUse('multi-winner', 'free')).toBe(false);
  });

  it('pro plan can use multi-winner', () => {
    expect(canUse('multi-winner', 'pro')).toBe(true);
  });

  it('business plan can use multi-winner', () => {
    expect(canUse('multi-winner', 'business')).toBe(true);
  });
});
