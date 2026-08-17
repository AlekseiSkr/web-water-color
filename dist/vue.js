import { defineComponent as s, ref as l, onMounted as u, watch as o, onBeforeUnmount as c, h as p } from "vue";
import { W as i } from "./WatercolorRenderer-BDwuOIAl.js";
const f = s({
  name: "Watercolor",
  props: {
    src: { type: [String, Object], required: !0 },
    options: { type: Object, default: () => ({}) },
    autoplay: { type: Boolean, default: !0 }
  },
  setup(r, { expose: n }) {
    const a = l();
    let e;
    return n({
      get renderer() {
        return e;
      },
      play: () => e?.play(),
      pause: () => e?.pause(),
      restart: (t) => e?.restart(t),
      seek: (t) => e?.seek(t)
    }), u(async () => {
      e = new i(a.value, r.options), await e.setImage(r.src), r.autoplay && e.play();
    }), o(() => r.src, (t) => e?.setImage(t)), o(() => r.options, (t) => e?.setOptions(t), { deep: !0 }), c(() => e?.destroy()), () => p("canvas", { ref: a, style: "display:block;width:100%;height:100%" });
  }
});
export {
  f as Watercolor,
  f as default
};
