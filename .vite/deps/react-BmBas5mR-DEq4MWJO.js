import { r as __toESM, t as require_react } from "./react-BsDccEtb.js";
import { n as at } from "./hls-BhaZGLxI-Bf9KoB1E.js";
import { n as _$1, t as Z } from "./mixin-Db00K8RL-BcVmQUPt.js";
//#region node_modules/@goat-ui/goat-ui-core/dist/react-BmBas5mR.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var x = (t) => class extends t {
	static shadowRootOptions = { ...t.shadowRootOptions };
	static getTemplateHTML = (e, s = {}) => {
		const { src: h, ...T } = e;
		return `
        <script type="application/json" id="config">
          ${JSON.stringify(s.config || {})}
        <\/script>
        ${t.getTemplateHTML(T)}
      `;
	};
	#e = null;
	#t = null;
	constructor() {
		super(), this.#o("config");
	}
	get config() {
		return this.#t;
	}
	set config(e) {
		this.#t = e;
	}
	attributeChangedCallback(e, s, h) {
		e !== "src" && super.attributeChangedCallback(e, s, h), e === "src" && s != h && this.load();
	}
	#n() {
		var e, s;
		(e = this.#e) == null || e.remove(), (s = this.nativeEl) == null || s.removeEventListener("webkitcurrentplaybacktargetiswirelesschanged", this.#i), this.api && (this.api.detachMedia(), this.api.destroy(), this.api = null);
	}
	async load() {
		var e, s;
		const h = !this.api;
		if (this.#n(), !!this.src) {
			if (h && !this.#t && (this.#t = JSON.parse(((e = this.shadowRoot.getElementById("config")) == null ? void 0 : e.textContent) || "{}")), at.isSupported()) {
				switch (await Promise.resolve(), this.api = new at({
					liveDurationInfinity: !0,
					autoStartLoad: !1,
					...this.config
				}), this.api.loadSource(this.src), this.api.attachMedia(this.nativeEl), this.nativeEl.preload) {
					case "none": {
						const r = () => this.api.startLoad();
						this.nativeEl.addEventListener("play", r, { once: !0 }), this.api.on(at.Events.DESTROYING, () => {
							this.nativeEl.removeEventListener("play", r);
						});
						break;
					}
					case "metadata": {
						const r = this.api.config.maxBufferLength, o = this.api.config.maxBufferSize;
						this.api.config.maxBufferLength = 1, this.api.config.maxBufferSize = 1;
						const i = () => {
							this.api.config.maxBufferLength = r, this.api.config.maxBufferSize = o;
						};
						this.nativeEl.addEventListener("play", i, { once: !0 }), this.api.on(at.Events.DESTROYING, () => {
							this.nativeEl.removeEventListener("play", i);
						}), this.api.startLoad();
						break;
					}
					default: this.api.startLoad();
				}
				this.nativeEl.webkitCurrentPlaybackTargetIsWireless && this.api.stopLoad(), this.nativeEl.addEventListener("webkitcurrentplaybacktargetiswirelesschanged", this.#i), this.#e = document.createElement("source"), this.#e.setAttribute("type", "application/x-mpegURL"), this.#e.setAttribute("src", this.src), this.nativeEl.disableRemotePlayback = !1, this.nativeEl.append(this.#e);
				const T = /* @__PURE__ */ new WeakMap();
				this.api.on(at.Events.MANIFEST_PARSED, (r, o) => {
					this.nativeEl.autoplay && this.nativeEl.paused && this.nativeEl.play().catch((d) => {
						console.warn("Autoplay failed:", d);
					}), k();
					let i = this.videoTracks.getTrackById("main");
					i || (i = this.addVideoTrack("main"), i.id = "main", i.selected = !0);
					for (const [d, l] of o.levels.entries()) {
						const u = i.addRendition(l.url[0], l.width, l.height, l.videoCodec, l.bitrate);
						T.set(l, `${d}`), u.id = `${d}`;
					}
					for (let [d, l] of o.audioTracks.entries()) {
						const u = l.default ? "main" : "alternative", y = this.addAudioTrack(u, l.name, l.lang);
						y.id = `${d}`, l.default && (y.enabled = !0);
					}
				}), this.audioTracks.addEventListener("change", () => {
					var r;
					const o = +((r = [...this.audioTracks].find((d) => d.enabled)) == null ? void 0 : r.id), i = this.api.audioTracks.map((d) => d.id);
					o != this.api.audioTrack && i.includes(o) && (this.api.audioTrack = o);
				}), this.api.on(at.Events.LEVELS_UPDATED, (r, o) => {
					const i = this.videoTracks[this.videoTracks.selectedIndex ?? 0];
					if (!i) return;
					const d = o.levels.map((l) => T.get(l));
					for (const l of this.videoRenditions) l.id && !d.includes(l.id) && i.removeRendition(l);
				});
				let m = null;
				this.api.on(at.Events.ERROR, (r, o) => {
					o.type === at.ErrorTypes.NETWORK_ERROR && o.details === at.ErrorDetails.FRAG_LOAD_ERROR && (m = o.frag.level);
				}), this.api.on(at.Events.LEVEL_SWITCHED, (r, o) => {
					const i = o.level;
					m !== null && i < m && (console.warn(`⚠️ hls.js downgraded quality from level ${m} to ${i} due to fragment load failure.`), this.videoRenditions.selectedIndex = i, m = null);
				});
				const L = (r) => {
					const o = r.target.selectedIndex;
					o != this.api.nextLevel && (this.api.nextLevel = o);
				};
				(s = this.videoRenditions) == null || s.addEventListener("change", L);
				const k = () => {
					for (const r of this.videoTracks) this.removeVideoTrack(r);
					for (const r of this.audioTracks) this.removeAudioTrack(r);
				};
				this.api.once(at.Events.DESTROYING, k);
				return;
			}
			await Promise.resolve(), this.nativeEl.canPlayType("application/vnd.apple.mpegurl") && (this.nativeEl.src = this.src);
		}
	}
	#i = () => {
		var e, s, h;
		(e = this.nativeEl) != null && e.webkitCurrentPlaybackTargetIsWireless ? (s = this.api) == null || s.stopLoad() : (h = this.api) == null || h.startLoad();
	};
	#o(e) {
		if (Object.prototype.hasOwnProperty.call(this, e)) {
			const s = this[e];
			delete this[e], this[e] = s;
		}
	}
}, M = x(_$1(Z));
globalThis.customElements && !globalThis.customElements.get("hls-video") && globalThis.customElements.define("hls-video", M);
var H = M, N = /* @__PURE__ */ new Set([
	"style",
	"children",
	"ref",
	"key",
	"suppressContentEditableWarning",
	"suppressHydrationWarning",
	"dangerouslySetInnerHTML"
]), C = {
	className: "class",
	htmlFor: "for"
};
function I(t) {
	return t.toLowerCase();
}
function _(t) {
	if (typeof t == "boolean") return t ? "" : void 0;
	if (typeof t != "function" && !(typeof t == "object" && t !== null)) return t;
}
function D({ react: t, tagName: g, elementClass: e, events: s, displayName: h, defaultProps: T, toAttributeName: m = I, toAttributeValue: L = _ }) {
	const k = Number.parseInt(t.version) >= 19, r = t.forwardRef((o, i) => {
		var d, l;
		const u = t.useRef(null), y = t.useRef(/* @__PURE__ */ new Map()), w = {}, R = {}, v = {}, b = {};
		for (const [n, a] of Object.entries(o)) {
			if (N.has(n)) {
				v[n] = a;
				continue;
			}
			const c = m(C[n] ?? n);
			if (e.prototype && n in e.prototype && !(n in (((d = globalThis.HTMLElement) == null ? void 0 : d.prototype) ?? {})) && !((l = e.observedAttributes) != null && l.some((E) => E === c))) {
				b[n] = a;
				continue;
			}
			if (n.startsWith("on")) {
				w[n] = a;
				continue;
			}
			const p = L(a);
			if (c && p != null && (R[c] = String(p), k || (v[c] = p)), c && k) p !== _(a) ? v[c] = p : v[c] = a;
		}
		if (typeof window < "u") {
			for (const n in w) {
				const a = w[n], c = n.endsWith("Capture"), p = (s?.[n] ?? n.slice(2).toLowerCase()).slice(0, c ? -7 : void 0);
				t.useLayoutEffect(() => {
					const E = u?.current;
					if (!(!E || typeof a != "function")) return E.addEventListener(p, a, c), () => {
						E.removeEventListener(p, a, c);
					};
				}, [u?.current, a]);
			}
			t.useLayoutEffect(() => {
				if (u.current === null) return;
				const n = /* @__PURE__ */ new Map();
				for (const a in b) S(u.current, a, b[a]), y.current.delete(a), n.set(a, b[a]);
				for (const [a, c] of y.current) S(u.current, a, void 0);
				y.current = n;
			});
		}
		if (typeof window > "u" && e?.getTemplateHTML && e?.shadowRootOptions) {
			const { mode: n, delegatesFocus: a } = e.shadowRootOptions;
			v.children = [t.createElement("template", {
				shadowrootmode: n,
				shadowrootdelegatesfocus: a,
				dangerouslySetInnerHTML: { __html: e.getTemplateHTML(R, o) },
				key: "ce-la-react-ssr-template-shadow-root"
			}), v.children];
		}
		return t.createElement(g, {
			...T,
			...v,
			ref: t.useCallback((n) => {
				u.current = n, typeof i == "function" ? i(n) : i !== null && (i.current = n);
			}, [i])
		}, v.children);
	});
	return r.displayName = h ?? e.name, r;
}
function S(t, g, e) {
	var s;
	t[g] = e, e == null && g in (((s = globalThis.HTMLElement) == null ? void 0 : s.prototype) ?? {}) && t.removeAttribute(g);
}
var j = D({
	react: import_react.default,
	tagName: "hls-video",
	elementClass: H,
	toAttributeName(t) {
		return t === "muted" ? "" : t === "defaultMuted" ? "muted" : I(t);
	}
});
//#endregion
export { j as default };

//# sourceMappingURL=react-BmBas5mR-DEq4MWJO.js.map