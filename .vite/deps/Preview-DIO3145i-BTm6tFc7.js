import { r as __toESM, t as require_react } from "./react-BsDccEtb.js";
//#region node_modules/@goat-ui/goat-ui-core/dist/Preview-DIO3145i.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var d = "64px", u = {}, N = ({ src: s, light: t, oEmbedUrl: o, onClickPreview: n, playIcon: g, previewTabIndex: _, previewAriaLabel: p }) => {
	const [f, r] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		!s || !t || !o || b({
			src: s,
			light: t,
			oEmbedUrl: o
		});
	}, [
		s,
		t,
		o
	]);
	const b = async ({ src: e, light: c, oEmbedUrl: x }) => {
		if (import_react.isValidElement(c)) return;
		if (typeof c == "string") {
			r(c);
			return;
		}
		if (u[e]) {
			r(u[e]);
			return;
		}
		r(null);
		const m = await (await fetch(x.replace("{url}", e))).json();
		if (m.thumbnail_url) {
			const h = m.thumbnail_url.replace("height=100", "height=480").replace("-d_295x166", "-d_640");
			r(h), u[e] = h;
		}
	}, I = (e) => {
		(e.key === "Enter" || e.key === " ") && n?.(e);
	}, v = (e) => {
		n?.(e);
	}, l = import_react.isValidElement(t), y = {
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	}, i = {
		preview: {
			width: "100%",
			height: "100%",
			backgroundImage: f && !l ? `url(${f})` : void 0,
			backgroundSize: "cover",
			backgroundPosition: "center",
			cursor: "pointer",
			...y
		},
		shadow: {
			background: "radial-gradient(rgb(0, 0, 0, 0.3), rgba(0, 0, 0, 0) 60%)",
			borderRadius: d,
			width: d,
			height: d,
			position: l ? "absolute" : void 0,
			...y
		},
		playIcon: {
			borderStyle: "solid",
			borderWidth: "16px 0 16px 26px",
			borderColor: "transparent transparent transparent white",
			marginLeft: "7px"
		}
	}, w = /* @__PURE__ */ import_react.createElement("div", {
		style: i.shadow,
		className: "react-player__shadow"
	}, /* @__PURE__ */ import_react.createElement("div", {
		style: i.playIcon,
		className: "react-player__play-icon"
	}));
	return /* @__PURE__ */ import_react.createElement("div", {
		style: i.preview,
		className: "react-player__preview",
		tabIndex: _,
		onClick: v,
		onKeyDown: I,
		...p ? { "aria-label": p } : {}
	}, l ? t : null, g || w);
};
var j = N;
//#endregion
export { j as default };

//# sourceMappingURL=Preview-DIO3145i-BTm6tFc7.js.map