import{j as t}from"./jsx-runtime-0DLF9kdB.js";import{b as d,c as f,_ as y,M as x,L as S,S as j}from"./components-6rj1h1gw.js";import{u as w,a as g,O as k}from"./index-D6W9wfXS.js";import{r as n}from"./index-DPt4QELZ.js";import"./index-D6BBZwr8.js";/**
 * @remix-run/react v2.16.5
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let a="positions";function M({getKey:r,...l}){let{isSpaMode:c}=d(),o=w(),p=g();f({getKey:r,storageKey:a});let m=n.useMemo(()=>{if(!r)return null;let e=r(o,p);return e!==o.key?e:null},[]);if(c)return null;let u=((e,h)=>{if(!window.history.state||!window.history.state.key){let s=Math.random().toString(32).slice(2);window.history.replaceState({key:s},"")}try{let i=JSON.parse(sessionStorage.getItem(e)||"{}")[h||window.history.state.key];typeof i=="number"&&window.scrollTo(0,i)}catch(s){console.error(s),sessionStorage.removeItem(e)}}).toString();return n.createElement("script",y({},l,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${u})(${JSON.stringify(a)}, ${JSON.stringify(m)})`}}))}function b(){return t.jsxs("html",{children:[t.jsxs("head",{children:[t.jsx("meta",{charSet:"utf-8"}),t.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),t.jsx("link",{rel:"preconnect",href:"https://cdn.shopify.com/"}),t.jsx("link",{rel:"stylesheet",href:"https://cdn.shopify.com/static/fonts/inter/v4/styles.css"}),t.jsx(x,{}),t.jsx(S,{})]}),t.jsxs("body",{children:[t.jsx(k,{}),t.jsx(M,{}),t.jsx(j,{})]})]})}export{b as default};
