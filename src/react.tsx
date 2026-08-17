import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { WatercolorRenderer } from './WatercolorRenderer';
import type { ImageSource, WatercolorControls, WatercolorOptions } from './types';

export interface WatercolorProps extends WatercolorOptions {
  src: ImageSource;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Watercolor = forwardRef<WatercolorControls, WatercolorProps>(function Watercolor(
  { src, autoplay = true, className, style, ...options }, ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instance = useRef<WatercolorRenderer | null>(null);
  useImperativeHandle(ref, () => ({
    play: () => instance.current?.play(),
    pause: () => instance.current?.pause(),
    restart: seed => instance.current?.restart(seed),
    seek: progress => instance.current?.seek(progress),
    setImage: source => instance.current?.setImage(source) ?? Promise.resolve(),
    setOptions: value => instance.current?.setOptions(value),
    capture: (type, quality) => instance.current?.capture(type, quality) ?? '',
    captureHighQuality: maxDimension => instance.current?.captureHighQuality(maxDimension) ?? Promise.resolve(null),
    destroy: () => instance.current?.destroy(),
  }), []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new WatercolorRenderer(canvasRef.current, options);
    instance.current = renderer;
    void renderer.setImage(src).then(() => autoplay && renderer.play());
    return () => { renderer.destroy(); instance.current = null; };
  }, []);

  useEffect(() => { instance.current?.setOptions(options); }, [options]);
  useEffect(() => { void instance.current?.setImage(src); }, [src]);
  return <canvas ref={canvasRef} className={className} style={{ display: 'block', width: '100%', height: '100%', ...style }} />;
});
