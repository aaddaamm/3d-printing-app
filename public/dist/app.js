// node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t;
var i;
var r;
var o;
var e;
var f;
var c;
var s;
var a;
var h;
var p;
var v;
var y;
var d = {};
var w = [];
var _ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var g = Array.isArray;
function m(n3, l3) {
  for (var u3 in l3) n3[u3] = l3[u3];
  return n3;
}
function b(n3) {
  n3 && n3.parentNode && n3.parentNode.removeChild(n3);
}
function k(l3, u3, t4) {
  var i3, r3, o3, e3 = {};
  for (o3 in u3) "key" == o3 ? i3 = u3[o3] : "ref" == o3 ? r3 = u3[o3] : e3[o3] = u3[o3];
  if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t4), "function" == typeof l3 && null != l3.defaultProps) for (o3 in l3.defaultProps) void 0 === e3[o3] && (e3[o3] = l3.defaultProps[o3]);
  return x(l3, e3, i3, r3, null);
}
function x(n3, t4, i3, r3, o3) {
  var e3 = { type: n3, props: t4, key: i3, ref: r3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o3 ? ++u : o3, __i: -1, __u: 0 };
  return null == o3 && null != l.vnode && l.vnode(e3), e3;
}
function S(n3) {
  return n3.children;
}
function C(n3, l3) {
  this.props = n3, this.context = l3;
}
function $(n3, l3) {
  if (null == l3) return n3.__ ? $(n3.__, n3.__i + 1) : null;
  for (var u3; l3 < n3.__k.length; l3++) if (null != (u3 = n3.__k[l3]) && null != u3.__e) return u3.__e;
  return "function" == typeof n3.type ? $(n3) : null;
}
function I(n3) {
  if (n3.__P && n3.__d) {
    var u3 = n3.__v, t4 = u3.__e, i3 = [], r3 = [], o3 = m({}, u3);
    o3.__v = u3.__v + 1, l.vnode && l.vnode(o3), q(n3.__P, o3, u3, n3.__n, n3.__P.namespaceURI, 32 & u3.__u ? [t4] : null, i3, null == t4 ? $(u3) : t4, !!(32 & u3.__u), r3), o3.__v = u3.__v, o3.__.__k[o3.__i] = o3, D(i3, o3, r3), u3.__e = u3.__ = null, o3.__e != t4 && P(o3);
  }
}
function P(n3) {
  if (null != (n3 = n3.__) && null != n3.__c) return n3.__e = n3.__c.base = null, n3.__k.some(function(l3) {
    if (null != l3 && null != l3.__e) return n3.__e = n3.__c.base = l3.__e;
  }), P(n3);
}
function A(n3) {
  (!n3.__d && (n3.__d = true) && i.push(n3) && !H.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(H);
}
function H() {
  try {
    for (var n3, l3 = 1; i.length; ) i.length > l3 && i.sort(e), n3 = i.shift(), l3 = i.length, I(n3);
  } finally {
    i.length = H.__r = 0;
  }
}
function L(n3, l3, u3, t4, i3, r3, o3, e3, f3, c3, s3) {
  var a3, h3, p3, v3, y3, _2, g2, m3 = t4 && t4.__k || w, b2 = l3.length;
  for (f3 = T(u3, l3, m3, f3, b2), a3 = 0; a3 < b2; a3++) null != (p3 = u3.__k[a3]) && (h3 = -1 != p3.__i && m3[p3.__i] || d, p3.__i = a3, _2 = q(n3, p3, h3, i3, r3, o3, e3, f3, c3, s3), v3 = p3.__e, p3.ref && h3.ref != p3.ref && (h3.ref && J(h3.ref, null, p3), s3.push(p3.ref, p3.__c || v3, p3)), null == y3 && null != v3 && (y3 = v3), (g2 = !!(4 & p3.__u)) || h3.__k === p3.__k ? (f3 = j(p3, f3, n3, g2), g2 && h3.__e && (h3.__e = null)) : "function" == typeof p3.type && void 0 !== _2 ? f3 = _2 : v3 && (f3 = v3.nextSibling), p3.__u &= -7);
  return u3.__e = y3, f3;
}
function T(n3, l3, u3, t4, i3) {
  var r3, o3, e3, f3, c3, s3 = u3.length, a3 = s3, h3 = 0;
  for (n3.__k = new Array(i3), r3 = 0; r3 < i3; r3++) null != (o3 = l3[r3]) && "boolean" != typeof o3 && "function" != typeof o3 ? ("string" == typeof o3 || "number" == typeof o3 || "bigint" == typeof o3 || o3.constructor == String ? o3 = n3.__k[r3] = x(null, o3, null, null, null) : g(o3) ? o3 = n3.__k[r3] = x(S, { children: o3 }, null, null, null) : void 0 === o3.constructor && o3.__b > 0 ? o3 = n3.__k[r3] = x(o3.type, o3.props, o3.key, o3.ref ? o3.ref : null, o3.__v) : n3.__k[r3] = o3, f3 = r3 + h3, o3.__ = n3, o3.__b = n3.__b + 1, e3 = null, -1 != (c3 = o3.__i = O(o3, u3, f3, a3)) && (a3--, (e3 = u3[c3]) && (e3.__u |= 2)), null == e3 || null == e3.__v ? (-1 == c3 && (i3 > s3 ? h3-- : i3 < s3 && h3++), "function" != typeof o3.type && (o3.__u |= 4)) : c3 != f3 && (c3 == f3 - 1 ? h3-- : c3 == f3 + 1 ? h3++ : (c3 > f3 ? h3-- : h3++, o3.__u |= 4))) : n3.__k[r3] = null;
  if (a3) for (r3 = 0; r3 < s3; r3++) null != (e3 = u3[r3]) && 0 == (2 & e3.__u) && (e3.__e == t4 && (t4 = $(e3)), K(e3, e3));
  return t4;
}
function j(n3, l3, u3, t4) {
  var i3, r3;
  if ("function" == typeof n3.type) {
    for (i3 = n3.__k, r3 = 0; i3 && r3 < i3.length; r3++) i3[r3] && (i3[r3].__ = n3, l3 = j(i3[r3], l3, u3, t4));
    return l3;
  }
  n3.__e != l3 && (t4 && (l3 && n3.type && !l3.parentNode && (l3 = $(n3)), u3.insertBefore(n3.__e, l3 || null)), l3 = n3.__e);
  do {
    l3 = l3 && l3.nextSibling;
  } while (null != l3 && 8 == l3.nodeType);
  return l3;
}
function O(n3, l3, u3, t4) {
  var i3, r3, o3, e3 = n3.key, f3 = n3.type, c3 = l3[u3], s3 = null != c3 && 0 == (2 & c3.__u);
  if (null === c3 && null == e3 || s3 && e3 == c3.key && f3 == c3.type) return u3;
  if (t4 > (s3 ? 1 : 0)) {
    for (i3 = u3 - 1, r3 = u3 + 1; i3 >= 0 || r3 < l3.length; ) if (null != (c3 = l3[o3 = i3 >= 0 ? i3-- : r3++]) && 0 == (2 & c3.__u) && e3 == c3.key && f3 == c3.type) return o3;
  }
  return -1;
}
function z(n3, l3, u3) {
  "-" == l3[0] ? n3.setProperty(l3, null == u3 ? "" : u3) : n3[l3] = null == u3 ? "" : "number" != typeof u3 || _.test(l3) ? u3 : u3 + "px";
}
function N(n3, l3, u3, t4, i3) {
  var r3, o3;
  n: if ("style" == l3) if ("string" == typeof u3) n3.style.cssText = u3;
  else {
    if ("string" == typeof t4 && (n3.style.cssText = t4 = ""), t4) for (l3 in t4) u3 && l3 in u3 || z(n3.style, l3, "");
    if (u3) for (l3 in u3) t4 && u3[l3] == t4[l3] || z(n3.style, l3, u3[l3]);
  }
  else if ("o" == l3[0] && "n" == l3[1]) r3 = l3 != (l3 = l3.replace(a, "$1")), o3 = l3.toLowerCase(), l3 = o3 in n3 || "onFocusOut" == l3 || "onFocusIn" == l3 ? o3.slice(2) : l3.slice(2), n3.l || (n3.l = {}), n3.l[l3 + r3] = u3, u3 ? t4 ? u3[s] = t4[s] : (u3[s] = h, n3.addEventListener(l3, r3 ? v : p, r3)) : n3.removeEventListener(l3, r3 ? v : p, r3);
  else {
    if ("http://www.w3.org/2000/svg" == i3) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n3) try {
      n3[l3] = null == u3 ? "" : u3;
      break n;
    } catch (n4) {
    }
    "function" == typeof u3 || (null == u3 || false === u3 && "-" != l3[4] ? n3.removeAttribute(l3) : n3.setAttribute(l3, "popover" == l3 && 1 == u3 ? "" : u3));
  }
}
function V(n3) {
  return function(u3) {
    if (this.l) {
      var t4 = this.l[u3.type + n3];
      if (null == u3[c]) u3[c] = h++;
      else if (u3[c] < t4[s]) return;
      return t4(l.event ? l.event(u3) : u3);
    }
  };
}
function q(n3, u3, t4, i3, r3, o3, e3, f3, c3, s3) {
  var a3, h3, p3, v3, y3, d3, _2, k3, x3, M, $2, I2, P2, A3, H2, T3 = u3.type;
  if (void 0 !== u3.constructor) return null;
  128 & t4.__u && (c3 = !!(32 & t4.__u), o3 = [f3 = u3.__e = t4.__e]), (a3 = l.__b) && a3(u3);
  n: if ("function" == typeof T3) try {
    if (k3 = u3.props, x3 = T3.prototype && T3.prototype.render, M = (a3 = T3.contextType) && i3[a3.__c], $2 = a3 ? M ? M.props.value : a3.__ : i3, t4.__c ? _2 = (h3 = u3.__c = t4.__c).__ = h3.__E : (x3 ? u3.__c = h3 = new T3(k3, $2) : (u3.__c = h3 = new C(k3, $2), h3.constructor = T3, h3.render = Q), M && M.sub(h3), h3.state || (h3.state = {}), h3.__n = i3, p3 = h3.__d = true, h3.__h = [], h3._sb = []), x3 && null == h3.__s && (h3.__s = h3.state), x3 && null != T3.getDerivedStateFromProps && (h3.__s == h3.state && (h3.__s = m({}, h3.__s)), m(h3.__s, T3.getDerivedStateFromProps(k3, h3.__s))), v3 = h3.props, y3 = h3.state, h3.__v = u3, p3) x3 && null == T3.getDerivedStateFromProps && null != h3.componentWillMount && h3.componentWillMount(), x3 && null != h3.componentDidMount && h3.__h.push(h3.componentDidMount);
    else {
      if (x3 && null == T3.getDerivedStateFromProps && k3 !== v3 && null != h3.componentWillReceiveProps && h3.componentWillReceiveProps(k3, $2), u3.__v == t4.__v || !h3.__e && null != h3.shouldComponentUpdate && false === h3.shouldComponentUpdate(k3, h3.__s, $2)) {
        u3.__v != t4.__v && (h3.props = k3, h3.state = h3.__s, h3.__d = false), u3.__e = t4.__e, u3.__k = t4.__k, u3.__k.some(function(n4) {
          n4 && (n4.__ = u3);
        }), w.push.apply(h3.__h, h3._sb), h3._sb = [], h3.__h.length && e3.push(h3);
        break n;
      }
      null != h3.componentWillUpdate && h3.componentWillUpdate(k3, h3.__s, $2), x3 && null != h3.componentDidUpdate && h3.__h.push(function() {
        h3.componentDidUpdate(v3, y3, d3);
      });
    }
    if (h3.context = $2, h3.props = k3, h3.__P = n3, h3.__e = false, I2 = l.__r, P2 = 0, x3) h3.state = h3.__s, h3.__d = false, I2 && I2(u3), a3 = h3.render(h3.props, h3.state, h3.context), w.push.apply(h3.__h, h3._sb), h3._sb = [];
    else do {
      h3.__d = false, I2 && I2(u3), a3 = h3.render(h3.props, h3.state, h3.context), h3.state = h3.__s;
    } while (h3.__d && ++P2 < 25);
    h3.state = h3.__s, null != h3.getChildContext && (i3 = m(m({}, i3), h3.getChildContext())), x3 && !p3 && null != h3.getSnapshotBeforeUpdate && (d3 = h3.getSnapshotBeforeUpdate(v3, y3)), A3 = null != a3 && a3.type === S && null == a3.key ? E(a3.props.children) : a3, f3 = L(n3, g(A3) ? A3 : [A3], u3, t4, i3, r3, o3, e3, f3, c3, s3), h3.base = u3.__e, u3.__u &= -161, h3.__h.length && e3.push(h3), _2 && (h3.__E = h3.__ = null);
  } catch (n4) {
    if (u3.__v = null, c3 || null != o3) if (n4.then) {
      for (u3.__u |= c3 ? 160 : 128; f3 && 8 == f3.nodeType && f3.nextSibling; ) f3 = f3.nextSibling;
      o3[o3.indexOf(f3)] = null, u3.__e = f3;
    } else {
      for (H2 = o3.length; H2--; ) b(o3[H2]);
      B(u3);
    }
    else u3.__e = t4.__e, u3.__k = t4.__k, n4.then || B(u3);
    l.__e(n4, u3, t4);
  }
  else null == o3 && u3.__v == t4.__v ? (u3.__k = t4.__k, u3.__e = t4.__e) : f3 = u3.__e = G(t4.__e, u3, t4, i3, r3, o3, e3, c3, s3);
  return (a3 = l.diffed) && a3(u3), 128 & u3.__u ? void 0 : f3;
}
function B(n3) {
  n3 && (n3.__c && (n3.__c.__e = true), n3.__k && n3.__k.some(B));
}
function D(n3, u3, t4) {
  for (var i3 = 0; i3 < t4.length; i3++) J(t4[i3], t4[++i3], t4[++i3]);
  l.__c && l.__c(u3, n3), n3.some(function(u4) {
    try {
      n3 = u4.__h, u4.__h = [], n3.some(function(n4) {
        n4.call(u4);
      });
    } catch (n4) {
      l.__e(n4, u4.__v);
    }
  });
}
function E(n3) {
  return "object" != typeof n3 || null == n3 || n3.__b > 0 ? n3 : g(n3) ? n3.map(E) : m({}, n3);
}
function G(u3, t4, i3, r3, o3, e3, f3, c3, s3) {
  var a3, h3, p3, v3, y3, w3, _2, m3 = i3.props || d, k3 = t4.props, x3 = t4.type;
  if ("svg" == x3 ? o3 = "http://www.w3.org/2000/svg" : "math" == x3 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {
    for (a3 = 0; a3 < e3.length; a3++) if ((y3 = e3[a3]) && "setAttribute" in y3 == !!x3 && (x3 ? y3.localName == x3 : 3 == y3.nodeType)) {
      u3 = y3, e3[a3] = null;
      break;
    }
  }
  if (null == u3) {
    if (null == x3) return document.createTextNode(k3);
    u3 = document.createElementNS(o3, x3, k3.is && k3), c3 && (l.__m && l.__m(t4, e3), c3 = false), e3 = null;
  }
  if (null == x3) m3 === k3 || c3 && u3.data == k3 || (u3.data = k3);
  else {
    if (e3 = e3 && n.call(u3.childNodes), !c3 && null != e3) for (m3 = {}, a3 = 0; a3 < u3.attributes.length; a3++) m3[(y3 = u3.attributes[a3]).name] = y3.value;
    for (a3 in m3) y3 = m3[a3], "dangerouslySetInnerHTML" == a3 ? p3 = y3 : "children" == a3 || a3 in k3 || "value" == a3 && "defaultValue" in k3 || "checked" == a3 && "defaultChecked" in k3 || N(u3, a3, null, y3, o3);
    for (a3 in k3) y3 = k3[a3], "children" == a3 ? v3 = y3 : "dangerouslySetInnerHTML" == a3 ? h3 = y3 : "value" == a3 ? w3 = y3 : "checked" == a3 ? _2 = y3 : c3 && "function" != typeof y3 || m3[a3] === y3 || N(u3, a3, y3, m3[a3], o3);
    if (h3) c3 || p3 && (h3.__html == p3.__html || h3.__html == u3.innerHTML) || (u3.innerHTML = h3.__html), t4.__k = [];
    else if (p3 && (u3.innerHTML = ""), L("template" == t4.type ? u3.content : u3, g(v3) ? v3 : [v3], t4, i3, r3, "foreignObject" == x3 ? "http://www.w3.org/1999/xhtml" : o3, e3, f3, e3 ? e3[0] : i3.__k && $(i3, 0), c3, s3), null != e3) for (a3 = e3.length; a3--; ) b(e3[a3]);
    c3 || (a3 = "value", "progress" == x3 && null == w3 ? u3.removeAttribute("value") : null != w3 && (w3 !== u3[a3] || "progress" == x3 && !w3 || "option" == x3 && w3 != m3[a3]) && N(u3, a3, w3, m3[a3], o3), a3 = "checked", null != _2 && _2 != u3[a3] && N(u3, a3, _2, m3[a3], o3));
  }
  return u3;
}
function J(n3, u3, t4) {
  try {
    if ("function" == typeof n3) {
      var i3 = "function" == typeof n3.__u;
      i3 && n3.__u(), i3 && null == u3 || (n3.__u = n3(u3));
    } else n3.current = u3;
  } catch (n4) {
    l.__e(n4, t4);
  }
}
function K(n3, u3, t4) {
  var i3, r3;
  if (l.unmount && l.unmount(n3), (i3 = n3.ref) && (i3.current && i3.current != n3.__e || J(i3, null, u3)), null != (i3 = n3.__c)) {
    if (i3.componentWillUnmount) try {
      i3.componentWillUnmount();
    } catch (n4) {
      l.__e(n4, u3);
    }
    i3.base = i3.__P = null;
  }
  if (i3 = n3.__k) for (r3 = 0; r3 < i3.length; r3++) i3[r3] && K(i3[r3], u3, t4 || "function" != typeof n3.type);
  t4 || b(n3.__e), n3.__c = n3.__ = n3.__e = void 0;
}
function Q(n3, l3, u3) {
  return this.constructor(n3, u3);
}
function R(u3, t4, i3) {
  var r3, o3, e3, f3;
  t4 == document && (t4 = document.documentElement), l.__ && l.__(u3, t4), o3 = (r3 = "function" == typeof i3) ? null : i3 && i3.__k || t4.__k, e3 = [], f3 = [], q(t4, u3 = (!r3 && i3 || t4).__k = k(S, null, [u3]), o3 || d, d, t4.namespaceURI, !r3 && i3 ? [i3] : o3 ? null : t4.firstChild ? n.call(t4.childNodes) : null, e3, !r3 && i3 ? i3 : o3 ? o3.__e : t4.firstChild, r3, f3), D(e3, u3, f3);
}
function X(n3) {
  function l3(n4) {
    var u3, t4;
    return this.getChildContext || (u3 = /* @__PURE__ */ new Set(), (t4 = {})[l3.__c] = this, this.getChildContext = function() {
      return t4;
    }, this.componentWillUnmount = function() {
      u3 = null;
    }, this.shouldComponentUpdate = function(n5) {
      this.props.value != n5.value && u3.forEach(function(n6) {
        n6.__e = true, A(n6);
      });
    }, this.sub = function(n5) {
      u3.add(n5);
      var l4 = n5.componentWillUnmount;
      n5.componentWillUnmount = function() {
        u3 && u3.delete(n5), l4 && l4.call(n5);
      };
    }), n4.children;
  }
  return l3.__c = "__cC" + y++, l3.__ = n3, l3.Provider = l3.__l = (l3.Consumer = function(n4, l4) {
    return n4.children(l4);
  }).contextType = l3, l3;
}
n = w.slice, l = { __e: function(n3, l3, u3, t4) {
  for (var i3, r3, o3; l3 = l3.__; ) if ((i3 = l3.__c) && !i3.__) try {
    if ((r3 = i3.constructor) && null != r3.getDerivedStateFromError && (i3.setState(r3.getDerivedStateFromError(n3)), o3 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n3, t4 || {}), o3 = i3.__d), o3) return i3.__E = i3;
  } catch (l4) {
    n3 = l4;
  }
  throw n3;
} }, u = 0, t = function(n3) {
  return null != n3 && void 0 === n3.constructor;
}, C.prototype.setState = function(n3, l3) {
  var u3;
  u3 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m({}, this.state), "function" == typeof n3 && (n3 = n3(m({}, u3), this.props)), n3 && m(u3, n3), null != n3 && this.__v && (l3 && this._sb.push(l3), A(this));
}, C.prototype.forceUpdate = function(n3) {
  this.__v && (this.__e = true, n3 && this.__h.push(n3), A(this));
}, C.prototype.render = S, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n3, l3) {
  return n3.__v.__b - l3.__v.__b;
}, H.__r = 0, f = Math.random().toString(8), c = "__d" + f, s = "__a" + f, a = /(PointerCapture)$|Capture$/i, h = 0, p = V(false), v = V(true), y = 0;

