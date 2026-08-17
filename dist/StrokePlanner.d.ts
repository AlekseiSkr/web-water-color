import type { DetailMapProvider, ImageSource } from './types';
export interface PaintSegment {
    start: [number, number];
    end: [number, number];
    color: [number, number, number];
    radius: number;
    opacity: number;
    water: number;
    layer: number;
    strokeId: number;
}
export interface StrokePlan {
    segments: PaintSegment[];
    sourceAspect: number;
    layerEnds: number[];
    bounds: [number, number, number, number];
}
export interface StrokeTuning {
    strokeEconomy: number;
    shapeSimplification: number;
    strokeLength: number;
    strokeWidth: number;
    boundaryFidelity: number;
    detailBudget: number;
    detailPrecision: number;
    strokeCurvature: number;
}
/** Converts image structure into ordered brush paths. Source pixels are never rendered. */
export declare function planStrokes(source: ImageSource, seed: number, targetAspect: number, resolution?: number, fit?: 'cover' | 'contain', mode?: 'watercolor' | 'oil', detailFocus?: 'auto' | 'uniform' | 'portrait', detailMap?: DetailMapProvider, tuning?: Partial<StrokeTuning>): Promise<StrokePlan>;
