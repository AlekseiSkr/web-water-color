import { defineComponent as s, ref as u, onMounted as i, watch as o, onBeforeUnmount as l, h as c } from "vue";
import { W as p } from "./WatercolorRenderer-DpmJRjOW.js";
const f = s({
  name: "Watercolor",
  props: {
    src: { type: [String, Object], required: !0 },
    options: { type: Object, default: () => ({}) },
    autoplay: { type: Boolean, default: !0 }
  },
  setup(a, { expose: n }) {
    const r = u();
    let e;
    return n({
      get renderer() {
        return e;
      },
      play: () => e?.play(),
      pause: () => e?.pause(),
      restart: (t) => e?.restart(t),
      seek: (t) => e?.seek(t),
      captureHighQuality: (t) => e?.captureHighQuality(t),
      captureHighQualityLayers: (t) => e?.captureHighQualityLayers(t)
    }), i(async () => {
      e = new p(r.value, a.options), await e.setImage(a.src), a.autoplay && e.play();
    }), o(() => a.src, (t) => e?.setImage(t)), o(() => a.options, (t) => e?.setOptions(t), { deep: !0 }), l(() => e?.destroy()), () => c("canvas", { ref: r, style: "display:block;width:100%;height:100%" });
  }
});
export {
  f as Watercolor,
  f as default
};
