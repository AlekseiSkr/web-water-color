import { jsx as m } from "react/jsx-runtime";
import { forwardRef as y, useRef as a, useImperativeHandle as f, useEffect as s } from "react";
import { W as d } from "./WatercolorRenderer-DpmJRjOW.js";
const I = y(function({ src: t, autoplay: c = !0, className: o, style: l, ...u }, i) {
  const n = a(null), r = a(null);
  return f(i, () => ({
    play: () => r.current?.play(),
    pause: () => r.current?.pause(),
    restart: (e) => r.current?.restart(e),
    seek: (e) => r.current?.seek(e),
    setImage: (e) => r.current?.setImage(e) ?? Promise.resolve(),
    setOptions: (e) => r.current?.setOptions(e),
    capture: (e, p) => r.current?.capture(e, p) ?? "",
    captureHighQuality: (e) => r.current?.captureHighQuality(e) ?? Promise.resolve(null),
    captureHighQualityLayers: (e) => r.current?.captureHighQualityLayers(e) ?? Promise.resolve(null),
    destroy: () => r.current?.destroy()
  }), []), s(() => {
    if (!n.current) return;
    const e = new d(n.current, u);
    return r.current = e, e.setImage(t).then(() => c && e.play()), () => {
      e.destroy(), r.current = null;
    };
  }, []), s(() => {
    r.current?.setOptions(u);
  }, [u]), s(() => {
    r.current?.setImage(t);
  }, [t]), /* @__PURE__ */ m("canvas", { ref: n, className: o, style: { display: "block", width: "100%", height: "100%", ...l } });
});
export {
  I as Watercolor
};
