import type { ImageSource, WatercolorControls, WatercolorOptions } from './types';
export interface WatercolorProps extends WatercolorOptions {
    src: ImageSource;
    autoplay?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
export declare const Watercolor: import("react").ForwardRefExoticComponent<WatercolorProps & import("react").RefAttributes<WatercolorControls>>;
