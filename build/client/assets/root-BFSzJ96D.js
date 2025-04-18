import{j as t}from"./jsx-runtime-0DLF9kdB.js";import{b as d,_ as f,M as y,L as x,S}from"./components-CQPILEQA.js";import{d as j,g as w,O as g}from"./index-c8PDHbrJ.js";import{r as n}from"./index-DPt4QELZ.js";import{a as k}from"./index-DNjveeGC.js";import"./index-D6BBZwr8.js";/**
 * @remix-run/react v2.16.5
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let a="positions";function M({getKey:r,...l}){let{isSpaMode:c}=d(),o=j(),m=w();k({getKey:r,storageKey:a});let p=n.useMemo(()=>{if(!r)return null;let e=r(o,m);return e!==o.key?e:null},[]);if(c)return null;let h=((e,u)=>{if(!window.history.state||!window.history.state.key){let s=Math.random().toString(32).slice(2);window.history.replaceState({key:s},"")}try{let i=JSON.parse(sessionStorage.getItem(e)||"{}")[u||window.history.state.key];typeof i=="number"&&window.scrollTo(0,i)}catch(s){console.error(s),sessionStorage.removeItem(e)}}).toString();return n.createElement("script",f({},l,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${h})(${JSON.stringify(a)}, ${JSON.stringify(p)})`}}))}function E(){return t.jsxs("html",{children:[t.jsxs("head",{children:[t.jsx("meta",{charSet:"utf-8"}),t.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),t.jsx("link",{rel:"preconnect",href:"https://cdn.shopify.com/"}),t.jsx("link",{rel:"stylesheet",href:"https://cdn.shopify.com/static/fonts/inter/v4/styles.css"}),t.jsx(y,{}),t.jsx(x,{})]}),t.jsxs("body",{children:[t.jsx(g,{}),t.jsx(M,{}),t.jsx(S,{})]})]})}export{E as default};
