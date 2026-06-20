export type SiteFlavor = 'standard' | 'partner';

const PARTNER_PATHS = new Set(['/compare', '/compare/']);

export function resolveFlavor(url: URL): SiteFlavor {
  if (PARTNER_PATHS.has(url.pathname)) return 'partner';
  if (import.meta.env.DEV) {
    const param = url.searchParams.get('flavor');
    if (param === 'partner' || param === 'standard') return param;
  }
  return 'standard';
}

export function showAffiliates(flavor: SiteFlavor): boolean {
  return flavor === 'standard';
}

export function calculatorHref(flavor: SiteFlavor): string {
  return flavor === 'partner' ? '/compare' : '/';
}
