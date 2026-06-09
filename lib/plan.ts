export type Feature = 'export' | 'history' | 'unlimited' | 'noad' | 'whitelabel' | 'api';
export type Plan = 'free' | 'pro' | 'business';

export const PRO_FEATURES: Feature[] = ['export', 'history', 'unlimited', 'noad'];

export function canUse(feature: Feature, plan: Plan): boolean {
  if (plan === 'business') return true;
  if (plan === 'pro') return PRO_FEATURES.includes(feature);
  return false;
}
