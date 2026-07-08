(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();var Nt,C,Ce,Q,oe,Se,Te,Jt,wt,_t,Fe,qt,Ut,Rt,Ne,St={},Tt=[],Xe=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Lt=Array.isArray;function z(t,e){for(var n in e)t[n]=e[n];return t}function Gt(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function I(t,e,n){var a,s,r,i={};for(r in e)r=="key"?a=e[r]:r=="ref"?s=e[r]:i[r]=e[r];if(arguments.length>2&&(i.children=arguments.length>3?Nt.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(r in t.defaultProps)i[r]===void 0&&(i[r]=t.defaultProps[r]);return Pt(t,i,a,s,null)}function Pt(t,e,n,a,s){var r={type:t,props:e,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:s??++Ce,__i:-1,__u:0};return s==null&&C.vnode!=null&&C.vnode(r),r}function It(t){return t.children}function kt(t,e){this.props=t,this.context=e}function lt(t,e){if(e==null)return t.__?lt(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?lt(t):null}function Ze(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,a=[],s=[],r=z({},e);r.__v=e.__v+1,C.vnode&&C.vnode(r),zt(t.__P,r,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,a,n??lt(e),!!(32&e.__u),s),r.__v=e.__v,r.__.__k[r.__i]=r,je(a,r,s),e.__e=e.__=null,r.__e!=n&&Le(r)}}function Le(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),Le(t)}function Ot(t){(!t.__d&&(t.__d=!0)&&Q.push(t)&&!Ft.__r++||oe!=C.debounceRendering)&&((oe=C.debounceRendering)||Se)(Ft)}function Ft(){try{for(var t,e=1;Q.length;)Q.length>e&&Q.sort(Te),t=Q.shift(),e=Q.length,Ze(t)}finally{Q.length=Ft.__r=0}}function Ie(t,e,n,a,s,r,i,l,u,d,p){var o,c,v,m,b,_,f,$=a&&a.__k||Tt,h=e.length;for(u=tn(n,e,$,u,h),o=0;o<h;o++)(v=n.__k[o])!=null&&(c=v.__i!=-1&&$[v.__i]||St,v.__i=o,_=zt(t,v,c,s,r,i,l,u,d,p),m=v.__e,v.ref&&c.ref!=v.ref&&(c.ref&&Kt(c.ref,null,v),p.push(v.ref,v.__c||m,v)),b==null&&m!=null&&(b=m),(f=!!(4&v.__u))||c.__k===v.__k?(u=xe(v,u,t,f),f&&c.__e&&(c.__e=null)):typeof v.type=="function"&&_!==void 0?u=_:m&&(u=m.nextSibling),v.__u&=-7);return n.__e=b,u}function tn(t,e,n,a,s){var r,i,l,u,d,p=n.length,o=p,c=0;for(t.__k=new Array(s),r=0;r<s;r++)(i=e[r])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=t.__k[r]=Pt(null,i,null,null,null):Lt(i)?i=t.__k[r]=Pt(It,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=t.__k[r]=Pt(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):t.__k[r]=i,u=r+c,i.__=t,i.__b=t.__b+1,l=null,(d=i.__i=en(i,n,u,o))!=-1&&(o--,(l=n[d])&&(l.__u|=2)),l==null||l.__v==null?(d==-1&&(s>p?c--:s<p&&c++),typeof i.type!="function"&&(i.__u|=4)):d!=u&&(d==u-1?c--:d==u+1?c++:(d>u?c--:c++,i.__u|=4))):t.__k[r]=null;if(o)for(r=0;r<p;r++)(l=n[r])!=null&&(2&l.__u)==0&&(l.__e==a&&(a=lt(l)),De(l,l));return a}function xe(t,e,n,a){var s,r;if(typeof t.type=="function"){for(s=t.__k,r=0;s&&r<s.length;r++)s[r]&&(s[r].__=t,e=xe(s[r],e,n,a));return e}t.__e!=e&&(a&&(e&&t.type&&!e.parentNode&&(e=lt(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function en(t,e,n,a){var s,r,i,l=t.key,u=t.type,d=e[n],p=d!=null&&(2&d.__u)==0;if(d===null&&l==null||p&&l==d.key&&u==d.type)return n;if(a>(p?1:0)){for(s=n-1,r=n+1;s>=0||r<e.length;)if((d=e[i=s>=0?s--:r++])!=null&&(2&d.__u)==0&&l==d.key&&u==d.type)return i}return-1}function le(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||Xe.test(e)?n:n+"px"}function bt(t,e,n,a,s){var r,i;t:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof a=="string"&&(t.style.cssText=a=""),a)for(e in a)n&&e in n||le(t.style,e,"");if(n)for(e in n)a&&n[e]==a[e]||le(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")r=e!=(e=e.replace(Fe,"$1")),i=e.toLowerCase(),e=i in t||e=="onFocusOut"||e=="onFocusIn"?i.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+r]=n,n?a?n[_t]=a[_t]:(n[_t]=qt,t.addEventListener(e,r?Rt:Ut,r)):t.removeEventListener(e,r?Rt:Ut,r);else{if(s=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break t}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function ce(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[wt]==null)e[wt]=qt++;else if(e[wt]<n[_t])return;return n(C.event?C.event(e):e)}}}function zt(t,e,n,a,s,r,i,l,u,d){var p,o,c,v,m,b,_,f,$,h,y,w,k,S,D,J=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(u=!!(32&n.__u),r=[l=e.__e=n.__e]),(p=C.__b)&&p(e);t:if(typeof J=="function")try{if(f=e.props,$=J.prototype&&J.prototype.render,h=(p=J.contextType)&&a[p.__c],y=p?h?h.props.value:p.__:a,n.__c?_=(o=e.__c=n.__c).__=o.__E:($?e.__c=o=new J(f,y):(e.__c=o=new kt(f,y),o.constructor=J,o.render=an),h&&h.sub(o),o.state||(o.state={}),o.__n=a,c=o.__d=!0,o.__h=[],o._sb=[]),$&&o.__s==null&&(o.__s=o.state),$&&J.getDerivedStateFromProps!=null&&(o.__s==o.state&&(o.__s=z({},o.__s)),z(o.__s,J.getDerivedStateFromProps(f,o.__s))),v=o.props,m=o.state,o.__v=e,c)$&&J.getDerivedStateFromProps==null&&o.componentWillMount!=null&&o.componentWillMount(),$&&o.componentDidMount!=null&&o.__h.push(o.componentDidMount);else{if($&&J.getDerivedStateFromProps==null&&f!==v&&o.componentWillReceiveProps!=null&&o.componentWillReceiveProps(f,y),e.__v==n.__v||!o.__e&&o.shouldComponentUpdate!=null&&o.shouldComponentUpdate(f,o.__s,y)===!1){e.__v!=n.__v&&(o.props=f,o.state=o.__s,o.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(B){B&&(B.__=e)}),Tt.push.apply(o.__h,o._sb),o._sb=[],o.__h.length&&i.push(o);break t}o.componentWillUpdate!=null&&o.componentWillUpdate(f,o.__s,y),$&&o.componentDidUpdate!=null&&o.__h.push(function(){o.componentDidUpdate(v,m,b)})}if(o.context=y,o.props=f,o.__P=t,o.__e=!1,w=C.__r,k=0,$)o.state=o.__s,o.__d=!1,w&&w(e),p=o.render(o.props,o.state,o.context),Tt.push.apply(o.__h,o._sb),o._sb=[];else do o.__d=!1,w&&w(e),p=o.render(o.props,o.state,o.context),o.state=o.__s;while(o.__d&&++k<25);o.state=o.__s,o.getChildContext!=null&&(a=z(z({},a),o.getChildContext())),$&&!c&&o.getSnapshotBeforeUpdate!=null&&(b=o.getSnapshotBeforeUpdate(v,m)),S=p!=null&&p.type===It&&p.key==null?Me(p.props.children):p,l=Ie(t,Lt(S)?S:[S],e,n,a,s,r,i,l,u,d),o.base=e.__e,e.__u&=-161,o.__h.length&&i.push(o),_&&(o.__E=o.__=null)}catch(B){if(e.__v=null,u||r!=null)if(B.then){for(e.__u|=u?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;r[r.indexOf(l)]=null,e.__e=l}else{for(D=r.length;D--;)Gt(r[D]);Ht(e)}else e.__e=n.__e,e.__k=n.__k,B.then||Ht(e);C.__e(B,e,n)}else r==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):l=e.__e=nn(n.__e,e,n,a,s,r,i,u,d);return(p=C.diffed)&&p(e),128&e.__u?void 0:l}function Ht(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(Ht))}function je(t,e,n){for(var a=0;a<n.length;a++)Kt(n[a],n[++a],n[++a]);C.__c&&C.__c(e,t),t.some(function(s){try{t=s.__h,s.__h=[],t.some(function(r){r.call(s)})}catch(r){C.__e(r,s.__v)}})}function Me(t){return typeof t!="object"||t==null||t.__b>0?t:Lt(t)?t.map(Me):z({},t)}function nn(t,e,n,a,s,r,i,l,u){var d,p,o,c,v,m,b,_=n.props||St,f=e.props,$=e.type;if($=="svg"?s="http://www.w3.org/2000/svg":$=="math"?s="http://www.w3.org/1998/Math/MathML":s||(s="http://www.w3.org/1999/xhtml"),r!=null){for(d=0;d<r.length;d++)if((v=r[d])&&"setAttribute"in v==!!$&&($?v.localName==$:v.nodeType==3)){t=v,r[d]=null;break}}if(t==null){if($==null)return document.createTextNode(f);t=document.createElementNS(s,$,f.is&&f),l&&(C.__m&&C.__m(e,r),l=!1),r=null}if($==null)_===f||l&&t.data==f||(t.data=f);else{if(r=r&&Nt.call(t.childNodes),!l&&r!=null)for(_={},d=0;d<t.attributes.length;d++)_[(v=t.attributes[d]).name]=v.value;for(d in _)v=_[d],d=="dangerouslySetInnerHTML"?o=v:d=="children"||d in f||d=="value"&&"defaultValue"in f||d=="checked"&&"defaultChecked"in f||bt(t,d,null,v,s);for(d in f)v=f[d],d=="children"?c=v:d=="dangerouslySetInnerHTML"?p=v:d=="value"?m=v:d=="checked"?b=v:l&&typeof v!="function"||_[d]===v||bt(t,d,v,_[d],s);if(p)l||o&&(p.__html==o.__html||p.__html==t.innerHTML)||(t.innerHTML=p.__html),e.__k=[];else if(o&&(t.innerHTML=""),Ie(e.type=="template"?t.content:t,Lt(c)?c:[c],e,n,a,$=="foreignObject"?"http://www.w3.org/1999/xhtml":s,r,i,r?r[0]:n.__k&&lt(n,0),l,u),r!=null)for(d=r.length;d--;)Gt(r[d]);l||(d="value",$=="progress"&&m==null?t.removeAttribute("value"):m!=null&&(m!==t[d]||$=="progress"&&!m||$=="option"&&m!=_[d])&&bt(t,d,m,_[d],s),d="checked",b!=null&&b!=t[d]&&bt(t,d,b,_[d],s))}return t}function Kt(t,e,n){try{if(typeof t=="function"){var a=typeof t.__u=="function";a&&t.__u(),a&&e==null||(t.__u=t(e))}else t.current=e}catch(s){C.__e(s,n)}}function De(t,e,n){var a,s;if(C.unmount&&C.unmount(t),(a=t.ref)&&(a.current&&a.current!=t.__e||Kt(a,null,e)),(a=t.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(r){C.__e(r,e)}a.base=a.__P=null}if(a=t.__k)for(s=0;s<a.length;s++)a[s]&&De(a[s],e,n||typeof t.type!="function");n||Gt(t.__e),t.__c=t.__=t.__e=void 0}function an(t,e,n){return this.constructor(t,n)}function sn(t,e,n){var a,s,r,i;e==document&&(e=document.documentElement),C.__&&C.__(t,e),s=(a=!1)?null:e.__k,r=[],i=[],zt(e,t=e.__k=I(It,null,[t]),s||St,St,e.namespaceURI,s?null:e.firstChild?Nt.call(e.childNodes):null,r,s?s.__e:e.firstChild,a,i),je(r,t,i)}function rn(t){function e(n){var a,s;return this.getChildContext||(a=new Set,(s={})[e.__c]=this,this.getChildContext=function(){return s},this.componentWillUnmount=function(){a=null},this.shouldComponentUpdate=function(r){this.props.value!=r.value&&a.forEach(function(i){i.__e=!0,Ot(i)})},this.sub=function(r){a.add(r);var i=r.componentWillUnmount;r.componentWillUnmount=function(){a&&a.delete(r),i&&i.call(r)}}),n.children}return e.__c="__cC"+Ne++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,a){return n.children(a)}).contextType=e,e}Nt=Tt.slice,C={__e:function(t,e,n,a){for(var s,r,i;e=e.__;)if((s=e.__c)&&!s.__)try{if((r=s.constructor)&&r.getDerivedStateFromError!=null&&(s.setState(r.getDerivedStateFromError(t)),i=s.__d),s.componentDidCatch!=null&&(s.componentDidCatch(t,a||{}),i=s.__d),i)return s.__E=s}catch(l){t=l}throw t}},Ce=0,kt.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=z({},this.state),typeof t=="function"&&(t=t(z({},n),this.props)),t&&z(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),Ot(this))},kt.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Ot(this))},kt.prototype.render=It,Q=[],Se=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Te=function(t,e){return t.__v.__b-e.__v.__b},Ft.__r=0,Jt=Math.random().toString(8),wt="__d"+Jt,_t="__a"+Jt,Fe=/(PointerCapture)$|Capture$/i,qt=0,Ut=ce(!1),Rt=ce(!0),Ne=0;var ct,F,Et,de,$t=0,Je=[],x=C,ue=x.__b,pe=x.__r,_e=x.diffed,ve=x.__c,$e=x.unmount,me=x.__;function xt(t,e){x.__h&&x.__h(F,t,$t||e),$t=0;var n=F.__H||(F.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function g(t){return $t=1,on(Ue,t)}function on(t,e,n){var a=xt(ct++,2);if(a.t=t,!a.__c&&(a.__=[Ue(void 0,e),function(l){var u=a.__N?a.__N[0]:a.__[0],d=a.t(u,l);u!==d&&(a.__N=[d,a.__[1]],a.__c.setState({}))}],a.__c=F,!F.__f)){var s=function(l,u,d){if(!a.__c.__H)return!0;var p=a.__c.__H.__.filter(function(c){return c.__c});if(p.every(function(c){return!c.__N}))return!r||r.call(this,l,u,d);var o=a.__c.props!==l;return p.some(function(c){if(c.__N){var v=c.__[0];c.__=c.__N,c.__N=void 0,v!==c.__[0]&&(o=!0)}}),r&&r.call(this,l,u,d)||o};F.__f=!0;var r=F.shouldComponentUpdate,i=F.componentWillUpdate;F.componentWillUpdate=function(l,u,d){if(this.__e){var p=r;r=void 0,s(l,u,d),r=p}i&&i.call(this,l,u,d)},F.shouldComponentUpdate=s}return a.__N||a.__}function O(t,e){var n=xt(ct++,3);!x.__s&&Ae(n.__H,e)&&(n.__=t,n.u=e,F.__H.__h.push(n))}function Ee(t){return $t=5,W(function(){return{current:t}},[])}function W(t,e){var n=xt(ct++,7);return Ae(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function P(t,e){return $t=8,W(function(){return t},e)}function ln(t){var e=F.context[t.__c],n=xt(ct++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(F)),e.props.value):t.__}function cn(){for(var t;t=Je.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(Ct),e.__h.some(Bt),e.__h=[]}catch(n){e.__h=[],x.__e(n,t.__v)}}}x.__b=function(t){F=null,ue&&ue(t)},x.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),me&&me(t,e)},x.__r=function(t){pe&&pe(t),ct=0;var e=(F=t.__c).__H;e&&(Et===F?(e.__h=[],F.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(Ct),e.__h.some(Bt),e.__h=[],ct=0)),Et=F},x.diffed=function(t){_e&&_e(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Je.push(e)!==1&&de===x.requestAnimationFrame||((de=x.requestAnimationFrame)||dn)(cn)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),Et=F=null},x.__c=function(t,e){e.some(function(n){try{n.__h.some(Ct),n.__h=n.__h.filter(function(a){return!a.__||Bt(a)})}catch(a){e.some(function(s){s.__h&&(s.__h=[])}),e=[],x.__e(a,n.__v)}}),ve&&ve(t,e)},x.unmount=function(t){$e&&$e(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(a){try{Ct(a)}catch(s){e=s}}),n.__H=void 0,e&&x.__e(e,n.__v))};var fe=typeof requestAnimationFrame=="function";function dn(t){var e,n=function(){clearTimeout(a),fe&&cancelAnimationFrame(e),setTimeout(t)},a=setTimeout(n,35);fe&&(e=requestAnimationFrame(n))}function Ct(t){var e=F,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),F=e}function Bt(t){var e=F;t.__c=t.__(),F=e}function Ae(t,e){return!t||t.length!==e.length||e.some(function(n,a){return n!==t[a]})}function Ue(t,e){return typeof e=="function"?e(t):e}var Re=function(t,e,n,a){var s;e[0]=0;for(var r=1;r<e.length;r++){var i=e[r++],l=e[r]?(e[0]|=i?1:2,n[e[r++]]):e[++r];i===3?a[0]=l:i===4?a[1]=Object.assign(a[1]||{},l):i===5?(a[1]=a[1]||{})[e[++r]]=l:i===6?a[1][e[++r]]+=l+"":i?(s=t.apply(l,Re(t,l,n,["",null])),a.push(s),l[0]?e[0]|=2:(e[r-2]=0,e[r]=s)):a.push(l)}return a},ge=new Map;function M(t){var e=ge.get(this);return e||(e=new Map,ge.set(this,e)),(e=Re(this,e.get(t)||(e.set(t,e=(function(n){for(var a,s,r=1,i="",l="",u=[0],d=function(c){r===1&&(c||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?u.push(0,c,i):r===3&&(c||i)?(u.push(3,c,i),r=2):r===2&&i==="..."&&c?u.push(4,c,0):r===2&&i&&!c?u.push(5,0,!0,i):r>=5&&((i||!c&&r===5)&&(u.push(r,0,i,s),r=6),c&&(u.push(r,c,0,s),r=6)),i=""},p=0;p<n.length;p++){p&&(r===1&&d(),d(p));for(var o=0;o<n[p].length;o++)a=n[p][o],r===1?a==="<"?(d(),u=[u],r=3):i+=a:r===4?i==="--"&&a===">"?(r=1,i=""):i=a+i[0]:l?a===l?l="":i+=a:a==='"'||a==="'"?l=a:a===">"?(d(),r=1):r&&(a==="="?(r=5,s=i,i=""):a==="/"&&(r<5||n[p][o+1]===">")?(d(),r===3&&(u=u[0]),r=u,(u=u[0]).push(2,0,r),r=0):a===" "||a==="	"||a===`
`||a==="\r"?(d(),r=2):i+=a),r===3&&i==="!--"&&(r=4,u=u[0])}return d(),u})(t)),e),arguments,[])).length>1?e:e[0]}const un=M.bind(I),Wt=rn(null);function he({base:t,children:e}){const n=t.endsWith("/")?t.slice(0,-1):t,a=l=>l===n||l===n+"/"?"/":l.startsWith(n+"/")?l.slice(n.length)||"/":l,[s,r]=g(()=>a(location.pathname));O(()=>{const l=()=>r(a(location.pathname));return window.addEventListener("popstate",l),()=>window.removeEventListener("popstate",l)},[n]);const i=P(l=>{const u=l==="/"?n+"/":n+l;history.pushState(null,"",u),r(l)},[n]);return un`<${Wt.Provider} value=${[s,i]}>${e}</${Wt.Provider}>`}function Qt(){const t=ln(Wt);if(!t)throw new Error("useLocation must be used within RouterProvider");return t}function nt(t){if(!t)return"—";const e=Math.floor(t/3600),n=Math.floor(t%3600/60);return e===0?`${n}m`:`${e}h${n>0?` ${n}m`:""}`}function Yt(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"};return e.toLocaleString(void 0,a)}function et(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric"}:{month:"short",day:"numeric",year:"2-digit"};return e.toLocaleDateString(void 0,a)}function A(t){return"$"+t.toFixed(2)}function ft(t){return t==null?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function Xt(t){return t?t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${Math.round(t)} g`:"0 g"}const at=M.bind(I),pn={finish:"badge badge-finish",running:"badge badge-running",failed:"badge badge-failed",cancel:"badge badge-cancel",pause:"badge badge-pause"};function gt({status:t}){const e=(t||"").toLowerCase();return at`<span class=${pn[e]||"badge badge-default"}>${e||"unknown"}</span>`}function jt({url:t}){const[e,n]=g(!1);return!t||e?at`<div class="row-thumb-ph">🖨</div>`:at`<img
    class="row-thumb"
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>n(!0)}
  />`}function _n({url:t,className:e}){const[n,a]=g(!1);return!t||n?at`<div class="cover-placeholder">🖨</div>`:at`<img
    class=${e}
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>a(!0)}
  />`}function Mt({colors:t}){if(!(t!=null&&t.length))return null;const e=[...new Set(t.map(n=>n.slice(0,6).toUpperCase()))].filter(n=>n!=="FFFFFF");return e.length?at`<span class="swatches"
    >${e.map(n=>at`<span class="swatch" style=${"background:#"+n} title=${"#"+n} />`)}</span
  >`:null}const be=M.bind(I);let Oe=()=>{};function R(t,e="info"){Oe({message:t,type:e,id:Date.now()+Math.random()})}function vn(){const[t,e]=g([]),n=Ee(new Map);Oe=P(s=>{e(i=>[...i,s]);const r=setTimeout(()=>{e(i=>i.filter(l=>l.id!==s.id)),n.current.delete(s.id)},3500);n.current.set(s.id,r)},[]);const a=P(s=>{const r=n.current.get(s);r&&clearTimeout(r),n.current.delete(s),e(i=>i.filter(l=>l.id!==s))},[]);return t.length?be`
    <div class="toast-container">
      ${t.map(s=>be`
          <div class="toast toast-${s.type}" key=${s.id} onClick=${()=>a(s.id)}>
            ${s.message}
          </div>
        `)}
    </div>
  `:null}const $n=15e3,mn=2e4,fn=5;async function gn(t,e){try{const n=await t.json();return typeof n.error=="string"?n.error:e}catch{return e}}function hn(t){const{timeoutMs:e=$n,...n}=t??{};return n.signal||e===null?n:{signal:AbortSignal.timeout(e),...n}}function bn(t,e){return(t==null?void 0:t.name)==="TimeoutError"?new Error(`${e} (request timed out)`):new Error(`${e} (network error)`)}async function X(t,e,n){let a;try{a=await fetch(t,hn(n))}catch(s){throw bn(s,e)}if(!a.ok)throw new Error(await gn(a,e));return await a.json()}async function Zt(t,e,n){try{return{data:await X(t,e,n),error:null}}catch(a){return{data:null,error:a instanceof Error?a:new Error(e)}}}async function st(t,e,n){const{data:a,error:s}=await Zt(t,e,n);return s?(R(s.message||e,"error"),null):a}async function Z(t,e,n){return st(t,n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}async function dt(t,e,n,a){return st(t,n,{...a,method:"POST",headers:{"Content-Type":"application/json",...a==null?void 0:a.headers},body:JSON.stringify(e)})}async function yn(){return(await X("/api/products","Failed to load products.")).products}async function wn(t){return(await X(`/api/products/${t}`,"Failed to load product.")).product}async function Pn(){return(await X("/api/products/print-next","Failed to load print-next products.")).products}async function kn(t){const e=await dt("/api/products",t,"Failed to create product.");return(e==null?void 0:e.product)??null}async function te(t,e){const n=await Z(`/api/products/${t}`,e,"Failed to update product.");return(n==null?void 0:n.product)??null}const U=M.bind(I);function Cn(t){const e=t.toLowerCase();return e.includes("a1 mini")?"/ui/printers/a1-mini":e.includes("p1s")?"/ui/printers/p1s":null}function Sn(t){const e=new Map;for(const n of t){const a=n.deviceModel||"Unknown printer",s=e.get(a)??[];s.push(n),e.set(a,s)}return e}function He(t,e=6){return t.slice().sort((n,a)=>String(a.startTime||"").localeCompare(String(n.startTime||""))).slice(0,e)}function Be({printerName:t}){const e=Cn(t);return e?U`<img class="printer-photo" src=${e} alt=${t} />`:U`<div class="printer-photo">🖨️</div>`}function We({job:t,onJobClick:e}){return U`
    <article class="printer-job-row" key=${t.id} onClick=${()=>e(t)}>
      <div class="printer-job-top">
        <div class="td-thumb"><${jt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title">${t.designTitle||"Untitled Job"}</span>
          <${Mt} colors=${t.filament_colors} />
        </div>
        <${gt} status=${t.status} />
      </div>
      <div class="printer-job-bottom">
        <span>${et(t.startTime)}</span>
        <span>Filament: <strong>${ft(t.total_weight_g)}</strong></span>
        <span>Time: <strong>${nt(t.total_time_s)}</strong></span>
      </div>
    </article>
  `}function Tn({row:t,jobs:e,onJobClick:n}){const a=t.deviceModel||"Unknown printer",s=He(e);return U`
    <section class="printer-card" key=${a}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${Be} printerName=${a} />
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
        ${s.length?s.map(r=>U`<${We} key=${r.id} job=${r} onJobClick=${n} />`):U`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function Fn({printer:t,jobs:e,onJobClick:n,onToggleActive:a}){const s=t.name||t.model||t.provider_printer_id,r=He(e),i=t.is_active===1;return U`
    <section class=${"printer-card"+(i?"":" is-retired")} key=${t.id}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${Be} printerName=${t.model||s} />
          <div>
            <h3>${s}</h3>
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
            ${t.retired_at?U`<p class="printer-meta">Retired ${et(t.retired_at)}</p>`:null}
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
          ${i?"Mark retired":"Reactivate"}
        </button>
      </div>

      <div class="printer-jobs-list">
        ${r.length?r.map(l=>U`<${We} key=${l.id} job=${l} onJobClick=${n} />`):U`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function Nn(t,e){return e.filter(n=>n.printer_id===t.id)}function Ln({summary:t,jobs:e,onJobClick:n}){const[a,s]=g([]);O(()=>{st("/printers","Failed to load printer inventory.").then(u=>{u&&s(u.printers)})},[]);const r=async u=>{const d=await Z(`/printers/${u.id}`,{is_active:u.is_active!==1},"Failed to update printer inventory.");d!=null&&d.printer&&s(p=>p.map(o=>o.id===u.id?d.printer:o))};if(a.length)return U`
      <div class="printer-grid">
        ${a.map(u=>U`<${Fn}
              key=${u.id}
              printer=${u}
              jobs=${Nn(u,e)}
              onJobClick=${n}
              onToggleActive=${r}
            />`)}
      </div>
    `;const i=(t==null?void 0:t.by_device)??[];if(!i.length)return U`<div class="empty">No printer totals available yet.</div>`;const l=Sn(e);return U`
    <div class="printer-grid">
      ${i.map(u=>U`<${Tn}
            key=${u.deviceModel||"Unknown printer"}
            row=${u}
            jobs=${l.get(u.deviceModel||"Unknown printer")??[]}
            onJobClick=${n}
          />`)}
    </div>
  `}const L=M.bind(I);function In(t){return!t.startsWith("/projects")&&!t.startsWith("/admin")&&!t.startsWith("/printers")&&!t.startsWith("/catalog")&&!t.startsWith("/products")}function xn(t,e){const n=new URLSearchParams;t&&n.set("status",t),e&&n.set("device",e);const a=n.toString();return"/jobs/export.csv"+(a?"?"+a:"")}function jn(t){return t.reduce((e,n)=>(e.weight+=n.total_weight_g||0,e.time+=n.total_time_s||0,e),{weight:0,time:0})}function Mn(t){return!t||t==="actual"?null:t==="slicer_estimate"?"estimate":t==="manual"?"manual":"unknown"}function Ve({confidence:t}){const e=Mn(t);return e?L`<span class="usage-confidence">${e}</span>`:null}const Dn=[{label:"Jobs",path:"/",active:In},{label:"Projects",path:"/projects",active:t=>t.startsWith("/projects")},{label:"Printers",path:"/printers",active:t=>t.startsWith("/printers")},{label:"Products",path:"/products/pipeline",active:t=>t.startsWith("/products")},{label:"Catalog",path:"/catalog",active:t=>t.startsWith("/catalog")},{label:"Rates",path:"/admin",active:t=>t.startsWith("/admin")}],Jn=[["","All Statuses"],["finish","Finished"],["cancel","Cancelled"],["running","Running"],["failed","Failed"],["pause","Paused"]];function At(t,e){const n=(t==null?void 0:t.by_device)??[];return n.length?n.map(a=>{const s=a.deviceModel||"Unknown printer";return e==="jobs"?`${s}: ${(a.total_jobs??0).toLocaleString()} jobs`:e==="plates"?`${s}: ${(a.total_plates??0).toLocaleString()} plates`:`${s}: ${((a.total_time_s??0)/3600).toFixed(1).toLocaleString()} h`}).join(`
`):"No printer breakdown available"}function En({loc:t,navigate:e}){return L`<nav class="top-nav">
    ${Dn.map(n=>{const a=n.active(t);return L`
        <button
          key=${n.label}
          class=${"nav-btn"+(a?" active":"")}
          onClick=${()=>e(n.path)}
        >
          ${n.label}
        </button>
      `})}
  </nav>`}function An({summary:t}){var n,a;const e=t==null?void 0:t.totals;return L`
    <div class="stats">
      <div class="stat" title=${At(t,"jobs")}>
        <div class="stat-val">${e?(n=e.total_jobs)==null?void 0:n.toLocaleString():"—"}</div>
        <div class="stat-lbl">Total Jobs</div>
      </div>
      <div class="stat">
        <div class="stat-val">${e?((e.total_weight_g??0)/1e3).toFixed(2):"—"}</div>
        <div class="stat-lbl">Filament kg</div>
      </div>
      <div class="stat" title=${At(t,"hours")}>
        <div class="stat-val">${e?((e.total_time_s??0)/3600).toFixed(1):"—"}</div>
        <div class="stat-lbl">Print Hours</div>
      </div>
      <div class="stat" title=${At(t,"plates")}>
        <div class="stat-val">${e?(a=e.total_plates)==null?void 0:a.toLocaleString():"—"}</div>
        <div class="stat-lbl">Plates</div>
      </div>
    </div>
  `}function Un({summary:t,dataRange:e}){const[n,a]=Qt(),s=!!(e!=null&&e.min_start&&(e!=null&&e.max_start)),r=(e==null?void 0:e.min_start)??"",i=(e==null?void 0:e.max_start)??"";return L`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>PrintWorks</span></h1>
        ${s&&L`<div class="header-range">
          History: ${et(r)} → ${et(i)}
          (${((e==null?void 0:e.task_count)||0).toLocaleString()} tasks)
        </div>`}
        <${En} loc=${n} navigate=${a} />
      </div>
      <${An} summary=${t} />
    </header>
  `}function Rn({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:s,setDeviceFilter:r,devices:i,view:l,setView:u,density:d,setDensity:p,filteredCount:o,totalCount:c}){const v=W(()=>xn(n,s),[n,s]);return L`
    <div class="toolbar">
      <input
        type="search"
        placeholder="Search title or customer…"
        value=${t}
        onInput=${m=>e(m.target.value)}
      />
      <select
        value=${n}
        onChange=${m=>a(m.target.value)}
      >
        ${Jn.map(([m,b])=>L`<option key=${m} value=${m}>${b}</option> `)}
      </select>
      <select
        value=${s}
        onChange=${m=>r(m.target.value)}
      >
        <option value="">All Printers</option>
        ${i.map(m=>L`<option key=${m} value=${m}>${m}</option> `)}
      </select>
      <div class="view-toggle">
        <button
          class=${"view-btn"+(l==="table"?" active":"")}
          onClick=${()=>u("table")}
        >
          ☰ Table
        </button>
        <button
          class=${"view-btn"+(l==="grid"?" active":"")}
          onClick=${()=>u("grid")}
        >
          ⊞ Grid
        </button>
      </div>
      <div class="toolbar-right">
        <div class="density-toggle">
          <button
            class=${"density-btn"+(d==="compact"?" active":"")}
            onClick=${()=>p("compact")}
          >
            Compact
          </button>
          <button
            class=${"density-btn"+(d==="comfy"?" active":"")}
            onClick=${()=>p("comfy")}
          >
            Comfy
          </button>
        </div>
        <a class="btn-csv" href=${v} download>↓ CSV</a>
        <span class="job-count">${o} / ${c} jobs</span>
      </div>
    </div>
  `}function On({filtered:t,isFiltered:e}){if(!e||!t.length)return null;const n=jn(t);return L`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${t.length}</strong></span>
      <span>Filament: <strong>${Xt(n.weight)}</strong></span>
      <span>Print time: <strong>${nt(n.time)}</strong></span>
    </div>
  `}function qe({printRun:t}){return(t??1)<=1?null:L`<span class="run-badge">Run ${t}</span>`}function Hn({sortCol:t,sortDir:e,onSort:n}){return L`<div class="jobs-record-sortbar">
    <span class="jobs-record-sort-label">Sort</span>
    ${[{col:"startTime",label:"Date"},{col:"designTitle",label:"Title"},{col:"deviceModel",label:"Printer"},{col:"total_weight_g",label:"Filament"},{col:"total_time_s",label:"Time"},{col:"final_price",label:"Price"}].map(({col:s,label:r})=>{const i=t===s;return L`
        <button
          key=${s}
          class=${"jobs-record-sort-btn"+(i?" active":"")}
          onClick=${()=>n(s)}
        >
          ${r}${i?e==="asc"?" ↑":" ↓":""}
        </button>
      `})}
  </div>`}function Bn({job:t,onJobClick:e}){return L`
    <article class="jobs-record-row" onClick=${()=>e(t)}>
      <div class="jobs-record-top">
        <div class="td-thumb"><${jt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title" title=${t.designTitle||"Untitled"}
            >${t.designTitle||"Untitled Job"}</span
          >
          <${qe} printRun=${t.print_run} />
          <${Mt} colors=${t.filament_colors} />
        </div>
        <div><${gt} status=${t.status} /></div>
      </div>
      <div class="jobs-record-bottom">
        <span>🖨 ${t.deviceModel||"—"}</span>
        <span title=${Yt(t.startTime)}>📅 ${et(t.startTime)}</span>
        <span
          >🧵 <strong>${ft(t.total_weight_g)}</strong>
          <${Ve} confidence=${t.material_usage_confidence} />
        </span>
        <span>⏱ <strong>${nt(t.total_time_s)}</strong></span>
        <span
          >💰 <strong>${t.final_price!=null?A(t.final_price):"—"}</strong></span
        >
        <span>🧱 <strong>${t.plate_count??"—"}</strong></span>
        ${t.customer?L`<span class="customer-pill">${t.customer}</span>`:null}
      </div>
    </article>
  `}function Wn({sorted:t,sortCol:e,sortDir:n,onSort:a,onJobClick:s,density:r}){return L`
    <div class=${"jobs-record-list-wrap density-"+r}>
      <${Hn} sortCol=${e} sortDir=${n} onSort=${a} />
      <div class="jobs-record-list">
        ${t.map(i=>L`<${Bn} key=${i.id} job=${i} onJobClick=${s} />`)}
      </div>
    </div>
  `}function Vn({job:t,onJobClick:e}){return L`
    <div class="card" onClick=${()=>e(t)}>
      <${_n} url=${t.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${t.designTitle||"Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${t.deviceModel||"—"}</span>
          <span>📅 ${et(t.startTime)}</span>
          <span>⏱ ${nt(t.total_time_s)}</span>
          <span
            >🧵 ${ft(t.total_weight_g)}
            <${Ve} confidence=${t.material_usage_confidence} />
          </span>
          ${t.final_price!=null&&L`<span>💰 ${A(t.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${gt} status=${t.status} />
          <${qe} printRun=${t.print_run} />
          ${t.customer&&L`<span class="customer-pill">${t.customer}</span>`}
          <${Mt} colors=${t.filament_colors} />
        </div>
      </div>
    </div>
  `}function qn({sorted:t,onJobClick:e,density:n}){return L`
    <div class=${"grid-view density-"+n}>
      ${t.map(a=>L`<${Vn} key=${a.id} job=${a} onJobClick=${e} />`)}
    </div>
  `}function ee(t){O(()=>{const e=n=>{n.key==="Escape"&&t()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[t])}const H=M.bind(I);function Gn(t){return t==="actual"?"actual usage":t==="slicer_estimate"?"slicer estimate":t==="manual"?"manual entry":"unknown confidence"}function zn({jobId:t}){const[e,n]=g(null);if(O(()=>{let r=!0;return n(null),Zt(`/jobs/${t}/price`,"Pricing not configured").then(({data:i})=>{r&&n(i??!1)}).catch(()=>{r&&n(!1)}),()=>{r=!1}},[t]),e===null)return H`<div class="pricing-row pricing-loading">Loading price…</div>`;if(e===!1)return H`<div class="pricing-row pricing-na">Pricing not configured</div>`;const a=e.final_price-e.base_price,s=e.base_price>0?Math.round(a/e.base_price*100):0;return H`
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
            (${s>0?"+":""}${s}%)</span
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
  `}const Kn=["finish","failed","cancel","running","pause"];function Qn({job:t,onClose:e,onPatch:n,projects:a,onJobProjectChange:s,onJobStatusChange:r,onJobExtraLaborChange:i,onNavigateToProject:l}){const[u,d]=g(t.customer??""),[p,o]=g(t.notes??""),[c,v]=g(t.price_override!=null?String(t.price_override):"");ee(e);const m=P(_=>{const f=_.target.value;s(t.id,f===""?null:Number(f))},[t.id,s]),b=P(_=>{const f=_.target.value;r(t.id,f===""?null:f)},[t.id,r]);return H`
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
                <${gt} status=${t.status} />
                ${t.status_override&&H`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item">
              <label>Printer</label>
              <div class="detail-val">${t.deviceModel||"—"}</div>
            </div>
            <div class="detail-item">
              <label>Started</label>
              <div class="detail-val">${Yt(t.startTime)}</div>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <div class="detail-val">${nt(t.total_time_s)}</div>
            </div>
            <div class="detail-item">
              <label>Filament</label>
              <div class="detail-val">
                ${ft(t.total_weight_g)}
                <span class="usage-confidence"
                  >${Gn(t.material_usage_confidence)}</span
                >
                <${Mt} colors=${t.filament_colors} />
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
          <${zn} jobId=${t.id} key=${t.id+"-"+t.extra_labor_minutes} />
          <div class="modal-project-row">
            <label class="modal-project-label">Customer</label>
            <input
              class="modal-project-select"
              type="text"
              placeholder="—"
              value=${u}
              onInput=${_=>d(_.target.value)}
              onBlur=${()=>n(t.id,{customer:u.trim()||null})}
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
              value=${c}
              onInput=${_=>v(_.target.value)}
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
              onChange=${_=>{const f=_.target.value===""?null:Number(_.target.value);i(t.id,f)}}
            />
          </div>
          <div class="modal-project-row">
            <label class="modal-project-label">Status override</label>
            <select
              class="modal-project-select"
              value=${t.status_override??""}
              onChange=${b}
            >
              <option value="">Auto (from printer)</option>
              ${Kn.map(_=>H`<option key=${_} value=${_}>${_}</option>`)}
            </select>
          </div>
          ${a&&H`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select
                class="modal-project-select"
                value=${t.project_id??""}
                onChange=${m}
              >
                <option value="">— None —</option>
                ${a.map(_=>H`<option key=${_.id} value=${_.id}>${_.name}</option>`)}
              </select>
              ${t.project_id!=null&&H`
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
  `}const j=M.bind(I);function Yn({project:t,totalPrice:e,onClick:n,onRename:a}){const s=t.total_weight_g,r=t.total_time_s;return j`
    <div class="proj-card" onClick=${n}>
      ${t.cover_url?j`<img class="proj-card-cover" src=${t.cover_url} alt="" />`:j`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-title-row">
        <div class="proj-card-name">${t.name}</div>
        <button
          type="button"
          class="btn-secondary proj-card-action"
          onClick=${i=>{i.stopPropagation(),a(t)}}
        >
          Rename
        </button>
      </div>
      <div class="proj-card-meta">
        ${t.customer&&j`<span class="customer-pill">${t.customer}</span>`}
      </div>
      <div class="proj-card-stats">
        <span>
          <strong>${t.job_count}</strong> run${t.job_count!==1?"s":""}
        </span>
        ${t.total_plates!=null&&j`<span>
          <strong>${t.total_plates}</strong> plate${t.total_plates!==1?"s":""}
        </span>`}
        ${s!=null&&j`<span>${Xt(s)}</span>`}
        ${r!=null&&j`<span>${nt(r)}</span>`}
        ${e!=null&&j`<span class="proj-card-price">${A(e)}</span>`}
      </div>
      ${t.notes&&j`<div class="proj-card-notes">${t.notes}</div>`}
    </div>
  `}function Xn({price:t}){return t?j`
    <span>Material: <strong>${A(t.material_cost)}</strong></span>
    <span>Machine: <strong>${A(t.machine_cost)}</strong></span>
    <span>Labor: <strong>${A(t.labor_cost)}</strong></span>
    ${t.extra_labor_cost>0&&j`<span>Extra labor: <strong>${A(t.extra_labor_cost)}</strong></span>`}
    <span class="totals-total">Total: <strong>${A(t.final_price)}</strong></span>
  `:null}function Zn({jobs:t,onJobClick:e,onRemoveJob:n,onMoveToNewProject:a}){return t.length===0?j`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`:j`
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
          ${t.map(s=>j`
              <tr key=${s.id} onClick=${()=>e(s)}>
                <td class="td-thumb"><${jt} url=${s.cover_url} /></td>
                <td class="td-title">
                  <span class="row-title">${s.designTitle||"Untitled Job"}</span>
                </td>
                <td>${s.deviceModel||"—"}</td>
                <td title=${Yt(s.startTime)}>${et(s.startTime)}</td>
                <td><${gt} status=${s.status} /></td>
                <td class="td-num"><strong>${s.plate_count??1}</strong></td>
                <td class="td-num"><strong>${ft(s.total_weight_g)}</strong></td>
                <td class="td-num">${nt(s.total_time_s)}</td>
                <td class="td-num">
                  ${s.final_price!=null?j`<strong>${A(s.final_price)}</strong>`:"—"}
                </td>
                <td>
                  ${a&&j`<button
                    class="btn-secondary"
                    title="Move to a new project"
                    onClick=${r=>{r.stopPropagation(),a(s)}}
                  >
                    New project
                  </button>`}
                  <button
                    class="btn-remove-job"
                    title="Remove from project"
                    onClick=${r=>{r.stopPropagation(),n(s.id)}}
                  >
                    ×
                  </button>
                </td>
              </tr>
            `)}
        </tbody>
      </table>
    </div>
  `}function ta({loading:t,filtered:e,q:n,projectPrices:a,navigate:s,onRename:r}){return t?j`<div class="empty">Loading projects…</div>`:e.length===0?j`<div class="empty">${n?"No projects match your search.":"No projects yet. Create one to group related jobs together."}</div>`:j`
    <div class="proj-grid">
      ${e.map(i=>j`<${Yn}
            key=${i.id}
            project=${i}
            totalPrice=${a[i.id]??null}
            onClick=${()=>s(`/projects/${i.id}`)}
            onRename=${r}
          />`)}
    </div>
  `}const ea=M.bind(I);function na({job:t,initialName:e,onClose:n,onProjectCreated:a,onMoveJobToProject:s,onNavigateToProject:r}){const[i,l]=g(e),u=P(async()=>{const d=i.trim();if(!d)return;const p=await dt("/projects",{name:d,customer:t.customer??null,notes:null},"Failed to create project.");p!=null&&p.project&&(a(p.project),s(t.id,p.project.id),r(p.project.id),n())},[t.customer,t.id,i,n,s,r,a]);return ea`<div class="modal-backdrop" onClick=${n}>
    <div class="modal-card" onClick=${d=>d.stopPropagation()}>
      <h3>Move print run to new project</h3>
      <p class="modal-subtle">${t.designTitle||"Untitled Job"}</p>
      <label>
        New project name
        <input
          value=${i}
          onInput=${d=>l(d.target.value)}
          autofocus
        />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onClick=${n}>Cancel</button>
        <button
          type="button"
          class="btn-primary"
          disabled=${!i.trim()}
          onClick=${u}
        >
          Create and move
        </button>
      </div>
    </div>
  </div>`}const aa=M.bind(I);function sa({project:t,onClose:e,onRenamed:n}){const[a,s]=g(t.name??""),[r,i]=g(!1),l=P(async()=>{const u=a.trim();if(u){i(!0);try{const d=await Z(`/projects/${t.id}`,{name:u},"Failed to rename project."),p=d==null?void 0:d.project;if(!p)return;n(p),e()}finally{i(!1)}}},[a,e,n,t.id]);return aa`<div class="modal-backdrop" onClick=${e}>
    <div class="modal-card" onClick=${u=>u.stopPropagation()}>
      <h3>Rename project</h3>
      <p class="modal-subtle">${t.name}</p>
      <label>
        Project name
        <input
          value=${a}
          onInput=${u=>s(u.target.value)}
          autofocus
        />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onClick=${e}>Cancel</button>
        <button
          type="button"
          class="btn-primary"
          disabled=${!a.trim()||r}
          onClick=${l}
        >
          ${r?"Saving…":"Save name"}
        </button>
      </div>
    </div>
  </div>`}function ra(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>[a.name,a.customer,a.notes].filter(Boolean).join(" ").toLowerCase().includes(n))}function ia(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>`${a.designTitle||""} ${a.customer||""}`.toLowerCase().includes(n))}function oa(t,e,n){return`${n?`${e.length} of ${t.length}`:String(t.length)} project${t.length!==1?"s":""}`}function la(t,e){return t.some(n=>n.id===e.id)?t.map(n=>n.id===e.id?{...n,...e}:n):[e,...t]}function ca(t,e){if(t===0){R("No ungrouped jobs found — everything is already assigned to a project.","info");return}R(`Created ${t} project${t!==1?"s":""}, assigned ${e} job${e!==1?"s":""}.`,"success")}function da(t){return t.reduce((e,n)=>e+(n.total_weight_g||0),0)}function ua(t){return t.reduce((e,n)=>e+(n.total_time_s||0),0)}function pa(t){return t.reduce((e,n)=>e+(n.plate_count||0),0)}const pt=M.bind(I);function Ge(t){return e=>{e.target===e.currentTarget&&t()}}function _a({onClose:t,onCreate:e}){const[n,a]=g(""),[s,r]=g(""),[i,l]=g(""),[u,d]=g(!1);ee(t);const p=P(async o=>{if(o.preventDefault(),!!n.trim()){d(!0);try{const c=await dt("/projects",{name:n.trim(),customer:s||null,notes:i||null},"Failed to create project.");if(!(c!=null&&c.project))return;e(c.project),t()}finally{d(!1)}}},[n,s,i,e,t]);return pt`
    <div class="overlay" onClick=${Ge(t)}>
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
                value=${s}
                onInput=${o=>r(o.target.value)}
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
              <button type="submit" class="btn-primary" disabled=${u||!n.trim()}>
                ${u?"Creating…":"Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `}function va({unassignedJobs:t,onClose:e,onAdd:n}){const[a,s]=g("");ee(e);const r=W(()=>ia(t,a),[t,a]);return pt`
    <div class="overlay" onClick=${Ge(e)}>
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
            onInput=${i=>s(i.target.value)}
          />
          ${r.length===0?pt`<div class="empty" style="padding:16px 0">
                ${a?"No matches.":"All jobs are already assigned to projects."}
              </div>`:pt`<div class="add-jobs-list">
                ${r.map(i=>pt`
                    <div class="add-jobs-row" key=${i.id} onClick=${()=>n(i.id)}>
                      <${jt} url=${i.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${i.designTitle||"Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${et(i.startTime)} · ${i.deviceModel||"—"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `)}
              </div>`}
        </div>
      </div>
    </div>
  `}const yt=new Map;function $a(t,e){const[n,a]=g(()=>yt.get(t)??null);return O(()=>{if(a(yt.get(t)??null),!e){yt.delete(t),a(null);return}let s=!1;return st(`/projects/${t}/price`,"Failed to load project price.").then(r=>{!r||s||(yt.set(t,r),a(r))}),()=>{s=!0}},[t,e]),n}const G=M.bind(I);function ma({project:t,jobs:e,unassignedJobs:n,onBack:a,onJobClick:s,onAddJob:r,onRemoveJob:i,onProjectUpdated:l,onMoveJobToProject:u,onNavigateToProject:d}){const[p,o]=g(!1),[c,v]=g(!1),[m,b]=g(null),[_,f]=g(t.name??""),[$,h]=g(t.customer??""),[y,w]=g(t.notes??""),k=t.job_count??e.length,S=$a(t.id,k),D=da(e),J=ua(e),B=pa(e),ht=Ee(new Map),Dt=W(()=>{for(const T of e)T.final_price!=null&&ht.current.set(T.id,T.final_price);return e.map(T=>{if(T.final_price!=null)return T;const ie=ht.current.get(T.id);return ie==null?T:{...T,final_price:ie}})},[e]),Qe=P(T=>r(T),[r]),Ye=P(async()=>{const T=await Z(`/projects/${t.id}`,{name:_.trim(),customer:$.trim()||null,notes:y.trim()||null},"Failed to update project.");T!=null&&T.project&&(l(T.project),v(!1))},[$,_,y,l,t.id]);return G`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${a}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${t.name}</h2>
          ${t.customer&&G`<span class="customer-pill">${t.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${()=>v(T=>!T)}>
          ${c?"Cancel edit":"Edit project"}
        </button>
        <button class="btn-secondary" onClick=${()=>o(!0)}>+ Add Jobs</button>
      </div>
      ${c&&G`<div class="modal-form proj-detail-notes">
        <label>
          Project name
          <input
            value=${_}
            onInput=${T=>f(T.target.value)}
          />
        </label>
        <label>
          Customer
          <input
            value=${$}
            onInput=${T=>h(T.target.value)}
          />
        </label>
        <label>
          Notes
          <textarea
            value=${y}
            onInput=${T=>w(T.target.value)}
          />
        </label>
        <button class="btn-primary" disabled=${!_.trim()} onClick=${Ye}>
          Save project
        </button>
      </div>`}
      ${t.notes&&G`<div class="proj-detail-notes">${t.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Print runs: <strong>${k}</strong></span>
        <span>Plates: <strong>${B}</strong></span>
        <span>Filament: <strong>${Xt(D)}</strong></span>
        <span>Print time: <strong>${nt(J)}</strong></span>
        <${Xn} price=${S} />
      </div>
      <${Zn}
        jobs=${Dt}
        onJobClick=${s}
        onRemoveJob=${i}
        onMoveToNewProject=${b}
      />
      ${p&&G`<${va}
        unassignedJobs=${n}
        onClose=${()=>o(!1)}
        onAdd=${Qe}
      />`}
      ${m&&G`<${na}
        job=${m}
        initialName=${m.designTitle||""}
        onClose=${()=>b(null)}
        onProjectCreated=${l}
        onMoveJobToProject=${u}
        onNavigateToProject=${d}
      />`}
    </div>
  `}function fa({projects:t,setProjects:e,onAutoGroup:n,projectPrices:a,loading:s=!1}){const[r,i]=g(!1),[l,u]=g(!1),[d,p]=g(null),[o,c]=g(""),[,v]=Qt(),m=P(async()=>{u(!0);try{const f=await dt("/projects/auto-group",{},"Auto-group failed.");if(!f)return;const{projects_created:$,jobs_assigned:h}=f;await n(),ca($,h)}finally{u(!1)}},[n]),b=P(f=>{e($=>[f,...$]),v(`/projects/${f.id}`)},[e,v]),_=W(()=>ra(t,o),[t,o]);return G`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${o}
        onInput=${f=>c(f.target.value)}
      />
      <span class="proj-list-count">${oa(t,_,o)}</span>
      <button class="btn-secondary" onClick=${m} disabled=${l}>
        ${l?"Grouping…":"⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${()=>i(!0)}>+ New Project</button>
    </div>
    <${ta}
      loading=${s}
      filtered=${_}
      q=${o}
      projectPrices=${a}
      navigate=${v}
      onRename=${p}
    />
    ${r&&G`<${_a} onClose=${()=>i(!1)} onCreate=${b} />`}
    ${d&&G`<${sa}
      project=${d}
      onClose=${()=>p(null)}
      onRenamed=${f=>e($=>la($,f))}
    />`}
  `}const q=M.bind(I),ga=2e3;function ye(t,e,n){const a=e(n);return t.map(s=>e(s)===a?n:s)}function ha(t){return t==="saving"?"Saving…":t==="saved"?"✓ Saved":"Save"}function ba(t,e,n){return t===n?"saving":e===n?"saved":"idle"}function ya(t){const[e,n]=g(""),[a,s]=g(""),r=u=>{s(u),setTimeout(()=>s(""),ga)};return{runSave:async(u,d)=>{n(u);try{if(!await d())return;r(u),t()}finally{n("")}},getStateFor:u=>ba(e,a,u)}}function V({label:t,value:e,onChange:n,step:a="0.01",min:s="0"}){return q`
    <label class="form-label">
      ${t}
      <input
        type="number"
        class="form-input"
        step=${a}
        min=${s}
        value=${Number.isFinite(e)?e:0}
        onInput=${r=>n(Number(r.target.value||0))}
      />
    </label>
  `}function ne({state:t}){return q`<button type="submit" class="btn-primary" disabled=${t==="saving"}>
    ${ha(t)}
  </button>`}function rt({title:t,description:e,children:n}){return q`
    <section class="admin-section">
      <h3 class="admin-section-title">${t}</h3>
      <p class="admin-section-desc">${e}</p>
      ${n}
    </section>
  `}function wa({labor:t,saveState:e,onSave:n}){const[a,s]=g(t);return O(()=>s(t),[t]),q`
    <form class="admin-card" onSubmit=${r=>(r.preventDefault(),n(a))}>
      <div class="admin-card-fields">
        <${V}
          label="Hourly rate ($)"
          value=${a.hourly_rate}
          step="0.5"
          onChange=${r=>s({...a,hourly_rate:r})}
        />
        <${V}
          label="Minimum labor minutes"
          value=${a.minimum_minutes}
          step="1"
          onChange=${r=>s({...a,minimum_minutes:r})}
        />
        <${V}
          label="Profit markup (%)"
          value=${a.profit_markup_pct*100}
          step="1"
          onChange=${r=>s({...a,profit_markup_pct:r/100})}
        />
        <${V}
          label="Failure buffer (%)"
          value=${a.failure_buffer_pct*100}
          step="1"
          onChange=${r=>s({...a,failure_buffer_pct:r/100})}
        />
        <${V}
          label="Overhead buffer (%)"
          value=${a.overhead_buffer_pct*100}
          step="1"
          onChange=${r=>s({...a,overhead_buffer_pct:r/100})}
        />
      </div>
      <div class="admin-card-actions"><${ne} state=${e} /></div>
    </form>
  `}function Pa({machine:t,saveState:e,onSave:n}){const[a,s]=g(t);O(()=>s(t),[t]);const r=a.purchase_price/a.lifetime_hrs+a.electricity_rate+a.maintenance_buffer;return q`
    <form class="admin-card" onSubmit=${i=>(i.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.device_model}</div>
      <div class="admin-card-fields">
        <${V}
          label="Purchase price ($)"
          value=${a.purchase_price}
          step="1"
          onChange=${i=>s({...a,purchase_price:i})}
        />
        <${V}
          label="Lifetime (hours)"
          value=${a.lifetime_hrs}
          step="100"
          min="1"
          onChange=${i=>s({...a,lifetime_hrs:i})}
        />
        <${V}
          label="Electricity ($/hr)"
          value=${a.electricity_rate}
          step="0.01"
          onChange=${i=>s({...a,electricity_rate:i})}
        />
        <${V}
          label="Maintenance ($/hr)"
          value=${a.maintenance_buffer}
          step="0.01"
          onChange=${i=>s({...a,maintenance_buffer:i})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">
          Computed rate: <strong>${A(r)}</strong>/hr
        </div>
        <div class="admin-card-actions"><${ne} state=${e} /></div>
      </div>
    </form>
  `}function ka({material:t,saveState:e,onSave:n}){const[a,s]=g(t);O(()=>s(t),[t]);const r=a.cost_per_g*(1+a.waste_buffer_pct);return q`
    <form class="admin-card" onSubmit=${i=>(i.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.filament_type}</div>
      <div class="admin-card-fields">
        <${V}
          label="Cost per gram ($/g)"
          value=${a.cost_per_g}
          step="0.001"
          onChange=${i=>s({...a,cost_per_g:i})}
        />
        <${V}
          label="Waste buffer (%)"
          value=${a.waste_buffer_pct*100}
          step="1"
          onChange=${i=>s({...a,waste_buffer_pct:i/100})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">Computed rate: <strong>${A(r)}</strong>/g</div>
        <div class="admin-card-actions"><${ne} state=${e} /></div>
      </div>
    </form>
  `}function Ca({onRatesChanged:t=()=>{}}){const[e,n]=g(null),{runSave:a,getStateFor:s}=ya(t);O(()=>{st("/rates","Failed to load rates.").then(o=>{o&&n(o)})},[]);const r=async o=>{await a("labor",async()=>{const c=await Z("/rates/labor",o,"Failed to save labor rates."),v=c==null?void 0:c.labor_config;return v?(n(m=>m&&{...m,labor_config:v}),!0):!1})},i=async o=>{const{device_model:c,purchase_price:v,lifetime_hrs:m,electricity_rate:b,maintenance_buffer:_}=o;await a(c,async()=>{const f=await Z(`/rates/machines/${encodeURIComponent(c)}`,{purchase_price:v,lifetime_hrs:m,electricity_rate:b,maintenance_buffer:_},"Failed to save machine rate."),$=f==null?void 0:f.machine_rate;return $?(n(h=>h&&{...h,machine_rates:ye(h.machine_rates,y=>y.device_model,$)}),!0):!1})},l=async o=>{const{filament_type:c,cost_per_g:v,waste_buffer_pct:m}=o;await a(c,async()=>{const b=await Z(`/rates/materials/${encodeURIComponent(c)}`,{cost_per_g:v,waste_buffer_pct:m},"Failed to save material rate."),_=b==null?void 0:b.material_rate;return _?(n(f=>f&&{...f,material_rates:ye(f.material_rates,$=>$.filament_type,_)}),!0):!1})};if(!e)return q`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;const{labor_config:u,machine_rates:d,material_rates:p}=e;return q`
    <div class="admin-page">
      <h2 class="admin-title">Rates & Pricing</h2>

      <${rt}
        title="Labor"
        description="Applied once per job (or once per project for project pricing)."
      >
        <${wa}
          labor=${u}
          saveState=${s("labor")}
          onSave=${r}
        />
      </${rt}>

      <${rt}
        title="Machine Rates"
        description="Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance."
      >
        ${d.map(o=>q`
            <${Pa}
              key=${o.device_model}
              machine=${o}
              saveState=${s(o.device_model)}
              onSave=${i}
            />
          `)}
      </${rt}>

      <${rt}
        title="Material Rates"
        description="Cost per gram including waste. Rate = cost × (1 + waste fraction)."
      >
        ${p.map(o=>q`
            <${ka}
              key=${o.filament_type}
              material=${o}
              saveState=${s(o.filament_type)}
              onSave=${l}
            />
          `)}
      </${rt}>
    </div>
  `}const Y=M.bind(I);function K({label:t,value:e}){return Y`<div class="catalog-summary-pill">
    <strong>${e.toLocaleString()}</strong>${t}
  </div>`}function Sa({summary:t}){return t?Y`
    <div class="catalog-summary" role="status" aria-live="polite">
      <${K} label="scanned" value=${t.scanned} />
      <${K} label="added" value=${t.added} />
      <${K} label="changed" value=${t.changed} />
      <${K} label="unchanged" value=${t.unchanged} />
      <${K} label="missing" value=${t.missing} />
      <${K} label="restored" value=${t.restored} />
      <${K} label="skipped" value=${t.skipped} />
      <${K} label="failed" value=${t.failed} />
    </div>
  `:null}function Ta(){const[t,e]=g([]),[n,a]=g(""),[s,r]=g(""),[i,l]=g(!0),[u,d]=g(!1),[p,o]=g(null),c=async()=>{const _=await st("/catalog/roots","Failed to load roots.");_&&e(_.roots),l(!1)};O(()=>{c()},[]);const v=async _=>{_.preventDefault();const f=n.trim();if(!f)return;const $=s.trim()?{rootPath:f,name:s.trim()}:{rootPath:f},h=await dt("/catalog/roots",$,"Failed to add root.");h&&(e(y=>[...y,h.root]),a(""),r(""),R("Catalog root added.","success"))},m=async _=>{const f=await st(`/catalog/roots/${_}`,"Failed to remove root.",{method:"DELETE"});f&&e($=>$.map(h=>h.id===_?f.root:h))};return Y`
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
            onClick=${async()=>{d(!0);try{const _=await dt("/catalog/scan",{},"Catalog scan failed.",{timeoutMs:null});if(!_)return;o(_.summary),R("Catalog scan complete.",_.summary.failed>0?"info":"success"),await c()}finally{d(!1)}}}
            disabled=${u||t.every(_=>!_.is_active)}
          >
            ${u?"Scanning…":"Run scan"}
          </button>
        </div>
        <${Sa} summary=${p} />
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Scan roots</h3>
        <form class="admin-card catalog-root-form" onSubmit=${v}>
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
              onInput=${_=>r(_.target.value)}
            />
          </label>
          <button class="btn-primary" type="submit">Add root</button>
        </form>

        ${i?Y`<div class="empty">Loading scan roots…</div>`:t.length===0?Y`<div class="empty">No scan roots configured.</div>`:Y`<div class="catalog-root-list">
                ${t.map(_=>Y`<div class="admin-card catalog-root-card" key=${_.id}>
                      <div>
                        <div class="admin-card-name">${_.name}</div>
                        <div class="catalog-root-path">${_.root_path}</div>
                        <div class="catalog-root-meta">
                          ${_.is_active?"active":"inactive"}
                          ${_.last_scanned_at?` · scanned ${_.last_scanned_at}`:""}
                        </div>
                      </div>
                      ${_.is_active?Y`<button class="btn-ghost" onClick=${()=>m(_.id)}>
                            Deactivate
                          </button>`:null}
                    </div>`)}
              </div>`}
      </section>
    </main>
  `}const Fa=M.bind(I);function Na(t){return t==="green"?"product-sellability product-sellability--green":t==="yellow"?"product-sellability product-sellability--yellow":"product-sellability product-sellability--red"}function ae({level:t,label:e,readyToList:n}){return Fa`<span class=${Na(t)} title=${e}>
    <span class="product-sellability-dot" aria-hidden="true"></span>
    ${e}${n?" · ready":""}
  </span>`}const ot=M.bind(I),mt=[{id:"idea",label:"Idea"},{id:"downloaded_designed",label:"Downloaded / Designed"},{id:"test_print",label:"Test Print"},{id:"needs_tuning",label:"Needs Tuning"},{id:"ready_for_photos",label:"Ready for Photos"},{id:"listed",label:"Listed"},{id:"active",label:"Active"},{id:"selling_well",label:"Selling Well"},{id:"retired",label:"Retired"}],ze=[{id:"gaming",label:"Gaming"},{id:"workshop",label:"Workshop"},{id:"home_organization",label:"Home Organization"},{id:"decor",label:"Decor"},{id:"personalized",label:"Personalized"},{id:"seasonal",label:"Seasonal"},{id:"custom_repair_parts",label:"Custom / Repair Parts"}],se=[{id:"hive",label:"Hive"},{id:"original",label:"Original"},{id:"printables",label:"Printables"},{id:"makerworld",label:"MakerWorld"},{id:"thangs",label:"Thangs"},{id:"stlflix",label:"STLFlix"},{id:"custom_commission",label:"Custom Commission"}],Ke=[{id:"commercial_allowed",label:"Commercial Allowed"},{id:"personal_use_only",label:"Personal Use Only"},{id:"attribution_required",label:"Attribution Required"},{id:"hive_community",label:"Hive Community"},{id:"hive_plus",label:"Hive Plus"},{id:"original_owned",label:"Original / Owned"},{id:"unknown_verify",label:"Unknown / Verify"}],La=[{id:"none",label:"No restock"},{id:"normal",label:"Normal"},{id:"high",label:"High"},{id:"urgent",label:"Urgent"}];function Ia(t){return t===null?"No price":`$${t.toFixed(2)}`}function xa({product:t}){return t.main_photo_path?ot`<img
      class="product-card-photo"
      src=${t.main_photo_path}
      alt=""
      loading="lazy"
    />`:ot`<div class="product-card-photo product-card-photo--empty" aria-hidden="true">▧</div>`}function re({product:t,onOpen:e,onStatusChange:n}){const a=s=>s.stopPropagation();return ot`
    <article class="product-card" onClick=${()=>e(t)}>
      <${xa} product=${t} />
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
          <${ae}
            level=${t.can_sell_level}
            label=${t.can_sell_label}
            readyToList=${t.ready_to_list}
          />
          <span class="product-license-badge">${t.license_label||"License unknown"}</span>
        </div>
        <div class="product-card-footer">
          <strong>${Ia(t.target_sale_price)}</strong>
          ${n?ot`<label class="product-status-select" onClick=${a}>
                <span>Status</span>
                <select
                  value=${t.status_id}
                  onChange=${s=>{s.stopPropagation(),n(t,s.target.value)}}
                >
                  ${mt.map(s=>ot`<option key=${s.id} value=${s.id}>${s.label}</option>`)}
                </select>
              </label>`:ot`<span class="product-status-pill">${t.status_label}</span>`}
        </div>
      </div>
    </article>
  `}const tt=M.bind(I);function ja(t){return t===null?"":String(t/3600)}function we(t){return{name:t.name,categoryId:t.category_id??"",statusId:t.status_id,sourceId:t.source_id??"",licenseId:t.license_id??"",targetSalePrice:t.target_sale_price===null?"":String(t.target_sale_price),restockPriority:t.restock_priority,modelUrl:t.model_url??"",etsyListingUrl:t.etsy_listing_url??"",defaultMaterial:t.default_material??"",primaryColor:t.primary_color??"",accentColor:t.accent_color??"",preferredPrinterId:t.preferred_printer_id===null?"":String(t.preferred_printer_id),estimatedPrintTimeHours:ja(t.estimated_print_time_s),estimatedFilamentG:t.estimated_filament_g===null?"":String(t.estimated_filament_g),notes:t.notes??""}}function Vt(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isFinite(n)?n:null}function Ma(t){const e=Vt(t);return e===null?null:Math.round(e*3600)}function Da(t){const e=t.trim();if(!e)return null;const n=Number(e);return Number.isInteger(n)&&n>0?n:null}function ut(t,e){return[...e?[tt`<option value="">${e}</option>`]:[],...t.map(a=>tt`<option key=${a.id} value=${a.id}>${a.label}</option>`)]}function Ja({product:t}){return t.main_photo_path?tt`<img class="product-detail-photo" src=${t.main_photo_path} alt="" />`:tt`<div class="product-detail-photo product-detail-photo--empty">No product photo</div>`}function Ea({product:t}){const e=[t.primary_color,t.accent_color].filter(Boolean).join(" / ");return tt`<div class="product-detail-facts">
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
    <div><span>Material</span><strong>${t.default_material||"Not set"}</strong></div>
    <div><span>Colors</span><strong>${e||"Not set"}</strong></div>
    <div>
      <span>Printer</span
      ><strong
        >${t.preferred_printer_id===null?"Not set":`#${t.preferred_printer_id}`}</strong
      >
    </div>
  </div>`}function Aa({productId:t,navigate:e}){const[n,a]=g(null),[s,r]=g(null),[i,l]=g(!0),[u,d]=g(!1);O(()=>{let c=!1;return wn(t).then(v=>{c||(a(v),r(we(v)))}).catch(v=>{R(v instanceof Error?v.message:"Failed to load product.","error")}).finally(()=>{c||l(!1)}),()=>{c=!0}},[t]);const p=(c,v)=>{r(m=>m&&{...m,[c]:v})},o=async c=>{if(c.preventDefault(),!s||!n)return;const v={name:s.name,category_id:s.categoryId||null,status_id:s.statusId,source_id:s.sourceId||null,license_id:s.licenseId||null,target_sale_price:Vt(s.targetSalePrice),restock_priority:s.restockPriority,model_url:s.modelUrl.trim()||null,etsy_listing_url:s.etsyListingUrl.trim()||null,default_material:s.defaultMaterial.trim()||null,primary_color:s.primaryColor.trim()||null,accent_color:s.accentColor.trim()||null,preferred_printer_id:Da(s.preferredPrinterId),estimated_print_time_s:Ma(s.estimatedPrintTimeHours),estimated_filament_g:Vt(s.estimatedFilamentG),notes:s.notes.trim()||null};d(!0);try{const m=await te(n.id,v);if(!m)return;a(m),r(we(m)),R("Product updated.","success")}finally{d(!1)}};return i?tt`<div class="empty">Loading product…</div>`:!n||!s?tt`<div class="empty">Product not found.</div>`:tt`<main class="product-detail-page">
    <div class="product-detail-header">
      <button class="btn-back" onClick=${()=>e("/products")}>← Products</button>
      <div>
        <p class="products-kicker">Product detail</p>
        <h2>${n.name}</h2>
      </div>
      <${ae}
        level=${n.can_sell_level}
        label=${n.can_sell_label}
        readyToList=${n.ready_to_list}
      />
    </div>

    <section class="product-detail-layout">
      <aside class="product-detail-card">
        <${Ja} product=${n} />
        <${Ea} product=${n} />
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
                onInput=${c=>p("name",c.target.value)}
              />
            </label>
            <label class="form-label">
              Status
              <select
                class="form-input"
                value=${s.statusId}
                onChange=${c=>p("statusId",c.target.value)}
              >
                ${ut(mt)}
              </select>
            </label>
            <label class="form-label">
              Category
              <select
                class="form-input"
                value=${s.categoryId}
                onChange=${c=>p("categoryId",c.target.value)}
              >
                ${ut(ze,"Uncategorized")}
              </select>
            </label>
            <label class="form-label">
              Source
              <select
                class="form-input"
                value=${s.sourceId}
                onChange=${c=>p("sourceId",c.target.value)}
              >
                ${ut(se,"Source TBD")}
              </select>
            </label>
            <label class="form-label">
              License
              <select
                class="form-input"
                value=${s.licenseId}
                onChange=${c=>p("licenseId",c.target.value)}
              >
                ${ut(Ke,"Verify license")}
              </select>
            </label>
            <label class="form-label">
              Target price
              <input
                class="form-input"
                inputmode="decimal"
                placeholder="18.00"
                value=${s.targetSalePrice}
                onInput=${c=>p("targetSalePrice",c.target.value)}
              />
            </label>
            <label class="form-label">
              Restock priority
              <select
                class="form-input"
                value=${s.restockPriority}
                onChange=${c=>p("restockPriority",c.target.value)}
              >
                ${ut(La)}
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
                onInput=${c=>p("modelUrl",c.target.value)}
              />
            </label>
            <label class="form-label">
              Etsy listing URL
              <input
                class="form-input"
                value=${s.etsyListingUrl}
                placeholder="https://…"
                onInput=${c=>p("etsyListingUrl",c.target.value)}
              />
            </label>
            <label class="form-label">
              Default material
              <input
                class="form-input"
                value=${s.defaultMaterial}
                placeholder="PLA"
                onInput=${c=>p("defaultMaterial",c.target.value)}
              />
            </label>
            <label class="form-label">
              Primary color
              <input
                class="form-input"
                value=${s.primaryColor}
                placeholder="#ffffff or White"
                onInput=${c=>p("primaryColor",c.target.value)}
              />
            </label>
            <label class="form-label">
              Accent color
              <input
                class="form-input"
                value=${s.accentColor}
                placeholder="#000000 or Black"
                onInput=${c=>p("accentColor",c.target.value)}
              />
            </label>
            <label class="form-label">
              Preferred printer ID
              <input
                class="form-input"
                inputmode="numeric"
                value=${s.preferredPrinterId}
                placeholder="1"
                onInput=${c=>p("preferredPrinterId",c.target.value)}
              />
            </label>
            <label class="form-label">
              Estimated print time (hours)
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.estimatedPrintTimeHours}
                placeholder="4.5"
                onInput=${c=>p("estimatedPrintTimeHours",c.target.value)}
              />
            </label>
            <label class="form-label">
              Estimated filament (g)
              <input
                class="form-input"
                inputmode="decimal"
                value=${s.estimatedFilamentG}
                placeholder="120"
                onInput=${c=>p("estimatedFilamentG",c.target.value)}
              />
            </label>
          </div>
          <label class="form-label product-notes-field">
            Notes
            <textarea
              class="form-input form-textarea"
              value=${s.notes}
              placeholder="Tuning notes, photo needs, listing copy reminders…"
              onInput=${c=>p("notes",c.target.value)}
            ></textarea>
          </label>
        </section>

        <div class="form-actions">
          <button class="btn-secondary" type="button" onClick=${()=>e("/products")}>
            Cancel
          </button>
          <button class="btn-primary" type="submit" disabled=${u||!s.name.trim()}>
            ${u?"Saving…":"Save Product"}
          </button>
        </div>
      </form>
    </section>
  </main>`}const it=M.bind(I),Pe={urgent:0,high:1,normal:2,none:3};function ke(t){return[...t].sort((e,n)=>{const a=(Pe[e.restock_priority]??9)-(Pe[n.restock_priority]??9);return a!==0?a:e.name.localeCompare(n.name)})}function Ua({products:t}){const e=t.filter(s=>s.restock_priority==="urgent").length,n=t.filter(s=>s.restock_priority==="high").length,a=t.filter(s=>s.ready_to_list).length;return it`<div class="product-print-next-summary">
    <div><strong>${t.length}</strong><span>queued</span></div>
    <div><strong>${e}</strong><span>urgent</span></div>
    <div><strong>${n}</strong><span>high</span></div>
    <div><strong>${a}</strong><span>ready to list</span></div>
  </div>`}function Ra({navigate:t}){const[e,n]=g([]),[a,s]=g(!0);O(()=>{let i=!1;return Pn().then(l=>{i||n(ke(l))}).catch(l=>{R(l instanceof Error?l.message:"Failed to load print-next products.","error")}).finally(()=>{i||s(!1)}),()=>{i=!0}},[]);const r=async(i,l)=>{if(l===i.status_id)return;const u=await te(i.id,{status_id:l});u&&(n(d=>ke(d.map(p=>p.id===u.id?u:p).filter(p=>["active","selling_well"].includes(p.status_id)))),R("Product status updated.","success"))};return it`<main class="products-page">
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

    ${a?it`<div class="empty">Loading print queue…</div>`:e.length===0?it`<div class="empty">No active products need restocking.</div>`:it`
            <${Ua} products=${e} />
            <div class="product-print-next-grid">
              ${e.map(i=>it`<article class="product-print-next-card" key=${i.id}>
                    <div class="product-print-next-topline">
                      <span
                        class=${"product-priority product-priority--"+i.restock_priority}
                      >
                        ${i.restock_priority}
                      </span>
                      <${ae}
                        level=${i.can_sell_level}
                        label=${i.can_sell_label}
                        readyToList=${i.ready_to_list}
                      />
                    </div>
                    <${re}
                      product=${i}
                      onOpen=${()=>t(`/products/${i.id}`)}
                      onStatusChange=${r}
                    />
                  </article>`)}
            </div>
          `}
  </main>`}const N=M.bind(I),Oa=[{id:"",label:"All sellability"},{id:"green",label:"Green"},{id:"yellow",label:"Yellow"},{id:"red",label:"Red"}];function Ha(t){const e=new Map;for(const r of t){const i=e.get(r.status_id)??[];i.push(r),e.set(r.status_id,i)}const n=mt.map(r=>({statusId:r.id,statusLabel:r.label,products:e.get(r.id)??[]})),a=new Set(mt.map(r=>r.id)),s=[...e.entries()].filter(([r])=>!a.has(r)).map(([r,i])=>{var l;return{statusId:r,statusLabel:((l=i[0])==null?void 0:l.status_label)??r,products:i}});return[...n,...s]}function Ba(t,e){const n=e.q.trim().toLowerCase();return!(n&&![t.name,t.category_label,t.status_label,t.source_label,t.license_label].filter(Boolean).join(" ").toLowerCase().includes(n)||e.categoryId&&t.category_id!==e.categoryId||e.statusId&&t.status_id!==e.statusId||e.sourceId&&t.source_id!==e.sourceId||e.sellability&&t.can_sell_level!==e.sellability)}function Wa({mode:t,navigate:e}){const n=a=>"product-tab"+(a?" active":"");return N`<div class="product-tabs" aria-label="Product views">
    <button class=${n(t==="pipeline")} onClick=${()=>e("/products/pipeline")}>
      Pipeline
    </button>
    <button class=${n(t==="catalog")} onClick=${()=>e("/products")}>
      Catalog
    </button>
    <button class="product-tab" onClick=${()=>e("/products/print-next")}>
      Print Next
    </button>
  </div>`}function Va({filters:t,setFilters:e,count:n,total:a,showStatusFilter:s}){const r=(i,l)=>e({...t,[i]:l});return N`<div class="product-toolbar">
    <input
      type="search"
      placeholder="Search products…"
      value=${t.q}
      onInput=${i=>r("q",i.target.value)}
    />
    <select
      value=${t.categoryId}
      onChange=${i=>r("categoryId",i.target.value)}
    >
      <option value="">All categories</option>
      ${ze.map(i=>N`<option key=${i.id} value=${i.id}>${i.label}</option>`)}
    </select>
    ${s?N`<select
          value=${t.statusId}
          onChange=${i=>r("statusId",i.target.value)}
        >
          <option value="">All statuses</option>
          ${mt.map(i=>N`<option key=${i.id} value=${i.id}>${i.label}</option>`)}
        </select>`:null}
    <select
      value=${t.sourceId}
      onChange=${i=>r("sourceId",i.target.value)}
    >
      <option value="">All sources</option>
      ${se.map(i=>N`<option key=${i.id} value=${i.id}>${i.label}</option>`)}
    </select>
    <select
      value=${t.sellability}
      onChange=${i=>r("sellability",i.target.value)}
    >
      ${Oa.map(i=>N`<option key=${i.id} value=${i.id}>${i.label}</option>`)}
    </select>
    <span class="product-count"
      >${n.toLocaleString()} of ${a.toLocaleString()} products</span
    >
  </div>`}function qa({onCreated:t}){const[e,n]=g(""),[a,s]=g("unknown_verify"),[r,i]=g(""),[l,u]=g(!1);return N`<form class="product-create-card" onSubmit=${async p=>{p.preventDefault();const o=e.trim();if(o){u(!0);try{const c=await kn({name:o,status_id:"idea",license_id:a,source_id:r||null});if(!c)return;t(c),n(""),s("unknown_verify"),i(""),R("Product created.","success")}finally{u(!1)}}}}>
    <input
      class="form-input"
      placeholder="New product idea…"
      value=${e}
      onInput=${p=>n(p.target.value)}
    />
    <select
      class="form-input"
      value=${r}
      onChange=${p=>i(p.target.value)}
    >
      <option value="">Source TBD</option>
      ${se.map(p=>N`<option key=${p.id} value=${p.id}>${p.label}</option>`)}
    </select>
    <select
      class="form-input"
      value=${a}
      onChange=${p=>s(p.target.value)}
    >
      ${Ke.map(p=>N`<option key=${p.id} value=${p.id}>${p.label}</option>`)}
    </select>
    <button class="btn-primary" type="submit" disabled=${l||!e.trim()}>
      ${l?"Adding…":"Add Product"}
    </button>
  </form>`}function Ga({products:t,navigate:e,onStatusChange:n}){return t.length?N`<div class="product-grid">
    ${t.map(a=>N`<${re}
          key=${a.id}
          product=${a}
          onOpen=${()=>e(`/products/${a.id}`)}
          onStatusChange=${n}
        />`)}
  </div>`:N`<div class="empty">No products match your filters.</div>`}function za({columns:t,navigate:e,onStatusChange:n}){return N`<div class="product-kanban" role="list">
    ${t.map(a=>N`<section class="product-kanban-column" key=${a.statusId} role="listitem">
          <div class="product-kanban-header">
            <h3>${a.statusLabel}</h3>
            <span>${a.products.length}</span>
          </div>
          <div class="product-kanban-cards">
            ${a.products.length?a.products.map(s=>N`<${re}
                      key=${s.id}
                      product=${s}
                      onOpen=${()=>e(`/products/${s.id}`)}
                      onStatusChange=${n}
                    />`):N`<div class="product-column-empty">No products</div>`}
          </div>
        </section>`)}
  </div>`}function Ka({mode:t,navigate:e}){const[n,a]=g([]),[s,r]=g(!0),[i,l]=g({q:"",categoryId:"",statusId:"",sourceId:"",sellability:""});O(()=>{let o=!1;return yn().then(c=>{o||a(c)}).catch(c=>{R(c instanceof Error?c.message:"Failed to load products.","error")}).finally(()=>{o||r(!1)}),()=>{o=!0}},[]);const u=W(()=>n.filter(o=>Ba(o,i)),[n,i]),d=W(()=>Ha(u),[u]),p=async(o,c)=>{if(c===o.status_id)return;const v=await te(o.id,{status_id:c});v&&(a(m=>m.map(b=>b.id===v.id?v:b)),R("Product status updated.","success"))};return N`<main class="products-page">
    <section class="products-hero">
      <div>
        <p class="products-kicker">Product workflow</p>
        <h2>${t==="pipeline"?"Product Pipeline":"Product Catalog"}</h2>
        <p>
          Card-based product tracking for sellability, listing readiness, and what to print next.
        </p>
      </div>
      <${Wa} mode=${t} navigate=${e} />
    </section>

    <${Va}
      filters=${i}
      setFilters=${l}
      count=${u.length}
      total=${n.length}
      showStatusFilter=${t==="catalog"}
    />

    ${t==="catalog"?N`<section class="product-create-section">
          <${qa}
            onCreated=${o=>a(c=>[o,...c])}
          />
        </section>`:null}
    ${s?N`<div class="empty">Loading products…</div>`:t==="pipeline"?N`<${za}
            columns=${d}
            navigate=${e}
            onStatusChange=${p}
          />`:N`<${Ga}
            products=${u}
            navigate=${e}
            onStatusChange=${p}
          />`}
  </main>`}const E=M.bind(I);function Qa({bootStatus:t,loadProgress:e}){return E` <div class="in-app-loading" role="status" aria-live="polite">
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
  </div>`}function Ya({error:t}){return E`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${t}</p>
      </div>
    </div>
  </div>`}function Xa({projectId:t,projects:e,jobs:n,projectsLoading:a,navigate:s,setSelectedJob:r,handleJobProjectChange:i,setProjects:l}){const u=e.find(o=>Number(o.id)===t),d=n.filter(o=>Number(o.project_id)===t);if(!u)return a?E`<div class="empty">Loading projects…</div>`:E`<div class="empty">Project not found.</div>`;const p=n.filter(o=>o.project_id==null);return E`<${ma}
    project=${u}
    jobs=${d}
    unassignedJobs=${p}
    onBack=${()=>s("/projects")}
    onJobClick=${r}
    onAddJob=${o=>i(o,t)}
    onRemoveJob=${o=>i(o,null)}
    onProjectUpdated=${o=>l(c=>c.some(v=>v.id===o.id)?c.map(v=>v.id===o.id?o:v):[o,...c])}
    onMoveJobToProject=${(o,c)=>i(o,c)}
    onNavigateToProject=${o=>s(`/projects/${o}`)}
  />`}function Za({sorted:t,view:e,sortCol:n,sortDir:a,onSort:s,onJobClick:r,density:i}){return t.length===0?E`<div class="empty">No jobs match your filters.</div>`:e==="table"?E`<${Wn}
      sorted=${t}
      sortCol=${n}
      sortDir=${a}
      onSort=${s}
      onJobClick=${r}
      density=${i}
    />`:E`<${qn} sorted=${t} onJobClick=${r} density=${i} />`}function ts({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:s,setDeviceFilter:r,devices:i,view:l,setView:u,filtered:d,jobs:p,isFiltered:o,sorted:c,sortCol:v,sortDir:m,onSort:b,onJobClick:_,density:f,setDensity:$}){return E`
    <${Rn}
      q=${t}
      setQ=${e}
      statusFilter=${n}
      setStatusFilter=${a}
      deviceFilter=${s}
      setDeviceFilter=${r}
      devices=${i}
      view=${l}
      setView=${u}
      density=${f}
      setDensity=${$}
      filteredCount=${d.length}
      totalCount=${p.length}
    />
    <${On} filtered=${d} isFiltered=${o} />
    ${Za({sorted:c,view:l,sortCol:v,sortDir:m,onSort:b,onJobClick:_,density:f})}
  `}function es(t){const e=t.match(/^\/projects\/(\d+)$/),n=t.match(/^\/products\/(\d+)$/);return{isAdmin:t.startsWith("/admin"),isPrinters:t.startsWith("/printers"),isProjects:t.startsWith("/projects"),isCatalog:t.startsWith("/catalog"),isProducts:t.startsWith("/products"),isProductPipeline:t==="/products/pipeline",isProductPrintNext:t==="/products/print-next",projectId:e?Number(e[1]):null,productId:n?Number(n[1]):null}}function ns({route:t,summary:e,projects:n,setProjects:a,jobs:s,projectsLoading:r,navigate:i,setSelectedJob:l,handleJobProjectChange:u,handleRatesChanged:d,handleAutoGroup:p,projectPrices:o,q:c,setQ:v,statusFilter:m,setStatusFilter:b,deviceFilter:_,setDeviceFilter:f,devices:$,view:h,setView:y,filtered:w,isFiltered:k,sorted:S,sortCol:D,sortDir:J,density:B,setDensity:ht,handleSort:Dt}){return t.isAdmin?E`<${Ca} onRatesChanged=${d} />`:t.productId!=null?E`<${Aa} productId=${t.productId} navigate=${i} />`:t.isProductPrintNext?E`<${Ra} navigate=${i} />`:t.isProducts?E`<${Ka}
      mode=${t.isProductPipeline?"pipeline":"catalog"}
      navigate=${i}
    />`:t.isCatalog?E`<${Ta} />`:t.isPrinters?E`<${Ln}
      summary=${e}
      jobs=${s}
      onJobClick=${l}
    />`:t.projectId!=null?E`<${Xa}
      projectId=${t.projectId}
      projects=${n}
      jobs=${s}
      projectsLoading=${r}
      navigate=${i}
      setSelectedJob=${l}
      handleJobProjectChange=${u}
      setProjects=${a}
    />`:t.isProjects?E`<${fa}
      projects=${n}
      setProjects=${a}
      onAutoGroup=${p}
      projectPrices=${o}
      loading=${r}
    />`:E`<${ts}
    q=${c}
    setQ=${v}
    statusFilter=${m}
    setStatusFilter=${b}
    deviceFilter=${_}
    setDeviceFilter=${f}
    devices=${$}
    view=${h}
    setView=${y}
    filtered=${w}
    jobs=${s}
    isFiltered=${k}
    sorted=${S}
    sortCol=${D}
    sortDir=${J}
    onSort=${Dt}
    onJobClick=${l}
    density=${B}
    setDensity=${ht}
  />`}function as({setJobs:t,setProjects:e,setProjectPrices:n,setSummary:a,setDataRange:s,toast:r}){const[i,l]=g(!0),[u,d]=g(!0),[p,o]=g(0),[c,v]=g(null),[m,b]=g("Starting dashboard…"),_=P(async({url:h,fallback:y,onData:w,onFinally:k})=>{const{data:S,error:D}=await Zt(h,y);D&&r(D.message||y,"error"),S&&w(S),k&&k()},[r]),f=P(()=>{_({url:"/projects",fallback:"Failed to load projects.",onData:h=>h.projects&&e(h.projects),onFinally:()=>d(!1)}),_({url:"/projects/prices",fallback:"Failed to load project prices.",onData:h=>h.prices&&n(h.prices)})},[_,e,n]),$=P((h=!1)=>{_({url:"/jobs/prices",fallback:h?"Failed to refresh job prices.":"Failed to load job prices.",onData:w=>{w!=null&&w.prices&&t(k=>k.map(S=>{var D;return{...S,final_price:((D=w.prices)==null?void 0:D[S.id])??(h?S.final_price:null)??null}}))}})},[_,t]);return O(()=>{const h=()=>o(k=>Math.min(100,k+100/fn)),y=(k,S,D)=>(b(`Loading ${k}…`),X(k,S).catch(J=>{const B=J instanceof Error?J.message:S;throw new Error(`Initial dashboard load failed (${D}): ${B}`)}).finally(h)),w=setTimeout(()=>{v("Dashboard load timed out. Check console/network for the failing request."),l(!1),d(!1)},mn);return Promise.all([y("/ui/data","Failed to load jobs.","jobs"),y("/summary","Failed to load summary.","summary"),y("/health/data-range","Failed to load print history range.","history range")]).then(([k,S,D])=>{t(k.jobs),a(S),s(D),l(!1),b("Loading optional data…"),$(!1),f()}).catch(k=>{v(k.message),l(!1),d(!1)}).finally(()=>clearTimeout(w)),()=>clearTimeout(w)},[t,a,s,$,f]),{loading:i,projectsLoading:u,loadProgress:p,error:c,bootStatus:m,refreshProjectsAndPrices:f,refreshJobPrices:$}}function ss(t,e,n,a){return t.filter(s=>{const r=`${s.designTitle||""} ${s.customer||""}`.toLowerCase();return!(e&&!r.includes(e.toLowerCase())||n&&(s.status||"").toLowerCase()!==n||a&&s.deviceModel!==a)})}function rs(t,e,n){return[...t].sort((a,s)=>{let r=a[e],i=s[e];if(r==null&&(r=n==="asc"?1/0:-1/0),i==null&&(i=n==="asc"?1/0:-1/0),typeof r=="string"){const d=typeof i=="string"?i:String(i);return n==="asc"?r.localeCompare(d):d.localeCompare(r)}const l=Number(r),u=Number(i);return n==="asc"?l-u:u-l})}const vt=M.bind(I);function is(){const[t,e]=g([]),[n,a]=g([]),[s,r]=g({}),[i,l]=g(null),[u,d]=g(null),[p,o]=g("table"),[c,v]=g("comfy"),[m,b]=g(""),[_,f]=g(""),[$,h]=g(""),[y,w]=g("startTime"),[k,S]=g("desc"),[D,J]=g(null);return{jobs:t,setJobs:e,projects:n,setProjects:a,projectPrices:s,setProjectPrices:r,summary:i,setSummary:l,dataRange:u,setDataRange:d,view:p,setView:o,density:c,setDensity:v,q:m,setQ:b,statusFilter:_,setStatusFilter:f,deviceFilter:$,setDeviceFilter:h,sortCol:y,setSortCol:w,sortDir:k,setSortDir:S,selectedJob:D,setSelectedJob:J}}function os({jobs:t,q:e,statusFilter:n,deviceFilter:a,sortCol:s,sortDir:r,setSortCol:i,setSortDir:l,loc:u}){const d=W(()=>[...new Set(t.map(b=>b.deviceModel).filter(b=>!!b))].sort(),[t]),p=!!(e||n||a),o=W(()=>ss(t,e,n,a),[t,e,n,a]),c=W(()=>rs(o,s,r),[o,s,r]),v=P(b=>{if(s===b){l(_=>_==="asc"?"desc":"asc");return}i(b),l(()=>b==="startTime"?"desc":"asc")},[s,i,l]),m=W(()=>es(u),[u]);return{devices:d,isFiltered:p,filtered:o,sorted:c,handleSort:v,route:m}}function ls({setJobs:t,setProjects:e,setSummary:n,setSelectedJob:a,navigate:s,refreshProjectsAndPrices:r,refreshJobPrices:i}){const l=P(($,h)=>{t(y=>y.map(w=>w.id===$?{...w,...h}:w)),a(y=>y&&y.id===$?{...y,...h}:y)},[]),u=P(async($,h)=>{const y=await Z(`/jobs/${$}`,h,"Failed to update job.");if(!(y!=null&&y.job))return null;const{job:w}=y;return l($,w),w},[l]),d=P(($,h)=>{u($,h)},[u]),p=P(async($,h)=>{await u($,{project_id:h})&&r()},[u,r]),o=P(($,h)=>{d($,{status_override:h})},[d]),c=P(($,h)=>{d($,{extra_labor_minutes:h})},[d]),v=P($=>{a(null),s(`/projects/${$}`)},[s]),m=P(()=>{i(!0),r()},[i,r]),b=P(async()=>{m();try{const $=await X("/summary","Failed to refresh summary.");n($),R("Pricing refreshed from updated rates.","success")}catch($){const h=$ instanceof Error?$.message:"Updated rates saved, but summary refresh failed.";R(h,"error")}},[m,n]),_=P(async()=>{const[$,h]=await Promise.all([X("/ui/data","Failed to refresh jobs."),X("/projects","Failed to refresh projects.")]);t(()=>$.jobs),e(h.projects),m()},[m,e]);return{closeModal:P(()=>a(null),[]),patchJob:u,handleJobProjectChange:p,handleJobStatusChange:o,handleJobExtraLaborChange:c,handleNavigateToProject:v,handleRatesChanged:b,handleAutoGroup:_}}function cs({selectedJob:t,closeModal:e,patchJob:n,projects:a,handleJobProjectChange:s,handleJobStatusChange:r,handleJobExtraLaborChange:i,handleNavigateToProject:l}){return t?vt`<${Qn}
    key=${t.id}
    job=${t}
    onClose=${e}
    onPatch=${n}
    projects=${a}
    onJobProjectChange=${s}
    onJobStatusChange=${r}
    onJobExtraLaborChange=${i}
    onNavigateToProject=${l}
  />`:null}function ds(t){const e=P(s=>t.setProjects(s),[t.setProjects]),n=P(s=>t.setSummary(s),[t.setSummary]),a=P(s=>t.setDataRange(s),[t.setDataRange]);return as({setJobs:t.setJobs,setProjects:e,setProjectPrices:t.setProjectPrices,setSummary:n,setDataRange:a,toast:R})}function us(){const t=is(),[e,n]=Qt(),{loading:a,projectsLoading:s,loadProgress:r,error:i,bootStatus:l,refreshProjectsAndPrices:u,refreshJobPrices:d}=ds(t),{devices:p,isFiltered:o,filtered:c,sorted:v,handleSort:m,route:b}=os({jobs:t.jobs,q:t.q,statusFilter:t.statusFilter,deviceFilter:t.deviceFilter,sortCol:t.sortCol,sortDir:t.sortDir,setSortCol:t.setSortCol,setSortDir:t.setSortDir,loc:e}),{closeModal:_,patchJob:f,handleJobProjectChange:$,handleJobStatusChange:h,handleJobExtraLaborChange:y,handleNavigateToProject:w,handleRatesChanged:k,handleAutoGroup:S}=ls({setJobs:t.setJobs,setProjects:t.setProjects,setSummary:t.setSummary,setSelectedJob:t.setSelectedJob,navigate:n,refreshProjectsAndPrices:u,refreshJobPrices:d});return a?vt`<${Qa} bootStatus=${l} loadProgress=${r} />`:i?vt`<${Ya} error=${i} />`:vt`
    <${Un} summary=${t.summary} dataRange=${t.dataRange} />
    ${ns({route:b,summary:t.summary,projects:t.projects,setProjects:t.setProjects,jobs:t.jobs,projectsLoading:s,navigate:n,setSelectedJob:t.setSelectedJob,handleJobProjectChange:$,handleRatesChanged:k,handleAutoGroup:S,projectPrices:t.projectPrices,q:t.q,setQ:t.setQ,statusFilter:t.statusFilter,setStatusFilter:t.setStatusFilter,deviceFilter:t.deviceFilter,setDeviceFilter:t.setDeviceFilter,devices:p,view:t.view,setView:t.setView,density:t.density,setDensity:t.setDensity,filtered:c,isFiltered:o,sorted:v,sortCol:t.sortCol,sortDir:t.sortDir,handleSort:m})}
    <${cs}
      selectedJob=${t.selectedJob}
      closeModal=${_}
      patchJob=${f}
      projects=${t.projects}
      handleJobProjectChange=${$}
      handleJobStatusChange=${h}
      handleJobExtraLaborChange=${y}
      handleNavigateToProject=${w}
    />
    <${vn} />
  `}const ps=vt`<${he} base="/ui"><${us} /></${he}>`;sn(ps,document.getElementById("app"));
