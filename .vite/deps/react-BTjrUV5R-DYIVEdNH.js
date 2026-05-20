import { r as __toESM, t as require_react } from "./react-BsDccEtb.js";
import { n as _, t as Z } from "./mixin-Db00K8RL-BcVmQUPt.js";
//#region node_modules/@goat-ui/goat-ui-core/dist/react-BTjrUV5R.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var I = class extends _(Z) {
	static shadowRootOptions = { ...Z.shadowRootOptions };
	static getTemplateHTML = (i) => {
		const { src: n, ...o } = i;
		return Z.getTemplateHTML(o);
	};
	#t;
	attributeChangedCallback(i, n, o) {
		i !== "src" && super.attributeChangedCallback(i, n, o), i === "src" && n != o && this.load();
	}
	async _initThumbnails(i) {
		const n = async (d, m) => {
			const v = [], g = i.timescale || 1, h = i.startNumber || 1, E = i.presentationTimeOffset ? i.presentationTimeOffset / g : 0, M = i.segmentDuration;
			for (let l = 0; l < d; l++) {
				const T = C({
					thIndex: l,
					thduration: m,
					ttiles: d,
					tduration: M,
					startNumber: h,
					pto: E
				}), w = T + m, S = new Promise((f, y) => {
					this.api.provideThumbnail(T, ({ url: a, width: s, height: c, x: p, y: b }) => {
						try {
							f(new VTTCue(T, w, `${a}#xywh=${p},${b},${s},${c}`));
						} catch (_) {
							y(_);
						}
					});
				});
				v.push(S);
			}
			return await Promise.all(v).catch((l) => console.error("Error processing thumbnails", l));
		}, { totalThumbnails: o, thumbnailDuration: e } = A(i), u = await n(o, e);
		let r = this.nativeEl.querySelector("track[label=\"thumbnails\"]");
		if (!r) {
			r = D(), this.nativeEl.appendChild(r);
			const d = x(u);
			r.src = d, r.dispatchEvent(new Event("change"));
		}
	}
	async load() {
		if (this.#t) {
			this.api.attachSource(this.src);
			return;
		}
		this.#t = !0;
		const i = await import("./dash.all.min-CpNmK5Fz-C6Z5uE2H.js");
		this.api = i.MediaPlayer().create(), this.api.initialize(this.nativeEl, this.src, this.autoplay), this.api.on(i.MediaPlayer.events.STREAM_INITIALIZED, () => {
			const n = this.api.getRepresentationsByType("video");
			let o = this.videoTracks.getTrackById("main");
			o || (o = this.addVideoTrack("main"), o.id = "main", o.selected = !0), n.forEach((e) => {
				const u = e.bandwidth ?? e.bitrate ?? (Number.isFinite(e.bitrateInKbit) ? e.bitrateInKbit * 1e3 : void 0), r = o.addRendition(e.id, e.width, e.height, e.mimeType ?? e.codec, u);
				r.id = e.id;
			}), this.videoRenditions.addEventListener("change", () => {
				const e = this.videoRenditions[this.videoRenditions.selectedIndex];
				e?.id ? (this.api.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: !1 } } } }), this.api.setRepresentationForTypeById("video", e.id, !0)) : this.api.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: !0 } } } });
			}), this.api.isDynamic() || this.api.getRepresentationsByType("image").forEach(async (u, r) => {
				r > 0 || this._initThumbnails(u);
			});
		});
	}
};
function A(t) {
	var i, n;
	const [e, u] = t.essentialProperties[0].value.split("x").map(Number), r = e * u, d = ((n = (i = t.adaptation) == null ? void 0 : i.period) == null ? void 0 : n.duration) || null, m = t.segmentDuration, h = m / (t.timescale || 1) / r;
	return {
		totalThumbnails: d != null ? Math.ceil(d / h) : Math.ceil(m / h),
		thumbnailDuration: h
	};
}
function C({ thIndex: t, tduration: i, thduration: n, ttiles: o, startNumber: e, pto: u }) {
	const r = Math.floor(t / o) + e, d = t % o + 1;
	return (r - 1) * i - u + (d - 1) * n;
}
function D() {
	const t = document.createElement("track");
	return t.kind = "metadata", t.label = "thumbnails", t.srclang = "en", t.mode = "hidden", t.default = !0, t;
}
function x(t) {
	let i = `WEBVTT

`;
	for (const e of t) i += `${o(e.startTime)} --> ${o(e.endTime)}
`, i += `${e.text}

`;
	const n = new Blob([i], { type: "text/vtt" });
	return URL.createObjectURL(n);
	function o(e) {
		return `${String(Math.floor(e / 3600)).padStart(2, "0")}:${String(Math.floor(e % 3600 / 60)).padStart(2, "0")}:${(e % 60).toFixed(3).padStart(6, "0")}`;
	}
}
globalThis.customElements && !globalThis.customElements.get("dash-video") && globalThis.customElements.define("dash-video", I);
var B = I, H = /* @__PURE__ */ new Set([
	"style",
	"children",
	"ref",
	"key",
	"suppressContentEditableWarning",
	"suppressHydrationWarning",
	"dangerouslySetInnerHTML"
]), O = {
	className: "class",
	htmlFor: "for"
};
function P(t) {
	return t.toLowerCase();
}
function R(t) {
	if (typeof t == "boolean") return t ? "" : void 0;
	if (typeof t != "function" && !(typeof t == "object" && t !== null)) return t;
}
function F({ react: t, tagName: i, elementClass: n, events: o, displayName: e, defaultProps: u, toAttributeName: r = P, toAttributeValue: d = R }) {
	const m = Number.parseInt(t.version) >= 19, v = t.forwardRef((g, h) => {
		var E, M;
		const l = t.useRef(null), T = t.useRef(/* @__PURE__ */ new Map()), w = {}, S = {}, f = {}, y = {};
		for (const [a, s] of Object.entries(g)) {
			if (H.has(a)) {
				f[a] = s;
				continue;
			}
			const c = r(O[a] ?? a);
			if (n.prototype && a in n.prototype && !(a in (((E = globalThis.HTMLElement) == null ? void 0 : E.prototype) ?? {})) && !((M = n.observedAttributes) != null && M.some((b) => b === c))) {
				y[a] = s;
				continue;
			}
			if (a.startsWith("on")) {
				w[a] = s;
				continue;
			}
			const p = d(s);
			if (c && p != null && (S[c] = String(p), m || (f[c] = p)), c && m) p !== R(s) ? f[c] = p : f[c] = s;
		}
		if (typeof window < "u") {
			for (const a in w) {
				const s = w[a], c = a.endsWith("Capture"), p = (o?.[a] ?? a.slice(2).toLowerCase()).slice(0, c ? -7 : void 0);
				t.useLayoutEffect(() => {
					const b = l?.current;
					if (!(!b || typeof s != "function")) return b.addEventListener(p, s, c), () => {
						b.removeEventListener(p, s, c);
					};
				}, [l?.current, s]);
			}
			t.useLayoutEffect(() => {
				if (l.current === null) return;
				const a = /* @__PURE__ */ new Map();
				for (const s in y) L(l.current, s, y[s]), T.current.delete(s), a.set(s, y[s]);
				for (const [s, c] of T.current) L(l.current, s, void 0);
				T.current = a;
			});
		}
		if (typeof window > "u" && n?.getTemplateHTML && n?.shadowRootOptions) {
			const { mode: a, delegatesFocus: s } = n.shadowRootOptions;
			f.children = [t.createElement("template", {
				shadowrootmode: a,
				shadowrootdelegatesfocus: s,
				dangerouslySetInnerHTML: { __html: n.getTemplateHTML(S, g) },
				key: "ce-la-react-ssr-template-shadow-root"
			}), f.children];
		}
		return t.createElement(i, {
			...u,
			...f,
			ref: t.useCallback((a) => {
				l.current = a, typeof h == "function" ? h(a) : h !== null && (h.current = a);
			}, [h])
		}, f.children);
	});
	return v.displayName = e ?? n.name, v;
}
function L(t, i, n) {
	var o;
	t[i] = n, n == null && i in (((o = globalThis.HTMLElement) == null ? void 0 : o.prototype) ?? {}) && t.removeAttribute(i);
}
var j = F({
	react: import_react.default,
	tagName: "dash-video",
	elementClass: B,
	toAttributeName(t) {
		return t === "muted" ? "" : t === "defaultMuted" ? "muted" : P(t);
	}
});
//#endregion
export { j as default };

//# sourceMappingURL=react-BTjrUV5R-DYIVEdNH.js.map