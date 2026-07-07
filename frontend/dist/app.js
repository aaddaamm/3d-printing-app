(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();var Ct,P,ue,Q,zt,pe,_e,Nt,ft,ot,ve,Ut,Mt,xt,$e,bt={},yt=[],Ee=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,kt=Array.isArray;function q(t,e){for(var n in e)t[n]=e[n];return t}function It(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function E(t,e,n){var a,r,s,o={};for(s in e)s=="key"?a=e[s]:s=="ref"?r=e[s]:o[s]=e[s];if(arguments.length>2&&(o.children=arguments.length>3?Ct.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(s in t.defaultProps)o[s]===void 0&&(o[s]=t.defaultProps[s]);return mt(t,o,a,r,null)}function mt(t,e,n,a,r){var s={type:t,props:e,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r??++ue,__i:-1,__u:0};return r==null&&P.vnode!=null&&P.vnode(s),s}function Pt(t){return t.children}function ht(t,e){this.props=t,this.context=e}function at(t,e){if(e==null)return t.__?at(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?at(t):null}function Ae(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,a=[],r=[],s=q({},e);s.__v=e.__v+1,P.vnode&&P.vnode(s),Bt(t.__P,s,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,a,n??at(e),!!(32&e.__u),r),s.__v=e.__v,s.__.__k[s.__i]=s,ge(a,s,r),e.__e=e.__=null,s.__e!=n&&fe(s)}}function fe(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),fe(t)}function Dt(t){(!t.__d&&(t.__d=!0)&&Q.push(t)&&!wt.__r++||zt!=P.debounceRendering)&&((zt=P.debounceRendering)||pe)(wt)}function wt(){try{for(var t,e=1;Q.length;)Q.length>e&&Q.sort(_e),t=Q.shift(),e=Q.length,Ae(t)}finally{Q.length=wt.__r=0}}function me(t,e,n,a,r,s,o,l,d,c,_){var i,p,v,m,b,u,f,$=a&&a.__k||yt,h=e.length;for(d=Re(n,e,$,d,h),i=0;i<h;i++)(v=n.__k[i])!=null&&(p=v.__i!=-1&&$[v.__i]||bt,v.__i=i,u=Bt(t,v,p,r,s,o,l,d,c,_),m=v.__e,v.ref&&p.ref!=v.ref&&(p.ref&&Ht(p.ref,null,v),_.push(v.ref,v.__c||m,v)),b==null&&m!=null&&(b=m),(f=!!(4&v.__u))||p.__k===v.__k?(d=he(v,d,t,f),f&&p.__e&&(p.__e=null)):typeof v.type=="function"&&u!==void 0?d=u:m&&(d=m.nextSibling),v.__u&=-7);return n.__e=b,d}function Re(t,e,n,a,r){var s,o,l,d,c,_=n.length,i=_,p=0;for(t.__k=new Array(r),s=0;s<r;s++)(o=e[s])!=null&&typeof o!="boolean"&&typeof o!="function"?(typeof o=="string"||typeof o=="number"||typeof o=="bigint"||o.constructor==String?o=t.__k[s]=mt(null,o,null,null,null):kt(o)?o=t.__k[s]=mt(Pt,{children:o},null,null,null):o.constructor===void 0&&o.__b>0?o=t.__k[s]=mt(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):t.__k[s]=o,d=s+p,o.__=t,o.__b=t.__b+1,l=null,(c=o.__i=Ue(o,n,d,i))!=-1&&(i--,(l=n[c])&&(l.__u|=2)),l==null||l.__v==null?(c==-1&&(r>_?p--:r<_&&p++),typeof o.type!="function"&&(o.__u|=4)):c!=d&&(c==d-1?p--:c==d+1?p++:(c>d?p--:p++,o.__u|=4))):t.__k[s]=null;if(i)for(s=0;s<_;s++)(l=n[s])!=null&&(2&l.__u)==0&&(l.__e==a&&(a=at(l)),ye(l,l));return a}function he(t,e,n,a){var r,s;if(typeof t.type=="function"){for(r=t.__k,s=0;r&&s<r.length;s++)r[s]&&(r[s].__=t,e=he(r[s],e,n,a));return e}t.__e!=e&&(a&&(e&&t.type&&!e.parentNode&&(e=at(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Ue(t,e,n,a){var r,s,o,l=t.key,d=t.type,c=e[n],_=c!=null&&(2&c.__u)==0;if(c===null&&l==null||_&&l==c.key&&d==c.type)return n;if(a>(_?1:0)){for(r=n-1,s=n+1;r>=0||s<e.length;)if((c=e[o=r>=0?r--:s++])!=null&&(2&c.__u)==0&&l==c.key&&d==c.type)return o}return-1}function Yt(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||Ee.test(e)?n:n+"px"}function vt(t,e,n,a,r){var s,o;t:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof a=="string"&&(t.style.cssText=a=""),a)for(e in a)n&&e in n||Yt(t.style,e,"");if(n)for(e in n)a&&n[e]==a[e]||Yt(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")s=e!=(e=e.replace(ve,"$1")),o=e.toLowerCase(),e=o in t||e=="onFocusOut"||e=="onFocusIn"?o.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+s]=n,n?a?n[ot]=a[ot]:(n[ot]=Ut,t.addEventListener(e,s?xt:Mt,s)):t.removeEventListener(e,s?xt:Mt,s);else{if(r=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break t}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function Xt(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[ft]==null)e[ft]=Ut++;else if(e[ft]<n[ot])return;return n(P.event?P.event(e):e)}}}function Bt(t,e,n,a,r,s,o,l,d,c){var _,i,p,v,m,b,u,f,$,h,y,w,k,S,L,M=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[l=e.__e=n.__e]),(_=P.__b)&&_(e);t:if(typeof M=="function")try{if(f=e.props,$=M.prototype&&M.prototype.render,h=(_=M.contextType)&&a[_.__c],y=_?h?h.props.value:_.__:a,n.__c?u=(i=e.__c=n.__c).__=i.__E:($?e.__c=i=new M(f,y):(e.__c=i=new ht(f,y),i.constructor=M,i.render=Be),h&&h.sub(i),i.state||(i.state={}),i.__n=a,p=i.__d=!0,i.__h=[],i._sb=[]),$&&i.__s==null&&(i.__s=i.state),$&&M.getDerivedStateFromProps!=null&&(i.__s==i.state&&(i.__s=q({},i.__s)),q(i.__s,M.getDerivedStateFromProps(f,i.__s))),v=i.props,m=i.state,i.__v=e,p)$&&M.getDerivedStateFromProps==null&&i.componentWillMount!=null&&i.componentWillMount(),$&&i.componentDidMount!=null&&i.__h.push(i.componentDidMount);else{if($&&M.getDerivedStateFromProps==null&&f!==v&&i.componentWillReceiveProps!=null&&i.componentWillReceiveProps(f,y),e.__v==n.__v||!i.__e&&i.shouldComponentUpdate!=null&&i.shouldComponentUpdate(f,i.__s,y)===!1){e.__v!=n.__v&&(i.props=f,i.state=i.__s,i.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(I){I&&(I.__=e)}),yt.push.apply(i.__h,i._sb),i._sb=[],i.__h.length&&o.push(i);break t}i.componentWillUpdate!=null&&i.componentWillUpdate(f,i.__s,y),$&&i.componentDidUpdate!=null&&i.__h.push(function(){i.componentDidUpdate(v,m,b)})}if(i.context=y,i.props=f,i.__P=t,i.__e=!1,w=P.__r,k=0,$)i.state=i.__s,i.__d=!1,w&&w(e),_=i.render(i.props,i.state,i.context),yt.push.apply(i.__h,i._sb),i._sb=[];else do i.__d=!1,w&&w(e),_=i.render(i.props,i.state,i.context),i.state=i.__s;while(i.__d&&++k<25);i.state=i.__s,i.getChildContext!=null&&(a=q(q({},a),i.getChildContext())),$&&!p&&i.getSnapshotBeforeUpdate!=null&&(b=i.getSnapshotBeforeUpdate(v,m)),S=_!=null&&_.type===Pt&&_.key==null?be(_.props.children):_,l=me(t,kt(S)?S:[S],e,n,a,r,s,o,l,d,c),i.base=e.__e,e.__u&=-161,i.__h.length&&o.push(i),u&&(i.__E=i.__=null)}catch(I){if(e.__v=null,d||s!=null)if(I.then){for(e.__u|=d?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;s[s.indexOf(l)]=null,e.__e=l}else{for(L=s.length;L--;)It(s[L]);Et(e)}else e.__e=n.__e,e.__k=n.__k,I.then||Et(e);P.__e(I,e,n)}else s==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):l=e.__e=Ie(n.__e,e,n,a,r,s,o,d,c);return(_=P.diffed)&&_(e),128&e.__u?void 0:l}function Et(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(Et))}function ge(t,e,n){for(var a=0;a<n.length;a++)Ht(n[a],n[++a],n[++a]);P.__c&&P.__c(e,t),t.some(function(r){try{t=r.__h,r.__h=[],t.some(function(s){s.call(r)})}catch(s){P.__e(s,r.__v)}})}function be(t){return typeof t!="object"||t==null||t.__b>0?t:kt(t)?t.map(be):q({},t)}function Ie(t,e,n,a,r,s,o,l,d){var c,_,i,p,v,m,b,u=n.props||bt,f=e.props,$=e.type;if($=="svg"?r="http://www.w3.org/2000/svg":$=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),s!=null){for(c=0;c<s.length;c++)if((v=s[c])&&"setAttribute"in v==!!$&&($?v.localName==$:v.nodeType==3)){t=v,s[c]=null;break}}if(t==null){if($==null)return document.createTextNode(f);t=document.createElementNS(r,$,f.is&&f),l&&(P.__m&&P.__m(e,s),l=!1),s=null}if($==null)u===f||l&&t.data==f||(t.data=f);else{if(s=s&&Ct.call(t.childNodes),!l&&s!=null)for(u={},c=0;c<t.attributes.length;c++)u[(v=t.attributes[c]).name]=v.value;for(c in u)v=u[c],c=="dangerouslySetInnerHTML"?i=v:c=="children"||c in f||c=="value"&&"defaultValue"in f||c=="checked"&&"defaultChecked"in f||vt(t,c,null,v,r);for(c in f)v=f[c],c=="children"?p=v:c=="dangerouslySetInnerHTML"?_=v:c=="value"?m=v:c=="checked"?b=v:l&&typeof v!="function"||u[c]===v||vt(t,c,v,u[c],r);if(_)l||i&&(_.__html==i.__html||_.__html==t.innerHTML)||(t.innerHTML=_.__html),e.__k=[];else if(i&&(t.innerHTML=""),me(e.type=="template"?t.content:t,kt(p)?p:[p],e,n,a,$=="foreignObject"?"http://www.w3.org/1999/xhtml":r,s,o,s?s[0]:n.__k&&at(n,0),l,d),s!=null)for(c=s.length;c--;)It(s[c]);l||(c="value",$=="progress"&&m==null?t.removeAttribute("value"):m!=null&&(m!==t[c]||$=="progress"&&!m||$=="option"&&m!=u[c])&&vt(t,c,m,u[c],r),c="checked",b!=null&&b!=t[c]&&vt(t,c,b,u[c],r))}return t}function Ht(t,e,n){try{if(typeof t=="function"){var a=typeof t.__u=="function";a&&t.__u(),a&&e==null||(t.__u=t(e))}else t.current=e}catch(r){P.__e(r,n)}}function ye(t,e,n){var a,r;if(P.unmount&&P.unmount(t),(a=t.ref)&&(a.current&&a.current!=t.__e||Ht(a,null,e)),(a=t.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){P.__e(s,e)}a.base=a.__P=null}if(a=t.__k)for(r=0;r<a.length;r++)a[r]&&ye(a[r],e,n||typeof t.type!="function");n||It(t.__e),t.__c=t.__=t.__e=void 0}function Be(t,e,n){return this.constructor(t,n)}function He(t,e,n){var a,r,s,o;e==document&&(e=document.documentElement),P.__&&P.__(t,e),r=(a=!1)?null:e.__k,s=[],o=[],Bt(e,t=e.__k=E(Pt,null,[t]),r||bt,bt,e.namespaceURI,r?null:e.firstChild?Ct.call(e.childNodes):null,s,r?r.__e:e.firstChild,a,o),ge(s,t,o)}function Oe(t){function e(n){var a,r;return this.getChildContext||(a=new Set,(r={})[e.__c]=this,this.getChildContext=function(){return r},this.componentWillUnmount=function(){a=null},this.shouldComponentUpdate=function(s){this.props.value!=s.value&&a.forEach(function(o){o.__e=!0,Dt(o)})},this.sub=function(s){a.add(s);var o=s.componentWillUnmount;s.componentWillUnmount=function(){a&&a.delete(s),o&&o.call(s)}}),n.children}return e.__c="__cC"+$e++,e.__=t,e.Provider=e.__l=(e.Consumer=function(n,a){return n.children(a)}).contextType=e,e}Ct=yt.slice,P={__e:function(t,e,n,a){for(var r,s,o;e=e.__;)if((r=e.__c)&&!r.__)try{if((s=r.constructor)&&s.getDerivedStateFromError!=null&&(r.setState(s.getDerivedStateFromError(t)),o=r.__d),r.componentDidCatch!=null&&(r.componentDidCatch(t,a||{}),o=r.__d),o)return r.__E=r}catch(l){t=l}throw t}},ue=0,ht.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=q({},this.state),typeof t=="function"&&(t=t(q({},n),this.props)),t&&q(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),Dt(this))},ht.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Dt(this))},ht.prototype.render=Pt,Q=[],pe=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,_e=function(t,e){return t.__v.__b-e.__v.__b},wt.__r=0,Nt=Math.random().toString(8),ft="__d"+Nt,ot="__a"+Nt,ve=/(PointerCapture)$|Capture$/i,Ut=0,Mt=Xt(!1),xt=Xt(!0),$e=0;var st,F,Jt,Zt,ct=0,we=[],N=P,te=N.__b,ee=N.__r,ne=N.diffed,ae=N.__c,se=N.unmount,re=N.__;function St(t,e){N.__h&&N.__h(F,t,ct||e),ct=0;var n=F.__H||(F.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function g(t){return ct=1,We(Pe,t)}function We(t,e,n){var a=St(st++,2);if(a.t=t,!a.__c&&(a.__=[Pe(void 0,e),function(l){var d=a.__N?a.__N[0]:a.__[0],c=a.t(d,l);d!==c&&(a.__N=[c,a.__[1]],a.__c.setState({}))}],a.__c=F,!F.__f)){var r=function(l,d,c){if(!a.__c.__H)return!0;var _=a.__c.__H.__.filter(function(p){return p.__c});if(_.every(function(p){return!p.__N}))return!s||s.call(this,l,d,c);var i=a.__c.props!==l;return _.some(function(p){if(p.__N){var v=p.__[0];p.__=p.__N,p.__N=void 0,v!==p.__[0]&&(i=!0)}}),s&&s.call(this,l,d,c)||i};F.__f=!0;var s=F.shouldComponentUpdate,o=F.componentWillUpdate;F.componentWillUpdate=function(l,d,c){if(this.__e){var _=s;s=void 0,r(l,d,c),s=_}o&&o.call(this,l,d,c)},F.shouldComponentUpdate=r}return a.__N||a.__}function H(t,e){var n=St(st++,3);!N.__s&&ke(n.__H,e)&&(n.__=t,n.u=e,F.__H.__h.push(n))}function Ce(t){return ct=5,O(function(){return{current:t}},[])}function O(t,e){var n=St(st++,7);return ke(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function C(t,e){return ct=8,O(function(){return t},e)}function Ve(t){var e=F.context[t.__c],n=St(st++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(F)),e.props.value):t.__}function qe(){for(var t;t=we.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(gt),e.__h.some(At),e.__h=[]}catch(n){e.__h=[],N.__e(n,t.__v)}}}N.__b=function(t){F=null,te&&te(t)},N.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),re&&re(t,e)},N.__r=function(t){ee&&ee(t),st=0;var e=(F=t.__c).__H;e&&(Jt===F?(e.__h=[],F.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(gt),e.__h.some(At),e.__h=[],st=0)),Jt=F},N.diffed=function(t){ne&&ne(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(we.push(e)!==1&&Zt===N.requestAnimationFrame||((Zt=N.requestAnimationFrame)||Ge)(qe)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),Jt=F=null},N.__c=function(t,e){e.some(function(n){try{n.__h.some(gt),n.__h=n.__h.filter(function(a){return!a.__||At(a)})}catch(a){e.some(function(r){r.__h&&(r.__h=[])}),e=[],N.__e(a,n.__v)}}),ae&&ae(t,e)},N.unmount=function(t){se&&se(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(a){try{gt(a)}catch(r){e=r}}),n.__H=void 0,e&&N.__e(e,n.__v))};var oe=typeof requestAnimationFrame=="function";function Ge(t){var e,n=function(){clearTimeout(a),oe&&cancelAnimationFrame(e),setTimeout(t)},a=setTimeout(n,35);oe&&(e=requestAnimationFrame(n))}function gt(t){var e=F,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),F=e}function At(t){var e=F;t.__c=t.__(),F=e}function ke(t,e){return!t||t.length!==e.length||e.some(function(n,a){return n!==t[a]})}function Pe(t,e){return typeof e=="function"?e(t):e}var Se=function(t,e,n,a){var r;e[0]=0;for(var s=1;s<e.length;s++){var o=e[s++],l=e[s]?(e[0]|=o?1:2,n[e[s++]]):e[++s];o===3?a[0]=l:o===4?a[1]=Object.assign(a[1]||{},l):o===5?(a[1]=a[1]||{})[e[++s]]=l:o===6?a[1][e[++s]]+=l+"":o?(r=t.apply(l,Se(t,l,n,["",null])),a.push(r),l[0]?e[0]|=2:(e[s-2]=0,e[s]=r)):a.push(l)}return a},ie=new Map;function R(t){var e=ie.get(this);return e||(e=new Map,ie.set(this,e)),(e=Se(this,e.get(t)||(e.set(t,e=(function(n){for(var a,r,s=1,o="",l="",d=[0],c=function(p){s===1&&(p||(o=o.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,p,o):s===3&&(p||o)?(d.push(3,p,o),s=2):s===2&&o==="..."&&p?d.push(4,p,0):s===2&&o&&!p?d.push(5,0,!0,o):s>=5&&((o||!p&&s===5)&&(d.push(s,0,o,r),s=6),p&&(d.push(s,p,0,r),s=6)),o=""},_=0;_<n.length;_++){_&&(s===1&&c(),c(_));for(var i=0;i<n[_].length;i++)a=n[_][i],s===1?a==="<"?(c(),d=[d],s=3):o+=a:s===4?o==="--"&&a===">"?(s=1,o=""):o=a+o[0]:l?a===l?l="":o+=a:a==='"'||a==="'"?l=a:a===">"?(c(),s=1):s&&(a==="="?(s=5,r=o,o=""):a==="/"&&(s<5||n[_][i+1]===">")?(c(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(c(),s=2):o+=a),s===3&&o==="!--"&&(s=4,d=d[0])}return c(),d})(t)),e),arguments,[])).length>1?e:e[0]}const Qe=R.bind(E),Rt=Oe(null);function le({base:t,children:e}){const n=t.endsWith("/")?t.slice(0,-1):t,a=l=>l===n||l===n+"/"?"/":l.startsWith(n+"/")?l.slice(n.length)||"/":l,[r,s]=g(()=>a(location.pathname));H(()=>{const l=()=>s(a(location.pathname));return window.addEventListener("popstate",l),()=>window.removeEventListener("popstate",l)},[n]);const o=C(l=>{const d=l==="/"?n+"/":n+l;history.pushState(null,"",d),s(l)},[n]);return Qe`<${Rt.Provider} value=${[r,o]}>${e}</${Rt.Provider}>`}function Ot(){const t=Ve(Rt);if(!t)throw new Error("useLocation must be used within RouterProvider");return t}function X(t){if(!t)return"—";const e=Math.floor(t/3600),n=Math.floor(t%3600/60);return e===0?`${n}m`:`${e}h${n>0?` ${n}m`:""}`}function Wt(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"};return e.toLocaleString(void 0,a)}function z(t){if(!t)return"—";const e=new Date(t),n=new Date,a=e.getFullYear()===n.getFullYear()?{month:"short",day:"numeric"}:{month:"short",day:"numeric",year:"2-digit"};return e.toLocaleDateString(void 0,a)}function x(t){return"$"+t.toFixed(2)}function ut(t){return t==null?"—":t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${t.toFixed(1)} g`}function Vt(t){return t?t>=1e3?`${(t/1e3).toFixed(2)} kg`:`${Math.round(t)} g`:"0 g"}const tt=R.bind(E),Ke={finish:"badge badge-finish",running:"badge badge-running",failed:"badge badge-failed",cancel:"badge badge-cancel",pause:"badge badge-pause"};function pt({status:t}){const e=(t||"").toLowerCase();return tt`<span class=${Ke[e]||"badge badge-default"}>${e||"unknown"}</span>`}function Tt({url:t}){const[e,n]=g(!1);return!t||e?tt`<div class="row-thumb-ph">🖨</div>`:tt`<img
    class="row-thumb"
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>n(!0)}
  />`}function ze({url:t,className:e}){const[n,a]=g(!1);return!t||n?tt`<div class="cover-placeholder">🖨</div>`:tt`<img
    class=${e}
    src=${t}
    alt=""
    loading="lazy"
    onError=${()=>a(!0)}
  />`}function Ft({colors:t}){if(!(t!=null&&t.length))return null;const e=[...new Set(t.map(n=>n.slice(0,6).toUpperCase()))].filter(n=>n!=="FFFFFF");return e.length?tt`<span class="swatches"
    >${e.map(n=>tt`<span class="swatch" style=${"background:#"+n} title=${"#"+n} />`)}</span
  >`:null}const ce=R.bind(E);let Te=()=>{};function Y(t,e="info"){Te({message:t,type:e,id:Date.now()+Math.random()})}function Ye(){const[t,e]=g([]),n=Ce(new Map);Te=C(r=>{e(o=>[...o,r]);const s=setTimeout(()=>{e(o=>o.filter(l=>l.id!==r.id)),n.current.delete(r.id)},3500);n.current.set(r.id,s)},[]);const a=C(r=>{const s=n.current.get(r);s&&clearTimeout(s),n.current.delete(r),e(o=>o.filter(l=>l.id!==r))},[]);return t.length?ce`
    <div class="toast-container">
      ${t.map(r=>ce`
          <div class="toast toast-${r.type}" key=${r.id} onClick=${()=>a(r.id)}>
            ${r.message}
          </div>
        `)}
    </div>
  `:null}const Xe=15e3,Ze=2e4,tn=5;async function en(t,e){try{const n=await t.json();return typeof n.error=="string"?n.error:e}catch{return e}}function nn(t){const{timeoutMs:e=Xe,...n}=t??{};return n.signal||e===null?n:{signal:AbortSignal.timeout(e),...n}}function an(t,e){return(t==null?void 0:t.name)==="TimeoutError"?new Error(`${e} (request timed out)`):new Error(`${e} (network error)`)}async function it(t,e,n){let a;try{a=await fetch(t,nn(n))}catch(r){throw an(r,e)}if(!a.ok)throw new Error(await en(a,e));return await a.json()}async function qt(t,e,n){try{return{data:await it(t,e,n),error:null}}catch(a){return{data:null,error:a instanceof Error?a:new Error(e)}}}async function et(t,e,n){const{data:a,error:r}=await qt(t,e,n);return r?(Y(r.message||e,"error"),null):a}async function Z(t,e,n){return et(t,n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}async function dt(t,e,n,a){return et(t,n,{...a,method:"POST",headers:{"Content-Type":"application/json",...a==null?void 0:a.headers},body:JSON.stringify(e)})}const A=R.bind(E);function sn(t){const e=t.toLowerCase();return e.includes("a1 mini")?"/ui/printers/a1-mini":e.includes("p1s")?"/ui/printers/p1s":null}function rn(t){const e=new Map;for(const n of t){const a=n.deviceModel||"Unknown printer",r=e.get(a)??[];r.push(n),e.set(a,r)}return e}function Fe(t,e=6){return t.slice().sort((n,a)=>String(a.startTime||"").localeCompare(String(n.startTime||""))).slice(0,e)}function je({printerName:t}){const e=sn(t);return e?A`<img class="printer-photo" src=${e} alt=${t} />`:A`<div class="printer-photo">🖨️</div>`}function Ne({job:t,onJobClick:e}){return A`
    <article class="printer-job-row" key=${t.id} onClick=${()=>e(t)}>
      <div class="printer-job-top">
        <div class="td-thumb"><${Tt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title">${t.designTitle||"Untitled Job"}</span>
          <${Ft} colors=${t.filament_colors} />
        </div>
        <${pt} status=${t.status} />
      </div>
      <div class="printer-job-bottom">
        <span>${z(t.startTime)}</span>
        <span>Filament: <strong>${ut(t.total_weight_g)}</strong></span>
        <span>Time: <strong>${X(t.total_time_s)}</strong></span>
      </div>
    </article>
  `}function on({row:t,jobs:e,onJobClick:n}){const a=t.deviceModel||"Unknown printer",r=Fe(e);return A`
    <section class="printer-card" key=${a}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${je} printerName=${a} />
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
        ${r.length?r.map(s=>A`<${Ne} key=${s.id} job=${s} onJobClick=${n} />`):A`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function ln({printer:t,jobs:e,onJobClick:n,onToggleActive:a}){const r=t.name||t.model||t.provider_printer_id,s=Fe(e),o=t.is_active===1;return A`
    <section class=${"printer-card"+(o?"":" is-retired")} key=${t.id}>
      <div class="printer-card-head">
        <div class="printer-identity">
          <${je} printerName=${t.model||r} />
          <div>
            <h3>${r}</h3>
            <p class="printer-meta">
              <span class="printer-meta-jobs"
                >${t.provider_display_name||t.provider}</span
              >
              <span class="printer-meta-dot">•</span>
              <span class="printer-meta-hours">${t.model||"Unknown model"}</span>
              <span class="printer-meta-dot">•</span>
              <span class=${o?"status-pill paid":"status-pill cancel"}
                >${o?"Active":"Retired"}</span
              >
            </p>
            ${t.retired_at?A`<p class="printer-meta">Retired ${z(t.retired_at)}</p>`:null}
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
          ${o?"Mark retired":"Reactivate"}
        </button>
      </div>

      <div class="printer-jobs-list">
        ${s.length?s.map(l=>A`<${Ne} key=${l.id} job=${l} onJobClick=${n} />`):A`<div class="empty">No jobs for this printer yet.</div>`}
      </div>
    </section>
  `}function cn(t,e){return e.filter(n=>n.printer_id===t.id)}function dn({summary:t,jobs:e,onJobClick:n}){const[a,r]=g([]);H(()=>{et("/printers","Failed to load printer inventory.").then(d=>{d&&r(d.printers)})},[]);const s=async d=>{const c=await Z(`/printers/${d.id}`,{is_active:d.is_active!==1},"Failed to update printer inventory.");c!=null&&c.printer&&r(_=>_.map(i=>i.id===d.id?c.printer:i))};if(a.length)return A`
      <div class="printer-grid">
        ${a.map(d=>A`<${ln}
              key=${d.id}
              printer=${d}
              jobs=${cn(d,e)}
              onJobClick=${n}
              onToggleActive=${s}
            />`)}
      </div>
    `;const o=(t==null?void 0:t.by_device)??[];if(!o.length)return A`<div class="empty">No printer totals available yet.</div>`;const l=rn(e);return A`
    <div class="printer-grid">
      ${o.map(d=>A`<${on}
            key=${d.deviceModel||"Unknown printer"}
            row=${d}
            jobs=${l.get(d.deviceModel||"Unknown printer")??[]}
            onJobClick=${n}
          />`)}
    </div>
  `}const j=R.bind(E);function un(t){return!t.startsWith("/projects")&&!t.startsWith("/admin")&&!t.startsWith("/printers")&&!t.startsWith("/catalog")}function pn(t,e){const n=new URLSearchParams;t&&n.set("status",t),e&&n.set("device",e);const a=n.toString();return"/jobs/export.csv"+(a?"?"+a:"")}function _n(t){return t.reduce((e,n)=>(e.weight+=n.total_weight_g||0,e.time+=n.total_time_s||0,e),{weight:0,time:0})}function vn(t){return!t||t==="actual"?null:t==="slicer_estimate"?"estimate":t==="manual"?"manual":"unknown"}function Je({confidence:t}){const e=vn(t);return e?j`<span class="usage-confidence">${e}</span>`:null}const $n=[{label:"Jobs",path:"/",active:un},{label:"Projects",path:"/projects",active:t=>t.startsWith("/projects")},{label:"Printers",path:"/printers",active:t=>t.startsWith("/printers")},{label:"Catalog",path:"/catalog",active:t=>t.startsWith("/catalog")},{label:"Rates",path:"/admin",active:t=>t.startsWith("/admin")}],fn=[["","All Statuses"],["finish","Finished"],["cancel","Cancelled"],["running","Running"],["failed","Failed"],["pause","Paused"]];function Lt(t,e){const n=(t==null?void 0:t.by_device)??[];return n.length?n.map(a=>{const r=a.deviceModel||"Unknown printer";return e==="jobs"?`${r}: ${(a.total_jobs??0).toLocaleString()} jobs`:e==="plates"?`${r}: ${(a.total_plates??0).toLocaleString()} plates`:`${r}: ${((a.total_time_s??0)/3600).toFixed(1).toLocaleString()} h`}).join(`
`):"No printer breakdown available"}function mn({loc:t,navigate:e}){return j`<nav class="top-nav">
    ${$n.map(n=>{const a=n.active(t);return j`
        <button
          key=${n.label}
          class=${"nav-btn"+(a?" active":"")}
          onClick=${()=>e(n.path)}
        >
          ${n.label}
        </button>
      `})}
  </nav>`}function hn({summary:t}){var n,a;const e=t==null?void 0:t.totals;return j`
    <div class="stats">
      <div class="stat" title=${Lt(t,"jobs")}>
        <div class="stat-val">${e?(n=e.total_jobs)==null?void 0:n.toLocaleString():"—"}</div>
        <div class="stat-lbl">Total Jobs</div>
      </div>
      <div class="stat">
        <div class="stat-val">${e?((e.total_weight_g??0)/1e3).toFixed(2):"—"}</div>
        <div class="stat-lbl">Filament kg</div>
      </div>
      <div class="stat" title=${Lt(t,"hours")}>
        <div class="stat-val">${e?((e.total_time_s??0)/3600).toFixed(1):"—"}</div>
        <div class="stat-lbl">Print Hours</div>
      </div>
      <div class="stat" title=${Lt(t,"plates")}>
        <div class="stat-val">${e?(a=e.total_plates)==null?void 0:a.toLocaleString():"—"}</div>
        <div class="stat-lbl">Plates</div>
      </div>
    </div>
  `}function gn({summary:t,dataRange:e}){const[n,a]=Ot(),r=!!(e!=null&&e.min_start&&(e!=null&&e.max_start)),s=(e==null?void 0:e.min_start)??"",o=(e==null?void 0:e.max_start)??"";return j`
    <header>
      <div class="header-left">
        <h1><span class="brand-cursor" aria-hidden="true"></span><span>PrintWorks</span></h1>
        ${r&&j`<div class="header-range">
          History: ${z(s)} → ${z(o)}
          (${((e==null?void 0:e.task_count)||0).toLocaleString()} tasks)
        </div>`}
        <${mn} loc=${n} navigate=${a} />
      </div>
      <${hn} summary=${t} />
    </header>
  `}function bn({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:r,setDeviceFilter:s,devices:o,view:l,setView:d,density:c,setDensity:_,filteredCount:i,totalCount:p}){const v=O(()=>pn(n,r),[n,r]);return j`
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
        ${fn.map(([m,b])=>j`<option key=${m} value=${m}>${b}</option> `)}
      </select>
      <select
        value=${r}
        onChange=${m=>s(m.target.value)}
      >
        <option value="">All Printers</option>
        ${o.map(m=>j`<option key=${m} value=${m}>${m}</option> `)}
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
        <span class="job-count">${i} / ${p} jobs</span>
      </div>
    </div>
  `}function yn({filtered:t,isFiltered:e}){if(!e||!t.length)return null;const n=_n(t);return j`
    <div class="totals-bar">
      <span class="totals-label">Selection</span>
      <span>Jobs: <strong>${t.length}</strong></span>
      <span>Filament: <strong>${Vt(n.weight)}</strong></span>
      <span>Print time: <strong>${X(n.time)}</strong></span>
    </div>
  `}function Le({printRun:t}){return(t??1)<=1?null:j`<span class="run-badge">Run ${t}</span>`}function wn({sortCol:t,sortDir:e,onSort:n}){return j`<div class="jobs-record-sortbar">
    <span class="jobs-record-sort-label">Sort</span>
    ${[{col:"startTime",label:"Date"},{col:"designTitle",label:"Title"},{col:"deviceModel",label:"Printer"},{col:"total_weight_g",label:"Filament"},{col:"total_time_s",label:"Time"},{col:"final_price",label:"Price"}].map(({col:r,label:s})=>{const o=t===r;return j`
        <button
          key=${r}
          class=${"jobs-record-sort-btn"+(o?" active":"")}
          onClick=${()=>n(r)}
        >
          ${s}${o?e==="asc"?" ↑":" ↓":""}
        </button>
      `})}
  </div>`}function Cn({job:t,onJobClick:e}){return j`
    <article class="jobs-record-row" onClick=${()=>e(t)}>
      <div class="jobs-record-top">
        <div class="td-thumb"><${Tt} url=${t.cover_url} /></div>
        <div class="td-title">
          <span class="row-title" title=${t.designTitle||"Untitled"}
            >${t.designTitle||"Untitled Job"}</span
          >
          <${Le} printRun=${t.print_run} />
          <${Ft} colors=${t.filament_colors} />
        </div>
        <div><${pt} status=${t.status} /></div>
      </div>
      <div class="jobs-record-bottom">
        <span>🖨 ${t.deviceModel||"—"}</span>
        <span title=${Wt(t.startTime)}>📅 ${z(t.startTime)}</span>
        <span
          >🧵 <strong>${ut(t.total_weight_g)}</strong>
          <${Je} confidence=${t.material_usage_confidence} />
        </span>
        <span>⏱ <strong>${X(t.total_time_s)}</strong></span>
        <span
          >💰 <strong>${t.final_price!=null?x(t.final_price):"—"}</strong></span
        >
        <span>🧱 <strong>${t.plate_count??"—"}</strong></span>
        ${t.customer?j`<span class="customer-pill">${t.customer}</span>`:null}
      </div>
    </article>
  `}function kn({sorted:t,sortCol:e,sortDir:n,onSort:a,onJobClick:r,density:s}){return j`
    <div class=${"jobs-record-list-wrap density-"+s}>
      <${wn} sortCol=${e} sortDir=${n} onSort=${a} />
      <div class="jobs-record-list">
        ${t.map(o=>j`<${Cn} key=${o.id} job=${o} onJobClick=${r} />`)}
      </div>
    </div>
  `}function Pn({job:t,onJobClick:e}){return j`
    <div class="card" onClick=${()=>e(t)}>
      <${ze} url=${t.cover_url} className="cover" />
      <div class="card-body">
        <div class="card-title">${t.designTitle||"Untitled Job"}</div>
        <div class="card-meta">
          <span>🖨 ${t.deviceModel||"—"}</span>
          <span>📅 ${z(t.startTime)}</span>
          <span>⏱ ${X(t.total_time_s)}</span>
          <span
            >🧵 ${ut(t.total_weight_g)}
            <${Je} confidence=${t.material_usage_confidence} />
          </span>
          ${t.final_price!=null&&j`<span>💰 ${x(t.final_price)}</span>`}
        </div>
        <div class="card-footer">
          <${pt} status=${t.status} />
          <${Le} printRun=${t.print_run} />
          ${t.customer&&j`<span class="customer-pill">${t.customer}</span>`}
          <${Ft} colors=${t.filament_colors} />
        </div>
      </div>
    </div>
  `}function Sn({sorted:t,onJobClick:e,density:n}){return j`
    <div class=${"grid-view density-"+n}>
      ${t.map(a=>j`<${Pn} key=${a.id} job=${a} onJobClick=${e} />`)}
    </div>
  `}function Gt(t){H(()=>{const e=n=>{n.key==="Escape"&&t()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[t])}const U=R.bind(E);function Tn(t){return t==="actual"?"actual usage":t==="slicer_estimate"?"slicer estimate":t==="manual"?"manual entry":"unknown confidence"}function Fn({jobId:t}){const[e,n]=g(null);if(H(()=>{let s=!0;return n(null),qt(`/jobs/${t}/price`,"Pricing not configured").then(({data:o})=>{s&&n(o??!1)}).catch(()=>{s&&n(!1)}),()=>{s=!1}},[t]),e===null)return U`<div class="pricing-row pricing-loading">Loading price…</div>`;if(e===!1)return U`<div class="pricing-row pricing-na">Pricing not configured</div>`;const a=e.final_price-e.base_price,r=e.base_price>0?Math.round(a/e.base_price*100):0;return U`
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Material</span><span>${x(e.material_cost)}</span>
      </div>
      <div class="pricing-row">
        <span>Machine</span><span>${x(e.machine_cost)}</span>
      </div>
      <div class="pricing-row"><span>Labor</span><span>${x(e.labor_cost)}</span></div>
      ${e.extra_labor_cost>0&&U`
        <div class="pricing-row pricing-extra-labor">
          <span>Extra labor</span><span>${x(e.extra_labor_cost)}</span>
        </div>
      `}
      <div class="pricing-divider"></div>
      <div class="pricing-row pricing-base">
        <span>Base</span><span>${x(e.base_price)}</span>
      </div>
      ${a!==0&&U`
        <div class="pricing-row pricing-markup">
          <span>Markup</span>
          <span
            >${a>0?"+":""}${x(a)}
            (${r>0?"+":""}${r}%)</span
          >
        </div>
      `}
      <div class="pricing-row pricing-final">
        <span
          >Final${e.is_override?U`<span class="override-tag">override</span>`:""}</span
        >
        <span>${x(e.final_price)}</span>
      </div>
    </div>
  `}const jn=["finish","failed","cancel","running","pause"];function Nn({job:t,onClose:e,onPatch:n,projects:a,onJobProjectChange:r,onJobStatusChange:s,onJobExtraLaborChange:o,onNavigateToProject:l}){const[d,c]=g(t.customer??""),[_,i]=g(t.notes??""),[p,v]=g(t.price_override!=null?String(t.price_override):"");Gt(e);const m=C(u=>{const f=u.target.value;r(t.id,f===""?null:Number(f))},[t.id,r]),b=C(u=>{const f=u.target.value;s(t.id,f===""?null:f)},[t.id,s]);return U`
    <div class="overlay" onClick=${u=>u.target===u.currentTarget&&e()}>
      <div class="modal">
        <div class="modal-header">
          <h2>${t.designTitle||"Untitled Job"}</h2>
          <button class="modal-close" onClick=${e}>✕</button>
        </div>
        ${t.cover_url&&U`<img class="modal-img" src=${t.cover_url} alt="" />`}
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Status</label>
              <div class="detail-val">
                <${pt} status=${t.status} />
                ${t.status_override&&U`<span class="override-tag">override</span>`}
              </div>
            </div>
            <div class="detail-item">
              <label>Printer</label>
              <div class="detail-val">${t.deviceModel||"—"}</div>
            </div>
            <div class="detail-item">
              <label>Started</label>
              <div class="detail-val">${Wt(t.startTime)}</div>
            </div>
            <div class="detail-item">
              <label>Duration</label>
              <div class="detail-val">${X(t.total_time_s)}</div>
            </div>
            <div class="detail-item">
              <label>Filament</label>
              <div class="detail-val">
                ${ut(t.total_weight_g)}
                <span class="usage-confidence"
                  >${Tn(t.material_usage_confidence)}</span
                >
                <${Ft} colors=${t.filament_colors} />
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
          <${Fn} jobId=${t.id} key=${t.id+"-"+t.extra_labor_minutes} />
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
              onInput=${u=>i(u.target.value)}
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
              onChange=${u=>{const f=u.target.value===""?null:Number(u.target.value);o(t.id,f)}}
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
              ${jn.map(u=>U`<option key=${u} value=${u}>${u}</option>`)}
            </select>
          </div>
          ${a&&U`
            <div class="modal-project-row">
              <label class="modal-project-label">Project</label>
              <select
                class="modal-project-select"
                value=${t.project_id??""}
                onChange=${m}
              >
                <option value="">— None —</option>
                ${a.map(u=>U`<option key=${u.id} value=${u.id}>${u.name}</option>`)}
              </select>
              ${t.project_id!=null&&U`
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
  `}const J=R.bind(E);function Jn({project:t,totalPrice:e,onClick:n,onRename:a}){const r=t.total_weight_g,s=t.total_time_s;return J`
    <div class="proj-card" onClick=${n}>
      ${t.cover_url?J`<img class="proj-card-cover" src=${t.cover_url} alt="" />`:J`<div class="proj-card-cover proj-card-cover--empty">🖨️</div>`}
      <div class="proj-card-title-row">
        <div class="proj-card-name">${t.name}</div>
        <button
          type="button"
          class="btn-secondary proj-card-action"
          onClick=${o=>{o.stopPropagation(),a(t)}}
        >
          Rename
        </button>
      </div>
      <div class="proj-card-meta">
        ${t.customer&&J`<span class="customer-pill">${t.customer}</span>`}
      </div>
      <div class="proj-card-stats">
        <span>
          <strong>${t.job_count}</strong> run${t.job_count!==1?"s":""}
        </span>
        ${t.total_plates!=null&&J`<span>
          <strong>${t.total_plates}</strong> plate${t.total_plates!==1?"s":""}
        </span>`}
        ${r!=null&&J`<span>${Vt(r)}</span>`}
        ${s!=null&&J`<span>${X(s)}</span>`}
        ${e!=null&&J`<span class="proj-card-price">${x(e)}</span>`}
      </div>
      ${t.notes&&J`<div class="proj-card-notes">${t.notes}</div>`}
    </div>
  `}function Ln({price:t}){return t?J`
    <span>Material: <strong>${x(t.material_cost)}</strong></span>
    <span>Machine: <strong>${x(t.machine_cost)}</strong></span>
    <span>Labor: <strong>${x(t.labor_cost)}</strong></span>
    ${t.extra_labor_cost>0&&J`<span>Extra labor: <strong>${x(t.extra_labor_cost)}</strong></span>`}
    <span class="totals-total">Total: <strong>${x(t.final_price)}</strong></span>
  `:null}function Mn({jobs:t,onJobClick:e,onRemoveJob:n,onMoveToNewProject:a}){return t.length===0?J`<div class="empty">No jobs assigned yet. Use "+ Add Jobs" to assign them.</div>`:J`
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
          ${t.map(r=>J`
              <tr key=${r.id} onClick=${()=>e(r)}>
                <td class="td-thumb"><${Tt} url=${r.cover_url} /></td>
                <td class="td-title">
                  <span class="row-title">${r.designTitle||"Untitled Job"}</span>
                </td>
                <td>${r.deviceModel||"—"}</td>
                <td title=${Wt(r.startTime)}>${z(r.startTime)}</td>
                <td><${pt} status=${r.status} /></td>
                <td class="td-num"><strong>${r.plate_count??1}</strong></td>
                <td class="td-num"><strong>${ut(r.total_weight_g)}</strong></td>
                <td class="td-num">${X(r.total_time_s)}</td>
                <td class="td-num">
                  ${r.final_price!=null?J`<strong>${x(r.final_price)}</strong>`:"—"}
                </td>
                <td>
                  ${a&&J`<button
                    class="btn-secondary"
                    title="Move to a new project"
                    onClick=${s=>{s.stopPropagation(),a(r)}}
                  >
                    New project
                  </button>`}
                  <button
                    class="btn-remove-job"
                    title="Remove from project"
                    onClick=${s=>{s.stopPropagation(),n(r.id)}}
                  >
                    ×
                  </button>
                </td>
              </tr>
            `)}
        </tbody>
      </table>
    </div>
  `}function xn({loading:t,filtered:e,q:n,projectPrices:a,navigate:r,onRename:s}){return t?J`<div class="empty">Loading projects…</div>`:e.length===0?J`<div class="empty">${n?"No projects match your search.":"No projects yet. Create one to group related jobs together."}</div>`:J`
    <div class="proj-grid">
      ${e.map(o=>J`<${Jn}
            key=${o.id}
            project=${o}
            totalPrice=${a[o.id]??null}
            onClick=${()=>r(`/projects/${o.id}`)}
            onRename=${s}
          />`)}
    </div>
  `}const Dn=R.bind(E);function En({job:t,initialName:e,onClose:n,onProjectCreated:a,onMoveJobToProject:r,onNavigateToProject:s}){const[o,l]=g(e),d=C(async()=>{const c=o.trim();if(!c)return;const _=await dt("/projects",{name:c,customer:t.customer??null,notes:null},"Failed to create project.");_!=null&&_.project&&(a(_.project),r(t.id,_.project.id),s(_.project.id),n())},[t.customer,t.id,o,n,r,s,a]);return Dn`<div class="modal-backdrop" onClick=${n}>
    <div class="modal-card" onClick=${c=>c.stopPropagation()}>
      <h3>Move print run to new project</h3>
      <p class="modal-subtle">${t.designTitle||"Untitled Job"}</p>
      <label>
        New project name
        <input
          value=${o}
          onInput=${c=>l(c.target.value)}
          autofocus
        />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onClick=${n}>Cancel</button>
        <button
          type="button"
          class="btn-primary"
          disabled=${!o.trim()}
          onClick=${d}
        >
          Create and move
        </button>
      </div>
    </div>
  </div>`}const An=R.bind(E);function Rn({project:t,onClose:e,onRenamed:n}){const[a,r]=g(t.name??""),[s,o]=g(!1),l=C(async()=>{const d=a.trim();if(d){o(!0);try{const c=await Z(`/projects/${t.id}`,{name:d},"Failed to rename project."),_=c==null?void 0:c.project;if(!_)return;n(_),e()}finally{o(!1)}}},[a,e,n,t.id]);return An`<div class="modal-backdrop" onClick=${e}>
    <div class="modal-card" onClick=${d=>d.stopPropagation()}>
      <h3>Rename project</h3>
      <p class="modal-subtle">${t.name}</p>
      <label>
        Project name
        <input
          value=${a}
          onInput=${d=>r(d.target.value)}
          autofocus
        />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onClick=${e}>Cancel</button>
        <button
          type="button"
          class="btn-primary"
          disabled=${!a.trim()||s}
          onClick=${l}
        >
          ${s?"Saving…":"Save name"}
        </button>
      </div>
    </div>
  </div>`}function Un(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>[a.name,a.customer,a.notes].filter(Boolean).join(" ").toLowerCase().includes(n))}function In(t,e){if(!e)return t;const n=e.toLowerCase();return t.filter(a=>`${a.designTitle||""} ${a.customer||""}`.toLowerCase().includes(n))}function Bn(t,e,n){return`${n?`${e.length} of ${t.length}`:String(t.length)} project${t.length!==1?"s":""}`}function Hn(t,e){return t.some(n=>n.id===e.id)?t.map(n=>n.id===e.id?{...n,...e}:n):[e,...t]}function On(t,e){if(t===0){Y("No ungrouped jobs found — everything is already assigned to a project.","info");return}Y(`Created ${t} project${t!==1?"s":""}, assigned ${e} job${e!==1?"s":""}.`,"success")}function Wn(t){return t.reduce((e,n)=>e+(n.total_weight_g||0),0)}function Vn(t){return t.reduce((e,n)=>e+(n.total_time_s||0),0)}function qn(t){return t.reduce((e,n)=>e+(n.plate_count||0),0)}const rt=R.bind(E);function Me(t){return e=>{e.target===e.currentTarget&&t()}}function Gn({onClose:t,onCreate:e}){const[n,a]=g(""),[r,s]=g(""),[o,l]=g(""),[d,c]=g(!1);Gt(t);const _=C(async i=>{if(i.preventDefault(),!!n.trim()){c(!0);try{const p=await dt("/projects",{name:n.trim(),customer:r||null,notes:o||null},"Failed to create project.");if(!(p!=null&&p.project))return;e(p.project),t()}finally{c(!1)}}},[n,r,o,e,t]);return rt`
    <div class="overlay" onClick=${Me(t)}>
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
                onInput=${i=>a(i.target.value)}
                placeholder="Project name"
                required
              />
            </label>
            <label class="form-label"
              >Customer
              <input
                class="form-input"
                type="text"
                value=${r}
                onInput=${i=>s(i.target.value)}
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
  `}function Qn({unassignedJobs:t,onClose:e,onAdd:n}){const[a,r]=g("");Gt(e);const s=O(()=>In(t,a),[t,a]);return rt`
    <div class="overlay" onClick=${Me(e)}>
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
            onInput=${o=>r(o.target.value)}
          />
          ${s.length===0?rt`<div class="empty" style="padding:16px 0">
                ${a?"No matches.":"All jobs are already assigned to projects."}
              </div>`:rt`<div class="add-jobs-list">
                ${s.map(o=>rt`
                    <div class="add-jobs-row" key=${o.id} onClick=${()=>n(o.id)}>
                      <${Tt} url=${o.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${o.designTitle||"Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${z(o.startTime)} · ${o.deviceModel||"—"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `)}
              </div>`}
        </div>
      </div>
    </div>
  `}const $t=new Map;function Kn(t,e){const[n,a]=g(()=>$t.get(t)??null);return H(()=>{if(a($t.get(t)??null),!e){$t.delete(t),a(null);return}let r=!1;return et(`/projects/${t}/price`,"Failed to load project price.").then(s=>{!s||r||($t.set(t,s),a(s))}),()=>{r=!0}},[t,e]),n}const V=R.bind(E);function zn({project:t,jobs:e,unassignedJobs:n,onBack:a,onJobClick:r,onAddJob:s,onRemoveJob:o,onProjectUpdated:l,onMoveJobToProject:d,onNavigateToProject:c}){const[_,i]=g(!1),[p,v]=g(!1),[m,b]=g(null),[u,f]=g(t.name??""),[$,h]=g(t.customer??""),[y,w]=g(t.notes??""),k=t.job_count??e.length,S=Kn(t.id,k),L=Wn(e),M=Vn(e),I=qn(e),_t=Ce(new Map),jt=O(()=>{for(const T of e)T.final_price!=null&&_t.current.set(T.id,T.final_price);return e.map(T=>{if(T.final_price!=null)return T;const Kt=_t.current.get(T.id);return Kt==null?T:{...T,final_price:Kt}})},[e]),xe=C(T=>s(T),[s]),De=C(async()=>{const T=await Z(`/projects/${t.id}`,{name:u.trim(),customer:$.trim()||null,notes:y.trim()||null},"Failed to update project.");T!=null&&T.project&&(l(T.project),v(!1))},[$,u,y,l,t.id]);return V`
    <div class="proj-detail">
      <div class="proj-detail-header">
        <button class="btn-back" onClick=${a}>← Projects</button>
        <div class="proj-detail-title">
          <h2>${t.name}</h2>
          ${t.customer&&V`<span class="customer-pill">${t.customer}</span>`}
        </div>
        <button class="btn-secondary" onClick=${()=>v(T=>!T)}>
          ${p?"Cancel edit":"Edit project"}
        </button>
        <button class="btn-secondary" onClick=${()=>i(!0)}>+ Add Jobs</button>
      </div>
      ${p&&V`<div class="modal-form proj-detail-notes">
        <label>
          Project name
          <input
            value=${u}
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
        <button class="btn-primary" disabled=${!u.trim()} onClick=${De}>
          Save project
        </button>
      </div>`}
      ${t.notes&&V`<div class="proj-detail-notes">${t.notes}</div>`}
      <div class="totals-bar">
        <span class="totals-label">Project</span>
        <span>Print runs: <strong>${k}</strong></span>
        <span>Plates: <strong>${I}</strong></span>
        <span>Filament: <strong>${Vt(L)}</strong></span>
        <span>Print time: <strong>${X(M)}</strong></span>
        <${Ln} price=${S} />
      </div>
      <${Mn}
        jobs=${jt}
        onJobClick=${r}
        onRemoveJob=${o}
        onMoveToNewProject=${b}
      />
      ${_&&V`<${Qn}
        unassignedJobs=${n}
        onClose=${()=>i(!1)}
        onAdd=${xe}
      />`}
      ${m&&V`<${En}
        job=${m}
        initialName=${m.designTitle||""}
        onClose=${()=>b(null)}
        onProjectCreated=${l}
        onMoveJobToProject=${d}
        onNavigateToProject=${c}
      />`}
    </div>
  `}function Yn({projects:t,setProjects:e,onAutoGroup:n,projectPrices:a,loading:r=!1}){const[s,o]=g(!1),[l,d]=g(!1),[c,_]=g(null),[i,p]=g(""),[,v]=Ot(),m=C(async()=>{d(!0);try{const f=await dt("/projects/auto-group",{},"Auto-group failed.");if(!f)return;const{projects_created:$,jobs_assigned:h}=f;await n(),On($,h)}finally{d(!1)}},[n]),b=C(f=>{e($=>[f,...$]),v(`/projects/${f.id}`)},[e,v]),u=O(()=>Un(t,i),[t,i]);return V`
    <div class="proj-list-header">
      <input
        type="search"
        class="proj-search"
        placeholder="Search projects…"
        value=${i}
        onInput=${f=>p(f.target.value)}
      />
      <span class="proj-list-count">${Bn(t,u,i)}</span>
      <button class="btn-secondary" onClick=${m} disabled=${l}>
        ${l?"Grouping…":"⚡ Auto-group by design"}
      </button>
      <button class="btn-primary" onClick=${()=>o(!0)}>+ New Project</button>
    </div>
    <${xn}
      loading=${r}
      filtered=${u}
      q=${i}
      projectPrices=${a}
      navigate=${v}
      onRename=${_}
    />
    ${s&&V`<${Gn} onClose=${()=>o(!1)} onCreate=${b} />`}
    ${c&&V`<${Rn}
      project=${c}
      onClose=${()=>_(null)}
      onRenamed=${f=>e($=>Hn($,f))}
    />`}
  `}const W=R.bind(E),Xn=2e3;function de(t,e,n){const a=e(n);return t.map(r=>e(r)===a?n:r)}function Zn(t){return t==="saving"?"Saving…":t==="saved"?"✓ Saved":"Save"}function ta(t,e,n){return t===n?"saving":e===n?"saved":"idle"}function ea(t){const[e,n]=g(""),[a,r]=g(""),s=d=>{r(d),setTimeout(()=>r(""),Xn)};return{runSave:async(d,c)=>{n(d);try{if(!await c())return;s(d),t()}finally{n("")}},getStateFor:d=>ta(e,a,d)}}function B({label:t,value:e,onChange:n,step:a="0.01",min:r="0"}){return W`
    <label class="form-label">
      ${t}
      <input
        type="number"
        class="form-input"
        step=${a}
        min=${r}
        value=${Number.isFinite(e)?e:0}
        onInput=${s=>n(Number(s.target.value||0))}
      />
    </label>
  `}function Qt({state:t}){return W`<button type="submit" class="btn-primary" disabled=${t==="saving"}>
    ${Zn(t)}
  </button>`}function nt({title:t,description:e,children:n}){return W`
    <section class="admin-section">
      <h3 class="admin-section-title">${t}</h3>
      <p class="admin-section-desc">${e}</p>
      ${n}
    </section>
  `}function na({labor:t,saveState:e,onSave:n}){const[a,r]=g(t);return H(()=>r(t),[t]),W`
    <form class="admin-card" onSubmit=${s=>(s.preventDefault(),n(a))}>
      <div class="admin-card-fields">
        <${B}
          label="Hourly rate ($)"
          value=${a.hourly_rate}
          step="0.5"
          onChange=${s=>r({...a,hourly_rate:s})}
        />
        <${B}
          label="Minimum labor minutes"
          value=${a.minimum_minutes}
          step="1"
          onChange=${s=>r({...a,minimum_minutes:s})}
        />
        <${B}
          label="Profit markup (%)"
          value=${a.profit_markup_pct*100}
          step="1"
          onChange=${s=>r({...a,profit_markup_pct:s/100})}
        />
        <${B}
          label="Failure buffer (%)"
          value=${a.failure_buffer_pct*100}
          step="1"
          onChange=${s=>r({...a,failure_buffer_pct:s/100})}
        />
        <${B}
          label="Overhead buffer (%)"
          value=${a.overhead_buffer_pct*100}
          step="1"
          onChange=${s=>r({...a,overhead_buffer_pct:s/100})}
        />
      </div>
      <div class="admin-card-actions"><${Qt} state=${e} /></div>
    </form>
  `}function aa({machine:t,saveState:e,onSave:n}){const[a,r]=g(t);H(()=>r(t),[t]);const s=a.purchase_price/a.lifetime_hrs+a.electricity_rate+a.maintenance_buffer;return W`
    <form class="admin-card" onSubmit=${o=>(o.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.device_model}</div>
      <div class="admin-card-fields">
        <${B}
          label="Purchase price ($)"
          value=${a.purchase_price}
          step="1"
          onChange=${o=>r({...a,purchase_price:o})}
        />
        <${B}
          label="Lifetime (hours)"
          value=${a.lifetime_hrs}
          step="100"
          min="1"
          onChange=${o=>r({...a,lifetime_hrs:o})}
        />
        <${B}
          label="Electricity ($/hr)"
          value=${a.electricity_rate}
          step="0.01"
          onChange=${o=>r({...a,electricity_rate:o})}
        />
        <${B}
          label="Maintenance ($/hr)"
          value=${a.maintenance_buffer}
          step="0.01"
          onChange=${o=>r({...a,maintenance_buffer:o})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">
          Computed rate: <strong>${x(s)}</strong>/hr
        </div>
        <div class="admin-card-actions"><${Qt} state=${e} /></div>
      </div>
    </form>
  `}function sa({material:t,saveState:e,onSave:n}){const[a,r]=g(t);H(()=>r(t),[t]);const s=a.cost_per_g*(1+a.waste_buffer_pct);return W`
    <form class="admin-card" onSubmit=${o=>(o.preventDefault(),n(a))}>
      <div class="admin-card-name">${a.filament_type}</div>
      <div class="admin-card-fields">
        <${B}
          label="Cost per gram ($/g)"
          value=${a.cost_per_g}
          step="0.001"
          onChange=${o=>r({...a,cost_per_g:o})}
        />
        <${B}
          label="Waste buffer (%)"
          value=${a.waste_buffer_pct*100}
          step="1"
          onChange=${o=>r({...a,waste_buffer_pct:o/100})}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">Computed rate: <strong>${x(s)}</strong>/g</div>
        <div class="admin-card-actions"><${Qt} state=${e} /></div>
      </div>
    </form>
  `}function ra({onRatesChanged:t=()=>{}}){const[e,n]=g(null),{runSave:a,getStateFor:r}=ea(t);H(()=>{et("/rates","Failed to load rates.").then(i=>{i&&n(i)})},[]);const s=async i=>{await a("labor",async()=>{const p=await Z("/rates/labor",i,"Failed to save labor rates."),v=p==null?void 0:p.labor_config;return v?(n(m=>m&&{...m,labor_config:v}),!0):!1})},o=async i=>{const{device_model:p,purchase_price:v,lifetime_hrs:m,electricity_rate:b,maintenance_buffer:u}=i;await a(p,async()=>{const f=await Z(`/rates/machines/${encodeURIComponent(p)}`,{purchase_price:v,lifetime_hrs:m,electricity_rate:b,maintenance_buffer:u},"Failed to save machine rate."),$=f==null?void 0:f.machine_rate;return $?(n(h=>h&&{...h,machine_rates:de(h.machine_rates,y=>y.device_model,$)}),!0):!1})},l=async i=>{const{filament_type:p,cost_per_g:v,waste_buffer_pct:m}=i;await a(p,async()=>{const b=await Z(`/rates/materials/${encodeURIComponent(p)}`,{cost_per_g:v,waste_buffer_pct:m},"Failed to save material rate."),u=b==null?void 0:b.material_rate;return u?(n(f=>f&&{...f,material_rates:de(f.material_rates,$=>$.filament_type,u)}),!0):!1})};if(!e)return W`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;const{labor_config:d,machine_rates:c,material_rates:_}=e;return W`
    <div class="admin-page">
      <h2 class="admin-title">Rates & Pricing</h2>

      <${nt}
        title="Labor"
        description="Applied once per job (or once per project for project pricing)."
      >
        <${na}
          labor=${d}
          saveState=${r("labor")}
          onSave=${s}
        />
      </${nt}>

      <${nt}
        title="Machine Rates"
        description="Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance."
      >
        ${c.map(i=>W`
            <${aa}
              key=${i.device_model}
              machine=${i}
              saveState=${r(i.device_model)}
              onSave=${o}
            />
          `)}
      </${nt}>

      <${nt}
        title="Material Rates"
        description="Cost per gram including waste. Rate = cost × (1 + waste fraction)."
      >
        ${_.map(i=>W`
            <${sa}
              key=${i.filament_type}
              material=${i}
              saveState=${r(i.filament_type)}
              onSave=${l}
            />
          `)}
      </${nt}>
    </div>
  `}const K=R.bind(E);function G({label:t,value:e}){return K`<div class="catalog-summary-pill">
    <strong>${e.toLocaleString()}</strong>${t}
  </div>`}function oa({summary:t}){return t?K`
    <div class="catalog-summary" role="status" aria-live="polite">
      <${G} label="scanned" value=${t.scanned} />
      <${G} label="added" value=${t.added} />
      <${G} label="changed" value=${t.changed} />
      <${G} label="unchanged" value=${t.unchanged} />
      <${G} label="missing" value=${t.missing} />
      <${G} label="restored" value=${t.restored} />
      <${G} label="skipped" value=${t.skipped} />
      <${G} label="failed" value=${t.failed} />
    </div>
  `:null}function ia(){const[t,e]=g([]),[n,a]=g(""),[r,s]=g(""),[o,l]=g(!0),[d,c]=g(!1),[_,i]=g(null),p=async()=>{const u=await et("/catalog/roots","Failed to load roots.");u&&e(u.roots),l(!1)};H(()=>{p()},[]);const v=async u=>{u.preventDefault();const f=n.trim();if(!f)return;const $=r.trim()?{rootPath:f,name:r.trim()}:{rootPath:f},h=await dt("/catalog/roots",$,"Failed to add root.");h&&(e(y=>[...y,h.root]),a(""),s(""),Y("Catalog root added.","success"))},m=async u=>{const f=await et(`/catalog/roots/${u}`,"Failed to remove root.",{method:"DELETE"});f&&e($=>$.map(h=>h.id===u?f.root:h))};return K`
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
            onClick=${async()=>{c(!0);try{const u=await dt("/catalog/scan",{},"Catalog scan failed.",{timeoutMs:null});if(!u)return;i(u.summary),Y("Catalog scan complete.",u.summary.failed>0?"info":"success"),await p()}finally{c(!1)}}}
            disabled=${d||t.every(u=>!u.is_active)}
          >
            ${d?"Scanning…":"Run scan"}
          </button>
        </div>
        <${oa} summary=${_} />
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
              onInput=${u=>a(u.target.value)}
            />
          </label>
          <label class="form-label">
            Name
            <input
              class="form-input"
              value=${r}
              placeholder="Models"
              onInput=${u=>s(u.target.value)}
            />
          </label>
          <button class="btn-primary" type="submit">Add root</button>
        </form>

        ${o?K`<div class="empty">Loading scan roots…</div>`:t.length===0?K`<div class="empty">No scan roots configured.</div>`:K`<div class="catalog-root-list">
                ${t.map(u=>K`<div class="admin-card catalog-root-card" key=${u.id}>
                      <div>
                        <div class="admin-card-name">${u.name}</div>
                        <div class="catalog-root-path">${u.root_path}</div>
                        <div class="catalog-root-meta">
                          ${u.is_active?"active":"inactive"}
                          ${u.last_scanned_at?` · scanned ${u.last_scanned_at}`:""}
                        </div>
                      </div>
                      ${u.is_active?K`<button class="btn-ghost" onClick=${()=>m(u.id)}>
                            Deactivate
                          </button>`:null}
                    </div>`)}
              </div>`}
      </section>
    </main>
  `}const D=R.bind(E);function la({bootStatus:t,loadProgress:e}){return D` <div class="in-app-loading" role="status" aria-live="polite">
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
          ${Array.from({length:5},(n,a)=>D`
              <div class="dashboard-loader-row" key=${a}>
                <span></span><span></span><span></span><span></span>
              </div>
            `)}
        </div>
      </div>
    </section>
  </div>`}function ca({error:t}){return D`<div class="app-loading">
    <div class="loader-shell">
      <div class="loader-main loader-error">
        <div class="loader-hero-row">
          <div class="loader-cursor" aria-hidden="true"></div>
          <h1 class="loader-title">failed to load</h1>
        </div>
        <p class="loader-copy">${t}</p>
      </div>
    </div>
  </div>`}function da({projectId:t,projects:e,jobs:n,projectsLoading:a,navigate:r,setSelectedJob:s,handleJobProjectChange:o,setProjects:l}){const d=e.find(i=>Number(i.id)===t),c=n.filter(i=>Number(i.project_id)===t);if(!d)return a?D`<div class="empty">Loading projects…</div>`:D`<div class="empty">Project not found.</div>`;const _=n.filter(i=>i.project_id==null);return D`<${zn}
    project=${d}
    jobs=${c}
    unassignedJobs=${_}
    onBack=${()=>r("/projects")}
    onJobClick=${s}
    onAddJob=${i=>o(i,t)}
    onRemoveJob=${i=>o(i,null)}
    onProjectUpdated=${i=>l(p=>p.some(v=>v.id===i.id)?p.map(v=>v.id===i.id?i:v):[i,...p])}
    onMoveJobToProject=${(i,p)=>o(i,p)}
    onNavigateToProject=${i=>r(`/projects/${i}`)}
  />`}function ua({sorted:t,view:e,sortCol:n,sortDir:a,onSort:r,onJobClick:s,density:o}){return t.length===0?D`<div class="empty">No jobs match your filters.</div>`:e==="table"?D`<${kn}
      sorted=${t}
      sortCol=${n}
      sortDir=${a}
      onSort=${r}
      onJobClick=${s}
      density=${o}
    />`:D`<${Sn} sorted=${t} onJobClick=${s} density=${o} />`}function pa({q:t,setQ:e,statusFilter:n,setStatusFilter:a,deviceFilter:r,setDeviceFilter:s,devices:o,view:l,setView:d,filtered:c,jobs:_,isFiltered:i,sorted:p,sortCol:v,sortDir:m,onSort:b,onJobClick:u,density:f,setDensity:$}){return D`
    <${bn}
      q=${t}
      setQ=${e}
      statusFilter=${n}
      setStatusFilter=${a}
      deviceFilter=${r}
      setDeviceFilter=${s}
      devices=${o}
      view=${l}
      setView=${d}
      density=${f}
      setDensity=${$}
      filteredCount=${c.length}
      totalCount=${_.length}
    />
    <${yn} filtered=${c} isFiltered=${i} />
    ${ua({sorted:p,view:l,sortCol:v,sortDir:m,onSort:b,onJobClick:u,density:f})}
  `}function _a(t){const e=t.match(/^\/projects\/(\d+)$/);return{isAdmin:t.startsWith("/admin"),isPrinters:t.startsWith("/printers"),isProjects:t.startsWith("/projects"),isCatalog:t.startsWith("/catalog"),projectId:e?Number(e[1]):null}}function va({route:t,summary:e,projects:n,setProjects:a,jobs:r,projectsLoading:s,navigate:o,setSelectedJob:l,handleJobProjectChange:d,handleRatesChanged:c,handleAutoGroup:_,projectPrices:i,q:p,setQ:v,statusFilter:m,setStatusFilter:b,deviceFilter:u,setDeviceFilter:f,devices:$,view:h,setView:y,filtered:w,isFiltered:k,sorted:S,sortCol:L,sortDir:M,density:I,setDensity:_t,handleSort:jt}){return t.isAdmin?D`<${ra} onRatesChanged=${c} />`:t.isCatalog?D`<${ia} />`:t.isPrinters?D`<${dn}
      summary=${e}
      jobs=${r}
      onJobClick=${l}
    />`:t.projectId!=null?D`<${da}
      projectId=${t.projectId}
      projects=${n}
      jobs=${r}
      projectsLoading=${s}
      navigate=${o}
      setSelectedJob=${l}
      handleJobProjectChange=${d}
      setProjects=${a}
    />`:t.isProjects?D`<${Yn}
      projects=${n}
      setProjects=${a}
      onAutoGroup=${_}
      projectPrices=${i}
      loading=${s}
    />`:D`<${pa}
    q=${p}
    setQ=${v}
    statusFilter=${m}
    setStatusFilter=${b}
    deviceFilter=${u}
    setDeviceFilter=${f}
    devices=${$}
    view=${h}
    setView=${y}
    filtered=${w}
    jobs=${r}
    isFiltered=${k}
    sorted=${S}
    sortCol=${L}
    sortDir=${M}
    onSort=${jt}
    onJobClick=${l}
    density=${I}
    setDensity=${_t}
  />`}function $a({setJobs:t,setProjects:e,setProjectPrices:n,setSummary:a,setDataRange:r,toast:s}){const[o,l]=g(!0),[d,c]=g(!0),[_,i]=g(0),[p,v]=g(null),[m,b]=g("Starting dashboard…"),u=C(async({url:h,fallback:y,onData:w,onFinally:k})=>{const{data:S,error:L}=await qt(h,y);L&&s(L.message||y,"error"),S&&w(S),k&&k()},[s]),f=C(()=>{u({url:"/projects",fallback:"Failed to load projects.",onData:h=>h.projects&&e(h.projects),onFinally:()=>c(!1)}),u({url:"/projects/prices",fallback:"Failed to load project prices.",onData:h=>h.prices&&n(h.prices)})},[u,e,n]),$=C((h=!1)=>{u({url:"/jobs/prices",fallback:h?"Failed to refresh job prices.":"Failed to load job prices.",onData:w=>{w!=null&&w.prices&&t(k=>k.map(S=>{var L;return{...S,final_price:((L=w.prices)==null?void 0:L[S.id])??(h?S.final_price:null)??null}}))}})},[u,t]);return H(()=>{const h=()=>i(k=>Math.min(100,k+100/tn)),y=(k,S,L)=>(b(`Loading ${k}…`),it(k,S).catch(M=>{const I=M instanceof Error?M.message:S;throw new Error(`Initial dashboard load failed (${L}): ${I}`)}).finally(h)),w=setTimeout(()=>{v("Dashboard load timed out. Check console/network for the failing request."),l(!1),c(!1)},Ze);return Promise.all([y("/ui/data","Failed to load jobs.","jobs"),y("/summary","Failed to load summary.","summary"),y("/health/data-range","Failed to load print history range.","history range")]).then(([k,S,L])=>{t(k.jobs),a(S),r(L),l(!1),b("Loading optional data…"),$(!1),f()}).catch(k=>{v(k.message),l(!1),c(!1)}).finally(()=>clearTimeout(w)),()=>clearTimeout(w)},[t,a,r,$,f]),{loading:o,projectsLoading:d,loadProgress:_,error:p,bootStatus:m,refreshProjectsAndPrices:f,refreshJobPrices:$}}function fa(t,e,n,a){return t.filter(r=>{const s=`${r.designTitle||""} ${r.customer||""}`.toLowerCase();return!(e&&!s.includes(e.toLowerCase())||n&&(r.status||"").toLowerCase()!==n||a&&r.deviceModel!==a)})}function ma(t,e,n){return[...t].sort((a,r)=>{let s=a[e],o=r[e];if(s==null&&(s=n==="asc"?1/0:-1/0),o==null&&(o=n==="asc"?1/0:-1/0),typeof s=="string"){const c=typeof o=="string"?o:String(o);return n==="asc"?s.localeCompare(c):c.localeCompare(s)}const l=Number(s),d=Number(o);return n==="asc"?l-d:d-l})}const lt=R.bind(E);function ha(){const[t,e]=g([]),[n,a]=g([]),[r,s]=g({}),[o,l]=g(null),[d,c]=g(null),[_,i]=g("table"),[p,v]=g("comfy"),[m,b]=g(""),[u,f]=g(""),[$,h]=g(""),[y,w]=g("startTime"),[k,S]=g("desc"),[L,M]=g(null);return{jobs:t,setJobs:e,projects:n,setProjects:a,projectPrices:r,setProjectPrices:s,summary:o,setSummary:l,dataRange:d,setDataRange:c,view:_,setView:i,density:p,setDensity:v,q:m,setQ:b,statusFilter:u,setStatusFilter:f,deviceFilter:$,setDeviceFilter:h,sortCol:y,setSortCol:w,sortDir:k,setSortDir:S,selectedJob:L,setSelectedJob:M}}function ga({jobs:t,q:e,statusFilter:n,deviceFilter:a,sortCol:r,sortDir:s,setSortCol:o,setSortDir:l,loc:d}){const c=O(()=>[...new Set(t.map(b=>b.deviceModel).filter(b=>!!b))].sort(),[t]),_=!!(e||n||a),i=O(()=>fa(t,e,n,a),[t,e,n,a]),p=O(()=>ma(i,r,s),[i,r,s]),v=C(b=>{if(r===b){l(u=>u==="asc"?"desc":"asc");return}o(b),l(()=>b==="startTime"?"desc":"asc")},[r,o,l]),m=O(()=>_a(d),[d]);return{devices:c,isFiltered:_,filtered:i,sorted:p,handleSort:v,route:m}}function ba({setJobs:t,setProjects:e,setSummary:n,setSelectedJob:a,navigate:r,refreshProjectsAndPrices:s,refreshJobPrices:o}){const l=C(($,h)=>{t(y=>y.map(w=>w.id===$?{...w,...h}:w)),a(y=>y&&y.id===$?{...y,...h}:y)},[]),d=C(async($,h)=>{const y=await Z(`/jobs/${$}`,h,"Failed to update job.");if(!(y!=null&&y.job))return null;const{job:w}=y;return l($,w),w},[l]),c=C(($,h)=>{d($,h)},[d]),_=C(async($,h)=>{await d($,{project_id:h})&&s()},[d,s]),i=C(($,h)=>{c($,{status_override:h})},[c]),p=C(($,h)=>{c($,{extra_labor_minutes:h})},[c]),v=C($=>{a(null),r(`/projects/${$}`)},[r]),m=C(()=>{o(!0),s()},[o,s]),b=C(async()=>{m();try{const $=await it("/summary","Failed to refresh summary.");n($),Y("Pricing refreshed from updated rates.","success")}catch($){const h=$ instanceof Error?$.message:"Updated rates saved, but summary refresh failed.";Y(h,"error")}},[m,n]),u=C(async()=>{const[$,h]=await Promise.all([it("/ui/data","Failed to refresh jobs."),it("/projects","Failed to refresh projects.")]);t(()=>$.jobs),e(h.projects),m()},[m,e]);return{closeModal:C(()=>a(null),[]),patchJob:d,handleJobProjectChange:_,handleJobStatusChange:i,handleJobExtraLaborChange:p,handleNavigateToProject:v,handleRatesChanged:b,handleAutoGroup:u}}function ya({selectedJob:t,closeModal:e,patchJob:n,projects:a,handleJobProjectChange:r,handleJobStatusChange:s,handleJobExtraLaborChange:o,handleNavigateToProject:l}){return t?lt`<${Nn}
    key=${t.id}
    job=${t}
    onClose=${e}
    onPatch=${n}
    projects=${a}
    onJobProjectChange=${r}
    onJobStatusChange=${s}
    onJobExtraLaborChange=${o}
    onNavigateToProject=${l}
  />`:null}function wa(t){const e=C(r=>t.setProjects(r),[t.setProjects]),n=C(r=>t.setSummary(r),[t.setSummary]),a=C(r=>t.setDataRange(r),[t.setDataRange]);return $a({setJobs:t.setJobs,setProjects:e,setProjectPrices:t.setProjectPrices,setSummary:n,setDataRange:a,toast:Y})}function Ca(){const t=ha(),[e,n]=Ot(),{loading:a,projectsLoading:r,loadProgress:s,error:o,bootStatus:l,refreshProjectsAndPrices:d,refreshJobPrices:c}=wa(t),{devices:_,isFiltered:i,filtered:p,sorted:v,handleSort:m,route:b}=ga({jobs:t.jobs,q:t.q,statusFilter:t.statusFilter,deviceFilter:t.deviceFilter,sortCol:t.sortCol,sortDir:t.sortDir,setSortCol:t.setSortCol,setSortDir:t.setSortDir,loc:e}),{closeModal:u,patchJob:f,handleJobProjectChange:$,handleJobStatusChange:h,handleJobExtraLaborChange:y,handleNavigateToProject:w,handleRatesChanged:k,handleAutoGroup:S}=ba({setJobs:t.setJobs,setProjects:t.setProjects,setSummary:t.setSummary,setSelectedJob:t.setSelectedJob,navigate:n,refreshProjectsAndPrices:d,refreshJobPrices:c});return a?lt`<${la} bootStatus=${l} loadProgress=${s} />`:o?lt`<${ca} error=${o} />`:lt`
    <${gn} summary=${t.summary} dataRange=${t.dataRange} />
    ${va({route:b,summary:t.summary,projects:t.projects,setProjects:t.setProjects,jobs:t.jobs,projectsLoading:r,navigate:n,setSelectedJob:t.setSelectedJob,handleJobProjectChange:$,handleRatesChanged:k,handleAutoGroup:S,projectPrices:t.projectPrices,q:t.q,setQ:t.setQ,statusFilter:t.statusFilter,setStatusFilter:t.setStatusFilter,deviceFilter:t.deviceFilter,setDeviceFilter:t.setDeviceFilter,devices:_,view:t.view,setView:t.setView,density:t.density,setDensity:t.setDensity,filtered:p,isFiltered:i,sorted:v,sortCol:t.sortCol,sortDir:t.sortDir,handleSort:m})}
    <${ya}
      selectedJob=${t.selectedJob}
      closeModal=${u}
      patchJob=${f}
      projects=${t.projects}
      handleJobProjectChange=${$}
      handleJobStatusChange=${h}
      handleJobExtraLaborChange=${y}
      handleNavigateToProject=${w}
    />
    <${Ye} />
  `}const ka=lt`<${le} base="/ui"><${Ca} /></${le}>`;He(ka,document.getElementById("app"));
