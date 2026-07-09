(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();var At,I,Ue,at,be,Ae,Re,Qt,Mt,Pt,Oe,ae,Yt,Xt,He,Bt={},Et=[],fn=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Rt=Array.isArray;function Z(t,e){for(var n in e)t[n]=e[n];return t}function se(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function T(t,e,n){var a,s,i,r={};for(i in e)i=="key"?a=e[i]:i=="ref"?s=e[i]:r[i]=e[i];if(arguments.length>2&&(r.children=arguments.length>3?At.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(i in t.defaultProps)r[i]===void 0&&(r[i]=t.defaultProps[i]);return xt(t,r,a,s,null)}function xt(t,e,n,a,s){var i={type:t,props:e,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:s??++Ue,__i:-1,__u:0};return s==null&&I.vnode!=null&&I.vnode(i),i}function Ot(t){return t.children}function Dt(t,e){this.props=t,this.context=e}function ft(t,e){if(e==null)return t.__?ft(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?ft(t):null}function gn(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,a=[],s=[],i=Z({},e);i.__v=e.__v+1,I.vnode&&I.vnode(i),ie(t.__P,i,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,a,n??ft(e),!!(32&e.__u),s),i.__v=e.__v,i.__.__k[i.__i]=i,Ve(a,i,s),e.__e=e.__=null,i.__e!=n&&qe(i)}}function qe(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),qe(t)}function Zt(t){(!t.__d&&(t.__d=!0)&&at.push(t)&&!Ut.__r++||be!=I.debounceRendering)&&((be=I.debounceRendering)||Ae)(Ut)}function Ut(){try{for(var t,e=1;at.length;)at.length>e&&at.sort(Re),t=at.shift(),e=at.length,gn(t)}finally{at.length=Ut.__r=0}}function We(t,e,n,a,s,i,r,u,d,p,c){var o,l,_,f,y,m,g,$=a&&a.__k||Et,b=e.length;for(d=hn(n,e,$,d,b),o=0;o<b;o++)(_=n.__k[o])!=null&&(l=_.__i!=-1&&$[_.__i]||Bt,_.__i=o,m=ie(t,_,l,s,i,r,u,d,p,c),f=_.__e,_.ref&&l.ref!=_.ref&&(l.ref&&re(l.ref,null,_),c.push(_.ref,_.__c||f,_)),y==null&&f!=null&&(y=f),(g=!!(4&_.__u))||l.__k===_.__k?(d=Qe(_,d,t,g),g&&l.__e&&(l.__e=null)):typeof _.type=="function"&&m!==void 0?d=m:f&&(d=f.nextSibling),_.__u&=-7);return n.__e=y,d}function hn(t,e,n,a,s){var i,r,u,d,p,c=n.length,o=c,l=0;for(t.__k=new Array(s),i=0;i<s;i++)(r=e[i])!=null&&typeof r!="boolean"&&typeof r!="function"?(typeof r=="string"||typeof r=="number"||typeof r=="bigint"||r.constructor==String?r=t.__k[i]=xt(null,r,null,null,null):Rt(r)?r=t.__k[i]=xt(Ot,{children:r},null,null,null):r.constructor===void 0&&r.__b>0?r=t.__k[i]=xt(r.type,r.props,r.key,r.ref?r.ref:null,r.__v):t.__k[i]=r,d=i+l,r.__=t,r.__b=t.__b+1,u=null,(p=r.__i=bn(r,n,d,o))!=-1&&(o--,(u=n[p])&&(u.__u|=2)),u==null||u.__v==null?(p==-1&&(s>c?l--:s<c&&l++),typeof r.type!="function"&&(r.__u|=4)):p!=d&&(p==d-1?l--:p==d+1?l++:(p>d?l--:l++,r.__u|=4))):t.__k[i]=null;if(o)for(i=0;i<c;i++)(u=n[i])!=null&&(2&u.__u)==0&&(u.__e==a&&(a=ft(u)),ze(u,u));return a}function Qe(t,e,n,a){var s,i;if(typeof t.type=="function"){for(s=t.__k,i=0;s&&i<s.length;i++)s[i]&&(s[i].__=t,e=Qe(s[i],e,n,a));return e}t.__e!=e&&(a&&(e&&t.type&&!e.parentNode&&(e=ft(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function bn(t,e,n,a){var s,i,r,u=t.key,d=t.type,p=e[n],c=p!=null&&(2&p.__u)==0;if(p===null&&u==null||c&&u==p.key&&d==p.type)return n;if(a>(c?1:0)){for(s=n-1,i=n+1;s>=0||i<e.length;)if((p=e[r=s>=0?s--:i++])!=null&&(2&p.__u)==0&&u==p.key&&d==p.type)return r}return-1}function ye(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||fn.test(e)?n:n+"px"}function Tt(t,e,n,a,s){var i,r;t:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof a=="string"&&(t.style.cssText=a=""),a)for(e in a)n&&e in n||ye(t.style,e,"");if(n)for(e in n)a&&n[e]==a[e]||ye(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")i=e!=(e=e.replace(Oe,"$1")),r=e.toLowerCase(),e=r in t||e=="onFocusOut"||e=="onFocusIn"?r.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+i]=n,n?a?n[Pt]=a[Pt]:(n[Pt]=ae,t.addEventListener(e,i?Xt:Yt,i)):t.removeEventListener(e,i?Xt:Yt,i);else{if(s=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break t}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function Pe(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[Mt]==null)e[Mt]=ae++;else if(e[Mt]<n[Pt])return;return n(I.event?I.event(e):e)}}}function ie(t,e,n,a,s,i,r,u,d,p){var c,o,l,_,f,y,m,g,$,b,P,w,h,k,S,N=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),i=[u=e.__e=n.__e]),(c=I.__b)&&c(e);t:if(typeof N=="function")try{if(g=e.props,$=N.prototype&&N.prototype.render,b=(c=N.contextType)&&a[c.__c],P=c?b?b.props.value:c.__:a,n.__c?m=(o=e.__c=n.__c).__=o.__E:($?e.__c=o=new N(g,P):(e.__c=o=new Dt(g,P),o.constructor=N,o.render=Pn),b&&b.sub(o),o.state||(o.state={}),o.__n=a,l=o.__d=!0,o.__h=[],o._sb=[]),$&&o.__s==null&&(o.__s=o.state),$&&N.getDerivedStateFromProps!=null&&(o.__s==o.state&&(o.__s=Z({},o.__s)),Z(o.__s,N.getDerivedStateFromProps(g,o.__s))),_=o.props,f=o.state,o.__v=e,l)$&&N.getDerivedStateFromProps==null&&o.componentWillMount!=null&&o.componentWillMount(),$&&o.componentDidMount!=null&&o.__h.push(o.componentDidMount);else{if($&&N.getDerivedStateFromProps==null&&g!==_&&o.componentWillReceiveProps!=null&&o.componentWillReceiveProps(g,P),e.__v==n.__v||!o.__e&&o.shouldComponentUpdate!=null&&o.shouldComponentUpdate(g,o.__s,P)===!1){e.__v!=n.__v&&(o.props=g,o.state=o.__s,o.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(O){O&&(O.__=e)}),Et.push.apply(o.__h,o._sb),o._sb=[],o.__h.length&&r.push(o);break t}o.componentWillUpdate!=null&&o.componentWillUpdate(g,o.__s,P),$&&o.componentDidUpdate!=null&&o.__h.push(function(){o.componentDidUpdate(_,f,y)})}if(o.context=P,o.props=g,o.__P=t,o.__e=!1,w=I.__r,h=0,$)o.state=o.__s,o.__d=!1,w&&w(e),c=o.render(o.props,o.state,o.context),Et.push.apply(o.__h,o._sb),o._sb=[];else do o.__d=!1,w&&w(e),c=o.render(o.props,o.state,o.context),o.state=o.__s;while(o.__d&&++h<25);o.state=o.__s,o.getChildContext!=null&&(a=Z(Z({},a),o.getChildContext())),$&&!l&&o.getSnapshotBeforeUpdate!=null&&(y=o.getSnapshotBeforeUpdate(_,f)),k=c!=null&&c.type===Ot&&c.key==null?Ge(c.props.children):c,u=We(t,Rt(k)?k:[k],e,n,a,s,i,r,u,d,p),o.base=e.__e,e.__u&=-161,o.__h.length&&r.push(o),m&&(o.__E=o.__=null)}catch(O){if(e.__v=null,d||i!=null)if(O.then){for(e.__u|=d?160:128;u&&u.nodeType==8&&u.nextSibling;)u=u.nextSibling;i[i.indexOf(u)]=null,e.__e=u}else{for(S=i.length;S--;)se(i[S]);te(e)}else e.__e=n.__e,e.__k=n.__k,O.then||te(e);I.__e(O,e,n)}else i==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):u=e.__e=yn(n.__e,e,n,a,s,i,r,d,p);return(c=I.diffed)&&c(e),128&e.__u?void 0:u}function te(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(te))}function Ve(t,e,n){for(var a=0;a<n.length;a++)re(n[a],n[++a],n[++a]);I.__c&&I.__c(e,t),t.some(function(s){try{t=s.__h,s.__h=[],t.some(function(i){i.call(s)})}catch(i){I.__e(i,s.__v)}})}function Ge(t){return typeof t!="object"||t==null||t.__b>0?t:Rt(t)?t.map(Ge):Z({},t)}function yn(t,e,n,a,s,i,r,u,d){var p,c,o,l,_,f,y,m=n.props||Bt,g=e.props,$=e.type;if($=="svg"?s="http://www.w3.org/2000/svg":$=="math"?s="http://www.w3.org/1998/Math/MathML":s||(s="http://www.w3.org/1999/xhtml"),i!=null){for(p=0;p<i.length;p++)if((_=i[p])&&"setAttribute"in _==!!$&&($?_.localName==$:_.nodeType==3)){t=_,i[p]=null;break}}if(t==null){if($==null)return document.createTextNode(g);t=document.createElementNS(s,$,g.is&&g),u&&(I.__m&&I.__m(e,i),u=!1),i=null}if($==null)m===g||u&&t.data==g||(t.data=g);else{if(i=i&&At.call(t.childNodes),!u&&i!=null)for(m={},p=0;p<t.attributes.length;p++)m[(_=t.attributes[p]).name]=_.value;for(p in m)_=m[p],p=="dangerouslySetInnerHTML"?o=_:p=="children"||p in g||p=="value"&&"defaultValue"in g||p=="checked"&&"defaultChecked"in g||Tt(t,p,null,_,s);for(p in g)_=g[p],p=="children"?l=_:p=="dangerouslySetInnerHTML"?c=_:p=="value"?f=_:p=="checked"?y=_:u&&typeof _!="function"||m[p]===_||Tt(t,p,_,m[p],s);if(c)u||o&&(c.__html==o.__html||c.__html==t.innerHTML)||(t.innerHTML=c.__html),e.__k=[];else if(o&&(t.innerHTML=""),We(e.type=="template"?t.content:t,Rt(l)?l:[l],e,n,a,$=="foreignObject"?"http://www.w3.org/1999/xhtml":s,i,r,i?i[0]:n.__k&&ft(n,0),u,d),i!=null)for(p=i.length;p--;)se(i[p]);u||(p="value",$=="progress"&&f==null?t.removeAttribute("value"):f!=null&&(f!==t[p]||$=="progress"&&!f||$=="option"&&f!=m[p])&&Tt(t,p,f,m[p],s),p="checked",y!=null&&y!=t[p]&&Tt(t,p,y,m[p],s))}return t}function re(t,e,n){try{if(typeof t=="function"){var a=typeof t.__u=="function";a&&t.__u(),a&&e==null||(t.__u=t(e))}else t.current=e}catch(s){I.__e(s,n)}}function ze(t,e,n){var a,s;if(I.unmount&&I.unmount(t),(a=t.ref)&&(a.current&&a.current!=t.__e||re(a,null,e)),(a=t.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(i){I.__e(i,e)}a.base=a.__P=null}if(a=t.__k)for(s=0;s<a.length;s++)a[s]&&ze(a[s],e,n||typeof t.type!="function");n||se(t.__e),t.__c=t.__=t.__e=void 0}function Pn(t,e,n){return this.constructor(t,n)}function kn(t,e,n){var a,s,i,r;e==document&&(e=document.documentElement),I.__&&I.__(t,e),s=(a=!1)?null:e.__k,i=[],r=[],ie(e,t=e.__k=T(Ot,null,[t]),s||Bt,Bt,e.namespaceURI,s?null:e.firstChild?At.call(e.childNodes):null,i,s?s.__e:e.firstChild,a,r),Ve(i,t,r)}function wn(t){function e(n){var a,s;return this.getChildContext||(a=new Set,(s={})[e.__c]=this,this.getChildContext=function(){return s},this.componentWillUnmount=function(){a=null},this.shouldComponentUpdate=function(i){this.props.value!=i.value&&a.forEach(function(r){r.__e=!0,Zt(r)})},this.sub=function(i){a.add(i);var r=i.componentWillUnmount;i.componentWillUnmount=function(){a&&a.delete(i),r&&r.call(i)}}),n.children}return e.__c="__cC"+He++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,a){return n.children(a)}).contextType=e,e}At=Et.slice,I={__e:function(t,e,n,a){for(var s,i,r;e=e.__;)if((s=e.__c)&&!s.__)try{if((i=s.constructor)&&i.getDerivedStateFromError!=null&&(s.setState(i.getDerivedStateFromError(t)),r=s.__d),s.componentDidCatch!=null&&(s.componentDidCatch(t,a||{}),r=s.__d),r)return s.__E=s}catch(u){t=u}throw t}},Ue=0,Dt.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=Z({},this.state),typeof t=="function"&&(t=t(Z({},n),this.props)),t&&Z(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),Zt(this))},Dt.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Zt(this))},Dt.prototype.render=Ot,at=[],Ae=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Re=function(t,e){return t.__v.__b-e.__v.__b},Ut.__r=0,Qt=Math.random().toString(8),Mt="__d"+Qt,Pt="__a"+Qt,Oe=/(PointerCapture)$|Capture$/i,ae=0,Yt=Pe(!1),Xt=Pe(!0),He=0;var gt,M,Vt,ke,Ct=0,Ke=[],E=I,we=E.__b,Ce=E.__r,Se=E.diffed,Fe=E.__c,Ie=E.unmount,Te=E.__;function Ht(t,e){E.__h&&E.__h(M,t,Ct||e),Ct=0;var n=M.__H||(M.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function v(t){return Ct=1,Cn(Ze,t)}function Cn(t,e,n){var a=Ht(gt++,2);if(a.t=t,!a.__c&&(a.__=[Ze(void 0,e),function(u){var d=a.__N?a.__N[0]:a.__[0],p=a.t(d,u);d!==p&&(a.__N=[p,a.__[1]],a.__c.setState({}))}],a.__c=M,!M.__f)){var s=function(u,d,p){if(!a.__c.__H)return!0;var c=a.__c.__H.__.filter(function(l){return l.__c});if(c.every(function(l){return!l.__N}))return!i||i.call(this,u,d,p);var o=a.__c.props!==u;return c.some(function(l){if(l.__N){var _=l.__[0];l.__=l.__N,l.__N=void 0,_!==l.__[0]&&(o=!0)}}),i&&i.call(this,u,d,p)||o};M.__f=!0;var i=M.shouldComponentUpdate,r=M.componentWillUpdate;M.componentWillUpdate=function(u,d,p){if(this.__e){var c=i;i=void 0,s(u,d,p),i=c}r&&r.call(this,u,d,p)},M.shouldComponentUpdate=s}return a.__N||a.__}function R(t,e){var n=Ht(gt++,3);!E.__s&&Xe(n.__H,e)&&(n.__=t,n.u=e,M.__H.__h.push(n))}function Ye(t){return Ct=5,W(function(){return{current:t}},[])}function W(t,e){var n=Ht(gt++,7);return Xe(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function C(t,e){return Ct=8,W(function(){return t},e)}function Sn(t){var e=M.context[t.__c],n=Ht(gt++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(M)),e.props.value):t.__}function Fn(){for(var t;t=Ke.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(Jt),e.__h.some(ee),e.__h=[]}catch(n){e.__h=[],E.__e(n,t.__v)}}}E.__b=function(t){M=null,we&&we(t)},E.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Te&&Te(t,e)},E.__r=function(t){Ce&&Ce(t),gt=0;var e=(M=t.__c).__H;e&&(Vt===M?(e.__h=[],M.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(Jt),e.__h.some(ee),e.__h=[],gt=0)),Vt=M},E.diffed=function(t){Se&&Se(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Ke.push(e)!==1&&ke===E.requestAnimationFrame||((ke=E.requestAnimationFrame)||In)(Fn)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),Vt=M=null},E.__c=function(t,e){e.some(function(n){try{n.__h.some(Jt),n.__h=n.__h.filter(function(a){return!a.__||ee(a)})}catch(a){e.some(function(s){s.__h&&(s.__h=[])}),e=[],E.__e(a,n.__v)}}),Fe&&Fe(t,e)},E.unmount=function(t){Ie&&Ie(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(a){try{Jt(a)}catch(s){e=s}}),n.__H=void 0,e&&E.__e(e,n.__v))};var Ne=typeof requestAnimationFrame=="function";function In(t){var e,n=function(){clearTimeout(a),Ne&&cancelAnimationFrame(e),setTimeout(t)},a=setTimeout(n,35);Ne&&(e=requestAnimationFrame(n))}function Jt(t){var e=M,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),M=e}function ee(t){var e=M;t.__c=t.__(),M=e}function Xe(t,e){return!t||t.length!==e.length||e.some(function(n,a){return n!==t[a]})}function Ze(t,e){return typeof e=="function"?e(t):e}var tn=function(t,e,n,a){var s;e[0]=0;for(var i=1;i<e.length;i++){var r=e[i++],u=e[i]?(e[0]|=r?1:2,n[e[i++]]):e[++i];r===3?a[0]=u:r===4?a[1]=Object.assign(a[1]||{},u):r===5?(a[1]=a[1]||{})[e[++i]]=u:r===6?a[1][e[++i]]+=u+"":r?(s=t.apply(u,tn(t,u,n,["",null])),a.push(s),u[0]?e[0]|=2:(e[i-2]=0,e[i]=s)):a.push(u)}return a},je=new Map;function L(t){var e=je.get(this);return e||(e=new Map,je.set(this,e)),(e=tn(this,e.get(t)||(e.set(t,e=(function(n){for(var a,s,i=1,r="",u="",d=[0],p=function(l){i===1&&(l||(r=r.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,l,r):i===3&&(l||r)?(d.push(3,l,r),i=2):i===2&&r==="..."&&l?d.push(4,l,0):i===2&&r&&!l?d.push(5,0,!0,r):i>=5&&((r||!l&&i===5)&&(d.push(i,0,r,s),i=6),l&&(d.push(i,l,0,s),i=6)),r=""},c=0;c<n.length;c++){c&&(i===1&&p(),p(c));for(var o=0;o<n[c].length;o++)a=n[c][o],i===1?a==="<"?(p(),d=[d],i=3):r+=a:i===4?r==="--"&&a===">"?(i=1,r=""):r=a+r[0]:u?a===u?u="":r+=a:a==='"'||a==="'"?u=a:a===">"?(p(),i=1):i&&(a==="="?(i=5,s=r,r=""):a==="/"&&(i<5||n[c][o+1]===">")?(p(),i===3&&(d=d[0]),i=d,(d=d[0]).push(2,0,i),i=0):a===" "||a==="	"||a===`
`||a==="\r"?(p(),i=2):r+=a),i===3&&r==="!--"&&(i=4,d=d[0])}return p(),d})(t)),e),arguments,[])).length>1?e:e[0]}const Tn=L.bind(T),ne=wn(null);function Le({base:t,children:e}){const n=t.endsWith("/")?t.slice(0,-1):t,a=u=>u===n||u===n+"/"?"/":u.startsWith(n+"/")?u.slice(n.length)||"/":u,[s,i]=v(()=>a(location.pathname));R(()=>{const u=()=>i(a(location.pathname));return window.addEventListener("popstate",u),()=>window.removeEventListener("popstate",u)},[n]);const r=C(u=>{const d=u==="/"?n+"/":n+u;history.pushState(null,"",d),i(u)},[n]);return Tn`<${ne.Provider} value=${[s,r]}>${e}</${ne.Provider}>`}function oe(){const t=Sn(ne);if(!t)throw new Error("useLocation must be used within RouterProvider");return t}function ot(t){if(!t)return"—";const e=Math.floor(t/3600),n=Math.floor(t%3600/60);return e===0?`${n}m`:`${e}h${n>0?` ${n}m`:""}`}function le(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"};return e.toLocaleString(void 0,a)}function rt(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric"}:{month:"short",day:"numeric",year:"2-digit"};return e.toLocaleDateString(void 0,a)}function A(t){return"$"+t.toFixed(2)}function Ft(t){return t==null?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function ce(t){return t?t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${Math.round(t)} g`:"0 g"}const dt=L.bind(T),Nn={finish:"badge badge-finish",running:"badge badge-running",failed:"badge badge-failed",cancel:"badge badge-cancel",pause:"badge badge-pause"};function It({status:t}){const e=(t||"").toLowerCase();return dt`<span class=${Nn[e]||"badge badge-default"}>${e||"unknown"}</span>`}function qt({url:t}){const[e,n]=v(!1);return!t||e?dt`<div class="row-thumb-ph">🖨</div>`:dt`<img
    class="row-thumb"
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>n(!0)}
  />`}function jn({url:t,className:e}){const[n,a]=v(!1);return!t||n?dt`<div class="cover-placeholder">🖨</div>`:dt`<img
    class=${e}
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>a(!0)}
  />`}function Wt({colors:t}){if(!(t!=null&&t.length))return null;const e=[...new Set(t.map(n=>n.slice(0,6).toUpperCase()))].filter(n=>n!=="FFFFFF");return e.length?dt`<span class="swatches"
    >${e.map(n=>dt`<span class="swatch" style=${"background:#"+n} title=${"#"+n} />`)}</span
  >`:null}const Me=L.bind(T);let en=()=>{};function x(t,e="info"){en({message:t,type:e,id:Date.now()+Math.random()})}function Ln(){const[t,e]=v([]),n=Ye(new Map);en=C(s=>{e(r=>[...r,s]);const i=setTimeout(()=>{e(r=>r.filter(u=>u.id!==s.id)),n.current.delete(s.id)},3500);n.current.set(s.id,i)},[]);const a=C(s=>{const i=n.current.get(s);i&&clearTimeout(i),n.current.delete(s),e(r=>r.filter(u=>u.id!==s))},[]);return t.length?Me`
    <div class="toast-container">
      ${t.map(s=>Me`
          <div class="toast toast-${s.type}" key=${s.id} onClick=${()=>a(s.id)}>
            ${s.message}
          </div>
        `)}
    </div>
  `:null}const Mn=15e3,xn=2e4,Dn=5,de=[{id:"personal",label:"Personal"},{id:"booth",label:"Booth"},{id:"etsy",label:"Etsy"},{id:"custom",label:"Custom"}];async function Jn(t,e){try{const n=await t.json();return typeof n.error=="string"?n.error:e}catch{return e}}function Bn(t){const{timeoutMs:e=Mn,...n}=t??{};return n.signal||e===null?n:{signal:AbortSignal.timeout(e),...n}}function En(t,e){return(t==null?void 0:t.name)==="TimeoutError"?new Error(`${e} (request timed out)`):new Error(`${e} (network error)`)}async function V(t,e,n){let a;try{a=await fetch(t,Bn(n))}catch(s){throw En(s,e)}if(!a.ok)throw new Error(await Jn(a,e));return await a.json()}async function ue(t,e,n){try{return{data:await V(t,e,n),error:null}}catch(a){return{data:null,error:a instanceof Error?a:new Error(e)}}}async function ut(t,e,n){const{data:a,error:s}=await ue(t,e,n);return s?(x(s.message||e,"error"),null):a}async function tt(t,e,n){return ut(t,n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}async function z(t,e,n,a){return ut(t,n,{...a,method:"POST",headers:{"Content-Type":"application/json",...a==null?void 0:a.headers},body:JSON.stringify(e)})}async function Un(){return(await V("/api/projects","Failed to load projects.")).projects}async function pe(){return(await V("/api/products","Failed to load products.")).products}async function An(t){return(await V(`/api/products/${t}`,"Failed to load product.")).product}async function Rn(){return(await V("/api/products/print-next","Failed to load print-next products.")).products}async function On(t){const e=await z("/api/products",t,"Failed to create product.");return(e==null?void 0:e.product)??null}async function Hn(t){const e=await z(`/api/products/from-job/${t}`,{},"Failed to create product from job.");return(e==null?void 0:e.product)??null}async function nn(t){const e=await z(`/api/products/from-project/${t}`,{},"Failed to create product from project.");return(e==null?void 0:e.product)??null}async function _e(t,e){const n=await tt(`/api/products/${t}`,e,"Failed to update product.");return(n==null?void 0:n.product)??null}async function qn(){return(await V("/api/batches","Failed to load batches.")).batches}async function Wn(t){return(await V(`/api/batches/${t}`,"Failed to load batch.")).batch}async function Qn(t){const e=await z("/api/batches",t,"Failed to create batch.");return(e==null?void 0:e.batch)??null}async function Vn(t,e){const n=await tt(`/api/batches/${t}`,e,"Failed to update batch.");return(n==null?void 0:n.batch)??null}async function Gn(t,e){const n=await z(`/api/batches/${t}/projects/${e}`,{},"Failed to add project jobs to batch.");return(n==null?void 0:n.batch)??null}const H=L.bind(T);function zn(t){const e=t.toLowerCase();return e.includes("a1 mini")?"/ui/printers/a1-mini":e.includes("p1s")?"/ui/printers/p1s":null}function Kn(t){const e=new Map;for(const n of t){const a=n.deviceModel||"Unknown printer",s=e.get(a)??[];s.push(n),e.set(a,s)}return e}function an(t,e=6){return t.slice().sort((n,a)=>String(a.startTime||"").localeCompare(String(n.startTime||""))).slice(0,e)}function sn({printerName:t}){const e=zn(t);return e?H`<img class="printer-photo" src=${e} alt=${t} />`:H`<div class="printer-photo">🖨️</div>`}function rn({job:t,onJobClick:e}){return H`
    <article class="printer-job-row" key=${t.id} onClick=${()=>e(t)}>
      <div class="printer-job-top">
        <div class="td-thumb"><${qt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title">${t.designTitle||"Untitled Job"}</span>
          <${Wt} colors=${t.filament_colors} />
        </div>
        <${It} status=${t.status} />
      </div>
      <div class="printer-job-bottom">
        <span>${rt(t.startTime)}</span>
        <span>Filament: <strong>${Ft(t.total_weight_g)}</strong></span>
        <span>Time: <strong>${ot(t.total_time_s)}</strong></span>
      </div>
    </article>
  `}function Yn({row:t,jobs:e,onJobClick:n}){const a=t.deviceModel||"Unknown printer",s=an(e);return H`
    <section class="printer-card" key=${a}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${sn} printerName=${a} />
          <div>
            <h3>${a}</h3>
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
        ${s.length?s.map(i=>H`<${rn} key=${i.id} job=${i} onJobClick=${n} />`):H`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function Xn({printer:t,jobs:e,onJobClick:n,onToggleActive:a}){const s=t.name||t.model||t.provider_printer_id,i=an(e),r=t.is_active===1;return H`
    <section class=${"printer-card"+(r?"":" is-retired")} key=${t.id}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${sn} printerName=${t.model||s} />
          <div>
            <h3>${s}</h3>
            <p class="printer-meta">
              <span class="printer-meta-jobs"
                >${t.provider_display_name||t.provider}</span
              >
              <span class="printer-meta-dot">•</span>
              <span class="printer-meta-hours">${t.model||"Unknown model"}</span>
              <span class="printer-meta-dot">•</span>
              <span class=${r?"status-pill paid":"status-pill cancel"}
                >${r?"Active":"Retired"}</span
              >
            </p>
            ${t.retired_at?H`<p class="printer-meta">Retired ${rt(t.retired_at)}</p>`:null}
          </div>
        </div>
        <div class="printer-kpis">
          <span><strong>${t.job_count.toLocaleString()}</strong> Jobs</span>
          <span><strong>${t.task_count.toLocaleString()}</strong> Records</span>
          <span><strong>${((t.total_time_s??0)/3600).toFixed(1)}</strong> Hours</span>
        </div>
      </div>

      <div class="printer-card-footer">
        <button class="view-btn" onClick=${()=>a(t)}>
          ${r?"Mark retired":"Reactivate"}
        </button>
      </div>

      <div class="printer-jobs-list">
        ${i.length?i.map(u=>H`<${rn} key=${u.id} job=${u} onJobClick=${n} />`):H`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function Zn(t,e){return e.filter(n=>n.printer_id===t.id)}function ta({summary:t,jobs:e,onJobClick:n}){const[a,s]=v([]);R(()=>{ut("/printers","Failed to load printer inventory.").then(d=>{d&&s(d.printers)})},[]);const i=async d=>{const p=await tt(`/printers/${d.id}`,{is_active:d.is_active!==1},"Failed to update printer inventory.");p!=null&&p.printer&&s(c=>c.map(o=>o.id===d.id?p.printer:o))};if(a.length)return H`
      <div class="printer-grid">
        ${a.map(d=>H`<${Xn}
              key=${d.id}
              printer=${d}
              jobs=${Zn(d,e)}
              onJobClick=${n}
              onToggleActive=${i}
            />`)}
      </div>
    `;const r=(t==null?void 0:t.by_device)??[];if(!r.length)return H`<div class="empty">No printer totals available yet.</div>`;const u=Kn(e);return H`
    <div class="printer-grid">
      ${r.map(d=>H`<${Yn}
            key=${d.deviceModel||"Unknown printer"}
            row=${d}
            jobs=${u.get(d.deviceModel||"Unknown printer")??[]}
            onJobClick=${n}
          />`)}
    </div>
  `}const J=L.bind(T);function ea(t){return!t.startsWith("/projects")&&!t.startsWith("/admin")&&!t.startsWith("/printers")&&!t.startsWith("/catalog")&&!t.startsWith("/products")&&!t.startsWith("/batches")}function na(t,e){const n=new URLSearchParams;t&&n.set("status",t),e&&n.set("device",e);const a=n.toString();return"/jobs/export.csv"+(a?"?"+a:"")}function aa(t){return t.reduce((e,n)=>(e.weight+=n.total_weight_g||0,e.time+=n.total_time_s||0,e),{weight:0,time:0})}function sa(t){return!t||t==="actual"?null:t==="slicer_estimate"?"estimate":t==="manual"?"manual":"unknown"}function on({confidence:t}){const e=sa(t);return e?J`<span class="usage-confidence">${e}</span>`:null}const ia=[{label:"Jobs",path:"/",active:ea},{label:"Projects",path:"/projects",active:t=>t.startsWith("/projects")},{label:"Printers",path:"/printers",active:t=>t.startsWith("/printers")},{label:"Products",path:"/products/pipeline",active:t=>t.startsWith("/products")},{label:"Batches",path:"/batches",active:t=>t.startsWith("/batches")},{label:"Catalog",path:"/catalog",active:t=>t.startsWith("/catalog")},{label:"Rates",path:"/admin",active:t=>t.startsWith("/admin")}],ra=[["","All Statuses"],["finish","Finished"],["cancel","Cancelled"],["running","Running"],["failed","Failed"],["pause","Paused"]];function Gt(t,e){const n=(t==null?void 0:t.by_device)??[];return n.length?n.map(a=>{const s=a.deviceModel||"Unknown printer";return e==="jobs"?`${s}: ${(a.total_jobs??0).toLocaleString()} jobs`:e==="plates"?`${s}: ${(a.total_plates??0).toLocaleString()} plates`:`${s}: ${((a.total_time_s??0)/3600).toFixed(1).toLocaleString()} h`}).join(`
`):"No printer breakdown available"}function oa({loc:t,navigate:e}){return J`<nav class="top-nav">
    ${ia.map(n=>{const a=n.active(t);return J`
        <button
          key=${n.label}
          class=${"nav-btn"+(a?" active":"")}
          onClick=${()=>e(n.path)}
        >
          ${n.label}
        </button>
      `})}
  </nav>`}function la({summary:t}){var n,a;const e=t==null?void 0:t.totals;return J`
    <div class="stats">
      <div class="stat" title=${Gt(t,"jobs")}>
        <div class="stat-val">${e?(n=e.total_jobs)==null?void 0:n.toLocaleString():"—"}</div>
        <div class="stat-lbl">Total Jobs</div>
      </div>
      <div class="stat">
        <div class="stat-val">${e?((e.total_weight_g??0)/1e3).toFixed(2):"—"}</div>
        <div class="stat-lbl">Filament kg</div>
      </div>
      <div class="stat" title=${Gt(t,"hours")}>
        <div class="stat-val">${e?((e.total_time_s??0)/3600).toFixed(1):"—"}</div>
        <div class="stat-lbl">Print Hours</div>
      </div>
      <div class="stat" title=${Gt(t,"plates")}>
        <div class="stat-val">${e?(a=e.total_plates)==null?void 0:a.toLocaleString():"—"}</div>
        <div class="stat-lbl">Plates</div>
      </div>
    </div>
  `}function ca({summary:t,dataRange:e}){const[n,a]=oe(),s=!!(e!=null&&e.min_start&&(e!=null&&e.max_start)),i=(e==null?void 0:e.min_start)??"",r=(e==null?void 0:e.max_start)??"";return J`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>PrintWorks</span></h1>
        ${s&&J`<div class="header-range">
          History: ${rt(i)} → ${rt(r)}
          (${((e==null?void 0:e.task_count)||0).toLocaleString()} tasks)
        </div>`}
        <${oa} loc=${n} navigate=${a} />
      </div>
      <${la} summary=${t} />
    </header>
  `}function da({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:s,setDeviceFilter:i,devices:r,view:u,setView:d,density:p,setDensity:c,filteredCount:o,totalCount:l}){const _=W(()=>na(n,s),[n,s]);return J`
    <div class="toolbar">
      <input
        type="search"
        placeholder="Search title or customer…"
        value=${t}
        onInput=${f=>e(f.target.value)}
      />
      <select
        value=${n}
        onChange=${f=>a(f.target.value)}
      >
        ${ra.map(([f,y])=>J`<option key=${f} value=${f}>${y}</option> `)}
      </select>
      <select
        value=${s}
        onChange=${f=>i(f.target.value)}
      >
        <option value="">All Printers</option>
        ${r.map(f=>J`<option key=${f} value=${f}>${f}</option> `)}
      </select>
      <div class="view-toggle">
        <button
          class=${"view-btn"+(u==="table"?" active":"")}
          onClick=${()=>d("table")}
        >
          ☰ Table
        </button>
        <button
          class=${"view-btn"+(u==="grid"?" active":"")}
          onClick=${()=>d("grid")}
        >
          ⊞ Grid
        </button>
      </div>
      <div class="toolbar-right">
        <div class="density-toggle">
          <button
            class=${"density-btn"+(p==="compact"?" active":"")}
            onClick=${()=>c("compact")}
          >
            Compact
          </button>
          <button
            class=${"density-btn"+(p==="comfy"?" active":"")}
            onClick=${()=>c("comfy")}
          >
            Comfy
          </button>
        </div>
        <a class="btn-csv" href=${_} download>↓ CSV</a>
        <span class="job-count">${o} / ${l} jobs</span>
      </div>
    </div>
  `}function ua({filtered:t,isFiltered:e}){if(!e||!t.length)return null;const n=aa(t);return J`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${t.length}</strong></span>
      <span>Filament: <strong>${ce(n.weight)}</strong></span>
      <span>Print time: <strong>${ot(n.time)}</strong></span>
    </div>
  `}function ln({printRun:t}){return(t??1)<=1?null:J`<span class="run-badge">Run ${t}</span>`}function pa({sortCol:t,sortDir:e,onSort:n}){return J`<div class="jobs-record-sortbar">
    <span class="jobs-record-sort-label">Sort</span>
    ${[{col:"startTime",label:"Date"},{col:"designTitle",label:"Title"},{col:"deviceModel",label:"Printer"},{col:"total_weight_g",label:"Filament"},{col:"total_time_s",label:"Time"},{col:"final_price",label:"Price"}].map(({col:s,label:i})=>{const r=t===s;return J`
        <button
          key=${s}
          class=${"jobs-record-sort-btn"+(r?" active":"")}
          onClick=${()=>n(s)}
        >
          ${i}${r?e==="asc"?" ↑":" ↓":""}
        </button>
      `})}
  </div>`}function _a({job:t,onJobClick:e}){return J`
    <article class="jobs-record-row" onClick=${()=>e(t)}>
      <div class="jobs-record-top">
        <div class="td-thumb"><${qt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title" title=${t.designTitle||"Untitled"}
            >${t.designTitle||"Untitled Job"}</span
          >
          <${ln} printRun=${t.print_run} />
          <${Wt} colors=${t.filament_colors} />
        </div>
        <div><${It} status=${t.status} /></div>
      </div>
      <div class="jobs-record-bottom">
        <span>🖨 ${t.deviceModel||"—"}</span>
        <span title=${le(t.startTime)}>📅 ${rt(t.startTime)}</span>
        <span
          >🧵 <strong>${Ft(t.total_weight_g)}</strong>
          <${on} confidence=${t.material_usage_confidence} />
        </span>
        <span>⏱ <strong>${ot(t.total_time_s)}</strong></span>
        <span
          >💰 <strong>${t.final_price!=null?A(t.final_price):"—"}</strong></span
        >
        <span>🧱 <strong>${t.plate_count??"—"}</strong></span>
        ${t.customer?J`<span class="customer-pill">${t.customer}</span>`:null}
      </div>
    </article>
  `}function ma({sorted:t,sortCol:e,sortDir:n,onSort:a,onJobClick:s,density:i}){return J`
    <div class=${"jobs-record-list-wrap density-"+i}>
      <${pa} sortCol=${e} sortDir=${n} onSort=${a} />
      <div class="jobs-record-list">
        ${t.map(r=>J`<${_a} key=${r.id} job=${r} onJobClick=${s} />`)}
      </div>
    </div>
  `}function $a({job:t,onJobClick:e}){const n=async a=>{a.stopPropagation();const s=await Hn(t.id);s&&x(`Created product: ${s.name}`,"success")};return J`
    <div class="card" onClick=${()=>e(t)}>
      <${jn} url=${t.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${t.designTitle||"Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${t.deviceModel||"—"}</span>
          <span>📅 ${rt(t.startTime)}</span>
          <span>⏱ ${ot(t.total_time_s)}</span>
          <span
            >🧵 ${Ft(t.total_weight_g)}
            <${on} confidence=${t.material_usage_confidence} />
          </span>
          ${t.final_price!=null&&J`<span>💰 ${A(t.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${It} status=${t.status} />
          <${ln} printRun=${t.print_run} />
          ${t.customer&&J`<span class="customer-pill">${t.customer}</span>`}
          <${Wt} colors=${t.filament_colors} />
          <button class="btn-secondary btn-compact" type="button" onClick=${n}>
            Create product
          </button>
        </div>
      </div>
    </div>
  `}function va({sorted:t,onJobClick:e,density:n}){return J`
    <div class=${"grid-view density-"+n}>
      ${t.map(a=>J`<${$a} key=${a.id} job=${a} onJobClick=${e} />`)}
    </div>
  `}function me(t){R(()=>{const e=n=>{n.key==="Escape"&&t()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[t])}const q=L.bind(T);function fa(t){return t==="actual"?"actual usage":t==="slicer_estimate"?"slicer estimate":t==="manual"?"manual entry":"unknown confidence"}function ga({jobId:t}){const[e,n]=v(null);if(R(()=>{let i=!0;return n(null),ue(`/jobs/${t}/price`,"Pricing not configured").then(({data:r})=>{i&&n(r??!1)}).catch(()=>{i&&n(!1)}),()=>{i=!1}},[t]),e===null)return q`<div class="pricing-row pricing-loading">Loading price…</div>`;if(e===!1)return q`<div class="pricing-row pricing-na">Pricing not configured</div>`;const a=e.final_price-e.base_price,s=e.base_price>0?Math.round(a/e.base_price*100):0;return q`
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Material</span><span>${A(e.material_cost)}</span>
      </div>
      <div class="pricing-row">
        <span>Machine</span><span>${A(e.machine_cost)}</span>
      </div>
      <div class="pricing-row"><span>Labor</span><span>${A(e.labor_cost)}</span></div>
      ${e.extra_labor_cost>0&&q`
        <div class="pricing-row pricing-extra-labor">
          <span>Extra labor</span><span>${A(e.extra_labor_cost)}</span>
        </div>
      `}
      <div class="pricing-divider"></div>
      <div class="pricing-row pricing-base">
        <span>Base</span><span>${A(e.base_price)}</span>
      </div>
      ${a!==0&&q`
        <div class="pricing-row pricing-markup">
          <span>Markup</span>
          <span
            >${a>0?"+":""}${A(a)}
            (${s>0?"+":""}${s}%)</span
          >
        </div>
      `}
      <div class="pricing-row pricing-final">
        <span
          >Final${e.is_override?q`<span class="override-tag">override</span>`:""}</span
        >
        <span>${A(e.final_price)}</span>
      </div>
    </div>
  `}const ha=["finish","failed","cancel","running","pause"];function ba({job:t,onClose:e,onPatch:n,projects:a,onJobProjectChange:s,onJobStatusChange:i,onJobExtraLaborChange:r,onNavigateToProject:u}){const[d,p]=v(t.customer??""),[c,o]=v(t.notes??""),[l,_]=v(t.price_override!=null?String(t.price_override):"");me(e);const f=C(m=>{const g=m.target.value;s(t.id,g===""?null:Number(g))},[t.id,s]),y=C(m=>{const g=m.target.value;i(t.id,g===""?null:g)},[t.id,i]);return q`
    <div class="overlay" onClick=${m=>m.target===m.currentTarget&&e()}>
      <div class="modal">
        <div class="modal-header">
          <h2>${t.designTitle||"Untitled Job"}</h2>
          <button class="modal-close" onClick=${e}>✕</button>
        </div>
        ${t.cover_url&&q`<img class="modal-img" src=${t.cover_url} alt="" />`}
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Status</label>
              <div class="detail-val">
                <${It} status=${t.status} />
                ${t.status_override&&q`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item">
              <label>Printer</label>
              <div class="detail-val">${t.deviceModel||"—"}</div>
            </div>
            <div class="detail-item">
              <label>Started</label>
              <div class="detail-val">${le(t.startTime)}</div>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <div class="detail-val">${ot(t.total_time_s)}</div>
            </div>
            <div class="detail-item">
              <label>Filament</label>
              <div class="detail-val">
                ${Ft(t.total_weight_g)}
                <span class="usage-confidence"
                  >${fa(t.material_usage_confidence)}</span
                >
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
                ${(t.print_run??1)>1?`Run #${t.print_run} of this design`:"1st print of this design"}
              </div>
            </div>
          </div>
          <${ga} jobId=${t.id} key=${t.id+"-"+t.extra_labor_minutes} />
          <div class="modal-project-row">
            <label class="modal-project-label">Customer</label>
            <input
              class="modal-project-select"
              type="text"
              placeholder="—"
              value=${d}
              onInput=${m=>p(m.target.value)}
              onBlur=${()=>n(t.id,{customer:d.trim()||null})}
              onKeyDown=${m=>m.key==="Enter"&&m.target.blur()}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Notes</label>
            <textarea
              class="modal-project-select modal-notes"
              placeholder="—"
              value=${c}
              onInput=${m=>o(m.target.value)}
              onBlur=${()=>n(t.id,{notes:c.trim()||null})}
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
              value=${l}
              onInput=${m=>_(m.target.value)}
              onBlur=${()=>{const m=l===""?null:Number(l);n(t.id,{price_override:m})}}
              onKeyDown=${m=>m.key==="Enter"&&m.target.blur()}
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
              onChange=${m=>{const g=m.target.value===""?null:Number(m.target.value);r(t.id,g)}}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Status override</label>
            <select
              class="modal-project-select"
              value=${t.status_override??""}
              onChange=${y}
            >
              <option value="">Auto (from printer)</option>
              ${ha.map(m=>q`<option key=${m} value=${m}>${m}</option>`)}
            </select>
          </div>
          ${a&&q`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select
                class="modal-project-select"
                value=${t.project_id??""}
                onChange=${f}
              >
                <option value="">— None —</option>
                ${a.map(m=>q`<option key=${m.id} value=${m.id}>${m.name}</option>`)}
              </select>
              ${t.project_id!=null&&q`
                <button
                  class="btn-link"
                  onClick=${()=>{e(),u(Number(t.project_id))}}
                >
                  View →
                </button>
              `}
            </div>
          `}
        </div>
      </div>
    </div>
  `}const U=L.bind(T);function ya({project:t,totalPrice:e,onClick:n,onRename:a}){const s=t.total_weight_g,i=t.total_time_s,r=async u=>{u.stopPropagation();const d=await nn(t.id);d&&x(`Created product: ${d.name}`,"success")};return U`
    <div class="proj-card" onClick=${n}>
      ${t.cover_url?U`<img class="proj-card-cover" src=${t.cover_url} alt="" />`:U`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-title-row">
        <div class="proj-card-name">${t.name}</div>
        <button
          type="button"
          class="btn-secondary proj-card-action"
          onClick=${u=>{u.stopPropagation(),a(t)}}
        >
          Rename
        </button>
        <button type="button" class="btn-secondary proj-card-action" onClick=${r}>
          Create product
        </button>
      </div>
      <div class="proj-card-meta">
        ${t.customer&&U`<span class="customer-pill">${t.customer}</span>`}
      </div>
      <div class="proj-card-stats">
        <span>
          <strong>${t.job_count}</strong> run${t.job_count!==1?"s":""}
        </span>
        ${t.total_plates!=null&&U`<span>
          <strong>${t.total_plates}</strong> plate${t.total_plates!==1?"s":""}
        </span>`}
        ${s!=null&&U`<span>${ce(s)}</span>`}
        ${i!=null&&U`<span>${ot(i)}</span>`}
        ${e!=null&&U`<span class="proj-card-price">${A(e)}</span>`}
      </div>
      ${t.notes&&U`<div class="proj-card-notes">${t.notes}</div>`}
    </div>
  `}function Pa({price:t}){return t?U`
    <span>Material: <strong>${A(t.material_cost)}</strong></span>
    <span>Machine: <strong>${A(t.machine_cost)}</strong></span>
    <span>Labor: <strong>${A(t.labor_cost)}</strong></span>
    ${t.extra_labor_cost>0&&U`<span>Extra labor: <strong>${A(t.extra_labor_cost)}</strong></span>`}
    <span class="totals-total">Total: <strong>${A(t.final_price)}</strong></span>
  `:null}function ka({jobs:t,onJobClick:e,onRemoveJob:n,onMoveToNewProject:a}){return t.length===0?U`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`:U`
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="td-thumb"></th>
            <th>Title</th>
            <th>Printer</th>
            <th>Date</th>
            <th>Status</th>
            <th class="td-num">Plates</th>
            <th class="td-num">Filament</th>
            <th class="td-num">Time</th>
            <th class="td-num">Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${t.map(s=>U`
              <tr key=${s.id} onClick=${()=>e(s)}>
                <td class="td-thumb"><${qt} url=${s.cover_url} /></td>
                <td class="td-title">
                  <span class="row-title">${s.designTitle||"Untitled Job"}</span>
                </td>
                <td>${s.deviceModel||"—"}</td>
                <td title=${le(s.startTime)}>${rt(s.startTime)}</td>
                <td><${It} status=${s.status} /></td>
                <td class="td-num"><strong>${s.plate_count??1}</strong></td>
                <td class="td-num"><strong>${Ft(s.total_weight_g)}</strong></td>
                <td class="td-num">${ot(s.total_time_s)}</td>
                <td class="td-num">
                  ${s.final_price!=null?U`<strong>${A(s.final_price)}</strong>`:"—"}
                </td>
                <td>
                  ${a&&U`<button
                    class="btn-secondary"
                    title="Move to a new project"
                    onClick=${i=>{i.stopPropagation(),a(s)}}
                  >
                    New project
                  </button>`}
                  <button
                    class="btn-remove-job"
                    title="Remove from project"
                    onClick=${i=>{i.stopPropagation(),n(s.id)}}
                  >
                    ×
                  </button>
                </td>
              </tr>
            `)}
        </tbody>
      </table>
    </div>
  `}function wa({loading:t,filtered:e,q:n,projectPrices:a,navigate:s,onRename:i}){return t?U`<div class="empty">Loading projects…</div>`:e.length===0?U`<div class="empty">${n?"No projects match your search.":"No projects yet. Create one to group related jobs together."}</div>`:U`
    <div class="proj-grid">
      ${e.map(r=>U`<${ya}
            key=${r.id}
            project=${r}
            totalPrice=${a[r.id]??null}
            onClick=${()=>s(`/projects/${r.id}`)}
            onRename=${i}
          />`)}
    </div>
  `}const Ca=L.bind(T);function Sa({job:t,initialName:e,onClose:n,onProjectCreated:a,onMoveJobToProject:s,onNavigateToProject:i}){const[r,u]=v(e),d=C(async()=>{const p=r.trim();if(!p)return;const c=await z("/projects",{name:p,customer:t.customer??null,notes:null},"Failed to create project.");c!=null&&c.project&&(a(c.project),s(t.id,c.project.id),i(c.project.id),n())},[t.customer,t.id,r,n,s,i,a]);return Ca`<div class="modal-backdrop" onClick=${n}>
    <div class="modal-card" onClick=${p=>p.stopPropagation()}>
      <h3>Move print run to new project</h3>
      <p class="modal-subtle">${t.designTitle||"Untitled Job"}</p>
      <label>
        New project name
        <input
          value=${r}
          onInput=${p=>u(p.target.value)}
          autofocus
        />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onClick=${n}>Cancel</button>
        <button
          type="button"
          class="btn-primary"
          disabled=${!r.trim()}
          onClick=${d}
        >
          Create and move
        </button>
      </div>
    </div>
  </div>`}const Fa=L.bind(T);function Ia({project:t,onClose:e,onRenamed:n}){const[a,s]=v(t.name??""),[i,r]=v(!1),u=C(async()=>{const d=a.trim();if(d){r(!0);try{const p=await tt(`/projects/${t.id}`,{name:d},"Failed to rename project."),c=p==null?void 0:p.project;if(!c)return;n(c),e()}finally{r(!1)}}},[a,e,n,t.id]);return Fa`<div class="modal-backdrop" onClick=${e}>
    <div class="modal-card" onClick=${d=>d.stopPropagation()}>
      <h3>Rename project</h3>
      <p class="modal-subtle">${t.name}</p>
      <label>
        Project name
        <input
          value=${a}
          onInput=${d=>s(d.target.value)}
          autofocus
        />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onClick=${e}>Cancel</button>
        <button
          type="button"
          class="btn-primary"
          disabled=${!a.trim()||i}
          onClick=${u}
        >
          ${i?"Saving…":"Save name"}
        </button>
      </div>
    </div>
  </div>`}function Ta(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>[a.name,a.customer,a.notes].filter(Boolean).join(" ").toLowerCase().includes(n))}function Na(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>`${a.designTitle||""} ${a.customer||""}`.toLowerCase().includes(n))}function ja(t,e,n){return`${n?`${e.length} of ${t.length}`:String(t.length)} project${t.length!==1?"s":""}`}function La(t,e){return t.some(n=>n.id===e.id)?t.map(n=>n.id===e.id?{...n,...e}:n):[e,...t]}function Ma(t,e){if(t===0){x("No ungrouped jobs found — everything is already assigned to a project.","info");return}x(`Created ${t} project${t!==1?"s":""}, assigned ${e} job${e!==1?"s":""}.`,"success")}function xa(t){return t.reduce((e,n)=>e+(n.total_weight_g||0),0)}function Da(t){return t.reduce((e,n)=>e+(n.total_time_s||0),0)}function Ja(t){return t.reduce((e,n)=>e+(n.plate_count||0),0)}const bt=L.bind(T);function cn(t){return e=>{e.target===e.currentTarget&&t()}}function Ba({onClose:t,onCreate:e}){const[n,a]=v(""),[s,i]=v(""),[r,u]=v(""),[d,p]=v(!1);me(t);const c=C(async o=>{if(o.preventDefault(),!!n.trim()){p(!0);try{const l=await z("/projects",{name:n.trim(),customer:s||null,notes:r||null},"Failed to create project.");if(!(l!=null&&l.project))return;e(l.project),t()}finally{p(!1)}}},[n,s,r,e,t]);return bt`
    <div class="overlay" onClick=${cn(t)}>
      <div class="modal">
        <div class="modal-header">
          <h2>New Project</h2>
          <button class="modal-close" onClick=${t}>✕</button>
        </div>
        <div class="modal-body">
          <form class="project-form" onSubmit=${c}>
            <label class="form-label"
              >Name *
              <input
                class="form-input"
                type="text"
                value=${n}
                onInput=${o=>a(o.target.value)}
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
                onInput=${o=>i(o.target.value)}
                placeholder="Optional"
              />
            </label>
            <label class="form-label"
              >Notes
              <textarea
                class="form-input form-textarea"
                value=${r}
                onInput=${o=>u(o.target.value)}
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
  `}function Ea({unassignedJobs:t,onClose:e,onAdd:n}){const[a,s]=v("");me(e);const i=W(()=>Na(t,a),[t,a]);return bt`
    <div class="overlay" onClick=${cn(e)}>
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
            value=${a}
            onInput=${r=>s(r.target.value)}
          />
          ${i.length===0?bt`<div class="empty" style="padding:16px 0">
                ${a?"No matches.":"All jobs are already assigned to projects."}
              </div>`:bt`<div class="add-jobs-list">
                ${i.map(r=>bt`
                    <div class="add-jobs-row" key=${r.id} onClick=${()=>n(r.id)}>
                      <${qt} url=${r.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${r.designTitle||"Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${rt(r.startTime)} · ${r.deviceModel||"—"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `)}
              </div>`}
        </div>
      </div>
    </div>
  `}const Nt=new Map;function Ua(t,e){const[n,a]=v(()=>Nt.get(t)??null);return R(()=>{if(a(Nt.get(t)??null),!e){Nt.delete(t),a(null);return}let s=!1;return ut(`/projects/${t}/price`,"Failed to load project price.").then(i=>{!i||s||(Nt.set(t,i),a(i))}),()=>{s=!0}},[t,e]),n}const Y=L.bind(T);function Aa({project:t,jobs:e,unassignedJobs:n,onBack:a,onJobClick:s,onAddJob:i,onRemoveJob:r,onProjectUpdated:u,onMoveJobToProject:d,onNavigateToProject:p}){const[c,o]=v(!1),[l,_]=v(!1),[f,y]=v(null),[m,g]=v(t.name??""),[$,b]=v(t.customer??""),[P,w]=v(t.notes??""),h=t.job_count??e.length,k=Ua(t.id,h),S=xa(e),N=Da(e),O=Ja(e),K=Ye(new Map),lt=W(()=>{for(const F of e)F.final_price!=null&&K.current.set(F.id,F.final_price);return e.map(F=>{if(F.final_price!=null)return F;const he=K.current.get(F.id);return he==null?F:{...F,final_price:he}})},[e]),mn=C(F=>i(F),[i]),$n=C(async()=>{const F=await nn(t.id);F&&x(`Created product: ${F.name}`,"success")},[t.id]),vn=C(async()=>{const F=await tt(`/projects/${t.id}`,{name:m.trim(),customer:$.trim()||null,notes:P.trim()||null},"Failed to update project.");F!=null&&F.project&&(u(F.project),_(!1))},[$,m,P,u,t.id]);return Y`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${a}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${t.name}</h2>
          ${t.customer&&Y`<span class="customer-pill">${t.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${()=>_(F=>!F)}>
          ${l?"Cancel edit":"Edit project"}
        </button>
        <button class="btn-secondary" onClick=${$n}>Create product</button>
        <button class="btn-secondary" onClick=${()=>o(!0)}>+ Add Jobs</button>
      </div>
      ${l&&Y`<div class="modal-form proj-detail-notes">
        <label>
          Project name
          <input
            value=${m}
            onInput=${F=>g(F.target.value)}
          />
        </label>
        <label>
          Customer
          <input
            value=${$}
            onInput=${F=>b(F.target.value)}
          />
        </label>
        <label>
          Notes
          <textarea
            value=${P}
            onInput=${F=>w(F.target.value)}
          />
        </label>
        <button class="btn-primary" disabled=${!m.trim()} onClick=${vn}>
          Save project
        </button>
      </div>`}
      ${t.notes&&Y`<div class="proj-detail-notes">${t.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Print runs: <strong>${h}</strong></span>
        <span>Plates: <strong>${O}</strong></span>
        <span>Filament: <strong>${ce(S)}</strong></span>
        <span>Print time: <strong>${ot(N)}</strong></span>
        <${Pa} price=${k} />
      </div>
      <${ka}
        jobs=${lt}
        onJobClick=${s}
        onRemoveJob=${r}
        onMoveToNewProject=${y}
      />
      ${c&&Y`<${Ea}
        unassignedJobs=${n}
        onClose=${()=>o(!1)}
        onAdd=${mn}
      />`}
      ${f&&Y`<${Sa}
        job=${f}
        initialName=${f.designTitle||""}
        onClose=${()=>y(null)}
        onProjectCreated=${u}
        onMoveJobToProject=${d}
        onNavigateToProject=${p}
      />`}
    </div>
  `}function Ra({projects:t,setProjects:e,onAutoGroup:n,projectPrices:a,loading:s=!1}){const[i,r]=v(!1),[u,d]=v(!1),[p,c]=v(null),[o,l]=v(""),[,_]=oe(),f=C(async()=>{d(!0);try{const g=await z("/projects/auto-group",{},"Auto-group failed.");if(!g)return;const{projects_created:$,jobs_assigned:b}=g;await n(),Ma($,b)}finally{d(!1)}},[n]),y=C(g=>{e($=>[g,...$]),_(`/projects/${g.id}`)},[e,_]),m=W(()=>Ta(t,o),[t,o]);return Y`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${o}
        onInput=${g=>l(g.target.value)}
      />
      <span class="proj-list-count">${ja(t,m,o)}</span>
      <button class="btn-secondary" onClick=${f} disabled=${u}>
        ${u?"Grouping…":"⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${()=>r(!0)}>+ New Project</button>
    </div>
    <${wa}
      loading=${s}
      filtered=${m}
      q=${o}
      projectPrices=${a}
      navigate=${_}
      onRename=${c}
    />
    ${i&&Y`<${Ba} onClose=${()=>r(!1)} onCreate=${y} />`}
    ${p&&Y`<${Ia}
      project=${p}
      onClose=${()=>c(null)}
      onRenamed=${g=>e($=>La($,g))}
    />`}
  `}const G=L.bind(T),Oa=2e3;function xe(t,e,n){const a=e(n);return t.map(s=>e(s)===a?n:s)}function Ha(t){return t==="saving"?"Saving…":t==="saved"?"✓ Saved":"Save"}function qa(t,e,n){return t===n?"saving":e===n?"saved":"idle"}function Wa(t){const[e,n]=v(""),[a,s]=v(""),i=d=>{s(d),setTimeout(()=>s(""),Oa)};return{runSave:async(d,p)=>{n(d);try{if(!await p())return;i(d),t()}finally{n("")}},getStateFor:d=>qa(e,a,d)}}function Q({label:t,value:e,onChange:n,step:a="0.01",min:s="0"}){return G`
    <label class="form-label">
      ${t}
      <input
        type="number"
        class="form-input"
        step=${a}
        min=${s}
        value=${Number.isFinite(e)?e:0}
        onInput=${i=>n(Number(i.target.value||0))}
      />
    </label>
  `}function $e({state:t}){return G`<button type="submit" class="btn-primary" disabled=${t==="saving"}>
    ${Ha(t)}
  </button>`}function pt({title:t,description:e,children:n}){return G`
    <section class="admin-section">
      <h3 class="admin-section-title">${t}</h3>
      <p class="admin-section-desc">${e}</p>
      ${n}
    </section>
  `}function Qa({labor:t,saveState:e,onSave:n}){const[a,s]=v(t);return R(()=>s(t),[t]),G`
    <form class="admin-card" onSubmit=${i=>(i.preventDefault(),n(a))}>
      <div class="admin-card-fields">
        <${Q}
          label="Hourly rate ($)"
          value=${a.hourly_rate}
          step="0.5"
          onChange=${i=>s({...a,hourly_rate:i})}
        />
        <${Q}
          label="Minimum labor minutes"
          value=${a.minimum_minutes}
          step="1"
          onChange=${i=>s({...a,minimum_minutes:i})}
        />
        <${Q}
          label="Profit markup (%)"
          value=${a.profit_markup_pct*100}
          step="1"
          onChange=${i=>s({...a,profit_markup_pct:i/100})}
        />
        <${Q}
          label="Failure buffer (%)"
          value=${a.failure_buffer_pct*100}
          step="1"
          onChange=${i=>s({...a,failure_buffer_pct:i/100})}
        />
        <${Q}
          label="Overhead buffer (%)"
          value=${a.overhead_buffer_pct*100}
          step="1"
          onChange=${i=>s({...a,overhead_buffer_pct:i/100})}
        />
      </div>
      <div class="admin-card-actions"><${$e} state=${e} /></div>
    </form>
  `}function Va({machine:t,saveState:e,onSave:n}){const[a,s]=v(t);R(()=>s(t),[t]);const i=a.purchase_price/a.lifetime_hrs+a.electricity_rate+a.maintenance_buffer;return G`
    <form class="admin-card" onSubmit=${r=>(r.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.device_model}</div>
      <div class="admin-card-fields">
        <${Q}
          label="Purchase price ($)"
          value=${a.purchase_price}
          step="1"
          onChange=${r=>s({...a,purchase_price:r})}
        />
        <${Q}
          label="Lifetime (hours)"
          value=${a.lifetime_hrs}
          step="100"
          min="1"
          onChange=${r=>s({...a,lifetime_hrs:r})}
        />
        <${Q}
          label="Electricity ($/hr)"
          value=${a.electricity_rate}
          step="0.01"
          onChange=${r=>s({...a,electricity_rate:r})}
        />
        <${Q}
          label="Maintenance ($/hr)"
          value=${a.maintenance_buffer}
          step="0.01"
          onChange=${r=>s({...a,maintenance_buffer:r})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">
          Computed rate: <strong>${A(i)}</strong>/hr
        </div>
        <div class="admin-card-actions"><${$e} state=${e} /></div>
      </div>
    </form>
  `}function Ga({material:t,saveState:e,onSave:n}){const[a,s]=v(t);R(()=>s(t),[t]);const i=a.cost_per_g*(1+a.waste_buffer_pct);return G`
    <form class="admin-card" onSubmit=${r=>(r.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.filament_type}</div>
      <div class="admin-card-fields">
        <${Q}
          label="Cost per gram ($/g)"
          value=${a.cost_per_g}
          step="0.001"
          onChange=${r=>s({...a,cost_per_g:r})}
        />
        <${Q}
          label="Waste buffer (%)"
          value=${a.waste_buffer_pct*100}
          step="1"
          onChange=${r=>s({...a,waste_buffer_pct:r/100})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">Computed rate: <strong>${A(i)}</strong>/g</div>
        <div class="admin-card-actions"><${$e} state=${e} /></div>
      </div>
    </form>
  `}function za({onRatesChanged:t=()=>{}}){const[e,n]=v(null),{runSave:a,getStateFor:s}=Wa(t);R(()=>{ut("/rates","Failed to load rates.").then(o=>{o&&n(o)})},[]);const i=async o=>{await a("labor",async()=>{const l=await tt("/rates/labor",o,"Failed to save labor rates."),_=l==null?void 0:l.labor_config;return _?(n(f=>f&&{...f,labor_config:_}),!0):!1})},r=async o=>{const{device_model:l,purchase_price:_,lifetime_hrs:f,electricity_rate:y,maintenance_buffer:m}=o;await a(l,async()=>{const g=await tt(`/rates/machines/${encodeURIComponent(l)}`,{purchase_price:_,lifetime_hrs:f,electricity_rate:y,maintenance_buffer:m},"Failed to save machine rate."),$=g==null?void 0:g.machine_rate;return $?(n(b=>b&&{...b,machine_rates:xe(b.machine_rates,P=>P.device_model,$)}),!0):!1})},u=async o=>{const{filament_type:l,cost_per_g:_,waste_buffer_pct:f}=o;await a(l,async()=>{const y=await tt(`/rates/materials/${encodeURIComponent(l)}`,{cost_per_g:_,waste_buffer_pct:f},"Failed to save material rate."),m=y==null?void 0:y.material_rate;return m?(n(g=>g&&{...g,material_rates:xe(g.material_rates,$=>$.filament_type,m)}),!0):!1})};if(!e)return G`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;const{labor_config:d,machine_rates:p,material_rates:c}=e;return G`
    <div class="admin-page">
      <h2 class="admin-title">Rates & Pricing</h2>

      <${pt}
        title="Labor"
        description="Applied once per job (or once per project for project pricing)."
      >
        <${Qa}
          labor=${d}
          saveState=${s("labor")}
          onSave=${i}
        />
      </${pt}>

      <${pt}
        title="Machine Rates"
        description="Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance."
      >
        ${p.map(o=>G`
            <${Va}
              key=${o.device_model}
              machine=${o}
              saveState=${s(o.device_model)}
              onSave=${r}
            />
          `)}
      </${pt}>

      <${pt}
        title="Material Rates"
        description="Cost per gram including waste. Rate = cost × (1 + waste fraction)."
      >
        ${c.map(o=>G`
            <${Ga}
              key=${o.filament_type}
              material=${o}
              saveState=${s(o.filament_type)}
              onSave=${u}
            />
          `)}
      </${pt}>
    </div>
  `}const dn=L.bind(T);function kt(t){return t==null?"—":`$${t.toFixed(2)}`}function un(t){return t==null?"—":`${Math.round(t*100)}%`}function Ka(t){return t==null?"—":t<3600?`${Math.round(t/60)} min`:`${(t/3600).toFixed(1)} h`}function Ya(t){return t==null?"batch-margin batch-margin--unknown":t>=.45?"batch-margin batch-margin--good":t>=.25?"batch-margin batch-margin--ok":"batch-margin batch-margin--low"}function _t({label:t,value:e}){return dn`<div class="batch-price-metric"><span>${t}</span><strong>${e}</strong></div>`}function Xa({batch:t}){return dn`<div class="batch-price-breakdown" aria-label="Batch price breakdown">
    <${_t} label="Unit cost" value=${kt(t.unit_cost)} />
    <${_t} label="Suggested" value=${kt(t.suggested_price)} />
    <${_t} label="Fixed fee" value=${kt(t.fixed_fee_per_order)} />
    <${_t} label="Margin" value=${un(t.estimated_margin_pct)} />
    <${_t}
      label="Material"
      value=${t.total_filament_g==null?"—":`${t.total_filament_g.toFixed(1)} g`}
    />
    <${_t} label="Print time" value=${Ka(t.total_print_time_s)} />
  </div>`}const ct=L.bind(T);function Za(t){return t==null?"":String(t/3600)}function yt(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function ts(t){const e=yt(t);return e===null?null:Math.round(e*3600)}function mt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>0?e:null}function jt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>=0?e:null}function zt(t,e){return Object.prototype.hasOwnProperty.call(t,e)}function Kt(t){return{productId:String(t.product_id),pricingProfileId:t.pricing_profile_id,plannedQuantity:String(t.planned_quantity),completedQuantity:String(t.completed_quantity),failedQuantity:String(t.failed_quantity),materialType:t.material_type??"",primaryColor:t.primary_color??"",totalFilamentG:t.total_filament_g==null?"":String(t.total_filament_g),totalPrintTimeHours:Za(t.total_print_time_s),setupMinutes:t.setup_minutes==null?"":String(t.setup_minutes),handlingMinutesPerUnit:t.handling_minutes_per_unit==null?"":String(t.handling_minutes_per_unit),packagingCostPerUnit:t.packaging_cost_per_unit==null?"":String(t.packaging_cost_per_unit),notes:t.notes??""}}function j({label:t,children:e}){return ct`<label class="form-label">${t}${e}</label>`}function es({batchId:t,navigate:e}){const[n,a]=v(null),[s,i]=v([]),[r,u]=v([]),[d,p]=v(""),[c,o]=v(null),[l,_]=v(!0),[f,y]=v(!1),[m,g]=v(!1);R(()=>{let h=!1;return Promise.all([Wn(t),pe(),Un()]).then(([k,S,N])=>{h||(a(k),i(S),u(N),o(Kt(k)))}).catch(k=>{x(k instanceof Error?k.message:"Failed to load batch.","error")}).finally(()=>{h||_(!1)}),()=>{h=!0}},[t]);const $=(h,k)=>{o(S=>S&&{...S,[h]:k})},b=!!(c&&mt(c.productId)&&mt(c.plannedQuantity)&&jt(c.completedQuantity)!==null&&jt(c.failedQuantity)!==null),P=async()=>{if(!n)return;const h=mt(d);if(h){g(!0);try{const k=await Gn(n.id,h);if(!k)return;a(k),o(Kt(k)),x("Project jobs added to batch.","success")}finally{g(!1)}}},w=async h=>{if(h.preventDefault(),!c||!n)return;const k=mt(c.productId),S=mt(c.plannedQuantity),N=jt(c.completedQuantity),O=jt(c.failedQuantity);if(!k||!S||N===null||O===null)return;const K={product_id:k,pricing_profile_id:c.pricingProfileId,planned_quantity:S,completed_quantity:N,failed_quantity:O,material_type:c.materialType.trim()||null,primary_color:c.primaryColor.trim()||null,total_filament_g:yt(c.totalFilamentG),total_print_time_s:ts(c.totalPrintTimeHours),notes:c.notes.trim()||null};(zt(n,"setup_minutes")||c.setupMinutes.trim())&&(K.setup_minutes=yt(c.setupMinutes)),(zt(n,"handling_minutes_per_unit")||c.handlingMinutesPerUnit.trim())&&(K.handling_minutes_per_unit=yt(c.handlingMinutesPerUnit)),(zt(n,"packaging_cost_per_unit")||c.packagingCostPerUnit.trim())&&(K.packaging_cost_per_unit=yt(c.packagingCostPerUnit)),y(!0);try{const lt=await Vn(n.id,K);if(!lt)return;a(lt),o(Kt(lt)),x("Batch updated.","success")}finally{y(!1)}};return l?ct`<div class="empty">Loading batch…</div>`:!n||!c?ct`<div class="empty">Batch not found.</div>`:ct`<main class="product-detail-page batch-detail-page">
    <div class="product-detail-header">
      <button class="btn-back" onClick=${()=>e("/batches")}>← Batches</button>
      <div>
        <p class="products-kicker">${n.pricing_profile_label}</p>
        <h2>${n.product_name}</h2>
      </div>
      <button class="product-tab" onClick=${()=>e(`/products/${n.product_id}`)}>
        Open Product
      </button>
    </div>

    <section class="product-detail-layout batch-detail-layout">
      <aside class="product-detail-card batch-detail-card">
        <div class="batch-detail-summary">
          <p class="products-kicker">Current pricing</p>
          <h3>${n.completed_quantity} sellable / ${n.failed_quantity} failed</h3>
          <p>${n.material_type||"Material TBD"} · ${n.primary_color||"Color TBD"}</p>
        </div>
        <${Xa} batch=${n} />
      </aside>

      <form class="product-detail-form" onSubmit=${w}>
        <section class="admin-section">
          <h3 class="admin-section-title">Batch setup</h3>
          <div class="product-form-grid">
            <${j} label="Product">
              <select
                class="form-input"
                value=${c.productId}
                onChange=${h=>$("productId",h.target.value)}
              >
                ${s.map(h=>ct`<option key=${h.id} value=${String(h.id)}>
                      ${h.name}
                    </option>`)}
              </select>
            </${j}>
            <${j} label="Pricing profile">
              <select
                class="form-input"
                value=${c.pricingProfileId}
                onChange=${h=>$("pricingProfileId",h.target.value)}
              >
                ${de.map(h=>ct`<option key=${h.id} value=${h.id}>${h.label}</option>`)}
              </select>
            </${j}>
            <${j} label="Planned quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${c.plannedQuantity}
                onInput=${h=>$("plannedQuantity",h.target.value)}
              />
            </${j}>
            <${j} label="Completed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${c.completedQuantity}
                onInput=${h=>$("completedQuantity",h.target.value)}
              />
            </${j}>
            <${j} label="Failed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${c.failedQuantity}
                onInput=${h=>$("failedQuantity",h.target.value)}
              />
            </${j}>
          </div>
        </section>

        <section class="admin-section">
          <h3 class="admin-section-title">Costs and production totals</h3>
          <div class="batch-link-panel">
            <div>
              <strong>Use existing project jobs</strong>
              <p>Link every job from a project to this batch. Leave total grams/time blank to use linked job totals.</p>
            </div>
            <select
              class="form-input"
              value=${d}
              onChange=${h=>p(h.target.value)}
            >
              <option value="">Select project…</option>
              ${r.map(h=>ct`<option key=${h.id} value=${String(h.id)}>
                  ${h.name}${h.job_count?` (${h.job_count} jobs)`:""}
                </option>`)}
            </select>
            <button
              class="btn-secondary"
              type="button"
              disabled=${m||!mt(d)}
              onClick=${P}
            >
              ${m?"Adding…":"Add project jobs"}
            </button>
          </div>
          <div class="product-form-grid">
            <${j} label="Material">
              <input
                class="form-input"
                value=${c.materialType}
                placeholder="PLA"
                onInput=${h=>$("materialType",h.target.value)}
              />
            </${j}>
            <${j} label="Color">
              <input
                class="form-input"
                value=${c.primaryColor}
                placeholder="#ffffff or White"
                onInput=${h=>$("primaryColor",h.target.value)}
              />
            </${j}>
            <${j} label="Total grams">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.totalFilamentG}
                placeholder="120"
                onInput=${h=>$("totalFilamentG",h.target.value)}
              />
            </${j}>
            <${j} label="Total time (hours)">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.totalPrintTimeHours}
                placeholder="4.5"
                onInput=${h=>$("totalPrintTimeHours",h.target.value)}
              />
            </${j}>
            <${j} label="Setup minutes">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.setupMinutes}
                placeholder="10"
                onInput=${h=>$("setupMinutes",h.target.value)}
              />
            </${j}>
            <${j} label="Handling minutes / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.handlingMinutesPerUnit}
                placeholder="3"
                onInput=${h=>$("handlingMinutesPerUnit",h.target.value)}
              />
            </${j}>
            <${j} label="Packaging cost / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.packagingCostPerUnit}
                placeholder="0.75"
                onInput=${h=>$("packagingCostPerUnit",h.target.value)}
              />
            </${j}>
          </div>
          <label class="form-label product-notes-field">
            Notes
            <textarea
              class="form-input form-textarea"
              value=${c.notes}
              placeholder="Batch run notes, sales channel context, quality issues…"
              onInput=${h=>$("notes",h.target.value)}
            ></textarea>
          </label>
        </section>

        <div class="form-actions">
          <button class="btn-secondary" type="button" onClick=${()=>e("/batches")}>
            Cancel
          </button>
          <button class="btn-primary" type="submit" disabled=${f||!b}>
            ${f?"Saving…":"Save Batch"}
          </button>
        </div>
      </form>
    </section>
  </main>`}const De=L.bind(T);function ns({batch:t,onOpen:e}){const n=t.completed_quantity+t.failed_quantity;return De`<article class="batch-card" onClick=${()=>e(t)}>
    <div class="batch-card-header">
      <div>
        <p class="products-kicker">${t.pricing_profile_label}</p>
        <h3>${t.product_name}</h3>
      </div>
      <span class=${Ya(t.estimated_margin_pct)}>
        ${un(t.estimated_margin_pct)}
      </span>
    </div>
    <div class="batch-card-meta">
      <span>${t.material_type||"Material TBD"}</span>
      <span>${t.primary_color||"Color TBD"}</span>
      <span>${t.completed_quantity}/${t.planned_quantity} sellable</span>
    </div>
    <div class="batch-card-quantities">
      <div><span>Completed</span><strong>${t.completed_quantity}</strong></div>
      <div><span>Failed</span><strong>${t.failed_quantity}</strong></div>
      <div><span>Produced</span><strong>${n}</strong></div>
    </div>
    <div class="batch-card-prices">
      <div><span>Unit cost</span><strong>${kt(t.unit_cost)}</strong></div>
      <div>
        <span>Suggested price</span><strong>${kt(t.suggested_price)}</strong>
      </div>
    </div>
    ${t.notes?De`<p class="batch-card-notes">${t.notes}</p>`:null}
  </article>`}const X=L.bind(T);function Lt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>0?e:null}function as({products:t,onCreated:e}){const[n,a]=v({productId:"",pricingProfileId:"booth",plannedQuantity:"1"}),[s,i]=v(!1),r=(d,p)=>a(c=>({...c,[d]:p}));return X`<form class="batch-create-card" onSubmit=${async d=>{d.preventDefault();const p=Lt(n.productId),c=Lt(n.plannedQuantity);if(!(!p||!c)){i(!0);try{const o=await Qn({product_id:p,pricing_profile_id:n.pricingProfileId,planned_quantity:c});if(!o)return;e(o),a({productId:"",pricingProfileId:"booth",plannedQuantity:"1"}),x("Batch created.","success")}finally{i(!1)}}}}>
    <select
      class="form-input"
      value=${n.productId}
      onChange=${d=>r("productId",d.target.value)}
    >
      <option value="">Select product…</option>
      ${t.map(d=>X`<option key=${d.id} value=${String(d.id)}>${d.name}</option>`)}
    </select>
    <select
      class="form-input"
      value=${n.pricingProfileId}
      onChange=${d=>r("pricingProfileId",d.target.value)}
    >
      ${de.map(d=>X`<option key=${d.id} value=${d.id}>${d.label}</option>`)}
    </select>
    <input
      class="form-input"
      inputmode="numeric"
      value=${n.plannedQuantity}
      placeholder="Planned qty"
      onInput=${d=>r("plannedQuantity",d.target.value)}
    />
    <button
      class="btn-primary"
      type="submit"
      disabled=${s||!Lt(n.productId)||!Lt(n.plannedQuantity)}
    >
      ${s?"Adding…":"Add Batch"}
    </button>
  </form>`}function ss({navigate:t}){const[e,n]=v([]),[a,s]=v([]),[i,r]=v(!0),[u,d]=v(""),[p,c]=v("");R(()=>{let l=!1;return Promise.all([qn(),pe()]).then(([_,f])=>{l||(n(_),s(f))}).catch(_=>{x(_ instanceof Error?_.message:"Failed to load batches.","error")}).finally(()=>{l||r(!1)}),()=>{l=!0}},[]);const o=W(()=>{const l=u.trim().toLowerCase();return e.filter(_=>p&&_.pricing_profile_id!==p?!1:l?[_.product_name,_.pricing_profile_label,_.material_type,_.primary_color].filter(Boolean).join(" ").toLowerCase().includes(l):!0)},[e,p,u]);return X`<main class="products-page batches-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Batch pricing</p>
        <h2>Production Batches</h2>
        <p>Card-based batch runs for booth, Etsy, personal, and custom pricing decisions.</p>
      </div>
      <button class="product-tab" onClick=${()=>t("/products")}>Products</button>
    </section>

    <div class="product-toolbar">
      <input
        type="search"
        placeholder="Search batches…"
        value=${u}
        onInput=${l=>d(l.target.value)}
      />
      <select
        value=${p}
        onChange=${l=>c(l.target.value)}
      >
        <option value="">All channels</option>
        ${de.map(l=>X`<option key=${l.id} value=${l.id}>${l.label}</option>`)}
      </select>
      <span class="product-count">${o.length} of ${e.length} batches</span>
    </div>

    <section class="product-create-section">
      <${as}
        products=${a}
        onCreated=${l=>n(_=>[l,..._])}
      />
    </section>

    ${i?X`<div class="empty">Loading batches…</div>`:o.length?X`<div class="batch-grid">
            ${o.map(l=>X`<${ns}
                  key=${l.id}
                  batch=${l}
                  onOpen=${()=>t(`/batches/${l.id}`)}
                />`)}
          </div>`:X`<div class="empty">No batches match your filters.</div>`}
  </main>`}const st=L.bind(T);function et({label:t,value:e}){return st`<div class="catalog-summary-pill">
    <strong>${e.toLocaleString()}</strong>${t}
  </div>`}function is({summary:t}){return t?st`
    <div class="catalog-summary" role="status" aria-live="polite">
      <${et} label="scanned" value=${t.scanned} />
      <${et} label="added" value=${t.added} />
      <${et} label="changed" value=${t.changed} />
      <${et} label="unchanged" value=${t.unchanged} />
      <${et} label="missing" value=${t.missing} />
      <${et} label="restored" value=${t.restored} />
      <${et} label="skipped" value=${t.skipped} />
      <${et} label="failed" value=${t.failed} />
    </div>
  `:null}function rs(){const[t,e]=v([]),[n,a]=v(""),[s,i]=v(""),[r,u]=v(!0),[d,p]=v(!1),[c,o]=v(null),l=async()=>{const m=await ut("/catalog/roots","Failed to load roots.");m&&e(m.roots),u(!1)};R(()=>{l()},[]);const _=async m=>{m.preventDefault();const g=n.trim();if(!g)return;const $=s.trim()?{rootPath:g,name:s.trim()}:{rootPath:g},b=await z("/catalog/roots",$,"Failed to add root.");b&&(e(P=>[...P,b.root]),a(""),i(""),x("Catalog root added.","success"))},f=async m=>{const g=await ut(`/catalog/roots/${m}`,"Failed to remove root.",{method:"DELETE"});g&&e($=>$.map(b=>b.id===m?g.root:b))};return st`
    <main class="catalog-page">
      <section class="admin-section">
        <div class="catalog-header-row">
          <div>
            <h2 class="admin-section-title">Catalog scanner</h2>
            <p class="admin-section-desc">
              Index local model and G-code files without copying or attaching them to products.
            </p>
          </div>
          <button
            class="btn-primary"
            onClick=${async()=>{p(!0);try{const m=await z("/catalog/scan",{},"Catalog scan failed.",{timeoutMs:null});if(!m)return;o(m.summary),x("Catalog scan complete.",m.summary.failed>0?"info":"success"),await l()}finally{p(!1)}}}
            disabled=${d||t.every(m=>!m.is_active)}
          >
            ${d?"Scanning…":"Run scan"}
          </button>
        </div>
        <${is} summary=${c} />
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Scan roots</h3>
        <form class="admin-card catalog-root-form" onSubmit=${_}>
          <label class="form-label">
            Folder path
            <input
              class="form-input"
              value=${n}
              placeholder="/Users/adam/3d-models"
              onInput=${m=>a(m.target.value)}
            />
          </label>
          <label class="form-label">
            Name
            <input
              class="form-input"
              value=${s}
              placeholder="Models"
              onInput=${m=>i(m.target.value)}
            />
          </label>
          <button class="btn-primary" type="submit">Add root</button>
        </form>

        ${r?st`<div class="empty">Loading scan roots…</div>`:t.length===0?st`<div class="empty">No scan roots configured.</div>`:st`<div class="catalog-root-list">
                ${t.map(m=>st`<div class="admin-card catalog-root-card" key=${m.id}>
                      <div>
                        <div class="admin-card-name">${m.name}</div>
                        <div class="catalog-root-path">${m.root_path}</div>
                        <div class="catalog-root-meta">
                          ${m.is_active?"active":"inactive"}
                          ${m.last_scanned_at?` · scanned ${m.last_scanned_at}`:""}
                        </div>
                      </div>
                      ${m.is_active?st`<button class="btn-ghost" onClick=${()=>f(m.id)}>
                            Deactivate
                          </button>`:null}
                    </div>`)}
              </div>`}
      </section>
    </main>
  `}const os=L.bind(T);function ls(t){return t==="green"?"product-sellability product-sellability--green":t==="yellow"?"product-sellability product-sellability--yellow":"product-sellability product-sellability--red"}function ve({level:t,label:e,readyToList:n}){return os`<span class=${ls(t)} title=${e}>
    <span class="product-sellability-dot" aria-hidden="true"></span>
    ${e}${n?" · ready":""}
  </span>`}const vt=L.bind(T),St=[{id:"idea",label:"Idea"},{id:"downloaded_designed",label:"Downloaded / Designed"},{id:"test_print",label:"Test Print"},{id:"needs_tuning",label:"Needs Tuning"},{id:"ready_for_photos",label:"Ready for Photos"},{id:"listed",label:"Listed"},{id:"active",label:"Active"},{id:"selling_well",label:"Selling Well"},{id:"retired",label:"Retired"}],pn=[{id:"gaming",label:"Gaming"},{id:"workshop",label:"Workshop"},{id:"home_organization",label:"Home Organization"},{id:"decor",label:"Decor"},{id:"personalized",label:"Personalized"},{id:"seasonal",label:"Seasonal"},{id:"custom_repair_parts",label:"Custom / Repair Parts"}],fe=[{id:"hive",label:"Hive"},{id:"original",label:"Original"},{id:"printables",label:"Printables"},{id:"makerworld",label:"MakerWorld"},{id:"thangs",label:"Thangs"},{id:"stlflix",label:"STLFlix"},{id:"custom_commission",label:"Custom Commission"}],_n=[{id:"commercial_allowed",label:"Commercial Allowed"},{id:"personal_use_only",label:"Personal Use Only"},{id:"attribution_required",label:"Attribution Required"},{id:"hive_community",label:"Hive Community"},{id:"hive_plus",label:"Hive Plus"},{id:"original_owned",label:"Original / Owned"},{id:"unknown_verify",label:"Unknown / Verify"}],cs=[{id:"none",label:"No restock"},{id:"normal",label:"Normal"},{id:"high",label:"High"},{id:"urgent",label:"Urgent"}];function ds(t){return t===null?"No price":`$${t.toFixed(2)}`}function us({product:t}){return t.main_photo_path?vt`<img
      class="product-card-photo"
      src=${t.main_photo_path}
      alt=""
      loading="lazy"
    />`:vt`<div class="product-card-photo product-card-photo--empty" aria-hidden="true">▧</div>`}function ge({product:t,onOpen:e,onStatusChange:n}){const a=s=>s.stopPropagation();return vt`
    <article class="product-card" onClick=${()=>e(t)}>
      <${us} product=${t} />
      <div class="product-card-body">
        <div class="product-card-title-row">
          <h3 class="product-card-title">${t.name}</h3>
          <span class=${"product-priority product-priority--"+t.restock_priority}>
            ${t.restock_priority==="none"?"":t.restock_priority}
          </span>
        </div>
        <div class="product-card-meta">
          <span>${t.category_label||"Uncategorized"}</span>
          <span>${t.source_label||"No source"}</span>
        </div>
        <div class="product-card-badges">
          <${ve}
            level=${t.can_sell_level}
            label=${t.can_sell_label}
            readyToList=${t.ready_to_list}
          />
          <span class="product-license-badge">${t.license_label||"License unknown"}</span>
        </div>
        <div class="product-card-footer">
          <strong>${ds(t.target_sale_price)}</strong>
          ${n?vt`<label class="product-status-select" onClick=${a}>
                <span>Status</span>
                <select
                  value=${t.status_id}
                  onChange=${s=>{s.stopPropagation(),n(t,s.target.value)}}
                >
                  ${St.map(s=>vt`<option key=${s.id} value=${s.id}>${s.label}</option>`)}
                </select>
              </label>`:vt`<span class="product-status-pill">${t.status_label}</span>`}
        </div>
      </div>
    </article>
  `}const it=L.bind(T);function ps(t){return t===null?"":String(t/3600)}function Je(t){return{name:t.name,categoryId:t.category_id??"",statusId:t.status_id,sourceId:t.source_id??"",licenseId:t.license_id??"",targetSalePrice:t.target_sale_price===null?"":String(t.target_sale_price),restockPriority:t.restock_priority,modelUrl:t.model_url??"",etsyListingUrl:t.etsy_listing_url??"",defaultMaterial:t.default_material??"",primaryColor:t.primary_color??"",accentColor:t.accent_color??"",preferredPrinterId:t.preferred_printer_id===null?"":String(t.preferred_printer_id),estimatedPrintTimeHours:ps(t.estimated_print_time_s),estimatedFilamentG:t.estimated_filament_g===null?"":String(t.estimated_filament_g),boothPrice:t.booth_price===null?"":String(t.booth_price),etsyPrice:t.etsy_price===null?"":String(t.etsy_price),packagingCost:t.packaging_cost===null?"":String(t.packaging_cost),handlingMinutes:t.handling_minutes===null?"":String(t.handling_minutes),targetMarginPct:t.target_margin_pct===null?"":String(t.target_margin_pct),pricingNotes:t.pricing_notes??"",notes:t.notes??""}}function nt(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function _s(t){const e=nt(t);return e===null?null:Math.round(e*3600)}function ms(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isInteger(n)&&n>0?n:null}function ht(t,e){return[...e?[it`<option value="">${e}</option>`]:[],...t.map(a=>it`<option key=${a.id} value=${a.id}>${a.label}</option>`)]}function $s({product:t}){return t.main_photo_path?it`<img class="product-detail-photo" src=${t.main_photo_path} alt="" />`:it`<div class="product-detail-photo product-detail-photo--empty">No product photo</div>`}function vs({product:t}){const e=[t.primary_color,t.accent_color].filter(Boolean).join(" / ");return it`<div class="product-detail-facts">
    <div><span>Category</span><strong>${t.category_label||"Uncategorized"}</strong></div>
    <div><span>Status</span><strong>${t.status_label}</strong></div>
    <div><span>Source</span><strong>${t.source_label||"Not set"}</strong></div>
    <div><span>License</span><strong>${t.license_label||"Verify"}</strong></div>
    <div>
      <span>Price</span
      ><strong
        >${t.target_sale_price===null?"—":`$${t.target_sale_price.toFixed(2)}`}</strong
      >
    </div>
    <div><span>Restock</span><strong>${t.restock_priority}</strong></div>
    <div>
      <span>Booth</span
      ><strong>${t.booth_price===null?"—":`$${t.booth_price.toFixed(2)}`}</strong>
    </div>
    <div>
      <span>Etsy</span
      ><strong>${t.etsy_price===null?"—":`$${t.etsy_price.toFixed(2)}`}</strong>
    </div>
    <div><span>Material</span><strong>${t.default_material||"Not set"}</strong></div>
    <div><span>Colors</span><strong>${e||"Not set"}</strong></div>
    <div>
      <span>Printer</span
      ><strong
        >${t.preferred_printer_id===null?"Not set":`#${t.preferred_printer_id}`}</strong
      >
    </div>
  </div>`}function fs({productId:t,navigate:e}){const[n,a]=v(null),[s,i]=v(null),[r,u]=v(!0),[d,p]=v(!1);R(()=>{let l=!1;return An(t).then(_=>{l||(a(_),i(Je(_)))}).catch(_=>{x(_ instanceof Error?_.message:"Failed to load product.","error")}).finally(()=>{l||u(!1)}),()=>{l=!0}},[t]);const c=(l,_)=>{i(f=>f&&{...f,[l]:_})},o=async l=>{if(l.preventDefault(),!s||!n)return;const _={name:s.name,category_id:s.categoryId||null,status_id:s.statusId,source_id:s.sourceId||null,license_id:s.licenseId||null,target_sale_price:nt(s.targetSalePrice),restock_priority:s.restockPriority,model_url:s.modelUrl.trim()||null,etsy_listing_url:s.etsyListingUrl.trim()||null,default_material:s.defaultMaterial.trim()||null,primary_color:s.primaryColor.trim()||null,accent_color:s.accentColor.trim()||null,preferred_printer_id:ms(s.preferredPrinterId),estimated_print_time_s:_s(s.estimatedPrintTimeHours),estimated_filament_g:nt(s.estimatedFilamentG),booth_price:nt(s.boothPrice),etsy_price:nt(s.etsyPrice),packaging_cost:nt(s.packagingCost),handling_minutes:nt(s.handlingMinutes),target_margin_pct:nt(s.targetMarginPct),pricing_notes:s.pricingNotes.trim()||null,notes:s.notes.trim()||null};p(!0);try{const f=await _e(n.id,_);if(!f)return;a(f),i(Je(f)),x("Product updated.","success")}finally{p(!1)}};return r?it`<div class="empty">Loading product…</div>`:!n||!s?it`<div class="empty">Product not found.</div>`:it`<main class="product-detail-page">
    <div class="product-detail-header">
      <button class="btn-back" onClick=${()=>e("/products")}>← Products</button>
      <div>
        <p class="products-kicker">Product detail</p>
        <h2>${n.name}</h2>
      </div>
      <${ve}
        level=${n.can_sell_level}
        label=${n.can_sell_label}
        readyToList=${n.ready_to_list}
      />
    </div>

    <section class="product-detail-layout">
      <aside class="product-detail-card">
        <${$s} product=${n} />
        <${vs} product=${n} />
        <div class=${"product-license-warning product-license-warning--"+n.can_sell_level}>
          ${n.can_sell_level==="red"?"Do not list until commercial rights are verified.":n.can_sell_level==="yellow"?"Listing may need attribution or additional notes.":"Commercial listing appears allowed."}
        </div>
      </aside>

      <form class="product-detail-form" onSubmit=${o}>
        <section class="admin-section">
          <h3 class="admin-section-title">Core fields</h3>
          <div class="product-form-grid">
            <label class="form-label">
              Name
              <input
                class="form-input"
                value=${s.name}
                onInput=${l=>c("name",l.target.value)}
              />
            </label>
            <label class="form-label">
              Status
              <select
                class="form-input"
                value=${s.statusId}
                onChange=${l=>c("statusId",l.target.value)}
              >
                ${ht(St)}
              </select>
            </label>
            <label class="form-label">
              Category
              <select
                class="form-input"
                value=${s.categoryId}
                onChange=${l=>c("categoryId",l.target.value)}
              >
                ${ht(pn,"Uncategorized")}
              </select>
            </label>
            <label class="form-label">
              Source
              <select
                class="form-input"
                value=${s.sourceId}
                onChange=${l=>c("sourceId",l.target.value)}
              >
                ${ht(fe,"Source TBD")}
              </select>
            </label>
            <label class="form-label">
              License
              <select
                class="form-input"
                value=${s.licenseId}
                onChange=${l=>c("licenseId",l.target.value)}
              >
                ${ht(_n,"Verify license")}
              </select>
            </label>
            <label class="form-label">
              Target price
              <input
                class="form-input"
                inputmode="decimal"
                placeholder="18.00"
                value=${s.targetSalePrice}
                onInput=${l=>c("targetSalePrice",l.target.value)}
              />
            </label>
            <label class="form-label">
              Restock priority
              <select
                class="form-input"
                value=${s.restockPriority}
                onChange=${l=>c("restockPriority",l.target.value)}
              >
                ${ht(cs)}
              </select>
            </label>
          </div>
        </section>

        <section class="admin-section">
          <h3 class="admin-section-title">Listing, files, and production notes</h3>
          <p class="admin-section-desc">
            Optional listing and production fields are loaded from product detail and saved with the
            rest of the product record.
          </p>
          <div class="product-form-grid">
            <label class="form-label">
              Model URL
              <input
                class="form-input"
                value=${s.modelUrl}
                placeholder="https://…"
                onInput=${l=>c("modelUrl",l.target.value)}
              />
            </label>
            <label class="form-label">
              Etsy listing URL
              <input
                class="form-input"
                value=${s.etsyListingUrl}
                placeholder="https://…"
                onInput=${l=>c("etsyListingUrl",l.target.value)}
              />
            </label>
            <label class="form-label">
              Default material
              <input
                class="form-input"
                value=${s.defaultMaterial}
                placeholder="PLA"
                onInput=${l=>c("defaultMaterial",l.target.value)}
              />
            </label>
            <label class="form-label">
              Primary color
              <input
                class="form-input"
                value=${s.primaryColor}
                placeholder="#ffffff or White"
                onInput=${l=>c("primaryColor",l.target.value)}
              />
            </label>
            <label class="form-label">
              Accent color
              <input
                class="form-input"
                value=${s.accentColor}
                placeholder="#000000 or Black"
                onInput=${l=>c("accentColor",l.target.value)}
              />
            </label>
            <label class="form-label">
              Preferred printer ID
              <input
                class="form-input"
                inputmode="numeric"
                value=${s.preferredPrinterId}
                placeholder="1"
                onInput=${l=>c("preferredPrinterId",l.target.value)}
              />
            </label>
            <label class="form-label">
              Estimated print time (hours)
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.estimatedPrintTimeHours}
                placeholder="4.5"
                onInput=${l=>c("estimatedPrintTimeHours",l.target.value)}
              />
            </label>
            <label class="form-label">
              Estimated filament (g)
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.estimatedFilamentG}
                placeholder="120"
                onInput=${l=>c("estimatedFilamentG",l.target.value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Notes
            <textarea
              class="form-input form-textarea"
              value=${s.notes}
              placeholder="Tuning notes, photo needs, listing copy reminders…"
              onInput=${l=>c("notes",l.target.value)}
            ></textarea>
          </label>
        </section>

        <section class="admin-section">
          <h3 class="admin-section-title">Product pricing defaults</h3>
          <p class="admin-section-desc">
            Defaults used when planning booth and Etsy batches. Batch-specific values can still
            override these when needed.
          </p>
          <div class="product-form-grid">
            <label class="form-label">
              Booth price
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.boothPrice}
                placeholder="12.00"
                onInput=${l=>c("boothPrice",l.target.value)}
              />
            </label>
            <label class="form-label">
              Etsy price
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.etsyPrice}
                placeholder="14.99"
                onInput=${l=>c("etsyPrice",l.target.value)}
              />
            </label>
            <label class="form-label">
              Packaging cost
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.packagingCost}
                placeholder="0.75"
                onInput=${l=>c("packagingCost",l.target.value)}
              />
            </label>
            <label class="form-label">
              Handling minutes
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.handlingMinutes}
                placeholder="3"
                onInput=${l=>c("handlingMinutes",l.target.value)}
              />
            </label>
            <label class="form-label">
              Target margin
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.targetMarginPct}
                placeholder="0.50"
                onInput=${l=>c("targetMarginPct",l.target.value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Pricing notes
            <textarea
              class="form-input form-textarea"
              value=${s.pricingNotes}
              placeholder="Booth/Etsy pricing rationale, packaging assumptions, margin notes…"
              onInput=${l=>c("pricingNotes",l.target.value)}
            ></textarea>
          </label>
        </section>

        <div class="form-actions">
          <button class="btn-secondary" type="button" onClick=${()=>e("/products")}>
            Cancel
          </button>
          <button class="btn-primary" type="submit" disabled=${d||!s.name.trim()}>
            ${d?"Saving…":"Save Product"}
          </button>
        </div>
      </form>
    </section>
  </main>`}const $t=L.bind(T),Be={urgent:0,high:1,normal:2,none:3};function Ee(t){return[...t].sort((e,n)=>{const a=(Be[e.restock_priority]??9)-(Be[n.restock_priority]??9);return a!==0?a:e.name.localeCompare(n.name)})}function gs({products:t}){const e=t.filter(s=>s.restock_priority==="urgent").length,n=t.filter(s=>s.restock_priority==="high").length,a=t.filter(s=>s.ready_to_list).length;return $t`<div class="product-print-next-summary">
    <div><strong>${t.length}</strong><span>queued</span></div>
    <div><strong>${e}</strong><span>urgent</span></div>
    <div><strong>${n}</strong><span>high</span></div>
    <div><strong>${a}</strong><span>ready to list</span></div>
  </div>`}function hs({navigate:t}){const[e,n]=v([]),[a,s]=v(!0);R(()=>{let r=!1;return Rn().then(u=>{r||n(Ee(u))}).catch(u=>{x(u instanceof Error?u.message:"Failed to load print-next products.","error")}).finally(()=>{r||s(!1)}),()=>{r=!0}},[]);const i=async(r,u)=>{if(u===r.status_id)return;const d=await _e(r.id,{status_id:u});d&&(n(p=>Ee(p.map(c=>c.id===d.id?d:c).filter(c=>["active","selling_well"].includes(c.status_id)))),x("Product status updated.","success"))};return $t`<main class="products-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Production queue</p>
        <h2>Print Next</h2>
        <p>Active and selling-well products with a restock priority, sorted urgent first.</p>
      </div>
      <div class="product-tabs" aria-label="Product views">
        <button class="product-tab" onClick=${()=>t("/products/pipeline")}>
          Pipeline
        </button>
        <button class="product-tab" onClick=${()=>t("/products")}>Catalog</button>
        <button class="product-tab active">Print Next</button>
      </div>
    </section>

    ${a?$t`<div class="empty">Loading print queue…</div>`:e.length===0?$t`<div class="empty">No active products need restocking.</div>`:$t`
            <${gs} products=${e} />
            <div class="product-print-next-grid">
              ${e.map(r=>$t`<article class="product-print-next-card" key=${r.id}>
                    <div class="product-print-next-topline">
                      <span
                        class=${"product-priority product-priority--"+r.restock_priority}
                      >
                        ${r.restock_priority}
                      </span>
                      <${ve}
                        level=${r.can_sell_level}
                        label=${r.can_sell_label}
                        readyToList=${r.ready_to_list}
                      />
                    </div>
                    <${ge}
                      product=${r}
                      onOpen=${()=>t(`/products/${r.id}`)}
                      onStatusChange=${i}
                    />
                  </article>`)}
            </div>
          `}
  </main>`}const D=L.bind(T),bs=[{id:"",label:"All sellability"},{id:"green",label:"Green"},{id:"yellow",label:"Yellow"},{id:"red",label:"Red"}];function ys(t){const e=new Map;for(const i of t){const r=e.get(i.status_id)??[];r.push(i),e.set(i.status_id,r)}const n=St.map(i=>({statusId:i.id,statusLabel:i.label,products:e.get(i.id)??[]})),a=new Set(St.map(i=>i.id)),s=[...e.entries()].filter(([i])=>!a.has(i)).map(([i,r])=>{var u;return{statusId:i,statusLabel:((u=r[0])==null?void 0:u.status_label)??i,products:r}});return[...n,...s]}function Ps(t,e){const n=e.q.trim().toLowerCase();return!(n&&![t.name,t.category_label,t.status_label,t.source_label,t.license_label].filter(Boolean).join(" ").toLowerCase().includes(n)||e.categoryId&&t.category_id!==e.categoryId||e.statusId&&t.status_id!==e.statusId||e.sourceId&&t.source_id!==e.sourceId||e.sellability&&t.can_sell_level!==e.sellability)}function ks({mode:t,navigate:e}){const n=a=>"product-tab"+(a?" active":"");return D`<div class="product-tabs" aria-label="Product views">
    <button class=${n(t==="pipeline")} onClick=${()=>e("/products/pipeline")}>
      Pipeline
    </button>
    <button class=${n(t==="catalog")} onClick=${()=>e("/products")}>
      Catalog
    </button>
    <button class="product-tab" onClick=${()=>e("/products/print-next")}>
      Print Next
    </button>
  </div>`}function ws({filters:t,setFilters:e,count:n,total:a,showStatusFilter:s}){const i=(r,u)=>e({...t,[r]:u});return D`<div class="product-toolbar">
    <input
      type="search"
      placeholder="Search products…"
      value=${t.q}
      onInput=${r=>i("q",r.target.value)}
    />
    <select
      value=${t.categoryId}
      onChange=${r=>i("categoryId",r.target.value)}
    >
      <option value="">All categories</option>
      ${pn.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    ${s?D`<select
          value=${t.statusId}
          onChange=${r=>i("statusId",r.target.value)}
        >
          <option value="">All statuses</option>
          ${St.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
        </select>`:null}
    <select
      value=${t.sourceId}
      onChange=${r=>i("sourceId",r.target.value)}
    >
      <option value="">All sources</option>
      ${fe.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    <select
      value=${t.sellability}
      onChange=${r=>i("sellability",r.target.value)}
    >
      ${bs.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    <span class="product-count"
      >${n.toLocaleString()} of ${a.toLocaleString()} products</span
    >
  </div>`}function Cs({onCreated:t}){const[e,n]=v(""),[a,s]=v("unknown_verify"),[i,r]=v(""),[u,d]=v(!1);return D`<form class="product-create-card" onSubmit=${async c=>{c.preventDefault();const o=e.trim();if(o){d(!0);try{const l=await On({name:o,status_id:"idea",license_id:a,source_id:i||null});if(!l)return;t(l),n(""),s("unknown_verify"),r(""),x("Product created.","success")}finally{d(!1)}}}}>
    <input
      class="form-input"
      placeholder="New product idea…"
      value=${e}
      onInput=${c=>n(c.target.value)}
    />
    <select
      class="form-input"
      value=${i}
      onChange=${c=>r(c.target.value)}
    >
      <option value="">Source TBD</option>
      ${fe.map(c=>D`<option key=${c.id} value=${c.id}>${c.label}</option>`)}
    </select>
    <select
      class="form-input"
      value=${a}
      onChange=${c=>s(c.target.value)}
    >
      ${_n.map(c=>D`<option key=${c.id} value=${c.id}>${c.label}</option>`)}
    </select>
    <button class="btn-primary" type="submit" disabled=${u||!e.trim()}>
      ${u?"Adding…":"Add Product"}
    </button>
  </form>`}function Ss({products:t,navigate:e,onStatusChange:n}){return t.length?D`<div class="product-grid">
    ${t.map(a=>D`<${ge}
          key=${a.id}
          product=${a}
          onOpen=${()=>e(`/products/${a.id}`)}
          onStatusChange=${n}
        />`)}
  </div>`:D`<div class="empty">No products match your filters.</div>`}function Fs({columns:t,navigate:e,onStatusChange:n}){return D`<div class="product-kanban" role="list">
    ${t.map(a=>D`<section class="product-kanban-column" key=${a.statusId} role="listitem">
          <div class="product-kanban-header">
            <h3>${a.statusLabel}</h3>
            <span>${a.products.length}</span>
          </div>
          <div class="product-kanban-cards">
            ${a.products.length?a.products.map(s=>D`<${ge}
                      key=${s.id}
                      product=${s}
                      onOpen=${()=>e(`/products/${s.id}`)}
                      onStatusChange=${n}
                    />`):D`<div class="product-column-empty">No products</div>`}
          </div>
        </section>`)}
  </div>`}function Is({mode:t,navigate:e}){const[n,a]=v([]),[s,i]=v(!0),[r,u]=v({q:"",categoryId:"",statusId:"",sourceId:"",sellability:""});R(()=>{let o=!1;return pe().then(l=>{o||a(l)}).catch(l=>{x(l instanceof Error?l.message:"Failed to load products.","error")}).finally(()=>{o||i(!1)}),()=>{o=!0}},[]);const d=W(()=>n.filter(o=>Ps(o,r)),[n,r]),p=W(()=>ys(d),[d]),c=async(o,l)=>{if(l===o.status_id)return;const _=await _e(o.id,{status_id:l});_&&(a(f=>f.map(y=>y.id===_.id?_:y)),x("Product status updated.","success"))};return D`<main class="products-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Product workflow</p>
        <h2>${t==="pipeline"?"Product Pipeline":"Product Catalog"}</h2>
        <p>
          Card-based product tracking for sellability, listing readiness, and what to print next.
        </p>
      </div>
      <${ks} mode=${t} navigate=${e} />
    </section>

    <${ws}
      filters=${r}
      setFilters=${u}
      count=${d.length}
      total=${n.length}
      showStatusFilter=${t==="catalog"}
    />

    ${t==="catalog"?D`<section class="product-create-section">
          <${Cs}
            onCreated=${o=>a(l=>[o,...l])}
          />
        </section>`:null}
    ${s?D`<div class="empty">Loading products…</div>`:t==="pipeline"?D`<${Fs}
            columns=${p}
            navigate=${e}
            onStatusChange=${c}
          />`:D`<${Ss}
            products=${d}
            navigate=${e}
            onStatusChange=${c}
          />`}
  </main>`}const B=L.bind(T);function Ts({bootStatus:t,loadProgress:e}){return B` <div class="in-app-loading" role="status" aria-live="polite">
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
          ${Array.from({length:5},(n,a)=>B`
              <div class="dashboard-loader-row" key=${a}>
                <span></span><span></span><span></span><span></span>
              </div>
            `)}
        </div>
      </div>
    </section>
  </div>`}function Ns({error:t}){return B`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${t}</p>
      </div>
    </div>
  </div>`}function js({projectId:t,projects:e,jobs:n,projectsLoading:a,navigate:s,setSelectedJob:i,handleJobProjectChange:r,setProjects:u}){const d=e.find(o=>Number(o.id)===t),p=n.filter(o=>Number(o.project_id)===t);if(!d)return a?B`<div class="empty">Loading projects…</div>`:B`<div class="empty">Project not found.</div>`;const c=n.filter(o=>o.project_id==null);return B`<${Aa}
    project=${d}
    jobs=${p}
    unassignedJobs=${c}
    onBack=${()=>s("/projects")}
    onJobClick=${i}
    onAddJob=${o=>r(o,t)}
    onRemoveJob=${o=>r(o,null)}
    onProjectUpdated=${o=>u(l=>l.some(_=>_.id===o.id)?l.map(_=>_.id===o.id?o:_):[o,...l])}
    onMoveJobToProject=${(o,l)=>r(o,l)}
    onNavigateToProject=${o=>s(`/projects/${o}`)}
  />`}function Ls({sorted:t,view:e,sortCol:n,sortDir:a,onSort:s,onJobClick:i,density:r}){return t.length===0?B`<div class="empty">No jobs match your filters.</div>`:e==="table"?B`<${ma}
      sorted=${t}
      sortCol=${n}
      sortDir=${a}
      onSort=${s}
      onJobClick=${i}
      density=${r}
    />`:B`<${va} sorted=${t} onJobClick=${i} density=${r} />`}function Ms({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:s,setDeviceFilter:i,devices:r,view:u,setView:d,filtered:p,jobs:c,isFiltered:o,sorted:l,sortCol:_,sortDir:f,onSort:y,onJobClick:m,density:g,setDensity:$}){return B`
    <${da}
      q=${t}
      setQ=${e}
      statusFilter=${n}
      setStatusFilter=${a}
      deviceFilter=${s}
      setDeviceFilter=${i}
      devices=${r}
      view=${u}
      setView=${d}
      density=${g}
      setDensity=${$}
      filteredCount=${p.length}
      totalCount=${c.length}
    />
    <${ua} filtered=${p} isFiltered=${o} />
    ${Ls({sorted:l,view:u,sortCol:_,sortDir:f,onSort:y,onJobClick:m,density:g})}
  `}function xs(t){const e=t.match(/^\/projects\/(\d+)$/),n=t.match(/^\/products\/(\d+)$/),a=t.match(/^\/batches\/(\d+)$/);return{isAdmin:t.startsWith("/admin"),isPrinters:t.startsWith("/printers"),isProjects:t.startsWith("/projects"),isCatalog:t.startsWith("/catalog"),isProducts:t.startsWith("/products"),isProductPipeline:t==="/products/pipeline",isProductPrintNext:t==="/products/print-next",isBatches:t.startsWith("/batches"),projectId:e?Number(e[1]):null,productId:n?Number(n[1]):null,batchId:a?Number(a[1]):null}}function Ds({route:t,summary:e,projects:n,setProjects:a,jobs:s,projectsLoading:i,navigate:r,setSelectedJob:u,handleJobProjectChange:d,handleRatesChanged:p,handleAutoGroup:c,projectPrices:o,q:l,setQ:_,statusFilter:f,setStatusFilter:y,deviceFilter:m,setDeviceFilter:g,devices:$,view:b,setView:P,filtered:w,isFiltered:h,sorted:k,sortCol:S,sortDir:N,density:O,setDensity:K,handleSort:lt}){return t.isAdmin?B`<${za} onRatesChanged=${p} />`:t.batchId!=null?B`<${es} batchId=${t.batchId} navigate=${r} />`:t.isBatches?B`<${ss} navigate=${r} />`:t.productId!=null?B`<${fs} productId=${t.productId} navigate=${r} />`:t.isProductPrintNext?B`<${hs} navigate=${r} />`:t.isProducts?B`<${Is}
      mode=${t.isProductPipeline?"pipeline":"catalog"}
      navigate=${r}
    />`:t.isCatalog?B`<${rs} />`:t.isPrinters?B`<${ta}
      summary=${e}
      jobs=${s}
      onJobClick=${u}
    />`:t.projectId!=null?B`<${js}
      projectId=${t.projectId}
      projects=${n}
      jobs=${s}
      projectsLoading=${i}
      navigate=${r}
      setSelectedJob=${u}
      handleJobProjectChange=${d}
      setProjects=${a}
    />`:t.isProjects?B`<${Ra}
      projects=${n}
      setProjects=${a}
      onAutoGroup=${c}
      projectPrices=${o}
      loading=${i}
    />`:B`<${Ms}
    q=${l}
    setQ=${_}
    statusFilter=${f}
    setStatusFilter=${y}
    deviceFilter=${m}
    setDeviceFilter=${g}
    devices=${$}
    view=${b}
    setView=${P}
    filtered=${w}
    jobs=${s}
    isFiltered=${h}
    sorted=${k}
    sortCol=${S}
    sortDir=${N}
    onSort=${lt}
    onJobClick=${u}
    density=${O}
    setDensity=${K}
  />`}function Js({setJobs:t,setProjects:e,setProjectPrices:n,setSummary:a,setDataRange:s,toast:i}){const[r,u]=v(!0),[d,p]=v(!0),[c,o]=v(0),[l,_]=v(null),[f,y]=v("Starting dashboard…"),m=C(async({url:b,fallback:P,onData:w,onFinally:h})=>{const{data:k,error:S}=await ue(b,P);S&&i(S.message||P,"error"),k&&w(k),h&&h()},[i]),g=C(()=>{m({url:"/projects",fallback:"Failed to load projects.",onData:b=>b.projects&&e(b.projects),onFinally:()=>p(!1)}),m({url:"/projects/prices",fallback:"Failed to load project prices.",onData:b=>b.prices&&n(b.prices)})},[m,e,n]),$=C((b=!1)=>{m({url:"/jobs/prices",fallback:b?"Failed to refresh job prices.":"Failed to load job prices.",onData:w=>{w!=null&&w.prices&&t(h=>h.map(k=>{var S;return{...k,final_price:((S=w.prices)==null?void 0:S[k.id])??(b?k.final_price:null)??null}}))}})},[m,t]);return R(()=>{const b=()=>o(h=>Math.min(100,h+100/Dn)),P=(h,k,S)=>(y(`Loading ${h}…`),V(h,k).catch(N=>{const O=N instanceof Error?N.message:k;throw new Error(`Initial dashboard load failed (${S}): ${O}`)}).finally(b)),w=setTimeout(()=>{_("Dashboard load timed out. Check console/network for the failing request."),u(!1),p(!1)},xn);return Promise.all([P("/ui/data","Failed to load jobs.","jobs"),P("/summary","Failed to load summary.","summary"),P("/health/data-range","Failed to load print history range.","history range")]).then(([h,k,S])=>{t(h.jobs),a(k),s(S),u(!1),y("Loading optional data…"),$(!1),g()}).catch(h=>{_(h.message),u(!1),p(!1)}).finally(()=>clearTimeout(w)),()=>clearTimeout(w)},[t,a,s,$,g]),{loading:r,projectsLoading:d,loadProgress:c,error:l,bootStatus:f,refreshProjectsAndPrices:g,refreshJobPrices:$}}function Bs(t,e,n,a){return t.filter(s=>{const i=`${s.designTitle||""} ${s.customer||""}`.toLowerCase();return!(e&&!i.includes(e.toLowerCase())||n&&(s.status||"").toLowerCase()!==n||a&&s.deviceModel!==a)})}function Es(t,e,n){return[...t].sort((a,s)=>{let i=a[e],r=s[e];if(i==null&&(i=n==="asc"?1/0:-1/0),r==null&&(r=n==="asc"?1/0:-1/0),typeof i=="string"){const p=typeof r=="string"?r:String(r);return n==="asc"?i.localeCompare(p):p.localeCompare(i)}const u=Number(i),d=Number(r);return n==="asc"?u-d:d-u})}const wt=L.bind(T);function Us(){const[t,e]=v([]),[n,a]=v([]),[s,i]=v({}),[r,u]=v(null),[d,p]=v(null),[c,o]=v("table"),[l,_]=v("comfy"),[f,y]=v(""),[m,g]=v(""),[$,b]=v(""),[P,w]=v("startTime"),[h,k]=v("desc"),[S,N]=v(null);return{jobs:t,setJobs:e,projects:n,setProjects:a,projectPrices:s,setProjectPrices:i,summary:r,setSummary:u,dataRange:d,setDataRange:p,view:c,setView:o,density:l,setDensity:_,q:f,setQ:y,statusFilter:m,setStatusFilter:g,deviceFilter:$,setDeviceFilter:b,sortCol:P,setSortCol:w,sortDir:h,setSortDir:k,selectedJob:S,setSelectedJob:N}}function As({jobs:t,q:e,statusFilter:n,deviceFilter:a,sortCol:s,sortDir:i,setSortCol:r,setSortDir:u,loc:d}){const p=W(()=>[...new Set(t.map(y=>y.deviceModel).filter(y=>!!y))].sort(),[t]),c=!!(e||n||a),o=W(()=>Bs(t,e,n,a),[t,e,n,a]),l=W(()=>Es(o,s,i),[o,s,i]),_=C(y=>{if(s===y){u(m=>m==="asc"?"desc":"asc");return}r(y),u(()=>y==="startTime"?"desc":"asc")},[s,r,u]),f=W(()=>xs(d),[d]);return{devices:p,isFiltered:c,filtered:o,sorted:l,handleSort:_,route:f}}function Rs({setJobs:t,setProjects:e,setSummary:n,setSelectedJob:a,navigate:s,refreshProjectsAndPrices:i,refreshJobPrices:r}){const u=C(($,b)=>{t(P=>P.map(w=>w.id===$?{...w,...b}:w)),a(P=>P&&P.id===$?{...P,...b}:P)},[]),d=C(async($,b)=>{const P=await tt(`/jobs/${$}`,b,"Failed to update job.");if(!(P!=null&&P.job))return null;const{job:w}=P;return u($,w),w},[u]),p=C(($,b)=>{d($,b)},[d]),c=C(async($,b)=>{await d($,{project_id:b})&&i()},[d,i]),o=C(($,b)=>{p($,{status_override:b})},[p]),l=C(($,b)=>{p($,{extra_labor_minutes:b})},[p]),_=C($=>{a(null),s(`/projects/${$}`)},[s]),f=C(()=>{r(!0),i()},[r,i]),y=C(async()=>{f();try{const $=await V("/summary","Failed to refresh summary.");n($),x("Pricing refreshed from updated rates.","success")}catch($){const b=$ instanceof Error?$.message:"Updated rates saved, but summary refresh failed.";x(b,"error")}},[f,n]),m=C(async()=>{const[$,b]=await Promise.all([V("/ui/data","Failed to refresh jobs."),V("/projects","Failed to refresh projects.")]);t(()=>$.jobs),e(b.projects),f()},[f,e]);return{closeModal:C(()=>a(null),[]),patchJob:d,handleJobProjectChange:c,handleJobStatusChange:o,handleJobExtraLaborChange:l,handleNavigateToProject:_,handleRatesChanged:y,handleAutoGroup:m}}function Os({selectedJob:t,closeModal:e,patchJob:n,projects:a,handleJobProjectChange:s,handleJobStatusChange:i,handleJobExtraLaborChange:r,handleNavigateToProject:u}){return t?wt`<${ba}
    key=${t.id}
    job=${t}
    onClose=${e}
    onPatch=${n}
    projects=${a}
    onJobProjectChange=${s}
    onJobStatusChange=${i}
    onJobExtraLaborChange=${r}
    onNavigateToProject=${u}
  />`:null}function Hs(t){const e=C(s=>t.setProjects(s),[t.setProjects]),n=C(s=>t.setSummary(s),[t.setSummary]),a=C(s=>t.setDataRange(s),[t.setDataRange]);return Js({setJobs:t.setJobs,setProjects:e,setProjectPrices:t.setProjectPrices,setSummary:n,setDataRange:a,toast:x})}function qs(){const t=Us(),[e,n]=oe(),{loading:a,projectsLoading:s,loadProgress:i,error:r,bootStatus:u,refreshProjectsAndPrices:d,refreshJobPrices:p}=Hs(t),{devices:c,isFiltered:o,filtered:l,sorted:_,handleSort:f,route:y}=As({jobs:t.jobs,q:t.q,statusFilter:t.statusFilter,deviceFilter:t.deviceFilter,sortCol:t.sortCol,sortDir:t.sortDir,setSortCol:t.setSortCol,setSortDir:t.setSortDir,loc:e}),{closeModal:m,patchJob:g,handleJobProjectChange:$,handleJobStatusChange:b,handleJobExtraLaborChange:P,handleNavigateToProject:w,handleRatesChanged:h,handleAutoGroup:k}=Rs({setJobs:t.setJobs,setProjects:t.setProjects,setSummary:t.setSummary,setSelectedJob:t.setSelectedJob,navigate:n,refreshProjectsAndPrices:d,refreshJobPrices:p});return a?wt`<${Ts} bootStatus=${u} loadProgress=${i} />`:r?wt`<${Ns} error=${r} />`:wt`
    <${ca} summary=${t.summary} dataRange=${t.dataRange} />
    ${Ds({route:y,summary:t.summary,projects:t.projects,setProjects:t.setProjects,jobs:t.jobs,projectsLoading:s,navigate:n,setSelectedJob:t.setSelectedJob,handleJobProjectChange:$,handleRatesChanged:h,handleAutoGroup:k,projectPrices:t.projectPrices,q:t.q,setQ:t.setQ,statusFilter:t.statusFilter,setStatusFilter:t.setStatusFilter,deviceFilter:t.deviceFilter,setDeviceFilter:t.setDeviceFilter,devices:c,view:t.view,setView:t.setView,density:t.density,setDensity:t.setDensity,filtered:l,isFiltered:o,sorted:_,sortCol:t.sortCol,sortDir:t.sortDir,handleSort:f})}
    <${Os}
      selectedJob=${t.selectedJob}
      closeModal=${m}
      patchJob=${g}
      projects=${t.projects}
      handleJobProjectChange=${$}
      handleJobStatusChange=${b}
      handleJobExtraLaborChange=${P}
      handleNavigateToProject=${w}
    />
    <${Ln} />
  `}const Ws=wt`<${Le} base="/ui"><${qs} /></${Le}>`;kn(Ws,document.getElementById("app"));
