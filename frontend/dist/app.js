(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();var Qt,N,tn,rt,je,en,nn,ne,Ut,It,an,fe,oe,le,sn,Ht={},qt=[],Bn=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Vt=Array.isArray;function Z(t,e){for(var n in e)t[n]=e[n];return t}function ve(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function x(t,e,n){var a,s,i,r={};for(i in e)i=="key"?a=e[i]:i=="ref"?s=e[i]:r[i]=e[i];if(arguments.length>2&&(r.children=arguments.length>3?Qt.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(i in t.defaultProps)r[i]===void 0&&(r[i]=t.defaultProps[i]);return At(t,r,a,s,null)}function At(t,e,n,a,s){var i={type:t,props:e,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:s??++tn,__i:-1,__u:0};return s==null&&N.vnode!=null&&N.vnode(i),i}function Gt(t){return t.children}function Rt(t,e){this.props=t,this.context=e}function gt(t,e){if(e==null)return t.__?gt(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?gt(t):null}function Un(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,a=[],s=[],i=Z({},e);i.__v=e.__v+1,N.vnode&&N.vnode(i),ge(t.__P,i,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,a,n??gt(e),!!(32&e.__u),s),i.__v=e.__v,i.__.__k[i.__i]=i,cn(a,i,s),e.__e=e.__=null,i.__e!=n&&rn(i)}}function rn(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),rn(t)}function ce(t){(!t.__d&&(t.__d=!0)&&rt.push(t)&&!Wt.__r++||je!=N.debounceRendering)&&((je=N.debounceRendering)||en)(Wt)}function Wt(){try{for(var t,e=1;rt.length;)rt.length>e&&rt.sort(nn),t=rt.shift(),e=rt.length,Un(t)}finally{rt.length=Wt.__r=0}}function on(t,e,n,a,s,i,r,u,l,p,d){var o,c,m,v,y,_,g,$=a&&a.__k||qt,b=e.length;for(l=An(n,e,$,l,b),o=0;o<b;o++)(m=n.__k[o])!=null&&(c=m.__i!=-1&&$[m.__i]||Ht,m.__i=o,_=ge(t,m,c,s,i,r,u,l,p,d),v=m.__e,m.ref&&c.ref!=m.ref&&(c.ref&&he(c.ref,null,m),d.push(m.ref,m.__c||v,m)),y==null&&v!=null&&(y=v),(g=!!(4&m.__u))||c.__k===m.__k?(l=ln(m,l,t,g),g&&c.__e&&(c.__e=null)):typeof m.type=="function"&&_!==void 0?l=_:v&&(l=v.nextSibling),m.__u&=-7);return n.__e=y,l}function An(t,e,n,a,s){var i,r,u,l,p,d=n.length,o=d,c=0;for(t.__k=new Array(s),i=0;i<s;i++)(r=e[i])!=null&&typeof r!="boolean"&&typeof r!="function"?(typeof r=="string"||typeof r=="number"||typeof r=="bigint"||r.constructor==String?r=t.__k[i]=At(null,r,null,null,null):Vt(r)?r=t.__k[i]=At(Gt,{children:r},null,null,null):r.constructor===void 0&&r.__b>0?r=t.__k[i]=At(r.type,r.props,r.key,r.ref?r.ref:null,r.__v):t.__k[i]=r,l=i+c,r.__=t,r.__b=t.__b+1,u=null,(p=r.__i=Rn(r,n,l,o))!=-1&&(o--,(u=n[p])&&(u.__u|=2)),u==null||u.__v==null?(p==-1&&(s>d?c--:s<d&&c++),typeof r.type!="function"&&(r.__u|=4)):p!=l&&(p==l-1?c--:p==l+1?c++:(p>l?c--:c++,r.__u|=4))):t.__k[i]=null;if(o)for(i=0;i<d;i++)(u=n[i])!=null&&(2&u.__u)==0&&(u.__e==a&&(a=gt(u)),un(u,u));return a}function ln(t,e,n,a){var s,i;if(typeof t.type=="function"){for(s=t.__k,i=0;s&&i<s.length;i++)s[i]&&(s[i].__=t,e=ln(s[i],e,n,a));return e}t.__e!=e&&(a&&(e&&t.type&&!e.parentNode&&(e=gt(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Rn(t,e,n,a){var s,i,r,u=t.key,l=t.type,p=e[n],d=p!=null&&(2&p.__u)==0;if(p===null&&u==null||d&&u==p.key&&l==p.type)return n;if(a>(d?1:0)){for(s=n-1,i=n+1;s>=0||i<e.length;)if((p=e[r=s>=0?s--:i++])!=null&&(2&p.__u)==0&&u==p.key&&l==p.type)return r}return-1}function De(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||Bn.test(e)?n:n+"px"}function Dt(t,e,n,a,s){var i,r;t:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof a=="string"&&(t.style.cssText=a=""),a)for(e in a)n&&e in n||De(t.style,e,"");if(n)for(e in n)a&&n[e]==a[e]||De(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")i=e!=(e=e.replace(an,"$1")),r=e.toLowerCase(),e=r in t||e=="onFocusOut"||e=="onFocusIn"?r.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+i]=n,n?a?n[It]=a[It]:(n[It]=fe,t.addEventListener(e,i?le:oe,i)):t.removeEventListener(e,i?le:oe,i);else{if(s=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break t}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function Je(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[Ut]==null)e[Ut]=fe++;else if(e[Ut]<n[It])return;return n(N.event?N.event(e):e)}}}function ge(t,e,n,a,s,i,r,u,l,p){var d,o,c,m,v,y,_,g,$,b,P,k,h,w,F,T=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(l=!!(32&n.__u),i=[u=e.__e=n.__e]),(d=N.__b)&&d(e);t:if(typeof T=="function")try{if(g=e.props,$=T.prototype&&T.prototype.render,b=(d=T.contextType)&&a[d.__c],P=d?b?b.props.value:d.__:a,n.__c?_=(o=e.__c=n.__c).__=o.__E:($?e.__c=o=new T(g,P):(e.__c=o=new Rt(g,P),o.constructor=T,o.render=Hn),b&&b.sub(o),o.state||(o.state={}),o.__n=a,c=o.__d=!0,o.__h=[],o._sb=[]),$&&o.__s==null&&(o.__s=o.state),$&&T.getDerivedStateFromProps!=null&&(o.__s==o.state&&(o.__s=Z({},o.__s)),Z(o.__s,T.getDerivedStateFromProps(g,o.__s))),m=o.props,v=o.state,o.__v=e,c)$&&T.getDerivedStateFromProps==null&&o.componentWillMount!=null&&o.componentWillMount(),$&&o.componentDidMount!=null&&o.__h.push(o.componentDidMount);else{if($&&T.getDerivedStateFromProps==null&&g!==m&&o.componentWillReceiveProps!=null&&o.componentWillReceiveProps(g,P),e.__v==n.__v||!o.__e&&o.shouldComponentUpdate!=null&&o.shouldComponentUpdate(g,o.__s,P)===!1){e.__v!=n.__v&&(o.props=g,o.state=o.__s,o.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(H){H&&(H.__=e)}),qt.push.apply(o.__h,o._sb),o._sb=[],o.__h.length&&r.push(o);break t}o.componentWillUpdate!=null&&o.componentWillUpdate(g,o.__s,P),$&&o.componentDidUpdate!=null&&o.__h.push(function(){o.componentDidUpdate(m,v,y)})}if(o.context=P,o.props=g,o.__P=t,o.__e=!1,k=N.__r,h=0,$)o.state=o.__s,o.__d=!1,k&&k(e),d=o.render(o.props,o.state,o.context),qt.push.apply(o.__h,o._sb),o._sb=[];else do o.__d=!1,k&&k(e),d=o.render(o.props,o.state,o.context),o.state=o.__s;while(o.__d&&++h<25);o.state=o.__s,o.getChildContext!=null&&(a=Z(Z({},a),o.getChildContext())),$&&!c&&o.getSnapshotBeforeUpdate!=null&&(y=o.getSnapshotBeforeUpdate(m,v)),w=d!=null&&d.type===Gt&&d.key==null?dn(d.props.children):d,u=on(t,Vt(w)?w:[w],e,n,a,s,i,r,u,l,p),o.base=e.__e,e.__u&=-161,o.__h.length&&r.push(o),_&&(o.__E=o.__=null)}catch(H){if(e.__v=null,l||i!=null)if(H.then){for(e.__u|=l?160:128;u&&u.nodeType==8&&u.nextSibling;)u=u.nextSibling;i[i.indexOf(u)]=null,e.__e=u}else{for(F=i.length;F--;)ve(i[F]);de(e)}else e.__e=n.__e,e.__k=n.__k,H.then||de(e);N.__e(H,e,n)}else i==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):u=e.__e=On(n.__e,e,n,a,s,i,r,l,p);return(d=N.diffed)&&d(e),128&e.__u?void 0:u}function de(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(de))}function cn(t,e,n){for(var a=0;a<n.length;a++)he(n[a],n[++a],n[++a]);N.__c&&N.__c(e,t),t.some(function(s){try{t=s.__h,s.__h=[],t.some(function(i){i.call(s)})}catch(i){N.__e(i,s.__v)}})}function dn(t){return typeof t!="object"||t==null||t.__b>0?t:Vt(t)?t.map(dn):Z({},t)}function On(t,e,n,a,s,i,r,u,l){var p,d,o,c,m,v,y,_=n.props||Ht,g=e.props,$=e.type;if($=="svg"?s="http://www.w3.org/2000/svg":$=="math"?s="http://www.w3.org/1998/Math/MathML":s||(s="http://www.w3.org/1999/xhtml"),i!=null){for(p=0;p<i.length;p++)if((m=i[p])&&"setAttribute"in m==!!$&&($?m.localName==$:m.nodeType==3)){t=m,i[p]=null;break}}if(t==null){if($==null)return document.createTextNode(g);t=document.createElementNS(s,$,g.is&&g),u&&(N.__m&&N.__m(e,i),u=!1),i=null}if($==null)_===g||u&&t.data==g||(t.data=g);else{if(i=i&&Qt.call(t.childNodes),!u&&i!=null)for(_={},p=0;p<t.attributes.length;p++)_[(m=t.attributes[p]).name]=m.value;for(p in _)m=_[p],p=="dangerouslySetInnerHTML"?o=m:p=="children"||p in g||p=="value"&&"defaultValue"in g||p=="checked"&&"defaultChecked"in g||Dt(t,p,null,m,s);for(p in g)m=g[p],p=="children"?c=m:p=="dangerouslySetInnerHTML"?d=m:p=="value"?v=m:p=="checked"?y=m:u&&typeof m!="function"||_[p]===m||Dt(t,p,m,_[p],s);if(d)u||o&&(d.__html==o.__html||d.__html==t.innerHTML)||(t.innerHTML=d.__html),e.__k=[];else if(o&&(t.innerHTML=""),on(e.type=="template"?t.content:t,Vt(c)?c:[c],e,n,a,$=="foreignObject"?"http://www.w3.org/1999/xhtml":s,i,r,i?i[0]:n.__k&&gt(n,0),u,l),i!=null)for(p=i.length;p--;)ve(i[p]);u||(p="value",$=="progress"&&v==null?t.removeAttribute("value"):v!=null&&(v!==t[p]||$=="progress"&&!v||$=="option"&&v!=_[p])&&Dt(t,p,v,_[p],s),p="checked",y!=null&&y!=t[p]&&Dt(t,p,y,_[p],s))}return t}function he(t,e,n){try{if(typeof t=="function"){var a=typeof t.__u=="function";a&&t.__u(),a&&e==null||(t.__u=t(e))}else t.current=e}catch(s){N.__e(s,n)}}function un(t,e,n){var a,s;if(N.unmount&&N.unmount(t),(a=t.ref)&&(a.current&&a.current!=t.__e||he(a,null,e)),(a=t.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(i){N.__e(i,e)}a.base=a.__P=null}if(a=t.__k)for(s=0;s<a.length;s++)a[s]&&un(a[s],e,n||typeof t.type!="function");n||ve(t.__e),t.__c=t.__=t.__e=void 0}function Hn(t,e,n){return this.constructor(t,n)}function qn(t,e,n){var a,s,i,r;e==document&&(e=document.documentElement),N.__&&N.__(t,e),s=(a=!1)?null:e.__k,i=[],r=[],ge(e,t=e.__k=x(Gt,null,[t]),s||Ht,Ht,e.namespaceURI,s?null:e.firstChild?Qt.call(e.childNodes):null,i,s?s.__e:e.firstChild,a,r),cn(i,t,r)}function Wn(t){function e(n){var a,s;return this.getChildContext||(a=new Set,(s={})[e.__c]=this,this.getChildContext=function(){return s},this.componentWillUnmount=function(){a=null},this.shouldComponentUpdate=function(i){this.props.value!=i.value&&a.forEach(function(r){r.__e=!0,ce(r)})},this.sub=function(i){a.add(i);var r=i.componentWillUnmount;i.componentWillUnmount=function(){a&&a.delete(i),r&&r.call(i)}}),n.children}return e.__c="__cC"+sn++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,a){return n.children(a)}).contextType=e,e}Qt=qt.slice,N={__e:function(t,e,n,a){for(var s,i,r;e=e.__;)if((s=e.__c)&&!s.__)try{if((i=s.constructor)&&i.getDerivedStateFromError!=null&&(s.setState(i.getDerivedStateFromError(t)),r=s.__d),s.componentDidCatch!=null&&(s.componentDidCatch(t,a||{}),r=s.__d),r)return s.__E=s}catch(u){t=u}throw t}},tn=0,Rt.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=Z({},this.state),typeof t=="function"&&(t=t(Z({},n),this.props)),t&&Z(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),ce(this))},Rt.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),ce(this))},Rt.prototype.render=Gt,rt=[],en=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,nn=function(t,e){return t.__v.__b-e.__v.__b},Wt.__r=0,ne=Math.random().toString(8),Ut="__d"+ne,It="__a"+ne,an=/(PointerCapture)$|Capture$/i,fe=0,oe=Je(!1),le=Je(!0),sn=0;var ht,j,ae,Ee,Nt=0,pn=[],B=N,Be=B.__b,Ue=B.__r,Ae=B.diffed,Re=B.__c,Oe=B.unmount,He=B.__;function zt(t,e){B.__h&&B.__h(j,t,Nt||e),Nt=0;var n=j.__H||(j.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function f(t){return Nt=1,Qn($n,t)}function Qn(t,e,n){var a=zt(ht++,2);if(a.t=t,!a.__c&&(a.__=[$n(void 0,e),function(u){var l=a.__N?a.__N[0]:a.__[0],p=a.t(l,u);l!==p&&(a.__N=[p,a.__[1]],a.__c.setState({}))}],a.__c=j,!j.__f)){var s=function(u,l,p){if(!a.__c.__H)return!0;var d=a.__c.__H.__.filter(function(c){return c.__c});if(d.every(function(c){return!c.__N}))return!i||i.call(this,u,l,p);var o=a.__c.props!==u;return d.some(function(c){if(c.__N){var m=c.__[0];c.__=c.__N,c.__N=void 0,m!==c.__[0]&&(o=!0)}}),i&&i.call(this,u,l,p)||o};j.__f=!0;var i=j.shouldComponentUpdate,r=j.componentWillUpdate;j.componentWillUpdate=function(u,l,p){if(this.__e){var d=i;i=void 0,s(u,l,p),i=d}r&&r.call(this,u,l,p)},j.shouldComponentUpdate=s}return a.__N||a.__}function O(t,e){var n=zt(ht++,3);!B.__s&&_n(n.__H,e)&&(n.__=t,n.u=e,j.__H.__h.push(n))}function mn(t){return Nt=5,V(function(){return{current:t}},[])}function V(t,e){var n=zt(ht++,7);return _n(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function S(t,e){return Nt=8,V(function(){return t},e)}function Vn(t){var e=j.context[t.__c],n=zt(ht++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(j)),e.props.value):t.__}function Gn(){for(var t;t=pn.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(Ot),e.__h.some(ue),e.__h=[]}catch(n){e.__h=[],B.__e(n,t.__v)}}}B.__b=function(t){j=null,Be&&Be(t)},B.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),He&&He(t,e)},B.__r=function(t){Ue&&Ue(t),ht=0;var e=(j=t.__c).__H;e&&(ae===j?(e.__h=[],j.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(Ot),e.__h.some(ue),e.__h=[],ht=0)),ae=j},B.diffed=function(t){Ae&&Ae(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(pn.push(e)!==1&&Ee===B.requestAnimationFrame||((Ee=B.requestAnimationFrame)||zn)(Gn)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),ae=j=null},B.__c=function(t,e){e.some(function(n){try{n.__h.some(Ot),n.__h=n.__h.filter(function(a){return!a.__||ue(a)})}catch(a){e.some(function(s){s.__h&&(s.__h=[])}),e=[],B.__e(a,n.__v)}}),Re&&Re(t,e)},B.unmount=function(t){Oe&&Oe(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(a){try{Ot(a)}catch(s){e=s}}),n.__H=void 0,e&&B.__e(e,n.__v))};var qe=typeof requestAnimationFrame=="function";function zn(t){var e,n=function(){clearTimeout(a),qe&&cancelAnimationFrame(e),setTimeout(t)},a=setTimeout(n,35);qe&&(e=requestAnimationFrame(n))}function Ot(t){var e=j,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),j=e}function ue(t){var e=j;t.__c=t.__(),j=e}function _n(t,e){return!t||t.length!==e.length||e.some(function(n,a){return n!==t[a]})}function $n(t,e){return typeof e=="function"?e(t):e}var fn=function(t,e,n,a){var s;e[0]=0;for(var i=1;i<e.length;i++){var r=e[i++],u=e[i]?(e[0]|=r?1:2,n[e[i++]]):e[++i];r===3?a[0]=u:r===4?a[1]=Object.assign(a[1]||{},u):r===5?(a[1]=a[1]||{})[e[++i]]=u:r===6?a[1][e[++i]]+=u+"":r?(s=t.apply(u,fn(t,u,n,["",null])),a.push(s),u[0]?e[0]|=2:(e[i-2]=0,e[i]=s)):a.push(u)}return a},We=new Map;function M(t){var e=We.get(this);return e||(e=new Map,We.set(this,e)),(e=fn(this,e.get(t)||(e.set(t,e=(function(n){for(var a,s,i=1,r="",u="",l=[0],p=function(c){i===1&&(c||(r=r.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?l.push(0,c,r):i===3&&(c||r)?(l.push(3,c,r),i=2):i===2&&r==="..."&&c?l.push(4,c,0):i===2&&r&&!c?l.push(5,0,!0,r):i>=5&&((r||!c&&i===5)&&(l.push(i,0,r,s),i=6),c&&(l.push(i,c,0,s),i=6)),r=""},d=0;d<n.length;d++){d&&(i===1&&p(),p(d));for(var o=0;o<n[d].length;o++)a=n[d][o],i===1?a==="<"?(p(),l=[l],i=3):r+=a:i===4?r==="--"&&a===">"?(i=1,r=""):r=a+r[0]:u?a===u?u="":r+=a:a==='"'||a==="'"?u=a:a===">"?(p(),i=1):i&&(a==="="?(i=5,s=r,r=""):a==="/"&&(i<5||n[d][o+1]===">")?(p(),i===3&&(l=l[0]),i=l,(l=l[0]).push(2,0,i),i=0):a===" "||a==="	"||a===`
`||a==="\r"?(p(),i=2):r+=a),i===3&&r==="!--"&&(i=4,l=l[0])}return p(),l})(t)),e),arguments,[])).length>1?e:e[0]}const Kn=M.bind(x),pe=Wn(null);function Qe({base:t,children:e}){const n=t.endsWith("/")?t.slice(0,-1):t,a=u=>u===n||u===n+"/"?"/":u.startsWith(n+"/")?u.slice(n.length)||"/":u,[s,i]=f(()=>a(location.pathname));O(()=>{const u=()=>i(a(location.pathname));return window.addEventListener("popstate",u),()=>window.removeEventListener("popstate",u)},[n]);const r=S(u=>{const l=u==="/"?n+"/":n+u;history.pushState(null,"",l),i(u)},[n]);return Kn`<${pe.Provider} value=${[s,r]}>${e}</${pe.Provider}>`}function be(){const t=Vn(pe);if(!t)throw new Error("useLocation must be used within RouterProvider");return t}function nt(t){if(!t)return"—";const e=Math.floor(t/3600),n=Math.floor(t%3600/60);return e===0?`${n}m`:`${e}h${n>0?` ${n}m`:""}`}function ye(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"};return e.toLocaleString(void 0,a)}function et(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric"}:{month:"short",day:"numeric",year:"2-digit"};return e.toLocaleDateString(void 0,a)}function A(t){return"$"+t.toFixed(2)}function bt(t){return t==null?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function Pe(t){return t?t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${Math.round(t)} g`:"0 g"}const ut=M.bind(x),Yn={finish:"badge badge-finish",running:"badge badge-running",failed:"badge badge-failed",cancel:"badge badge-cancel",pause:"badge badge-pause"};function Lt({status:t}){const e=(t||"").toLowerCase();return ut`<span class=${Yn[e]||"badge badge-default"}>${e||"unknown"}</span>`}function Kt({url:t}){const[e,n]=f(!1);return!t||e?ut`<div class="row-thumb-ph">🖨</div>`:ut`<img
    class="row-thumb"
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>n(!0)}
  />`}function Xn({url:t,className:e}){const[n,a]=f(!1);return!t||n?ut`<div class="cover-placeholder">🖨</div>`:ut`<img
    class=${e}
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>a(!0)}
  />`}function Yt({colors:t}){if(!(t!=null&&t.length))return null;const e=[...new Set(t.map(n=>n.slice(0,6).toUpperCase()))].filter(n=>n!=="FFFFFF");return e.length?ut`<span class="swatches"
    >${e.map(n=>ut`<span class="swatch" style=${"background:#"+n} title=${"#"+n} />`)}</span
  >`:null}const Ve=M.bind(x);let vn=()=>{};function I(t,e="info"){vn({message:t,type:e,id:Date.now()+Math.random()})}function Zn(){const[t,e]=f([]),n=mn(new Map);vn=S(s=>{e(r=>[...r,s]);const i=setTimeout(()=>{e(r=>r.filter(u=>u.id!==s.id)),n.current.delete(s.id)},3500);n.current.set(s.id,i)},[]);const a=S(s=>{const i=n.current.get(s);i&&clearTimeout(i),n.current.delete(s),e(r=>r.filter(u=>u.id!==s))},[]);return t.length?Ve`
    <div class="toast-container">
      ${t.map(s=>Ve`
          <div class="toast toast-${s.type}" key=${s.id} onClick=${()=>a(s.id)}>
            ${s.message}
          </div>
        `)}
    </div>
  `:null}const ta=15e3,ea=2e4,na=5,we=[{id:"personal",label:"Personal"},{id:"booth",label:"Booth"},{id:"etsy",label:"Etsy"},{id:"custom",label:"Custom"}];async function aa(t,e){try{const n=await t.json();return typeof n.error=="string"?n.error:e}catch{return e}}function sa(t){const{timeoutMs:e=ta,...n}=t??{};return n.signal||e===null?n:{signal:AbortSignal.timeout(e),...n}}function ia(t,e){return(t==null?void 0:t.name)==="TimeoutError"?new Error(`${e} (request timed out)`):new Error(`${e} (network error)`)}async function G(t,e,n){let a;try{a=await fetch(t,sa(n))}catch(s){throw ia(s,e)}if(!a.ok)throw new Error(await aa(a,e));return await a.json()}async function Ce(t,e,n){try{return{data:await G(t,e,n),error:null}}catch(a){return{data:null,error:a instanceof Error?a:new Error(e)}}}async function pt(t,e,n){const{data:a,error:s}=await Ce(t,e,n);return s?(I(s.message||e,"error"),null):a}async function tt(t,e,n){return pt(t,n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}async function Y(t,e,n,a){return pt(t,n,{...a,method:"POST",headers:{"Content-Type":"application/json",...a==null?void 0:a.headers},body:JSON.stringify(e)})}async function ra(){return(await G("/api/projects","Failed to load projects.")).projects}async function oa(t){return G(`/jobs/${t}`,"Failed to load job details.")}async function ke(){return(await G("/api/products","Failed to load products.")).products}async function la(t){return(await G(`/api/products/${t}`,"Failed to load product.")).product}async function ca(){return(await G("/api/products/print-next","Failed to load print-next products.")).products}async function da(t){const e=await Y("/api/products",t,"Failed to create product.");return(e==null?void 0:e.product)??null}async function ua(t){const e=await Y(`/api/products/from-job/${t}`,{},"Failed to create product from job.");return(e==null?void 0:e.product)??null}async function gn(t){const e=await Y(`/api/products/from-project/${t}`,{},"Failed to create product from project.");return(e==null?void 0:e.product)??null}async function Se(t,e){const n=await tt(`/api/products/${t}`,e,"Failed to update product.");return(n==null?void 0:n.product)??null}async function pa(){return(await G("/api/batches","Failed to load batches.")).batches}async function ma(t){return(await G(`/api/batches/${t}`,"Failed to load batch.")).batch}async function _a(t){const e=await Y("/api/batches",t,"Failed to create batch.");return(e==null?void 0:e.batch)??null}async function $a(t,e){const n=await tt(`/api/batches/${t}`,e,"Failed to update batch.");return(n==null?void 0:n.batch)??null}async function fa(t,e){const n=await Y(`/api/batches/${t}/projects/${e}`,{},"Failed to add project jobs to batch.");return(n==null?void 0:n.batch)??null}function Xt(t){return t!=null}function me(t,e){return(t==null?void 0:t.trim())||e}function va(t){if(!t)return"—";const e=new Date(t);return Number.isNaN(e.getTime())?t:e.toLocaleString()}function _e(t){if(!Xt(t)||t<=0)return"—";const e=Math.round(t/60),n=Math.floor(e/60),a=e%60;return n===0?`${a}m`:a===0?`${n}h`:`${n}h ${a}m`}function $e(t){return!Xt(t)||t<=0?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function hn(t){return Xt(t)?`$${t.toFixed(2)}`:"—"}function R(t,e){return`- ${t}: ${Xt(e)&&e!==""?e:"—"}`}function ga(t){return[`## ${me(t.designTitle,`Print Job #${t.id}`)}`,R("Job ID",t.id),R("Status",t.status),R("Customer",t.customer),R("Printer",t.deviceModel),R("Printed",va(t.startTime)),R("Plates",t.plate_count),R("Print run",t.print_run),R("Filament",$e(t.total_weight_g)),R("Print time",_e(t.total_time_s)),R("Estimated price",hn(t.final_price))].join(`
`)}function bn(t,e=[]){var s;const n=[`## ${me(t.name,`Project #${t.id}`)}`,R("Project ID",t.id),R("Customer",t.customer),R("Jobs",t.job_count??e.length),R("Plates",t.total_plates),R("Filament",$e(t.total_weight_g)),R("Print time",_e(t.total_time_s))],a=(s=t.notes)==null?void 0:s.trim();if(a&&n.push(R("Notes",a)),e.length>0){n.push("","### Prints");for(const i of e)n.push(`- ${me(i.designTitle,`Job #${i.id}`)} — ${$e(i.total_weight_g)}, ${_e(i.total_time_s)}, ${hn(i.final_price)}`)}return n.join(`
`)}async function Ie(t){var e;if(!((e=navigator.clipboard)!=null&&e.writeText))throw new Error("Clipboard API is unavailable in this browser context.");await navigator.clipboard.writeText(t)}const q=M.bind(x);function ha(t){const e=t.toLowerCase();return e.includes("a1 mini")?"/ui/printers/a1-mini":e.includes("p1s")?"/ui/printers/p1s":null}function ba(t){const e=new Map;for(const n of t){const a=n.deviceModel||"Unknown printer",s=e.get(a)??[];s.push(n),e.set(a,s)}return e}function yn(t,e=6){return t.slice().sort((n,a)=>String(a.startTime||"").localeCompare(String(n.startTime||""))).slice(0,e)}function Pn({printerName:t}){const e=ha(t);return e?q`<img class="printer-photo" src=${e} alt=${t} />`:q`<div class="printer-photo">🖨️</div>`}function wn({job:t,onJobClick:e}){return q`
    <article class="printer-job-row" key=${t.id} onClick=${()=>e(t)}>
      <div class="printer-job-top">
        <div class="td-thumb"><${Kt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title">${t.designTitle||"Untitled Job"}</span>
          <${Yt} colors=${t.filament_colors} />
        </div>
        <${Lt} status=${t.status} />
      </div>
      <div class="printer-job-bottom">
        <span>${et(t.startTime)}</span>
        <span>Filament: <strong>${bt(t.total_weight_g)}</strong></span>
        <span>Time: <strong>${nt(t.total_time_s)}</strong></span>
      </div>
    </article>
  `}function ya({row:t,jobs:e,onJobClick:n}){const a=t.deviceModel||"Unknown printer",s=yn(e);return q`
    <section class="printer-card" key=${a}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${Pn} printerName=${a} />
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
        ${s.length?s.map(i=>q`<${wn} key=${i.id} job=${i} onJobClick=${n} />`):q`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function Pa({printer:t,jobs:e,onJobClick:n,onToggleActive:a}){const s=t.name||t.model||t.provider_printer_id,i=yn(e),r=t.is_active===1;return q`
    <section class=${"printer-card"+(r?"":" is-retired")} key=${t.id}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${Pn} printerName=${t.model||s} />
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
            ${t.retired_at?q`<p class="printer-meta">Retired ${et(t.retired_at)}</p>`:null}
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
        ${i.length?i.map(u=>q`<${wn} key=${u.id} job=${u} onJobClick=${n} />`):q`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function wa(t,e){return e.filter(n=>n.printer_id===t.id)}function Ca({summary:t,jobs:e,onJobClick:n}){const[a,s]=f([]);O(()=>{pt("/printers","Failed to load printer inventory.").then(l=>{l&&s(l.printers)})},[]);const i=async l=>{const p=await tt(`/printers/${l.id}`,{is_active:l.is_active!==1},"Failed to update printer inventory.");p!=null&&p.printer&&s(d=>d.map(o=>o.id===l.id?p.printer:o))};if(a.length)return q`
      <div class="printer-grid">
        ${a.map(l=>q`<${Pa}
              key=${l.id}
              printer=${l}
              jobs=${wa(l,e)}
              onJobClick=${n}
              onToggleActive=${i}
            />`)}
      </div>
    `;const r=(t==null?void 0:t.by_device)??[];if(!r.length)return q`<div class="empty">No printer totals available yet.</div>`;const u=ba(e);return q`
    <div class="printer-grid">
      ${r.map(l=>q`<${ya}
            key=${l.deviceModel||"Unknown printer"}
            row=${l}
            jobs=${u.get(l.deviceModel||"Unknown printer")??[]}
            onJobClick=${n}
          />`)}
    </div>
  `}const J=M.bind(x);function ka(t){return!t.startsWith("/projects")&&!t.startsWith("/admin")&&!t.startsWith("/printers")&&!t.startsWith("/catalog")&&!t.startsWith("/products")&&!t.startsWith("/batches")}function Sa(t,e){const n=new URLSearchParams;t&&n.set("status",t),e&&n.set("device",e);const a=n.toString();return"/jobs/export.csv"+(a?"?"+a:"")}function Ia(t){return t.reduce((e,n)=>(e.weight+=n.total_weight_g||0,e.time+=n.total_time_s||0,e),{weight:0,time:0})}function Fa(t){return!t||t==="actual"?null:t==="slicer_estimate"?"estimate":t==="manual"?"manual":"unknown"}function Cn({confidence:t}){const e=Fa(t);return e?J`<span class="usage-confidence">${e}</span>`:null}const Ta=[{label:"Jobs",path:"/",active:ka},{label:"Projects",path:"/projects",active:t=>t.startsWith("/projects")},{label:"Printers",path:"/printers",active:t=>t.startsWith("/printers")},{label:"Products",path:"/products/pipeline",active:t=>t.startsWith("/products")},{label:"Batches",path:"/batches",active:t=>t.startsWith("/batches")},{label:"Catalog",path:"/catalog",active:t=>t.startsWith("/catalog")},{label:"Rates",path:"/admin",active:t=>t.startsWith("/admin")}],Na=[["","All Statuses"],["finish","Finished"],["cancel","Cancelled"],["running","Running"],["failed","Failed"],["pause","Paused"]];function se(t,e){const n=(t==null?void 0:t.by_device)??[];return n.length?n.map(a=>{const s=a.deviceModel||"Unknown printer";return e==="jobs"?`${s}: ${(a.total_jobs??0).toLocaleString()} jobs`:e==="plates"?`${s}: ${(a.total_plates??0).toLocaleString()} plates`:`${s}: ${((a.total_time_s??0)/3600).toFixed(1).toLocaleString()} h`}).join(`
`):"No printer breakdown available"}function xa({loc:t,navigate:e}){return J`<nav class="top-nav">
    ${Ta.map(n=>{const a=n.active(t);return J`
        <button
          key=${n.label}
          class=${"nav-btn"+(a?" active":"")}
          onClick=${()=>e(n.path)}
        >
          ${n.label}
        </button>
      `})}
  </nav>`}function La({summary:t}){var n,a;const e=t==null?void 0:t.totals;return J`
    <div class="stats">
      <div class="stat" title=${se(t,"jobs")}>
        <div class="stat-val">${e?(n=e.total_jobs)==null?void 0:n.toLocaleString():"—"}</div>
        <div class="stat-lbl">Total Jobs</div>
      </div>
      <div class="stat">
        <div class="stat-val">${e?((e.total_weight_g??0)/1e3).toFixed(2):"—"}</div>
        <div class="stat-lbl">Filament kg</div>
      </div>
      <div class="stat" title=${se(t,"hours")}>
        <div class="stat-val">${e?((e.total_time_s??0)/3600).toFixed(1):"—"}</div>
        <div class="stat-lbl">Print Hours</div>
      </div>
      <div class="stat" title=${se(t,"plates")}>
        <div class="stat-val">${e?(a=e.total_plates)==null?void 0:a.toLocaleString():"—"}</div>
        <div class="stat-lbl">Plates</div>
      </div>
    </div>
  `}function Ma({summary:t,dataRange:e}){const[n,a]=be(),s=!!(e!=null&&e.min_start&&(e!=null&&e.max_start)),i=(e==null?void 0:e.min_start)??"",r=(e==null?void 0:e.max_start)??"";return J`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>PrintWorks</span></h1>
        ${s&&J`<div class="header-range">
          History: ${et(i)} → ${et(r)}
          (${((e==null?void 0:e.task_count)||0).toLocaleString()} tasks)
        </div>`}
        <${xa} loc=${n} navigate=${a} />
      </div>
      <${La} summary=${t} />
    </header>
  `}function ja({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:s,setDeviceFilter:i,devices:r,view:u,setView:l,density:p,setDensity:d,filteredCount:o,totalCount:c}){const m=V(()=>Sa(n,s),[n,s]);return J`
    <div class="toolbar">
      <input
        type="search"
        placeholder="Search title or customer…"
        value=${t}
        onInput=${v=>e(v.target.value)}
      />
      <select
        value=${n}
        onChange=${v=>a(v.target.value)}
      >
        ${Na.map(([v,y])=>J`<option key=${v} value=${v}>${y}</option> `)}
      </select>
      <select
        value=${s}
        onChange=${v=>i(v.target.value)}
      >
        <option value="">All Printers</option>
        ${r.map(v=>J`<option key=${v} value=${v}>${v}</option> `)}
      </select>
      <div class="view-toggle">
        <button
          class=${"view-btn"+(u==="table"?" active":"")}
          onClick=${()=>l("table")}
        >
          ☰ Table
        </button>
        <button
          class=${"view-btn"+(u==="grid"?" active":"")}
          onClick=${()=>l("grid")}
        >
          ⊞ Grid
        </button>
      </div>
      <div class="toolbar-right">
        <div class="density-toggle">
          <button
            class=${"density-btn"+(p==="compact"?" active":"")}
            onClick=${()=>d("compact")}
          >
            Compact
          </button>
          <button
            class=${"density-btn"+(p==="comfy"?" active":"")}
            onClick=${()=>d("comfy")}
          >
            Comfy
          </button>
        </div>
        <a class="btn-csv" href=${m} download>↓ CSV</a>
        <span class="job-count">${o} / ${c} jobs</span>
      </div>
    </div>
  `}function Da({filtered:t,isFiltered:e}){if(!e||!t.length)return null;const n=Ia(t);return J`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${t.length}</strong></span>
      <span>Filament: <strong>${Pe(n.weight)}</strong></span>
      <span>Print time: <strong>${nt(n.time)}</strong></span>
    </div>
  `}function kn({printRun:t}){return(t??1)<=1?null:J`<span class="run-badge">Run ${t}</span>`}function Ja(t,e){return t?e==="asc"?" ↑":" ↓":""}function Ea({sortCol:t,sortDir:e,onSort:n}){return J`<div class="jobs-record-sortbar">
    <span class="jobs-record-sort-label">Sort</span>
    ${[{col:"startTime",label:"Date"},{col:"designTitle",label:"Title"},{col:"deviceModel",label:"Printer"},{col:"total_weight_g",label:"Filament"},{col:"total_time_s",label:"Time"},{col:"final_price",label:"Price"}].map(({col:s,label:i})=>{const r=t===s;return J`
        <button
          key=${s}
          class=${"jobs-record-sort-btn"+(r?" active":"")}
          onClick=${()=>n(s)}
        >
          ${i}${Ja(r,e)}
        </button>
      `})}
  </div>`}async function Sn(t,e){e.stopPropagation();try{await Ie(ga(t)),I("Print details copied.","success")}catch(n){I(n instanceof Error?n.message:"Failed to copy print details.","error")}}function Ba({job:t,onJobClick:e}){return J`
    <article class="jobs-record-row" onClick=${()=>e(t)}>
      <div class="jobs-record-top">
        <div class="td-thumb"><${Kt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title" title=${t.designTitle||"Untitled"}
            >${t.designTitle||"Untitled Job"}</span
          >
          <${kn} printRun=${t.print_run} />
          <${Yt} colors=${t.filament_colors} />
        </div>
        <div><${Lt} status=${t.status} /></div>
      </div>
      <div class="jobs-record-bottom">
        <span>🖨 ${t.deviceModel||"—"}</span>
        <span title=${ye(t.startTime)}>📅 ${et(t.startTime)}</span>
        <span
          >🧵 <strong>${bt(t.total_weight_g)}</strong>
          <${Cn} confidence=${t.material_usage_confidence} />
        </span>
        <span>⏱ <strong>${nt(t.total_time_s)}</strong></span>
        <span
          >💰
          <strong
            >${t.final_price!==null&&t.final_price!==void 0?A(t.final_price):"—"}</strong
          ></span
        >
        <span>🧱 <strong>${t.plate_count??"—"}</strong></span>
        ${t.customer?J`<span class="customer-pill">${t.customer}</span>`:null}
        <button
          class="btn-secondary btn-compact"
          type="button"
          onClick=${n=>Sn(t,n)}
        >
          Copy
        </button>
      </div>
    </article>
  `}function Ua({sorted:t,sortCol:e,sortDir:n,onSort:a,onJobClick:s,density:i}){return J`
    <div class=${"jobs-record-list-wrap density-"+i}>
      <${Ea} sortCol=${e} sortDir=${n} onSort=${a} />
      <div class="jobs-record-list">
        ${t.map(r=>J`<${Ba} key=${r.id} job=${r} onJobClick=${s} />`)}
      </div>
    </div>
  `}function Aa({job:t,onJobClick:e}){const n=async a=>{a.stopPropagation();const s=await ua(t.id);s&&I(`Created product: ${s.name}`,"success")};return J`
    <div class="card" onClick=${()=>e(t)}>
      <${Xn} url=${t.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${t.designTitle||"Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${t.deviceModel||"—"}</span>
          <span>📅 ${et(t.startTime)}</span>
          <span>⏱ ${nt(t.total_time_s)}</span>
          <span
            >🧵 ${bt(t.total_weight_g)}
            <${Cn} confidence=${t.material_usage_confidence} />
          </span>
          ${t.final_price!==null&&t.final_price!==void 0&&J`<span>💰 ${A(t.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${Lt} status=${t.status} />
          <${kn} printRun=${t.print_run} />
          ${t.customer&&J`<span class="customer-pill">${t.customer}</span>`}
          <${Yt} colors=${t.filament_colors} />
          <button
            class="btn-secondary btn-compact"
            type="button"
            onClick=${a=>Sn(t,a)}
          >
            Copy
          </button>
          <button class="btn-secondary btn-compact" type="button" onClick=${n}>
            Create product
          </button>
        </div>
      </div>
    </div>
  `}function Ra({sorted:t,onJobClick:e,density:n}){return J`
    <div class=${"grid-view density-"+n}>
      ${t.map(a=>J`<${Aa} key=${a.id} job=${a} onJobClick=${e} />`)}
    </div>
  `}function Fe(t){O(()=>{const e=n=>{n.key==="Escape"&&t()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[t])}const Q=M.bind(x);function Oa(t){return t==="actual"?"actual usage":t==="slicer_estimate"?"slicer estimate":t==="manual"?"manual entry":"unknown confidence"}function Ha({jobId:t}){const[e,n]=f(null);if(O(()=>{let i=!0;return n(null),Ce(`/jobs/${t}/price`,"Pricing not configured").then(({data:r})=>{i&&n(r??!1)}).catch(()=>{i&&n(!1)}),()=>{i=!1}},[t]),e===null)return Q`<div class="pricing-row pricing-loading">Loading price…</div>`;if(e===!1)return Q`<div class="pricing-row pricing-na">Pricing not configured</div>`;const a=e.final_price-e.base_price,s=e.base_price>0?Math.round(a/e.base_price*100):0;return Q`
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Material</span><span>${A(e.material_cost)}</span>
      </div>
      <div class="pricing-row">
        <span>Machine</span><span>${A(e.machine_cost)}</span>
      </div>
      <div class="pricing-row"><span>Labor</span><span>${A(e.labor_cost)}</span></div>
      ${e.extra_labor_cost>0&&Q`
        <div class="pricing-row pricing-extra-labor">
          <span>Extra labor</span><span>${A(e.extra_labor_cost)}</span>
        </div>
      `}
      <div class="pricing-divider"></div>
      <div class="pricing-row pricing-base">
        <span>Base</span><span>${A(e.base_price)}</span>
      </div>
      ${a!==0&&Q`
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
          >Final${e.is_override?Q`<span class="override-tag">override</span>`:""}</span
        >
        <span>${A(e.final_price)}</span>
      </div>
    </div>
  `}const qa=["finish","failed","cancel","running","pause"];function Wa({job:t,onClose:e,onPatch:n,projects:a,onJobProjectChange:s,onJobStatusChange:i,onJobExtraLaborChange:r,onNavigateToProject:u}){const[l,p]=f(t.customer??""),[d,o]=f(t.notes??""),[c,m]=f(t.price_override!=null?String(t.price_override):"");Fe(e);const v=S(_=>{const g=_.target.value;s(t.id,g===""?null:Number(g))},[t.id,s]),y=S(_=>{const g=_.target.value;i(t.id,g===""?null:g)},[t.id,i]);return Q`
    <div class="overlay" onClick=${_=>_.target===_.currentTarget&&e()}>
      <div class="modal">
        <div class="modal-header">
          <h2>${t.designTitle||"Untitled Job"}</h2>
          <button class="modal-close" onClick=${e}>✕</button>
        </div>
        ${t.cover_url&&Q`<img class="modal-img" src=${t.cover_url} alt="" />`}
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Status</label>
              <div class="detail-val">
                <${Lt} status=${t.status} />
                ${t.status_override&&Q`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item">
              <label>Printer</label>
              <div class="detail-val">${t.deviceModel||"—"}</div>
            </div>
            <div class="detail-item">
              <label>Started</label>
              <div class="detail-val">${ye(t.startTime)}</div>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <div class="detail-val">${nt(t.total_time_s)}</div>
            </div>
            <div class="detail-item">
              <label>Filament</label>
              <div class="detail-val">
                ${bt(t.total_weight_g)}
                <span class="usage-confidence"
                  >${Oa(t.material_usage_confidence)}</span
                >
                <${Yt} colors=${t.filament_colors} />
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
          <${Ha} jobId=${t.id} key=${t.id+"-"+t.extra_labor_minutes} />
          <div class="modal-project-row">
            <label class="modal-project-label">Customer</label>
            <input
              class="modal-project-select"
              type="text"
              placeholder="—"
              value=${l}
              onInput=${_=>p(_.target.value)}
              onBlur=${()=>n(t.id,{customer:l.trim()||null})}
              onKeyDown=${_=>_.key==="Enter"&&_.target.blur()}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Notes</label>
            <textarea
              class="modal-project-select modal-notes"
              placeholder="—"
              value=${d}
              onInput=${_=>o(_.target.value)}
              onBlur=${()=>n(t.id,{notes:d.trim()||null})}
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
              value=${c}
              onInput=${_=>m(_.target.value)}
              onBlur=${()=>{const _=c===""?null:Number(c);n(t.id,{price_override:_})}}
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
              onChange=${_=>{const g=_.target.value===""?null:Number(_.target.value);r(t.id,g)}}
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
              ${qa.map(_=>Q`<option key=${_} value=${_}>${_}</option>`)}
            </select>
          </div>
          ${a&&Q`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select
                class="modal-project-select"
                value=${t.project_id??""}
                onChange=${v}
              >
                <option value="">— None —</option>
                ${a.map(_=>Q`<option key=${_.id} value=${_.id}>${_.name}</option>`)}
              </select>
              ${t.project_id!=null&&Q`
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
  `}const U=M.bind(x);function wt(t){return t!=null}function Qa({project:t,totalPrice:e,onClick:n,onRename:a}){const s=t.total_weight_g,i=t.total_time_s,r=async l=>{l.stopPropagation();const p=await gn(t.id);p&&I(`Created product: ${p.name}`,"success")},u=async l=>{l.stopPropagation();try{await Ie(bn(t)),I("Project details copied.","success")}catch(p){I(p instanceof Error?p.message:"Failed to copy project details.","error")}};return U`
    <div class="proj-card" onClick=${n}>
      ${t.cover_url?U`<img class="proj-card-cover" src=${t.cover_url} alt="" />`:U`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-title-row">
        <div class="proj-card-name">${t.name}</div>
      </div>
      <div class="proj-card-actions">
        <button
          type="button"
          class="btn-secondary proj-card-action"
          onClick=${l=>{l.stopPropagation(),a(t)}}
        >
          Rename
        </button>
        <button type="button" class="btn-secondary proj-card-action" onClick=${u}>
          Copy
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
        ${wt(t.total_plates)&&U`<span>
          <strong>${t.total_plates}</strong> plate${t.total_plates!==1?"s":""}
        </span>`}
        ${wt(s)&&U`<span>${Pe(s)}</span>`}
        ${wt(i)&&U`<span>${nt(i)}</span>`}
        ${wt(e)&&U`<span class="proj-card-price">${A(e)}</span>`}
      </div>
      ${t.notes&&U`<div class="proj-card-notes">${t.notes}</div>`}
    </div>
  `}function Va({price:t}){return t?U`
    <span>Material: <strong>${A(t.material_cost)}</strong></span>
    <span>Machine: <strong>${A(t.machine_cost)}</strong></span>
    <span>Labor: <strong>${A(t.labor_cost)}</strong></span>
    ${t.extra_labor_cost>0&&U`<span>Extra labor: <strong>${A(t.extra_labor_cost)}</strong></span>`}
    <span class="totals-total">Total: <strong>${A(t.final_price)}</strong></span>
  `:null}function Ga({jobs:t,onJobClick:e,onRemoveJob:n,onMoveToNewProject:a}){return t.length===0?U`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`:U`
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
                <td class="td-thumb"><${Kt} url=${s.cover_url} /></td>
                <td class="td-title">
                  <span class="row-title">${s.designTitle||"Untitled Job"}</span>
                </td>
                <td>${s.deviceModel||"—"}</td>
                <td title=${ye(s.startTime)}>${et(s.startTime)}</td>
                <td><${Lt} status=${s.status} /></td>
                <td class="td-num"><strong>${s.plate_count??1}</strong></td>
                <td class="td-num"><strong>${bt(s.total_weight_g)}</strong></td>
                <td class="td-num">${nt(s.total_time_s)}</td>
                <td class="td-num">
                  ${wt(s.final_price)?U`<strong>${A(s.final_price)}</strong>`:"—"}
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
  `}function za({loading:t,filtered:e,q:n,projectPrices:a,navigate:s,onRename:i}){return t?U`<div class="empty">Loading projects…</div>`:e.length===0?U`<div class="empty">${n?"No projects match your search.":"No projects yet. Create one to group related jobs together."}</div>`:U`
    <div class="proj-grid">
      ${e.map(r=>U`<${Qa}
            key=${r.id}
            project=${r}
            totalPrice=${a[r.id]??null}
            onClick=${()=>s(`/projects/${r.id}`)}
            onRename=${i}
          />`)}
    </div>
  `}const Ka=M.bind(x);function Ya({job:t,initialName:e,onClose:n,onProjectCreated:a,onMoveJobToProject:s,onNavigateToProject:i}){const[r,u]=f(e),l=S(async()=>{const p=r.trim();if(!p)return;const d=await Y("/projects",{name:p,customer:t.customer??null,notes:null},"Failed to create project.");d!=null&&d.project&&(a(d.project),s(t.id,d.project.id),i(d.project.id),n())},[t.customer,t.id,r,n,s,i,a]);return Ka`<div class="modal-backdrop" onClick=${n}>
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
          onClick=${l}
        >
          Create and move
        </button>
      </div>
    </div>
  </div>`}const Xa=M.bind(x);function Za({project:t,onClose:e,onRenamed:n}){const[a,s]=f(t.name??""),[i,r]=f(!1),u=S(async()=>{const l=a.trim();if(l){r(!0);try{const p=await tt(`/projects/${t.id}`,{name:l},"Failed to rename project."),d=p==null?void 0:p.project;if(!d)return;n(d),e()}finally{r(!1)}}},[a,e,n,t.id]);return Xa`<div class="modal-backdrop" onClick=${e}>
    <div class="modal-card" onClick=${l=>l.stopPropagation()}>
      <h3>Rename project</h3>
      <p class="modal-subtle">${t.name}</p>
      <label>
        Project name
        <input
          value=${a}
          onInput=${l=>s(l.target.value)}
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
  </div>`}function ts(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>[a.name,a.customer,a.notes].filter(Boolean).join(" ").toLowerCase().includes(n))}function es(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>`${a.designTitle||""} ${a.customer||""}`.toLowerCase().includes(n))}function ns(t,e,n){return`${n?`${e.length} of ${t.length}`:String(t.length)} project${t.length!==1?"s":""}`}function as(t,e){return t.some(n=>n.id===e.id)?t.map(n=>n.id===e.id?{...n,...e}:n):[e,...t]}function ss(t){const e=new Map;let n=0;for(const l of t){if(l.plateIndex===null){n+=1;continue}e.set(l.plateIndex,(e.get(l.plateIndex)??0)+1)}const a=[...e.keys()].sort((l,p)=>l-p),s=a[0]??null,i=a.at(-1)??null,r=a.filter(l=>(e.get(l)??0)>1),u=[];if(s!==null&&i!==null)for(let l=s;l<=i;l+=1)e.has(l)||u.push(l);return{printedCount:t.length,uniquePlateCount:a.length,observedStart:s,observedEnd:i,duplicatePlateIndexes:r,missingPlateIndexes:u,unknownPlateIndexCount:n,isContiguous:u.length===0}}function is(t,e){if(t===0){I("No ungrouped jobs found — everything is already assigned to a project.","info");return}I(`Created ${t} project${t!==1?"s":""}, assigned ${e} job${e!==1?"s":""}.`,"success")}function rs(t){return t.reduce((e,n)=>e+(n.total_weight_g||0),0)}function os(t){return t.reduce((e,n)=>e+(n.total_time_s||0),0)}function ls(t){return t.reduce((e,n)=>e+(n.plate_count||0),0)}const Ct=M.bind(x);function In(t){return e=>{e.target===e.currentTarget&&t()}}function cs({onClose:t,onCreate:e}){const[n,a]=f(""),[s,i]=f(""),[r,u]=f(""),[l,p]=f(!1);Fe(t);const d=S(async o=>{if(o.preventDefault(),!!n.trim()){p(!0);try{const c=await Y("/projects",{name:n.trim(),customer:s||null,notes:r||null},"Failed to create project.");if(!(c!=null&&c.project))return;e(c.project),t()}finally{p(!1)}}},[n,s,r,e,t]);return Ct`
    <div class="overlay" onClick=${In(t)}>
      <div class="modal">
        <div class="modal-header">
          <h2>New Project</h2>
          <button class="modal-close" onClick=${t}>✕</button>
        </div>
        <div class="modal-body">
          <form class="project-form" onSubmit=${d}>
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
              <button type="submit" class="btn-primary" disabled=${l||!n.trim()}>
                ${l?"Creating…":"Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `}function ds({unassignedJobs:t,onClose:e,onAdd:n}){const[a,s]=f("");Fe(e);const i=V(()=>es(t,a),[t,a]);return Ct`
    <div class="overlay" onClick=${In(e)}>
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
          ${i.length===0?Ct`<div class="empty" style="padding:16px 0">
                ${a?"No matches.":"All jobs are already assigned to projects."}
              </div>`:Ct`<div class="add-jobs-list">
                ${i.map(r=>Ct`
                    <div class="add-jobs-row" key=${r.id} onClick=${()=>n(r.id)}>
                      <${Kt} url=${r.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${r.designTitle||"Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${et(r.startTime)} · ${r.deviceModel||"—"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `)}
              </div>`}
        </div>
      </div>
    </div>
  `}const Jt=new Map;function us(t,e){const[n,a]=f(()=>Jt.get(t)??null);return O(()=>{if(a(Jt.get(t)??null),!e){Jt.delete(t),a(null);return}let s=!1;return pt(`/projects/${t}/price`,"Failed to load project price.").then(i=>{!i||s||(Jt.set(t,i),a(i))}),()=>{s=!0}},[t,e]),n}const W=M.bind(x);function Ge(t){return t.length?t.join(", "):"none"}function ps({plates:t}){if(t.length===0)return null;const e=ss(t),n=e.observedStart===null||e.observedEnd===null?"unknown":`${e.observedStart}–${e.observedEnd}`;return W`<section class="admin-section project-plate-coverage">
    <h3 class="admin-section-title">Plate coverage</h3>
    <div class="totals-bar">
      <span>Printed plates: <strong>${e.printedCount}</strong></span>
      <span>Unique plate numbers: <strong>${e.uniquePlateCount}</strong></span>
      <span>Observed range: <strong>${n}</strong></span>
      <span
        >Missing in range:
        <strong>${Ge(e.missingPlateIndexes)}</strong></span
      >
      <span
        >Reprinted: <strong>${Ge(e.duplicatePlateIndexes)}</strong></span
      >
      ${e.unknownPlateIndexCount>0&&W`<span>Unknown plate #: <strong>${e.unknownPlateIndexCount}</strong></span>`}
    </div>
    <p class="helper-text">
      This shows what PrintWorks has seen in print history. It can detect gaps within observed plate
      numbers, but it cannot prove a model is complete unless the expected plate count is known.
    </p>
  </section>`}function ms({plates:t,loading:e}){return e?W`<div class="empty">Loading project plates…</div>`:t.length===0?null:W`<section class="admin-section project-plates-section">
    <h3 class="admin-section-title">Plates</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Plate</th>
            <th>Print</th>
            <th>Status</th>
            <th>Date</th>
            <th class="td-num">Filament</th>
            <th class="td-num">Time</th>
          </tr>
        </thead>
        <tbody>
          ${t.map(n=>W`<tr key=${n.id}>
                <td class="td-title">
                  <span class="row-title"
                    >${n.title||`Plate ${n.plateIndex??"—"}`}</span
                  >
                </td>
                <td>${n.jobTitle||`Job #${n.jobId}`}</td>
                <td>${n.status||"—"}</td>
                <td title=${n.startTime||""}>${et(n.startTime)}</td>
                <td class="td-num"><strong>${bt(n.weight)}</strong></td>
                <td class="td-num">${nt(n.costTime)}</td>
              </tr>`)}
        </tbody>
      </table>
    </div>
  </section>`}function _s({project:t,jobs:e,unassignedJobs:n,onBack:a,onJobClick:s,onAddJob:i,onRemoveJob:r,onProjectUpdated:u,onMoveJobToProject:l,onNavigateToProject:p}){const[d,o]=f(!1),[c,m]=f(!1),[v,y]=f(null),[_,g]=f(t.name??""),[$,b]=f(t.customer??""),[P,k]=f(t.notes??""),[h,w]=f([]),[F,T]=f(!1),H=t.job_count??e.length,at=us(t.id,H),ct=rs(e),Ln=os(e),Mn=ls(e),Me=mn(new Map),Zt=V(()=>{for(const C of e)C.final_price!==null&&C.final_price!==void 0&&Me.current.set(C.id,C.final_price);return e.map(C=>{if(C.final_price!==null&&C.final_price!==void 0)return C;const Mt=Me.current.get(C.id);return Mt==null?C:{...C,final_price:Mt}})},[e]);O(()=>{let C=!1;return(async()=>{if(e.length===0){w([]);return}T(!0);try{const jt=await Promise.all(e.map(yt=>oa(yt.id)));if(C)return;w(jt.flatMap(yt=>{const te=e.find(ee=>ee.id===yt.job.id);return yt.plates.map(ee=>({...ee,jobId:yt.job.id,jobTitle:(te==null?void 0:te.designTitle)??null}))}))}catch(jt){C||I(jt instanceof Error?jt.message:"Failed to load project plates.","error")}finally{C||T(!1)}})(),()=>{C=!0}},[e]);const jn=S(C=>i(C),[i]),Dn=S(async()=>{const C=await gn(t.id);C&&I(`Created product: ${C.name}`,"success")},[t.id]),Jn=S(async()=>{try{await Ie(bn(t,Zt)),I("Project details copied.","success")}catch(C){I(C instanceof Error?C.message:"Failed to copy project details.","error")}},[Zt,t]),En=S(async()=>{const C=await tt(`/projects/${t.id}`,{name:_.trim(),customer:$.trim()||null,notes:P.trim()||null},"Failed to update project.");C!=null&&C.project&&(u(C.project),m(!1))},[$,_,P,u,t.id]);return W`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${a}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${t.name}</h2>
          ${t.customer&&W`<span class="customer-pill">${t.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${()=>m(C=>!C)}>
          ${c?"Cancel edit":"Edit project"}
        </button>
        <button class="btn-secondary" onClick=${Jn}>Copy details</button>
        <button class="btn-secondary" onClick=${Dn}>Create product</button>
        <button class="btn-secondary" onClick=${()=>o(!0)}>+ Add Jobs</button>
      </div>
      ${c&&W`<div class="modal-form proj-detail-notes">
        <label>
          Project name
          <input
            value=${_}
            onInput=${C=>g(C.target.value)}
          />
        </label>
        <label>
          Customer
          <input
            value=${$}
            onInput=${C=>b(C.target.value)}
          />
        </label>
        <label>
          Notes
          <textarea
            value=${P}
            onInput=${C=>k(C.target.value)}
          />
        </label>
        <button class="btn-primary" disabled=${!_.trim()} onClick=${En}>
          Save project
        </button>
      </div>`}
      ${t.notes&&W`<div class="proj-detail-notes">${t.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Print runs: <strong>${H}</strong></span>
        <span>Plates: <strong>${Mn}</strong></span>
        <span>Filament: <strong>${Pe(ct)}</strong></span>
        <span>Print time: <strong>${nt(Ln)}</strong></span>
        <${Va} price=${at} />
      </div>
      <${Ga}
        jobs=${Zt}
        onJobClick=${s}
        onRemoveJob=${r}
        onMoveToNewProject=${y}
      />
      <${ps} plates=${h} />
      <${ms} plates=${h} loading=${F} />
      ${d&&W`<${ds}
        unassignedJobs=${n}
        onClose=${()=>o(!1)}
        onAdd=${jn}
      />`}
      ${v&&W`<${Ya}
        job=${v}
        initialName=${v.designTitle||""}
        onClose=${()=>y(null)}
        onProjectCreated=${u}
        onMoveJobToProject=${l}
        onNavigateToProject=${p}
      />`}
    </div>
  `}function $s({projects:t,setProjects:e,onAutoGroup:n,projectPrices:a,loading:s=!1}){const[i,r]=f(!1),[u,l]=f(!1),[p,d]=f(null),[o,c]=f(""),[,m]=be(),v=S(async()=>{l(!0);try{const g=await Y("/projects/auto-group",{},"Auto-group failed.");if(!g)return;const{projects_created:$,jobs_assigned:b}=g;await n(),is($,b)}finally{l(!1)}},[n]),y=S(g=>{e($=>[g,...$]),m(`/projects/${g.id}`)},[e,m]),_=V(()=>ts(t,o),[t,o]);return W`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${o}
        onInput=${g=>c(g.target.value)}
      />
      <span class="proj-list-count">${ns(t,_,o)}</span>
      <button class="btn-secondary" onClick=${v} disabled=${u}>
        ${u?"Grouping…":"⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${()=>r(!0)}>+ New Project</button>
    </div>
    <${za}
      loading=${s}
      filtered=${_}
      q=${o}
      projectPrices=${a}
      navigate=${m}
      onRename=${d}
    />
    ${i&&W`<${cs} onClose=${()=>r(!1)} onCreate=${y} />`}
    ${p&&W`<${Za}
      project=${p}
      onClose=${()=>d(null)}
      onRenamed=${g=>e($=>as($,g))}
    />`}
  `}const K=M.bind(x),fs=2e3;function ze(t,e,n){const a=e(n);return t.map(s=>e(s)===a?n:s)}function vs(t){return t==="saving"?"Saving…":t==="saved"?"✓ Saved":"Save"}function gs(t,e,n){return t===n?"saving":e===n?"saved":"idle"}function hs(t){const[e,n]=f(""),[a,s]=f(""),i=l=>{s(l),setTimeout(()=>s(""),fs)};return{runSave:async(l,p)=>{n(l);try{if(!await p())return;i(l),t()}finally{n("")}},getStateFor:l=>gs(e,a,l)}}function z({label:t,value:e,onChange:n,step:a="0.01",min:s="0"}){return K`
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
  `}function Te({state:t}){return K`<button type="submit" class="btn-primary" disabled=${t==="saving"}>
    ${vs(t)}
  </button>`}function mt({title:t,description:e,children:n}){return K`
    <section class="admin-section">
      <h3 class="admin-section-title">${t}</h3>
      <p class="admin-section-desc">${e}</p>
      ${n}
    </section>
  `}function bs({labor:t,saveState:e,onSave:n}){const[a,s]=f(t);return O(()=>s(t),[t]),K`
    <form class="admin-card" onSubmit=${i=>(i.preventDefault(),n(a))}>
      <div class="admin-card-fields">
        <${z}
          label="Hourly rate ($)"
          value=${a.hourly_rate}
          step="0.5"
          onChange=${i=>s({...a,hourly_rate:i})}
        />
        <${z}
          label="Minimum labor minutes"
          value=${a.minimum_minutes}
          step="1"
          onChange=${i=>s({...a,minimum_minutes:i})}
        />
        <${z}
          label="Profit markup (%)"
          value=${a.profit_markup_pct*100}
          step="1"
          onChange=${i=>s({...a,profit_markup_pct:i/100})}
        />
        <${z}
          label="Failure buffer (%)"
          value=${a.failure_buffer_pct*100}
          step="1"
          onChange=${i=>s({...a,failure_buffer_pct:i/100})}
        />
        <${z}
          label="Overhead buffer (%)"
          value=${a.overhead_buffer_pct*100}
          step="1"
          onChange=${i=>s({...a,overhead_buffer_pct:i/100})}
        />
      </div>
      <div class="admin-card-actions"><${Te} state=${e} /></div>
    </form>
  `}function ys({machine:t,saveState:e,onSave:n}){const[a,s]=f(t);O(()=>s(t),[t]);const i=a.purchase_price/a.lifetime_hrs+a.electricity_rate+a.maintenance_buffer;return K`
    <form class="admin-card" onSubmit=${r=>(r.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.device_model}</div>
      <div class="admin-card-fields">
        <${z}
          label="Purchase price ($)"
          value=${a.purchase_price}
          step="1"
          onChange=${r=>s({...a,purchase_price:r})}
        />
        <${z}
          label="Lifetime (hours)"
          value=${a.lifetime_hrs}
          step="100"
          min="1"
          onChange=${r=>s({...a,lifetime_hrs:r})}
        />
        <${z}
          label="Electricity ($/hr)"
          value=${a.electricity_rate}
          step="0.01"
          onChange=${r=>s({...a,electricity_rate:r})}
        />
        <${z}
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
        <div class="admin-card-actions"><${Te} state=${e} /></div>
      </div>
    </form>
  `}function Ps({material:t,saveState:e,onSave:n}){const[a,s]=f(t);O(()=>s(t),[t]);const i=a.cost_per_g*(1+a.waste_buffer_pct);return K`
    <form class="admin-card" onSubmit=${r=>(r.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.filament_type}</div>
      <div class="admin-card-fields">
        <${z}
          label="Cost per gram ($/g)"
          value=${a.cost_per_g}
          step="0.001"
          onChange=${r=>s({...a,cost_per_g:r})}
        />
        <${z}
          label="Waste buffer (%)"
          value=${a.waste_buffer_pct*100}
          step="1"
          onChange=${r=>s({...a,waste_buffer_pct:r/100})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">Computed rate: <strong>${A(i)}</strong>/g</div>
        <div class="admin-card-actions"><${Te} state=${e} /></div>
      </div>
    </form>
  `}function ws({onRatesChanged:t=()=>{}}){const[e,n]=f(null),{runSave:a,getStateFor:s}=hs(t);O(()=>{pt("/rates","Failed to load rates.").then(o=>{o&&n(o)})},[]);const i=async o=>{await a("labor",async()=>{const c=await tt("/rates/labor",o,"Failed to save labor rates."),m=c==null?void 0:c.labor_config;return m?(n(v=>v&&{...v,labor_config:m}),!0):!1})},r=async o=>{const{device_model:c,purchase_price:m,lifetime_hrs:v,electricity_rate:y,maintenance_buffer:_}=o;await a(c,async()=>{const g=await tt(`/rates/machines/${encodeURIComponent(c)}`,{purchase_price:m,lifetime_hrs:v,electricity_rate:y,maintenance_buffer:_},"Failed to save machine rate."),$=g==null?void 0:g.machine_rate;return $?(n(b=>b&&{...b,machine_rates:ze(b.machine_rates,P=>P.device_model,$)}),!0):!1})},u=async o=>{const{filament_type:c,cost_per_g:m,waste_buffer_pct:v}=o;await a(c,async()=>{const y=await tt(`/rates/materials/${encodeURIComponent(c)}`,{cost_per_g:m,waste_buffer_pct:v},"Failed to save material rate."),_=y==null?void 0:y.material_rate;return _?(n(g=>g&&{...g,material_rates:ze(g.material_rates,$=>$.filament_type,_)}),!0):!1})};if(!e)return K`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;const{labor_config:l,machine_rates:p,material_rates:d}=e;return K`
    <div class="admin-page">
      <h2 class="admin-title">Rates & Pricing</h2>

      <${mt}
        title="Labor"
        description="Applied once per job (or once per project for project pricing)."
      >
        <${bs}
          labor=${l}
          saveState=${s("labor")}
          onSave=${i}
        />
      </${mt}>

      <${mt}
        title="Machine Rates"
        description="Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance."
      >
        ${p.map(o=>K`
            <${ys}
              key=${o.device_model}
              machine=${o}
              saveState=${s(o.device_model)}
              onSave=${r}
            />
          `)}
      </${mt}>

      <${mt}
        title="Material Rates"
        description="Cost per gram including waste. Rate = cost × (1 + waste fraction)."
      >
        ${d.map(o=>K`
            <${Ps}
              key=${o.filament_type}
              material=${o}
              saveState=${s(o.filament_type)}
              onSave=${u}
            />
          `)}
      </${mt}>
    </div>
  `}const Fn=M.bind(x);function Ft(t){return t==null?"—":`$${t.toFixed(2)}`}function Tn(t){return t==null?"—":`${Math.round(t*100)}%`}function Cs(t){return t==null?"—":t<3600?`${Math.round(t/60)} min`:`${(t/3600).toFixed(1)} h`}function ks(t){return t==null?"batch-margin batch-margin--unknown":t>=.45?"batch-margin batch-margin--good":t>=.25?"batch-margin batch-margin--ok":"batch-margin batch-margin--low"}function _t({label:t,value:e}){return Fn`<div class="batch-price-metric"><span>${t}</span><strong>${e}</strong></div>`}function Ss({batch:t}){return Fn`<div class="batch-price-breakdown" aria-label="Batch price breakdown">
    <${_t} label="Unit cost" value=${Ft(t.unit_cost)} />
    <${_t} label="Suggested" value=${Ft(t.suggested_price)} />
    <${_t} label="Fixed fee" value=${Ft(t.fixed_fee_per_order)} />
    <${_t} label="Margin" value=${Tn(t.estimated_margin_pct)} />
    <${_t}
      label="Material"
      value=${t.total_filament_g===null||t.total_filament_g===void 0?"—":`${t.total_filament_g.toFixed(1)} g`}
    />
    <${_t} label="Print time" value=${Cs(t.total_print_time_s)} />
  </div>`}const dt=M.bind(x);function kt(t){return t==null}function Is(t){return kt(t)?"":String(t/3600)}function St(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function Fs(t){const e=St(t);return e===null?null:Math.round(e*3600)}function $t(t){const e=Number(t.trim());return Number.isInteger(e)&&e>0?e:null}function Et(t){const e=Number(t.trim());return Number.isInteger(e)&&e>=0?e:null}function ie(t,e){return Object.prototype.hasOwnProperty.call(t,e)}function re(t){return{productId:String(t.product_id),pricingProfileId:t.pricing_profile_id,plannedQuantity:String(t.planned_quantity),completedQuantity:String(t.completed_quantity),failedQuantity:String(t.failed_quantity),materialType:t.material_type??"",primaryColor:t.primary_color??"",totalFilamentG:kt(t.total_filament_g)?"":String(t.total_filament_g),totalPrintTimeHours:Is(t.total_print_time_s),setupMinutes:kt(t.setup_minutes)?"":String(t.setup_minutes),handlingMinutesPerUnit:kt(t.handling_minutes_per_unit)?"":String(t.handling_minutes_per_unit),packagingCostPerUnit:kt(t.packaging_cost_per_unit)?"":String(t.packaging_cost_per_unit),notes:t.notes??""}}function L({label:t,children:e}){return dt`<label class="form-label">${t}${e}</label>`}function Ts({batchId:t,navigate:e}){const[n,a]=f(null),[s,i]=f([]),[r,u]=f([]),[l,p]=f(""),[d,o]=f(null),[c,m]=f(!0),[v,y]=f(!1),[_,g]=f(!1);O(()=>{let h=!1;return Promise.all([ma(t),ke(),ra()]).then(([w,F,T])=>{h||(a(w),i(F),u(T),o(re(w)))}).catch(w=>{I(w instanceof Error?w.message:"Failed to load batch.","error")}).finally(()=>{h||m(!1)}),()=>{h=!0}},[t]);const $=(h,w)=>{o(F=>F&&{...F,[h]:w})},b=!!(d&&$t(d.productId)&&$t(d.plannedQuantity)&&Et(d.completedQuantity)!==null&&Et(d.failedQuantity)!==null),P=async()=>{if(!n)return;const h=$t(l);if(h){g(!0);try{const w=await fa(n.id,h);if(!w)return;a(w),o(re(w)),I("Project jobs added to batch.","success")}finally{g(!1)}}},k=async h=>{if(h.preventDefault(),!d||!n)return;const w=$t(d.productId),F=$t(d.plannedQuantity),T=Et(d.completedQuantity),H=Et(d.failedQuantity);if(!w||!F||T===null||H===null)return;const at={product_id:w,pricing_profile_id:d.pricingProfileId,planned_quantity:F,completed_quantity:T,failed_quantity:H,material_type:d.materialType.trim()||null,primary_color:d.primaryColor.trim()||null,total_filament_g:St(d.totalFilamentG),total_print_time_s:Fs(d.totalPrintTimeHours),notes:d.notes.trim()||null};(ie(n,"setup_minutes")||d.setupMinutes.trim())&&(at.setup_minutes=St(d.setupMinutes)),(ie(n,"handling_minutes_per_unit")||d.handlingMinutesPerUnit.trim())&&(at.handling_minutes_per_unit=St(d.handlingMinutesPerUnit)),(ie(n,"packaging_cost_per_unit")||d.packagingCostPerUnit.trim())&&(at.packaging_cost_per_unit=St(d.packagingCostPerUnit)),y(!0);try{const ct=await $a(n.id,at);if(!ct)return;a(ct),o(re(ct)),I("Batch updated.","success")}finally{y(!1)}};return c?dt`<div class="empty">Loading batch…</div>`:!n||!d?dt`<div class="empty">Batch not found.</div>`:dt`<main class="product-detail-page batch-detail-page">
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
        <${Ss} batch=${n} />
      </aside>

      <form class="product-detail-form" onSubmit=${k}>
        <section class="admin-section">
          <h3 class="admin-section-title">Batch setup</h3>
          <div class="product-form-grid">
            <${L} label="Product">
              <select
                class="form-input"
                value=${d.productId}
                onChange=${h=>$("productId",h.target.value)}
              >
                ${s.map(h=>dt`<option key=${h.id} value=${String(h.id)}>
                      ${h.name}
                    </option>`)}
              </select>
            </${L}>
            <${L} label="Pricing profile">
              <select
                class="form-input"
                value=${d.pricingProfileId}
                onChange=${h=>$("pricingProfileId",h.target.value)}
              >
                ${we.map(h=>dt`<option key=${h.id} value=${h.id}>${h.label}</option>`)}
              </select>
            </${L}>
            <${L} label="Planned quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${d.plannedQuantity}
                onInput=${h=>$("plannedQuantity",h.target.value)}
              />
            </${L}>
            <${L} label="Completed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${d.completedQuantity}
                onInput=${h=>$("completedQuantity",h.target.value)}
              />
            </${L}>
            <${L} label="Failed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${d.failedQuantity}
                onInput=${h=>$("failedQuantity",h.target.value)}
              />
            </${L}>
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
              value=${l}
              onChange=${h=>p(h.target.value)}
            >
              <option value="">Select project…</option>
              ${r.map(h=>dt`<option key=${h.id} value=${String(h.id)}>
                    ${h.name}${h.job_count?` (${h.job_count} jobs)`:""}
                  </option>`)}
            </select>
            <button
              class="btn-secondary"
              type="button"
              disabled=${_||!$t(l)}
              onClick=${P}
            >
              ${_?"Adding…":"Add project jobs"}
            </button>
          </div>
          <div class="product-form-grid">
            <${L} label="Material">
              <input
                class="form-input"
                value=${d.materialType}
                placeholder="PLA"
                onInput=${h=>$("materialType",h.target.value)}
              />
            </${L}>
            <${L} label="Color">
              <input
                class="form-input"
                value=${d.primaryColor}
                placeholder="#ffffff or White"
                onInput=${h=>$("primaryColor",h.target.value)}
              />
            </${L}>
            <${L} label="Total grams">
              <input
                class="form-input"
                inputmode="decimal"
                value=${d.totalFilamentG}
                placeholder="120"
                onInput=${h=>$("totalFilamentG",h.target.value)}
              />
            </${L}>
            <${L} label="Total time (hours)">
              <input
                class="form-input"
                inputmode="decimal"
                value=${d.totalPrintTimeHours}
                placeholder="4.5"
                onInput=${h=>$("totalPrintTimeHours",h.target.value)}
              />
            </${L}>
            <${L} label="Setup minutes">
              <input
                class="form-input"
                inputmode="decimal"
                value=${d.setupMinutes}
                placeholder="10"
                onInput=${h=>$("setupMinutes",h.target.value)}
              />
            </${L}>
            <${L} label="Handling minutes / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${d.handlingMinutesPerUnit}
                placeholder="3"
                onInput=${h=>$("handlingMinutesPerUnit",h.target.value)}
              />
            </${L}>
            <${L} label="Packaging cost / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${d.packagingCostPerUnit}
                placeholder="0.75"
                onInput=${h=>$("packagingCostPerUnit",h.target.value)}
              />
            </${L}>
          </div>
          <label class="form-label product-notes-field">
            Notes
            <textarea
              class="form-input form-textarea"
              value=${d.notes}
              placeholder="Batch run notes, sales channel context, quality issues…"
              onInput=${h=>$("notes",h.target.value)}
            ></textarea>
          </label>
        </section>

        <div class="form-actions">
          <button class="btn-secondary" type="button" onClick=${()=>e("/batches")}>
            Cancel
          </button>
          <button class="btn-primary" type="submit" disabled=${v||!b}>
            ${v?"Saving…":"Save Batch"}
          </button>
        </div>
      </form>
    </section>
  </main>`}const Ke=M.bind(x);function Ns({batch:t,onOpen:e}){const n=t.completed_quantity+t.failed_quantity;return Ke`<article class="batch-card" onClick=${()=>e(t)}>
    <div class="batch-card-header">
      <div>
        <p class="products-kicker">${t.pricing_profile_label}</p>
        <h3>${t.product_name}</h3>
      </div>
      <span class=${ks(t.estimated_margin_pct)}>
        ${Tn(t.estimated_margin_pct)}
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
      <div><span>Unit cost</span><strong>${Ft(t.unit_cost)}</strong></div>
      <div>
        <span>Suggested price</span><strong>${Ft(t.suggested_price)}</strong>
      </div>
    </div>
    ${t.notes?Ke`<p class="batch-card-notes">${t.notes}</p>`:null}
  </article>`}const X=M.bind(x);function Bt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>0?e:null}function xs({products:t,onCreated:e}){const[n,a]=f({productId:"",pricingProfileId:"booth",plannedQuantity:"1"}),[s,i]=f(!1),r=(l,p)=>a(d=>({...d,[l]:p}));return X`<form class="batch-create-card" onSubmit=${async l=>{l.preventDefault();const p=Bt(n.productId),d=Bt(n.plannedQuantity);if(!(!p||!d)){i(!0);try{const o=await _a({product_id:p,pricing_profile_id:n.pricingProfileId,planned_quantity:d});if(!o)return;e(o),a({productId:"",pricingProfileId:"booth",plannedQuantity:"1"}),I("Batch created.","success")}finally{i(!1)}}}}>
    <select
      class="form-input"
      value=${n.productId}
      onChange=${l=>r("productId",l.target.value)}
    >
      <option value="">Select product…</option>
      ${t.map(l=>X`<option key=${l.id} value=${String(l.id)}>${l.name}</option>`)}
    </select>
    <select
      class="form-input"
      value=${n.pricingProfileId}
      onChange=${l=>r("pricingProfileId",l.target.value)}
    >
      ${we.map(l=>X`<option key=${l.id} value=${l.id}>${l.label}</option>`)}
    </select>
    <input
      class="form-input"
      inputmode="numeric"
      value=${n.plannedQuantity}
      placeholder="Planned qty"
      onInput=${l=>r("plannedQuantity",l.target.value)}
    />
    <button
      class="btn-primary"
      type="submit"
      disabled=${s||!Bt(n.productId)||!Bt(n.plannedQuantity)}
    >
      ${s?"Adding…":"Add Batch"}
    </button>
  </form>`}function Ls({navigate:t}){const[e,n]=f([]),[a,s]=f([]),[i,r]=f(!0),[u,l]=f(""),[p,d]=f("");O(()=>{let c=!1;return Promise.all([pa(),ke()]).then(([m,v])=>{c||(n(m),s(v))}).catch(m=>{I(m instanceof Error?m.message:"Failed to load batches.","error")}).finally(()=>{c||r(!1)}),()=>{c=!0}},[]);const o=V(()=>{const c=u.trim().toLowerCase();return e.filter(m=>p&&m.pricing_profile_id!==p?!1:c?[m.product_name,m.pricing_profile_label,m.material_type,m.primary_color].filter(Boolean).join(" ").toLowerCase().includes(c):!0)},[e,p,u]);return X`<main class="products-page batches-page">
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
        onInput=${c=>l(c.target.value)}
      />
      <select
        value=${p}
        onChange=${c=>d(c.target.value)}
      >
        <option value="">All channels</option>
        ${we.map(c=>X`<option key=${c.id} value=${c.id}>${c.label}</option>`)}
      </select>
      <span class="product-count">${o.length} of ${e.length} batches</span>
    </div>

    <section class="product-create-section">
      <${xs}
        products=${a}
        onCreated=${c=>n(m=>[c,...m])}
      />
    </section>

    ${i?X`<div class="empty">Loading batches…</div>`:o.length?X`<div class="batch-grid">
            ${o.map(c=>X`<${Ns}
                  key=${c.id}
                  batch=${c}
                  onOpen=${()=>t(`/batches/${c.id}`)}
                />`)}
          </div>`:X`<div class="empty">No batches match your filters.</div>`}
  </main>`}const ot=M.bind(x);function st({label:t,value:e}){return ot`<div class="catalog-summary-pill">
    <strong>${e.toLocaleString()}</strong>${t}
  </div>`}function Ms({summary:t}){return t?ot`
    <div class="catalog-summary" role="status" aria-live="polite">
      <${st} label="scanned" value=${t.scanned} />
      <${st} label="added" value=${t.added} />
      <${st} label="changed" value=${t.changed} />
      <${st} label="unchanged" value=${t.unchanged} />
      <${st} label="missing" value=${t.missing} />
      <${st} label="restored" value=${t.restored} />
      <${st} label="skipped" value=${t.skipped} />
      <${st} label="failed" value=${t.failed} />
    </div>
  `:null}function js(){const[t,e]=f([]),[n,a]=f(""),[s,i]=f(""),[r,u]=f(!0),[l,p]=f(!1),[d,o]=f(null),c=async()=>{const _=await pt("/catalog/roots","Failed to load roots.");_&&e(_.roots),u(!1)};O(()=>{c()},[]);const m=async _=>{_.preventDefault();const g=n.trim();if(!g)return;const $=s.trim()?{rootPath:g,name:s.trim()}:{rootPath:g},b=await Y("/catalog/roots",$,"Failed to add root.");b&&(e(P=>[...P,b.root]),a(""),i(""),I("Catalog root added.","success"))},v=async _=>{const g=await pt(`/catalog/roots/${_}`,"Failed to remove root.",{method:"DELETE"});g&&e($=>$.map(b=>b.id===_?g.root:b))};return ot`
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
            onClick=${async()=>{p(!0);try{const _=await Y("/catalog/scan",{},"Catalog scan failed.",{timeoutMs:null});if(!_)return;o(_.summary),I("Catalog scan complete.",_.summary.failed>0?"info":"success"),await c()}finally{p(!1)}}}
            disabled=${l||t.every(_=>!_.is_active)}
          >
            ${l?"Scanning…":"Run scan"}
          </button>
        </div>
        <${Ms} summary=${d} />
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
              value=${s}
              placeholder="Models"
              onInput=${_=>i(_.target.value)}
            />
          </label>
          <button class="btn-primary" type="submit">Add root</button>
        </form>

        ${r?ot`<div class="empty">Loading scan roots…</div>`:t.length===0?ot`<div class="empty">No scan roots configured.</div>`:ot`<div class="catalog-root-list">
                ${t.map(_=>ot`<div class="admin-card catalog-root-card" key=${_.id}>
                      <div>
                        <div class="admin-card-name">${_.name}</div>
                        <div class="catalog-root-path">${_.root_path}</div>
                        <div class="catalog-root-meta">
                          ${_.is_active?"active":"inactive"}
                          ${_.last_scanned_at?` · scanned ${_.last_scanned_at}`:""}
                        </div>
                      </div>
                      ${_.is_active?ot`<button class="btn-ghost" onClick=${()=>v(_.id)}>
                            Deactivate
                          </button>`:null}
                    </div>`)}
              </div>`}
      </section>
    </main>
  `}const Ds=M.bind(x);function Js(t){return t==="green"?"product-sellability product-sellability--green":t==="yellow"?"product-sellability product-sellability--yellow":"product-sellability product-sellability--red"}function Ne({level:t,label:e,readyToList:n}){return Ds`<span class=${Js(t)} title=${e}>
    <span class="product-sellability-dot" aria-hidden="true"></span>
    ${e}${n?" · ready":""}
  </span>`}const vt=M.bind(x),xt=[{id:"idea",label:"Idea"},{id:"downloaded_designed",label:"Downloaded / Designed"},{id:"test_print",label:"Test Print"},{id:"needs_tuning",label:"Needs Tuning"},{id:"ready_for_photos",label:"Ready for Photos"},{id:"listed",label:"Listed"},{id:"active",label:"Active"},{id:"selling_well",label:"Selling Well"},{id:"retired",label:"Retired"}],Nn=[{id:"gaming",label:"Gaming"},{id:"workshop",label:"Workshop"},{id:"home_organization",label:"Home Organization"},{id:"decor",label:"Decor"},{id:"personalized",label:"Personalized"},{id:"seasonal",label:"Seasonal"},{id:"custom_repair_parts",label:"Custom / Repair Parts"}],xe=[{id:"hive",label:"Hive"},{id:"original",label:"Original"},{id:"printables",label:"Printables"},{id:"makerworld",label:"MakerWorld"},{id:"thangs",label:"Thangs"},{id:"stlflix",label:"STLFlix"},{id:"custom_commission",label:"Custom Commission"}],xn=[{id:"commercial_allowed",label:"Commercial Allowed"},{id:"personal_use_only",label:"Personal Use Only"},{id:"attribution_required",label:"Attribution Required"},{id:"hive_community",label:"Hive Community"},{id:"hive_plus",label:"Hive Plus"},{id:"original_owned",label:"Original / Owned"},{id:"unknown_verify",label:"Unknown / Verify"}],Es=[{id:"none",label:"No restock"},{id:"normal",label:"Normal"},{id:"high",label:"High"},{id:"urgent",label:"Urgent"}];function Bs(t){return t===null?"No price":`$${t.toFixed(2)}`}function Us({product:t}){return t.main_photo_path?vt`<img
      class="product-card-photo"
      src=${t.main_photo_path}
      alt=""
      loading="lazy"
    />`:vt`<div class="product-card-photo product-card-photo--empty" aria-hidden="true">▧</div>`}function Le({product:t,onOpen:e,onStatusChange:n}){const a=s=>s.stopPropagation();return vt`
    <article class="product-card" onClick=${()=>e(t)}>
      <${Us} product=${t} />
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
          <${Ne}
            level=${t.can_sell_level}
            label=${t.can_sell_label}
            readyToList=${t.ready_to_list}
          />
          <span class="product-license-badge">${t.license_label||"License unknown"}</span>
        </div>
        <div class="product-card-footer">
          <strong>${Bs(t.target_sale_price)}</strong>
          ${n?vt`<label class="product-status-select" onClick=${a}>
                <span>Status</span>
                <select
                  value=${t.status_id}
                  onChange=${s=>{s.stopPropagation(),n(t,s.target.value)}}
                >
                  ${xt.map(s=>vt`<option key=${s.id} value=${s.id}>${s.label}</option>`)}
                </select>
              </label>`:vt`<span class="product-status-pill">${t.status_label}</span>`}
        </div>
      </div>
    </article>
  `}const lt=M.bind(x);function As(t){return t===null?"":String(t/3600)}function Ye(t){return{name:t.name,categoryId:t.category_id??"",statusId:t.status_id,sourceId:t.source_id??"",licenseId:t.license_id??"",targetSalePrice:t.target_sale_price===null?"":String(t.target_sale_price),restockPriority:t.restock_priority,modelUrl:t.model_url??"",etsyListingUrl:t.etsy_listing_url??"",defaultMaterial:t.default_material??"",primaryColor:t.primary_color??"",accentColor:t.accent_color??"",preferredPrinterId:t.preferred_printer_id===null?"":String(t.preferred_printer_id),estimatedPrintTimeHours:As(t.estimated_print_time_s),estimatedFilamentG:t.estimated_filament_g===null?"":String(t.estimated_filament_g),boothPrice:t.booth_price===null?"":String(t.booth_price),etsyPrice:t.etsy_price===null?"":String(t.etsy_price),packagingCost:t.packaging_cost===null?"":String(t.packaging_cost),handlingMinutes:t.handling_minutes===null?"":String(t.handling_minutes),targetMarginPct:t.target_margin_pct===null?"":String(t.target_margin_pct),pricingNotes:t.pricing_notes??"",notes:t.notes??""}}function it(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function Rs(t){const e=it(t);return e===null?null:Math.round(e*3600)}function Os(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isInteger(n)&&n>0?n:null}function Pt(t,e){return[...e?[lt`<option value="">${e}</option>`]:[],...t.map(a=>lt`<option key=${a.id} value=${a.id}>${a.label}</option>`)]}function Hs({product:t}){return t.main_photo_path?lt`<img class="product-detail-photo" src=${t.main_photo_path} alt="" />`:lt`<div class="product-detail-photo product-detail-photo--empty">No product photo</div>`}function qs({product:t}){const e=[t.primary_color,t.accent_color].filter(Boolean).join(" / ");return lt`<div class="product-detail-facts">
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
  </div>`}function Ws({productId:t,navigate:e}){const[n,a]=f(null),[s,i]=f(null),[r,u]=f(!0),[l,p]=f(!1);O(()=>{let c=!1;return la(t).then(m=>{c||(a(m),i(Ye(m)))}).catch(m=>{I(m instanceof Error?m.message:"Failed to load product.","error")}).finally(()=>{c||u(!1)}),()=>{c=!0}},[t]);const d=(c,m)=>{i(v=>v&&{...v,[c]:m})},o=async c=>{if(c.preventDefault(),!s||!n)return;const m={name:s.name,category_id:s.categoryId||null,status_id:s.statusId,source_id:s.sourceId||null,license_id:s.licenseId||null,target_sale_price:it(s.targetSalePrice),restock_priority:s.restockPriority,model_url:s.modelUrl.trim()||null,etsy_listing_url:s.etsyListingUrl.trim()||null,default_material:s.defaultMaterial.trim()||null,primary_color:s.primaryColor.trim()||null,accent_color:s.accentColor.trim()||null,preferred_printer_id:Os(s.preferredPrinterId),estimated_print_time_s:Rs(s.estimatedPrintTimeHours),estimated_filament_g:it(s.estimatedFilamentG),booth_price:it(s.boothPrice),etsy_price:it(s.etsyPrice),packaging_cost:it(s.packagingCost),handling_minutes:it(s.handlingMinutes),target_margin_pct:it(s.targetMarginPct),pricing_notes:s.pricingNotes.trim()||null,notes:s.notes.trim()||null};p(!0);try{const v=await Se(n.id,m);if(!v)return;a(v),i(Ye(v)),I("Product updated.","success")}finally{p(!1)}};return r?lt`<div class="empty">Loading product…</div>`:!n||!s?lt`<div class="empty">Product not found.</div>`:lt`<main class="product-detail-page">
    <div class="product-detail-header">
      <button class="btn-back" onClick=${()=>e("/products")}>← Products</button>
      <div>
        <p class="products-kicker">Product detail</p>
        <h2>${n.name}</h2>
      </div>
      <${Ne}
        level=${n.can_sell_level}
        label=${n.can_sell_label}
        readyToList=${n.ready_to_list}
      />
    </div>

    <section class="product-detail-layout">
      <aside class="product-detail-card">
        <${Hs} product=${n} />
        <${qs} product=${n} />
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
                onInput=${c=>d("name",c.target.value)}
              />
            </label>
            <label class="form-label">
              Status
              <select
                class="form-input"
                value=${s.statusId}
                onChange=${c=>d("statusId",c.target.value)}
              >
                ${Pt(xt)}
              </select>
            </label>
            <label class="form-label">
              Category
              <select
                class="form-input"
                value=${s.categoryId}
                onChange=${c=>d("categoryId",c.target.value)}
              >
                ${Pt(Nn,"Uncategorized")}
              </select>
            </label>
            <label class="form-label">
              Source
              <select
                class="form-input"
                value=${s.sourceId}
                onChange=${c=>d("sourceId",c.target.value)}
              >
                ${Pt(xe,"Source TBD")}
              </select>
            </label>
            <label class="form-label">
              License
              <select
                class="form-input"
                value=${s.licenseId}
                onChange=${c=>d("licenseId",c.target.value)}
              >
                ${Pt(xn,"Verify license")}
              </select>
            </label>
            <label class="form-label">
              Target price
              <input
                class="form-input"
                inputmode="decimal"
                placeholder="18.00"
                value=${s.targetSalePrice}
                onInput=${c=>d("targetSalePrice",c.target.value)}
              />
            </label>
            <label class="form-label">
              Restock priority
              <select
                class="form-input"
                value=${s.restockPriority}
                onChange=${c=>d("restockPriority",c.target.value)}
              >
                ${Pt(Es)}
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
                onInput=${c=>d("modelUrl",c.target.value)}
              />
            </label>
            <label class="form-label">
              Etsy listing URL
              <input
                class="form-input"
                value=${s.etsyListingUrl}
                placeholder="https://…"
                onInput=${c=>d("etsyListingUrl",c.target.value)}
              />
            </label>
            <label class="form-label">
              Default material
              <input
                class="form-input"
                value=${s.defaultMaterial}
                placeholder="PLA"
                onInput=${c=>d("defaultMaterial",c.target.value)}
              />
            </label>
            <label class="form-label">
              Primary color
              <input
                class="form-input"
                value=${s.primaryColor}
                placeholder="#ffffff or White"
                onInput=${c=>d("primaryColor",c.target.value)}
              />
            </label>
            <label class="form-label">
              Accent color
              <input
                class="form-input"
                value=${s.accentColor}
                placeholder="#000000 or Black"
                onInput=${c=>d("accentColor",c.target.value)}
              />
            </label>
            <label class="form-label">
              Preferred printer ID
              <input
                class="form-input"
                inputmode="numeric"
                value=${s.preferredPrinterId}
                placeholder="1"
                onInput=${c=>d("preferredPrinterId",c.target.value)}
              />
            </label>
            <label class="form-label">
              Estimated print time (hours)
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.estimatedPrintTimeHours}
                placeholder="4.5"
                onInput=${c=>d("estimatedPrintTimeHours",c.target.value)}
              />
            </label>
            <label class="form-label">
              Estimated filament (g)
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.estimatedFilamentG}
                placeholder="120"
                onInput=${c=>d("estimatedFilamentG",c.target.value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Notes
            <textarea
              class="form-input form-textarea"
              value=${s.notes}
              placeholder="Tuning notes, photo needs, listing copy reminders…"
              onInput=${c=>d("notes",c.target.value)}
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
                onInput=${c=>d("boothPrice",c.target.value)}
              />
            </label>
            <label class="form-label">
              Etsy price
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.etsyPrice}
                placeholder="14.99"
                onInput=${c=>d("etsyPrice",c.target.value)}
              />
            </label>
            <label class="form-label">
              Packaging cost
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.packagingCost}
                placeholder="0.75"
                onInput=${c=>d("packagingCost",c.target.value)}
              />
            </label>
            <label class="form-label">
              Handling minutes
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.handlingMinutes}
                placeholder="3"
                onInput=${c=>d("handlingMinutes",c.target.value)}
              />
            </label>
            <label class="form-label">
              Target margin
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.targetMarginPct}
                placeholder="0.50"
                onInput=${c=>d("targetMarginPct",c.target.value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Pricing notes
            <textarea
              class="form-input form-textarea"
              value=${s.pricingNotes}
              placeholder="Booth/Etsy pricing rationale, packaging assumptions, margin notes…"
              onInput=${c=>d("pricingNotes",c.target.value)}
            ></textarea>
          </label>
        </section>

        <div class="form-actions">
          <button class="btn-secondary" type="button" onClick=${()=>e("/products")}>
            Cancel
          </button>
          <button class="btn-primary" type="submit" disabled=${l||!s.name.trim()}>
            ${l?"Saving…":"Save Product"}
          </button>
        </div>
      </form>
    </section>
  </main>`}const ft=M.bind(x),Xe={urgent:0,high:1,normal:2,none:3};function Ze(t){return[...t].sort((e,n)=>{const a=(Xe[e.restock_priority]??9)-(Xe[n.restock_priority]??9);return a!==0?a:e.name.localeCompare(n.name)})}function Qs({products:t}){const e=t.filter(s=>s.restock_priority==="urgent").length,n=t.filter(s=>s.restock_priority==="high").length,a=t.filter(s=>s.ready_to_list).length;return ft`<div class="product-print-next-summary">
    <div><strong>${t.length}</strong><span>queued</span></div>
    <div><strong>${e}</strong><span>urgent</span></div>
    <div><strong>${n}</strong><span>high</span></div>
    <div><strong>${a}</strong><span>ready to list</span></div>
  </div>`}function Vs({navigate:t}){const[e,n]=f([]),[a,s]=f(!0);O(()=>{let r=!1;return ca().then(u=>{r||n(Ze(u))}).catch(u=>{I(u instanceof Error?u.message:"Failed to load print-next products.","error")}).finally(()=>{r||s(!1)}),()=>{r=!0}},[]);const i=async(r,u)=>{if(u===r.status_id)return;const l=await Se(r.id,{status_id:u});l&&(n(p=>Ze(p.map(d=>d.id===l.id?l:d).filter(d=>["active","selling_well"].includes(d.status_id)))),I("Product status updated.","success"))};return ft`<main class="products-page">
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

    ${a?ft`<div class="empty">Loading print queue…</div>`:e.length===0?ft`<div class="empty">No active products need restocking.</div>`:ft`
            <${Qs} products=${e} />
            <div class="product-print-next-grid">
              ${e.map(r=>ft`<article class="product-print-next-card" key=${r.id}>
                    <div class="product-print-next-topline">
                      <span
                        class=${"product-priority product-priority--"+r.restock_priority}
                      >
                        ${r.restock_priority}
                      </span>
                      <${Ne}
                        level=${r.can_sell_level}
                        label=${r.can_sell_label}
                        readyToList=${r.ready_to_list}
                      />
                    </div>
                    <${Le}
                      product=${r}
                      onOpen=${()=>t(`/products/${r.id}`)}
                      onStatusChange=${i}
                    />
                  </article>`)}
            </div>
          `}
  </main>`}const D=M.bind(x),Gs=[{id:"",label:"All sellability"},{id:"green",label:"Green"},{id:"yellow",label:"Yellow"},{id:"red",label:"Red"}];function zs(t){const e=new Map;for(const i of t){const r=e.get(i.status_id)??[];r.push(i),e.set(i.status_id,r)}const n=xt.map(i=>({statusId:i.id,statusLabel:i.label,products:e.get(i.id)??[]})),a=new Set(xt.map(i=>i.id)),s=[...e.entries()].filter(([i])=>!a.has(i)).map(([i,r])=>{var u;return{statusId:i,statusLabel:((u=r[0])==null?void 0:u.status_label)??i,products:r}});return[...n,...s]}function Ks(t,e){const n=e.q.trim().toLowerCase();return!(n&&![t.name,t.category_label,t.status_label,t.source_label,t.license_label].filter(Boolean).join(" ").toLowerCase().includes(n)||e.categoryId&&t.category_id!==e.categoryId||e.statusId&&t.status_id!==e.statusId||e.sourceId&&t.source_id!==e.sourceId||e.sellability&&t.can_sell_level!==e.sellability)}function Ys({mode:t,navigate:e}){const n=a=>"product-tab"+(a?" active":"");return D`<div class="product-tabs" aria-label="Product views">
    <button class=${n(t==="pipeline")} onClick=${()=>e("/products/pipeline")}>
      Pipeline
    </button>
    <button class=${n(t==="catalog")} onClick=${()=>e("/products")}>
      Catalog
    </button>
    <button class="product-tab" onClick=${()=>e("/products/print-next")}>
      Print Next
    </button>
  </div>`}function Xs({filters:t,setFilters:e,count:n,total:a,showStatusFilter:s}){const i=(r,u)=>e({...t,[r]:u});return D`<div class="product-toolbar">
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
      ${Nn.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    ${s?D`<select
          value=${t.statusId}
          onChange=${r=>i("statusId",r.target.value)}
        >
          <option value="">All statuses</option>
          ${xt.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
        </select>`:null}
    <select
      value=${t.sourceId}
      onChange=${r=>i("sourceId",r.target.value)}
    >
      <option value="">All sources</option>
      ${xe.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    <select
      value=${t.sellability}
      onChange=${r=>i("sellability",r.target.value)}
    >
      ${Gs.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    <span class="product-count"
      >${n.toLocaleString()} of ${a.toLocaleString()} products</span
    >
  </div>`}function Zs({onCreated:t}){const[e,n]=f(""),[a,s]=f("unknown_verify"),[i,r]=f(""),[u,l]=f(!1);return D`<form class="product-create-card" onSubmit=${async d=>{d.preventDefault();const o=e.trim();if(o){l(!0);try{const c=await da({name:o,status_id:"idea",license_id:a,source_id:i||null});if(!c)return;t(c),n(""),s("unknown_verify"),r(""),I("Product created.","success")}finally{l(!1)}}}}>
    <input
      class="form-input"
      placeholder="New product idea…"
      value=${e}
      onInput=${d=>n(d.target.value)}
    />
    <select
      class="form-input"
      value=${i}
      onChange=${d=>r(d.target.value)}
    >
      <option value="">Source TBD</option>
      ${xe.map(d=>D`<option key=${d.id} value=${d.id}>${d.label}</option>`)}
    </select>
    <select
      class="form-input"
      value=${a}
      onChange=${d=>s(d.target.value)}
    >
      ${xn.map(d=>D`<option key=${d.id} value=${d.id}>${d.label}</option>`)}
    </select>
    <button class="btn-primary" type="submit" disabled=${u||!e.trim()}>
      ${u?"Adding…":"Add Product"}
    </button>
  </form>`}function ti({products:t,navigate:e,onStatusChange:n}){return t.length?D`<div class="product-grid">
    ${t.map(a=>D`<${Le}
          key=${a.id}
          product=${a}
          onOpen=${()=>e(`/products/${a.id}`)}
          onStatusChange=${n}
        />`)}
  </div>`:D`<div class="empty">No products match your filters.</div>`}function ei({columns:t,navigate:e,onStatusChange:n}){return D`<div class="product-kanban" role="list">
    ${t.map(a=>D`<section class="product-kanban-column" key=${a.statusId} role="listitem">
          <div class="product-kanban-header">
            <h3>${a.statusLabel}</h3>
            <span>${a.products.length}</span>
          </div>
          <div class="product-kanban-cards">
            ${a.products.length?a.products.map(s=>D`<${Le}
                      key=${s.id}
                      product=${s}
                      onOpen=${()=>e(`/products/${s.id}`)}
                      onStatusChange=${n}
                    />`):D`<div class="product-column-empty">No products</div>`}
          </div>
        </section>`)}
  </div>`}function ni({mode:t,navigate:e}){const[n,a]=f([]),[s,i]=f(!0),[r,u]=f({q:"",categoryId:"",statusId:"",sourceId:"",sellability:""});O(()=>{let o=!1;return ke().then(c=>{o||a(c)}).catch(c=>{I(c instanceof Error?c.message:"Failed to load products.","error")}).finally(()=>{o||i(!1)}),()=>{o=!0}},[]);const l=V(()=>n.filter(o=>Ks(o,r)),[n,r]),p=V(()=>zs(l),[l]),d=async(o,c)=>{if(c===o.status_id)return;const m=await Se(o.id,{status_id:c});m&&(a(v=>v.map(y=>y.id===m.id?m:y)),I("Product status updated.","success"))};return D`<main class="products-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Product workflow</p>
        <h2>${t==="pipeline"?"Product Pipeline":"Product Catalog"}</h2>
        <p>
          Card-based product tracking for sellability, listing readiness, and what to print next.
        </p>
      </div>
      <${Ys} mode=${t} navigate=${e} />
    </section>

    <${Xs}
      filters=${r}
      setFilters=${u}
      count=${l.length}
      total=${n.length}
      showStatusFilter=${t==="catalog"}
    />

    ${t==="catalog"?D`<section class="product-create-section">
          <${Zs}
            onCreated=${o=>a(c=>[o,...c])}
          />
        </section>`:null}
    ${s?D`<div class="empty">Loading products…</div>`:t==="pipeline"?D`<${ei}
            columns=${p}
            navigate=${e}
            onStatusChange=${d}
          />`:D`<${ti}
            products=${l}
            navigate=${e}
            onStatusChange=${d}
          />`}
  </main>`}const E=M.bind(x);function ai({bootStatus:t,loadProgress:e}){return E` <div class="in-app-loading" role="status" aria-live="polite">
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
          ${Array.from({length:5},(n,a)=>E`
              <div class="dashboard-loader-row" key=${a}>
                <span></span><span></span><span></span><span></span>
              </div>
            `)}
        </div>
      </div>
    </section>
  </div>`}function si({error:t}){return E`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${t}</p>
      </div>
    </div>
  </div>`}function ii({projectId:t,projects:e,jobs:n,projectsLoading:a,navigate:s,setSelectedJob:i,handleJobProjectChange:r,setProjects:u}){const l=e.find(o=>Number(o.id)===t),p=n.filter(o=>Number(o.project_id)===t);if(!l)return a?E`<div class="empty">Loading projects…</div>`:E`<div class="empty">Project not found.</div>`;const d=n.filter(o=>o.project_id==null);return E`<${_s}
    project=${l}
    jobs=${p}
    unassignedJobs=${d}
    onBack=${()=>s("/projects")}
    onJobClick=${i}
    onAddJob=${o=>r(o,t)}
    onRemoveJob=${o=>r(o,null)}
    onProjectUpdated=${o=>u(c=>c.some(m=>m.id===o.id)?c.map(m=>m.id===o.id?o:m):[o,...c])}
    onMoveJobToProject=${(o,c)=>r(o,c)}
    onNavigateToProject=${o=>s(`/projects/${o}`)}
  />`}function ri({sorted:t,view:e,sortCol:n,sortDir:a,onSort:s,onJobClick:i,density:r}){return t.length===0?E`<div class="empty">No jobs match your filters.</div>`:e==="table"?E`<${Ua}
      sorted=${t}
      sortCol=${n}
      sortDir=${a}
      onSort=${s}
      onJobClick=${i}
      density=${r}
    />`:E`<${Ra} sorted=${t} onJobClick=${i} density=${r} />`}function oi({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:s,setDeviceFilter:i,devices:r,view:u,setView:l,filtered:p,jobs:d,isFiltered:o,sorted:c,sortCol:m,sortDir:v,onSort:y,onJobClick:_,density:g,setDensity:$}){return E`
    <${ja}
      q=${t}
      setQ=${e}
      statusFilter=${n}
      setStatusFilter=${a}
      deviceFilter=${s}
      setDeviceFilter=${i}
      devices=${r}
      view=${u}
      setView=${l}
      density=${g}
      setDensity=${$}
      filteredCount=${p.length}
      totalCount=${d.length}
    />
    <${Da} filtered=${p} isFiltered=${o} />
    ${ri({sorted:c,view:u,sortCol:m,sortDir:v,onSort:y,onJobClick:_,density:g})}
  `}function li(t){const e=t.match(/^\/projects\/(\d+)$/),n=t.match(/^\/products\/(\d+)$/),a=t.match(/^\/batches\/(\d+)$/);return{isAdmin:t.startsWith("/admin"),isPrinters:t.startsWith("/printers"),isProjects:t.startsWith("/projects"),isCatalog:t.startsWith("/catalog"),isProducts:t.startsWith("/products"),isProductPipeline:t==="/products/pipeline",isProductPrintNext:t==="/products/print-next",isBatches:t.startsWith("/batches"),projectId:e?Number(e[1]):null,productId:n?Number(n[1]):null,batchId:a?Number(a[1]):null}}function ci({route:t,summary:e,projects:n,setProjects:a,jobs:s,projectsLoading:i,navigate:r,setSelectedJob:u,handleJobProjectChange:l,handleRatesChanged:p,handleAutoGroup:d,projectPrices:o,q:c,setQ:m,statusFilter:v,setStatusFilter:y,deviceFilter:_,setDeviceFilter:g,devices:$,view:b,setView:P,filtered:k,isFiltered:h,sorted:w,sortCol:F,sortDir:T,density:H,setDensity:at,handleSort:ct}){return t.isAdmin?E`<${ws} onRatesChanged=${p} />`:t.batchId!=null?E`<${Ts} batchId=${t.batchId} navigate=${r} />`:t.isBatches?E`<${Ls} navigate=${r} />`:t.productId!=null?E`<${Ws} productId=${t.productId} navigate=${r} />`:t.isProductPrintNext?E`<${Vs} navigate=${r} />`:t.isProducts?E`<${ni}
      mode=${t.isProductPipeline?"pipeline":"catalog"}
      navigate=${r}
    />`:t.isCatalog?E`<${js} />`:t.isPrinters?E`<${Ca}
      summary=${e}
      jobs=${s}
      onJobClick=${u}
    />`:t.projectId!=null?E`<${ii}
      projectId=${t.projectId}
      projects=${n}
      jobs=${s}
      projectsLoading=${i}
      navigate=${r}
      setSelectedJob=${u}
      handleJobProjectChange=${l}
      setProjects=${a}
    />`:t.isProjects?E`<${$s}
      projects=${n}
      setProjects=${a}
      onAutoGroup=${d}
      projectPrices=${o}
      loading=${i}
    />`:E`<${oi}
    q=${c}
    setQ=${m}
    statusFilter=${v}
    setStatusFilter=${y}
    deviceFilter=${_}
    setDeviceFilter=${g}
    devices=${$}
    view=${b}
    setView=${P}
    filtered=${k}
    jobs=${s}
    isFiltered=${h}
    sorted=${w}
    sortCol=${F}
    sortDir=${T}
    onSort=${ct}
    onJobClick=${u}
    density=${H}
    setDensity=${at}
  />`}function di({setJobs:t,setProjects:e,setProjectPrices:n,setSummary:a,setDataRange:s,toast:i}){const[r,u]=f(!0),[l,p]=f(!0),[d,o]=f(0),[c,m]=f(null),[v,y]=f("Starting dashboard…"),_=S(async({url:b,fallback:P,onData:k,onFinally:h})=>{const{data:w,error:F}=await Ce(b,P);F&&i(F.message||P,"error"),w&&k(w),h&&h()},[i]),g=S(()=>{_({url:"/projects",fallback:"Failed to load projects.",onData:b=>b.projects&&e(b.projects),onFinally:()=>p(!1)}),_({url:"/projects/prices",fallback:"Failed to load project prices.",onData:b=>b.prices&&n(b.prices)})},[_,e,n]),$=S((b=!1)=>{_({url:"/jobs/prices",fallback:b?"Failed to refresh job prices.":"Failed to load job prices.",onData:k=>{k!=null&&k.prices&&t(h=>h.map(w=>{var F;return{...w,final_price:((F=k.prices)==null?void 0:F[w.id])??(b?w.final_price:null)??null}}))}})},[_,t]);return O(()=>{const b=()=>o(h=>Math.min(100,h+100/na)),P=(h,w,F)=>(y(`Loading ${h}…`),G(h,w).catch(T=>{const H=T instanceof Error?T.message:w;throw new Error(`Initial dashboard load failed (${F}): ${H}`)}).finally(b)),k=setTimeout(()=>{m("Dashboard load timed out. Check console/network for the failing request."),u(!1),p(!1)},ea);return Promise.all([P("/ui/data","Failed to load jobs.","jobs"),P("/summary","Failed to load summary.","summary"),P("/health/data-range","Failed to load print history range.","history range")]).then(([h,w,F])=>{t(h.jobs),a(w),s(F),u(!1),y("Loading optional data…"),$(!1),g()}).catch(h=>{m(h.message),u(!1),p(!1)}).finally(()=>clearTimeout(k)),()=>clearTimeout(k)},[t,a,s,$,g]),{loading:r,projectsLoading:l,loadProgress:d,error:c,bootStatus:v,refreshProjectsAndPrices:g,refreshJobPrices:$}}function ui(t,e,n,a){return t.filter(s=>{const i=`${s.designTitle||""} ${s.customer||""}`.toLowerCase();return!(e&&!i.includes(e.toLowerCase())||n&&(s.status||"").toLowerCase()!==n||a&&s.deviceModel!==a)})}function pi(t,e,n){return[...t].sort((a,s)=>{let i=a[e],r=s[e];if(i==null&&(i=n==="asc"?1/0:-1/0),r==null&&(r=n==="asc"?1/0:-1/0),typeof i=="string"){const p=typeof r=="string"?r:String(r);return n==="asc"?i.localeCompare(p):p.localeCompare(i)}const u=Number(i),l=Number(r);return n==="asc"?u-l:l-u})}const Tt=M.bind(x);function mi(){const[t,e]=f([]),[n,a]=f([]),[s,i]=f({}),[r,u]=f(null),[l,p]=f(null),[d,o]=f("table"),[c,m]=f("comfy"),[v,y]=f(""),[_,g]=f(""),[$,b]=f(""),[P,k]=f("startTime"),[h,w]=f("desc"),[F,T]=f(null);return{jobs:t,setJobs:e,projects:n,setProjects:a,projectPrices:s,setProjectPrices:i,summary:r,setSummary:u,dataRange:l,setDataRange:p,view:d,setView:o,density:c,setDensity:m,q:v,setQ:y,statusFilter:_,setStatusFilter:g,deviceFilter:$,setDeviceFilter:b,sortCol:P,setSortCol:k,sortDir:h,setSortDir:w,selectedJob:F,setSelectedJob:T}}function _i({jobs:t,q:e,statusFilter:n,deviceFilter:a,sortCol:s,sortDir:i,setSortCol:r,setSortDir:u,loc:l}){const p=V(()=>[...new Set(t.map(y=>y.deviceModel).filter(y=>!!y))].sort((y,_)=>y.localeCompare(_)),[t]),d=!!(e||n||a),o=V(()=>ui(t,e,n,a),[t,e,n,a]),c=V(()=>pi(o,s,i),[o,s,i]),m=S(y=>{if(s===y){u(_=>_==="asc"?"desc":"asc");return}r(y),u(()=>y==="startTime"?"desc":"asc")},[s,r,u]),v=V(()=>li(l),[l]);return{devices:p,isFiltered:d,filtered:o,sorted:c,handleSort:m,route:v}}function $i({setJobs:t,setProjects:e,setSummary:n,setSelectedJob:a,navigate:s,refreshProjectsAndPrices:i,refreshJobPrices:r}){const u=S(($,b)=>{t(P=>P.map(k=>k.id===$?{...k,...b}:k)),a(P=>P&&P.id===$?{...P,...b}:P)},[]),l=S(async($,b)=>{const P=await tt(`/jobs/${$}`,b,"Failed to update job.");if(!(P!=null&&P.job))return null;const{job:k}=P;return u($,k),k},[u]),p=S(($,b)=>{l($,b)},[l]),d=S(async($,b)=>{await l($,{project_id:b})&&i()},[l,i]),o=S(($,b)=>{p($,{status_override:b})},[p]),c=S(($,b)=>{p($,{extra_labor_minutes:b})},[p]),m=S($=>{a(null),s(`/projects/${$}`)},[s]),v=S(()=>{r(!0),i()},[r,i]),y=S(async()=>{v();try{const $=await G("/summary","Failed to refresh summary.");n($),I("Pricing refreshed from updated rates.","success")}catch($){const b=$ instanceof Error?$.message:"Updated rates saved, but summary refresh failed.";I(b,"error")}},[v,n]),_=S(async()=>{const[$,b]=await Promise.all([G("/ui/data","Failed to refresh jobs."),G("/projects","Failed to refresh projects.")]);t(()=>$.jobs),e(b.projects),v()},[v,e]);return{closeModal:S(()=>a(null),[]),patchJob:l,handleJobProjectChange:d,handleJobStatusChange:o,handleJobExtraLaborChange:c,handleNavigateToProject:m,handleRatesChanged:y,handleAutoGroup:_}}function fi({selectedJob:t,closeModal:e,patchJob:n,projects:a,handleJobProjectChange:s,handleJobStatusChange:i,handleJobExtraLaborChange:r,handleNavigateToProject:u}){return t?Tt`<${Wa}
    key=${t.id}
    job=${t}
    onClose=${e}
    onPatch=${n}
    projects=${a}
    onJobProjectChange=${s}
    onJobStatusChange=${i}
    onJobExtraLaborChange=${r}
    onNavigateToProject=${u}
  />`:null}function vi(t){const e=S(s=>t.setProjects(s),[t.setProjects]),n=S(s=>t.setSummary(s),[t.setSummary]),a=S(s=>t.setDataRange(s),[t.setDataRange]);return di({setJobs:t.setJobs,setProjects:e,setProjectPrices:t.setProjectPrices,setSummary:n,setDataRange:a,toast:I})}function gi(){const t=mi(),[e,n]=be(),{loading:a,projectsLoading:s,loadProgress:i,error:r,bootStatus:u,refreshProjectsAndPrices:l,refreshJobPrices:p}=vi(t),{devices:d,isFiltered:o,filtered:c,sorted:m,handleSort:v,route:y}=_i({jobs:t.jobs,q:t.q,statusFilter:t.statusFilter,deviceFilter:t.deviceFilter,sortCol:t.sortCol,sortDir:t.sortDir,setSortCol:t.setSortCol,setSortDir:t.setSortDir,loc:e}),{closeModal:_,patchJob:g,handleJobProjectChange:$,handleJobStatusChange:b,handleJobExtraLaborChange:P,handleNavigateToProject:k,handleRatesChanged:h,handleAutoGroup:w}=$i({setJobs:t.setJobs,setProjects:t.setProjects,setSummary:t.setSummary,setSelectedJob:t.setSelectedJob,navigate:n,refreshProjectsAndPrices:l,refreshJobPrices:p});return a?Tt`<${ai} bootStatus=${u} loadProgress=${i} />`:r?Tt`<${si} error=${r} />`:Tt`
    <${Ma} summary=${t.summary} dataRange=${t.dataRange} />
    ${ci({route:y,summary:t.summary,projects:t.projects,setProjects:t.setProjects,jobs:t.jobs,projectsLoading:s,navigate:n,setSelectedJob:t.setSelectedJob,handleJobProjectChange:$,handleRatesChanged:h,handleAutoGroup:w,projectPrices:t.projectPrices,q:t.q,setQ:t.setQ,statusFilter:t.statusFilter,setStatusFilter:t.setStatusFilter,deviceFilter:t.deviceFilter,setDeviceFilter:t.setDeviceFilter,devices:d,view:t.view,setView:t.setView,density:t.density,setDensity:t.setDensity,filtered:c,isFiltered:o,sorted:m,sortCol:t.sortCol,sortDir:t.sortDir,handleSort:v})}
    <${fi}
      selectedJob=${t.selectedJob}
      closeModal=${_}
      patchJob=${g}
      projects=${t.projects}
      handleJobProjectChange=${$}
      handleJobStatusChange=${b}
      handleJobExtraLaborChange=${P}
      handleNavigateToProject=${k}
    />
    <${Zn} />
  `}const hi=Tt`<${Qe} base="/ui"><${gi} /></${Qe}>`;qn(hi,document.getElementById("app"));
