import { r as __toESM, t as require_react } from "./react-BsDccEtb.js";
import { A as He$1, At as VNt, C as Fp, Cr as zNt, F as Ii$1, Ln as qlt, Xt as dn$1, gn as jt$1, pn as ilt, un as he$1 } from "./index-DOQ4xnKK-CQiNtmKJ.js";
import { n as at$1, t as Pi$1 } from "./hls-BhaZGLxI-Bf9KoB1E.js";
import { n as _, t as Z$1 } from "./mixin-Db00K8RL-BcVmQUPt.js";
//#region node_modules/@goat-ui/goat-ui-core/dist/index-D7wcEP1d.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var ks = Object.create, Hi = Object.defineProperty, As = Object.getOwnPropertyDescriptor, ws = Object.getOwnPropertyNames, Rs = Object.getPrototypeOf, Cs = Object.prototype.hasOwnProperty, Fi = function(e, t) {
	return function() {
		return e && (t = e(e = 0)), t;
	};
}, ie = function(e, t) {
	return function() {
		return t || e((t = { exports: {} }).exports, t), t.exports;
	};
}, Ds = function(e, t, a, r) {
	if (t && typeof t == "object" || typeof t == "function") for (var i = ws(t), n = 0, s = i.length, o; n < s; n++) o = i[n], !Cs.call(e, o) && o !== a && Hi(e, o, {
		get: (function(l) {
			return t[l];
		}).bind(null, o),
		enumerable: !(r = As(t, o)) || r.enumerable
	});
	return e;
}, pe = function(e, t, a) {
	return a = e != null ? ks(Rs(e)) : {}, Ds(!e || !e.__esModule ? Hi(a, "default", {
		value: e,
		enumerable: !0
	}) : a, e);
}, De = ie(function(e, t) {
	var a;
	typeof window < "u" ? a = window : typeof global < "u" ? a = global : typeof self < "u" ? a = self : a = {}, t.exports = a;
});
function dt(e, t) {
	return t != null && typeof Symbol < "u" && t[Symbol.hasInstance] ? !!t[Symbol.hasInstance](e) : dt(e, t);
}
var ct = Fi(function() {
	ct();
});
function Yi(e) {
	"@swc/helpers - typeof";
	return e && typeof Symbol < "u" && e.constructor === Symbol ? "symbol" : typeof e;
}
var Vi = Fi(function() {}), ji = ie(function(e, t) {
	var a = Array.prototype.slice;
	t.exports = r;
	function r(i, n) {
		for (("length" in i) || (i = [i]), i = a.call(i); i.length;) {
			var s = i.shift(), o = n(s);
			if (o) return o;
			s.childNodes && s.childNodes.length && (i = a.call(s.childNodes).concat(i));
		}
	}
}), Ss = ie(function(e, t) {
	ct(), t.exports = a;
	function a(r, i) {
		if (!dt(this, a)) return new a(r, i);
		this.data = r, this.nodeValue = r, this.length = r.length, this.ownerDocument = i || null;
	}
	a.prototype.nodeType = 8, a.prototype.nodeName = "#comment", a.prototype.toString = function() {
		return "[object Comment]";
	};
}), Os = ie(function(e, t) {
	ct(), t.exports = a;
	function a(r, i) {
		if (!dt(this, a)) return new a(r);
		this.data = r || "", this.length = this.data.length, this.ownerDocument = i || null;
	}
	a.prototype.type = "DOMTextNode", a.prototype.nodeType = 3, a.prototype.nodeName = "#text", a.prototype.toString = function() {
		return this.data;
	}, a.prototype.replaceData = function(r, i, n) {
		var s = this.data, o = s.substring(0, r), l = s.substring(r + i, s.length);
		this.data = o + n + l, this.length = this.data.length;
	};
}), Gi = ie(function(e, t) {
	t.exports = a;
	function a(r) {
		var i = this, n = r.type;
		r.target || (r.target = i), i.listeners || (i.listeners = {});
		var s = i.listeners[n];
		if (s) return s.forEach(function(o) {
			r.currentTarget = i, typeof o == "function" ? o(r) : o.handleEvent(r);
		});
		i.parentNode && i.parentNode.dispatchEvent(r);
	}
}), zi = ie(function(e, t) {
	t.exports = a;
	function a(r, i) {
		var n = this;
		n.listeners || (n.listeners = {}), n.listeners[r] || (n.listeners[r] = []), n.listeners[r].indexOf(i) === -1 && n.listeners[r].push(i);
	}
}), Zi = ie(function(e, t) {
	t.exports = a;
	function a(r, i) {
		var n = this;
		if (n.listeners && n.listeners[r]) {
			var s = n.listeners[r], o = s.indexOf(i);
			o !== -1 && s.splice(o, 1);
		}
	}
}), Ns = ie(function(e, t) {
	Vi(), t.exports = r;
	var a = [
		"area",
		"base",
		"br",
		"col",
		"embed",
		"hr",
		"img",
		"input",
		"keygen",
		"link",
		"menuitem",
		"meta",
		"param",
		"source",
		"track",
		"wbr"
	];
	function r(c) {
		switch (c.nodeType) {
			case 3: return m(c.data);
			case 8: return "<!--" + c.data + "-->";
			default: return i(c);
		}
	}
	function i(c) {
		var d = [], h = c.tagName;
		return c.namespaceURI === "http://www.w3.org/1999/xhtml" && (h = h.toLowerCase()), d.push("<" + h + u(c) + o(c)), a.indexOf(h) > -1 ? d.push(" />") : (d.push(">"), c.childNodes.length ? d.push.apply(d, c.childNodes.map(r)) : c.textContent || c.innerText ? d.push(m(c.textContent || c.innerText)) : c.innerHTML && d.push(c.innerHTML), d.push("</" + h + ">")), d.join("");
	}
	function n(c, d) {
		var h = Yi(c[d]);
		return d === "style" && Object.keys(c.style).length > 0 ? !0 : c.hasOwnProperty(d) && (h === "string" || h === "boolean" || h === "number") && d !== "nodeName" && d !== "className" && d !== "tagName" && d !== "textContent" && d !== "innerText" && d !== "namespaceURI" && d !== "innerHTML";
	}
	function s(c) {
		if (typeof c == "string") return c;
		var d = "";
		return Object.keys(c).forEach(function(h) {
			var y = c[h];
			h = h.replace(/[A-Z]/g, function(_) {
				return "-" + _.toLowerCase();
			}), d += h + ":" + y + ";";
		}), d;
	}
	function o(c) {
		var d = c.dataset, h = [];
		for (var y in d) h.push({
			name: "data-" + y,
			value: d[y]
		});
		return h.length ? l(h) : "";
	}
	function l(c) {
		var d = [];
		return c.forEach(function(h) {
			var y = h.name, _ = h.value;
			y === "style" && (_ = s(_)), d.push(y + "=\"" + p(_) + "\"");
		}), d.length ? " " + d.join(" ") : "";
	}
	function u(c) {
		var d = [];
		for (var h in c) n(c, h) && d.push({
			name: h,
			value: c[h]
		});
		for (var y in c._attributes) for (var _ in c._attributes[y]) {
			var g = c._attributes[y][_], b = (g.prefix ? g.prefix + ":" : "") + _;
			d.push({
				name: b,
				value: g.value
			});
		}
		return c.className && d.push({
			name: "class",
			value: c.className
		}), d.length ? l(d) : "";
	}
	function m(c) {
		var d = "";
		return typeof c == "string" ? d = c : c && (d = c.toString()), d.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	function p(c) {
		return m(c).replace(/"/g, "&quot;");
	}
}), Xi = ie(function(e, t) {
	ct();
	var a = ji(), r = Gi(), i = zi(), n = Zi(), s = Ns(), o = "http://www.w3.org/1999/xhtml";
	t.exports = l;
	function l(u, m, p) {
		if (!dt(this, l)) return new l(u);
		var c = p === void 0 ? o : p || null;
		this.tagName = c === o ? String(u).toUpperCase() : u, this.nodeName = this.tagName, this.className = "", this.dataset = {}, this.childNodes = [], this.parentNode = null, this.style = {}, this.ownerDocument = m || null, this.namespaceURI = c, this._attributes = {}, this.tagName === "INPUT" && (this.type = "text");
	}
	l.prototype.type = "DOMElement", l.prototype.nodeType = 1, l.prototype.appendChild = function(u) {
		return u.parentNode && u.parentNode.removeChild(u), this.childNodes.push(u), u.parentNode = this, u;
	}, l.prototype.replaceChild = function(u, m) {
		u.parentNode && u.parentNode.removeChild(u);
		var p = this.childNodes.indexOf(m);
		return m.parentNode = null, this.childNodes[p] = u, u.parentNode = this, m;
	}, l.prototype.removeChild = function(u) {
		var m = this.childNodes.indexOf(u);
		return this.childNodes.splice(m, 1), u.parentNode = null, u;
	}, l.prototype.insertBefore = function(u, m) {
		u.parentNode && u.parentNode.removeChild(u);
		var p = m == null ? -1 : this.childNodes.indexOf(m);
		return p > -1 ? this.childNodes.splice(p, 0, u) : this.childNodes.push(u), u.parentNode = this, u;
	}, l.prototype.setAttributeNS = function(u, m, p) {
		var c = null, d = m, h = m.indexOf(":");
		if (h > -1 && (c = m.substr(0, h), d = m.substr(h + 1)), this.tagName === "INPUT" && m === "type") this.type = p;
		else {
			var y = this._attributes[u] || (this._attributes[u] = {});
			y[d] = {
				value: p,
				prefix: c
			};
		}
	}, l.prototype.getAttributeNS = function(u, m) {
		var p = this._attributes[u], c = p && p[m] && p[m].value;
		return this.tagName === "INPUT" && m === "type" ? this.type : typeof c != "string" ? null : c;
	}, l.prototype.removeAttributeNS = function(u, m) {
		var p = this._attributes[u];
		p && delete p[m];
	}, l.prototype.hasAttributeNS = function(u, m) {
		var p = this._attributes[u];
		return !!p && m in p;
	}, l.prototype.setAttribute = function(u, m) {
		return this.setAttributeNS(null, u, m);
	}, l.prototype.getAttribute = function(u) {
		return this.getAttributeNS(null, u);
	}, l.prototype.removeAttribute = function(u) {
		return this.removeAttributeNS(null, u);
	}, l.prototype.hasAttribute = function(u) {
		return this.hasAttributeNS(null, u);
	}, l.prototype.removeEventListener = n, l.prototype.addEventListener = i, l.prototype.dispatchEvent = r, l.prototype.focus = function() {}, l.prototype.toString = function() {
		return s(this);
	}, l.prototype.getElementsByClassName = function(u) {
		var m = u.split(" "), p = [];
		return a(this, function(c) {
			if (c.nodeType === 1) {
				var h = (c.className || "").split(" ");
				m.every(function(y) {
					return h.indexOf(y) !== -1;
				}) && p.push(c);
			}
		}), p;
	}, l.prototype.getElementsByTagName = function(u) {
		u = u.toLowerCase();
		var m = [];
		return a(this.childNodes, function(p) {
			p.nodeType === 1 && (u === "*" || p.tagName.toLowerCase() === u) && m.push(p);
		}), m;
	}, l.prototype.contains = function(u) {
		return a(this, function(m) {
			return u === m;
		}) || !1;
	};
}), xs = ie(function(e, t) {
	ct();
	var a = Xi();
	t.exports = r;
	function r(i) {
		if (!dt(this, r)) return new r();
		this.childNodes = [], this.parentNode = null, this.ownerDocument = i || null;
	}
	r.prototype.type = "DocumentFragment", r.prototype.nodeType = 11, r.prototype.nodeName = "#document-fragment", r.prototype.appendChild = a.prototype.appendChild, r.prototype.replaceChild = a.prototype.replaceChild, r.prototype.removeChild = a.prototype.removeChild, r.prototype.toString = function() {
		return this.childNodes.map(function(i) {
			return String(i);
		}).join("");
	};
}), Is = ie(function(e, t) {
	t.exports = a;
	function a(r) {}
	a.prototype.initEvent = function(r, i, n) {
		this.type = r, this.bubbles = i, this.cancelable = n;
	}, a.prototype.preventDefault = function() {};
}), Ls = ie(function(e, t) {
	ct();
	var a = ji(), r = Ss(), i = Os(), n = Xi(), s = xs(), o = Is(), l = Gi(), u = zi(), m = Zi();
	t.exports = p;
	function p() {
		if (!dt(this, p)) return new p();
		this.head = this.createElement("head"), this.body = this.createElement("body"), this.documentElement = this.createElement("html"), this.documentElement.appendChild(this.head), this.documentElement.appendChild(this.body), this.childNodes = [this.documentElement], this.nodeType = 9;
	}
	var c = p.prototype;
	c.createTextNode = function(d) {
		return new i(d, this);
	}, c.createElementNS = function(d, h) {
		var y = d === null ? null : String(d);
		return new n(h, this, y);
	}, c.createElement = function(d) {
		return new n(d, this);
	}, c.createDocumentFragment = function() {
		return new s(this);
	}, c.createEvent = function(d) {
		return new o(d);
	}, c.createComment = function(d) {
		return new r(d, this);
	}, c.getElementById = function(d) {
		d = String(d);
		return a(this.childNodes, function(y) {
			if (String(y.id) === d) return y;
		}) || null;
	}, c.getElementsByClassName = n.prototype.getElementsByClassName, c.getElementsByTagName = n.prototype.getElementsByTagName, c.contains = n.prototype.contains, c.removeEventListener = m, c.addEventListener = u, c.dispatchEvent = l;
}), Ps = ie(function(e, t) {
	t.exports = new (Ls())();
}), Qi = ie(function(e, t) {
	var a = typeof global < "u" ? global : typeof window < "u" ? window : {}, r = Ps(), i;
	typeof document < "u" ? i = document : (i = a["__GLOBAL_DOCUMENT_CACHE@4"], i || (i = a["__GLOBAL_DOCUMENT_CACHE@4"] = r)), t.exports = i;
});
function Ms(e) {
	if (Array.isArray(e)) return e;
}
function Us(e, t) {
	var a = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (a != null) {
		var r = [], i = !0, n = !1, s, o;
		try {
			for (a = a.call(e); !(i = (s = a.next()).done) && (r.push(s.value), !(t && r.length === t)); i = !0);
		} catch (l) {
			n = !0, o = l;
		} finally {
			try {
				!i && a.return != null && a.return();
			} finally {
				if (n) throw o;
			}
		}
		return r;
	}
}
function $s() {
	throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ir(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var a = 0, r = new Array(t); a < t; a++) r[a] = e[a];
	return r;
}
function Ji(e, t) {
	if (e) {
		if (typeof e == "string") return ir(e, t);
		var a = Object.prototype.toString.call(e).slice(8, -1);
		if (a === "Object" && e.constructor && (a = e.constructor.name), a === "Map" || a === "Set") return Array.from(a);
		if (a === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a)) return ir(e, t);
	}
}
function Ue(e, t) {
	return Ms(e) || Us(e, t) || Ji(e, t) || $s();
}
var Kt = pe(De()), jr = pe(De()), Bs = pe(De()), X = { now: function() {
	var e = Bs.default.performance, t = e && e.timing, a = t && t.navigationStart, r = typeof a == "number" && typeof e.now == "function" ? a + e.now() : Date.now();
	return Math.round(r);
} }, jt = function() {
	var e, t, a;
	if (typeof ((e = jr.default.crypto) === null || e === void 0 ? void 0 : e.getRandomValues) == "function") {
		a = new Uint8Array(32), jr.default.crypto.getRandomValues(a);
		for (var r = 0; r < 32; r++) a[r] = a[r] % 16;
	} else {
		a = [];
		for (var i = 0; i < 32; i++) a[i] = Math.random() * 16 | 0;
	}
	var n = 0;
	t = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(l) {
		var u = l === "x" ? a[n] : a[n] & 3 | 8;
		return n++, u.toString(16);
	});
	var o = X.now()?.toString(16).substring(3);
	return o ? t.substring(0, 28) + o : t;
}, en = function() {
	return ("000000" + (Math.random() * Math.pow(36, 6) << 0).toString(36)).slice(-6);
}, he = function(e) {
	if (e && typeof e.nodeName < "u") return e.muxId || (e.muxId = en()), e.muxId;
	var t;
	try {
		t = document.querySelector(e);
	} catch {}
	return t && !t.muxId && (t.muxId = e), t?.muxId || e;
}, wa = function(e) {
	var t;
	e && typeof e.nodeName < "u" ? (t = e, e = he(t)) : t = document.querySelector(e);
	var a = t && t.nodeName ? t.nodeName.toLowerCase() : "";
	return [
		t,
		e,
		a
	];
};
function qs(e) {
	if (Array.isArray(e)) return ir(e);
}
function Ws(e) {
	if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Hs() {
	throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ve(e) {
	return qs(e) || Ws(e) || Ji(e) || Hs();
}
var nt = {
	TRACE: 0,
	DEBUG: 1,
	INFO: 2,
	WARN: 3,
	ERROR: 4
}, Fs = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3, a, r, i, n, s, o = [console, e], l = (a = console.trace).bind.apply(a, ve(o)), u = (r = console.info).bind.apply(r, ve(o)), m = (i = console.debug).bind.apply(i, ve(o)), p = (n = console.warn).bind.apply(n, ve(o)), c = (s = console.error).bind.apply(s, ve(o)), d = t;
	return {
		trace: function() {
			for (var h = arguments.length, y = new Array(h), _ = 0; _ < h; _++) y[_] = arguments[_];
			if (!(d > nt.TRACE)) return l.apply(void 0, ve(y));
		},
		debug: function() {
			for (var h = arguments.length, y = new Array(h), _ = 0; _ < h; _++) y[_] = arguments[_];
			if (!(d > nt.DEBUG)) return m.apply(void 0, ve(y));
		},
		info: function() {
			for (var h = arguments.length, y = new Array(h), _ = 0; _ < h; _++) y[_] = arguments[_];
			if (!(d > nt.INFO)) return u.apply(void 0, ve(y));
		},
		warn: function() {
			for (var h = arguments.length, y = new Array(h), _ = 0; _ < h; _++) y[_] = arguments[_];
			if (!(d > nt.WARN)) return p.apply(void 0, ve(y));
		},
		error: function() {
			for (var h = arguments.length, y = new Array(h), _ = 0; _ < h; _++) y[_] = arguments[_];
			if (!(d > nt.ERROR)) return c.apply(void 0, ve(y));
		},
		get level() {
			return d;
		},
		set level(h) {
			h !== this.level && (d = h ?? t);
		}
	};
}, B = Fs("[mux]"), Fa = pe(De());
function nr() {
	return (Fa.default.doNotTrack || Fa.default.navigator && Fa.default.navigator.doNotTrack) === "1";
}
function S(e) {
	if (e === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
ct();
function j(e, t) {
	if (!dt(e, t)) throw new TypeError("Cannot call a class as a function");
}
function Ys(e, t) {
	for (var a = 0; a < t.length; a++) {
		var r = t[a];
		r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r);
	}
}
function ge(e, t, a) {
	return t && Ys(e.prototype, t), e;
}
function k(e, t, a) {
	return t in e ? Object.defineProperty(e, t, {
		value: a,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = a, e;
}
function kt(e) {
	return kt = Object.setPrototypeOf ? Object.getPrototypeOf : function(t) {
		return t.__proto__ || Object.getPrototypeOf(t);
	}, kt(e);
}
function Vs(e, t) {
	for (; !Object.prototype.hasOwnProperty.call(e, t) && (e = kt(e), e !== null););
	return e;
}
function ta(e, t, a) {
	return typeof Reflect < "u" && Reflect.get ? ta = Reflect.get : ta = function(r, i, n) {
		var s = Vs(r, i);
		if (s) {
			var o = Object.getOwnPropertyDescriptor(s, i);
			return o.get ? o.get.call(n || r) : o.value;
		}
	}, ta(e, t, a || e);
}
function sr(e, t) {
	return sr = Object.setPrototypeOf || function(a, r) {
		return a.__proto__ = r, a;
	}, sr(e, t);
}
function js(e, t) {
	if (typeof t != "function" && t !== null) throw new TypeError("Super expression must either be null or a function");
	e.prototype = Object.create(t && t.prototype, { constructor: {
		value: e,
		writable: !0,
		configurable: !0
	} }), t && sr(e, t);
}
function Gs(e, t) {
	if (e == null) return {};
	var a = {}, r = Object.keys(e), i, n;
	for (n = 0; n < r.length; n++) i = r[n], !(t.indexOf(i) >= 0) && (a[i] = e[i]);
	return a;
}
function zs(e, t) {
	if (e == null) return {};
	var a = Gs(e, t), r, i;
	if (Object.getOwnPropertySymbols) {
		var n = Object.getOwnPropertySymbols(e);
		for (i = 0; i < n.length; i++) r = n[i], !(t.indexOf(r) >= 0) && Object.prototype.propertyIsEnumerable.call(e, r) && (a[r] = e[r]);
	}
	return a;
}
function Zs() {
	if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham) return !1;
	if (typeof Proxy == "function") return !0;
	try {
		return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})), !0;
	} catch {
		return !1;
	}
}
Vi();
function Xs(e, t) {
	return t && (Yi(t) === "object" || typeof t == "function") ? t : S(e);
}
function Qs(e) {
	var t = Zs();
	return function() {
		var a = kt(e), r;
		if (t) {
			var i = kt(this).constructor;
			r = Reflect.construct(a, arguments, i);
		} else r = a.apply(this, arguments);
		return Xs(this, r);
	};
}
var _e = function(e) {
	return Gt(e)[0];
}, Gt = function(e) {
	if (typeof e != "string" || e === "") return ["localhost"];
	var r = (e.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/) || [])[4], i;
	return r && (i = (r.match(/[^\.]+\.[^\.]+$/) || [])[0]), [r, i];
}, Ya = pe(De()), Ra = {
	exists: function() {
		var e = Ya.default.performance;
		return (e && e.timing) !== void 0;
	},
	domContentLoadedEventEnd: function() {
		var e = Ya.default.performance, t = e && e.timing;
		return t && t.domContentLoadedEventEnd;
	},
	navigationStart: function() {
		var e = Ya.default.performance, t = e && e.timing;
		return t && t.navigationStart;
	}
};
function Z(e, t, a) {
	a = a === void 0 ? 1 : a, e[t] = e[t] || 0, e[t] += a;
}
function Ca(e) {
	for (var t = 1; t < arguments.length; t++) {
		var a = arguments[t] != null ? arguments[t] : {}, r = Object.keys(a);
		typeof Object.getOwnPropertySymbols == "function" && (r = r.concat(Object.getOwnPropertySymbols(a).filter(function(i) {
			return Object.getOwnPropertyDescriptor(a, i).enumerable;
		}))), r.forEach(function(i) {
			k(e, i, a[i]);
		});
	}
	return e;
}
function eo(e, t) {
	var a = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		a.push.apply(a, r);
	}
	return a;
}
function Ar(e, t) {
	return t = t ?? {}, Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : eo(Object(t)).forEach(function(a) {
		Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(t, a));
	}), e;
}
var to = ["x-cdn", "content-type"], tn = [
	"x-request-id",
	"cf-ray",
	"x-amz-cf-id",
	"x-akamai-request-id"
], ao = to.concat(tn);
function wr(e) {
	e = e || "";
	var t = {};
	return e.trim().split(/[\r\n]+/).forEach(function(r) {
		if (r) {
			var i = r.split(": "), n = i.shift();
			n && (ao.indexOf(n.toLowerCase()) >= 0 || n.toLowerCase().indexOf("x-litix-") === 0) && (t[n] = i.join(": "));
		}
	}), t;
}
function Da(e) {
	if (e) {
		var t = tn.find(function(a) {
			return e[a] !== void 0;
		});
		return t ? e[t] : void 0;
	}
}
var ro = function(e) {
	var t = {};
	for (var a in e) {
		var r = e[a];
		if (r["DATA-ID"].search("io.litix.data.") !== -1) {
			var n = r["DATA-ID"].replace("io.litix.data.", "");
			t[n] = r.VALUE;
		}
	}
	return t;
}, an = ro, Qt = function(e) {
	if (!e) return {};
	var t = Ra.navigationStart(), a = e.loading, r = a ? a.start : e.trequest, i = a ? a.first : e.tfirst, n = a ? a.end : e.tload;
	return {
		bytesLoaded: e.total,
		requestStart: Math.round(t + r),
		responseStart: Math.round(t + i),
		responseEnd: Math.round(t + n)
	};
}, wt = function(e) {
	if (!(!e || typeof e.getAllResponseHeaders != "function")) return wr(e.getAllResponseHeaders());
}, io = function(e, t, a) {
	var r = arguments.length > 4 ? arguments[4] : void 0, i = e.log, n = e.utils.secondsToMs, s = function(_) {
		var g = parseInt(r.version), b;
		return g === 1 && _.programDateTime !== null && (b = _.programDateTime), g === 0 && _.pdt !== null && (b = _.pdt), b;
	};
	if (!Ra.exists()) {
		i.warn("performance timing not supported. Not tracking HLS.js.");
		return;
	}
	var o = function(_, g) {
		return e.emit(t, _, g);
	}, l = function(_, g) {
		var b = g.levels, f = g.audioTracks, T = g.url, w = g.stats, D = g.networkDetails, I = g.sessionData, M = {}, K = {};
		b.forEach(function(Q, ue) {
			M[ue] = {
				width: Q.width,
				height: Q.height,
				bitrate: Q.bitrate,
				attrs: Q.attrs
			};
		}), f.forEach(function(Q, ue) {
			K[ue] = {
				name: Q.name,
				language: Q.lang,
				bitrate: Q.bitrate
			};
		});
		var L = Qt(w), N = L.bytesLoaded, ne = L.requestStart, Ee = L.responseStart, Te = L.responseEnd;
		o("requestcompleted", Ar(Ca({}, an(I)), {
			request_event_type: _,
			request_bytes_loaded: N,
			request_start: ne,
			request_response_start: Ee,
			request_response_end: Te,
			request_type: "manifest",
			request_hostname: _e(T),
			request_response_headers: wt(D),
			request_rendition_lists: {
				media: M,
				audio: K,
				video: {}
			}
		}));
	};
	a.on(r.Events.MANIFEST_LOADED, l);
	var u = function(_, g) {
		var b = g.details, f = g.level, T = g.networkDetails, w = g.stats, D = Qt(w), I = D.bytesLoaded, M = D.requestStart, K = D.responseStart, L = D.responseEnd, N = b.fragments[b.fragments.length - 1], ne = s(N) + n(N.duration);
		o("requestcompleted", {
			request_event_type: _,
			request_bytes_loaded: I,
			request_start: M,
			request_response_start: K,
			request_response_end: L,
			request_current_level: f,
			request_type: "manifest",
			request_hostname: _e(b.url),
			request_response_headers: wt(T),
			video_holdback: b.holdBack && n(b.holdBack),
			video_part_holdback: b.partHoldBack && n(b.partHoldBack),
			video_part_target_duration: b.partTarget && n(b.partTarget),
			video_target_duration: b.targetduration && n(b.targetduration),
			video_source_is_live: b.live,
			player_manifest_newest_program_time: isNaN(ne) ? void 0 : ne
		});
	};
	a.on(r.Events.LEVEL_LOADED, u);
	var m = function(_, g) {
		var b = g.details, f = g.networkDetails, T = g.stats, w = Qt(T), D = w.bytesLoaded, I = w.requestStart, M = w.responseStart, K = w.responseEnd;
		o("requestcompleted", {
			request_event_type: _,
			request_bytes_loaded: D,
			request_start: I,
			request_response_start: M,
			request_response_end: K,
			request_type: "manifest",
			request_hostname: _e(b.url),
			request_response_headers: wt(f)
		});
	};
	a.on(r.Events.AUDIO_TRACK_LOADED, m);
	var p = function(_, g) {
		var b = g.stats, f = g.networkDetails, T = g.frag;
		b = b || T.stats;
		var w = Qt(b), D = w.bytesLoaded, I = w.requestStart, M = w.responseStart, K = w.responseEnd, L = f ? wt(f) : void 0, N = {
			request_event_type: _,
			request_bytes_loaded: D,
			request_start: I,
			request_response_start: M,
			request_response_end: K,
			request_hostname: f ? _e(f.responseURL) : void 0,
			request_id: L ? Da(L) : void 0,
			request_response_headers: L,
			request_media_duration: T.duration,
			request_url: f?.responseURL
		};
		T.type === "main" ? (N.request_type = "media", N.request_current_level = T.level, N.request_video_width = (a.levels[T.level] || {}).width, N.request_video_height = (a.levels[T.level] || {}).height, N.request_labeled_bitrate = (a.levels[T.level] || {}).bitrate) : N.request_type = T.type, o("requestcompleted", N);
	};
	a.on(r.Events.FRAG_LOADED, p);
	var c = function(_, g) {
		var b = g.frag, f = b.start;
		o("fragmentchange", {
			currentFragmentPDT: s(b),
			currentFragmentStart: n(f)
		});
	};
	a.on(r.Events.FRAG_CHANGED, c);
	var d = function(_, g) {
		var b = g.type, f = g.details, T = g.response, w = g.fatal, D = g.frag, I = g.networkDetails, M = D?.url || g.url || "", K = I ? wt(I) : void 0;
		if ((f === r.ErrorDetails.MANIFEST_LOAD_ERROR || f === r.ErrorDetails.MANIFEST_LOAD_TIMEOUT || f === r.ErrorDetails.FRAG_LOAD_ERROR || f === r.ErrorDetails.FRAG_LOAD_TIMEOUT || f === r.ErrorDetails.LEVEL_LOAD_ERROR || f === r.ErrorDetails.LEVEL_LOAD_TIMEOUT || f === r.ErrorDetails.AUDIO_TRACK_LOAD_ERROR || f === r.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT || f === r.ErrorDetails.SUBTITLE_LOAD_ERROR || f === r.ErrorDetails.SUBTITLE_LOAD_TIMEOUT || f === r.ErrorDetails.KEY_LOAD_ERROR || f === r.ErrorDetails.KEY_LOAD_TIMEOUT) && o("requestfailed", {
			request_error: f,
			request_url: M,
			request_hostname: _e(M),
			request_id: K ? Da(K) : void 0,
			request_type: f === r.ErrorDetails.FRAG_LOAD_ERROR || f === r.ErrorDetails.FRAG_LOAD_TIMEOUT ? "media" : f === r.ErrorDetails.AUDIO_TRACK_LOAD_ERROR || f === r.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT ? "audio" : f === r.ErrorDetails.SUBTITLE_LOAD_ERROR || f === r.ErrorDetails.SUBTITLE_LOAD_TIMEOUT ? "subtitle" : f === r.ErrorDetails.KEY_LOAD_ERROR || f === r.ErrorDetails.KEY_LOAD_TIMEOUT ? "encryption" : "manifest",
			request_error_code: T?.code,
			request_error_text: T?.text
		}), w) {
			var L;
			o("error", {
				player_error_code: b,
				player_error_message: f,
				player_error_context: "".concat(M ? "url: ".concat(M, `
`) : "") + "".concat(T && (T.code || T.text) ? "response: ".concat(T.code, ", ").concat(T.text, `
`) : "") + "".concat(g.reason ? "failure reason: ".concat(g.reason, `
`) : "") + "".concat(g.level ? "level: ".concat(g.level, `
`) : "") + "".concat(g.parent ? "parent stream controller: ".concat(g.parent, `
`) : "") + "".concat(g.buffer ? "buffer length: ".concat(g.buffer, `
`) : "") + "".concat(g.error ? "error: ".concat(g.error, `
`) : "") + "".concat(g.event ? "event: ".concat(g.event, `
`) : "") + "".concat(g.err ? "error message: ".concat((L = g.err) === null || L === void 0 ? void 0 : L.message, `
`) : "")
			});
		}
	};
	a.on(r.Events.ERROR, d);
	var h = function(_, g) {
		var b = g.frag, f = b && b._url || "";
		o("requestcanceled", {
			request_event_type: _,
			request_url: f,
			request_type: "media",
			request_hostname: _e(f)
		});
	};
	a.on(r.Events.FRAG_LOAD_EMERGENCY_ABORTED, h);
	var y = function(_, g) {
		var b = g.level, f = a.levels[b];
		if (f && f.attrs && f.attrs.BANDWIDTH) {
			var T = f.attrs.BANDWIDTH, w, D = parseFloat(f.attrs["FRAME-RATE"]);
			isNaN(D) || (w = D), T ? o("renditionchange", {
				video_source_fps: w,
				video_source_bitrate: T,
				video_source_width: f.width,
				video_source_height: f.height,
				video_source_rendition_name: f.name,
				video_source_codec: f?.videoCodec
			}) : i.warn("missing BANDWIDTH from HLS manifest parsed by HLS.js");
		}
	};
	a.on(r.Events.LEVEL_SWITCHED, y), a._stopMuxMonitor = function() {
		a.off(r.Events.MANIFEST_LOADED, l), a.off(r.Events.LEVEL_LOADED, u), a.off(r.Events.AUDIO_TRACK_LOADED, m), a.off(r.Events.FRAG_LOADED, p), a.off(r.Events.FRAG_CHANGED, c), a.off(r.Events.ERROR, d), a.off(r.Events.FRAG_LOAD_EMERGENCY_ABORTED, h), a.off(r.Events.LEVEL_SWITCHED, y), a.off(r.Events.DESTROYING, a._stopMuxMonitor), delete a._stopMuxMonitor;
	}, a.on(r.Events.DESTROYING, a._stopMuxMonitor);
}, no = function(e) {
	e && typeof e._stopMuxMonitor == "function" && e._stopMuxMonitor();
}, Gr = function(e, t) {
	if (!e || !e.requestEndDate) return {};
	var a = _e(e.url), r = e.url, i = e.bytesLoaded, n = new Date(e.requestStartDate).getTime(), s = new Date(e.firstByteDate).getTime(), o = new Date(e.requestEndDate).getTime(), l = isNaN(e.duration) ? 0 : e.duration, u = typeof t.getMetricsFor == "function" ? t.getMetricsFor(e.mediaType).HttpList : t.getDashMetrics().getHttpRequests(e.mediaType), m;
	u.length > 0 && (m = wr(u[u.length - 1]._responseHeaders || ""));
	var p = m ? Da(m) : void 0;
	return {
		requestStart: n,
		requestResponseStart: s,
		requestResponseEnd: o,
		requestBytesLoaded: i,
		requestResponseHeaders: m,
		requestMediaDuration: l,
		requestHostname: a,
		requestUrl: r,
		requestId: p
	};
}, so = function(e, t) {
	if (typeof t.getCurrentRepresentationForType == "function") {
		var a = t.getCurrentRepresentationForType(e);
		return a ? {
			currentLevel: a.absoluteIndex,
			renditionWidth: a.width || null,
			renditionHeight: a.height || null,
			renditionBitrate: a.bandwidth
		} : {};
	}
	var r = t.getQualityFor(e), i = t.getCurrentTrackFor(e).bitrateList;
	return i ? {
		currentLevel: r,
		renditionWidth: i[r].width || null,
		renditionHeight: i[r].height || null,
		renditionBitrate: i[r].bandwidth
	} : {};
}, oo = function(e) {
	var t;
	return (t = e.match(/.*codecs\*?="(.*)"/)) === null || t === void 0 ? void 0 : t[1];
}, lo = function(e) {
	try {
		var t, a;
		return (a = e.getVersion) === null || a === void 0 || (t = a.call(e)) === null || t === void 0 ? void 0 : t.split(".").map(function(i) {
			return parseInt(i);
		})[0];
	} catch {
		return !1;
	}
}, uo = function(e, t, a) {
	var r = e.log;
	if (!a || !a.on) {
		r.warn("Invalid dash.js player reference. Monitoring blocked.");
		return;
	}
	var i = lo(a), n = function(b, f) {
		return e.emit(t, b, f);
	}, s = function(b) {
		var f = b.type, w = (b.data || {}).url;
		n("requestcompleted", {
			request_event_type: f,
			request_start: 0,
			request_response_start: 0,
			request_response_end: 0,
			request_bytes_loaded: -1,
			request_type: "manifest",
			request_hostname: _e(w),
			request_url: w
		});
	};
	a.on("manifestLoaded", s);
	var o = {}, l = function(b) {
		if (typeof b.getRequests != "function") return null;
		var f = b.getRequests({ state: "executed" });
		return f.length === 0 ? null : f[f.length - 1];
	}, u = function(b) {
		var f = b.type, T = b.fragmentModel, w = b.chunk;
		m({
			type: f,
			request: l(T),
			chunk: w
		});
	}, m = function(b) {
		var f = b.type, T = b.chunk, w = b.request, I = (T || {}).mediaInfo || {}, M = I.type, K = I.bitrateList;
		K = K || [];
		var L = {};
		K.forEach(function(ke, te) {
			L[te] = {}, L[te].width = ke.width, L[te].height = ke.height, L[te].bitrate = ke.bandwidth, L[te].attrs = {};
		}), M === "video" ? o.video = L : M === "audio" ? o.audio = L : o.media = L;
		var N = Gr(w, a), ne = N.requestStart, Ee = N.requestResponseStart, Te = N.requestResponseEnd, Q = N.requestResponseHeaders, ue = N.requestMediaDuration, Be = N.requestHostname, Ke = N.requestUrl, qe = N.requestId;
		n("requestcompleted", {
			request_event_type: f,
			request_start: ne,
			request_response_start: Ee,
			request_response_end: Te,
			request_bytes_loaded: -1,
			request_type: M + "_init",
			request_response_headers: Q,
			request_hostname: Be,
			request_id: qe,
			request_url: Ke,
			request_media_duration: ue,
			request_rendition_lists: o
		});
	};
	i >= 4 ? a.on("initFragmentLoaded", m) : a.on("initFragmentLoaded", u);
	var p = function(b) {
		var f = b.type, T = b.fragmentModel, w = b.chunk;
		c({
			type: f,
			request: l(T),
			chunk: w
		});
	}, c = function(b) {
		var f = b.type, T = b.chunk, w = b.request, D = T || {}, I = D.mediaInfo, M = D.start, L = (I || {}).type, N = Gr(w, a), ne = N.requestStart, Ee = N.requestResponseStart, Te = N.requestResponseEnd, Q = N.requestBytesLoaded, ue = N.requestResponseHeaders, Be = N.requestMediaDuration, Ke = N.requestHostname, qe = N.requestUrl, ke = N.requestId, te = so(L, a), se = te.currentLevel, de = te.renditionWidth, Wa = te.renditionHeight, hs = te.renditionBitrate;
		n("requestcompleted", {
			request_event_type: f,
			request_start: ne,
			request_response_start: Ee,
			request_response_end: Te,
			request_bytes_loaded: Q,
			request_type: L,
			request_response_headers: ue,
			request_hostname: Ke,
			request_id: ke,
			request_url: qe,
			request_media_start_time: M,
			request_media_duration: Be,
			request_current_level: se,
			request_labeled_bitrate: hs,
			request_video_width: de,
			request_video_height: Wa
		});
	};
	i >= 4 ? a.on("mediaFragmentLoaded", c) : a.on("mediaFragmentLoaded", p);
	var d = {
		video: void 0,
		audio: void 0,
		totalBitrate: void 0
	}, h = function() {
		if (d.video && typeof d.video.bitrate == "number") {
			if (!(d.video.width && d.video.height)) {
				r.warn("have bitrate info for video but missing width/height");
				return;
			}
			var b = d.video.bitrate;
			if (d.audio && typeof d.audio.bitrate == "number" && (b += d.audio.bitrate), b !== d.totalBitrate) return d.totalBitrate = b, {
				video_source_bitrate: b,
				video_source_height: d.video.height,
				video_source_width: d.video.width,
				video_source_codec: oo(d.video.codec)
			};
		}
	}, y = function(b, f, T) {
		var w = b.mediaType;
		if (w === "audio" || w === "video") {
			var D;
			if (typeof a.getRepresentationsByType == "function") if (b.newRepresentation) D = {
				bitrate: b.newRepresentation.bandwidth,
				width: b.newRepresentation.width,
				height: b.newRepresentation.height,
				qualityIndex: b.newRepresentation.absoluteIndex
			};
			else {
				var I = a.getRepresentationsByType(w);
				if (I && typeof b.newQuality == "number") {
					var M = I.find(function(L) {
						return L.absoluteIndex === b.newQuality || L.index === b.newQuality;
					});
					M && (D = {
						bitrate: M.bandwidth,
						width: M.width,
						height: M.height,
						qualityIndex: b.newQuality
					});
				}
			}
			else {
				if (typeof b.newQuality != "number") {
					r.warn("missing evt.newQuality in qualityChangeRendered event", b);
					return;
				}
				D = a.getBitrateInfoListFor(w).find(function(L) {
					return L.qualityIndex === b.newQuality;
				});
			}
			if (!(D && typeof D.bitrate == "number")) {
				r.warn("missing bitrate info for ".concat(w));
				return;
			}
			d[w] = Ar(Ca({}, D), { codec: a.getCurrentTrackFor(w).codec });
			var K = h();
			K && n("renditionchange", K);
		}
	};
	a.on("qualityChangeRendered", y);
	var _ = function(b) {
		var f = b.request, T = b.mediaType;
		f = f || {}, n("requestcanceled", {
			request_event_type: f.type + "_" + f.action,
			request_url: f.url,
			request_type: T,
			request_hostname: _e(f.url)
		});
	};
	a.on("fragmentLoadingAbandoned", _);
	var g = function(b) {
		var f = b.error, T, w, D = (f == null || (T = f.data) === null || T === void 0 ? void 0 : T.request) || {}, I = (f == null || (w = f.data) === null || w === void 0 ? void 0 : w.response) || {};
		f?.code === 27 && n("requestfailed", {
			request_error: D.type + "_" + D.action,
			request_url: D.url,
			request_hostname: _e(D.url),
			request_type: D.mediaType,
			request_error_code: I.status,
			request_error_text: I.statusText
		});
		var M = "".concat(D != null && D.url ? "url: ".concat(D.url, `
`) : "") + "".concat(I != null && I.status || I != null && I.statusText ? "response: ".concat(I?.status, ", ").concat(I?.statusText, `
`) : "");
		n("error", {
			player_error_code: f?.code,
			player_error_message: f?.message,
			player_error_context: M
		});
	};
	a.on("error", g), a._stopMuxMonitor = function() {
		a.off("manifestLoaded", s), a.off("initFragmentLoaded", m), a.off("mediaFragmentLoaded", c), a.off("qualityChangeRendered", y), a.off("error", g), a.off("fragmentLoadingAbandoned", _), delete a._stopMuxMonitor;
	};
}, co = function(e) {
	e && typeof e._stopMuxMonitor == "function" && e._stopMuxMonitor();
}, zr = 0, po = (function() {
	function e() {
		j(this, e), k(this, "_listeners", void 0);
	}
	return ge(e, [
		{
			key: "on",
			value: function(t, a, r) {
				return a._eventEmitterGuid = a._eventEmitterGuid || ++zr, this._listeners = this._listeners || {}, this._listeners[t] = this._listeners[t] || [], r && (a = a.bind(r)), this._listeners[t].push(a), a;
			}
		},
		{
			key: "off",
			value: function(t, a) {
				var r = this._listeners && this._listeners[t];
				r && r.forEach(function(i, n) {
					i._eventEmitterGuid === a._eventEmitterGuid && r.splice(n, 1);
				});
			}
		},
		{
			key: "one",
			value: function(t, a, r) {
				var i = this;
				a._eventEmitterGuid = a._eventEmitterGuid || ++zr;
				var n = function() {
					i.off(t, n), a.apply(r || this, arguments);
				};
				n._eventEmitterGuid = a._eventEmitterGuid, this.on(t, n);
			}
		},
		{
			key: "emit",
			value: function(t, a) {
				var r = this;
				if (this._listeners) {
					a = a || {};
					var i = this._listeners["before" + t] || [], n = this._listeners["before*"] || [], s = this._listeners[t] || [], o = this._listeners["after" + t] || [], l = function(u, m) {
						u = u.slice(), u.forEach(function(p) {
							p.call(r, { type: t }, m);
						});
					};
					l(i, a), l(n, a), l(s, a), l(o, a);
				}
			}
		}
	]), e;
})(), Va = pe(De()), vo = (function() {
	function e(t) {
		var a = this;
		j(this, e), k(this, "_playbackHeartbeatInterval", void 0), k(this, "_playheadShouldBeProgressing", void 0), k(this, "pm", void 0), this.pm = t, this._playbackHeartbeatInterval = null, this._playheadShouldBeProgressing = !1, t.on("playing", function() {
			a._playheadShouldBeProgressing = !0;
		}), t.on("play", this._startPlaybackHeartbeatInterval.bind(this)), t.on("playing", this._startPlaybackHeartbeatInterval.bind(this)), t.on("adbreakstart", this._startPlaybackHeartbeatInterval.bind(this)), t.on("adplay", this._startPlaybackHeartbeatInterval.bind(this)), t.on("adplaying", this._startPlaybackHeartbeatInterval.bind(this)), t.on("devicewake", this._startPlaybackHeartbeatInterval.bind(this)), t.on("viewstart", this._startPlaybackHeartbeatInterval.bind(this)), t.on("rebufferstart", this._startPlaybackHeartbeatInterval.bind(this)), t.on("pause", this._stopPlaybackHeartbeatInterval.bind(this)), t.on("ended", this._stopPlaybackHeartbeatInterval.bind(this)), t.on("viewend", this._stopPlaybackHeartbeatInterval.bind(this)), t.on("error", this._stopPlaybackHeartbeatInterval.bind(this)), t.on("aderror", this._stopPlaybackHeartbeatInterval.bind(this)), t.on("adpause", this._stopPlaybackHeartbeatInterval.bind(this)), t.on("adended", this._stopPlaybackHeartbeatInterval.bind(this)), t.on("adbreakend", this._stopPlaybackHeartbeatInterval.bind(this)), t.on("seeked", function() {
			t.data.player_is_paused ? a._stopPlaybackHeartbeatInterval() : a._startPlaybackHeartbeatInterval();
		}), t.on("timeupdate", function() {
			a._playbackHeartbeatInterval !== null && t.emit("playbackheartbeat");
		}), t.on("devicesleep", function(r, i) {
			a._playbackHeartbeatInterval !== null && (Va.default.clearInterval(a._playbackHeartbeatInterval), t.emit("playbackheartbeatend", { viewer_time: i.viewer_time }), a._playbackHeartbeatInterval = null);
		});
	}
	return ge(e, [{
		key: "_startPlaybackHeartbeatInterval",
		value: function() {
			var t = this;
			this._playbackHeartbeatInterval === null && (this.pm.emit("playbackheartbeat"), this._playbackHeartbeatInterval = Va.default.setInterval(function() {
				t.pm.emit("playbackheartbeat");
			}, this.pm.playbackHeartbeatTime));
		}
	}, {
		key: "_stopPlaybackHeartbeatInterval",
		value: function() {
			this._playheadShouldBeProgressing = !1, this._playbackHeartbeatInterval !== null && (Va.default.clearInterval(this._playbackHeartbeatInterval), this.pm.emit("playbackheartbeatend"), this._playbackHeartbeatInterval = null);
		}
	}]), e;
})(), bo = function e(t) {
	var a = this;
	j(this, e), k(this, "viewErrored", void 0), t.on("viewinit", function() {
		a.viewErrored = !1;
	}), t.on("error", function(r, i) {
		try {
			var n = t.errorTranslator({
				player_error_code: i.player_error_code,
				player_error_message: i.player_error_message,
				player_error_context: i.player_error_context,
				player_error_severity: i.player_error_severity,
				player_error_business_exception: i.player_error_business_exception
			});
			n && (t.data.player_error_code = n.player_error_code || i.player_error_code, t.data.player_error_message = n.player_error_message || i.player_error_message, t.data.player_error_context = n.player_error_context || i.player_error_context, t.data.player_error_severity = n.player_error_severity || i.player_error_severity, t.data.player_error_business_exception = n.player_error_business_exception || i.player_error_business_exception, a.viewErrored = !0);
		} catch (s) {
			t.mux.log.warn("Exception in error translator callback.", s), a.viewErrored = !0;
		}
	}), t.on("aftererror", function() {
		var r, i, n, s, o;
		(r = t.data) === null || r === void 0 || delete r.player_error_code, (i = t.data) === null || i === void 0 || delete i.player_error_message, (n = t.data) === null || n === void 0 || delete n.player_error_context, (s = t.data) === null || s === void 0 || delete s.player_error_severity, (o = t.data) === null || o === void 0 || delete o.player_error_business_exception;
	});
}, yo = (function() {
	function e(t) {
		j(this, e), k(this, "_watchTimeTrackerLastCheckedTime", void 0), k(this, "pm", void 0), this.pm = t, this._watchTimeTrackerLastCheckedTime = null, t.on("playbackheartbeat", this._updateWatchTime.bind(this)), t.on("playbackheartbeatend", this._clearWatchTimeState.bind(this));
	}
	return ge(e, [{
		key: "_updateWatchTime",
		value: function(t, a) {
			var r = a.viewer_time;
			this._watchTimeTrackerLastCheckedTime === null && (this._watchTimeTrackerLastCheckedTime = r), Z(this.pm.data, "view_watch_time", r - this._watchTimeTrackerLastCheckedTime), this._watchTimeTrackerLastCheckedTime = r;
		}
	}, {
		key: "_clearWatchTimeState",
		value: function(t, a) {
			this._updateWatchTime(t, a), this._watchTimeTrackerLastCheckedTime = null;
		}
	}]), e;
})(), Eo = (function() {
	function e(t) {
		var a = this;
		j(this, e), k(this, "_playbackTimeTrackerLastPlayheadPosition", void 0), k(this, "_lastTime", void 0), k(this, "_isAdPlaying", void 0), k(this, "_callbackUpdatePlaybackTime", void 0), k(this, "pm", void 0), this.pm = t, this._playbackTimeTrackerLastPlayheadPosition = -1, this._lastTime = X.now(), this._isAdPlaying = !1, this._callbackUpdatePlaybackTime = null, t.on("viewinit", function() {
			a.pm.data.view_playing_time_ms_cumulative = 0;
		});
		var r = this._startPlaybackTimeTracking.bind(this);
		t.on("playing", r), t.on("adplaying", r);
		var i = function() {
			a.pm.data.player_is_paused || r();
		};
		t.on("seeked", i), t.on("rebufferend", i);
		var n = this._stopPlaybackTimeTracking.bind(this);
		t.on("playbackheartbeatend", n), t.on("seeking", n), t.on("rebufferstart", n), t.on("adplaying", function() {
			a._isAdPlaying = !0;
		}), t.on("adended", function() {
			a._isAdPlaying = !1;
		}), t.on("adpause", function() {
			a._isAdPlaying = !1;
		}), t.on("adbreakstart", function() {
			a._isAdPlaying = !1;
		}), t.on("adbreakend", function() {
			a._isAdPlaying = !1;
		}), t.on("adplay", function() {
			a._isAdPlaying = !1;
		}), t.on("viewinit", function() {
			a._playbackTimeTrackerLastPlayheadPosition = -1, a._lastTime = X.now(), a._isAdPlaying = !1, a._callbackUpdatePlaybackTime = null;
		});
	}
	return ge(e, [
		{
			key: "_startPlaybackTimeTracking",
			value: function() {
				this._callbackUpdatePlaybackTime === null && (this._callbackUpdatePlaybackTime = this._updatePlaybackTime.bind(this), this._playbackTimeTrackerLastPlayheadPosition = this.pm.data.player_playhead_time, this._lastTime = X.now(), this.pm.on("playbackheartbeat", this._callbackUpdatePlaybackTime));
			}
		},
		{
			key: "_stopPlaybackTimeTracking",
			value: function() {
				this._callbackUpdatePlaybackTime && (this._updatePlaybackTime(), this.pm.off("playbackheartbeat", this._callbackUpdatePlaybackTime), this._callbackUpdatePlaybackTime = null, this._playbackTimeTrackerLastPlayheadPosition = -1);
			}
		},
		{
			key: "_updatePlaybackTime",
			value: function() {
				var t = this.pm.data.player_playhead_time || 0, a = X.now(), r = a - this._lastTime, i = -1;
				this._playbackTimeTrackerLastPlayheadPosition >= 0 && t > this._playbackTimeTrackerLastPlayheadPosition ? i = t - this._playbackTimeTrackerLastPlayheadPosition : this._isAdPlaying && (i = r), i > 0 && i <= 1e3 && Z(this.pm.data, "view_content_playback_time", i), this._callbackUpdatePlaybackTime !== null && r > 0 && r <= 1e3 && (this._isAdPlaying && Z(this.pm.data, "ad_playing_time_ms_cumulative", r), Z(this.pm.data, "view_playing_time_ms_cumulative", r)), this._playbackTimeTrackerLastPlayheadPosition = t, this._lastTime = a;
			}
		}
	]), e;
})(), ko = (function() {
	function e(t) {
		j(this, e), k(this, "pm", void 0), this.pm = t;
		var a = this._updatePlayheadTime.bind(this);
		t.on("playbackheartbeat", a), t.on("playbackheartbeatend", a), t.on("timeupdate", a), t.on("destroy", function() {
			t.off("timeupdate", a);
		});
	}
	return ge(e, [{
		key: "_updateMaxPlayheadPosition",
		value: function() {
			this.pm.data.view_max_playhead_position = typeof this.pm.data.view_max_playhead_position > "u" ? this.pm.data.player_playhead_time : Math.max(this.pm.data.view_max_playhead_position, this.pm.data.player_playhead_time);
		}
	}, {
		key: "_updatePlayheadTime",
		value: function(t, a) {
			var r = this, i = function() {
				r.pm.currentFragmentPDT && r.pm.currentFragmentStart && (r.pm.data.player_program_time = r.pm.currentFragmentPDT + r.pm.data.player_playhead_time - r.pm.currentFragmentStart);
			};
			if (a && a.player_playhead_time) this.pm.data.player_playhead_time = a.player_playhead_time, i(), this._updateMaxPlayheadPosition();
			else if (this.pm.getPlayheadTime) {
				var n = this.pm.getPlayheadTime();
				typeof n < "u" && (this.pm.data.player_playhead_time = n, i(), this._updateMaxPlayheadPosition());
			}
		}
	}]), e;
})(), Zr = 300 * 1e3, wo = function e(t) {
	if (j(this, e), !t.disableRebufferTracking) {
		var a, r = function(n, s) {
			i(s), a = void 0;
		}, i = function(n) {
			if (a) {
				var s = n.viewer_time - a;
				Z(t.data, "view_rebuffer_duration", s), a = n.viewer_time, t.data.view_rebuffer_duration > Zr && (t.emit("viewend"), t.send("viewend"), t.mux.log.warn("Ending view after rebuffering for longer than ".concat(Zr, "ms, future events will be ignored unless a programchange or videochange occurs.")));
			}
			t.data.view_watch_time >= 0 && t.data.view_rebuffer_count > 0 && (t.data.view_rebuffer_frequency = t.data.view_rebuffer_count / t.data.view_watch_time, t.data.view_rebuffer_percentage = t.data.view_rebuffer_duration / t.data.view_watch_time);
		};
		t.on("playbackheartbeat", function(n, s) {
			return i(s);
		}), t.on("rebufferstart", function(n, s) {
			a || (Z(t.data, "view_rebuffer_count", 1), a = s.viewer_time, t.one("rebufferend", r));
		}), t.on("viewinit", function() {
			a = void 0, t.off("rebufferend", r);
		});
	}
}, Co = (function() {
	function e(t) {
		var a = this;
		j(this, e), k(this, "_lastCheckedTime", void 0), k(this, "_lastPlayheadTime", void 0), k(this, "_lastPlayheadTimeUpdatedTime", void 0), k(this, "_rebuffering", void 0), k(this, "pm", void 0), this.pm = t, !(t.disableRebufferTracking || t.disablePlayheadRebufferTracking) && (this._lastCheckedTime = null, this._lastPlayheadTime = null, this._lastPlayheadTimeUpdatedTime = null, t.on("playbackheartbeat", this._checkIfRebuffering.bind(this)), t.on("playbackheartbeatend", this._cleanupRebufferTracker.bind(this)), t.on("seeking", function() {
			a._cleanupRebufferTracker(null, { viewer_time: X.now() });
		}));
	}
	return ge(e, [
		{
			key: "_checkIfRebuffering",
			value: function(t, a) {
				if (this.pm.seekingTracker.isSeeking || this.pm.adTracker.isAdBreak || !this.pm.playbackHeartbeat._playheadShouldBeProgressing) {
					this._cleanupRebufferTracker(t, a);
					return;
				}
				if (this._lastCheckedTime === null) {
					this._prepareRebufferTrackerState(a.viewer_time);
					return;
				}
				if (this._lastPlayheadTime !== this.pm.data.player_playhead_time) {
					this._cleanupRebufferTracker(t, a, !0);
					return;
				}
				var r = a.viewer_time - this._lastPlayheadTimeUpdatedTime;
				typeof this.pm.sustainedRebufferThreshold == "number" && r >= this.pm.sustainedRebufferThreshold && (this._rebuffering || (this._rebuffering = !0, this.pm.emit("rebufferstart", { viewer_time: this._lastPlayheadTimeUpdatedTime }))), this._lastCheckedTime = a.viewer_time;
			}
		},
		{
			key: "_clearRebufferTrackerState",
			value: function() {
				this._lastCheckedTime = null, this._lastPlayheadTime = null, this._lastPlayheadTimeUpdatedTime = null;
			}
		},
		{
			key: "_prepareRebufferTrackerState",
			value: function(t) {
				this._lastCheckedTime = t, this._lastPlayheadTime = this.pm.data.player_playhead_time, this._lastPlayheadTimeUpdatedTime = t;
			}
		},
		{
			key: "_cleanupRebufferTracker",
			value: function(t, a) {
				var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
				if (this._rebuffering) this._rebuffering = !1, this.pm.emit("rebufferend", { viewer_time: a.viewer_time });
				else {
					if (this._lastCheckedTime === null) return;
					var i = this.pm.data.player_playhead_time - this._lastPlayheadTime, n = a.viewer_time - this._lastPlayheadTimeUpdatedTime;
					typeof this.pm.minimumRebufferDuration == "number" && i > 0 && n - i > this.pm.minimumRebufferDuration && (this._lastCheckedTime = null, this.pm.emit("rebufferstart", { viewer_time: this._lastPlayheadTimeUpdatedTime }), this.pm.emit("rebufferend", { viewer_time: this._lastPlayheadTimeUpdatedTime + n - i }));
				}
				r ? this._prepareRebufferTrackerState(a.viewer_time) : this._clearRebufferTrackerState();
			}
		}
	]), e;
})(), So = (function() {
	function e(t) {
		var a = this;
		j(this, e), k(this, "pm", void 0), this.pm = t, t.on("viewinit", function() {
			var r = t.data, i = r.view_id;
			if (!r.view_program_changed) {
				var n = function(s, o) {
					var l = o.viewer_time;
					(s.type === "playing" && typeof t.data.view_time_to_first_frame > "u" || s.type === "adplaying" && (typeof t.data.view_time_to_first_frame > "u" || a._inPrerollPosition())) && a.calculateTimeToFirstFrame(l || X.now(), i);
				};
				t.one("playing", n), t.one("adplaying", n), t.one("viewend", function() {
					t.off("playing", n), t.off("adplaying", n);
				});
			}
		});
	}
	return ge(e, [{
		key: "_inPrerollPosition",
		value: function() {
			return typeof this.pm.data.view_content_playback_time > "u" || this.pm.data.view_content_playback_time <= 1e3;
		}
	}, {
		key: "calculateTimeToFirstFrame",
		value: function(t, a) {
			a === this.pm.data.view_id && (this.pm.watchTimeTracker._updateWatchTime(null, { viewer_time: t }), this.pm.data.view_time_to_first_frame = this.pm.data.view_watch_time, (this.pm.data.player_autoplay_on || this.pm.data.video_is_autoplay) && this.pm.pageLoadInitTime && (this.pm.data.view_aggregate_startup_time = this.pm.data.view_start + this.pm.data.view_watch_time - this.pm.pageLoadInitTime));
		}
	}]), e;
})(), No = function e(t) {
	var a = this;
	j(this, e), k(this, "_lastPlayerHeight", void 0), k(this, "_lastPlayerWidth", void 0), k(this, "_lastPlayheadPosition", void 0), k(this, "_lastSourceHeight", void 0), k(this, "_lastSourceWidth", void 0), t.on("viewinit", function() {
		a._lastPlayheadPosition = -1;
	});
	[
		"pause",
		"rebufferstart",
		"seeking",
		"error",
		"adbreakstart",
		"hb",
		"renditionchange",
		"orientationchange",
		"viewend",
		"playbackmodechange"
	].forEach(function(n) {
		t.on(n, function() {
			if (a._lastPlayheadPosition >= 0 && t.data.player_playhead_time >= 0 && a._lastPlayerWidth >= 0 && a._lastSourceWidth > 0 && a._lastPlayerHeight >= 0 && a._lastSourceHeight > 0) {
				var s = t.data.player_playhead_time - a._lastPlayheadPosition;
				if (s < 0) {
					a._lastPlayheadPosition = -1;
					return;
				}
				var o = Math.min(a._lastPlayerWidth / a._lastSourceWidth, a._lastPlayerHeight / a._lastSourceHeight), l = Math.max(0, o - 1), u = Math.max(0, 1 - o);
				t.data.view_max_upscale_percentage = Math.max(t.data.view_max_upscale_percentage || 0, l), t.data.view_max_downscale_percentage = Math.max(t.data.view_max_downscale_percentage || 0, u), Z(t.data, "view_total_content_playback_time", s), Z(t.data, "view_total_upscaling", l * s), Z(t.data, "view_total_downscaling", u * s);
			}
			a._lastPlayheadPosition = -1;
		});
	}), [
		"playing",
		"hb",
		"renditionchange",
		"orientationchange",
		"playbackmodechange"
	].forEach(function(n) {
		t.on(n, function() {
			a._lastPlayheadPosition = t.data.player_playhead_time, a._lastPlayerWidth = t.data.player_width, a._lastPlayerHeight = t.data.player_height, a._lastSourceWidth = t.data.video_source_width, a._lastSourceHeight = t.data.video_source_height;
		});
	});
}, xo = 2e3, Lo = function e(t) {
	var a = this;
	j(this, e), k(this, "isSeeking", void 0), this.isSeeking = !1;
	var r = -1, i = function() {
		var n = X.now(), s = (t.data.viewer_time || n) - (r || n);
		Z(t.data, "view_seek_duration", s), t.data.view_max_seek_time = Math.max(t.data.view_max_seek_time || 0, s), a.isSeeking = !1, r = -1;
	};
	t.on("seeking", function(n, s) {
		if (Object.assign(t.data, s), a.isSeeking && s.viewer_time - r <= xo) {
			r = s.viewer_time;
			return;
		}
		a.isSeeking && i(), a.isSeeking = !0, r = s.viewer_time, Z(t.data, "view_seek_count", 1), t.send("seeking");
	}), t.on("seeked", function() {
		i();
	}), t.on("viewend", function() {
		a.isSeeking && (i(), t.send("seeked")), a.isSeeking = !1, r = -1;
	});
}, Xr = function(e, t) {
	e.push(t), e.sort(function(a, r) {
		return a.viewer_time - r.viewer_time;
	});
}, Po = [
	"adbreakstart",
	"adrequest",
	"adresponse",
	"adplay",
	"adplaying",
	"adpause",
	"adended",
	"adbreakend",
	"aderror",
	"adclicked",
	"adskipped"
], Uo = (function() {
	function e(t) {
		var a = this;
		j(this, e), k(this, "_adHasPlayed", void 0), k(this, "_adRequests", void 0), k(this, "_adResponses", void 0), k(this, "_currentAdRequestNumber", void 0), k(this, "_currentAdResponseNumber", void 0), k(this, "_prerollPlayTime", void 0), k(this, "_wouldBeNewAdPlay", void 0), k(this, "isAdBreak", void 0), k(this, "pm", void 0), this.pm = t, t.on("viewinit", function() {
			a.isAdBreak = !1, a._currentAdRequestNumber = 0, a._currentAdResponseNumber = 0, a._adRequests = [], a._adResponses = [], a._adHasPlayed = !1, a._wouldBeNewAdPlay = !0, a._prerollPlayTime = void 0;
		}), Po.forEach(function(i) {
			return t.on(i, a._updateAdData.bind(a));
		});
		var r = function() {
			a.isAdBreak = !1;
		};
		t.on("adbreakstart", function() {
			a.isAdBreak = !0;
		}), t.on("play", r), t.on("playing", r), t.on("viewend", r), t.on("adrequest", function(i, n) {
			n = Object.assign({ ad_request_id: "generatedAdRequestId" + a._currentAdRequestNumber++ }, n), Xr(a._adRequests, n), Z(t.data, "view_ad_request_count"), a.inPrerollPosition() && (t.data.view_preroll_requested = !0, a._adHasPlayed || Z(t.data, "view_preroll_request_count"));
		}), t.on("adresponse", function(i, n) {
			n = Object.assign({ ad_request_id: "generatedAdRequestId" + a._currentAdResponseNumber++ }, n), Xr(a._adResponses, n);
			var s = a.findAdRequest(n.ad_request_id);
			s && Z(t.data, "view_ad_request_time", Math.max(0, n.viewer_time - s.viewer_time));
		}), t.on("adplay", function(i, n) {
			a._adHasPlayed = !0, a._wouldBeNewAdPlay && (a._wouldBeNewAdPlay = !1, Z(t.data, "view_ad_played_count")), a.inPrerollPosition() && !t.data.view_preroll_played && (t.data.view_preroll_played = !0, a._adRequests.length > 0 && (t.data.view_preroll_request_time = Math.max(0, n.viewer_time - a._adRequests[0].viewer_time)), t.data.view_start && (t.data.view_startup_preroll_request_time = Math.max(0, n.viewer_time - t.data.view_start)), a._prerollPlayTime = n.viewer_time);
		}), t.on("adplaying", function(i, n) {
			a.inPrerollPosition() && typeof t.data.view_preroll_load_time > "u" && typeof a._prerollPlayTime < "u" && (t.data.view_preroll_load_time = n.viewer_time - a._prerollPlayTime, t.data.view_startup_preroll_load_time = n.viewer_time - a._prerollPlayTime);
		}), t.on("adclicked", function(i, n) {
			a._wouldBeNewAdPlay || Z(t.data, "view_ad_clicked_count");
		}), t.on("adskipped", function(i, n) {
			a._wouldBeNewAdPlay || Z(t.data, "view_ad_skipped_count");
		}), t.on("adended", function() {
			a._wouldBeNewAdPlay = !0;
		}), t.on("aderror", function() {
			a._wouldBeNewAdPlay = !0;
		});
	}
	return ge(e, [
		{
			key: "inPrerollPosition",
			value: function() {
				return typeof this.pm.data.view_content_playback_time > "u" || this.pm.data.view_content_playback_time <= 1e3;
			}
		},
		{
			key: "findAdRequest",
			value: function(t) {
				for (var a = 0; a < this._adRequests.length; a++) if (this._adRequests[a].ad_request_id === t) return this._adRequests[a];
			}
		},
		{
			key: "_updateAdData",
			value: function(t, a) {
				if (this.inPrerollPosition()) {
					if (!this.pm.data.view_preroll_ad_tag_hostname && a.ad_tag_url) {
						var r = Ue(Gt(a.ad_tag_url), 2), i = r[0], n = r[1];
						this.pm.data.view_preroll_ad_tag_domain = n, this.pm.data.view_preroll_ad_tag_hostname = i;
					}
					if (!this.pm.data.view_preroll_ad_asset_hostname && a.ad_asset_url) {
						var s = Ue(Gt(a.ad_asset_url), 2), o = s[0], l = s[1];
						this.pm.data.view_preroll_ad_asset_domain = l, this.pm.data.view_preroll_ad_asset_hostname = o;
					}
					this.pm.data.ad_type = "preroll";
				}
				this.pm.data.ad_asset_url = a?.ad_asset_url, this.pm.data.ad_tag_url = a?.ad_tag_url, this.pm.data.ad_creative_id = a?.ad_creative_id, this.pm.data.ad_id = a?.ad_id, this.pm.data.ad_universal_id = a?.ad_universal_id, a != null && a.ad_type && (this.pm.data.ad_type = a?.ad_type);
			}
		}
	]), e;
})(), Bo = function e(t) {
	var a = this;
	j(this, e), k(this, "lastWallClockTime", void 0);
	var r = function() {
		a.lastWallClockTime = X.now(), t.on("before*", i);
	}, i = function(n) {
		var s = X.now(), o = a.lastWallClockTime;
		a.lastWallClockTime = s, s - o > 3e4 && (t.emit("devicesleep", { viewer_time: o }), Object.assign(t.data, { viewer_time: o }), t.send("devicesleep"), t.emit("devicewake", { viewer_time: s }), Object.assign(t.data, { viewer_time: s }), t.send("devicewake"));
	};
	t.one("playbackheartbeat", r), t.on("playbackheartbeatend", function() {
		t.off("before*", i), t.one("playbackheartbeat", r);
	});
}, ja = pe(De()), rn = (function(e) {
	return e();
})(function() {
	var e = function() {
		for (var a = 0, r = {}; a < arguments.length; a++) {
			var i = arguments[a];
			for (var n in i) r[n] = i[n];
		}
		return r;
	};
	function t(a) {
		function r(i, n, s) {
			var o;
			if (typeof document < "u") {
				if (arguments.length > 1) {
					if (s = e({ path: "/" }, r.defaults, s), typeof s.expires == "number") {
						var l = /* @__PURE__ */ new Date();
						l.setMilliseconds(l.getMilliseconds() + s.expires * 864e5), s.expires = l;
					}
					try {
						o = JSON.stringify(n), /^[\{\[]/.test(o) && (n = o);
					} catch {}
					return a.write ? n = a.write(n, i) : n = encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent), i = encodeURIComponent(String(i)), i = i.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent), i = i.replace(/[\(\)]/g, escape), document.cookie = [
						i,
						"=",
						n,
						s.expires ? "; expires=" + s.expires.toUTCString() : "",
						s.path ? "; path=" + s.path : "",
						s.domain ? "; domain=" + s.domain : "",
						s.secure ? "; secure" : ""
					].join("");
				}
				i || (o = {});
				for (var u = document.cookie ? document.cookie.split("; ") : [], m = /(%[0-9A-Z]{2})+/g, p = 0; p < u.length; p++) {
					var c = u[p].split("="), d = c.slice(1).join("=");
					d.charAt(0) === "\"" && (d = d.slice(1, -1));
					try {
						var h = c[0].replace(m, decodeURIComponent);
						if (d = a.read ? a.read(d, h) : a(d, h) || d.replace(m, decodeURIComponent), this.json) try {
							d = JSON.parse(d);
						} catch {}
						if (i === h) {
							o = d;
							break;
						}
						i || (o[h] = d);
					} catch {}
				}
				return o;
			}
		}
		return r.set = r, r.get = function(i) {
			return r.call(r, i);
		}, r.getJSON = function() {
			return r.apply({ json: !0 }, [].slice.call(arguments));
		}, r.defaults = {}, r.remove = function(i, n) {
			r(i, "", e(n, { expires: -1 }));
		}, r.withConverter = t, r;
	}
	return t(function() {});
}), nn = "muxData", Ko = function(e) {
	return Object.entries(e).map(function(t) {
		var a = Ue(t, 2), r = a[0], i = a[1];
		return "".concat(r, "=").concat(i);
	}).join("&");
}, qo = function(e) {
	return e.split("&").reduce(function(t, a) {
		var r = Ue(a.split("="), 2), i = r[0], n = r[1], s = +n;
		return t[i] = n && s == n ? s : n, t;
	}, {});
}, sn = function() {
	var e;
	try {
		e = qo(rn.get(nn) || "");
	} catch {
		e = {};
	}
	return e;
}, on = function(e) {
	try {
		rn.set(nn, Ko(e), { expires: 365 });
	} catch {}
}, Wo = function() {
	var e = sn();
	return e.mux_viewer_id = e.mux_viewer_id || jt(), e.msn = e.msn || Math.random(), on(e), {
		mux_viewer_id: e.mux_viewer_id,
		mux_sample_number: e.msn
	};
}, Ho = function() {
	var e = sn(), t = X.now();
	return e.session_start && (e.sst = e.session_start, delete e.session_start), e.session_id && (e.sid = e.session_id, delete e.session_id), e.session_expires && (e.sex = e.session_expires, delete e.session_expires), (!e.sex || e.sex < t) && (e.sid = jt(), e.sst = t), e.sex = t + 1500 * 1e3, on(e), {
		session_id: e.sid,
		session_start: e.sst,
		session_expires: e.sex
	};
};
function Fo(e, t) {
	var a = t.beaconCollectionDomain, r = t.beaconDomain;
	if (a) return "https://" + a;
	e = e || "inferred";
	var i = r || "litix.io";
	return e.match(/^[a-z0-9]+$/) ? "https://" + e + "." + i : "https://img.litix.io/a.gif";
}
var Yo = pe(De()), ln = function() {
	var e;
	switch (un()) {
		case "cellular":
			e = "cellular";
			break;
		case "ethernet":
			e = "wired";
			break;
		case "wifi":
			e = "wifi";
			break;
		case void 0: break;
		default: e = "other";
	}
	return e;
}, un = function() {
	var e = Yo.default.navigator, t = e && (e.connection || e.mozConnection || e.webkitConnection);
	return t && t.type;
};
ln.getConnectionFromAPI = un;
var Vo = ln, Go = dn({
	a: "env",
	b: "beacon",
	c: "custom",
	d: "ad",
	e: "event",
	f: "experiment",
	i: "internal",
	m: "mux",
	n: "response",
	p: "player",
	q: "request",
	r: "retry",
	s: "session",
	t: "timestamp",
	u: "viewer",
	v: "video",
	w: "page",
	x: "view",
	y: "sub"
}), Qr = dn({
	ad: "ad",
	af: "affiliate",
	ag: "aggregate",
	ap: "api",
	al: "application",
	ao: "audio",
	ar: "architecture",
	as: "asset",
	au: "autoplay",
	av: "average",
	bi: "bitrate",
	bn: "brand",
	br: "break",
	bw: "browser",
	by: "bytes",
	bz: "business",
	ca: "cached",
	cb: "cancel",
	cc: "codec",
	cd: "code",
	cg: "category",
	ch: "changed",
	ci: "client",
	ck: "clicked",
	cl: "canceled",
	cm: "cmcd",
	cn: "config",
	co: "count",
	ce: "counter",
	cp: "complete",
	cq: "creator",
	cr: "creative",
	cs: "captions",
	ct: "content",
	cu: "current",
	cv: "cumulative",
	cx: "connection",
	cz: "context",
	da: "data",
	dg: "downscaling",
	dm: "domain",
	dn: "cdn",
	do: "downscale",
	dr: "drm",
	dp: "dropped",
	du: "duration",
	dv: "device",
	dy: "dynamic",
	eb: "enabled",
	ec: "encoding",
	ed: "edge",
	en: "end",
	eg: "engine",
	em: "embed",
	er: "error",
	ep: "experiments",
	es: "errorcode",
	et: "errortext",
	ee: "event",
	ev: "events",
	ex: "expires",
	ez: "exception",
	fa: "failed",
	fi: "first",
	fm: "family",
	ft: "format",
	fp: "fps",
	fq: "frequency",
	fr: "frame",
	fs: "fullscreen",
	ha: "has",
	hb: "holdback",
	he: "headers",
	ho: "host",
	hn: "hostname",
	ht: "height",
	id: "id",
	ii: "init",
	in: "instance",
	ip: "ip",
	is: "is",
	ke: "key",
	la: "language",
	lb: "labeled",
	le: "level",
	li: "live",
	ld: "loaded",
	lo: "load",
	ls: "lists",
	lt: "latency",
	ma: "max",
	md: "media",
	me: "message",
	mf: "manifest",
	mi: "mime",
	ml: "midroll",
	mm: "min",
	mn: "manufacturer",
	mo: "model",
	mp: "mode",
	ms: "ms",
	mx: "mux",
	ne: "newest",
	nm: "name",
	no: "number",
	on: "on",
	or: "origin",
	os: "os",
	pa: "paused",
	pb: "playback",
	pd: "producer",
	pe: "percentage",
	pf: "played",
	pg: "program",
	ph: "playhead",
	pi: "plugin",
	pl: "preroll",
	pn: "playing",
	po: "poster",
	pp: "pip",
	pr: "preload",
	ps: "position",
	pt: "part",
	pv: "previous",
	py: "property",
	px: "pop",
	pz: "plan",
	ra: "rate",
	rd: "requested",
	re: "rebuffer",
	rf: "rendition",
	rg: "range",
	rm: "remote",
	ro: "ratio",
	rp: "response",
	rq: "request",
	rs: "requests",
	sa: "sample",
	sd: "skipped",
	se: "session",
	sh: "shift",
	sk: "seek",
	sm: "stream",
	so: "source",
	sq: "sequence",
	sr: "series",
	ss: "status",
	st: "start",
	su: "startup",
	sv: "server",
	sw: "software",
	sy: "severity",
	ta: "tag",
	tc: "tech",
	te: "text",
	tg: "target",
	th: "throughput",
	ti: "time",
	tl: "total",
	to: "to",
	tt: "title",
	ty: "type",
	ug: "upscaling",
	un: "universal",
	up: "upscale",
	ur: "url",
	us: "user",
	va: "variant",
	vd: "viewed",
	vi: "video",
	ve: "version",
	vw: "view",
	vr: "viewer",
	wd: "width",
	wa: "watch",
	wt: "waiting"
});
function dn(e) {
	var t = {};
	for (var a in e) e.hasOwnProperty(a) && (t[e[a]] = a);
	return t;
}
function or(e) {
	var t = {}, a = {};
	return Object.keys(e).forEach(function(r) {
		var i = !1;
		if (e.hasOwnProperty(r) && e[r] !== void 0) {
			var n = r.split("_"), s = n[0], o = Go[s];
			o || (B.info("Data key word `" + n[0] + "` not expected in " + r), o = s + "_"), n.splice(1).forEach(function(l) {
				l === "url" && (i = !0), Qr[l] ? o += Qr[l] : Number.isInteger(Number(l)) ? o += l : (B.info("Data key word `" + l + "` not expected in " + r), o += "_" + l + "_");
			}), i ? a[o] = e[r] : t[o] = e[r];
		}
	}), Object.assign(t, a);
}
var st = pe(De()), Zo = pe(Qi()), Xo = {
	maxBeaconSize: 300,
	maxQueueLength: 3600,
	baseTimeBetweenBeacons: 1e4,
	maxPayloadKBSize: 500
}, Qo = 56 * 1024, Jo = [
	"hb",
	"requestcompleted",
	"requestfailed",
	"requestcanceled"
], el = "https://img.litix.io", $e = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
	this._beaconUrl = e || el, this._eventQueue = [], this._postInFlight = !1, this._resendAfterPost = !1, this._failureCount = 0, this._sendTimeout = !1, this._options = Object.assign({}, Xo, t);
};
$e.prototype.queueEvent = function(e, t) {
	var a = Object.assign({}, t);
	return this._eventQueue.length <= this._options.maxQueueLength || e === "eventrateexceeded" ? (this._eventQueue.push(a), this._sendTimeout || this._startBeaconSending(), this._eventQueue.length <= this._options.maxQueueLength) : !1;
};
$e.prototype.flushEvents = function() {
	if ((arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !1) && this._eventQueue.length === 1) {
		this._eventQueue.pop();
		return;
	}
	this._eventQueue.length && this._sendBeaconQueue(), this._startBeaconSending();
};
$e.prototype.destroy = function() {
	var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !1;
	this.destroyed = !0, e ? this._clearBeaconQueue() : this.flushEvents(), st.default.clearTimeout(this._sendTimeout);
};
$e.prototype._clearBeaconQueue = function() {
	var e = this._eventQueue.length > this._options.maxBeaconSize ? this._eventQueue.length - this._options.maxBeaconSize : 0, t = this._eventQueue.slice(e);
	e > 0 && Object.assign(t[t.length - 1], or({ mux_view_message: "event queue truncated" }));
	var a = this._createPayload(t);
	cn(this._beaconUrl, a, !0, function() {});
};
$e.prototype._sendBeaconQueue = function() {
	var e = this;
	if (this._postInFlight) {
		this._resendAfterPost = !0;
		return;
	}
	var t = this._eventQueue.slice(0, this._options.maxBeaconSize);
	this._eventQueue = this._eventQueue.slice(this._options.maxBeaconSize), this._postInFlight = !0;
	var a = this._createPayload(t), r = X.now();
	cn(this._beaconUrl, a, !1, function(i, n) {
		n ? (e._eventQueue = t.concat(e._eventQueue), e._failureCount += 1, B.info("Error sending beacon: " + n)) : e._failureCount = 0, e._roundTripTime = X.now() - r, e._postInFlight = !1, e._resendAfterPost && (e._resendAfterPost = !1, e._eventQueue.length > 0 && e._sendBeaconQueue());
	});
};
$e.prototype._getNextBeaconTime = function() {
	if (!this._failureCount) return this._options.baseTimeBetweenBeacons;
	var e = Math.pow(2, this._failureCount - 1);
	return e = e * Math.random(), (1 + e) * this._options.baseTimeBetweenBeacons;
};
$e.prototype._startBeaconSending = function() {
	var e = this;
	st.default.clearTimeout(this._sendTimeout), !this.destroyed && (this._sendTimeout = st.default.setTimeout(function() {
		e._eventQueue.length && e._sendBeaconQueue(), e._startBeaconSending();
	}, this._getNextBeaconTime()));
};
$e.prototype._createPayload = function(e) {
	var t = this, a = { transmission_timestamp: Math.round(X.now()) };
	this._roundTripTime && (a.rtt_ms = Math.round(this._roundTripTime));
	var r, i, n, s = function() {
		r = JSON.stringify({
			metadata: a,
			events: i || e
		}), n = r.length / 1024;
	}, o = function() {
		return n <= t._options.maxPayloadKBSize;
	};
	return s(), o() || (B.info("Payload size is too big (" + n + " kb). Removing unnecessary events."), i = e.filter(function(l) {
		return Jo.indexOf(l.e) === -1;
	}), s()), o() || (B.info("Payload size still too big (" + n + " kb). Cropping fields.."), i.forEach(function(l) {
		for (var u in l) {
			var m = l[u], p = 50 * 1024;
			typeof m == "string" && m.length > p && (l[u] = m.substring(0, p));
		}
	}), s()), r;
};
var tl = typeof Zo.default.exitPictureInPicture == "function" ? function(e) {
	return e.length <= Qo;
} : function(e) {
	return !1;
}, cn = function(e, t, a, r) {
	if (a && navigator && navigator.sendBeacon && navigator.sendBeacon(e, t)) {
		r();
		return;
	}
	if (st.default.fetch) {
		st.default.fetch(e, {
			method: "POST",
			body: t,
			headers: { "Content-Type": "text/plain" },
			keepalive: tl(t)
		}).then(function(n) {
			return r(null, n.ok ? null : "Error");
		}).catch(function(n) {
			return r(null, n);
		});
		return;
	}
	if (st.default.XMLHttpRequest) {
		var i = new st.default.XMLHttpRequest();
		i.onreadystatechange = function() {
			if (i.readyState === 4) return r(null, i.status !== 200 ? "error" : void 0);
		}, i.open("POST", e), i.setRequestHeader("Content-Type", "text/plain"), i.send(t);
		return;
	}
	r();
}, al = $e, rl = [
	"env_key",
	"view_id",
	"view_sequence_number",
	"player_sequence_number",
	"beacon_domain",
	"player_playhead_time",
	"viewer_time",
	"mux_api_version",
	"event",
	"video_id",
	"player_instance_id",
	"player_error_code",
	"player_error_message",
	"player_error_context",
	"player_error_severity",
	"player_error_business_exception",
	"view_playing_time_ms_cumulative",
	"ad_playing_time_ms_cumulative"
], il = [
	"adplay",
	"adplaying",
	"adpause",
	"adfirstquartile",
	"admidpoint",
	"adthirdquartile",
	"adended",
	"adresponse",
	"adrequest"
], nl = [
	"ad_id",
	"ad_creative_id",
	"ad_universal_id"
], sl = [
	"viewstart",
	"error",
	"ended",
	"viewend"
], ol = 600 * 1e3, ll = (function() {
	function e(t, a) {
		var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
		j(this, e);
		var i, n, s, o, l, u, m, p, c, d, h, y;
		k(this, "mux", void 0), k(this, "envKey", void 0), k(this, "options", void 0), k(this, "eventQueue", void 0), k(this, "sampleRate", void 0), k(this, "disableCookies", void 0), k(this, "respectDoNotTrack", void 0), k(this, "previousBeaconData", void 0), k(this, "lastEventTime", void 0), k(this, "rateLimited", void 0), k(this, "pageLevelData", void 0), k(this, "viewerData", void 0), this.mux = t, this.envKey = a, this.options = r, this.previousBeaconData = null, this.lastEventTime = 0, this.rateLimited = !1, this.eventQueue = new al(Fo(this.envKey, this.options));
		var _;
		this.sampleRate = (_ = this.options.sampleRate) !== null && _ !== void 0 ? _ : 1;
		var g;
		this.disableCookies = (g = this.options.disableCookies) !== null && g !== void 0 ? g : !1;
		var b;
		this.respectDoNotTrack = (b = this.options.respectDoNotTrack) !== null && b !== void 0 ? b : !1, this.previousBeaconData = null, this.lastEventTime = 0, this.rateLimited = !1, this.pageLevelData = {
			mux_api_version: this.mux.API_VERSION,
			mux_embed: this.mux.NAME,
			mux_embed_version: this.mux.VERSION,
			viewer_application_name: (i = this.options.platform) === null || i === void 0 ? void 0 : i.name,
			viewer_application_version: (n = this.options.platform) === null || n === void 0 ? void 0 : n.version,
			viewer_application_engine: (s = this.options.platform) === null || s === void 0 ? void 0 : s.layout,
			viewer_device_name: (o = this.options.platform) === null || o === void 0 ? void 0 : o.product,
			viewer_device_category: "",
			viewer_device_manufacturer: (l = this.options.platform) === null || l === void 0 ? void 0 : l.manufacturer,
			viewer_os_family: (m = this.options.platform) === null || m === void 0 || (u = m.os) === null || u === void 0 ? void 0 : u.family,
			viewer_os_architecture: (c = this.options.platform) === null || c === void 0 || (p = c.os) === null || p === void 0 ? void 0 : p.architecture,
			viewer_os_version: (h = this.options.platform) === null || h === void 0 || (d = h.os) === null || d === void 0 ? void 0 : d.version,
			viewer_connection_type: Vo(),
			page_url: ja.default === null || ja.default === void 0 || (y = ja.default.location) === null || y === void 0 ? void 0 : y.href
		}, this.viewerData = this.disableCookies ? {} : Wo();
	}
	return ge(e, [
		{
			key: "send",
			value: function(t, a) {
				if (!(!t || !(a != null && a.view_id))) {
					if (this.respectDoNotTrack && nr()) return B.info("Not sending `" + t + "` because Do Not Track is enabled");
					if (!a || typeof a != "object") return B.error("A data object was expected in send() but was not provided");
					var r = this.disableCookies ? {} : Ho(), i = Ar(Ca({}, this.pageLevelData, a, r, this.viewerData), {
						event: t,
						env_key: this.envKey
					});
					i.user_id && (i.viewer_user_id = i.user_id, delete i.user_id);
					var n, s = ((n = i.mux_sample_number) !== null && n !== void 0 ? n : 0) >= this.sampleRate, l = or(this._deduplicateBeaconData(t, i));
					if (this.lastEventTime = this.mux.utils.now(), s) return B.info("Not sending event due to sample rate restriction", t, i, l);
					if (this.envKey || B.info("Missing environment key (envKey) - beacons will be dropped if the video source is not a valid mux video URL", t, i, l), !this.rateLimited) if (B.info("Sending event", t, i, l), this.rateLimited = !this.eventQueue.queueEvent(t, l), this.mux.WINDOW_UNLOADING && t === "viewend") this.eventQueue.destroy(!0);
					else {
						if (this.mux.WINDOW_HIDDEN && t === "hb") this.eventQueue.flushEvents(!0);
						else if (sl.indexOf(t) >= 0) {
							if (t === "error" && a.player_error_severity === "warning") return;
							this.eventQueue.flushEvents();
						}
						if (this.rateLimited) return i.event = "eventrateexceeded", l = or(i), this.eventQueue.queueEvent(i.event, l), B.error("Beaconing disabled due to rate limit.");
					}
				}
			}
		},
		{
			key: "destroy",
			value: function() {
				this.eventQueue.destroy(!1);
			}
		},
		{
			key: "_deduplicateBeaconData",
			value: function(t, a) {
				var r = this, i = {}, n = a.view_id;
				if (n === "-1" || t === "viewstart" || t === "viewend" || !this.previousBeaconData || this.mux.utils.now() - this.lastEventTime >= ol) i = Ca({}, a), n && (this.previousBeaconData = i), n && t === "viewend" && (this.previousBeaconData = null);
				else {
					var s = t.indexOf("request") === 0;
					Object.entries(a).forEach(function(o) {
						var l = Ue(o, 2), u = l[0], m = l[1];
						r.previousBeaconData && (m !== r.previousBeaconData[u] || rl.indexOf(u) > -1 || r.objectHasChanged(s, u, m, r.previousBeaconData[u]) || r.eventRequiresKey(t, u)) && (i[u] = m, r.previousBeaconData[u] = m);
					});
				}
				return i;
			}
		},
		{
			key: "objectHasChanged",
			value: function(t, a, r, i) {
				return !t || a.indexOf("request_") !== 0 ? !1 : a === "request_response_headers" || typeof r != "object" || typeof i != "object" ? !0 : Object.keys(r || {}).length !== Object.keys(i || {}).length;
			}
		},
		{
			key: "eventRequiresKey",
			value: function(t, a) {
				return !!(t === "renditionchange" && a.indexOf("video_source_") === 0 || nl.includes(a) && il.includes(t) || t === "playbackmodechange" && a.indexOf("player_playback_mode") === 0);
			}
		}
	]), e;
})(), dl = function e(t) {
	j(this, e);
	var a = 0, r = 0, i = 0, n = 0, s = 0, o = 0, l = 0, u = function(c, d) {
		var h = d.request_start, y = d.request_response_start, _ = d.request_response_end, g = d.request_bytes_loaded;
		n++;
		var b, f;
		if (y ? (b = y - (h ?? 0), f = (_ ?? 0) - y) : f = (_ ?? 0) - (h ?? 0), f > 0 && g && g > 0) {
			var T = g / f * 8e3;
			s++, r += g, i += f, t.data.view_min_request_throughput = Math.min(t.data.view_min_request_throughput || Infinity, T), t.data.view_average_request_throughput = r / i * 8e3, t.data.view_request_count = n, b > 0 && (a += b, t.data.view_max_request_latency = Math.max(t.data.view_max_request_latency || 0, b), t.data.view_average_request_latency = a / s);
		}
	}, m = function(c, d) {
		n++, o++, t.data.view_request_count = n, t.data.view_request_failed_count = o;
	}, p = function(c, d) {
		n++, l++, t.data.view_request_count = n, t.data.view_request_canceled_count = l;
	};
	t.on("requestcompleted", u), t.on("requestfailed", m), t.on("requestcanceled", p);
}, cl = 3600 * 1e3, pl = function e(t) {
	var a = this;
	j(this, e), k(this, "_lastEventTime", void 0), t.on("before*", function(r, i) {
		var n = i.viewer_time, s = X.now(), o = a._lastEventTime;
		if (a._lastEventTime = s, o && s - o > cl) {
			var l = Object.keys(t.data).reduce(function(m, p) {
				return p.indexOf("video_") === 0 ? Object.assign(m, k({}, p, t.data[p])) : m;
			}, {});
			t.mux.log.info("Received event after at least an hour inactivity, creating a new view");
			var u = t.playbackHeartbeat._playheadShouldBeProgressing;
			t._resetView(Object.assign({ viewer_time: n }, l)), t.playbackHeartbeat._playheadShouldBeProgressing = u, t.playbackHeartbeat._playheadShouldBeProgressing && r.type !== "play" && r.type !== "adbreakstart" && (t.emit("play", { viewer_time: n }), r.type !== "playing" && t.emit("playing", { viewer_time: n }));
		}
	});
}, hl = function e(t) {
	j(this, e);
	var a = function(o) {
		var l = vl(o), u = fl(o);
		if (l != null && !Jr(l, n) && s <= u) {
			n = l, s = u;
			var m = { video_cdn: l };
			t.emit("cdnchange", m);
		}
	}, r = null, i = null, n = null, s = 0;
	t.on("viewinit", function() {
		r = null, i = null, n = null, s = 0;
	}), t.on("beforecdnchange", function(o, l) {
		var u = l?.video_cdn;
		u && (typeof l.video_previous_cdn > "u" || l.video_previous_cdn === null) && (Jr(u, i) ? l.video_previous_cdn = r ?? void 0 : (l.video_previous_cdn = i ?? void 0, r = i, i = u));
	}), t.on("requestcompleted", function(o, l) {
		a(l);
	});
};
function Jr(e, t) {
	return e?.toLowerCase() === t?.toLowerCase();
}
function vl(e) {
	var t;
	return e != null && e.request_type && (e.request_type === "media" || e.request_type === "video") && !((t = e.request_response_headers) === null || t === void 0) && t["x-cdn"] ? e.request_response_headers["x-cdn"] : e != null && e.video_cdn ? e.video_cdn : null;
}
function fl(e) {
	return e != null && e.request_start ? e.request_start : e != null && e.viewer_time ? e.viewer_time : Date.now();
}
var bl = hl, _l = function(e) {
	try {
		return JSON.parse(e), !0;
	} catch {
		return !1;
	}
}, gl = function e(t) {
	var a = this;
	j(this, e), k(this, "_emittingAutomaticEvent", !1), k(this, "_hasInitialized", !1), k(this, "_currentMode", "standard"), t.on("viewstart", function() {
		a._hasInitialized || (a._hasInitialized = !0, a._currentMode = t.data.player_playback_mode || "standard", a._emittingAutomaticEvent = !0, t.emit("playbackmodechange", {
			player_playback_mode: a._currentMode,
			player_playback_mode_data: "{}"
		}), a._emittingAutomaticEvent = !1);
	}), t.on("viewend", function() {
		a._hasInitialized = !1;
	}), t.on("playbackmodechange", function(r, i) {
		a._emittingAutomaticEvent || (i.player_playback_mode_data ? _l(i.player_playback_mode_data) || (t.mux.log.warn("Invalid JSON string for player_playback_mode_data"), i.player_playback_mode_data = "{}") : i.player_playback_mode_data = "{}", t.data.player_playback_mode_data = i.player_playback_mode_data, t.data.player_playback_mode = i.player_playback_mode, a._currentMode = i.player_playback_mode);
	});
}, Tl = (function() {
	function e(t) {
		j(this, e), k(this, "pm", void 0), k(this, "_currentRangeStart", void 0), k(this, "_lastPlayheadTime", void 0), this.pm = t, this._currentRangeStart = null, this._lastPlayheadTime = null, t.on("playbackheartbeat", this._updatePlaybackRange.bind(this)), t.on("playbackheartbeatend", this._endPlaybackRange.bind(this));
	}
	return ge(e, [
		{
			key: "_updateLastRangeEnd",
			value: function() {
				var t = this.pm.data.video_playback_ranges;
				if (t && t.length > 0) {
					var a = this.pm.data.player_playhead_time || 0;
					t[t.length - 1][1] = a;
				}
			}
		},
		{
			key: "_updatePlaybackRange",
			value: function() {
				var t, a = this.pm.data.player_playhead_time || 0;
				if (!(!this.pm.disableAdPlaybackRangeFiltering && !((t = this.pm.adTracker) === null || t === void 0) && t.isAdBreak && this._lastPlayheadTime !== null && a < this._lastPlayheadTime)) {
					if (this._lastPlayheadTime !== null && this._currentRangeStart !== null) {
						if (Math.abs(a - this._lastPlayheadTime) > 1e3) {
							var i = this.pm.data.video_playback_ranges;
							i && i.length > 0 && (i[i.length - 1][1] = this._lastPlayheadTime), this._currentRangeStart = null;
						}
					}
					if (this._currentRangeStart === null) {
						var n = this.pm.data.video_playback_ranges || [];
						n.length > 0 && n[n.length - 1][1] === a ? this._currentRangeStart = n[n.length - 1][0] : (this._currentRangeStart = a, n.push([a, a])), this.pm.data.video_playback_ranges = n;
					} else this._updateLastRangeEnd();
					this._lastPlayheadTime = a;
				}
			}
		},
		{
			key: "_endPlaybackRange",
			value: function() {
				this._currentRangeStart !== null && (this._updateLastRangeEnd(), this._currentRangeStart = null, this._lastPlayheadTime = null);
			}
		}
	]), e;
})(), kl = [
	"viewstart",
	"ended",
	"loadstart",
	"pause",
	"play",
	"playing",
	"ratechange",
	"waiting",
	"adplay",
	"adpause",
	"adended",
	"aderror",
	"adplaying",
	"adrequest",
	"adresponse",
	"adbreakstart",
	"adbreakend",
	"adfirstquartile",
	"admidpoint",
	"adthirdquartile",
	"rebufferstart",
	"rebufferend",
	"seeked",
	"error",
	"hb",
	"requestcompleted",
	"requestfailed",
	"requestcanceled",
	"renditionchange",
	"cdnchange",
	"playbackmodechange"
], Al = /* @__PURE__ */ new Set([
	"requestcompleted",
	"requestfailed",
	"requestcanceled"
]), Rl = (function(e) {
	js(a, e);
	var t = Qs(a);
	function a(r, i, n) {
		j(this, a);
		var s = t.call(this);
		k(S(s), "pageLoadEndTime", void 0), k(S(s), "pageLoadInitTime", void 0), k(S(s), "_destroyed", void 0), k(S(s), "_heartBeatTimeout", void 0), k(S(s), "adTracker", void 0), k(S(s), "dashjs", void 0), k(S(s), "data", void 0), k(S(s), "disablePlayheadRebufferTracking", void 0), k(S(s), "disableRebufferTracking", void 0), k(S(s), "disableAdPlaybackRangeFiltering", void 0), k(S(s), "errorTracker", void 0), k(S(s), "errorTranslator", void 0), k(S(s), "emitTranslator", void 0), k(S(s), "getAdData", void 0), k(S(s), "getPlayheadTime", void 0), k(S(s), "getStateData", void 0), k(S(s), "stateDataTranslator", void 0), k(S(s), "hlsjs", void 0), k(S(s), "id", void 0), k(S(s), "longResumeTracker", void 0), k(S(s), "minimumRebufferDuration", void 0), k(S(s), "mux", void 0), k(S(s), "playbackEventDispatcher", void 0), k(S(s), "playbackHeartbeat", void 0), k(S(s), "playbackHeartbeatTime", void 0), k(S(s), "playheadTime", void 0), k(S(s), "seekingTracker", void 0), k(S(s), "sustainedRebufferThreshold", void 0), k(S(s), "watchTimeTracker", void 0), k(S(s), "currentFragmentPDT", void 0), k(S(s), "currentFragmentStart", void 0), s.pageLoadInitTime = Ra.navigationStart(), s.pageLoadEndTime = Ra.domContentLoadedEventEnd();
		s.mux = r, s.id = i, n != null && n.beaconDomain && s.mux.log.warn("The `beaconDomain` setting has been deprecated in favor of `beaconCollectionDomain`. Please change your integration to use `beaconCollectionDomain` instead of `beaconDomain`."), n = Object.assign({
			debug: !1,
			minimumRebufferDuration: 250,
			sustainedRebufferThreshold: 1e3,
			playbackHeartbeatTime: 25,
			beaconDomain: "litix.io",
			sampleRate: 1,
			disableCookies: !1,
			respectDoNotTrack: !1,
			disableRebufferTracking: !1,
			disablePlayheadRebufferTracking: !1,
			disableAdPlaybackRangeFiltering: !1,
			errorTranslator: function(c) {
				return c;
			},
			emitTranslator: function() {
				for (var c = arguments.length, d = new Array(c), h = 0; h < c; h++) d[h] = arguments[h];
				return d;
			},
			stateDataTranslator: function(c) {
				return c;
			}
		}, n), n.data = n.data || {}, n.data.property_key && (n.data.env_key = n.data.property_key, delete n.data.property_key), B.level = n.debug ? nt.DEBUG : nt.WARN, s.getPlayheadTime = n.getPlayheadTime, s.getStateData = n.getStateData || function() {
			return {};
		}, s.getAdData = n.getAdData || function() {}, s.minimumRebufferDuration = n.minimumRebufferDuration, s.sustainedRebufferThreshold = n.sustainedRebufferThreshold, s.playbackHeartbeatTime = n.playbackHeartbeatTime, s.disableRebufferTracking = n.disableRebufferTracking, s.disableRebufferTracking && s.mux.log.warn("Disabling rebuffer tracking. This should only be used in specific circumstances as a last resort when your player is known to unreliably track rebuffering."), s.disablePlayheadRebufferTracking = n.disablePlayheadRebufferTracking, s.disableAdPlaybackRangeFiltering = n.disableAdPlaybackRangeFiltering, s.errorTranslator = n.errorTranslator, s.emitTranslator = n.emitTranslator, s.stateDataTranslator = n.stateDataTranslator, s.playbackEventDispatcher = new ll(r, n.data.env_key, n), s.data = {
			player_instance_id: jt(),
			mux_sample_rate: n.sampleRate,
			beacon_domain: n.beaconCollectionDomain || n.beaconDomain
		}, s.data.view_sequence_number = 1, s.data.player_sequence_number = 1;
		var l = (function() {
			typeof this.data.view_start > "u" && (this.data.view_start = this.mux.utils.now(), this.emit("viewstart"), this.emit("renditionchange"));
		}).bind(S(s));
		if (s.on("viewinit", function(c, d) {
			this._resetVideoData(), this._resetViewData(), this._resetErrorData(), this._updateStateData(), Object.assign(this.data, d), this._initializeViewData(), this.one("play", l), this.one("adbreakstart", l);
		}), s.on("videochange", function(c, d) {
			this._resetView(d);
		}), s.on("programchange", function(c, d) {
			this.data.player_is_paused && this.mux.log.warn("The `programchange` event is intended to be used when the content changes mid playback without the video source changing, however the video is not currently playing. If the video source is changing please use the videochange event otherwise you will lose startup time information."), this._resetView(Object.assign(d, { view_program_changed: !0 })), l(), this.emit("play"), this.emit("playing");
		}), s.on("fragmentchange", function(c, d) {
			this.currentFragmentPDT = d.currentFragmentPDT, this.currentFragmentStart = d.currentFragmentStart;
		}), s.on("destroy", s.destroy), typeof window < "u" && typeof window.addEventListener == "function" && typeof window.removeEventListener == "function") {
			var u = function() {
				var c = typeof s.data.view_start < "u";
				s.mux.WINDOW_HIDDEN = document.visibilityState === "hidden", c && s.mux.WINDOW_HIDDEN && (s.data.player_is_paused || s.emit("hb"));
			};
			window.addEventListener("visibilitychange", u, !1);
			var m = function(c) {
				c.persisted || s.destroy();
			};
			window.addEventListener("pagehide", m, !1), s.on("destroy", function() {
				window.removeEventListener("visibilitychange", u), window.removeEventListener("pagehide", m);
			});
		}
		s.on("playerready", function(c, d) {
			Object.assign(this.data, d);
		}), kl.forEach(function(c) {
			s.on(c, function(d, h) {
				c.indexOf("ad") !== 0 && this._updateStateData(), Object.assign(this.data, h), this._sanitizeData();
			}), s.on("after" + c, function() {
				(c !== "error" || this.errorTracker.viewErrored) && this.send(c);
			});
		}), s.on("viewend", function(c, d) {
			Object.assign(s.data, d);
		});
		var p = function(c) {
			var d = this.mux.utils.now();
			this.data.player_init_time && (this.data.player_startup_time = d - this.data.player_init_time), this.pageLoadInitTime = this.data.page_load_init_time || this.pageLoadInitTime, this.pageLoadEndTime = this.data.page_load_end_time || this.pageLoadEndTime, !this.mux.PLAYER_TRACKED && this.pageLoadInitTime && (this.mux.PLAYER_TRACKED = !0, (this.data.player_init_time || this.pageLoadEndTime) && (this.data.page_load_time = Math.min(this.data.player_init_time || Infinity, this.pageLoadEndTime || Infinity) - this.pageLoadInitTime)), this.send("playerready"), delete this.data.player_startup_time, delete this.data.page_load_time;
		};
		return s.one("playerready", p), s.longResumeTracker = new pl(S(s)), s.errorTracker = new bo(S(s)), new Bo(S(s)), s.seekingTracker = new Lo(S(s)), s.playheadTime = new ko(S(s)), s.playbackHeartbeat = new vo(S(s)), new No(S(s)), s.watchTimeTracker = new yo(S(s)), new Eo(S(s)), new Tl(S(s)), s.adTracker = new Uo(S(s)), new Co(S(s)), new wo(S(s)), new So(S(s)), new dl(S(s)), new bl(S(s)), new gl(S(s)), n.hlsjs && s.addHLSJS(n), n.dashjs && s.addDashJS(n), s.emit("viewinit", n.data), s;
	}
	return ge(a, [
		{
			key: "emit",
			value: function(r, i) {
				var n, s = Object.assign({ viewer_time: this.mux.utils.now() }, i), o = [r, s];
				if (this.emitTranslator) try {
					o = this.emitTranslator(r, s);
				} catch (l) {
					this.mux.log.warn("Exception in emit translator callback.", l);
				}
				o != null && o.length && (n = ta(kt(a.prototype), "emit", this)).call.apply(n, [this].concat(ve(o)));
			}
		},
		{
			key: "destroy",
			value: function() {
				this._destroyed || (this._destroyed = !0, typeof this.data.view_start < "u" && (this.emit("viewend"), this.send("viewend")), this.playbackEventDispatcher.destroy(), this.removeHLSJS(), this.removeDashJS(), window.clearTimeout(this._heartBeatTimeout));
			}
		},
		{
			key: "send",
			value: function(r) {
				if (this.data.view_id) {
					var i = Object.assign({}, this.data);
					if (i.video_source_is_live === void 0 && (i.player_source_duration === Infinity || i.video_source_duration === Infinity ? i.video_source_is_live = !0 : (i.player_source_duration > 0 || i.video_source_duration > 0) && (i.video_source_is_live = !1)), i.video_source_is_live || [
						"player_program_time",
						"player_manifest_newest_program_time",
						"player_live_edge_program_time",
						"player_program_time",
						"video_holdback",
						"video_part_holdback",
						"video_target_duration",
						"video_part_target_duration"
					].forEach(function(u) {
						i[u] = void 0;
					}), i.video_source_url = i.video_source_url || i.player_source_url, i.video_source_url) {
						var s = Ue(Gt(i.video_source_url), 2), o = s[0];
						i.video_source_domain = s[1], i.video_source_hostname = o;
					}
					delete i.ad_request_id, i.video_playback_ranges && (i.video_playback_range = JSON.stringify(i.video_playback_ranges.filter(function(u) {
						return u[0] !== u[1];
					}).map(function(u) {
						return "".concat(u[0], ":").concat(u[1]);
					})), delete i.video_playback_ranges), this.playbackEventDispatcher.send(r, i), this.data.view_sequence_number++, this.data.player_sequence_number++, Al.has(r) || this._restartHeartBeat(), r === "viewend" && delete this.data.view_id;
				}
			}
		},
		{
			key: "_resetView",
			value: function(r) {
				this.emit("viewend"), this.send("viewend"), this.emit("viewinit", r);
			}
		},
		{
			key: "_updateStateData",
			value: function() {
				var r, i = this.getStateData();
				if (typeof this.stateDataTranslator == "function") try {
					i = this.stateDataTranslator(i);
				} catch (s) {
					this.mux.log.warn("Exception in stateDataTranslator translator callback.", s);
				}
				if (!((r = this.data) === null || r === void 0) && r.video_cdn && i != null && i.video_cdn) {
					i.video_cdn;
					i = zs(i, ["video_cdn"]);
				}
				Object.assign(this.data, i), this.playheadTime._updatePlayheadTime(), this._sanitizeData();
			}
		},
		{
			key: "_sanitizeData",
			value: function() {
				var r = this;
				[
					"player_width",
					"player_height",
					"video_source_width",
					"video_source_height",
					"player_playhead_time",
					"video_source_bitrate"
				].forEach(function(s) {
					var o = parseInt(r.data[s], 10);
					r.data[s] = isNaN(o) ? void 0 : o;
				});
				["player_source_url", "video_source_url"].forEach(function(s) {
					if (r.data[s]) {
						var o = r.data[s].toLowerCase();
						(o.indexOf("data:") === 0 || o.indexOf("blob:") === 0) && (r.data[s] = "MSE style URL");
					}
				});
			}
		},
		{
			key: "_resetVideoData",
			value: function() {
				var r = this;
				Object.keys(this.data).forEach(function(i) {
					i.indexOf("video_") === 0 && delete r.data[i];
				});
			}
		},
		{
			key: "_resetViewData",
			value: function() {
				var r = this;
				Object.keys(this.data).forEach(function(i) {
					i.indexOf("view_") === 0 && delete r.data[i];
				}), this.data.view_sequence_number = 1;
			}
		},
		{
			key: "_resetErrorData",
			value: function() {
				delete this.data.player_error_code, delete this.data.player_error_message, delete this.data.player_error_context, delete this.data.player_error_severity, delete this.data.player_error_business_exception;
			}
		},
		{
			key: "_initializeViewData",
			value: function() {
				var r = this, i = this.data.view_id = jt(), n = function() {
					i === r.data.view_id && Z(r.data, "player_view_count", 1);
				};
				this.data.player_is_paused ? this.one("play", n) : n();
			}
		},
		{
			key: "_restartHeartBeat",
			value: function() {
				var r = this;
				window.clearTimeout(this._heartBeatTimeout), this._heartBeatTimeout = window.setTimeout(function() {
					r.data.player_is_paused || r.emit("hb");
				}, 1e4);
			}
		},
		{
			key: "addHLSJS",
			value: function(r) {
				if (!r.hlsjs) {
					this.mux.log.warn("You must pass a valid hlsjs instance in order to track it.");
					return;
				}
				if (this.hlsjs) {
					this.mux.log.warn("An instance of HLS.js is already being monitored for this player.");
					return;
				}
				this.hlsjs = r.hlsjs, io(this.mux, this.id, r.hlsjs, {}, r.Hls || window.Hls);
			}
		},
		{
			key: "removeHLSJS",
			value: function() {
				this.hlsjs && (no(this.hlsjs), this.hlsjs = void 0);
			}
		},
		{
			key: "addDashJS",
			value: function(r) {
				if (!r.dashjs) {
					this.mux.log.warn("You must pass a valid dashjs instance in order to track it.");
					return;
				}
				if (this.dashjs) {
					this.mux.log.warn("An instance of Dash.js is already being monitored for this player.");
					return;
				}
				this.dashjs = r.dashjs, uo(this.mux, this.id, r.dashjs);
			}
		},
		{
			key: "removeDashJS",
			value: function() {
				this.dashjs && (co(this.dashjs), this.dashjs = void 0);
			}
		}
	]), a;
})(po), Rt = pe(Qi());
function Ga() {
	return Rt.default && !!(Rt.default.fullscreenElement || Rt.default.webkitFullscreenElement || Rt.default.mozFullScreenElement || Rt.default.msFullscreenElement);
}
var Cl = [
	"loadstart",
	"pause",
	"play",
	"playing",
	"seeking",
	"seeked",
	"timeupdate",
	"ratechange",
	"stalled",
	"waiting",
	"error",
	"ended"
], Dl = {
	1: "MEDIA_ERR_ABORTED",
	2: "MEDIA_ERR_NETWORK",
	3: "MEDIA_ERR_DECODE",
	4: "MEDIA_ERR_SRC_NOT_SUPPORTED"
};
function Sl(e, t, a) {
	var r = Ue(wa(t), 3), i = r[0], n = r[1], s = r[2], o = e.log, l = e.utils.getComputedStyle, u = e.utils.secondsToMs, m = { automaticErrorTracking: !0 };
	if (i) {
		if (s !== "video" && s !== "audio") return o.error("The element of `" + n + "` was not a media element.");
	} else return o.error("No element was found with the `" + n + "` query selector.");
	i.mux && (i.mux.destroy(), delete i.mux, o.warn("Already monitoring this video element, replacing existing event listeners"));
	a = Object.assign(m, a, {
		getPlayheadTime: function() {
			return u(i.currentTime);
		},
		getStateData: function() {
			var d, h, y, _ = ((d = (h = this).getPlayheadTime) === null || d === void 0 ? void 0 : d.call(h)) || u(i.currentTime), g = this.hlsjs && this.hlsjs.url, b = this.dashjs && typeof this.dashjs.getSource == "function" && this.dashjs.getSource(), f = {
				player_is_paused: i.paused,
				player_width: parseInt(l(i, "width")),
				player_height: parseInt(l(i, "height")),
				player_autoplay_on: i.autoplay,
				player_preload_on: i.preload,
				player_language_code: i.lang,
				player_is_fullscreen: Ga(),
				video_poster_url: i.poster,
				video_source_url: g || b || i.currentSrc,
				video_source_duration: u(i.duration),
				video_source_height: i.videoHeight,
				video_source_width: i.videoWidth,
				view_dropped_frame_count: i == null || (y = i.getVideoPlaybackQuality) === null || y === void 0 ? void 0 : y.call(i).droppedVideoFrames
			};
			if (i.getStartDate && _ > 0) {
				var T = i.getStartDate();
				if (T && typeof T.getTime == "function" && T.getTime()) {
					var w = T.getTime();
					if (f.player_program_time = w + _, i.seekable.length > 0) f.player_live_edge_program_time = w + i.seekable.end(i.seekable.length - 1);
				}
			}
			return f;
		}
	}), a.data = Object.assign({
		player_software: "HTML5 Video Element",
		player_mux_plugin_name: "VideoElementMonitor",
		player_mux_plugin_version: e.VERSION
	}, a.data), i.mux = i.mux || {}, i.mux.deleted = !1, i.mux.emit = function(d, h) {
		e.emit(n, d, h);
	}, i.mux.updateData = function(d) {
		i.mux.emit("hb", d);
	};
	var c = function() {
		o.error("The monitor for this video element has already been destroyed.");
	};
	i.mux.destroy = function() {
		Object.keys(i.mux.listeners).forEach(function(d) {
			i.removeEventListener(d, i.mux.listeners[d], !1);
		}), delete i.mux.listeners, i.mux.fullscreenChangeListener && (document.removeEventListener("fullscreenchange", i.mux.fullscreenChangeListener, !1), delete i.mux.fullscreenChangeListener), i.mux.destroy = c, i.mux.swapElement = c, i.mux.emit = c, i.mux.addHLSJS = c, i.mux.addDashJS = c, i.mux.removeHLSJS = c, i.mux.removeDashJS = c, i.mux.updateData = c, i.mux.setEmitTranslator = c, i.mux.setStateDataTranslator = c, i.mux.setGetPlayheadTime = c, i.mux.deleted = !0, e.emit(n, "destroy");
	}, i.mux.swapElement = function(d) {
		var h = Ue(wa(d), 3), y = h[0], _ = h[1], g = h[2];
		if (y) {
			if (g !== "video" && g !== "audio") return e.log.error("The element of `" + _ + "` was not a media element.");
		} else return e.log.error("No element was found with the `" + _ + "` query selector.");
		y.muxId = i.muxId, delete i.muxId, y.mux = y.mux || {}, y.mux.listeners = Object.assign({}, i.mux.listeners), delete i.mux.listeners, Object.keys(y.mux.listeners).forEach(function(b) {
			i.removeEventListener(b, y.mux.listeners[b], !1), y.addEventListener(b, y.mux.listeners[b], !1);
		}), y.mux.fullscreenChangeListener = i.mux.fullscreenChangeListener, delete i.mux.fullscreenChangeListener, y.mux.swapElement = i.mux.swapElement, y.mux.destroy = i.mux.destroy, delete i.mux, i = y;
	}, i.mux.addHLSJS = function(d) {
		e.addHLSJS(n, d);
	}, i.mux.addDashJS = function(d) {
		e.addDashJS(n, d);
	}, i.mux.removeHLSJS = function() {
		e.removeHLSJS(n);
	}, i.mux.removeDashJS = function() {
		e.removeDashJS(n);
	}, i.mux.setEmitTranslator = function(d) {
		e.setEmitTranslator(n, d);
	}, i.mux.setStateDataTranslator = function(d) {
		e.setStateDataTranslator(n, d);
	}, i.mux.setGetPlayheadTime = function(d) {
		d || (d = a.getPlayheadTime), e.setGetPlayheadTime(n, d);
	}, e.init(n, a), e.emit(n, "playerready"), i.paused || (e.emit(n, "play"), i.readyState > 2 && e.emit(n, "playing")), i.mux.listeners = {}, Cl.forEach(function(d) {
		d === "error" && !a.automaticErrorTracking || (i.mux.listeners[d] = function() {
			var h = {};
			if (d === "error") {
				if (!i.error || i.error.code === 1) return;
				h.player_error_code = i.error.code, h.player_error_message = Dl[i.error.code] || i.error.message;
			}
			e.emit(n, d, h);
		}, i.addEventListener(d, i.mux.listeners[d], !1));
	}), i.mux.listeners.enterpictureinpicture = function() {
		e.emit(n, "playbackmodechange", {
			player_playback_mode: "pip",
			player_playback_mode_data: "{}"
		});
	}, i.mux.listeners.leavepictureinpicture = function() {
		var d = Ga() ? "fullscreen" : "standard";
		e.emit(n, "playbackmodechange", {
			player_playback_mode: d,
			player_playback_mode_data: "{}"
		});
	}, i.addEventListener("enterpictureinpicture", i.mux.listeners.enterpictureinpicture, !1), i.addEventListener("leavepictureinpicture", i.mux.listeners.leavepictureinpicture, !1), i.mux.fullscreenChangeListener = function() {
		var d = Ga(), h = document.fullscreenElement;
		if (d && (h === i || h != null && h.contains(i))) e.emit(n, "playbackmodechange", {
			player_playback_mode: "fullscreen",
			player_playback_mode_data: "{}"
		});
		else if (!d) {
			var _ = document.pictureInPictureElement === i ? "pip" : "standard";
			e.emit(n, "playbackmodechange", {
				player_playback_mode: _,
				player_playback_mode_data: "{}"
			});
		}
	}, document.addEventListener("fullscreenchange", i.mux.fullscreenChangeListener, !1);
}
function Ol(e, t, a, r) {
	var i = r;
	if (e && typeof e[t] == "function") try {
		i = e[t].apply(e, a);
	} catch (n) {
		B.info("safeCall error", n);
	}
	return i;
}
var qt = pe(De()), mt;
qt.default && qt.default.WeakMap && (mt = /* @__PURE__ */ new WeakMap());
function Nl(e, t) {
	if (!e || !t || !qt.default || typeof qt.default.getComputedStyle != "function") return "";
	var a;
	return mt && mt.has(e) && (a = mt.get(e)), a || (a = qt.default.getComputedStyle(e, null), mt && mt.set(e, a)), a.getPropertyValue(t);
}
function xl(e) {
	return Math.floor(e * 1e3);
}
var Xe = {
	TARGET_DURATION: "#EXT-X-TARGETDURATION",
	PART_INF: "#EXT-X-PART-INF",
	SERVER_CONTROL: "#EXT-X-SERVER-CONTROL",
	INF: "#EXTINF",
	PROGRAM_DATE_TIME: "#EXT-X-PROGRAM-DATE-TIME",
	VERSION: "#EXT-X-VERSION",
	SESSION_DATA: "#EXT-X-SESSION-DATA"
}, Pa = function(e) {
	return this.buffer = "", this.manifest = {
		segments: [],
		serverControl: {},
		sessionData: {}
	}, this.currentUri = {}, this.process(e), this.manifest;
};
Pa.prototype.process = function(e) {
	var t;
	for (this.buffer += e, t = this.buffer.indexOf(`
`); t > -1; t = this.buffer.indexOf(`
`)) this.processLine(this.buffer.substring(0, t)), this.buffer = this.buffer.substring(t + 1);
};
Pa.prototype.processLine = function(e) {
	var a = Ml(e, e.indexOf(":")), r = a[0], i = a.length === 2 ? Rr(a[1]) : void 0;
	if (r[0] !== "#") this.currentUri.uri = r, this.manifest.segments.push(this.currentUri), this.manifest.targetDuration && !("duration" in this.currentUri) && (this.currentUri.duration = this.manifest.targetDuration), this.currentUri = {};
	else switch (r) {
		case Xe.TARGET_DURATION:
			if (!isFinite(i) || i < 0) return;
			this.manifest.targetDuration = i, this.setHoldBack();
			break;
		case Xe.PART_INF:
			za(this.manifest, a), this.manifest.partInf.partTarget && (this.manifest.partTargetDuration = this.manifest.partInf.partTarget), this.setHoldBack();
			break;
		case Xe.SERVER_CONTROL:
			za(this.manifest, a), this.setHoldBack();
			break;
		case Xe.INF:
			i === 0 ? this.currentUri.duration = .01 : i > 0 && (this.currentUri.duration = i);
			break;
		case Xe.PROGRAM_DATE_TIME:
			var n = i, s = new Date(n);
			this.manifest.dateTimeString || (this.manifest.dateTimeString = n, this.manifest.dateTimeObject = s), this.currentUri.dateTimeString = n, this.currentUri.dateTimeObject = s;
			break;
		case Xe.VERSION:
			za(this.manifest, a);
			break;
		case Xe.SESSION_DATA:
			var l = an(Ul(a[1]));
			Object.assign(this.manifest.sessionData, l);
	}
};
Pa.prototype.setHoldBack = function() {
	var e = this.manifest, t = e.serverControl, a = e.targetDuration, r = e.partTargetDuration;
	if (t) {
		var i = "holdBack", n = "partHoldBack", s = a && a * 3, o = r && r * 2;
		a && !t.hasOwnProperty(i) && (t[i] = s), s && t[i] < s && (t[i] = s), r && !t.hasOwnProperty(n) && (t[n] = r * 3), r && t[n] < o && (t[n] = o);
	}
};
var za = function(e, t) {
	var a = mn(t[0].replace("#EXT-X-", "")), r;
	Pl(t[1]) ? (r = {}, r = Object.assign(Ll(t[1]), r)) : r = Rr(t[1]), e[a] = r;
}, mn = function(e) {
	return e.toLowerCase().replace(/-(\w)/g, function(t) {
		return t[1].toUpperCase();
	});
}, Rr = function(e) {
	if (e.toLowerCase() === "yes" || e.toLowerCase() === "no") return e.toLowerCase() === "yes";
	var t = e.indexOf(":") !== -1 ? e : parseFloat(e);
	return isNaN(t) ? e : t;
}, Il = function(e) {
	var t = {}, a = e.split("=");
	if (a.length > 1) {
		var r = mn(a[0]);
		t[r] = Rr(a[1]);
	}
	return t;
}, Ll = function(e) {
	for (var t = e.split(","), a = {}, r = 0; t.length > r; r++) {
		var i = t[r], n = Il(i);
		a = Object.assign(n, a);
	}
	return a;
}, Pl = function(e) {
	return e.indexOf("=") > -1;
}, Ml = function(e, t) {
	return t === -1 ? [e] : [e.substring(0, t), e.substring(t + 1)];
}, Ul = function(e) {
	var t = {};
	if (e) {
		var a = e.search(",");
		return [e.slice(0, a), e.slice(a + 1)].forEach(function(s, o) {
			for (var l = s.replace(/['"]+/g, "").split("="), u = 0; u < l.length; u++) l[u] === "DATA-ID" && (t["DATA-ID"] = l[1 - u]), l[u] === "VALUE" && (t.VALUE = l[1 - u]);
		}), { data: t };
	}
}, Kl = {
	safeCall: Ol,
	safeIncrement: Z,
	getComputedStyle: Nl,
	secondsToMs: xl,
	assign: Object.assign,
	headersStringToObject: wr,
	cdnHeadersToRequestId: Da,
	extractHostnameAndDomain: Gt,
	extractHostname: _e,
	manifestParser: Pa,
	generateShortID: en,
	generateUUID: jt,
	now: X.now,
	findMediaElement: wa
}, Wl = {
	PLAYER_READY: "playerready",
	VIEW_INIT: "viewinit",
	VIDEO_CHANGE: "videochange",
	PLAY: "play",
	PAUSE: "pause",
	PLAYING: "playing",
	TIME_UPDATE: "timeupdate",
	SEEKING: "seeking",
	SEEKED: "seeked",
	REBUFFER_START: "rebufferstart",
	REBUFFER_END: "rebufferend",
	ERROR: "error",
	ENDED: "ended",
	RENDITION_CHANGE: "renditionchange",
	ORIENTATION_CHANGE: "orientationchange",
	PLAYBACK_MODE_CHANGE: "playbackmodechange",
	AD_REQUEST: "adrequest",
	AD_RESPONSE: "adresponse",
	AD_BREAK_START: "adbreakstart",
	AD_PLAY: "adplay",
	AD_PLAYING: "adplaying",
	AD_PAUSE: "adpause",
	AD_FIRST_QUARTILE: "adfirstquartile",
	AD_MID_POINT: "admidpoint",
	AD_THIRD_QUARTILE: "adthirdquartile",
	AD_ENDED: "adended",
	AD_BREAK_END: "adbreakend",
	AD_ERROR: "aderror",
	REQUEST_COMPLETED: "requestcompleted",
	REQUEST_FAILED: "requestfailed",
	REQUEST_CANCELLED: "requestcanceled",
	HEARTBEAT: "hb",
	DESTROY: "destroy"
}, Hl = "mux-embed", Fl = "5.17.10", Yl = "2.1", Y = {}, ze = function(e) {
	var t = arguments;
	typeof e == "string" ? ze.hasOwnProperty(e) ? Kt.default.setTimeout(function() {
		t = Array.prototype.splice.call(t, 1), ze[e].apply(null, t);
	}, 0) : B.warn("`" + e + "` is an unknown task") : typeof e == "function" ? Kt.default.setTimeout(function() {
		e(ze);
	}, 0) : B.warn("`" + e + "` is invalid.");
}, Vl = {
	loaded: X.now(),
	NAME: Hl,
	VERSION: Fl,
	API_VERSION: Yl,
	PLAYER_TRACKED: !1,
	monitor: function(e, t) {
		return Sl(ze, e, t);
	},
	destroyMonitor: function(e) {
		var a = Ue(wa(e), 1)[0];
		a && a.mux && typeof a.mux.destroy == "function" ? a.mux.destroy() : B.error("A video element monitor for `" + e + "` has not been initialized via `mux.monitor`.");
	},
	addHLSJS: function(e, t) {
		var a = he(e);
		Y[a] ? Y[a].addHLSJS(t) : B.error("A monitor for `" + a + "` has not been initialized.");
	},
	addDashJS: function(e, t) {
		var a = he(e);
		Y[a] ? Y[a].addDashJS(t) : B.error("A monitor for `" + a + "` has not been initialized.");
	},
	removeHLSJS: function(e) {
		var t = he(e);
		Y[t] ? Y[t].removeHLSJS() : B.error("A monitor for `" + t + "` has not been initialized.");
	},
	removeDashJS: function(e) {
		var t = he(e);
		Y[t] ? Y[t].removeDashJS() : B.error("A monitor for `" + t + "` has not been initialized.");
	},
	init: function(e, t) {
		nr() && t && t.respectDoNotTrack && B.info("The browser's Do Not Track flag is enabled - Mux beaconing is disabled.");
		var a = he(e);
		Y[a] = new Rl(ze, a, t);
	},
	emit: function(e, t, a) {
		var r = he(e);
		Y[r] ? (Y[r].emit(t, a), t === "destroy" && delete Y[r]) : B.error("A monitor for `" + r + "` has not been initialized.");
	},
	updateData: function(e, t) {
		var a = he(e);
		Y[a] ? Y[a].emit("hb", t) : B.error("A monitor for `" + a + "` has not been initialized.");
	},
	setEmitTranslator: function(e, t) {
		var a = he(e);
		Y[a] ? Y[a].emitTranslator = t : B.error("A monitor for `" + a + "` has not been initialized.");
	},
	setStateDataTranslator: function(e, t) {
		var a = he(e);
		Y[a] ? Y[a].stateDataTranslator = t : B.error("A monitor for `" + a + "` has not been initialized.");
	},
	setGetPlayheadTime: function(e, t) {
		var a = he(e);
		Y[a] ? Y[a].getPlayheadTime = t : B.error("A monitor for `" + a + "` has not been initialized.");
	},
	checkDoNotTrack: nr,
	log: B,
	utils: Kl,
	events: Wl,
	WINDOW_HIDDEN: !1,
	WINDOW_UNLOADING: !1
};
Object.assign(ze, Vl);
typeof Kt.default < "u" && typeof Kt.default.addEventListener == "function" && Kt.default.addEventListener("pagehide", function(e) {
	e.persisted || (ze.WINDOW_UNLOADING = !0);
}, !1);
var Cr = ze;
/*!
* JavaScript Cookie v2.1.3
* https://github.com/js-cookie/js-cookie
*
* Copyright 2006, 2015 Klaus Hartl & Fagner Brack
* Released under the MIT license
*/
var P = at$1, $ = {
	VIDEO: "video",
	THUMBNAIL: "thumbnail",
	STORYBOARD: "storyboard",
	DRM: "drm"
}, C = {
	NOT_AN_ERROR: 0,
	NETWORK_OFFLINE: 2000002,
	NETWORK_UNKNOWN_ERROR: 2e6,
	NETWORK_NO_STATUS: 2000001,
	NETWORK_INVALID_URL: 24e5,
	NETWORK_NOT_FOUND: 2404e3,
	NETWORK_NOT_READY: 2412e3,
	NETWORK_GENERIC_SERVER_FAIL: 25e5,
	NETWORK_TOKEN_MISSING: 2403201,
	NETWORK_TOKEN_MALFORMED: 2412202,
	NETWORK_TOKEN_EXPIRED: 2403210,
	NETWORK_TOKEN_AUD_MISSING: 2403221,
	NETWORK_TOKEN_AUD_MISMATCH: 2403222,
	NETWORK_TOKEN_SUB_MISMATCH: 2403232,
	ENCRYPTED_ERROR: 5e6,
	ENCRYPTED_UNSUPPORTED_KEY_SYSTEM: 5000001,
	ENCRYPTED_GENERATE_REQUEST_FAILED: 5000002,
	ENCRYPTED_UPDATE_LICENSE_FAILED: 5000003,
	ENCRYPTED_UPDATE_SERVER_CERT_FAILED: 5000004,
	ENCRYPTED_CDM_ERROR: 5000005,
	ENCRYPTED_OUTPUT_RESTRICTED: 5000006,
	ENCRYPTED_MISSING_TOKEN: 5000002
}, Ma = (e) => e === $.VIDEO ? "playback" : e, We = class Nt extends Error {
	constructor(t, a = Nt.MEDIA_ERR_CUSTOM, r, i) {
		var n;
		super(t), this.name = "MediaError", this.code = a, this.context = i, this.fatal = r ?? (a >= Nt.MEDIA_ERR_NETWORK && a <= Nt.MEDIA_ERR_ENCRYPTED), this.message || (this.message = (n = Nt.defaultMessages[this.code]) != null ? n : "");
	}
};
We.MEDIA_ERR_ABORTED = 1, We.MEDIA_ERR_NETWORK = 2, We.MEDIA_ERR_DECODE = 3, We.MEDIA_ERR_SRC_NOT_SUPPORTED = 4, We.MEDIA_ERR_ENCRYPTED = 5, We.MEDIA_ERR_CUSTOM = 100, We.defaultMessages = {
	1: "You aborted the media playback",
	2: "A network error caused the media download to fail.",
	3: "A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.",
	4: "An unsupported error occurred. The server or network failed, or your browser does not support this format.",
	5: "The media is encrypted and there are no keys to decrypt it."
};
var A = We, jl = (e) => e == null, Dr = (e, t) => jl(t) ? !1 : e in t, lr = {
	ANY: "any",
	MUTED: "muted"
}, U = {
	ON_DEMAND: "on-demand",
	LIVE: "live",
	UNKNOWN: "unknown"
}, Ce = {
	MSE: "mse",
	NATIVE: "native"
}, xt = {
	HEADER: "header",
	QUERY: "query",
	NONE: "none"
}, Sa = Object.values(xt), Pe = {
	M3U8: "application/vnd.apple.mpegurl",
	MP4: "video/mp4"
}, ei = { HLS: Pe.M3U8 };
[...Object.values(Pe)];
var hm = {
	upTo720p: "720p",
	upTo1080p: "1080p",
	upTo1440p: "1440p",
	upTo2160p: "2160p"
}, vm = {
	noLessThan480p: "480p",
	noLessThan540p: "540p",
	noLessThan720p: "720p",
	noLessThan1080p: "1080p",
	noLessThan1440p: "1440p",
	noLessThan2160p: "2160p"
}, fm = { DESCENDING: "desc" }, ur = { code: "en" }, z = (e, t, a, r, i = e) => {
	i.addEventListener(t, a, r), e.addEventListener("teardown", () => {
		i.removeEventListener(t, a);
	}, { once: !0 });
};
function zl(e, t, a) {
	t && a > t && (a = t);
	for (let r = 0; r < e.length; r++) if (e.start(r) <= a && e.end(r) >= a) return !0;
	return !1;
}
var Sr = (e) => {
	let t = e.indexOf("?");
	if (t < 0) return [e];
	return [e.slice(0, t), e.slice(t)];
}, Ua = (e) => {
	let { type: t } = e;
	if (t) {
		let a = t.toUpperCase();
		return Dr(a, ei) ? ei[a] : t;
	}
	return Zl(e);
}, pn = (e) => e === "VOD" ? U.ON_DEMAND : U.LIVE, hn = (e) => e === "EVENT" ? Number.POSITIVE_INFINITY : e === "VOD" ? NaN : 0, Zl = (e) => {
	let { src: t } = e;
	if (!t) return "";
	let a = "";
	try {
		a = new URL(t).pathname;
	} catch {
		console.error("invalid url");
	}
	let r = a.lastIndexOf(".");
	if (r < 0) return Ql(e) ? Pe.M3U8 : "";
	let i = a.slice(r + 1).toUpperCase();
	return Dr(i, Pe) ? Pe[i] : "";
}, Xl = "mux.com", Ql = ({ src: e, customDomain: t = Xl }) => {
	let a;
	try {
		a = new URL(`${e}`);
	} catch {
		return !1;
	}
	let r = a.protocol === "https:", i = a.hostname === `stream.${t}`.toLowerCase(), n = a.pathname.split("/"), s = n.length === 2, o = !(n != null && n[1].includes("."));
	return r && i && s && o;
}, _t = (e) => {
	let t = (e ?? "").split(".")[1];
	if (t) try {
		let a = t.replace(/-/g, "+").replace(/_/g, "/"), r = decodeURIComponent(atob(a).split("").map(function(i) {
			return "%" + ("00" + i.charCodeAt(0).toString(16)).slice(-2);
		}).join(""));
		return JSON.parse(r);
	} catch {
		return;
	}
}, Jl = ({ exp: e }, t = Date.now()) => !e || e * 1e3 < t, eu = ({ sub: e }, t) => e !== t, tu = ({ aud: e }, t) => !e, au = ({ aud: e }, t) => e !== t, vn = "en";
function R(e, t = !0) {
	var a, r;
	return new ru(t && (r = (a = ur) == null ? void 0 : a[e]) != null ? r : e, t ? ur.code : vn);
}
var ru = class {
	constructor(t, a = ((r) => (r = ur) != null ? r : vn)()) {
		this.message = t, this.locale = a;
	}
	format(t) {
		return this.message.replace(/\{(\w+)\}/g, (a, r) => {
			var i;
			return (i = t[r]) != null ? i : "";
		});
	}
	toString() {
		return this.message;
	}
}, iu = Object.values(lr), ti = (e) => typeof e == "boolean" || typeof e == "string" && iu.includes(e), nu = (e, t, a) => {
	let { autoplay: r } = e, i = !1, n = !1, s = ti(r) ? r : !!r, o = () => {
		i || z(t, "playing", () => {
			i = !0;
		}, { once: !0 });
	};
	if (o(), z(t, "loadstart", () => {
		i = !1, o(), Za(t, s);
	}, { once: !0 }), z(t, "loadstart", () => {
		a || (e.streamType && e.streamType !== U.UNKNOWN ? n = e.streamType === U.LIVE : n = !Number.isFinite(t.duration)), Za(t, s);
	}, { once: !0 }), a && a.once(P.Events.LEVEL_LOADED, (l, u) => {
		var m;
		e.streamType && e.streamType !== U.UNKNOWN ? n = e.streamType === U.LIVE : n = (m = u.details.live) != null ? m : !1;
	}), !s) {
		let l = () => {
			!n || Number.isFinite(e.startTime) || (a != null && a.liveSyncPosition ? t.currentTime = a.liveSyncPosition : Number.isFinite(t.seekable.end(0)) && (t.currentTime = t.seekable.end(0)));
		};
		a && z(t, "play", () => {
			t.preload === "metadata" ? a.once(P.Events.LEVEL_UPDATED, l) : l();
		}, { once: !0 });
	}
	return (l) => {
		i || (s = ti(l) ? l : !!l, Za(t, s));
	};
}, Za = (e, t) => {
	if (!t) return;
	let a = e.muted, r = () => e.muted = a;
	switch (t) {
		case lr.ANY:
			e.play().catch(() => {
				e.muted = !0, e.play().catch(r);
			});
			break;
		case lr.MUTED:
			e.muted = !0, e.play().catch(r);
			break;
		default:
			e.play().catch(() => {});
			break;
	}
}, su = ({ preload: e, src: t }, a, r) => {
	let i = (p) => {
		p != null && [
			"",
			"none",
			"metadata",
			"auto"
		].includes(p) ? a.setAttribute("preload", p) : a.removeAttribute("preload");
	};
	if (!r) return i(e), i;
	let n = !1, s = !1, o = r.config.maxBufferLength, l = r.config.maxBufferSize, u = (p) => {
		i(p);
		let c = p ?? a.preload;
		s || c === "none" || (c === "metadata" ? (r.config.maxBufferLength = 1, r.config.maxBufferSize = 1) : (r.config.maxBufferLength = o, r.config.maxBufferSize = l), m());
	}, m = () => {
		!n && t && (n = !0, r.loadSource(t));
	};
	return z(a, "play", () => {
		s = !0, r.config.maxBufferLength = o, r.config.maxBufferSize = l, m();
	}, { once: !0 }), u(e), u;
};
function ou(e, t) {
	var a;
	if (!("videoTracks" in e)) return;
	let r = /* @__PURE__ */ new WeakMap();
	t.on(P.Events.MANIFEST_PARSED, function(u, m) {
		l();
		let p = e.addVideoTrack("main");
		p.selected = !0;
		for (let [c, d] of m.levels.entries()) {
			let h = p.addRendition(d.url[0], d.width, d.height, d.videoCodec, d.bitrate);
			r.set(d, `${c}`), h.id = `${c}`;
		}
	}), t.on(P.Events.AUDIO_TRACKS_UPDATED, function(u, m) {
		o();
		for (let p of m.audioTracks) {
			let c = p.default ? "main" : "alternative", d = e.addAudioTrack(c, p.name, p.lang);
			d.id = `${p.id}`, p.default && (d.enabled = !0);
		}
	});
	let i = () => {
		var u;
		let m = +((u = [...e.audioTracks].find((c) => c.enabled)) == null ? void 0 : u.id), p = t.audioTracks.map((c) => c.id);
		m != t.audioTrack && p.includes(m) && (t.audioTrack = m);
	};
	e.audioTracks.addEventListener("change", i), t.on(P.Events.LEVELS_UPDATED, function(u, m) {
		var p;
		let c = e.videoTracks[(p = e.videoTracks.selectedIndex) != null ? p : 0];
		if (!c) return;
		let d = m.levels.map((h) => r.get(h));
		for (let h of e.videoRenditions) h.id && !d.includes(h.id) && c.removeRendition(h);
	});
	let n = (u) => {
		let m = u.target.selectedIndex;
		m != t.nextLevel && (t.nextLevel = m);
	};
	(a = e.videoRenditions) == null || a.addEventListener("change", n);
	let s = () => {
		for (let u of e.videoTracks) e.removeVideoTrack(u);
	}, o = () => {
		for (let u of e.audioTracks) e.removeAudioTrack(u);
	}, l = () => {
		s(), o();
	};
	t.once(P.Events.DESTROYING, () => {
		var u, m;
		l(), (u = e.audioTracks) == null || u.removeEventListener("change", i), (m = e.videoRenditions) == null || m.removeEventListener("change", n);
	});
}
var Xa = (e) => "time" in e ? e.time : e.startTime;
function lu(e, t) {
	t.on(P.Events.NON_NATIVE_TEXT_TRACKS_FOUND, (i, { tracks: n }) => {
		n.forEach((s) => {
			var o, l;
			let u = (o = s.subtitleTrack) != null ? o : s.closedCaptions, m = t.subtitleTracks.findIndex(({ lang: c, name: d, type: h }) => c == u?.lang && d === s.label && h.toLowerCase() === s.kind), p = ((l = s._id) != null ? l : s.default) ? "default" : `${s.kind}${m}`;
			Or(e, s.kind, s.label, u?.lang, p, s.default);
		});
	});
	let a = () => {
		if (!t.subtitleTracks.length) return;
		let i = Array.from(e.textTracks).find((o) => o.id && o.mode === "showing" && ["subtitles", "captions"].includes(o.kind));
		if (!i) return;
		let n = t.subtitleTracks[t.subtitleTrack], s = n ? n.default ? "default" : `${t.subtitleTracks[t.subtitleTrack].type.toLowerCase()}${t.subtitleTrack}` : void 0;
		if (t.subtitleTrack < 0 || i?.id !== s) t.subtitleTrack = t.subtitleTracks.findIndex(({ lang: l, name: u, type: m, default: p }) => i.id === "default" && p || l == i.language && u === i.label && m.toLowerCase() === i.kind);
		i?.id === s && i.cues && Array.from(i.cues).forEach((o) => {
			i.addCue(o);
		});
	};
	e.textTracks.addEventListener("change", a), t.on(P.Events.CUES_PARSED, (i, { track: n, cues: s }) => {
		let o = e.textTracks.getTrackById(n);
		if (!o) return;
		let l = o.mode === "disabled";
		l && (o.mode = "hidden"), s.forEach((u) => {
			var m;
			(m = o.cues) != null && m.getCueById(u.id) || o.addCue(u);
		}), l && (o.mode = "disabled");
	}), t.once(P.Events.DESTROYING, () => {
		e.textTracks.removeEventListener("change", a), e.querySelectorAll("track[data-removeondestroy]").forEach((i) => {
			i.remove();
		});
	});
	let r = () => {
		Array.from(e.textTracks).forEach((i) => {
			var n, s;
			if (!["subtitles", "caption"].includes(i.kind) && (i.label === "thumbnails" || i.kind === "chapters")) {
				if (!((n = i.cues) != null && n.length)) {
					let o = "track";
					i.kind && (o += `[kind="${i.kind}"]`), i.label && (o += `[label="${i.label}"]`);
					let l = e.querySelector(o), u = (s = l?.getAttribute("src")) != null ? s : "";
					l?.removeAttribute("src"), setTimeout(() => {
						l?.setAttribute("src", u);
					}, 0);
				}
				i.mode !== "hidden" && (i.mode = "hidden");
			}
		});
	};
	t.once(P.Events.MANIFEST_LOADED, r), t.once(P.Events.MEDIA_ATTACHED, r);
}
function Or(e, t, a, r, i, n) {
	let s = document.createElement("track");
	return s.kind = t, s.label = a, r && (s.srclang = r), i && (s.id = i), n && (s.default = !0), s.track.mode = ["subtitles", "captions"].includes(t) ? "disabled" : "hidden", s.setAttribute("data-removeondestroy", ""), e.append(s), s.track;
}
function uu(e, t) {
	Array.prototype.find.call(e.querySelectorAll("track"), (r) => r.track === t)?.remove();
}
function zt(e, t, a) {
	var r;
	return (r = Array.from(e.querySelectorAll("track")).find((i) => i.track.label === t && i.track.kind === a)) == null ? void 0 : r.track;
}
async function fn(e, t, a, r) {
	let i = zt(e, a, r);
	return i || (i = Or(e, r, a), i.mode = "hidden", await new Promise((n) => setTimeout(() => n(void 0), 0))), i.mode !== "hidden" && (i.mode = "hidden"), [...t].sort((n, s) => Xa(s) - Xa(n)).forEach((n) => {
		var s, o;
		let l = n.value, u = Xa(n);
		if ("endTime" in n && n.endTime != null) i?.addCue(new VTTCue(u, n.endTime, r === "chapters" ? l : JSON.stringify(l ?? null)));
		else {
			let m = Array.prototype.findIndex.call(i?.cues, (h) => h.startTime >= u), p = (s = i?.cues) == null ? void 0 : s[m], c = p ? p.startTime : Number.isFinite(e.duration) ? e.duration : Number.MAX_SAFE_INTEGER, d = (o = i?.cues) == null ? void 0 : o[m - 1];
			d && (d.endTime = u), i?.addCue(new VTTCue(u, c, r === "chapters" ? l : JSON.stringify(l ?? null)));
		}
	}), e.textTracks.dispatchEvent(new Event("change", {
		bubbles: !0,
		composed: !0
	})), i;
}
var Nr = "cuepoints", bn = Object.freeze({ label: Nr });
async function _n(e, t, a = bn) {
	return fn(e, t, a.label, "metadata");
}
var dr = (e) => ({
	time: e.startTime,
	value: JSON.parse(e.text)
});
function du(e, t = { label: Nr }) {
	let a = zt(e, t.label, "metadata");
	return a != null && a.cues ? Array.from(a.cues, (r) => dr(r)) : [];
}
function yn(e, t = { label: Nr }) {
	var a, r;
	let i = zt(e, t.label, "metadata");
	if (!((a = i?.activeCues) != null && a.length)) return;
	if (i.activeCues.length === 1) return dr(i.activeCues[0]);
	let { currentTime: n } = e;
	return dr(Array.prototype.find.call((r = i.activeCues) != null ? r : [], ({ startTime: o, endTime: l }) => o <= n && l > n) || i.activeCues[0]);
}
async function cu(e, t = bn) {
	return new Promise((a) => {
		z(e, "loadstart", async () => {
			let r = await _n(e, [], t);
			z(e, "cuechange", () => {
				let i = yn(e);
				if (i) {
					let n = new CustomEvent("cuepointchange", {
						composed: !0,
						bubbles: !0,
						detail: i
					});
					e.dispatchEvent(n);
				}
			}, {}, r), a(r);
		});
	});
}
var xr = "chapters", gn = Object.freeze({ label: xr }), cr = (e) => ({
	startTime: e.startTime,
	endTime: e.endTime,
	value: e.text
});
async function En(e, t, a = gn) {
	return fn(e, t, a.label, "chapters");
}
function mu(e, t = { label: xr }) {
	var a;
	let r = zt(e, t.label, "chapters");
	return (a = r?.cues) != null && a.length ? Array.from(r.cues, (i) => cr(i)) : [];
}
function Tn(e, t = { label: xr }) {
	var a, r;
	let i = zt(e, t.label, "chapters");
	if (!((a = i?.activeCues) != null && a.length)) return;
	if (i.activeCues.length === 1) return cr(i.activeCues[0]);
	let { currentTime: n } = e;
	return cr(Array.prototype.find.call((r = i.activeCues) != null ? r : [], ({ startTime: o, endTime: l }) => o <= n && l > n) || i.activeCues[0]);
}
async function pu(e, t = gn) {
	return new Promise((a) => {
		z(e, "loadstart", async () => {
			let r = await En(e, [], t);
			z(e, "cuechange", () => {
				let i = Tn(e);
				if (i) {
					let n = new CustomEvent("chapterchange", {
						composed: !0,
						bubbles: !0,
						detail: i
					});
					e.dispatchEvent(n);
				}
			}, {}, r), a(r);
		});
	});
}
function hu(e, t) {
	if (t) {
		let a = t.playingDate;
		if (a != null) return /* @__PURE__ */ new Date(a.getTime() - e.currentTime * 1e3);
	}
	return typeof e.getStartDate == "function" ? e.getStartDate() : /* @__PURE__ */ new Date(NaN);
}
function vu(e, t) {
	if (t && t.playingDate) return t.playingDate;
	if (typeof e.getStartDate == "function") {
		let a = e.getStartDate();
		return new Date(a.getTime() + e.currentTime * 1e3);
	}
	return /* @__PURE__ */ new Date(NaN);
}
var Wt = {
	VIDEO: "v",
	THUMBNAIL: "t",
	STORYBOARD: "s",
	DRM: "d"
}, fu = (e) => {
	if (e === $.VIDEO) return Wt.VIDEO;
	if (e === $.DRM) return Wt.DRM;
}, bu = (e, t) => {
	var a, r;
	let i = Ma(e), n = `${i}Token`;
	return (a = t.tokens) != null && a[i] ? (r = t.tokens) == null ? void 0 : r[i] : Dr(n, t) ? t[n] : void 0;
}, Oa = (e, t, a, r, i = !1, n = !((s) => (s = globalThis.navigator) == null ? void 0 : s.onLine)()) => {
	var s, o;
	if (n) {
		let g = R("Your device appears to be offline", i), b, f = A.MEDIA_ERR_NETWORK, T = new A(g, f, !1, b);
		return T.errorCategory = t, T.muxCode = C.NETWORK_OFFLINE, T.data = e, T;
	}
	let l = "status" in e ? e.status : e.code, u = Date.now(), m = A.MEDIA_ERR_NETWORK;
	if (l === 200) return;
	let p = Ma(t), c = bu(t, a), d = fu(t), [h] = Sr((s = a.playbackId) != null ? s : "");
	if (!l || !h) return;
	let y = _t(c);
	if (c && !y) {
		let f = new A(R("The {tokenNamePrefix}-token provided is invalid or malformed.", i).format({ tokenNamePrefix: p }), m, !0, R("Compact JWT string: {token}", i).format({ token: c }));
		return f.errorCategory = t, f.muxCode = C.NETWORK_TOKEN_MALFORMED, f.data = e, f;
	}
	if (l >= 500) {
		let g = new A("", m, r ?? !0);
		return g.errorCategory = t, g.muxCode = C.NETWORK_UNKNOWN_ERROR, g;
	}
	if (l === 403) if (y) {
		if (Jl(y, u)) {
			let g = {
				timeStyle: "medium",
				dateStyle: "medium"
			}, T = new A(R("The video’s secured {tokenNamePrefix}-token has expired.", i).format({ tokenNamePrefix: p }), m, !0, R("Expired at: {expiredDate}. Current time: {currentDate}.", i).format({
				expiredDate: new Intl.DateTimeFormat("en", g).format((o = y.exp) != null ? o : 0),
				currentDate: new Intl.DateTimeFormat("en", g).format(u)
			}));
			return T.errorCategory = t, T.muxCode = C.NETWORK_TOKEN_EXPIRED, T.data = e, T;
		}
		if (eu(y, h)) {
			let f = new A(R("The video’s playback ID does not match the one encoded in the {tokenNamePrefix}-token.", i).format({ tokenNamePrefix: p }), m, !0, R("Specified playback ID: {playbackId} and the playback ID encoded in the {tokenNamePrefix}-token: {tokenPlaybackId}", i).format({
				tokenNamePrefix: p,
				playbackId: h,
				tokenPlaybackId: y.sub
			}));
			return f.errorCategory = t, f.muxCode = C.NETWORK_TOKEN_SUB_MISMATCH, f.data = e, f;
		}
		if (tu(y)) {
			let f = new A(R("The {tokenNamePrefix}-token is formatted with incorrect information.", i).format({ tokenNamePrefix: p }), m, !0, R("The {tokenNamePrefix}-token has no aud value. aud value should be {expectedAud}.", i).format({
				tokenNamePrefix: p,
				expectedAud: d
			}));
			return f.errorCategory = t, f.muxCode = C.NETWORK_TOKEN_AUD_MISSING, f.data = e, f;
		}
		if (au(y, d)) {
			let f = new A(R("The {tokenNamePrefix}-token is formatted with incorrect information.", i).format({ tokenNamePrefix: p }), m, !0, R("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.", i).format({
				tokenNamePrefix: p,
				expectedAud: d,
				aud: y.aud
			}));
			return f.errorCategory = t, f.muxCode = C.NETWORK_TOKEN_AUD_MISMATCH, f.data = e, f;
		}
	} else {
		let g = R("Authorization error trying to access this {category} URL. If this is a signed URL, you might need to provide a {tokenNamePrefix}-token.", i).format({
			tokenNamePrefix: p,
			category: t
		}), b = R("Specified playback ID: {playbackId}", i).format({ playbackId: h }), f = new A(g, m, r ?? !0, b);
		return f.errorCategory = t, f.muxCode = C.NETWORK_TOKEN_MISSING, f.data = e, f;
	}
	if (l === 412) {
		let g = R("This playback-id may belong to a live stream that is not currently active or an asset that is not ready.", i), b = R("Specified playback ID: {playbackId}", i).format({ playbackId: h }), f = new A(g, m, r ?? !0, b);
		return f.errorCategory = t, f.muxCode = C.NETWORK_NOT_READY, f.streamType = a.streamType === U.LIVE ? "live" : a.streamType === U.ON_DEMAND ? "on-demand" : "unknown", f.data = e, f;
	}
	if (l === 404) {
		let g = R("This URL or playback-id does not exist. You may have used an Asset ID or an ID from a different resource.", i), b = R("Specified playback ID: {playbackId}", i).format({ playbackId: h }), f = new A(g, m, r ?? !0, b);
		return f.errorCategory = t, f.muxCode = C.NETWORK_NOT_FOUND, f.data = e, f;
	}
	if (l === 400) {
		let g = R("The URL or playback-id was invalid. You may have used an invalid value as a playback-id."), b = R("Specified playback ID: {playbackId}", i).format({ playbackId: h }), f = new A(g, m, r ?? !0, b);
		return f.errorCategory = t, f.muxCode = C.NETWORK_INVALID_URL, f.data = e, f;
	}
	let _ = new A("", m, r ?? !0);
	return _.errorCategory = t, _.muxCode = C.NETWORK_UNKNOWN_ERROR, _.data = e, _;
}, ai = P.DefaultConfig.capLevelController, _u = {
	"720p": 921600,
	"1080p": 2073600,
	"1440p": 4194304,
	"2160p": 8294400
};
function yu(e) {
	return _u[e.toLowerCase().trim()];
}
var mr = class It extends ai {
	constructor(t) {
		super(t);
	}
	static setMaxAutoResolution(t, a) {
		a ? It.maxAutoResolution.set(t, a) : It.maxAutoResolution.delete(t);
	}
	getMaxAutoResolution() {
		var t;
		let a = this.hls;
		return (t = It.maxAutoResolution.get(a)) != null ? t : void 0;
	}
	get levels() {
		var t;
		return (t = this.hls.levels) != null ? t : [];
	}
	getValidLevels(t) {
		return this.levels.filter((a, r) => this.isLevelAllowed(a) && r <= t);
	}
	getMaxLevelCapped(t) {
		let a = this.getValidLevels(t), r = this.getMaxAutoResolution();
		if (!r) return super.getMaxLevel(t);
		let i = yu(r);
		if (!i) return super.getMaxLevel(t);
		let n = a.filter((l) => l.width * l.height <= i), s = n.findIndex((l) => l.width * l.height === i);
		if (s !== -1) {
			let l = n[s];
			return a.findIndex((u) => u === l);
		}
		if (n.length === 0) return 0;
		let o = n[n.length - 1];
		return a.findIndex((l) => l === o);
	}
	getMaxLevel(t) {
		if (this.getMaxAutoResolution() !== void 0) return this.getMaxLevelCapped(t);
		let a = super.getMaxLevel(t), r = this.getValidLevels(t);
		if (!r[a]) return a;
		let i = Math.min(r[a].width, r[a].height), n = It.minMaxResolution;
		return i >= n ? a : ai.getMaxLevelByMediaSize(r, n * (16 / 9), n);
	}
};
mr.minMaxResolution = 720, mr.maxAutoResolution = /* @__PURE__ */ new WeakMap();
var pr = mr, Eu = "com.apple.fps.1_0", Tu = "application/vnd.apple.mpegurl", ku = ({ mediaEl: e, getAppCertificate: t, getLicenseKey: a, saveAndDispatchError: r, drmTypeCb: i }) => {
	if (!window.WebKitMediaKeys || !("onwebkitneedkey" in e)) {
		console.error("No WebKitMediaKeys. FairPlay may not be supported");
		let d = new A(R("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."), A.MEDIA_ERR_ENCRYPTED, !0);
		return d.errorCategory = $.DRM, d.muxCode = C.ENCRYPTED_CDM_ERROR, r(e, d), () => {};
	}
	let n = e, s = t(), o = null, l = (c) => {
		(async () => {
			try {
				n.webkitKeys || u();
				let d = await s;
				if (c.initData === null || d == null) return;
				m(Au(c.initData, d));
			} catch (d) {
				console.error("Could not start encrypted playback due to exception", d), r(n, d);
			}
		})();
	}, u = () => {
		try {
			let c = new WebKitMediaKeys(Eu);
			n.webkitSetMediaKeys(c), i();
		} catch {
			let d = new A("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser.", A.MEDIA_ERR_ENCRYPTED, !0);
			throw d.errorCategory = $.DRM, d.muxCode = C.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM, d;
		}
	}, m = (c) => {
		let d = n.webkitKeys.createSession(Tu, c), h = async (g) => {
			try {
				let b = g.message, f = await a(b);
				d.update(f);
			} catch (b) {
				console.error("Error on FairPlay session message", b), r(e, b);
			}
		}, y = (g) => {
			let b = g.target.error;
			if (!b) return;
			console.error(`Internal Webkit Key Session Error - sysCode: ${b.systemCode} code: ${b.code}`);
			let T = new A(R("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser."), A.MEDIA_ERR_ENCRYPTED, !0);
			T.errorCategory = $.DRM, T.muxCode = C.ENCRYPTED_CDM_ERROR, r(e, T);
		}, _ = () => {
			d.removeEventListener("webkitkeymessage", h), d.removeEventListener("webkitkeyerror", y), e.removeEventListener("teardown", _), "webkitCurrentPlaybackTargetIsWireless" in e && e.removeEventListener("webkitcurrentplaybacktargetiswirelesschanged", _), o = null;
			try {
				d.close();
			} catch {}
		};
		"webkitCurrentPlaybackTargetIsWireless" in e && e.addEventListener("webkitcurrentplaybacktargetiswirelesschanged", _, { once: !0 }), d.addEventListener("webkitkeymessage", h), d.addEventListener("webkitkeyerror", y), e.addEventListener("teardown", _), o = _;
	}, p = () => {
		e.removeEventListener("webkitneedkey", l), e.removeEventListener("teardown", p), o?.();
		try {
			n.webkitSetMediaKeys(null);
		} catch {}
	};
	return e.addEventListener("webkitneedkey", l), e.addEventListener("teardown", p, { once: !0 }), p;
}, Au = (e, t) => {
	let a = Ru(wu(e)), r = new Uint8Array(e), i = new Uint8Array(a), n = new Uint8Array(t), s = r.byteLength + 4 + n.byteLength + 4 + i.byteLength, o = new Uint8Array(s), l = 0, u = (p) => {
		o.set(p, l), l += p.byteLength;
	}, m = (p) => {
		let c = new DataView(o.buffer), d = p.byteLength;
		c.setUint32(l, d, !0), l += 4, u(p);
	};
	return u(r), m(i), m(n), o;
}, wu = (e) => new TextDecoder("utf-16le").decode(e).replace("skd://", "").slice(1);
function Ru(e) {
	let t = /* @__PURE__ */ new ArrayBuffer(e.length * 2), a = new DataView(t);
	for (let r = 0; r < e.length; r++) a.setUint16(r * 2, e.charCodeAt(r), !0);
	return t;
}
var Cu = ({ mediaEl: e, getAppCertificate: t, getLicenseKey: a, saveAndDispatchError: r, drmTypeCb: i, fallbackToWebkitFairplay: n }) => {
	let s = null, o = async (p) => {
		try {
			let c = p.initDataType;
			if (c !== "skd") {
				console.error(`Received unexpected initialization data type "${c}"`);
				return;
			}
			e.mediaKeys || await l(c);
			let d = p.initData;
			if (d == null) {
				console.error(`Could not start encrypted playback due to missing initData in ${p.type} event`);
				return;
			}
			await u(c, d);
		} catch (c) {
			r(e, c);
			return;
		}
	}, l = async (p) => {
		let c = await navigator.requestMediaKeySystemAccess("com.apple.fps", [{
			initDataTypes: [p],
			videoCapabilities: [{
				contentType: "application/vnd.apple.mpegurl",
				robustness: ""
			}],
			distinctiveIdentifier: "not-allowed",
			persistentState: "not-allowed",
			sessionTypes: ["temporary"]
		}]).then((h) => (i(), h)).catch(() => {
			let y = new A(R("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."), A.MEDIA_ERR_ENCRYPTED, !0);
			y.errorCategory = $.DRM, y.muxCode = C.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM, r(e, y);
		});
		if (!c) return;
		let d = await c.createMediaKeys();
		try {
			let h = await t();
			await d.setServerCertificate(h).catch(() => {
				let _ = new A(R("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate."), A.MEDIA_ERR_ENCRYPTED, !0);
				return _.errorCategory = $.DRM, _.muxCode = C.ENCRYPTED_UPDATE_SERVER_CERT_FAILED, Promise.reject(_);
			});
		} catch (h) {
			r(e, h);
			return;
		}
		await e.setMediaKeys(d);
	}, u = async (p, c) => {
		let d = e.mediaKeys.createSession(), h = async (g) => {
			let b = g.message, f = await a(b);
			try {
				await d.update(f);
			} catch {
				let w = new A(R("Failed to update DRM license. This may be an issue with the player or your protected content."), A.MEDIA_ERR_ENCRYPTED, !0);
				w.errorCategory = $.DRM, w.muxCode = C.ENCRYPTED_UPDATE_LICENSE_FAILED, r(e, w);
			}
		}, y = () => {
			let g = (b) => {
				let f;
				if (b === "internal-error") f = new A(R("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser."), A.MEDIA_ERR_ENCRYPTED, !0), f.errorCategory = $.DRM, f.muxCode = C.ENCRYPTED_CDM_ERROR;
				else if (b === "output-restricted" || b === "output-downscaled") f = new A(R("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen."), A.MEDIA_ERR_ENCRYPTED, !1), f.errorCategory = $.DRM, f.muxCode = C.ENCRYPTED_OUTPUT_RESTRICTED;
				f && r(e, f);
			};
			d.keyStatuses.forEach((b) => g(b));
		};
		d.addEventListener("keystatuseschange", y), d.addEventListener("message", h);
		let _ = async () => {
			d.removeEventListener("keystatuseschange", y), d.removeEventListener("message", h), "webkitCurrentPlaybackTargetIsWireless" in e && e.removeEventListener("webkitcurrentplaybacktargetiswirelesschanged", _), e.removeEventListener("teardown", _), await d.close().catch((g) => {
				console.warn("There was an error when closing EME session", g);
			}), s = null;
		};
		"webkitCurrentPlaybackTargetIsWireless" in e && e.addEventListener("webkitcurrentplaybacktargetiswirelesschanged", _, { once: !0 }), e.addEventListener("teardown", _, { once: !0 }), s = _, await d.generateRequest(p, c).catch(async (g) => {
			if (g.name === "NotSupportedError" && "webkitCurrentPlaybackTargetIsWireless" in e && e.webkitCurrentPlaybackTargetIsWireless) console.warn("Failed to generate a DRM license request. Attempting to fallback to Webkit DRM"), n?.();
			else {
				let f = new A(R("Failed to generate a DRM license request. This may be an issue with the player or your protected content."), A.MEDIA_ERR_ENCRYPTED, !0);
				return f.errorCategory = $.DRM, f.muxCode = C.ENCRYPTED_GENERATE_REQUEST_FAILED, console.error("Failed to generate license request", g), Promise.reject(f);
			}
		});
	}, m = async () => {
		e.removeEventListener("encrypted", o), e.removeEventListener("teardown", m), s && await s(), await e.setMediaKeys(null).catch(() => {});
	};
	return e.addEventListener("encrypted", o), e.addEventListener("teardown", m, { once: !0 }), m;
}, aa = {
	FAIRPLAY: "fairplay",
	PLAYREADY: "playready",
	WIDEVINE: "widevine"
}, Du = (e) => {
	if (e.includes("fps")) return aa.FAIRPLAY;
	if (e.includes("playready")) return aa.PLAYREADY;
	if (e.includes("widevine")) return aa.WIDEVINE;
}, Su = (e) => {
	let t = e.split(`
`).find((a, r, i) => r && i[r - 1].startsWith("#EXT-X-STREAM-INF"));
	return fetch(t).then((a) => a.status !== 200 ? Promise.reject(a) : a.text());
}, Ou = (e) => {
	let t = e.split(`
`).filter((r) => r.startsWith("#EXT-X-SESSION-DATA"));
	if (!t.length) return {};
	let a = {};
	for (let r of t) {
		let i = xu(r), n = i["DATA-ID"];
		n && (a[n] = { ...i });
	}
	return { sessionData: a };
}, Nu = /([A-Z0-9-]+)="?(.*?)"?(?:,|$)/g;
function xu(e) {
	let t = [...e.matchAll(Nu)];
	return Object.fromEntries(t.map(([, a, r]) => [a, r]));
}
var Iu = (e) => {
	var t, a, r;
	let i = e.split(`
`), n = (a = ((t = i.find((u) => u.startsWith("#EXT-X-PLAYLIST-TYPE"))) != null ? t : "").split(":")[1]) == null ? void 0 : a.trim(), s = pn(n), o = hn(n), l;
	if (s === U.LIVE) {
		let u = i.find((m) => m.startsWith("#EXT-X-PART-INF"));
		if (u) l = +u.split(":")[1].split("=")[1] * 2;
		else l = +(((r = i.find((c) => c.startsWith("#EXT-X-TARGETDURATION"))?.split(":")) == null ? void 0 : r[1]) ?? 6) * 3;
	}
	return {
		streamType: s,
		targetLiveWindow: o,
		liveEdgeStartOffset: l
	};
}, Lu = async (e, t) => {
	if (t === Pe.MP4) return {
		streamType: U.ON_DEMAND,
		targetLiveWindow: NaN,
		liveEdgeStartOffset: void 0,
		sessionData: void 0
	};
	if (t === Pe.M3U8) {
		let a = await fetch(e);
		if (!a.ok) return Promise.reject(a);
		let r = await a.text(), i = await Su(r);
		return {
			...Ou(r),
			...Iu(i)
		};
	}
	return console.error(`Media type ${t} is an unrecognized or unsupported type for src ${e}.`), {
		streamType: void 0,
		targetLiveWindow: void 0,
		liveEdgeStartOffset: void 0,
		sessionData: void 0
	};
}, Pu = async (e, t, a = Ua({ src: e })) => {
	var r, i, n, s;
	let { streamType: o, targetLiveWindow: l, liveEdgeStartOffset: u, sessionData: m } = await Lu(e, a), p = m?.["com.apple.hls.chapters"];
	(p != null && p.URI || p != null && p.VALUE.toLocaleLowerCase().startsWith("http")) && Ir((r = p.URI) != null ? r : p.VALUE, t), ((i = W.get(t)) != null ? i : {}).liveEdgeStartOffset = u, ((n = W.get(t)) != null ? n : {}).targetLiveWindow = l, t.dispatchEvent(new CustomEvent("targetlivewindowchange", {
		composed: !0,
		bubbles: !0
	})), ((s = W.get(t)) != null ? s : {}).streamType = o, t.dispatchEvent(new CustomEvent("streamtypechange", {
		composed: !0,
		bubbles: !0
	}));
}, Ir = async (e, t) => {
	var a, r;
	try {
		let i = await fetch(e);
		if (!i.ok) throw new Error(`Failed to fetch Mux metadata: ${i.status} ${i.statusText}`);
		let n = await i.json(), s = {};
		if (!((a = n?.[0]) != null && a.metadata)) return;
		for (let l of n[0].metadata) l.key && l.value && (s[l.key] = l.value);
		((r = W.get(t)) != null ? r : {}).metadata = s;
		let o = new CustomEvent("muxmetadata");
		t.dispatchEvent(o);
	} catch (i) {
		console.error(i);
	}
}, Mu = (e) => {
	var t;
	let a = e.type, r = pn(a), i = hn(a), n, s = !!((t = e.partList) != null && t.length);
	return r === U.LIVE && (n = s ? e.partTarget * 2 : e.targetduration * 3), {
		streamType: r,
		targetLiveWindow: i,
		liveEdgeStartOffset: n,
		lowLatency: s
	};
}, Uu = (e, t, a) => {
	var r, i, n, s, o, l, u, m;
	let { streamType: p, targetLiveWindow: c, liveEdgeStartOffset: d, lowLatency: h } = Mu(e);
	if (p === U.LIVE) {
		h ? (a.config.backBufferLength = (r = a.userConfig.backBufferLength) != null ? r : 4, a.config.maxFragLookUpTolerance = (i = a.userConfig.maxFragLookUpTolerance) != null ? i : .001, a.config.abrBandWidthUpFactor = (n = a.userConfig.abrBandWidthUpFactor) != null ? n : a.config.abrBandWidthFactor) : a.config.backBufferLength = (s = a.userConfig.backBufferLength) != null ? s : 8;
		let y = Object.freeze({
			get length() {
				return t.seekable.length;
			},
			start(_) {
				return t.seekable.start(_);
			},
			end(_) {
				var g;
				return _ > this.length || _ < 0 || Number.isFinite(t.duration) ? t.seekable.end(_) : (g = a.liveSyncPosition) != null ? g : t.seekable.end(_);
			}
		});
		((o = W.get(t)) != null ? o : {}).seekable = y;
	}
	((l = W.get(t)) != null ? l : {}).liveEdgeStartOffset = d, ((u = W.get(t)) != null ? u : {}).targetLiveWindow = c, t.dispatchEvent(new CustomEvent("targetlivewindowchange", {
		composed: !0,
		bubbles: !0
	})), ((m = W.get(t)) != null ? m : {}).streamType = p, t.dispatchEvent(new CustomEvent("streamtypechange", {
		composed: !0,
		bubbles: !0
	}));
}, ri, ii, kn = (ii = (ri = globalThis?.navigator) == null ? void 0 : ri.userAgent) != null ? ii : "", ni, si, oi, $u = (oi = (si = (ni = globalThis?.navigator) == null ? void 0 : ni.userAgentData) == null ? void 0 : si.platform) != null ? oi : "", Bu = kn.toLowerCase().includes("android") || ["x11", "android"].some((e) => $u.toLowerCase().includes(e)), Ku = (e) => /^((?!chrome|android).)*safari/i.test(kn) && !!e.canPlayType("application/vnd.apple.mpegurl"), W = /* @__PURE__ */ new WeakMap(), Me = "mux.com", li, ui, An = (ui = (li = P).isSupported) == null ? void 0 : ui.call(li), qu = (e) => Bu || !Ku(e), Lr = () => {
	if (typeof window < "u") return Cr.utils.now();
}, Wu = Cr.utils.generateUUID, hr = ({ playbackId: e, customDomain: t = Me, maxResolution: a, minResolution: r, renditionOrder: i, programStartTime: n, programEndTime: s, assetStartTime: o, assetEndTime: l, playbackToken: u, tokens: { playback: m = u } = {}, extraSourceParams: p = {} } = {}) => {
	if (!e) return;
	let [c, d = ""] = Sr(e), h = new URL(`https://stream.${t}/${c}.m3u8${d}`);
	return m || h.searchParams.has("token") ? (h.searchParams.forEach((y, _) => {
		_ != "token" && h.searchParams.delete(_);
	}), m && h.searchParams.set("token", m)) : (a && h.searchParams.set("max_resolution", a), r && (h.searchParams.set("min_resolution", r), a && +a.slice(0, -1) < +r.slice(0, -1) && console.error("minResolution must be <= maxResolution", "minResolution", r, "maxResolution", a)), i && h.searchParams.set("rendition_order", i), n && h.searchParams.set("program_start_time", `${n}`), s && h.searchParams.set("program_end_time", `${s}`), o && h.searchParams.set("asset_start_time", `${o}`), l && h.searchParams.set("asset_end_time", `${l}`), Object.entries(p).forEach(([y, _]) => {
		_ != null && h.searchParams.set(y, _);
	})), h.toString();
}, $a = (e) => {
	if (!e) return;
	let [t] = e.split("?");
	return t || void 0;
}, Pr = (e) => {
	if (!e || !e.startsWith("https://stream.")) return;
	let [t] = new URL(e).pathname.slice(1).split(/\.m3u8|\//);
	return t || void 0;
}, Hu = (e) => {
	var t, a, r;
	return (t = e?.metadata) != null && t.video_id ? e.metadata.video_id : In(e) && (r = (a = $a(e.playbackId)) != null ? a : Pr(e.src)) != null ? r : e.src;
}, wn = (e) => {
	var t;
	return (t = W.get(e)) == null ? void 0 : t.error;
}, Fu = (e) => {
	var t;
	return (t = W.get(e)) == null ? void 0 : t.metadata;
}, vr = (e) => {
	var t, a;
	return (a = (t = W.get(e)) == null ? void 0 : t.streamType) != null ? a : U.UNKNOWN;
}, Yu = (e) => {
	var t, a;
	return (a = (t = W.get(e)) == null ? void 0 : t.targetLiveWindow) != null ? a : NaN;
}, Mr = (e) => {
	var t, a;
	return (a = (t = W.get(e)) == null ? void 0 : t.seekable) != null ? a : e.seekable;
}, Vu = (e) => {
	var t;
	let a = (t = W.get(e)) == null ? void 0 : t.liveEdgeStartOffset;
	if (typeof a != "number") return NaN;
	let r = Mr(e);
	return r.length ? r.end(r.length - 1) - a : NaN;
}, ju = (e) => {
	var t;
	return (t = W.get(e)) == null ? void 0 : t.coreReference;
}, Ur = .034, Gu = (e, t, a = Ur) => Math.abs(e - t) <= a, Rn = (e, t, a = Ur) => e > t || Gu(e, t, a), zu = (e, t = Ur) => e.paused && Rn(e.currentTime, e.duration, t), Cn = (e, t) => {
	var a, r, i;
	if (!t || !e.buffered.length) return;
	if (e.readyState > 2) return !1;
	let n = t.currentLevel >= 0 ? (r = (a = t.levels) == null ? void 0 : a[t.currentLevel]) == null ? void 0 : r.details : (i = t.levels.find((p) => !!p.details)) == null ? void 0 : i.details;
	if (!n || n.live) return;
	let { fragments: s } = n;
	if (!(s != null && s.length)) return;
	if (e.currentTime < e.duration - (n.targetduration + .5)) return !1;
	let o = s[s.length - 1];
	if (e.currentTime <= o.start) return !1;
	let l = o.start + o.duration / 2, u = e.buffered.start(e.buffered.length - 1), m = e.buffered.end(e.buffered.length - 1);
	return l > u && l < m;
}, Dn = (e, t) => e.ended || e.loop ? e.ended : t && Cn(e, t) ? !0 : zu(e), Sn = (e, t, a) => {
	On(t, a, e);
	let { metadata: r = {} } = e, { view_session_id: i = Wu() } = r, n = Hu(e);
	r.view_session_id = i, r.video_id = n, e.metadata = r;
	let s = (c) => {
		var d;
		(d = t.mux) == null || d.emit("hb", { view_drm_type: c });
	};
	e.drmTypeCb = s, e.fallbackToWebkitFairplay = async () => {
		var c;
		let d = !t.paused, h = t.currentTime;
		e.useWebkitFairplay = !0;
		let y = e.muxDataKeepSession;
		e.muxDataKeepSession = !0;
		Sn(e, t, (c = W.get(t)) == null ? void 0 : c.coreReference), e.muxDataKeepSession = y, e.useWebkitFairplay = !1, d && await t.play().then(() => {
			t.currentTime = h;
		}).catch(() => {}), t.currentTime = h;
	}, W.set(t, { retryCount: 0 });
	let o = Zu(e, t), l = su(e, t, o);
	e != null && e.muxDataKeepSession && t != null && t.mux && !t.mux.deleted ? o && t.mux.addHLSJS({
		hlsjs: o,
		Hls: o ? P : void 0
	}) : rd(e, t, o), id(e, t, o), cu(t), pu(t);
	let m = {
		engine: o,
		setAutoplay: nu(e, t, o),
		setPreload: l
	}, p = W.get(t);
	return p && (p.coreReference = m), m;
}, On = (e, t, a) => {
	let r = t?.engine;
	e != null && e.mux && !e.mux.deleted && (a != null && a.muxDataKeepSession ? r && e.mux.removeHLSJS() : (e.mux.destroy(), delete e.mux)), r && (r.detachMedia(), r.destroy()), e && (e.hasAttribute("src") && (e.removeAttribute("src"), e.load()), e.removeEventListener("error", Pn), e.removeEventListener("error", fr), e.removeEventListener("durationchange", Ln), W.delete(e), e.dispatchEvent(new Event("teardown")));
};
function Nn(e, t) {
	var a;
	let r = Ua(e);
	if (r !== Pe.M3U8) return !0;
	let i = !r || ((a = t.canPlayType(r)) != null ? a : !0), { preferPlayback: n } = e, s = n === Ce.MSE, o = n === Ce.NATIVE, l = An && (s || qu(t));
	return i && (o || !l);
}
var Zu = (e, t) => {
	let { debug: a, streamType: r, startTime: i = -1, metadata: n, preferCmcd: s, _hlsConfig: o = {}, maxAutoResolution: l } = e, u = Ua(e) === Pe.M3U8, m = Nn(e, t);
	if (u && !m && An) {
		let p = {
			backBufferLength: 30,
			renderTextTracksNatively: !1,
			liveDurationInfinity: !0,
			capLevelOnFPSDrop: !0
		}, c = Xu(r), d = Qu(e), h = [xt.QUERY, xt.HEADER].includes(s) ? {
			useHeaders: s === xt.HEADER,
			sessionId: n?.view_session_id,
			contentId: n?.video_id
		} : void 0, y = ad(e), _ = new P({
			debug: a,
			startPosition: i,
			cmcd: h,
			xhrSetup: (g, b) => {
				var f, T;
				if (s && s !== xt.QUERY) return;
				let w = new URL(b);
				if (!w.searchParams.has("CMCD")) return;
				let D = ((T = (f = w.searchParams.get("CMCD")) == null ? void 0 : f.split(",")) != null ? T : []).filter((I) => I.startsWith("sid") || I.startsWith("cid")).join(",");
				w.searchParams.set("CMCD", D), g.open("GET", w);
			},
			...p,
			...y,
			...c,
			...d,
			...o
		});
		return y.capLevelController === pr && l !== void 0 && pr.setMaxAutoResolution(_, l), _.on(P.Events.MANIFEST_PARSED, async function(g, b) {
			var f, T;
			let w = (f = b.sessionData) == null ? void 0 : f["com.apple.hls.chapters"];
			(w != null && w.URI || w != null && w.VALUE.toLocaleLowerCase().startsWith("http")) && Ir((T = w?.URI) != null ? T : w?.VALUE, t);
		}), _;
	}
}, Xu = (e) => e === U.LIVE ? { backBufferLength: 8 } : {}, Qu = (e) => {
	let { tokens: { drm: t } = {}, playbackId: a, drmTypeCb: r } = e, i = $a(a);
	return !t || !i ? {} : {
		emeEnabled: !0,
		drmSystems: {
			"com.apple.fps": {
				licenseUrl: ra(e, "fairplay"),
				serverCertificateUrl: xn(e, "fairplay")
			},
			"com.widevine.alpha": { licenseUrl: ra(e, "widevine") },
			"com.microsoft.playready": { licenseUrl: ra(e, "playready") }
		},
		requestMediaKeySystemAccessFunc: (n, s) => (n === "com.widevine.alpha" && (s = [...s.map((o) => {
			var l;
			let u = (l = o.videoCapabilities) == null ? void 0 : l.map((m) => ({
				...m,
				robustness: "HW_SECURE_ALL"
			}));
			return {
				...o,
				videoCapabilities: u
			};
		}), ...s]), navigator.requestMediaKeySystemAccess(n, s).then((o) => {
			let l = Du(n);
			return r?.(l), o;
		}))
	};
}, Ju = async (e) => {
	let t = await fetch(e);
	return t.status !== 200 ? Promise.reject(t) : await t.arrayBuffer();
}, ed = async (e, t) => {
	let a = await fetch(t, {
		method: "POST",
		headers: { "Content-type": "application/octet-stream" },
		body: e
	});
	if (a.status !== 200) return Promise.reject(a);
	let r = await a.arrayBuffer();
	return new Uint8Array(r);
}, td = (e, t) => {
	let a = {
		mediaEl: t,
		getAppCertificate: () => Ju(xn(e, "fairplay")).catch((r) => {
			if (r instanceof Response) {
				let i = Oa(r, $.DRM, e);
				return console.error("mediaError", i?.message, i?.context), i ? Promise.reject(i) : Promise.reject(/* @__PURE__ */ new Error("Unexpected error in app cert request"));
			}
			return Promise.reject(r);
		}),
		getLicenseKey: (r) => ed(r, ra(e, "fairplay")).catch((i) => {
			if (i instanceof Response) {
				let n = Oa(i, $.DRM, e);
				return console.error("mediaError", n?.message, n?.context), n ? Promise.reject(n) : Promise.reject(/* @__PURE__ */ new Error("Unexpected error in license key request"));
			}
			return Promise.reject(i);
		}),
		saveAndDispatchError: je,
		drmTypeCb: () => {
			var r;
			(r = e.drmTypeCb) == null || r.call(e, aa.FAIRPLAY);
		}
	};
	if (e.useWebkitFairplay) ku(a);
	else {
		let i = Cu({
			fallbackToWebkitFairplay: async () => {
				var n;
				await i(), (n = e.fallbackToWebkitFairplay) == null || n.call(e);
			},
			...a
		});
	}
}, ra = ({ playbackId: e, tokens: { drm: t } = {}, customDomain: a = Me }, r) => {
	let i = $a(e);
	return `https://license.${a.toLocaleLowerCase().endsWith(Me) ? a : Me}/license/${r}/${i}?token=${t}`;
}, xn = ({ playbackId: e, tokens: { drm: t } = {}, customDomain: a = Me }, r) => {
	let i = $a(e);
	return `https://license.${a.toLocaleLowerCase().endsWith(Me) ? a : Me}/appcert/${r}/${i}?token=${t}`;
}, In = ({ playbackId: e, src: t, customDomain: a }) => {
	if (e) return !0;
	if (typeof t != "string") return !1;
	let r = window?.location.href, i = new URL(t, r).hostname.toLocaleLowerCase();
	return i.includes(Me) || !!a && i.includes(a.toLocaleLowerCase());
}, ad = (e, t) => {
	let a = {};
	return a.capLevelToPlayerSize = e.capRenditionToPlayerSize, a.capLevelToPlayerSize == null ? (a.capLevelController = pr, a.capLevelToPlayerSize = !0) : a.capLevelController = Pi$1, a;
}, rd = (e, t, a) => {
	var r;
	let { envKey: i, disableTracking: n, muxDataSDK: s = Cr, muxDataSDKOptions: o = {} } = e, l = In(e);
	if (!n && (i || l)) {
		let { playerInitTime: u, playerSoftwareName: m, playerSoftwareVersion: p, beaconCollectionDomain: c, debug: d, disableCookies: h } = e, y = {
			...e.metadata,
			video_title: ((r = e?.metadata) == null ? void 0 : r.video_title) || void 0
		}, _ = (g) => typeof g.player_error_code == "string" ? !1 : typeof e.errorTranslator == "function" ? e.errorTranslator(g) : g;
		s.monitor(t, {
			debug: d,
			beaconCollectionDomain: c,
			hlsjs: a,
			Hls: a ? P : void 0,
			automaticErrorTracking: !1,
			errorTranslator: _,
			disableCookies: h,
			...o,
			data: {
				...i ? { env_key: i } : {},
				player_software_name: m,
				player_software: m,
				player_software_version: p,
				player_init_time: u,
				...y
			}
		});
	}
}, id = (e, t, a) => {
	var r, i;
	let n = Nn(e, t), { src: s, customDomain: o = Me } = e, l = () => {
		t.ended || e.disablePseudoEnded || !Dn(t, a) || (Cn(t, a) ? t.currentTime = t.buffered.end(t.buffered.length - 1) : t.dispatchEvent(new Event("ended")));
	}, u, m, p = () => {
		let c = Mr(t), d, h;
		c.length > 0 && (d = c.start(0), h = c.end(0)), (m !== h || u !== d) && t.dispatchEvent(new CustomEvent("seekablechange", { composed: !0 })), u = d, m = h;
	};
	if (z(t, "durationchange", p), t && n) {
		let c = Ua(e);
		if (typeof s == "string") {
			if (s.endsWith(".mp4") && s.includes(o)) {
				let y = Pr(s);
				Ir(new URL(`https://stream.${o}/${y}/metadata.json`).toString(), t);
			}
			let d = () => {
				if (vr(t) !== U.LIVE || Number.isFinite(t.duration)) return;
				let y = setInterval(p, 1e3);
				t.addEventListener("teardown", () => {
					clearInterval(y);
				}, { once: !0 }), z(t, "durationchange", () => {
					Number.isFinite(t.duration) && clearInterval(y);
				});
			}, h = async () => Pu(s, t, c).then(d).catch((y) => {
				if (y instanceof Response) {
					let _ = Oa(y, $.VIDEO, e);
					if (_) {
						je(t, _);
						return;
					}
				}
			});
			if (t.preload === "none") {
				let y = () => {
					h(), t.removeEventListener("loadedmetadata", _);
				}, _ = () => {
					h(), t.removeEventListener("play", y);
				};
				z(t, "play", y, { once: !0 }), z(t, "loadedmetadata", _, { once: !0 });
			} else h();
			(r = e.tokens) != null && r.drm ? td(e, t) : z(t, "encrypted", () => {
				let _ = new A(R("Attempting to play DRM-protected content without providing a DRM token."), A.MEDIA_ERR_ENCRYPTED, !0);
				_.errorCategory = $.DRM, _.muxCode = C.ENCRYPTED_MISSING_TOKEN, je(t, _);
			}, { once: !0 }), t.setAttribute("src", s), e.startTime && (((i = W.get(t)) != null ? i : {}).startTime = e.startTime, t.addEventListener("durationchange", Ln, { once: !0 }));
		} else t.removeAttribute("src");
		t.addEventListener("error", Pn), t.addEventListener("error", fr), t.addEventListener("emptied", () => {
			t.querySelectorAll("track[data-removeondestroy]").forEach((d) => {
				d.remove();
			});
		}, { once: !0 }), z(t, "pause", l), z(t, "seeked", l), z(t, "play", () => {
			t.ended || Rn(t.currentTime, t.duration) && (t.currentTime = t.seekable.length ? t.seekable.start(0) : 0);
		});
	} else a && s ? (a.once(P.Events.LEVEL_LOADED, (c, d) => {
		Uu(d.details, t, a), p(), vr(t) === U.LIVE && !Number.isFinite(t.duration) && (a.on(P.Events.LEVEL_UPDATED, p), z(t, "durationchange", () => {
			Number.isFinite(t.duration) && a.off(P.Events.LEVELS_UPDATED, p);
		}));
	}), a.on(P.Events.ERROR, (c, d) => {
		var h, y;
		let _ = nd(d, e);
		if (_.muxCode === C.NETWORK_NOT_READY) {
			let g = (h = W.get(t)) != null ? h : {}, b = (y = g.retryCount) != null ? y : 0;
			if (b < 6) {
				let f = b === 0 ? 5e3 : 6e4, T = new A(`Retrying in ${f / 1e3} seconds...`, _.code, _.fatal);
				Object.assign(T, _), je(t, T);
				let w = setTimeout(() => {
					g.retryCount = b + 1, d.details === "manifestLoadError" && d.url && a.loadSource(d.url);
				}, f);
				t.addEventListener("teardown", () => clearTimeout(w), { once: !0 });
				return;
			} else {
				g.retryCount = 0;
				let f = new A("Try again later or <a href=\"#\" onclick=\"window.location.reload(); return false;\" style=\"color: #4a90e2;\">click here to retry</a>", _.code, _.fatal);
				Object.assign(f, _), je(t, f);
				return;
			}
		}
		je(t, _);
	}), a.on(P.Events.MANIFEST_LOADED, () => {
		let c = W.get(t);
		c && c.error && (c.error = null, c.retryCount = 0, t.dispatchEvent(new Event("emptied")), t.dispatchEvent(new Event("loadstart")));
	}), t.addEventListener("error", fr), z(t, "waiting", l), ou(e, a), lu(t, a), a.attachMedia(t)) : console.error("It looks like the video you're trying to play will not work on this system! If possible, try upgrading to the newest versions of your browser or software.");
};
function Ln(e) {
	var t;
	let a = e.target, r = (t = W.get(a)) == null ? void 0 : t.startTime;
	if (r && zl(a.seekable, a.duration, r)) {
		let i = a.preload === "auto";
		i && (a.preload = "none"), a.currentTime = r, i && (a.preload = "auto");
	}
}
async function Pn(e) {
	if (!e.isTrusted) return;
	e.stopImmediatePropagation();
	let t = e.target;
	if (!(t != null && t.error)) return;
	let { message: a, code: r } = t.error, i = new A(a, r);
	if (t.src && r === A.MEDIA_ERR_SRC_NOT_SUPPORTED && t.readyState === HTMLMediaElement.HAVE_NOTHING) {
		setTimeout(() => {
			var n;
			((n = wn(t)) != null ? n : t.error)?.code === A.MEDIA_ERR_SRC_NOT_SUPPORTED && je(t, i);
		}, 500);
		return;
	}
	if (t.src && (r !== A.MEDIA_ERR_DECODE || r !== void 0)) try {
		let { status: n } = await fetch(t.src);
		i.data = { response: { code: n } };
	} catch {}
	je(t, i);
}
function je(e, t) {
	var a;
	t.fatal && (((a = W.get(e)) != null ? a : {}).error = t, e.dispatchEvent(new CustomEvent("error", { detail: t })));
}
function fr(e) {
	var t, a;
	if (!(e instanceof CustomEvent) || !(e.detail instanceof A)) return;
	let r = e.target, i = e.detail;
	!i || !i.fatal || (((t = W.get(r)) != null ? t : {}).error = i, (a = r.mux) == null || a.emit("error", {
		player_error_code: i.code,
		player_error_message: i.message,
		player_error_context: i.context
	}));
}
var nd = (e, t) => {
	var a, r, i;
	e.fatal ? console.error("getErrorFromHlsErrorData()", e) : t.debug && console.warn("getErrorFromHlsErrorData() (non-fatal)", e);
	let n = {
		[P.ErrorTypes.NETWORK_ERROR]: A.MEDIA_ERR_NETWORK,
		[P.ErrorTypes.MEDIA_ERROR]: A.MEDIA_ERR_DECODE,
		[P.ErrorTypes.KEY_SYSTEM_ERROR]: A.MEDIA_ERR_ENCRYPTED
	}, s = (m) => [P.ErrorDetails.KEY_SYSTEM_LICENSE_REQUEST_FAILED, P.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED].includes(m.details) ? A.MEDIA_ERR_NETWORK : n[m.type], o = (m) => {
		if (m.type === P.ErrorTypes.KEY_SYSTEM_ERROR) return $.DRM;
		if (m.type === P.ErrorTypes.NETWORK_ERROR) return $.VIDEO;
	}, l, u = s(e);
	if (u === A.MEDIA_ERR_NETWORK && e.response) {
		let m = (a = o(e)) != null ? a : $.VIDEO;
		l = (r = Oa(e.response, m, t, e.fatal)) != null ? r : new A("", u, e.fatal);
	} else if (u === A.MEDIA_ERR_ENCRYPTED) if (e.details === P.ErrorDetails.KEY_SYSTEM_NO_CONFIGURED_LICENSE) l = new A(R("Attempting to play DRM-protected content without providing a DRM token."), A.MEDIA_ERR_ENCRYPTED, e.fatal), l.errorCategory = $.DRM, l.muxCode = C.ENCRYPTED_MISSING_TOKEN;
	else if (e.details === P.ErrorDetails.KEY_SYSTEM_NO_ACCESS) l = new A(R("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."), A.MEDIA_ERR_ENCRYPTED, e.fatal), l.errorCategory = $.DRM, l.muxCode = C.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM;
	else if (e.details === P.ErrorDetails.KEY_SYSTEM_NO_SESSION) l = new A(R("Failed to generate a DRM license request. This may be an issue with the player or your protected content."), A.MEDIA_ERR_ENCRYPTED, !0), l.errorCategory = $.DRM, l.muxCode = C.ENCRYPTED_GENERATE_REQUEST_FAILED;
	else if (e.details === P.ErrorDetails.KEY_SYSTEM_SESSION_UPDATE_FAILED) l = new A(R("Failed to update DRM license. This may be an issue with the player or your protected content."), A.MEDIA_ERR_ENCRYPTED, e.fatal), l.errorCategory = $.DRM, l.muxCode = C.ENCRYPTED_UPDATE_LICENSE_FAILED;
	else if (e.details === P.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_UPDATE_FAILED) l = new A(R("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate."), A.MEDIA_ERR_ENCRYPTED, e.fatal), l.errorCategory = $.DRM, l.muxCode = C.ENCRYPTED_UPDATE_SERVER_CERT_FAILED;
	else if (e.details === P.ErrorDetails.KEY_SYSTEM_STATUS_INTERNAL_ERROR) l = new A(R("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser."), A.MEDIA_ERR_ENCRYPTED, e.fatal), l.errorCategory = $.DRM, l.muxCode = C.ENCRYPTED_CDM_ERROR;
	else if (e.details === P.ErrorDetails.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED) l = new A(R("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen."), A.MEDIA_ERR_ENCRYPTED, !1), l.errorCategory = $.DRM, l.muxCode = C.ENCRYPTED_OUTPUT_RESTRICTED;
	else l = new A(e.error.message, A.MEDIA_ERR_ENCRYPTED, e.fatal), l.errorCategory = $.DRM, l.muxCode = C.ENCRYPTED_ERROR;
	else l = new A("", u, e.fatal);
	return l.context || (l.context = `${e.url ? `url: ${e.url}
` : ""}${e.response && (e.response.code || e.response.text) ? `response: ${e.response.code}, ${e.response.text}
` : ""}${e.reason ? `failure reason: ${e.reason}
` : ""}${e.level ? `level: ${e.level}
` : ""}${e.parent ? `parent stream controller: ${e.parent}
` : ""}${e.buffer ? `buffer length: ${e.buffer}
` : ""}${e.error ? `error: ${e.error}
` : ""}${e.event ? `event: ${e.event}
` : ""}${e.err ? `error message: ${(i = e.err) == null ? void 0 : i.message}
` : ""}`), l.data = e, l;
}, Mn = (e) => {
	throw TypeError(e);
}, $r = (e, t, a) => t.has(e) || Mn("Cannot " + a), V = (e, t, a) => ($r(e, t, "read from private field"), a ? a.call(e) : t.get(e)), ce = (e, t, a) => t.has(e) ? Mn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), be = (e, t, a, r) => ($r(e, t, "write to private field"), t.set(e, a), a), Jt = (e, t, a) => ($r(e, t, "access private method"), a), sd = () => {
	try {
		return "0.30.5";
	} catch {}
	return "UNKNOWN";
}, od = sd(), ld = () => od, ud = `
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" part="logo" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 1600 500"><g fill="#fff"><path d="M994.287 93.486c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m0-93.486c-34.509 0-62.484 27.976-62.484 62.486v187.511c0 68.943-56.09 125.033-125.032 125.033s-125.03-56.09-125.03-125.033V62.486C681.741 27.976 653.765 0 619.256 0s-62.484 27.976-62.484 62.486v187.511C556.772 387.85 668.921 500 806.771 500c137.851 0 250.001-112.15 250.001-250.003V62.486c0-34.51-27.976-62.486-62.485-62.486M1537.51 468.511c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m-275.883-218.509-143.33 143.329c-24.402 24.402-24.402 63.966 0 88.368 24.402 24.402 63.967 24.402 88.369 0l143.33-143.329 143.328 143.329c24.402 24.4 63.967 24.402 88.369 0 24.403-24.402 24.403-63.966.001-88.368l-143.33-143.329.001-.004 143.329-143.329c24.402-24.402 24.402-63.965 0-88.367s-63.967-24.402-88.369 0L1349.996 161.63 1206.667 18.302c-24.402-24.401-63.967-24.402-88.369 0s-24.402 63.965 0 88.367l143.329 143.329v.004ZM437.511 468.521c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31M461.426 4.759C438.078-4.913 411.2.432 393.33 18.303L249.999 161.632 106.669 18.303C88.798.432 61.922-4.913 38.573 4.759 15.224 14.43-.001 37.214-.001 62.488v375.026c0 34.51 27.977 62.486 62.487 62.486 34.51 0 62.486-27.976 62.486-62.486V213.341l80.843 80.844c24.404 24.402 63.965 24.402 88.369 0l80.843-80.844v224.173c0 34.51 27.976 62.486 62.486 62.486s62.486-27.976 62.486-62.486V62.488c0-25.274-15.224-48.058-38.573-57.729" style="fill-rule:nonzero"/></g></svg>`, v = {
	BEACON_COLLECTION_DOMAIN: "beacon-collection-domain",
	CUSTOM_DOMAIN: "custom-domain",
	DEBUG: "debug",
	DISABLE_TRACKING: "disable-tracking",
	DISABLE_COOKIES: "disable-cookies",
	DISABLE_PSEUDO_ENDED: "disable-pseudo-ended",
	DRM_TOKEN: "drm-token",
	PLAYBACK_TOKEN: "playback-token",
	ENV_KEY: "env-key",
	MAX_RESOLUTION: "max-resolution",
	MIN_RESOLUTION: "min-resolution",
	MAX_AUTO_RESOLUTION: "max-auto-resolution",
	RENDITION_ORDER: "rendition-order",
	PROGRAM_START_TIME: "program-start-time",
	PROGRAM_END_TIME: "program-end-time",
	ASSET_START_TIME: "asset-start-time",
	ASSET_END_TIME: "asset-end-time",
	METADATA_URL: "metadata-url",
	PLAYBACK_ID: "playback-id",
	PLAYER_SOFTWARE_NAME: "player-software-name",
	PLAYER_SOFTWARE_VERSION: "player-software-version",
	PLAYER_INIT_TIME: "player-init-time",
	PREFER_CMCD: "prefer-cmcd",
	PREFER_PLAYBACK: "prefer-playback",
	START_TIME: "start-time",
	STREAM_TYPE: "stream-type",
	TARGET_LIVE_WINDOW: "target-live-window",
	LIVE_EDGE_OFFSET: "live-edge-offset",
	TYPE: "type",
	LOGO: "logo",
	CAP_RENDITION_TO_PLAYER_SIZE: "cap-rendition-to-player-size"
}, dd = Object.values(v), di = ld(), ci = "mux-video", Lt, ia, Pt, na, sa, oa, la, ua, Mt, da, me, et, ca, Ut, cd = class extends Z$1 {
	constructor() {
		super(), ce(this, me), ce(this, Lt), ce(this, ia), ce(this, Pt, {}), ce(this, na, {}), ce(this, sa), ce(this, oa), ce(this, la), ce(this, ua), ce(this, Mt, ""), ce(this, da, (t) => {
			var a;
			let r = Fu(this.nativeEl), i = (a = this.metadata) != null ? a : {};
			this.metadata = {
				...r,
				...i
			}, r?.["com.mux.video.branding"] === "mux-free-plan" && (be(this, Mt, "default"), this.updateLogo());
		}), ce(this, ca), be(this, ia, Lr());
	}
	static get NAME() {
		return ci;
	}
	static get VERSION() {
		return di;
	}
	static get observedAttributes() {
		var t;
		return [...dd, ...(t = Z$1.observedAttributes) != null ? t : []];
	}
	static getLogoHTML(t) {
		return !t || t === "false" ? "" : t === "default" ? ud : `<img part="logo" src="${t}" />`;
	}
	static getTemplateHTML(t = {}) {
		var a;
		return `
      ${Z$1.getTemplateHTML(t)}
      <style>
        :host {
          position: relative;
        }
        slot[name="logo"] {
          display: flex;
          justify-content: end;
          position: absolute;
          top: 1rem;
          right: 1rem;
          opacity: 0;
          transition: opacity 0.25s ease-in-out;
          z-index: 1;
        }
        slot[name="logo"]:has([part="logo"]) {
          opacity: 1;
        }
        slot[name="logo"] [part="logo"] {
          width: 5rem;
          pointer-events: none;
          user-select: none;
        }
      </style>
      <slot name="logo">
        ${this.getLogoHTML((a = t[v.LOGO]) != null ? a : "")}
      </slot>
    `;
	}
	get preferCmcd() {
		var t;
		return (t = this.getAttribute(v.PREFER_CMCD)) != null ? t : void 0;
	}
	set preferCmcd(t) {
		t !== this.preferCmcd && (t ? Sa.includes(t) ? this.setAttribute(v.PREFER_CMCD, t) : console.warn(`Invalid value for preferCmcd. Must be one of ${Sa.join()}`) : this.removeAttribute(v.PREFER_CMCD));
	}
	get playerInitTime() {
		return this.hasAttribute(v.PLAYER_INIT_TIME) ? +this.getAttribute(v.PLAYER_INIT_TIME) : V(this, ia);
	}
	set playerInitTime(t) {
		t != this.playerInitTime && (t == null ? this.removeAttribute(v.PLAYER_INIT_TIME) : this.setAttribute(v.PLAYER_INIT_TIME, `${+t}`));
	}
	get playerSoftwareName() {
		var t;
		return (t = V(this, la)) != null ? t : ci;
	}
	set playerSoftwareName(t) {
		be(this, la, t);
	}
	get playerSoftwareVersion() {
		var t;
		return (t = V(this, oa)) != null ? t : di;
	}
	set playerSoftwareVersion(t) {
		be(this, oa, t);
	}
	get _hls() {
		var t;
		return (t = V(this, me, et)) == null ? void 0 : t.engine;
	}
	get mux() {
		var t;
		return (t = this.nativeEl) == null ? void 0 : t.mux;
	}
	get error() {
		var t;
		return (t = wn(this.nativeEl)) != null ? t : null;
	}
	get errorTranslator() {
		return V(this, ua);
	}
	set errorTranslator(t) {
		be(this, ua, t);
	}
	get src() {
		return this.getAttribute("src");
	}
	set src(t) {
		t !== this.src && (t == null ? this.removeAttribute("src") : this.setAttribute("src", t));
	}
	get type() {
		var t;
		return (t = this.getAttribute(v.TYPE)) != null ? t : void 0;
	}
	set type(t) {
		t !== this.type && (t ? this.setAttribute(v.TYPE, t) : this.removeAttribute(v.TYPE));
	}
	get preload() {
		let t = this.getAttribute("preload");
		return t === "" ? "auto" : [
			"none",
			"metadata",
			"auto"
		].includes(t) ? t : super.preload;
	}
	set preload(t) {
		t != this.getAttribute("preload") && ([
			"",
			"none",
			"metadata",
			"auto"
		].includes(t) ? this.setAttribute("preload", t) : this.removeAttribute("preload"));
	}
	get debug() {
		return this.getAttribute(v.DEBUG) != null;
	}
	set debug(t) {
		t !== this.debug && (t ? this.setAttribute(v.DEBUG, "") : this.removeAttribute(v.DEBUG));
	}
	get disableTracking() {
		return this.hasAttribute(v.DISABLE_TRACKING);
	}
	set disableTracking(t) {
		t !== this.disableTracking && this.toggleAttribute(v.DISABLE_TRACKING, !!t);
	}
	get disableCookies() {
		return this.hasAttribute(v.DISABLE_COOKIES);
	}
	set disableCookies(t) {
		t !== this.disableCookies && (t ? this.setAttribute(v.DISABLE_COOKIES, "") : this.removeAttribute(v.DISABLE_COOKIES));
	}
	get disablePseudoEnded() {
		return this.hasAttribute(v.DISABLE_PSEUDO_ENDED);
	}
	set disablePseudoEnded(t) {
		t !== this.disablePseudoEnded && (t ? this.setAttribute(v.DISABLE_PSEUDO_ENDED, "") : this.removeAttribute(v.DISABLE_PSEUDO_ENDED));
	}
	get startTime() {
		let t = this.getAttribute(v.START_TIME);
		if (t == null) return;
		let a = +t;
		return Number.isNaN(a) ? void 0 : a;
	}
	set startTime(t) {
		t !== this.startTime && (t == null ? this.removeAttribute(v.START_TIME) : this.setAttribute(v.START_TIME, `${t}`));
	}
	get playbackId() {
		var t;
		return this.hasAttribute(v.PLAYBACK_ID) ? this.getAttribute(v.PLAYBACK_ID) : (t = Pr(this.src)) != null ? t : void 0;
	}
	set playbackId(t) {
		t !== this.playbackId && (t ? this.setAttribute(v.PLAYBACK_ID, t) : this.removeAttribute(v.PLAYBACK_ID));
	}
	get maxResolution() {
		var t;
		return (t = this.getAttribute(v.MAX_RESOLUTION)) != null ? t : void 0;
	}
	set maxResolution(t) {
		t !== this.maxResolution && (t ? this.setAttribute(v.MAX_RESOLUTION, t) : this.removeAttribute(v.MAX_RESOLUTION));
	}
	get minResolution() {
		var t;
		return (t = this.getAttribute(v.MIN_RESOLUTION)) != null ? t : void 0;
	}
	set minResolution(t) {
		t !== this.minResolution && (t ? this.setAttribute(v.MIN_RESOLUTION, t) : this.removeAttribute(v.MIN_RESOLUTION));
	}
	get maxAutoResolution() {
		var t;
		return (t = this.getAttribute(v.MAX_AUTO_RESOLUTION)) != null ? t : void 0;
	}
	set maxAutoResolution(t) {
		t == null ? this.removeAttribute(v.MAX_AUTO_RESOLUTION) : this.setAttribute(v.MAX_AUTO_RESOLUTION, t);
	}
	get renditionOrder() {
		var t;
		return (t = this.getAttribute(v.RENDITION_ORDER)) != null ? t : void 0;
	}
	set renditionOrder(t) {
		t !== this.renditionOrder && (t ? this.setAttribute(v.RENDITION_ORDER, t) : this.removeAttribute(v.RENDITION_ORDER));
	}
	get programStartTime() {
		let t = this.getAttribute(v.PROGRAM_START_TIME);
		if (t == null) return;
		let a = +t;
		return Number.isNaN(a) ? void 0 : a;
	}
	set programStartTime(t) {
		t == null ? this.removeAttribute(v.PROGRAM_START_TIME) : this.setAttribute(v.PROGRAM_START_TIME, `${t}`);
	}
	get programEndTime() {
		let t = this.getAttribute(v.PROGRAM_END_TIME);
		if (t == null) return;
		let a = +t;
		return Number.isNaN(a) ? void 0 : a;
	}
	set programEndTime(t) {
		t == null ? this.removeAttribute(v.PROGRAM_END_TIME) : this.setAttribute(v.PROGRAM_END_TIME, `${t}`);
	}
	get assetStartTime() {
		let t = this.getAttribute(v.ASSET_START_TIME);
		if (t == null) return;
		let a = +t;
		return Number.isNaN(a) ? void 0 : a;
	}
	set assetStartTime(t) {
		t == null ? this.removeAttribute(v.ASSET_START_TIME) : this.setAttribute(v.ASSET_START_TIME, `${t}`);
	}
	get assetEndTime() {
		let t = this.getAttribute(v.ASSET_END_TIME);
		if (t == null) return;
		let a = +t;
		return Number.isNaN(a) ? void 0 : a;
	}
	set assetEndTime(t) {
		t == null ? this.removeAttribute(v.ASSET_END_TIME) : this.setAttribute(v.ASSET_END_TIME, `${t}`);
	}
	get customDomain() {
		var t;
		return (t = this.getAttribute(v.CUSTOM_DOMAIN)) != null ? t : void 0;
	}
	set customDomain(t) {
		t !== this.customDomain && (t ? this.setAttribute(v.CUSTOM_DOMAIN, t) : this.removeAttribute(v.CUSTOM_DOMAIN));
	}
	get capRenditionToPlayerSize() {
		var t;
		return ((t = this._hlsConfig) == null ? void 0 : t.capLevelToPlayerSize) != null ? this._hlsConfig.capLevelToPlayerSize : V(this, ca);
	}
	set capRenditionToPlayerSize(t) {
		be(this, ca, t);
	}
	get drmToken() {
		var t;
		return (t = this.getAttribute(v.DRM_TOKEN)) != null ? t : void 0;
	}
	set drmToken(t) {
		t !== this.drmToken && (t ? this.setAttribute(v.DRM_TOKEN, t) : this.removeAttribute(v.DRM_TOKEN));
	}
	get playbackToken() {
		var t, a, r, i;
		if (this.hasAttribute(v.PLAYBACK_TOKEN)) return (t = this.getAttribute(v.PLAYBACK_TOKEN)) != null ? t : void 0;
		if (this.hasAttribute(v.PLAYBACK_ID)) {
			let [, n] = Sr((a = this.playbackId) != null ? a : "");
			return (r = new URLSearchParams(n).get("token")) != null ? r : void 0;
		}
		if (this.src) return (i = new URLSearchParams(this.src).get("token")) != null ? i : void 0;
	}
	set playbackToken(t) {
		t !== this.playbackToken && (t ? this.setAttribute(v.PLAYBACK_TOKEN, t) : this.removeAttribute(v.PLAYBACK_TOKEN));
	}
	get tokens() {
		let t = this.getAttribute(v.PLAYBACK_TOKEN), a = this.getAttribute(v.DRM_TOKEN);
		return {
			...V(this, na),
			...t != null ? { playback: t } : {},
			...a != null ? { drm: a } : {}
		};
	}
	set tokens(t) {
		be(this, na, t ?? {});
	}
	get ended() {
		return Dn(this.nativeEl, this._hls);
	}
	get envKey() {
		var t;
		return (t = this.getAttribute(v.ENV_KEY)) != null ? t : void 0;
	}
	set envKey(t) {
		t !== this.envKey && (t ? this.setAttribute(v.ENV_KEY, t) : this.removeAttribute(v.ENV_KEY));
	}
	get beaconCollectionDomain() {
		var t;
		return (t = this.getAttribute(v.BEACON_COLLECTION_DOMAIN)) != null ? t : void 0;
	}
	set beaconCollectionDomain(t) {
		t !== this.beaconCollectionDomain && (t ? this.setAttribute(v.BEACON_COLLECTION_DOMAIN, t) : this.removeAttribute(v.BEACON_COLLECTION_DOMAIN));
	}
	get streamType() {
		var t;
		return (t = this.getAttribute(v.STREAM_TYPE)) != null ? t : vr(this.nativeEl);
	}
	set streamType(t) {
		t !== this.streamType && (t ? this.setAttribute(v.STREAM_TYPE, t) : this.removeAttribute(v.STREAM_TYPE));
	}
	get targetLiveWindow() {
		return this.hasAttribute(v.TARGET_LIVE_WINDOW) ? +this.getAttribute(v.TARGET_LIVE_WINDOW) : Yu(this.nativeEl);
	}
	set targetLiveWindow(t) {
		t != this.targetLiveWindow && (t == null ? this.removeAttribute(v.TARGET_LIVE_WINDOW) : this.setAttribute(v.TARGET_LIVE_WINDOW, `${+t}`));
	}
	get liveEdgeStart() {
		var t, a;
		if (this.hasAttribute(v.LIVE_EDGE_OFFSET)) {
			let { liveEdgeOffset: r } = this, i = (t = this.nativeEl.seekable.end(0)) != null ? t : 0, n = (a = this.nativeEl.seekable.start(0)) != null ? a : 0;
			return Math.max(n, i - r);
		}
		return Vu(this.nativeEl);
	}
	get liveEdgeOffset() {
		if (this.hasAttribute(v.LIVE_EDGE_OFFSET)) return +this.getAttribute(v.LIVE_EDGE_OFFSET);
	}
	set liveEdgeOffset(t) {
		t != this.liveEdgeOffset && (t == null ? this.removeAttribute(v.LIVE_EDGE_OFFSET) : this.setAttribute(v.LIVE_EDGE_OFFSET, `${+t}`));
	}
	get seekable() {
		return Mr(this.nativeEl);
	}
	async addCuePoints(t) {
		return _n(this.nativeEl, t);
	}
	get activeCuePoint() {
		return yn(this.nativeEl);
	}
	get cuePoints() {
		return du(this.nativeEl);
	}
	async addChapters(t) {
		return En(this.nativeEl, t);
	}
	get activeChapter() {
		return Tn(this.nativeEl);
	}
	get chapters() {
		return mu(this.nativeEl);
	}
	getStartDate() {
		return hu(this.nativeEl, this._hls);
	}
	get currentPdt() {
		return vu(this.nativeEl, this._hls);
	}
	get preferPlayback() {
		let t = this.getAttribute(v.PREFER_PLAYBACK);
		if (t === Ce.MSE || t === Ce.NATIVE) return t;
	}
	set preferPlayback(t) {
		t !== this.preferPlayback && (t === Ce.MSE || t === Ce.NATIVE ? this.setAttribute(v.PREFER_PLAYBACK, t) : this.removeAttribute(v.PREFER_PLAYBACK));
	}
	get metadata() {
		return {
			...this.getAttributeNames().filter((t) => t.startsWith("metadata-") && ![v.METADATA_URL].includes(t)).reduce((t, a) => {
				let r = this.getAttribute(a);
				return r != null && (t[a.replace(/^metadata-/, "").replace(/-/g, "_")] = r), t;
			}, {}),
			...V(this, Pt)
		};
	}
	set metadata(t) {
		be(this, Pt, t ?? {}), this.mux && this.mux.emit("hb", V(this, Pt));
	}
	get _hlsConfig() {
		return V(this, sa);
	}
	set _hlsConfig(t) {
		be(this, sa, t);
	}
	get logo() {
		var t;
		return (t = this.getAttribute(v.LOGO)) != null ? t : V(this, Mt);
	}
	set logo(t) {
		t ? this.setAttribute(v.LOGO, t) : this.removeAttribute(v.LOGO);
	}
	load() {
		Sn(this, this.nativeEl, V(this, me, et));
	}
	unload() {
		On(this.nativeEl, V(this, me, et), this);
	}
	attributeChangedCallback(t, a, r) {
		var i, n;
		switch (Z$1.observedAttributes.includes(t) && ![
			"src",
			"autoplay",
			"preload"
		].includes(t) && super.attributeChangedCallback(t, a, r), t) {
			case v.PLAYER_SOFTWARE_NAME:
				this.playerSoftwareName = r ?? void 0;
				break;
			case v.PLAYER_SOFTWARE_VERSION:
				this.playerSoftwareVersion = r ?? void 0;
				break;
			case "src": {
				let s = !!a, o = !!r;
				!s && o ? Jt(this, me, Ut).call(this) : s && !o ? this.unload() : s && o && (this.unload(), Jt(this, me, Ut).call(this));
				break;
			}
			case "autoplay":
				if (r === a) break;
				(i = V(this, me, et)) == null || i.setAutoplay(this.autoplay);
				break;
			case "preload":
				if (r === a) break;
				(n = V(this, me, et)) == null || n.setPreload(r);
				break;
			case v.PLAYBACK_ID:
			case v.CUSTOM_DOMAIN:
			case v.MAX_RESOLUTION:
			case v.MIN_RESOLUTION:
			case v.RENDITION_ORDER:
			case v.PROGRAM_START_TIME:
			case v.PROGRAM_END_TIME:
			case v.ASSET_START_TIME:
			case v.ASSET_END_TIME:
			case v.PLAYBACK_TOKEN:
				this.src = hr(this);
				break;
			case v.DEBUG: {
				let s = this.debug;
				this.mux && console.info("Cannot toggle debug mode of mux data after initialization. Make sure you set all metadata to override before setting the src."), this._hls && (this._hls.config.debug = s);
				break;
			}
			case v.METADATA_URL:
				r && fetch(r).then((s) => s.json()).then((s) => this.metadata = s).catch(() => console.error(`Unable to load or parse metadata JSON from metadata-url ${r}!`));
				break;
			case v.STREAM_TYPE:
				(r == null || r !== a) && this.dispatchEvent(new CustomEvent("streamtypechange", {
					composed: !0,
					bubbles: !0
				}));
				break;
			case v.TARGET_LIVE_WINDOW:
				(r == null || r !== a) && this.dispatchEvent(new CustomEvent("targetlivewindowchange", {
					composed: !0,
					bubbles: !0,
					detail: this.targetLiveWindow
				}));
				break;
			case v.LOGO:
				(r == null || r !== a) && this.updateLogo();
				break;
			case v.DISABLE_TRACKING:
				if (r == null || r !== a) {
					let s = this.currentTime, o = this.paused;
					this.unload(), Jt(this, me, Ut).call(this).then(() => {
						this.currentTime = s, o || this.play();
					});
				}
				break;
			case v.DISABLE_COOKIES:
				(r == null || r !== a) && this.disableCookies && document.cookie.split(";").forEach((s) => {
					s.trim().startsWith("muxData") && (document.cookie = s.replace(/^ +/, "").replace(/=.*/, "=;expires=" + (/* @__PURE__ */ new Date()).toUTCString() + ";path=/"));
				});
				break;
			case v.CAP_RENDITION_TO_PLAYER_SIZE: (r == null || r !== a) && (this.capRenditionToPlayerSize = r != null ? !0 : void 0);
		}
	}
	updateLogo() {
		if (!this.shadowRoot) return;
		let t = this.shadowRoot.querySelector("slot[name=\"logo\"]");
		if (!t) return;
		t.innerHTML = this.constructor.getLogoHTML(V(this, Mt) || this.logo);
	}
	connectedCallback() {
		var t, a;
		(t = super.connectedCallback) == null || t.call(this), (a = this.nativeEl) == null || a.addEventListener("muxmetadata", V(this, da)), this.nativeEl && this.src && !V(this, me, et) && Jt(this, me, Ut).call(this);
	}
	disconnectedCallback() {
		var t, a;
		(t = this.nativeEl) == null || t.removeEventListener("muxmetadata", V(this, da)), this.unload(), (a = super.disconnectedCallback) == null || a.call(this);
	}
	handleEvent(t) {
		t.target === this.nativeEl && this.dispatchEvent(new CustomEvent(t.type, {
			composed: !0,
			detail: t.detail
		}));
	}
};
Lt = /* @__PURE__ */ new WeakMap(), ia = /* @__PURE__ */ new WeakMap(), Pt = /* @__PURE__ */ new WeakMap(), na = /* @__PURE__ */ new WeakMap(), sa = /* @__PURE__ */ new WeakMap(), oa = /* @__PURE__ */ new WeakMap(), la = /* @__PURE__ */ new WeakMap(), ua = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), da = /* @__PURE__ */ new WeakMap(), me = /* @__PURE__ */ new WeakSet(), et = function() {
	return ju(this.nativeEl);
}, ca = /* @__PURE__ */ new WeakMap(), Ut = async function() {
	V(this, Lt) || (await be(this, Lt, Promise.resolve()), be(this, Lt, null), this.load());
};
var Ze = /* @__PURE__ */ new WeakMap();
var Qa = class extends Error {};
var md = class extends Error {};
var pd = [
	"application/x-mpegURL",
	"application/vnd.apple.mpegurl",
	"audio/mpegurl"
], hd = globalThis.WeakRef ? class extends Set {
	add(e) {
		super.add(new WeakRef(e));
	}
	forEach(e) {
		super.forEach((t) => {
			const a = t.deref();
			a && e(a);
		});
	}
} : Set;
function vd(e) {
	globalThis.chrome?.cast?.isAvailable ? globalThis.cast?.framework ? e() : customElements.whenDefined("google-cast-button").then(e) : globalThis.__onGCastApiAvailable = () => {
		customElements.whenDefined("google-cast-button").then(e);
	};
}
function fd() {
	return globalThis.chrome;
}
function bd() {
	const e = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
	if (globalThis.chrome?.cast || document.querySelector(`script[src="${e}"]`)) return;
	const t = document.createElement("script");
	t.src = e, document.head.append(t);
}
function Ge() {
	return globalThis.cast?.framework?.CastContext.getInstance();
}
function Br() {
	return Ge()?.getCurrentSession();
}
function Kr() {
	return Br()?.getSessionObj().media[0];
}
function _d(e) {
	return new Promise((t, a) => {
		Kr().editTracksInfo(e, t, a);
	});
}
function yd(e) {
	return new Promise((t, a) => {
		Kr().getStatus(e, t, a);
	});
}
function mi(e) {
	return Ge().setOptions({
		...Un(),
		...e
	});
}
function Un() {
	return {
		receiverApplicationId: "CC1AD845",
		autoJoinPolicy: "origin_scoped",
		androidReceiverCompatible: !1,
		language: "en-US",
		resumeSavedSession: !0
	};
}
function gd(e) {
	if (!e) return;
	const a = e.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
	return a ? a[1] : null;
}
function Ed(e) {
	const t = e.split(`
`), a = [];
	for (let r = 0; r < t.length; r++) if (t[r].trim().startsWith("#EXT-X-STREAM-INF")) {
		const n = t[r + 1] ? t[r + 1].trim() : "";
		n && !n.startsWith("#") && a.push(n);
	}
	return a;
}
function Td(e) {
	return e.split(`
`).find((r) => !r.trim().startsWith("#") && r.trim() !== "");
}
async function kd(e) {
	try {
		const a = (await fetch(e, { method: "HEAD" })).headers.get("Content-Type");
		return pd.some((r) => a === r);
	} catch (t) {
		return console.error("Error while trying to get the Content-Type of the manifest", t), !1;
	}
}
async function Ad(e) {
	try {
		const t = await (await fetch(e)).text();
		let a = t;
		const r = Ed(t);
		if (r.length > 0) {
			const s = new URL(r[0], e).toString();
			a = await (await fetch(s)).text();
		}
		return gd(Td(a));
	} catch (t) {
		console.error("Error while trying to parse the manifest playlist", t);
		return;
	}
}
var ma = new hd(), Se = /* @__PURE__ */ new WeakSet();
var G;
vd(() => {
	if (!globalThis.chrome?.cast?.isAvailable) {
		console.debug("chrome.cast.isAvailable", globalThis.chrome?.cast?.isAvailable);
		return;
	}
	G || (G = cast.framework, Ge().addEventListener(G.CastContextEventType.CAST_STATE_CHANGED, (e) => {
		ma.forEach((t) => Ze.get(t).onCastStateChanged?.(e));
	}), Ge().addEventListener(G.CastContextEventType.SESSION_STATE_CHANGED, (e) => {
		ma.forEach((t) => Ze.get(t).onSessionStateChanged?.(e));
	}), ma.forEach((e) => Ze.get(e).init?.()));
});
var pi = 0;
var wd = class extends EventTarget {
	#t;
	#i;
	#a;
	#r;
	#e = "disconnected";
	#n = !1;
	#o = /* @__PURE__ */ new Set();
	#m = /* @__PURE__ */ new WeakMap();
	#l = () => this.#c();
	constructor(t) {
		super(), this.#t = t, ma.add(this), Ze.set(this, {
			init: () => this.#d(),
			onCastStateChanged: () => this.#u(),
			onSessionStateChanged: () => this.#v(),
			getCastPlayer: () => this.#s
		}), this.#d();
	}
	destroy() {
		this.#t?.textTracks?.removeEventListener("change", this.#l), this.#r && this.#a?.controller && Object.entries(this.#r).forEach(([t, a]) => {
			this.#a.controller.removeEventListener(t, a);
		}), this.#t && Se.delete(this.#t), this.#i = !1;
	}
	get #s() {
		if (Se.has(this.#t)) return this.#a;
	}
	/**
	* https://developer.mozilla.org/en-US/docs/Web/API/RemotePlayback/state
	* @return {'disconnected'|'connecting'|'connected'}
	*/
	get state() {
		return this.#e;
	}
	async watchAvailability(t) {
		if (this.#t.disableRemotePlayback) throw new Qa("disableRemotePlayback attribute is present.");
		return this.#m.set(t, ++pi), this.#o.add(t), queueMicrotask(() => t(this.#h())), pi;
	}
	async cancelWatchAvailability(t) {
		if (this.#t.disableRemotePlayback) throw new Qa("disableRemotePlayback attribute is present.");
		t ? this.#o.delete(t) : this.#o.clear();
	}
	async prompt() {
		if (this.#t.disableRemotePlayback) throw new Qa("disableRemotePlayback attribute is present.");
		if (!globalThis.chrome?.cast?.isAvailable) throw new md("The RemotePlayback API is disabled on this platform.");
		const t = Se.has(this.#t);
		Se.add(this.#t), mi(this.#t.castOptions), Object.entries(this.#r).forEach(([a, r]) => {
			this.#a.controller.addEventListener(a, r);
		});
		try {
			await Ge().requestSession();
		} catch (a) {
			if (t || Se.delete(this.#t), a === "cancel") return;
			throw new Error(a);
		}
		Ze.get(this.#t)?.loadOnPrompt?.();
	}
	#p() {
		Se.has(this.#t) && (Object.entries(this.#r).forEach(([t, a]) => {
			this.#a.controller.removeEventListener(t, a);
		}), Se.delete(this.#t), this.#t.muted = this.#a.isMuted, this.#t.currentTime = this.#a.savedPlayerState.currentTime, this.#a.savedPlayerState.isPaused === !1 && this.#t.play());
	}
	#h() {
		const t = Ge()?.getCastState();
		return t && t !== "NO_DEVICES_AVAILABLE";
	}
	#u() {
		const t = Ge().getCastState();
		if (Se.has(this.#t) && t === "CONNECTING" && (this.#e = "connecting", this.dispatchEvent(new Event("connecting"))), !this.#n && t?.includes("CONNECT")) {
			this.#n = !0;
			for (let a of this.#o) a(!0);
		} else if (this.#n && (!t || t === "NO_DEVICES_AVAILABLE")) {
			this.#n = !1;
			for (let a of this.#o) a(!1);
		}
	}
	async #v() {
		const { SESSION_RESUMED: t } = G.SessionState;
		if (Ge().getSessionState() === t && this.#t.castSrc === Kr()?.media.contentId) {
			Se.add(this.#t), Object.entries(this.#r).forEach(([a, r]) => {
				this.#a.controller.addEventListener(a, r);
			});
			try {
				await yd(new chrome.cast.media.GetStatusRequest());
			} catch (a) {
				console.error(a);
			}
			this.#r[G.RemotePlayerEventType.IS_PAUSED_CHANGED](), this.#r[G.RemotePlayerEventType.PLAYER_STATE_CHANGED]();
		}
	}
	#d() {
		!G || this.#i || (this.#i = !0, mi(this.#t.castOptions), this.#t.textTracks.addEventListener("change", this.#l), this.#u(), this.#a = new G.RemotePlayer(), new G.RemotePlayerController(this.#a), this.#r = {
			[G.RemotePlayerEventType.IS_CONNECTED_CHANGED]: ({ value: t }) => {
				t === !0 ? (this.#e = "connected", this.dispatchEvent(new Event("connect"))) : (this.#p(), this.#e = "disconnected", this.dispatchEvent(new Event("disconnect")));
			},
			[G.RemotePlayerEventType.DURATION_CHANGED]: () => {
				this.#t.dispatchEvent(new Event("durationchange"));
			},
			[G.RemotePlayerEventType.VOLUME_LEVEL_CHANGED]: () => {
				this.#t.dispatchEvent(new Event("volumechange"));
			},
			[G.RemotePlayerEventType.IS_MUTED_CHANGED]: () => {
				this.#t.dispatchEvent(new Event("volumechange"));
			},
			[G.RemotePlayerEventType.CURRENT_TIME_CHANGED]: () => {
				this.#s?.isMediaLoaded && this.#t.dispatchEvent(new Event("timeupdate"));
			},
			[G.RemotePlayerEventType.VIDEO_INFO_CHANGED]: () => {
				this.#t.dispatchEvent(new Event("resize"));
			},
			[G.RemotePlayerEventType.IS_PAUSED_CHANGED]: () => {
				this.#t.dispatchEvent(new Event(this.paused ? "pause" : "play"));
			},
			[G.RemotePlayerEventType.PLAYER_STATE_CHANGED]: () => {
				this.#s?.playerState !== chrome.cast.media.PlayerState.PAUSED && this.#t.dispatchEvent(new Event({
					[chrome.cast.media.PlayerState.PLAYING]: "playing",
					[chrome.cast.media.PlayerState.BUFFERING]: "waiting",
					[chrome.cast.media.PlayerState.IDLE]: "emptied"
				}[this.#s?.playerState]));
			},
			[G.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED]: async () => {
				this.#s?.isMediaLoaded && (await Promise.resolve(), this.#f());
			}
		});
	}
	#f() {
		this.#c();
	}
	async #c() {
		if (!this.#s) return;
		const a = (this.#a.mediaInfo?.tracks ?? []).filter(({ type: p }) => p === chrome.cast.media.TrackType.TEXT), r = [...this.#t.textTracks].filter(({ kind: p }) => p === "subtitles" || p === "captions"), i = a.map(({ language: p, name: c, trackId: d }) => {
			const { mode: h } = r.find((y) => y.language === p && y.label === c) ?? {};
			return h ? {
				mode: h,
				trackId: d
			} : !1;
		}).filter(Boolean), s = i.filter(({ mode: p }) => p !== "showing").map(({ trackId: p }) => p), o = i.find(({ mode: p }) => p === "showing"), l = Br()?.getSessionObj().media[0]?.activeTrackIds ?? [];
		let u = l;
		if (l.length && (u = u.filter((p) => !s.includes(p))), o?.trackId && (u = [...u, o.trackId]), u = [...new Set(u)], !((p, c) => p.length === c.length && p.every((d) => c.includes(d)))(l, u)) try {
			await _d(new chrome.cast.media.EditTracksInfoRequest(u));
		} catch (p) {
			console.error(p);
		}
	}
};
var Rd = (e) => class extends e {
	static observedAttributes = [
		...e.observedAttributes ?? [],
		"cast-src",
		"cast-content-type",
		"cast-stream-type",
		"cast-receiver"
	];
	#t = { paused: !1 };
	#i = Un();
	#a;
	#r;
	get remote() {
		return this.#r ? this.#r : fd() ? this.isConnected ? (this.disableRemotePlayback || bd(), Ze.set(this, { loadOnPrompt: () => this.#n() }), this.#r = new wd(this)) : void 0 : super.remote;
	}
	get #e() {
		return Ze.get(this.remote)?.getCastPlayer?.();
	}
	disconnectedCallback() {
		this.#r?.destroy(), this.#r = null, Ze.delete(this), super.disconnectedCallback?.();
	}
	attributeChangedCallback(a, r, i) {
		if (super.attributeChangedCallback(a, r, i), a === "cast-receiver" && i) {
			this.#i.receiverApplicationId = i;
			return;
		}
		if (this.#e) switch (a) {
			case "cast-stream-type":
			case "cast-src":
				this.load();
				break;
		}
	}
	async #n() {
		this.#t.paused = super.paused, super.pause(), this.muted = super.muted;
		try {
			await this.load();
		} catch (a) {
			console.error(a);
		}
	}
	async load() {
		if (!this.#e) return super.load();
		const a = new chrome.cast.media.MediaInfo(this.castSrc, this.castContentType);
		a.customData = this.castCustomData;
		const r = [...this.querySelectorAll("track")].filter(({ kind: o, src: l }) => l && (o === "subtitles" || o === "captions")), i = [];
		let n = 0;
		if (r.length && (a.tracks = r.map((o) => {
			const l = ++n;
			i.length === 0 && o.track.mode === "showing" && i.push(l);
			const u = new chrome.cast.media.Track(l, chrome.cast.media.TrackType.TEXT);
			return u.trackContentId = o.src, u.trackContentType = "text/vtt", u.subtype = o.kind === "captions" ? chrome.cast.media.TextTrackType.CAPTIONS : chrome.cast.media.TextTrackType.SUBTITLES, u.name = o.label, u.language = o.srclang, u;
		})), this.castStreamType === "live" ? a.streamType = chrome.cast.media.StreamType.LIVE : a.streamType = chrome.cast.media.StreamType.BUFFERED, a.metadata = new chrome.cast.media.GenericMediaMetadata(), a.metadata.title = this.title, a.metadata.images = [{ url: this.poster }], kd(this.castSrc)) {
			const o = await Ad(this.castSrc);
			o?.includes("m4s") || o?.includes("mp4") ? (a.hlsSegmentFormat = chrome.cast.media.HlsSegmentFormat.FMP4, a.hlsVideoSegmentFormat = chrome.cast.media.HlsVideoSegmentFormat.FMP4) : o?.includes("ts") && (a.hlsSegmentFormat = chrome.cast.media.HlsSegmentFormat.TS, a.hlsVideoSegmentFormat = chrome.cast.media.HlsVideoSegmentFormat.TS);
		}
		const s = new chrome.cast.media.LoadRequest(a);
		s.currentTime = super.currentTime ?? 0, s.autoplay = !this.#t.paused, s.activeTrackIds = i, await Br()?.loadMedia(s), this.dispatchEvent(new Event("volumechange"));
	}
	play() {
		if (this.#e) {
			this.#e.isPaused && this.#e.controller?.playOrPause();
			return;
		}
		return super.play();
	}
	pause() {
		if (this.#e) {
			this.#e.isPaused || this.#e.controller?.playOrPause();
			return;
		}
		super.pause();
	}
	/**
	* @see https://developers.google.com/cast/docs/reference/web_sender/cast.framework.CastOptions
	* @readonly
	*
	* @typedef {Object} CastOptions
	* @property {string} [receiverApplicationId='CC1AD845'] - The app id of the cast receiver.
	* @property {string} [autoJoinPolicy='origin_scoped'] - The auto join policy.
	* @property {string} [language='en-US'] - The language to use for the cast receiver.
	* @property {boolean} [androidReceiverCompatible=false] - Whether to use the Cast Connect.
	* @property {boolean} [resumeSavedSession=true] - Whether to resume the last session.
	*
	* @return {CastOptions}
	*/
	get castOptions() {
		return this.#i;
	}
	get castReceiver() {
		return this.getAttribute("cast-receiver") ?? void 0;
	}
	set castReceiver(a) {
		this.castReceiver != a && this.setAttribute("cast-receiver", `${a}`);
	}
	get castSrc() {
		return this.getAttribute("cast-src") ?? this.querySelector("source")?.src ?? this.currentSrc;
	}
	set castSrc(a) {
		this.castSrc != a && this.setAttribute("cast-src", `${a}`);
	}
	get castContentType() {
		return this.getAttribute("cast-content-type") ?? void 0;
	}
	set castContentType(a) {
		this.setAttribute("cast-content-type", `${a}`);
	}
	get castStreamType() {
		return this.getAttribute("cast-stream-type") ?? this.streamType ?? void 0;
	}
	set castStreamType(a) {
		this.setAttribute("cast-stream-type", `${a}`);
	}
	get castCustomData() {
		return this.#a;
	}
	set castCustomData(a) {
		const r = typeof a;
		if (!["object", "undefined"].includes(r)) {
			console.error(`castCustomData must be nullish or an object but value was of type ${r}`);
			return;
		}
		this.#a = a;
	}
	get readyState() {
		if (this.#e) switch (this.#e.playerState) {
			case chrome.cast.media.PlayerState.IDLE: return 0;
			case chrome.cast.media.PlayerState.BUFFERING: return 2;
			default: return 3;
		}
		return super.readyState;
	}
	get paused() {
		return this.#e ? this.#e.isPaused : super.paused;
	}
	get muted() {
		return this.#e ? this.#e?.isMuted : super.muted;
	}
	set muted(a) {
		if (this.#e) {
			(a && !this.#e.isMuted || !a && this.#e.isMuted) && this.#e.controller?.muteOrUnmute();
			return;
		}
		super.muted = a;
	}
	get volume() {
		return this.#e ? this.#e?.volumeLevel ?? 1 : super.volume;
	}
	set volume(a) {
		if (this.#e) {
			this.#e.volumeLevel = +a, this.#e.controller?.setVolumeLevel();
			return;
		}
		super.volume = a;
	}
	get duration() {
		return this.#e && this.#e?.isMediaLoaded ? this.#e?.duration ?? NaN : super.duration;
	}
	get currentTime() {
		return this.#e && this.#e?.isMediaLoaded ? this.#e?.currentTime ?? 0 : super.currentTime;
	}
	set currentTime(a) {
		if (this.#e) {
			this.#e.currentTime = a, this.#e.controller?.seek();
			return;
		}
		super.currentTime = a;
	}
};
var $n = (e) => {
	throw TypeError(e);
}, Bn = (e, t, a) => t.has(e) || $n("Cannot " + a), Cd = (e, t, a) => (Bn(e, t, "read from private field"), a ? a.call(e) : t.get(e)), Dd = (e, t, a) => t.has(e) ? $n("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), Sd = (e, t, a, r) => (Bn(e, t, "write to private field"), t.set(e, a), a), Kn = class {
	addEventListener() {}
	removeEventListener() {}
	dispatchEvent(t) {
		return !0;
	}
};
if (typeof DocumentFragment > "u") {
	class e extends Kn {}
	globalThis.DocumentFragment = e;
}
var Od = class extends Kn {}, Ja = typeof window > "u" || typeof globalThis.customElements > "u" ? { customElements: {
	get(e) {},
	define(e, t, a) {},
	getName(e) {
		return null;
	},
	upgrade(e) {},
	whenDefined(e) {
		return Promise.resolve(Od);
	}
} } : globalThis, pa, hi = class extends Rd(_(cd)) {
	constructor() {
		super(...arguments), Dd(this, pa);
	}
	get autoplay() {
		let e = this.getAttribute("autoplay");
		return e === null ? !1 : e === "" ? !0 : e;
	}
	set autoplay(e) {
		e !== this.autoplay && (e ? this.setAttribute("autoplay", typeof e == "string" ? e : "") : this.removeAttribute("autoplay"));
	}
	get muxCastCustomData() {
		return { mux: {
			playbackId: this.playbackId,
			minResolution: this.minResolution,
			maxResolution: this.maxResolution,
			renditionOrder: this.renditionOrder,
			customDomain: this.customDomain,
			tokens: { drm: this.drmToken },
			envKey: this.envKey,
			metadata: this.metadata,
			disableCookies: this.disableCookies,
			disableTracking: this.disableTracking,
			beaconCollectionDomain: this.beaconCollectionDomain,
			startTime: this.startTime,
			preferCmcd: this.preferCmcd
		} };
	}
	get castCustomData() {
		var e;
		return (e = Cd(this, pa)) != null ? e : this.muxCastCustomData;
	}
	set castCustomData(e) {
		Sd(this, pa, e);
	}
};
pa = /* @__PURE__ */ new WeakMap();
Ja.customElements.get("mux-video") || (Ja.customElements.define("mux-video", hi), Ja.MuxVideoElement = hi);
var qn = (e, t, a) => {
	if (!t.has(e)) throw TypeError("Cannot " + a);
}, x = (e, t, a) => (qn(e, t, "read from private field"), a ? a.call(e) : t.get(e)), we = (e, t, a) => {
	if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
	t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, Le = (e, t, a, r) => (qn(e, t, "write to private field"), t.set(e, a), a), pt, ha, tt, $t, He, Fe, Ye, at, ht, va, fe;
var vi = 1, fi = 0, Ld = 1, Pd = { processCallback(e, t, a) {
	if (a) {
		for (const [r, i] of t) if (r in a) {
			const n = a[r];
			typeof n == "boolean" && i instanceof ye && typeof i.element[i.attributeName] == "boolean" ? i.booleanValue = n : typeof n == "function" && i instanceof ye ? i.element[i.attributeName] = n : i.value = n;
		}
	}
} };
var Ba = class extends He$1.DocumentFragment {
	constructor(t, a, r = Pd) {
		var i;
		super(), we(this, pt, void 0), we(this, ha, void 0), this.append(t.content.cloneNode(!0)), Le(this, pt, Wn(this)), Le(this, ha, r), (i = r.createCallback) == null || i.call(r, this, x(this, pt), a), r.processCallback(this, x(this, pt), a);
	}
	update(t) {
		x(this, ha).processCallback(this, x(this, pt), t);
	}
};
pt = /* @__PURE__ */ new WeakMap();
ha = /* @__PURE__ */ new WeakMap();
var Wn = (e, t = []) => {
	let a, r;
	for (const i of e.attributes || []) if (i.value.includes("{{")) {
		const n = new Ud();
		for ([a, r] of _i(i.value)) if (!a) n.append(r);
		else {
			const s = new ye(e, i.name, i.namespaceURI);
			n.append(s), t.push([r, s]);
		}
		i.value = n.toString();
	}
	for (const i of e.childNodes) if (i.nodeType === vi && !(i instanceof HTMLTemplateElement)) Wn(i, t);
	else {
		const n = i.data;
		if (i.nodeType === vi || n.includes("{{")) {
			const s = [];
			if (n) for ([a, r] of _i(n)) if (!a) s.push(new Text(r));
			else {
				const o = new At(e);
				s.push(o), t.push([r, o]);
			}
			else if (i instanceof HTMLTemplateElement) {
				const o = new Yn(e, i);
				s.push(o), t.push([o.expression, o]);
			}
			i.replaceWith(...s.flatMap((o) => o.replacementNodes || [o]));
		}
	}
	return t;
}, bi = {}, _i = (e) => {
	let t = "", a = 0, r = bi[e], i = 0, n;
	if (r) return r;
	for (r = []; n = e[i]; i++) n === "{" && e[i + 1] === "{" && e[i - 1] !== "\\" && e[i + 2] && ++a == 1 ? (t && r.push([fi, t]), t = "", i++) : n === "}" && e[i + 1] === "}" && e[i - 1] !== "\\" && !--a ? (r.push([Ld, t.trim()]), t = "", i++) : t += n || "";
	return t && r.push([fi, (a > 0 ? "{{" : "") + t]), bi[e] = r;
}, Md = 11;
var Hn = class {
	get value() {
		return "";
	}
	set value(t) {}
	toString() {
		return this.value;
	}
};
var Fn = /* @__PURE__ */ new WeakMap();
var Ud = class {
	constructor() {
		we(this, tt, []);
	}
	[Symbol.iterator]() {
		return x(this, tt).values();
	}
	get length() {
		return x(this, tt).length;
	}
	item(t) {
		return x(this, tt)[t];
	}
	append(...t) {
		for (const a of t) a instanceof ye && Fn.set(a, this), x(this, tt).push(a);
	}
	toString() {
		return x(this, tt).join("");
	}
};
tt = /* @__PURE__ */ new WeakMap();
var ye = class extends Hn {
	constructor(t, a, r) {
		super(), we(this, at), we(this, $t, ""), we(this, He, void 0), we(this, Fe, void 0), we(this, Ye, void 0), Le(this, He, t), Le(this, Fe, a), Le(this, Ye, r);
	}
	get attributeName() {
		return x(this, Fe);
	}
	get attributeNamespace() {
		return x(this, Ye);
	}
	get element() {
		return x(this, He);
	}
	get value() {
		return x(this, $t);
	}
	set value(t) {
		x(this, $t) !== t && (Le(this, $t, t), !x(this, at, ht) || x(this, at, ht).length === 1 ? t == null ? x(this, He).removeAttributeNS(x(this, Ye), x(this, Fe)) : x(this, He).setAttributeNS(x(this, Ye), x(this, Fe), t) : x(this, He).setAttributeNS(x(this, Ye), x(this, Fe), x(this, at, ht).toString()));
	}
	get booleanValue() {
		return x(this, He).hasAttributeNS(x(this, Ye), x(this, Fe));
	}
	set booleanValue(t) {
		if (!x(this, at, ht) || x(this, at, ht).length === 1) this.value = t ? "" : null;
		else throw new DOMException("Value is not fully templatized");
	}
};
$t = /* @__PURE__ */ new WeakMap();
He = /* @__PURE__ */ new WeakMap();
Fe = /* @__PURE__ */ new WeakMap();
Ye = /* @__PURE__ */ new WeakMap();
at = /* @__PURE__ */ new WeakSet();
ht = function() {
	return Fn.get(this);
};
var At = class extends Hn {
	constructor(t, a) {
		super(), we(this, va, void 0), we(this, fe, void 0), Le(this, va, t), Le(this, fe, a ? [...a] : [new Text()]);
	}
	get replacementNodes() {
		return x(this, fe);
	}
	get parentNode() {
		return x(this, va);
	}
	get nextSibling() {
		return x(this, fe)[x(this, fe).length - 1].nextSibling;
	}
	get previousSibling() {
		return x(this, fe)[0].previousSibling;
	}
	get value() {
		return x(this, fe).map((t) => t.textContent).join("");
	}
	set value(t) {
		this.replace(t);
	}
	replace(...t) {
		const a = t.flat().flatMap((r) => r == null ? [new Text()] : r.forEach ? [...r] : r.nodeType === Md ? [...r.childNodes] : r.nodeType ? [r] : [new Text(r)]);
		a.length || a.push(new Text()), Le(this, fe, $d(x(this, fe)[0].parentNode, x(this, fe), a, this.nextSibling));
	}
};
va = /* @__PURE__ */ new WeakMap();
fe = /* @__PURE__ */ new WeakMap();
var Yn = class extends At {
	constructor(t, a) {
		const r = a.getAttribute("directive") || a.getAttribute("type");
		let i = a.getAttribute("expression") || a.getAttribute(r) || "";
		i.startsWith("{{") && (i = i.trim().slice(2, -2).trim()), super(t), this.expression = i, this.template = a, this.directive = r;
	}
};
function $d(e, t, a, r = null) {
	let i = 0, n, s, o, l = a.length, u = t.length;
	for (; i < l && i < u && t[i] == a[i];) i++;
	for (; i < l && i < u && a[l - 1] == t[u - 1];) r = a[--u, --l];
	if (i == u) for (; i < l;) e.insertBefore(a[i++], r);
	if (i == l) for (; i < u;) e.removeChild(t[i++]);
	else {
		for (n = t[i]; i < l;) o = a[i++], s = n ? n.nextSibling : r, n == o ? n = s : i < l && a[i] == s ? (e.replaceChild(o, n), n = s) : e.insertBefore(o, n);
		for (; n != r;) s = n.nextSibling, e.removeChild(n), n = s;
	}
	return a;
}
var yi = { string: (e) => String(e) };
var Vn = class {
	constructor(t) {
		this.template = t, this.state = void 0;
	}
};
var ot = /* @__PURE__ */ new WeakMap(), lt = /* @__PURE__ */ new WeakMap(), br = {
	partial: (e, t) => {
		t[e.expression] = new Vn(e.template);
	},
	if: (e, t) => {
		var a;
		if (jn(e.expression, t)) if (ot.get(e) !== e.template) {
			ot.set(e, e.template);
			const r = new Ba(e.template, t, qr);
			e.replace(r), lt.set(e, r);
		} else (a = lt.get(e)) == null || a.update(t);
		else e.replace(""), ot.delete(e), lt.delete(e);
	}
}, Bd = Object.keys(br), qr = { processCallback(e, t, a) {
	var r, i;
	if (a) for (const [n, s] of t) {
		if (s instanceof Yn) {
			if (!s.directive) {
				const l = Bd.find((u) => s.template.hasAttribute(u));
				l && (s.directive = l, s.expression = s.template.getAttribute(l));
			}
			(r = br[s.directive]) == null || r.call(br, s, a);
			continue;
		}
		let o = jn(n, a);
		if (o instanceof Vn) {
			ot.get(s) !== o.template ? (ot.set(s, o.template), o = new Ba(o.template, o.state, qr), s.value = o, lt.set(s, o)) : (i = lt.get(s)) == null || i.update(o.state);
			continue;
		}
		o ? (s instanceof ye && s.attributeName.startsWith("aria-") && (o = String(o)), s instanceof ye ? typeof o == "boolean" ? s.booleanValue = o : typeof o == "function" ? s.element[s.attributeName] = o : s.value = o : (s.value = o, ot.delete(s), lt.delete(s))) : s instanceof ye ? s.value = void 0 : (s.value = void 0, ot.delete(s), lt.delete(s));
	}
} }, gi = {
	"!": (e) => !e,
	"!!": (e) => !!e,
	"==": (e, t) => e == t,
	"!=": (e, t) => e != t,
	">": (e, t) => e > t,
	">=": (e, t) => e >= t,
	"<": (e, t) => e < t,
	"<=": (e, t) => e <= t,
	"??": (e, t) => e ?? t,
	"|": (e, t) => {
		var a;
		return (a = yi[t]) == null ? void 0 : a.call(yi, e);
	}
};
function Kd(e) {
	return qd(e, {
		boolean: /true|false/,
		number: /-?\d+\.?\d*/,
		string: /(["'])((?:\\.|[^\\])*?)\1/,
		operator: /[!=><][=!]?|\?\?|\|/,
		ws: /\s+/,
		param: /[$a-z_][$\w]*/i
	}).filter(({ type: t }) => t !== "ws");
}
function jn(e, t = {}) {
	var a, r, i, n, s, o, l;
	const u = Kd(e);
	if (u.length === 0 || u.some(({ type: m }) => !m)) return Ct(e);
	if (((a = u[0]) == null ? void 0 : a.token) === ">") {
		const m = t[(r = u[1]) == null ? void 0 : r.token];
		if (!m) return Ct(e);
		const p = { ...t };
		m.state = p;
		const c = u.slice(2);
		for (let d = 0; d < c.length; d += 3) {
			const h = (i = c[d]) == null ? void 0 : i.token, y = (n = c[d + 1]) == null ? void 0 : n.token, _ = (s = c[d + 2]) == null ? void 0 : s.token;
			h && y === "=" && (p[h] = Dt(_, t));
		}
		return m;
	}
	if (u.length === 1) return ea(u[0]) ? Dt(u[0].token, t) : Ct(e);
	if (u.length === 2) {
		const p = gi[(o = u[0]) == null ? void 0 : o.token];
		if (!p || !ea(u[1])) return Ct(e);
		return p(Dt(u[1].token, t));
	}
	if (u.length === 3) {
		const m = (l = u[1]) == null ? void 0 : l.token, p = gi[m];
		if (!p || !ea(u[0]) || !ea(u[2])) return Ct(e);
		const c = Dt(u[0].token, t);
		if (m === "|") return p(c, u[2].token);
		return p(c, Dt(u[2].token, t));
	}
}
function Ct(e) {
	return console.warn(`Warning: invalid expression \`${e}\``), !1;
}
function ea({ type: e }) {
	return [
		"number",
		"boolean",
		"string",
		"param"
	].includes(e);
}
function Dt(e, t) {
	const a = e[0], r = e.slice(-1);
	return e === "true" || e === "false" ? e === "true" : a === r && ["'", "\""].includes(a) ? e.slice(1, -1) : zNt(e) ? parseFloat(e) : t[e];
}
function qd(e, t) {
	let a, r, i;
	const n = [];
	for (; e;) {
		i = null, a = e.length;
		for (const s in t) r = t[s].exec(e), r && r.index < a && (i = {
			token: r[0],
			type: s,
			matches: r.slice(1)
		}, a = r.index);
		a && n.push({
			token: e.substr(0, a),
			type: void 0
		}), i && n.push(i), e = e.substr(a + (i ? i.token.length : 0));
	}
	return n;
}
var Wr = (e, t, a) => {
	if (!t.has(e)) throw TypeError("Cannot " + a);
}, Ve = (e, t, a) => (Wr(e, t, "read from private field"), a ? a.call(e) : t.get(e)), Qe = (e, t, a) => {
	if (t.has(e)) throw TypeError("Cannot add the same private member more than once");
	t instanceof WeakSet ? t.add(e) : t.set(e, a);
}, Ie = (e, t, a, r) => (Wr(e, t, "write to private field"), t.set(e, a), a), er = (e, t, a) => (Wr(e, t, "access private method"), a), yt, fa, gt, vt, _r, Gn, ba, yr, Bt;
var tr = {
	mediatargetlivewindow: "targetlivewindow",
	mediastreamtype: "streamtype"
}, zn = Ii$1.createElement("template");
zn.innerHTML = `
  <style>
    :host {
      display: inline-block;
      line-height: 0;
    }

    media-controller {
      width: 100%;
      height: 100%;
    }

    media-captions-button:not([mediasubtitleslist]),
    media-captions-menu:not([mediasubtitleslist]),
    media-captions-menu-button:not([mediasubtitleslist]),
    media-audio-track-menu[mediaaudiotrackunavailable],
    media-audio-track-menu-button[mediaaudiotrackunavailable],
    media-rendition-menu[mediarenditionunavailable],
    media-rendition-menu-button[mediarenditionunavailable],
    media-volume-range[mediavolumeunavailable],
    media-airplay-button[mediaairplayunavailable],
    media-fullscreen-button[mediafullscreenunavailable],
    media-cast-button[mediacastunavailable],
    media-pip-button[mediapipunavailable] {
      display: none;
    }
  </style>
`;
var Ka = class extends He$1.HTMLElement {
	constructor() {
		super(), Qe(this, _r), Qe(this, ba), Qe(this, yt, void 0), Qe(this, fa, void 0), Qe(this, gt, void 0), Qe(this, vt, void 0), Qe(this, Bt, void 0), this.shadowRoot ? this.renderRoot = this.shadowRoot : (this.renderRoot = this.attachShadow({ mode: "open" }), this.createRenderer()), Ie(this, vt, new MutationObserver((t) => {
			var a;
			this.mediaController && !((a = this.mediaController) != null && a.breakpointsComputed) || t.some((r) => {
				const i = r.target;
				return i === this ? !0 : i.localName !== "media-controller" ? !1 : !!(tr[r.attributeName] || r.attributeName.startsWith("breakpoint"));
			}) && this.render();
		})), Ie(this, Bt, this.render.bind(this)), er(this, _r, Gn).call(this, "template");
	}
	/** @type {HTMLElement & { breakpointsComputed?: boolean }} */
	get mediaController() {
		return this.renderRoot.querySelector("media-controller");
	}
	get template() {
		var t;
		return (t = Ve(this, yt)) != null ? t : this.constructor.template;
	}
	set template(t) {
		if (t === null) {
			this.removeAttribute("template");
			return;
		}
		typeof t == "string" ? this.setAttribute("template", t) : t instanceof HTMLTemplateElement && (Ie(this, yt, t), Ie(this, gt, null), this.createRenderer());
	}
	get props() {
		var t, a, r;
		const i = [...Array.from((a = (t = this.mediaController) == null ? void 0 : t.attributes) != null ? a : []).filter(({ name: s }) => tr[s] || s.startsWith("breakpoint")), ...Array.from(this.attributes)], n = {};
		for (const s of i) {
			const o = (r = tr[s.name]) != null ? r : VNt(s.name);
			let { value: l } = s;
			l != null ? (zNt(l) && (l = parseFloat(l)), n[o] = l === "" ? !0 : l) : n[o] = !1;
		}
		return n;
	}
	attributeChangedCallback(t, a, r) {
		t === "template" && a != r && er(this, ba, yr).call(this);
	}
	connectedCallback() {
		this.addEventListener(Fp.BREAKPOINTS_COMPUTED, Ve(this, Bt)), Ve(this, vt).observe(this, { attributes: !0 }), Ve(this, vt).observe(this.renderRoot, {
			attributes: !0,
			subtree: !0
		}), er(this, ba, yr).call(this);
	}
	disconnectedCallback() {
		this.removeEventListener(Fp.BREAKPOINTS_COMPUTED, Ve(this, Bt)), Ve(this, vt).disconnect();
	}
	createRenderer() {
		this.template instanceof HTMLTemplateElement && this.template !== Ve(this, fa) && (Ie(this, fa, this.template), this.renderer = new Ba(this.template, this.props, this.constructor.processor), this.renderRoot.textContent = "", this.renderRoot.append(zn.content.cloneNode(!0), this.renderer));
	}
	render() {
		var t;
		(t = this.renderer) == null || t.update(this.props);
	}
};
yt = /* @__PURE__ */ new WeakMap();
fa = /* @__PURE__ */ new WeakMap();
gt = /* @__PURE__ */ new WeakMap();
vt = /* @__PURE__ */ new WeakMap();
_r = /* @__PURE__ */ new WeakSet();
Gn = function(e) {
	if (Object.prototype.hasOwnProperty.call(this, e)) {
		const t = this[e];
		delete this[e], this[e] = t;
	}
};
ba = /* @__PURE__ */ new WeakSet();
yr = function() {
	var e;
	const t = this.getAttribute("template");
	if (!t || t === Ve(this, gt)) return;
	const a = this.getRootNode(), r = (e = a?.getElementById) == null ? void 0 : e.call(a, t);
	if (r) {
		Ie(this, gt, t), Ie(this, yt, r), this.createRenderer();
		return;
	}
	Wd(t) && (Ie(this, gt, t), Hd(t).then((i) => {
		const n = Ii$1.createElement("template");
		n.innerHTML = i, Ie(this, yt, n), this.createRenderer();
	}).catch(console.error));
};
Bt = /* @__PURE__ */ new WeakMap();
Ka.observedAttributes = ["template"];
Ka.processor = qr;
function Wd(e) {
	if (!/^(\/|\.\/|https?:\/\/)/.test(e)) return !1;
	const t = /^https?:\/\//.test(e) ? void 0 : location.origin;
	try {
		new URL(e, t);
	} catch {
		return !1;
	}
	return !0;
}
async function Hd(e) {
	const t = await fetch(e);
	if (t.status !== 200) throw new Error(`Failed to load resource: the server responded with a status of ${t.status}`);
	return t.text();
}
He$1.customElements.get("media-theme") || He$1.customElements.define("media-theme", Ka);
var Zn = (e) => {
	throw TypeError(e);
}, Hr = (e, t, a) => t.has(e) || Zn("Cannot " + a), O = (e, t, a) => (Hr(e, t, "read from private field"), a ? a.call(e) : t.get(e)), J = (e, t, a) => t.has(e) ? Zn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), re = (e, t, a, r) => (Hr(e, t, "write to private field"), t.set(e, a), a), F = (e, t, a) => (Hr(e, t, "access private method"), a), qa = class {
	addEventListener() {}
	removeEventListener() {}
	dispatchEvent(e) {
		return !0;
	}
};
if (typeof DocumentFragment > "u") {
	class e extends qa {}
	globalThis.DocumentFragment = e;
}
var Fr = class extends qa {}, Fd = class extends qa {}, Yd = {
	get(e) {},
	define(e, t, a) {},
	getName(e) {
		return null;
	},
	upgrade(e) {},
	whenDefined(e) {
		return Promise.resolve(Fr);
	}
}, _a, Vd = class {
	constructor(e, t = {}) {
		J(this, _a), re(this, _a, t?.detail);
	}
	get detail() {
		return O(this, _a);
	}
	initCustomEvent() {}
};
_a = /* @__PURE__ */ new WeakMap();
function jd(e, t) {
	return new Fr();
}
var Xn = {
	document: { createElement: jd },
	DocumentFragment,
	customElements: Yd,
	CustomEvent: Vd,
	EventTarget: qa,
	HTMLElement: Fr,
	HTMLVideoElement: Fd
}, Qn = typeof window > "u" || typeof globalThis.customElements > "u", Re = Qn ? Xn : globalThis, Na = Qn ? Xn.document : globalThis.document;
function Gd(e) {
	let t = "";
	return Object.entries(e).forEach(([a, r]) => {
		r != null && (t += `${gr(a)}: ${r}; `);
	}), t ? t.trim() : void 0;
}
function gr(e) {
	return e.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function Jn(e) {
	return e.replace(/[-_]([a-z])/g, (t, a) => a.toUpperCase());
}
function oe(e) {
	if (e == null) return;
	let t = +e;
	return Number.isNaN(t) ? void 0 : t;
}
function es(e) {
	let t = zd(e).toString();
	return t ? "?" + t : "";
}
function zd(e) {
	let t = {};
	for (let a in e) e[a] != null && (t[a] = e[a]);
	return new URLSearchParams(t);
}
var ts = (e, t) => !e || !t ? !1 : e.contains(t) ? !0 : ts(e, t.getRootNode().host), as = "mux.com", Zd = () => {
	try {
		return "3.11.7";
	} catch {}
	return "UNKNOWN";
}, Xd = Zd(), rs = () => Xd, Qd = (e, { token: t, customDomain: a = as, thumbnailTime: r, programTime: i } = {}) => {
	var n;
	let s = t == null ? r : void 0, { aud: o } = (n = _t(t)) != null ? n : {};
	if (!(t && o !== "t")) return `https://image.${a}/${e}/thumbnail.webp${es({
		token: t,
		time: s,
		program_time: i
	})}`;
}, Jd = (e, { token: t, customDomain: a = as, programStartTime: r, programEndTime: i } = {}) => {
	var n;
	let { aud: s } = (n = _t(t)) != null ? n : {};
	if (!(t && s !== "s")) return `https://image.${a}/${e}/storyboard.vtt${es({
		token: t,
		format: "webp",
		program_start_time: r,
		program_end_time: i
	})}`;
}, Yr = (e) => {
	if (e) {
		if ([U.LIVE, U.ON_DEMAND].includes(e)) return e;
		if (e != null && e.includes("live")) return U.LIVE;
	}
}, ec = {
	crossorigin: "crossOrigin",
	playsinline: "playsInline"
};
function tc(e) {
	var t;
	return (t = ec[e]) != null ? t : Jn(e);
}
var ft, bt, ae, ac = class {
	constructor(e, t) {
		J(this, ft), J(this, bt), J(this, ae, []), re(this, ft, e), re(this, bt, t);
	}
	[Symbol.iterator]() {
		return O(this, ae).values();
	}
	get length() {
		return O(this, ae).length;
	}
	get value() {
		var e;
		return (e = O(this, ae).join(" ")) != null ? e : "";
	}
	set value(e) {
		var t;
		e !== this.value && (re(this, ae, []), this.add(...(t = e?.split(" ")) != null ? t : []));
	}
	toString() {
		return this.value;
	}
	item(e) {
		return O(this, ae)[e];
	}
	values() {
		return O(this, ae).values();
	}
	keys() {
		return O(this, ae).keys();
	}
	forEach(e) {
		O(this, ae).forEach(e);
	}
	add(...e) {
		var t, a;
		e.forEach((r) => {
			this.contains(r) || O(this, ae).push(r);
		}), !(this.value === "" && !((t = O(this, ft)) != null && t.hasAttribute(`${O(this, bt)}`))) && ((a = O(this, ft)) == null || a.setAttribute(`${O(this, bt)}`, `${this.value}`));
	}
	remove(...e) {
		var t;
		e.forEach((a) => {
			O(this, ae).splice(O(this, ae).indexOf(a), 1);
		}), (t = O(this, ft)) == null || t.setAttribute(`${O(this, bt)}`, `${this.value}`);
	}
	contains(e) {
		return O(this, ae).includes(e);
	}
	toggle(e, t) {
		return typeof t < "u" ? t ? (this.add(e), !0) : (this.remove(e), !1) : this.contains(e) ? (this.remove(e), !1) : (this.add(e), !0);
	}
	replace(e, t) {
		this.remove(e), this.add(t);
	}
};
ft = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), ae = /* @__PURE__ */ new WeakMap();
var is = `[mux-player ${rs()}]`;
function Oe(...e) {
	console.warn(is, ...e);
}
function le(...e) {
	console.error(is, ...e);
}
function Ei(e) {
	var t;
	let a = (t = e.message) != null ? t : "";
	e.context && (a += ` ${e.context}`), e.file && (a += ` ${R("Read more: ")}
https://github.com/muxinc/elements/blob/main/errors/${e.file}`), Oe(a);
}
var ee = {
	AUTOPLAY: "autoplay",
	CROSSORIGIN: "crossorigin",
	LOOP: "loop",
	MUTED: "muted",
	PLAYSINLINE: "playsinline",
	PRELOAD: "preload"
}, rt = {
	VOLUME: "volume",
	PLAYBACKRATE: "playbackrate",
	MUTED: "muted"
}, Ti = Object.freeze({
	length: 0,
	start(e) {
		let t = e >>> 0;
		if (t >= this.length) throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);
		return 0;
	},
	end(e) {
		let t = e >>> 0;
		if (t >= this.length) throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);
		return 0;
	}
}), rc = Object.values(ee).filter((e) => ee.PLAYSINLINE !== e), ic = Object.values(rt), nc = [...rc, ...ic], sc = class extends Re.HTMLElement {
	static get observedAttributes() {
		return nc;
	}
	constructor() {
		super();
	}
	attributeChangedCallback(e, t, a) {
		var r, i;
		switch (e) {
			case rt.MUTED:
				this.media && (this.media.muted = a != null, this.media.defaultMuted = a != null);
				return;
			case rt.VOLUME: {
				let n = (r = oe(a)) != null ? r : 1;
				this.media && (this.media.volume = n);
				return;
			}
			case rt.PLAYBACKRATE: {
				let n = (i = oe(a)) != null ? i : 1;
				this.media && (this.media.playbackRate = n, this.media.defaultPlaybackRate = n);
				return;
			}
		}
	}
	play() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.play()) != null ? t : Promise.reject();
	}
	pause() {
		var e;
		(e = this.media) == null || e.pause();
	}
	load() {
		var e;
		(e = this.media) == null || e.load();
	}
	get media() {
		var e;
		return (e = this.shadowRoot) == null ? void 0 : e.querySelector("mux-video");
	}
	get audioTracks() {
		return this.media.audioTracks;
	}
	get videoTracks() {
		return this.media.videoTracks;
	}
	get audioRenditions() {
		return this.media.audioRenditions;
	}
	get videoRenditions() {
		return this.media.videoRenditions;
	}
	get paused() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.paused) != null ? t : !0;
	}
	get duration() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.duration) != null ? t : NaN;
	}
	get ended() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.ended) != null ? t : !1;
	}
	get buffered() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.buffered) != null ? t : Ti;
	}
	get seekable() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.seekable) != null ? t : Ti;
	}
	get readyState() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.readyState) != null ? t : 0;
	}
	get videoWidth() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.videoWidth) != null ? t : 0;
	}
	get videoHeight() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.videoHeight) != null ? t : 0;
	}
	get currentSrc() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.currentSrc) != null ? t : "";
	}
	get currentTime() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.currentTime) != null ? t : 0;
	}
	set currentTime(e) {
		this.media && (this.media.currentTime = Number(e));
	}
	get volume() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.volume) != null ? t : 1;
	}
	set volume(e) {
		this.media && (this.media.volume = Number(e));
	}
	get playbackRate() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.playbackRate) != null ? t : 1;
	}
	set playbackRate(e) {
		this.media && (this.media.playbackRate = Number(e));
	}
	get defaultPlaybackRate() {
		var e;
		return (e = oe(this.getAttribute(rt.PLAYBACKRATE))) != null ? e : 1;
	}
	set defaultPlaybackRate(e) {
		e != null ? this.setAttribute(rt.PLAYBACKRATE, `${e}`) : this.removeAttribute(rt.PLAYBACKRATE);
	}
	get crossOrigin() {
		return St(this, ee.CROSSORIGIN);
	}
	set crossOrigin(e) {
		this.setAttribute(ee.CROSSORIGIN, `${e}`);
	}
	get autoplay() {
		return St(this, ee.AUTOPLAY) != null;
	}
	set autoplay(e) {
		e ? this.setAttribute(ee.AUTOPLAY, typeof e == "string" ? e : "") : this.removeAttribute(ee.AUTOPLAY);
	}
	get loop() {
		return St(this, ee.LOOP) != null;
	}
	set loop(e) {
		e ? this.setAttribute(ee.LOOP, "") : this.removeAttribute(ee.LOOP);
	}
	get muted() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.muted) != null ? t : !1;
	}
	set muted(e) {
		this.media && (this.media.muted = !!e);
	}
	get defaultMuted() {
		return St(this, ee.MUTED) != null;
	}
	set defaultMuted(e) {
		e ? this.setAttribute(ee.MUTED, "") : this.removeAttribute(ee.MUTED);
	}
	get playsInline() {
		return St(this, ee.PLAYSINLINE) != null;
	}
	set playsInline(e) {
		le("playsInline is set to true by default and is not currently supported as a setter.");
	}
	get preload() {
		return this.media ? this.media.preload : this.getAttribute("preload");
	}
	set preload(e) {
		[
			"",
			"none",
			"metadata",
			"auto"
		].includes(e) ? this.setAttribute(ee.PRELOAD, e) : this.removeAttribute(ee.PRELOAD);
	}
};
function St(e, t) {
	return e.media ? e.media.getAttribute(t) : e.getAttribute(t);
}
var ki = sc, oc = `:host {
  --media-control-display: var(--controls);
  --media-loading-indicator-display: var(--loading-indicator);
  --media-dialog-display: var(--dialog);
  --media-play-button-display: var(--play-button);
  --media-live-button-display: var(--live-button);
  --media-seek-backward-button-display: var(--seek-backward-button);
  --media-seek-forward-button-display: var(--seek-forward-button);
  --media-mute-button-display: var(--mute-button);
  --media-captions-button-display: var(--captions-button);
  --media-captions-menu-button-display: var(--captions-menu-button, var(--media-captions-button-display));
  --media-rendition-menu-button-display: var(--rendition-menu-button);
  --media-audio-track-menu-button-display: var(--audio-track-menu-button);
  --media-airplay-button-display: var(--airplay-button);
  --media-pip-button-display: var(--pip-button);
  --media-fullscreen-button-display: var(--fullscreen-button);
  --media-cast-button-display: var(--cast-button, var(--_cast-button-drm-display));
  --media-playback-rate-button-display: var(--playback-rate-button);
  --media-playback-rate-menu-button-display: var(--playback-rate-menu-button);
  --media-volume-range-display: var(--volume-range);
  --media-time-range-display: var(--time-range);
  --media-time-display-display: var(--time-display);
  --media-duration-display-display: var(--duration-display);
  --media-title-display-display: var(--title-display);

  display: inline-block;
  line-height: 0;
  width: 100%;
}

a {
  color: #fff;
  font-size: 0.9em;
  text-decoration: underline;
}

media-theme {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
  direction: ltr;
}

media-poster-image {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
}

media-poster-image:not([src]):not([placeholdersrc]) {
  display: none;
}

::part(top),
[part~='top'] {
  --media-control-display: var(--controls, var(--top-controls));
  --media-play-button-display: var(--play-button, var(--top-play-button));
  --media-live-button-display: var(--live-button, var(--top-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--top-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--top-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--top-mute-button));
  --media-captions-button-display: var(--captions-button, var(--top-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--top-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--top-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--top-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--top-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--top-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--top-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--top-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--top-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --captions-menu-button,
    var(--media-playback-rate-button-display, var(--top-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--top-volume-range));
  --media-time-range-display: var(--time-range, var(--top-time-range));
  --media-time-display-display: var(--time-display, var(--top-time-display));
  --media-duration-display-display: var(--duration-display, var(--top-duration-display));
  --media-title-display-display: var(--title-display, var(--top-title-display));
}

::part(center),
[part~='center'] {
  --media-control-display: var(--controls, var(--center-controls));
  --media-play-button-display: var(--play-button, var(--center-play-button));
  --media-live-button-display: var(--live-button, var(--center-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--center-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--center-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--center-mute-button));
  --media-captions-button-display: var(--captions-button, var(--center-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--center-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--center-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--center-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--center-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--center-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--center-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--center-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--center-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--center-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--center-volume-range));
  --media-time-range-display: var(--time-range, var(--center-time-range));
  --media-time-display-display: var(--time-display, var(--center-time-display));
  --media-duration-display-display: var(--duration-display, var(--center-duration-display));
}

::part(bottom),
[part~='bottom'] {
  --media-control-display: var(--controls, var(--bottom-controls));
  --media-play-button-display: var(--play-button, var(--bottom-play-button));
  --media-live-button-display: var(--live-button, var(--bottom-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--bottom-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--bottom-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--bottom-mute-button));
  --media-captions-button-display: var(--captions-button, var(--bottom-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--bottom-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--bottom-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--bottom-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--bottom-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--bottom-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--bottom-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--bottom-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--bottom-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--bottom-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--bottom-volume-range));
  --media-time-range-display: var(--time-range, var(--bottom-time-range));
  --media-time-display-display: var(--time-display, var(--bottom-time-display));
  --media-duration-display-display: var(--duration-display, var(--bottom-duration-display));
  --media-title-display-display: var(--title-display, var(--bottom-title-display));
}

:host([no-tooltips]) {
  --media-tooltip-display: none;
}
`, Ot = /* @__PURE__ */ new WeakMap(), lc = class ns {
	constructor(t, a) {
		this.element = t, this.type = a, this.element.addEventListener(this.type, this);
		let r = Ot.get(this.element);
		r && r.set(this.type, this);
	}
	set(t) {
		if (typeof t == "function") this.handleEvent = t.bind(this.element);
		else if (typeof t == "object" && typeof t.handleEvent == "function") this.handleEvent = t.handleEvent.bind(t);
		else {
			this.element.removeEventListener(this.type, this);
			let a = Ot.get(this.element);
			a && a.delete(this.type);
		}
	}
	static for(t) {
		Ot.has(t.element) || Ot.set(t.element, /* @__PURE__ */ new Map());
		let a = t.attributeName.slice(2), r = Ot.get(t.element);
		return r && r.has(a) ? r.get(a) : new ns(t.element, a);
	}
};
function uc(e, t) {
	return e instanceof ye && e.attributeName.startsWith("on") ? (lc.for(e).set(t), e.element.removeAttributeNS(e.attributeNamespace, e.attributeName), !0) : !1;
}
function dc(e, t) {
	return t instanceof ss && e instanceof At ? (t.renderInto(e), !0) : !1;
}
function cc(e, t) {
	return t instanceof DocumentFragment && e instanceof At ? (t.childNodes.length && e.replace(...t.childNodes), !0) : !1;
}
function mc(e, t) {
	if (e instanceof ye) {
		let a = e.attributeNamespace, r = e.element.getAttributeNS(a, e.attributeName);
		return String(t) !== r && (e.value = String(t)), !0;
	}
	return e.value = String(t), !0;
}
function pc(e, t) {
	if (e instanceof ye && t instanceof Element) {
		let a = e.element;
		return a[e.attributeName] !== t && (e.element.removeAttributeNS(e.attributeNamespace, e.attributeName), a[e.attributeName] = t), !0;
	}
	return !1;
}
function hc(e, t) {
	if (typeof t == "boolean" && e instanceof ye) {
		let a = e.attributeNamespace;
		return t !== e.element.hasAttributeNS(a, e.attributeName) && (e.booleanValue = t), !0;
	}
	return !1;
}
function vc(e, t) {
	return t === !1 && e instanceof At ? (e.replace(""), !0) : !1;
}
function fc(e, t) {
	pc(e, t) || hc(e, t) || uc(e, t) || vc(e, t) || dc(e, t) || cc(e, t) || mc(e, t);
}
var ar = /* @__PURE__ */ new Map(), Ai = /* @__PURE__ */ new WeakMap(), wi = /* @__PURE__ */ new WeakMap(), ss = class {
	constructor(e, t, a) {
		this.strings = e, this.values = t, this.processor = a, this.stringsKey = this.strings.join("");
	}
	get template() {
		if (ar.has(this.stringsKey)) return ar.get(this.stringsKey);
		{
			let e = Na.createElement("template"), t = this.strings.length - 1;
			return e.innerHTML = this.strings.reduce((a, r, i) => a + r + (i < t ? `{{ ${i} }}` : ""), ""), ar.set(this.stringsKey, e), e;
		}
	}
	renderInto(e) {
		var t;
		let a = this.template;
		if (Ai.get(e) !== a) {
			Ai.set(e, a);
			let i = new Ba(a, this.values, this.processor);
			wi.set(e, i), e instanceof At ? e.replace(...i.children) : e.appendChild(i);
			return;
		}
		let r = wi.get(e);
		(t = r?.update) == null || t.call(r, this.values);
	}
}, bc = { processCallback(e, t, a) {
	var r;
	if (a) {
		for (let [i, n] of t) if (i in a) fc(n, (r = a[i]) != null ? r : "");
	}
} };
function ya(e, ...t) {
	return new ss(e, t, bc);
}
function _c(e, t) {
	e.renderInto(t);
}
var yc = (e) => {
	let { tokens: t } = e;
	return t.drm ? ":host(:not([cast-receiver])) { --_cast-button-drm-display: none; }" : "";
}, gc = (e) => ya`
  <style>
    ${yc(e)}
    ${oc}
  </style>
  ${Ac(e)}
`, Ec = (e) => {
	let t = e.hotKeys ? `${e.hotKeys}` : "";
	return Yr(e.streamType) === "live" && (t += " noarrowleft noarrowright"), t;
}, kc = Object.values({
	TOP: "top",
	CENTER: "center",
	BOTTOM: "bottom",
	LAYER: "layer",
	MEDIA_LAYER: "media-layer",
	POSTER_LAYER: "poster-layer",
	VERTICAL_LAYER: "vertical-layer",
	CENTERED_LAYER: "centered-layer",
	GESTURE_LAYER: "gesture-layer",
	CONTROLLER_LAYER: "controller",
	BUTTON: "button",
	RANGE: "range",
	THUMB: "thumb",
	DISPLAY: "display",
	CONTROL_BAR: "control-bar",
	MENU_BUTTON: "menu-button",
	MENU: "menu",
	MENU_ITEM: "menu-item",
	OPTION: "option",
	POSTER: "poster",
	LIVE: "live",
	PLAY: "play",
	PRE_PLAY: "pre-play",
	SEEK_BACKWARD: "seek-backward",
	SEEK_FORWARD: "seek-forward",
	MUTE: "mute",
	CAPTIONS: "captions",
	AIRPLAY: "airplay",
	PIP: "pip",
	FULLSCREEN: "fullscreen",
	CAST: "cast",
	PLAYBACK_RATE: "playback-rate",
	VOLUME: "volume",
	TIME: "time",
	TITLE: "title",
	AUDIO_TRACK: "audio-track",
	RENDITION: "rendition"
}).join(", "), Ac = (e) => {
	var t, a, r, i, n, s, o, l, u, m, p, c, d, h, y, _, g, b, f, T, w, D, I, M, K, L, N, ne, Ee, Te, Q, ue, Be, Ke, qe, ke, te, se, de;
	return ya`
  <media-theme
    template="${e.themeTemplate || !1}"
    defaultstreamtype="${(t = e.defaultStreamType) != null ? t : !1}"
    hotkeys="${Ec(e) || !1}"
    nohotkeys="${e.noHotKeys || !e.hasSrc || !1}"
    noautoseektolive="${!!((a = e.streamType) != null && a.includes(U.LIVE)) && e.targetLiveWindow !== 0}"
    novolumepref="${e.novolumepref || !1}"
    nomutedpref="${e.nomutedpref || !1}"
    disabled="${!e.hasSrc || e.isDialogOpen}"
    audio="${(r = e.audio) != null ? r : !1}"
    style="${(i = Gd({
		"--media-primary-color": e.primaryColor,
		"--media-secondary-color": e.secondaryColor,
		"--media-accent-color": e.accentColor
	})) != null ? i : !1}"
    defaultsubtitles="${!e.defaultHiddenCaptions}"
    forwardseekoffset="${(n = e.forwardSeekOffset) != null ? n : !1}"
    backwardseekoffset="${(s = e.backwardSeekOffset) != null ? s : !1}"
    playbackrates="${(o = e.playbackRates) != null ? o : !1}"
    defaultshowremainingtime="${(l = e.defaultShowRemainingTime) != null ? l : !1}"
    defaultduration="${(u = e.defaultDuration) != null ? u : !1}"
    hideduration="${(m = e.hideDuration) != null ? m : !1}"
    title="${(p = e.title) != null ? p : !1}"
    videotitle="${(c = e.videoTitle) != null ? c : !1}"
    proudlydisplaymuxbadge="${(d = e.proudlyDisplayMuxBadge) != null ? d : !1}"
    exportparts="${kc}"
    onclose="${e.onCloseErrorDialog}"
    onfocusin="${e.onFocusInErrorDialog}"
  >
    <mux-video
      slot="media"
      inert="${(h = e.noHotKeys) != null ? h : !1}"
      target-live-window="${(y = e.targetLiveWindow) != null ? y : !1}"
      stream-type="${(_ = Yr(e.streamType)) != null ? _ : !1}"
      crossorigin="${(g = e.crossOrigin) != null ? g : ""}"
      playsinline
      autoplay="${(b = e.autoplay) != null ? b : !1}"
      muted="${(f = e.muted) != null ? f : !1}"
      loop="${(T = e.loop) != null ? T : !1}"
      preload="${(w = e.preload) != null ? w : !1}"
      debug="${(D = e.debug) != null ? D : !1}"
      prefer-cmcd="${(I = e.preferCmcd) != null ? I : !1}"
      disable-tracking="${(M = e.disableTracking) != null ? M : !1}"
      disable-cookies="${(K = e.disableCookies) != null ? K : !1}"
      prefer-playback="${(L = e.preferPlayback) != null ? L : !1}"
      start-time="${e.startTime != null ? e.startTime : !1}"
      beacon-collection-domain="${(N = e.beaconCollectionDomain) != null ? N : !1}"
      player-init-time="${(ne = e.playerInitTime) != null ? ne : !1}"
      player-software-name="${(Ee = e.playerSoftwareName) != null ? Ee : !1}"
      player-software-version="${(Te = e.playerSoftwareVersion) != null ? Te : !1}"
      env-key="${(Q = e.envKey) != null ? Q : !1}"
      custom-domain="${(ue = e.customDomain) != null ? ue : !1}"
      src="${e.src ? e.src : e.playbackId ? hr(e) : !1}"
      cast-src="${e.src ? e.src : e.playbackId ? hr(e) : !1}"
      cast-receiver="${(Be = e.castReceiver) != null ? Be : !1}"
      drm-token="${(qe = (Ke = e.tokens) == null ? void 0 : Ke.drm) != null ? qe : !1}"
      exportparts="video"
      disable-pseudo-ended="${(ke = e.disablePseudoEnded) != null ? ke : !1}"
      max-auto-resolution="${(te = e.maxAutoResolution) != null ? te : !1}"
      cap-rendition-to-player-size="${(se = e.capRenditionToPlayerSize) != null ? se : !1}"
    >
      ${e.storyboard ? ya`<track label="thumbnails" default kind="metadata" src="${e.storyboard}" />` : ya``}
      <slot></slot>
    </mux-video>
    <slot name="poster" slot="poster">
      <media-poster-image
        part="poster"
        exportparts="poster, img"
        src="${e.poster ? e.poster : !1}"
        placeholdersrc="${(de = e.placeholder) != null ? de : !1}"
      ></media-poster-image>
    </slot>
  </media-theme>
`;
}, os = (e) => e.charAt(0).toUpperCase() + e.slice(1), wc = (e, t = !1) => {
	var a, r;
	if (e.muxCode) {
		let i = os((a = e.errorCategory) != null ? a : "video"), n = Ma((r = e.errorCategory) != null ? r : $.VIDEO);
		if (e.muxCode === C.NETWORK_OFFLINE) return R("Your device appears to be offline", t);
		if (e.muxCode === C.NETWORK_TOKEN_EXPIRED) return R("{category} URL has expired", t).format({ category: i });
		if ([
			C.NETWORK_TOKEN_SUB_MISMATCH,
			C.NETWORK_TOKEN_AUD_MISMATCH,
			C.NETWORK_TOKEN_AUD_MISSING,
			C.NETWORK_TOKEN_MALFORMED
		].includes(e.muxCode)) return R("{category} URL is formatted incorrectly", t).format({ category: i });
		if (e.muxCode === C.NETWORK_TOKEN_MISSING) return R("Invalid {categoryName} URL", t).format({ categoryName: n });
		if (e.muxCode === C.NETWORK_NOT_FOUND) return R("{category} does not exist", t).format({ category: i });
		if (e.muxCode === C.NETWORK_NOT_READY) {
			let s = e.streamType === "live" ? "Live stream" : "Video";
			return R("{mediaType} is not currently available", t).format({ mediaType: s });
		}
	}
	if (e.code) {
		if (e.code === A.MEDIA_ERR_NETWORK) return R("Network Error", t);
		if (e.code === A.MEDIA_ERR_DECODE) return R("Media Error", t);
		if (e.code === A.MEDIA_ERR_SRC_NOT_SUPPORTED) return R("Source Not Supported", t);
	}
	return R("Error", t);
}, Rc = (e, t = !1) => {
	var a, r;
	if (e.muxCode) {
		let i = os((a = e.errorCategory) != null ? a : "video"), n = Ma((r = e.errorCategory) != null ? r : $.VIDEO);
		return e.muxCode === C.NETWORK_OFFLINE ? R("Check your internet connection and try reloading this video.", t) : e.muxCode === C.NETWORK_TOKEN_EXPIRED ? R("The video’s secured {tokenNamePrefix}-token has expired.", t).format({ tokenNamePrefix: n }) : e.muxCode === C.NETWORK_TOKEN_SUB_MISMATCH ? R("The video’s playback ID does not match the one encoded in the {tokenNamePrefix}-token.", t).format({ tokenNamePrefix: n }) : e.muxCode === C.NETWORK_TOKEN_MALFORMED ? R("{category} URL is formatted incorrectly", t).format({ category: i }) : [C.NETWORK_TOKEN_AUD_MISMATCH, C.NETWORK_TOKEN_AUD_MISSING].includes(e.muxCode) ? R("The {tokenNamePrefix}-token is formatted with incorrect information.", t).format({ tokenNamePrefix: n }) : [C.NETWORK_TOKEN_MISSING, C.NETWORK_INVALID_URL].includes(e.muxCode) ? R("The video URL or {tokenNamePrefix}-token are formatted with incorrect or incomplete information.", t).format({ tokenNamePrefix: n }) : e.muxCode === C.NETWORK_NOT_FOUND ? "" : e.message;
	}
	return e.code && (e.code === A.MEDIA_ERR_NETWORK || e.code === A.MEDIA_ERR_DECODE || (e.code, A.MEDIA_ERR_SRC_NOT_SUPPORTED)), e.message;
}, Cc = (e, t = !1) => {
	return {
		title: wc(e, t).toString(),
		message: Rc(e, t).toString()
	};
}, Dc = (e) => {
	if (e.muxCode) {
		if (e.muxCode === C.NETWORK_TOKEN_EXPIRED) return "403-expired-token.md";
		if (e.muxCode === C.NETWORK_TOKEN_MALFORMED) return "403-malformatted-token.md";
		if ([C.NETWORK_TOKEN_AUD_MISMATCH, C.NETWORK_TOKEN_AUD_MISSING].includes(e.muxCode)) return "403-incorrect-aud-value.md";
		if (e.muxCode === C.NETWORK_TOKEN_SUB_MISMATCH) return "403-playback-id-mismatch.md";
		if (e.muxCode === C.NETWORK_TOKEN_MISSING) return "missing-signed-tokens.md";
		if (e.muxCode === C.NETWORK_NOT_FOUND) return "404-not-found.md";
		if (e.muxCode === C.NETWORK_NOT_READY) return "412-not-playable.md";
	}
	if (e.code) {
		if (e.code === A.MEDIA_ERR_NETWORK) return "";
		if (e.code === A.MEDIA_ERR_DECODE) return "media-decode-error.md";
		if (e.code === A.MEDIA_ERR_SRC_NOT_SUPPORTED) return "media-src-not-supported.md";
	}
	return "";
}, ls = (e, t) => {
	let a = Dc(e);
	return {
		message: e.message,
		context: e.context,
		file: a
	};
}, Sc = `<template id="media-theme-gerwig">
  <style>
    @keyframes pre-play-hide {
      0% {
        transform: scale(1);
        opacity: 1;
      }

      30% {
        transform: scale(0.7);
      }

      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    :host {
      --_primary-color: var(--media-primary-color, #fff);
      --_secondary-color: var(--media-secondary-color, transparent);
      --_accent-color: var(--media-accent-color, #fa50b5);
      --_text-color: var(--media-text-color, #000);

      --media-icon-color: var(--_primary-color);
      --media-control-background: var(--_secondary-color);
      --media-control-hover-background: var(--_accent-color);
      --media-time-buffered-color: rgba(255, 255, 255, 0.4);
      --media-preview-time-text-shadow: none;
      --media-control-height: 14px;
      --media-control-padding: 6px;
      --media-tooltip-container-margin: 6px;
      --media-tooltip-distance: 18px;

      color: var(--_primary-color);
      display: inline-block;
      width: 100%;
      height: 100%;
    }

    :host([audio]) {
      --_secondary-color: var(--media-secondary-color, black);
      --media-preview-time-text-shadow: none;
    }

    :host([audio]) ::slotted([slot='media']) {
      height: 0px;
    }

    :host([audio]) media-loading-indicator {
      display: none;
    }

    :host([audio]) media-controller {
      background: transparent;
    }

    :host([audio]) media-controller::part(vertical-layer) {
      background: transparent;
    }

    :host([audio]) media-control-bar {
      width: 100%;
      background-color: var(--media-control-background);
    }

    /*
     * 0.433s is the transition duration for VTT Regions.
     * Borrowed here, so the captions don't move too fast.
     */
    media-controller {
      --media-webkit-text-track-transform: translateY(0) scale(0.98);
      --media-webkit-text-track-transition: transform 0.433s ease-out 0.3s;
    }
    media-controller:is([mediapaused], :not([userinactive])) {
      --media-webkit-text-track-transform: translateY(-50px) scale(0.98);
      --media-webkit-text-track-transition: transform 0.15s ease;
    }

    /*
     * CSS specific to iOS devices.
     * See: https://stackoverflow.com/questions/30102792/css-media-query-to-target-only-ios-devices/60220757#60220757
     */
    @supports (-webkit-touch-callout: none) {
      /* Disable subtitle adjusting for iOS Safari */
      media-controller[mediaisfullscreen] {
        --media-webkit-text-track-transform: unset;
        --media-webkit-text-track-transition: unset;
      }
    }

    media-time-range {
      --media-box-padding-left: 6px;
      --media-box-padding-right: 6px;
      --media-range-bar-color: var(--_accent-color);
      --media-time-range-buffered-color: var(--_primary-color);
      --media-range-track-color: transparent;
      --media-range-track-background: rgba(255, 255, 255, 0.4);
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_accent-color) 25%,
        var(--_accent-color)
      );
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-transform: scale(0);
      --media-range-thumb-transition: transform 0.3s;
      --media-range-thumb-opacity: 1;
      --media-preview-background: var(--_primary-color);
      --media-box-arrow-background: var(--_primary-color);
      --media-preview-thumbnail-border: 5px solid var(--_primary-color);
      --media-preview-border-radius: 5px;
      --media-text-color: var(--_text-color);
      --media-control-hover-background: transparent;
      --media-preview-chapter-text-shadow: none;
      color: var(--_accent-color);
      padding: 0 6px;
    }

    :host([audio]) media-time-range {
      --media-preview-time-padding: 1.5px 6px;
      --media-preview-box-margin: 0 0 -5px;
    }

    media-time-range:hover {
      --media-range-thumb-transform: scale(1);
    }

    media-preview-thumbnail {
      border-bottom-width: 0;
    }

    [part~='menu'] {
      border-radius: 2px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      bottom: 50px;
      padding: 2.5px 10px;
    }

    [part~='menu']::part(indicator) {
      fill: var(--_accent-color);
    }

    [part~='menu']::part(menu-item) {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 6px 10px;
      min-height: 34px;
    }

    [part~='menu']::part(checked) {
      font-weight: 700;
    }

    media-captions-menu,
    media-rendition-menu,
    media-audio-track-menu,
    media-playback-rate-menu {
      position: absolute; /* ensure they don't take up space in DOM on load */
      --media-menu-background: var(--_primary-color);
      --media-menu-item-checked-background: transparent;
      --media-text-color: var(--_text-color);
      --media-menu-item-hover-background: transparent;
      --media-menu-item-hover-outline: var(--_accent-color) solid 1px;
    }

    media-rendition-menu {
      min-width: 140px;
    }

    /* The icon is a circle so make it 16px high instead of 14px for more balance. */
    media-audio-track-menu-button {
      --media-control-padding: 5px;
      --media-control-height: 16px;
    }

    media-playback-rate-menu-button {
      --media-control-padding: 6px 3px;
      min-width: 4.4ch;
    }

    media-playback-rate-menu {
      --media-menu-flex-direction: row;
      --media-menu-item-checked-background: var(--_accent-color);
      --media-menu-item-checked-indicator-display: none;
      margin-right: 6px;
      padding: 0;
      --media-menu-gap: 0.25em;
    }

    media-playback-rate-menu[part~='menu']::part(menu-item) {
      padding: 6px 6px 6px 8px;
    }

    media-playback-rate-menu[part~='menu']::part(checked) {
      color: #fff;
    }

    :host(:not([audio])) media-time-range {
      /* Adding px is required here for calc() */
      --media-range-padding: 0px;
      background: transparent;
      z-index: 10;
      height: 10px;
      bottom: -3px;
      width: 100%;
    }

    media-control-bar :is([role='button'], [role='switch'], button) {
      line-height: 0;
    }

    media-control-bar :is([part*='button'], [part*='range'], [part*='display']) {
      border-radius: 3px;
    }

    .spacer {
      flex-grow: 1;
      background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));
    }

    media-control-bar[slot~='top-chrome'] {
      min-height: 42px;
      pointer-events: none;
    }

    media-control-bar {
      --gradient-steps:
        hsl(0 0% 0% / 0) 0%, hsl(0 0% 0% / 0.013) 8.1%, hsl(0 0% 0% / 0.049) 15.5%, hsl(0 0% 0% / 0.104) 22.5%,
        hsl(0 0% 0% / 0.175) 29%, hsl(0 0% 0% / 0.259) 35.3%, hsl(0 0% 0% / 0.352) 41.2%, hsl(0 0% 0% / 0.45) 47.1%,
        hsl(0 0% 0% / 0.55) 52.9%, hsl(0 0% 0% / 0.648) 58.8%, hsl(0 0% 0% / 0.741) 64.7%, hsl(0 0% 0% / 0.825) 71%,
        hsl(0 0% 0% / 0.896) 77.5%, hsl(0 0% 0% / 0.951) 84.5%, hsl(0 0% 0% / 0.987) 91.9%, hsl(0 0% 0%) 100%;
    }

    :host([title]) media-control-bar[slot='top-chrome']::before,
    :host([videotitle]) media-control-bar[slot='top-chrome']::before {
      content: '';
      position: absolute;
      width: 100%;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to top, var(--gradient-steps));
      opacity: 0.8;
      pointer-events: none;
    }

    :host(:not([audio])) media-control-bar[part~='bottom']::before {
      content: '';
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to bottom, var(--gradient-steps));
      opacity: 0.8;
      z-index: 1;
      pointer-events: none;
    }

    media-control-bar[part~='bottom'] > * {
      z-index: 20;
    }

    media-control-bar[part~='bottom'] {
      padding: 6px 6px;
    }

    media-control-bar[slot~='top-chrome'] > * {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      position: relative;
    }

    media-controller::part(vertical-layer) {
      transition: background-color 1s;
    }

    media-controller:is([mediapaused], :not([userinactive]))::part(vertical-layer) {
      background-color: var(--controls-backdrop-color, var(--controls, transparent));
      transition: background-color 0.25s;
    }

    .center-controls {
      --media-button-icon-width: 100%;
      --media-button-icon-height: auto;
      --media-tooltip-display: none;
      pointer-events: none;
      width: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
      paint-order: stroke;
      stroke: rgba(102, 102, 102, 1);
      stroke-width: 0.3px;
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    .center-controls media-play-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      --media-control-padding: 0;
      width: 40px;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    [breakpointsm] .center-controls media-play-button {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      transition: background 0.4s;
      padding: 24px;
      --media-control-background: #000;
      --media-control-hover-background: var(--_accent-color);
    }

    .center-controls media-seek-backward-button,
    .center-controls media-seek-forward-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      padding: 0;
      margin: 0 20px;
      width: max(33px, min(8%, 40px));
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback {
      display: grid;
      align-items: initial;
      justify-content: initial;
      height: 100%;
      overflow: hidden;
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback media-play-button {
      place-self: var(--_pre-playback-place, center);
      grid-area: 1 / 1;
      margin: 16px;
    }

    /* Show and hide controls or pre-playback state */

    [breakpointsm]:is([mediahasplayed], :not([mediapaused])):not([audio])
      .center-controls.pre-playback
      media-play-button {
      /* Using \`forwards\` would lead to a laggy UI after the animation got in the end state */
      animation: 0.3s linear pre-play-hide;
      opacity: 0;
      pointer-events: none;
    }

    .autoplay-unmute {
      --media-control-hover-background: transparent;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    .autoplay-unmute-btn {
      --media-control-height: 16px;
      border-radius: 8px;
      background: #000;
      color: var(--_primary-color);
      display: flex;
      align-items: center;
      padding: 8px 16px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
    }

    .autoplay-unmute-btn:hover {
      background: var(--_accent-color);
    }

    [breakpointsm] .autoplay-unmute-btn {
      --media-control-height: 30px;
      padding: 14px 24px;
      font-size: 26px;
    }

    .autoplay-unmute-btn svg {
      margin: 0 6px 0 0;
    }

    [breakpointsm] .autoplay-unmute-btn svg {
      margin: 0 10px 0 0;
    }

    media-controller:not([audio]):not([mediahasplayed]) *:is(media-control-bar, media-time-range) {
      display: none;
    }

    media-error-dialog:not([mediaerrorcode]) {
      opacity: 0;
    }

    media-loading-indicator {
      --media-loading-icon-width: 100%;
      --media-button-icon-height: auto;
      display: var(--media-control-display, var(--media-loading-indicator-display, flex));
      pointer-events: none;
      position: absolute;
      width: min(15%, 150px);
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    /* Intentionally don't target the div for transition but the children
     of the div. Prevents messing with media-chrome's autohide feature. */
    media-loading-indicator + div * {
      transition: opacity 0.15s;
      opacity: 1;
    }

    media-loading-indicator[medialoading]:not([mediapaused]) ~ div > * {
      opacity: 0;
      transition-delay: 400ms;
    }

    media-volume-range {
      width: min(100%, 100px);
      --media-range-padding-left: 10px;
      --media-range-padding-right: 10px;
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_primary-color) 25%,
        var(--_primary-color)
      );
      --media-control-hover-background: none;
    }

    media-time-display {
      white-space: nowrap;
    }

    /* Generic style for explicitly disabled controls */
    media-control-bar[part~='bottom'] [disabled],
    media-control-bar[part~='bottom'] [aria-disabled='true'] {
      opacity: 60%;
      cursor: not-allowed;
    }

    media-text-display {
      --media-font-size: 16px;
      --media-control-padding: 14px;
      font-weight: 500;
    }

    media-play-button.animated *:is(g, path) {
      transition: all 0.3s;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt1 {
      opacity: 0;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt2 {
      transform-origin: center center;
      transform: scaleY(0);
    }

    media-play-button.animated[mediapaused] .play-icon {
      clip-path: inset(0 0 0 0);
    }

    media-play-button.animated:not([mediapaused]) .play-icon {
      clip-path: inset(0 0 0 100%);
    }

    media-seek-forward-button,
    media-seek-backward-button {
      --media-font-weight: 400;
    }

    .mute-icon {
      display: inline-block;
    }

    .mute-icon :is(path, g) {
      transition: opacity 0.5s;
    }

    .muted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='low'] :is(.volume-medium, .volume-high),
    media-mute-button[mediavolumelevel='medium'] :is(.volume-high) {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .unmuted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .muted {
      opacity: 1;
    }

    /**
     * Our defaults for these buttons are to hide them at small sizes
     * users can override this with CSS
     */
    media-controller:not([breakpointsm]):not([audio]) {
      --bottom-play-button: none;
      --bottom-seek-backward-button: none;
      --bottom-seek-forward-button: none;
      --bottom-time-display: none;
      --bottom-playback-rate-menu-button: none;
      --bottom-pip-button: none;
    }

    [part='mux-badge'] {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 2;
      opacity: 0.6;
      transition:
        opacity 0.2s ease-in-out,
        bottom 0.2s ease-in-out;
    }

    [part='mux-badge']:hover {
      opacity: 1;
    }

    [part='mux-badge'] a {
      font-size: 14px;
      font-family: var(--_font-family);
      color: var(--_primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    [part='mux-badge'] .mux-badge-text {
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
    }

    [part='mux-badge'] .mux-badge-logo {
      width: 40px;
      height: auto;
      display: inline-block;
    }

    [part='mux-badge'] .mux-badge-logo svg {
      width: 100%;
      height: 100%;
      fill: white;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'],
    media-controller:not([userinactive]) [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      transition: bottom 0.1s ease-in-out;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      transition: bottom 0.2s ease-in-out 0.62s;
    }

    media-controller:not([userinactive]) [part='mux-badge'] .mux-badge-text,
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] .mux-badge-text {
      opacity: 1;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] .mux-badge-text {
      opacity: 0;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive])[mediahasplayed] [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      bottom: calc(28px + var(--media-control-height, 0px) + var(--media-control-padding, 0px) * 2);
    }
  </style>

  <template partial="TitleDisplay">
    <template if="videotitle">
      <template if="videotitle != true">
        <media-text-display part="top title display" class="title-display">{{videotitle}}</media-text-display>
      </template>
    </template>
    <template if="!videotitle">
      <template if="title">
        <media-text-display part="top title display" class="title-display">{{title}}</media-text-display>
      </template>
    </template>
  </template>

  <template partial="PlayButton">
    <media-play-button
      part="{{section ?? 'bottom'}} play button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      class="animated"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon">
        <g class="play-icon">
          <path
            d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
          />
        </g>
        <g class="pause-icon">
          <path
            class="pause-icon-pt1"
            d="M5.90709 0H2.96889C2.46857 0 2.06299 0.405585 2.06299 0.9059V13.0941C2.06299 13.5944 2.46857 14 2.96889 14H5.90709C6.4074 14 6.81299 13.5944 6.81299 13.0941V0.9059C6.81299 0.405585 6.4074 0 5.90709 0Z"
          />
          <path
            class="pause-icon-pt2"
            d="M15.1571 0H12.2189C11.7186 0 11.313 0.405585 11.313 0.9059V13.0941C11.313 13.5944 11.7186 14 12.2189 14H15.1571C15.6574 14 16.063 13.5944 16.063 13.0941V0.9059C16.063 0.405585 15.6574 0 15.1571 0Z"
          />
        </g>
      </svg>
    </media-play-button>
  </template>

  <template partial="PrePlayButton">
    <media-play-button
      part="{{section ?? 'center'}} play button pre-play"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon" style="transform: translate(3px, 0)">
        <path
          d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
        />
      </svg>
    </media-play-button>
  </template>

  <template partial="SeekBackwardButton">
    <media-seek-backward-button
      seekoffset="{{backwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-backward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <path
          d="M3.65 2.07888L0.0864 6.7279C-0.0288 6.87812 -0.0288 7.12188 0.0864 7.2721L3.65 11.9211C3.7792 12.0896 4 11.9703 4 11.7321V2.26787C4 2.02968 3.7792 1.9104 3.65 2.07888Z"
        />
        <text transform="translate(6 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
          {{backwardseekoffset}}
        </text>
      </svg>
    </media-seek-backward-button>
  </template>

  <template partial="SeekForwardButton">
    <media-seek-forward-button
      seekoffset="{{forwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-forward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <g>
          <text transform="translate(-1 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
            {{forwardseekoffset}}
          </text>
          <path
            d="M18.35 11.9211L21.9136 7.2721C22.0288 7.12188 22.0288 6.87812 21.9136 6.7279L18.35 2.07888C18.2208 1.91041 18 2.02968 18 2.26787V11.7321C18 11.9703 18.2208 12.0896 18.35 11.9211Z"
          />
        </g>
      </svg>
    </media-seek-forward-button>
  </template>

  <template partial="MuteButton">
    <media-mute-button part="bottom mute button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" slot="icon" class="mute-icon" aria-hidden="true">
        <g class="unmuted">
          <path
            d="M6.76786 1.21233L3.98606 3.98924H1.19937C0.593146 3.98924 0.101743 4.51375 0.101743 5.1607V6.96412L0 6.99998L0.101743 7.03583V8.83926C0.101743 9.48633 0.593146 10.0108 1.19937 10.0108H3.98606L6.76773 12.7877C7.23561 13.2547 8 12.9007 8 12.2171V1.78301C8 1.09925 7.23574 0.745258 6.76786 1.21233Z"
          />
          <path
            class="volume-low"
            d="M10 3.54781C10.7452 4.55141 11.1393 5.74511 11.1393 6.99991C11.1393 8.25471 10.7453 9.44791 10 10.4515L10.7988 11.0496C11.6734 9.87201 12.1356 8.47161 12.1356 6.99991C12.1356 5.52821 11.6735 4.12731 10.7988 2.94971L10 3.54781Z"
          />
          <path
            class="volume-medium"
            d="M12.3778 2.40086C13.2709 3.76756 13.7428 5.35806 13.7428 7.00026C13.7428 8.64246 13.2709 10.233 12.3778 11.5992L13.2106 12.1484C14.2107 10.6185 14.739 8.83796 14.739 7.00016C14.739 5.16236 14.2107 3.38236 13.2106 1.85156L12.3778 2.40086Z"
          />
          <path
            class="volume-high"
            d="M15.5981 0.75L14.7478 1.2719C15.7937 2.9919 16.3468 4.9723 16.3468 7C16.3468 9.0277 15.7937 11.0082 14.7478 12.7281L15.5981 13.25C16.7398 11.3722 17.343 9.211 17.343 7C17.343 4.789 16.7398 2.6268 15.5981 0.75Z"
          />
        </g>
        <g class="muted">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.39976 4.98924H1.19937C1.19429 4.98924 1.17777 4.98961 1.15296 5.01609C1.1271 5.04369 1.10174 5.09245 1.10174 5.1607V8.83926C1.10174 8.90761 1.12714 8.95641 1.15299 8.984C1.17779 9.01047 1.1943 9.01084 1.19937 9.01084H4.39977L7 11.6066V2.39357L4.39976 4.98924ZM7.47434 1.92006C7.4743 1.9201 7.47439 1.92002 7.47434 1.92006V1.92006ZM6.76773 12.7877L3.98606 10.0108H1.19937C0.593146 10.0108 0.101743 9.48633 0.101743 8.83926V7.03583L0 6.99998L0.101743 6.96412V5.1607C0.101743 4.51375 0.593146 3.98924 1.19937 3.98924H3.98606L6.76786 1.21233C7.23574 0.745258 8 1.09925 8 1.78301V12.2171C8 12.9007 7.23561 13.2547 6.76773 12.7877Z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15.2677 9.30323C15.463 9.49849 15.7796 9.49849 15.9749 9.30323C16.1701 9.10796 16.1701 8.79138 15.9749 8.59612L14.2071 6.82841L15.9749 5.06066C16.1702 4.8654 16.1702 4.54882 15.9749 4.35355C15.7796 4.15829 15.4631 4.15829 15.2678 4.35355L13.5 6.1213L11.7322 4.35348C11.537 4.15822 11.2204 4.15822 11.0251 4.35348C10.8298 4.54874 10.8298 4.86532 11.0251 5.06058L12.7929 6.82841L11.0251 8.59619C10.8299 8.79146 10.8299 9.10804 11.0251 9.3033C11.2204 9.49856 11.537 9.49856 11.7323 9.3033L13.5 7.53552L15.2677 9.30323Z"
          />
        </g>
      </svg>
    </media-mute-button>
  </template>

  <template partial="PipButton">
    <media-pip-button part="bottom pip button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M15.9891 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.989C0 13.0996 0.9004 14 2.011 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0ZM17 11.9891C17 12.5465 16.5465 13 15.9891 13H2.011C1.4536 13 1.0001 12.5465 1.0001 11.9891V2.0109C1.0001 1.4535 1.4536 0.9999 2.011 0.9999H15.9891C16.5465 0.9999 17 1.4535 17 2.0109V11.9891Z"
        />
        <path
          d="M15.356 5.67822H8.19523C8.03253 5.67822 7.90063 5.81012 7.90063 5.97282V11.3836C7.90063 11.5463 8.03253 11.6782 8.19523 11.6782H15.356C15.5187 11.6782 15.6506 11.5463 15.6506 11.3836V5.97282C15.6506 5.81012 15.5187 5.67822 15.356 5.67822Z"
        />
      </svg>
    </media-pip-button>
  </template>

  <template partial="CaptionsMenu">
    <media-captions-menu-button part="bottom captions button">
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="on">
        <path
          d="M15.989 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9004 14 2.011 14H15.989C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.989 0ZM4.2292 8.7639C4.5954 9.1902 5.0935 9.4031 5.7233 9.4031C6.1852 9.4031 6.5544 9.301 6.8302 9.0969C7.1061 8.8933 7.2863 8.614 7.3702 8.26H8.4322C8.3062 8.884 8.0093 9.3733 7.5411 9.7273C7.0733 10.0813 6.4703 10.2581 5.732 10.2581C5.108 10.2581 4.5699 10.1219 4.1168 9.8489C3.6637 9.5759 3.3141 9.1946 3.0685 8.7058C2.8224 8.2165 2.6994 7.6511 2.6994 7.009C2.6994 6.3611 2.8224 5.7927 3.0685 5.3034C3.3141 4.8146 3.6637 4.4323 4.1168 4.1559C4.5699 3.88 5.108 3.7418 5.732 3.7418C6.4703 3.7418 7.0733 3.922 7.5411 4.2818C8.0094 4.6422 8.3062 5.1461 8.4322 5.794H7.3702C7.2862 5.4283 7.106 5.1368 6.8302 4.921C6.5544 4.7052 6.1852 4.5968 5.7233 4.5968C5.0934 4.5968 4.5954 4.8116 4.2292 5.2404C3.8635 5.6696 3.6804 6.259 3.6804 7.009C3.6804 7.7531 3.8635 8.3381 4.2292 8.7639ZM11.0974 8.7639C11.4636 9.1902 11.9617 9.4031 12.5915 9.4031C13.0534 9.4031 13.4226 9.301 13.6984 9.0969C13.9743 8.8933 14.1545 8.614 14.2384 8.26H15.3004C15.1744 8.884 14.8775 9.3733 14.4093 9.7273C13.9415 10.0813 13.3385 10.2581 12.6002 10.2581C11.9762 10.2581 11.4381 10.1219 10.985 9.8489C10.5319 9.5759 10.1823 9.1946 9.9367 8.7058C9.6906 8.2165 9.5676 7.6511 9.5676 7.009C9.5676 6.3611 9.6906 5.7927 9.9367 5.3034C10.1823 4.8146 10.5319 4.4323 10.985 4.1559C11.4381 3.88 11.9762 3.7418 12.6002 3.7418C13.3385 3.7418 13.9415 3.922 14.4093 4.2818C14.8776 4.6422 15.1744 5.1461 15.3004 5.794H14.2384C14.1544 5.4283 13.9742 5.1368 13.6984 4.921C13.4226 4.7052 13.0534 4.5968 12.5915 4.5968C11.9616 4.5968 11.4636 4.8116 11.0974 5.2404C10.7317 5.6696 10.5486 6.259 10.5486 7.009C10.5486 7.7531 10.7317 8.3381 11.0974 8.7639Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="off">
        <path
          d="M5.73219 10.258C5.10819 10.258 4.57009 10.1218 4.11699 9.8488C3.66389 9.5758 3.31429 9.1945 3.06869 8.7057C2.82259 8.2164 2.69958 7.651 2.69958 7.0089C2.69958 6.361 2.82259 5.7926 3.06869 5.3033C3.31429 4.8145 3.66389 4.4322 4.11699 4.1558C4.57009 3.8799 5.10819 3.7417 5.73219 3.7417C6.47049 3.7417 7.07348 3.9219 7.54128 4.2817C8.00958 4.6421 8.30638 5.146 8.43238 5.7939H7.37039C7.28639 5.4282 7.10618 5.1367 6.83039 4.9209C6.55459 4.7051 6.18538 4.5967 5.72348 4.5967C5.09358 4.5967 4.59559 4.8115 4.22939 5.2403C3.86369 5.6695 3.68058 6.2589 3.68058 7.0089C3.68058 7.753 3.86369 8.338 4.22939 8.7638C4.59559 9.1901 5.09368 9.403 5.72348 9.403C6.18538 9.403 6.55459 9.3009 6.83039 9.0968C7.10629 8.8932 7.28649 8.6139 7.37039 8.2599H8.43238C8.30638 8.8839 8.00948 9.3732 7.54128 9.7272C7.07348 10.0812 6.47049 10.258 5.73219 10.258Z"
        />
        <path
          d="M12.6003 10.258C11.9763 10.258 11.4382 10.1218 10.9851 9.8488C10.532 9.5758 10.1824 9.1945 9.93685 8.7057C9.69075 8.2164 9.56775 7.651 9.56775 7.0089C9.56775 6.361 9.69075 5.7926 9.93685 5.3033C10.1824 4.8145 10.532 4.4322 10.9851 4.1558C11.4382 3.8799 11.9763 3.7417 12.6003 3.7417C13.3386 3.7417 13.9416 3.9219 14.4094 4.2817C14.8777 4.6421 15.1745 5.146 15.3005 5.7939H14.2385C14.1545 5.4282 13.9743 5.1367 13.6985 4.9209C13.4227 4.7051 13.0535 4.5967 12.5916 4.5967C11.9617 4.5967 11.4637 4.8115 11.0975 5.2403C10.7318 5.6695 10.5487 6.2589 10.5487 7.0089C10.5487 7.753 10.7318 8.338 11.0975 8.7638C11.4637 9.1901 11.9618 9.403 12.5916 9.403C13.0535 9.403 13.4227 9.3009 13.6985 9.0968C13.9744 8.8932 14.1546 8.6139 14.2385 8.2599H15.3005C15.1745 8.8839 14.8776 9.3732 14.4094 9.7272C13.9416 10.0812 13.3386 10.258 12.6003 10.258Z"
        />
        <path
          d="M15.9891 1C16.5465 1 17 1.4535 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H2.0109C1.4535 13 1 12.5465 1 11.9891V2.0109C1 1.4535 1.4535 0.9999 2.0109 0.9999L15.9891 1ZM15.9891 0H2.0109C0.9003 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9003 14 2.0109 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0Z"
        />
      </svg>
    </media-captions-menu-button>
    <media-captions-menu
      hidden
      anchor="auto"
      part="bottom captions menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg></div
    ></media-captions-menu>
  </template>

  <template partial="AirplayButton">
    <media-airplay-button part="bottom airplay button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M16.1383 0H1.8618C0.8335 0 0 0.8335 0 1.8617V10.1382C0 11.1664 0.8335 12 1.8618 12H3.076C3.1204 11.9433 3.1503 11.8785 3.2012 11.826L4.004 11H1.8618C1.3866 11 1 10.6134 1 10.1382V1.8617C1 1.3865 1.3866 0.9999 1.8618 0.9999H16.1383C16.6135 0.9999 17.0001 1.3865 17.0001 1.8617V10.1382C17.0001 10.6134 16.6135 11 16.1383 11H13.9961L14.7989 11.826C14.8499 11.8785 14.8798 11.9432 14.9241 12H16.1383C17.1665 12 18.0001 11.1664 18.0001 10.1382V1.8617C18 0.8335 17.1665 0 16.1383 0Z"
        />
        <path
          d="M9.55061 8.21903C9.39981 8.06383 9.20001 7.98633 9.00011 7.98633C8.80021 7.98633 8.60031 8.06383 8.44951 8.21903L4.09771 12.697C3.62471 13.1838 3.96961 13.9998 4.64831 13.9998H13.3518C14.0304 13.9998 14.3754 13.1838 13.9023 12.697L9.55061 8.21903Z"
        />
      </svg>
    </media-airplay-button>
  </template>

  <template partial="FullscreenButton">
    <media-fullscreen-button part="bottom fullscreen button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M1.00745 4.39539L1.01445 1.98789C1.01605 1.43049 1.47085 0.978289 2.02835 0.979989L6.39375 0.992589L6.39665 -0.007411L2.03125 -0.020011C0.920646 -0.023211 0.0176463 0.874489 0.0144463 1.98509L0.00744629 4.39539H1.00745Z"
        />
        <path
          d="M17.0144 2.03431L17.0076 4.39541H18.0076L18.0144 2.03721C18.0176 0.926712 17.1199 0.0237125 16.0093 0.0205125L11.6439 0.0078125L11.641 1.00781L16.0064 1.02041C16.5638 1.02201 17.016 1.47681 17.0144 2.03431Z"
        />
        <path
          d="M16.9925 9.60498L16.9855 12.0124C16.9839 12.5698 16.5291 13.022 15.9717 13.0204L11.6063 13.0078L11.6034 14.0078L15.9688 14.0204C17.0794 14.0236 17.9823 13.1259 17.9855 12.0153L17.9925 9.60498H16.9925Z"
        />
        <path
          d="M0.985626 11.9661L0.992426 9.60498H-0.0074737L-0.0142737 11.9632C-0.0174737 13.0738 0.880226 13.9767 1.99083 13.98L6.35623 13.9926L6.35913 12.9926L1.99373 12.98C1.43633 12.9784 0.983926 12.5236 0.985626 11.9661Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M5.39655 -0.0200195L5.38955 2.38748C5.38795 2.94488 4.93315 3.39708 4.37565 3.39538L0.0103463 3.38278L0.00744629 4.38278L4.37285 4.39538C5.48345 4.39858 6.38635 3.50088 6.38965 2.39028L6.39665 -0.0200195H5.39655Z"
        />
        <path
          d="M12.6411 2.36891L12.6479 0.0078125H11.6479L11.6411 2.36601C11.6379 3.47651 12.5356 4.37951 13.6462 4.38271L18.0116 4.39531L18.0145 3.39531L13.6491 3.38271C13.0917 3.38111 12.6395 2.92641 12.6411 2.36891Z"
        />
        <path
          d="M12.6034 14.0204L12.6104 11.613C12.612 11.0556 13.0668 10.6034 13.6242 10.605L17.9896 10.6176L17.9925 9.61759L13.6271 9.60499C12.5165 9.60179 11.6136 10.4995 11.6104 11.6101L11.6034 14.0204H12.6034Z"
        />
        <path
          d="M5.359 11.6315L5.3522 13.9926H6.3522L6.359 11.6344C6.3622 10.5238 5.4645 9.62088 4.3539 9.61758L-0.0115043 9.60498L-0.0144043 10.605L4.351 10.6176C4.9084 10.6192 5.3607 11.074 5.359 11.6315Z"
        />
      </svg>
    </media-fullscreen-button>
  </template>

  <template partial="CastButton">
    <media-cast-button part="bottom cast button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M16.0072 0H2.0291C0.9185 0 0.0181 0.9003 0.0181 2.011V5.5009C0.357 5.5016 0.6895 5.5275 1.0181 5.5669V2.011C1.0181 1.4536 1.4716 1 2.029 1H16.0072C16.5646 1 17.0181 1.4536 17.0181 2.011V11.9891C17.0181 12.5465 16.5646 13 16.0072 13H8.4358C8.4746 13.3286 8.4999 13.6611 8.4999 13.9999H16.0071C17.1177 13.9999 18.018 13.0996 18.018 11.989V2.011C18.0181 0.9003 17.1178 0 16.0072 0ZM0 6.4999V7.4999C3.584 7.4999 6.5 10.4159 6.5 13.9999H7.5C7.5 9.8642 4.1357 6.4999 0 6.4999ZM0 8.7499V9.7499C2.3433 9.7499 4.25 11.6566 4.25 13.9999H5.25C5.25 11.1049 2.895 8.7499 0 8.7499ZM0.0181 11V14H3.0181C3.0181 12.3431 1.675 11 0.0181 11Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M15.9891 0H2.01103C0.900434 0 3.35947e-05 0.9003 3.35947e-05 2.011V5.5009C0.338934 5.5016 0.671434 5.5275 1.00003 5.5669V2.011C1.00003 1.4536 1.45353 1 2.01093 1H15.9891C16.5465 1 17 1.4536 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H8.41773C8.45653 13.3286 8.48183 13.6611 8.48183 13.9999H15.989C17.0996 13.9999 17.9999 13.0996 17.9999 11.989V2.011C18 0.9003 17.0997 0 15.9891 0ZM-0.0180664 6.4999V7.4999C3.56593 7.4999 6.48193 10.4159 6.48193 13.9999H7.48193C7.48193 9.8642 4.11763 6.4999 -0.0180664 6.4999ZM-0.0180664 8.7499V9.7499C2.32523 9.7499 4.23193 11.6566 4.23193 13.9999H5.23193C5.23193 11.1049 2.87693 8.7499 -0.0180664 8.7499ZM3.35947e-05 11V14H3.00003C3.00003 12.3431 1.65693 11 3.35947e-05 11Z"
        />
        <path d="M2.15002 5.634C5.18352 6.4207 7.57252 8.8151 8.35282 11.8499H15.8501V2.1499H2.15002V5.634Z" />
      </svg>
    </media-cast-button>
  </template>

  <template partial="LiveButton">
    <media-live-button part="{{section ?? 'top'}} live button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <span slot="text">Live</span>
    </media-live-button>
  </template>

  <template partial="PlaybackRateMenu">
    <media-playback-rate-menu-button part="bottom playback-rate button"></media-playback-rate-menu-button>
    <media-playback-rate-menu
      hidden
      anchor="auto"
      rates="{{playbackrates}}"
      exportparts="menu-item"
      part="bottom playback-rate menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-playback-rate-menu>
  </template>

  <template partial="VolumeRange">
    <media-volume-range
      part="bottom volume range"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-volume-range>
  </template>

  <template partial="TimeDisplay">
    <media-time-display
      remaining="{{defaultshowremainingtime}}"
      showduration="{{!hideduration}}"
      part="bottom time display"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-time-display>
  </template>

  <template partial="TimeRange">
    <media-time-range part="bottom time range" disabled="{{disabled}}" aria-disabled="{{disabled}}" exportparts="thumb">
      <media-preview-thumbnail slot="preview"></media-preview-thumbnail>
      <media-preview-chapter-display slot="preview"></media-preview-chapter-display>
      <media-preview-time-display slot="preview"></media-preview-time-display>
      <div slot="preview" part="arrow"></div>
    </media-time-range>
  </template>

  <template partial="AudioTrackMenu">
    <media-audio-track-menu-button part="bottom audio-track button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 16">
        <path d="M9 15A7 7 0 1 1 9 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 9 0a8 8 0 0 0 0 16Z" />
        <path
          d="M5.2 6.3a.5.5 0 0 1 .5.5v2.4a.5.5 0 1 1-1 0V6.8a.5.5 0 0 1 .5-.5Zm2.4-2.4a.5.5 0 0 1 .5.5v7.2a.5.5 0 0 1-1 0V4.4a.5.5 0 0 1 .5-.5ZM10 5.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.4-.8a.5.5 0 0 1 .5.5v5.6a.5.5 0 0 1-1 0V5.2a.5.5 0 0 1 .5-.5Z"
        />
      </svg>
    </media-audio-track-menu-button>
    <media-audio-track-menu
      hidden
      anchor="auto"
      part="bottom audio-track menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-audio-track-menu>
  </template>

  <template partial="RenditionMenu">
    <media-rendition-menu-button part="bottom rendition button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 14">
        <path
          d="M2.25 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6.75 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        />
      </svg>
    </media-rendition-menu-button>
    <media-rendition-menu
      hidden
      anchor="auto"
      part="bottom rendition menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            opacity: 0;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-rendition-menu>
  </template>

  <template partial="MuxBadge">
    <div part="mux-badge">
      <a href="https://www.mux.com/player" target="_blank">
        <span class="mux-badge-text">Powered by</span>
        <div class="mux-badge-logo">
          <svg
            viewBox="0 0 1600 500"
            style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2"
          >
            <g>
              <path
                d="M994.287,93.486c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m0,-93.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,68.943 -56.09,125.033 -125.032,125.033c-68.942,-0 -125.03,-56.09 -125.03,-125.033l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,137.853 112.149,250.003 249.999,250.003c137.851,-0 250.001,-112.15 250.001,-250.003l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M1537.51,468.511c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m-275.883,-218.509l-143.33,143.329c-24.402,24.402 -24.402,63.966 0,88.368c24.402,24.402 63.967,24.402 88.369,-0l143.33,-143.329l143.328,143.329c24.402,24.4 63.967,24.402 88.369,-0c24.403,-24.402 24.403,-63.966 0.001,-88.368l-143.33,-143.329l0.001,-0.004l143.329,-143.329c24.402,-24.402 24.402,-63.965 0,-88.367c-24.402,-24.402 -63.967,-24.402 -88.369,-0l-143.329,143.328l-143.329,-143.328c-24.402,-24.401 -63.967,-24.402 -88.369,-0c-24.402,24.402 -24.402,63.965 0,88.367l143.329,143.329l0,0.004Z"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M437.511,468.521c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m23.915,-463.762c-23.348,-9.672 -50.226,-4.327 -68.096,13.544l-143.331,143.329l-143.33,-143.329c-17.871,-17.871 -44.747,-23.216 -68.096,-13.544c-23.349,9.671 -38.574,32.455 -38.574,57.729l0,375.026c0,34.51 27.977,62.486 62.487,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-224.173l80.843,80.844c24.404,24.402 63.965,24.402 88.369,-0l80.843,-80.844l0,224.173c0,34.51 27.976,62.486 62.486,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-375.026c0,-25.274 -15.224,-48.058 -38.573,-57.729"
                style="fill-rule: nonzero"
              ></path>
            </g>
          </svg>
        </div>
      </a>
    </div>
  </template>

  <media-controller
    part="controller"
    defaultstreamtype="{{defaultstreamtype ?? 'on-demand'}}"
    breakpoints="sm:470"
    gesturesdisabled="{{disabled}}"
    hotkeys="{{hotkeys}}"
    nohotkeys="{{nohotkeys}}"
    novolumepref="{{novolumepref}}"
    audio="{{audio}}"
    noautoseektolive="{{noautoseektolive}}"
    defaultsubtitles="{{defaultsubtitles}}"
    defaultduration="{{defaultduration ?? false}}"
    keyboardforwardseekoffset="{{forwardseekoffset}}"
    keyboardbackwardseekoffset="{{backwardseekoffset}}"
    exportparts="layer, media-layer, poster-layer, vertical-layer, centered-layer, gesture-layer"
    style="--_pre-playback-place:{{preplaybackplace ?? 'center'}}"
  >
    <slot name="media" slot="media"></slot>
    <slot name="poster" slot="poster"></slot>

    <media-loading-indicator slot="centered-chrome" noautohide></media-loading-indicator>

    <template if="!audio">
      <media-error-dialog slot="dialog" noautohide></media-error-dialog>
      <!-- Pre-playback UI -->
      <!-- same for both on-demand and live -->
      <div slot="centered-chrome" class="center-controls pre-playback">
        <template if="!breakpointsm">{{>PlayButton section="center"}}</template>
        <template if="breakpointsm">{{>PrePlayButton section="center"}}</template>
      </div>

      <!-- Mux Badge -->
      <template if="proudlydisplaymuxbadge"> {{>MuxBadge}} </template>

      <!-- Autoplay centered unmute button -->
      <!--
        todo: figure out how show this with available state variables
        needs to show when:
        - autoplay is enabled
        - playback has been successful
        - audio is muted
        - in place / instead of the pre-plaback play button
        - not to show again after user has interacted with this button
          - OR user has interacted with the mute button in the control bar
      -->
      <!--
        There should be a >MuteButton to the left of the "Unmute" text, but a templating bug
        makes it appear even if commented out in the markup, add it back when code is un-commented
      -->
      <!-- <div slot="centered-chrome" class="autoplay-unmute">
        <div role="button" class="autoplay-unmute-btn">Unmute</div>
      </div> -->

      <template if="streamtype == 'on-demand'">
        <template if="breakpointsm">
          <media-control-bar part="control-bar top" slot="top-chrome">{{>TitleDisplay}} </media-control-bar>
        </template>
        {{>TimeRange}}
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>SeekBackwardButton}} {{>SeekForwardButton}} {{>TimeDisplay}} {{>MuteButton}}
          {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>PlaybackRateMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}}
          {{>CastButton}} {{>PipButton}} {{>FullscreenButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <media-control-bar part="control-bar top" slot="top-chrome">
          {{>LiveButton}}
          <template if="breakpointsm"> {{>TitleDisplay}} </template>
        </media-control-bar>
        <template if="targetlivewindow > 0">{{>TimeRange}}</template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="targetlivewindow > 0">{{>SeekBackwardButton}} {{>SeekForwardButton}}</template>
          {{>MuteButton}} {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}} {{>CastButton}} {{>PipButton}}
          {{>FullscreenButton}}
        </media-control-bar>
      </template>
    </template>

    <template if="audio">
      <template if="streamtype == 'on-demand'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="breakpointsm"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          {{>MuteButton}}
          <template if="breakpointsm">{{>VolumeRange}}</template>
          {{>TimeDisplay}} {{>TimeRange}}
          <template if="breakpointsm">{{>PlaybackRateMenu}}</template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>LiveButton section="bottom"}} {{>MuteButton}}
          <template if="breakpointsm">
            {{>VolumeRange}}
            <template if="targetlivewindow > 0"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          </template>
          <template if="targetlivewindow > 0"> {{>TimeDisplay}} {{>TimeRange}} </template>
          <template if="!targetlivewindow"><div class="spacer"></div></template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>
    </template>

    <slot></slot>
  </media-controller>
</template>
`, Er = Na.createElement("template");
"innerHTML" in Er && (Er.innerHTML = Sc);
var Ri, Ci, us = class extends Ka {};
us.template = (Ci = (Ri = Er.content) == null ? void 0 : Ri.children) == null ? void 0 : Ci[0];
Re.customElements.get("media-theme-gerwig") || Re.customElements.define("media-theme-gerwig", us);
var Oc = "gerwig", Ne = {
	SRC: "src",
	POSTER: "poster"
}, E = {
	STYLE: "style",
	DEFAULT_HIDDEN_CAPTIONS: "default-hidden-captions",
	PRIMARY_COLOR: "primary-color",
	SECONDARY_COLOR: "secondary-color",
	ACCENT_COLOR: "accent-color",
	FORWARD_SEEK_OFFSET: "forward-seek-offset",
	BACKWARD_SEEK_OFFSET: "backward-seek-offset",
	PLAYBACK_TOKEN: "playback-token",
	THUMBNAIL_TOKEN: "thumbnail-token",
	STORYBOARD_TOKEN: "storyboard-token",
	FULLSCREEN_ELEMENT: "fullscreen-element",
	DRM_TOKEN: "drm-token",
	STORYBOARD_SRC: "storyboard-src",
	THUMBNAIL_TIME: "thumbnail-time",
	AUDIO: "audio",
	NOHOTKEYS: "nohotkeys",
	HOTKEYS: "hotkeys",
	PLAYBACK_RATES: "playbackrates",
	DEFAULT_SHOW_REMAINING_TIME: "default-show-remaining-time",
	DEFAULT_DURATION: "default-duration",
	TITLE: "title",
	VIDEO_TITLE: "video-title",
	PLACEHOLDER: "placeholder",
	THEME: "theme",
	DEFAULT_STREAM_TYPE: "default-stream-type",
	TARGET_LIVE_WINDOW: "target-live-window",
	EXTRA_SOURCE_PARAMS: "extra-source-params",
	NO_VOLUME_PREF: "no-volume-pref",
	NO_MUTED_PREF: "no-muted-pref",
	CAST_RECEIVER: "cast-receiver",
	NO_TOOLTIPS: "no-tooltips",
	PROUDLY_DISPLAY_MUX_BADGE: "proudly-display-mux-badge",
	DISABLE_PSEUDO_ENDED: "disable-pseudo-ended"
}, Tr = [
	"audio",
	"backwardseekoffset",
	"defaultduration",
	"defaultshowremainingtime",
	"defaultsubtitles",
	"noautoseektolive",
	"disabled",
	"exportparts",
	"forwardseekoffset",
	"hideduration",
	"hotkeys",
	"nohotkeys",
	"playbackrates",
	"defaultstreamtype",
	"streamtype",
	"style",
	"targetlivewindow",
	"template",
	"title",
	"videotitle",
	"novolumepref",
	"nomutedpref",
	"proudlydisplaymuxbadge"
];
function Nc(e, t) {
	var a, r, i;
	return {
		src: !e.playbackId && e.src,
		playbackId: e.playbackId,
		hasSrc: !!e.playbackId || !!e.src || !!e.currentSrc,
		poster: e.poster,
		storyboard: ((a = e.media) == null ? void 0 : a.currentSrc) && e.storyboard,
		storyboardSrc: e.getAttribute(E.STORYBOARD_SRC),
		fullscreenElement: e.getAttribute(E.FULLSCREEN_ELEMENT),
		placeholder: e.getAttribute("placeholder"),
		themeTemplate: Ic(e),
		thumbnailTime: !e.tokens.thumbnail && e.thumbnailTime,
		autoplay: e.autoplay,
		crossOrigin: e.crossOrigin,
		loop: e.loop,
		noHotKeys: e.hasAttribute(E.NOHOTKEYS),
		hotKeys: e.getAttribute(E.HOTKEYS),
		muted: e.muted,
		paused: e.paused,
		preload: e.preload,
		envKey: e.envKey,
		preferCmcd: e.preferCmcd,
		debug: e.debug,
		disableTracking: e.disableTracking,
		disableCookies: e.disableCookies,
		tokens: e.tokens,
		beaconCollectionDomain: e.beaconCollectionDomain,
		maxResolution: e.maxResolution,
		minResolution: e.minResolution,
		maxAutoResolution: e.maxAutoResolution,
		programStartTime: e.programStartTime,
		programEndTime: e.programEndTime,
		assetStartTime: e.assetStartTime,
		assetEndTime: e.assetEndTime,
		renditionOrder: e.renditionOrder,
		metadata: e.metadata,
		playerInitTime: e.playerInitTime,
		playerSoftwareName: e.playerSoftwareName,
		playerSoftwareVersion: e.playerSoftwareVersion,
		startTime: e.startTime,
		preferPlayback: e.preferPlayback,
		audio: e.audio,
		defaultStreamType: e.defaultStreamType,
		targetLiveWindow: e.getAttribute(v.TARGET_LIVE_WINDOW),
		streamType: Yr(e.getAttribute(v.STREAM_TYPE)),
		primaryColor: e.getAttribute(E.PRIMARY_COLOR),
		secondaryColor: e.getAttribute(E.SECONDARY_COLOR),
		accentColor: e.getAttribute(E.ACCENT_COLOR),
		forwardSeekOffset: e.forwardSeekOffset,
		backwardSeekOffset: e.backwardSeekOffset,
		defaultHiddenCaptions: e.defaultHiddenCaptions,
		defaultDuration: e.defaultDuration,
		defaultShowRemainingTime: e.defaultShowRemainingTime,
		hideDuration: Lc(e),
		playbackRates: e.getAttribute(E.PLAYBACK_RATES),
		customDomain: (r = e.getAttribute(v.CUSTOM_DOMAIN)) != null ? r : void 0,
		title: e.getAttribute(E.TITLE),
		videoTitle: (i = e.getAttribute(E.VIDEO_TITLE)) != null ? i : e.getAttribute(E.TITLE),
		novolumepref: e.hasAttribute(E.NO_VOLUME_PREF),
		nomutedpref: e.hasAttribute(E.NO_MUTED_PREF),
		proudlyDisplayMuxBadge: e.hasAttribute(E.PROUDLY_DISPLAY_MUX_BADGE),
		castReceiver: e.castReceiver,
		disablePseudoEnded: e.hasAttribute(E.DISABLE_PSEUDO_ENDED),
		capRenditionToPlayerSize: e.capRenditionToPlayerSize,
		...t,
		extraSourceParams: e.extraSourceParams
	};
}
var xc = qlt.formatErrorMessage;
qlt.formatErrorMessage = (e) => {
	var t, a;
	if (e instanceof A) {
		let r = Cc(e, !1);
		return `
      ${r != null && r.title ? `<h3>${r.title}</h3>` : ""}
      ${r != null && r.message || r != null && r.linkUrl ? `<p>
        ${r?.message}
        ${r != null && r.linkUrl ? `<a
              href="${r.linkUrl}"
              target="_blank"
              rel="external noopener"
              aria-label="${(t = r.linkText) != null ? t : ""} ${R("(opens in a new window)")}"
              >${(a = r.linkText) != null ? a : r.linkUrl}</a
            >` : ""}
      </p>` : ""}
    `;
	}
	return xc(e);
};
function Ic(e) {
	var t, a;
	let r = e.theme;
	if (r) {
		let i = (a = (t = e.getRootNode()) == null ? void 0 : t.getElementById) == null ? void 0 : a.call(t, r);
		if (i && i instanceof HTMLTemplateElement) return i;
		r.startsWith("media-theme-") || (r = `media-theme-${r}`);
		let n = Re.customElements.get(r);
		if (n != null && n.template) return n.template;
	}
}
function Lc(e) {
	var t;
	let a = (t = e.mediaController) == null ? void 0 : t.querySelector("media-time-display");
	return a && getComputedStyle(a).getPropertyValue("--media-duration-display-display").trim() === "none";
}
function Di(e) {
	let t = e.videoTitle ? { video_title: e.videoTitle } : {};
	return e.getAttributeNames().filter((a) => a.startsWith("metadata-")).reduce((a, r) => {
		let i = e.getAttribute(r);
		return i !== null && (a[r.replace(/^metadata-/, "").replace(/-/g, "_")] = i), a;
	}, t);
}
var Pc = Object.values(v), Mc = Object.values(Ne), Uc = Object.values(E), Si = rs(), Oi = "mux-player", Ni = { isDialogOpen: !1 }, $c = { redundant_streams: !0 }, ga, Ht, Ea, it, Ta, Ft, xa, Ia, Et, Yt, Tt, La, H, xe, ds, kr, ut, xi, Ii, Li, Pi, Bc = class extends ki {
	constructor() {
		super(), J(this, H), J(this, ga), J(this, Ht, !1), J(this, Ea, {}), J(this, it, !0), J(this, Ta, new ac(this, "hotkeys")), J(this, Ft), J(this, xa, () => F(this, H, ut).call(this)), J(this, Ia, () => F(this, H, ut).call(this)), J(this, Et, () => F(this, H, ut).call(this)), J(this, Yt), J(this, Tt, {
			...Ni,
			onCloseErrorDialog: (e) => {
				var t;
				((t = e.composedPath()[0]) == null ? void 0 : t.localName) === "media-error-dialog" && F(this, H, kr).call(this, { isDialogOpen: !1 });
			},
			onFocusInErrorDialog: (e) => {
				var t;
				((t = e.composedPath()[0]) == null ? void 0 : t.localName) === "media-error-dialog" && (ts(this, Na.activeElement) || e.preventDefault());
			}
		}), J(this, La, (e) => {
			var t;
			let a = (t = this.media) == null ? void 0 : t.error;
			if (!(a instanceof A)) {
				let { message: i, code: n } = a ?? {};
				a = new A(i, n);
			}
			if (!(a != null && a.fatal)) {
				Oe(a), a.data && Oe(`${a.name} data:`, a.data);
				return;
			}
			let r = ls(a);
			r.message && Ei(r), le(a), a.data && le(`${a.name} data:`, a.data), F(this, H, kr).call(this, { isDialogOpen: !0 });
		}), re(this, ga, Lr()), this.attachShadow({ mode: "open" }), F(this, H, ds).call(this), this.isConnected && F(this, H, xe).call(this);
	}
	static get NAME() {
		return Oi;
	}
	static get VERSION() {
		return Si;
	}
	static get observedAttributes() {
		var e;
		return [
			...(e = ki.observedAttributes) != null ? e : [],
			...Mc,
			...Pc,
			...Uc
		];
	}
	get mediaTheme() {
		var e;
		return (e = this.shadowRoot) == null ? void 0 : e.querySelector("media-theme");
	}
	get mediaController() {
		var e, t;
		return (t = (e = this.mediaTheme) == null ? void 0 : e.shadowRoot) == null ? void 0 : t.querySelector("media-controller");
	}
	connectedCallback() {
		F(this, H, xe).call(this);
		let e = this.media;
		e && (e.metadata = Di(this));
	}
	disconnectedCallback() {
		var e, t, a, r, i, n, s, o;
		(e = O(this, Ft)) == null || e.disconnect(), (t = this.media) == null || t.removeEventListener("streamtypechange", O(this, xa)), (a = this.media) == null || a.removeEventListener("loadstart", O(this, Ia)), this.removeEventListener("error", O(this, La)), this.media && (this.media.errorTranslator = void 0), (i = (r = this.media) == null ? void 0 : r.textTracks) == null || i.removeEventListener("addtrack", O(this, Et)), (s = (n = this.media) == null ? void 0 : n.textTracks) == null || s.removeEventListener("removetrack", O(this, Et)), (o = O(this, Yt)) == null || o.call(this), re(this, Yt, void 0), re(this, Ht, !1);
	}
	attributeChangedCallback(e, t, a) {
		switch (F(this, H, xe).call(this), super.attributeChangedCallback(e, t, a), e) {
			case E.HOTKEYS:
				O(this, Ta).value = a;
				break;
			case E.THUMBNAIL_TIME:
				a != null && this.tokens.thumbnail && Oe(R("Use of thumbnail-time with thumbnail-token is currently unsupported. Ignore thumbnail-time.").toString());
				break;
			case E.THUMBNAIL_TOKEN:
				if (a) {
					let r = _t(a);
					if (r) {
						let { aud: i } = r, n = Wt.THUMBNAIL;
						i !== n && Oe(R("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({
							aud: i,
							expectedAud: n,
							tokenNamePrefix: "thumbnail"
						}));
					}
				}
				break;
			case E.STORYBOARD_TOKEN:
				if (a) {
					let r = _t(a);
					if (r) {
						let { aud: i } = r, n = Wt.STORYBOARD;
						i !== n && Oe(R("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({
							aud: i,
							expectedAud: n,
							tokenNamePrefix: "storyboard"
						}));
					}
				}
				break;
			case E.DRM_TOKEN:
				if (a) {
					let r = _t(a);
					if (r) {
						let { aud: i } = r, n = Wt.DRM;
						i !== n && Oe(R("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({
							aud: i,
							expectedAud: n,
							tokenNamePrefix: "drm"
						}));
					}
				}
				break;
			case v.PLAYBACK_ID:
				a != null && a.includes("?token") && le(R("The specificed playback ID {playbackId} contains a token which must be provided via the playback-token attribute.").format({ playbackId: a }));
				break;
			case v.STREAM_TYPE:
				a && ![
					U.LIVE,
					U.ON_DEMAND,
					U.UNKNOWN
				].includes(a) ? [
					"ll-live",
					"live:dvr",
					"ll-live:dvr"
				].includes(this.streamType) ? this.targetLiveWindow = a.includes("dvr") ? Number.POSITIVE_INFINITY : 0 : Ei({
					file: "invalid-stream-type.md",
					message: R("Invalid stream-type value supplied: `{streamType}`. Please provide stream-type as either: `on-demand` or `live`").format({ streamType: this.streamType })
				}) : a === U.LIVE ? this.getAttribute(E.TARGET_LIVE_WINDOW) ?? (this.targetLiveWindow = 0) : this.targetLiveWindow = NaN;
				break;
			case E.FULLSCREEN_ELEMENT:
				if (a != null || a !== t) {
					let r = Na.getElementById(a), i = r?.querySelector("mux-player");
					this.mediaController && r && i && (this.mediaController.fullscreenElement = r);
				}
				break;
			case v.CAP_RENDITION_TO_PLAYER_SIZE:
				(a == null || a !== t) && (this.capRenditionToPlayerSize = a != null ? !0 : void 0);
				break;
		}
		[
			v.PLAYBACK_ID,
			Ne.SRC,
			E.PLAYBACK_TOKEN
		].includes(e) && t !== a && re(this, Tt, {
			...O(this, Tt),
			...Ni
		}), F(this, H, ut).call(this, { [tc(e)]: a });
	}
	async requestFullscreen(e) {
		var t;
		if (!(!this.mediaController || this.mediaController.hasAttribute(he$1.MEDIA_IS_FULLSCREEN))) return (t = this.mediaController) == null || t.dispatchEvent(new Re.CustomEvent(jt$1.MEDIA_ENTER_FULLSCREEN_REQUEST, {
			composed: !0,
			bubbles: !0
		})), new Promise((a, r) => {
			var i;
			(i = this.mediaController) == null || i.addEventListener(Fp.MEDIA_IS_FULLSCREEN, () => a(), { once: !0 });
		});
	}
	async exitFullscreen() {
		var e;
		if (!(!this.mediaController || !this.mediaController.hasAttribute(he$1.MEDIA_IS_FULLSCREEN))) return (e = this.mediaController) == null || e.dispatchEvent(new Re.CustomEvent(jt$1.MEDIA_EXIT_FULLSCREEN_REQUEST, {
			composed: !0,
			bubbles: !0
		})), new Promise((t, a) => {
			var r;
			(r = this.mediaController) == null || r.addEventListener(Fp.MEDIA_IS_FULLSCREEN, () => t(), { once: !0 });
		});
	}
	get preferCmcd() {
		var e;
		return (e = this.getAttribute(v.PREFER_CMCD)) != null ? e : void 0;
	}
	set preferCmcd(e) {
		e !== this.preferCmcd && (e ? Sa.includes(e) ? this.setAttribute(v.PREFER_CMCD, e) : Oe(`Invalid value for preferCmcd. Must be one of ${Sa.join()}`) : this.removeAttribute(v.PREFER_CMCD));
	}
	get hasPlayed() {
		var e, t;
		return (t = (e = this.mediaController) == null ? void 0 : e.hasAttribute(he$1.MEDIA_HAS_PLAYED)) != null ? t : !1;
	}
	get inLiveWindow() {
		var e;
		return (e = this.mediaController) == null ? void 0 : e.hasAttribute(he$1.MEDIA_TIME_IS_LIVE);
	}
	get _hls() {
		var e;
		return (e = this.media) == null ? void 0 : e._hls;
	}
	get mux() {
		var e;
		return (e = this.media) == null ? void 0 : e.mux;
	}
	get theme() {
		var e;
		return (e = this.getAttribute(E.THEME)) != null ? e : Oc;
	}
	set theme(e) {
		this.setAttribute(E.THEME, `${e}`);
	}
	get themeProps() {
		let e = this.mediaTheme;
		if (!e) return;
		let t = {};
		for (let a of e.getAttributeNames()) {
			if (Tr.includes(a)) continue;
			let r = e.getAttribute(a);
			t[Jn(a)] = r === "" ? !0 : r;
		}
		return t;
	}
	set themeProps(e) {
		var t, a;
		F(this, H, xe).call(this);
		let r = {
			...this.themeProps,
			...e
		};
		for (let i in r) {
			if (Tr.includes(i)) continue;
			let n = e?.[i];
			typeof n == "boolean" || n == null ? (t = this.mediaTheme) == null || t.toggleAttribute(gr(i), !!n) : (a = this.mediaTheme) == null || a.setAttribute(gr(i), n);
		}
	}
	get playbackId() {
		var e;
		return (e = this.getAttribute(v.PLAYBACK_ID)) != null ? e : void 0;
	}
	set playbackId(e) {
		e ? this.setAttribute(v.PLAYBACK_ID, e) : this.removeAttribute(v.PLAYBACK_ID);
	}
	get src() {
		var e, t;
		return this.playbackId ? (e = Je(this, Ne.SRC)) != null ? e : void 0 : (t = this.getAttribute(Ne.SRC)) != null ? t : void 0;
	}
	set src(e) {
		e ? this.setAttribute(Ne.SRC, e) : this.removeAttribute(Ne.SRC);
	}
	get poster() {
		var e;
		let t = this.getAttribute(Ne.POSTER);
		if (t != null) return t;
		let { tokens: a } = this;
		if (a.playback && !a.thumbnail) {
			Oe("Missing expected thumbnail token. No poster image will be shown");
			return;
		}
		if (this.playbackId && !this.audio) return Qd(this.playbackId, {
			customDomain: this.customDomain,
			thumbnailTime: (e = this.thumbnailTime) != null ? e : this.startTime,
			programTime: this.programStartTime,
			token: a.thumbnail
		});
	}
	set poster(e) {
		e || e === "" ? this.setAttribute(Ne.POSTER, e) : this.removeAttribute(Ne.POSTER);
	}
	get storyboardSrc() {
		var e;
		return (e = this.getAttribute(E.STORYBOARD_SRC)) != null ? e : void 0;
	}
	set storyboardSrc(e) {
		e ? this.setAttribute(E.STORYBOARD_SRC, e) : this.removeAttribute(E.STORYBOARD_SRC);
	}
	get storyboard() {
		let { tokens: e } = this;
		if (this.storyboardSrc && !e.storyboard) return this.storyboardSrc;
		if (!(this.audio || !this.playbackId || !this.streamType || [U.LIVE, U.UNKNOWN].includes(this.streamType) || e.playback && !e.storyboard)) return Jd(this.playbackId, {
			customDomain: this.customDomain,
			token: e.storyboard,
			programStartTime: this.programStartTime,
			programEndTime: this.programEndTime
		});
	}
	get audio() {
		return this.hasAttribute(E.AUDIO);
	}
	set audio(e) {
		if (!e) {
			this.removeAttribute(E.AUDIO);
			return;
		}
		this.setAttribute(E.AUDIO, "");
	}
	get hotkeys() {
		return O(this, Ta);
	}
	get nohotkeys() {
		return this.hasAttribute(E.NOHOTKEYS);
	}
	set nohotkeys(e) {
		if (!e) {
			this.removeAttribute(E.NOHOTKEYS);
			return;
		}
		this.setAttribute(E.NOHOTKEYS, "");
	}
	get thumbnailTime() {
		return oe(this.getAttribute(E.THUMBNAIL_TIME));
	}
	set thumbnailTime(e) {
		this.setAttribute(E.THUMBNAIL_TIME, `${e}`);
	}
	get videoTitle() {
		var e, t;
		return (t = (e = this.getAttribute(E.VIDEO_TITLE)) != null ? e : this.getAttribute(E.TITLE)) != null ? t : "";
	}
	set videoTitle(e) {
		e !== this.videoTitle && (e ? this.setAttribute(E.VIDEO_TITLE, e) : this.removeAttribute(E.VIDEO_TITLE));
	}
	get placeholder() {
		var e;
		return (e = Je(this, E.PLACEHOLDER)) != null ? e : "";
	}
	set placeholder(e) {
		this.setAttribute(E.PLACEHOLDER, `${e}`);
	}
	get primaryColor() {
		var e, t;
		let a = this.getAttribute(E.PRIMARY_COLOR);
		if (a != null || this.mediaTheme && (a = (t = (e = Re.getComputedStyle(this.mediaTheme)) == null ? void 0 : e.getPropertyValue("--_primary-color")) == null ? void 0 : t.trim(), a)) return a;
	}
	set primaryColor(e) {
		this.setAttribute(E.PRIMARY_COLOR, `${e}`);
	}
	get secondaryColor() {
		var e, t;
		let a = this.getAttribute(E.SECONDARY_COLOR);
		if (a != null || this.mediaTheme && (a = (t = (e = Re.getComputedStyle(this.mediaTheme)) == null ? void 0 : e.getPropertyValue("--_secondary-color")) == null ? void 0 : t.trim(), a)) return a;
	}
	set secondaryColor(e) {
		this.setAttribute(E.SECONDARY_COLOR, `${e}`);
	}
	get accentColor() {
		var e, t;
		let a = this.getAttribute(E.ACCENT_COLOR);
		if (a != null || this.mediaTheme && (a = (t = (e = Re.getComputedStyle(this.mediaTheme)) == null ? void 0 : e.getPropertyValue("--_accent-color")) == null ? void 0 : t.trim(), a)) return a;
	}
	set accentColor(e) {
		this.setAttribute(E.ACCENT_COLOR, `${e}`);
	}
	get defaultShowRemainingTime() {
		return this.hasAttribute(E.DEFAULT_SHOW_REMAINING_TIME);
	}
	set defaultShowRemainingTime(e) {
		e ? this.setAttribute(E.DEFAULT_SHOW_REMAINING_TIME, "") : this.removeAttribute(E.DEFAULT_SHOW_REMAINING_TIME);
	}
	get playbackRates() {
		if (this.hasAttribute(E.PLAYBACK_RATES)) return this.getAttribute(E.PLAYBACK_RATES).trim().split(/\s*,?\s+/).map((e) => Number(e)).filter((e) => !Number.isNaN(e)).sort((e, t) => e - t);
	}
	set playbackRates(e) {
		if (!e) {
			this.removeAttribute(E.PLAYBACK_RATES);
			return;
		}
		this.setAttribute(E.PLAYBACK_RATES, e.join(" "));
	}
	get forwardSeekOffset() {
		var e;
		return (e = oe(this.getAttribute(E.FORWARD_SEEK_OFFSET))) != null ? e : 10;
	}
	set forwardSeekOffset(e) {
		this.setAttribute(E.FORWARD_SEEK_OFFSET, `${e}`);
	}
	get backwardSeekOffset() {
		var e;
		return (e = oe(this.getAttribute(E.BACKWARD_SEEK_OFFSET))) != null ? e : 10;
	}
	set backwardSeekOffset(e) {
		this.setAttribute(E.BACKWARD_SEEK_OFFSET, `${e}`);
	}
	get defaultHiddenCaptions() {
		return this.hasAttribute(E.DEFAULT_HIDDEN_CAPTIONS);
	}
	set defaultHiddenCaptions(e) {
		e ? this.setAttribute(E.DEFAULT_HIDDEN_CAPTIONS, "") : this.removeAttribute(E.DEFAULT_HIDDEN_CAPTIONS);
	}
	get defaultDuration() {
		return oe(this.getAttribute(E.DEFAULT_DURATION));
	}
	set defaultDuration(e) {
		e == null ? this.removeAttribute(E.DEFAULT_DURATION) : this.setAttribute(E.DEFAULT_DURATION, `${e}`);
	}
	get playerInitTime() {
		return this.hasAttribute(v.PLAYER_INIT_TIME) ? oe(this.getAttribute(v.PLAYER_INIT_TIME)) : O(this, ga);
	}
	set playerInitTime(e) {
		e != this.playerInitTime && (e == null ? this.removeAttribute(v.PLAYER_INIT_TIME) : this.setAttribute(v.PLAYER_INIT_TIME, `${+e}`));
	}
	get playerSoftwareName() {
		var e;
		return (e = this.getAttribute(v.PLAYER_SOFTWARE_NAME)) != null ? e : Oi;
	}
	get playerSoftwareVersion() {
		var e;
		return (e = this.getAttribute(v.PLAYER_SOFTWARE_VERSION)) != null ? e : Si;
	}
	get beaconCollectionDomain() {
		var e;
		return (e = this.getAttribute(v.BEACON_COLLECTION_DOMAIN)) != null ? e : void 0;
	}
	set beaconCollectionDomain(e) {
		e !== this.beaconCollectionDomain && (e ? this.setAttribute(v.BEACON_COLLECTION_DOMAIN, e) : this.removeAttribute(v.BEACON_COLLECTION_DOMAIN));
	}
	get maxResolution() {
		var e;
		return (e = this.getAttribute(v.MAX_RESOLUTION)) != null ? e : void 0;
	}
	set maxResolution(e) {
		e !== this.maxResolution && (e ? this.setAttribute(v.MAX_RESOLUTION, e) : this.removeAttribute(v.MAX_RESOLUTION));
	}
	get minResolution() {
		var e;
		return (e = this.getAttribute(v.MIN_RESOLUTION)) != null ? e : void 0;
	}
	set minResolution(e) {
		e !== this.minResolution && (e ? this.setAttribute(v.MIN_RESOLUTION, e) : this.removeAttribute(v.MIN_RESOLUTION));
	}
	get maxAutoResolution() {
		var e;
		return (e = this.getAttribute(v.MAX_AUTO_RESOLUTION)) != null ? e : void 0;
	}
	set maxAutoResolution(e) {
		e == null ? this.removeAttribute(v.MAX_AUTO_RESOLUTION) : this.setAttribute(v.MAX_AUTO_RESOLUTION, e);
	}
	get renditionOrder() {
		var e;
		return (e = this.getAttribute(v.RENDITION_ORDER)) != null ? e : void 0;
	}
	set renditionOrder(e) {
		e !== this.renditionOrder && (e ? this.setAttribute(v.RENDITION_ORDER, e) : this.removeAttribute(v.RENDITION_ORDER));
	}
	get programStartTime() {
		return oe(this.getAttribute(v.PROGRAM_START_TIME));
	}
	set programStartTime(e) {
		e == null ? this.removeAttribute(v.PROGRAM_START_TIME) : this.setAttribute(v.PROGRAM_START_TIME, `${e}`);
	}
	get programEndTime() {
		return oe(this.getAttribute(v.PROGRAM_END_TIME));
	}
	set programEndTime(e) {
		e == null ? this.removeAttribute(v.PROGRAM_END_TIME) : this.setAttribute(v.PROGRAM_END_TIME, `${e}`);
	}
	get assetStartTime() {
		return oe(this.getAttribute(v.ASSET_START_TIME));
	}
	set assetStartTime(e) {
		e == null ? this.removeAttribute(v.ASSET_START_TIME) : this.setAttribute(v.ASSET_START_TIME, `${e}`);
	}
	get assetEndTime() {
		return oe(this.getAttribute(v.ASSET_END_TIME));
	}
	set assetEndTime(e) {
		e == null ? this.removeAttribute(v.ASSET_END_TIME) : this.setAttribute(v.ASSET_END_TIME, `${e}`);
	}
	get extraSourceParams() {
		return this.hasAttribute(E.EXTRA_SOURCE_PARAMS) ? [...new URLSearchParams(this.getAttribute(E.EXTRA_SOURCE_PARAMS)).entries()].reduce((e, [t, a]) => (e[t] = a, e), {}) : $c;
	}
	set extraSourceParams(e) {
		e == null ? this.removeAttribute(E.EXTRA_SOURCE_PARAMS) : this.setAttribute(E.EXTRA_SOURCE_PARAMS, new URLSearchParams(e).toString());
	}
	get customDomain() {
		var e;
		return (e = this.getAttribute(v.CUSTOM_DOMAIN)) != null ? e : void 0;
	}
	set customDomain(e) {
		e !== this.customDomain && (e ? this.setAttribute(v.CUSTOM_DOMAIN, e) : this.removeAttribute(v.CUSTOM_DOMAIN));
	}
	get envKey() {
		var e;
		return (e = Je(this, v.ENV_KEY)) != null ? e : void 0;
	}
	set envKey(e) {
		this.setAttribute(v.ENV_KEY, `${e}`);
	}
	get noVolumePref() {
		return this.hasAttribute(E.NO_VOLUME_PREF);
	}
	set noVolumePref(e) {
		e ? this.setAttribute(E.NO_VOLUME_PREF, "") : this.removeAttribute(E.NO_VOLUME_PREF);
	}
	get noMutedPref() {
		return this.hasAttribute(E.NO_MUTED_PREF);
	}
	set noMutedPref(e) {
		e ? this.setAttribute(E.NO_MUTED_PREF, "") : this.removeAttribute(E.NO_MUTED_PREF);
	}
	get debug() {
		return Je(this, v.DEBUG) != null;
	}
	set debug(e) {
		e ? this.setAttribute(v.DEBUG, "") : this.removeAttribute(v.DEBUG);
	}
	get disableTracking() {
		return Je(this, v.DISABLE_TRACKING) != null;
	}
	set disableTracking(e) {
		this.toggleAttribute(v.DISABLE_TRACKING, !!e);
	}
	get disableCookies() {
		return Je(this, v.DISABLE_COOKIES) != null;
	}
	set disableCookies(e) {
		e ? this.setAttribute(v.DISABLE_COOKIES, "") : this.removeAttribute(v.DISABLE_COOKIES);
	}
	get streamType() {
		var e, t, a;
		return (a = (t = this.getAttribute(v.STREAM_TYPE)) != null ? t : (e = this.media) == null ? void 0 : e.streamType) != null ? a : U.UNKNOWN;
	}
	set streamType(e) {
		this.setAttribute(v.STREAM_TYPE, `${e}`);
	}
	get defaultStreamType() {
		var e, t, a;
		return (a = (t = this.getAttribute(E.DEFAULT_STREAM_TYPE)) != null ? t : (e = this.mediaController) == null ? void 0 : e.getAttribute(E.DEFAULT_STREAM_TYPE)) != null ? a : U.ON_DEMAND;
	}
	set defaultStreamType(e) {
		e ? this.setAttribute(E.DEFAULT_STREAM_TYPE, e) : this.removeAttribute(E.DEFAULT_STREAM_TYPE);
	}
	get targetLiveWindow() {
		var e, t;
		return this.hasAttribute(E.TARGET_LIVE_WINDOW) ? +this.getAttribute(E.TARGET_LIVE_WINDOW) : (t = (e = this.media) == null ? void 0 : e.targetLiveWindow) != null ? t : NaN;
	}
	set targetLiveWindow(e) {
		e == this.targetLiveWindow || Number.isNaN(e) && Number.isNaN(this.targetLiveWindow) || (e == null ? this.removeAttribute(E.TARGET_LIVE_WINDOW) : this.setAttribute(E.TARGET_LIVE_WINDOW, `${+e}`));
	}
	get liveEdgeStart() {
		var e;
		return (e = this.media) == null ? void 0 : e.liveEdgeStart;
	}
	get startTime() {
		return oe(Je(this, v.START_TIME));
	}
	set startTime(e) {
		this.setAttribute(v.START_TIME, `${e}`);
	}
	get preferPlayback() {
		let e = this.getAttribute(v.PREFER_PLAYBACK);
		if (e === Ce.MSE || e === Ce.NATIVE) return e;
	}
	set preferPlayback(e) {
		e !== this.preferPlayback && (e === Ce.MSE || e === Ce.NATIVE ? this.setAttribute(v.PREFER_PLAYBACK, e) : this.removeAttribute(v.PREFER_PLAYBACK));
	}
	get metadata() {
		var e;
		return (e = this.media) == null ? void 0 : e.metadata;
	}
	set metadata(e) {
		if (F(this, H, xe).call(this), !this.media) {
			le("underlying media element missing when trying to set metadata. metadata will not be set.");
			return;
		}
		this.media.metadata = {
			...Di(this),
			...e
		};
	}
	get _hlsConfig() {
		var e;
		return (e = this.media) == null ? void 0 : e._hlsConfig;
	}
	set _hlsConfig(e) {
		if (F(this, H, xe).call(this), !this.media) {
			le("underlying media element missing when trying to set _hlsConfig. _hlsConfig will not be set.");
			return;
		}
		this.media._hlsConfig = e;
	}
	async addCuePoints(e) {
		var t;
		if (F(this, H, xe).call(this), !this.media) {
			le("underlying media element missing when trying to addCuePoints. cuePoints will not be added.");
			return;
		}
		return (t = this.media) == null ? void 0 : t.addCuePoints(e);
	}
	get activeCuePoint() {
		var e;
		return (e = this.media) == null ? void 0 : e.activeCuePoint;
	}
	get cuePoints() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.cuePoints) != null ? t : [];
	}
	addChapters(e) {
		var t;
		if (F(this, H, xe).call(this), !this.media) {
			le("underlying media element missing when trying to addChapters. chapters will not be added.");
			return;
		}
		return (t = this.media) == null ? void 0 : t.addChapters(e);
	}
	get activeChapter() {
		var e;
		return (e = this.media) == null ? void 0 : e.activeChapter;
	}
	get chapters() {
		var e, t;
		return (t = (e = this.media) == null ? void 0 : e.chapters) != null ? t : [];
	}
	getStartDate() {
		var e;
		return (e = this.media) == null ? void 0 : e.getStartDate();
	}
	get currentPdt() {
		var e;
		return (e = this.media) == null ? void 0 : e.currentPdt;
	}
	get tokens() {
		let e = this.getAttribute(E.PLAYBACK_TOKEN), t = this.getAttribute(E.DRM_TOKEN), a = this.getAttribute(E.THUMBNAIL_TOKEN), r = this.getAttribute(E.STORYBOARD_TOKEN);
		return {
			...O(this, Ea),
			...e != null ? { playback: e } : {},
			...t != null ? { drm: t } : {},
			...a != null ? { thumbnail: a } : {},
			...r != null ? { storyboard: r } : {}
		};
	}
	set tokens(e) {
		re(this, Ea, e ?? {});
	}
	get playbackToken() {
		var e;
		return (e = this.getAttribute(E.PLAYBACK_TOKEN)) != null ? e : void 0;
	}
	set playbackToken(e) {
		this.setAttribute(E.PLAYBACK_TOKEN, `${e}`);
	}
	get drmToken() {
		var e;
		return (e = this.getAttribute(E.DRM_TOKEN)) != null ? e : void 0;
	}
	set drmToken(e) {
		this.setAttribute(E.DRM_TOKEN, `${e}`);
	}
	get thumbnailToken() {
		var e;
		return (e = this.getAttribute(E.THUMBNAIL_TOKEN)) != null ? e : void 0;
	}
	set thumbnailToken(e) {
		this.setAttribute(E.THUMBNAIL_TOKEN, `${e}`);
	}
	get storyboardToken() {
		var e;
		return (e = this.getAttribute(E.STORYBOARD_TOKEN)) != null ? e : void 0;
	}
	set storyboardToken(e) {
		this.setAttribute(E.STORYBOARD_TOKEN, `${e}`);
	}
	addTextTrack(e, t, a, r) {
		var i;
		let n = (i = this.media) == null ? void 0 : i.nativeEl;
		if (n) return Or(n, e, t, a, r);
	}
	removeTextTrack(e) {
		var t;
		let a = (t = this.media) == null ? void 0 : t.nativeEl;
		if (a) return uu(a, e);
	}
	get textTracks() {
		var e;
		return (e = this.media) == null ? void 0 : e.textTracks;
	}
	get castReceiver() {
		var e;
		return (e = this.getAttribute(E.CAST_RECEIVER)) != null ? e : void 0;
	}
	set castReceiver(e) {
		e !== this.castReceiver && (e ? this.setAttribute(E.CAST_RECEIVER, e) : this.removeAttribute(E.CAST_RECEIVER));
	}
	get castCustomData() {
		var e;
		return (e = this.media) == null ? void 0 : e.castCustomData;
	}
	set castCustomData(e) {
		if (!this.media) {
			le("underlying media element missing when trying to set castCustomData. castCustomData will not be set.");
			return;
		}
		this.media.castCustomData = e;
	}
	get noTooltips() {
		return this.hasAttribute(E.NO_TOOLTIPS);
	}
	set noTooltips(e) {
		if (!e) {
			this.removeAttribute(E.NO_TOOLTIPS);
			return;
		}
		this.setAttribute(E.NO_TOOLTIPS, "");
	}
	get proudlyDisplayMuxBadge() {
		return this.hasAttribute(E.PROUDLY_DISPLAY_MUX_BADGE);
	}
	set proudlyDisplayMuxBadge(e) {
		e ? this.setAttribute(E.PROUDLY_DISPLAY_MUX_BADGE, "") : this.removeAttribute(E.PROUDLY_DISPLAY_MUX_BADGE);
	}
	get capRenditionToPlayerSize() {
		var e;
		return (e = this.media) == null ? void 0 : e.capRenditionToPlayerSize;
	}
	set capRenditionToPlayerSize(e) {
		if (!this.media) {
			le("underlying media element missing when trying to set capRenditionToPlayerSize");
			return;
		}
		this.media.capRenditionToPlayerSize = e;
	}
};
ga = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap(), Ea = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), Ta = /* @__PURE__ */ new WeakMap(), Ft = /* @__PURE__ */ new WeakMap(), xa = /* @__PURE__ */ new WeakMap(), Ia = /* @__PURE__ */ new WeakMap(), Et = /* @__PURE__ */ new WeakMap(), Yt = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), La = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakSet(), xe = function() {
	var e, t, a, r;
	if (!O(this, Ht)) {
		re(this, Ht, !0), F(this, H, ut).call(this);
		try {
			if (customElements.upgrade(this.mediaTheme), !(this.mediaTheme instanceof Re.HTMLElement)) throw "";
		} catch {
			le("<media-theme> failed to upgrade!");
		}
		try {
			customElements.upgrade(this.media);
		} catch {
			le("underlying media element failed to upgrade!");
		}
		try {
			if (customElements.upgrade(this.mediaController), !(this.mediaController instanceof ilt)) throw "";
		} catch {
			le("<media-controller> failed to upgrade!");
		}
		F(this, H, xi).call(this), F(this, H, Ii).call(this), F(this, H, Li).call(this), re(this, it, (t = (e = this.mediaController) == null ? void 0 : e.hasAttribute(dn$1.USER_INACTIVE)) != null ? t : !0), F(this, H, Pi).call(this), (a = this.media) == null || a.addEventListener("streamtypechange", O(this, xa)), (r = this.media) == null || r.addEventListener("loadstart", O(this, Ia));
	}
}, ds = function() {
	var e, t;
	try {
		(e = window?.CSS) == null || e.registerProperty({
			name: "--media-primary-color",
			syntax: "<color>",
			inherits: !0
		}), (t = window?.CSS) == null || t.registerProperty({
			name: "--media-secondary-color",
			syntax: "<color>",
			inherits: !0
		});
	} catch {}
}, kr = function(e) {
	Object.assign(O(this, Tt), e), F(this, H, ut).call(this);
}, ut = function(e = {}) {
	_c(gc(Nc(this, {
		...O(this, Tt),
		...e
	})), this.shadowRoot);
}, xi = function() {
	let e = (t) => {
		var a, r;
		if (!(t != null && t.startsWith("theme-"))) return;
		let i = t.replace(/^theme-/, "");
		if (Tr.includes(i)) return;
		let n = this.getAttribute(t);
		n != null ? (a = this.mediaTheme) == null || a.setAttribute(i, n) : (r = this.mediaTheme) == null || r.removeAttribute(i);
	};
	re(this, Ft, new MutationObserver((t) => {
		for (let { attributeName: a } of t) e(a);
	})), O(this, Ft).observe(this, { attributes: !0 }), this.getAttributeNames().forEach(e);
}, Ii = function() {
	this.addEventListener("error", O(this, La)), this.media && (this.media.errorTranslator = (e = {}) => {
		var t, a, r;
		if (!(((t = this.media) == null ? void 0 : t.error) instanceof A)) return e;
		let i = ls((a = this.media) == null ? void 0 : a.error);
		return {
			player_error_code: (r = this.media) == null ? void 0 : r.error.code,
			player_error_message: i.message ? String(i.message) : e.player_error_message,
			player_error_context: i.context ? String(i.context) : e.player_error_context
		};
	});
}, Li = function() {
	var e, t, a, r;
	(t = (e = this.media) == null ? void 0 : e.textTracks) == null || t.addEventListener("addtrack", O(this, Et)), (r = (a = this.media) == null ? void 0 : a.textTracks) == null || r.addEventListener("removetrack", O(this, Et));
}, Pi = function() {
	var e, t;
	if (!/Firefox/i.test(navigator.userAgent)) return;
	let a, r = /* @__PURE__ */ new WeakMap(), i = () => this.streamType === U.LIVE && !this.secondaryColor && this.offsetWidth >= 800, n = (u, m, p = !1) => {
		i() || Array.from(u && u.activeCues || []).forEach((c) => {
			if (!(!c.snapToLines || c.line < -5 || c.line >= 0 && c.line < 10)) if (!m || this.paused) {
				let d = c.text.split(`
`).length, h = -3;
				this.streamType === U.LIVE && (h = -2);
				let y = h - d;
				if (c.line === y && !p) return;
				r.has(c) || r.set(c, c.line), c.line = y;
			} else setTimeout(() => {
				c.line = r.get(c) || "auto";
			}, 500);
		});
	}, s = () => {
		var u, m;
		n(a, (m = (u = this.mediaController) == null ? void 0 : u.hasAttribute(dn$1.USER_INACTIVE)) != null ? m : !1);
	}, o = () => {
		var u, m;
		let p = Array.from(((m = (u = this.mediaController) == null ? void 0 : u.media) == null ? void 0 : m.textTracks) || []).filter((c) => ["subtitles", "captions"].includes(c.kind) && c.mode === "showing")[0];
		p !== a && a?.removeEventListener("cuechange", s), a = p, a?.addEventListener("cuechange", s), n(a, O(this, it));
	};
	o(), (e = this.textTracks) == null || e.addEventListener("change", o), (t = this.textTracks) == null || t.addEventListener("addtrack", o);
	let l = () => {
		var u, m;
		let p = (m = (u = this.mediaController) == null ? void 0 : u.hasAttribute(dn$1.USER_INACTIVE)) != null ? m : !0;
		O(this, it) !== p && (re(this, it, p), n(a, O(this, it)));
	};
	this.addEventListener("userinactivechange", l), re(this, Yt, () => {
		var u, m;
		a?.removeEventListener("cuechange", s), (u = this.textTracks) == null || u.removeEventListener("change", o), (m = this.textTracks) == null || m.removeEventListener("addtrack", o), this.removeEventListener("userinactivechange", l);
	});
};
function Je(e, t) {
	return e.media ? e.media.getAttribute(t) : e.getAttribute(t);
}
var Mi = Bc, cs = class {
	addEventListener() {}
	removeEventListener() {}
	dispatchEvent(e) {
		return !0;
	}
};
if (typeof DocumentFragment > "u") {
	class e extends cs {}
	globalThis.DocumentFragment = e;
}
var Kc = class extends cs {}, rr = typeof window > "u" || typeof globalThis.customElements > "u" ? { customElements: {
	get(e) {},
	define(e, t, a) {},
	getName(e) {
		return null;
	},
	upgrade(e) {},
	whenDefined(e) {
		return Promise.resolve(Kc);
	}
} } : globalThis;
rr.customElements.get("mux-player") || (rr.customElements.define("mux-player", Mi), rr.MuxPlayerElement = Mi);
var ms = parseInt(import_react.version) >= 19, Ui = {
	className: "class",
	classname: "class",
	htmlFor: "for",
	crossOrigin: "crossorigin",
	viewBox: "viewBox",
	playsInline: "playsinline",
	autoPlay: "autoplay",
	playbackRate: "playbackrate"
}, Fc = (e) => e == null, Yc = (e, t) => Fc(t) ? !1 : e in t, Vc = (e) => e.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`), jc = (e, t) => {
	if (!(!ms && typeof t == "boolean" && !t)) {
		if (Yc(e, Ui)) return Ui[e];
		if (typeof t < "u") return /[A-Z]/.test(e) ? Vc(e) : e;
	}
}, Gc = (e, t) => !ms && typeof e == "boolean" ? "" : e, zc = (e = {}) => {
	let { ref: t, ...a } = e;
	return Object.entries(a).reduce((r, [i, n]) => {
		let s = jc(i, n);
		if (!s) return r;
		return r[s] = Gc(n), r;
	}, {});
};
function $i(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function Zc(...e) {
	return (t) => {
		let a = !1, r = e.map((i) => {
			let n = $i(i, t);
			return !a && typeof n == "function" && (a = !0), n;
		});
		if (a) return () => {
			for (let i = 0; i < r.length; i++) {
				let n = r[i];
				typeof n == "function" ? n() : $i(e[i], null);
			}
		};
	};
}
function Xc(...e) {
	return import_react.useCallback(Zc(...e), e);
}
var Qc = Object.prototype.hasOwnProperty, Jc = (e, t) => {
	if (Object.is(e, t)) return !0;
	if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
	if (Array.isArray(e)) return !Array.isArray(t) || e.length !== t.length ? !1 : e.some((i, n) => t[n] === i);
	let a = Object.keys(e), r = Object.keys(t);
	if (a.length !== r.length) return !1;
	for (let i = 0; i < a.length; i++) if (!Qc.call(t, a[i]) || !Object.is(e[a[i]], t[a[i]])) return !1;
	return !0;
}, ps = (e, t, a) => !Jc(t, e[a]), em = (e, t, a) => {
	e[a] = t;
}, tm = (e, t, a, r = em, i = ps) => (0, import_react.useEffect)(() => {
	let n = a?.current;
	n && i(n, t, e) && r(n, t, e);
}, [a?.current, t]), Ae = tm, am = () => {
	try {
		return "3.11.7";
	} catch {}
	return "UNKNOWN";
}, rm = am(), im = () => rm, q = (e, t, a) => (0, import_react.useEffect)(() => {
	let r = t?.current;
	if (!r || !a) return;
	let i = e, n = a;
	return r.addEventListener(i, n), () => {
		r.removeEventListener(i, n);
	};
}, [
	t?.current,
	a,
	e
]), nm = import_react.forwardRef(({ children: e, ...t }, a) => import_react.createElement("mux-player", {
	suppressHydrationWarning: !0,
	...zc(t),
	ref: a
}, e)), sm = (e, t) => {
	let { onAbort: a, onCanPlay: r, onCanPlayThrough: i, onEmptied: n, onLoadStart: s, onLoadedData: o, onLoadedMetadata: l, onProgress: u, onDurationChange: m, onVolumeChange: p, onRateChange: c, onResize: d, onWaiting: h, onPlay: y, onPlaying: _, onTimeUpdate: g, onPause: b, onSeeking: f, onSeeked: T, onStalled: w, onSuspend: D, onEnded: I, onError: M, onCuePointChange: K, onChapterChange: L, metadata: N, tokens: ne, paused: Ee, playbackId: Te, playbackRates: Q, currentTime: ue, themeProps: Be, extraSourceParams: Ke, castCustomData: qe, _hlsConfig: ke, ...te } = t;
	return Ae("tokens", ne, e), Ae("playbackId", Te, e), Ae("playbackRates", Q, e), Ae("metadata", N, e), Ae("extraSourceParams", Ke, e), Ae("_hlsConfig", ke, e), Ae("themeProps", Be, e), Ae("castCustomData", qe, e), Ae("paused", Ee, e, (se, de) => {
		de != null && (de ? se.pause() : se.play());
	}, (se, de, Wa) => se.hasAttribute("autoplay") && !se.hasPlayed ? !1 : ps(se, de, Wa)), Ae("currentTime", ue, e, (se, de) => {
		de != null && (se.currentTime = de);
	}), q("abort", e, a), q("canplay", e, r), q("canplaythrough", e, i), q("emptied", e, n), q("loadstart", e, s), q("loadeddata", e, o), q("loadedmetadata", e, l), q("progress", e, u), q("durationchange", e, m), q("volumechange", e, p), q("ratechange", e, c), q("resize", e, d), q("waiting", e, h), q("play", e, y), q("playing", e, _), q("timeupdate", e, g), q("pause", e, b), q("seeking", e, f), q("seeked", e, T), q("stalled", e, w), q("suspend", e, D), q("ended", e, I), q("error", e, M), q("cuepointchange", e, K), q("chapterchange", e, L), [te];
}, om = im(), lm = "mux-player-react", Tm = import_react.forwardRef((e, t) => {
	var a;
	let r = (0, import_react.useRef)(null), i = Xc(r, t), [n] = sm(r, e), [s] = (0, import_react.useState)((a = e.playerInitTime) != null ? a : Lr());
	return import_react.createElement(nm, {
		ref: i,
		defaultHiddenCaptions: e.defaultHiddenCaptions,
		playerSoftwareName: lm,
		playerSoftwareVersion: om,
		playerInitTime: s,
		...n
	});
});
//#endregion
export { hm as MaxResolution, A as MediaError, vm as MinResolution, fm as RenditionOrder, Tm as default, Lr as generatePlayerInitTime, lm as playerSoftwareName, om as playerSoftwareVersion };

//# sourceMappingURL=index-D7wcEP1d-BBa7rsa-.js.map