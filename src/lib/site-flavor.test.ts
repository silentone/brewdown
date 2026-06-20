import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calculatorHref,
  resolveFlavor,
  showAffiliates,
} from './site-flavor';

describe('site-flavor', () => {
  describe('resolveFlavor', () => {
    it('resolves / to standard', () => {
      expect(resolveFlavor(new URL('http://localhost/'))).toBe('standard');
    });

    it('resolves /compare to partner', () => {
      expect(resolveFlavor(new URL('http://localhost/compare'))).toBe(
        'partner',
      );
    });

    it('resolves /compare/ to partner', () => {
      expect(resolveFlavor(new URL('http://localhost/compare/'))).toBe(
        'partner',
      );
    });

    describe('dev query param', () => {
      beforeEach(() => {
        vi.stubEnv('DEV', true);
      });

      afterEach(() => {
        vi.unstubAllEnvs();
      });

      it('?flavor=partner on / resolves to partner when DEV is true', async () => {
        vi.resetModules();
        const { resolveFlavor: resolve } = await import('./site-flavor');
        expect(
          resolve(new URL('http://localhost/?flavor=partner')),
        ).toBe('partner');
      });
    });

    describe('production build', () => {
      beforeEach(() => {
        vi.stubEnv('DEV', false);
      });

      afterEach(() => {
        vi.unstubAllEnvs();
      });

      it('ignores ?flavor=partner when DEV is false', async () => {
        vi.resetModules();
        const { resolveFlavor: resolve } = await import('./site-flavor');
        expect(
          resolve(new URL('http://localhost/?flavor=partner')),
        ).toBe('standard');
      });
    });
  });

  describe('showAffiliates', () => {
    it('returns true for standard flavor', () => {
      expect(showAffiliates('standard')).toBe(true);
    });

    it('returns false for partner flavor', () => {
      expect(showAffiliates('partner')).toBe(false);
    });
  });

  describe('calculatorHref', () => {
    it('returns / for standard flavor', () => {
      expect(calculatorHref('standard')).toBe('/');
    });

    it('returns /compare for partner flavor', () => {
      expect(calculatorHref('partner')).toBe('/compare');
    });
  });
});
