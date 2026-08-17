import { jsx as f } from "react/jsx-runtime";
import { forwardRef as m, useRef as c, useImperativeHandle as d, useEffect as u } from "react";
import { W as y } from "./WatercolorRenderer-D_uw9QQw.js";
const R = m(function({ src: t, autoplay: a = !0, className: o, style: l, ...n }, i) {
  const s = c(null), r = c(null);
  return d(i, () => ({
    play: () => r.current?.play(),
    pause: () => r.current?.pause(),
    restart: (e) => r.current?.restart(e),
    seek: (e) => r.current?.seek(e),
    setImage: (e) => r.current?.setImage(e) ?? Promise.resolve(),
    setOptions: (e) => r.current?.setOptions(e),
    capture: (e, p) => r.current?.capture(e, p) ?? "",
    destroy: () => r.current?.destroy()
  }), []), u(() => {
    if (!s.current) return;
    const e = new y(s.current, n);
    return r.current = e, e.setImage(t).then(() => a && e.play()), () => {
      e.destroy(), r.current = null;
    };
  }, []), u(() => {
    r.current?.setOptions(n);
  }, [n]), u(() => {
    r.current?.setImage(t);
  }, [t]), /* @__PURE__ */ f("canvas", { ref: s, className: o, style: { display: "block", width: "100%", height: "100%", ...l } });
});
export {
  R as Watercolor
};
