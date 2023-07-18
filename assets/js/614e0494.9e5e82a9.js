"use strict";(self.webpackChunkmapping_mediator=self.webpackChunkmapping_mediator||[]).push([[157],{3905:function(e,t,r){r.d(t,{Zo:function(){return u},kt:function(){return f}});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var s=n.createContext({}),p=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},l={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),m=p(r),f=o,h=m["".concat(s,".").concat(f)]||m[f]||l[f]||a;return r?n.createElement(h,i(i({ref:t},u),{},{components:r})):n.createElement(h,i({ref:t},u))}));function f(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=m;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:o,i[1]=c;for(var p=2;p<a;p++)i[p]=r[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},999:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return c},contentTitle:function(){return s},metadata:function(){return p},toc:function(){return u},default:function(){return m}});var n=r(3117),o=r(102),a=(r(7294),r(3905)),i=["components"],c={id:"orchestration",title:"Orchestrations",sidebar_label:"Orchestrations"},s=void 0,p={unversionedId:"features/orchestration",id:"features/orchestration",title:"Orchestrations",description:"An orchestration object is created for actions performed on the input data. These orchestrations can be seen on the openhim console if the request is sent to the mapping mediator via the openhim core.",source:"@site/docs/features/orchestration.md",sourceDirName:"features",slug:"/features/orchestration",permalink:"/openhim-mediator-mapping/docs/features/orchestration",editUrl:"https://github.com/jembi/openhim-mediator-mapping/edit/master/docs/docs/features/orchestration.md",tags:[],version:"current",frontMatter:{id:"orchestration",title:"Orchestrations",sidebar_label:"Orchestrations"},sidebar:"someSidebar",previous:{title:"Validation",permalink:"/openhim-mediator-mapping/docs/features/validation"},next:{title:"Kafka Integration",permalink:"/openhim-mediator-mapping/docs/features/kafka-integration"}},u=[],l={toc:u};function m(e){var t=e.components,r=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,n.Z)({},l,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"An orchestration object is created for actions performed on the input data. These orchestrations can be seen on the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/jembi/openhim-console"},"openhim console")," if the request is sent to the mapping mediator via the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/jembi/openhim-core-js"},"openhim core"),"."),(0,a.kt)("p",null,"Orchestrations are created for the following actions"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Parsing (only when the data format is changed before the mapping)"),(0,a.kt)("li",{parentName:"ul"},"Lookups (for each lookup done)"),(0,a.kt)("li",{parentName:"ul"},"Mapping (the data transformation)"),(0,a.kt)("li",{parentName:"ul"},"Sending of mapped data to external services (for each service)")))}m.isMDXComponent=!0}}]);