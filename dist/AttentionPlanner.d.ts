export type DetailFocus = 'auto' | 'uniform' | 'portrait';
/** Lightweight semantic prior with a saliency fallback. It intentionally adds no ML runtime to the library. */
export declare function createSemanticAttentionMap(data: Uint8ClampedArray, width: number, height: number, focus?: DetailFocus): Float32Array<ArrayBuffer>;
