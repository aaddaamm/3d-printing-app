(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();var Ot,I,Re,at,Pe,Oe,He,zt,Dt,wt,qe,re,te,ee,We,Ut={},At=[],hn=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Ht=Array.isArray;function Z(t,e){for(var n in e)t[n]=e[n];return t}function oe(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function T(t,e,n){var a,i,s,r={};for(s in e)s=="key"?a=e[s]:s=="ref"?i=e[s]:r[s]=e[s];if(arguments.length>2&&(r.children=arguments.length>3?Ot.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(s in t.defaultProps)r[s]===void 0&&(r[s]=t.defaultProps[s]);return Jt(t,r,a,i,null)}function Jt(t,e,n,a,i){var s={type:t,props:e,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:i??++Re,__i:-1,__u:0};return i==null&&I.vnode!=null&&I.vnode(s),s}function qt(t){return t.children}function Bt(t,e){this.props=t,this.context=e}function ft(t,e){if(e==null)return t.__?ft(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?ft(t):null}function bn(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,a=[],i=[],s=Z({},e);s.__v=e.__v+1,I.vnode&&I.vnode(s),le(t.__P,s,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,a,n??ft(e),!!(32&e.__u),i),s.__v=e.__v,s.__.__k[s.__i]=s,ze(a,s,i),e.__e=e.__=null,s.__e!=n&&Qe(s)}}function Qe(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),Qe(t)}function ne(t){(!t.__d&&(t.__d=!0)&&at.push(t)&&!Rt.__r++||Pe!=I.debounceRendering)&&((Pe=I.debounceRendering)||Oe)(Rt)}function Rt(){try{for(var t,e=1;at.length;)at.length>e&&at.sort(He),t=at.shift(),e=at.length,bn(t)}finally{at.length=Rt.__r=0}}function Ve(t,e,n,a,i,s,r,u,d,p,c){var o,l,_,f,y,m,g,$=a&&a.__k||At,b=e.length;for(d=yn(n,e,$,d,b),o=0;o<b;o++)(_=n.__k[o])!=null&&(l=_.__i!=-1&&$[_.__i]||Ut,_.__i=o,m=le(t,_,l,i,s,r,u,d,p,c),f=_.__e,_.ref&&l.ref!=_.ref&&(l.ref&&ce(l.ref,null,_),c.push(_.ref,_.__c||f,_)),y==null&&f!=null&&(y=f),(g=!!(4&_.__u))||l.__k===_.__k?(d=Ge(_,d,t,g),g&&l.__e&&(l.__e=null)):typeof _.type=="function"&&m!==void 0?d=m:f&&(d=f.nextSibling),_.__u&=-7);return n.__e=y,d}function yn(t,e,n,a,i){var s,r,u,d,p,c=n.length,o=c,l=0;for(t.__k=new Array(i),s=0;s<i;s++)(r=e[s])!=null&&typeof r!="boolean"&&typeof r!="function"?(typeof r=="string"||typeof r=="number"||typeof r=="bigint"||r.constructor==String?r=t.__k[s]=Jt(null,r,null,null,null):Ht(r)?r=t.__k[s]=Jt(qt,{children:r},null,null,null):r.constructor===void 0&&r.__b>0?r=t.__k[s]=Jt(r.type,r.props,r.key,r.ref?r.ref:null,r.__v):t.__k[s]=r,d=s+l,r.__=t,r.__b=t.__b+1,u=null,(p=r.__i=Pn(r,n,d,o))!=-1&&(o--,(u=n[p])&&(u.__u|=2)),u==null||u.__v==null?(p==-1&&(i>c?l--:i<c&&l++),typeof r.type!="function"&&(r.__u|=4)):p!=d&&(p==d-1?l--:p==d+1?l++:(p>d?l--:l++,r.__u|=4))):t.__k[s]=null;if(o)for(s=0;s<c;s++)(u=n[s])!=null&&(2&u.__u)==0&&(u.__e==a&&(a=ft(u)),Ye(u,u));return a}function Ge(t,e,n,a){var i,s;if(typeof t.type=="function"){for(i=t.__k,s=0;i&&s<i.length;s++)i[s]&&(i[s].__=t,e=Ge(i[s],e,n,a));return e}t.__e!=e&&(a&&(e&&t.type&&!e.parentNode&&(e=ft(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Pn(t,e,n,a){var i,s,r,u=t.key,d=t.type,p=e[n],c=p!=null&&(2&p.__u)==0;if(p===null&&u==null||c&&u==p.key&&d==p.type)return n;if(a>(c?1:0)){for(i=n-1,s=n+1;i>=0||s<e.length;)if((p=e[r=i>=0?i--:s++])!=null&&(2&p.__u)==0&&u==p.key&&d==p.type)return r}return-1}function ke(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||hn.test(e)?n:n+"px"}function Lt(t,e,n,a,i){var s,r;t:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof a=="string"&&(t.style.cssText=a=""),a)for(e in a)n&&e in n||ke(t.style,e,"");if(n)for(e in n)a&&n[e]==a[e]||ke(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")s=e!=(e=e.replace(qe,"$1")),r=e.toLowerCase(),e=r in t||e=="onFocusOut"||e=="onFocusIn"?r.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+s]=n,n?a?n[wt]=a[wt]:(n[wt]=re,t.addEventListener(e,s?ee:te,s)):t.removeEventListener(e,s?ee:te,s);else{if(i=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break t}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function we(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[Dt]==null)e[Dt]=re++;else if(e[Dt]<n[wt])return;return n(I.event?I.event(e):e)}}}function le(t,e,n,a,i,s,r,u,d,p){var c,o,l,_,f,y,m,g,$,b,P,w,h,k,F,N=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[u=e.__e=n.__e]),(c=I.__b)&&c(e);t:if(typeof N=="function")try{if(g=e.props,$=N.prototype&&N.prototype.render,b=(c=N.contextType)&&a[c.__c],P=c?b?b.props.value:c.__:a,n.__c?m=(o=e.__c=n.__c).__=o.__E:($?e.__c=o=new N(g,P):(e.__c=o=new Bt(g,P),o.constructor=N,o.render=wn),b&&b.sub(o),o.state||(o.state={}),o.__n=a,l=o.__d=!0,o.__h=[],o._sb=[]),$&&o.__s==null&&(o.__s=o.state),$&&N.getDerivedStateFromProps!=null&&(o.__s==o.state&&(o.__s=Z({},o.__s)),Z(o.__s,N.getDerivedStateFromProps(g,o.__s))),_=o.props,f=o.state,o.__v=e,l)$&&N.getDerivedStateFromProps==null&&o.componentWillMount!=null&&o.componentWillMount(),$&&o.componentDidMount!=null&&o.__h.push(o.componentDidMount);else{if($&&N.getDerivedStateFromProps==null&&g!==_&&o.componentWillReceiveProps!=null&&o.componentWillReceiveProps(g,P),e.__v==n.__v||!o.__e&&o.shouldComponentUpdate!=null&&o.shouldComponentUpdate(g,o.__s,P)===!1){e.__v!=n.__v&&(o.props=g,o.state=o.__s,o.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(O){O&&(O.__=e)}),At.push.apply(o.__h,o._sb),o._sb=[],o.__h.length&&r.push(o);break t}o.componentWillUpdate!=null&&o.componentWillUpdate(g,o.__s,P),$&&o.componentDidUpdate!=null&&o.__h.push(function(){o.componentDidUpdate(_,f,y)})}if(o.context=P,o.props=g,o.__P=t,o.__e=!1,w=I.__r,h=0,$)o.state=o.__s,o.__d=!1,w&&w(e),c=o.render(o.props,o.state,o.context),At.push.apply(o.__h,o._sb),o._sb=[];else do o.__d=!1,w&&w(e),c=o.render(o.props,o.state,o.context),o.state=o.__s;while(o.__d&&++h<25);o.state=o.__s,o.getChildContext!=null&&(a=Z(Z({},a),o.getChildContext())),$&&!l&&o.getSnapshotBeforeUpdate!=null&&(y=o.getSnapshotBeforeUpdate(_,f)),k=c!=null&&c.type===qt&&c.key==null?Ke(c.props.children):c,u=Ve(t,Ht(k)?k:[k],e,n,a,i,s,r,u,d,p),o.base=e.__e,e.__u&=-161,o.__h.length&&r.push(o),m&&(o.__E=o.__=null)}catch(O){if(e.__v=null,d||s!=null)if(O.then){for(e.__u|=d?160:128;u&&u.nodeType==8&&u.nextSibling;)u=u.nextSibling;s[s.indexOf(u)]=null,e.__e=u}else{for(F=s.length;F--;)oe(s[F]);ae(e)}else e.__e=n.__e,e.__k=n.__k,O.then||ae(e);I.__e(O,e,n)}else s==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):u=e.__e=kn(n.__e,e,n,a,i,s,r,d,p);return(c=I.diffed)&&c(e),128&e.__u?void 0:u}function ae(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(ae))}function ze(t,e,n){for(var a=0;a<n.length;a++)ce(n[a],n[++a],n[++a]);I.__c&&I.__c(e,t),t.some(function(i){try{t=i.__h,i.__h=[],t.some(function(s){s.call(i)})}catch(s){I.__e(s,i.__v)}})}function Ke(t){return typeof t!="object"||t==null||t.__b>0?t:Ht(t)?t.map(Ke):Z({},t)}function kn(t,e,n,a,i,s,r,u,d){var p,c,o,l,_,f,y,m=n.props||Ut,g=e.props,$=e.type;if($=="svg"?i="http://www.w3.org/2000/svg":$=="math"?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),s!=null){for(p=0;p<s.length;p++)if((_=s[p])&&"setAttribute"in _==!!$&&($?_.localName==$:_.nodeType==3)){t=_,s[p]=null;break}}if(t==null){if($==null)return document.createTextNode(g);t=document.createElementNS(i,$,g.is&&g),u&&(I.__m&&I.__m(e,s),u=!1),s=null}if($==null)m===g||u&&t.data==g||(t.data=g);else{if(s=s&&Ot.call(t.childNodes),!u&&s!=null)for(m={},p=0;p<t.attributes.length;p++)m[(_=t.attributes[p]).name]=_.value;for(p in m)_=m[p],p=="dangerouslySetInnerHTML"?o=_:p=="children"||p in g||p=="value"&&"defaultValue"in g||p=="checked"&&"defaultChecked"in g||Lt(t,p,null,_,i);for(p in g)_=g[p],p=="children"?l=_:p=="dangerouslySetInnerHTML"?c=_:p=="value"?f=_:p=="checked"?y=_:u&&typeof _!="function"||m[p]===_||Lt(t,p,_,m[p],i);if(c)u||o&&(c.__html==o.__html||c.__html==t.innerHTML)||(t.innerHTML=c.__html),e.__k=[];else if(o&&(t.innerHTML=""),Ve(e.type=="template"?t.content:t,Ht(l)?l:[l],e,n,a,$=="foreignObject"?"http://www.w3.org/1999/xhtml":i,s,r,s?s[0]:n.__k&&ft(n,0),u,d),s!=null)for(p=s.length;p--;)oe(s[p]);u||(p="value",$=="progress"&&f==null?t.removeAttribute("value"):f!=null&&(f!==t[p]||$=="progress"&&!f||$=="option"&&f!=m[p])&&Lt(t,p,f,m[p],i),p="checked",y!=null&&y!=t[p]&&Lt(t,p,y,m[p],i))}return t}function ce(t,e,n){try{if(typeof t=="function"){var a=typeof t.__u=="function";a&&t.__u(),a&&e==null||(t.__u=t(e))}else t.current=e}catch(i){I.__e(i,n)}}function Ye(t,e,n){var a,i;if(I.unmount&&I.unmount(t),(a=t.ref)&&(a.current&&a.current!=t.__e||ce(a,null,e)),(a=t.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){I.__e(s,e)}a.base=a.__P=null}if(a=t.__k)for(i=0;i<a.length;i++)a[i]&&Ye(a[i],e,n||typeof t.type!="function");n||oe(t.__e),t.__c=t.__=t.__e=void 0}function wn(t,e,n){return this.constructor(t,n)}function Cn(t,e,n){var a,i,s,r;e==document&&(e=document.documentElement),I.__&&I.__(t,e),i=(a=!1)?null:e.__k,s=[],r=[],le(e,t=e.__k=T(qt,null,[t]),i||Ut,Ut,e.namespaceURI,i?null:e.firstChild?Ot.call(e.childNodes):null,s,i?i.__e:e.firstChild,a,r),ze(s,t,r)}function Sn(t){function e(n){var a,i;return this.getChildContext||(a=new Set,(i={})[e.__c]=this,this.getChildContext=function(){return i},this.componentWillUnmount=function(){a=null},this.shouldComponentUpdate=function(s){this.props.value!=s.value&&a.forEach(function(r){r.__e=!0,ne(r)})},this.sub=function(s){a.add(s);var r=s.componentWillUnmount;s.componentWillUnmount=function(){a&&a.delete(s),r&&r.call(s)}}),n.children}return e.__c="__cC"+We++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,a){return n.children(a)}).contextType=e,e}Ot=At.slice,I={__e:function(t,e,n,a){for(var i,s,r;e=e.__;)if((i=e.__c)&&!i.__)try{if((s=i.constructor)&&s.getDerivedStateFromError!=null&&(i.setState(s.getDerivedStateFromError(t)),r=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(t,a||{}),r=i.__d),r)return i.__E=i}catch(u){t=u}throw t}},Re=0,Bt.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=Z({},this.state),typeof t=="function"&&(t=t(Z({},n),this.props)),t&&Z(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),ne(this))},Bt.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),ne(this))},Bt.prototype.render=qt,at=[],Oe=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,He=function(t,e){return t.__v.__b-e.__v.__b},Rt.__r=0,zt=Math.random().toString(8),Dt="__d"+zt,wt="__a"+zt,qe=/(PointerCapture)$|Capture$/i,re=0,te=we(!1),ee=we(!0),We=0;var gt,M,Kt,Ce,Ft=0,Xe=[],E=I,Se=E.__b,Fe=E.__r,Ie=E.diffed,Te=E.__c,Ne=E.unmount,Le=E.__;function Wt(t,e){E.__h&&E.__h(M,t,Ft||e),Ft=0;var n=M.__H||(M.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function v(t){return Ft=1,Fn(en,t)}function Fn(t,e,n){var a=Wt(gt++,2);if(a.t=t,!a.__c&&(a.__=[en(void 0,e),function(u){var d=a.__N?a.__N[0]:a.__[0],p=a.t(d,u);d!==p&&(a.__N=[p,a.__[1]],a.__c.setState({}))}],a.__c=M,!M.__f)){var i=function(u,d,p){if(!a.__c.__H)return!0;var c=a.__c.__H.__.filter(function(l){return l.__c});if(c.every(function(l){return!l.__N}))return!s||s.call(this,u,d,p);var o=a.__c.props!==u;return c.some(function(l){if(l.__N){var _=l.__[0];l.__=l.__N,l.__N=void 0,_!==l.__[0]&&(o=!0)}}),s&&s.call(this,u,d,p)||o};M.__f=!0;var s=M.shouldComponentUpdate,r=M.componentWillUpdate;M.componentWillUpdate=function(u,d,p){if(this.__e){var c=s;s=void 0,i(u,d,p),s=c}r&&r.call(this,u,d,p)},M.shouldComponentUpdate=i}return a.__N||a.__}function R(t,e){var n=Wt(gt++,3);!E.__s&&tn(n.__H,e)&&(n.__=t,n.u=e,M.__H.__h.push(n))}function Ze(t){return Ft=5,W(function(){return{current:t}},[])}function W(t,e){var n=Wt(gt++,7);return tn(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function C(t,e){return Ft=8,W(function(){return t},e)}function In(t){var e=M.context[t.__c],n=Wt(gt++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(M)),e.props.value):t.__}function Tn(){for(var t;t=Xe.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(Et),e.__h.some(ie),e.__h=[]}catch(n){e.__h=[],E.__e(n,t.__v)}}}E.__b=function(t){M=null,Se&&Se(t)},E.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Le&&Le(t,e)},E.__r=function(t){Fe&&Fe(t),gt=0;var e=(M=t.__c).__H;e&&(Kt===M?(e.__h=[],M.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(Et),e.__h.some(ie),e.__h=[],gt=0)),Kt=M},E.diffed=function(t){Ie&&Ie(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Xe.push(e)!==1&&Ce===E.requestAnimationFrame||((Ce=E.requestAnimationFrame)||Nn)(Tn)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),Kt=M=null},E.__c=function(t,e){e.some(function(n){try{n.__h.some(Et),n.__h=n.__h.filter(function(a){return!a.__||ie(a)})}catch(a){e.some(function(i){i.__h&&(i.__h=[])}),e=[],E.__e(a,n.__v)}}),Te&&Te(t,e)},E.unmount=function(t){Ne&&Ne(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(a){try{Et(a)}catch(i){e=i}}),n.__H=void 0,e&&E.__e(e,n.__v))};var je=typeof requestAnimationFrame=="function";function Nn(t){var e,n=function(){clearTimeout(a),je&&cancelAnimationFrame(e),setTimeout(t)},a=setTimeout(n,35);je&&(e=requestAnimationFrame(n))}function Et(t){var e=M,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),M=e}function ie(t){var e=M;t.__c=t.__(),M=e}function tn(t,e){return!t||t.length!==e.length||e.some(function(n,a){return n!==t[a]})}function en(t,e){return typeof e=="function"?e(t):e}var nn=function(t,e,n,a){var i;e[0]=0;for(var s=1;s<e.length;s++){var r=e[s++],u=e[s]?(e[0]|=r?1:2,n[e[s++]]):e[++s];r===3?a[0]=u:r===4?a[1]=Object.assign(a[1]||{},u):r===5?(a[1]=a[1]||{})[e[++s]]=u:r===6?a[1][e[++s]]+=u+"":r?(i=t.apply(u,nn(t,u,n,["",null])),a.push(i),u[0]?e[0]|=2:(e[s-2]=0,e[s]=i)):a.push(u)}return a},Me=new Map;function j(t){var e=Me.get(this);return e||(e=new Map,Me.set(this,e)),(e=nn(this,e.get(t)||(e.set(t,e=(function(n){for(var a,i,s=1,r="",u="",d=[0],p=function(l){s===1&&(l||(r=r.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,l,r):s===3&&(l||r)?(d.push(3,l,r),s=2):s===2&&r==="..."&&l?d.push(4,l,0):s===2&&r&&!l?d.push(5,0,!0,r):s>=5&&((r||!l&&s===5)&&(d.push(s,0,r,i),s=6),l&&(d.push(s,l,0,i),s=6)),r=""},c=0;c<n.length;c++){c&&(s===1&&p(),p(c));for(var o=0;o<n[c].length;o++)a=n[c][o],s===1?a==="<"?(p(),d=[d],s=3):r+=a:s===4?r==="--"&&a===">"?(s=1,r=""):r=a+r[0]:u?a===u?u="":r+=a:a==='"'||a==="'"?u=a:a===">"?(p(),s=1):s&&(a==="="?(s=5,i=r,r=""):a==="/"&&(s<5||n[c][o+1]===">")?(p(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(p(),s=2):r+=a),s===3&&r==="!--"&&(s=4,d=d[0])}return p(),d})(t)),e),arguments,[])).length>1?e:e[0]}const Ln=j.bind(T),se=Sn(null);function xe({base:t,children:e}){const n=t.endsWith("/")?t.slice(0,-1):t,a=u=>u===n||u===n+"/"?"/":u.startsWith(n+"/")?u.slice(n.length)||"/":u,[i,s]=v(()=>a(location.pathname));R(()=>{const u=()=>s(a(location.pathname));return window.addEventListener("popstate",u),()=>window.removeEventListener("popstate",u)},[n]);const r=C(u=>{const d=u==="/"?n+"/":n+u;history.pushState(null,"",d),s(u)},[n]);return Ln`<${se.Provider} value=${[i,r]}>${e}</${se.Provider}>`}function de(){const t=In(se);if(!t)throw new Error("useLocation must be used within RouterProvider");return t}function ot(t){if(!t)return"—";const e=Math.floor(t/3600),n=Math.floor(t%3600/60);return e===0?`${n}m`:`${e}h${n>0?` ${n}m`:""}`}function ue(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"};return e.toLocaleString(void 0,a)}function rt(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric"}:{month:"short",day:"numeric",year:"2-digit"};return e.toLocaleDateString(void 0,a)}function A(t){return"$"+t.toFixed(2)}function Tt(t){return t==null?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function pe(t){return t?t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${Math.round(t)} g`:"0 g"}const dt=j.bind(T),jn={finish:"badge badge-finish",running:"badge badge-running",failed:"badge badge-failed",cancel:"badge badge-cancel",pause:"badge badge-pause"};function Nt({status:t}){const e=(t||"").toLowerCase();return dt`<span class=${jn[e]||"badge badge-default"}>${e||"unknown"}</span>`}function Qt({url:t}){const[e,n]=v(!1);return!t||e?dt`<div class="row-thumb-ph">🖨</div>`:dt`<img
    class="row-thumb"
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>n(!0)}
  />`}function Mn({url:t,className:e}){const[n,a]=v(!1);return!t||n?dt`<div class="cover-placeholder">🖨</div>`:dt`<img
    class=${e}
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>a(!0)}
  />`}function Vt({colors:t}){if(!(t!=null&&t.length))return null;const e=[...new Set(t.map(n=>n.slice(0,6).toUpperCase()))].filter(n=>n!=="FFFFFF");return e.length?dt`<span class="swatches"
    >${e.map(n=>dt`<span class="swatch" style=${"background:#"+n} title=${"#"+n} />`)}</span
  >`:null}const De=j.bind(T);let an=()=>{};function x(t,e="info"){an({message:t,type:e,id:Date.now()+Math.random()})}function xn(){const[t,e]=v([]),n=Ze(new Map);an=C(i=>{e(r=>[...r,i]);const s=setTimeout(()=>{e(r=>r.filter(u=>u.id!==i.id)),n.current.delete(i.id)},3500);n.current.set(i.id,s)},[]);const a=C(i=>{const s=n.current.get(i);s&&clearTimeout(s),n.current.delete(i),e(r=>r.filter(u=>u.id!==i))},[]);return t.length?De`
    <div class="toast-container">
      ${t.map(i=>De`
          <div class="toast toast-${i.type}" key=${i.id} onClick=${()=>a(i.id)}>
            ${i.message}
          </div>
        `)}
    </div>
  `:null}const Dn=15e3,Jn=2e4,Bn=5,_e=[{id:"personal",label:"Personal"},{id:"booth",label:"Booth"},{id:"etsy",label:"Etsy"},{id:"custom",label:"Custom"}];async function En(t,e){try{const n=await t.json();return typeof n.error=="string"?n.error:e}catch{return e}}function Un(t){const{timeoutMs:e=Dn,...n}=t??{};return n.signal||e===null?n:{signal:AbortSignal.timeout(e),...n}}function An(t,e){return(t==null?void 0:t.name)==="TimeoutError"?new Error(`${e} (request timed out)`):new Error(`${e} (network error)`)}async function V(t,e,n){let a;try{a=await fetch(t,Un(n))}catch(i){throw An(i,e)}if(!a.ok)throw new Error(await En(a,e));return await a.json()}async function me(t,e,n){try{return{data:await V(t,e,n),error:null}}catch(a){return{data:null,error:a instanceof Error?a:new Error(e)}}}async function ut(t,e,n){const{data:a,error:i}=await me(t,e,n);return i?(x(i.message||e,"error"),null):a}async function tt(t,e,n){return ut(t,n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}async function z(t,e,n,a){return ut(t,n,{...a,method:"POST",headers:{"Content-Type":"application/json",...a==null?void 0:a.headers},body:JSON.stringify(e)})}async function Rn(){return(await V("/api/projects","Failed to load projects.")).projects}async function $e(){return(await V("/api/products","Failed to load products.")).products}async function On(t){return(await V(`/api/products/${t}`,"Failed to load product.")).product}async function Hn(){return(await V("/api/products/print-next","Failed to load print-next products.")).products}async function qn(t){const e=await z("/api/products",t,"Failed to create product.");return(e==null?void 0:e.product)??null}async function Wn(t){const e=await z(`/api/products/from-job/${t}`,{},"Failed to create product from job.");return(e==null?void 0:e.product)??null}async function sn(t){const e=await z(`/api/products/from-project/${t}`,{},"Failed to create product from project.");return(e==null?void 0:e.product)??null}async function ve(t,e){const n=await tt(`/api/products/${t}`,e,"Failed to update product.");return(n==null?void 0:n.product)??null}async function Qn(){return(await V("/api/batches","Failed to load batches.")).batches}async function Vn(t){return(await V(`/api/batches/${t}`,"Failed to load batch.")).batch}async function Gn(t){const e=await z("/api/batches",t,"Failed to create batch.");return(e==null?void 0:e.batch)??null}async function zn(t,e){const n=await tt(`/api/batches/${t}`,e,"Failed to update batch.");return(n==null?void 0:n.batch)??null}async function Kn(t,e){const n=await z(`/api/batches/${t}/projects/${e}`,{},"Failed to add project jobs to batch.");return(n==null?void 0:n.batch)??null}const H=j.bind(T);function Yn(t){const e=t.toLowerCase();return e.includes("a1 mini")?"/ui/printers/a1-mini":e.includes("p1s")?"/ui/printers/p1s":null}function Xn(t){const e=new Map;for(const n of t){const a=n.deviceModel||"Unknown printer",i=e.get(a)??[];i.push(n),e.set(a,i)}return e}function rn(t,e=6){return t.slice().sort((n,a)=>String(a.startTime||"").localeCompare(String(n.startTime||""))).slice(0,e)}function on({printerName:t}){const e=Yn(t);return e?H`<img class="printer-photo" src=${e} alt=${t} />`:H`<div class="printer-photo">🖨️</div>`}function ln({job:t,onJobClick:e}){return H`
    <article class="printer-job-row" key=${t.id} onClick=${()=>e(t)}>
      <div class="printer-job-top">
        <div class="td-thumb"><${Qt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title">${t.designTitle||"Untitled Job"}</span>
          <${Vt} colors=${t.filament_colors} />
        </div>
        <${Nt} status=${t.status} />
      </div>
      <div class="printer-job-bottom">
        <span>${rt(t.startTime)}</span>
        <span>Filament: <strong>${Tt(t.total_weight_g)}</strong></span>
        <span>Time: <strong>${ot(t.total_time_s)}</strong></span>
      </div>
    </article>
  `}function Zn({row:t,jobs:e,onJobClick:n}){const a=t.deviceModel||"Unknown printer",i=rn(e);return H`
    <section class="printer-card" key=${a}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${on} printerName=${a} />
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
        ${i.length?i.map(s=>H`<${ln} key=${s.id} job=${s} onJobClick=${n} />`):H`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function ta({printer:t,jobs:e,onJobClick:n,onToggleActive:a}){const i=t.name||t.model||t.provider_printer_id,s=rn(e),r=t.is_active===1;return H`
    <section class=${"printer-card"+(r?"":" is-retired")} key=${t.id}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${on} printerName=${t.model||i} />
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
        ${s.length?s.map(u=>H`<${ln} key=${u.id} job=${u} onJobClick=${n} />`):H`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function ea(t,e){return e.filter(n=>n.printer_id===t.id)}function na({summary:t,jobs:e,onJobClick:n}){const[a,i]=v([]);R(()=>{ut("/printers","Failed to load printer inventory.").then(d=>{d&&i(d.printers)})},[]);const s=async d=>{const p=await tt(`/printers/${d.id}`,{is_active:d.is_active!==1},"Failed to update printer inventory.");p!=null&&p.printer&&i(c=>c.map(o=>o.id===d.id?p.printer:o))};if(a.length)return H`
      <div class="printer-grid">
        ${a.map(d=>H`<${ta}
              key=${d.id}
              printer=${d}
              jobs=${ea(d,e)}
              onJobClick=${n}
              onToggleActive=${s}
            />`)}
      </div>
    `;const r=(t==null?void 0:t.by_device)??[];if(!r.length)return H`<div class="empty">No printer totals available yet.</div>`;const u=Xn(e);return H`
    <div class="printer-grid">
      ${r.map(d=>H`<${Zn}
            key=${d.deviceModel||"Unknown printer"}
            row=${d}
            jobs=${u.get(d.deviceModel||"Unknown printer")??[]}
            onJobClick=${n}
          />`)}
    </div>
  `}const J=j.bind(T);function aa(t){return!t.startsWith("/projects")&&!t.startsWith("/admin")&&!t.startsWith("/printers")&&!t.startsWith("/catalog")&&!t.startsWith("/products")&&!t.startsWith("/batches")}function ia(t,e){const n=new URLSearchParams;t&&n.set("status",t),e&&n.set("device",e);const a=n.toString();return"/jobs/export.csv"+(a?"?"+a:"")}function sa(t){return t.reduce((e,n)=>(e.weight+=n.total_weight_g||0,e.time+=n.total_time_s||0,e),{weight:0,time:0})}function ra(t){return!t||t==="actual"?null:t==="slicer_estimate"?"estimate":t==="manual"?"manual":"unknown"}function cn({confidence:t}){const e=ra(t);return e?J`<span class="usage-confidence">${e}</span>`:null}const oa=[{label:"Jobs",path:"/",active:aa},{label:"Projects",path:"/projects",active:t=>t.startsWith("/projects")},{label:"Printers",path:"/printers",active:t=>t.startsWith("/printers")},{label:"Products",path:"/products/pipeline",active:t=>t.startsWith("/products")},{label:"Batches",path:"/batches",active:t=>t.startsWith("/batches")},{label:"Catalog",path:"/catalog",active:t=>t.startsWith("/catalog")},{label:"Rates",path:"/admin",active:t=>t.startsWith("/admin")}],la=[["","All Statuses"],["finish","Finished"],["cancel","Cancelled"],["running","Running"],["failed","Failed"],["pause","Paused"]];function Yt(t,e){const n=(t==null?void 0:t.by_device)??[];return n.length?n.map(a=>{const i=a.deviceModel||"Unknown printer";return e==="jobs"?`${i}: ${(a.total_jobs??0).toLocaleString()} jobs`:e==="plates"?`${i}: ${(a.total_plates??0).toLocaleString()} plates`:`${i}: ${((a.total_time_s??0)/3600).toFixed(1).toLocaleString()} h`}).join(`
`):"No printer breakdown available"}function ca({loc:t,navigate:e}){return J`<nav class="top-nav">
    ${oa.map(n=>{const a=n.active(t);return J`
        <button
          key=${n.label}
          class=${"nav-btn"+(a?" active":"")}
          onClick=${()=>e(n.path)}
        >
          ${n.label}
        </button>
      `})}
  </nav>`}function da({summary:t}){var n,a;const e=t==null?void 0:t.totals;return J`
    <div class="stats">
      <div class="stat" title=${Yt(t,"jobs")}>
        <div class="stat-val">${e?(n=e.total_jobs)==null?void 0:n.toLocaleString():"—"}</div>
        <div class="stat-lbl">Total Jobs</div>
      </div>
      <div class="stat">
        <div class="stat-val">${e?((e.total_weight_g??0)/1e3).toFixed(2):"—"}</div>
        <div class="stat-lbl">Filament kg</div>
      </div>
      <div class="stat" title=${Yt(t,"hours")}>
        <div class="stat-val">${e?((e.total_time_s??0)/3600).toFixed(1):"—"}</div>
        <div class="stat-lbl">Print Hours</div>
      </div>
      <div class="stat" title=${Yt(t,"plates")}>
        <div class="stat-val">${e?(a=e.total_plates)==null?void 0:a.toLocaleString():"—"}</div>
        <div class="stat-lbl">Plates</div>
      </div>
    </div>
  `}function ua({summary:t,dataRange:e}){const[n,a]=de(),i=!!(e!=null&&e.min_start&&(e!=null&&e.max_start)),s=(e==null?void 0:e.min_start)??"",r=(e==null?void 0:e.max_start)??"";return J`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>PrintWorks</span></h1>
        ${i&&J`<div class="header-range">
          History: ${rt(s)} → ${rt(r)}
          (${((e==null?void 0:e.task_count)||0).toLocaleString()} tasks)
        </div>`}
        <${ca} loc=${n} navigate=${a} />
      </div>
      <${da} summary=${t} />
    </header>
  `}function pa({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:i,setDeviceFilter:s,devices:r,view:u,setView:d,density:p,setDensity:c,filteredCount:o,totalCount:l}){const _=W(()=>ia(n,i),[n,i]);return J`
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
        ${la.map(([f,y])=>J`<option key=${f} value=${f}>${y}</option> `)}
      </select>
      <select
        value=${i}
        onChange=${f=>s(f.target.value)}
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
  `}function _a({filtered:t,isFiltered:e}){if(!e||!t.length)return null;const n=sa(t);return J`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${t.length}</strong></span>
      <span>Filament: <strong>${pe(n.weight)}</strong></span>
      <span>Print time: <strong>${ot(n.time)}</strong></span>
    </div>
  `}function dn({printRun:t}){return(t??1)<=1?null:J`<span class="run-badge">Run ${t}</span>`}function ma(t,e){return t?e==="asc"?" ↑":" ↓":""}function $a({sortCol:t,sortDir:e,onSort:n}){return J`<div class="jobs-record-sortbar">
    <span class="jobs-record-sort-label">Sort</span>
    ${[{col:"startTime",label:"Date"},{col:"designTitle",label:"Title"},{col:"deviceModel",label:"Printer"},{col:"total_weight_g",label:"Filament"},{col:"total_time_s",label:"Time"},{col:"final_price",label:"Price"}].map(({col:i,label:s})=>{const r=t===i;return J`
        <button
          key=${i}
          class=${"jobs-record-sort-btn"+(r?" active":"")}
          onClick=${()=>n(i)}
        >
          ${s}${ma(r,e)}
        </button>
      `})}
  </div>`}function va({job:t,onJobClick:e}){return J`
    <article class="jobs-record-row" onClick=${()=>e(t)}>
      <div class="jobs-record-top">
        <div class="td-thumb"><${Qt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title" title=${t.designTitle||"Untitled"}
            >${t.designTitle||"Untitled Job"}</span
          >
          <${dn} printRun=${t.print_run} />
          <${Vt} colors=${t.filament_colors} />
        </div>
        <div><${Nt} status=${t.status} /></div>
      </div>
      <div class="jobs-record-bottom">
        <span>🖨 ${t.deviceModel||"—"}</span>
        <span title=${ue(t.startTime)}>📅 ${rt(t.startTime)}</span>
        <span
          >🧵 <strong>${Tt(t.total_weight_g)}</strong>
          <${cn} confidence=${t.material_usage_confidence} />
        </span>
        <span>⏱ <strong>${ot(t.total_time_s)}</strong></span>
        <span
          >💰
          <strong
            >${t.final_price!==null&&t.final_price!==void 0?A(t.final_price):"—"}</strong
          ></span
        >
        <span>🧱 <strong>${t.plate_count??"—"}</strong></span>
        ${t.customer?J`<span class="customer-pill">${t.customer}</span>`:null}
      </div>
    </article>
  `}function fa({sorted:t,sortCol:e,sortDir:n,onSort:a,onJobClick:i,density:s}){return J`
    <div class=${"jobs-record-list-wrap density-"+s}>
      <${$a} sortCol=${e} sortDir=${n} onSort=${a} />
      <div class="jobs-record-list">
        ${t.map(r=>J`<${va} key=${r.id} job=${r} onJobClick=${i} />`)}
      </div>
    </div>
  `}function ga({job:t,onJobClick:e}){const n=async a=>{a.stopPropagation();const i=await Wn(t.id);i&&x(`Created product: ${i.name}`,"success")};return J`
    <div class="card" onClick=${()=>e(t)}>
      <${Mn} url=${t.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${t.designTitle||"Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${t.deviceModel||"—"}</span>
          <span>📅 ${rt(t.startTime)}</span>
          <span>⏱ ${ot(t.total_time_s)}</span>
          <span
            >🧵 ${Tt(t.total_weight_g)}
            <${cn} confidence=${t.material_usage_confidence} />
          </span>
          ${t.final_price!==null&&t.final_price!==void 0&&J`<span>💰 ${A(t.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${Nt} status=${t.status} />
          <${dn} printRun=${t.print_run} />
          ${t.customer&&J`<span class="customer-pill">${t.customer}</span>`}
          <${Vt} colors=${t.filament_colors} />
          <button class="btn-secondary btn-compact" type="button" onClick=${n}>
            Create product
          </button>
        </div>
      </div>
    </div>
  `}function ha({sorted:t,onJobClick:e,density:n}){return J`
    <div class=${"grid-view density-"+n}>
      ${t.map(a=>J`<${ga} key=${a.id} job=${a} onJobClick=${e} />`)}
    </div>
  `}function fe(t){R(()=>{const e=n=>{n.key==="Escape"&&t()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[t])}const q=j.bind(T);function ba(t){return t==="actual"?"actual usage":t==="slicer_estimate"?"slicer estimate":t==="manual"?"manual entry":"unknown confidence"}function ya({jobId:t}){const[e,n]=v(null);if(R(()=>{let s=!0;return n(null),me(`/jobs/${t}/price`,"Pricing not configured").then(({data:r})=>{s&&n(r??!1)}).catch(()=>{s&&n(!1)}),()=>{s=!1}},[t]),e===null)return q`<div class="pricing-row pricing-loading">Loading price…</div>`;if(e===!1)return q`<div class="pricing-row pricing-na">Pricing not configured</div>`;const a=e.final_price-e.base_price,i=e.base_price>0?Math.round(a/e.base_price*100):0;return q`
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
            (${i>0?"+":""}${i}%)</span
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
  `}const Pa=["finish","failed","cancel","running","pause"];function ka({job:t,onClose:e,onPatch:n,projects:a,onJobProjectChange:i,onJobStatusChange:s,onJobExtraLaborChange:r,onNavigateToProject:u}){const[d,p]=v(t.customer??""),[c,o]=v(t.notes??""),[l,_]=v(t.price_override!=null?String(t.price_override):"");fe(e);const f=C(m=>{const g=m.target.value;i(t.id,g===""?null:Number(g))},[t.id,i]),y=C(m=>{const g=m.target.value;s(t.id,g===""?null:g)},[t.id,s]);return q`
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
                <${Nt} status=${t.status} />
                ${t.status_override&&q`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item">
              <label>Printer</label>
              <div class="detail-val">${t.deviceModel||"—"}</div>
            </div>
            <div class="detail-item">
              <label>Started</label>
              <div class="detail-val">${ue(t.startTime)}</div>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <div class="detail-val">${ot(t.total_time_s)}</div>
            </div>
            <div class="detail-item">
              <label>Filament</label>
              <div class="detail-val">
                ${Tt(t.total_weight_g)}
                <span class="usage-confidence"
                  >${ba(t.material_usage_confidence)}</span
                >
                <${Vt} colors=${t.filament_colors} />
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
          <${ya} jobId=${t.id} key=${t.id+"-"+t.extra_labor_minutes} />
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
              ${Pa.map(m=>q`<option key=${m} value=${m}>${m}</option>`)}
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
  `}const U=j.bind(T);function bt(t){return t!=null}function wa({project:t,totalPrice:e,onClick:n,onRename:a}){const i=t.total_weight_g,s=t.total_time_s,r=async u=>{u.stopPropagation();const d=await sn(t.id);d&&x(`Created product: ${d.name}`,"success")};return U`
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
        ${bt(t.total_plates)&&U`<span>
          <strong>${t.total_plates}</strong> plate${t.total_plates!==1?"s":""}
        </span>`}
        ${bt(i)&&U`<span>${pe(i)}</span>`}
        ${bt(s)&&U`<span>${ot(s)}</span>`}
        ${bt(e)&&U`<span class="proj-card-price">${A(e)}</span>`}
      </div>
      ${t.notes&&U`<div class="proj-card-notes">${t.notes}</div>`}
    </div>
  `}function Ca({price:t}){return t?U`
    <span>Material: <strong>${A(t.material_cost)}</strong></span>
    <span>Machine: <strong>${A(t.machine_cost)}</strong></span>
    <span>Labor: <strong>${A(t.labor_cost)}</strong></span>
    ${t.extra_labor_cost>0&&U`<span>Extra labor: <strong>${A(t.extra_labor_cost)}</strong></span>`}
    <span class="totals-total">Total: <strong>${A(t.final_price)}</strong></span>
  `:null}function Sa({jobs:t,onJobClick:e,onRemoveJob:n,onMoveToNewProject:a}){return t.length===0?U`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`:U`
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
                <td class="td-thumb"><${Qt} url=${i.cover_url} /></td>
                <td class="td-title">
                  <span class="row-title">${i.designTitle||"Untitled Job"}</span>
                </td>
                <td>${i.deviceModel||"—"}</td>
                <td title=${ue(i.startTime)}>${rt(i.startTime)}</td>
                <td><${Nt} status=${i.status} /></td>
                <td class="td-num"><strong>${i.plate_count??1}</strong></td>
                <td class="td-num"><strong>${Tt(i.total_weight_g)}</strong></td>
                <td class="td-num">${ot(i.total_time_s)}</td>
                <td class="td-num">
                  ${bt(i.final_price)?U`<strong>${A(i.final_price)}</strong>`:"—"}
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
  `}function Fa({loading:t,filtered:e,q:n,projectPrices:a,navigate:i,onRename:s}){return t?U`<div class="empty">Loading projects…</div>`:e.length===0?U`<div class="empty">${n?"No projects match your search.":"No projects yet. Create one to group related jobs together."}</div>`:U`
    <div class="proj-grid">
      ${e.map(r=>U`<${wa}
            key=${r.id}
            project=${r}
            totalPrice=${a[r.id]??null}
            onClick=${()=>i(`/projects/${r.id}`)}
            onRename=${s}
          />`)}
    </div>
  `}const Ia=j.bind(T);function Ta({job:t,initialName:e,onClose:n,onProjectCreated:a,onMoveJobToProject:i,onNavigateToProject:s}){const[r,u]=v(e),d=C(async()=>{const p=r.trim();if(!p)return;const c=await z("/projects",{name:p,customer:t.customer??null,notes:null},"Failed to create project.");c!=null&&c.project&&(a(c.project),i(t.id,c.project.id),s(c.project.id),n())},[t.customer,t.id,r,n,i,s,a]);return Ia`<div class="modal-backdrop" onClick=${n}>
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
  </div>`}const Na=j.bind(T);function La({project:t,onClose:e,onRenamed:n}){const[a,i]=v(t.name??""),[s,r]=v(!1),u=C(async()=>{const d=a.trim();if(d){r(!0);try{const p=await tt(`/projects/${t.id}`,{name:d},"Failed to rename project."),c=p==null?void 0:p.project;if(!c)return;n(c),e()}finally{r(!1)}}},[a,e,n,t.id]);return Na`<div class="modal-backdrop" onClick=${e}>
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
  </div>`}function ja(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>[a.name,a.customer,a.notes].filter(Boolean).join(" ").toLowerCase().includes(n))}function Ma(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>`${a.designTitle||""} ${a.customer||""}`.toLowerCase().includes(n))}function xa(t,e,n){return`${n?`${e.length} of ${t.length}`:String(t.length)} project${t.length!==1?"s":""}`}function Da(t,e){return t.some(n=>n.id===e.id)?t.map(n=>n.id===e.id?{...n,...e}:n):[e,...t]}function Ja(t,e){if(t===0){x("No ungrouped jobs found — everything is already assigned to a project.","info");return}x(`Created ${t} project${t!==1?"s":""}, assigned ${e} job${e!==1?"s":""}.`,"success")}function Ba(t){return t.reduce((e,n)=>e+(n.total_weight_g||0),0)}function Ea(t){return t.reduce((e,n)=>e+(n.total_time_s||0),0)}function Ua(t){return t.reduce((e,n)=>e+(n.plate_count||0),0)}const yt=j.bind(T);function un(t){return e=>{e.target===e.currentTarget&&t()}}function Aa({onClose:t,onCreate:e}){const[n,a]=v(""),[i,s]=v(""),[r,u]=v(""),[d,p]=v(!1);fe(t);const c=C(async o=>{if(o.preventDefault(),!!n.trim()){p(!0);try{const l=await z("/projects",{name:n.trim(),customer:i||null,notes:r||null},"Failed to create project.");if(!(l!=null&&l.project))return;e(l.project),t()}finally{p(!1)}}},[n,i,r,e,t]);return yt`
    <div class="overlay" onClick=${un(t)}>
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
  `}function Ra({unassignedJobs:t,onClose:e,onAdd:n}){const[a,i]=v("");fe(e);const s=W(()=>Ma(t,a),[t,a]);return yt`
    <div class="overlay" onClick=${un(e)}>
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
          ${s.length===0?yt`<div class="empty" style="padding:16px 0">
                ${a?"No matches.":"All jobs are already assigned to projects."}
              </div>`:yt`<div class="add-jobs-list">
                ${s.map(r=>yt`
                    <div class="add-jobs-row" key=${r.id} onClick=${()=>n(r.id)}>
                      <${Qt} url=${r.cover_url} />
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
  `}const jt=new Map;function Oa(t,e){const[n,a]=v(()=>jt.get(t)??null);return R(()=>{if(a(jt.get(t)??null),!e){jt.delete(t),a(null);return}let i=!1;return ut(`/projects/${t}/price`,"Failed to load project price.").then(s=>{!s||i||(jt.set(t,s),a(s))}),()=>{i=!0}},[t,e]),n}const Y=j.bind(T);function Ha({project:t,jobs:e,unassignedJobs:n,onBack:a,onJobClick:i,onAddJob:s,onRemoveJob:r,onProjectUpdated:u,onMoveJobToProject:d,onNavigateToProject:p}){const[c,o]=v(!1),[l,_]=v(!1),[f,y]=v(null),[m,g]=v(t.name??""),[$,b]=v(t.customer??""),[P,w]=v(t.notes??""),h=t.job_count??e.length,k=Oa(t.id,h),F=Ba(e),N=Ea(e),O=Ua(e),K=Ze(new Map),lt=W(()=>{for(const S of e)S.final_price!==null&&S.final_price!==void 0&&K.current.set(S.id,S.final_price);return e.map(S=>{if(S.final_price!==null&&S.final_price!==void 0)return S;const Gt=K.current.get(S.id);return Gt==null?S:{...S,final_price:Gt}})},[e]),vn=C(S=>s(S),[s]),fn=C(async()=>{const S=await sn(t.id);S&&x(`Created product: ${S.name}`,"success")},[t.id]),gn=C(async()=>{const S=await tt(`/projects/${t.id}`,{name:m.trim(),customer:$.trim()||null,notes:P.trim()||null},"Failed to update project.");S!=null&&S.project&&(u(S.project),_(!1))},[$,m,P,u,t.id]);return Y`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${a}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${t.name}</h2>
          ${t.customer&&Y`<span class="customer-pill">${t.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${()=>_(S=>!S)}>
          ${l?"Cancel edit":"Edit project"}
        </button>
        <button class="btn-secondary" onClick=${fn}>Create product</button>
        <button class="btn-secondary" onClick=${()=>o(!0)}>+ Add Jobs</button>
      </div>
      ${l&&Y`<div class="modal-form proj-detail-notes">
        <label>
          Project name
          <input
            value=${m}
            onInput=${S=>g(S.target.value)}
          />
        </label>
        <label>
          Customer
          <input
            value=${$}
            onInput=${S=>b(S.target.value)}
          />
        </label>
        <label>
          Notes
          <textarea
            value=${P}
            onInput=${S=>w(S.target.value)}
          />
        </label>
        <button class="btn-primary" disabled=${!m.trim()} onClick=${gn}>
          Save project
        </button>
      </div>`}
      ${t.notes&&Y`<div class="proj-detail-notes">${t.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Print runs: <strong>${h}</strong></span>
        <span>Plates: <strong>${O}</strong></span>
        <span>Filament: <strong>${pe(F)}</strong></span>
        <span>Print time: <strong>${ot(N)}</strong></span>
        <${Ca} price=${k} />
      </div>
      <${Sa}
        jobs=${lt}
        onJobClick=${i}
        onRemoveJob=${r}
        onMoveToNewProject=${y}
      />
      ${c&&Y`<${Ra}
        unassignedJobs=${n}
        onClose=${()=>o(!1)}
        onAdd=${vn}
      />`}
      ${f&&Y`<${Ta}
        job=${f}
        initialName=${f.designTitle||""}
        onClose=${()=>y(null)}
        onProjectCreated=${u}
        onMoveJobToProject=${d}
        onNavigateToProject=${p}
      />`}
    </div>
  `}function qa({projects:t,setProjects:e,onAutoGroup:n,projectPrices:a,loading:i=!1}){const[s,r]=v(!1),[u,d]=v(!1),[p,c]=v(null),[o,l]=v(""),[,_]=de(),f=C(async()=>{d(!0);try{const g=await z("/projects/auto-group",{},"Auto-group failed.");if(!g)return;const{projects_created:$,jobs_assigned:b}=g;await n(),Ja($,b)}finally{d(!1)}},[n]),y=C(g=>{e($=>[g,...$]),_(`/projects/${g.id}`)},[e,_]),m=W(()=>ja(t,o),[t,o]);return Y`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${o}
        onInput=${g=>l(g.target.value)}
      />
      <span class="proj-list-count">${xa(t,m,o)}</span>
      <button class="btn-secondary" onClick=${f} disabled=${u}>
        ${u?"Grouping…":"⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${()=>r(!0)}>+ New Project</button>
    </div>
    <${Fa}
      loading=${i}
      filtered=${m}
      q=${o}
      projectPrices=${a}
      navigate=${_}
      onRename=${c}
    />
    ${s&&Y`<${Aa} onClose=${()=>r(!1)} onCreate=${y} />`}
    ${p&&Y`<${La}
      project=${p}
      onClose=${()=>c(null)}
      onRenamed=${g=>e($=>Da($,g))}
    />`}
  `}const G=j.bind(T),Wa=2e3;function Je(t,e,n){const a=e(n);return t.map(i=>e(i)===a?n:i)}function Qa(t){return t==="saving"?"Saving…":t==="saved"?"✓ Saved":"Save"}function Va(t,e,n){return t===n?"saving":e===n?"saved":"idle"}function Ga(t){const[e,n]=v(""),[a,i]=v(""),s=d=>{i(d),setTimeout(()=>i(""),Wa)};return{runSave:async(d,p)=>{n(d);try{if(!await p())return;s(d),t()}finally{n("")}},getStateFor:d=>Va(e,a,d)}}function Q({label:t,value:e,onChange:n,step:a="0.01",min:i="0"}){return G`
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
  `}function ge({state:t}){return G`<button type="submit" class="btn-primary" disabled=${t==="saving"}>
    ${Qa(t)}
  </button>`}function pt({title:t,description:e,children:n}){return G`
    <section class="admin-section">
      <h3 class="admin-section-title">${t}</h3>
      <p class="admin-section-desc">${e}</p>
      ${n}
    </section>
  `}function za({labor:t,saveState:e,onSave:n}){const[a,i]=v(t);return R(()=>i(t),[t]),G`
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
      <div class="admin-card-actions"><${ge} state=${e} /></div>
    </form>
  `}function Ka({machine:t,saveState:e,onSave:n}){const[a,i]=v(t);R(()=>i(t),[t]);const s=a.purchase_price/a.lifetime_hrs+a.electricity_rate+a.maintenance_buffer;return G`
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
        <div class="admin-card-actions"><${ge} state=${e} /></div>
      </div>
    </form>
  `}function Ya({material:t,saveState:e,onSave:n}){const[a,i]=v(t);R(()=>i(t),[t]);const s=a.cost_per_g*(1+a.waste_buffer_pct);return G`
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
        <div class="admin-card-actions"><${ge} state=${e} /></div>
      </div>
    </form>
  `}function Xa({onRatesChanged:t=()=>{}}){const[e,n]=v(null),{runSave:a,getStateFor:i}=Ga(t);R(()=>{ut("/rates","Failed to load rates.").then(o=>{o&&n(o)})},[]);const s=async o=>{await a("labor",async()=>{const l=await tt("/rates/labor",o,"Failed to save labor rates."),_=l==null?void 0:l.labor_config;return _?(n(f=>f&&{...f,labor_config:_}),!0):!1})},r=async o=>{const{device_model:l,purchase_price:_,lifetime_hrs:f,electricity_rate:y,maintenance_buffer:m}=o;await a(l,async()=>{const g=await tt(`/rates/machines/${encodeURIComponent(l)}`,{purchase_price:_,lifetime_hrs:f,electricity_rate:y,maintenance_buffer:m},"Failed to save machine rate."),$=g==null?void 0:g.machine_rate;return $?(n(b=>b&&{...b,machine_rates:Je(b.machine_rates,P=>P.device_model,$)}),!0):!1})},u=async o=>{const{filament_type:l,cost_per_g:_,waste_buffer_pct:f}=o;await a(l,async()=>{const y=await tt(`/rates/materials/${encodeURIComponent(l)}`,{cost_per_g:_,waste_buffer_pct:f},"Failed to save material rate."),m=y==null?void 0:y.material_rate;return m?(n(g=>g&&{...g,material_rates:Je(g.material_rates,$=>$.filament_type,m)}),!0):!1})};if(!e)return G`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;const{labor_config:d,machine_rates:p,material_rates:c}=e;return G`
    <div class="admin-page">
      <h2 class="admin-title">Rates & Pricing</h2>

      <${pt}
        title="Labor"
        description="Applied once per job (or once per project for project pricing)."
      >
        <${za}
          labor=${d}
          saveState=${i("labor")}
          onSave=${s}
        />
      </${pt}>

      <${pt}
        title="Machine Rates"
        description="Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance."
      >
        ${p.map(o=>G`
            <${Ka}
              key=${o.device_model}
              machine=${o}
              saveState=${i(o.device_model)}
              onSave=${r}
            />
          `)}
      </${pt}>

      <${pt}
        title="Material Rates"
        description="Cost per gram including waste. Rate = cost × (1 + waste fraction)."
      >
        ${c.map(o=>G`
            <${Ya}
              key=${o.filament_type}
              material=${o}
              saveState=${i(o.filament_type)}
              onSave=${u}
            />
          `)}
      </${pt}>
    </div>
  `}const pn=j.bind(T);function Ct(t){return t==null?"—":`$${t.toFixed(2)}`}function _n(t){return t==null?"—":`${Math.round(t*100)}%`}function Za(t){return t==null?"—":t<3600?`${Math.round(t/60)} min`:`${(t/3600).toFixed(1)} h`}function ti(t){return t==null?"batch-margin batch-margin--unknown":t>=.45?"batch-margin batch-margin--good":t>=.25?"batch-margin batch-margin--ok":"batch-margin batch-margin--low"}function _t({label:t,value:e}){return pn`<div class="batch-price-metric"><span>${t}</span><strong>${e}</strong></div>`}function ei({batch:t}){return pn`<div class="batch-price-breakdown" aria-label="Batch price breakdown">
    <${_t} label="Unit cost" value=${Ct(t.unit_cost)} />
    <${_t} label="Suggested" value=${Ct(t.suggested_price)} />
    <${_t} label="Fixed fee" value=${Ct(t.fixed_fee_per_order)} />
    <${_t} label="Margin" value=${_n(t.estimated_margin_pct)} />
    <${_t}
      label="Material"
      value=${t.total_filament_g==null?"—":`${t.total_filament_g.toFixed(1)} g`}
    />
    <${_t} label="Print time" value=${Za(t.total_print_time_s)} />
  </div>`}const ct=j.bind(T);function Pt(t){return t==null}function ni(t){return Pt(t)?"":String(t/3600)}function kt(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function ai(t){const e=kt(t);return e===null?null:Math.round(e*3600)}function mt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>0?e:null}function Mt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>=0?e:null}function Xt(t,e){return Object.prototype.hasOwnProperty.call(t,e)}function Zt(t){return{productId:String(t.product_id),pricingProfileId:t.pricing_profile_id,plannedQuantity:String(t.planned_quantity),completedQuantity:String(t.completed_quantity),failedQuantity:String(t.failed_quantity),materialType:t.material_type??"",primaryColor:t.primary_color??"",totalFilamentG:Pt(t.total_filament_g)?"":String(t.total_filament_g),totalPrintTimeHours:ni(t.total_print_time_s),setupMinutes:Pt(t.setup_minutes)?"":String(t.setup_minutes),handlingMinutesPerUnit:Pt(t.handling_minutes_per_unit)?"":String(t.handling_minutes_per_unit),packagingCostPerUnit:Pt(t.packaging_cost_per_unit)?"":String(t.packaging_cost_per_unit),notes:t.notes??""}}function L({label:t,children:e}){return ct`<label class="form-label">${t}${e}</label>`}function ii({batchId:t,navigate:e}){const[n,a]=v(null),[i,s]=v([]),[r,u]=v([]),[d,p]=v(""),[c,o]=v(null),[l,_]=v(!0),[f,y]=v(!1),[m,g]=v(!1);R(()=>{let h=!1;return Promise.all([Vn(t),$e(),Rn()]).then(([k,F,N])=>{h||(a(k),s(F),u(N),o(Zt(k)))}).catch(k=>{x(k instanceof Error?k.message:"Failed to load batch.","error")}).finally(()=>{h||_(!1)}),()=>{h=!0}},[t]);const $=(h,k)=>{o(F=>F&&{...F,[h]:k})},b=!!(c&&mt(c.productId)&&mt(c.plannedQuantity)&&Mt(c.completedQuantity)!==null&&Mt(c.failedQuantity)!==null),P=async()=>{if(!n)return;const h=mt(d);if(h){g(!0);try{const k=await Kn(n.id,h);if(!k)return;a(k),o(Zt(k)),x("Project jobs added to batch.","success")}finally{g(!1)}}},w=async h=>{if(h.preventDefault(),!c||!n)return;const k=mt(c.productId),F=mt(c.plannedQuantity),N=Mt(c.completedQuantity),O=Mt(c.failedQuantity);if(!k||!F||N===null||O===null)return;const K={product_id:k,pricing_profile_id:c.pricingProfileId,planned_quantity:F,completed_quantity:N,failed_quantity:O,material_type:c.materialType.trim()||null,primary_color:c.primaryColor.trim()||null,total_filament_g:kt(c.totalFilamentG),total_print_time_s:ai(c.totalPrintTimeHours),notes:c.notes.trim()||null};(Xt(n,"setup_minutes")||c.setupMinutes.trim())&&(K.setup_minutes=kt(c.setupMinutes)),(Xt(n,"handling_minutes_per_unit")||c.handlingMinutesPerUnit.trim())&&(K.handling_minutes_per_unit=kt(c.handlingMinutesPerUnit)),(Xt(n,"packaging_cost_per_unit")||c.packagingCostPerUnit.trim())&&(K.packaging_cost_per_unit=kt(c.packagingCostPerUnit)),y(!0);try{const lt=await zn(n.id,K);if(!lt)return;a(lt),o(Zt(lt)),x("Batch updated.","success")}finally{y(!1)}};return l?ct`<div class="empty">Loading batch…</div>`:!n||!c?ct`<div class="empty">Batch not found.</div>`:ct`<main class="product-detail-page batch-detail-page">
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
        <${ei} batch=${n} />
      </aside>

      <form class="product-detail-form" onSubmit=${w}>
        <section class="admin-section">
          <h3 class="admin-section-title">Batch setup</h3>
          <div class="product-form-grid">
            <${L} label="Product">
              <select
                class="form-input"
                value=${c.productId}
                onChange=${h=>$("productId",h.target.value)}
              >
                ${i.map(h=>ct`<option key=${h.id} value=${String(h.id)}>
                      ${h.name}
                    </option>`)}
              </select>
            </${L}>
            <${L} label="Pricing profile">
              <select
                class="form-input"
                value=${c.pricingProfileId}
                onChange=${h=>$("pricingProfileId",h.target.value)}
              >
                ${_e.map(h=>ct`<option key=${h.id} value=${h.id}>${h.label}</option>`)}
              </select>
            </${L}>
            <${L} label="Planned quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${c.plannedQuantity}
                onInput=${h=>$("plannedQuantity",h.target.value)}
              />
            </${L}>
            <${L} label="Completed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${c.completedQuantity}
                onInput=${h=>$("completedQuantity",h.target.value)}
              />
            </${L}>
            <${L} label="Failed quantity">
              <input
                class="form-input"
                inputmode="numeric"
                value=${c.failedQuantity}
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
            <${L} label="Material">
              <input
                class="form-input"
                value=${c.materialType}
                placeholder="PLA"
                onInput=${h=>$("materialType",h.target.value)}
              />
            </${L}>
            <${L} label="Color">
              <input
                class="form-input"
                value=${c.primaryColor}
                placeholder="#ffffff or White"
                onInput=${h=>$("primaryColor",h.target.value)}
              />
            </${L}>
            <${L} label="Total grams">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.totalFilamentG}
                placeholder="120"
                onInput=${h=>$("totalFilamentG",h.target.value)}
              />
            </${L}>
            <${L} label="Total time (hours)">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.totalPrintTimeHours}
                placeholder="4.5"
                onInput=${h=>$("totalPrintTimeHours",h.target.value)}
              />
            </${L}>
            <${L} label="Setup minutes">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.setupMinutes}
                placeholder="10"
                onInput=${h=>$("setupMinutes",h.target.value)}
              />
            </${L}>
            <${L} label="Handling minutes / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.handlingMinutesPerUnit}
                placeholder="3"
                onInput=${h=>$("handlingMinutesPerUnit",h.target.value)}
              />
            </${L}>
            <${L} label="Packaging cost / unit">
              <input
                class="form-input"
                inputmode="decimal"
                value=${c.packagingCostPerUnit}
                placeholder="0.75"
                onInput=${h=>$("packagingCostPerUnit",h.target.value)}
              />
            </${L}>
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
  </main>`}const Be=j.bind(T);function si({batch:t,onOpen:e}){const n=t.completed_quantity+t.failed_quantity;return Be`<article class="batch-card" onClick=${()=>e(t)}>
    <div class="batch-card-header">
      <div>
        <p class="products-kicker">${t.pricing_profile_label}</p>
        <h3>${t.product_name}</h3>
      </div>
      <span class=${ti(t.estimated_margin_pct)}>
        ${_n(t.estimated_margin_pct)}
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
      <div><span>Unit cost</span><strong>${Ct(t.unit_cost)}</strong></div>
      <div>
        <span>Suggested price</span><strong>${Ct(t.suggested_price)}</strong>
      </div>
    </div>
    ${t.notes?Be`<p class="batch-card-notes">${t.notes}</p>`:null}
  </article>`}const X=j.bind(T);function xt(t){const e=Number(t.trim());return Number.isInteger(e)&&e>0?e:null}function ri({products:t,onCreated:e}){const[n,a]=v({productId:"",pricingProfileId:"booth",plannedQuantity:"1"}),[i,s]=v(!1),r=(d,p)=>a(c=>({...c,[d]:p}));return X`<form class="batch-create-card" onSubmit=${async d=>{d.preventDefault();const p=xt(n.productId),c=xt(n.plannedQuantity);if(!(!p||!c)){s(!0);try{const o=await Gn({product_id:p,pricing_profile_id:n.pricingProfileId,planned_quantity:c});if(!o)return;e(o),a({productId:"",pricingProfileId:"booth",plannedQuantity:"1"}),x("Batch created.","success")}finally{s(!1)}}}}>
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
      ${_e.map(d=>X`<option key=${d.id} value=${d.id}>${d.label}</option>`)}
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
      disabled=${i||!xt(n.productId)||!xt(n.plannedQuantity)}
    >
      ${i?"Adding…":"Add Batch"}
    </button>
  </form>`}function oi({navigate:t}){const[e,n]=v([]),[a,i]=v([]),[s,r]=v(!0),[u,d]=v(""),[p,c]=v("");R(()=>{let l=!1;return Promise.all([Qn(),$e()]).then(([_,f])=>{l||(n(_),i(f))}).catch(_=>{x(_ instanceof Error?_.message:"Failed to load batches.","error")}).finally(()=>{l||r(!1)}),()=>{l=!0}},[]);const o=W(()=>{const l=u.trim().toLowerCase();return e.filter(_=>p&&_.pricing_profile_id!==p?!1:l?[_.product_name,_.pricing_profile_label,_.material_type,_.primary_color].filter(Boolean).join(" ").toLowerCase().includes(l):!0)},[e,p,u]);return X`<main class="products-page batches-page">
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
        ${_e.map(l=>X`<option key=${l.id} value=${l.id}>${l.label}</option>`)}
      </select>
      <span class="product-count">${o.length} of ${e.length} batches</span>
    </div>

    <section class="product-create-section">
      <${ri}
        products=${a}
        onCreated=${l=>n(_=>[l,..._])}
      />
    </section>

    ${s?X`<div class="empty">Loading batches…</div>`:o.length?X`<div class="batch-grid">
            ${o.map(l=>X`<${si}
                  key=${l.id}
                  batch=${l}
                  onOpen=${()=>t(`/batches/${l.id}`)}
                />`)}
          </div>`:X`<div class="empty">No batches match your filters.</div>`}
  </main>`}const it=j.bind(T);function et({label:t,value:e}){return it`<div class="catalog-summary-pill">
    <strong>${e.toLocaleString()}</strong>${t}
  </div>`}function li({summary:t}){return t?it`
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
  `:null}function ci(){const[t,e]=v([]),[n,a]=v(""),[i,s]=v(""),[r,u]=v(!0),[d,p]=v(!1),[c,o]=v(null),l=async()=>{const m=await ut("/catalog/roots","Failed to load roots.");m&&e(m.roots),u(!1)};R(()=>{l()},[]);const _=async m=>{m.preventDefault();const g=n.trim();if(!g)return;const $=i.trim()?{rootPath:g,name:i.trim()}:{rootPath:g},b=await z("/catalog/roots",$,"Failed to add root.");b&&(e(P=>[...P,b.root]),a(""),s(""),x("Catalog root added.","success"))},f=async m=>{const g=await ut(`/catalog/roots/${m}`,"Failed to remove root.",{method:"DELETE"});g&&e($=>$.map(b=>b.id===m?g.root:b))};return it`
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
        <${li} summary=${c} />
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
              value=${i}
              placeholder="Models"
              onInput=${m=>s(m.target.value)}
            />
          </label>
          <button class="btn-primary" type="submit">Add root</button>
        </form>

        ${r?it`<div class="empty">Loading scan roots…</div>`:t.length===0?it`<div class="empty">No scan roots configured.</div>`:it`<div class="catalog-root-list">
                ${t.map(m=>it`<div class="admin-card catalog-root-card" key=${m.id}>
                      <div>
                        <div class="admin-card-name">${m.name}</div>
                        <div class="catalog-root-path">${m.root_path}</div>
                        <div class="catalog-root-meta">
                          ${m.is_active?"active":"inactive"}
                          ${m.last_scanned_at?` · scanned ${m.last_scanned_at}`:""}
                        </div>
                      </div>
                      ${m.is_active?it`<button class="btn-ghost" onClick=${()=>f(m.id)}>
                            Deactivate
                          </button>`:null}
                    </div>`)}
              </div>`}
      </section>
    </main>
  `}const di=j.bind(T);function ui(t){return t==="green"?"product-sellability product-sellability--green":t==="yellow"?"product-sellability product-sellability--yellow":"product-sellability product-sellability--red"}function he({level:t,label:e,readyToList:n}){return di`<span class=${ui(t)} title=${e}>
    <span class="product-sellability-dot" aria-hidden="true"></span>
    ${e}${n?" · ready":""}
  </span>`}const vt=j.bind(T),It=[{id:"idea",label:"Idea"},{id:"downloaded_designed",label:"Downloaded / Designed"},{id:"test_print",label:"Test Print"},{id:"needs_tuning",label:"Needs Tuning"},{id:"ready_for_photos",label:"Ready for Photos"},{id:"listed",label:"Listed"},{id:"active",label:"Active"},{id:"selling_well",label:"Selling Well"},{id:"retired",label:"Retired"}],mn=[{id:"gaming",label:"Gaming"},{id:"workshop",label:"Workshop"},{id:"home_organization",label:"Home Organization"},{id:"decor",label:"Decor"},{id:"personalized",label:"Personalized"},{id:"seasonal",label:"Seasonal"},{id:"custom_repair_parts",label:"Custom / Repair Parts"}],be=[{id:"hive",label:"Hive"},{id:"original",label:"Original"},{id:"printables",label:"Printables"},{id:"makerworld",label:"MakerWorld"},{id:"thangs",label:"Thangs"},{id:"stlflix",label:"STLFlix"},{id:"custom_commission",label:"Custom Commission"}],$n=[{id:"commercial_allowed",label:"Commercial Allowed"},{id:"personal_use_only",label:"Personal Use Only"},{id:"attribution_required",label:"Attribution Required"},{id:"hive_community",label:"Hive Community"},{id:"hive_plus",label:"Hive Plus"},{id:"original_owned",label:"Original / Owned"},{id:"unknown_verify",label:"Unknown / Verify"}],pi=[{id:"none",label:"No restock"},{id:"normal",label:"Normal"},{id:"high",label:"High"},{id:"urgent",label:"Urgent"}];function _i(t){return t===null?"No price":`$${t.toFixed(2)}`}function mi({product:t}){return t.main_photo_path?vt`<img
      class="product-card-photo"
      src=${t.main_photo_path}
      alt=""
      loading="lazy"
    />`:vt`<div class="product-card-photo product-card-photo--empty" aria-hidden="true">▧</div>`}function ye({product:t,onOpen:e,onStatusChange:n}){const a=i=>i.stopPropagation();return vt`
    <article class="product-card" onClick=${()=>e(t)}>
      <${mi} product=${t} />
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
          <${he}
            level=${t.can_sell_level}
            label=${t.can_sell_label}
            readyToList=${t.ready_to_list}
          />
          <span class="product-license-badge">${t.license_label||"License unknown"}</span>
        </div>
        <div class="product-card-footer">
          <strong>${_i(t.target_sale_price)}</strong>
          ${n?vt`<label class="product-status-select" onClick=${a}>
                <span>Status</span>
                <select
                  value=${t.status_id}
                  onChange=${i=>{i.stopPropagation(),n(t,i.target.value)}}
                >
                  ${It.map(i=>vt`<option key=${i.id} value=${i.id}>${i.label}</option>`)}
                </select>
              </label>`:vt`<span class="product-status-pill">${t.status_label}</span>`}
        </div>
      </div>
    </article>
  `}const st=j.bind(T);function $i(t){return t===null?"":String(t/3600)}function Ee(t){return{name:t.name,categoryId:t.category_id??"",statusId:t.status_id,sourceId:t.source_id??"",licenseId:t.license_id??"",targetSalePrice:t.target_sale_price===null?"":String(t.target_sale_price),restockPriority:t.restock_priority,modelUrl:t.model_url??"",etsyListingUrl:t.etsy_listing_url??"",defaultMaterial:t.default_material??"",primaryColor:t.primary_color??"",accentColor:t.accent_color??"",preferredPrinterId:t.preferred_printer_id===null?"":String(t.preferred_printer_id),estimatedPrintTimeHours:$i(t.estimated_print_time_s),estimatedFilamentG:t.estimated_filament_g===null?"":String(t.estimated_filament_g),boothPrice:t.booth_price===null?"":String(t.booth_price),etsyPrice:t.etsy_price===null?"":String(t.etsy_price),packagingCost:t.packaging_cost===null?"":String(t.packaging_cost),handlingMinutes:t.handling_minutes===null?"":String(t.handling_minutes),targetMarginPct:t.target_margin_pct===null?"":String(t.target_margin_pct),pricingNotes:t.pricing_notes??"",notes:t.notes??""}}function nt(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function vi(t){const e=nt(t);return e===null?null:Math.round(e*3600)}function fi(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isInteger(n)&&n>0?n:null}function ht(t,e){return[...e?[st`<option value="">${e}</option>`]:[],...t.map(a=>st`<option key=${a.id} value=${a.id}>${a.label}</option>`)]}function gi({product:t}){return t.main_photo_path?st`<img class="product-detail-photo" src=${t.main_photo_path} alt="" />`:st`<div class="product-detail-photo product-detail-photo--empty">No product photo</div>`}function hi({product:t}){const e=[t.primary_color,t.accent_color].filter(Boolean).join(" / ");return st`<div class="product-detail-facts">
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
  </div>`}function bi({productId:t,navigate:e}){const[n,a]=v(null),[i,s]=v(null),[r,u]=v(!0),[d,p]=v(!1);R(()=>{let l=!1;return On(t).then(_=>{l||(a(_),s(Ee(_)))}).catch(_=>{x(_ instanceof Error?_.message:"Failed to load product.","error")}).finally(()=>{l||u(!1)}),()=>{l=!0}},[t]);const c=(l,_)=>{s(f=>f&&{...f,[l]:_})},o=async l=>{if(l.preventDefault(),!i||!n)return;const _={name:i.name,category_id:i.categoryId||null,status_id:i.statusId,source_id:i.sourceId||null,license_id:i.licenseId||null,target_sale_price:nt(i.targetSalePrice),restock_priority:i.restockPriority,model_url:i.modelUrl.trim()||null,etsy_listing_url:i.etsyListingUrl.trim()||null,default_material:i.defaultMaterial.trim()||null,primary_color:i.primaryColor.trim()||null,accent_color:i.accentColor.trim()||null,preferred_printer_id:fi(i.preferredPrinterId),estimated_print_time_s:vi(i.estimatedPrintTimeHours),estimated_filament_g:nt(i.estimatedFilamentG),booth_price:nt(i.boothPrice),etsy_price:nt(i.etsyPrice),packaging_cost:nt(i.packagingCost),handling_minutes:nt(i.handlingMinutes),target_margin_pct:nt(i.targetMarginPct),pricing_notes:i.pricingNotes.trim()||null,notes:i.notes.trim()||null};p(!0);try{const f=await ve(n.id,_);if(!f)return;a(f),s(Ee(f)),x("Product updated.","success")}finally{p(!1)}};return r?st`<div class="empty">Loading product…</div>`:!n||!i?st`<div class="empty">Product not found.</div>`:st`<main class="product-detail-page">
    <div class="product-detail-header">
      <button class="btn-back" onClick=${()=>e("/products")}>← Products</button>
      <div>
        <p class="products-kicker">Product detail</p>
        <h2>${n.name}</h2>
      </div>
      <${he}
        level=${n.can_sell_level}
        label=${n.can_sell_label}
        readyToList=${n.ready_to_list}
      />
    </div>

    <section class="product-detail-layout">
      <aside class="product-detail-card">
        <${gi} product=${n} />
        <${hi} product=${n} />
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
                ${ht(It)}
              </select>
            </label>
            <label class="form-label">
              Category
              <select
                class="form-input"
                value=${i.categoryId}
                onChange=${l=>c("categoryId",l.target.value)}
              >
                ${ht(mn,"Uncategorized")}
              </select>
            </label>
            <label class="form-label">
              Source
              <select
                class="form-input"
                value=${i.sourceId}
                onChange=${l=>c("sourceId",l.target.value)}
              >
                ${ht(be,"Source TBD")}
              </select>
            </label>
            <label class="form-label">
              License
              <select
                class="form-input"
                value=${i.licenseId}
                onChange=${l=>c("licenseId",l.target.value)}
              >
                ${ht($n,"Verify license")}
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
                ${ht(pi)}
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
  </main>`}const $t=j.bind(T),Ue={urgent:0,high:1,normal:2,none:3};function Ae(t){return[...t].sort((e,n)=>{const a=(Ue[e.restock_priority]??9)-(Ue[n.restock_priority]??9);return a!==0?a:e.name.localeCompare(n.name)})}function yi({products:t}){const e=t.filter(i=>i.restock_priority==="urgent").length,n=t.filter(i=>i.restock_priority==="high").length,a=t.filter(i=>i.ready_to_list).length;return $t`<div class="product-print-next-summary">
    <div><strong>${t.length}</strong><span>queued</span></div>
    <div><strong>${e}</strong><span>urgent</span></div>
    <div><strong>${n}</strong><span>high</span></div>
    <div><strong>${a}</strong><span>ready to list</span></div>
  </div>`}function Pi({navigate:t}){const[e,n]=v([]),[a,i]=v(!0);R(()=>{let r=!1;return Hn().then(u=>{r||n(Ae(u))}).catch(u=>{x(u instanceof Error?u.message:"Failed to load print-next products.","error")}).finally(()=>{r||i(!1)}),()=>{r=!0}},[]);const s=async(r,u)=>{if(u===r.status_id)return;const d=await ve(r.id,{status_id:u});d&&(n(p=>Ae(p.map(c=>c.id===d.id?d:c).filter(c=>["active","selling_well"].includes(c.status_id)))),x("Product status updated.","success"))};return $t`<main class="products-page">
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
            <${yi} products=${e} />
            <div class="product-print-next-grid">
              ${e.map(r=>$t`<article class="product-print-next-card" key=${r.id}>
                    <div class="product-print-next-topline">
                      <span
                        class=${"product-priority product-priority--"+r.restock_priority}
                      >
                        ${r.restock_priority}
                      </span>
                      <${he}
                        level=${r.can_sell_level}
                        label=${r.can_sell_label}
                        readyToList=${r.ready_to_list}
                      />
                    </div>
                    <${ye}
                      product=${r}
                      onOpen=${()=>t(`/products/${r.id}`)}
                      onStatusChange=${s}
                    />
                  </article>`)}
            </div>
          `}
  </main>`}const D=j.bind(T),ki=[{id:"",label:"All sellability"},{id:"green",label:"Green"},{id:"yellow",label:"Yellow"},{id:"red",label:"Red"}];function wi(t){const e=new Map;for(const s of t){const r=e.get(s.status_id)??[];r.push(s),e.set(s.status_id,r)}const n=It.map(s=>({statusId:s.id,statusLabel:s.label,products:e.get(s.id)??[]})),a=new Set(It.map(s=>s.id)),i=[...e.entries()].filter(([s])=>!a.has(s)).map(([s,r])=>{var u;return{statusId:s,statusLabel:((u=r[0])==null?void 0:u.status_label)??s,products:r}});return[...n,...i]}function Ci(t,e){const n=e.q.trim().toLowerCase();return!(n&&![t.name,t.category_label,t.status_label,t.source_label,t.license_label].filter(Boolean).join(" ").toLowerCase().includes(n)||e.categoryId&&t.category_id!==e.categoryId||e.statusId&&t.status_id!==e.statusId||e.sourceId&&t.source_id!==e.sourceId||e.sellability&&t.can_sell_level!==e.sellability)}function Si({mode:t,navigate:e}){const n=a=>"product-tab"+(a?" active":"");return D`<div class="product-tabs" aria-label="Product views">
    <button class=${n(t==="pipeline")} onClick=${()=>e("/products/pipeline")}>
      Pipeline
    </button>
    <button class=${n(t==="catalog")} onClick=${()=>e("/products")}>
      Catalog
    </button>
    <button class="product-tab" onClick=${()=>e("/products/print-next")}>
      Print Next
    </button>
  </div>`}function Fi({filters:t,setFilters:e,count:n,total:a,showStatusFilter:i}){const s=(r,u)=>e({...t,[r]:u});return D`<div class="product-toolbar">
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
      ${mn.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    ${i?D`<select
          value=${t.statusId}
          onChange=${r=>s("statusId",r.target.value)}
        >
          <option value="">All statuses</option>
          ${It.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
        </select>`:null}
    <select
      value=${t.sourceId}
      onChange=${r=>s("sourceId",r.target.value)}
    >
      <option value="">All sources</option>
      ${be.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    <select
      value=${t.sellability}
      onChange=${r=>s("sellability",r.target.value)}
    >
      ${ki.map(r=>D`<option key=${r.id} value=${r.id}>${r.label}</option>`)}
    </select>
    <span class="product-count"
      >${n.toLocaleString()} of ${a.toLocaleString()} products</span
    >
  </div>`}function Ii({onCreated:t}){const[e,n]=v(""),[a,i]=v("unknown_verify"),[s,r]=v(""),[u,d]=v(!1);return D`<form class="product-create-card" onSubmit=${async c=>{c.preventDefault();const o=e.trim();if(o){d(!0);try{const l=await qn({name:o,status_id:"idea",license_id:a,source_id:s||null});if(!l)return;t(l),n(""),i("unknown_verify"),r(""),x("Product created.","success")}finally{d(!1)}}}}>
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
      ${be.map(c=>D`<option key=${c.id} value=${c.id}>${c.label}</option>`)}
    </select>
    <select
      class="form-input"
      value=${a}
      onChange=${c=>i(c.target.value)}
    >
      ${$n.map(c=>D`<option key=${c.id} value=${c.id}>${c.label}</option>`)}
    </select>
    <button class="btn-primary" type="submit" disabled=${u||!e.trim()}>
      ${u?"Adding…":"Add Product"}
    </button>
  </form>`}function Ti({products:t,navigate:e,onStatusChange:n}){return t.length?D`<div class="product-grid">
    ${t.map(a=>D`<${ye}
          key=${a.id}
          product=${a}
          onOpen=${()=>e(`/products/${a.id}`)}
          onStatusChange=${n}
        />`)}
  </div>`:D`<div class="empty">No products match your filters.</div>`}function Ni({columns:t,navigate:e,onStatusChange:n}){return D`<div class="product-kanban" role="list">
    ${t.map(a=>D`<section class="product-kanban-column" key=${a.statusId} role="listitem">
          <div class="product-kanban-header">
            <h3>${a.statusLabel}</h3>
            <span>${a.products.length}</span>
          </div>
          <div class="product-kanban-cards">
            ${a.products.length?a.products.map(i=>D`<${ye}
                      key=${i.id}
                      product=${i}
                      onOpen=${()=>e(`/products/${i.id}`)}
                      onStatusChange=${n}
                    />`):D`<div class="product-column-empty">No products</div>`}
          </div>
        </section>`)}
  </div>`}function Li({mode:t,navigate:e}){const[n,a]=v([]),[i,s]=v(!0),[r,u]=v({q:"",categoryId:"",statusId:"",sourceId:"",sellability:""});R(()=>{let o=!1;return $e().then(l=>{o||a(l)}).catch(l=>{x(l instanceof Error?l.message:"Failed to load products.","error")}).finally(()=>{o||s(!1)}),()=>{o=!0}},[]);const d=W(()=>n.filter(o=>Ci(o,r)),[n,r]),p=W(()=>wi(d),[d]),c=async(o,l)=>{if(l===o.status_id)return;const _=await ve(o.id,{status_id:l});_&&(a(f=>f.map(y=>y.id===_.id?_:y)),x("Product status updated.","success"))};return D`<main class="products-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Product workflow</p>
        <h2>${t==="pipeline"?"Product Pipeline":"Product Catalog"}</h2>
        <p>
          Card-based product tracking for sellability, listing readiness, and what to print next.
        </p>
      </div>
      <${Si} mode=${t} navigate=${e} />
    </section>

    <${Fi}
      filters=${r}
      setFilters=${u}
      count=${d.length}
      total=${n.length}
      showStatusFilter=${t==="catalog"}
    />

    ${t==="catalog"?D`<section class="product-create-section">
          <${Ii}
            onCreated=${o=>a(l=>[o,...l])}
          />
        </section>`:null}
    ${i?D`<div class="empty">Loading products…</div>`:t==="pipeline"?D`<${Ni}
            columns=${p}
            navigate=${e}
            onStatusChange=${c}
          />`:D`<${Ti}
            products=${d}
            navigate=${e}
            onStatusChange=${c}
          />`}
  </main>`}const B=j.bind(T);function ji({bootStatus:t,loadProgress:e}){return B` <div class="in-app-loading" role="status" aria-live="polite">
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
  </div>`}function Mi({error:t}){return B`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${t}</p>
      </div>
    </div>
  </div>`}function xi({projectId:t,projects:e,jobs:n,projectsLoading:a,navigate:i,setSelectedJob:s,handleJobProjectChange:r,setProjects:u}){const d=e.find(o=>Number(o.id)===t),p=n.filter(o=>Number(o.project_id)===t);if(!d)return a?B`<div class="empty">Loading projects…</div>`:B`<div class="empty">Project not found.</div>`;const c=n.filter(o=>o.project_id==null);return B`<${Ha}
    project=${d}
    jobs=${p}
    unassignedJobs=${c}
    onBack=${()=>i("/projects")}
    onJobClick=${s}
    onAddJob=${o=>r(o,t)}
    onRemoveJob=${o=>r(o,null)}
    onProjectUpdated=${o=>u(l=>l.some(_=>_.id===o.id)?l.map(_=>_.id===o.id?o:_):[o,...l])}
    onMoveJobToProject=${(o,l)=>r(o,l)}
    onNavigateToProject=${o=>i(`/projects/${o}`)}
  />`}function Di({sorted:t,view:e,sortCol:n,sortDir:a,onSort:i,onJobClick:s,density:r}){return t.length===0?B`<div class="empty">No jobs match your filters.</div>`:e==="table"?B`<${fa}
      sorted=${t}
      sortCol=${n}
      sortDir=${a}
      onSort=${i}
      onJobClick=${s}
      density=${r}
    />`:B`<${ha} sorted=${t} onJobClick=${s} density=${r} />`}function Ji({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:i,setDeviceFilter:s,devices:r,view:u,setView:d,filtered:p,jobs:c,isFiltered:o,sorted:l,sortCol:_,sortDir:f,onSort:y,onJobClick:m,density:g,setDensity:$}){return B`
    <${pa}
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
    <${_a} filtered=${p} isFiltered=${o} />
    ${Di({sorted:l,view:u,sortCol:_,sortDir:f,onSort:y,onJobClick:m,density:g})}
  `}function Bi(t){const e=t.match(/^\/projects\/(\d+)$/),n=t.match(/^\/products\/(\d+)$/),a=t.match(/^\/batches\/(\d+)$/);return{isAdmin:t.startsWith("/admin"),isPrinters:t.startsWith("/printers"),isProjects:t.startsWith("/projects"),isCatalog:t.startsWith("/catalog"),isProducts:t.startsWith("/products"),isProductPipeline:t==="/products/pipeline",isProductPrintNext:t==="/products/print-next",isBatches:t.startsWith("/batches"),projectId:e?Number(e[1]):null,productId:n?Number(n[1]):null,batchId:a?Number(a[1]):null}}function Ei({route:t,summary:e,projects:n,setProjects:a,jobs:i,projectsLoading:s,navigate:r,setSelectedJob:u,handleJobProjectChange:d,handleRatesChanged:p,handleAutoGroup:c,projectPrices:o,q:l,setQ:_,statusFilter:f,setStatusFilter:y,deviceFilter:m,setDeviceFilter:g,devices:$,view:b,setView:P,filtered:w,isFiltered:h,sorted:k,sortCol:F,sortDir:N,density:O,setDensity:K,handleSort:lt}){return t.isAdmin?B`<${Xa} onRatesChanged=${p} />`:t.batchId!=null?B`<${ii} batchId=${t.batchId} navigate=${r} />`:t.isBatches?B`<${oi} navigate=${r} />`:t.productId!=null?B`<${bi} productId=${t.productId} navigate=${r} />`:t.isProductPrintNext?B`<${Pi} navigate=${r} />`:t.isProducts?B`<${Li}
      mode=${t.isProductPipeline?"pipeline":"catalog"}
      navigate=${r}
    />`:t.isCatalog?B`<${ci} />`:t.isPrinters?B`<${na}
      summary=${e}
      jobs=${i}
      onJobClick=${u}
    />`:t.projectId!=null?B`<${xi}
      projectId=${t.projectId}
      projects=${n}
      jobs=${i}
      projectsLoading=${s}
      navigate=${r}
      setSelectedJob=${u}
      handleJobProjectChange=${d}
      setProjects=${a}
    />`:t.isProjects?B`<${qa}
      projects=${n}
      setProjects=${a}
      onAutoGroup=${c}
      projectPrices=${o}
      loading=${s}
    />`:B`<${Ji}
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
    jobs=${i}
    isFiltered=${h}
    sorted=${k}
    sortCol=${F}
    sortDir=${N}
    onSort=${lt}
    onJobClick=${u}
    density=${O}
    setDensity=${K}
  />`}function Ui({setJobs:t,setProjects:e,setProjectPrices:n,setSummary:a,setDataRange:i,toast:s}){const[r,u]=v(!0),[d,p]=v(!0),[c,o]=v(0),[l,_]=v(null),[f,y]=v("Starting dashboard…"),m=C(async({url:b,fallback:P,onData:w,onFinally:h})=>{const{data:k,error:F}=await me(b,P);F&&s(F.message||P,"error"),k&&w(k),h&&h()},[s]),g=C(()=>{m({url:"/projects",fallback:"Failed to load projects.",onData:b=>b.projects&&e(b.projects),onFinally:()=>p(!1)}),m({url:"/projects/prices",fallback:"Failed to load project prices.",onData:b=>b.prices&&n(b.prices)})},[m,e,n]),$=C((b=!1)=>{m({url:"/jobs/prices",fallback:b?"Failed to refresh job prices.":"Failed to load job prices.",onData:w=>{w!=null&&w.prices&&t(h=>h.map(k=>{var F;return{...k,final_price:((F=w.prices)==null?void 0:F[k.id])??(b?k.final_price:null)??null}}))}})},[m,t]);return R(()=>{const b=()=>o(h=>Math.min(100,h+100/Bn)),P=(h,k,F)=>(y(`Loading ${h}…`),V(h,k).catch(N=>{const O=N instanceof Error?N.message:k;throw new Error(`Initial dashboard load failed (${F}): ${O}`)}).finally(b)),w=setTimeout(()=>{_("Dashboard load timed out. Check console/network for the failing request."),u(!1),p(!1)},Jn);return Promise.all([P("/ui/data","Failed to load jobs.","jobs"),P("/summary","Failed to load summary.","summary"),P("/health/data-range","Failed to load print history range.","history range")]).then(([h,k,F])=>{t(h.jobs),a(k),i(F),u(!1),y("Loading optional data…"),$(!1),g()}).catch(h=>{_(h.message),u(!1),p(!1)}).finally(()=>clearTimeout(w)),()=>clearTimeout(w)},[t,a,i,$,g]),{loading:r,projectsLoading:d,loadProgress:c,error:l,bootStatus:f,refreshProjectsAndPrices:g,refreshJobPrices:$}}function Ai(t,e,n,a){return t.filter(i=>{const s=`${i.designTitle||""} ${i.customer||""}`.toLowerCase();return!(e&&!s.includes(e.toLowerCase())||n&&(i.status||"").toLowerCase()!==n||a&&i.deviceModel!==a)})}function Ri(t,e,n){return[...t].sort((a,i)=>{let s=a[e],r=i[e];if(s==null&&(s=n==="asc"?1/0:-1/0),r==null&&(r=n==="asc"?1/0:-1/0),typeof s=="string"){const p=typeof r=="string"?r:String(r);return n==="asc"?s.localeCompare(p):p.localeCompare(s)}const u=Number(s),d=Number(r);return n==="asc"?u-d:d-u})}const St=j.bind(T);function Oi(){const[t,e]=v([]),[n,a]=v([]),[i,s]=v({}),[r,u]=v(null),[d,p]=v(null),[c,o]=v("table"),[l,_]=v("comfy"),[f,y]=v(""),[m,g]=v(""),[$,b]=v(""),[P,w]=v("startTime"),[h,k]=v("desc"),[F,N]=v(null);return{jobs:t,setJobs:e,projects:n,setProjects:a,projectPrices:i,setProjectPrices:s,summary:r,setSummary:u,dataRange:d,setDataRange:p,view:c,setView:o,density:l,setDensity:_,q:f,setQ:y,statusFilter:m,setStatusFilter:g,deviceFilter:$,setDeviceFilter:b,sortCol:P,setSortCol:w,sortDir:h,setSortDir:k,selectedJob:F,setSelectedJob:N}}function Hi({jobs:t,q:e,statusFilter:n,deviceFilter:a,sortCol:i,sortDir:s,setSortCol:r,setSortDir:u,loc:d}){const p=W(()=>[...new Set(t.map(y=>y.deviceModel).filter(y=>!!y))].sort(),[t]),c=!!(e||n||a),o=W(()=>Ai(t,e,n,a),[t,e,n,a]),l=W(()=>Ri(o,i,s),[o,i,s]),_=C(y=>{if(i===y){u(m=>m==="asc"?"desc":"asc");return}r(y),u(()=>y==="startTime"?"desc":"asc")},[i,r,u]),f=W(()=>Bi(d),[d]);return{devices:p,isFiltered:c,filtered:o,sorted:l,handleSort:_,route:f}}function qi({setJobs:t,setProjects:e,setSummary:n,setSelectedJob:a,navigate:i,refreshProjectsAndPrices:s,refreshJobPrices:r}){const u=C(($,b)=>{t(P=>P.map(w=>w.id===$?{...w,...b}:w)),a(P=>P&&P.id===$?{...P,...b}:P)},[]),d=C(async($,b)=>{const P=await tt(`/jobs/${$}`,b,"Failed to update job.");if(!(P!=null&&P.job))return null;const{job:w}=P;return u($,w),w},[u]),p=C(($,b)=>{d($,b)},[d]),c=C(async($,b)=>{await d($,{project_id:b})&&s()},[d,s]),o=C(($,b)=>{p($,{status_override:b})},[p]),l=C(($,b)=>{p($,{extra_labor_minutes:b})},[p]),_=C($=>{a(null),i(`/projects/${$}`)},[i]),f=C(()=>{r(!0),s()},[r,s]),y=C(async()=>{f();try{const $=await V("/summary","Failed to refresh summary.");n($),x("Pricing refreshed from updated rates.","success")}catch($){const b=$ instanceof Error?$.message:"Updated rates saved, but summary refresh failed.";x(b,"error")}},[f,n]),m=C(async()=>{const[$,b]=await Promise.all([V("/ui/data","Failed to refresh jobs."),V("/projects","Failed to refresh projects.")]);t(()=>$.jobs),e(b.projects),f()},[f,e]);return{closeModal:C(()=>a(null),[]),patchJob:d,handleJobProjectChange:c,handleJobStatusChange:o,handleJobExtraLaborChange:l,handleNavigateToProject:_,handleRatesChanged:y,handleAutoGroup:m}}function Wi({selectedJob:t,closeModal:e,patchJob:n,projects:a,handleJobProjectChange:i,handleJobStatusChange:s,handleJobExtraLaborChange:r,handleNavigateToProject:u}){return t?St`<${ka}
    key=${t.id}
    job=${t}
    onClose=${e}
    onPatch=${n}
    projects=${a}
    onJobProjectChange=${i}
    onJobStatusChange=${s}
    onJobExtraLaborChange=${r}
    onNavigateToProject=${u}
  />`:null}function Qi(t){const e=C(i=>t.setProjects(i),[t.setProjects]),n=C(i=>t.setSummary(i),[t.setSummary]),a=C(i=>t.setDataRange(i),[t.setDataRange]);return Ui({setJobs:t.setJobs,setProjects:e,setProjectPrices:t.setProjectPrices,setSummary:n,setDataRange:a,toast:x})}function Vi(){const t=Oi(),[e,n]=de(),{loading:a,projectsLoading:i,loadProgress:s,error:r,bootStatus:u,refreshProjectsAndPrices:d,refreshJobPrices:p}=Qi(t),{devices:c,isFiltered:o,filtered:l,sorted:_,handleSort:f,route:y}=Hi({jobs:t.jobs,q:t.q,statusFilter:t.statusFilter,deviceFilter:t.deviceFilter,sortCol:t.sortCol,sortDir:t.sortDir,setSortCol:t.setSortCol,setSortDir:t.setSortDir,loc:e}),{closeModal:m,patchJob:g,handleJobProjectChange:$,handleJobStatusChange:b,handleJobExtraLaborChange:P,handleNavigateToProject:w,handleRatesChanged:h,handleAutoGroup:k}=qi({setJobs:t.setJobs,setProjects:t.setProjects,setSummary:t.setSummary,setSelectedJob:t.setSelectedJob,navigate:n,refreshProjectsAndPrices:d,refreshJobPrices:p});return a?St`<${ji} bootStatus=${u} loadProgress=${s} />`:r?St`<${Mi} error=${r} />`:St`
    <${ua} summary=${t.summary} dataRange=${t.dataRange} />
    ${Ei({route:y,summary:t.summary,projects:t.projects,setProjects:t.setProjects,jobs:t.jobs,projectsLoading:i,navigate:n,setSelectedJob:t.setSelectedJob,handleJobProjectChange:$,handleRatesChanged:h,handleAutoGroup:k,projectPrices:t.projectPrices,q:t.q,setQ:t.setQ,statusFilter:t.statusFilter,setStatusFilter:t.setStatusFilter,deviceFilter:t.deviceFilter,setDeviceFilter:t.setDeviceFilter,devices:c,view:t.view,setView:t.setView,density:t.density,setDensity:t.setDensity,filtered:l,isFiltered:o,sorted:_,sortCol:t.sortCol,sortDir:t.sortDir,handleSort:f})}
    <${Wi}
      selectedJob=${t.selectedJob}
      closeModal=${m}
      patchJob=${g}
      projects=${t.projects}
      handleJobProjectChange=${$}
      handleJobStatusChange=${b}
      handleJobExtraLaborChange=${P}
      handleNavigateToProject=${w}
    />
    <${xn} />
  `}const Gi=St`<${xe} base="/ui"><${Vi} /></${xe}>`;Cn(Gi,document.getElementById("app"));
