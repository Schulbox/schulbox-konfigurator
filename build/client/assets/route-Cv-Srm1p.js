import{j as o}from"./jsx-runtime-0DLF9kdB.js";import{R as r,r as s}from"./index-DPt4QELZ.js";import{p as I,A as T}from"./styles-BOErra0n.js";import{u as C,c as F,F as L}from"./components-CQPILEQA.js";import{c as b,w as d,B as h,I as k,a as P,T as x,i as S,P as v,C as A,d as B,b as D}from"./Page-DhXazjXL.js";import"./context-TNnJCYzF.js";import"./index-DNjveeGC.js";import"./index-D6BBZwr8.js";import"./index-c8PDHbrJ.js";var p={Item:"Polaris-FormLayout__Item",grouped:"Polaris-FormLayout--grouped",condensed:"Polaris-FormLayout--condensed"};function f({children:e,condensed:t=!1}){const a=b(p.Item,t?p.condensed:p.grouped);return e?r.createElement("div",{className:a},e):null}function y({children:e,condensed:t,title:a,helpText:n}){const l=s.useId();let c=null,i,u=null,m;n&&(i=`${l}HelpText`,c=r.createElement(P,{id:i,color:"text-secondary"},n)),a&&(m=`${l}Title`,u=r.createElement(x,{id:m,as:"p"},a));const E=s.Children.map(e,j=>d(j,f,{condensed:t}));return r.createElement(h,{role:"group",gap:"200","aria-labelledby":m,"aria-describedby":i},u,r.createElement(k,{gap:"300"},E),c)}const g=s.memo(function({children:t}){return r.createElement(h,{gap:"400"},s.Children.map(t,w))});g.Group=y;function w(e,t){return S(e,y)?e:d(e,f,{key:t})}const q=()=>[{rel:"stylesheet",href:I}];function z(){const e=C(),t=F(),[a,n]=s.useState(""),{errors:l}=t||e;return o.jsx(T,{i18n:e.polarisTranslations,children:o.jsx(v,{children:o.jsx(A,{children:o.jsx(L,{method:"post",children:o.jsxs(g,{children:[o.jsx(x,{variant:"headingMd",as:"h2",children:"Log in"}),o.jsx(B,{type:"text",name:"shop",label:"Shop domain",helpText:"example.myshopify.com",value:a,onChange:n,autoComplete:"on",error:l.shop}),o.jsx(D,{submit:!0,children:"Log in"})]})})})})})}export{z as default,q as links};
