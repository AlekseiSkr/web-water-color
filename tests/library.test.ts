import { describe, expect, it } from 'vitest';
import { WatercolorRenderer } from '../src';

describe('library surface', () => {
  it('exports the framework-neutral renderer', () => {
    expect(WatercolorRenderer).toBeTypeOf('function');
  });

  it('exposes timeline and repaint controls', () => {
    expect(WatercolorRenderer.prototype.play).toBeTypeOf('function');
    expect(WatercolorRenderer.prototype.restart).toBeTypeOf('function');
    expect(WatercolorRenderer.prototype.seek).toBeTypeOf('function');
    expect(WatercolorRenderer.prototype.captureHighQuality).toBeTypeOf('function');
    expect(WatercolorRenderer.prototype.captureHighQualityLayers).toBeTypeOf('function');
  });
});
