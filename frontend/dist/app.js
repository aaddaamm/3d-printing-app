(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(a){if(a.ep)return;a.ep=!0;const s=n(a);fetch(a.href,s)}})();var $t,k,re,W,Rt,se,ae,Ct,lt,tt,oe,Nt,Tt,Ft,ie,pt={},vt=[],Se=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,mt=Array.isArray;function R(t,e){for(var n in e)t[n]=e[n];return t}function Mt(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function A(t,e,n){var r,a,s,o={};for(s in e)s=="key"?r=e[s]:s=="ref"?a=e[s]:o[s]=e[s];if(arguments.length>2&&(o.children=arguments.length>3?$t.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(s in t.defaultProps)o[s]===void 0&&(o[s]=t.defaultProps[s]);return ct(t,o,r,a,null)}function ct(t,e,n,r,a){var s={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:a??++re,__i:-1,__u:0};return a==null&&k.vnode!=null&&k.vnode(s),s}function ht(t){return t.children}function dt(t,e){this.props=t,this.context=e}function z(t,e){if(e==null)return t.__?z(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?z(t):null}function Ce(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,r=[],a=[],s=R({},e);s.__v=e.__v+1,k.vnode&&k.vnode(s),Dt(t.__P,s,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,r,n??z(e),!!(32&e.__u),a),s.__v=e.__v,s.__.__k[s.__i]=s,ue(r,s,a),e.__e=e.__=null,s.__e!=n&&le(s)}}function le(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),le(t)}function Jt(t){(!t.__d&&(t.__d=!0)&&W.push(t)&&!ft.__r++||Rt!=k.debounceRendering)&&((Rt=k.debounceRendering)||se)(ft)}function ft(){try{for(var t,e=1;W.length;)W.length>e&&W.sort(ae),t=W.shift(),e=W.length,Ce(t)}finally{W.length=ft.__r=0}}function ce(t,e,n,r,a,s,o,c,d,l,p){var i,u,v,m,h,_,$,f=r&&r.__k||vt,g=e.length;for(d=ke(n,e,f,d,g),i=0;i<g;i++)(v=n.__k[i])!=null&&(u=v.__i!=-1&&f[v.__i]||pt,v.__i=i,_=Dt(t,v,u,a,s,o,c,d,l,p),m=v.__e,v.ref&&u.ref!=v.ref&&(u.ref&&At(u.ref,null,v),p.push(v.ref,v.__c||m,v)),h==null&&m!=null&&(h=m),($=!!(4&v.__u))||u.__k===v.__k?(d=de(v,d,t,$),$&&u.__e&&(u.__e=null)):typeof v.type=="function"&&_!==void 0?d=_:m&&(d=m.nextSibling),v.__u&=-7);return n.__e=h,d}function ke(t,e,n,r,a){var s,o,c,d,l,p=n.length,i=p,u=0;for(t.__k=new Array(a),s=0;s<a;s++)(o=e[s])!=null&&typeof o!="boolean"&&typeof o!="function"?(typeof o=="string"||typeof o=="number"||typeof o=="bigint"||o.constructor==String?o=t.__k[s]=ct(null,o,null,null,null):mt(o)?o=t.__k[s]=ct(ht,{children:o},null,null,null):o.constructor===void 0&&o.__b>0?o=t.__k[s]=ct(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):t.__k[s]=o,d=s+u,o.__=t,o.__b=t.__b+1,c=null,(l=o.__i=Pe(o,n,d,i))!=-1&&(i--,(c=n[l])&&(c.__u|=2)),c==null||c.__v==null?(l==-1&&(a>p?u--:a<p&&u++),typeof o.type!="function"&&(o.__u|=4)):l!=d&&(l==d-1?u--:l==d+1?u++:(l>d?u--:u++,o.__u|=4))):t.__k[s]=null;if(i)for(s=0;s<p;s++)(c=n[s])!=null&&(2&c.__u)==0&&(c.__e==r&&(r=z(c)),pe(c,c));return r}function de(t,e,n,r){var a,s;if(typeof t.type=="function"){for(a=t.__k,s=0;a&&s<a.length;s++)a[s]&&(a[s].__=t,e=de(a[s],e,n,r));return e}t.__e!=e&&(r&&(e&&t.type&&!e.parentNode&&(e=z(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Pe(t,e,n,r){var a,s,o,c=t.key,d=t.type,l=e[n],p=l!=null&&(2&l.__u)==0;if(l===null&&c==null||p&&c==l.key&&d==l.type)return n;if(r>(p?1:0)){for(a=n-1,s=n+1;a>=0||s<e.length;)if((l=e[o=a>=0?a--:s++])!=null&&(2&l.__u)==0&&c==l.key&&d==l.type)return o}return-1}function It(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||Se.test(e)?n:n+"px"}function ot(t,e,n,r,a){var s,o;t:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof r=="string"&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||It(t.style,e,"");if(n)for(e in n)r&&n[e]==r[e]||It(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")s=e!=(e=e.replace(oe,"$1")),o=e.toLowerCase(),e=o in t||e=="onFocusOut"||e=="onFocusIn"?o.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+s]=n,n?r?n[tt]=r[tt]:(n[tt]=Nt,t.addEventListener(e,s?Ft:Tt,s)):t.removeEventListener(e,s?Ft:Tt,s);else{if(a=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break t}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function Wt(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[lt]==null)e[lt]=Nt++;else if(e[lt]<n[tt])return;return n(k.event?k.event(e):e)}}}function Dt(t,e,n,r,a,s,o,c,d,l){var p,i,u,v,m,h,_,$,f,g,y,w,T,F,x,N=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[c=e.__e=n.__e]),(p=k.__b)&&p(e);t:if(typeof N=="function")try{if($=e.props,f=N.prototype&&N.prototype.render,g=(p=N.contextType)&&r[p.__c],y=p?g?g.props.value:p.__:r,n.__c?_=(i=e.__c=n.__c).__=i.__E:(f?e.__c=i=new N($,y):(e.__c=i=new dt($,y),i.constructor=N,i.render=Fe),g&&g.sub(i),i.state||(i.state={}),i.__n=r,u=i.__d=!0,i.__h=[],i._sb=[]),f&&i.__s==null&&(i.__s=i.state),f&&N.getDerivedStateFromProps!=null&&(i.__s==i.state&&(i.__s=R({},i.__s)),R(i.__s,N.getDerivedStateFromProps($,i.__s))),v=i.props,m=i.state,i.__v=e,u)f&&N.getDerivedStateFromProps==null&&i.componentWillMount!=null&&i.componentWillMount(),f&&i.componentDidMount!=null&&i.__h.push(i.componentDidMount);else{if(f&&N.getDerivedStateFromProps==null&&$!==v&&i.componentWillReceiveProps!=null&&i.componentWillReceiveProps($,y),e.__v==n.__v||!i.__e&&i.shouldComponentUpdate!=null&&i.shouldComponentUpdate($,i.__s,y)===!1){e.__v!=n.__v&&(i.props=$,i.state=i.__s,i.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(H){H&&(H.__=e)}),vt.push.apply(i.__h,i._sb),i._sb=[],i.__h.length&&o.push(i);break t}i.componentWillUpdate!=null&&i.componentWillUpdate($,i.__s,y),f&&i.componentDidUpdate!=null&&i.__h.push(function(){i.componentDidUpdate(v,m,h)})}if(i.context=y,i.props=$,i.__P=t,i.__e=!1,w=k.__r,T=0,f)i.state=i.__s,i.__d=!1,w&&w(e),p=i.render(i.props,i.state,i.context),vt.push.apply(i.__h,i._sb),i._sb=[];else do i.__d=!1,w&&w(e),p=i.render(i.props,i.state,i.context),i.state=i.__s;while(i.__d&&++T<25);i.state=i.__s,i.getChildContext!=null&&(r=R(R({},r),i.getChildContext())),f&&!u&&i.getSnapshotBeforeUpdate!=null&&(h=i.getSnapshotBeforeUpdate(v,m)),F=p!=null&&p.type===ht&&p.key==null?_e(p.props.children):p,c=ce(t,mt(F)?F:[F],e,n,r,a,s,o,c,d,l),i.base=e.__e,e.__u&=-161,i.__h.length&&o.push(i),_&&(i.__E=i.__=null)}catch(H){if(e.__v=null,d||s!=null)if(H.then){for(e.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;s[s.indexOf(c)]=null,e.__e=c}else{for(x=s.length;x--;)Mt(s[x]);Lt(e)}else e.__e=n.__e,e.__k=n.__k,H.then||Lt(e);k.__e(H,e,n)}else s==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):c=e.__e=Te(n.__e,e,n,r,a,s,o,d,l);return(p=k.diffed)&&p(e),128&e.__u?void 0:c}function Lt(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(Lt))}function ue(t,e,n){for(var r=0;r<n.length;r++)At(n[r],n[++r],n[++r]);k.__c&&k.__c(e,t),t.some(function(a){try{t=a.__h,a.__h=[],t.some(function(s){s.call(a)})}catch(s){k.__e(s,a.__v)}})}function _e(t){return typeof t!="object"||t==null||t.__b>0?t:mt(t)?t.map(_e):R({},t)}function Te(t,e,n,r,a,s,o,c,d){var l,p,i,u,v,m,h,_=n.props||pt,$=e.props,f=e.type;if(f=="svg"?a="http://www.w3.org/2000/svg":f=="math"?a="http://www.w3.org/1998/Math/MathML":a||(a="http://www.w3.org/1999/xhtml"),s!=null){for(l=0;l<s.length;l++)if((v=s[l])&&"setAttribute"in v==!!f&&(f?v.localName==f:v.nodeType==3)){t=v,s[l]=null;break}}if(t==null){if(f==null)return document.createTextNode($);t=document.createElementNS(a,f,$.is&&$),c&&(k.__m&&k.__m(e,s),c=!1),s=null}if(f==null)_===$||c&&t.data==$||(t.data=$);else{if(s=s&&$t.call(t.childNodes),!c&&s!=null)for(_={},l=0;l<t.attributes.length;l++)_[(v=t.attributes[l]).name]=v.value;for(l in _)v=_[l],l=="dangerouslySetInnerHTML"?i=v:l=="children"||l in $||l=="value"&&"defaultValue"in $||l=="checked"&&"defaultChecked"in $||ot(t,l,null,v,a);for(l in $)v=$[l],l=="children"?u=v:l=="dangerouslySetInnerHTML"?p=v:l=="value"?m=v:l=="checked"?h=v:c&&typeof v!="function"||_[l]===v||ot(t,l,v,_[l],a);if(p)c||i&&(p.__html==i.__html||p.__html==t.innerHTML)||(t.innerHTML=p.__html),e.__k=[];else if(i&&(t.innerHTML=""),ce(e.type=="template"?t.content:t,mt(u)?u:[u],e,n,r,f=="foreignObject"?"http://www.w3.org/1999/xhtml":a,s,o,s?s[0]:n.__k&&z(n,0),c,d),s!=null)for(l=s.length;l--;)Mt(s[l]);c||(l="value",f=="progress"&&m==null?t.removeAttribute("value"):m!=null&&(m!==t[l]||f=="progress"&&!m||f=="option"&&m!=_[l])&&ot(t,l,m,_[l],a),l="checked",h!=null&&h!=t[l]&&ot(t,l,h,_[l],a))}return t}function At(t,e,n){try{if(typeof t=="function"){var r=typeof t.__u=="function";r&&t.__u(),r&&e==null||(t.__u=t(e))}else t.current=e}catch(a){k.__e(a,n)}}function pe(t,e,n){var r,a;if(k.unmount&&k.unmount(t),(r=t.ref)&&(r.current&&r.current!=t.__e||At(r,null,e)),(r=t.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(s){k.__e(s,e)}r.base=r.__P=null}if(r=t.__k)for(a=0;a<r.length;a++)r[a]&&pe(r[a],e,n||typeof t.type!="function");n||Mt(t.__e),t.__c=t.__=t.__e=void 0}function Fe(t,e,n){return this.constructor(t,n)}function Je(t,e,n){var r,a,s,o;e==document&&(e=document.documentElement),k.__&&k.__(t,e),a=(r=!1)?null:e.__k,s=[],o=[],Dt(e,t=e.__k=A(ht,null,[t]),a||pt,pt,e.namespaceURI,a?null:e.firstChild?$t.call(e.childNodes):null,s,a?a.__e:e.firstChild,r,o),ue(s,t,o)}function Le(t){function e(n){var r,a;return this.getChildContext||(r=new Set,(a={})[e.__c]=this,this.getChildContext=function(){return a},this.componentWillUnmount=function(){r=null},this.shouldComponentUpdate=function(s){this.props.value!=s.value&&r.forEach(function(o){o.__e=!0,Jt(o)})},this.sub=function(s){r.add(s);var o=s.componentWillUnmount;s.componentWillUnmount=function(){r&&r.delete(s),o&&o.call(s)}}),n.children}return e.__c="__cC"+ie++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,r){return n.children(r)}).contextType=e,e}$t=vt.slice,k={__e:function(t,e,n,r){for(var a,s,o;e=e.__;)if((a=e.__c)&&!a.__)try{if((s=a.constructor)&&s.getDerivedStateFromError!=null&&(a.setState(s.getDerivedStateFromError(t)),o=a.__d),a.componentDidCatch!=null&&(a.componentDidCatch(t,r||{}),o=a.__d),o)return a.__E=a}catch(c){t=c}throw t}},re=0,dt.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=R({},this.state),typeof t=="function"&&(t=t(R({},n),this.props)),t&&R(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),Jt(this))},dt.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Jt(this))},dt.prototype.render=ht,W=[],se=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,ae=function(t,e){return t.__v.__b-e.__v.__b},ft.__r=0,Ct=Math.random().toString(8),lt="__d"+Ct,tt="__a"+Ct,oe=/(PointerCapture)$|Capture$/i,Nt=0,Tt=Wt(!1),Ft=Wt(!0),ie=0;var Y,P,kt,Vt,rt=0,ve=[],J=k,qt=J.__b,Gt=J.__r,Qt=J.diffed,Kt=J.__c,zt=J.unmount,Yt=J.__;function gt(t,e){J.__h&&J.__h(P,t,rt||e),rt=0;var n=P.__H||(P.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function b(t){return rt=1,je(me,t)}function je(t,e,n){var r=gt(Y++,2);if(r.t=t,!r.__c&&(r.__=[me(void 0,e),function(c){var d=r.__N?r.__N[0]:r.__[0],l=r.t(d,c);d!==l&&(r.__N=[l,r.__[1]],r.__c.setState({}))}],r.__c=P,!P.__f)){var a=function(c,d,l){if(!r.__c.__H)return!0;var p=r.__c.__H.__.filter(function(u){return u.__c});if(p.every(function(u){return!u.__N}))return!s||s.call(this,c,d,l);var i=r.__c.props!==c;return p.some(function(u){if(u.__N){var v=u.__[0];u.__=u.__N,u.__N=void 0,v!==u.__[0]&&(i=!0)}}),s&&s.call(this,c,d,l)||i};P.__f=!0;var s=P.shouldComponentUpdate,o=P.componentWillUpdate;P.componentWillUpdate=function(c,d,l){if(this.__e){var p=s;s=void 0,a(c,d,l),s=p}o&&o.call(this,c,d,l)},P.shouldComponentUpdate=a}return r.__N||r.__}function I(t,e){var n=gt(Y++,3);!J.__s&&$e(n.__H,e)&&(n.__=t,n.u=e,P.__H.__h.push(n))}function fe(t){return rt=5,B(function(){return{current:t}},[])}function B(t,e){var n=gt(Y++,7);return $e(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function C(t,e){return rt=8,B(function(){return t},e)}function xe(t){var e=P.context[t.__c],n=gt(Y++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(P)),e.props.value):t.__}function Ne(){for(var t;t=ve.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(ut),e.__h.some(jt),e.__h=[]}catch(n){e.__h=[],J.__e(n,t.__v)}}}J.__b=function(t){P=null,qt&&qt(t)},J.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Yt&&Yt(t,e)},J.__r=function(t){Gt&&Gt(t),Y=0;var e=(P=t.__c).__H;e&&(kt===P?(e.__h=[],P.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(ut),e.__h.some(jt),e.__h=[],Y=0)),kt=P},J.diffed=function(t){Qt&&Qt(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(ve.push(e)!==1&&Vt===J.requestAnimationFrame||((Vt=J.requestAnimationFrame)||Me)(Ne)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),kt=P=null},J.__c=function(t,e){e.some(function(n){try{n.__h.some(ut),n.__h=n.__h.filter(function(r){return!r.__||jt(r)})}catch(r){e.some(function(a){a.__h&&(a.__h=[])}),e=[],J.__e(r,n.__v)}}),Kt&&Kt(t,e)},J.unmount=function(t){zt&&zt(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(r){try{ut(r)}catch(a){e=a}}),n.__H=void 0,e&&J.__e(e,n.__v))};var Xt=typeof requestAnimationFrame=="function";function Me(t){var e,n=function(){clearTimeout(r),Xt&&cancelAnimationFrame(e),setTimeout(t)},r=setTimeout(n,35);Xt&&(e=requestAnimationFrame(n))}function ut(t){var e=P,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),P=e}function jt(t){var e=P;t.__c=t.__(),P=e}function $e(t,e){return!t||t.length!==e.length||e.some(function(n,r){return n!==t[r]})}function me(t,e){return typeof e=="function"?e(t):e}var he=function(t,e,n,r){var a;e[0]=0;for(var s=1;s<e.length;s++){var o=e[s++],c=e[s]?(e[0]|=o?1:2,n[e[s++]]):e[++s];o===3?r[0]=c:o===4?r[1]=Object.assign(r[1]||{},c):o===5?(r[1]=r[1]||{})[e[++s]]=c:o===6?r[1][e[++s]]+=c+"":o?(a=t.apply(c,he(t,c,n,["",null])),r.push(a),c[0]?e[0]|=2:(e[s-2]=0,e[s]=a)):r.push(c)}return r},Zt=new Map;function U(t){var e=Zt.get(this);return e||(e=new Map,Zt.set(this,e)),(e=he(this,e.get(t)||(e.set(t,e=(function(n){for(var r,a,s=1,o="",c="",d=[0],l=function(u){s===1&&(u||(o=o.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,u,o):s===3&&(u||o)?(d.push(3,u,o),s=2):s===2&&o==="..."&&u?d.push(4,u,0):s===2&&o&&!u?d.push(5,0,!0,o):s>=5&&((o||!u&&s===5)&&(d.push(s,0,o,a),s=6),u&&(d.push(s,u,0,a),s=6)),o=""},p=0;p<n.length;p++){p&&(s===1&&l(),l(p));for(var i=0;i<n[p].length;i++)r=n[p][i],s===1?r==="<"?(l(),d=[d],s=3):o+=r:s===4?o==="--"&&r===">"?(s=1,o=""):o=r+o[0]:c?r===c?c="":o+=r:r==='"'||r==="'"?c=r:r===">"?(l(),s=1):s&&(r==="="?(s=5,a=o,o=""):r==="/"&&(s<5||n[p][i+1]===">")?(l(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):r===" "||r==="	"||r===`
`||r==="\r"?(l(),s=2):o+=r),s===3&&o==="!--"&&(s=4,d=d[0])}return l(),d})(t)),e),arguments,[])).length>1?e:e[0]}const De=U.bind(A),xt=Le(null);function te({base:t,children:e}){const n=o=>o.startsWith(t)?o.slice(t.length)||"/":o,[r,a]=b(()=>n(location.pathname));I(()=>{const o=()=>a(n(location.pathname));return window.addEventListener("popstate",o),()=>window.removeEventListener("popstate",o)},[t]);const s=C(o=>{history.pushState(null,"",t+(o==="/"?"":o)),a(o)},[t]);return De`<${xt.Provider} value=${[r,s]}>${e}</${xt.Provider}>`}function Et(){const t=xe(xt);if(!t)throw new Error("useLocation must be used within RouterProvider");return t}function V(t){if(!t)return"—";const e=Math.floor(t/3600),n=Math.floor(t%3600/60);return e===0?`${n}m`:`${e}h${n>0?` ${n}m`:""}`}function bt(t){if(!t)return"—";const e=new Date(t),n=new Date,r=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"};return e.toLocaleString(void 0,r)}function q(t){if(!t)return"—";const e=new Date(t),n=new Date,r=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric"}:{month:"short",day:"numeric",year:"2-digit"};return e.toLocaleDateString(void 0,r)}function j(t){return"$"+t.toFixed(2)}function st(t){return t==null?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function Ut(t){return t?t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${Math.round(t)} g`:"0 g"}const G=U.bind(A),Ae={finish:"badge badge-finish",running:"badge badge-running",failed:"badge badge-failed",cancel:"badge badge-cancel",pause:"badge badge-pause"};function at({status:t}){const e=(t||"").toLowerCase();return G`<span class=${Ae[e]||"badge badge-default"}>${e||"unknown"}</span>`}function yt({url:t}){const[e,n]=b(!1);return!t||e?G`<div class="row-thumb-ph">🖨</div>`:G`<img
    class="row-thumb"
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>n(!0)}
  />`}function Ee({url:t,className:e}){const[n,r]=b(!1);return!t||n?G`<div class="cover-placeholder">🖨</div>`:G`<img
    class=${e}
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>r(!0)}
  />`}function wt({colors:t}){if(!(t!=null&&t.length))return null;const e=[...new Set(t.map(n=>n.slice(0,6).toUpperCase()))].filter(n=>n!=="FFFFFF");return e.length?G`<span class="swatches"
    >${e.map(n=>G`<span class="swatch" style=${"background:#"+n} title=${"#"+n} />`)}</span
  >`:null}const S=U.bind(A);function Ue(t){return!t.startsWith("/projects")&&!t.startsWith("/admin")&&!t.startsWith("/printers")}function He(t,e){const n=new URLSearchParams;t&&n.set("status",t),e&&n.set("device",e);const r=n.toString();return"/jobs/export.csv"+(r?"?"+r:"")}function Be(t){return t.reduce((e,n)=>(e.weight+=n.total_weight_g||0,e.time+=n.total_time_s||0,e),{weight:0,time:0})}function Oe(t){const e=t.toLowerCase();return e.includes("a1 mini")?"/ui/printers/a1-mini":e.includes("p1s")?"/ui/printers/p1s":null}const Re=[{label:"Jobs",path:"/",active:Ue},{label:"Projects",path:"/projects",active:t=>t.startsWith("/projects")},{label:"Printers",path:"/printers",active:t=>t.startsWith("/printers")},{label:"Rates",path:"/admin",active:t=>t.startsWith("/admin")}],Ie=[["","All Statuses"],["finish","Finished"],["cancel","Cancelled"],["running","Running"],["failed","Failed"],["pause","Paused"]],We=[{col:"designTitle",label:"Title",cls:"sortable td-title"},{col:"deviceModel",label:"Printer",cls:"sortable"},{col:"startTime",label:"Date",cls:"sortable"},{col:null,label:"Status",cls:""},{col:"total_weight_g",label:"Filament",cls:"sortable td-num"},{col:"total_time_s",label:"Time",cls:"sortable td-num"},{col:"final_price",label:"Price",cls:"sortable td-num"},{col:null,label:"Plates",cls:"td-num"},{col:null,label:"Customer",cls:""}];function Pt(t,e){const n=(t==null?void 0:t.by_device)??[];return n.length?n.map(r=>{const a=r.deviceModel||"Unknown printer";return e==="jobs"?`${a}: ${(r.total_jobs??0).toLocaleString()} jobs`:e==="plates"?`${a}: ${(r.total_plates??0).toLocaleString()} plates`:`${a}: ${((r.total_time_s??0)/3600).toFixed(1).toLocaleString()} h`}).join(`
`):"No printer breakdown available"}function Ve({loc:t,navigate:e}){return S`<nav class="top-nav">
    ${Re.map(n=>{const r=n.active(t);return S`
        <button
          key=${n.label}
          class=${"nav-btn"+(r?" active":"")}
          onClick=${()=>e(n.path)}
        >
          ${n.label}
        </button>
      `})}
  </nav>`}function qe({summary:t}){var n,r;const e=t==null?void 0:t.totals;return S`
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
  `}function Ge({summary:t,dataRange:e}){const[n,r]=Et(),a=!!(e!=null&&e.min_start&&(e!=null&&e.max_start)),s=(e==null?void 0:e.min_start)??"",o=(e==null?void 0:e.max_start)??"";return S`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>bambu history</span></h1>
        ${a&&S`<div class="header-range">
          History: ${q(s)} → ${q(o)}
          (${((e==null?void 0:e.task_count)||0).toLocaleString()} tasks)
        </div>`}
        <${Ve} loc=${n} navigate=${r} />
      </div>
      <${qe} summary=${t} />
    </header>
  `}function Qe({q:t,setQ:e,statusFilter:n,setStatusFilter:r,deviceFilter:a,setDeviceFilter:s,devices:o,view:c,setView:d,filteredCount:l,totalCount:p}){const i=B(()=>He(n,a),[n,a]);return S`
    <div class="toolbar">
      <input
        type="search"
        placeholder="Search title or customer…"
        value=${t}
        onInput=${u=>e(u.target.value)}
      />
      <select
        value=${n}
        onChange=${u=>r(u.target.value)}
      >
        ${Ie.map(([u,v])=>S`<option key=${u} value=${u}>${v}</option> `)}
      </select>
      <select
        value=${a}
        onChange=${u=>s(u.target.value)}
      >
        <option value="">All Printers</option>
        ${o.map(u=>S`<option key=${u} value=${u}>${u}</option> `)}
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
        <a class="btn-csv" href=${i} download>↓ CSV</a>
        <span class="job-count">${l} / ${p} jobs</span>
      </div>
    </div>
  `}function Ke({summary:t,jobs:e,onJobClick:n}){const r=(t==null?void 0:t.by_device)??[];if(!r.length)return S`<div class="empty">No printer totals available yet.</div>`;const a=new Map;for(const s of e){const o=s.deviceModel||"Unknown printer",c=a.get(o)??[];c.push(s),a.set(o,c)}return S`
    <div class="printer-grid">
      ${r.map(s=>{const o=s.deviceModel||"Unknown printer",d=(a.get(o)??[]).slice().sort((l,p)=>String(p.startTime||"").localeCompare(String(l.startTime||""))).slice(0,6);return S`
          <section class="printer-card" key=${o}>
            <div class="printer-card-head">
              <div class="printer-identity">
                ${(()=>{const l=Oe(o);return l?S`<img class="printer-photo" src=${l} alt=${o} />`:S`<div class="printer-photo">🖨️</div>`})()}
                <div>
                  <h3>${o}</h3>
                  <p class="printer-meta">
                    <span class="printer-meta-jobs"
                      >${(s.total_jobs??0).toLocaleString()} jobs</span
                    >
                    <span class="printer-meta-dot">•</span>
                    <span class="printer-meta-hours"
                      >${((s.total_time_s??0)/3600).toFixed(1)} h total</span
                    >
                  </p>
                </div>
              </div>
              <div class="printer-kpis">
                <span><strong>${(s.total_jobs??0).toLocaleString()}</strong> Jobs</span>
                <span><strong>${(s.total_plates??0).toLocaleString()}</strong> Plates</span>
                <span><strong>${((s.total_time_s??0)/3600).toFixed(1)}</strong> Hours</span>
              </div>
            </div>

            <div class="printer-jobs-list">
              ${d.length?d.map(l=>S`
                      <article
                        class="printer-job-row"
                        key=${l.id}
                        onClick=${()=>n(l)}
                      >
                        <div class="printer-job-top">
                          <div class="td-thumb"><${yt} url=${l.cover_url} /></div>
                          <div class="td-title">
                            <span class="row-title">${l.designTitle||"Untitled Job"}</span>
                            <${wt} colors=${l.filament_colors} />
                          </div>
                          <${at} status=${l.status} />
                        </div>
                        <div class="printer-job-bottom">
                          <span title=${bt(l.startTime)}
                            >${q(l.startTime)}</span
                          >
                          <span>Filament: <strong>${st(l.total_weight_g)}</strong></span>
                          <span>Time: <strong>${V(l.total_time_s)}</strong></span>
                        </div>
                      </article>
                    `):S`<div class="empty">No jobs for this printer yet.</div>`}
            </div>
          </section>
        `})}
    </div>
  `}function ze({filtered:t,isFiltered:e}){if(!e||!t.length)return null;const n=Be(t);return S`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${t.length}</strong></span>
      <span>Filament: <strong>${Ut(n.weight)}</strong></span>
      <span>Print time: <strong>${V(n.time)}</strong></span>
    </div>
  `}function ge({printRun:t}){return(t??1)<=1?null:S`<span class="run-badge">Run ${t}</span>`}function Ye({job:t,onJobClick:e}){return S`
    <tr onClick=${()=>e(t)}>
      <td class="td-thumb"><${yt} url=${t.cover_url} /></td>
      <td class="td-title">
        <span class="row-title" title=${t.designTitle||"Untitled"}
          >${t.designTitle||"Untitled Job"}</span
        >
        <${ge} printRun=${t.print_run} />
        <${wt} colors=${t.filament_colors} />
      </td>
      <td>${t.deviceModel||"—"}</td>
      <td title=${bt(t.startTime)}>${q(t.startTime)}</td>
      <td><${at} status=${t.status} /></td>
      <td class="td-num"><strong>${st(t.total_weight_g)}</strong></td>
      <td class="td-num">${V(t.total_time_s)}</td>
      <td class="td-num">
        ${t.final_price!=null?S`<strong>${j(t.final_price)}</strong>`:"—"}
      </td>
      <td class="td-num">${t.plate_count??"—"}</td>
      <td>${t.customer&&S`<span class="customer-pill">${t.customer}</span>`}</td>
    </tr>
  `}function Xe({sorted:t,sortCol:e,sortDir:n,onSort:r,onJobClick:a}){return S`
    <div class="table-wrap table-sticky-head">
      <table>
        <thead>
          <tr>
            <th class="td-thumb"></th>
            ${We.map(({col:s,label:o,cls:c})=>{const d=s!=null&&s===e,l=[c,d?`sort-${n}`:""].filter(Boolean).join(" ");return S`
                <th key=${o} class=${l||void 0} onClick=${s?()=>r(s):void 0}>
                  ${o}
                </th>
              `})}
          </tr>
        </thead>
        <tbody>
          ${t.map(s=>S`<${Ye} key=${s.id} job=${s} onJobClick=${a} />`)}
        </tbody>
      </table>
    </div>
  `}function Ze({job:t,onJobClick:e}){return S`
    <div class="card" onClick=${()=>e(t)}>
      <${Ee} url=${t.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${t.designTitle||"Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${t.deviceModel||"—"}</span>
          <span>📅 ${q(t.startTime)}</span>
          <span>⏱ ${V(t.total_time_s)}</span>
          <span>🧵 ${st(t.total_weight_g)}</span>
          ${t.final_price!=null&&S`<span>💰 ${j(t.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${at} status=${t.status} />
          <${ge} printRun=${t.print_run} />
          ${t.customer&&S`<span class="customer-pill">${t.customer}</span>`}
          <${wt} colors=${t.filament_colors} />
        </div>
      </div>
    </div>
  `}function tn({sorted:t,onJobClick:e}){return S`
    <div class="grid-view">
      ${t.map(n=>S`<${Ze} key=${n.id} job=${n} onJobClick=${e} />`)}
    </div>
  `}function Ht(t){I(()=>{const e=n=>{n.key==="Escape"&&t()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[t])}const ee=U.bind(A);let be=()=>{};function X(t,e="info"){be({message:t,type:e,id:Date.now()+Math.random()})}function en(){const[t,e]=b([]),n=fe(new Map);be=C(a=>{e(o=>[...o,a]);const s=setTimeout(()=>{e(o=>o.filter(c=>c.id!==a.id)),n.current.delete(a.id)},3500);n.current.set(a.id,s)},[]);const r=C(a=>{const s=n.current.get(a);s&&clearTimeout(s),n.current.delete(a),e(o=>o.filter(c=>c.id!==a))},[]);return t.length?ee`
    <div class="toast-container">
      ${t.map(a=>ee`
          <div class="toast toast-${a.type}" key=${a.id} onClick=${()=>r(a.id)}>
            ${a.message}
          </div>
        `)}
    </div>
  `:null}const nn=15e3,rn=2e4,sn=5;async function an(t,e){try{const n=await t.json();return typeof n.error=="string"?n.error:e}catch{return e}}function on(t){return{signal:AbortSignal.timeout(nn),...t}}function ln(t,e){return(t==null?void 0:t.name)==="TimeoutError"?new Error(`${e} (request timed out)`):new Error(`${e} (network error)`)}async function et(t,e,n){let r;try{r=await fetch(t,on(n))}catch(a){throw ln(a,e)}if(!r.ok)throw new Error(await an(r,e));return await r.json()}async function Bt(t,e,n){try{return{data:await et(t,e,n),error:null}}catch(r){return{data:null,error:r instanceof Error?r:new Error(e)}}}async function St(t,e,n){const{data:r,error:a}=await Bt(t,e,n);return a?(X(a.message||e,"error"),null):r}async function _t(t,e,n){return St(t,n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}async function ye(t,e,n){return St(t,n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}const D=U.bind(A);function cn({jobId:t}){const[e,n]=b(null);if(I(()=>{let s=!0;return n(null),Bt(`/jobs/${t}/price`,"Pricing not configured").then(({data:o})=>{s&&n(o??!1)}).catch(()=>{s&&n(!1)}),()=>{s=!1}},[t]),e===null)return D`<div class="pricing-row pricing-loading">Loading price…</div>`;if(e===!1)return D`<div class="pricing-row pricing-na">Pricing not configured</div>`;const r=e.final_price-e.base_price,a=e.base_price>0?Math.round(r/e.base_price*100):0;return D`
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Material</span><span>${j(e.material_cost)}</span>
      </div>
      <div class="pricing-row">
        <span>Machine</span><span>${j(e.machine_cost)}</span>
      </div>
      <div class="pricing-row"><span>Labor</span><span>${j(e.labor_cost)}</span></div>
      ${e.extra_labor_cost>0&&D`
        <div class="pricing-row pricing-extra-labor">
          <span>Extra labor</span><span>${j(e.extra_labor_cost)}</span>
        </div>
      `}
      <div class="pricing-divider"></div>
      <div class="pricing-row pricing-base">
        <span>Base</span><span>${j(e.base_price)}</span>
      </div>
      ${r!==0&&D`
        <div class="pricing-row pricing-markup">
          <span>Markup</span>
          <span
            >${r>0?"+":""}${j(r)}
            (${a>0?"+":""}${a}%)</span
          >
        </div>
      `}
      <div class="pricing-row pricing-final">
        <span
          >Final${e.is_override?D`<span class="override-tag">override</span>`:""}</span
        >
        <span>${j(e.final_price)}</span>
      </div>
    </div>
  `}const dn=["finish","failed","cancel","running","pause"];function un({job:t,onClose:e,onPatch:n,projects:r,onJobProjectChange:a,onJobStatusChange:s,onJobExtraLaborChange:o,onNavigateToProject:c}){const[d,l]=b(t.customer??""),[p,i]=b(t.notes??""),[u,v]=b(t.price_override!=null?String(t.price_override):"");Ht(e);const m=C(_=>{const $=_.target.value;a(t.id,$===""?null:Number($))},[t.id,a]),h=C(_=>{const $=_.target.value;s(t.id,$===""?null:$)},[t.id,s]);return D`
    <div class="overlay" onClick=${_=>_.target===_.currentTarget&&e()}>
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
                <${at} status=${t.status} />
                ${t.status_override&&D`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item">
              <label>Printer</label>
              <div class="detail-val">${t.deviceModel||"—"}</div>
            </div>
            <div class="detail-item">
              <label>Started</label>
              <div class="detail-val">${bt(t.startTime)}</div>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <div class="detail-val">${V(t.total_time_s)}</div>
            </div>
            <div class="detail-item">
              <label>Filament</label>
              <div class="detail-val">
                ${st(t.total_weight_g)}
                <${wt} colors=${t.filament_colors} />
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
          <${cn} jobId=${t.id} key=${t.id+"-"+t.extra_labor_minutes} />
          <div class="modal-project-row">
            <label class="modal-project-label">Customer</label>
            <input
              class="modal-project-select"
              type="text"
              placeholder="—"
              value=${d}
              onInput=${_=>l(_.target.value)}
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
              onInput=${_=>i(_.target.value)}
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
              value=${u}
              onInput=${_=>v(_.target.value)}
              onBlur=${()=>{const _=u===""?null:Number(u);n(t.id,{price_override:_})}}
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
              onChange=${_=>{const $=_.target.value===""?null:Number(_.target.value);o(t.id,$)}}
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
              ${dn.map(_=>D`<option key=${_} value=${_}>${_}</option>`)}
            </select>
          </div>
          ${r&&D`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select
                class="modal-project-select"
                value=${t.project_id??""}
                onChange=${m}
              >
                <option value="">— None —</option>
                ${r.map(_=>D`<option key=${_.id} value=${_.id}>${_.name}</option>`)}
              </select>
              ${t.project_id!=null&&D`
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
  `}const L=U.bind(A);function _n({project:t,totalPrice:e,onClick:n}){const r=t.total_weight_g,a=t.total_time_s;return L`
    <div class="proj-card" onClick=${n}>
      ${t.cover_url?L`<img class="proj-card-cover" src=${t.cover_url} alt="" />`:L`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-name">${t.name}</div>
      <div class="proj-card-meta">
        ${t.customer&&L`<span class="customer-pill">${t.customer}</span>`}
      </div>
      <div class="proj-card-stats">
        <span><strong>${t.job_count}</strong> job${t.job_count!==1?"s":""}</span>
        ${r!=null&&L`<span>${Ut(r)}</span>`}
        ${a!=null&&L`<span>${V(a)}</span>`}
        ${e!=null&&L`<span class="proj-card-price">${j(e)}</span>`}
      </div>
      ${t.notes&&L`<div class="proj-card-notes">${t.notes}</div>`}
    </div>
  `}function pn({price:t}){return t?L`
    <span>Material: <strong>${j(t.material_cost)}</strong></span>
    <span>Machine: <strong>${j(t.machine_cost)}</strong></span>
    <span>Labor: <strong>${j(t.labor_cost)}</strong></span>
    ${t.extra_labor_cost>0&&L`<span>Extra labor: <strong>${j(t.extra_labor_cost)}</strong></span>`}
    <span class="totals-total">Total: <strong>${j(t.final_price)}</strong></span>
  `:null}function vn({jobs:t,onJobClick:e,onRemoveJob:n}){return t.length===0?L`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`:L`
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
          ${t.map(r=>L`
              <tr key=${r.id} onClick=${()=>e(r)}>
                <td class="td-thumb"><${yt} url=${r.cover_url} /></td>
                <td class="td-title">
                  <span class="row-title">${r.designTitle||"Untitled Job"}</span>
                </td>
                <td>${r.deviceModel||"—"}</td>
                <td title=${bt(r.startTime)}>${q(r.startTime)}</td>
                <td><${at} status=${r.status} /></td>
                <td class="td-num"><strong>${st(r.total_weight_g)}</strong></td>
                <td class="td-num">${V(r.total_time_s)}</td>
                <td class="td-num">
                  ${r.final_price!=null?L`<strong>${j(r.final_price)}</strong>`:"—"}
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
  `}function fn({loading:t,filtered:e,q:n,projectPrices:r,navigate:a}){return t?L`<div class="empty">Loading projects…</div>`:e.length===0?L`<div class="empty">${n?"No projects match your search.":"No projects yet. Create one to group related jobs together."}</div>`:L`
    <div class="proj-grid">
      ${e.map(s=>L`<${_n}
            key=${s.id}
            project=${s}
            totalPrice=${r[s.id]??null}
            onClick=${()=>a(`/projects/${s.id}`)}
          />`)}
    </div>
  `}function $n(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(r=>[r.name,r.customer,r.notes].filter(Boolean).join(" ").toLowerCase().includes(n))}function mn(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(r=>`${r.designTitle||""} ${r.customer||""}`.toLowerCase().includes(n))}function hn(t,e,n){return`${n?`${e.length} of ${t.length}`:String(t.length)} project${t.length!==1?"s":""}`}function gn(t,e){if(t===0){X("No ungrouped jobs found — everything is already assigned to a project.","info");return}X(`Created ${t} project${t!==1?"s":""}, assigned ${e} job${e!==1?"s":""}.`,"success")}function bn(t){return t.reduce((e,n)=>e+(n.total_weight_g||0),0)}function yn(t){return t.reduce((e,n)=>e+(n.total_time_s||0),0)}const Z=U.bind(A);function we(t){return e=>{e.target===e.currentTarget&&t()}}function wn({onClose:t,onCreate:e}){const[n,r]=b(""),[a,s]=b(""),[o,c]=b(""),[d,l]=b(!1);Ht(t);const p=C(async i=>{if(i.preventDefault(),!!n.trim()){l(!0);try{const u=await ye("/projects",{name:n.trim(),customer:a||null,notes:o||null},"Failed to create project.");if(!(u!=null&&u.project))return;e(u.project),t()}finally{l(!1)}}},[n,a,o,e,t]);return Z`
    <div class="overlay" onClick=${we(t)}>
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
                value=${a}
                onInput=${i=>s(i.target.value)}
                placeholder="Optional"
              />
            </label>
            <label class="form-label"
              >Notes
              <textarea
                class="form-input form-textarea"
                value=${o}
                onInput=${i=>c(i.target.value)}
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
  `}function Sn({unassignedJobs:t,onClose:e,onAdd:n}){const[r,a]=b("");Ht(e);const s=B(()=>mn(t,r),[t,r]);return Z`
    <div class="overlay" onClick=${we(e)}>
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
            onInput=${o=>a(o.target.value)}
          />
          ${s.length===0?Z`<div class="empty" style="padding:16px 0">
                ${r?"No matches.":"All jobs are already assigned to projects."}
              </div>`:Z`<div class="add-jobs-list">
                ${s.map(o=>Z`
                    <div class="add-jobs-row" key=${o.id} onClick=${()=>n(o.id)}>
                      <${yt} url=${o.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${o.designTitle||"Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${q(o.startTime)} · ${o.deviceModel||"—"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `)}
              </div>`}
        </div>
      </div>
    </div>
  `}const it=new Map;function Cn(t,e){const[n,r]=b(()=>it.get(t)??null);return I(()=>{if(r(it.get(t)??null),!e){it.delete(t),r(null);return}let a=!1;return St(`/projects/${t}/price`,"Failed to load project price.").then(s=>{!s||a||(it.set(t,s),r(s))}),()=>{a=!0}},[t,e]),n}const K=U.bind(A);function kn({project:t,jobs:e,unassignedJobs:n,onBack:r,onJobClick:a,onAddJob:s,onRemoveJob:o}){const[c,d]=b(!1),l=t.job_count??e.length,p=Cn(t.id,l),i=bn(e),u=yn(e),v=fe(new Map),m=B(()=>{for(const _ of e)_.final_price!=null&&v.current.set(_.id,_.final_price);return e.map(_=>{if(_.final_price!=null)return _;const $=v.current.get(_.id);return $==null?_:{..._,final_price:$}})},[e]),h=C(_=>s(_),[s]);return K`
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
        <span>Jobs: <strong>${l}</strong></span>
        <span>Filament: <strong>${Ut(i)}</strong></span>
        <span>Print time: <strong>${V(u)}</strong></span>
        <${pn} price=${p} />
      </div>
      <${vn}
        jobs=${m}
        onJobClick=${a}
        onRemoveJob=${o}
      />
      ${c&&K`<${Sn}
        unassignedJobs=${n}
        onClose=${()=>d(!1)}
        onAdd=${h}
      />`}
    </div>
  `}function Pn({projects:t,setProjects:e,onAutoGroup:n,projectPrices:r,loading:a=!1}){const[s,o]=b(!1),[c,d]=b(!1),[l,p]=b(""),[,i]=Et(),u=C(async()=>{d(!0);try{const h=await ye("/projects/auto-group",{},"Auto-group failed.");if(!h)return;const{projects_created:_,jobs_assigned:$}=h;await n(),gn(_,$)}finally{d(!1)}},[n]),v=C(h=>{e(_=>[h,..._]),i(`/projects/${h.id}`)},[e,i]),m=B(()=>$n(t,l),[t,l]);return K`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${l}
        onInput=${h=>p(h.target.value)}
      />
      <span class="proj-list-count">${hn(t,m,l)}</span>
      <button class="btn-secondary" onClick=${u} disabled=${c}>
        ${c?"Grouping…":"⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${()=>o(!0)}>+ New Project</button>
    </div>
    <${fn}
      loading=${a}
      filtered=${m}
      q=${l}
      projectPrices=${r}
      navigate=${i}
    />
    ${s&&K`<${wn} onClose=${()=>o(!1)} onCreate=${v} />`}
  `}const O=U.bind(A),Tn=2e3;function ne(t,e,n){const r=e(n);return t.map(a=>e(a)===r?n:a)}function Fn(t){return t==="saving"?"Saving…":t==="saved"?"✓ Saved":"Save"}function Jn(t,e,n){return t===n?"saving":e===n?"saved":"idle"}function Ln(t){const[e,n]=b(""),[r,a]=b(""),s=d=>{a(d),setTimeout(()=>a(""),Tn)};return{runSave:async(d,l)=>{n(d);try{if(!await l())return;s(d),t()}finally{n("")}},getStateFor:d=>Jn(e,r,d)}}function E({label:t,value:e,onChange:n,step:r="0.01",min:a="0"}){return O`
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
  `}function Ot({state:t}){return O`<button type="submit" class="btn-primary" disabled=${t==="saving"}>
    ${Fn(t)}
  </button>`}function Q({title:t,description:e,children:n}){return O`
    <section class="admin-section">
      <h3 class="admin-section-title">${t}</h3>
      <p class="admin-section-desc">${e}</p>
      ${n}
    </section>
  `}function jn({labor:t,saveState:e,onSave:n}){const[r,a]=b(t);return I(()=>a(t),[t]),O`
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
      <div class="admin-card-actions"><${Ot} state=${e} /></div>
    </form>
  `}function xn({machine:t,saveState:e,onSave:n}){const[r,a]=b(t);I(()=>a(t),[t]);const s=r.purchase_price/r.lifetime_hrs+r.electricity_rate+r.maintenance_buffer;return O`
    <form class="admin-card" onSubmit=${o=>(o.preventDefault(),n(r))}>
      <div class="admin-card-name">${r.device_model}</div>
      <div class="admin-card-fields">
        <${E}
          label="Purchase price ($)"
          value=${r.purchase_price}
          step="1"
          onChange=${o=>a({...r,purchase_price:o})}
        />
        <${E}
          label="Lifetime (hours)"
          value=${r.lifetime_hrs}
          step="100"
          min="1"
          onChange=${o=>a({...r,lifetime_hrs:o})}
        />
        <${E}
          label="Electricity ($/hr)"
          value=${r.electricity_rate}
          step="0.01"
          onChange=${o=>a({...r,electricity_rate:o})}
        />
        <${E}
          label="Maintenance ($/hr)"
          value=${r.maintenance_buffer}
          step="0.01"
          onChange=${o=>a({...r,maintenance_buffer:o})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">
          Computed rate: <strong>${j(s)}</strong>/hr
        </div>
        <div class="admin-card-actions"><${Ot} state=${e} /></div>
      </div>
    </form>
  `}function Nn({material:t,saveState:e,onSave:n}){const[r,a]=b(t);I(()=>a(t),[t]);const s=r.cost_per_g*(1+r.waste_buffer_pct);return O`
    <form class="admin-card" onSubmit=${o=>(o.preventDefault(),n(r))}>
      <div class="admin-card-name">${r.filament_type}</div>
      <div class="admin-card-fields">
        <${E}
          label="Cost per gram ($/g)"
          value=${r.cost_per_g}
          step="0.001"
          onChange=${o=>a({...r,cost_per_g:o})}
        />
        <${E}
          label="Waste buffer (%)"
          value=${r.waste_buffer_pct*100}
          step="1"
          onChange=${o=>a({...r,waste_buffer_pct:o/100})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">Computed rate: <strong>${j(s)}</strong>/g</div>
        <div class="admin-card-actions"><${Ot} state=${e} /></div>
      </div>
    </form>
  `}function Mn({onRatesChanged:t=()=>{}}){const[e,n]=b(null),{runSave:r,getStateFor:a}=Ln(t);I(()=>{St("/rates","Failed to load rates.").then(i=>{i&&n(i)})},[]);const s=async i=>{await r("labor",async()=>{const u=await _t("/rates/labor",i,"Failed to save labor rates."),v=u==null?void 0:u.labor_config;return v?(n(m=>m&&{...m,labor_config:v}),!0):!1})},o=async i=>{const{device_model:u,purchase_price:v,lifetime_hrs:m,electricity_rate:h,maintenance_buffer:_}=i;await r(u,async()=>{const $=await _t(`/rates/machines/${encodeURIComponent(u)}`,{purchase_price:v,lifetime_hrs:m,electricity_rate:h,maintenance_buffer:_},"Failed to save machine rate."),f=$==null?void 0:$.machine_rate;return f?(n(g=>g&&{...g,machine_rates:ne(g.machine_rates,y=>y.device_model,f)}),!0):!1})},c=async i=>{const{filament_type:u,cost_per_g:v,waste_buffer_pct:m}=i;await r(u,async()=>{const h=await _t(`/rates/materials/${encodeURIComponent(u)}`,{cost_per_g:v,waste_buffer_pct:m},"Failed to save material rate."),_=h==null?void 0:h.material_rate;return _?(n($=>$&&{...$,material_rates:ne($.material_rates,f=>f.filament_type,_)}),!0):!1})};if(!e)return O`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;const{labor_config:d,machine_rates:l,material_rates:p}=e;return O`
    <div class="admin-page">
      <h2 class="admin-title">Rates &amp; Pricing</h2>

      <${Q}
        title="Labor"
        description="Applied once per job (or once per project for project pricing)."
      >
        <${jn}
          labor=${d}
          saveState=${a("labor")}
          onSave=${s}
        />
      </${Q}>

      <${Q}
        title="Machine Rates"
        description="Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance."
      >
        ${l.map(i=>O`
            <${xn}
              key=${i.device_model}
              machine=${i}
              saveState=${a(i.device_model)}
              onSave=${o}
            />
          `)}
      </${Q}>

      <${Q}
        title="Material Rates"
        description="Cost per gram including waste. Rate = cost × (1 + waste fraction)."
      >
        ${p.map(i=>O`
            <${Nn}
              key=${i.filament_type}
              material=${i}
              saveState=${a(i.filament_type)}
              onSave=${c}
            />
          `)}
      </${Q}>
    </div>
  `}const M=U.bind(A);function Dn({bootStatus:t,loadProgress:e}){return M` <div class="in-app-loading" role="status" aria-live="polite">
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
  </div>`}function An({error:t}){return M`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${t}</p>
      </div>
    </div>
  </div>`}function En({projectId:t,projects:e,jobs:n,projectsLoading:r,navigate:a,setSelectedJob:s,handleJobProjectChange:o}){const c=e.find(p=>Number(p.id)===t),d=n.filter(p=>Number(p.project_id)===t);if(!c)return r?M`<div class="empty">Loading projects…</div>`:M`<div class="empty">Project not found.</div>`;const l=n.filter(p=>p.project_id==null);return M`<${kn}
    project=${c}
    jobs=${d}
    unassignedJobs=${l}
    onBack=${()=>a("/projects")}
    onJobClick=${s}
    onAddJob=${p=>o(p,t)}
    onRemoveJob=${p=>o(p,null)}
  />`}function Un({sorted:t,view:e,sortCol:n,sortDir:r,onSort:a,onJobClick:s}){return t.length===0?M`<div class="empty">No jobs match your filters.</div>`:e==="table"?M`<${Xe}
      sorted=${t}
      sortCol=${n}
      sortDir=${r}
      onSort=${a}
      onJobClick=${s}
    />`:M`<${tn} sorted=${t} onJobClick=${s} />`}function Hn({q:t,setQ:e,statusFilter:n,setStatusFilter:r,deviceFilter:a,setDeviceFilter:s,devices:o,view:c,setView:d,filtered:l,jobs:p,isFiltered:i,sorted:u,sortCol:v,sortDir:m,onSort:h,onJobClick:_}){return M`
    <${Qe}
      q=${t}
      setQ=${e}
      statusFilter=${n}
      setStatusFilter=${r}
      deviceFilter=${a}
      setDeviceFilter=${s}
      devices=${o}
      view=${c}
      setView=${d}
      filteredCount=${l.length}
      totalCount=${p.length}
    />
    <${ze} filtered=${l} isFiltered=${i} />
    ${Un({sorted:u,view:c,sortCol:v,sortDir:m,onSort:h,onJobClick:_})}
  `}function Bn(t){const e=t.match(/^\/projects\/(\d+)$/);return{isAdmin:t.startsWith("/admin"),isPrinters:t.startsWith("/printers"),isProjects:t.startsWith("/projects"),projectId:e?Number(e[1]):null}}function On({route:t,summary:e,projects:n,setProjects:r,jobs:a,projectsLoading:s,navigate:o,setSelectedJob:c,handleJobProjectChange:d,handleRatesChanged:l,handleAutoGroup:p,projectPrices:i,q:u,setQ:v,statusFilter:m,setStatusFilter:h,deviceFilter:_,setDeviceFilter:$,devices:f,view:g,setView:y,filtered:w,isFiltered:T,sorted:F,sortCol:x,sortDir:N,handleSort:H}){return t.isAdmin?M`<${Mn} onRatesChanged=${l} />`:t.isPrinters?M`<${Ke}
      summary=${e}
      jobs=${a}
      onJobClick=${c}
    />`:t.projectId!=null?M`<${En}
      projectId=${t.projectId}
      projects=${n}
      jobs=${a}
      projectsLoading=${s}
      navigate=${o}
      setSelectedJob=${c}
      handleJobProjectChange=${d}
    />`:t.isProjects?M`<${Pn}
      projects=${n}
      setProjects=${r}
      onAutoGroup=${p}
      projectPrices=${i}
      loading=${s}
    />`:M`<${Hn}
    q=${u}
    setQ=${v}
    statusFilter=${m}
    setStatusFilter=${h}
    deviceFilter=${_}
    setDeviceFilter=${$}
    devices=${f}
    view=${g}
    setView=${y}
    filtered=${w}
    jobs=${a}
    isFiltered=${T}
    sorted=${F}
    sortCol=${x}
    sortDir=${N}
    onSort=${H}
    onJobClick=${c}
  />`}function Rn({setJobs:t,setProjects:e,setProjectPrices:n,setSummary:r,setDataRange:a,toast:s}){const[o,c]=b(!0),[d,l]=b(!0),[p,i]=b(0),[u,v]=b(null),[m,h]=b("Starting dashboard…"),_=C(async({url:g,fallback:y,onData:w,onFinally:T})=>{const{data:F,error:x}=await Bt(g,y);x&&s(x.message||y,"error"),F&&w(F),T&&T()},[s]),$=C(()=>{_({url:"/projects",fallback:"Failed to load projects.",onData:g=>g.projects&&e(g.projects),onFinally:()=>l(!1)}),_({url:"/projects/prices",fallback:"Failed to load project prices.",onData:g=>g.prices&&n(g.prices)})},[_,e,n]),f=C((g=!1)=>{_({url:"/jobs/prices",fallback:g?"Failed to refresh job prices.":"Failed to load job prices.",onData:w=>{w!=null&&w.prices&&t(T=>T.map(F=>{var x;return{...F,final_price:((x=w.prices)==null?void 0:x[F.id])??(g?F.final_price:null)??null}}))}})},[_,t]);return I(()=>{const g=()=>i(T=>Math.min(100,T+100/sn)),y=(T,F,x)=>(h(`Loading ${T}…`),et(T,F).catch(N=>{const H=N instanceof Error?N.message:F;throw new Error(`Initial dashboard load failed (${x}): ${H}`)}).finally(g)),w=setTimeout(()=>{v("Dashboard load timed out. Check console/network for the failing request."),c(!1),l(!1)},rn);return Promise.all([y("/ui/data","Failed to load jobs.","jobs"),y("/summary","Failed to load summary.","summary"),y("/health/data-range","Failed to load print history range.","history range")]).then(([T,F,x])=>{t(T.jobs),r(F),a(x),c(!1),h("Loading optional data…"),f(!1),$()}).catch(T=>{v(T.message),c(!1),l(!1)}).finally(()=>clearTimeout(w)),()=>clearTimeout(w)},[t,r,a,f,$]),{loading:o,projectsLoading:d,loadProgress:p,error:u,bootStatus:m,refreshProjectsAndPrices:$,refreshJobPrices:f}}function In(t,e,n,r){return t.filter(a=>{const s=`${a.designTitle||""} ${a.customer||""}`.toLowerCase();return!(e&&!s.includes(e.toLowerCase())||n&&(a.status||"").toLowerCase()!==n||r&&a.deviceModel!==r)})}function Wn(t,e,n){return[...t].sort((r,a)=>{let s=r[e],o=a[e];if(s==null&&(s=n==="asc"?1/0:-1/0),o==null&&(o=n==="asc"?1/0:-1/0),typeof s=="string"){const l=typeof o=="string"?o:String(o);return n==="asc"?s.localeCompare(l):l.localeCompare(s)}const c=Number(s),d=Number(o);return n==="asc"?c-d:d-c})}const nt=U.bind(A);function Vn(){const[t,e]=b([]),[n,r]=b([]),[a,s]=b({}),[o,c]=b(null),[d,l]=b(null),[p,i]=b("table"),[u,v]=b(""),[m,h]=b(""),[_,$]=b(""),[f,g]=b("startTime"),[y,w]=b("desc"),[T,F]=b(null);return{jobs:t,setJobs:e,projects:n,setProjects:r,projectPrices:a,setProjectPrices:s,summary:o,setSummary:c,dataRange:d,setDataRange:l,view:p,setView:i,q:u,setQ:v,statusFilter:m,setStatusFilter:h,deviceFilter:_,setDeviceFilter:$,sortCol:f,setSortCol:g,sortDir:y,setSortDir:w,selectedJob:T,setSelectedJob:F}}function qn({jobs:t,q:e,statusFilter:n,deviceFilter:r,sortCol:a,sortDir:s,setSortCol:o,setSortDir:c,loc:d}){const l=B(()=>[...new Set(t.map(h=>h.deviceModel).filter(h=>!!h))].sort(),[t]),p=!!(e||n||r),i=B(()=>In(t,e,n,r),[t,e,n,r]),u=B(()=>Wn(i,a,s),[i,a,s]),v=C(h=>{if(a===h){c(_=>_==="asc"?"desc":"asc");return}o(h),c(()=>h==="startTime"?"desc":"asc")},[a,o,c]),m=B(()=>Bn(d),[d]);return{devices:l,isFiltered:p,filtered:i,sorted:u,handleSort:v,route:m}}function Gn({setJobs:t,setProjects:e,setSummary:n,setSelectedJob:r,navigate:a,refreshProjectsAndPrices:s,refreshJobPrices:o}){const c=C((f,g)=>{t(y=>y.map(w=>w.id===f?{...w,...g}:w)),r(y=>y&&y.id===f?{...y,...g}:y)},[]),d=C(async(f,g)=>{const y=await _t(`/jobs/${f}`,g,"Failed to update job.");if(!(y!=null&&y.job))return null;const{job:w}=y;return c(f,w),w},[c]),l=C((f,g)=>{d(f,g)},[d]),p=C(async(f,g)=>{await d(f,{project_id:g})&&s()},[d,s]),i=C((f,g)=>{l(f,{status_override:g})},[l]),u=C((f,g)=>{l(f,{extra_labor_minutes:g})},[l]),v=C(f=>{r(null),a(`/projects/${f}`)},[a]),m=C(()=>{o(!0),s()},[o,s]),h=C(async()=>{m();try{const f=await et("/summary","Failed to refresh summary.");n(f),X("Pricing refreshed from updated rates.","success")}catch(f){const g=f instanceof Error?f.message:"Updated rates saved, but summary refresh failed.";X(g,"error")}},[m,n]),_=C(async()=>{const[f,g]=await Promise.all([et("/ui/data","Failed to refresh jobs."),et("/projects","Failed to refresh projects.")]);t(()=>f.jobs),e(g.projects),m()},[m,e]);return{closeModal:C(()=>r(null),[]),patchJob:d,handleJobProjectChange:p,handleJobStatusChange:i,handleJobExtraLaborChange:u,handleNavigateToProject:v,handleRatesChanged:h,handleAutoGroup:_}}function Qn({selectedJob:t,closeModal:e,patchJob:n,projects:r,handleJobProjectChange:a,handleJobStatusChange:s,handleJobExtraLaborChange:o,handleNavigateToProject:c}){return t?nt`<${un}
    key=${t.id}
    job=${t}
    onClose=${e}
    onPatch=${n}
    projects=${r}
    onJobProjectChange=${a}
    onJobStatusChange=${s}
    onJobExtraLaborChange=${o}
    onNavigateToProject=${c}
  />`:null}function Kn(t){const e=C(a=>t.setProjects(a),[t.setProjects]),n=C(a=>t.setSummary(a),[t.setSummary]),r=C(a=>t.setDataRange(a),[t.setDataRange]);return Rn({setJobs:t.setJobs,setProjects:e,setProjectPrices:t.setProjectPrices,setSummary:n,setDataRange:r,toast:X})}function zn(){const t=Vn(),[e,n]=Et(),{loading:r,projectsLoading:a,loadProgress:s,error:o,bootStatus:c,refreshProjectsAndPrices:d,refreshJobPrices:l}=Kn(t),{devices:p,isFiltered:i,filtered:u,sorted:v,handleSort:m,route:h}=qn({jobs:t.jobs,q:t.q,statusFilter:t.statusFilter,deviceFilter:t.deviceFilter,sortCol:t.sortCol,sortDir:t.sortDir,setSortCol:t.setSortCol,setSortDir:t.setSortDir,loc:e}),{closeModal:_,patchJob:$,handleJobProjectChange:f,handleJobStatusChange:g,handleJobExtraLaborChange:y,handleNavigateToProject:w,handleRatesChanged:T,handleAutoGroup:F}=Gn({setJobs:t.setJobs,setProjects:t.setProjects,setSummary:t.setSummary,setSelectedJob:t.setSelectedJob,navigate:n,refreshProjectsAndPrices:d,refreshJobPrices:l});return r?nt`<${Dn} bootStatus=${c} loadProgress=${s} />`:o?nt`<${An} error=${o} />`:nt`
    <${Ge} summary=${t.summary} dataRange=${t.dataRange} />
    ${On({route:h,summary:t.summary,projects:t.projects,setProjects:t.setProjects,jobs:t.jobs,projectsLoading:a,navigate:n,setSelectedJob:t.setSelectedJob,handleJobProjectChange:f,handleRatesChanged:T,handleAutoGroup:F,projectPrices:t.projectPrices,q:t.q,setQ:t.setQ,statusFilter:t.statusFilter,setStatusFilter:t.setStatusFilter,deviceFilter:t.deviceFilter,setDeviceFilter:t.setDeviceFilter,devices:p,view:t.view,setView:t.setView,filtered:u,isFiltered:i,sorted:v,sortCol:t.sortCol,sortDir:t.sortDir,handleSort:m})}
    <${Qn}
      selectedJob=${t.selectedJob}
      closeModal=${_}
      patchJob=${$}
      projects=${t.projects}
      handleJobProjectChange=${f}
      handleJobStatusChange=${g}
      handleJobExtraLaborChange=${y}
      handleNavigateToProject=${w}
    />
    <${en} />
  `}const Yn=nt`<${te} base="/ui"><${zn} /></${te}>`;Je(Yn,document.getElementById("app"));
