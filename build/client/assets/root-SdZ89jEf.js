import{r as n,j as t}from"./index-B3ts7GOF.js";import{b as d,_ as f,M as y,L as x,S}from"./components-BMtjqD3P.js";import{d as j,g as w,O as g}from"./index-CebVLIw1.js";import{a as k}from"./index-C38EnwDo.js";import"./index-BkUYTdRf.js";/**
 * @remix-run/react v2.16.5
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let a="positions";function M({getKey:r,...l}){let{isSpaMode:c}=d(),o=j(),p=w();k({getKey:r,storageKey:a});let m=n.useMemo(()=>{if(!r)return null;let e=r(o,p);return e!==o.key?e:null},[]);if(c)return null;let h=((e,u)=>{if(!window.history.state||!window.history.state.key){let s=Math.random().toString(32).slice(2);window.history.replaceState({key:s},"")}try{let i=JSON.parse(sessionStorage.getItem(e)||"{}")[u||window.history.state.key];typeof i=="number"&&window.scrollTo(0,i)}catch(s){console.error(s),sessionStorage.removeItem(e)}}).toString();return n.createElement("script",f({},l,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${h})(${JSON.stringify(a)}, ${JSON.stringify(m)})`}}))}function b(){return t.jsxs("html",{children:[t.jsxs("head",{children:[t.jsx("meta",{charSet:"utf-8"}),t.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),t.jsx("link",{rel:"preconnect",href:"https://cdn.shopify.com/"}),t.jsx("link",{rel:"stylesheet",href:"https://cdn.shopify.com/static/fonts/inter/v4/styles.css"}),t.jsx(y,{}),t.jsx(x,{})]}),t.jsxs("body",{children:[t.jsx(g,{}),t.jsx(M,{}),t.jsx(S,{})]})]})}export{b as default};
