import { defineComponent as s, ref as u, onMounted as l, watch as o, onBeforeUnmount as i, h as c } from "vue";
import { W as p } from "./WatercolorRenderer-B9fgDtG4.js";
const f = s({
  name: "Watercolor",
  props: {
    src: { type: [String, Object], required: !0 },
    options: { type: Object, default: () => ({}) },
    autoplay: { type: Boolean, default: !0 }
  },
  setup(r, { expose: n }) {
    const a = u();
    let e;
    return n({
      get renderer() {
        return e;
      },
      play: () => e?.play(),
      pause: () => e?.pause(),
      restart: (t) => e?.restart(t),
      seek: (t) => e?.seek(t),
      captureHighQuality: (t) => e?.captureHighQuality(t)
    }), l(async () => {
      e = new p(a.value, r.options), await e.setImage(r.src), r.autoplay && e.play();
    }), o(() => r.src, (t) => e?.setImage(t)), o(() => r.options, (t) => e?.setOptions(t), { deep: !0 }), i(() => e?.destroy()), () => c("canvas", { ref: a, style: "display:block;width:100%;height:100%" });
  }
});
export {
  f as Watercolor,
  f as default
};
