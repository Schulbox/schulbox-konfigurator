import{R as r,r as s,j as a}from"./index-B3ts7GOF.js";import{p as I,A as T}from"./styles-D7QnGEGN.js";import{u as C,c as F,F as L}from"./components-BMtjqD3P.js";import{c as b,w as d,B as h,I as k,a as P,T as x,i as S,P as v,C as A,d as B,b as D}from"./Page-BEGjlRVU.js";import"./context-Dnjp4kKx.js";import"./index-C38EnwDo.js";import"./index-BkUYTdRf.js";import"./index-CebVLIw1.js";var m={Item:"Polaris-FormLayout__Item",grouped:"Polaris-FormLayout--grouped",condensed:"Polaris-FormLayout--condensed"};function f({children:e,condensed:t=!1}){const o=b(m.Item,t?m.condensed:m.grouped);return e?r.createElement("div",{className:o},e):null}function y({children:e,condensed:t,title:o,helpText:n}){const l=s.useId();let c=null,i,u=null,p;n&&(i=`${l}HelpText`,c=r.createElement(P,{id:i,color:"text-secondary"},n)),o&&(p=`${l}Title`,u=r.createElement(x,{id:p,as:"p"},o));const E=s.Children.map(e,j=>d(j,f,{condensed:t}));return r.createElement(h,{role:"group",gap:"200","aria-labelledby":p,"aria-describedby":i},u,r.createElement(k,{gap:"300"},E),c)}const g=s.memo(function({children:t}){return r.createElement(h,{gap:"400"},s.Children.map(t,w))});g.Group=y;function w(e,t){return S(e,y)?e:d(e,f,{key:t})}const W=()=>[{rel:"stylesheet",href:I}];function q(){const e=C(),t=F(),[o,n]=s.useState(""),{errors:l}=t||e;return a.jsx(T,{i18n:e.polarisTranslations,children:a.jsx(v,{children:a.jsx(A,{children:a.jsx(L,{method:"post",children:a.jsxs(g,{children:[a.jsx(x,{variant:"headingMd",as:"h2",children:"Log in"}),a.jsx(B,{type:"text",name:"shop",label:"Shop domain",helpText:"example.myshopify.com",value:o,onChange:n,autoComplete:"on",error:l.shop}),a.jsx(D,{submit:!0,children:"Log in"})]})})})})})}export{q as default,W as links};
