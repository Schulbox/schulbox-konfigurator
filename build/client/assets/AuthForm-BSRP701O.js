import{j as e}from"./jsx-runtime-0DLF9kdB.js";import{c as n}from"./components-CQPILEQA.js";import"./index-DPt4QELZ.js";import"./index-DNjveeGC.js";import"./index-D6BBZwr8.js";import"./index-c8PDHbrJ.js";function d({mode:i}){const r=n(),t=i==="register";return e.jsxs("form",{method:"post",children:[t&&e.jsxs(e.Fragment,{children:[e.jsx("input",{name:"vorname",placeholder:"Vorname",required:!0}),e.jsx("input",{name:"nachname",placeholder:"Nachname",required:!0})]}),e.jsx("input",{name:"email",type:"email",placeholder:"E-Mail",required:!0}),e.jsx("input",{name:"password",type:"password",placeholder:"Passwort",required:!0}),e.jsx("input",{type:"hidden",name:"redirectTo",value:window.location.pathname}),e.jsx("button",{type:"submit",children:t?"Registrieren":"Einloggen"}),(r==null?void 0:r.error)&&e.jsx("p",{className:"text-red-500",children:r.error})]})}export{d as default};
