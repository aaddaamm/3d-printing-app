(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();var $t,k,ue,W,Yt,_e,pe,Tt,ct,at,ve,Et,xt,Lt,fe,vt={},ft=[],Ie=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,ht=Array.isArray;function O(t,e){for(var n in e)t[n]=e[n];return t}function Jt(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function H(t,e,n){var r,s,a,o={};for(a in e)a=="key"?r=e[a]:a=="ref"?s=e[a]:o[a]=e[a];if(arguments.length>2&&(o.children=arguments.length>3?$t.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(a in t.defaultProps)o[a]===void 0&&(o[a]=t.defaultProps[a]);return dt(t,o,r,s,null)}function dt(t,e,n,r,s){var a={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:s??++ue,__i:-1,__u:0};return s==null&&k.vnode!=null&&k.vnode(a),a}function gt(t){return t.children}function ut(t,e){this.props=t,this.context=e}function X(t,e){if(e==null)return t.__?X(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?X(t):null}function Re(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,r=[],s=[],a=O({},e);a.__v=e.__v+1,k.vnode&&k.vnode(a),Dt(t.__P,a,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,r,n??X(e),!!(32&e.__u),s),a.__v=e.__v,a.__.__k[a.__i]=a,ge(r,a,s),e.__e=e.__=null,a.__e!=n&&me(a)}}function me(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),me(t)}function Mt(t){(!t.__d&&(t.__d=!0)&&W.push(t)&&!mt.__r++||Yt!=k.debounceRendering)&&((Yt=k.debounceRendering)||_e)(mt)}function mt(){try{for(var t,e=1;W.length;)W.length>e&&W.sort(pe),t=W.shift(),e=W.length,Re(t)}finally{W.length=mt.__r=0}}function $e(t,e,n,r,s,a,o,l,d,c,v){var i,u,f,_,m,p,$,h=r&&r.__k||ft,b=e.length;for(d=We(n,e,h,d,b),i=0;i<b;i++)(f=n.__k[i])!=null&&(u=f.__i!=-1&&h[f.__i]||vt,f.__i=i,p=Dt(t,f,u,s,a,o,l,d,c,v),_=f.__e,f.ref&&u.ref!=f.ref&&(u.ref&&Ut(u.ref,null,f),v.push(f.ref,f.__c||_,f)),m==null&&_!=null&&(m=_),($=!!(4&f.__u))||u.__k===f.__k?(d=he(f,d,t,$),$&&u.__e&&(u.__e=null)):typeof f.type=="function"&&p!==void 0?d=p:_&&(d=_.nextSibling),f.__u&=-7);return n.__e=m,d}function We(t,e,n,r,s){var a,o,l,d,c,v=n.length,i=v,u=0;for(t.__k=new Array(s),a=0;a<s;a++)(o=e[a])!=null&&typeof o!="boolean"&&typeof o!="function"?(typeof o=="string"||typeof o=="number"||typeof o=="bigint"||o.constructor==String?o=t.__k[a]=dt(null,o,null,null,null):ht(o)?o=t.__k[a]=dt(gt,{children:o},null,null,null):o.constructor===void 0&&o.__b>0?o=t.__k[a]=dt(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):t.__k[a]=o,d=a+u,o.__=t,o.__b=t.__b+1,l=null,(c=o.__i=Be(o,n,d,i))!=-1&&(i--,(l=n[c])&&(l.__u|=2)),l==null||l.__v==null?(c==-1&&(s>v?u--:s<v&&u++),typeof o.type!="function"&&(o.__u|=4)):c!=d&&(c==d-1?u--:c==d+1?u++:(c>d?u--:u++,o.__u|=4))):t.__k[a]=null;if(i)for(a=0;a<v;a++)(l=n[a])!=null&&(2&l.__u)==0&&(l.__e==r&&(r=X(l)),ye(l,l));return r}function he(t,e,n,r){var s,a;if(typeof t.type=="function"){for(s=t.__k,a=0;s&&a<s.length;a++)s[a]&&(s[a].__=t,e=he(s[a],e,n,r));return e}t.__e!=e&&(r&&(e&&t.type&&!e.parentNode&&(e=X(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Be(t,e,n,r){var s,a,o,l=t.key,d=t.type,c=e[n],v=c!=null&&(2&c.__u)==0;if(c===null&&l==null||v&&l==c.key&&d==c.type)return n;if(r>(v?1:0)){for(s=n-1,a=n+1;s>=0||a<e.length;)if((c=e[o=s>=0?s--:a++])!=null&&(2&c.__u)==0&&l==c.key&&d==c.type)return o}return-1}function Xt(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||Ie.test(e)?n:n+"px"}function lt(t,e,n,r,s){var a,o;t:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof r=="string"&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||Xt(t.style,e,"");if(n)for(e in n)r&&n[e]==r[e]||Xt(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")a=e!=(e=e.replace(ve,"$1")),o=e.toLowerCase(),e=o in t||e=="onFocusOut"||e=="onFocusIn"?o.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+a]=n,n?r?n[at]=r[at]:(n[at]=Et,t.addEventListener(e,a?Lt:xt,a)):t.removeEventListener(e,a?Lt:xt,a);else{if(s=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break t}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function Zt(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[ct]==null)e[ct]=Et++;else if(e[ct]<n[at])return;return n(k.event?k.event(e):e)}}}function Dt(t,e,n,r,s,a,o,l,d,c){var v,i,u,f,_,m,p,$,h,b,w,F,S,x,A,E=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),a=[l=e.__e=n.__e]),(v=k.__b)&&v(e);t:if(typeof E=="function")try{if($=e.props,h=E.prototype&&E.prototype.render,b=(v=E.contextType)&&r[v.__c],w=v?b?b.props.value:v.__:r,n.__c?p=(i=e.__c=n.__c).__=i.__E:(h?e.__c=i=new E($,w):(e.__c=i=new ut($,w),i.constructor=E,i.render=Ve),b&&b.sub(i),i.state||(i.state={}),i.__n=r,u=i.__d=!0,i.__h=[],i._sb=[]),h&&i.__s==null&&(i.__s=i.state),h&&E.getDerivedStateFromProps!=null&&(i.__s==i.state&&(i.__s=O({},i.__s)),O(i.__s,E.getDerivedStateFromProps($,i.__s))),f=i.props,_=i.state,i.__v=e,u)h&&E.getDerivedStateFromProps==null&&i.componentWillMount!=null&&i.componentWillMount(),h&&i.componentDidMount!=null&&i.__h.push(i.componentDidMount);else{if(h&&E.getDerivedStateFromProps==null&&$!==f&&i.componentWillReceiveProps!=null&&i.componentWillReceiveProps($,w),e.__v==n.__v||!i.__e&&i.shouldComponentUpdate!=null&&i.shouldComponentUpdate($,i.__s,w)===!1){e.__v!=n.__v&&(i.props=$,i.state=i.__s,i.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(R){R&&(R.__=e)}),ft.push.apply(i.__h,i._sb),i._sb=[],i.__h.length&&o.push(i);break t}i.componentWillUpdate!=null&&i.componentWillUpdate($,i.__s,w),h&&i.componentDidUpdate!=null&&i.__h.push(function(){i.componentDidUpdate(f,_,m)})}if(i.context=w,i.props=$,i.__P=t,i.__e=!1,F=k.__r,S=0,h)i.state=i.__s,i.__d=!1,F&&F(e),v=i.render(i.props,i.state,i.context),ft.push.apply(i.__h,i._sb),i._sb=[];else do i.__d=!1,F&&F(e),v=i.render(i.props,i.state,i.context),i.state=i.__s;while(i.__d&&++S<25);i.state=i.__s,i.getChildContext!=null&&(r=O(O({},r),i.getChildContext())),h&&!u&&i.getSnapshotBeforeUpdate!=null&&(m=i.getSnapshotBeforeUpdate(f,_)),x=v!=null&&v.type===gt&&v.key==null?be(v.props.children):v,l=$e(t,ht(x)?x:[x],e,n,r,s,a,o,l,d,c),i.base=e.__e,e.__u&=-161,i.__h.length&&o.push(i),p&&(i.__E=i.__=null)}catch(R){if(e.__v=null,d||a!=null)if(R.then){for(e.__u|=d?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;a[a.indexOf(l)]=null,e.__e=l}else{for(A=a.length;A--;)Jt(a[A]);Nt(e)}else e.__e=n.__e,e.__k=n.__k,R.then||Nt(e);k.__e(R,e,n)}else a==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):l=e.__e=qe(n.__e,e,n,r,s,a,o,d,c);return(v=k.diffed)&&v(e),128&e.__u?void 0:l}function Nt(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(Nt))}function ge(t,e,n){for(var r=0;r<n.length;r++)Ut(n[r],n[++r],n[++r]);k.__c&&k.__c(e,t),t.some(function(s){try{t=s.__h,s.__h=[],t.some(function(a){a.call(s)})}catch(a){k.__e(a,s.__v)}})}function be(t){return typeof t!="object"||t==null||t.__b>0?t:ht(t)?t.map(be):O({},t)}function qe(t,e,n,r,s,a,o,l,d){var c,v,i,u,f,_,m,p=n.props||vt,$=e.props,h=e.type;if(h=="svg"?s="http://www.w3.org/2000/svg":h=="math"?s="http://www.w3.org/1998/Math/MathML":s||(s="http://www.w3.org/1999/xhtml"),a!=null){for(c=0;c<a.length;c++)if((f=a[c])&&"setAttribute"in f==!!h&&(h?f.localName==h:f.nodeType==3)){t=f,a[c]=null;break}}if(t==null){if(h==null)return document.createTextNode($);t=document.createElementNS(s,h,$.is&&$),l&&(k.__m&&k.__m(e,a),l=!1),a=null}if(h==null)p===$||l&&t.data==$||(t.data=$);else{if(a=a&&$t.call(t.childNodes),!l&&a!=null)for(p={},c=0;c<t.attributes.length;c++)p[(f=t.attributes[c]).name]=f.value;for(c in p)f=p[c],c=="dangerouslySetInnerHTML"?i=f:c=="children"||c in $||c=="value"&&"defaultValue"in $||c=="checked"&&"defaultChecked"in $||lt(t,c,null,f,s);for(c in $)f=$[c],c=="children"?u=f:c=="dangerouslySetInnerHTML"?v=f:c=="value"?_=f:c=="checked"?m=f:l&&typeof f!="function"||p[c]===f||lt(t,c,f,p[c],s);if(v)l||i&&(v.__html==i.__html||v.__html==t.innerHTML)||(t.innerHTML=v.__html),e.__k=[];else if(i&&(t.innerHTML=""),$e(e.type=="template"?t.content:t,ht(u)?u:[u],e,n,r,h=="foreignObject"?"http://www.w3.org/1999/xhtml":s,a,o,a?a[0]:n.__k&&X(n,0),l,d),a!=null)for(c=a.length;c--;)Jt(a[c]);l||(c="value",h=="progress"&&_==null?t.removeAttribute("value"):_!=null&&(_!==t[c]||h=="progress"&&!_||h=="option"&&_!=p[c])&&lt(t,c,_,p[c],s),c="checked",m!=null&&m!=t[c]&&lt(t,c,m,p[c],s))}return t}function Ut(t,e,n){try{if(typeof t=="function"){var r=typeof t.__u=="function";r&&t.__u(),r&&e==null||(t.__u=t(e))}else t.current=e}catch(s){k.__e(s,n)}}function ye(t,e,n){var r,s;if(k.unmount&&k.unmount(t),(r=t.ref)&&(r.current&&r.current!=t.__e||Ut(r,null,e)),(r=t.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(a){k.__e(a,e)}r.base=r.__P=null}if(r=t.__k)for(s=0;s<r.length;s++)r[s]&&ye(r[s],e,n||typeof t.type!="function");n||Jt(t.__e),t.__c=t.__=t.__e=void 0}function Ve(t,e,n){return this.constructor(t,n)}function Ge(t,e,n){var r,s,a,o;e==document&&(e=document.documentElement),k.__&&k.__(t,e),s=(r=!1)?null:e.__k,a=[],o=[],Dt(e,t=e.__k=H(gt,null,[t]),s||vt,vt,e.namespaceURI,s?null:e.firstChild?$t.call(e.childNodes):null,a,s?s.__e:e.firstChild,r,o),ge(a,t,o)}function Qe(t){function e(n){var r,s;return this.getChildContext||(r=new Set,(s={})[e.__c]=this,this.getChildContext=function(){return s},this.componentWillUnmount=function(){r=null},this.shouldComponentUpdate=function(a){this.props.value!=a.value&&r.forEach(function(o){o.__e=!0,Mt(o)})},this.sub=function(a){r.add(a);var o=a.componentWillUnmount;a.componentWillUnmount=function(){r&&r.delete(a),o&&o.call(a)}}),n.children}return e.__c="__cC"+fe++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,r){return n.children(r)}).contextType=e,e}$t=ft.slice,k={__e:function(t,e,n,r){for(var s,a,o;e=e.__;)if((s=e.__c)&&!s.__)try{if((a=s.constructor)&&a.getDerivedStateFromError!=null&&(s.setState(a.getDerivedStateFromError(t)),o=s.__d),s.componentDidCatch!=null&&(s.componentDidCatch(t,r||{}),o=s.__d),o)return s.__E=s}catch(l){t=l}throw t}},ue=0,ut.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=O({},this.state),typeof t=="function"&&(t=t(O({},n),this.props)),t&&O(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),Mt(this))},ut.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Mt(this))},ut.prototype.render=gt,W=[],_e=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,pe=function(t,e){return t.__v.__b-e.__v.__b},mt.__r=0,Tt=Math.random().toString(8),ct="__d"+Tt,at="__a"+Tt,ve=/(PointerCapture)$|Capture$/i,Et=0,xt=Zt(!1),Lt=Zt(!0),fe=0;var Z,T,Ft,te,rt=0,we=[],L=k,ee=L.__b,ne=L.__r,ae=L.diffed,se=L.__c,re=L.unmount,oe=L.__;function bt(t,e){L.__h&&L.__h(T,t,rt||e),rt=0;var n=T.__H||(T.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function g(t){return rt=1,ze(ke,t)}function ze(t,e,n){var r=bt(Z++,2);if(r.t=t,!r.__c&&(r.__=[ke(void 0,e),function(l){var d=r.__N?r.__N[0]:r.__[0],c=r.t(d,l);d!==c&&(r.__N=[c,r.__[1]],r.__c.setState({}))}],r.__c=T,!T.__f)){var s=function(l,d,c){if(!r.__c.__H)return!0;var v=r.__c.__H.__.filter(function(u){return u.__c});if(v.every(function(u){return!u.__N}))return!a||a.call(this,l,d,c);var i=r.__c.props!==l;return v.some(function(u){if(u.__N){var f=u.__[0];u.__=u.__N,u.__N=void 0,f!==u.__[0]&&(i=!0)}}),a&&a.call(this,l,d,c)||i};T.__f=!0;var a=T.shouldComponentUpdate,o=T.componentWillUpdate;T.componentWillUpdate=function(l,d,c){if(this.__e){var v=a;a=void 0,s(l,d,c),a=v}o&&o.call(this,l,d,c)},T.shouldComponentUpdate=s}return r.__N||r.__}function I(t,e){var n=bt(Z++,3);!L.__s&&Ce(n.__H,e)&&(n.__=t,n.u=e,T.__H.__h.push(n))}function Ke(t){return rt=5,q(function(){return{current:t}},[])}function q(t,e){var n=bt(Z++,7);return Ce(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function P(t,e){return rt=8,q(function(){return t},e)}function Ye(t){var e=T.context[t.__c],n=bt(Z++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(T)),e.props.value):t.__}function Xe(){for(var t;t=we.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(_t),e.__h.some(jt),e.__h=[]}catch(n){e.__h=[],L.__e(n,t.__v)}}}L.__b=function(t){T=null,ee&&ee(t)},L.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),oe&&oe(t,e)},L.__r=function(t){ne&&ne(t),Z=0;var e=(T=t.__c).__H;e&&(Ft===T?(e.__h=[],T.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(_t),e.__h.some(jt),e.__h=[],Z=0)),Ft=T},L.diffed=function(t){ae&&ae(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(we.push(e)!==1&&te===L.requestAnimationFrame||((te=L.requestAnimationFrame)||Ze)(Xe)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),Ft=T=null},L.__c=function(t,e){e.some(function(n){try{n.__h.some(_t),n.__h=n.__h.filter(function(r){return!r.__||jt(r)})}catch(r){e.some(function(s){s.__h&&(s.__h=[])}),e=[],L.__e(r,n.__v)}}),se&&se(t,e)},L.unmount=function(t){re&&re(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(r){try{_t(r)}catch(s){e=s}}),n.__H=void 0,e&&L.__e(e,n.__v))};var ie=typeof requestAnimationFrame=="function";function Ze(t){var e,n=function(){clearTimeout(r),ie&&cancelAnimationFrame(e),setTimeout(t)},r=setTimeout(n,35);ie&&(e=requestAnimationFrame(n))}function _t(t){var e=T,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),T=e}function jt(t){var e=T;t.__c=t.__(),T=e}function Ce(t,e){return!t||t.length!==e.length||e.some(function(n,r){return n!==t[r]})}function ke(t,e){return typeof e=="function"?e(t):e}var Se=function(t,e,n,r){var s;e[0]=0;for(var a=1;a<e.length;a++){var o=e[a++],l=e[a]?(e[0]|=o?1:2,n[e[a++]]):e[++a];o===3?r[0]=l:o===4?r[1]=Object.assign(r[1]||{},l):o===5?(r[1]=r[1]||{})[e[++a]]=l:o===6?r[1][e[++a]]+=l+"":o?(s=t.apply(l,Se(t,l,n,["",null])),r.push(s),l[0]?e[0]|=2:(e[a-2]=0,e[a]=s)):r.push(l)}return r},le=new Map;function V(t){var e=le.get(this);return e||(e=new Map,le.set(this,e)),(e=Se(this,e.get(t)||(e.set(t,e=(function(n){for(var r,s,a=1,o="",l="",d=[0],c=function(u){a===1&&(u||(o=o.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,u,o):a===3&&(u||o)?(d.push(3,u,o),a=2):a===2&&o==="..."&&u?d.push(4,u,0):a===2&&o&&!u?d.push(5,0,!0,o):a>=5&&((o||!u&&a===5)&&(d.push(a,0,o,s),a=6),u&&(d.push(a,u,0,s),a=6)),o=""},v=0;v<n.length;v++){v&&(a===1&&c(),c(v));for(var i=0;i<n[v].length;i++)r=n[v][i],a===1?r==="<"?(c(),d=[d],a=3):o+=r:a===4?o==="--"&&r===">"?(a=1,o=""):o=r+o[0]:l?r===l?l="":o+=r:r==='"'||r==="'"?l=r:r===">"?(c(),a=1):a&&(r==="="?(a=5,s=o,o=""):r==="/"&&(a<5||n[v][i+1]===">")?(c(),a===3&&(d=d[0]),a=d,(d=d[0]).push(2,0,a),a=0):r===" "||r==="	"||r===`
`||r==="\r"?(c(),a=2):o+=r),a===3&&o==="!--"&&(a=4,d=d[0])}return c(),d})(t)),e),arguments,[])).length>1?e:e[0]}const tn=V.bind(H),At=Qe(null);function ce({base:t,children:e}){const n=o=>o.startsWith(t)?o.slice(t.length)||"/":o,[r,s]=g(()=>n(location.pathname));I(()=>{const o=()=>s(n(location.pathname));return window.addEventListener("popstate",o),()=>window.removeEventListener("popstate",o)},[]);const a=P(o=>{history.pushState(null,"",t+(o==="/"?"":o)),s(o)},[t]);return tn`<${At.Provider} value=${[r,a]}>${e}</${At.Provider}>`}function Ot(){return Ye(At)}function G(t){if(!t)return"—";const e=Math.floor(t/3600),n=Math.floor(t%3600/60);return e===0?`${n}m`:`${e}h${n>0?` ${n}m`:""}`}function Ht(t){if(!t)return"—";const e=new Date(t),n=new Date,r=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"};return e.toLocaleString(void 0,r)}function tt(t){if(!t)return"—";const e=new Date(t),n=new Date,r=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric"}:{month:"short",day:"numeric",year:"2-digit"};return e.toLocaleDateString(void 0,r)}function N(t){return"$"+t.toFixed(2)}function yt(t){return t==null?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function It(t){return t?t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${Math.round(t)} g`:"0 g"}const Q=V.bind(H),en={finish:"badge badge-finish",running:"badge badge-running",failed:"badge badge-failed",cancel:"badge badge-cancel",pause:"badge badge-pause"};function wt({status:t}){const e=(t||"").toLowerCase();return Q`<span class=${en[e]||"badge badge-default"}>${e||"unknown"}</span>`}function Rt({url:t}){const[e,n]=g(!1);return!t||e?Q`<div class="row-thumb-ph">🖨</div>`:Q`<img class="row-thumb" src=${t} alt="" loading="lazy" onError=${()=>n(!0)} />`}function nn({url:t,className:e}){const[n,r]=g(!1);return!t||n?Q`<div class="cover-placeholder">🖨</div>`:Q`<img class=${e} src=${t} alt="" loading="lazy" onError=${()=>r(!0)} />`}function Wt({colors:t}){if(!(t!=null&&t.length))return null;const e=[...new Set(t.map(n=>n.slice(0,6).toUpperCase()))].filter(n=>n!=="FFFFFF");return e.length?Q`<span class="swatches">${e.map(n=>Q`<span class="swatch" style=${"background:#"+n} title=${"#"+n} />`)}</span>`:null}const j=V.bind(H);function an({summary:t,dataRange:e}){const[n,r]=Ot(),s=t==null?void 0:t.totals;return j`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>bambu history</span></h1>
        ${(e==null?void 0:e.min_start)&&(e==null?void 0:e.max_start)&&j`
          <div class="header-range">
            History: ${tt(e.min_start)} → ${tt(e.max_start)}
            (${(e.task_count||0).toLocaleString()} tasks)
          </div>
        `}
        <nav class="top-nav">
          <button
            class=${"nav-btn"+(!n.startsWith("/projects")&&!n.startsWith("/admin")?" active":"")}
            onClick=${()=>r("/")}
          >
            Jobs
          </button>
          <button
            class=${"nav-btn"+(n.startsWith("/projects")?" active":"")}
            onClick=${()=>r("/projects")}
          >
            Projects
          </button>
          <button
            class=${"nav-btn"+(n.startsWith("/admin")?" active":"")}
            onClick=${()=>r("/admin")}
          >
            Rates
          </button>
        </nav>
      </div>
      <div class="stats">
        <div class="stat">
          <div class="stat-val">${s?s.total_jobs.toLocaleString():"—"}</div>
          <div class="stat-lbl">Total Jobs</div>
        </div>
        <div class="stat">
          <div class="stat-val">${s?(s.total_weight_g/1e3).toFixed(2):"—"}</div>
          <div class="stat-lbl">Filament kg</div>
        </div>
        <div class="stat">
          <div class="stat-val">${s?(s.total_time_s/3600).toFixed(1):"—"}</div>
          <div class="stat-lbl">Print Hours</div>
        </div>
        <div class="stat">
          <div class="stat-val">${s?s.total_plates.toLocaleString():"—"}</div>
          <div class="stat-lbl">Plates</div>
        </div>
      </div>
    </header>
  `}function sn({q:t,setQ:e,statusFilter:n,setStatusFilter:r,deviceFilter:s,setDeviceFilter:a,devices:o,view:l,setView:d,filteredCount:c,totalCount:v}){const i=q(()=>{const u=new URLSearchParams;n&&u.set("status",n),s&&u.set("device",s);const f=u.toString();return"/jobs/export.csv"+(f?"?"+f:"")},[n,s]);return j`
    <div class="toolbar">
      <input
        type="search"
        placeholder="Search title or customer…"
        value=${t}
        onInput=${u=>e(u.target.value)}
      />
      <select value=${n} onChange=${u=>r(u.target.value)}>
        <option value="">All Statuses</option>
        <option value="finish">Finished</option>
        <option value="cancel">Cancelled</option>
        <option value="running">Running</option>
        <option value="failed">Failed</option>
        <option value="pause">Paused</option>
      </select>
      <select value=${s} onChange=${u=>a(u.target.value)}>
        <option value="">All Printers</option>
        ${o.map(u=>j`<option key=${u} value=${u}>${u}</option>`)}
      </select>
      <div class="view-toggle">
        <button
          class=${"view-btn"+(l==="table"?" active":"")}
          onClick=${()=>d("table")}
        >
          ☰ Table
        </button>
        <button
          class=${"view-btn"+(l==="grid"?" active":"")}
          onClick=${()=>d("grid")}
        >
          ⊞ Grid
        </button>
      </div>
      <div class="toolbar-right">
        <a class="btn-csv" href=${i} download>↓ CSV</a>
        <span class="job-count">${c} / ${v} jobs</span>
      </div>
    </div>
  `}function rn({filtered:t,isFiltered:e}){if(!e||!t.length)return null;const n=t.reduce((s,a)=>s+(a.total_weight_g||0),0),r=t.reduce((s,a)=>s+(a.total_time_s||0),0);return j`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${t.length}</strong></span>
      <span>Filament: <strong>${It(n)}</strong></span>
      <span>Print time: <strong>${G(r)}</strong></span>
    </div>
  `}const on=[{col:"designTitle",label:"Title",cls:"sortable td-title"},{col:"deviceModel",label:"Printer",cls:"sortable"},{col:"startTime",label:"Date",cls:"sortable"},{col:null,label:"Status",cls:""},{col:"total_weight_g",label:"Filament",cls:"sortable td-num"},{col:"total_time_s",label:"Time",cls:"sortable td-num"},{col:"final_price",label:"Price",cls:"sortable td-num"},{col:null,label:"Plates",cls:"td-num"},{col:null,label:"Customer",cls:""}];function ln({job:t,onJobClick:e}){return j`
    <tr onClick=${()=>e(t)}>
      <td class="td-thumb"><${Rt} url=${t.cover_url} /></td>
      <td class="td-title">
        <span class="row-title" title=${t.designTitle||"Untitled"}>
          ${t.designTitle||"Untitled Job"}
        </span>
        ${t.print_run>1&&j`<span class="run-badge">Run ${t.print_run}</span>`}
        <${Wt} colors=${t.filament_colors} />
      </td>
      <td>${t.deviceModel||"—"}</td>
      <td title=${Ht(t.startTime)}>${tt(t.startTime)}</td>
      <td><${wt} status=${t.status} /></td>
      <td class="td-num"><strong>${yt(t.total_weight_g)}</strong></td>
      <td class="td-num">${G(t.total_time_s)}</td>
      <td class="td-num">
        ${t.final_price!=null?j`<strong>${N(t.final_price)}</strong>`:"—"}
      </td>
      <td class="td-num">${t.plate_count??"—"}</td>
      <td>${t.customer&&j`<span class="customer-pill">${t.customer}</span>`}</td>
    </tr>
  `}function cn({sorted:t,sortCol:e,sortDir:n,onSort:r,onJobClick:s}){return j`
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="td-thumb"></th>
            ${on.map(({col:a,label:o,cls:l})=>{const c=[l,a&&a===e?`sort-${n}`:""].filter(Boolean).join(" ");return j`
                <th
                  key=${o}
                  class=${c||void 0}
                  onClick=${a?()=>r(a):void 0}
                >
                  ${o}
                </th>
              `})}
          </tr>
        </thead>
        <tbody>
          ${t.map(a=>j`<${ln} key=${a.id} job=${a} onJobClick=${s} />`)}
        </tbody>
      </table>
    </div>
  `}function dn({job:t,onJobClick:e}){return j`
    <div class="card" onClick=${()=>e(t)}>
      <${nn} url=${t.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${t.designTitle||"Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${t.deviceModel||"—"}</span>
          <span>📅 ${tt(t.startTime)}</span>
          <span>⏱ ${G(t.total_time_s)}</span>
          <span>🧵 ${yt(t.total_weight_g)}</span>
          ${t.final_price!=null&&j`<span>💰 ${N(t.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${wt} status=${t.status} />
          ${t.print_run>1&&j`<span class="run-badge">Run ${t.print_run}</span>`}
          ${t.customer&&j`<span class="customer-pill">${t.customer}</span>`}
          <${Wt} colors=${t.filament_colors} />
        </div>
      </div>
    </div>
  `}function un({sorted:t,onJobClick:e}){return j`
    <div class="grid-view">
      ${t.map(n=>j`<${dn} key=${n.id} job=${n} onJobClick=${e} />`)}
    </div>
  `}function Bt(t){I(()=>{const e=n=>{n.key==="Escape"&&t()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[t])}const de=V.bind(H);let Pe=()=>{};function Y(t,e="info"){Pe({message:t,type:e,id:Date.now()+Math.random()})}function _n(){const[t,e]=g([]),n=Ke(new Map);Pe=P(s=>{e(o=>[...o,s]);const a=setTimeout(()=>{e(o=>o.filter(l=>l.id!==s.id)),n.current.delete(s.id)},3500);n.current.set(s.id,a)},[]);const r=P(s=>{clearTimeout(n.current.get(s)),n.current.delete(s),e(a=>a.filter(o=>o.id!==s))},[]);return t.length?de`
    <div class="toast-container">
      ${t.map(s=>de`
        <div class="toast toast-${s.type}" key=${s.id} onClick=${()=>r(s.id)}>
          ${s.message}
        </div>
      `)}
    </div>
  `:null}const pn=15e3,vn=2e4,fn=5;async function mn(t,e){try{return(await t.json()).error||e}catch{return e}}function $n(t){return{signal:AbortSignal.timeout(pn),...t}}function hn(t,e){return(t==null?void 0:t.name)==="TimeoutError"?new Error(`${e} (request timed out)`):new Error(`${e} (network error)`)}async function st(t,e,n){let r;try{r=await fetch(t,$n(n))}catch(s){throw hn(s,e)}if(!r.ok)throw new Error(await mn(r,e));return r.json()}async function qt(t,e,n){try{return{data:await st(t,e,n),error:null}}catch(r){return{data:null,error:r instanceof Error?r:new Error(e)}}}async function Ct(t,e,n){const{data:r,error:s}=await qt(t,e,n);return s?(Y(s.message||e,"error"),null):r}async function pt(t,e,n){return Ct(t,n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}async function Te(t,e,n){return Ct(t,n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}const D=V.bind(H);function gn({jobId:t}){const[e,n]=g(null);if(I(()=>{let a=!0;return n(null),qt(`/jobs/${t}/price`,"Pricing not configured").then(({data:o})=>{a&&n(o??!1)}).catch(()=>{a&&n(!1)}),()=>{a=!1}},[t]),e===null)return D`<div class="pricing-row pricing-loading">Loading price…</div>`;if(e===!1)return D`<div class="pricing-row pricing-na">Pricing not configured</div>`;const r=e.final_price-e.base_price,s=e.base_price>0?Math.round(r/e.base_price*100):0;return D`
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Material</span><span>${N(e.material_cost)}</span>
      </div>
      <div class="pricing-row">
        <span>Machine</span><span>${N(e.machine_cost)}</span>
      </div>
      <div class="pricing-row"><span>Labor</span><span>${N(e.labor_cost)}</span></div>
      ${e.extra_labor_cost>0&&D`
        <div class="pricing-row pricing-extra-labor">
          <span>Extra labor</span><span>${N(e.extra_labor_cost)}</span>
        </div>
      `}
      <div class="pricing-divider"></div>
      <div class="pricing-row pricing-base">
        <span>Base</span><span>${N(e.base_price)}</span>
      </div>
      ${r!==0&&D`
        <div class="pricing-row pricing-markup">
          <span>Markup</span>
          <span
            >${r>0?"+":""}${N(r)}
            (${s>0?"+":""}${s}%)</span
          >
        </div>
      `}
      <div class="pricing-row pricing-final">
        <span
          >Final${e.is_override?D`<span class="override-tag">override</span>`:""}</span
        >
        <span>${N(e.final_price)}</span>
      </div>
    </div>
  `}const bn=["finish","failed","cancel","running","pause"];function yn({job:t,onClose:e,onPatch:n,projects:r,onJobProjectChange:s,onJobStatusChange:a,onJobExtraLaborChange:o,onNavigateToProject:l}){const[d,c]=g(t.customer??""),[v,i]=g(t.notes??""),[u,f]=g(t.price_override!=null?String(t.price_override):"");Bt(e);const _=P(p=>{const $=p.target.value;s(t.id,$===""?null:Number($))},[t.id,s]),m=P(p=>{const $=p.target.value;a(t.id,$===""?null:$)},[t.id,a]);return D`
    <div class="overlay" onClick=${p=>p.target===p.currentTarget&&e()}>
      <div class="modal">
        <div class="modal-header">
          <h2>${t.designTitle||"Untitled Job"}</h2>
          <button class="modal-close" onClick=${e}>✕</button>
        </div>
        ${t.cover_url&&D`<img class="modal-img" src=${t.cover_url} alt="" />`}
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Status</label>
              <div class="detail-val">
                <${wt} status=${t.status} />
                ${t.status_override&&D`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item">
              <label>Printer</label>
              <div class="detail-val">${t.deviceModel||"—"}</div>
            </div>
            <div class="detail-item">
              <label>Started</label>
              <div class="detail-val">${Ht(t.startTime)}</div>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <div class="detail-val">${G(t.total_time_s)}</div>
            </div>
            <div class="detail-item">
              <label>Filament</label>
              <div class="detail-val">
                ${yt(t.total_weight_g)}
                <${Wt} colors=${t.filament_colors} />
              </div>
            </div>
            <div class="detail-item">
              <label>Plates</label>
              <div class="detail-val">${t.plate_count??"—"}</div>
            </div>
            <div class="detail-item">
              <label>Print Run</label>
              <div class="detail-val">
                ${t.print_run>1?`Run #${t.print_run} of this design`:"1st print of this design"}
              </div>
            </div>
          </div>
          <${gn} jobId=${t.id} key=${t.id+"-"+t.extra_labor_minutes} />
          <div class="modal-project-row">
            <label class="modal-project-label">Customer</label>
            <input
              class="modal-project-select"
              type="text"
              placeholder="—"
              value=${d}
              onInput=${p=>c(p.target.value)}
              onBlur=${()=>n(t.id,{customer:d.trim()||null})}
              onKeyDown=${p=>p.key==="Enter"&&p.target.blur()}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Notes</label>
            <textarea
              class="modal-project-select modal-notes"
              placeholder="—"
              value=${v}
              onInput=${p=>i(p.target.value)}
              onBlur=${()=>n(t.id,{notes:v.trim()||null})}
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
              value=${u}
              onInput=${p=>f(p.target.value)}
              onBlur=${()=>{const p=u===""?null:Number(u);n(t.id,{price_override:p})}}
              onKeyDown=${p=>p.key==="Enter"&&p.target.blur()}
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
              value=${t.extra_labor_minutes??""}
              onChange=${p=>{const $=p.target.value===""?null:Number(p.target.value);o(t.id,$)}}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Status override</label>
            <select
              class="modal-project-select"
              value=${t.status_override??""}
              onChange=${m}
            >
              <option value="">Auto (from printer)</option>
              ${bn.map(p=>D`<option key=${p} value=${p}>${p}</option>`)}
            </select>
          </div>
          ${r&&D`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select
                class="modal-project-select"
                value=${t.project_id??""}
                onChange=${_}
              >
                <option value="">— None —</option>
                ${r.map(p=>D`<option key=${p.id} value=${p.id}>${p.name}</option>`)}
              </select>
              ${t.project_id!=null&&D`
                <button
                  class="btn-link"
                  onClick=${()=>{e(),l(t.project_id)}}
                >
                  View →
                </button>
              `}
            </div>
          `}
        </div>
      </div>
    </div>
  `}const y=V.bind(H);function wn({onClose:t,onCreate:e}){const[n,r]=g(""),[s,a]=g(""),[o,l]=g(""),[d,c]=g(!1);Bt(t);const v=P(async i=>{if(i.preventDefault(),!!n.trim()){c(!0);try{const u=await Te("/projects",{name:n.trim(),customer:s||null,notes:o||null},"Failed to create project.");if(!(u!=null&&u.project))return;e(u.project),t()}finally{c(!1)}}},[n,s,o,e,t]);return y`
    <div class="overlay" onClick=${i=>i.target===i.currentTarget&&t()}>
      <div class="modal">
        <div class="modal-header">
          <h2>New Project</h2>
          <button class="modal-close" onClick=${t}>✕</button>
        </div>
        <div class="modal-body">
          <form class="project-form" onSubmit=${v}>
            <label class="form-label"
              >Name *
              <input
                class="form-input"
                type="text"
                value=${n}
                onInput=${i=>r(i.target.value)}
                placeholder="Project name"
                required
              />
            </label>
            <label class="form-label"
              >Customer
              <input
                class="form-input"
                type="text"
                value=${s}
                onInput=${i=>a(i.target.value)}
                placeholder="Optional"
              />
            </label>
            <label class="form-label"
              >Notes
              <textarea
                class="form-input form-textarea"
                value=${o}
                onInput=${i=>l(i.target.value)}
                placeholder="Optional"
              />
            </label>
            <div class="form-actions">
              <button type="button" class="btn-secondary" onClick=${t}>Cancel</button>
              <button type="submit" class="btn-primary" disabled=${d||!n.trim()}>
                ${d?"Creating…":"Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `}function Cn({project:t,totalPrice:e,onClick:n}){const r=t.total_weight_g,s=t.total_time_s;return y`
    <div class="proj-card" onClick=${n}>
      ${t.cover_url?y`<img class="proj-card-cover" src=${t.cover_url} alt="" />`:y`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-name">${t.name}</div>
      <div class="proj-card-meta">
        ${t.customer&&y`<span class="customer-pill">${t.customer}</span>`}
      </div>
      <div class="proj-card-stats">
        <span><strong>${t.job_count}</strong> job${t.job_count!==1?"s":""}</span>
        ${r!=null&&y`<span>${It(r)}</span>`}
        ${s!=null&&y`<span>${G(s)}</span>`}
        ${e!=null&&y`<span class="proj-card-price">${N(e)}</span>`}
      </div>
      ${t.notes&&y`<div class="proj-card-notes">${t.notes}</div>`}
    </div>
  `}function kn({unassignedJobs:t,onClose:e,onAdd:n}){const[r,s]=g("");Bt(e);const a=q(()=>{if(!r)return t;const o=r.toLowerCase();return t.filter(l=>((l.designTitle||"")+" "+(l.customer||"")).toLowerCase().includes(o))},[t,r]);return y`
    <div class="overlay" onClick=${o=>o.target===o.currentTarget&&e()}>
      <div class="modal">
        <div class="modal-header">
          <h2>Add Jobs to Project</h2>
          <button class="modal-close" onClick=${e}>✕</button>
        </div>
        <div class="modal-body">
          <input
            type="search"
            class="add-jobs-search"
            placeholder="Search…"
            value=${r}
            onInput=${o=>s(o.target.value)}
          />
          ${a.length===0?y`<div class="empty" style="padding:16px 0">
                ${r?"No matches.":"All jobs are already assigned to projects."}
              </div>`:y`<div class="add-jobs-list">
                ${a.map(o=>y`
                    <div class="add-jobs-row" key=${o.id} onClick=${()=>n(o.id)}>
                      <${Rt} url=${o.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${o.designTitle||"Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${tt(o.startTime)} · ${o.deviceModel||"—"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `)}
              </div>`}
        </div>
      </div>
    </div>
  `}function Sn({project:t,jobs:e,unassignedJobs:n,onBack:r,onJobClick:s,onAddJob:a,onRemoveJob:o}){const[l,d]=g(!1),[c,v]=g(null),i=e.reduce((_,m)=>_+(m.total_weight_g||0),0),u=e.reduce((_,m)=>_+(m.total_time_s||0),0);I(()=>{v(null),e.length&&Ct(`/projects/${t.id}/price`,"Failed to load project price.").then(_=>{_&&v(_)})},[t.id,e.length]);const f=P(_=>{a(_)},[a]);return y`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${r}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${t.name}</h2>
          ${t.customer&&y`<span class="customer-pill">${t.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${()=>d(!0)}>+ Add Jobs</button>
      </div>
      ${t.notes&&y`<div class="proj-detail-notes">${t.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Jobs: <strong>${e.length}</strong></span>
        <span>Filament: <strong>${It(i)}</strong></span>
        <span>Print time: <strong>${G(u)}</strong></span>
        ${c&&y`
          <span>Material: <strong>${N(c.material_cost)}</strong></span>
          <span>Machine: <strong>${N(c.machine_cost)}</strong></span>
          <span>Labor: <strong>${N(c.labor_cost)}</strong></span>
          ${c.extra_labor_cost>0&&y`<span>Extra labor: <strong>${N(c.extra_labor_cost)}</strong></span>`}
          <span class="totals-total"
            >Total: <strong>${N(c.final_price)}</strong></span
          >
        `}
      </div>
      ${e.length===0?y`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`:y`
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
                  ${e.map(_=>y`
                      <tr key=${_.id} onClick=${()=>s(_)}>
                        <td class="td-thumb"><${Rt} url=${_.cover_url} /></td>
                        <td class="td-title">
                          <span class="row-title">${_.designTitle||"Untitled Job"}</span>
                        </td>
                        <td>${_.deviceModel||"—"}</td>
                        <td title=${Ht(_.startTime)}>${tt(_.startTime)}</td>
                        <td><${wt} status=${_.status} /></td>
                        <td class="td-num"><strong>${yt(_.total_weight_g)}</strong></td>
                        <td class="td-num">${G(_.total_time_s)}</td>
                        <td class="td-num">
                          ${_.final_price!=null?y`<strong>${N(_.final_price)}</strong>`:"—"}
                        </td>
                        <td>
                          <button
                            class="btn-remove-job"
                            title="Remove from project"
                            onClick=${m=>{m.stopPropagation(),o(_.id)}}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    `)}
                </tbody>
              </table>
            </div>
          `}
      ${l&&y`<${kn}
        unassignedJobs=${n}
        onClose=${()=>d(!1)}
        onAdd=${f}
      />`}
    </div>
  `}function Pn({projects:t,setProjects:e,onAutoGroup:n,projectPrices:r,loading:s=!1}){const[a,o]=g(!1),[l,d]=g(!1),[c,v]=g(""),[,i]=Ot(),u=P(async()=>{d(!0);try{const m=await Te("/projects/auto-group",{},"Auto-group failed.");if(!m)return;const{projects_created:p,jobs_assigned:$}=m;await n(),p===0?Y("No ungrouped jobs found — everything is already assigned to a project.","info"):Y(`Created ${p} project${p!==1?"s":""}, assigned ${$} job${$!==1?"s":""}.`,"success")}finally{d(!1)}},[n]),f=P(m=>{e(p=>[m,...p]),i(`/projects/${m.id}`)},[e,i]),_=q(()=>{if(!c)return t;const m=c.toLowerCase();return t.filter(p=>[p.name,p.customer,p.notes].filter(Boolean).join(" ").toLowerCase().includes(m))},[t,c]);return y`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${c}
        onInput=${m=>v(m.target.value)}
      />
      <span class="proj-list-count">
        ${c?`${_.length} of ${t.length}`:t.length}
        ${" "}project${t.length!==1?"s":""}
      </span>
      <button class="btn-secondary" onClick=${u} disabled=${l}>
        ${l?"Grouping…":"⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${()=>o(!0)}>+ New Project</button>
    </div>
    ${s?y`<div class="empty">Loading projects…</div>`:_.length===0?y`<div class="empty">
            ${c?"No projects match your search.":"No projects yet. Create one to group related jobs together."}
          </div>`:y`
            <div class="proj-grid">
              ${_.map(m=>y`<${Cn}
                    key=${m.id}
                    project=${m}
                    totalPrice=${r[m.id]??null}
                    onClick=${()=>i(`/projects/${m.id}`)}
                  />`)}
            </div>
          `}
    ${a&&y`<${wn} onClose=${()=>o(!1)} onCreate=${f} />`}
  `}const B=V.bind(H);function U({label:t,value:e,onChange:n,step:r="0.01",min:s="0"}){return B`
    <label class="form-label">
      ${t}
      <input
        type="number"
        class="form-input"
        step=${r}
        min=${s}
        value=${e}
        onInput=${a=>n(Number(a.target.value))}
      />
    </label>
  `}function Tn({labor:t,saving:e,saved:n,onSave:r}){const[s,a]=g(t);return I(()=>a(t),[t]),B`
    <div class="admin-card">
      <div class="admin-card-fields">
        <${U}
          label="Hourly rate ($)"
          value=${s.hourly_rate}
          step="0.5"
          onChange=${o=>a(l=>({...l,hourly_rate:o}))}
        />
        <${U}
          label="Minimum minutes"
          value=${s.minimum_minutes}
          step="1"
          onChange=${o=>a(l=>({...l,minimum_minutes:o}))}
        />
        <${U}
          label="Profit markup (%)"
          value=${Math.round(s.profit_markup_pct*100)}
          step="1"
          onChange=${o=>a(l=>({...l,profit_markup_pct:o/100}))}
        />
        <${U}
          label="Failure buffer (%)"
          value=${Math.round(s.failure_buffer_pct*100)}
          step="1"
          onChange=${o=>a(l=>({...l,failure_buffer_pct:o/100}))}
        />
        <${U}
          label="Overhead buffer (%)"
          value=${Math.round(s.overhead_buffer_pct*100)}
          step="1"
          onChange=${o=>a(l=>({...l,overhead_buffer_pct:o/100}))}
        />
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived"
          >→ Min charge: ${N(Math.max(s.minimum_minutes,0)/60*s.hourly_rate)}</span
        >
        <button class="btn-primary" onClick=${()=>r(s)} disabled=${e}>
          ${e?"Saving…":n?"✓ Saved":"Save"}
        </button>
      </div>
    </div>
  `}function Fn({machine:t,saving:e,saved:n,onSave:r}){const[s,a]=g(t);I(()=>a(t),[t]);const o=s.purchase_price/s.lifetime_hrs+s.electricity_rate+s.maintenance_buffer;return B`
    <div class="admin-card">
      <div class="admin-card-name">${s.device_model}</div>
      <div class="admin-card-fields">
        <${U}
          label="Purchase price ($)"
          value=${s.purchase_price}
          step="1"
          onChange=${l=>a(d=>({...d,purchase_price:l}))}
        />
        <${U}
          label="Lifetime hours"
          value=${s.lifetime_hrs}
          step="100"
          onChange=${l=>a(d=>({...d,lifetime_hrs:l}))}
        />
        <${U}
          label="Electricity ($/hr)"
          value=${s.electricity_rate}
          step="0.01"
          onChange=${l=>a(d=>({...d,electricity_rate:l}))}
        />
        <${U}
          label="Maintenance ($/hr)"
          value=${s.maintenance_buffer}
          step="0.01"
          onChange=${l=>a(d=>({...d,maintenance_buffer:l}))}
        />
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived">→ ${N(o)}/hr</span>
        <button class="btn-primary" onClick=${()=>r(s)} disabled=${e}>
          ${e?"Saving…":n?"✓ Saved":"Save"}
        </button>
      </div>
    </div>
  `}function xn({material:t,saving:e,saved:n,onSave:r}){const[s,a]=g(t);I(()=>a(t),[t]);const o=s.cost_per_g*(1+s.waste_buffer_pct);return B`
    <div class="admin-card">
      <div class="admin-card-name">${s.filament_type}</div>
      <div class="admin-card-fields">
        <${U}
          label="Cost per gram ($/g)"
          value=${s.cost_per_g}
          step="0.001"
          onChange=${l=>a(d=>({...d,cost_per_g:l}))}
        />
        <${U}
          label="Waste buffer fraction"
          value=${s.waste_buffer_pct}
          step="0.01"
          onChange=${l=>a(d=>({...d,waste_buffer_pct:l}))}
        />
        <p class="form-help">Stored as a fraction: 0.10 = 10% waste.</p>
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived">→ ${(o*1e3).toFixed(2)}¢/g effective</span>
        <button class="btn-primary" onClick=${()=>r(s)} disabled=${e}>
          ${e?"Saving…":n?"✓ Saved":"Save"}
        </button>
      </div>
    </div>
  `}function Ln({onRatesChanged:t=()=>{}}){const[e,n]=g(null),[r,s]=g(""),[a,o]=g("");I(()=>{Ct("/rates","Failed to load rates.").then(_=>{_&&n(_)})},[]);const l=_=>{o(_),setTimeout(()=>o(""),2e3)},d=async _=>{s("labor");try{const m=await pt("/rates/labor",_,"Failed to save labor rates.");if(!(m!=null&&m.labor_config))return;n(p=>({...p,labor_config:m.labor_config})),l("labor"),t()}finally{s("")}},c=async _=>{s(_.device_model);const{device_model:m,purchase_price:p,lifetime_hrs:$,electricity_rate:h,maintenance_buffer:b}=_;try{const w=await pt(`/rates/machines/${encodeURIComponent(m)}`,{purchase_price:p,lifetime_hrs:$,electricity_rate:h,maintenance_buffer:b},"Failed to save machine rate.");if(!(w!=null&&w.machine_rate))return;n(F=>({...F,machine_rates:F.machine_rates.map(S=>S.device_model===m?w.machine_rate:S)})),l(m),t()}finally{s("")}},v=async _=>{s(_.filament_type);const{filament_type:m,cost_per_g:p,waste_buffer_pct:$}=_;try{const h=await pt(`/rates/materials/${encodeURIComponent(m)}`,{cost_per_g:p,waste_buffer_pct:$},"Failed to save material rate.");if(!(h!=null&&h.material_rate))return;n(b=>({...b,material_rates:b.material_rates.map(w=>w.filament_type===m?h.material_rate:w)})),l(m),t()}finally{s("")}};if(!e)return B`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;const{labor_config:i,machine_rates:u,material_rates:f}=e;return B`
    <div class="admin-page">
      <h2 class="admin-title">Rates &amp; Pricing</h2>

      <section class="admin-section">
        <h3 class="admin-section-title">Labor</h3>
        <p class="admin-section-desc">
          Applied once per job (or once per project for project pricing).
        </p>
        <${Tn}
          labor=${i}
          saving=${r==="labor"}
          saved=${a==="labor"}
          onSave=${d}
        />
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Machine Rates</h3>
        <p class="admin-section-desc">
          Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷
          lifetime + electricity + maintenance.
        </p>
        ${u.map(_=>B`
            <${Fn}
              key=${_.device_model}
              machine=${_}
              saving=${r===_.device_model}
              saved=${a===_.device_model}
              onSave=${c}
            />
          `)}
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Material Rates</h3>
        <p class="admin-section-desc">
          Cost per gram including waste. Rate = cost × (1 + waste fraction).
        </p>
        ${f.map(_=>B`
            <${xn}
              key=${_.filament_type}
              material=${_}
              saving=${r===_.filament_type}
              saved=${a===_.filament_type}
              onSave=${v}
            />
          `)}
      </section>
    </div>
  `}function Mn({setJobs:t,setProjects:e,setProjectPrices:n,setSummary:r,setDataRange:s,toast:a}){const[o,l]=g(!0),[d,c]=g(!0),[v,i]=g(0),[u,f]=g(null),[_,m]=g("Starting dashboard…"),p=P(async({url:b,fallback:w,onData:F,onFinally:S})=>{const{data:x,error:A}=await qt(b,w);A&&a(A.message||w,"error"),x&&F(x),S&&S()},[a]),$=P(()=>{p({url:"/projects",fallback:"Failed to load projects.",onData:b=>(b==null?void 0:b.projects)&&e(b.projects),onFinally:()=>c(!1)}),p({url:"/projects/prices",fallback:"Failed to load project prices.",onData:b=>(b==null?void 0:b.prices)&&n(b.prices)})},[p,e,n]),h=P((b=!1)=>{p({url:"/jobs/prices",fallback:b?"Failed to refresh job prices.":"Failed to load job prices.",onData:F=>{F!=null&&F.prices&&t(S=>S.map(x=>({...x,final_price:F.prices[x.id]??(b?x.final_price:null)??null})))}})},[p,t]);return I(()=>{const b=()=>i(S=>Math.min(100,S+100/fn)),w=(S,x)=>(m(`Loading ${S}…`),st(S,x).catch(A=>{throw console.error(`[boot] ${S} failed`,A),A}).finally(b)),F=setTimeout(()=>{f("Dashboard load timed out. Check console/network for the failing request."),l(!1),c(!1)},vn);return Promise.all([w("/ui/data","Failed to load jobs."),w("/summary","Failed to load summary."),w("/health/data-range","Failed to load print history range.")]).then(([S,x,A])=>{t(S.jobs),r(x),s(A),l(!1),m("Loading optional data…"),h(!1),$()}).catch(S=>{f(S.message),l(!1),c(!1)}).finally(()=>clearTimeout(F)),()=>clearTimeout(F)},[t,r,s,h,$]),{loading:o,projectsLoading:d,loadProgress:v,error:u,bootStatus:_,refreshProjectsAndPrices:$,refreshJobPrices:h}}const M=V.bind(H);function Nn(t,e,n,r){return t.filter(s=>{const a=((s.designTitle||"")+" "+(s.customer||"")).toLowerCase();return!(e&&!a.includes(e.toLowerCase())||n&&(s.status||"").toLowerCase()!==n||r&&s.deviceModel!==r)})}function jn(t,e,n){return[...t].sort((r,s)=>{let a=r[e],o=s[e];return a==null&&(a=n==="asc"?1/0:-1/0),o==null&&(o=n==="asc"?1/0:-1/0),typeof a=="string"?n==="asc"?a.localeCompare(o):o.localeCompare(a):n==="asc"?a-o:o-a})}function An({bootStatus:t,loadProgress:e}){return M` <div class="in-app-loading" role="status" aria-live="polite">
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
        <p class="dashboard-loader-copy-text">${t}</p>
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
          aria-valuenow=${Math.round(e)}
        >
          <span style=${`width:${Math.max(8,e)}%`}></span>
        </div>
      </div>
      <div class="dashboard-loader-preview" aria-hidden="true">
        <div class="dashboard-loader-stat"><span></span><strong></strong></div>
        <div class="dashboard-loader-stat"><span></span><strong></strong></div>
        <div class="dashboard-loader-table">
          ${Array.from({length:5},(n,r)=>M`
              <div class="dashboard-loader-row" key=${r}>
                <span></span><span></span><span></span><span></span>
              </div>
            `)}
        </div>
      </div>
    </section>
  </div>`}function En({error:t}){return M`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${t}</p>
      </div>
    </div>
  </div>`}function Jn({projectId:t,projects:e,jobs:n,projectsLoading:r,navigate:s,setSelectedJob:a,handleJobProjectChange:o}){const l=e.find(v=>v.id===t),d=n.filter(v=>v.project_id===t);if(!l)return r?M`<div class="empty">Loading projects…</div>`:M`<div class="empty">Project not found.</div>`;const c=n.filter(v=>v.project_id==null);return M`<${Sn}
    project=${l}
    jobs=${d}
    unassignedJobs=${c}
    onBack=${()=>s("/projects")}
    onJobClick=${a}
    onAddJob=${v=>o(v,t)}
    onRemoveJob=${v=>o(v,null)}
  />`}function Dn({q:t,setQ:e,statusFilter:n,setStatusFilter:r,deviceFilter:s,setDeviceFilter:a,devices:o,view:l,setView:d,filtered:c,jobs:v,isFiltered:i,sorted:u,sortCol:f,sortDir:_,onSort:m,onJobClick:p}){return M`
    <${sn}
      q=${t}
      setQ=${e}
      statusFilter=${n}
      setStatusFilter=${r}
      deviceFilter=${s}
      setDeviceFilter=${a}
      devices=${o}
      view=${l}
      setView=${d}
      filteredCount=${c.length}
      totalCount=${v.length}
    />
    <${rn} filtered=${c} isFiltered=${i} />
    ${u.length===0?M`<div class="empty">No jobs match your filters.</div>`:l==="table"?M`<${cn}
            sorted=${u}
            sortCol=${f}
            sortDir=${_}
            onSort=${m}
            onJobClick=${p}
          />`:M`<${un} sorted=${u} onJobClick=${p} />`}
  `}function Un(){const[t,e]=g([]),[n,r]=g([]),[s,a]=g({}),[o,l]=g(null),[d,c]=g(null),[v,i]=g("table"),[u,f]=g(""),[_,m]=g(""),[p,$]=g(""),[h,b]=g("startTime"),[w,F]=g("desc"),[S,x]=g(null),[A,E]=Ot(),{loading:R,projectsLoading:Vt,loadProgress:Fe,error:Gt,bootStatus:xe,refreshProjectsAndPrices:z,refreshJobPrices:ot}=Mn({setJobs:e,setProjects:r,setProjectPrices:a,setSummary:l,setDataRange:c,toast:Y}),Le=q(()=>[...new Set(t.map(C=>C.deviceModel).filter(Boolean))].sort(),[t]),Me=!!(u||_||p),kt=q(()=>Nn(t,u,_,p),[t,u,_,p]),Ne=q(()=>jn(kt,h,w),[kt,h,w]),je=P(C=>{h===C?F(J=>J==="asc"?"desc":"asc"):(b(C),F(C==="startTime"?"desc":"asc"))},[h]),Ae=P(()=>x(null),[]),et=P(async(C,J)=>{const nt=await pt(`/jobs/${C}`,J,"Failed to update job.");if(!(nt!=null&&nt.job))return null;const{job:St}=nt;return e(K=>K.map(Pt=>Pt.id===C?{...Pt,...St}:Pt)),x(K=>K&&K.id===C?{...K,...St}:K),St},[]),Qt=P(async(C,J)=>{await et(C,{project_id:J})&&z()},[et,z]),it=P((C,J)=>{et(C,J)},[et]),Ee=P((C,J)=>{it(C,{status_override:J})},[it]),Je=P((C,J)=>{it(C,{extra_labor_minutes:J})},[it]),De=P(C=>{x(null),E(`/projects/${C}`)},[E]),zt=P(async()=>{const C=await st("/summary","Failed to refresh summary.");l(C)},[]),Ue=P(async()=>{ot(!0),z();try{await zt(),Y("Pricing refreshed from updated rates.","success")}catch(C){Y((C==null?void 0:C.message)||"Updated rates saved, but summary refresh failed.","error")}},[ot,z,zt]),Oe=P(async()=>{const[C,J]=await Promise.all([st("/ui/data","Failed to refresh jobs."),st("/projects","Failed to refresh projects.")]);e(C.jobs),r(J.projects),ot(!0),z()},[ot,z]);if(R)return M`<${An} bootStatus=${xe} loadProgress=${Fe} />`;if(Gt)return M`<${En} error=${Gt} />`;const Kt=A.match(/^\/projects\/(\d+)$/),He=A.startsWith("/projects");return M`
    <${an} summary=${o} dataRange=${d} />
    ${A.startsWith("/admin")?M`<${Ln} onRatesChanged=${Ue} />`:Kt?M`<${Jn}
        projectId=${Number(Kt[1])}
        projects=${n}
        jobs=${t}
        projectsLoading=${Vt}
        navigate=${E}
        setSelectedJob=${x}
        handleJobProjectChange=${Qt}
      />`:He?M`<${Pn}
        projects=${n}
        setProjects=${r}
        onAutoGroup=${Oe}
        projectPrices=${s}
        loading=${Vt}
      />`:M`<${Dn}
      q=${u}
      setQ=${f}
      statusFilter=${_}
      setStatusFilter=${m}
      deviceFilter=${p}
      setDeviceFilter=${$}
      devices=${Le}
      view=${v}
      setView=${i}
      filtered=${kt}
      jobs=${t}
      isFiltered=${Me}
      sorted=${Ne}
      sortCol=${h}
      sortDir=${w}
      onSort=${je}
      onJobClick=${x}
    />`}
    ${S&&M`<${yn}
      key=${S.id}
      job=${S}
      onClose=${Ae}
      onPatch=${et}
      projects=${n}
      onJobProjectChange=${Qt}
      onJobStatusChange=${Ee}
      onJobExtraLaborChange=${Je}
      onNavigateToProject=${De}
    />`}
    <${_n} />
  `}Ge(M`<${ce} base="/ui"><${Un} /></${ce}>`,document.getElementById("app"));
