(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();var Qt,N,Ze,rt,xe,tn,en,ne,Ut,Ft,nn,fe,oe,le,an,Ht={},qt=[],En=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Vt=Array.isArray;function Z(t,e){for(var n in e)t[n]=e[n];return t}function ve(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function L(t,e,n){var a,i,s,r={};for(s in e)s=="key"?a=e[s]:s=="ref"?i=e[s]:r[s]=e[s];if(arguments.length>2&&(r.children=arguments.length>3?Qt.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(s in t.defaultProps)r[s]===void 0&&(r[s]=t.defaultProps[s]);return At(t,r,a,i,null)}function At(t,e,n,a,i){var s={type:t,props:e,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:i??++Ze,__i:-1,__u:0};return i==null&&N.vnode!=null&&N.vnode(s),s}function Gt(t){return t.children}function Rt(t,e){this.props=t,this.context=e}function gt(t,e){if(e==null)return t.__?gt(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?gt(t):null}function Bn(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,a=[],i=[],s=Z({},e);s.__v=e.__v+1,N.vnode&&N.vnode(s),ge(t.__P,s,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,a,n??gt(e),!!(32&e.__u),i),s.__v=e.__v,s.__.__k[s.__i]=s,ln(a,s,i),e.__e=e.__=null,s.__e!=n&&sn(s)}}function sn(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),sn(t)}function ce(t){(!t.__d&&(t.__d=!0)&&rt.push(t)&&!Wt.__r++||xe!=N.debounceRendering)&&((xe=N.debounceRendering)||tn)(Wt)}function Wt(){try{for(var t,e=1;rt.length;)rt.length>e&&rt.sort(en),t=rt.shift(),e=rt.length,Bn(t)}finally{rt.length=Wt.__r=0}}function rn(t,e,n,a,i,s,r,u,d,p,c){var o,l,m,v,y,_,g,$=a&&a.__k||qt,b=e.length;for(d=Un(n,e,$,d,b),o=0;o<b;o++)(m=n.__k[o])!=null&&(l=m.__i!=-1&&$[m.__i]||Ht,m.__i=o,_=ge(t,m,l,i,s,r,u,d,p,c),v=m.__e,m.ref&&l.ref!=m.ref&&(l.ref&&he(l.ref,null,m),c.push(m.ref,m.__c||v,m)),y==null&&v!=null&&(y=v),(g=!!(4&m.__u))||l.__k===m.__k?(d=on(m,d,t,g),g&&l.__e&&(l.__e=null)):typeof m.type=="function"&&_!==void 0?d=_:v&&(d=v.nextSibling),m.__u&=-7);return n.__e=y,d}function Un(t,e,n,a,i){var s,r,u,d,p,c=n.length,o=c,l=0;for(t.__k=new Array(i),s=0;s<i;s++)(r=e[s])!=null&&typeof r!="boolean"&&typeof r!="function"?(typeof r=="string"||typeof r=="number"||typeof r=="bigint"||r.constructor==String?r=t.__k[s]=At(null,r,null,null,null):Vt(r)?r=t.__k[s]=At(Gt,{children:r},null,null,null):r.constructor===void 0&&r.__b>0?r=t.__k[s]=At(r.type,r.props,r.key,r.ref?r.ref:null,r.__v):t.__k[s]=r,d=s+l,r.__=t,r.__b=t.__b+1,u=null,(p=r.__i=An(r,n,d,o))!=-1&&(o--,(u=n[p])&&(u.__u|=2)),u==null||u.__v==null?(p==-1&&(i>c?l--:i<c&&l++),typeof r.type!="function"&&(r.__u|=4)):p!=d&&(p==d-1?l--:p==d+1?l++:(p>d?l--:l++,r.__u|=4))):t.__k[s]=null;if(o)for(s=0;s<c;s++)(u=n[s])!=null&&(2&u.__u)==0&&(u.__e==a&&(a=gt(u)),dn(u,u));return a}function on(t,e,n,a){var i,s;if(typeof t.type=="function"){for(i=t.__k,s=0;i&&s<i.length;s++)i[s]&&(i[s].__=t,e=on(i[s],e,n,a));return e}t.__e!=e&&(a&&(e&&t.type&&!e.parentNode&&(e=gt(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function An(t,e,n,a){var i,s,r,u=t.key,d=t.type,p=e[n],c=p!=null&&(2&p.__u)==0;if(p===null&&u==null||c&&u==p.key&&d==p.type)return n;if(a>(c?1:0)){for(i=n-1,s=n+1;i>=0||s<e.length;)if((p=e[r=i>=0?i--:s++])!=null&&(2&p.__u)==0&&u==p.key&&d==p.type)return r}return-1}function De(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||En.test(e)?n:n+"px"}function Dt(t,e,n,a,i){var s,r;t:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof a=="string"&&(t.style.cssText=a=""),a)for(e in a)n&&e in n||De(t.style,e,"");if(n)for(e in n)a&&n[e]==a[e]||De(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")s=e!=(e=e.replace(nn,"$1")),r=e.toLowerCase(),e=r in t||e=="onFocusOut"||e=="onFocusIn"?r.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+s]=n,n?a?n[Ft]=a[Ft]:(n[Ft]=fe,t.addEventListener(e,s?le:oe,s)):t.removeEventListener(e,s?le:oe,s);else{if(i=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break t}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function Je(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[Ut]==null)e[Ut]=fe++;else if(e[Ut]<n[Ft])return;return n(N.event?N.event(e):e)}}}function ge(t,e,n,a,i,s,r,u,d,p){var c,o,l,m,v,y,_,g,$,b,P,C,h,w,I,T=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[u=e.__e=n.__e]),(c=N.__b)&&c(e);t:if(typeof T=="function")try{if(g=e.props,$=T.prototype&&T.prototype.render,b=(c=T.contextType)&&a[c.__c],P=c?b?b.props.value:c.__:a,n.__c?_=(o=e.__c=n.__c).__=o.__E:($?e.__c=o=new T(g,P):(e.__c=o=new Rt(g,P),o.constructor=T,o.render=On),b&&b.sub(o),o.state||(o.state={}),o.__n=a,l=o.__d=!0,o.__h=[],o._sb=[]),$&&o.__s==null&&(o.__s=o.state),$&&T.getDerivedStateFromProps!=null&&(o.__s==o.state&&(o.__s=Z({},o.__s)),Z(o.__s,T.getDerivedStateFromProps(g,o.__s))),m=o.props,v=o.state,o.__v=e,l)$&&T.getDerivedStateFromProps==null&&o.componentWillMount!=null&&o.componentWillMount(),$&&o.componentDidMount!=null&&o.__h.push(o.componentDidMount);else{if($&&T.getDerivedStateFromProps==null&&g!==m&&o.componentWillReceiveProps!=null&&o.componentWillReceiveProps(g,P),e.__v==n.__v||!o.__e&&o.shouldComponentUpdate!=null&&o.shouldComponentUpdate(g,o.__s,P)===!1){e.__v!=n.__v&&(o.props=g,o.state=o.__s,o.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(H){H&&(H.__=e)}),qt.push.apply(o.__h,o._sb),o._sb=[],o.__h.length&&r.push(o);break t}o.componentWillUpdate!=null&&o.componentWillUpdate(g,o.__s,P),$&&o.componentDidUpdate!=null&&o.__h.push(function(){o.componentDidUpdate(m,v,y)})}if(o.context=P,o.props=g,o.__P=t,o.__e=!1,C=N.__r,h=0,$)o.state=o.__s,o.__d=!1,C&&C(e),c=o.render(o.props,o.state,o.context),qt.push.apply(o.__h,o._sb),o._sb=[];else do o.__d=!1,C&&C(e),c=o.render(o.props,o.state,o.context),o.state=o.__s;while(o.__d&&++h<25);o.state=o.__s,o.getChildContext!=null&&(a=Z(Z({},a),o.getChildContext())),$&&!l&&o.getSnapshotBeforeUpdate!=null&&(y=o.getSnapshotBeforeUpdate(m,v)),w=c!=null&&c.type===Gt&&c.key==null?cn(c.props.children):c,u=rn(t,Vt(w)?w:[w],e,n,a,i,s,r,u,d,p),o.base=e.__e,e.__u&=-161,o.__h.length&&r.push(o),_&&(o.__E=o.__=null)}catch(H){if(e.__v=null,d||s!=null)if(H.then){for(e.__u|=d?160:128;u&&u.nodeType==8&&u.nextSibling;)u=u.nextSibling;s[s.indexOf(u)]=null,e.__e=u}else{for(I=s.length;I--;)ve(s[I]);de(e)}else e.__e=n.__e,e.__k=n.__k,H.then||de(e);N.__e(H,e,n)}else s==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):u=e.__e=Rn(n.__e,e,n,a,i,s,r,d,p);return(c=N.diffed)&&c(e),128&e.__u?void 0:u}function de(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(de))}function ln(t,e,n){for(var a=0;a<n.length;a++)he(n[a],n[++a],n[++a]);N.__c&&N.__c(e,t),t.some(function(i){try{t=i.__h,i.__h=[],t.some(function(s){s.call(i)})}catch(s){N.__e(s,i.__v)}})}function cn(t){return typeof t!="object"||t==null||t.__b>0?t:Vt(t)?t.map(cn):Z({},t)}function Rn(t,e,n,a,i,s,r,u,d){var p,c,o,l,m,v,y,_=n.props||Ht,g=e.props,$=e.type;if($=="svg"?i="http://www.w3.org/2000/svg":$=="math"?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),s!=null){for(p=0;p<s.length;p++)if((m=s[p])&&"setAttribute"in m==!!$&&($?m.localName==$:m.nodeType==3)){t=m,s[p]=null;break}}if(t==null){if($==null)return document.createTextNode(g);t=document.createElementNS(i,$,g.is&&g),u&&(N.__m&&N.__m(e,s),u=!1),s=null}if($==null)_===g||u&&t.data==g||(t.data=g);else{if(s=s&&Qt.call(t.childNodes),!u&&s!=null)for(_={},p=0;p<t.attributes.length;p++)_[(m=t.attributes[p]).name]=m.value;for(p in _)m=_[p],p=="dangerouslySetInnerHTML"?o=m:p=="children"||p in g||p=="value"&&"defaultValue"in g||p=="checked"&&"defaultChecked"in g||Dt(t,p,null,m,i);for(p in g)m=g[p],p=="children"?l=m:p=="dangerouslySetInnerHTML"?c=m:p=="value"?v=m:p=="checked"?y=m:u&&typeof m!="function"||_[p]===m||Dt(t,p,m,_[p],i);if(c)u||o&&(c.__html==o.__html||c.__html==t.innerHTML)||(t.innerHTML=c.__html),e.__k=[];else if(o&&(t.innerHTML=""),rn(e.type=="template"?t.content:t,Vt(l)?l:[l],e,n,a,$=="foreignObject"?"http://www.w3.org/1999/xhtml":i,s,r,s?s[0]:n.__k&&gt(n,0),u,d),s!=null)for(p=s.length;p--;)ve(s[p]);u||(p="value",$=="progress"&&v==null?t.removeAttribute("value"):v!=null&&(v!==t[p]||$=="progress"&&!v||$=="option"&&v!=_[p])&&Dt(t,p,v,_[p],i),p="checked",y!=null&&y!=t[p]&&Dt(t,p,y,_[p],i))}return t}function he(t,e,n){try{if(typeof t=="function"){var a=typeof t.__u=="function";a&&t.__u(),a&&e==null||(t.__u=t(e))}else t.current=e}catch(i){N.__e(i,n)}}function dn(t,e,n){var a,i;if(N.unmount&&N.unmount(t),(a=t.ref)&&(a.current&&a.current!=t.__e||he(a,null,e)),(a=t.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){N.__e(s,e)}a.base=a.__P=null}if(a=t.__k)for(i=0;i<a.length;i++)a[i]&&dn(a[i],e,n||typeof t.type!="function");n||ve(t.__e),t.__c=t.__=t.__e=void 0}function On(t,e,n){return this.constructor(t,n)}function Hn(t,e,n){var a,i,s,r;e==document&&(e=document.documentElement),N.__&&N.__(t,e),i=(a=!1)?null:e.__k,s=[],r=[],ge(e,t=e.__k=L(Gt,null,[t]),i||Ht,Ht,e.namespaceURI,i?null:e.firstChild?Qt.call(e.childNodes):null,s,i?i.__e:e.firstChild,a,r),ln(s,t,r)}function qn(t){function e(n){var a,i;return this.getChildContext||(a=new Set,(i={})[e.__c]=this,this.getChildContext=function(){return i},this.componentWillUnmount=function(){a=null},this.shouldComponentUpdate=function(s){this.props.value!=s.value&&a.forEach(function(r){r.__e=!0,ce(r)})},this.sub=function(s){a.add(s);var r=s.componentWillUnmount;s.componentWillUnmount=function(){a&&a.delete(s),r&&r.call(s)}}),n.children}return e.__c="__cC"+an++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,a){return n.children(a)}).contextType=e,e}Qt=qt.slice,N={__e:function(t,e,n,a){for(var i,s,r;e=e.__;)if((i=e.__c)&&!i.__)try{if((s=i.constructor)&&s.getDerivedStateFromError!=null&&(i.setState(s.getDerivedStateFromError(t)),r=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(t,a||{}),r=i.__d),r)return i.__E=i}catch(u){t=u}throw t}},Ze=0,Rt.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=Z({},this.state),typeof t=="function"&&(t=t(Z({},n),this.props)),t&&Z(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),ce(this))},Rt.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),ce(this))},Rt.prototype.render=Gt,rt=[],tn=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,en=function(t,e){return t.__v.__b-e.__v.__b},Wt.__r=0,ne=Math.random().toString(8),Ut="__d"+ne,Ft="__a"+ne,nn=/(PointerCapture)$|Capture$/i,fe=0,oe=Je(!1),le=Je(!0),an=0;var ht,x,ae,Ee,Nt=0,un=[],B=N,Be=B.__b,Ue=B.__r,Ae=B.diffed,Re=B.__c,Oe=B.unmount,He=B.__;function zt(t,e){B.__h&&B.__h(x,t,Nt||e),Nt=0;var n=x.__H||(x.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function f(t){return Nt=1,Wn(_n,t)}function Wn(t,e,n){var a=zt(ht++,2);if(a.t=t,!a.__c&&(a.__=[_n(void 0,e),function(u){var d=a.__N?a.__N[0]:a.__[0],p=a.t(d,u);d!==p&&(a.__N=[p,a.__[1]],a.__c.setState({}))}],a.__c=x,!x.__f)){var i=function(u,d,p){if(!a.__c.__H)return!0;var c=a.__c.__H.__.filter(function(l){return l.__c});if(c.every(function(l){return!l.__N}))return!s||s.call(this,u,d,p);var o=a.__c.props!==u;return c.some(function(l){if(l.__N){var m=l.__[0];l.__=l.__N,l.__N=void 0,m!==l.__[0]&&(o=!0)}}),s&&s.call(this,u,d,p)||o};x.__f=!0;var s=x.shouldComponentUpdate,r=x.componentWillUpdate;x.componentWillUpdate=function(u,d,p){if(this.__e){var c=s;s=void 0,i(u,d,p),s=c}r&&r.call(this,u,d,p)},x.shouldComponentUpdate=i}return a.__N||a.__}function O(t,e){var n=zt(ht++,3);!B.__s&&mn(n.__H,e)&&(n.__=t,n.u=e,x.__H.__h.push(n))}function pn(t){return Nt=5,Q(function(){return{current:t}},[])}function Q(t,e){var n=zt(ht++,7);return mn(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function S(t,e){return Nt=8,Q(function(){return t},e)}function Qn(t){var e=x.context[t.__c],n=zt(ht++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(x)),e.props.value):t.__}function Vn(){for(var t;t=un.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(Ot),e.__h.some(ue),e.__h=[]}catch(n){e.__h=[],B.__e(n,t.__v)}}}B.__b=function(t){x=null,Be&&Be(t)},B.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),He&&He(t,e)},B.__r=function(t){Ue&&Ue(t),ht=0;var e=(x=t.__c).__H;e&&(ae===x?(e.__h=[],x.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(Ot),e.__h.some(ue),e.__h=[],ht=0)),ae=x},B.diffed=function(t){Ae&&Ae(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(un.push(e)!==1&&Ee===B.requestAnimationFrame||((Ee=B.requestAnimationFrame)||Gn)(Vn)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),ae=x=null},B.__c=function(t,e){e.some(function(n){try{n.__h.some(Ot),n.__h=n.__h.filter(function(a){return!a.__||ue(a)})}catch(a){e.some(function(i){i.__h&&(i.__h=[])}),e=[],B.__e(a,n.__v)}}),Re&&Re(t,e)},B.unmount=function(t){Oe&&Oe(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(a){try{Ot(a)}catch(i){e=i}}),n.__H=void 0,e&&B.__e(e,n.__v))};var qe=typeof requestAnimationFrame=="function";function Gn(t){var e,n=function(){clearTimeout(a),qe&&cancelAnimationFrame(e),setTimeout(t)},a=setTimeout(n,35);qe&&(e=requestAnimationFrame(n))}function Ot(t){var e=x,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),x=e}function ue(t){var e=x;t.__c=t.__(),x=e}function mn(t,e){return!t||t.length!==e.length||e.some(function(n,a){return n!==t[a]})}function _n(t,e){return typeof e=="function"?e(t):e}var $n=function(t,e,n,a){var i;e[0]=0;for(var s=1;s<e.length;s++){var r=e[s++],u=e[s]?(e[0]|=r?1:2,n[e[s++]]):e[++s];r===3?a[0]=u:r===4?a[1]=Object.assign(a[1]||{},u):r===5?(a[1]=a[1]||{})[e[++s]]=u:r===6?a[1][e[++s]]+=u+"":r?(i=t.apply(u,$n(t,u,n,["",null])),a.push(i),u[0]?e[0]|=2:(e[s-2]=0,e[s]=i)):a.push(u)}return a},We=new Map;function j(t){var e=We.get(this);return e||(e=new Map,We.set(this,e)),(e=$n(this,e.get(t)||(e.set(t,e=(function(n){for(var a,i,s=1,r="",u="",d=[0],p=function(l){s===1&&(l||(r=r.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,l,r):s===3&&(l||r)?(d.push(3,l,r),s=2):s===2&&r==="..."&&l?d.push(4,l,0):s===2&&r&&!l?d.push(5,0,!0,r):s>=5&&((r||!l&&s===5)&&(d.push(s,0,r,i),s=6),l&&(d.push(s,l,0,i),s=6)),r=""},c=0;c<n.length;c++){c&&(s===1&&p(),p(c));for(var o=0;o<n[c].length;o++)a=n[c][o],s===1?a==="<"?(p(),d=[d],s=3):r+=a:s===4?r==="--"&&a===">"?(s=1,r=""):r=a+r[0]:u?a===u?u="":r+=a:a==='"'||a==="'"?u=a:a===">"?(p(),s=1):s&&(a==="="?(s=5,i=r,r=""):a==="/"&&(s<5||n[c][o+1]===">")?(p(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(p(),s=2):r+=a),s===3&&r==="!--"&&(s=4,d=d[0])}return p(),d})(t)),e),arguments,[])).length>1?e:e[0]}const zn=j.bind(L),pe=qn(null);function Qe({base:t,children:e}){const n=t.endsWith("/")?t.slice(0,-1):t,a=u=>u===n||u===n+"/"?"/":u.startsWith(n+"/")?u.slice(n.length)||"/":u,[i,s]=f(()=>a(location.pathname));O(()=>{const u=()=>s(a(location.pathname));return window.addEventListener("popstate",u),()=>window.removeEventListener("popstate",u)},[n]);const r=S(u=>{const d=u==="/"?n+"/":n+u;history.pushState(null,"",d),s(u)},[n]);return zn`<${pe.Provider} value=${[i,r]}>${e}</${pe.Provider}>`}function be(){const t=Qn(pe);if(!t)throw new Error("useLocation must be used within RouterProvider");return t}function nt(t){if(!t)return"—";const e=Math.floor(t/3600),n=Math.floor(t%3600/60);return e===0?`${n}m`:`${e}h${n>0?` ${n}m`:""}`}function ye(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"};return e.toLocaleString(void 0,a)}function et(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric"}:{month:"short",day:"numeric",year:"2-digit"};return e.toLocaleDateString(void 0,a)}function A(t){return"$"+t.toFixed(2)}function bt(t){return t==null?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function Pe(t){return t?t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${Math.round(t)} g`:"0 g"}const ut=j.bind(L),Kn={finish:"badge badge-finish",running:"badge badge-running",failed:"badge badge-failed",cancel:"badge badge-cancel",pause:"badge badge-pause"};function Mt({status:t}){const e=(t||"").toLowerCase();return ut`<span class=${Kn[e]||"badge badge-default"}>${e||"unknown"}</span>`}function Kt({url:t}){const[e,n]=f(!1);return!t||e?ut`<div class="row-thumb-ph">🖨</div>`:ut`<img
    class="row-thumb"
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>n(!0)}
  />`}function Yn({url:t,className:e}){const[n,a]=f(!1);return!t||n?ut`<div class="cover-placeholder">🖨</div>`:ut`<img
    class=${e}
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>a(!0)}
  />`}function Yt({colors:t}){if(!(t!=null&&t.length))return null;const e=[...new Set(t.map(n=>n.slice(0,6).toUpperCase()))].filter(n=>n!=="FFFFFF");return e.length?ut`<span class="swatches"
    >${e.map(n=>ut`<span class="swatch" style=${"background:#"+n} title=${"#"+n} />`)}</span
  >`:null}const Ve=j.bind(L);let fn=()=>{};function F(t,e="info"){fn({message:t,type:e,id:Date.now()+Math.random()})}function Xn(){const[t,e]=f([]),n=pn(new Map);fn=S(i=>{e(r=>[...r,i]);const s=setTimeout(()=>{e(r=>r.filter(u=>u.id!==i.id)),n.current.delete(i.id)},3500);n.current.set(i.id,s)},[]);const a=S(i=>{const s=n.current.get(i);s&&clearTimeout(s),n.current.delete(i),e(r=>r.filter(u=>u.id!==i))},[]);return t.length?Ve`
    <div class="toast-container">
      ${t.map(i=>Ve`
          <div class="toast toast-${i.type}" key=${i.id} onClick=${()=>a(i.id)}>
            ${i.message}
          </div>
        `)}
    </div>
  `:null}const Zn=15e3,ta=2e4,ea=5,we=[{id:"personal",label:"Personal"},{id:"booth",label:"Booth"},{id:"etsy",label:"Etsy"},{id:"custom",label:"Custom"}];async function na(t,e){try{const n=await t.json();return typeof n.error=="string"?n.error:e}catch{return e}}function aa(t){const{timeoutMs:e=Zn,...n}=t??{};return n.signal||e===null?n:{signal:AbortSignal.timeout(e),...n}}function ia(t,e){return(t==null?void 0:t.name)==="TimeoutError"?new Error(`${e} (request timed out)`):new Error(`${e} (network error)`)}async function G(t,e,n){let a;try{a=await fetch(t,aa(n))}catch(i){throw ia(i,e)}if(!a.ok)throw new Error(await na(a,e));return await a.json()}async function ke(t,e,n){try{return{data:await G(t,e,n),error:null}}catch(a){return{data:null,error:a instanceof Error?a:new Error(e)}}}async function pt(t,e,n){const{data:a,error:i}=await ke(t,e,n);return i?(F(i.message||e,"error"),null):a}async function tt(t,e,n){return pt(t,n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}async function Y(t,e,n,a){return pt(t,n,{...a,method:"POST",headers:{"Content-Type":"application/json",...a==null?void 0:a.headers},body:JSON.stringify(e)})}async function sa(){return(await G("/api/projects","Failed to load projects.")).projects}async function ra(t){return G(`/jobs/${t}`,"Failed to load job details.")}async function Ce(){return(await G("/api/products","Failed to load products.")).products}async function oa(t){return(await G(`/api/products/${t}`,"Failed to load product.")).product}async function la(){return(await G("/api/products/print-next","Failed to load print-next products.")).products}async function ca(t){const e=await Y("/api/products",t,"Failed to create product.");return(e==null?void 0:e.product)??null}async function da(t){const e=await Y(`/api/products/from-job/${t}`,{},"Failed to create product from job.");return(e==null?void 0:e.product)??null}async function vn(t){const e=await Y(`/api/products/from-project/${t}`,{},"Failed to create product from project.");return(e==null?void 0:e.product)??null}async function Se(t,e){const n=await tt(`/api/products/${t}`,e,"Failed to update product.");return(n==null?void 0:n.product)??null}async function ua(){return(await G("/api/batches","Failed to load batches.")).batches}async function pa(t){return(await G(`/api/batches/${t}`,"Failed to load batch.")).batch}async function ma(t){const e=await Y("/api/batches",t,"Failed to create batch.");return(e==null?void 0:e.batch)??null}async function _a(t,e){const n=await tt(`/api/batches/${t}`,e,"Failed to update batch.");return(n==null?void 0:n.batch)??null}async function $a(t,e){const n=await Y(`/api/batches/${t}/projects/${e}`,{},"Failed to add project jobs to batch.");return(n==null?void 0:n.batch)??null}function Xt(t){return t!=null}function me(t,e){return(t==null?void 0:t.trim())||e}function fa(t){if(!t)return"—";const e=new Date(t);return Number.isNaN(e.getTime())?t:e.toLocaleString()}function _e(t){if(!Xt(t)||t<=0)return"—";const e=Math.round(t/60),n=Math.floor(e/60),a=e%60;return n===0?`${a}m`:a===0?`${n}h`:`${n}h ${a}m`}function $e(t){return!Xt(t)||t<=0?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function gn(t){return Xt(t)?`$${t.toFixed(2)}`:"—"}function R(t,e){return`- ${t}: ${Xt(e)&&e!==""?e:"—"}`}function va(t){return[`## ${me(t.designTitle,`Print Job #${t.id}`)}`,R("Job ID",t.id),R("Status",t.status),R("Customer",t.customer),R("Printer",t.deviceModel),R("Printed",fa(t.startTime)),R("Plates",t.plate_count),R("Print run",t.print_run),R("Filament",$e(t.total_weight_g)),R("Print time",_e(t.total_time_s)),R("Estimated price",gn(t.final_price))].join(`
`)}function hn(t,e=[]){var i;const n=[`## ${me(t.name,`Project #${t.id}`)}`,R("Project ID",t.id),R("Customer",t.customer),R("Jobs",t.job_count??e.length),R("Plates",t.total_plates),R("Filament",$e(t.total_weight_g)),R("Print time",_e(t.total_time_s))],a=(i=t.notes)==null?void 0:i.trim();if(a&&n.push(R("Notes",a)),e.length>0){n.push("","### Prints");for(const s of e)n.push(`- ${me(s.designTitle,`Job #${s.id}`)} — ${$e(s.total_weight_g)}, ${_e(s.total_time_s)}, ${gn(s.final_price)}`)}return n.join(`
`)}async function Fe(t){var e;if(!((e=navigator.clipboard)!=null&&e.writeText))throw new Error("Clipboard API is unavailable in this browser context.");await navigator.clipboard.writeText(t)}const q=j.bind(L);function ga(t){const e=t.toLowerCase();return e.includes("a1 mini")?"/ui/printers/a1-mini":e.includes("p1s")?"/ui/printers/p1s":null}function ha(t){const e=new Map;for(const n of t){const a=n.deviceModel||"Unknown printer",i=e.get(a)??[];i.push(n),e.set(a,i)}return e}function bn(t,e=6){return t.slice().sort((n,a)=>String(a.startTime||"").localeCompare(String(n.startTime||""))).slice(0,e)}function yn({printerName:t}){const e=ga(t);return e?q`<img class="printer-photo" src=${e} alt=${t} />`:q`<div class="printer-photo">🖨️</div>`}function Pn({job:t,onJobClick:e}){return q`
    <article class="printer-job-row" key=${t.id} onClick=${()=>e(t)}>
      <div class="printer-job-top">
        <div class="td-thumb"><${Kt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title">${t.designTitle||"Untitled Job"}</span>
          <${Yt} colors=${t.filament_colors} />
        </div>
        <${Mt} status=${t.status} />
      </div>
      <div class="printer-job-bottom">
        <span>${et(t.startTime)}</span>
        <span>Filament: <strong>${bt(t.total_weight_g)}</strong></span>
        <span>Time: <strong>${nt(t.total_time_s)}</strong></span>
      </div>
    </article>
  `}function ba({row:t,jobs:e,onJobClick:n}){const a=t.deviceModel||"Unknown printer",i=bn(e);return q`
    <section class="printer-card" key=${a}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${yn} printerName=${a} />
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
        ${i.length?i.map(s=>q`<${Pn} key=${s.id} job=${s} onJobClick=${n} />`):q`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function ya({printer:t,jobs:e,onJobClick:n,onToggleActive:a}){const i=t.name||t.model||t.provider_printer_id,s=bn(e),r=t.is_active===1;return q`
    <section class=${"printer-card"+(r?"":" is-retired")} key=${t.id}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${yn} printerName=${t.model||i} />
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
        ${s.length?s.map(u=>q`<${Pn} key=${u.id} job=${u} onJobClick=${n} />`):q`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function Pa(t,e){return e.filter(n=>n.printer_id===t.id)}function wa({summary:t,jobs:e,onJobClick:n}){const[a,i]=f([]);O(()=>{pt("/printers","Failed to load printer inventory.").then(d=>{d&&i(d.printers)})},[]);const s=async d=>{const p=await tt(`/printers/${d.id}`,{is_active:d.is_active!==1},"Failed to update printer inventory.");p!=null&&p.printer&&i(c=>c.map(o=>o.id===d.id?p.printer:o))};if(a.length)return q`
      <div class="printer-grid">
        ${a.map(d=>q`<${ya}
              key=${d.id}
              printer=${d}
              jobs=${Pa(d,e)}
              onJobClick=${n}
              onToggleActive=${s}
            />`)}
      </div>
    `;const r=(t==null?void 0:t.by_device)??[];if(!r.length)return q`<div class="empty">No printer totals available yet.</div>`;const u=ha(e);return q`
    <div class="printer-grid">
      ${r.map(d=>q`<${ba}
            key=${d.deviceModel||"Unknown printer"}
            row=${d}
            jobs=${u.get(d.deviceModel||"Unknown printer")??[]}
            onJobClick=${n}
          />`)}
    </div>
  `}const J=j.bind(L);function ka(t){return!t.startsWith("/projects")&&!t.startsWith("/admin")&&!t.startsWith("/printers")&&!t.startsWith("/catalog")&&!t.startsWith("/products")&&!t.startsWith("/batches")}function Ca(t,e){const n=new URLSearchParams;t&&n.set("status",t),e&&n.set("device",e);const a=n.toString();return"/jobs/export.csv"+(a?"?"+a:"")}function Sa(t){return t.reduce((e,n)=>(e.weight+=n.total_weight_g||0,e.time+=n.total_time_s||0,e),{weight:0,time:0})}function Fa(t){return!t||t==="actual"?null:t==="slicer_estimate"?"estimate":t==="manual"?"manual":"unknown"}function wn({confidence:t}){const e=Fa(t);return e?J`<span class="usage-confidence">${e}</span>`:null}const Ia=[{label:"Jobs",path:"/",active:ka},{label:"Projects",path:"/projects",active:t=>t.startsWith("/projects")},{label:"Printers",path:"/printers",active:t=>t.startsWith("/printers")},{label:"Products",path:"/products/pipeline",active:t=>t.startsWith("/products")},{label:"Batches",path:"/batches",active:t=>t.startsWith("/batches")},{label:"Catalog",path:"/catalog",active:t=>t.startsWith("/catalog")},{label:"Rates",path:"/admin",active:t=>t.startsWith("/admin")}],Ta=[["","All Statuses"],["finish","Finished"],["cancel","Cancelled"],["running","Running"],["failed","Failed"],["pause","Paused"]];function ie(t,e){const n=(t==null?void 0:t.by_device)??[];return n.length?n.map(a=>{const i=a.deviceModel||"Unknown printer";return e==="jobs"?`${i}: ${(a.total_jobs??0).toLocaleString()} jobs`:e==="plates"?`${i}: ${(a.total_plates??0).toLocaleString()} plates`:`${i}: ${((a.total_time_s??0)/3600).toFixed(1).toLocaleString()} h`}).join(`
`):"No printer breakdown available"}function Na({loc:t,navigate:e}){return J`<nav class="top-nav">
    ${Ia.map(n=>{const a=n.active(t);return J`
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
      <div class="stat" title=${ie(t,"jobs")}>
        <div class="stat-val">${e?(n=e.total_jobs)==null?void 0:n.toLocaleString():"—"}</div>
        <div class="stat-lbl">Total Jobs</div>
      </div>
      <div class="stat">
        <div class="stat-val">${e?((e.total_weight_g??0)/1e3).toFixed(2):"—"}</div>
        <div class="stat-lbl">Filament kg</div>
      </div>
      <div class="stat" title=${ie(t,"hours")}>
        <div class="stat-val">${e?((e.total_time_s??0)/3600).toFixed(1):"—"}</div>
        <div class="stat-lbl">Print Hours</div>
      </div>
      <div class="stat" title=${ie(t,"plates")}>
        <div class="stat-val">${e?(a=e.total_plates)==null?void 0:a.toLocaleString():"—"}</div>
        <div class="stat-lbl">Plates</div>
      </div>
    </div>
  `}function Ma({summary:t,dataRange:e}){const[n,a]=be(),i=!!(e!=null&&e.min_start&&(e!=null&&e.max_start)),s=(e==null?void 0:e.min_start)??"",r=(e==null?void 0:e.max_start)??"";return J`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>PrintWorks</span></h1>
        ${i&&J`<div class="header-range">
          History: ${et(s)} → ${et(r)}
          (${((e==null?void 0:e.task_count)||0).toLocaleString()} tasks)
        </div>`}
        <${Na} loc=${n} navigate=${a} />
      </div>
      <${La} summary=${t} />
    </header>
  `}function ja({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:i,setDeviceFilter:s,devices:r,view:u,setView:d,density:p,setDensity:c,filteredCount:o,totalCount:l}){const m=Q(()=>Ca(n,i),[n,i]);return J`
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
        ${Ta.map(([v,y])=>J`<option key=${v} value=${v}>${y}</option> `)}
      </select>
      <select
        value=${i}
        onChange=${v=>s(v.target.value)}
      >
        <option value="">All Printers</option>
        ${r.map(v=>J`<option key=${v} value=${v}>${v}</option> `)}
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
        <a class="btn-csv" href=${m} download>↓ CSV</a>
        <span class="job-count">${o} / ${l} jobs</span>
      </div>
    </div>
  `}function xa({filtered:t,isFiltered:e}){if(!e||!t.length)return null;const n=Sa(t);return J`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${t.length}</strong></span>
      <span>Filament: <strong>${Pe(n.weight)}</strong></span>
      <span>Print time: <strong>${nt(n.time)}</strong></span>
    </div>
  `}function kn({printRun:t}){return(t??1)<=1?null:J`<span class="run-badge">Run ${t}</span>`}function Da(t,e){return t?e==="asc"?" ↑":" ↓":""}function Ja({sortCol:t,sortDir:e,onSort:n}){return J`<div class="jobs-record-sortbar">
    <span class="jobs-record-sort-label">Sort</span>
    ${[{col:"startTime",label:"Date"},{col:"designTitle",label:"Title"},{col:"deviceModel",label:"Printer"},{col:"total_weight_g",label:"Filament"},{col:"total_time_s",label:"Time"},{col:"final_price",label:"Price"}].map(({col:i,label:s})=>{const r=t===i;return J`
        <button
          key=${i}
          class=${"jobs-record-sort-btn"+(r?" active":"")}
          onClick=${()=>n(i)}
        >
          ${s}${Da(r,e)}
        </button>
      `})}
  </div>`}async function Cn(t,e){e.stopPropagation();try{await Fe(va(t)),F("Print details copied.","success")}catch(n){F(n instanceof Error?n.message:"Failed to copy print details.","error")}}function Ea({job:t,onJobClick:e}){return J`
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
        <div><${Mt} status=${t.status} /></div>
      </div>
      <div class="jobs-record-bottom">
        <span>🖨 ${t.deviceModel||"—"}</span>
        <span title=${ye(t.startTime)}>📅 ${et(t.startTime)}</span>
        <span
          >🧵 <strong>${bt(t.total_weight_g)}</strong>
          <${wn} confidence=${t.material_usage_confidence} />
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
          onClick=${n=>Cn(t,n)}
        >
          Copy
        </button>
      </div>
    </article>
  `}function Ba({sorted:t,sortCol:e,sortDir:n,onSort:a,onJobClick:i,density:s}){return J`
    <div class=${"jobs-record-list-wrap density-"+s}>
      <${Ja} sortCol=${e} sortDir=${n} onSort=${a} />
      <div class="jobs-record-list">
        ${t.map(r=>J`<${Ea} key=${r.id} job=${r} onJobClick=${i} />`)}
      </div>
    </div>
  `}function Ua({job:t,onJobClick:e}){const n=async a=>{a.stopPropagation();const i=await da(t.id);i&&F(`Created product: ${i.name}`,"success")};return J`
    <div class="card" onClick=${()=>e(t)}>
      <${Yn} url=${t.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${t.designTitle||"Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${t.deviceModel||"—"}</span>
          <span>📅 ${et(t.startTime)}</span>
          <span>⏱ ${nt(t.total_time_s)}</span>
          <span
            >🧵 ${bt(t.total_weight_g)}
            <${wn} confidence=${t.material_usage_confidence} />
          </span>
          ${t.final_price!==null&&t.final_price!==void 0&&J`<span>💰 ${A(t.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${Mt} status=${t.status} />
          <${kn} printRun=${t.print_run} />
          ${t.customer&&J`<span class="customer-pill">${t.customer}</span>`}
          <${Yt} colors=${t.filament_colors} />
          <button
            class="btn-secondary btn-compact"
            type="button"
            onClick=${a=>Cn(t,a)}
          >
            Copy
          </button>
          <button class="btn-secondary btn-compact" type="button" onClick=${n}>
            Create product
          </button>
        </div>
      </div>
    </div>
  `}function Aa({sorted:t,onJobClick:e,density:n}){return J`
    <div class=${"grid-view density-"+n}>
      ${t.map(a=>J`<${Ua} key=${a.id} job=${a} onJobClick=${e} />`)}
    </div>
  `}function Ie(t){O(()=>{const e=n=>{n.key==="Escape"&&t()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[t])}const W=j.bind(L);function Ra(t){return t==="actual"?"actual usage":t==="slicer_estimate"?"slicer estimate":t==="manual"?"manual entry":"unknown confidence"}function Oa({jobId:t}){const[e,n]=f(null);if(O(()=>{let s=!0;return n(null),ke(`/jobs/${t}/price`,"Pricing not configured").then(({data:r})=>{s&&n(r??!1)}).catch(()=>{s&&n(!1)}),()=>{s=!1}},[t]),e===null)return W`<div class="pricing-row pricing-loading">Loading price…</div>`;if(e===!1)return W`<div class="pricing-row pricing-na">Pricing not configured</div>`;const a=e.final_price-e.base_price,i=e.base_price>0?Math.round(a/e.base_price*100):0;return W`
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Material</span><span>${A(e.material_cost)}</span>
      </div>
      <div class="pricing-row">
        <span>Machine</span><span>${A(e.machine_cost)}</span>
      </div>
      <div class="pricing-row"><span>Labor</span><span>${A(e.labor_cost)}</span></div>
      ${e.extra_labor_cost>0&&W`
        <div class="pricing-row pricing-extra-labor">
          <span>Extra labor</span><span>${A(e.extra_labor_cost)}</span>
        </div>
      `}
      <div class="pricing-divider"></div>
      <div class="pricing-row pricing-base">
        <span>Base</span><span>${A(e.base_price)}</span>
      </div>
      ${a!==0&&W`
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
          >Final${e.is_override?W`<span class="override-tag">override</span>`:""}</span
        >
        <span>${A(e.final_price)}</span>
      </div>
    </div>
  `}const Ha=["finish","failed","cancel","running","pause"];function qa({job:t,onClose:e,onPatch:n,projects:a,onJobProjectChange:i,onJobStatusChange:s,onJobExtraLaborChange:r,onNavigateToProject:u}){const[d,p]=f(t.customer??""),[c,o]=f(t.notes??""),[l,m]=f(t.price_override!=null?String(t.price_override):"");Ie(e);const v=S(_=>{const g=_.target.value;i(t.id,g===""?null:Number(g))},[t.id,i]),y=S(_=>{const g=_.target.value;s(t.id,g===""?null:g)},[t.id,s]);return W`
    <div class="overlay" onClick=${_=>_.target===_.currentTarget&&e()}>
      <div class="modal">
        <div class="modal-header">
          <h2>${t.designTitle||"Untitled Job"}</h2>
          <button class="modal-close" onClick=${e}>✕</button>
        </div>
        ${t.cover_url&&W`<img class="modal-img" src=${t.cover_url} alt="" />`}
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Status</label>
              <div class="detail-val">
                <${Mt} status=${t.status} />
                ${t.status_override&&W`<span class="override-tag">override</span>`}
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
                  >${Ra(t.material_usage_confidence)}</span
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
          <${Oa} jobId=${t.id} key=${t.id+"-"+t.extra_labor_minutes} />
          <div class="modal-project-row">
            <label class="modal-project-label">Customer</label>
            <input
              class="modal-project-select"
              type="text"
              placeholder="—"
              value=${d}
              onInput=${_=>p(_.target.value)}
              onBlur=${()=>n(t.id,{customer:d.trim()||null})}
              onKeyDown=${_=>_.key==="Enter"&&_.target.blur()}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Notes</label>
            <textarea
              class="modal-project-select modal-notes"
              placeholder="—"
              value=${c}
              onInput=${_=>o(_.target.value)}
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
              ${Ha.map(_=>W`<option key=${_} value=${_}>${_}</option>`)}
            </select>
          </div>
          ${a&&W`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select
                class="modal-project-select"
                value=${t.project_id??""}
                onChange=${v}
              >
                <option value="">— None —</option>
                ${a.map(_=>W`<option key=${_.id} value=${_.id}>${_.name}</option>`)}
              </select>
              ${t.project_id!=null&&W`
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
  `}const U=j.bind(L);function wt(t){return t!=null}function Wa({project:t,totalPrice:e,onClick:n,onRename:a}){const i=t.total_weight_g,s=t.total_time_s,r=async d=>{d.stopPropagation();const p=await vn(t.id);p&&F(`Created product: ${p.name}`,"success")},u=async d=>{d.stopPropagation();try{await Fe(hn(t)),F("Project details copied.","success")}catch(p){F(p instanceof Error?p.message:"Failed to copy project details.","error")}};return U`
    <div class="proj-card" onClick=${n}>
      ${t.cover_url?U`<img class="proj-card-cover" src=${t.cover_url} alt="" />`:U`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-title-row">
        <div class="proj-card-name">${t.name}</div>
      </div>
      <div class="proj-card-actions">
        <button
          type="button"
          class="btn-secondary proj-card-action"
          onClick=${d=>{d.stopPropagation(),a(t)}}
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
        ${wt(i)&&U`<span>${Pe(i)}</span>`}
        ${wt(s)&&U`<span>${nt(s)}</span>`}
        ${wt(e)&&U`<span class="proj-card-price">${A(e)}</span>`}
      </div>
      ${t.notes&&U`<div class="proj-card-notes">${t.notes}</div>`}
    </div>
  `}function Qa({price:t}){return t?U`
    <span>Material: <strong>${A(t.material_cost)}</strong></span>
    <span>Machine: <strong>${A(t.machine_cost)}</strong></span>
    <span>Labor: <strong>${A(t.labor_cost)}</strong></span>
    ${t.extra_labor_cost>0&&U`<span>Extra labor: <strong>${A(t.extra_labor_cost)}</strong></span>`}
    <span class="totals-total">Total: <strong>${A(t.final_price)}</strong></span>
  `:null}function Va({jobs:t,onJobClick:e,onRemoveJob:n,onMoveToNewProject:a}){return t.length===0?U`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`:U`
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
          ${t.map(i=>U`
              <tr key=${i.id} onClick=${()=>e(i)}>
                <td class="td-thumb"><${Kt} url=${i.cover_url} /></td>
                <td class="td-title">
                  <span class="row-title">${i.designTitle||"Untitled Job"}</span>
                </td>
                <td>${i.deviceModel||"—"}</td>
                <td title=${ye(i.startTime)}>${et(i.startTime)}</td>
                <td><${Mt} status=${i.status} /></td>
                <td class="td-num"><strong>${i.plate_count??1}</strong></td>
                <td class="td-num"><strong>${bt(i.total_weight_g)}</strong></td>
                <td class="td-num">${nt(i.total_time_s)}</td>
                <td class="td-num">
                  ${wt(i.final_price)?U`<strong>${A(i.final_price)}</strong>`:"—"}
                </td>
                <td>
                  ${a&&U`<button
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
  `}function Ga({loading:t,filtered:e,q:n,projectPrices:a,navigate:i,onRename:s}){return t?U`<div class="empty">Loading projects…</div>`:e.length===0?U`<div class="empty">${n?"No projects match your search.":"No projects yet. Create one to group related jobs together."}</div>`:U`
    <div class="proj-grid">
      ${e.map(r=>U`<${Wa}
            key=${r.id}
            project=${r}
            totalPrice=${a[r.id]??null}
            onClick=${()=>i(`/projects/${r.id}`)}
            onRename=${s}
          />`)}
    </div>
  `}const za=j.bind(L);function Ka({job:t,initialName:e,onClose:n,onProjectCreated:a,onMoveJobToProject:i,onNavigateToProject:s}){const[r,u]=f(e),d=S(async()=>{const p=r.trim();if(!p)return;const c=await Y("/projects",{name:p,customer:t.customer??null,notes:null},"Failed to create project.");c!=null&&c.project&&(a(c.project),i(t.id,c.project.id),s(c.project.id),n())},[t.customer,t.id,r,n,i,s,a]);return za`<div class="modal-backdrop" onClick=${n}>
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
  </div>`}const Ya=j.bind(L);function Xa({project:t,onClose:e,onRenamed:n}){const[a,i]=f(t.name??""),[s,r]=f(!1),u=S(async()=>{const d=a.trim();if(d){r(!0);try{const p=await tt(`/projects/${t.id}`,{name:d},"Failed to rename project."),c=p==null?void 0:p.project;if(!c)return;n(c),e()}finally{r(!1)}}},[a,e,n,t.id]);return Ya`<div class="modal-backdrop" onClick=${e}>
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
          onClick=${u}
        >
          ${s?"Saving…":"Save name"}
        </button>
      </div>
    </div>
  </div>`}function Za(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>[a.name,a.customer,a.notes].filter(Boolean).join(" ").toLowerCase().includes(n))}function ti(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>`${a.designTitle||""} ${a.customer||""}`.toLowerCase().includes(n))}function ei(t,e,n){return`${n?`${e.length} of ${t.length}`:String(t.length)} project${t.length!==1?"s":""}`}function ni(t,e){return t.some(n=>n.id===e.id)?t.map(n=>n.id===e.id?{...n,...e}:n):[e,...t]}function ai(t,e){if(t===0){F("No ungrouped jobs found — everything is already assigned to a project.","info");return}F(`Created ${t} project${t!==1?"s":""}, assigned ${e} job${e!==1?"s":""}.`,"success")}function ii(t){return t.reduce((e,n)=>e+(n.total_weight_g||0),0)}function si(t){return t.reduce((e,n)=>e+(n.total_time_s||0),0)}function ri(t){return t.reduce((e,n)=>e+(n.plate_count||0),0)}const kt=j.bind(L);function Sn(t){return e=>{e.target===e.currentTarget&&t()}}function oi({onClose:t,onCreate:e}){const[n,a]=f(""),[i,s]=f(""),[r,u]=f(""),[d,p]=f(!1);Ie(t);const c=S(async o=>{if(o.preventDefault(),!!n.trim()){p(!0);try{const l=await Y("/projects",{name:n.trim(),customer:i||null,notes:r||null},"Failed to create project.");if(!(l!=null&&l.project))return;e(l.project),t()}finally{p(!1)}}},[n,i,r,e,t]);return kt`
    <div class="overlay" onClick=${Sn(t)}>
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
  `}function li({unassignedJobs:t,onClose:e,onAdd:n}){const[a,i]=f("");Ie(e);const s=Q(()=>ti(t,a),[t,a]);return kt`
    <div class="overlay" onClick=${Sn(e)}>
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
          ${s.length===0?kt`<div class="empty" style="padding:16px 0">
                ${a?"No matches.":"All jobs are already assigned to projects."}
              </div>`:kt`<div class="add-jobs-list">
                ${s.map(r=>kt`
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
  `}const Jt=new Map;function ci(t,e){const[n,a]=f(()=>Jt.get(t)??null);return O(()=>{if(a(Jt.get(t)??null),!e){Jt.delete(t),a(null);return}let i=!1;return pt(`/projects/${t}/price`,"Failed to load project price.").then(s=>{!s||i||(Jt.set(t,s),a(s))}),()=>{i=!0}},[t,e]),n}const V=j.bind(L);function di({plates:t,loading:e}){return e?V`<div class="empty">Loading project plates…</div>`:t.length===0?null:V`<section class="admin-section project-plates-section">
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
          ${t.map(n=>V`<tr key=${n.id}>
              <td class="td-title">
                <span class="row-title">${n.title||`Plate ${n.plateIndex??"—"}`}</span>
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
  </section>`}function ui({project:t,jobs:e,unassignedJobs:n,onBack:a,onJobClick:i,onAddJob:s,onRemoveJob:r,onProjectUpdated:u,onMoveJobToProject:d,onNavigateToProject:p}){const[c,o]=f(!1),[l,m]=f(!1),[v,y]=f(null),[_,g]=f(t.name??""),[$,b]=f(t.customer??""),[P,C]=f(t.notes??""),[h,w]=f([]),[I,T]=f(!1),H=t.job_count??e.length,at=ci(t.id,H),ct=ii(e),Ln=si(e),Mn=ri(e),je=pn(new Map),Zt=Q(()=>{for(const k of e)k.final_price!==null&&k.final_price!==void 0&&je.current.set(k.id,k.final_price);return e.map(k=>{if(k.final_price!==null&&k.final_price!==void 0)return k;const jt=je.current.get(k.id);return jt==null?k:{...k,final_price:jt}})},[e]);O(()=>{let k=!1;return(async()=>{if(e.length===0){w([]);return}T(!0);try{const xt=await Promise.all(e.map(yt=>ra(yt.id)));if(k)return;w(xt.flatMap(yt=>{const te=e.find(ee=>ee.id===yt.job.id);return yt.plates.map(ee=>({...ee,jobId:yt.job.id,jobTitle:(te==null?void 0:te.designTitle)??null}))}))}catch(xt){k||F(xt instanceof Error?xt.message:"Failed to load project plates.","error")}finally{k||T(!1)}})(),()=>{k=!0}},[e]);const jn=S(k=>s(k),[s]),xn=S(async()=>{const k=await vn(t.id);k&&F(`Created product: ${k.name}`,"success")},[t.id]),Dn=S(async()=>{try{await Fe(hn(t,Zt)),F("Project details copied.","success")}catch(k){F(k instanceof Error?k.message:"Failed to copy project details.","error")}},[Zt,t]),Jn=S(async()=>{const k=await tt(`/projects/${t.id}`,{name:_.trim(),customer:$.trim()||null,notes:P.trim()||null},"Failed to update project.");k!=null&&k.project&&(u(k.project),m(!1))},[$,_,P,u,t.id]);return V`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${a}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${t.name}</h2>
          ${t.customer&&V`<span class="customer-pill">${t.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${()=>m(k=>!k)}>
          ${l?"Cancel edit":"Edit project"}
        </button>
        <button class="btn-secondary" onClick=${Dn}>Copy details</button>
        <button class="btn-secondary" onClick=${xn}>Create product</button>
        <button class="btn-secondary" onClick=${()=>o(!0)}>+ Add Jobs</button>
      </div>
      ${l&&V`<div class="modal-form proj-detail-notes">
        <label>
          Project name
          <input
            value=${_}
            onInput=${k=>g(k.target.value)}
          />
        </label>
        <label>
          Customer
          <input
            value=${$}
            onInput=${k=>b(k.target.value)}
          />
        </label>
        <label>
          Notes
          <textarea
            value=${P}
            onInput=${k=>C(k.target.value)}
          />
        </label>
        <button class="btn-primary" disabled=${!_.trim()} onClick=${Jn}>
          Save project
        </button>
      </div>`}
      ${t.notes&&V`<div class="proj-detail-notes">${t.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Print runs: <strong>${H}</strong></span>
        <span>Plates: <strong>${Mn}</strong></span>
        <span>Filament: <strong>${Pe(ct)}</strong></span>
        <span>Print time: <strong>${nt(Ln)}</strong></span>
        <${Qa} price=${at} />
      </div>
      <${Va}
        jobs=${Zt}
        onJobClick=${i}
        onRemoveJob=${r}
        onMoveToNewProject=${y}
      />
      <${di} plates=${h} loading=${I} />
      ${c&&V`<${li}
        unassignedJobs=${n}
        onClose=${()=>o(!1)}
        onAdd=${jn}
      />`}
      ${v&&V`<${Ka}
        job=${v}
        initialName=${v.designTitle||""}
        onClose=${()=>y(null)}
        onProjectCreated=${u}
        onMoveJobToProject=${d}
        onNavigateToProject=${p}
      />`}
    </div>
  `}function pi({projects:t,setProjects:e,onAutoGroup:n,projectPrices:a,loading:i=!1}){const[s,r]=f(!1),[u,d]=f(!1),[p,c]=f(null),[o,l]=f(""),[,m]=be(),v=S(async()=>{d(!0);try{const g=await Y("/projects/auto-group",{},"Auto-group failed.");if(!g)return;const{projects_created:$,jobs_assigned:b}=g;await n(),ai($,b)}finally{d(!1)}},[n]),y=S(g=>{e($=>[g,...$]),m(`/projects/${g.id}`)},[e,m]),_=Q(()=>Za(t,o),[t,o]);return V`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${o}
        onInput=${g=>l(g.target.value)}
      />
      <span class="proj-list-count">${ei(t,_,o)}</span>
      <button class="btn-secondary" onClick=${v} disabled=${u}>
        ${u?"Grouping…":"⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${()=>r(!0)}>+ New Project</button>
    </div>
    <${Ga}
      loading=${i}
      filtered=${_}
      q=${o}
      projectPrices=${a}
      navigate=${m}
      onRename=${c}
    />
    ${s&&V`<${oi} onClose=${()=>r(!1)} onCreate=${y} />`}
    ${p&&V`<${Xa}
      project=${p}
      onClose=${()=>c(null)}
      onRenamed=${g=>e($=>ni($,g))}
    />`}
  `}const K=j.bind(L),mi=2e3;function Ge(t,e,n){const a=e(n);return t.map(i=>e(i)===a?n:i)}function _i(t){return t==="saving"?"Saving…":t==="saved"?"✓ Saved":"Save"}function $i(t,e,n){return t===n?"saving":e===n?"saved":"idle"}function fi(t){const[e,n]=f(""),[a,i]=f(""),s=d=>{i(d),setTimeout(()=>i(""),mi)};return{runSave:async(d,p)=>{n(d);try{if(!await p())return;s(d),t()}finally{n("")}},getStateFor:d=>$i(e,a,d)}}function z({label:t,value:e,onChange:n,step:a="0.01",min:i="0"}){return K`
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
  `}function Te({state:t}){return K`<button type="submit" class="btn-primary" disabled=${t==="saving"}>
    ${_i(t)}
  </button>`}function mt({title:t,description:e,children:n}){return K`
    <section class="admin-section">
      <h3 class="admin-section-title">${t}</h3>
      <p class="admin-section-desc">${e}</p>
      ${n}
    </section>
  `}function vi({labor:t,saveState:e,onSave:n}){const[a,i]=f(t);return O(()=>i(t),[t]),K`
    <form class="admin-card" onSubmit=${s=>(s.preventDefault(),n(a))}>
      <div class="admin-card-fields">
        <${z}
          label="Hourly rate ($)"
          value=${a.hourly_rate}
          step="0.5"
          onChange=${s=>i({...a,hourly_rate:s})}
        />
        <${z}
          label="Minimum labor minutes"
          value=${a.minimum_minutes}
          step="1"
          onChange=${s=>i({...a,minimum_minutes:s})}
        />
        <${z}
          label="Profit markup (%)"
          value=${a.profit_markup_pct*100}
          step="1"
          onChange=${s=>i({...a,profit_markup_pct:s/100})}
        />
        <${z}
          label="Failure buffer (%)"
          value=${a.failure_buffer_pct*100}
          step="1"
          onChange=${s=>i({...a,failure_buffer_pct:s/100})}
        />
        <${z}
          label="Overhead buffer (%)"
          value=${a.overhead_buffer_pct*100}
          step="1"
          onChange=${s=>i({...a,overhead_buffer_pct:s/100})}
        />
      </div>
      <div class="admin-card-actions"><${Te} state=${e} /></div>
    </form>
  `}function gi({machine:t,saveState:e,onSave:n}){const[a,i]=f(t);O(()=>i(t),[t]);const s=a.purchase_price/a.lifetime_hrs+a.electricity_rate+a.maintenance_buffer;return K`
    <form class="admin-card" onSubmit=${r=>(r.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.device_model}</div>
      <div class="admin-card-fields">
        <${z}
          label="Purchase price ($)"
          value=${a.purchase_price}
          step="1"
          onChange=${r=>i({...a,purchase_price:r})}
        />
        <${z}
          label="Lifetime (hours)"
          value=${a.lifetime_hrs}
          step="100"
          min="1"
          onChange=${r=>i({...a,lifetime_hrs:r})}
        />
        <${z}
          label="Electricity ($/hr)"
          value=${a.electricity_rate}
          step="0.01"
          onChange=${r=>i({...a,electricity_rate:r})}
        />
        <${z}
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
        <div class="admin-card-actions"><${Te} state=${e} /></div>
      </div>
    </form>
  `}function hi({material:t,saveState:e,onSave:n}){const[a,i]=f(t);O(()=>i(t),[t]);const s=a.cost_per_g*(1+a.waste_buffer_pct);return K`
    <form class="admin-card" onSubmit=${r=>(r.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.filament_type}</div>
      <div class="admin-card-fields">
        <${z}
          label="Cost per gram ($/g)"
          value=${a.cost_per_g}
          step="0.001"
          onChange=${r=>i({...a,cost_per_g:r})}
        />
        <${z}
          label="Waste buffer (%)"
          value=${a.waste_buffer_pct*100}
          step="1"
          onChange=${r=>i({...a,waste_buffer_pct:r/100})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">Computed rate: <strong>${A(s)}</strong>/g</div>
        <div class="admin-card-actions"><${Te} state=${e} /></div>
      </div>
    </form>
  `}function bi({onRatesChanged:t=()=>{}}){const[e,n]=f(null),{runSave:a,getStateFor:i}=fi(t);O(()=>{pt("/rates","Failed to load rates.").then(o=>{o&&n(o)})},[]);const s=async o=>{await a("labor",async()=>{const l=await tt("/rates/labor",o,"Failed to save labor rates."),m=l==null?void 0:l.labor_config;return m?(n(v=>v&&{...v,labor_config:m}),!0):!1})},r=async o=>{const{device_model:l,purchase_price:m,lifetime_hrs:v,electricity_rate:y,maintenance_buffer:_}=o;await a(l,async()=>{const g=await tt(`/rates/machines/${encodeURIComponent(l)}`,{purchase_price:m,lifetime_hrs:v,electricity_rate:y,maintenance_buffer:_},"Failed to save machine rate."),$=g==null?void 0:g.machine_rate;return $?(n(b=>b&&{...b,machine_rates:Ge(b.machine_rates,P=>P.device_model,$)}),!0):!1})},u=async o=>{const{filament_type:l,cost_per_g:m,waste_buffer_pct:v}=o;await a(l,async()=>{const y=await tt(`/rates/materials/${encodeURIComponent(l)}`,{cost_per_g:m,waste_buffer_pct:v},"Failed to save material rate."),_=y==null?void 0:y.material_rate;return _?(n(g=>g&&{...g,material_rates:Ge(g.material_rates,$=>$.filament_type,_)}),!0):!1})};if(!e)return K`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;const{labor_config:d,machine_rates:p,material_rates:c}=e;return K`
    <div class="admin-page">
      <h2 class="admin-title">Rates & Pricing</h2>

      <${mt}
        title="Labor"
        description="Applied once per job (or once per project for project pricing)."
      >
        <${vi}
          labor=${d}
          saveState=${i("labor")}
          onSave=${s}
        />
      </${mt}>

      <${mt}
        title="Machine Rates"
        description="Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance."
      >
        ${p.map(o=>K`
            <${gi}
              key=${o.device_model}
              machine=${o}
              saveState=${i(o.device_model)}
              onSave=${r}
            />
          `)}
      </${mt}>

      <${mt}
        title="Material Rates"
        description="Cost per gram including waste. Rate = cost × (1 + waste fraction)."
      >
        ${c.map(o=>K`
            <${hi}
              key=${o.filament_type}
              material=${o}
              saveState=${i(o.filament_type)}
              onSave=${u}
            />
          `)}
      </${mt}>
    </div>
  `}const Fn=j.bind(L);function It(t){return t==null?"—":`$${t.toFixed(2)}`}function In(t){return t==null?"—":`${Math.round(t*100)}%`}function yi(t){return t==null?"—":t<3600?`${Math.round(t/60)} min`:`${(t/3600).toFixed(1)} h`}function Pi(t){return t==null?"batch-margin batch-margin--unknown":t>=.45?"batch-margin batch-margin--good":t>=.25?"batch-margin batch-margin--ok":"batch-margin batch-margin--low"}function _t({label:t,value:e}){return Fn`<div class="batch-price-metric"><span>${t}</span><strong>${e}</strong></div>`}function wi({batch:t}){return Fn`<div class="batch-price-breakdown" aria-label="Batch price breakdown">
    <${_t} label="Unit cost" value=${It(t.unit_cost)} />
    <${_t} label="Suggested" value=${It(t.suggested_price)} />
    <${_t} label="Fixed fee" value=${It(t.fixed_fee_per_order)} />
    <${_t} label="Margin" value=${In(t.estimated_margin_pct)} />
    <${_t}
      label="Material"
      value=${t.total_filament_g==null?"—":`${t.total_filament_g.toFixed(1)} g`}
    />
    <${_t} label="Print time" value=${yi(t.total_print_time_s)} />
  </div>`}const dt=j.bind(L);function Ct(t){return t==null}function ki(t){return Ct(t)?"":String(t/3600)}function St(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function Ci(t){const e=St(t);return e===null?null:Math.round(e*3600)}function $t(t){const e=Number(t.trim());return Number.isInteger(e)&&e>0?e:null}function Et(t){const e=Number(t.trim());return Number.isInteger(e)&&e>=0?e:null}function se(t,e){return Object.prototype.hasOwnProperty.call(t,e)}function re(t){return{productId:String(t.product_id),pricingProfileId:t.pricing_profile_id,plannedQuantity:String(t.planned_quantity),completedQuantity:String(t.completed_quantity),failedQuantity:String(t.failed_quantity),materialType:t.material_type??"",primaryColor:t.primary_color??"",totalFilamentG:Ct(t.total_filament_g)?"":String(t.total_filament_g),totalPrintTimeHours:ki(t.total_print_time_s),setupMinutes:Ct(t.setup_minutes)?"":String(t.setup_minutes),handlingMinutesPerUnit:Ct(t.handling_minutes_per_unit)?"":String(t.handling_minutes_per_unit),packagingCostPerUnit:Ct(t.packaging_cost_per_unit)?"":String(t.packaging_cost_per_unit),notes:t.notes??""}}function M({label:t,children:e}){return dt`<label class="form-label">${t}${e}</label>`}function Si({batchId:t,navigate:e}){const[n,a]=f(null),[i,s]=f([]),[r,u]=f([]),[d,p]=f(""),[c,o]=f(null),[l,m]=f(!0),[v,y]=f(!1),[_,g]=f(!1);O(()=>{let h=!1;return Promise.all([pa(t),Ce(),sa()]).then(([w,I,T])=>{h||(a(w),s(I),u(T),o(re(w)))}).catch(w=>{F(w instanceof Error?w.message:"Failed to load batch.","error")}).finally(()=>{h||m(!1)}),()=>{h=!0}},[t]);const $=(h,w)=>{o(I=>I&&{...I,[h]:w})},b=!!(c&&$t(c.productId)&&$t(c.plannedQuantity)&&Et(c.completedQuantity)!==null&&Et(c.failedQuantity)!==null),P=async()=>{if(!n)return;const h=$t(d);if(h){g(!0);try{const w=await $a(n.id,h);if(!w)return;a(w),o(re(w)),F("Project jobs added to batch.","success")}finally{g(!1)}}},C=async h=>{if(h.preventDefault(),!c||!n)return;const w=$t(c.productId),I=$t(c.plannedQuantity),T=Et(c.completedQuantity),H=Et(c.failedQuantity);if(!w||!I||T===null||H===null)return;const at={product_id:w,pricing_profile_id:c.pricingProfileId,planned_quantity:I,completed_quantity:T,failed_quantity:H,material_type:c.materialType.trim()||null,primary_color:c.primaryColor.trim()||null,total_filament_g:St(c.totalFilamentG),total_print_time_s:Ci(c.totalPrintTimeHours),notes:c.notes.trim()||null};(se(n,"setup_minutes")||c.setupMinutes.trim())&&(at.setup_minutes=St(c.setupMinutes)),(se(n,"handling_minutes_per_unit")||c.handlingMinutesPerUnit.trim())&&(at.handling_minutes_per_unit=St(c.handlingMinutesPerUnit)),(se(n,"packaging_cost_per_unit")||c.packagingCostPerUnit.trim())&&(at.packaging_cost_per_unit=St(c.packagingCostPerUnit)),y(!0);try{const ct=await _a(n.id,at);if(!ct)return;a(ct),o(re(ct)),F("Batch updated.","success")}finally{y(!1)}};return l?dt`<div class="empty">Loading batch…</div>`:!n||!c?dt`<div class="empty">Batch not found.</div>`:dt`<main class="product-detail-page batch-detail-page">
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
        <${wi} batch=${n} />
      </aside>

      <form class="product-detail-form" onSubmit=${C}>
        <section class="admin-section">
          <h3 class="admin-section-title">Batch setup</h3>
          <div class="product-form-grid">
            <${M} label="Product">
              <select
                class="form-input"
                value=${c.productId}
                onChange=${h=>$("productId",h.target.value)}
              >
                ${i.map(h=>dt`<option key=${h.id} value=${String(h.id)}>
                      ${h.name}
                    </option>`)}
              </select>
            </${M}>
            <${M} label="Pricing profile">
              <select
                class="form-input"
                value=${c.pricingProfileId}
                onChange=${h=>$("pricingProfileId",h.target.value)}
              >
                ${we.map(h=>dt`<option key=${h.id} value=${h.id}>${h.label}</option>`)}
              </select>
            </${M}>
            <${M} label="Planned quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${c.plannedQuantity}
                onInput=${h=>$("plannedQuantity",h.target.value)}
              />
            </${M}>
            <${M} label="Completed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${c.completedQuantity}
                onInput=${h=>$("completedQuantity",h.target.value)}
              />
            </${M}>
            <${M} label="Failed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${c.failedQuantity}
                onInput=${h=>$("failedQuantity",h.target.value)}
              />
            </${M}>
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
              ${r.map(h=>dt`<option key=${h.id} value=${String(h.id)}>
                    ${h.name}${h.job_count?` (${h.job_count} jobs)`:""}
                  </option>`)}
            </select>
            <button
              class="btn-secondary"
              type="button"
              disabled=${_||!$t(d)}
              onClick=${P}
            >
              ${_?"Adding…":"Add project jobs"}
            </button>
          </div>
          <div class="product-form-grid">
            <${M} label="Material">
              <input
                class="form-input"
                value=${c.materialType}
                placeholder="PLA"
                onInput=${h=>$("materialType",h.target.value)}
              />
            </${M}>
            <${M} label="Color">
              <input
                class="form-input"
                value=${c.primaryColor}
                placeholder="#ffffff or White"
                onInput=${h=>$("primaryColor",h.target.value)}
              />
            </${M}>
            <${M} label="Total grams">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.totalFilamentG}
                placeholder="120"
                onInput=${h=>$("totalFilamentG",h.target.value)}
              />
            </${M}>
            <${M} label="Total time (hours)">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.totalPrintTimeHours}
                placeholder="4.5"
                onInput=${h=>$("totalPrintTimeHours",h.target.value)}
              />
            </${M}>
            <${M} label="Setup minutes">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.setupMinutes}
                placeholder="10"
                onInput=${h=>$("setupMinutes",h.target.value)}
              />
            </${M}>
            <${M} label="Handling minutes / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.handlingMinutesPerUnit}
                placeholder="3"
                onInput=${h=>$("handlingMinutesPerUnit",h.target.value)}
              />
            </${M}>
            <${M} label="Packaging cost / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.packagingCostPerUnit}
                placeholder="0.75"
                onInput=${h=>$("packagingCostPerUnit",h.target.value)}
              />
            </${M}>
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
          <button class="btn-primary" type="submit" disabled=${v||!b}>
            ${v?"Saving…":"Save Batch"}
          </button>
        </div>
      </form>
    </section>
  </main>`}const ze=j.bind(L);function Fi({batch:t,onOpen:e}){const n=t.completed_quantity+t.failed_quantity;return ze`<article class="batch-card" onClick=${()=>e(t)}>
    <div class="batch-card-header">
      <div>
        <p class="products-kicker">${t.pricing_profile_label}</p>
        <h3>${t.product_name}</h3>
      </div>
      <span class=${Pi(t.estimated_margin_pct)}>
        ${In(t.estimated_margin_pct)}
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
      <div><span>Unit cost</span><strong>${It(t.unit_cost)}</strong></div>
      <div>
        <span>Suggested price</span><strong>${It(t.suggested_price)}</strong>
      </div>
    </div>
    ${t.notes?ze`<p class="batch-card-notes">${t.notes}</p>`:null}
  </article>`}const X=j.bind(L);function Bt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>0?e:null}function Ii({products:t,onCreated:e}){const[n,a]=f({productId:"",pricingProfileId:"booth",plannedQuantity:"1"}),[i,s]=f(!1),r=(d,p)=>a(c=>({...c,[d]:p}));return X`<form class="batch-create-card" onSubmit=${async d=>{d.preventDefault();const p=Bt(n.productId),c=Bt(n.plannedQuantity);if(!(!p||!c)){s(!0);try{const o=await ma({product_id:p,pricing_profile_id:n.pricingProfileId,planned_quantity:c});if(!o)return;e(o),a({productId:"",pricingProfileId:"booth",plannedQuantity:"1"}),F("Batch created.","success")}finally{s(!1)}}}}>
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
      ${we.map(d=>X`<option key=${d.id} value=${d.id}>${d.label}</option>`)}
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
      disabled=${i||!Bt(n.productId)||!Bt(n.plannedQuantity)}
    >
      ${i?"Adding…":"Add Batch"}
    </button>
  </form>`}function Ti({navigate:t}){const[e,n]=f([]),[a,i]=f([]),[s,r]=f(!0),[u,d]=f(""),[p,c]=f("");O(()=>{let l=!1;return Promise.all([ua(),Ce()]).then(([m,v])=>{l||(n(m),i(v))}).catch(m=>{F(m instanceof Error?m.message:"Failed to load batches.","error")}).finally(()=>{l||r(!1)}),()=>{l=!0}},[]);const o=Q(()=>{const l=u.trim().toLowerCase();return e.filter(m=>p&&m.pricing_profile_id!==p?!1:l?[m.product_name,m.pricing_profile_label,m.material_type,m.primary_color].filter(Boolean).join(" ").toLowerCase().includes(l):!0)},[e,p,u]);return X`<main class="products-page batches-page">
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
        ${we.map(l=>X`<option key=${l.id} value=${l.id}>${l.label}</option>`)}
      </select>
      <span class="product-count">${o.length} of ${e.length} batches</span>
    </div>

    <section class="product-create-section">
      <${Ii}
        products=${a}
        onCreated=${l=>n(m=>[l,...m])}
      />
    </section>

    ${s?X`<div class="empty">Loading batches…</div>`:o.length?X`<div class="batch-grid">
            ${o.map(l=>X`<${Fi}
                  key=${l.id}
                  batch=${l}
                  onOpen=${()=>t(`/batches/${l.id}`)}
                />`)}
          </div>`:X`<div class="empty">No batches match your filters.</div>`}
  </main>`}const ot=j.bind(L);function it({label:t,value:e}){return ot`<div class="catalog-summary-pill">
    <strong>${e.toLocaleString()}</strong>${t}
  </div>`}function Ni({summary:t}){return t?ot`
    <div class="catalog-summary" role="status" aria-live="polite">
      <${it} label="scanned" value=${t.scanned} />
      <${it} label="added" value=${t.added} />
      <${it} label="changed" value=${t.changed} />
      <${it} label="unchanged" value=${t.unchanged} />
      <${it} label="missing" value=${t.missing} />
      <${it} label="restored" value=${t.restored} />
      <${it} label="skipped" value=${t.skipped} />
      <${it} label="failed" value=${t.failed} />
    </div>
  `:null}function Li(){const[t,e]=f([]),[n,a]=f(""),[i,s]=f(""),[r,u]=f(!0),[d,p]=f(!1),[c,o]=f(null),l=async()=>{const _=await pt("/catalog/roots","Failed to load roots.");_&&e(_.roots),u(!1)};O(()=>{l()},[]);const m=async _=>{_.preventDefault();const g=n.trim();if(!g)return;const $=i.trim()?{rootPath:g,name:i.trim()}:{rootPath:g},b=await Y("/catalog/roots",$,"Failed to add root.");b&&(e(P=>[...P,b.root]),a(""),s(""),F("Catalog root added.","success"))},v=async _=>{const g=await pt(`/catalog/roots/${_}`,"Failed to remove root.",{method:"DELETE"});g&&e($=>$.map(b=>b.id===_?g.root:b))};return ot`
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
            onClick=${async()=>{p(!0);try{const _=await Y("/catalog/scan",{},"Catalog scan failed.",{timeoutMs:null});if(!_)return;o(_.summary),F("Catalog scan complete.",_.summary.failed>0?"info":"success"),await l()}finally{p(!1)}}}
            disabled=${d||t.every(_=>!_.is_active)}
          >
            ${d?"Scanning…":"Run scan"}
          </button>
        </div>
        <${Ni} summary=${c} />
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
  `}const Mi=j.bind(L);function ji(t){return t==="green"?"product-sellability product-sellability--green":t==="yellow"?"product-sellability product-sellability--yellow":"product-sellability product-sellability--red"}function Ne({level:t,label:e,readyToList:n}){return Mi`<span class=${ji(t)} title=${e}>
    <span class="product-sellability-dot" aria-hidden="true"></span>
    ${e}${n?" · ready":""}
  </span>`}const vt=j.bind(L),Lt=[{id:"idea",label:"Idea"},{id:"downloaded_designed",label:"Downloaded / Designed"},{id:"test_print",label:"Test Print"},{id:"needs_tuning",label:"Needs Tuning"},{id:"ready_for_photos",label:"Ready for Photos"},{id:"listed",label:"Listed"},{id:"active",label:"Active"},{id:"selling_well",label:"Selling Well"},{id:"retired",label:"Retired"}],Tn=[{id:"gaming",label:"Gaming"},{id:"workshop",label:"Workshop"},{id:"home_organization",label:"Home Organization"},{id:"decor",label:"Decor"},{id:"personalized",label:"Personalized"},{id:"seasonal",label:"Seasonal"},{id:"custom_repair_parts",label:"Custom / Repair Parts"}],Le=[{id:"hive",label:"Hive"},{id:"original",label:"Original"},{id:"printables",label:"Printables"},{id:"makerworld",label:"MakerWorld"},{id:"thangs",label:"Thangs"},{id:"stlflix",label:"STLFlix"},{id:"custom_commission",label:"Custom Commission"}],Nn=[{id:"commercial_allowed",label:"Commercial Allowed"},{id:"personal_use_only",label:"Personal Use Only"},{id:"attribution_required",label:"Attribution Required"},{id:"hive_community",label:"Hive Community"},{id:"hive_plus",label:"Hive Plus"},{id:"original_owned",label:"Original / Owned"},{id:"unknown_verify",label:"Unknown / Verify"}],xi=[{id:"none",label:"No restock"},{id:"normal",label:"Normal"},{id:"high",label:"High"},{id:"urgent",label:"Urgent"}];function Di(t){return t===null?"No price":`$${t.toFixed(2)}`}function Ji({product:t}){return t.main_photo_path?vt`<img
      class="product-card-photo"
      src=${t.main_photo_path}
      alt=""
      loading="lazy"
    />`:vt`<div class="product-card-photo product-card-photo--empty" aria-hidden="true">▧</div>`}function Me({product:t,onOpen:e,onStatusChange:n}){const a=i=>i.stopPropagation();return vt`
    <article class="product-card" onClick=${()=>e(t)}>
      <${Ji} product=${t} />
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
          <strong>${Di(t.target_sale_price)}</strong>
          ${n?vt`<label class="product-status-select" onClick=${a}>
                <span>Status</span>
                <select
                  value=${t.status_id}
                  onChange=${i=>{i.stopPropagation(),n(t,i.target.value)}}
                >
                  ${Lt.map(i=>vt`<option key=${i.id} value=${i.id}>${i.label}</option>`)}
                </select>
              </label>`:vt`<span class="product-status-pill">${t.status_label}</span>`}
        </div>
      </div>
    </article>
  `}const lt=j.bind(L);function Ei(t){return t===null?"":String(t/3600)}function Ke(t){return{name:t.name,categoryId:t.category_id??"",statusId:t.status_id,sourceId:t.source_id??"",licenseId:t.license_id??"",targetSalePrice:t.target_sale_price===null?"":String(t.target_sale_price),restockPriority:t.restock_priority,modelUrl:t.model_url??"",etsyListingUrl:t.etsy_listing_url??"",defaultMaterial:t.default_material??"",primaryColor:t.primary_color??"",accentColor:t.accent_color??"",preferredPrinterId:t.preferred_printer_id===null?"":String(t.preferred_printer_id),estimatedPrintTimeHours:Ei(t.estimated_print_time_s),estimatedFilamentG:t.estimated_filament_g===null?"":String(t.estimated_filament_g),boothPrice:t.booth_price===null?"":String(t.booth_price),etsyPrice:t.etsy_price===null?"":String(t.etsy_price),packagingCost:t.packaging_cost===null?"":String(t.packaging_cost),handlingMinutes:t.handling_minutes===null?"":String(t.handling_minutes),targetMarginPct:t.target_margin_pct===null?"":String(t.target_margin_pct),pricingNotes:t.pricing_notes??"",notes:t.notes??""}}function st(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function Bi(t){const e=st(t);return e===null?null:Math.round(e*3600)}function Ui(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isInteger(n)&&n>0?n:null}function Pt(t,e){return[...e?[lt`<option value="">${e}</option>`]:[],...t.map(a=>lt`<option key=${a.id} value=${a.id}>${a.label}</option>`)]}function Ai({product:t}){return t.main_photo_path?lt`<img class="product-detail-photo" src=${t.main_photo_path} alt="" />`:lt`<div class="product-detail-photo product-detail-photo--empty">No product photo</div>`}function Ri({product:t}){const e=[t.primary_color,t.accent_color].filter(Boolean).join(" / ");return lt`<div class="product-detail-facts">
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
  </div>`}function Oi({productId:t,navigate:e}){const[n,a]=f(null),[i,s]=f(null),[r,u]=f(!0),[d,p]=f(!1);O(()=>{let l=!1;return oa(t).then(m=>{l||(a(m),s(Ke(m)))}).catch(m=>{F(m instanceof Error?m.message:"Failed to load product.","error")}).finally(()=>{l||u(!1)}),()=>{l=!0}},[t]);const c=(l,m)=>{s(v=>v&&{...v,[l]:m})},o=async l=>{if(l.preventDefault(),!i||!n)return;const m={name:i.name,category_id:i.categoryId||null,status_id:i.statusId,source_id:i.sourceId||null,license_id:i.licenseId||null,target_sale_price:st(i.targetSalePrice),restock_priority:i.restockPriority,model_url:i.modelUrl.trim()||null,etsy_listing_url:i.etsyListingUrl.trim()||null,default_material:i.defaultMaterial.trim()||null,primary_color:i.primaryColor.trim()||null,accent_color:i.accentColor.trim()||null,preferred_printer_id:Ui(i.preferredPrinterId),estimated_print_time_s:Bi(i.estimatedPrintTimeHours),estimated_filament_g:st(i.estimatedFilamentG),booth_price:st(i.boothPrice),etsy_price:st(i.etsyPrice),packaging_cost:st(i.packagingCost),handling_minutes:st(i.handlingMinutes),target_margin_pct:st(i.targetMarginPct),pricing_notes:i.pricingNotes.trim()||null,notes:i.notes.trim()||null};p(!0);try{const v=await Se(n.id,m);if(!v)return;a(v),s(Ke(v)),F("Product updated.","success")}finally{p(!1)}};return r?lt`<div class="empty">Loading product…</div>`:!n||!i?lt`<div class="empty">Product not found.</div>`:lt`<main class="product-detail-page">
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
        <${Ai} product=${n} />
        <${Ri} product=${n} />
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
                onInput=${l=>c("name",l.target.value)}
              />
            </label>
            <label class="form-label">
              Status
              <select
                class="form-input"
                value=${i.statusId}
                onChange=${l=>c("statusId",l.target.value)}
              >
                ${Pt(Lt)}
              </select>
            </label>
            <label class="form-label">
              Category
              <select
                class="form-input"
                value=${i.categoryId}
                onChange=${l=>c("categoryId",l.target.value)}
              >
                ${Pt(Tn,"Uncategorized")}
              </select>
            </label>
            <label class="form-label">
              Source
              <select
                class="form-input"
                value=${i.sourceId}
                onChange=${l=>c("sourceId",l.target.value)}
              >
                ${Pt(Le,"Source TBD")}
              </select>
            </label>
            <label class="form-label">
              License
              <select
                class="form-input"
                value=${i.licenseId}
                onChange=${l=>c("licenseId",l.target.value)}
              >
                ${Pt(Nn,"Verify license")}
              </select>
            </label>
            <label class="form-label">
              Target price
              <input
                class="form-input"
                inputmode="decimal"
                placeholder="18.00"
                value=${i.targetSalePrice}
                onInput=${l=>c("targetSalePrice",l.target.value)}
              />
            </label>
            <label class="form-label">
              Restock priority
              <select
                class="form-input"
                value=${i.restockPriority}
                onChange=${l=>c("restockPriority",l.target.value)}
              >
                ${Pt(xi)}
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
                onInput=${l=>c("modelUrl",l.target.value)}
              />
            </label>
            <label class="form-label">
              Etsy listing URL
              <input
                class="form-input"
                value=${i.etsyListingUrl}
                placeholder="https://…"
                onInput=${l=>c("etsyListingUrl",l.target.value)}
              />
            </label>
            <label class="form-label">
              Default material
              <input
                class="form-input"
                value=${i.defaultMaterial}
                placeholder="PLA"
                onInput=${l=>c("defaultMaterial",l.target.value)}
              />
            </label>
            <label class="form-label">
              Primary color
              <input
                class="form-input"
                value=${i.primaryColor}
                placeholder="#ffffff or White"
                onInput=${l=>c("primaryColor",l.target.value)}
              />
            </label>
            <label class="form-label">
              Accent color
              <input
                class="form-input"
                value=${i.accentColor}
                placeholder="#000000 or Black"
                onInput=${l=>c("accentColor",l.target.value)}
              />
            </label>
            <label class="form-label">
              Preferred printer ID
              <input
                class="form-input"
                inputmode="numeric"
                value=${i.preferredPrinterId}
                placeholder="1"
                onInput=${l=>c("preferredPrinterId",l.target.value)}
              />
            </label>
            <label class="form-label">
              Estimated print time (hours)
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.estimatedPrintTimeHours}
                placeholder="4.5"
                onInput=${l=>c("estimatedPrintTimeHours",l.target.value)}
              />
            </label>
            <label class="form-label">
              Estimated filament (g)
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.estimatedFilamentG}
                placeholder="120"
                onInput=${l=>c("estimatedFilamentG",l.target.value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Notes
            <textarea
              class="form-input form-textarea"
              value=${i.notes}
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
                value=${i.boothPrice}
                placeholder="12.00"
                onInput=${l=>c("boothPrice",l.target.value)}
              />
            </label>
            <label class="form-label">
              Etsy price
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.etsyPrice}
                placeholder="14.99"
                onInput=${l=>c("etsyPrice",l.target.value)}
              />
            </label>
            <label class="form-label">
              Packaging cost
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.packagingCost}
                placeholder="0.75"
                onInput=${l=>c("packagingCost",l.target.value)}
              />
            </label>
            <label class="form-label">
              Handling minutes
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.handlingMinutes}
                placeholder="3"
                onInput=${l=>c("handlingMinutes",l.target.value)}
              />
            </label>
            <label class="form-label">
              Target margin
              <input
                class="form-input"
                inputmode="decimal"
                value=${i.targetMarginPct}
                placeholder="0.50"
                onInput=${l=>c("targetMarginPct",l.target.value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Pricing notes
            <textarea
              class="form-input form-textarea"
              value=${i.pricingNotes}
              placeholder="Booth/Etsy pricing rationale, packaging assumptions, margin notes…"
              onInput=${l=>c("pricingNotes",l.target.value)}
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
  </main>`}const ft=j.bind(L),Ye={urgent:0,high:1,normal:2,none:3};function Xe(t){return[...t].sort((e,n)=>{const a=(Ye[e.restock_priority]??9)-(Ye[n.restock_priority]??9);return a!==0?a:e.name.localeCompare(n.name)})}function Hi({products:t}){const e=t.filter(i=>i.restock_priority==="urgent").length,n=t.filter(i=>i.restock_priority==="high").length,a=t.filter(i=>i.ready_to_list).length;return ft`<div class="product-print-next-summary">
    <div><strong>${t.length}</strong><span>queued</span></div>
    <div><strong>${e}</strong><span>urgent</span></div>
    <div><strong>${n}</strong><span>high</span></div>
    <div><strong>${a}</strong><span>ready to list</span></div>
  </div>`}function qi({navigate:t}){const[e,n]=f([]),[a,i]=f(!0);O(()=>{let r=!1;return la().then(u=>{r||n(Xe(u))}).catch(u=>{F(u instanceof Error?u.message:"Failed to load print-next products.","error")}).finally(()=>{r||i(!1)}),()=>{r=!0}},[]);const s=async(r,u)=>{if(u===r.status_id)return;const d=await Se(r.id,{status_id:u});d&&(n(p=>Xe(p.map(c=>c.id===d.id?d:c).filter(c=>["active","selling_well"].includes(c.status_id)))),F("Product status updated.","success"))};return ft`<main class="products-page">
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
            <${Hi} products=${e} />
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
                    <${Me}
                      product=${r}
                      onOpen=${()=>t(`/products/${r.id}`)}
                      onStatusChange=${s}
                    />
                  </article>`)}
            </div>
          `}
  </main>`}const D=j.bind(L),Wi=[{id:"",label:"All sellability"},{id:"green",label:"Green"},{id:"yellow",label:"Yellow"},{id:"red",label:"Red"}];function Qi(t){const e=new Map;for(const s of t){const r=e.get(s.status_id)??[];r.push(s),e.set(s.status_id,r)}const n=Lt.map(s=>({statusId:s.id,statusLabel:s.label,products:e.get(s.id)??[]})),a=new Set(Lt.map(s=>s.id)),i=[...e.entries()].filter(([s])=>!a.has(s)).map(([s,r])=>{var u;return{statusId:s,statusLabel:((u=r[0])==null?void 0:u.status_label)??s,products:r}});return[...n,...i]}function Vi(t,e){const n=e.q.trim().toLowerCase();return!(n&&![t.name,t.category_label,t.status_label,t.source_label,t.license_label].filter(Boolean).join(" ").toLowerCase().includes(n)||e.categoryId&&t.category_id!==e.categoryId||e.statusId&&t.status_id!==e.statusId||e.sourceId&&t.source_id!==e.sourceId||e.sellability&&t.can_sell_level!==e.sellability)}function Gi({mode:t,navigate:e}){const n=a=>"product-tab"+(a?" active":"");return D`<div class="product-tabs" aria-label="Product views">
    <button class=${n(t==="pipeline")} onClick=${()=>e("/products/pipeline")}>
      Pipeline
    </button>
    <button class=${n(t==="catalog")} onClick=${()=>e("/products")}>
      Catalog
    </button>
    <button class="product-tab" onClick=${()=>e("/products/print-next")}>
      Print Next
    </button>
  </div>`}function zi({filters:t,setFilters:e,count:n,total:a,showStatusFilter:i}){const s=(r,u)=>e({...t,[r]:u});return D`<div class="product-toolbar">
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
      ${Tn.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    ${i?D`<select
          value=${t.statusId}
          onChange=${r=>s("statusId",r.target.value)}
        >
          <option value="">All statuses</option>
          ${Lt.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
        </select>`:null}
    <select
      value=${t.sourceId}
      onChange=${r=>s("sourceId",r.target.value)}
    >
      <option value="">All sources</option>
      ${Le.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    <select
      value=${t.sellability}
      onChange=${r=>s("sellability",r.target.value)}
    >
      ${Wi.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    <span class="product-count"
      >${n.toLocaleString()} of ${a.toLocaleString()} products</span
    >
  </div>`}function Ki({onCreated:t}){const[e,n]=f(""),[a,i]=f("unknown_verify"),[s,r]=f(""),[u,d]=f(!1);return D`<form class="product-create-card" onSubmit=${async c=>{c.preventDefault();const o=e.trim();if(o){d(!0);try{const l=await ca({name:o,status_id:"idea",license_id:a,source_id:s||null});if(!l)return;t(l),n(""),i("unknown_verify"),r(""),F("Product created.","success")}finally{d(!1)}}}}>
    <input
      class="form-input"
      placeholder="New product idea…"
      value=${e}
      onInput=${c=>n(c.target.value)}
    />
    <select
      class="form-input"
      value=${s}
      onChange=${c=>r(c.target.value)}
    >
      <option value="">Source TBD</option>
      ${Le.map(c=>D`<option key=${c.id} value=${c.id}>${c.label}</option>`)}
    </select>
    <select
      class="form-input"
      value=${a}
      onChange=${c=>i(c.target.value)}
    >
      ${Nn.map(c=>D`<option key=${c.id} value=${c.id}>${c.label}</option>`)}
    </select>
    <button class="btn-primary" type="submit" disabled=${u||!e.trim()}>
      ${u?"Adding…":"Add Product"}
    </button>
  </form>`}function Yi({products:t,navigate:e,onStatusChange:n}){return t.length?D`<div class="product-grid">
    ${t.map(a=>D`<${Me}
          key=${a.id}
          product=${a}
          onOpen=${()=>e(`/products/${a.id}`)}
          onStatusChange=${n}
        />`)}
  </div>`:D`<div class="empty">No products match your filters.</div>`}function Xi({columns:t,navigate:e,onStatusChange:n}){return D`<div class="product-kanban" role="list">
    ${t.map(a=>D`<section class="product-kanban-column" key=${a.statusId} role="listitem">
          <div class="product-kanban-header">
            <h3>${a.statusLabel}</h3>
            <span>${a.products.length}</span>
          </div>
          <div class="product-kanban-cards">
            ${a.products.length?a.products.map(i=>D`<${Me}
                      key=${i.id}
                      product=${i}
                      onOpen=${()=>e(`/products/${i.id}`)}
                      onStatusChange=${n}
                    />`):D`<div class="product-column-empty">No products</div>`}
          </div>
        </section>`)}
  </div>`}function Zi({mode:t,navigate:e}){const[n,a]=f([]),[i,s]=f(!0),[r,u]=f({q:"",categoryId:"",statusId:"",sourceId:"",sellability:""});O(()=>{let o=!1;return Ce().then(l=>{o||a(l)}).catch(l=>{F(l instanceof Error?l.message:"Failed to load products.","error")}).finally(()=>{o||s(!1)}),()=>{o=!0}},[]);const d=Q(()=>n.filter(o=>Vi(o,r)),[n,r]),p=Q(()=>Qi(d),[d]),c=async(o,l)=>{if(l===o.status_id)return;const m=await Se(o.id,{status_id:l});m&&(a(v=>v.map(y=>y.id===m.id?m:y)),F("Product status updated.","success"))};return D`<main class="products-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Product workflow</p>
        <h2>${t==="pipeline"?"Product Pipeline":"Product Catalog"}</h2>
        <p>
          Card-based product tracking for sellability, listing readiness, and what to print next.
        </p>
      </div>
      <${Gi} mode=${t} navigate=${e} />
    </section>

    <${zi}
      filters=${r}
      setFilters=${u}
      count=${d.length}
      total=${n.length}
      showStatusFilter=${t==="catalog"}
    />

    ${t==="catalog"?D`<section class="product-create-section">
          <${Ki}
            onCreated=${o=>a(l=>[o,...l])}
          />
        </section>`:null}
    ${i?D`<div class="empty">Loading products…</div>`:t==="pipeline"?D`<${Xi}
            columns=${p}
            navigate=${e}
            onStatusChange=${c}
          />`:D`<${Yi}
            products=${d}
            navigate=${e}
            onStatusChange=${c}
          />`}
  </main>`}const E=j.bind(L);function ts({bootStatus:t,loadProgress:e}){return E` <div class="in-app-loading" role="status" aria-live="polite">
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
  </div>`}function es({error:t}){return E`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${t}</p>
      </div>
    </div>
  </div>`}function ns({projectId:t,projects:e,jobs:n,projectsLoading:a,navigate:i,setSelectedJob:s,handleJobProjectChange:r,setProjects:u}){const d=e.find(o=>Number(o.id)===t),p=n.filter(o=>Number(o.project_id)===t);if(!d)return a?E`<div class="empty">Loading projects…</div>`:E`<div class="empty">Project not found.</div>`;const c=n.filter(o=>o.project_id==null);return E`<${ui}
    project=${d}
    jobs=${p}
    unassignedJobs=${c}
    onBack=${()=>i("/projects")}
    onJobClick=${s}
    onAddJob=${o=>r(o,t)}
    onRemoveJob=${o=>r(o,null)}
    onProjectUpdated=${o=>u(l=>l.some(m=>m.id===o.id)?l.map(m=>m.id===o.id?o:m):[o,...l])}
    onMoveJobToProject=${(o,l)=>r(o,l)}
    onNavigateToProject=${o=>i(`/projects/${o}`)}
  />`}function as({sorted:t,view:e,sortCol:n,sortDir:a,onSort:i,onJobClick:s,density:r}){return t.length===0?E`<div class="empty">No jobs match your filters.</div>`:e==="table"?E`<${Ba}
      sorted=${t}
      sortCol=${n}
      sortDir=${a}
      onSort=${i}
      onJobClick=${s}
      density=${r}
    />`:E`<${Aa} sorted=${t} onJobClick=${s} density=${r} />`}function is({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:i,setDeviceFilter:s,devices:r,view:u,setView:d,filtered:p,jobs:c,isFiltered:o,sorted:l,sortCol:m,sortDir:v,onSort:y,onJobClick:_,density:g,setDensity:$}){return E`
    <${ja}
      q=${t}
      setQ=${e}
      statusFilter=${n}
      setStatusFilter=${a}
      deviceFilter=${i}
      setDeviceFilter=${s}
      devices=${r}
      view=${u}
      setView=${d}
      density=${g}
      setDensity=${$}
      filteredCount=${p.length}
      totalCount=${c.length}
    />
    <${xa} filtered=${p} isFiltered=${o} />
    ${as({sorted:l,view:u,sortCol:m,sortDir:v,onSort:y,onJobClick:_,density:g})}
  `}function ss(t){const e=t.match(/^\/projects\/(\d+)$/),n=t.match(/^\/products\/(\d+)$/),a=t.match(/^\/batches\/(\d+)$/);return{isAdmin:t.startsWith("/admin"),isPrinters:t.startsWith("/printers"),isProjects:t.startsWith("/projects"),isCatalog:t.startsWith("/catalog"),isProducts:t.startsWith("/products"),isProductPipeline:t==="/products/pipeline",isProductPrintNext:t==="/products/print-next",isBatches:t.startsWith("/batches"),projectId:e?Number(e[1]):null,productId:n?Number(n[1]):null,batchId:a?Number(a[1]):null}}function rs({route:t,summary:e,projects:n,setProjects:a,jobs:i,projectsLoading:s,navigate:r,setSelectedJob:u,handleJobProjectChange:d,handleRatesChanged:p,handleAutoGroup:c,projectPrices:o,q:l,setQ:m,statusFilter:v,setStatusFilter:y,deviceFilter:_,setDeviceFilter:g,devices:$,view:b,setView:P,filtered:C,isFiltered:h,sorted:w,sortCol:I,sortDir:T,density:H,setDensity:at,handleSort:ct}){return t.isAdmin?E`<${bi} onRatesChanged=${p} />`:t.batchId!=null?E`<${Si} batchId=${t.batchId} navigate=${r} />`:t.isBatches?E`<${Ti} navigate=${r} />`:t.productId!=null?E`<${Oi} productId=${t.productId} navigate=${r} />`:t.isProductPrintNext?E`<${qi} navigate=${r} />`:t.isProducts?E`<${Zi}
      mode=${t.isProductPipeline?"pipeline":"catalog"}
      navigate=${r}
    />`:t.isCatalog?E`<${Li} />`:t.isPrinters?E`<${wa}
      summary=${e}
      jobs=${i}
      onJobClick=${u}
    />`:t.projectId!=null?E`<${ns}
      projectId=${t.projectId}
      projects=${n}
      jobs=${i}
      projectsLoading=${s}
      navigate=${r}
      setSelectedJob=${u}
      handleJobProjectChange=${d}
      setProjects=${a}
    />`:t.isProjects?E`<${pi}
      projects=${n}
      setProjects=${a}
      onAutoGroup=${c}
      projectPrices=${o}
      loading=${s}
    />`:E`<${is}
    q=${l}
    setQ=${m}
    statusFilter=${v}
    setStatusFilter=${y}
    deviceFilter=${_}
    setDeviceFilter=${g}
    devices=${$}
    view=${b}
    setView=${P}
    filtered=${C}
    jobs=${i}
    isFiltered=${h}
    sorted=${w}
    sortCol=${I}
    sortDir=${T}
    onSort=${ct}
    onJobClick=${u}
    density=${H}
    setDensity=${at}
  />`}function os({setJobs:t,setProjects:e,setProjectPrices:n,setSummary:a,setDataRange:i,toast:s}){const[r,u]=f(!0),[d,p]=f(!0),[c,o]=f(0),[l,m]=f(null),[v,y]=f("Starting dashboard…"),_=S(async({url:b,fallback:P,onData:C,onFinally:h})=>{const{data:w,error:I}=await ke(b,P);I&&s(I.message||P,"error"),w&&C(w),h&&h()},[s]),g=S(()=>{_({url:"/projects",fallback:"Failed to load projects.",onData:b=>b.projects&&e(b.projects),onFinally:()=>p(!1)}),_({url:"/projects/prices",fallback:"Failed to load project prices.",onData:b=>b.prices&&n(b.prices)})},[_,e,n]),$=S((b=!1)=>{_({url:"/jobs/prices",fallback:b?"Failed to refresh job prices.":"Failed to load job prices.",onData:C=>{C!=null&&C.prices&&t(h=>h.map(w=>{var I;return{...w,final_price:((I=C.prices)==null?void 0:I[w.id])??(b?w.final_price:null)??null}}))}})},[_,t]);return O(()=>{const b=()=>o(h=>Math.min(100,h+100/ea)),P=(h,w,I)=>(y(`Loading ${h}…`),G(h,w).catch(T=>{const H=T instanceof Error?T.message:w;throw new Error(`Initial dashboard load failed (${I}): ${H}`)}).finally(b)),C=setTimeout(()=>{m("Dashboard load timed out. Check console/network for the failing request."),u(!1),p(!1)},ta);return Promise.all([P("/ui/data","Failed to load jobs.","jobs"),P("/summary","Failed to load summary.","summary"),P("/health/data-range","Failed to load print history range.","history range")]).then(([h,w,I])=>{t(h.jobs),a(w),i(I),u(!1),y("Loading optional data…"),$(!1),g()}).catch(h=>{m(h.message),u(!1),p(!1)}).finally(()=>clearTimeout(C)),()=>clearTimeout(C)},[t,a,i,$,g]),{loading:r,projectsLoading:d,loadProgress:c,error:l,bootStatus:v,refreshProjectsAndPrices:g,refreshJobPrices:$}}function ls(t,e,n,a){return t.filter(i=>{const s=`${i.designTitle||""} ${i.customer||""}`.toLowerCase();return!(e&&!s.includes(e.toLowerCase())||n&&(i.status||"").toLowerCase()!==n||a&&i.deviceModel!==a)})}function cs(t,e,n){return[...t].sort((a,i)=>{let s=a[e],r=i[e];if(s==null&&(s=n==="asc"?1/0:-1/0),r==null&&(r=n==="asc"?1/0:-1/0),typeof s=="string"){const p=typeof r=="string"?r:String(r);return n==="asc"?s.localeCompare(p):p.localeCompare(s)}const u=Number(s),d=Number(r);return n==="asc"?u-d:d-u})}const Tt=j.bind(L);function ds(){const[t,e]=f([]),[n,a]=f([]),[i,s]=f({}),[r,u]=f(null),[d,p]=f(null),[c,o]=f("table"),[l,m]=f("comfy"),[v,y]=f(""),[_,g]=f(""),[$,b]=f(""),[P,C]=f("startTime"),[h,w]=f("desc"),[I,T]=f(null);return{jobs:t,setJobs:e,projects:n,setProjects:a,projectPrices:i,setProjectPrices:s,summary:r,setSummary:u,dataRange:d,setDataRange:p,view:c,setView:o,density:l,setDensity:m,q:v,setQ:y,statusFilter:_,setStatusFilter:g,deviceFilter:$,setDeviceFilter:b,sortCol:P,setSortCol:C,sortDir:h,setSortDir:w,selectedJob:I,setSelectedJob:T}}function us({jobs:t,q:e,statusFilter:n,deviceFilter:a,sortCol:i,sortDir:s,setSortCol:r,setSortDir:u,loc:d}){const p=Q(()=>[...new Set(t.map(y=>y.deviceModel).filter(y=>!!y))].sort(),[t]),c=!!(e||n||a),o=Q(()=>ls(t,e,n,a),[t,e,n,a]),l=Q(()=>cs(o,i,s),[o,i,s]),m=S(y=>{if(i===y){u(_=>_==="asc"?"desc":"asc");return}r(y),u(()=>y==="startTime"?"desc":"asc")},[i,r,u]),v=Q(()=>ss(d),[d]);return{devices:p,isFiltered:c,filtered:o,sorted:l,handleSort:m,route:v}}function ps({setJobs:t,setProjects:e,setSummary:n,setSelectedJob:a,navigate:i,refreshProjectsAndPrices:s,refreshJobPrices:r}){const u=S(($,b)=>{t(P=>P.map(C=>C.id===$?{...C,...b}:C)),a(P=>P&&P.id===$?{...P,...b}:P)},[]),d=S(async($,b)=>{const P=await tt(`/jobs/${$}`,b,"Failed to update job.");if(!(P!=null&&P.job))return null;const{job:C}=P;return u($,C),C},[u]),p=S(($,b)=>{d($,b)},[d]),c=S(async($,b)=>{await d($,{project_id:b})&&s()},[d,s]),o=S(($,b)=>{p($,{status_override:b})},[p]),l=S(($,b)=>{p($,{extra_labor_minutes:b})},[p]),m=S($=>{a(null),i(`/projects/${$}`)},[i]),v=S(()=>{r(!0),s()},[r,s]),y=S(async()=>{v();try{const $=await G("/summary","Failed to refresh summary.");n($),F("Pricing refreshed from updated rates.","success")}catch($){const b=$ instanceof Error?$.message:"Updated rates saved, but summary refresh failed.";F(b,"error")}},[v,n]),_=S(async()=>{const[$,b]=await Promise.all([G("/ui/data","Failed to refresh jobs."),G("/projects","Failed to refresh projects.")]);t(()=>$.jobs),e(b.projects),v()},[v,e]);return{closeModal:S(()=>a(null),[]),patchJob:d,handleJobProjectChange:c,handleJobStatusChange:o,handleJobExtraLaborChange:l,handleNavigateToProject:m,handleRatesChanged:y,handleAutoGroup:_}}function ms({selectedJob:t,closeModal:e,patchJob:n,projects:a,handleJobProjectChange:i,handleJobStatusChange:s,handleJobExtraLaborChange:r,handleNavigateToProject:u}){return t?Tt`<${qa}
    key=${t.id}
    job=${t}
    onClose=${e}
    onPatch=${n}
    projects=${a}
    onJobProjectChange=${i}
    onJobStatusChange=${s}
    onJobExtraLaborChange=${r}
    onNavigateToProject=${u}
  />`:null}function _s(t){const e=S(i=>t.setProjects(i),[t.setProjects]),n=S(i=>t.setSummary(i),[t.setSummary]),a=S(i=>t.setDataRange(i),[t.setDataRange]);return os({setJobs:t.setJobs,setProjects:e,setProjectPrices:t.setProjectPrices,setSummary:n,setDataRange:a,toast:F})}function $s(){const t=ds(),[e,n]=be(),{loading:a,projectsLoading:i,loadProgress:s,error:r,bootStatus:u,refreshProjectsAndPrices:d,refreshJobPrices:p}=_s(t),{devices:c,isFiltered:o,filtered:l,sorted:m,handleSort:v,route:y}=us({jobs:t.jobs,q:t.q,statusFilter:t.statusFilter,deviceFilter:t.deviceFilter,sortCol:t.sortCol,sortDir:t.sortDir,setSortCol:t.setSortCol,setSortDir:t.setSortDir,loc:e}),{closeModal:_,patchJob:g,handleJobProjectChange:$,handleJobStatusChange:b,handleJobExtraLaborChange:P,handleNavigateToProject:C,handleRatesChanged:h,handleAutoGroup:w}=ps({setJobs:t.setJobs,setProjects:t.setProjects,setSummary:t.setSummary,setSelectedJob:t.setSelectedJob,navigate:n,refreshProjectsAndPrices:d,refreshJobPrices:p});return a?Tt`<${ts} bootStatus=${u} loadProgress=${s} />`:r?Tt`<${es} error=${r} />`:Tt`
    <${Ma} summary=${t.summary} dataRange=${t.dataRange} />
    ${rs({route:y,summary:t.summary,projects:t.projects,setProjects:t.setProjects,jobs:t.jobs,projectsLoading:i,navigate:n,setSelectedJob:t.setSelectedJob,handleJobProjectChange:$,handleRatesChanged:h,handleAutoGroup:w,projectPrices:t.projectPrices,q:t.q,setQ:t.setQ,statusFilter:t.statusFilter,setStatusFilter:t.setStatusFilter,deviceFilter:t.deviceFilter,setDeviceFilter:t.setDeviceFilter,devices:c,view:t.view,setView:t.setView,density:t.density,setDensity:t.setDensity,filtered:l,isFiltered:o,sorted:m,sortCol:t.sortCol,sortDir:t.sortDir,handleSort:v})}
    <${ms}
      selectedJob=${t.selectedJob}
      closeModal=${_}
      patchJob=${g}
      projects=${t.projects}
      handleJobProjectChange=${$}
      handleJobStatusChange=${b}
      handleJobExtraLaborChange=${P}
      handleNavigateToProject=${C}
    />
    <${Xn} />
  `}const fs=Tt`<${Qe} base="/ui"><${$s} /></${Qe}>`;Hn(fs,document.getElementById("app"));