// node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = l;
var e2 = c2.__b;
var a2 = c2.__r;
var v2 = c2.diffed;
var l2 = c2.__c;
var m2 = c2.unmount;
var s2 = c2.__;
function p2(n3, t4) {
  c2.__h && c2.__h(r2, n3, o2 || t4), o2 = 0;
  var u3 = r2.__H || (r2.__H = { __: [], __h: [] });
  return n3 >= u3.__.length && u3.__.push({}), u3.__[n3];
}
function d2(n3) {
  return o2 = 1, h2(D2, n3);
}
function h2(n3, u3, i3) {
  var o3 = p2(t2++, 2);
  if (o3.t = n3, !o3.__c && (o3.__ = [i3 ? i3(u3) : D2(void 0, u3), function(n4) {
    var t4 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t4, n4);
    t4 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
  }], o3.__c = r2, !r2.__f)) {
    var f3 = function(n4, t4, r3) {
      if (!o3.__c.__H) return true;
      var u4 = o3.__c.__H.__.filter(function(n5) {
        return n5.__c;
      });
      if (u4.every(function(n5) {
        return !n5.__N;
      })) return !c3 || c3.call(this, n4, t4, r3);
      var i4 = o3.__c.props !== n4;
      return u4.some(function(n5) {
        if (n5.__N) {
          var t5 = n5.__[0];
          n5.__ = n5.__N, n5.__N = void 0, t5 !== n5.__[0] && (i4 = true);
        }
      }), c3 && c3.call(this, n4, t4, r3) || i4;
    };
    r2.__f = true;
    var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
    r2.componentWillUpdate = function(n4, t4, r3) {
      if (this.__e) {
        var u4 = c3;
        c3 = void 0, f3(n4, t4, r3), c3 = u4;
      }
      e3 && e3.call(this, n4, t4, r3);
    }, r2.shouldComponentUpdate = f3;
  }
  return o3.__N || o3.__;
}
function y2(n3, u3) {
  var i3 = p2(t2++, 3);
  !c2.__s && C2(i3.__H, u3) && (i3.__ = n3, i3.u = u3, r2.__H.__h.push(i3));
}
function A2(n3) {
  return o2 = 5, T2(function() {
    return { current: n3 };
  }, []);
}
function T2(n3, r3) {
  var u3 = p2(t2++, 7);
  return C2(u3.__H, r3) && (u3.__ = n3(), u3.__H = r3, u3.__h = n3), u3.__;
}
function q2(n3, t4) {
  return o2 = 8, T2(function() {
    return n3;
  }, t4);
}
function x2(n3) {
  var u3 = r2.context[n3.__c], i3 = p2(t2++, 9);
  return i3.c = n3, u3 ? (null == i3.__ && (i3.__ = true, u3.sub(r2)), u3.props.value) : n3.__;
}
function j2() {
  for (var n3; n3 = f2.shift(); ) {
    var t4 = n3.__H;
    if (n3.__P && t4) try {
      t4.__h.some(z2), t4.__h.some(B2), t4.__h = [];
    } catch (r3) {
      t4.__h = [], c2.__e(r3, n3.__v);
    }
  }
}
c2.__b = function(n3) {
  r2 = null, e2 && e2(n3);
}, c2.__ = function(n3, t4) {
  n3 && t4.__k && t4.__k.__m && (n3.__m = t4.__k.__m), s2 && s2(n3, t4);
}, c2.__r = function(n3) {
  a2 && a2(n3), t2 = 0;
  var i3 = (r2 = n3.__c).__H;
  i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.some(function(n4) {
    n4.__N && (n4.__ = n4.__N), n4.u = n4.__N = void 0;
  })) : (i3.__h.some(z2), i3.__h.some(B2), i3.__h = [], t2 = 0)), u2 = r2;
}, c2.diffed = function(n3) {
  v2 && v2(n3);
  var t4 = n3.__c;
  t4 && t4.__H && (t4.__H.__h.length && (1 !== f2.push(t4) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t4.__H.__.some(function(n4) {
    n4.u && (n4.__H = n4.u), n4.u = void 0;
  })), u2 = r2 = null;
}, c2.__c = function(n3, t4) {
  t4.some(function(n4) {
    try {
      n4.__h.some(z2), n4.__h = n4.__h.filter(function(n5) {
        return !n5.__ || B2(n5);
      });
    } catch (r3) {
      t4.some(function(n5) {
        n5.__h && (n5.__h = []);
      }), t4 = [], c2.__e(r3, n4.__v);
    }
  }), l2 && l2(n3, t4);
}, c2.unmount = function(n3) {
  m2 && m2(n3);
  var t4, r3 = n3.__c;
  r3 && r3.__H && (r3.__H.__.some(function(n4) {
    try {
      z2(n4);
    } catch (n5) {
      t4 = n5;
    }
  }), r3.__H = void 0, t4 && c2.__e(t4, r3.__v));
};
var k2 = "function" == typeof requestAnimationFrame;
function w2(n3) {
  var t4, r3 = function() {
    clearTimeout(u3), k2 && cancelAnimationFrame(t4), setTimeout(n3);
  }, u3 = setTimeout(r3, 35);
  k2 && (t4 = requestAnimationFrame(r3));
}
function z2(n3) {
  var t4 = r2, u3 = n3.__c;
  "function" == typeof u3 && (n3.__c = void 0, u3()), r2 = t4;
}
function B2(n3) {
  var t4 = r2;
  n3.__c = n3.__(), r2 = t4;
}
function C2(n3, t4) {
  return !n3 || n3.length !== t4.length || t4.some(function(t5, r3) {
    return t5 !== n3[r3];
  });
}
function D2(n3, t4) {
  return "function" == typeof t4 ? t4(n3) : t4;
}

// node_modules/htm/dist/htm.module.js
var n2 = function(t4, s3, r3, e3) {
  var u3;
  s3[0] = 0;
  for (var h3 = 1; h3 < s3.length; h3++) {
    var p3 = s3[h3++], a3 = s3[h3] ? (s3[0] |= p3 ? 1 : 2, r3[s3[h3++]]) : s3[++h3];
    3 === p3 ? e3[0] = a3 : 4 === p3 ? e3[1] = Object.assign(e3[1] || {}, a3) : 5 === p3 ? (e3[1] = e3[1] || {})[s3[++h3]] = a3 : 6 === p3 ? e3[1][s3[++h3]] += a3 + "" : p3 ? (u3 = t4.apply(a3, n2(t4, a3, r3, ["", null])), e3.push(u3), a3[0] ? s3[0] |= 2 : (s3[h3 - 2] = 0, s3[h3] = u3)) : e3.push(a3);
  }
  return e3;
};
var t3 = /* @__PURE__ */ new Map();
function htm_module_default(s3) {
  var r3 = t3.get(this);
  return r3 || (r3 = /* @__PURE__ */ new Map(), t3.set(this, r3)), (r3 = n2(this, r3.get(s3) || (r3.set(s3, r3 = (function(n3) {
    for (var t4, s4, r4 = 1, e3 = "", u3 = "", h3 = [0], p3 = function(n4) {
      1 === r4 && (n4 || (e3 = e3.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? h3.push(0, n4, e3) : 3 === r4 && (n4 || e3) ? (h3.push(3, n4, e3), r4 = 2) : 2 === r4 && "..." === e3 && n4 ? h3.push(4, n4, 0) : 2 === r4 && e3 && !n4 ? h3.push(5, 0, true, e3) : r4 >= 5 && ((e3 || !n4 && 5 === r4) && (h3.push(r4, 0, e3, s4), r4 = 6), n4 && (h3.push(r4, n4, 0, s4), r4 = 6)), e3 = "";
    }, a3 = 0; a3 < n3.length; a3++) {
      a3 && (1 === r4 && p3(), p3(a3));
      for (var l3 = 0; l3 < n3[a3].length; l3++) t4 = n3[a3][l3], 1 === r4 ? "<" === t4 ? (p3(), h3 = [h3], r4 = 3) : e3 += t4 : 4 === r4 ? "--" === e3 && ">" === t4 ? (r4 = 1, e3 = "") : e3 = t4 + e3[0] : u3 ? t4 === u3 ? u3 = "" : e3 += t4 : '"' === t4 || "'" === t4 ? u3 = t4 : ">" === t4 ? (p3(), r4 = 1) : r4 && ("=" === t4 ? (r4 = 5, s4 = e3, e3 = "") : "/" === t4 && (r4 < 5 || ">" === n3[a3][l3 + 1]) ? (p3(), 3 === r4 && (h3 = h3[0]), r4 = h3, (h3 = h3[0]).push(2, 0, r4), r4 = 0) : " " === t4 || "	" === t4 || "\n" === t4 || "\r" === t4 ? (p3(), r4 = 2) : e3 += t4), 3 === r4 && "!--" === e3 && (r4 = 4, h3 = h3[0]);
    }
    return p3(), h3;
  })(s3)), r3), arguments, [])).length > 1 ? r3 : r3[0];
}

// public/components/router.js
var html = htm_module_default.bind(k);
var LocationContext = X(null);
function RouterProvider({ base, children }) {
  const strip = (path2) => path2.startsWith(base) ? path2.slice(base.length) || "/" : path2;
  const [path, setPath] = d2(() => strip(location.pathname));
  y2(() => {
    const onPop = () => setPath(strip(location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = q2((to) => {
    history.pushState(null, "", base + (to === "/" ? "" : to));
    setPath(to);
  }, [base]);
  return html`<${LocationContext.Provider} value=${[path, navigate]}>${children}</${LocationContext.Provider}>`;
}
function useLocation() {
  return x2(LocationContext);
}

// public/components/helpers.js
function fmtTime(s3) {
  if (!s3) return "\u2014";
  const h3 = Math.floor(s3 / 3600), m3 = Math.floor(s3 % 3600 / 60);
  return h3 === 0 ? `${m3}m` : `${h3}h${m3 > 0 ? ` ${m3}m` : ""}`;
}
function fmtDate(iso) {
  if (!iso) return "\u2014";
  const d3 = new Date(iso), now = /* @__PURE__ */ new Date();
  const opts = d3.getFullYear() === now.getFullYear() ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric", year: "2-digit", hour: "numeric", minute: "2-digit" };
  return d3.toLocaleString(void 0, opts);
}
function fmtDateShort(iso) {
  if (!iso) return "\u2014";
  const d3 = new Date(iso), now = /* @__PURE__ */ new Date();
  const opts = d3.getFullYear() === now.getFullYear() ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "2-digit" };
  return d3.toLocaleDateString(void 0, opts);
}
function fmtCurrency(n3) {
  return "$" + n3.toFixed(2);
}
function fmtWeight(g2) {
  if (g2 == null) return "\u2014";
  return g2 >= 1e3 ? `${(g2 / 1e3).toFixed(2)} kg` : `${g2.toFixed(1)} g`;
}
function fmtWeightTotal(g2) {
  if (!g2) return "0 g";
  return g2 >= 1e3 ? `${(g2 / 1e3).toFixed(2)} kg` : `${Math.round(g2)} g`;
}

// public/components/atoms.js
var html2 = htm_module_default.bind(k);
var BADGE_CLS = {
  finish: "badge badge-finish",
  running: "badge badge-running",
  failed: "badge badge-failed",
  cancel: "badge badge-cancel",
  pause: "badge badge-pause"
};
function Badge({ status }) {
  const s3 = (status || "").toLowerCase();
  return html2`<span class=${BADGE_CLS[s3] || "badge badge-default"}>${s3 || "unknown"}</span>`;
}
function RowThumb({ url }) {
  const [err, setErr] = d2(false);
  if (!url || err) return html2`<div class="row-thumb-ph">🖨</div>`;
  return html2`<img class="row-thumb" src=${url} alt="" loading="lazy" onError=${() => setErr(true)} />`;
}
function CoverImg({ url, className }) {
  const [err, setErr] = d2(false);
  if (!url || err) return html2`<div class="cover-placeholder">🖨</div>`;
  return html2`<img class=${className} src=${url} alt="" loading="lazy" onError=${() => setErr(true)} />`;
}
function FilamentSwatches({ colors }) {
  if (!colors?.length) return null;
  const hexes = [...new Set(colors.map((c3) => c3.slice(0, 6).toUpperCase()))].filter((c3) => c3 !== "FFFFFF");
  if (!hexes.length) return null;
  return html2`<span class="swatches">${hexes.map((h3) => html2`<span class="swatch" style=${"background:#" + h3} title=${"#" + h3} />`)}</span>`;
}

// public/components/jobs-view.js
var html3 = htm_module_default.bind(k);
function Header({ summary }) {
  const [loc, navigate] = useLocation();
  const t4 = summary?.totals;
  return html3`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>bambu history</span></h1>
        <nav class="top-nav">
          <button class=${"nav-btn" + (!loc.startsWith("/projects") && !loc.startsWith("/admin") ? " active" : "")}
            onClick=${() => navigate("/")}>Jobs</button>
          <button class=${"nav-btn" + (loc.startsWith("/projects") ? " active" : "")}
            onClick=${() => navigate("/projects")}>Projects</button>
          <button class=${"nav-btn" + (loc.startsWith("/admin") ? " active" : "")}
            onClick=${() => navigate("/admin")}>Rates</button>
        </nav>
      </div>
      <div class="stats">
        <div class="stat">
          <div class="stat-val">${t4 ? t4.total_jobs.toLocaleString() : "\u2014"}</div>
          <div class="stat-lbl">Total Jobs</div>
        </div>
        <div class="stat">
          <div class="stat-val">${t4 ? (t4.total_weight_g / 1e3).toFixed(2) : "\u2014"}</div>
          <div class="stat-lbl">Filament kg</div>
        </div>
        <div class="stat">
          <div class="stat-val">${t4 ? (t4.total_time_s / 3600).toFixed(1) : "\u2014"}</div>
          <div class="stat-lbl">Print Hours</div>
        </div>
        <div class="stat">
          <div class="stat-val">${t4 ? t4.total_plates.toLocaleString() : "\u2014"}</div>
          <div class="stat-lbl">Plates</div>
        </div>
      </div>
    </header>
  `;
}
function Toolbar({ q: q3, setQ, statusFilter, setStatusFilter, deviceFilter, setDeviceFilter, devices, view, setView, filteredCount, totalCount }) {
  const csvUrl = T2(() => {
    const p3 = new URLSearchParams();
    if (statusFilter) p3.set("status", statusFilter);
    if (deviceFilter) p3.set("device", deviceFilter);
    const qs = p3.toString();
    return "/jobs/export.csv" + (qs ? "?" + qs : "");
  }, [statusFilter, deviceFilter]);
  return html3`
    <div class="toolbar">
      <input type="search" placeholder="Search title or customer…"
        value=${q3} onInput=${(e3) => setQ(e3.target.value)} />
      <select value=${statusFilter} onChange=${(e3) => setStatusFilter(e3.target.value)}>
        <option value="">All Statuses</option>
        <option value="finish">Finished</option>
        <option value="cancel">Cancelled</option>
        <option value="running">Running</option>
        <option value="failed">Failed</option>
        <option value="pause">Paused</option>
      </select>
      <select value=${deviceFilter} onChange=${(e3) => setDeviceFilter(e3.target.value)}>
        <option value="">All Printers</option>
        ${devices.map((d3) => html3`<option key=${d3} value=${d3}>${d3}</option>`)}
      </select>
      <div class="view-toggle">
        <button class=${"view-btn" + (view === "table" ? " active" : "")}
          onClick=${() => setView("table")}>☰ Table</button>
        <button class=${"view-btn" + (view === "grid" ? " active" : "")}
          onClick=${() => setView("grid")}>⊞ Grid</button>
      </div>
      <div class="toolbar-right">
        <a class="btn-csv" href=${csvUrl} download>↓ CSV</a>
        <span class="job-count">${filteredCount} / ${totalCount} jobs</span>
      </div>
    </div>
  `;
}
function TotalsBar({ filtered, isFiltered }) {
  if (!isFiltered || !filtered.length) return null;
  const totW = filtered.reduce((s3, j3) => s3 + (j3.total_weight_g || 0), 0);
  const totT = filtered.reduce((s3, j3) => s3 + (j3.total_time_s || 0), 0);
  return html3`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${filtered.length}</strong></span>
      <span>Filament: <strong>${fmtWeightTotal(totW)}</strong></span>
      <span>Print time: <strong>${fmtTime(totT)}</strong></span>
    </div>
  `;
}
var TABLE_COLS = [
  { col: "designTitle", label: "Title", cls: "sortable td-title" },
  { col: "deviceModel", label: "Printer", cls: "sortable" },
  { col: "startTime", label: "Date", cls: "sortable" },
  { col: null, label: "Status", cls: "" },
  { col: "total_weight_g", label: "Filament", cls: "sortable td-num" },
  { col: "total_time_s", label: "Time", cls: "sortable td-num" },
  { col: "final_price", label: "Price", cls: "sortable td-num" },
  { col: null, label: "Plates", cls: "td-num" },
  { col: null, label: "Customer", cls: "" }
];
function JobRow({ job, onJobClick }) {
  return html3`
    <tr onClick=${() => onJobClick(job)}>
      <td class="td-thumb"><${RowThumb} url=${job.cover_url} /></td>
      <td class="td-title">
        <span class="row-title" title=${job.designTitle || "Untitled"}>
          ${job.designTitle || "Untitled Job"}
        </span>
        ${job.print_run > 1 && html3`<span class="run-badge">Run ${job.print_run}</span>`}
        <${FilamentSwatches} colors=${job.filament_colors} />
      </td>
      <td>${job.deviceModel || "\u2014"}</td>
      <td title=${fmtDate(job.startTime)}>${fmtDateShort(job.startTime)}</td>
      <td><${Badge} status=${job.status} /></td>
      <td class="td-num"><strong>${fmtWeight(job.total_weight_g)}</strong></td>
      <td class="td-num">${fmtTime(job.total_time_s)}</td>
      <td class="td-num">${job.final_price != null ? html3`<strong>${fmtCurrency(job.final_price)}</strong>` : "\u2014"}</td>
      <td class="td-num">${job.plate_count ?? "\u2014"}</td>
      <td>${job.customer && html3`<span class="customer-pill">${job.customer}</span>`}</td>
    </tr>
  `;
}
function TableView({ sorted, sortCol, sortDir, onSort, onJobClick }) {
  return html3`
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="td-thumb"></th>
            ${TABLE_COLS.map(({ col, label, cls }) => {
    const active = col && col === sortCol;
    const thCls = [cls, active ? `sort-${sortDir}` : ""].filter(Boolean).join(" ");
    return html3`
                <th key=${label} class=${thCls || void 0}
                  onClick=${col ? () => onSort(col) : void 0}>${label}</th>
              `;
  })}
          </tr>
        </thead>
        <tbody>
          ${sorted.map((job) => html3`<${JobRow} key=${job.id} job=${job} onJobClick=${onJobClick} />`)}
        </tbody>
      </table>
    </div>
  `;
}
function JobCard({ job, onJobClick }) {
  return html3`
    <div class="card" onClick=${() => onJobClick(job)}>
      <${CoverImg} url=${job.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${job.designTitle || "Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${job.deviceModel || "\u2014"}</span>
          <span>📅 ${fmtDateShort(job.startTime)}</span>
          <span>⏱ ${fmtTime(job.total_time_s)}</span>
          <span>🧵 ${fmtWeight(job.total_weight_g)}</span>
          ${job.final_price != null && html3`<span>💰 ${fmtCurrency(job.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${Badge} status=${job.status} />
          ${job.print_run > 1 && html3`<span class="run-badge">Run ${job.print_run}</span>`}
          ${job.customer && html3`<span class="customer-pill">${job.customer}</span>`}
          <${FilamentSwatches} colors=${job.filament_colors} />
        </div>
      </div>
    </div>
  `;
}
function GridView({ sorted, onJobClick }) {
  return html3`
    <div class="grid-view">
      ${sorted.map((job) => html3`<${JobCard} key=${job.id} job=${job} onJobClick=${onJobClick} />`)}
    </div>
  `;
}

// public/hooks/use-escape-close.js
function useEscapeClose(onClose) {
  y2(() => {
    const handler = (e3) => {
      if (e3.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
}

// public/components/modal.js
var html4 = htm_module_default.bind(k);
function PricingSection({ jobId }) {
  const [price, setPrice] = d2(null);
  y2(() => {
    setPrice(null);
    fetch(`/jobs/${jobId}/price`).then((r3) => r3.ok ? r3.json() : null).then((d3) => setPrice(d3 ?? false)).catch(() => setPrice(false));
  }, [jobId]);
  if (price === null) return html4`<div class="pricing-row pricing-loading">Loading price…</div>`;
  if (price === false)
    return html4`<div class="pricing-row pricing-na">Pricing not configured</div>`;
  const markup = price.final_price - price.base_price;
  const markupPct = price.base_price > 0 ? Math.round(markup / price.base_price * 100) : 0;
  return html4`
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Material</span><span>${fmtCurrency(price.material_cost)}</span>
      </div>
      <div class="pricing-row">
        <span>Machine</span><span>${fmtCurrency(price.machine_cost)}</span>
      </div>
      <div class="pricing-row"><span>Labor</span><span>${fmtCurrency(price.labor_cost)}</span></div>
      ${price.extra_labor_cost > 0 && html4`
        <div class="pricing-row pricing-extra-labor">
          <span>Extra labor</span><span>${fmtCurrency(price.extra_labor_cost)}</span>
        </div>
      `}
      <div class="pricing-divider"></div>
      <div class="pricing-row pricing-base">
        <span>Base</span><span>${fmtCurrency(price.base_price)}</span>
      </div>
      ${markup !== 0 && html4`
        <div class="pricing-row pricing-markup">
          <span>Markup</span>
          <span
            >${markup > 0 ? "+" : ""}${fmtCurrency(markup)}
            (${markupPct > 0 ? "+" : ""}${markupPct}%)</span
          >
        </div>
      `}
      <div class="pricing-row pricing-final">
        <span
          >Final${price.is_override ? html4`<span class="override-tag">override</span>` : ""}</span
        >
        <span>${fmtCurrency(price.final_price)}</span>
      </div>
    </div>
  `;
}
var STATUS_OPTIONS = ["finish", "failed", "cancel", "running", "pause"];
function Modal({
  job,
  onClose,
  onPatch,
  projects,
  onJobProjectChange,
  onJobStatusChange,
  onJobExtraLaborChange,
  onNavigateToProject
}) {
  const [localCustomer, setLocalCustomer] = d2(job.customer ?? "");
  const [localNotes, setLocalNotes] = d2(job.notes ?? "");
  const [localPriceOverride, setLocalPriceOverride] = d2(
    job.price_override != null ? String(job.price_override) : ""
  );
  useEscapeClose(onClose);
  const handleProjectChange = q2(
    (e3) => {
      const val = e3.target.value;
      onJobProjectChange(job.id, val === "" ? null : Number(val));
    },
    [job.id, onJobProjectChange]
  );
  const handleStatusChange = q2(
    (e3) => {
      const val = e3.target.value;
      onJobStatusChange(job.id, val === "" ? null : val);
    },
    [job.id, onJobStatusChange]
  );
  return html4`
    <div class="overlay" onClick=${(e3) => e3.target === e3.currentTarget && onClose()}>
      <div class="modal">
        <div class="modal-header">
          <h2>${job.designTitle || "Untitled Job"}</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        ${job.cover_url && html4`<img class="modal-img" src=${job.cover_url} alt="" />`}
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Status</label>
              <div class="detail-val">
                <${Badge} status=${job.status} />
                ${job.status_override && html4`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item">
              <label>Printer</label>
              <div class="detail-val">${job.deviceModel || "\u2014"}</div>
            </div>
            <div class="detail-item">
              <label>Started</label>
              <div class="detail-val">${fmtDate(job.startTime)}</div>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <div class="detail-val">${fmtTime(job.total_time_s)}</div>
            </div>
            <div class="detail-item">
              <label>Filament</label>
              <div class="detail-val">
                ${fmtWeight(job.total_weight_g)}
                <${FilamentSwatches} colors=${job.filament_colors} />
              </div>
            </div>
            <div class="detail-item">
              <label>Plates</label>
              <div class="detail-val">${job.plate_count ?? "\u2014"}</div>
            </div>
            <div class="detail-item">
              <label>Print Run</label>
              <div class="detail-val">
                ${job.print_run > 1 ? `Run #${job.print_run} of this design` : "1st print of this design"}
              </div>
            </div>
          </div>
          <${PricingSection} jobId=${job.id} key=${job.id + "-" + job.extra_labor_minutes} />
          <div class="modal-project-row">
            <label class="modal-project-label">Customer</label>
            <input
              class="modal-project-select"
              type="text"
              placeholder="—"
              value=${localCustomer}
              onInput=${(e3) => setLocalCustomer(e3.target.value)}
              onBlur=${() => onPatch(job.id, { customer: localCustomer.trim() || null })}
              onKeyDown=${(e3) => e3.key === "Enter" && e3.target.blur()}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Notes</label>
            <textarea
              class="modal-project-select modal-notes"
              placeholder="—"
              value=${localNotes}
              onInput=${(e3) => setLocalNotes(e3.target.value)}
              onBlur=${() => onPatch(job.id, { notes: localNotes.trim() || null })}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Price override</label>
            <input
              class="modal-project-select"
              type="number"
              min="0"
              step="0.01"
              placeholder="Calculated"
              value=${localPriceOverride}
              onInput=${(e3) => setLocalPriceOverride(e3.target.value)}
              onBlur=${() => {
    const v3 = localPriceOverride === "" ? null : Number(localPriceOverride);
    onPatch(job.id, { price_override: v3 });
  }}
              onKeyDown=${(e3) => e3.key === "Enter" && e3.target.blur()}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Extra labor (min)</label>
            <input
              type="number"
              class="modal-project-select"
              min="0"
              step="1"
              placeholder="0"
              value=${job.extra_labor_minutes ?? ""}
              onChange=${(e3) => {
    const v3 = e3.target.value === "" ? null : Number(e3.target.value);
    onJobExtraLaborChange(job.id, v3);
  }}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Status override</label>
            <select
              class="modal-project-select"
              value=${job.status_override ?? ""}
              onChange=${handleStatusChange}
            >
              <option value="">Auto (from printer)</option>
              ${STATUS_OPTIONS.map((s3) => html4`<option key=${s3} value=${s3}>${s3}</option>`)}
            </select>
          </div>
          ${projects && html4`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select
                class="modal-project-select"
                value=${job.project_id ?? ""}
                onChange=${handleProjectChange}
              >
                <option value="">— None —</option>
                ${projects.map((p3) => html4`<option key=${p3.id} value=${p3.id}>${p3.name}</option>`)}
              </select>
              ${job.project_id != null && html4`
                <button
                  class="btn-link"
                  onClick=${() => {
    onClose();
    onNavigateToProject(job.project_id);
  }}
                >
                  View →
                </button>
              `}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

// public/components/toast.js
var html5 = htm_module_default.bind(k);
var _addToast = () => {
};
function toast(message, type = "info") {
  _addToast({ message, type, id: Date.now() + Math.random() });
}
function ToastContainer() {
  const [toasts, setToasts] = d2([]);
  const timers = A2(/* @__PURE__ */ new Map());
  _addToast = q2((t4) => {
    setToasts((prev) => [...prev, t4]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((x3) => x3.id !== t4.id));
      timers.current.delete(t4.id);
    }, 3500);
    timers.current.set(t4.id, timer);
  }, []);
  const dismiss = q2((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x3) => x3.id !== id));
  }, []);
  if (!toasts.length) return null;
  return html5`
    <div class="toast-container">
      ${toasts.map((t4) => html5`
        <div class="toast toast-${t4.type}" key=${t4.id} onClick=${() => dismiss(t4.id)}>
          ${t4.message}
        </div>
      `)}
    </div>
  `;
}

// public/lib/constants.js
var FETCH_TIMEOUT_MS = 15e3;
var BOOT_FAILSAFE_MS = 2e4;
var TOTAL_BOOT_REQUESTS = 5;

// public/lib/api.js
async function errorMessage(res, fallback) {
  try {
    const data = await res.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}
function requestOptions(options) {
  return { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), ...options };
}
function toRequestError(err, fallback) {
  if (err?.name === "TimeoutError") return new Error(`${fallback} (request timed out)`);
  return new Error(`${fallback} (network error)`);
}
async function fetchJson(url, fallback, options) {
  let res;
  try {
    res = await fetch(url, requestOptions(options));
  } catch (err) {
    throw toRequestError(err, fallback);
  }
  if (!res.ok) throw new Error(await errorMessage(res, fallback));
  return res.json();
}
async function fetchJsonResult(url, fallback, options) {
  try {
    return { data: await fetchJson(url, fallback, options), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(fallback) };
  }
}
async function fetchJsonOrToast(url, fallback, options) {
  const { data, error } = await fetchJsonResult(url, fallback, options);
  if (error) {
    toast(error.message || fallback, "error");
    return null;
  }
  return data;
}
async function patchJsonOrToast(url, payload, fallback) {
  return fetchJsonOrToast(url, fallback, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
async function postJsonOrToast(url, payload, fallback) {
  return fetchJsonOrToast(url, fallback, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

// public/components/projects-view.js
var html6 = htm_module_default.bind(k);
function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = d2("");
  const [customer, setCustomer] = d2("");
  const [notes, setNotes] = d2("");
  const [saving, setSaving] = d2(false);
  useEscapeClose(onClose);
  const handleSubmit = q2(
    async (e3) => {
      e3.preventDefault();
      if (!name.trim()) return;
      setSaving(true);
      try {
        const data = await postJsonOrToast(
          "/projects",
          { name: name.trim(), customer: customer || null, notes: notes || null },
          "Failed to create project."
        );
        if (!data?.project) return;
        onCreate(data.project);
        onClose();
      } finally {
        setSaving(false);
      }
    },
    [name, customer, notes, onCreate, onClose]
  );
  return html6`
    <div class="overlay" onClick=${(e3) => e3.target === e3.currentTarget && onClose()}>
      <div class="modal">
        <div class="modal-header">
          <h2>New Project</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        <div class="modal-body">
          <form class="project-form" onSubmit=${handleSubmit}>
            <label class="form-label"
              >Name *
              <input
                class="form-input"
                type="text"
                value=${name}
                onInput=${(e3) => setName(e3.target.value)}
                placeholder="Project name"
                required
              />
            </label>
            <label class="form-label"
              >Customer
              <input
                class="form-input"
                type="text"
                value=${customer}
                onInput=${(e3) => setCustomer(e3.target.value)}
                placeholder="Optional"
              />
            </label>
            <label class="form-label"
              >Notes
              <textarea
                class="form-input form-textarea"
                value=${notes}
                onInput=${(e3) => setNotes(e3.target.value)}
                placeholder="Optional"
              />
            </label>
            <div class="form-actions">
              <button type="button" class="btn-secondary" onClick=${onClose}>Cancel</button>
              <button type="submit" class="btn-primary" disabled=${saving || !name.trim()}>
                ${saving ? "Creating\u2026" : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
function ProjectCard({ project, totalPrice, onClick }) {
  const totalW = project.total_weight_g;
  const totalT = project.total_time_s;
  return html6`
    <div class="proj-card" onClick=${onClick}>
      ${project.cover_url ? html6`<img class="proj-card-cover" src=${project.cover_url} alt="" />` : html6`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-name">${project.name}</div>
      <div class="proj-card-meta">
        ${project.customer && html6`<span class="customer-pill">${project.customer}</span>`}
      </div>
      <div class="proj-card-stats">
        <span><strong>${project.job_count}</strong> job${project.job_count !== 1 ? "s" : ""}</span>
        ${totalW != null && html6`<span>${fmtWeightTotal(totalW)}</span>`}
        ${totalT != null && html6`<span>${fmtTime(totalT)}</span>`}
        ${totalPrice != null && html6`<span class="proj-card-price">${fmtCurrency(totalPrice)}</span>`}
      </div>
      ${project.notes && html6`<div class="proj-card-notes">${project.notes}</div>`}
    </div>
  `;
}
function AddJobsModal({ unassignedJobs, onClose, onAdd }) {
  const [q3, setQ] = d2("");
  useEscapeClose(onClose);
  const filtered = T2(() => {
    if (!q3) return unassignedJobs;
    const lc = q3.toLowerCase();
    return unassignedJobs.filter(
      (j3) => ((j3.designTitle || "") + " " + (j3.customer || "")).toLowerCase().includes(lc)
    );
  }, [unassignedJobs, q3]);
  return html6`
    <div class="overlay" onClick=${(e3) => e3.target === e3.currentTarget && onClose()}>
      <div class="modal">
        <div class="modal-header">
          <h2>Add Jobs to Project</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        <div class="modal-body">
          <input
            type="search"
            class="add-jobs-search"
            placeholder="Search…"
            value=${q3}
            onInput=${(e3) => setQ(e3.target.value)}
          />
          ${filtered.length === 0 ? html6`<div class="empty" style="padding:16px 0">
                ${q3 ? "No matches." : "All jobs are already assigned to projects."}
              </div>` : html6`<div class="add-jobs-list">
                ${filtered.map(
    (job) => html6`
                    <div class="add-jobs-row" key=${job.id} onClick=${() => onAdd(job.id)}>
                      <${RowThumb} url=${job.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${job.designTitle || "Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${fmtDateShort(job.startTime)} · ${job.deviceModel || "\u2014"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `
  )}
              </div>`}
        </div>
      </div>
    </div>
  `;
}
function ProjectDetail({
  project,
  jobs,
  unassignedJobs,
  onBack,
  onJobClick,
  onAddJob,
  onRemoveJob
}) {
  const [showAddJobs, setShowAddJobs] = d2(false);
  const [price, setPrice] = d2(null);
  const totW = jobs.reduce((s3, j3) => s3 + (j3.total_weight_g || 0), 0);
  const totT = jobs.reduce((s3, j3) => s3 + (j3.total_time_s || 0), 0);
  y2(() => {
    setPrice(null);
    if (!jobs.length) return;
    fetchJsonOrToast(`/projects/${project.id}/price`, "Failed to load project price.").then((d3) => {
      if (d3) setPrice(d3);
    });
  }, [project.id, jobs.length]);
  const handleAdd = q2(
    (jobId) => {
      onAddJob(jobId);
    },
    [onAddJob]
  );
  return html6`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${onBack}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${project.name}</h2>
          ${project.customer && html6`<span class="customer-pill">${project.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${() => setShowAddJobs(true)}>+ Add Jobs</button>
      </div>
      ${project.notes && html6`<div class="proj-detail-notes">${project.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Jobs: <strong>${jobs.length}</strong></span>
        <span>Filament: <strong>${fmtWeightTotal(totW)}</strong></span>
        <span>Print time: <strong>${fmtTime(totT)}</strong></span>
        ${price && html6`
          <span>Material: <strong>${fmtCurrency(price.material_cost)}</strong></span>
          <span>Machine: <strong>${fmtCurrency(price.machine_cost)}</strong></span>
          <span>Labor: <strong>${fmtCurrency(price.labor_cost)}</strong></span>
          ${price.extra_labor_cost > 0 && html6`<span>Extra labor: <strong>${fmtCurrency(price.extra_labor_cost)}</strong></span>`}
          <span class="totals-total"
            >Total: <strong>${fmtCurrency(price.final_price)}</strong></span
          >
        `}
      </div>
      ${jobs.length === 0 ? html6`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>` : html6`
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th class="td-thumb"></th>
                    <th>Title</th>
                    <th>Printer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th class="td-num">Filament</th>
                    <th class="td-num">Time</th>
                    <th class="td-num">Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${jobs.map(
    (job) => html6`
                      <tr key=${job.id} onClick=${() => onJobClick(job)}>
                        <td class="td-thumb"><${RowThumb} url=${job.cover_url} /></td>
                        <td class="td-title">
                          <span class="row-title">${job.designTitle || "Untitled Job"}</span>
                        </td>
                        <td>${job.deviceModel || "\u2014"}</td>
                        <td title=${fmtDate(job.startTime)}>${fmtDateShort(job.startTime)}</td>
                        <td><${Badge} status=${job.status} /></td>
                        <td class="td-num"><strong>${fmtWeight(job.total_weight_g)}</strong></td>
                        <td class="td-num">${fmtTime(job.total_time_s)}</td>
                        <td class="td-num">
                          ${job.final_price != null ? html6`<strong>${fmtCurrency(job.final_price)}</strong>` : "\u2014"}
                        </td>
                        <td>
                          <button
                            class="btn-remove-job"
                            title="Remove from project"
                            onClick=${(e3) => {
      e3.stopPropagation();
      onRemoveJob(job.id);
    }}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    `
  )}
                </tbody>
              </table>
            </div>
          `}
      ${showAddJobs && html6`<${AddJobsModal}
        unassignedJobs=${unassignedJobs}
        onClose=${() => setShowAddJobs(false)}
        onAdd=${handleAdd}
      />`}
    </div>
  `;
}
function ProjectsView({
  projects,
  setProjects,
  onAutoGroup,
  projectPrices,
  loading = false
}) {
  const [showNew, setShowNew] = d2(false);
  const [grouping, setGrouping] = d2(false);
  const [q3, setQ] = d2("");
  const [, navigate] = useLocation();
  const handleAutoGroup = q2(async () => {
    setGrouping(true);
    try {
      const data = await postJsonOrToast("/projects/auto-group", {}, "Auto-group failed.");
      if (!data) return;
      const { projects_created, jobs_assigned } = data;
      await onAutoGroup();
      if (projects_created === 0) {
        toast("No ungrouped jobs found \u2014 everything is already assigned to a project.", "info");
      } else {
        toast(
          `Created ${projects_created} project${projects_created !== 1 ? "s" : ""}, assigned ${jobs_assigned} job${jobs_assigned !== 1 ? "s" : ""}.`,
          "success"
        );
      }
    } finally {
      setGrouping(false);
    }
  }, [onAutoGroup]);
  const handleCreate = q2(
    (project) => {
      setProjects((ps) => [project, ...ps]);
      navigate(`/projects/${project.id}`);
    },
    [setProjects, navigate]
  );
  const filtered = T2(() => {
    if (!q3) return projects;
    const lc = q3.toLowerCase();
    return projects.filter(
      (p3) => [p3.name, p3.customer, p3.notes].filter(Boolean).join(" ").toLowerCase().includes(lc)
    );
  }, [projects, q3]);
  return html6`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${q3}
        onInput=${(e3) => setQ(e3.target.value)}
      />
      <span class="proj-list-count">
        ${q3 ? `${filtered.length} of ${projects.length}` : projects.length}
        ${" "}project${projects.length !== 1 ? "s" : ""}
      </span>
      <button class="btn-secondary" onClick=${handleAutoGroup} disabled=${grouping}>
        ${grouping ? "Grouping\u2026" : "\u26A1 Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${() => setShowNew(true)}>+ New Project</button>
    </div>
    ${loading ? html6`<div class="empty">Loading projects…</div>` : filtered.length === 0 ? html6`<div class="empty">
            ${q3 ? "No projects match your search." : "No projects yet. Create one to group related jobs together."}
          </div>` : html6`
            <div class="proj-grid">
              ${filtered.map(
    (p3) => html6`<${ProjectCard}
                    key=${p3.id}
                    project=${p3}
                    totalPrice=${projectPrices[p3.id] ?? null}
                    onClick=${() => navigate(`/projects/${p3.id}`)}
                  />`
  )}
            </div>
          `}
    ${showNew && html6`<${NewProjectModal} onClose=${() => setShowNew(false)} onCreate=${handleCreate} />`}
  `;
}

// public/components/admin-view.js
var html7 = htm_module_default.bind(k);
function RateField({ label, value, onChange, step = "0.01", min = "0" }) {
  return html7`
    <label class="form-label">
      ${label}
      <input
        type="number"
        class="form-input"
        step=${step}
        min=${min}
        value=${value}
        onInput=${(e3) => onChange(Number(e3.target.value))}
      />
    </label>
  `;
}
function LaborForm({ labor, saving, saved, onSave }) {
  const [v3, setV] = d2(labor);
  y2(() => setV(labor), [labor]);
  return html7`
    <div class="admin-card">
      <div class="admin-card-fields">
        <${RateField}
          label="Hourly rate ($)"
          value=${v3.hourly_rate}
          step="0.5"
          onChange=${(val) => setV((x3) => ({ ...x3, hourly_rate: val }))}
        />
        <${RateField}
          label="Minimum minutes"
          value=${v3.minimum_minutes}
          step="1"
          onChange=${(val) => setV((x3) => ({ ...x3, minimum_minutes: val }))}
        />
        <${RateField}
          label="Profit markup (%)"
          value=${Math.round(v3.profit_markup_pct * 100)}
          step="1"
          onChange=${(val) => setV((x3) => ({ ...x3, profit_markup_pct: val / 100 }))}
        />
        <${RateField}
          label="Failure buffer (%)"
          value=${Math.round(v3.failure_buffer_pct * 100)}
          step="1"
          onChange=${(val) => setV((x3) => ({ ...x3, failure_buffer_pct: val / 100 }))}
        />
        <${RateField}
          label="Overhead buffer (%)"
          value=${Math.round(v3.overhead_buffer_pct * 100)}
          step="1"
          onChange=${(val) => setV((x3) => ({ ...x3, overhead_buffer_pct: val / 100 }))}
        />
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived"
          >→ Min charge: ${fmtCurrency(Math.max(v3.minimum_minutes, 0) / 60 * v3.hourly_rate)}</span
        >
        <button class="btn-primary" onClick=${() => onSave(v3)} disabled=${saving}>
          ${saving ? "Saving\u2026" : saved ? "\u2713 Saved" : "Save"}
        </button>
      </div>
    </div>
  `;
}
function MachineForm({ machine, saving, saved, onSave }) {
  const [v3, setV] = d2(machine);
  y2(() => setV(machine), [machine]);
  const rate = v3.purchase_price / v3.lifetime_hrs + v3.electricity_rate + v3.maintenance_buffer;
  return html7`
    <div class="admin-card">
      <div class="admin-card-name">${v3.device_model}</div>
      <div class="admin-card-fields">
        <${RateField}
          label="Purchase price ($)"
          value=${v3.purchase_price}
          step="1"
          onChange=${(val) => setV((x3) => ({ ...x3, purchase_price: val }))}
        />
        <${RateField}
          label="Lifetime hours"
          value=${v3.lifetime_hrs}
          step="100"
          onChange=${(val) => setV((x3) => ({ ...x3, lifetime_hrs: val }))}
        />
        <${RateField}
          label="Electricity ($/hr)"
          value=${v3.electricity_rate}
          step="0.01"
          onChange=${(val) => setV((x3) => ({ ...x3, electricity_rate: val }))}
        />
        <${RateField}
          label="Maintenance ($/hr)"
          value=${v3.maintenance_buffer}
          step="0.01"
          onChange=${(val) => setV((x3) => ({ ...x3, maintenance_buffer: val }))}
        />
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived">→ ${fmtCurrency(rate)}/hr</span>
        <button class="btn-primary" onClick=${() => onSave(v3)} disabled=${saving}>
          ${saving ? "Saving\u2026" : saved ? "\u2713 Saved" : "Save"}
        </button>
      </div>
    </div>
  `;
}
function MaterialForm({ material, saving, saved, onSave }) {
  const [v3, setV] = d2(material);
  y2(() => setV(material), [material]);
  const rate = v3.cost_per_g * (1 + v3.waste_buffer_pct);
  return html7`
    <div class="admin-card">
      <div class="admin-card-name">${v3.filament_type}</div>
      <div class="admin-card-fields">
        <${RateField}
          label="Cost per gram ($/g)"
          value=${v3.cost_per_g}
          step="0.001"
          onChange=${(val) => setV((x3) => ({ ...x3, cost_per_g: val }))}
        />
        <${RateField}
          label="Waste buffer fraction"
          value=${v3.waste_buffer_pct}
          step="0.01"
          onChange=${(val) => setV((x3) => ({ ...x3, waste_buffer_pct: val }))}
        />
        <p class="form-help">Stored as a fraction: 0.10 = 10% waste.</p>
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived">→ ${(rate * 1e3).toFixed(2)}¢/g effective</span>
        <button class="btn-primary" onClick=${() => onSave(v3)} disabled=${saving}>
          ${saving ? "Saving\u2026" : saved ? "\u2713 Saved" : "Save"}
        </button>
      </div>
    </div>
  `;
}
function AdminView({ onRatesChanged = () => {
} }) {
  const [rates, setRates] = d2(null);
  const [saving, setSaving] = d2("");
  const [saved, setSaved] = d2("");
  y2(() => {
    fetchJsonOrToast("/rates", "Failed to load rates.").then((data) => {
      if (data) setRates(data);
    });
  }, []);
  const flash = (key) => {
    setSaved(key);
    setTimeout(() => setSaved(""), 2e3);
  };
  const saveLaborConfig = async (labor) => {
    setSaving("labor");
    try {
      const data = await patchJsonOrToast("/rates/labor", labor, "Failed to save labor rates.");
      if (!data?.labor_config) return;
      setRates((r3) => ({ ...r3, labor_config: data.labor_config }));
      flash("labor");
      onRatesChanged();
    } finally {
      setSaving("");
    }
  };
  const saveMachine = async (machine) => {
    setSaving(machine.device_model);
    const { device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer } = machine;
    try {
      const data = await patchJsonOrToast(
        `/rates/machines/${encodeURIComponent(device_model)}`,
        { purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer },
        "Failed to save machine rate."
      );
      if (!data?.machine_rate) return;
      setRates((r3) => ({
        ...r3,
        machine_rates: r3.machine_rates.map(
          (m3) => m3.device_model === device_model ? data.machine_rate : m3
        )
      }));
      flash(device_model);
      onRatesChanged();
    } finally {
      setSaving("");
    }
  };
  const saveMaterial = async (material) => {
    setSaving(material.filament_type);
    const { filament_type, cost_per_g, waste_buffer_pct } = material;
    try {
      const data = await patchJsonOrToast(
        `/rates/materials/${encodeURIComponent(filament_type)}`,
        { cost_per_g, waste_buffer_pct },
        "Failed to save material rate."
      );
      if (!data?.material_rate) return;
      setRates((r3) => ({
        ...r3,
        material_rates: r3.material_rates.map(
          (m3) => m3.filament_type === filament_type ? data.material_rate : m3
        )
      }));
      flash(filament_type);
      onRatesChanged();
    } finally {
      setSaving("");
    }
  };
  if (!rates)
    return html7`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;
  const { labor_config: lc, machine_rates, material_rates } = rates;
  return html7`
    <div class="admin-page">
      <h2 class="admin-title">Rates &amp; Pricing</h2>

      <section class="admin-section">
        <h3 class="admin-section-title">Labor</h3>
        <p class="admin-section-desc">
          Applied once per job (or once per project for project pricing).
        </p>
        <${LaborForm}
          labor=${lc}
          saving=${saving === "labor"}
          saved=${saved === "labor"}
          onSave=${saveLaborConfig}
        />
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Machine Rates</h3>
        <p class="admin-section-desc">
          Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷
          lifetime + electricity + maintenance.
        </p>
        ${machine_rates.map(
    (m3) => html7`
            <${MachineForm}
              key=${m3.device_model}
              machine=${m3}
              saving=${saving === m3.device_model}
              saved=${saved === m3.device_model}
              onSave=${saveMachine}
            />
          `
  )}
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Material Rates</h3>
        <p class="admin-section-desc">
          Cost per gram including waste. Rate = cost × (1 + waste fraction).
        </p>
        ${material_rates.map(
    (m3) => html7`
            <${MaterialForm}
              key=${m3.filament_type}
              material=${m3}
              saving=${saving === m3.filament_type}
              saved=${saved === m3.filament_type}
              onSave=${saveMaterial}
            />
          `
  )}
      </section>
    </div>
  `;
}

// public/components/bootstrap.js
function useDashboardBootstrap({
  setJobs,
  setProjects,
  setProjectPrices,
  setSummary,
  toast: toast2
}) {
  const [loading, setLoading] = d2(true);
  const [projectsLoading, setProjectsLoading] = d2(true);
  const [loadProgress, setLoadProgress] = d2(0);
  const [error, setError] = d2(null);
  const [bootStatus, setBootStatus] = d2("Starting dashboard\u2026");
  const loadOptional = q2(
    async ({ url, fallback, onData, onFinally }) => {
      const { data, error: error2 } = await fetchJsonResult(url, fallback);
      if (error2) toast2(error2.message || fallback, "error");
      if (data) onData(data);
      if (onFinally) onFinally();
    },
    [toast2]
  );
  const refreshProjectsAndPrices = q2(() => {
    loadOptional({
      url: "/projects",
      fallback: "Failed to load projects.",
      onData: (d3) => d3?.projects && setProjects(d3.projects),
      onFinally: () => setProjectsLoading(false)
    });
    loadOptional({
      url: "/projects/prices",
      fallback: "Failed to load project prices.",
      onData: (d3) => d3?.prices && setProjectPrices(d3.prices)
    });
  }, [loadOptional, setProjects, setProjectPrices]);
  const refreshJobPrices = q2(
    (merge = false) => {
      const fallback = merge ? "Failed to refresh job prices." : "Failed to load job prices.";
      loadOptional({
        url: "/jobs/prices",
        fallback,
        onData: (d3) => {
          if (!d3?.prices) return;
          setJobs(
            (js) => js.map((j3) => ({
              ...j3,
              final_price: d3.prices[j3.id] ?? (merge ? j3.final_price : null) ?? null
            }))
          );
        }
      });
    },
    [loadOptional, setJobs]
  );
  y2(() => {
    const advanceProgress = () => setLoadProgress((p3) => Math.min(100, p3 + 100 / TOTAL_BOOT_REQUESTS));
    const trackedFetchJson = (url, fallback) => {
      setBootStatus(`Loading ${url}\u2026`);
      return fetchJson(url, fallback).catch((err) => {
        console.error(`[boot] ${url} failed`, err);
        throw err;
      }).finally(advanceProgress);
    };
    const failsafe = setTimeout(() => {
      setError("Dashboard load timed out. Check console/network for the failing request.");
      setLoading(false);
      setProjectsLoading(false);
    }, BOOT_FAILSAFE_MS);
    Promise.all([
      trackedFetchJson("/ui/data", "Failed to load jobs."),
      trackedFetchJson("/summary", "Failed to load summary.")
    ]).then(([data, sum]) => {
      setJobs(data.jobs);
      setSummary(sum);
      setLoading(false);
      setBootStatus("Loading optional data\u2026");
      refreshJobPrices(false);
      refreshProjectsAndPrices();
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
      setProjectsLoading(false);
    }).finally(() => clearTimeout(failsafe));
    return () => clearTimeout(failsafe);
  }, [setJobs, setSummary, refreshJobPrices, refreshProjectsAndPrices]);
  return {
    loading,
    projectsLoading,
    loadProgress,
    error,
    bootStatus,
    refreshProjectsAndPrices,
    refreshJobPrices
  };
}

// public/app.js
var html8 = htm_module_default.bind(k);
function filterJobs(jobs, q3, statusFilter, deviceFilter) {
  return jobs.filter((j3) => {
    const text = ((j3.designTitle || "") + " " + (j3.customer || "")).toLowerCase();
    if (q3 && !text.includes(q3.toLowerCase())) return false;
    if (statusFilter && (j3.status || "").toLowerCase() !== statusFilter) return false;
    if (deviceFilter && j3.deviceModel !== deviceFilter) return false;
    return true;
  });
}
function sortJobs(filtered, sortCol, sortDir) {
  return [...filtered].sort((a3, b2) => {
    let av = a3[sortCol];
    let bv = b2[sortCol];
    if (av == null) av = sortDir === "asc" ? Infinity : -Infinity;
    if (bv == null) bv = sortDir === "asc" ? Infinity : -Infinity;
    if (typeof av === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === "asc" ? av - bv : bv - av;
  });
}
function LoadingView({ bootStatus, loadProgress }) {
  return html8` <div class="in-app-loading" role="status" aria-live="polite">
    <section class="dashboard-loader-card">
      <div class="dashboard-loader-copy">
        <div class="loader-hero-row dashboard-loader-title-row">
          <div class="loader-cursor cursor-blink" aria-hidden="true"></div>
          <div>
            <p class="dashboard-loader-kicker">INTERNAL PRINT DASHBOARD</p>
            <h1 class="dashboard-loader-title">loading workspace</h1>
          </div>
        </div>
        <p class="dashboard-loader-copy-text">
          Fetching jobs, projects, pricing, rates, and cover cache metadata…
        </p>
        <p class="dashboard-loader-copy-text">${bootStatus}</p>
        <div class="dashboard-loader-steps" aria-hidden="true">
          <span>jobs</span>
          <span>projects</span>
          <span>rates</span>
          <span>covers</span>
        </div>
        <div
          class="dashboard-loader-progress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow=${Math.round(loadProgress)}
        >
          <span style=${`width:${Math.max(8, loadProgress)}%`}></span>
        </div>
      </div>
      <div class="dashboard-loader-preview" aria-hidden="true">
        <div class="dashboard-loader-stat"><span></span><strong></strong></div>
        <div class="dashboard-loader-stat"><span></span><strong></strong></div>
        <div class="dashboard-loader-table">
          ${Array.from(
    { length: 5 },
    (_2, i3) => html8`
              <div class="dashboard-loader-row" key=${i3}>
                <span></span><span></span><span></span><span></span>
              </div>
            `
  )}
        </div>
      </div>
    </section>
  </div>`;
}
function ErrorView({ error }) {
  return html8`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${error}</p>
      </div>
    </div>
  </div>`;
}
function ProjectRouteView({
  projectId,
  projects,
  jobs,
  projectsLoading,
  navigate,
  setSelectedJob,
  handleJobProjectChange
}) {
  const project = projects.find((p3) => p3.id === projectId);
  const projectJobs = jobs.filter((j3) => j3.project_id === projectId);
  if (!project) {
    return projectsLoading ? html8`<div class="empty">Loading projects…</div>` : html8`<div class="empty">Project not found.</div>`;
  }
  const unassignedJobs = jobs.filter((j3) => j3.project_id == null);
  return html8`<${ProjectDetail}
    project=${project}
    jobs=${projectJobs}
    unassignedJobs=${unassignedJobs}
    onBack=${() => navigate("/projects")}
    onJobClick=${setSelectedJob}
    onAddJob=${(jobId) => handleJobProjectChange(jobId, projectId)}
    onRemoveJob=${(jobId) => handleJobProjectChange(jobId, null)}
  />`;
}
function JobsRouteView({
  q: q3,
  setQ,
  statusFilter,
  setStatusFilter,
  deviceFilter,
  setDeviceFilter,
  devices,
  view,
  setView,
  filtered,
  jobs,
  isFiltered,
  sorted,
  sortCol,
  sortDir,
  onSort,
  onJobClick
}) {
  return html8`
    <${Toolbar}
      q=${q3}
      setQ=${setQ}
      statusFilter=${statusFilter}
      setStatusFilter=${setStatusFilter}
      deviceFilter=${deviceFilter}
      setDeviceFilter=${setDeviceFilter}
      devices=${devices}
      view=${view}
      setView=${setView}
      filteredCount=${filtered.length}
      totalCount=${jobs.length}
    />
    <${TotalsBar} filtered=${filtered} isFiltered=${isFiltered} />
    ${sorted.length === 0 ? html8`<div class="empty">No jobs match your filters.</div>` : view === "table" ? html8`<${TableView}
            sorted=${sorted}
            sortCol=${sortCol}
            sortDir=${sortDir}
            onSort=${onSort}
            onJobClick=${onJobClick}
          />` : html8`<${GridView} sorted=${sorted} onJobClick=${onJobClick} />`}
  `;
}
function App() {
  const [jobs, setJobs] = d2([]);
  const [projects, setProjects] = d2([]);
  const [projectPrices, setProjectPrices] = d2({});
  const [summary, setSummary] = d2(null);
  const [view, setView] = d2("table");
  const [q3, setQ] = d2("");
  const [statusFilter, setStatusFilter] = d2("");
  const [deviceFilter, setDeviceFilter] = d2("");
  const [sortCol, setSortCol] = d2("startTime");
  const [sortDir, setSortDir] = d2("desc");
  const [selectedJob, setSelectedJob] = d2(null);
  const [loc, navigate] = useLocation();
  const {
    loading,
    projectsLoading,
    loadProgress,
    error,
    bootStatus,
    refreshProjectsAndPrices,
    refreshJobPrices
  } = useDashboardBootstrap({
    setJobs,
    setProjects,
    setProjectPrices,
    setSummary,
    toast
  });
  const devices = T2(
    () => [...new Set(jobs.map((j3) => j3.deviceModel).filter(Boolean))].sort(),
    [jobs]
  );
  const isFiltered = !!(q3 || statusFilter || deviceFilter);
  const filtered = T2(
    () => filterJobs(jobs, q3, statusFilter, deviceFilter),
    [jobs, q3, statusFilter, deviceFilter]
  );
  const sorted = T2(() => sortJobs(filtered, sortCol, sortDir), [filtered, sortCol, sortDir]);
  const handleSort = q2(
    (col) => {
      if (sortCol === col) {
        setSortDir((d3) => d3 === "asc" ? "desc" : "asc");
      } else {
        setSortCol(col);
        setSortDir(col === "startTime" ? "desc" : "asc");
      }
    },
    [sortCol]
  );
  const closeModal = q2(() => setSelectedJob(null), []);
  const patchJob = q2(async (jobId, fields) => {
    const data = await patchJsonOrToast(`/jobs/${jobId}`, fields, "Failed to update job.");
    if (!data?.job) return null;
    const { job } = data;
    setJobs((js) => js.map((j3) => j3.id === jobId ? { ...j3, ...job } : j3));
    setSelectedJob((j3) => j3 && j3.id === jobId ? { ...j3, ...job } : j3);
    return job;
  }, []);
  const handleJobProjectChange = q2(
    async (jobId, projectId) => {
      const job = await patchJob(jobId, { project_id: projectId });
      if (!job) return;
      refreshProjectsAndPrices();
    },
    [patchJob, refreshProjectsAndPrices]
  );
  const patchJobField = q2(
    (jobId, fields) => {
      patchJob(jobId, fields);
    },
    [patchJob]
  );
  const handleJobStatusChange = q2(
    (jobId, statusOverride) => {
      patchJobField(jobId, { status_override: statusOverride });
    },
    [patchJobField]
  );
  const handleJobExtraLaborChange = q2(
    (jobId, minutes) => {
      patchJobField(jobId, { extra_labor_minutes: minutes });
    },
    [patchJobField]
  );
  const handleNavigateToProject = q2(
    (projectId) => {
      setSelectedJob(null);
      navigate(`/projects/${projectId}`);
    },
    [navigate]
  );
  const refreshSummary = q2(async () => {
    const data = await fetchJson("/summary", "Failed to refresh summary.");
    setSummary(data);
  }, []);
  const handleRatesChanged = q2(async () => {
    refreshJobPrices(true);
    refreshProjectsAndPrices();
    try {
      await refreshSummary();
      toast("Pricing refreshed from updated rates.", "success");
    } catch (err) {
      toast(err?.message || "Updated rates saved, but summary refresh failed.", "error");
    }
  }, [refreshJobPrices, refreshProjectsAndPrices, refreshSummary]);
  const handleAutoGroup = q2(async () => {
    const [jobsData, projData] = await Promise.all([
      fetchJson("/ui/data", "Failed to refresh jobs."),
      fetchJson("/projects", "Failed to refresh projects.")
    ]);
    setJobs(jobsData.jobs);
    setProjects(projData.projects);
    refreshJobPrices(true);
    refreshProjectsAndPrices();
  }, [refreshJobPrices, refreshProjectsAndPrices]);
  if (loading)
    return html8`<${LoadingView} bootStatus=${bootStatus} loadProgress=${loadProgress} />`;
  if (error) return html8`<${ErrorView} error=${error} />`;
  const projectDetailMatch = loc.match(/^\/projects\/(\d+)$/);
  const isProjects = loc.startsWith("/projects");
  const renderMainContent = () => {
    if (loc.startsWith("/admin")) {
      return html8`<${AdminView} onRatesChanged=${handleRatesChanged} />`;
    }
    if (projectDetailMatch) {
      return html8`<${ProjectRouteView}
        projectId=${Number(projectDetailMatch[1])}
        projects=${projects}
        jobs=${jobs}
        projectsLoading=${projectsLoading}
        navigate=${navigate}
        setSelectedJob=${setSelectedJob}
        handleJobProjectChange=${handleJobProjectChange}
      />`;
    }
    if (isProjects) {
      return html8`<${ProjectsView}
        projects=${projects}
        setProjects=${setProjects}
        onAutoGroup=${handleAutoGroup}
        projectPrices=${projectPrices}
        loading=${projectsLoading}
      />`;
    }
    return html8`<${JobsRouteView}
      q=${q3}
      setQ=${setQ}
      statusFilter=${statusFilter}
      setStatusFilter=${setStatusFilter}
      deviceFilter=${deviceFilter}
      setDeviceFilter=${setDeviceFilter}
      devices=${devices}
      view=${view}
      setView=${setView}
      filtered=${filtered}
      jobs=${jobs}
      isFiltered=${isFiltered}
      sorted=${sorted}
      sortCol=${sortCol}
      sortDir=${sortDir}
      onSort=${handleSort}
      onJobClick=${setSelectedJob}
    />`;
  };
  return html8`
    <${Header} summary=${summary} />
    ${renderMainContent()}
    ${selectedJob && html8`<${Modal}
      key=${selectedJob.id}
      job=${selectedJob}
      onClose=${closeModal}
      onPatch=${patchJob}
      projects=${projects}
      onJobProjectChange=${handleJobProjectChange}
      onJobStatusChange=${handleJobStatusChange}
      onJobExtraLaborChange=${handleJobExtraLaborChange}
      onNavigateToProject=${handleNavigateToProject}
    />`}
    <${ToastContainer} />
  `;
}
R(
  html8`<${RouterProvider} base="/ui"><${App} /></${RouterProvider}>`,
  document.getElementById("app")
);
