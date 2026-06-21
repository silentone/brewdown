import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AFFILIATE_PRESETS } from './affiliates';

describe('affiliate thumbnails', () => {
  it('references images that exist in public/', () => {
    const links = Object.values(AFFILIATE_PRESETS).flat();

    for (const link of links) {
      expect(link.image.startsWith('/')).toBe(true);

      const diskPath = join(process.cwd(), 'public', link.image.slice(1));
      expect(existsSync(diskPath)).toBe(true);
    }
  });
});
