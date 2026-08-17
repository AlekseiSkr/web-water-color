export type ImageSource = string | HTMLImageElement | ImageBitmap | HTMLCanvasElement;
export interface DetailMapContext {
    /** RGBA source pixels at the analysis resolution. Treat this array as read-only. */
    data: Uint8ClampedArray;
    width: number;
    height: number;
}
/** Returns one 0–1 detail weight per analysis pixel. */
export type DetailMapProvider = (context: DetailMapContext) => Float32Array | Promise<Float32Array>;
export interface WatercolorOptions {
    /** Painting material. Oil uses opaque impasto paths; watercolor uses translucent washes. */
    mode?: 'watercolor' | 'oil';
    /** Duration of one painting pass in seconds. */
    duration?: number;
    /** Repeatable variation seed. Omit for a new painting every run. */
    seed?: number;
    /** Dry paper color. */
    paperColor?: string;
    /** Microscopic paper relief, 0–1. */
    paperRoughness?: number;
    /** Pigment pooling and dark wet edges, 0–1. */
    edgeDarkening?: number;
    /** Pigment particles settling into paper valleys, 0–1. */
    granulation?: number;
    /** Lateral water spread and cauliflower blooms, 0–1. */
    bloom?: number;
    /** Amount of translucent paper showing through, 0–1. */
    transparency?: number;
    /** Number of overlapping translucent washes, 1–5. */
    washes?: number;
    /** Animation playback speed. */
    speed?: number;
    /** Device pixel ratio cap. */
    pixelRatio?: number;
    /** Rendering workload. Fast preserves stroke planning while reducing microscopic raster effects. */
    renderQuality?: 'fast' | 'balanced' | 'high';
    /** Longest side used while analyzing the source image. */
    analysisResolution?: number;
    /** Maximum complete brush paths deposited per animation frame. Rendering is also capped by a small time budget. */
    strokesPerFrame?: number;
    /** Automatic portrait-aware detail allocation, uniform detail, or a portrait-prioritized analysis. */
    detailFocus?: 'auto' | 'uniform' | 'portrait';
    /** Optional application-supplied semantic attention map. Overrides detailFocus analysis. */
    detailMap?: DetailMapProvider;
    /** Fewer, more deliberate strokes at 1; denser reconstruction at 0. */
    strokeEconomy?: number;
    /** How strongly the source is reduced to broad color masses before planning, 0–1. */
    shapeSimplification?: number;
    /** Multiplier control for planned stroke length, 0–1. */
    strokeLength?: number;
    /** Multiplier control for planned brush width, 0–1. */
    strokeWidth?: number;
    /** How strictly strokes remain inside coherent color regions, 0–1. */
    boundaryFidelity?: number;
    /** Number of selective finishing accents, 0–1. */
    detailBudget?: number;
    /** Semantic selectivity of finishing accents, 0–1. */
    detailPrecision?: number;
    /** How late finishing accents enter the timeline, 0–1. */
    detailDelay?: number;
    /** Curvature and gesture variation of dragged strokes, 0–1. */
    strokeCurvature?: number;
    /** Amount of pigment carried by a brush, 0–1. */
    paintLoad?: number;
    /** Probability and strength of broken dry-brush marks, 0–1. */
    dryBrush?: number;
    /** Visibility of individual brush hairs, 0–1. */
    bristleStrength?: number;
    /** Directional surface sheen, primarily visible in oil mode, 0–1. */
    gloss?: number;
    /** Preserve the whole source or crop it to fill the canvas. */
    imageFit?: 'cover' | 'contain';
    /** Reports image analysis and painting phases. */
    onPhaseChange?: (phase: 'analyzing' | 'painting' | 'drying' | 'complete') => void;
    /** Called with normalized progress while painting. */
    onProgress?: (progress: number) => void;
    onComplete?: () => void;
}
export interface WatercolorControls {
    play(): void;
    pause(): void;
    restart(seed?: number): void;
    seek(progress: number): void;
    setImage(source: ImageSource): Promise<void>;
    setOptions(options: Partial<WatercolorOptions>): void;
    capture(type?: string, quality?: number): string;
    destroy(): void;
}
