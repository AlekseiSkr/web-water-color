import type { PropType } from 'vue';
import type { ImageSource, WatercolorOptions } from './types';
export declare const Watercolor: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    src: {
        type: PropType<ImageSource>;
        required: true;
    };
    options: {
        type: PropType<WatercolorOptions>;
        default: () => {};
    };
    autoplay: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    src: {
        type: PropType<ImageSource>;
        required: true;
    };
    options: {
        type: PropType<WatercolorOptions>;
        default: () => {};
    };
    autoplay: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    autoplay: boolean;
    options: WatercolorOptions;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default Watercolor;
