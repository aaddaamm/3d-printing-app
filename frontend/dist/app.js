(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();var Ut,C,Ue,et,he,Ae,Re,Qt,Mt,ht,Oe,ne,Kt,Yt,He,Bt={},Jt=[],$n=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,At=Array.isArray;function Y(t,e){for(var n in e)t[n]=e[n];return t}function ae(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function S(t,e,n){var a,i,s,r={};for(s in e)s=="key"?a=e[s]:s=="ref"?i=e[s]:r[s]=e[s];if(arguments.length>2&&(r.children=arguments.length>3?Ut.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(s in t.defaultProps)r[s]===void 0&&(r[s]=t.defaultProps[s]);return xt(t,r,a,i,null)}function xt(t,e,n,a,i){var s={type:t,props:e,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:i??++Ue,__i:-1,__u:0};return i==null&&C.vnode!=null&&C.vnode(s),s}function Rt(t){return t.children}function jt(t,e){this.props=t,this.context=e}function mt(t,e){if(e==null)return t.__?mt(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?mt(t):null}function vn(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,a=[],i=[],s=Y({},e);s.__v=e.__v+1,C.vnode&&C.vnode(s),ie(t.__P,s,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,a,n??mt(e),!!(32&e.__u),i),s.__v=e.__v,s.__.__k[s.__i]=s,Ve(a,s,i),e.__e=e.__=null,s.__e!=n&&qe(s)}}function qe(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),qe(t)}function Xt(t){(!t.__d&&(t.__d=!0)&&et.push(t)&&!Et.__r++||he!=C.debounceRendering)&&((he=C.debounceRendering)||Ae)(Et)}function Et(){try{for(var t,e=1;et.length;)et.length>e&&et.sort(Re),t=et.shift(),e=et.length,vn(t)}finally{et.length=Et.__r=0}}function We(t,e,n,a,i,s,r,c,d,u,p){var o,l,m,h,$,_,v,f=a&&a.__k||Jt,b=e.length;for(d=fn(n,e,f,d,b),o=0;o<b;o++)(m=n.__k[o])!=null&&(l=m.__i!=-1&&f[m.__i]||Bt,m.__i=o,_=ie(t,m,l,i,s,r,c,d,u,p),h=m.__e,m.ref&&l.ref!=m.ref&&(l.ref&&se(l.ref,null,m),p.push(m.ref,m.__c||h,m)),$==null&&h!=null&&($=h),(v=!!(4&m.__u))||l.__k===m.__k?(d=Qe(m,d,t,v),v&&l.__e&&(l.__e=null)):typeof m.type=="function"&&_!==void 0?d=_:h&&(d=h.nextSibling),m.__u&=-7);return n.__e=$,d}function fn(t,e,n,a,i){var s,r,c,d,u,p=n.length,o=p,l=0;for(t.__k=new Array(i),s=0;s<i;s++)(r=e[s])!=null&&typeof r!="boolean"&&typeof r!="function"?(typeof r=="string"||typeof r=="number"||typeof r=="bigint"||r.constructor==String?r=t.__k[s]=xt(null,r,null,null,null):At(r)?r=t.__k[s]=xt(Rt,{children:r},null,null,null):r.constructor===void 0&&r.__b>0?r=t.__k[s]=xt(r.type,r.props,r.key,r.ref?r.ref:null,r.__v):t.__k[s]=r,d=s+l,r.__=t,r.__b=t.__b+1,c=null,(u=r.__i=gn(r,n,d,o))!=-1&&(o--,(c=n[u])&&(c.__u|=2)),c==null||c.__v==null?(u==-1&&(i>p?l--:i<p&&l++),typeof r.type!="function"&&(r.__u|=4)):u!=d&&(u==d-1?l--:u==d+1?l++:(u>d?l--:l++,r.__u|=4))):t.__k[s]=null;if(o)for(s=0;s<p;s++)(c=n[s])!=null&&(2&c.__u)==0&&(c.__e==a&&(a=mt(c)),ze(c,c));return a}function Qe(t,e,n,a){var i,s;if(typeof t.type=="function"){for(i=t.__k,s=0;i&&s<i.length;s++)i[s]&&(i[s].__=t,e=Qe(i[s],e,n,a));return e}t.__e!=e&&(a&&(e&&t.type&&!e.parentNode&&(e=mt(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function gn(t,e,n,a){var i,s,r,c=t.key,d=t.type,u=e[n],p=u!=null&&(2&u.__u)==0;if(u===null&&c==null||p&&c==u.key&&d==u.type)return n;if(a>(p?1:0)){for(i=n-1,s=n+1;i>=0||s<e.length;)if((u=e[r=i>=0?i--:s++])!=null&&(2&u.__u)==0&&c==u.key&&d==u.type)return r}return-1}function be(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||$n.test(e)?n:n+"px"}function Ft(t,e,n,a,i){var s,r;t:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof a=="string"&&(t.style.cssText=a=""),a)for(e in a)n&&e in n||be(t.style,e,"");if(n)for(e in n)a&&n[e]==a[e]||be(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")s=e!=(e=e.replace(Oe,"$1")),r=e.toLowerCase(),e=r in t||e=="onFocusOut"||e=="onFocusIn"?r.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+s]=n,n?a?n[ht]=a[ht]:(n[ht]=ne,t.addEventListener(e,s?Yt:Kt,s)):t.removeEventListener(e,s?Yt:Kt,s);else{if(i=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break t}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function ye(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[Mt]==null)e[Mt]=ne++;else if(e[Mt]<n[ht])return;return n(C.event?C.event(e):e)}}}function ie(t,e,n,a,i,s,r,c,d,u){var p,o,l,m,h,$,_,v,f,b,y,P,k,F,J,E=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[c=e.__e=n.__e]),(p=C.__b)&&p(e);t:if(typeof E=="function")try{if(v=e.props,f=E.prototype&&E.prototype.render,b=(p=E.contextType)&&a[p.__c],y=p?b?b.props.value:p.__:a,n.__c?_=(o=e.__c=n.__c).__=o.__E:(f?e.__c=o=new E(v,y):(e.__c=o=new jt(v,y),o.constructor=E,o.render=bn),b&&b.sub(o),o.state||(o.state={}),o.__n=a,l=o.__d=!0,o.__h=[],o._sb=[]),f&&o.__s==null&&(o.__s=o.state),f&&E.getDerivedStateFromProps!=null&&(o.__s==o.state&&(o.__s=Y({},o.__s)),Y(o.__s,E.getDerivedStateFromProps(v,o.__s))),m=o.props,h=o.state,o.__v=e,l)f&&E.getDerivedStateFromProps==null&&o.componentWillMount!=null&&o.componentWillMount(),f&&o.componentDidMount!=null&&o.__h.push(o.componentDidMount);else{if(f&&E.getDerivedStateFromProps==null&&v!==m&&o.componentWillReceiveProps!=null&&o.componentWillReceiveProps(v,y),e.__v==n.__v||!o.__e&&o.shouldComponentUpdate!=null&&o.shouldComponentUpdate(v,o.__s,y)===!1){e.__v!=n.__v&&(o.props=v,o.state=o.__s,o.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(W){W&&(W.__=e)}),Jt.push.apply(o.__h,o._sb),o._sb=[],o.__h.length&&r.push(o);break t}o.componentWillUpdate!=null&&o.componentWillUpdate(v,o.__s,y),f&&o.componentDidUpdate!=null&&o.__h.push(function(){o.componentDidUpdate(m,h,$)})}if(o.context=y,o.props=v,o.__P=t,o.__e=!1,P=C.__r,k=0,f)o.state=o.__s,o.__d=!1,P&&P(e),p=o.render(o.props,o.state,o.context),Jt.push.apply(o.__h,o._sb),o._sb=[];else do o.__d=!1,P&&P(e),p=o.render(o.props,o.state,o.context),o.state=o.__s;while(o.__d&&++k<25);o.state=o.__s,o.getChildContext!=null&&(a=Y(Y({},a),o.getChildContext())),f&&!l&&o.getSnapshotBeforeUpdate!=null&&($=o.getSnapshotBeforeUpdate(m,h)),F=p!=null&&p.type===Rt&&p.key==null?Ge(p.props.children):p,c=We(t,At(F)?F:[F],e,n,a,i,s,r,c,d,u),o.base=e.__e,e.__u&=-161,o.__h.length&&r.push(o),_&&(o.__E=o.__=null)}catch(W){if(e.__v=null,d||s!=null)if(W.then){for(e.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;s[s.indexOf(c)]=null,e.__e=c}else{for(J=s.length;J--;)ae(s[J]);Zt(e)}else e.__e=n.__e,e.__k=n.__k,W.then||Zt(e);C.__e(W,e,n)}else s==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):c=e.__e=hn(n.__e,e,n,a,i,s,r,d,u);return(p=C.diffed)&&p(e),128&e.__u?void 0:c}function Zt(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(Zt))}function Ve(t,e,n){for(var a=0;a<n.length;a++)se(n[a],n[++a],n[++a]);C.__c&&C.__c(e,t),t.some(function(i){try{t=i.__h,i.__h=[],t.some(function(s){s.call(i)})}catch(s){C.__e(s,i.__v)}})}function Ge(t){return typeof t!="object"||t==null||t.__b>0?t:At(t)?t.map(Ge):Y({},t)}function hn(t,e,n,a,i,s,r,c,d){var u,p,o,l,m,h,$,_=n.props||Bt,v=e.props,f=e.type;if(f=="svg"?i="http://www.w3.org/2000/svg":f=="math"?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),s!=null){for(u=0;u<s.length;u++)if((m=s[u])&&"setAttribute"in m==!!f&&(f?m.localName==f:m.nodeType==3)){t=m,s[u]=null;break}}if(t==null){if(f==null)return document.createTextNode(v);t=document.createElementNS(i,f,v.is&&v),c&&(C.__m&&C.__m(e,s),c=!1),s=null}if(f==null)_===v||c&&t.data==v||(t.data=v);else{if(s=s&&Ut.call(t.childNodes),!c&&s!=null)for(_={},u=0;u<t.attributes.length;u++)_[(m=t.attributes[u]).name]=m.value;for(u in _)m=_[u],u=="dangerouslySetInnerHTML"?o=m:u=="children"||u in v||u=="value"&&"defaultValue"in v||u=="checked"&&"defaultChecked"in v||Ft(t,u,null,m,i);for(u in v)m=v[u],u=="children"?l=m:u=="dangerouslySetInnerHTML"?p=m:u=="value"?h=m:u=="checked"?$=m:c&&typeof m!="function"||_[u]===m||Ft(t,u,m,_[u],i);if(p)c||o&&(p.__html==o.__html||p.__html==t.innerHTML)||(t.innerHTML=p.__html),e.__k=[];else if(o&&(t.innerHTML=""),We(e.type=="template"?t.content:t,At(l)?l:[l],e,n,a,f=="foreignObject"?"http://www.w3.org/1999/xhtml":i,s,r,s?s[0]:n.__k&&mt(n,0),c,d),s!=null)for(u=s.length;u--;)ae(s[u]);c||(u="value",f=="progress"&&h==null?t.removeAttribute("value"):h!=null&&(h!==t[u]||f=="progress"&&!h||f=="option"&&h!=_[u])&&Ft(t,u,h,_[u],i),u="checked",$!=null&&$!=t[u]&&Ft(t,u,$,_[u],i))}return t}function se(t,e,n){try{if(typeof t=="function"){var a=typeof t.__u=="function";a&&t.__u(),a&&e==null||(t.__u=t(e))}else t.current=e}catch(i){C.__e(i,n)}}function ze(t,e,n){var a,i;if(C.unmount&&C.unmount(t),(a=t.ref)&&(a.current&&a.current!=t.__e||se(a,null,e)),(a=t.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){C.__e(s,e)}a.base=a.__P=null}if(a=t.__k)for(i=0;i<a.length;i++)a[i]&&ze(a[i],e,n||typeof t.type!="function");n||ae(t.__e),t.__c=t.__=t.__e=void 0}function bn(t,e,n){return this.constructor(t,n)}function yn(t,e,n){var a,i,s,r;e==document&&(e=document.documentElement),C.__&&C.__(t,e),i=(a=!1)?null:e.__k,s=[],r=[],ie(e,t=e.__k=S(Rt,null,[t]),i||Bt,Bt,e.namespaceURI,i?null:e.firstChild?Ut.call(e.childNodes):null,s,i?i.__e:e.firstChild,a,r),Ve(s,t,r)}function Pn(t){function e(n){var a,i;return this.getChildContext||(a=new Set,(i={})[e.__c]=this,this.getChildContext=function(){return i},this.componentWillUnmount=function(){a=null},this.shouldComponentUpdate=function(s){this.props.value!=s.value&&a.forEach(function(r){r.__e=!0,Xt(r)})},this.sub=function(s){a.add(s);var r=s.componentWillUnmount;s.componentWillUnmount=function(){a&&a.delete(s),r&&r.call(s)}}),n.children}return e.__c="__cC"+He++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,a){return n.children(a)}).contextType=e,e}Ut=Jt.slice,C={__e:function(t,e,n,a){for(var i,s,r;e=e.__;)if((i=e.__c)&&!i.__)try{if((s=i.constructor)&&s.getDerivedStateFromError!=null&&(i.setState(s.getDerivedStateFromError(t)),r=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(t,a||{}),r=i.__d),r)return i.__E=i}catch(c){t=c}throw t}},Ue=0,jt.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=Y({},this.state),typeof t=="function"&&(t=t(Y({},n),this.props)),t&&Y(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),Xt(this))},jt.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Xt(this))},jt.prototype.render=Rt,et=[],Ae=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Re=function(t,e){return t.__v.__b-e.__v.__b},Et.__r=0,Qt=Math.random().toString(8),Mt="__d"+Qt,ht="__a"+Qt,Oe=/(PointerCapture)$|Capture$/i,ne=0,Kt=ye(!1),Yt=ye(!0),He=0;var $t,L,Vt,Pe,Pt=0,Ke=[],D=C,we=D.__b,ke=D.__r,Ce=D.diffed,Se=D.__c,Fe=D.unmount,Ie=D.__;function Ot(t,e){D.__h&&D.__h(L,t,Pt||e),Pt=0;var n=L.__H||(L.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function g(t){return Pt=1,wn(Ze,t)}function wn(t,e,n){var a=Ot($t++,2);if(a.t=t,!a.__c&&(a.__=[Ze(void 0,e),function(c){var d=a.__N?a.__N[0]:a.__[0],u=a.t(d,c);d!==u&&(a.__N=[u,a.__[1]],a.__c.setState({}))}],a.__c=L,!L.__f)){var i=function(c,d,u){if(!a.__c.__H)return!0;var p=a.__c.__H.__.filter(function(l){return l.__c});if(p.every(function(l){return!l.__N}))return!s||s.call(this,c,d,u);var o=a.__c.props!==c;return p.some(function(l){if(l.__N){var m=l.__[0];l.__=l.__N,l.__N=void 0,m!==l.__[0]&&(o=!0)}}),s&&s.call(this,c,d,u)||o};L.__f=!0;var s=L.shouldComponentUpdate,r=L.componentWillUpdate;L.componentWillUpdate=function(c,d,u){if(this.__e){var p=s;s=void 0,i(c,d,u),s=p}r&&r.call(this,c,d,u)},L.shouldComponentUpdate=i}return a.__N||a.__}function R(t,e){var n=Ot($t++,3);!D.__s&&Xe(n.__H,e)&&(n.__=t,n.u=e,L.__H.__h.push(n))}function Ye(t){return Pt=5,q(function(){return{current:t}},[])}function q(t,e){var n=Ot($t++,7);return Xe(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function w(t,e){return Pt=8,q(function(){return t},e)}function kn(t){var e=L.context[t.__c],n=Ot($t++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(L)),e.props.value):t.__}function Cn(){for(var t;t=Ke.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(Dt),e.__h.some(te),e.__h=[]}catch(n){e.__h=[],D.__e(n,t.__v)}}}D.__b=function(t){L=null,we&&we(t)},D.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Ie&&Ie(t,e)},D.__r=function(t){ke&&ke(t),$t=0;var e=(L=t.__c).__H;e&&(Vt===L?(e.__h=[],L.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(Dt),e.__h.some(te),e.__h=[],$t=0)),Vt=L},D.diffed=function(t){Ce&&Ce(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Ke.push(e)!==1&&Pe===D.requestAnimationFrame||((Pe=D.requestAnimationFrame)||Sn)(Cn)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),Vt=L=null},D.__c=function(t,e){e.some(function(n){try{n.__h.some(Dt),n.__h=n.__h.filter(function(a){return!a.__||te(a)})}catch(a){e.some(function(i){i.__h&&(i.__h=[])}),e=[],D.__e(a,n.__v)}}),Se&&Se(t,e)},D.unmount=function(t){Fe&&Fe(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(a){try{Dt(a)}catch(i){e=i}}),n.__H=void 0,e&&D.__e(e,n.__v))};var Te=typeof requestAnimationFrame=="function";function Sn(t){var e,n=function(){clearTimeout(a),Te&&cancelAnimationFrame(e),setTimeout(t)},a=setTimeout(n,35);Te&&(e=requestAnimationFrame(n))}function Dt(t){var e=L,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),L=e}function te(t){var e=L;t.__c=t.__(),L=e}function Xe(t,e){return!t||t.length!==e.length||e.some(function(n,a){return n!==t[a]})}function Ze(t,e){return typeof e=="function"?e(t):e}var tn=function(t,e,n,a){var i;e[0]=0;for(var s=1;s<e.length;s++){var r=e[s++],c=e[s]?(e[0]|=r?1:2,n[e[s++]]):e[++s];r===3?a[0]=c:r===4?a[1]=Object.assign(a[1]||{},c):r===5?(a[1]=a[1]||{})[e[++s]]=c:r===6?a[1][e[++s]]+=c+"":r?(i=t.apply(c,tn(t,c,n,["",null])),a.push(i),c[0]?e[0]|=2:(e[s-2]=0,e[s]=i)):a.push(c)}return a},Ne=new Map;function N(t){var e=Ne.get(this);return e||(e=new Map,Ne.set(this,e)),(e=tn(this,e.get(t)||(e.set(t,e=(function(n){for(var a,i,s=1,r="",c="",d=[0],u=function(l){s===1&&(l||(r=r.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,l,r):s===3&&(l||r)?(d.push(3,l,r),s=2):s===2&&r==="..."&&l?d.push(4,l,0):s===2&&r&&!l?d.push(5,0,!0,r):s>=5&&((r||!l&&s===5)&&(d.push(s,0,r,i),s=6),l&&(d.push(s,l,0,i),s=6)),r=""},p=0;p<n.length;p++){p&&(s===1&&u(),u(p));for(var o=0;o<n[p].length;o++)a=n[p][o],s===1?a==="<"?(u(),d=[d],s=3):r+=a:s===4?r==="--"&&a===">"?(s=1,r=""):r=a+r[0]:c?a===c?c="":r+=a:a==='"'||a==="'"?c=a:a===">"?(u(),s=1):s&&(a==="="?(s=5,i=r,r=""):a==="/"&&(s<5||n[p][o+1]===">")?(u(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(u(),s=2):r+=a),s===3&&r==="!--"&&(s=4,d=d[0])}return u(),d})(t)),e),arguments,[])).length>1?e:e[0]}const Fn=N.bind(S),ee=Pn(null);function Le({base:t,children:e}){const n=t.endsWith("/")?t.slice(0,-1):t,a=c=>c===n||c===n+"/"?"/":c.startsWith(n+"/")?c.slice(n.length)||"/":c,[i,s]=g(()=>a(location.pathname));R(()=>{const c=()=>s(a(location.pathname));return window.addEventListener("popstate",c),()=>window.removeEventListener("popstate",c)},[n]);const r=w(c=>{const d=c==="/"?n+"/":n+c;history.pushState(null,"",d),s(c)},[n]);return Fn`<${ee.Provider} value=${[i,r]}>${e}</${ee.Provider}>`}function re(){const t=kn(ee);if(!t)throw new Error("useLocation must be used within RouterProvider");return t}function st(t){if(!t)return"—";const e=Math.floor(t/3600),n=Math.floor(t%3600/60);return e===0?`${n}m`:`${e}h${n>0?` ${n}m`:""}`}function oe(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"};return e.toLocaleString(void 0,a)}function it(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric"}:{month:"short",day:"numeric",year:"2-digit"};return e.toLocaleDateString(void 0,a)}function A(t){return"$"+t.toFixed(2)}function kt(t){return t==null?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function le(t){return t?t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${Math.round(t)} g`:"0 g"}const rt=N.bind(S),In={finish:"badge badge-finish",running:"badge badge-running",failed:"badge badge-failed",cancel:"badge badge-cancel",pause:"badge badge-pause"};function Ct({status:t}){const e=(t||"").toLowerCase();return rt`<span class=${In[e]||"badge badge-default"}>${e||"unknown"}</span>`}function Ht({url:t}){const[e,n]=g(!1);return!t||e?rt`<div class="row-thumb-ph">🖨</div>`:rt`<img
    class="row-thumb"
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>n(!0)}
  />`}function Tn({url:t,className:e}){const[n,a]=g(!1);return!t||n?rt`<div class="cover-placeholder">🖨</div>`:rt`<img
    class=${e}
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>a(!0)}
  />`}function qt({colors:t}){if(!(t!=null&&t.length))return null;const e=[...new Set(t.map(n=>n.slice(0,6).toUpperCase()))].filter(n=>n!=="FFFFFF");return e.length?rt`<span class="swatches"
    >${e.map(n=>rt`<span class="swatch" style=${"background:#"+n} title=${"#"+n} />`)}</span
  >`:null}const Me=N.bind(S);let en=()=>{};function U(t,e="info"){en({message:t,type:e,id:Date.now()+Math.random()})}function Nn(){const[t,e]=g([]),n=Ye(new Map);en=w(i=>{e(r=>[...r,i]);const s=setTimeout(()=>{e(r=>r.filter(c=>c.id!==i.id)),n.current.delete(i.id)},3500);n.current.set(i.id,s)},[]);const a=w(i=>{const s=n.current.get(i);s&&clearTimeout(s),n.current.delete(i),e(r=>r.filter(c=>c.id!==i))},[]);return t.length?Me`
    <div class="toast-container">
      ${t.map(i=>Me`
          <div class="toast toast-${i.type}" key=${i.id} onClick=${()=>a(i.id)}>
            ${i.message}
          </div>
        `)}
    </div>
  `:null}const Ln=15e3,Mn=2e4,xn=5,ce=[{id:"personal",label:"Personal"},{id:"booth",label:"Booth"},{id:"etsy",label:"Etsy"},{id:"custom",label:"Custom"}];async function jn(t,e){try{const n=await t.json();return typeof n.error=="string"?n.error:e}catch{return e}}function Dn(t){const{timeoutMs:e=Ln,...n}=t??{};return n.signal||e===null?n:{signal:AbortSignal.timeout(e),...n}}function Bn(t,e){return(t==null?void 0:t.name)==="TimeoutError"?new Error(`${e} (request timed out)`):new Error(`${e} (network error)`)}async function G(t,e,n){let a;try{a=await fetch(t,Dn(n))}catch(i){throw Bn(i,e)}if(!a.ok)throw new Error(await jn(a,e));return await a.json()}async function de(t,e,n){try{return{data:await G(t,e,n),error:null}}catch(a){return{data:null,error:a instanceof Error?a:new Error(e)}}}async function ot(t,e,n){const{data:a,error:i}=await de(t,e,n);return i?(U(i.message||e,"error"),null):a}async function X(t,e,n){return ot(t,n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}async function lt(t,e,n,a){return ot(t,n,{...a,method:"POST",headers:{"Content-Type":"application/json",...a==null?void 0:a.headers},body:JSON.stringify(e)})}async function ue(){return(await G("/api/products","Failed to load products.")).products}async function Jn(t){return(await G(`/api/products/${t}`,"Failed to load product.")).product}async function En(){return(await G("/api/products/print-next","Failed to load print-next products.")).products}async function Un(t){const e=await lt("/api/products",t,"Failed to create product.");return(e==null?void 0:e.product)??null}async function pe(t,e){const n=await X(`/api/products/${t}`,e,"Failed to update product.");return(n==null?void 0:n.product)??null}async function An(){return(await G("/api/batches","Failed to load batches.")).batches}async function Rn(t){return(await G(`/api/batches/${t}`,"Failed to load batch.")).batch}async function On(t){const e=await lt("/api/batches",t,"Failed to create batch.");return(e==null?void 0:e.batch)??null}async function Hn(t,e){const n=await X(`/api/batches/${t}`,e,"Failed to update batch.");return(n==null?void 0:n.batch)??null}const O=N.bind(S);function qn(t){const e=t.toLowerCase();return e.includes("a1 mini")?"/ui/printers/a1-mini":e.includes("p1s")?"/ui/printers/p1s":null}function Wn(t){const e=new Map;for(const n of t){const a=n.deviceModel||"Unknown printer",i=e.get(a)??[];i.push(n),e.set(a,i)}return e}function nn(t,e=6){return t.slice().sort((n,a)=>String(a.startTime||"").localeCompare(String(n.startTime||""))).slice(0,e)}function an({printerName:t}){const e=qn(t);return e?O`<img class="printer-photo" src=${e} alt=${t} />`:O`<div class="printer-photo">🖨️</div>`}function sn({job:t,onJobClick:e}){return O`
    <article class="printer-job-row" key=${t.id} onClick=${()=>e(t)}>
      <div class="printer-job-top">
        <div class="td-thumb"><${Ht} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title">${t.designTitle||"Untitled Job"}</span>
          <${qt} colors=${t.filament_colors} />
        </div>
        <${Ct} status=${t.status} />
      </div>
      <div class="printer-job-bottom">
        <span>${it(t.startTime)}</span>
        <span>Filament: <strong>${kt(t.total_weight_g)}</strong></span>
        <span>Time: <strong>${st(t.total_time_s)}</strong></span>
      </div>
    </article>
  `}function Qn({row:t,jobs:e,onJobClick:n}){const a=t.deviceModel||"Unknown printer",i=nn(e);return O`
    <section class="printer-card" key=${a}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${an} printerName=${a} />
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
        ${i.length?i.map(s=>O`<${sn} key=${s.id} job=${s} onJobClick=${n} />`):O`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function Vn({printer:t,jobs:e,onJobClick:n,onToggleActive:a}){const i=t.name||t.model||t.provider_printer_id,s=nn(e),r=t.is_active===1;return O`
    <section class=${"printer-card"+(r?"":" is-retired")} key=${t.id}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${an} printerName=${t.model||i} />
          <div>
            <h3>${i}</h3>
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
            ${t.retired_at?O`<p class="printer-meta">Retired ${it(t.retired_at)}</p>`:null}
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
        ${s.length?s.map(c=>O`<${sn} key=${c.id} job=${c} onJobClick=${n} />`):O`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function Gn(t,e){return e.filter(n=>n.printer_id===t.id)}function zn({summary:t,jobs:e,onJobClick:n}){const[a,i]=g([]);R(()=>{ot("/printers","Failed to load printer inventory.").then(d=>{d&&i(d.printers)})},[]);const s=async d=>{const u=await X(`/printers/${d.id}`,{is_active:d.is_active!==1},"Failed to update printer inventory.");u!=null&&u.printer&&i(p=>p.map(o=>o.id===d.id?u.printer:o))};if(a.length)return O`
      <div class="printer-grid">
        ${a.map(d=>O`<${Vn}
              key=${d.id}
              printer=${d}
              jobs=${Gn(d,e)}
              onJobClick=${n}
              onToggleActive=${s}
            />`)}
      </div>
    `;const r=(t==null?void 0:t.by_device)??[];if(!r.length)return O`<div class="empty">No printer totals available yet.</div>`;const c=Wn(e);return O`
    <div class="printer-grid">
      ${r.map(d=>O`<${Qn}
            key=${d.deviceModel||"Unknown printer"}
            row=${d}
            jobs=${c.get(d.deviceModel||"Unknown printer")??[]}
            onJobClick=${n}
          />`)}
    </div>
  `}const x=N.bind(S);function Kn(t){return!t.startsWith("/projects")&&!t.startsWith("/admin")&&!t.startsWith("/printers")&&!t.startsWith("/catalog")&&!t.startsWith("/products")&&!t.startsWith("/batches")}function Yn(t,e){const n=new URLSearchParams;t&&n.set("status",t),e&&n.set("device",e);const a=n.toString();return"/jobs/export.csv"+(a?"?"+a:"")}function Xn(t){return t.reduce((e,n)=>(e.weight+=n.total_weight_g||0,e.time+=n.total_time_s||0,e),{weight:0,time:0})}function Zn(t){return!t||t==="actual"?null:t==="slicer_estimate"?"estimate":t==="manual"?"manual":"unknown"}function rn({confidence:t}){const e=Zn(t);return e?x`<span class="usage-confidence">${e}</span>`:null}const ta=[{label:"Jobs",path:"/",active:Kn},{label:"Projects",path:"/projects",active:t=>t.startsWith("/projects")},{label:"Printers",path:"/printers",active:t=>t.startsWith("/printers")},{label:"Products",path:"/products/pipeline",active:t=>t.startsWith("/products")},{label:"Batches",path:"/batches",active:t=>t.startsWith("/batches")},{label:"Catalog",path:"/catalog",active:t=>t.startsWith("/catalog")},{label:"Rates",path:"/admin",active:t=>t.startsWith("/admin")}],ea=[["","All Statuses"],["finish","Finished"],["cancel","Cancelled"],["running","Running"],["failed","Failed"],["pause","Paused"]];function Gt(t,e){const n=(t==null?void 0:t.by_device)??[];return n.length?n.map(a=>{const i=a.deviceModel||"Unknown printer";return e==="jobs"?`${i}: ${(a.total_jobs??0).toLocaleString()} jobs`:e==="plates"?`${i}: ${(a.total_plates??0).toLocaleString()} plates`:`${i}: ${((a.total_time_s??0)/3600).toFixed(1).toLocaleString()} h`}).join(`
`):"No printer breakdown available"}function na({loc:t,navigate:e}){return x`<nav class="top-nav">
    ${ta.map(n=>{const a=n.active(t);return x`
        <button
          key=${n.label}
          class=${"nav-btn"+(a?" active":"")}
          onClick=${()=>e(n.path)}
        >
          ${n.label}
        </button>
      `})}
  </nav>`}function aa({summary:t}){var n,a;const e=t==null?void 0:t.totals;return x`
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
  `}function ia({summary:t,dataRange:e}){const[n,a]=re(),i=!!(e!=null&&e.min_start&&(e!=null&&e.max_start)),s=(e==null?void 0:e.min_start)??"",r=(e==null?void 0:e.max_start)??"";return x`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>PrintWorks</span></h1>
        ${i&&x`<div class="header-range">
          History: ${it(s)} → ${it(r)}
          (${((e==null?void 0:e.task_count)||0).toLocaleString()} tasks)
        </div>`}
        <${na} loc=${n} navigate=${a} />
      </div>
      <${aa} summary=${t} />
    </header>
  `}function sa({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:i,setDeviceFilter:s,devices:r,view:c,setView:d,density:u,setDensity:p,filteredCount:o,totalCount:l}){const m=q(()=>Yn(n,i),[n,i]);return x`
    <div class="toolbar">
      <input
        type="search"
        placeholder="Search title or customer…"
        value=${t}
        onInput=${h=>e(h.target.value)}
      />
      <select
        value=${n}
        onChange=${h=>a(h.target.value)}
      >
        ${ea.map(([h,$])=>x`<option key=${h} value=${h}>${$}</option> `)}
      </select>
      <select
        value=${i}
        onChange=${h=>s(h.target.value)}
      >
        <option value="">All Printers</option>
        ${r.map(h=>x`<option key=${h} value=${h}>${h}</option> `)}
      </select>
      <div class="view-toggle">
        <button
          class=${"view-btn"+(c==="table"?" active":"")}
          onClick=${()=>d("table")}
        >
          ☰ Table
        </button>
        <button
          class=${"view-btn"+(c==="grid"?" active":"")}
          onClick=${()=>d("grid")}
        >
          ⊞ Grid
        </button>
      </div>
      <div class="toolbar-right">
        <div class="density-toggle">
          <button
            class=${"density-btn"+(u==="compact"?" active":"")}
            onClick=${()=>p("compact")}
          >
            Compact
          </button>
          <button
            class=${"density-btn"+(u==="comfy"?" active":"")}
            onClick=${()=>p("comfy")}
          >
            Comfy
          </button>
        </div>
        <a class="btn-csv" href=${m} download>↓ CSV</a>
        <span class="job-count">${o} / ${l} jobs</span>
      </div>
    </div>
  `}function ra({filtered:t,isFiltered:e}){if(!e||!t.length)return null;const n=Xn(t);return x`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${t.length}</strong></span>
      <span>Filament: <strong>${le(n.weight)}</strong></span>
      <span>Print time: <strong>${st(n.time)}</strong></span>
    </div>
  `}function on({printRun:t}){return(t??1)<=1?null:x`<span class="run-badge">Run ${t}</span>`}function oa({sortCol:t,sortDir:e,onSort:n}){return x`<div class="jobs-record-sortbar">
    <span class="jobs-record-sort-label">Sort</span>
    ${[{col:"startTime",label:"Date"},{col:"designTitle",label:"Title"},{col:"deviceModel",label:"Printer"},{col:"total_weight_g",label:"Filament"},{col:"total_time_s",label:"Time"},{col:"final_price",label:"Price"}].map(({col:i,label:s})=>{const r=t===i;return x`
        <button
          key=${i}
          class=${"jobs-record-sort-btn"+(r?" active":"")}
          onClick=${()=>n(i)}
        >
          ${s}${r?e==="asc"?" ↑":" ↓":""}
        </button>
      `})}
  </div>`}function la({job:t,onJobClick:e}){return x`
    <article class="jobs-record-row" onClick=${()=>e(t)}>
      <div class="jobs-record-top">
        <div class="td-thumb"><${Ht} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title" title=${t.designTitle||"Untitled"}
            >${t.designTitle||"Untitled Job"}</span
          >
          <${on} printRun=${t.print_run} />
          <${qt} colors=${t.filament_colors} />
        </div>
        <div><${Ct} status=${t.status} /></div>
      </div>
      <div class="jobs-record-bottom">
        <span>🖨 ${t.deviceModel||"—"}</span>
        <span title=${oe(t.startTime)}>📅 ${it(t.startTime)}</span>
        <span
          >🧵 <strong>${kt(t.total_weight_g)}</strong>
          <${rn} confidence=${t.material_usage_confidence} />
        </span>
        <span>⏱ <strong>${st(t.total_time_s)}</strong></span>
        <span
          >💰 <strong>${t.final_price!=null?A(t.final_price):"—"}</strong></span
        >
        <span>🧱 <strong>${t.plate_count??"—"}</strong></span>
        ${t.customer?x`<span class="customer-pill">${t.customer}</span>`:null}
      </div>
    </article>
  `}function ca({sorted:t,sortCol:e,sortDir:n,onSort:a,onJobClick:i,density:s}){return x`
    <div class=${"jobs-record-list-wrap density-"+s}>
      <${oa} sortCol=${e} sortDir=${n} onSort=${a} />
      <div class="jobs-record-list">
        ${t.map(r=>x`<${la} key=${r.id} job=${r} onJobClick=${i} />`)}
      </div>
    </div>
  `}function da({job:t,onJobClick:e}){return x`
    <div class="card" onClick=${()=>e(t)}>
      <${Tn} url=${t.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${t.designTitle||"Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${t.deviceModel||"—"}</span>
          <span>📅 ${it(t.startTime)}</span>
          <span>⏱ ${st(t.total_time_s)}</span>
          <span
            >🧵 ${kt(t.total_weight_g)}
            <${rn} confidence=${t.material_usage_confidence} />
          </span>
          ${t.final_price!=null&&x`<span>💰 ${A(t.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${Ct} status=${t.status} />
          <${on} printRun=${t.print_run} />
          ${t.customer&&x`<span class="customer-pill">${t.customer}</span>`}
          <${qt} colors=${t.filament_colors} />
        </div>
      </div>
    </div>
  `}function ua({sorted:t,onJobClick:e,density:n}){return x`
    <div class=${"grid-view density-"+n}>
      ${t.map(a=>x`<${da} key=${a.id} job=${a} onJobClick=${e} />`)}
    </div>
  `}function _e(t){R(()=>{const e=n=>{n.key==="Escape"&&t()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[t])}const H=N.bind(S);function pa(t){return t==="actual"?"actual usage":t==="slicer_estimate"?"slicer estimate":t==="manual"?"manual entry":"unknown confidence"}function _a({jobId:t}){const[e,n]=g(null);if(R(()=>{let s=!0;return n(null),de(`/jobs/${t}/price`,"Pricing not configured").then(({data:r})=>{s&&n(r??!1)}).catch(()=>{s&&n(!1)}),()=>{s=!1}},[t]),e===null)return H`<div class="pricing-row pricing-loading">Loading price…</div>`;if(e===!1)return H`<div class="pricing-row pricing-na">Pricing not configured</div>`;const a=e.final_price-e.base_price,i=e.base_price>0?Math.round(a/e.base_price*100):0;return H`
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Material</span><span>${A(e.material_cost)}</span>
      </div>
      <div class="pricing-row">
        <span>Machine</span><span>${A(e.machine_cost)}</span>
      </div>
      <div class="pricing-row"><span>Labor</span><span>${A(e.labor_cost)}</span></div>
      ${e.extra_labor_cost>0&&H`
        <div class="pricing-row pricing-extra-labor">
          <span>Extra labor</span><span>${A(e.extra_labor_cost)}</span>
        </div>
      `}
      <div class="pricing-divider"></div>
      <div class="pricing-row pricing-base">
        <span>Base</span><span>${A(e.base_price)}</span>
      </div>
      ${a!==0&&H`
        <div class="pricing-row pricing-markup">
          <span>Markup</span>
          <span
            >${a>0?"+":""}${A(a)}
            (${i>0?"+":""}${i}%)</span
          >
        </div>
      `}
      <div class="pricing-row pricing-final">
        <span
          >Final${e.is_override?H`<span class="override-tag">override</span>`:""}</span
        >
        <span>${A(e.final_price)}</span>
      </div>
    </div>
  `}const ma=["finish","failed","cancel","running","pause"];function $a({job:t,onClose:e,onPatch:n,projects:a,onJobProjectChange:i,onJobStatusChange:s,onJobExtraLaborChange:r,onNavigateToProject:c}){const[d,u]=g(t.customer??""),[p,o]=g(t.notes??""),[l,m]=g(t.price_override!=null?String(t.price_override):"");_e(e);const h=w(_=>{const v=_.target.value;i(t.id,v===""?null:Number(v))},[t.id,i]),$=w(_=>{const v=_.target.value;s(t.id,v===""?null:v)},[t.id,s]);return H`
    <div class="overlay" onClick=${_=>_.target===_.currentTarget&&e()}>
      <div class="modal">
        <div class="modal-header">
          <h2>${t.designTitle||"Untitled Job"}</h2>
          <button class="modal-close" onClick=${e}>✕</button>
        </div>
        ${t.cover_url&&H`<img class="modal-img" src=${t.cover_url} alt="" />`}
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Status</label>
              <div class="detail-val">
                <${Ct} status=${t.status} />
                ${t.status_override&&H`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item">
              <label>Printer</label>
              <div class="detail-val">${t.deviceModel||"—"}</div>
            </div>
            <div class="detail-item">
              <label>Started</label>
              <div class="detail-val">${oe(t.startTime)}</div>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <div class="detail-val">${st(t.total_time_s)}</div>
            </div>
            <div class="detail-item">
              <label>Filament</label>
              <div class="detail-val">
                ${kt(t.total_weight_g)}
                <span class="usage-confidence"
                  >${pa(t.material_usage_confidence)}</span
                >
                <${qt} colors=${t.filament_colors} />
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
          <${_a} jobId=${t.id} key=${t.id+"-"+t.extra_labor_minutes} />
          <div class="modal-project-row">
            <label class="modal-project-label">Customer</label>
            <input
              class="modal-project-select"
              type="text"
              placeholder="—"
              value=${d}
              onInput=${_=>u(_.target.value)}
              onBlur=${()=>n(t.id,{customer:d.trim()||null})}
              onKeyDown=${_=>_.key==="Enter"&&_.target.blur()}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Notes</label>
            <textarea
              class="modal-project-select modal-notes"
              placeholder="—"
              value=${p}
              onInput=${_=>o(_.target.value)}
              onBlur=${()=>n(t.id,{notes:p.trim()||null})}
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
              onInput=${_=>m(_.target.value)}
              onBlur=${()=>{const _=l===""?null:Number(l);n(t.id,{price_override:_})}}
              onKeyDown=${_=>_.key==="Enter"&&_.target.blur()}
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
              onChange=${_=>{const v=_.target.value===""?null:Number(_.target.value);r(t.id,v)}}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Status override</label>
            <select
              class="modal-project-select"
              value=${t.status_override??""}
              onChange=${$}
            >
              <option value="">Auto (from printer)</option>
              ${ma.map(_=>H`<option key=${_} value=${_}>${_}</option>`)}
            </select>
          </div>
          ${a&&H`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select
                class="modal-project-select"
                value=${t.project_id??""}
                onChange=${h}
              >
                <option value="">— None —</option>
                ${a.map(_=>H`<option key=${_.id} value=${_.id}>${_.name}</option>`)}
              </select>
              ${t.project_id!=null&&H`
                <button
                  class="btn-link"
                  onClick=${()=>{e(),c(Number(t.project_id))}}
                >
                  View →
                </button>
              `}
            </div>
          `}
        </div>
      </div>
    </div>
  `}const B=N.bind(S);function va({project:t,totalPrice:e,onClick:n,onRename:a}){const i=t.total_weight_g,s=t.total_time_s;return B`
    <div class="proj-card" onClick=${n}>
      ${t.cover_url?B`<img class="proj-card-cover" src=${t.cover_url} alt="" />`:B`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-title-row">
        <div class="proj-card-name">${t.name}</div>
        <button
          type="button"
          class="btn-secondary proj-card-action"
          onClick=${r=>{r.stopPropagation(),a(t)}}
        >
          Rename
        </button>
      </div>
      <div class="proj-card-meta">
        ${t.customer&&B`<span class="customer-pill">${t.customer}</span>`}
      </div>
      <div class="proj-card-stats">
        <span>
          <strong>${t.job_count}</strong> run${t.job_count!==1?"s":""}
        </span>
        ${t.total_plates!=null&&B`<span>
          <strong>${t.total_plates}</strong> plate${t.total_plates!==1?"s":""}
        </span>`}
        ${i!=null&&B`<span>${le(i)}</span>`}
        ${s!=null&&B`<span>${st(s)}</span>`}
        ${e!=null&&B`<span class="proj-card-price">${A(e)}</span>`}
      </div>
      ${t.notes&&B`<div class="proj-card-notes">${t.notes}</div>`}
    </div>
  `}function fa({price:t}){return t?B`
    <span>Material: <strong>${A(t.material_cost)}</strong></span>
    <span>Machine: <strong>${A(t.machine_cost)}</strong></span>
    <span>Labor: <strong>${A(t.labor_cost)}</strong></span>
    ${t.extra_labor_cost>0&&B`<span>Extra labor: <strong>${A(t.extra_labor_cost)}</strong></span>`}
    <span class="totals-total">Total: <strong>${A(t.final_price)}</strong></span>
  `:null}function ga({jobs:t,onJobClick:e,onRemoveJob:n,onMoveToNewProject:a}){return t.length===0?B`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`:B`
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
          ${t.map(i=>B`
              <tr key=${i.id} onClick=${()=>e(i)}>
                <td class="td-thumb"><${Ht} url=${i.cover_url} /></td>
                <td class="td-title">
                  <span class="row-title">${i.designTitle||"Untitled Job"}</span>
                </td>
                <td>${i.deviceModel||"—"}</td>
                <td title=${oe(i.startTime)}>${it(i.startTime)}</td>
                <td><${Ct} status=${i.status} /></td>
                <td class="td-num"><strong>${i.plate_count??1}</strong></td>
                <td class="td-num"><strong>${kt(i.total_weight_g)}</strong></td>
                <td class="td-num">${st(i.total_time_s)}</td>
                <td class="td-num">
                  ${i.final_price!=null?B`<strong>${A(i.final_price)}</strong>`:"—"}
                </td>
                <td>
                  ${a&&B`<button
                    class="btn-secondary"
                    title="Move to a new project"
                    onClick=${s=>{s.stopPropagation(),a(i)}}
                  >
                    New project
                  </button>`}
                  <button
                    class="btn-remove-job"
                    title="Remove from project"
                    onClick=${s=>{s.stopPropagation(),n(i.id)}}
                  >
                    ×
                  </button>
                </td>
              </tr>
            `)}
        </tbody>
      </table>
    </div>
  `}function ha({loading:t,filtered:e,q:n,projectPrices:a,navigate:i,onRename:s}){return t?B`<div class="empty">Loading projects…</div>`:e.length===0?B`<div class="empty">${n?"No projects match your search.":"No projects yet. Create one to group related jobs together."}</div>`:B`
    <div class="proj-grid">
      ${e.map(r=>B`<${va}
            key=${r.id}
            project=${r}
            totalPrice=${a[r.id]??null}
            onClick=${()=>i(`/projects/${r.id}`)}
            onRename=${s}
          />`)}
    </div>
  `}const ba=N.bind(S);function ya({job:t,initialName:e,onClose:n,onProjectCreated:a,onMoveJobToProject:i,onNavigateToProject:s}){const[r,c]=g(e),d=w(async()=>{const u=r.trim();if(!u)return;const p=await lt("/projects",{name:u,customer:t.customer??null,notes:null},"Failed to create project.");p!=null&&p.project&&(a(p.project),i(t.id,p.project.id),s(p.project.id),n())},[t.customer,t.id,r,n,i,s,a]);return ba`<div class="modal-backdrop" onClick=${n}>
    <div class="modal-card" onClick=${u=>u.stopPropagation()}>
      <h3>Move print run to new project</h3>
      <p class="modal-subtle">${t.designTitle||"Untitled Job"}</p>
      <label>
        New project name
        <input
          value=${r}
          onInput=${u=>c(u.target.value)}
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
  </div>`}const Pa=N.bind(S);function wa({project:t,onClose:e,onRenamed:n}){const[a,i]=g(t.name??""),[s,r]=g(!1),c=w(async()=>{const d=a.trim();if(d){r(!0);try{const u=await X(`/projects/${t.id}`,{name:d},"Failed to rename project."),p=u==null?void 0:u.project;if(!p)return;n(p),e()}finally{r(!1)}}},[a,e,n,t.id]);return Pa`<div class="modal-backdrop" onClick=${e}>
    <div class="modal-card" onClick=${d=>d.stopPropagation()}>
      <h3>Rename project</h3>
      <p class="modal-subtle">${t.name}</p>
      <label>
        Project name
        <input
          value=${a}
          onInput=${d=>i(d.target.value)}
          autofocus
        />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onClick=${e}>Cancel</button>
        <button
          type="button"
          class="btn-primary"
          disabled=${!a.trim()||s}
          onClick=${c}
        >
          ${s?"Saving…":"Save name"}
        </button>
      </div>
    </div>
  </div>`}function ka(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>[a.name,a.customer,a.notes].filter(Boolean).join(" ").toLowerCase().includes(n))}function Ca(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>`${a.designTitle||""} ${a.customer||""}`.toLowerCase().includes(n))}function Sa(t,e,n){return`${n?`${e.length} of ${t.length}`:String(t.length)} project${t.length!==1?"s":""}`}function Fa(t,e){return t.some(n=>n.id===e.id)?t.map(n=>n.id===e.id?{...n,...e}:n):[e,...t]}function Ia(t,e){if(t===0){U("No ungrouped jobs found — everything is already assigned to a project.","info");return}U(`Created ${t} project${t!==1?"s":""}, assigned ${e} job${e!==1?"s":""}.`,"success")}function Ta(t){return t.reduce((e,n)=>e+(n.total_weight_g||0),0)}function Na(t){return t.reduce((e,n)=>e+(n.total_time_s||0),0)}function La(t){return t.reduce((e,n)=>e+(n.plate_count||0),0)}const ft=N.bind(S);function ln(t){return e=>{e.target===e.currentTarget&&t()}}function Ma({onClose:t,onCreate:e}){const[n,a]=g(""),[i,s]=g(""),[r,c]=g(""),[d,u]=g(!1);_e(t);const p=w(async o=>{if(o.preventDefault(),!!n.trim()){u(!0);try{const l=await lt("/projects",{name:n.trim(),customer:i||null,notes:r||null},"Failed to create project.");if(!(l!=null&&l.project))return;e(l.project),t()}finally{u(!1)}}},[n,i,r,e,t]);return ft`
    <div class="overlay" onClick=${ln(t)}>
      <div class="modal">
        <div class="modal-header">
          <h2>New Project</h2>
          <button class="modal-close" onClick=${t}>✕</button>
        </div>
        <div class="modal-body">
          <form class="project-form" onSubmit=${p}>
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
                value=${i}
                onInput=${o=>s(o.target.value)}
                placeholder="Optional"
              />
            </label>
            <label class="form-label"
              >Notes
              <textarea
                class="form-input form-textarea"
                value=${r}
                onInput=${o=>c(o.target.value)}
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
  `}function xa({unassignedJobs:t,onClose:e,onAdd:n}){const[a,i]=g("");_e(e);const s=q(()=>Ca(t,a),[t,a]);return ft`
    <div class="overlay" onClick=${ln(e)}>
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
            onInput=${r=>i(r.target.value)}
          />
          ${s.length===0?ft`<div class="empty" style="padding:16px 0">
                ${a?"No matches.":"All jobs are already assigned to projects."}
              </div>`:ft`<div class="add-jobs-list">
                ${s.map(r=>ft`
                    <div class="add-jobs-row" key=${r.id} onClick=${()=>n(r.id)}>
                      <${Ht} url=${r.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${r.designTitle||"Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${it(r.startTime)} · ${r.deviceModel||"—"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `)}
              </div>`}
        </div>
      </div>
    </div>
  `}const It=new Map;function ja(t,e){const[n,a]=g(()=>It.get(t)??null);return R(()=>{if(a(It.get(t)??null),!e){It.delete(t),a(null);return}let i=!1;return ot(`/projects/${t}/price`,"Failed to load project price.").then(s=>{!s||i||(It.set(t,s),a(s))}),()=>{i=!0}},[t,e]),n}const z=N.bind(S);function Da({project:t,jobs:e,unassignedJobs:n,onBack:a,onJobClick:i,onAddJob:s,onRemoveJob:r,onProjectUpdated:c,onMoveJobToProject:d,onNavigateToProject:u}){const[p,o]=g(!1),[l,m]=g(!1),[h,$]=g(null),[_,v]=g(t.name??""),[f,b]=g(t.customer??""),[y,P]=g(t.notes??""),k=t.job_count??e.length,F=ja(t.id,k),J=Ta(e),E=Na(e),W=La(e),St=Ye(new Map),Wt=q(()=>{for(const I of e)I.final_price!=null&&St.current.set(I.id,I.final_price);return e.map(I=>{if(I.final_price!=null)return I;const ge=St.current.get(I.id);return ge==null?I:{...I,final_price:ge}})},[e]),_n=w(I=>s(I),[s]),mn=w(async()=>{const I=await X(`/projects/${t.id}`,{name:_.trim(),customer:f.trim()||null,notes:y.trim()||null},"Failed to update project.");I!=null&&I.project&&(c(I.project),m(!1))},[f,_,y,c,t.id]);return z`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${a}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${t.name}</h2>
          ${t.customer&&z`<span class="customer-pill">${t.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${()=>m(I=>!I)}>
          ${l?"Cancel edit":"Edit project"}
        </button>
        <button class="btn-secondary" onClick=${()=>o(!0)}>+ Add Jobs</button>
      </div>
      ${l&&z`<div class="modal-form proj-detail-notes">
        <label>
          Project name
          <input
            value=${_}
            onInput=${I=>v(I.target.value)}
          />
        </label>
        <label>
          Customer
          <input
            value=${f}
            onInput=${I=>b(I.target.value)}
          />
        </label>
        <label>
          Notes
          <textarea
            value=${y}
            onInput=${I=>P(I.target.value)}
          />
        </label>
        <button class="btn-primary" disabled=${!_.trim()} onClick=${mn}>
          Save project
        </button>
      </div>`}
      ${t.notes&&z`<div class="proj-detail-notes">${t.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Print runs: <strong>${k}</strong></span>
        <span>Plates: <strong>${W}</strong></span>
        <span>Filament: <strong>${le(J)}</strong></span>
        <span>Print time: <strong>${st(E)}</strong></span>
        <${fa} price=${F} />
      </div>
      <${ga}
        jobs=${Wt}
        onJobClick=${i}
        onRemoveJob=${r}
        onMoveToNewProject=${$}
      />
      ${p&&z`<${xa}
        unassignedJobs=${n}
        onClose=${()=>o(!1)}
        onAdd=${_n}
      />`}
      ${h&&z`<${ya}
        job=${h}
        initialName=${h.designTitle||""}
        onClose=${()=>$(null)}
        onProjectCreated=${c}
        onMoveJobToProject=${d}
        onNavigateToProject=${u}
      />`}
    </div>
  `}function Ba({projects:t,setProjects:e,onAutoGroup:n,projectPrices:a,loading:i=!1}){const[s,r]=g(!1),[c,d]=g(!1),[u,p]=g(null),[o,l]=g(""),[,m]=re(),h=w(async()=>{d(!0);try{const v=await lt("/projects/auto-group",{},"Auto-group failed.");if(!v)return;const{projects_created:f,jobs_assigned:b}=v;await n(),Ia(f,b)}finally{d(!1)}},[n]),$=w(v=>{e(f=>[v,...f]),m(`/projects/${v.id}`)},[e,m]),_=q(()=>ka(t,o),[t,o]);return z`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${o}
        onInput=${v=>l(v.target.value)}
      />
      <span class="proj-list-count">${Sa(t,_,o)}</span>
      <button class="btn-secondary" onClick=${h} disabled=${c}>
        ${c?"Grouping…":"⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${()=>r(!0)}>+ New Project</button>
    </div>
    <${ha}
      loading=${i}
      filtered=${_}
      q=${o}
      projectPrices=${a}
      navigate=${m}
      onRename=${p}
    />
    ${s&&z`<${Ma} onClose=${()=>r(!1)} onCreate=${$} />`}
    ${u&&z`<${wa}
      project=${u}
      onClose=${()=>p(null)}
      onRenamed=${v=>e(f=>Fa(f,v))}
    />`}
  `}const V=N.bind(S),Ja=2e3;function xe(t,e,n){const a=e(n);return t.map(i=>e(i)===a?n:i)}function Ea(t){return t==="saving"?"Saving…":t==="saved"?"✓ Saved":"Save"}function Ua(t,e,n){return t===n?"saving":e===n?"saved":"idle"}function Aa(t){const[e,n]=g(""),[a,i]=g(""),s=d=>{i(d),setTimeout(()=>i(""),Ja)};return{runSave:async(d,u)=>{n(d);try{if(!await u())return;s(d),t()}finally{n("")}},getStateFor:d=>Ua(e,a,d)}}function Q({label:t,value:e,onChange:n,step:a="0.01",min:i="0"}){return V`
    <label class="form-label">
      ${t}
      <input
        type="number"
        class="form-input"
        step=${a}
        min=${i}
        value=${Number.isFinite(e)?e:0}
        onInput=${s=>n(Number(s.target.value||0))}
      />
    </label>
  `}function me({state:t}){return V`<button type="submit" class="btn-primary" disabled=${t==="saving"}>
    ${Ea(t)}
  </button>`}function ct({title:t,description:e,children:n}){return V`
    <section class="admin-section">
      <h3 class="admin-section-title">${t}</h3>
      <p class="admin-section-desc">${e}</p>
      ${n}
    </section>
  `}function Ra({labor:t,saveState:e,onSave:n}){const[a,i]=g(t);return R(()=>i(t),[t]),V`
    <form class="admin-card" onSubmit=${s=>(s.preventDefault(),n(a))}>
      <div class="admin-card-fields">
        <${Q}
          label="Hourly rate ($)"
          value=${a.hourly_rate}
          step="0.5"
          onChange=${s=>i({...a,hourly_rate:s})}
        />
        <${Q}
          label="Minimum labor minutes"
          value=${a.minimum_minutes}
          step="1"
          onChange=${s=>i({...a,minimum_minutes:s})}
        />
        <${Q}
          label="Profit markup (%)"
          value=${a.profit_markup_pct*100}
          step="1"
          onChange=${s=>i({...a,profit_markup_pct:s/100})}
        />
        <${Q}
          label="Failure buffer (%)"
          value=${a.failure_buffer_pct*100}
          step="1"
          onChange=${s=>i({...a,failure_buffer_pct:s/100})}
        />
        <${Q}
          label="Overhead buffer (%)"
          value=${a.overhead_buffer_pct*100}
          step="1"
          onChange=${s=>i({...a,overhead_buffer_pct:s/100})}
        />
      </div>
      <div class="admin-card-actions"><${me} state=${e} /></div>
    </form>
  `}function Oa({machine:t,saveState:e,onSave:n}){const[a,i]=g(t);R(()=>i(t),[t]);const s=a.purchase_price/a.lifetime_hrs+a.electricity_rate+a.maintenance_buffer;return V`
    <form class="admin-card" onSubmit=${r=>(r.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.device_model}</div>
      <div class="admin-card-fields">
        <${Q}
          label="Purchase price ($)"
          value=${a.purchase_price}
          step="1"
          onChange=${r=>i({...a,purchase_price:r})}
        />
        <${Q}
          label="Lifetime (hours)"
          value=${a.lifetime_hrs}
          step="100"
          min="1"
          onChange=${r=>i({...a,lifetime_hrs:r})}
        />
        <${Q}
          label="Electricity ($/hr)"
          value=${a.electricity_rate}
          step="0.01"
          onChange=${r=>i({...a,electricity_rate:r})}
        />
        <${Q}
          label="Maintenance ($/hr)"
          value=${a.maintenance_buffer}
          step="0.01"
          onChange=${r=>i({...a,maintenance_buffer:r})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">
          Computed rate: <strong>${A(s)}</strong>/hr
        </div>
        <div class="admin-card-actions"><${me} state=${e} /></div>
      </div>
    </form>
  `}function Ha({material:t,saveState:e,onSave:n}){const[a,i]=g(t);R(()=>i(t),[t]);const s=a.cost_per_g*(1+a.waste_buffer_pct);return V`
    <form class="admin-card" onSubmit=${r=>(r.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.filament_type}</div>
      <div class="admin-card-fields">
        <${Q}
          label="Cost per gram ($/g)"
          value=${a.cost_per_g}
          step="0.001"
          onChange=${r=>i({...a,cost_per_g:r})}
        />
        <${Q}
          label="Waste buffer (%)"
          value=${a.waste_buffer_pct*100}
          step="1"
          onChange=${r=>i({...a,waste_buffer_pct:r/100})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">Computed rate: <strong>${A(s)}</strong>/g</div>
        <div class="admin-card-actions"><${me} state=${e} /></div>
      </div>
    </form>
  `}function qa({onRatesChanged:t=()=>{}}){const[e,n]=g(null),{runSave:a,getStateFor:i}=Aa(t);R(()=>{ot("/rates","Failed to load rates.").then(o=>{o&&n(o)})},[]);const s=async o=>{await a("labor",async()=>{const l=await X("/rates/labor",o,"Failed to save labor rates."),m=l==null?void 0:l.labor_config;return m?(n(h=>h&&{...h,labor_config:m}),!0):!1})},r=async o=>{const{device_model:l,purchase_price:m,lifetime_hrs:h,electricity_rate:$,maintenance_buffer:_}=o;await a(l,async()=>{const v=await X(`/rates/machines/${encodeURIComponent(l)}`,{purchase_price:m,lifetime_hrs:h,electricity_rate:$,maintenance_buffer:_},"Failed to save machine rate."),f=v==null?void 0:v.machine_rate;return f?(n(b=>b&&{...b,machine_rates:xe(b.machine_rates,y=>y.device_model,f)}),!0):!1})},c=async o=>{const{filament_type:l,cost_per_g:m,waste_buffer_pct:h}=o;await a(l,async()=>{const $=await X(`/rates/materials/${encodeURIComponent(l)}`,{cost_per_g:m,waste_buffer_pct:h},"Failed to save material rate."),_=$==null?void 0:$.material_rate;return _?(n(v=>v&&{...v,material_rates:xe(v.material_rates,f=>f.filament_type,_)}),!0):!1})};if(!e)return V`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;const{labor_config:d,machine_rates:u,material_rates:p}=e;return V`
    <div class="admin-page">
      <h2 class="admin-title">Rates & Pricing</h2>

      <${ct}
        title="Labor"
        description="Applied once per job (or once per project for project pricing)."
      >
        <${Ra}
          labor=${d}
          saveState=${i("labor")}
          onSave=${s}
        />
      </${ct}>

      <${ct}
        title="Machine Rates"
        description="Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance."
      >
        ${u.map(o=>V`
            <${Oa}
              key=${o.device_model}
              machine=${o}
              saveState=${i(o.device_model)}
              onSave=${r}
            />
          `)}
      </${ct}>

      <${ct}
        title="Material Rates"
        description="Cost per gram including waste. Rate = cost × (1 + waste fraction)."
      >
        ${p.map(o=>V`
            <${Ha}
              key=${o.filament_type}
              material=${o}
              saveState=${i(o.filament_type)}
              onSave=${c}
            />
          `)}
      </${ct}>
    </div>
  `}const cn=N.bind(S);function bt(t){return t==null?"—":`$${t.toFixed(2)}`}function dn(t){return t==null?"—":`${Math.round(t*100)}%`}function Wa(t){return t==null?"—":t<3600?`${Math.round(t/60)} min`:`${(t/3600).toFixed(1)} h`}function Qa(t){return t==null?"batch-margin batch-margin--unknown":t>=.45?"batch-margin batch-margin--good":t>=.25?"batch-margin batch-margin--ok":"batch-margin batch-margin--low"}function dt({label:t,value:e}){return cn`<div class="batch-price-metric"><span>${t}</span><strong>${e}</strong></div>`}function Va({batch:t}){return cn`<div class="batch-price-breakdown" aria-label="Batch price breakdown">
    <${dt} label="Unit cost" value=${bt(t.unit_cost)} />
    <${dt} label="Suggested" value=${bt(t.suggested_price)} />
    <${dt} label="Fixed fee" value=${bt(t.fixed_fee_per_order)} />
    <${dt} label="Margin" value=${dn(t.estimated_margin_pct)} />
    <${dt}
      label="Material"
      value=${t.total_filament_g==null?"—":`${t.total_filament_g.toFixed(1)} g`}
    />
    <${dt} label="Print time" value=${Wa(t.total_print_time_s)} />
  </div>`}const ut=N.bind(S);function Ga(t){return t==null?"":String(t/3600)}function gt(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function za(t){const e=gt(t);return e===null?null:Math.round(e*3600)}function Tt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>0?e:null}function Nt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>=0?e:null}function zt(t,e){return Object.prototype.hasOwnProperty.call(t,e)}function je(t){return{productId:String(t.product_id),pricingProfileId:t.pricing_profile_id,plannedQuantity:String(t.planned_quantity),completedQuantity:String(t.completed_quantity),failedQuantity:String(t.failed_quantity),materialType:t.material_type??"",primaryColor:t.primary_color??"",totalFilamentG:t.total_filament_g==null?"":String(t.total_filament_g),totalPrintTimeHours:Ga(t.total_print_time_s),setupMinutes:t.setup_minutes==null?"":String(t.setup_minutes),handlingMinutesPerUnit:t.handling_minutes_per_unit==null?"":String(t.handling_minutes_per_unit),packagingCostPerUnit:t.packaging_cost_per_unit==null?"":String(t.packaging_cost_per_unit),notes:t.notes??""}}function T({label:t,children:e}){return ut`<label class="form-label">${t}${e}</label>`}function Ka({batchId:t,navigate:e}){const[n,a]=g(null),[i,s]=g([]),[r,c]=g(null),[d,u]=g(!0),[p,o]=g(!1);R(()=>{let $=!1;return Promise.all([Rn(t),ue()]).then(([_,v])=>{$||(a(_),s(v),c(je(_)))}).catch(_=>{U(_ instanceof Error?_.message:"Failed to load batch.","error")}).finally(()=>{$||u(!1)}),()=>{$=!0}},[t]);const l=($,_)=>{c(v=>v&&{...v,[$]:_})},m=!!(r&&Tt(r.productId)&&Tt(r.plannedQuantity)&&Nt(r.completedQuantity)!==null&&Nt(r.failedQuantity)!==null),h=async $=>{if($.preventDefault(),!r||!n)return;const _=Tt(r.productId),v=Tt(r.plannedQuantity),f=Nt(r.completedQuantity),b=Nt(r.failedQuantity);if(!_||!v||f===null||b===null)return;const y={product_id:_,pricing_profile_id:r.pricingProfileId,planned_quantity:v,completed_quantity:f,failed_quantity:b,material_type:r.materialType.trim()||null,primary_color:r.primaryColor.trim()||null,total_filament_g:gt(r.totalFilamentG),total_print_time_s:za(r.totalPrintTimeHours),notes:r.notes.trim()||null};(zt(n,"setup_minutes")||r.setupMinutes.trim())&&(y.setup_minutes=gt(r.setupMinutes)),(zt(n,"handling_minutes_per_unit")||r.handlingMinutesPerUnit.trim())&&(y.handling_minutes_per_unit=gt(r.handlingMinutesPerUnit)),(zt(n,"packaging_cost_per_unit")||r.packagingCostPerUnit.trim())&&(y.packaging_cost_per_unit=gt(r.packagingCostPerUnit)),o(!0);try{const P=await Hn(n.id,y);if(!P)return;a(P),c(je(P)),U("Batch updated.","success")}finally{o(!1)}};return d?ut`<div class="empty">Loading batch…</div>`:!n||!r?ut`<div class="empty">Batch not found.</div>`:ut`<main class="product-detail-page batch-detail-page">
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
        <${Va} batch=${n} />
      </aside>

      <form class="product-detail-form" onSubmit=${h}>
        <section class="admin-section">
          <h3 class="admin-section-title">Batch setup</h3>
          <div class="product-form-grid">
            <${T} label="Product">
              <select
                class="form-input"
                value=${r.productId}
                onChange=${$=>l("productId",$.target.value)}
              >
                ${i.map($=>ut`<option key=${$.id} value=${String($.id)}>
                      ${$.name}
                    </option>`)}
              </select>
            </${T}>
            <${T} label="Pricing profile">
              <select
                class="form-input"
                value=${r.pricingProfileId}
                onChange=${$=>l("pricingProfileId",$.target.value)}
              >
                ${ce.map($=>ut`<option key=${$.id} value=${$.id}>${$.label}</option>`)}
              </select>
            </${T}>
            <${T} label="Planned quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${r.plannedQuantity}
                onInput=${$=>l("plannedQuantity",$.target.value)}
              />
            </${T}>
            <${T} label="Completed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${r.completedQuantity}
                onInput=${$=>l("completedQuantity",$.target.value)}
              />
            </${T}>
            <${T} label="Failed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${r.failedQuantity}
                onInput=${$=>l("failedQuantity",$.target.value)}
              />
            </${T}>
          </div>
        </section>

        <section class="admin-section">
          <h3 class="admin-section-title">Costs and production totals</h3>
          <div class="product-form-grid">
            <${T} label="Material">
              <input
                class="form-input"
                value=${r.materialType}
                placeholder="PLA"
                onInput=${$=>l("materialType",$.target.value)}
              />
            </${T}>
            <${T} label="Color">
              <input
                class="form-input"
                value=${r.primaryColor}
                placeholder="#ffffff or White"
                onInput=${$=>l("primaryColor",$.target.value)}
              />
            </${T}>
            <${T} label="Total grams">
              <input
                class="form-input"
                inputmode="decimal"
                value=${r.totalFilamentG}
                placeholder="120"
                onInput=${$=>l("totalFilamentG",$.target.value)}
              />
            </${T}>
            <${T} label="Total time (hours)">
              <input
                class="form-input"
                inputmode="decimal"
                value=${r.totalPrintTimeHours}
                placeholder="4.5"
                onInput=${$=>l("totalPrintTimeHours",$.target.value)}
              />
            </${T}>
            <${T} label="Setup minutes">
              <input
                class="form-input"
                inputmode="decimal"
                value=${r.setupMinutes}
                placeholder="10"
                onInput=${$=>l("setupMinutes",$.target.value)}
              />
            </${T}>
            <${T} label="Handling minutes / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${r.handlingMinutesPerUnit}
                placeholder="3"
                onInput=${$=>l("handlingMinutesPerUnit",$.target.value)}
              />
            </${T}>
            <${T} label="Packaging cost / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${r.packagingCostPerUnit}
                placeholder="0.75"
                onInput=${$=>l("packagingCostPerUnit",$.target.value)}
              />
            </${T}>
          </div>
          <label class="form-label product-notes-field">
            Notes
            <textarea
              class="form-input form-textarea"
              value=${r.notes}
              placeholder="Batch run notes, sales channel context, quality issues…"
              onInput=${$=>l("notes",$.target.value)}
            ></textarea>
          </label>
        </section>

        <div class="form-actions">
          <button class="btn-secondary" type="button" onClick=${()=>e("/batches")}>
            Cancel
          </button>
          <button class="btn-primary" type="submit" disabled=${p||!m}>
            ${p?"Saving…":"Save Batch"}
          </button>
        </div>
      </form>
    </section>
  </main>`}const De=N.bind(S);function Ya({batch:t,onOpen:e}){const n=t.completed_quantity+t.failed_quantity;return De`<article class="batch-card" onClick=${()=>e(t)}>
    <div class="batch-card-header">
      <div>
        <p class="products-kicker">${t.pricing_profile_label}</p>
        <h3>${t.product_name}</h3>
      </div>
      <span class=${Qa(t.estimated_margin_pct)}>
        ${dn(t.estimated_margin_pct)}
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
      <div><span>Unit cost</span><strong>${bt(t.unit_cost)}</strong></div>
      <div>
        <span>Suggested price</span><strong>${bt(t.suggested_price)}</strong>
      </div>
    </div>
    ${t.notes?De`<p class="batch-card-notes">${t.notes}</p>`:null}
  </article>`}const K=N.bind(S);function Lt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>0?e:null}function Xa({products:t,onCreated:e}){const[n,a]=g({productId:"",pricingProfileId:"booth",plannedQuantity:"1"}),[i,s]=g(!1),r=(d,u)=>a(p=>({...p,[d]:u}));return K`<form class="batch-create-card" onSubmit=${async d=>{d.preventDefault();const u=Lt(n.productId),p=Lt(n.plannedQuantity);if(!(!u||!p)){s(!0);try{const o=await On({product_id:u,pricing_profile_id:n.pricingProfileId,planned_quantity:p});if(!o)return;e(o),a({productId:"",pricingProfileId:"booth",plannedQuantity:"1"}),U("Batch created.","success")}finally{s(!1)}}}}>
    <select
      class="form-input"
      value=${n.productId}
      onChange=${d=>r("productId",d.target.value)}
    >
      <option value="">Select product…</option>
      ${t.map(d=>K`<option key=${d.id} value=${String(d.id)}>${d.name}</option>`)}
    </select>
    <select
      class="form-input"
      value=${n.pricingProfileId}
      onChange=${d=>r("pricingProfileId",d.target.value)}
    >
      ${ce.map(d=>K`<option key=${d.id} value=${d.id}>${d.label}</option>`)}
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
      disabled=${i||!Lt(n.productId)||!Lt(n.plannedQuantity)}
    >
      ${i?"Adding…":"Add Batch"}
    </button>
  </form>`}function Za({navigate:t}){const[e,n]=g([]),[a,i]=g([]),[s,r]=g(!0),[c,d]=g(""),[u,p]=g("");R(()=>{let l=!1;return Promise.all([An(),ue()]).then(([m,h])=>{l||(n(m),i(h))}).catch(m=>{U(m instanceof Error?m.message:"Failed to load batches.","error")}).finally(()=>{l||r(!1)}),()=>{l=!0}},[]);const o=q(()=>{const l=c.trim().toLowerCase();return e.filter(m=>u&&m.pricing_profile_id!==u?!1:l?[m.product_name,m.pricing_profile_label,m.material_type,m.primary_color].filter(Boolean).join(" ").toLowerCase().includes(l):!0)},[e,u,c]);return K`<main class="products-page batches-page">
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
        value=${c}
        onInput=${l=>d(l.target.value)}
      />
      <select
        value=${u}
        onChange=${l=>p(l.target.value)}
      >
        <option value="">All channels</option>
        ${ce.map(l=>K`<option key=${l.id} value=${l.id}>${l.label}</option>`)}
      </select>
      <span class="product-count">${o.length} of ${e.length} batches</span>
    </div>

    <section class="product-create-section">
      <${Xa}
        products=${a}
        onCreated=${l=>n(m=>[l,...m])}
      />
    </section>

    ${s?K`<div class="empty">Loading batches…</div>`:o.length?K`<div class="batch-grid">
            ${o.map(l=>K`<${Ya}
                  key=${l.id}
                  batch=${l}
                  onOpen=${()=>t(`/batches/${l.id}`)}
                />`)}
          </div>`:K`<div class="empty">No batches match your filters.</div>`}
  </main>`}const nt=N.bind(S);function Z({label:t,value:e}){return nt`<div class="catalog-summary-pill">
    <strong>${e.toLocaleString()}</strong>${t}
  </div>`}function ti({summary:t}){return t?nt`
    <div class="catalog-summary" role="status" aria-live="polite">
      <${Z} label="scanned" value=${t.scanned} />
      <${Z} label="added" value=${t.added} />
      <${Z} label="changed" value=${t.changed} />
      <${Z} label="unchanged" value=${t.unchanged} />
      <${Z} label="missing" value=${t.missing} />
      <${Z} label="restored" value=${t.restored} />
      <${Z} label="skipped" value=${t.skipped} />
      <${Z} label="failed" value=${t.failed} />
    </div>
  `:null}function ei(){const[t,e]=g([]),[n,a]=g(""),[i,s]=g(""),[r,c]=g(!0),[d,u]=g(!1),[p,o]=g(null),l=async()=>{const _=await ot("/catalog/roots","Failed to load roots.");_&&e(_.roots),c(!1)};R(()=>{l()},[]);const m=async _=>{_.preventDefault();const v=n.trim();if(!v)return;const f=i.trim()?{rootPath:v,name:i.trim()}:{rootPath:v},b=await lt("/catalog/roots",f,"Failed to add root.");b&&(e(y=>[...y,b.root]),a(""),s(""),U("Catalog root added.","success"))},h=async _=>{const v=await ot(`/catalog/roots/${_}`,"Failed to remove root.",{method:"DELETE"});v&&e(f=>f.map(b=>b.id===_?v.root:b))};return nt`
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
            onClick=${async()=>{u(!0);try{const _=await lt("/catalog/scan",{},"Catalog scan failed.",{timeoutMs:null});if(!_)return;o(_.summary),U("Catalog scan complete.",_.summary.failed>0?"info":"success"),await l()}finally{u(!1)}}}
            disabled=${d||t.every(_=>!_.is_active)}
          >
            ${d?"Scanning…":"Run scan"}
          </button>
        </div>
        <${ti} summary=${p} />
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Scan roots</h3>
        <form class="admin-card catalog-root-form" onSubmit=${m}>
          <label class="form-label">
            Folder path
            <input
              class="form-input"
              value=${n}
              placeholder="/Users/adam/3d-models"
              onInput=${_=>a(_.target.value)}
            />
          </label>
          <label class="form-label">
            Name
            <input
              class="form-input"
              value=${i}
              placeholder="Models"
              onInput=${_=>s(_.target.value)}
            />
          </label>
          <button class="btn-primary" type="submit">Add root</button>
        </form>

        ${r?nt`<div class="empty">Loading scan roots…</div>`:t.length===0?nt`<div class="empty">No scan roots configured.</div>`:nt`<div class="catalog-root-list">
                ${t.map(_=>nt`<div class="admin-card catalog-root-card" key=${_.id}>
                      <div>
                        <div class="admin-card-name">${_.name}</div>
                        <div class="catalog-root-path">${_.root_path}</div>
                        <div class="catalog-root-meta">
                          ${_.is_active?"active":"inactive"}
                          ${_.last_scanned_at?` · scanned ${_.last_scanned_at}`:""}
                        </div>
                      </div>
                      ${_.is_active?nt`<button class="btn-ghost" onClick=${()=>h(_.id)}>
                            Deactivate
                          </button>`:null}
                    </div>`)}
              </div>`}
      </section>
    </main>
  `}const ni=N.bind(S);function ai(t){return t==="green"?"product-sellability product-sellability--green":t==="yellow"?"product-sellability product-sellability--yellow":"product-sellability product-sellability--red"}function $e({level:t,label:e,readyToList:n}){return ni`<span class=${ai(t)} title=${e}>
    <span class="product-sellability-dot" aria-hidden="true"></span>
    ${e}${n?" · ready":""}
  </span>`}const _t=N.bind(S),wt=[{id:"idea",label:"Idea"},{id:"downloaded_designed",label:"Downloaded / Designed"},{id:"test_print",label:"Test Print"},{id:"needs_tuning",label:"Needs Tuning"},{id:"ready_for_photos",label:"Ready for Photos"},{id:"listed",label:"Listed"},{id:"active",label:"Active"},{id:"selling_well",label:"Selling Well"},{id:"retired",label:"Retired"}],un=[{id:"gaming",label:"Gaming"},{id:"workshop",label:"Workshop"},{id:"home_organization",label:"Home Organization"},{id:"decor",label:"Decor"},{id:"personalized",label:"Personalized"},{id:"seasonal",label:"Seasonal"},{id:"custom_repair_parts",label:"Custom / Repair Parts"}],ve=[{id:"hive",label:"Hive"},{id:"original",label:"Original"},{id:"printables",label:"Printables"},{id:"makerworld",label:"MakerWorld"},{id:"thangs",label:"Thangs"},{id:"stlflix",label:"STLFlix"},{id:"custom_commission",label:"Custom Commission"}],pn=[{id:"commercial_allowed",label:"Commercial Allowed"},{id:"personal_use_only",label:"Personal Use Only"},{id:"attribution_required",label:"Attribution Required"},{id:"hive_community",label:"Hive Community"},{id:"hive_plus",label:"Hive Plus"},{id:"original_owned",label:"Original / Owned"},{id:"unknown_verify",label:"Unknown / Verify"}],ii=[{id:"none",label:"No restock"},{id:"normal",label:"Normal"},{id:"high",label:"High"},{id:"urgent",label:"Urgent"}];function si(t){return t===null?"No price":`$${t.toFixed(2)}`}function ri({product:t}){return t.main_photo_path?_t`<img
      class="product-card-photo"
      src=${t.main_photo_path}
      alt=""
      loading="lazy"
    />`:_t`<div class="product-card-photo product-card-photo--empty" aria-hidden="true">▧</div>`}function fe({product:t,onOpen:e,onStatusChange:n}){const a=i=>i.stopPropagation();return _t`
    <article class="product-card" onClick=${()=>e(t)}>
      <${ri} product=${t} />
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
          <${$e}
            level=${t.can_sell_level}
            label=${t.can_sell_label}
            readyToList=${t.ready_to_list}
          />
          <span class="product-license-badge">${t.license_label||"License unknown"}</span>
        </div>
        <div class="product-card-footer">
          <strong>${si(t.target_sale_price)}</strong>
          ${n?_t`<label class="product-status-select" onClick=${a}>
                <span>Status</span>
                <select
                  value=${t.status_id}
                  onChange=${i=>{i.stopPropagation(),n(t,i.target.value)}}
                >
                  ${wt.map(i=>_t`<option key=${i.id} value=${i.id}>${i.label}</option>`)}
                </select>
              </label>`:_t`<span class="product-status-pill">${t.status_label}</span>`}
        </div>
      </div>
    </article>
  `}const at=N.bind(S);function oi(t){return t===null?"":String(t/3600)}function Be(t){return{name:t.name,categoryId:t.category_id??"",statusId:t.status_id,sourceId:t.source_id??"",licenseId:t.license_id??"",targetSalePrice:t.target_sale_price===null?"":String(t.target_sale_price),restockPriority:t.restock_priority,modelUrl:t.model_url??"",etsyListingUrl:t.etsy_listing_url??"",defaultMaterial:t.default_material??"",primaryColor:t.primary_color??"",accentColor:t.accent_color??"",preferredPrinterId:t.preferred_printer_id===null?"":String(t.preferred_printer_id),estimatedPrintTimeHours:oi(t.estimated_print_time_s),estimatedFilamentG:t.estimated_filament_g===null?"":String(t.estimated_filament_g),boothPrice:t.booth_price===null?"":String(t.booth_price),etsyPrice:t.etsy_price===null?"":String(t.etsy_price),packagingCost:t.packaging_cost===null?"":String(t.packaging_cost),handlingMinutes:t.handling_minutes===null?"":String(t.handling_minutes),targetMarginPct:t.target_margin_pct===null?"":String(t.target_margin_pct),pricingNotes:t.pricing_notes??"",notes:t.notes??""}}function tt(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function li(t){const e=tt(t);return e===null?null:Math.round(e*3600)}function ci(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isInteger(n)&&n>0?n:null}function vt(t,e){return[...e?[at`<option value="">${e}</option>`]:[],...t.map(a=>at`<option key=${a.id} value=${a.id}>${a.label}</option>`)]}function di({product:t}){return t.main_photo_path?at`<img class="product-detail-photo" src=${t.main_photo_path} alt="" />`:at`<div class="product-detail-photo product-detail-photo--empty">No product photo</div>`}function ui({product:t}){const e=[t.primary_color,t.accent_color].filter(Boolean).join(" / ");return at`<div class="product-detail-facts">
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
  </div>`}function pi({productId:t,navigate:e}){const[n,a]=g(null),[i,s]=g(null),[r,c]=g(!0),[d,u]=g(!1);R(()=>{let l=!1;return Jn(t).then(m=>{l||(a(m),s(Be(m)))}).catch(m=>{U(m instanceof Error?m.message:"Failed to load product.","error")}).finally(()=>{l||c(!1)}),()=>{l=!0}},[t]);const p=(l,m)=>{s(h=>h&&{...h,[l]:m})},o=async l=>{if(l.preventDefault(),!i||!n)return;const m={name:i.name,category_id:i.categoryId||null,status_id:i.statusId,source_id:i.sourceId||null,license_id:i.licenseId||null,target_sale_price:tt(i.targetSalePrice),restock_priority:i.restockPriority,model_url:i.modelUrl.trim()||null,etsy_listing_url:i.etsyListingUrl.trim()||null,default_material:i.defaultMaterial.trim()||null,primary_color:i.primaryColor.trim()||null,accent_color:i.accentColor.trim()||null,preferred_printer_id:ci(i.preferredPrinterId),estimated_print_time_s:li(i.estimatedPrintTimeHours),estimated_filament_g:tt(i.estimatedFilamentG),booth_price:tt(i.boothPrice),etsy_price:tt(i.etsyPrice),packaging_cost:tt(i.packagingCost),handling_minutes:tt(i.handlingMinutes),target_margin_pct:tt(i.targetMarginPct),pricing_notes:i.pricingNotes.trim()||null,notes:i.notes.trim()||null};u(!0);try{const h=await pe(n.id,m);if(!h)return;a(h),s(Be(h)),U("Product updated.","success")}finally{u(!1)}};return r?at`<div class="empty">Loading product…</div>`:!n||!i?at`<div class="empty">Product not found.</div>`:at`<main class="product-detail-page">
    <div class="product-detail-header">
      <button class="btn-back" onClick=${()=>e("/products")}>← Products</button>
      <div>
        <p class="products-kicker">Product detail</p>
        <h2>${n.name}</h2>
      </div>
      <${$e}
        level=${n.can_sell_level}
        label=${n.can_sell_label}
        readyToList=${n.ready_to_list}
      />
    </div>

    <section class="product-detail-layout">
      <aside class="product-detail-card">
        <${di} product=${n} />
        <${ui} product=${n} />
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
                value=${i.name}
                onInput=${l=>p("name",l.target.value)}
              />
            </label>
            <label class="form-label">
              Status
              <select
                class="form-input"
                value=${i.statusId}
                onChange=${l=>p("statusId",l.target.value)}
              >
                ${vt(wt)}
              </select>
            </label>
            <label class="form-label">
              Category
              <select
                class="form-input"
                value=${i.categoryId}
                onChange=${l=>p("categoryId",l.target.value)}
              >
                ${vt(un,"Uncategorized")}
              </select>
            </label>
            <label class="form-label">
              Source
              <select
                class="form-input"
                value=${i.sourceId}
                onChange=${l=>p("sourceId",l.target.value)}
              >
                ${vt(ve,"Source TBD")}
              </select>
            </label>
            <label class="form-label">
              License
              <select
                class="form-input"
                value=${i.licenseId}
                onChange=${l=>p("licenseId",l.target.value)}
              >
                ${vt(pn,"Verify license")}
              </select>
            </label>
            <label class="form-label">
              Target price
              <input
                class="form-input"
                inputmode="decimal"
                placeholder="18.00"
                value=${i.targetSalePrice}
                onInput=${l=>p("targetSalePrice",l.target.value)}
              />
            </label>
            <label class="form-label">
              Restock priority
              <select
                class="form-input"
                value=${i.restockPriority}
                onChange=${l=>p("restockPriority",l.target.value)}
              >
                ${vt(ii)}
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
                value=${i.modelUrl}
                placeholder="https://…"
                onInput=${l=>p("modelUrl",l.target.value)}
              />
            </label>
            <label class="form-label">
              Etsy listing URL
              <input
                class="form-input"
                value=${i.etsyListingUrl}
                placeholder="https://…"
                onInput=${l=>p("etsyListingUrl",l.target.value)}
              />
            </label>
            <label class="form-label">
              Default material
              <input
                class="form-input"
                value=${i.defaultMaterial}
                placeholder="PLA"
                onInput=${l=>p("defaultMaterial",l.target.value)}
              />
            </label>
            <label class="form-label">
              Primary color
              <input
                class="form-input"
                value=${i.primaryColor}
                placeholder="#ffffff or White"
                onInput=${l=>p("primaryColor",l.target.value)}
              />
            </label>
            <label class="form-label">
              Accent color
              <input
                class="form-input"
                value=${i.accentColor}
                placeholder="#000000 or Black"
                onInput=${l=>p("accentColor",l.target.value)}
              />
            </label>
            <label class="form-label">
              Preferred printer ID
              <input
                class="form-input"
                inputmode="numeric"
                value=${i.preferredPrinterId}
                placeholder="1"
                onInput=${l=>p("preferredPrinterId",l.target.value)}
              />
            </label>
            <label class="form-label">
              Estimated print time (hours)
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.estimatedPrintTimeHours}
                placeholder="4.5"
                onInput=${l=>p("estimatedPrintTimeHours",l.target.value)}
              />
            </label>
            <label class="form-label">
              Estimated filament (g)
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.estimatedFilamentG}
                placeholder="120"
                onInput=${l=>p("estimatedFilamentG",l.target.value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Notes
            <textarea
              class="form-input form-textarea"
              value=${i.notes}
              placeholder="Tuning notes, photo needs, listing copy reminders…"
              onInput=${l=>p("notes",l.target.value)}
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
                value=${i.boothPrice}
                placeholder="12.00"
                onInput=${l=>p("boothPrice",l.target.value)}
              />
            </label>
            <label class="form-label">
              Etsy price
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.etsyPrice}
                placeholder="14.99"
                onInput=${l=>p("etsyPrice",l.target.value)}
              />
            </label>
            <label class="form-label">
              Packaging cost
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.packagingCost}
                placeholder="0.75"
                onInput=${l=>p("packagingCost",l.target.value)}
              />
            </label>
            <label class="form-label">
              Handling minutes
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.handlingMinutes}
                placeholder="3"
                onInput=${l=>p("handlingMinutes",l.target.value)}
              />
            </label>
            <label class="form-label">
              Target margin
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.targetMarginPct}
                placeholder="0.50"
                onInput=${l=>p("targetMarginPct",l.target.value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Pricing notes
            <textarea
              class="form-input form-textarea"
              value=${i.pricingNotes}
              placeholder="Booth/Etsy pricing rationale, packaging assumptions, margin notes…"
              onInput=${l=>p("pricingNotes",l.target.value)}
            ></textarea>
          </label>
        </section>

        <div class="form-actions">
          <button class="btn-secondary" type="button" onClick=${()=>e("/products")}>
            Cancel
          </button>
          <button class="btn-primary" type="submit" disabled=${d||!i.name.trim()}>
            ${d?"Saving…":"Save Product"}
          </button>
        </div>
      </form>
    </section>
  </main>`}const pt=N.bind(S),Je={urgent:0,high:1,normal:2,none:3};function Ee(t){return[...t].sort((e,n)=>{const a=(Je[e.restock_priority]??9)-(Je[n.restock_priority]??9);return a!==0?a:e.name.localeCompare(n.name)})}function _i({products:t}){const e=t.filter(i=>i.restock_priority==="urgent").length,n=t.filter(i=>i.restock_priority==="high").length,a=t.filter(i=>i.ready_to_list).length;return pt`<div class="product-print-next-summary">
    <div><strong>${t.length}</strong><span>queued</span></div>
    <div><strong>${e}</strong><span>urgent</span></div>
    <div><strong>${n}</strong><span>high</span></div>
    <div><strong>${a}</strong><span>ready to list</span></div>
  </div>`}function mi({navigate:t}){const[e,n]=g([]),[a,i]=g(!0);R(()=>{let r=!1;return En().then(c=>{r||n(Ee(c))}).catch(c=>{U(c instanceof Error?c.message:"Failed to load print-next products.","error")}).finally(()=>{r||i(!1)}),()=>{r=!0}},[]);const s=async(r,c)=>{if(c===r.status_id)return;const d=await pe(r.id,{status_id:c});d&&(n(u=>Ee(u.map(p=>p.id===d.id?d:p).filter(p=>["active","selling_well"].includes(p.status_id)))),U("Product status updated.","success"))};return pt`<main class="products-page">
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

    ${a?pt`<div class="empty">Loading print queue…</div>`:e.length===0?pt`<div class="empty">No active products need restocking.</div>`:pt`
            <${_i} products=${e} />
            <div class="product-print-next-grid">
              ${e.map(r=>pt`<article class="product-print-next-card" key=${r.id}>
                    <div class="product-print-next-topline">
                      <span
                        class=${"product-priority product-priority--"+r.restock_priority}
                      >
                        ${r.restock_priority}
                      </span>
                      <${$e}
                        level=${r.can_sell_level}
                        label=${r.can_sell_label}
                        readyToList=${r.ready_to_list}
                      />
                    </div>
                    <${fe}
                      product=${r}
                      onOpen=${()=>t(`/products/${r.id}`)}
                      onStatusChange=${s}
                    />
                  </article>`)}
            </div>
          `}
  </main>`}const M=N.bind(S),$i=[{id:"",label:"All sellability"},{id:"green",label:"Green"},{id:"yellow",label:"Yellow"},{id:"red",label:"Red"}];function vi(t){const e=new Map;for(const s of t){const r=e.get(s.status_id)??[];r.push(s),e.set(s.status_id,r)}const n=wt.map(s=>({statusId:s.id,statusLabel:s.label,products:e.get(s.id)??[]})),a=new Set(wt.map(s=>s.id)),i=[...e.entries()].filter(([s])=>!a.has(s)).map(([s,r])=>{var c;return{statusId:s,statusLabel:((c=r[0])==null?void 0:c.status_label)??s,products:r}});return[...n,...i]}function fi(t,e){const n=e.q.trim().toLowerCase();return!(n&&![t.name,t.category_label,t.status_label,t.source_label,t.license_label].filter(Boolean).join(" ").toLowerCase().includes(n)||e.categoryId&&t.category_id!==e.categoryId||e.statusId&&t.status_id!==e.statusId||e.sourceId&&t.source_id!==e.sourceId||e.sellability&&t.can_sell_level!==e.sellability)}function gi({mode:t,navigate:e}){const n=a=>"product-tab"+(a?" active":"");return M`<div class="product-tabs" aria-label="Product views">
    <button class=${n(t==="pipeline")} onClick=${()=>e("/products/pipeline")}>
      Pipeline
    </button>
    <button class=${n(t==="catalog")} onClick=${()=>e("/products")}>
      Catalog
    </button>
    <button class="product-tab" onClick=${()=>e("/products/print-next")}>
      Print Next
    </button>
  </div>`}function hi({filters:t,setFilters:e,count:n,total:a,showStatusFilter:i}){const s=(r,c)=>e({...t,[r]:c});return M`<div class="product-toolbar">
    <input
      type="search"
      placeholder="Search products…"
      value=${t.q}
      onInput=${r=>s("q",r.target.value)}
    />
    <select
      value=${t.categoryId}
      onChange=${r=>s("categoryId",r.target.value)}
    >
      <option value="">All categories</option>
      ${un.map(r=>M`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    ${i?M`<select
          value=${t.statusId}
          onChange=${r=>s("statusId",r.target.value)}
        >
          <option value="">All statuses</option>
          ${wt.map(r=>M`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
        </select>`:null}
    <select
      value=${t.sourceId}
      onChange=${r=>s("sourceId",r.target.value)}
    >
      <option value="">All sources</option>
      ${ve.map(r=>M`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    <select
      value=${t.sellability}
      onChange=${r=>s("sellability",r.target.value)}
    >
      ${$i.map(r=>M`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    <span class="product-count"
      >${n.toLocaleString()} of ${a.toLocaleString()} products</span
    >
  </div>`}function bi({onCreated:t}){const[e,n]=g(""),[a,i]=g("unknown_verify"),[s,r]=g(""),[c,d]=g(!1);return M`<form class="product-create-card" onSubmit=${async p=>{p.preventDefault();const o=e.trim();if(o){d(!0);try{const l=await Un({name:o,status_id:"idea",license_id:a,source_id:s||null});if(!l)return;t(l),n(""),i("unknown_verify"),r(""),U("Product created.","success")}finally{d(!1)}}}}>
    <input
      class="form-input"
      placeholder="New product idea…"
      value=${e}
      onInput=${p=>n(p.target.value)}
    />
    <select
      class="form-input"
      value=${s}
      onChange=${p=>r(p.target.value)}
    >
      <option value="">Source TBD</option>
      ${ve.map(p=>M`<option key=${p.id} value=${p.id}>${p.label}</option>`)}
    </select>
    <select
      class="form-input"
      value=${a}
      onChange=${p=>i(p.target.value)}
    >
      ${pn.map(p=>M`<option key=${p.id} value=${p.id}>${p.label}</option>`)}
    </select>
    <button class="btn-primary" type="submit" disabled=${c||!e.trim()}>
      ${c?"Adding…":"Add Product"}
    </button>
  </form>`}function yi({products:t,navigate:e,onStatusChange:n}){return t.length?M`<div class="product-grid">
    ${t.map(a=>M`<${fe}
          key=${a.id}
          product=${a}
          onOpen=${()=>e(`/products/${a.id}`)}
          onStatusChange=${n}
        />`)}
  </div>`:M`<div class="empty">No products match your filters.</div>`}function Pi({columns:t,navigate:e,onStatusChange:n}){return M`<div class="product-kanban" role="list">
    ${t.map(a=>M`<section class="product-kanban-column" key=${a.statusId} role="listitem">
          <div class="product-kanban-header">
            <h3>${a.statusLabel}</h3>
            <span>${a.products.length}</span>
          </div>
          <div class="product-kanban-cards">
            ${a.products.length?a.products.map(i=>M`<${fe}
                      key=${i.id}
                      product=${i}
                      onOpen=${()=>e(`/products/${i.id}`)}
                      onStatusChange=${n}
                    />`):M`<div class="product-column-empty">No products</div>`}
          </div>
        </section>`)}
  </div>`}function wi({mode:t,navigate:e}){const[n,a]=g([]),[i,s]=g(!0),[r,c]=g({q:"",categoryId:"",statusId:"",sourceId:"",sellability:""});R(()=>{let o=!1;return ue().then(l=>{o||a(l)}).catch(l=>{U(l instanceof Error?l.message:"Failed to load products.","error")}).finally(()=>{o||s(!1)}),()=>{o=!0}},[]);const d=q(()=>n.filter(o=>fi(o,r)),[n,r]),u=q(()=>vi(d),[d]),p=async(o,l)=>{if(l===o.status_id)return;const m=await pe(o.id,{status_id:l});m&&(a(h=>h.map($=>$.id===m.id?m:$)),U("Product status updated.","success"))};return M`<main class="products-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Product workflow</p>
        <h2>${t==="pipeline"?"Product Pipeline":"Product Catalog"}</h2>
        <p>
          Card-based product tracking for sellability, listing readiness, and what to print next.
        </p>
      </div>
      <${gi} mode=${t} navigate=${e} />
    </section>

    <${hi}
      filters=${r}
      setFilters=${c}
      count=${d.length}
      total=${n.length}
      showStatusFilter=${t==="catalog"}
    />

    ${t==="catalog"?M`<section class="product-create-section">
          <${bi}
            onCreated=${o=>a(l=>[o,...l])}
          />
        </section>`:null}
    ${i?M`<div class="empty">Loading products…</div>`:t==="pipeline"?M`<${Pi}
            columns=${u}
            navigate=${e}
            onStatusChange=${p}
          />`:M`<${yi}
            products=${d}
            navigate=${e}
            onStatusChange=${p}
          />`}
  </main>`}const j=N.bind(S);function ki({bootStatus:t,loadProgress:e}){return j` <div class="in-app-loading" role="status" aria-live="polite">
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
          ${Array.from({length:5},(n,a)=>j`
              <div class="dashboard-loader-row" key=${a}>
                <span></span><span></span><span></span><span></span>
              </div>
            `)}
        </div>
      </div>
    </section>
  </div>`}function Ci({error:t}){return j`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${t}</p>
      </div>
    </div>
  </div>`}function Si({projectId:t,projects:e,jobs:n,projectsLoading:a,navigate:i,setSelectedJob:s,handleJobProjectChange:r,setProjects:c}){const d=e.find(o=>Number(o.id)===t),u=n.filter(o=>Number(o.project_id)===t);if(!d)return a?j`<div class="empty">Loading projects…</div>`:j`<div class="empty">Project not found.</div>`;const p=n.filter(o=>o.project_id==null);return j`<${Da}
    project=${d}
    jobs=${u}
    unassignedJobs=${p}
    onBack=${()=>i("/projects")}
    onJobClick=${s}
    onAddJob=${o=>r(o,t)}
    onRemoveJob=${o=>r(o,null)}
    onProjectUpdated=${o=>c(l=>l.some(m=>m.id===o.id)?l.map(m=>m.id===o.id?o:m):[o,...l])}
    onMoveJobToProject=${(o,l)=>r(o,l)}
    onNavigateToProject=${o=>i(`/projects/${o}`)}
  />`}function Fi({sorted:t,view:e,sortCol:n,sortDir:a,onSort:i,onJobClick:s,density:r}){return t.length===0?j`<div class="empty">No jobs match your filters.</div>`:e==="table"?j`<${ca}
      sorted=${t}
      sortCol=${n}
      sortDir=${a}
      onSort=${i}
      onJobClick=${s}
      density=${r}
    />`:j`<${ua} sorted=${t} onJobClick=${s} density=${r} />`}function Ii({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:i,setDeviceFilter:s,devices:r,view:c,setView:d,filtered:u,jobs:p,isFiltered:o,sorted:l,sortCol:m,sortDir:h,onSort:$,onJobClick:_,density:v,setDensity:f}){return j`
    <${sa}
      q=${t}
      setQ=${e}
      statusFilter=${n}
      setStatusFilter=${a}
      deviceFilter=${i}
      setDeviceFilter=${s}
      devices=${r}
      view=${c}
      setView=${d}
      density=${v}
      setDensity=${f}
      filteredCount=${u.length}
      totalCount=${p.length}
    />
    <${ra} filtered=${u} isFiltered=${o} />
    ${Fi({sorted:l,view:c,sortCol:m,sortDir:h,onSort:$,onJobClick:_,density:v})}
  `}function Ti(t){const e=t.match(/^\/projects\/(\d+)$/),n=t.match(/^\/products\/(\d+)$/),a=t.match(/^\/batches\/(\d+)$/);return{isAdmin:t.startsWith("/admin"),isPrinters:t.startsWith("/printers"),isProjects:t.startsWith("/projects"),isCatalog:t.startsWith("/catalog"),isProducts:t.startsWith("/products"),isProductPipeline:t==="/products/pipeline",isProductPrintNext:t==="/products/print-next",isBatches:t.startsWith("/batches"),projectId:e?Number(e[1]):null,productId:n?Number(n[1]):null,batchId:a?Number(a[1]):null}}function Ni({route:t,summary:e,projects:n,setProjects:a,jobs:i,projectsLoading:s,navigate:r,setSelectedJob:c,handleJobProjectChange:d,handleRatesChanged:u,handleAutoGroup:p,projectPrices:o,q:l,setQ:m,statusFilter:h,setStatusFilter:$,deviceFilter:_,setDeviceFilter:v,devices:f,view:b,setView:y,filtered:P,isFiltered:k,sorted:F,sortCol:J,sortDir:E,density:W,setDensity:St,handleSort:Wt}){return t.isAdmin?j`<${qa} onRatesChanged=${u} />`:t.batchId!=null?j`<${Ka} batchId=${t.batchId} navigate=${r} />`:t.isBatches?j`<${Za} navigate=${r} />`:t.productId!=null?j`<${pi} productId=${t.productId} navigate=${r} />`:t.isProductPrintNext?j`<${mi} navigate=${r} />`:t.isProducts?j`<${wi}
      mode=${t.isProductPipeline?"pipeline":"catalog"}
      navigate=${r}
    />`:t.isCatalog?j`<${ei} />`:t.isPrinters?j`<${zn}
      summary=${e}
      jobs=${i}
      onJobClick=${c}
    />`:t.projectId!=null?j`<${Si}
      projectId=${t.projectId}
      projects=${n}
      jobs=${i}
      projectsLoading=${s}
      navigate=${r}
      setSelectedJob=${c}
      handleJobProjectChange=${d}
      setProjects=${a}
    />`:t.isProjects?j`<${Ba}
      projects=${n}
      setProjects=${a}
      onAutoGroup=${p}
      projectPrices=${o}
      loading=${s}
    />`:j`<${Ii}
    q=${l}
    setQ=${m}
    statusFilter=${h}
    setStatusFilter=${$}
    deviceFilter=${_}
    setDeviceFilter=${v}
    devices=${f}
    view=${b}
    setView=${y}
    filtered=${P}
    jobs=${i}
    isFiltered=${k}
    sorted=${F}
    sortCol=${J}
    sortDir=${E}
    onSort=${Wt}
    onJobClick=${c}
    density=${W}
    setDensity=${St}
  />`}function Li({setJobs:t,setProjects:e,setProjectPrices:n,setSummary:a,setDataRange:i,toast:s}){const[r,c]=g(!0),[d,u]=g(!0),[p,o]=g(0),[l,m]=g(null),[h,$]=g("Starting dashboard…"),_=w(async({url:b,fallback:y,onData:P,onFinally:k})=>{const{data:F,error:J}=await de(b,y);J&&s(J.message||y,"error"),F&&P(F),k&&k()},[s]),v=w(()=>{_({url:"/projects",fallback:"Failed to load projects.",onData:b=>b.projects&&e(b.projects),onFinally:()=>u(!1)}),_({url:"/projects/prices",fallback:"Failed to load project prices.",onData:b=>b.prices&&n(b.prices)})},[_,e,n]),f=w((b=!1)=>{_({url:"/jobs/prices",fallback:b?"Failed to refresh job prices.":"Failed to load job prices.",onData:P=>{P!=null&&P.prices&&t(k=>k.map(F=>{var J;return{...F,final_price:((J=P.prices)==null?void 0:J[F.id])??(b?F.final_price:null)??null}}))}})},[_,t]);return R(()=>{const b=()=>o(k=>Math.min(100,k+100/xn)),y=(k,F,J)=>($(`Loading ${k}…`),G(k,F).catch(E=>{const W=E instanceof Error?E.message:F;throw new Error(`Initial dashboard load failed (${J}): ${W}`)}).finally(b)),P=setTimeout(()=>{m("Dashboard load timed out. Check console/network for the failing request."),c(!1),u(!1)},Mn);return Promise.all([y("/ui/data","Failed to load jobs.","jobs"),y("/summary","Failed to load summary.","summary"),y("/health/data-range","Failed to load print history range.","history range")]).then(([k,F,J])=>{t(k.jobs),a(F),i(J),c(!1),$("Loading optional data…"),f(!1),v()}).catch(k=>{m(k.message),c(!1),u(!1)}).finally(()=>clearTimeout(P)),()=>clearTimeout(P)},[t,a,i,f,v]),{loading:r,projectsLoading:d,loadProgress:p,error:l,bootStatus:h,refreshProjectsAndPrices:v,refreshJobPrices:f}}function Mi(t,e,n,a){return t.filter(i=>{const s=`${i.designTitle||""} ${i.customer||""}`.toLowerCase();return!(e&&!s.includes(e.toLowerCase())||n&&(i.status||"").toLowerCase()!==n||a&&i.deviceModel!==a)})}function xi(t,e,n){return[...t].sort((a,i)=>{let s=a[e],r=i[e];if(s==null&&(s=n==="asc"?1/0:-1/0),r==null&&(r=n==="asc"?1/0:-1/0),typeof s=="string"){const u=typeof r=="string"?r:String(r);return n==="asc"?s.localeCompare(u):u.localeCompare(s)}const c=Number(s),d=Number(r);return n==="asc"?c-d:d-c})}const yt=N.bind(S);function ji(){const[t,e]=g([]),[n,a]=g([]),[i,s]=g({}),[r,c]=g(null),[d,u]=g(null),[p,o]=g("table"),[l,m]=g("comfy"),[h,$]=g(""),[_,v]=g(""),[f,b]=g(""),[y,P]=g("startTime"),[k,F]=g("desc"),[J,E]=g(null);return{jobs:t,setJobs:e,projects:n,setProjects:a,projectPrices:i,setProjectPrices:s,summary:r,setSummary:c,dataRange:d,setDataRange:u,view:p,setView:o,density:l,setDensity:m,q:h,setQ:$,statusFilter:_,setStatusFilter:v,deviceFilter:f,setDeviceFilter:b,sortCol:y,setSortCol:P,sortDir:k,setSortDir:F,selectedJob:J,setSelectedJob:E}}function Di({jobs:t,q:e,statusFilter:n,deviceFilter:a,sortCol:i,sortDir:s,setSortCol:r,setSortDir:c,loc:d}){const u=q(()=>[...new Set(t.map($=>$.deviceModel).filter($=>!!$))].sort(),[t]),p=!!(e||n||a),o=q(()=>Mi(t,e,n,a),[t,e,n,a]),l=q(()=>xi(o,i,s),[o,i,s]),m=w($=>{if(i===$){c(_=>_==="asc"?"desc":"asc");return}r($),c(()=>$==="startTime"?"desc":"asc")},[i,r,c]),h=q(()=>Ti(d),[d]);return{devices:u,isFiltered:p,filtered:o,sorted:l,handleSort:m,route:h}}function Bi({setJobs:t,setProjects:e,setSummary:n,setSelectedJob:a,navigate:i,refreshProjectsAndPrices:s,refreshJobPrices:r}){const c=w((f,b)=>{t(y=>y.map(P=>P.id===f?{...P,...b}:P)),a(y=>y&&y.id===f?{...y,...b}:y)},[]),d=w(async(f,b)=>{const y=await X(`/jobs/${f}`,b,"Failed to update job.");if(!(y!=null&&y.job))return null;const{job:P}=y;return c(f,P),P},[c]),u=w((f,b)=>{d(f,b)},[d]),p=w(async(f,b)=>{await d(f,{project_id:b})&&s()},[d,s]),o=w((f,b)=>{u(f,{status_override:b})},[u]),l=w((f,b)=>{u(f,{extra_labor_minutes:b})},[u]),m=w(f=>{a(null),i(`/projects/${f}`)},[i]),h=w(()=>{r(!0),s()},[r,s]),$=w(async()=>{h();try{const f=await G("/summary","Failed to refresh summary.");n(f),U("Pricing refreshed from updated rates.","success")}catch(f){const b=f instanceof Error?f.message:"Updated rates saved, but summary refresh failed.";U(b,"error")}},[h,n]),_=w(async()=>{const[f,b]=await Promise.all([G("/ui/data","Failed to refresh jobs."),G("/projects","Failed to refresh projects.")]);t(()=>f.jobs),e(b.projects),h()},[h,e]);return{closeModal:w(()=>a(null),[]),patchJob:d,handleJobProjectChange:p,handleJobStatusChange:o,handleJobExtraLaborChange:l,handleNavigateToProject:m,handleRatesChanged:$,handleAutoGroup:_}}function Ji({selectedJob:t,closeModal:e,patchJob:n,projects:a,handleJobProjectChange:i,handleJobStatusChange:s,handleJobExtraLaborChange:r,handleNavigateToProject:c}){return t?yt`<${$a}
    key=${t.id}
    job=${t}
    onClose=${e}
    onPatch=${n}
    projects=${a}
    onJobProjectChange=${i}
    onJobStatusChange=${s}
    onJobExtraLaborChange=${r}
    onNavigateToProject=${c}
  />`:null}function Ei(t){const e=w(i=>t.setProjects(i),[t.setProjects]),n=w(i=>t.setSummary(i),[t.setSummary]),a=w(i=>t.setDataRange(i),[t.setDataRange]);return Li({setJobs:t.setJobs,setProjects:e,setProjectPrices:t.setProjectPrices,setSummary:n,setDataRange:a,toast:U})}function Ui(){const t=ji(),[e,n]=re(),{loading:a,projectsLoading:i,loadProgress:s,error:r,bootStatus:c,refreshProjectsAndPrices:d,refreshJobPrices:u}=Ei(t),{devices:p,isFiltered:o,filtered:l,sorted:m,handleSort:h,route:$}=Di({jobs:t.jobs,q:t.q,statusFilter:t.statusFilter,deviceFilter:t.deviceFilter,sortCol:t.sortCol,sortDir:t.sortDir,setSortCol:t.setSortCol,setSortDir:t.setSortDir,loc:e}),{closeModal:_,patchJob:v,handleJobProjectChange:f,handleJobStatusChange:b,handleJobExtraLaborChange:y,handleNavigateToProject:P,handleRatesChanged:k,handleAutoGroup:F}=Bi({setJobs:t.setJobs,setProjects:t.setProjects,setSummary:t.setSummary,setSelectedJob:t.setSelectedJob,navigate:n,refreshProjectsAndPrices:d,refreshJobPrices:u});return a?yt`<${ki} bootStatus=${c} loadProgress=${s} />`:r?yt`<${Ci} error=${r} />`:yt`
    <${ia} summary=${t.summary} dataRange=${t.dataRange} />
    ${Ni({route:$,summary:t.summary,projects:t.projects,setProjects:t.setProjects,jobs:t.jobs,projectsLoading:i,navigate:n,setSelectedJob:t.setSelectedJob,handleJobProjectChange:f,handleRatesChanged:k,handleAutoGroup:F,projectPrices:t.projectPrices,q:t.q,setQ:t.setQ,statusFilter:t.statusFilter,setStatusFilter:t.setStatusFilter,deviceFilter:t.deviceFilter,setDeviceFilter:t.setDeviceFilter,devices:p,view:t.view,setView:t.setView,density:t.density,setDensity:t.setDensity,filtered:l,isFiltered:o,sorted:m,sortCol:t.sortCol,sortDir:t.sortDir,handleSort:h})}
    <${Ji}
      selectedJob=${t.selectedJob}
      closeModal=${_}
      patchJob=${v}
      projects=${t.projects}
      handleJobProjectChange=${f}
      handleJobStatusChange=${b}
      handleJobExtraLaborChange=${y}
      handleNavigateToProject=${P}
    />
    <${Nn} />
  `}const Ai=yt`<${Le} base="/ui"><${Ui} /></${Le}>`;yn(Ai,document.getElementById("app"));
