import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { WatercolorRenderer } from './WatercolorRenderer';
import type { PropType } from 'vue';
import type { ImageSource, WatercolorOptions } from './types';

export const Watercolor = defineComponent({
  name: 'Watercolor',
  props: {
    src: { type: [String, Object] as PropType<ImageSource>, required: true },
    options: { type: Object as PropType<WatercolorOptions>, default: () => ({}) },
    autoplay: { type: Boolean, default: true },
  },
  setup(props, { expose }) {
    const canvas = ref<HTMLCanvasElement>();
    let renderer: WatercolorRenderer | undefined;
    expose({
      get renderer() { return renderer; },
      play: () => renderer?.play(),
      pause: () => renderer?.pause(),
      restart: (seed?: number) => renderer?.restart(seed),
      seek: (progress: number) => renderer?.seek(progress),
      captureHighQuality: (maxDimension?: number) => renderer?.captureHighQuality(maxDimension),
      captureHighQualityLayers: (maxDimension?: number) => renderer?.captureHighQualityLayers(maxDimension),
    });
    onMounted(async () => {
      renderer = new WatercolorRenderer(canvas.value!, props.options);
      await renderer.setImage(props.src);
      if (props.autoplay) renderer.play();
    });
    watch(() => props.src, value => renderer?.setImage(value));
    watch(() => props.options, value => renderer?.setOptions(value), { deep: true });
    onBeforeUnmount(() => renderer?.destroy());
    return () => h('canvas', { ref: canvas, style: 'display:block;width:100%;height:100%' });
  },
});

export default Watercolor;
