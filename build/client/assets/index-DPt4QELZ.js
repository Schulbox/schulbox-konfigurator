import{r as u}from"./jsx-runtime-0DLF9kdB.js";function s(e,n){for(var r=0;r<n.length;r++){const t=n[r];if(typeof t!="string"&&!Array.isArray(t)){for(const o in t)if(o!=="default"&&!(o in e)){const a=Object.getOwnPropertyDescriptor(t,o);a&&Object.defineProperty(e,o,a.get?a:{enumerable:!0,get:()=>t[o]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}function f(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function l(e){if(Object.prototype.hasOwnProperty.call(e,"__esModule"))return e;var n=e.default;if(typeof n=="function"){var r=function t(){return this instanceof t?Reflect.construct(n,arguments,this.constructor):n.apply(this,arguments)};r.prototype=n.prototype}else r={};return Object.defineProperty(r,"__esModule",{value:!0}),Object.keys(e).forEach(function(t){var o=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(r,t,o.get?o:{enumerable:!0,get:function(){return e[t]}})}),r}var c=u();const p=f(c),y=s({__proto__:null,default:p},[c]);export{p as R,y as a,l as b,f as g,c as r};
