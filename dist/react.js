import { jsx as m } from "react/jsx-runtime";
import { forwardRef as f, useRef as a, useImperativeHandle as d, useEffect as s } from "react";
import { W as y } from "./WatercolorRenderer-DAn2omau.js";
const R = f(function({ src: t, autoplay: c = !0, className: o, style: l, ...n }, i) {
  const u = a(null), r = a(null);
  return d(i, () => ({
    play: () => r.current?.play(),
    pause: () => r.current?.pause(),
    restart: (e) => r.current?.restart(e),
    seek: (e) => r.current?.seek(e),
    setImage: (e) => r.current?.setImage(e) ?? Promise.resolve(),
    setOptions: (e) => r.current?.setOptions(e),
    capture: (e, p) => r.current?.capture(e, p) ?? "",
    captureHighQuality: (e) => r.current?.captureHighQuality(e) ?? Promise.resolve(null),
    destroy: () => r.current?.destroy()
  }), []), s(() => {
    if (!u.current) return;
    const e = new y(u.current, n);
    return r.current = e, e.setImage(t).then(() => c && e.play()), () => {
      e.destroy(), r.current = null;
    };
  }, []), s(() => {
    r.current?.setOptions(n);
  }, [n]), s(() => {
    r.current?.setImage(t);
  }, [t]), /* @__PURE__ */ m("canvas", { ref: u, className: o, style: { display: "block", width: "100%", height: "100%", ...l } });
});
export {
  R as Watercolor
};
