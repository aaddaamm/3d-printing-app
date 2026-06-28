(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function n(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(a){if(a.ep)return;a.ep=!0;const s=n(a);fetch(a.href,s)}})();var mt,C,re,W,Ot,se,ae,St,dt,tt,ie,Nt,Tt,Ft,oe,vt={},ft=[],je=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,ht=Array.isArray;function I(t,e){for(var n in e)t[n]=e[n];return t}function Mt(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function A(t,e,n){var r,a,s,i={};for(s in e)s=="key"?r=e[s]:s=="ref"?a=e[s]:i[s]=e[s];if(arguments.length>2&&(i.children=arguments.length>3?mt.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(s in t.defaultProps)i[s]===void 0&&(i[s]=t.defaultProps[s]);return ut(t,i,r,a,null)}function ut(t,e,n,r,a){var s={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:a??++re,__i:-1,__u:0};return a==null&&C.vnode!=null&&C.vnode(s),s}function gt(t){return t.children}function _t(t,e){this.props=t,this.context=e}function z(t,e){if(e==null)return t.__?z(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?z(t):null}function Je(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,r=[],a=[],s=I({},e);s.__v=e.__v+1,C.vnode&&C.vnode(s),Dt(t.__P,s,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,r,n??z(e),!!(32&e.__u),a),s.__v=e.__v,s.__.__k[s.__i]=s,ue(r,s,a),e.__e=e.__=null,s.__e!=n&&le(s)}}function le(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),le(t)}function jt(t){(!t.__d&&(t.__d=!0)&&W.push(t)&&!$t.__r++||Ot!=C.debounceRendering)&&((Ot=C.debounceRendering)||se)($t)}function $t(){try{for(var t,e=1;W.length;)W.length>e&&W.sort(ae),t=W.shift(),e=W.length,Je(t)}finally{W.length=$t.__r=0}}function ce(t,e,n,r,a,s,i,l,d,c,_){var o,p,v,$,h,u,m,f=r&&r.__k||ft,g=e.length;for(d=Le(n,e,f,d,g),o=0;o<g;o++)(v=n.__k[o])!=null&&(p=v.__i!=-1&&f[v.__i]||vt,v.__i=o,u=Dt(t,v,p,a,s,i,l,d,c,_),$=v.__e,v.ref&&p.ref!=v.ref&&(p.ref&&At(p.ref,null,v),_.push(v.ref,v.__c||$,v)),h==null&&$!=null&&(h=$),(m=!!(4&v.__u))||p.__k===v.__k?(d=de(v,d,t,m),m&&p.__e&&(p.__e=null)):typeof v.type=="function"&&u!==void 0?d=u:$&&(d=$.nextSibling),v.__u&=-7);return n.__e=h,d}function Le(t,e,n,r,a){var s,i,l,d,c,_=n.length,o=_,p=0;for(t.__k=new Array(a),s=0;s<a;s++)(i=e[s])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=t.__k[s]=ut(null,i,null,null,null):ht(i)?i=t.__k[s]=ut(gt,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=t.__k[s]=ut(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):t.__k[s]=i,d=s+p,i.__=t,i.__b=t.__b+1,l=null,(c=i.__i=xe(i,n,d,o))!=-1&&(o--,(l=n[c])&&(l.__u|=2)),l==null||l.__v==null?(c==-1&&(a>_?p--:a<_&&p++),typeof i.type!="function"&&(i.__u|=4)):c!=d&&(c==d-1?p--:c==d+1?p++:(c>d?p--:p++,i.__u|=4))):t.__k[s]=null;if(o)for(s=0;s<_;s++)(l=n[s])!=null&&(2&l.__u)==0&&(l.__e==r&&(r=z(l)),pe(l,l));return r}function de(t,e,n,r){var a,s;if(typeof t.type=="function"){for(a=t.__k,s=0;a&&s<a.length;s++)a[s]&&(a[s].__=t,e=de(a[s],e,n,r));return e}t.__e!=e&&(r&&(e&&t.type&&!e.parentNode&&(e=z(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function xe(t,e,n,r){var a,s,i,l=t.key,d=t.type,c=e[n],_=c!=null&&(2&c.__u)==0;if(c===null&&l==null||_&&l==c.key&&d==c.type)return n;if(r>(_?1:0)){for(a=n-1,s=n+1;a>=0||s<e.length;)if((c=e[i=a>=0?a--:s++])!=null&&(2&c.__u)==0&&l==c.key&&d==c.type)return i}return-1}function It(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||je.test(e)?n:n+"px"}function lt(t,e,n,r,a){var s,i;t:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof r=="string"&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||It(t.style,e,"");if(n)for(e in n)r&&n[e]==r[e]||It(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")s=e!=(e=e.replace(ie,"$1")),i=e.toLowerCase(),e=i in t||e=="onFocusOut"||e=="onFocusIn"?i.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+s]=n,n?r?n[tt]=r[tt]:(n[tt]=Nt,t.addEventListener(e,s?Ft:Tt,s)):t.removeEventListener(e,s?Ft:Tt,s);else{if(a=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break t}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function Wt(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[dt]==null)e[dt]=Nt++;else if(e[dt]<n[tt])return;return n(C.event?C.event(e):e)}}}function Dt(t,e,n,r,a,s,i,l,d,c){var _,o,p,v,$,h,u,m,f,g,w,k,T,F,x,N=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[l=e.__e=n.__e]),(_=C.__b)&&_(e);t:if(typeof N=="function")try{if(m=e.props,f=N.prototype&&N.prototype.render,g=(_=N.contextType)&&r[_.__c],w=_?g?g.props.value:_.__:r,n.__c?u=(o=e.__c=n.__c).__=o.__E:(f?e.__c=o=new N(m,w):(e.__c=o=new _t(m,w),o.constructor=N,o.render=Me),g&&g.sub(o),o.state||(o.state={}),o.__n=r,p=o.__d=!0,o.__h=[],o._sb=[]),f&&o.__s==null&&(o.__s=o.state),f&&N.getDerivedStateFromProps!=null&&(o.__s==o.state&&(o.__s=I({},o.__s)),I(o.__s,N.getDerivedStateFromProps(m,o.__s))),v=o.props,$=o.state,o.__v=e,p)f&&N.getDerivedStateFromProps==null&&o.componentWillMount!=null&&o.componentWillMount(),f&&o.componentDidMount!=null&&o.__h.push(o.componentDidMount);else{if(f&&N.getDerivedStateFromProps==null&&m!==v&&o.componentWillReceiveProps!=null&&o.componentWillReceiveProps(m,w),e.__v==n.__v||!o.__e&&o.shouldComponentUpdate!=null&&o.shouldComponentUpdate(m,o.__s,w)===!1){e.__v!=n.__v&&(o.props=m,o.state=o.__s,o.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(B){B&&(B.__=e)}),ft.push.apply(o.__h,o._sb),o._sb=[],o.__h.length&&i.push(o);break t}o.componentWillUpdate!=null&&o.componentWillUpdate(m,o.__s,w),f&&o.componentDidUpdate!=null&&o.__h.push(function(){o.componentDidUpdate(v,$,h)})}if(o.context=w,o.props=m,o.__P=t,o.__e=!1,k=C.__r,T=0,f)o.state=o.__s,o.__d=!1,k&&k(e),_=o.render(o.props,o.state,o.context),ft.push.apply(o.__h,o._sb),o._sb=[];else do o.__d=!1,k&&k(e),_=o.render(o.props,o.state,o.context),o.state=o.__s;while(o.__d&&++T<25);o.state=o.__s,o.getChildContext!=null&&(r=I(I({},r),o.getChildContext())),f&&!p&&o.getSnapshotBeforeUpdate!=null&&(h=o.getSnapshotBeforeUpdate(v,$)),F=_!=null&&_.type===gt&&_.key==null?_e(_.props.children):_,l=ce(t,ht(F)?F:[F],e,n,r,a,s,i,l,d,c),o.base=e.__e,e.__u&=-161,o.__h.length&&i.push(o),u&&(o.__E=o.__=null)}catch(B){if(e.__v=null,d||s!=null)if(B.then){for(e.__u|=d?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;s[s.indexOf(l)]=null,e.__e=l}else{for(x=s.length;x--;)Mt(s[x]);Jt(e)}else e.__e=n.__e,e.__k=n.__k,B.then||Jt(e);C.__e(B,e,n)}else s==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):l=e.__e=Ne(n.__e,e,n,r,a,s,i,d,c);return(_=C.diffed)&&_(e),128&e.__u?void 0:l}function Jt(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(Jt))}function ue(t,e,n){for(var r=0;r<n.length;r++)At(n[r],n[++r],n[++r]);C.__c&&C.__c(e,t),t.some(function(a){try{t=a.__h,a.__h=[],t.some(function(s){s.call(a)})}catch(s){C.__e(s,a.__v)}})}function _e(t){return typeof t!="object"||t==null||t.__b>0?t:ht(t)?t.map(_e):I({},t)}function Ne(t,e,n,r,a,s,i,l,d){var c,_,o,p,v,$,h,u=n.props||vt,m=e.props,f=e.type;if(f=="svg"?a="http://www.w3.org/2000/svg":f=="math"?a="http://www.w3.org/1998/Math/MathML":a||(a="http://www.w3.org/1999/xhtml"),s!=null){for(c=0;c<s.length;c++)if((v=s[c])&&"setAttribute"in v==!!f&&(f?v.localName==f:v.nodeType==3)){t=v,s[c]=null;break}}if(t==null){if(f==null)return document.createTextNode(m);t=document.createElementNS(a,f,m.is&&m),l&&(C.__m&&C.__m(e,s),l=!1),s=null}if(f==null)u===m||l&&t.data==m||(t.data=m);else{if(s=s&&mt.call(t.childNodes),!l&&s!=null)for(u={},c=0;c<t.attributes.length;c++)u[(v=t.attributes[c]).name]=v.value;for(c in u)v=u[c],c=="dangerouslySetInnerHTML"?o=v:c=="children"||c in m||c=="value"&&"defaultValue"in m||c=="checked"&&"defaultChecked"in m||lt(t,c,null,v,a);for(c in m)v=m[c],c=="children"?p=v:c=="dangerouslySetInnerHTML"?_=v:c=="value"?$=v:c=="checked"?h=v:l&&typeof v!="function"||u[c]===v||lt(t,c,v,u[c],a);if(_)l||o&&(_.__html==o.__html||_.__html==t.innerHTML)||(t.innerHTML=_.__html),e.__k=[];else if(o&&(t.innerHTML=""),ce(e.type=="template"?t.content:t,ht(p)?p:[p],e,n,r,f=="foreignObject"?"http://www.w3.org/1999/xhtml":a,s,i,s?s[0]:n.__k&&z(n,0),l,d),s!=null)for(c=s.length;c--;)Mt(s[c]);l||(c="value",f=="progress"&&$==null?t.removeAttribute("value"):$!=null&&($!==t[c]||f=="progress"&&!$||f=="option"&&$!=u[c])&&lt(t,c,$,u[c],a),c="checked",h!=null&&h!=t[c]&&lt(t,c,h,u[c],a))}return t}function At(t,e,n){try{if(typeof t=="function"){var r=typeof t.__u=="function";r&&t.__u(),r&&e==null||(t.__u=t(e))}else t.current=e}catch(a){C.__e(a,n)}}function pe(t,e,n){var r,a;if(C.unmount&&C.unmount(t),(r=t.ref)&&(r.current&&r.current!=t.__e||At(r,null,e)),(r=t.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(s){C.__e(s,e)}r.base=r.__P=null}if(r=t.__k)for(a=0;a<r.length;a++)r[a]&&pe(r[a],e,n||typeof t.type!="function");n||Mt(t.__e),t.__c=t.__=t.__e=void 0}function Me(t,e,n){return this.constructor(t,n)}function De(t,e,n){var r,a,s,i;e==document&&(e=document.documentElement),C.__&&C.__(t,e),a=(r=!1)?null:e.__k,s=[],i=[],Dt(e,t=e.__k=A(gt,null,[t]),a||vt,vt,e.namespaceURI,a?null:e.firstChild?mt.call(e.childNodes):null,s,a?a.__e:e.firstChild,r,i),ue(s,t,i)}function Ae(t){function e(n){var r,a;return this.getChildContext||(r=new Set,(a={})[e.__c]=this,this.getChildContext=function(){return a},this.componentWillUnmount=function(){r=null},this.shouldComponentUpdate=function(s){this.props.value!=s.value&&r.forEach(function(i){i.__e=!0,jt(i)})},this.sub=function(s){r.add(s);var i=s.componentWillUnmount;s.componentWillUnmount=function(){r&&r.delete(s),i&&i.call(s)}}),n.children}return e.__c="__cC"+oe++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,r){return n.children(r)}).contextType=e,e}mt=ft.slice,C={__e:function(t,e,n,r){for(var a,s,i;e=e.__;)if((a=e.__c)&&!a.__)try{if((s=a.constructor)&&s.getDerivedStateFromError!=null&&(a.setState(s.getDerivedStateFromError(t)),i=a.__d),a.componentDidCatch!=null&&(a.componentDidCatch(t,r||{}),i=a.__d),i)return a.__E=a}catch(l){t=l}throw t}},re=0,_t.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=I({},this.state),typeof t=="function"&&(t=t(I({},n),this.props)),t&&I(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),jt(this))},_t.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),jt(this))},_t.prototype.render=gt,W=[],se=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,ae=function(t,e){return t.__v.__b-e.__v.__b},$t.__r=0,St=Math.random().toString(8),dt="__d"+St,tt="__a"+St,ie=/(PointerCapture)$|Capture$/i,Nt=0,Tt=Wt(!1),Ft=Wt(!0),oe=0;var Y,P,Ct,Vt,st=0,ve=[],j=C,qt=j.__b,Gt=j.__r,Qt=j.diffed,Kt=j.__c,zt=j.unmount,Yt=j.__;function bt(t,e){j.__h&&j.__h(P,t,st||e),st=0;var n=P.__H||(P.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function b(t){return st=1,Ee(me,t)}function Ee(t,e,n){var r=bt(Y++,2);if(r.t=t,!r.__c&&(r.__=[me(void 0,e),function(l){var d=r.__N?r.__N[0]:r.__[0],c=r.t(d,l);d!==c&&(r.__N=[c,r.__[1]],r.__c.setState({}))}],r.__c=P,!P.__f)){var a=function(l,d,c){if(!r.__c.__H)return!0;var _=r.__c.__H.__.filter(function(p){return p.__c});if(_.every(function(p){return!p.__N}))return!s||s.call(this,l,d,c);var o=r.__c.props!==l;return _.some(function(p){if(p.__N){var v=p.__[0];p.__=p.__N,p.__N=void 0,v!==p.__[0]&&(o=!0)}}),s&&s.call(this,l,d,c)||o};P.__f=!0;var s=P.shouldComponentUpdate,i=P.componentWillUpdate;P.componentWillUpdate=function(l,d,c){if(this.__e){var _=s;s=void 0,a(l,d,c),s=_}i&&i.call(this,l,d,c)},P.shouldComponentUpdate=a}return r.__N||r.__}function O(t,e){var n=bt(Y++,3);!j.__s&&$e(n.__H,e)&&(n.__=t,n.u=e,P.__H.__h.push(n))}function fe(t){return st=5,H(function(){return{current:t}},[])}function H(t,e){var n=bt(Y++,7);return $e(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function S(t,e){return st=8,H(function(){return t},e)}function Ue(t){var e=P.context[t.__c],n=bt(Y++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(P)),e.props.value):t.__}function Be(){for(var t;t=ve.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(pt),e.__h.some(Lt),e.__h=[]}catch(n){e.__h=[],j.__e(n,t.__v)}}}j.__b=function(t){P=null,qt&&qt(t)},j.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Yt&&Yt(t,e)},j.__r=function(t){Gt&&Gt(t),Y=0;var e=(P=t.__c).__H;e&&(Ct===P?(e.__h=[],P.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(pt),e.__h.some(Lt),e.__h=[],Y=0)),Ct=P},j.diffed=function(t){Qt&&Qt(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(ve.push(e)!==1&&Vt===j.requestAnimationFrame||((Vt=j.requestAnimationFrame)||He)(Be)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),Ct=P=null},j.__c=function(t,e){e.some(function(n){try{n.__h.some(pt),n.__h=n.__h.filter(function(r){return!r.__||Lt(r)})}catch(r){e.some(function(a){a.__h&&(a.__h=[])}),e=[],j.__e(r,n.__v)}}),Kt&&Kt(t,e)},j.unmount=function(t){zt&&zt(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(r){try{pt(r)}catch(a){e=a}}),n.__H=void 0,e&&j.__e(e,n.__v))};var Xt=typeof requestAnimationFrame=="function";function He(t){var e,n=function(){clearTimeout(r),Xt&&cancelAnimationFrame(e),setTimeout(t)},r=setTimeout(n,35);Xt&&(e=requestAnimationFrame(n))}function pt(t){var e=P,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),P=e}function Lt(t){var e=P;t.__c=t.__(),P=e}function $e(t,e){return!t||t.length!==e.length||e.some(function(n,r){return n!==t[r]})}function me(t,e){return typeof e=="function"?e(t):e}var he=function(t,e,n,r){var a;e[0]=0;for(var s=1;s<e.length;s++){var i=e[s++],l=e[s]?(e[0]|=i?1:2,n[e[s++]]):e[++s];i===3?r[0]=l:i===4?r[1]=Object.assign(r[1]||{},l):i===5?(r[1]=r[1]||{})[e[++s]]=l:i===6?r[1][e[++s]]+=l+"":i?(a=t.apply(l,he(t,l,n,["",null])),r.push(a),l[0]?e[0]|=2:(e[s-2]=0,e[s]=a)):r.push(l)}return r},Zt=new Map;function U(t){var e=Zt.get(this);return e||(e=new Map,Zt.set(this,e)),(e=he(this,e.get(t)||(e.set(t,e=(function(n){for(var r,a,s=1,i="",l="",d=[0],c=function(p){s===1&&(p||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,p,i):s===3&&(p||i)?(d.push(3,p,i),s=2):s===2&&i==="..."&&p?d.push(4,p,0):s===2&&i&&!p?d.push(5,0,!0,i):s>=5&&((i||!p&&s===5)&&(d.push(s,0,i,a),s=6),p&&(d.push(s,p,0,a),s=6)),i=""},_=0;_<n.length;_++){_&&(s===1&&c(),c(_));for(var o=0;o<n[_].length;o++)r=n[_][o],s===1?r==="<"?(c(),d=[d],s=3):i+=r:s===4?i==="--"&&r===">"?(s=1,i=""):i=r+i[0]:l?r===l?l="":i+=r:r==='"'||r==="'"?l=r:r===">"?(c(),s=1):s&&(r==="="?(s=5,a=i,i=""):r==="/"&&(s<5||n[_][o+1]===">")?(c(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):r===" "||r==="	"||r===`
`||r==="\r"?(c(),s=2):i+=r),s===3&&i==="!--"&&(s=4,d=d[0])}return c(),d})(t)),e),arguments,[])).length>1?e:e[0]}const Re=U.bind(A),xt=Ae(null);function te({base:t,children:e}){const n=t.endsWith("/")?t.slice(0,-1):t,r=l=>l===n||l===n+"/"?"/":l.startsWith(n+"/")?l.slice(n.length)||"/":l,[a,s]=b(()=>r(location.pathname));O(()=>{const l=()=>s(r(location.pathname));return window.addEventListener("popstate",l),()=>window.removeEventListener("popstate",l)},[n]);const i=S(l=>{const d=l==="/"?n+"/":n+l;history.pushState(null,"",d),s(l)},[n]);return Re`<${xt.Provider} value=${[a,i]}>${e}</${xt.Provider}>`}function Et(){const t=Ue(xt);if(!t)throw new Error("useLocation must be used within RouterProvider");return t}function q(t){if(!t)return"—";const e=Math.floor(t/3600),n=Math.floor(t%3600/60);return e===0?`${n}m`:`${e}h${n>0?` ${n}m`:""}`}function yt(t){if(!t)return"—";const e=new Date(t),n=new Date,r=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"};return e.toLocaleString(void 0,r)}function V(t){if(!t)return"—";const e=new Date(t),n=new Date,r=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric"}:{month:"short",day:"numeric",year:"2-digit"};return e.toLocaleDateString(void 0,r)}function L(t){return"$"+t.toFixed(2)}function at(t){return t==null?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function Ut(t){return t?t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${Math.round(t)} g`:"0 g"}const G=U.bind(A),Oe={finish:"badge badge-finish",running:"badge badge-running",failed:"badge badge-failed",cancel:"badge badge-cancel",pause:"badge badge-pause"};function it({status:t}){const e=(t||"").toLowerCase();return G`<span class=${Oe[e]||"badge badge-default"}>${e||"unknown"}</span>`}function wt({url:t}){const[e,n]=b(!1);return!t||e?G`<div class="row-thumb-ph">🖨</div>`:G`<img
    class="row-thumb"
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>n(!0)}
  />`}function Ie({url:t,className:e}){const[n,r]=b(!1);return!t||n?G`<div class="cover-placeholder">🖨</div>`:G`<img
    class=${e}
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>r(!0)}
  />`}function kt({colors:t}){if(!(t!=null&&t.length))return null;const e=[...new Set(t.map(n=>n.slice(0,6).toUpperCase()))].filter(n=>n!=="FFFFFF");return e.length?G`<span class="swatches"
    >${e.map(n=>G`<span class="swatch" style=${"background:#"+n} title=${"#"+n} />`)}</span
  >`:null}const ee=U.bind(A);let ge=()=>{};function X(t,e="info"){ge({message:t,type:e,id:Date.now()+Math.random()})}function We(){const[t,e]=b([]),n=fe(new Map);ge=S(a=>{e(i=>[...i,a]);const s=setTimeout(()=>{e(i=>i.filter(l=>l.id!==a.id)),n.current.delete(a.id)},3500);n.current.set(a.id,s)},[]);const r=S(a=>{const s=n.current.get(a);s&&clearTimeout(s),n.current.delete(a),e(i=>i.filter(l=>l.id!==a))},[]);return t.length?ee`
    <div class="toast-container">
      ${t.map(a=>ee`
          <div class="toast toast-${a.type}" key=${a.id} onClick=${()=>r(a.id)}>
            ${a.message}
          </div>
        `)}
    </div>
  `:null}const Ve=15e3,qe=2e4,Ge=5;async function Qe(t,e){try{const n=await t.json();return typeof n.error=="string"?n.error:e}catch{return e}}function Ke(t){return{signal:AbortSignal.timeout(Ve),...t}}function ze(t,e){return(t==null?void 0:t.name)==="TimeoutError"?new Error(`${e} (request timed out)`):new Error(`${e} (network error)`)}async function et(t,e,n){let r;try{r=await fetch(t,Ke(n))}catch(a){throw ze(a,e)}if(!r.ok)throw new Error(await Qe(r,e));return await r.json()}async function Bt(t,e,n){try{return{data:await et(t,e,n),error:null}}catch(r){return{data:null,error:r instanceof Error?r:new Error(e)}}}async function ot(t,e,n){const{data:r,error:a}=await Bt(t,e,n);return a?(X(a.message||e,"error"),null):r}async function nt(t,e,n){return ot(t,n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}async function be(t,e,n){return ot(t,n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}const y=U.bind(A);function Ye(t){return!t.startsWith("/projects")&&!t.startsWith("/admin")&&!t.startsWith("/printers")}function Xe(t,e){const n=new URLSearchParams;t&&n.set("status",t),e&&n.set("device",e);const r=n.toString();return"/jobs/export.csv"+(r?"?"+r:"")}function Ze(t){return t.reduce((e,n)=>(e.weight+=n.total_weight_g||0,e.time+=n.total_time_s||0,e),{weight:0,time:0})}function tn(t){return!t||t==="actual"?null:t==="slicer_estimate"?"estimate":t==="manual"?"manual":"unknown"}function ye({confidence:t}){const e=tn(t);return e?y`<span class="usage-confidence">${e}</span>`:null}function en(t){const e=t.toLowerCase();return e.includes("a1 mini")?"/ui/printers/a1-mini":e.includes("p1s")?"/ui/printers/p1s":null}function nn(t){const e=new Map;for(const n of t){const r=n.deviceModel||"Unknown printer",a=e.get(r)??[];a.push(n),e.set(r,a)}return e}function we(t,e=6){return t.slice().sort((n,r)=>String(r.startTime||"").localeCompare(String(n.startTime||""))).slice(0,e)}function ke({printerName:t}){const e=en(t);return e?y`<img class="printer-photo" src=${e} alt=${t} />`:y`<div class="printer-photo">🖨️</div>`}function Se({job:t,onJobClick:e}){return y`
    <article class="printer-job-row" key=${t.id} onClick=${()=>e(t)}>
      <div class="printer-job-top">
        <div class="td-thumb"><${wt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title">${t.designTitle||"Untitled Job"}</span>
          <${kt} colors=${t.filament_colors} />
        </div>
        <${it} status=${t.status} />
      </div>
      <div class="printer-job-bottom">
        <span title=${yt(t.startTime)}>${V(t.startTime)}</span>
        <span>Filament: <strong>${at(t.total_weight_g)}</strong></span>
        <span>Time: <strong>${q(t.total_time_s)}</strong></span>
      </div>
    </article>
  `}function rn({row:t,jobs:e,onJobClick:n}){const r=t.deviceModel||"Unknown printer",a=we(e);return y`
    <section class="printer-card" key=${r}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${ke} printerName=${r} />
          <div>
            <h3>${r}</h3>
            <p class="printer-meta">
              <span class="printer-meta-jobs">${(t.total_jobs??0).toLocaleString()} jobs</span>
              <span class="printer-meta-dot">•</span>
              <span class="printer-meta-hours"
                >${((t.total_time_s??0)/3600).toFixed(1)} h total</span
              >
            </p>
          </div>
        </div>
        <div class="printer-kpis">
          <span><strong>${(t.total_jobs??0).toLocaleString()}</strong> Jobs</span>
          <span><strong>${(t.total_plates??0).toLocaleString()}</strong> Plates</span>
          <span><strong>${((t.total_time_s??0)/3600).toFixed(1)}</strong> Hours</span>
        </div>
      </div>

      <div class="printer-jobs-list">
        ${a.length?a.map(s=>y`<${Se} key=${s.id} job=${s} onJobClick=${n} />`):y`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function sn({printer:t,jobs:e,onJobClick:n,onToggleActive:r}){const a=t.name||t.model||t.provider_printer_id,s=we(e),i=t.is_active===1;return y`
    <section class=${"printer-card"+(i?"":" is-retired")} key=${t.id}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${ke} printerName=${t.model||a} />
          <div>
            <h3>${a}</h3>
            <p class="printer-meta">
              <span class="printer-meta-jobs"
                >${t.provider_display_name||t.provider}</span
              >
              <span class="printer-meta-dot">•</span>
              <span class="printer-meta-hours">${t.model||"Unknown model"}</span>
              <span class="printer-meta-dot">•</span>
              <span class=${i?"status-pill paid":"status-pill cancel"}
                >${i?"Active":"Retired"}</span
              >
            </p>
            ${t.retired_at?y`<p class="printer-meta">Retired ${V(t.retired_at)}</p>`:null}
          </div>
        </div>
        <div class="printer-kpis">
          <span><strong>${t.job_count.toLocaleString()}</strong> Jobs</span>
          <span><strong>${t.task_count.toLocaleString()}</strong> Records</span>
          <span><strong>${((t.total_time_s??0)/3600).toFixed(1)}</strong> Hours</span>
        </div>
      </div>

      <div class="printer-card-footer">
        <button class="view-btn" onClick=${()=>r(t)}>
          ${i?"Mark retired":"Reactivate"}
        </button>
      </div>

      <div class="printer-jobs-list">
        ${s.length?s.map(l=>y`<${Se} key=${l.id} job=${l} onJobClick=${n} />`):y`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}const an=[{label:"Jobs",path:"/",active:Ye},{label:"Projects",path:"/projects",active:t=>t.startsWith("/projects")},{label:"Printers",path:"/printers",active:t=>t.startsWith("/printers")},{label:"Rates",path:"/admin",active:t=>t.startsWith("/admin")}],on=[["","All Statuses"],["finish","Finished"],["cancel","Cancelled"],["running","Running"],["failed","Failed"],["pause","Paused"]];function Pt(t,e){const n=(t==null?void 0:t.by_device)??[];return n.length?n.map(r=>{const a=r.deviceModel||"Unknown printer";return e==="jobs"?`${a}: ${(r.total_jobs??0).toLocaleString()} jobs`:e==="plates"?`${a}: ${(r.total_plates??0).toLocaleString()} plates`:`${a}: ${((r.total_time_s??0)/3600).toFixed(1).toLocaleString()} h`}).join(`
`):"No printer breakdown available"}function ln({loc:t,navigate:e}){return y`<nav class="top-nav">
    ${an.map(n=>{const r=n.active(t);return y`
        <button
          key=${n.label}
          class=${"nav-btn"+(r?" active":"")}
          onClick=${()=>e(n.path)}
        >
          ${n.label}
        </button>
      `})}
  </nav>`}function cn({summary:t}){var n,r;const e=t==null?void 0:t.totals;return y`
    <div class="stats">
      <div class="stat" title=${Pt(t,"jobs")}>
        <div class="stat-val">${e?(n=e.total_jobs)==null?void 0:n.toLocaleString():"—"}</div>
        <div class="stat-lbl">Total Jobs</div>
      </div>
      <div class="stat">
        <div class="stat-val">${e?((e.total_weight_g??0)/1e3).toFixed(2):"—"}</div>
        <div class="stat-lbl">Filament kg</div>
      </div>
      <div class="stat" title=${Pt(t,"hours")}>
        <div class="stat-val">${e?((e.total_time_s??0)/3600).toFixed(1):"—"}</div>
        <div class="stat-lbl">Print Hours</div>
      </div>
      <div class="stat" title=${Pt(t,"plates")}>
        <div class="stat-val">${e?(r=e.total_plates)==null?void 0:r.toLocaleString():"—"}</div>
        <div class="stat-lbl">Plates</div>
      </div>
    </div>
  `}function dn({summary:t,dataRange:e}){const[n,r]=Et(),a=!!(e!=null&&e.min_start&&(e!=null&&e.max_start)),s=(e==null?void 0:e.min_start)??"",i=(e==null?void 0:e.max_start)??"";return y`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>bambu history</span></h1>
        ${a&&y`<div class="header-range">
          History: ${V(s)} → ${V(i)}
          (${((e==null?void 0:e.task_count)||0).toLocaleString()} tasks)
        </div>`}
        <${ln} loc=${n} navigate=${r} />
      </div>
      <${cn} summary=${t} />
    </header>
  `}function un({q:t,setQ:e,statusFilter:n,setStatusFilter:r,deviceFilter:a,setDeviceFilter:s,devices:i,view:l,setView:d,density:c,setDensity:_,filteredCount:o,totalCount:p}){const v=H(()=>Xe(n,a),[n,a]);return y`
    <div class="toolbar">
      <input
        type="search"
        placeholder="Search title or customer…"
        value=${t}
        onInput=${$=>e($.target.value)}
      />
      <select
        value=${n}
        onChange=${$=>r($.target.value)}
      >
        ${on.map(([$,h])=>y`<option key=${$} value=${$}>${h}</option> `)}
      </select>
      <select
        value=${a}
        onChange=${$=>s($.target.value)}
      >
        <option value="">All Printers</option>
        ${i.map($=>y`<option key=${$} value=${$}>${$}</option> `)}
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
        <div class="density-toggle">
          <button
            class=${"density-btn"+(c==="compact"?" active":"")}
            onClick=${()=>_("compact")}
          >
            Compact
          </button>
          <button
            class=${"density-btn"+(c==="comfy"?" active":"")}
            onClick=${()=>_("comfy")}
          >
            Comfy
          </button>
        </div>
        <a class="btn-csv" href=${v} download>↓ CSV</a>
        <span class="job-count">${o} / ${p} jobs</span>
      </div>
    </div>
  `}function _n(t,e){const n=new Set([t.model,t.name,t.provider_printer_id].filter(Boolean));return e.filter(r=>n.has(r.deviceModel))}function pn({summary:t,jobs:e,onJobClick:n}){const[r,a]=b([]);O(()=>{ot("/printers","Failed to load printer inventory.").then(d=>{d&&a(d.printers)})},[]);const s=async d=>{const c=await nt(`/printers/${d.id}`,{is_active:d.is_active!==1},"Failed to update printer inventory.");c!=null&&c.printer&&a(_=>_.map(o=>o.id===d.id?c.printer:o))};if(r.length)return y`
      <div class="printer-grid">
        ${r.map(d=>y`<${sn}
              key=${d.id}
              printer=${d}
              jobs=${_n(d,e)}
              onJobClick=${n}
              onToggleActive=${s}
            />`)}
      </div>
    `;const i=(t==null?void 0:t.by_device)??[];if(!i.length)return y`<div class="empty">No printer totals available yet.</div>`;const l=nn(e);return y`
    <div class="printer-grid">
      ${i.map(d=>y`<${rn}
            key=${d.deviceModel||"Unknown printer"}
            row=${d}
            jobs=${l.get(d.deviceModel||"Unknown printer")??[]}
            onJobClick=${n}
          />`)}
    </div>
  `}function vn({filtered:t,isFiltered:e}){if(!e||!t.length)return null;const n=Ze(t);return y`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${t.length}</strong></span>
      <span>Filament: <strong>${Ut(n.weight)}</strong></span>
      <span>Print time: <strong>${q(n.time)}</strong></span>
    </div>
  `}function Ce({printRun:t}){return(t??1)<=1?null:y`<span class="run-badge">Run ${t}</span>`}function fn({sortCol:t,sortDir:e,onSort:n}){return y`<div class="jobs-record-sortbar">
    <span class="jobs-record-sort-label">Sort</span>
    ${[{col:"startTime",label:"Date"},{col:"designTitle",label:"Title"},{col:"deviceModel",label:"Printer"},{col:"total_weight_g",label:"Filament"},{col:"total_time_s",label:"Time"},{col:"final_price",label:"Price"}].map(({col:a,label:s})=>{const i=t===a;return y`
        <button
          key=${a}
          class=${"jobs-record-sort-btn"+(i?" active":"")}
          onClick=${()=>n(a)}
        >
          ${s}${i?e==="asc"?" ↑":" ↓":""}
        </button>
      `})}
  </div>`}function $n({job:t,onJobClick:e}){return y`
    <article class="jobs-record-row" onClick=${()=>e(t)}>
      <div class="jobs-record-top">
        <div class="td-thumb"><${wt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title" title=${t.designTitle||"Untitled"}
            >${t.designTitle||"Untitled Job"}</span
          >
          <${Ce} printRun=${t.print_run} />
          <${kt} colors=${t.filament_colors} />
        </div>
        <div><${it} status=${t.status} /></div>
      </div>
      <div class="jobs-record-bottom">
        <span>🖨 ${t.deviceModel||"—"}</span>
        <span title=${yt(t.startTime)}>📅 ${V(t.startTime)}</span>
        <span
          >🧵 <strong>${at(t.total_weight_g)}</strong>
          <${ye} confidence=${t.material_usage_confidence} />
        </span>
        <span>⏱ <strong>${q(t.total_time_s)}</strong></span>
        <span
          >💰 <strong>${t.final_price!=null?L(t.final_price):"—"}</strong></span
        >
        <span>🧱 <strong>${t.plate_count??"—"}</strong></span>
        ${t.customer?y`<span class="customer-pill">${t.customer}</span>`:null}
      </div>
    </article>
  `}function mn({sorted:t,sortCol:e,sortDir:n,onSort:r,onJobClick:a,density:s}){return y`
    <div class=${"jobs-record-list-wrap density-"+s}>
      <${fn} sortCol=${e} sortDir=${n} onSort=${r} />
      <div class="jobs-record-list">
        ${t.map(i=>y`<${$n} key=${i.id} job=${i} onJobClick=${a} />`)}
      </div>
    </div>
  `}function hn({job:t,onJobClick:e}){return y`
    <div class="card" onClick=${()=>e(t)}>
      <${Ie} url=${t.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${t.designTitle||"Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${t.deviceModel||"—"}</span>
          <span>📅 ${V(t.startTime)}</span>
          <span>⏱ ${q(t.total_time_s)}</span>
          <span
            >🧵 ${at(t.total_weight_g)}
            <${ye} confidence=${t.material_usage_confidence} />
          </span>
          ${t.final_price!=null&&y`<span>💰 ${L(t.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${it} status=${t.status} />
          <${Ce} printRun=${t.print_run} />
          ${t.customer&&y`<span class="customer-pill">${t.customer}</span>`}
          <${kt} colors=${t.filament_colors} />
        </div>
      </div>
    </div>
  `}function gn({sorted:t,onJobClick:e,density:n}){return y`
    <div class=${"grid-view density-"+n}>
      ${t.map(r=>y`<${hn} key=${r.id} job=${r} onJobClick=${e} />`)}
    </div>
  `}function Ht(t){O(()=>{const e=n=>{n.key==="Escape"&&t()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[t])}const D=U.bind(A);function bn(t){return t==="actual"?"actual usage":t==="slicer_estimate"?"slicer estimate":t==="manual"?"manual entry":"unknown confidence"}function yn({jobId:t}){const[e,n]=b(null);if(O(()=>{let s=!0;return n(null),Bt(`/jobs/${t}/price`,"Pricing not configured").then(({data:i})=>{s&&n(i??!1)}).catch(()=>{s&&n(!1)}),()=>{s=!1}},[t]),e===null)return D`<div class="pricing-row pricing-loading">Loading price…</div>`;if(e===!1)return D`<div class="pricing-row pricing-na">Pricing not configured</div>`;const r=e.final_price-e.base_price,a=e.base_price>0?Math.round(r/e.base_price*100):0;return D`
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Material</span><span>${L(e.material_cost)}</span>
      </div>
      <div class="pricing-row">
        <span>Machine</span><span>${L(e.machine_cost)}</span>
      </div>
      <div class="pricing-row"><span>Labor</span><span>${L(e.labor_cost)}</span></div>
      ${e.extra_labor_cost>0&&D`
        <div class="pricing-row pricing-extra-labor">
          <span>Extra labor</span><span>${L(e.extra_labor_cost)}</span>
        </div>
      `}
      <div class="pricing-divider"></div>
      <div class="pricing-row pricing-base">
        <span>Base</span><span>${L(e.base_price)}</span>
      </div>
      ${r!==0&&D`
        <div class="pricing-row pricing-markup">
          <span>Markup</span>
          <span
            >${r>0?"+":""}${L(r)}
            (${a>0?"+":""}${a}%)</span
          >
        </div>
      `}
      <div class="pricing-row pricing-final">
        <span
          >Final${e.is_override?D`<span class="override-tag">override</span>`:""}</span
        >
        <span>${L(e.final_price)}</span>
      </div>
    </div>
  `}const wn=["finish","failed","cancel","running","pause"];function kn({job:t,onClose:e,onPatch:n,projects:r,onJobProjectChange:a,onJobStatusChange:s,onJobExtraLaborChange:i,onNavigateToProject:l}){const[d,c]=b(t.customer??""),[_,o]=b(t.notes??""),[p,v]=b(t.price_override!=null?String(t.price_override):"");Ht(e);const $=S(u=>{const m=u.target.value;a(t.id,m===""?null:Number(m))},[t.id,a]),h=S(u=>{const m=u.target.value;s(t.id,m===""?null:m)},[t.id,s]);return D`
    <div class="overlay" onClick=${u=>u.target===u.currentTarget&&e()}>
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
                <${it} status=${t.status} />
                ${t.status_override&&D`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item">
              <label>Printer</label>
              <div class="detail-val">${t.deviceModel||"—"}</div>
            </div>
            <div class="detail-item">
              <label>Started</label>
              <div class="detail-val">${yt(t.startTime)}</div>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <div class="detail-val">${q(t.total_time_s)}</div>
            </div>
            <div class="detail-item">
              <label>Filament</label>
              <div class="detail-val">
                ${at(t.total_weight_g)}
                <span class="usage-confidence"
                  >${bn(t.material_usage_confidence)}</span
                >
                <${kt} colors=${t.filament_colors} />
              </div>
            </div>
            <div class="detail-item">
              <label>Plates</label>
              <div class="detail-val">${t.plate_count??"—"}</div>
            </div>
            <div class="detail-item">
              <label>Print Run</label>
              <div class="detail-val">
                ${(t.print_run??1)>1?`Run #${t.print_run} of this design`:"1st print of this design"}
              </div>
            </div>
          </div>
          <${yn} jobId=${t.id} key=${t.id+"-"+t.extra_labor_minutes} />
          <div class="modal-project-row">
            <label class="modal-project-label">Customer</label>
            <input
              class="modal-project-select"
              type="text"
              placeholder="—"
              value=${d}
              onInput=${u=>c(u.target.value)}
              onBlur=${()=>n(t.id,{customer:d.trim()||null})}
              onKeyDown=${u=>u.key==="Enter"&&u.target.blur()}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Notes</label>
            <textarea
              class="modal-project-select modal-notes"
              placeholder="—"
              value=${_}
              onInput=${u=>o(u.target.value)}
              onBlur=${()=>n(t.id,{notes:_.trim()||null})}
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
              value=${p}
              onInput=${u=>v(u.target.value)}
              onBlur=${()=>{const u=p===""?null:Number(p);n(t.id,{price_override:u})}}
              onKeyDown=${u=>u.key==="Enter"&&u.target.blur()}
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
              onChange=${u=>{const m=u.target.value===""?null:Number(u.target.value);i(t.id,m)}}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Status override</label>
            <select
              class="modal-project-select"
              value=${t.status_override??""}
              onChange=${h}
            >
              <option value="">Auto (from printer)</option>
              ${wn.map(u=>D`<option key=${u} value=${u}>${u}</option>`)}
            </select>
          </div>
          ${r&&D`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select
                class="modal-project-select"
                value=${t.project_id??""}
                onChange=${$}
              >
                <option value="">— None —</option>
                ${r.map(u=>D`<option key=${u.id} value=${u.id}>${u.name}</option>`)}
              </select>
              ${t.project_id!=null&&D`
                <button
                  class="btn-link"
                  onClick=${()=>{e(),l(Number(t.project_id))}}
                >
                  View →
                </button>
              `}
            </div>
          `}
        </div>
      </div>
    </div>
  `}const J=U.bind(A);function Sn({project:t,totalPrice:e,onClick:n}){const r=t.total_weight_g,a=t.total_time_s;return J`
    <div class="proj-card" onClick=${n}>
      ${t.cover_url?J`<img class="proj-card-cover" src=${t.cover_url} alt="" />`:J`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-name">${t.name}</div>
      <div class="proj-card-meta">
        ${t.customer&&J`<span class="customer-pill">${t.customer}</span>`}
      </div>
      <div class="proj-card-stats">
        <span><strong>${t.job_count}</strong> job${t.job_count!==1?"s":""}</span>
        ${r!=null&&J`<span>${Ut(r)}</span>`}
        ${a!=null&&J`<span>${q(a)}</span>`}
        ${e!=null&&J`<span class="proj-card-price">${L(e)}</span>`}
      </div>
      ${t.notes&&J`<div class="proj-card-notes">${t.notes}</div>`}
    </div>
  `}function Cn({price:t}){return t?J`
    <span>Material: <strong>${L(t.material_cost)}</strong></span>
    <span>Machine: <strong>${L(t.machine_cost)}</strong></span>
    <span>Labor: <strong>${L(t.labor_cost)}</strong></span>
    ${t.extra_labor_cost>0&&J`<span>Extra labor: <strong>${L(t.extra_labor_cost)}</strong></span>`}
    <span class="totals-total">Total: <strong>${L(t.final_price)}</strong></span>
  `:null}function Pn({jobs:t,onJobClick:e,onRemoveJob:n}){return t.length===0?J`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`:J`
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
          ${t.map(r=>J`
              <tr key=${r.id} onClick=${()=>e(r)}>
                <td class="td-thumb"><${wt} url=${r.cover_url} /></td>
                <td class="td-title">
                  <span class="row-title">${r.designTitle||"Untitled Job"}</span>
                </td>
                <td>${r.deviceModel||"—"}</td>
                <td title=${yt(r.startTime)}>${V(r.startTime)}</td>
                <td><${it} status=${r.status} /></td>
                <td class="td-num"><strong>${at(r.total_weight_g)}</strong></td>
                <td class="td-num">${q(r.total_time_s)}</td>
                <td class="td-num">
                  ${r.final_price!=null?J`<strong>${L(r.final_price)}</strong>`:"—"}
                </td>
                <td>
                  <button
                    class="btn-remove-job"
                    title="Remove from project"
                    onClick=${a=>{a.stopPropagation(),n(r.id)}}
                  >
                    ×
                  </button>
                </td>
              </tr>
            `)}
        </tbody>
      </table>
    </div>
  `}function Tn({loading:t,filtered:e,q:n,projectPrices:r,navigate:a}){return t?J`<div class="empty">Loading projects…</div>`:e.length===0?J`<div class="empty">${n?"No projects match your search.":"No projects yet. Create one to group related jobs together."}</div>`:J`
    <div class="proj-grid">
      ${e.map(s=>J`<${Sn}
            key=${s.id}
            project=${s}
            totalPrice=${r[s.id]??null}
            onClick=${()=>a(`/projects/${s.id}`)}
          />`)}
    </div>
  `}function Fn(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(r=>[r.name,r.customer,r.notes].filter(Boolean).join(" ").toLowerCase().includes(n))}function jn(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(r=>`${r.designTitle||""} ${r.customer||""}`.toLowerCase().includes(n))}function Jn(t,e,n){return`${n?`${e.length} of ${t.length}`:String(t.length)} project${t.length!==1?"s":""}`}function Ln(t,e){if(t===0){X("No ungrouped jobs found — everything is already assigned to a project.","info");return}X(`Created ${t} project${t!==1?"s":""}, assigned ${e} job${e!==1?"s":""}.`,"success")}function xn(t){return t.reduce((e,n)=>e+(n.total_weight_g||0),0)}function Nn(t){return t.reduce((e,n)=>e+(n.total_time_s||0),0)}const Z=U.bind(A);function Pe(t){return e=>{e.target===e.currentTarget&&t()}}function Mn({onClose:t,onCreate:e}){const[n,r]=b(""),[a,s]=b(""),[i,l]=b(""),[d,c]=b(!1);Ht(t);const _=S(async o=>{if(o.preventDefault(),!!n.trim()){c(!0);try{const p=await be("/projects",{name:n.trim(),customer:a||null,notes:i||null},"Failed to create project.");if(!(p!=null&&p.project))return;e(p.project),t()}finally{c(!1)}}},[n,a,i,e,t]);return Z`
    <div class="overlay" onClick=${Pe(t)}>
      <div class="modal">
        <div class="modal-header">
          <h2>New Project</h2>
          <button class="modal-close" onClick=${t}>✕</button>
        </div>
        <div class="modal-body">
          <form class="project-form" onSubmit=${_}>
            <label class="form-label"
              >Name *
              <input
                class="form-input"
                type="text"
                value=${n}
                onInput=${o=>r(o.target.value)}
                placeholder="Project name"
                required
              />
            </label>
            <label class="form-label"
              >Customer
              <input
                class="form-input"
                type="text"
                value=${a}
                onInput=${o=>s(o.target.value)}
                placeholder="Optional"
              />
            </label>
            <label class="form-label"
              >Notes
              <textarea
                class="form-input form-textarea"
                value=${i}
                onInput=${o=>l(o.target.value)}
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
  `}function Dn({unassignedJobs:t,onClose:e,onAdd:n}){const[r,a]=b("");Ht(e);const s=H(()=>jn(t,r),[t,r]);return Z`
    <div class="overlay" onClick=${Pe(e)}>
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
            onInput=${i=>a(i.target.value)}
          />
          ${s.length===0?Z`<div class="empty" style="padding:16px 0">
                ${r?"No matches.":"All jobs are already assigned to projects."}
              </div>`:Z`<div class="add-jobs-list">
                ${s.map(i=>Z`
                    <div class="add-jobs-row" key=${i.id} onClick=${()=>n(i.id)}>
                      <${wt} url=${i.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${i.designTitle||"Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${V(i.startTime)} · ${i.deviceModel||"—"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `)}
              </div>`}
        </div>
      </div>
    </div>
  `}const ct=new Map;function An(t,e){const[n,r]=b(()=>ct.get(t)??null);return O(()=>{if(r(ct.get(t)??null),!e){ct.delete(t),r(null);return}let a=!1;return ot(`/projects/${t}/price`,"Failed to load project price.").then(s=>{!s||a||(ct.set(t,s),r(s))}),()=>{a=!0}},[t,e]),n}const K=U.bind(A);function En({project:t,jobs:e,unassignedJobs:n,onBack:r,onJobClick:a,onAddJob:s,onRemoveJob:i}){const[l,d]=b(!1),c=t.job_count??e.length,_=An(t.id,c),o=xn(e),p=Nn(e),v=fe(new Map),$=H(()=>{for(const u of e)u.final_price!=null&&v.current.set(u.id,u.final_price);return e.map(u=>{if(u.final_price!=null)return u;const m=v.current.get(u.id);return m==null?u:{...u,final_price:m}})},[e]),h=S(u=>s(u),[s]);return K`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${r}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${t.name}</h2>
          ${t.customer&&K`<span class="customer-pill">${t.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${()=>d(!0)}>+ Add Jobs</button>
      </div>
      ${t.notes&&K`<div class="proj-detail-notes">${t.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Jobs: <strong>${c}</strong></span>
        <span>Filament: <strong>${Ut(o)}</strong></span>
        <span>Print time: <strong>${q(p)}</strong></span>
        <${Cn} price=${_} />
      </div>
      <${Pn}
        jobs=${$}
        onJobClick=${a}
        onRemoveJob=${i}
      />
      ${l&&K`<${Dn}
        unassignedJobs=${n}
        onClose=${()=>d(!1)}
        onAdd=${h}
      />`}
    </div>
  `}function Un({projects:t,setProjects:e,onAutoGroup:n,projectPrices:r,loading:a=!1}){const[s,i]=b(!1),[l,d]=b(!1),[c,_]=b(""),[,o]=Et(),p=S(async()=>{d(!0);try{const h=await be("/projects/auto-group",{},"Auto-group failed.");if(!h)return;const{projects_created:u,jobs_assigned:m}=h;await n(),Ln(u,m)}finally{d(!1)}},[n]),v=S(h=>{e(u=>[h,...u]),o(`/projects/${h.id}`)},[e,o]),$=H(()=>Fn(t,c),[t,c]);return K`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${c}
        onInput=${h=>_(h.target.value)}
      />
      <span class="proj-list-count">${Jn(t,$,c)}</span>
      <button class="btn-secondary" onClick=${p} disabled=${l}>
        ${l?"Grouping…":"⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${()=>i(!0)}>+ New Project</button>
    </div>
    <${Tn}
      loading=${a}
      filtered=${$}
      q=${c}
      projectPrices=${r}
      navigate=${o}
    />
    ${s&&K`<${Mn} onClose=${()=>i(!1)} onCreate=${v} />`}
  `}const R=U.bind(A),Bn=2e3;function ne(t,e,n){const r=e(n);return t.map(a=>e(a)===r?n:a)}function Hn(t){return t==="saving"?"Saving…":t==="saved"?"✓ Saved":"Save"}function Rn(t,e,n){return t===n?"saving":e===n?"saved":"idle"}function On(t){const[e,n]=b(""),[r,a]=b(""),s=d=>{a(d),setTimeout(()=>a(""),Bn)};return{runSave:async(d,c)=>{n(d);try{if(!await c())return;s(d),t()}finally{n("")}},getStateFor:d=>Rn(e,r,d)}}function E({label:t,value:e,onChange:n,step:r="0.01",min:a="0"}){return R`
    <label class="form-label">
      ${t}
      <input
        type="number"
        class="form-input"
        step=${r}
        min=${a}
        value=${Number.isFinite(e)?e:0}
        onInput=${s=>n(Number(s.target.value||0))}
      />
    </label>
  `}function Rt({state:t}){return R`<button type="submit" class="btn-primary" disabled=${t==="saving"}>
    ${Hn(t)}
  </button>`}function Q({title:t,description:e,children:n}){return R`
    <section class="admin-section">
      <h3 class="admin-section-title">${t}</h3>
      <p class="admin-section-desc">${e}</p>
      ${n}
    </section>
  `}function In({labor:t,saveState:e,onSave:n}){const[r,a]=b(t);return O(()=>a(t),[t]),R`
    <form class="admin-card" onSubmit=${s=>(s.preventDefault(),n(r))}>
      <div class="admin-card-fields">
        <${E}
          label="Hourly rate ($)"
          value=${r.hourly_rate}
          step="0.5"
          onChange=${s=>a({...r,hourly_rate:s})}
        />
        <${E}
          label="Minimum labor minutes"
          value=${r.minimum_minutes}
          step="1"
          onChange=${s=>a({...r,minimum_minutes:s})}
        />
        <${E}
          label="Profit markup (%)"
          value=${r.profit_markup_pct*100}
          step="1"
          onChange=${s=>a({...r,profit_markup_pct:s/100})}
        />
        <${E}
          label="Failure buffer (%)"
          value=${r.failure_buffer_pct*100}
          step="1"
          onChange=${s=>a({...r,failure_buffer_pct:s/100})}
        />
        <${E}
          label="Overhead buffer (%)"
          value=${r.overhead_buffer_pct*100}
          step="1"
          onChange=${s=>a({...r,overhead_buffer_pct:s/100})}
        />
      </div>
      <div class="admin-card-actions"><${Rt} state=${e} /></div>
    </form>
  `}function Wn({machine:t,saveState:e,onSave:n}){const[r,a]=b(t);O(()=>a(t),[t]);const s=r.purchase_price/r.lifetime_hrs+r.electricity_rate+r.maintenance_buffer;return R`
    <form class="admin-card" onSubmit=${i=>(i.preventDefault(),n(r))}>
      <div class="admin-card-name">${r.device_model}</div>
      <div class="admin-card-fields">
        <${E}
          label="Purchase price ($)"
          value=${r.purchase_price}
          step="1"
          onChange=${i=>a({...r,purchase_price:i})}
        />
        <${E}
          label="Lifetime (hours)"
          value=${r.lifetime_hrs}
          step="100"
          min="1"
          onChange=${i=>a({...r,lifetime_hrs:i})}
        />
        <${E}
          label="Electricity ($/hr)"
          value=${r.electricity_rate}
          step="0.01"
          onChange=${i=>a({...r,electricity_rate:i})}
        />
        <${E}
          label="Maintenance ($/hr)"
          value=${r.maintenance_buffer}
          step="0.01"
          onChange=${i=>a({...r,maintenance_buffer:i})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">
          Computed rate: <strong>${L(s)}</strong>/hr
        </div>
        <div class="admin-card-actions"><${Rt} state=${e} /></div>
      </div>
    </form>
  `}function Vn({material:t,saveState:e,onSave:n}){const[r,a]=b(t);O(()=>a(t),[t]);const s=r.cost_per_g*(1+r.waste_buffer_pct);return R`
    <form class="admin-card" onSubmit=${i=>(i.preventDefault(),n(r))}>
      <div class="admin-card-name">${r.filament_type}</div>
      <div class="admin-card-fields">
        <${E}
          label="Cost per gram ($/g)"
          value=${r.cost_per_g}
          step="0.001"
          onChange=${i=>a({...r,cost_per_g:i})}
        />
        <${E}
          label="Waste buffer (%)"
          value=${r.waste_buffer_pct*100}
          step="1"
          onChange=${i=>a({...r,waste_buffer_pct:i/100})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">Computed rate: <strong>${L(s)}</strong>/g</div>
        <div class="admin-card-actions"><${Rt} state=${e} /></div>
      </div>
    </form>
  `}function qn({onRatesChanged:t=()=>{}}){const[e,n]=b(null),{runSave:r,getStateFor:a}=On(t);O(()=>{ot("/rates","Failed to load rates.").then(o=>{o&&n(o)})},[]);const s=async o=>{await r("labor",async()=>{const p=await nt("/rates/labor",o,"Failed to save labor rates."),v=p==null?void 0:p.labor_config;return v?(n($=>$&&{...$,labor_config:v}),!0):!1})},i=async o=>{const{device_model:p,purchase_price:v,lifetime_hrs:$,electricity_rate:h,maintenance_buffer:u}=o;await r(p,async()=>{const m=await nt(`/rates/machines/${encodeURIComponent(p)}`,{purchase_price:v,lifetime_hrs:$,electricity_rate:h,maintenance_buffer:u},"Failed to save machine rate."),f=m==null?void 0:m.machine_rate;return f?(n(g=>g&&{...g,machine_rates:ne(g.machine_rates,w=>w.device_model,f)}),!0):!1})},l=async o=>{const{filament_type:p,cost_per_g:v,waste_buffer_pct:$}=o;await r(p,async()=>{const h=await nt(`/rates/materials/${encodeURIComponent(p)}`,{cost_per_g:v,waste_buffer_pct:$},"Failed to save material rate."),u=h==null?void 0:h.material_rate;return u?(n(m=>m&&{...m,material_rates:ne(m.material_rates,f=>f.filament_type,u)}),!0):!1})};if(!e)return R`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;const{labor_config:d,machine_rates:c,material_rates:_}=e;return R`
    <div class="admin-page">
      <h2 class="admin-title">Rates & Pricing</h2>

      <${Q}
        title="Labor"
        description="Applied once per job (or once per project for project pricing)."
      >
        <${In}
          labor=${d}
          saveState=${a("labor")}
          onSave=${s}
        />
      </${Q}>

      <${Q}
        title="Machine Rates"
        description="Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance."
      >
        ${c.map(o=>R`
            <${Wn}
              key=${o.device_model}
              machine=${o}
              saveState=${a(o.device_model)}
              onSave=${i}
            />
          `)}
      </${Q}>

      <${Q}
        title="Material Rates"
        description="Cost per gram including waste. Rate = cost × (1 + waste fraction)."
      >
        ${_.map(o=>R`
            <${Vn}
              key=${o.filament_type}
              material=${o}
              saveState=${a(o.filament_type)}
              onSave=${l}
            />
          `)}
      </${Q}>
    </div>
  `}const M=U.bind(A);function Gn({bootStatus:t,loadProgress:e}){return M` <div class="in-app-loading" role="status" aria-live="polite">
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
  </div>`}function Qn({error:t}){return M`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${t}</p>
      </div>
    </div>
  </div>`}function Kn({projectId:t,projects:e,jobs:n,projectsLoading:r,navigate:a,setSelectedJob:s,handleJobProjectChange:i}){const l=e.find(_=>Number(_.id)===t),d=n.filter(_=>Number(_.project_id)===t);if(!l)return r?M`<div class="empty">Loading projects…</div>`:M`<div class="empty">Project not found.</div>`;const c=n.filter(_=>_.project_id==null);return M`<${En}
    project=${l}
    jobs=${d}
    unassignedJobs=${c}
    onBack=${()=>a("/projects")}
    onJobClick=${s}
    onAddJob=${_=>i(_,t)}
    onRemoveJob=${_=>i(_,null)}
  />`}function zn({sorted:t,view:e,sortCol:n,sortDir:r,onSort:a,onJobClick:s,density:i}){return t.length===0?M`<div class="empty">No jobs match your filters.</div>`:e==="table"?M`<${mn}
      sorted=${t}
      sortCol=${n}
      sortDir=${r}
      onSort=${a}
      onJobClick=${s}
      density=${i}
    />`:M`<${gn} sorted=${t} onJobClick=${s} density=${i} />`}function Yn({q:t,setQ:e,statusFilter:n,setStatusFilter:r,deviceFilter:a,setDeviceFilter:s,devices:i,view:l,setView:d,filtered:c,jobs:_,isFiltered:o,sorted:p,sortCol:v,sortDir:$,onSort:h,onJobClick:u,density:m,setDensity:f}){return M`
    <${un}
      q=${t}
      setQ=${e}
      statusFilter=${n}
      setStatusFilter=${r}
      deviceFilter=${a}
      setDeviceFilter=${s}
      devices=${i}
      view=${l}
      setView=${d}
      density=${m}
      setDensity=${f}
      filteredCount=${c.length}
      totalCount=${_.length}
    />
    <${vn} filtered=${c} isFiltered=${o} />
    ${zn({sorted:p,view:l,sortCol:v,sortDir:$,onSort:h,onJobClick:u,density:m})}
  `}function Xn(t){const e=t.match(/^\/projects\/(\d+)$/);return{isAdmin:t.startsWith("/admin"),isPrinters:t.startsWith("/printers"),isProjects:t.startsWith("/projects"),projectId:e?Number(e[1]):null}}function Zn({route:t,summary:e,projects:n,setProjects:r,jobs:a,projectsLoading:s,navigate:i,setSelectedJob:l,handleJobProjectChange:d,handleRatesChanged:c,handleAutoGroup:_,projectPrices:o,q:p,setQ:v,statusFilter:$,setStatusFilter:h,deviceFilter:u,setDeviceFilter:m,devices:f,view:g,setView:w,filtered:k,isFiltered:T,sorted:F,sortCol:x,sortDir:N,density:B,setDensity:Te,handleSort:Fe}){return t.isAdmin?M`<${qn} onRatesChanged=${c} />`:t.isPrinters?M`<${pn}
      summary=${e}
      jobs=${a}
      onJobClick=${l}
    />`:t.projectId!=null?M`<${Kn}
      projectId=${t.projectId}
      projects=${n}
      jobs=${a}
      projectsLoading=${s}
      navigate=${i}
      setSelectedJob=${l}
      handleJobProjectChange=${d}
    />`:t.isProjects?M`<${Un}
      projects=${n}
      setProjects=${r}
      onAutoGroup=${_}
      projectPrices=${o}
      loading=${s}
    />`:M`<${Yn}
    q=${p}
    setQ=${v}
    statusFilter=${$}
    setStatusFilter=${h}
    deviceFilter=${u}
    setDeviceFilter=${m}
    devices=${f}
    view=${g}
    setView=${w}
    filtered=${k}
    jobs=${a}
    isFiltered=${T}
    sorted=${F}
    sortCol=${x}
    sortDir=${N}
    onSort=${Fe}
    onJobClick=${l}
    density=${B}
    setDensity=${Te}
  />`}function tr({setJobs:t,setProjects:e,setProjectPrices:n,setSummary:r,setDataRange:a,toast:s}){const[i,l]=b(!0),[d,c]=b(!0),[_,o]=b(0),[p,v]=b(null),[$,h]=b("Starting dashboard…"),u=S(async({url:g,fallback:w,onData:k,onFinally:T})=>{const{data:F,error:x}=await Bt(g,w);x&&s(x.message||w,"error"),F&&k(F),T&&T()},[s]),m=S(()=>{u({url:"/projects",fallback:"Failed to load projects.",onData:g=>g.projects&&e(g.projects),onFinally:()=>c(!1)}),u({url:"/projects/prices",fallback:"Failed to load project prices.",onData:g=>g.prices&&n(g.prices)})},[u,e,n]),f=S((g=!1)=>{u({url:"/jobs/prices",fallback:g?"Failed to refresh job prices.":"Failed to load job prices.",onData:k=>{k!=null&&k.prices&&t(T=>T.map(F=>{var x;return{...F,final_price:((x=k.prices)==null?void 0:x[F.id])??(g?F.final_price:null)??null}}))}})},[u,t]);return O(()=>{const g=()=>o(T=>Math.min(100,T+100/Ge)),w=(T,F,x)=>(h(`Loading ${T}…`),et(T,F).catch(N=>{const B=N instanceof Error?N.message:F;throw new Error(`Initial dashboard load failed (${x}): ${B}`)}).finally(g)),k=setTimeout(()=>{v("Dashboard load timed out. Check console/network for the failing request."),l(!1),c(!1)},qe);return Promise.all([w("/ui/data","Failed to load jobs.","jobs"),w("/summary","Failed to load summary.","summary"),w("/health/data-range","Failed to load print history range.","history range")]).then(([T,F,x])=>{t(T.jobs),r(F),a(x),l(!1),h("Loading optional data…"),f(!1),m()}).catch(T=>{v(T.message),l(!1),c(!1)}).finally(()=>clearTimeout(k)),()=>clearTimeout(k)},[t,r,a,f,m]),{loading:i,projectsLoading:d,loadProgress:_,error:p,bootStatus:$,refreshProjectsAndPrices:m,refreshJobPrices:f}}function er(t,e,n,r){return t.filter(a=>{const s=`${a.designTitle||""} ${a.customer||""}`.toLowerCase();return!(e&&!s.includes(e.toLowerCase())||n&&(a.status||"").toLowerCase()!==n||r&&a.deviceModel!==r)})}function nr(t,e,n){return[...t].sort((r,a)=>{let s=r[e],i=a[e];if(s==null&&(s=n==="asc"?1/0:-1/0),i==null&&(i=n==="asc"?1/0:-1/0),typeof s=="string"){const c=typeof i=="string"?i:String(i);return n==="asc"?s.localeCompare(c):c.localeCompare(s)}const l=Number(s),d=Number(i);return n==="asc"?l-d:d-l})}const rt=U.bind(A);function rr(){const[t,e]=b([]),[n,r]=b([]),[a,s]=b({}),[i,l]=b(null),[d,c]=b(null),[_,o]=b("table"),[p,v]=b("comfy"),[$,h]=b(""),[u,m]=b(""),[f,g]=b(""),[w,k]=b("startTime"),[T,F]=b("desc"),[x,N]=b(null);return{jobs:t,setJobs:e,projects:n,setProjects:r,projectPrices:a,setProjectPrices:s,summary:i,setSummary:l,dataRange:d,setDataRange:c,view:_,setView:o,density:p,setDensity:v,q:$,setQ:h,statusFilter:u,setStatusFilter:m,deviceFilter:f,setDeviceFilter:g,sortCol:w,setSortCol:k,sortDir:T,setSortDir:F,selectedJob:x,setSelectedJob:N}}function sr({jobs:t,q:e,statusFilter:n,deviceFilter:r,sortCol:a,sortDir:s,setSortCol:i,setSortDir:l,loc:d}){const c=H(()=>[...new Set(t.map(h=>h.deviceModel).filter(h=>!!h))].sort(),[t]),_=!!(e||n||r),o=H(()=>er(t,e,n,r),[t,e,n,r]),p=H(()=>nr(o,a,s),[o,a,s]),v=S(h=>{if(a===h){l(u=>u==="asc"?"desc":"asc");return}i(h),l(()=>h==="startTime"?"desc":"asc")},[a,i,l]),$=H(()=>Xn(d),[d]);return{devices:c,isFiltered:_,filtered:o,sorted:p,handleSort:v,route:$}}function ar({setJobs:t,setProjects:e,setSummary:n,setSelectedJob:r,navigate:a,refreshProjectsAndPrices:s,refreshJobPrices:i}){const l=S((f,g)=>{t(w=>w.map(k=>k.id===f?{...k,...g}:k)),r(w=>w&&w.id===f?{...w,...g}:w)},[]),d=S(async(f,g)=>{const w=await nt(`/jobs/${f}`,g,"Failed to update job.");if(!(w!=null&&w.job))return null;const{job:k}=w;return l(f,k),k},[l]),c=S((f,g)=>{d(f,g)},[d]),_=S(async(f,g)=>{await d(f,{project_id:g})&&s()},[d,s]),o=S((f,g)=>{c(f,{status_override:g})},[c]),p=S((f,g)=>{c(f,{extra_labor_minutes:g})},[c]),v=S(f=>{r(null),a(`/projects/${f}`)},[a]),$=S(()=>{i(!0),s()},[i,s]),h=S(async()=>{$();try{const f=await et("/summary","Failed to refresh summary.");n(f),X("Pricing refreshed from updated rates.","success")}catch(f){const g=f instanceof Error?f.message:"Updated rates saved, but summary refresh failed.";X(g,"error")}},[$,n]),u=S(async()=>{const[f,g]=await Promise.all([et("/ui/data","Failed to refresh jobs."),et("/projects","Failed to refresh projects.")]);t(()=>f.jobs),e(g.projects),$()},[$,e]);return{closeModal:S(()=>r(null),[]),patchJob:d,handleJobProjectChange:_,handleJobStatusChange:o,handleJobExtraLaborChange:p,handleNavigateToProject:v,handleRatesChanged:h,handleAutoGroup:u}}function ir({selectedJob:t,closeModal:e,patchJob:n,projects:r,handleJobProjectChange:a,handleJobStatusChange:s,handleJobExtraLaborChange:i,handleNavigateToProject:l}){return t?rt`<${kn}
    key=${t.id}
    job=${t}
    onClose=${e}
    onPatch=${n}
    projects=${r}
    onJobProjectChange=${a}
    onJobStatusChange=${s}
    onJobExtraLaborChange=${i}
    onNavigateToProject=${l}
  />`:null}function or(t){const e=S(a=>t.setProjects(a),[t.setProjects]),n=S(a=>t.setSummary(a),[t.setSummary]),r=S(a=>t.setDataRange(a),[t.setDataRange]);return tr({setJobs:t.setJobs,setProjects:e,setProjectPrices:t.setProjectPrices,setSummary:n,setDataRange:r,toast:X})}function lr(){const t=rr(),[e,n]=Et(),{loading:r,projectsLoading:a,loadProgress:s,error:i,bootStatus:l,refreshProjectsAndPrices:d,refreshJobPrices:c}=or(t),{devices:_,isFiltered:o,filtered:p,sorted:v,handleSort:$,route:h}=sr({jobs:t.jobs,q:t.q,statusFilter:t.statusFilter,deviceFilter:t.deviceFilter,sortCol:t.sortCol,sortDir:t.sortDir,setSortCol:t.setSortCol,setSortDir:t.setSortDir,loc:e}),{closeModal:u,patchJob:m,handleJobProjectChange:f,handleJobStatusChange:g,handleJobExtraLaborChange:w,handleNavigateToProject:k,handleRatesChanged:T,handleAutoGroup:F}=ar({setJobs:t.setJobs,setProjects:t.setProjects,setSummary:t.setSummary,setSelectedJob:t.setSelectedJob,navigate:n,refreshProjectsAndPrices:d,refreshJobPrices:c});return r?rt`<${Gn} bootStatus=${l} loadProgress=${s} />`:i?rt`<${Qn} error=${i} />`:rt`
    <${dn} summary=${t.summary} dataRange=${t.dataRange} />
    ${Zn({route:h,summary:t.summary,projects:t.projects,setProjects:t.setProjects,jobs:t.jobs,projectsLoading:a,navigate:n,setSelectedJob:t.setSelectedJob,handleJobProjectChange:f,handleRatesChanged:T,handleAutoGroup:F,projectPrices:t.projectPrices,q:t.q,setQ:t.setQ,statusFilter:t.statusFilter,setStatusFilter:t.setStatusFilter,deviceFilter:t.deviceFilter,setDeviceFilter:t.setDeviceFilter,devices:_,view:t.view,setView:t.setView,density:t.density,setDensity:t.setDensity,filtered:p,isFiltered:o,sorted:v,sortCol:t.sortCol,sortDir:t.sortDir,handleSort:$})}
    <${ir}
      selectedJob=${t.selectedJob}
      closeModal=${u}
      patchJob=${m}
      projects=${t.projects}
      handleJobProjectChange=${f}
      handleJobStatusChange=${g}
      handleJobExtraLaborChange=${w}
      handleNavigateToProject=${k}
    />
    <${We} />
  `}const cr=rt`<${te} base="/ui"><${lr} /></${te}>`;De(cr,document.getElementById("app"));
