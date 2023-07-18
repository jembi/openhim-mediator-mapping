"use strict";(self.webpackChunkmapping_mediator=self.webpackChunkmapping_mediator||[]).push([[581],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return m}});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,l=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),s=p(n),m=o,f=s["".concat(l,".").concat(m)]||s[m]||d[m]||i;return n?r.createElement(f,a(a({ref:t},u),{},{components:n})):r.createElement(f,a({ref:t},u))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=s;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:o,a[1]=c;for(var p=2;p<i;p++)a[p]=n[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},1274:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return c},contentTitle:function(){return l},metadata:function(){return p},toc:function(){return u},default:function(){return s}});var r=n(3117),o=n(102),i=(n(7294),n(3905)),a=["components"],c={id:"introduction",title:"Introduction",sidebar_label:"Introduction"},l=void 0,p={unversionedId:"gettingStarted/introduction",id:"gettingStarted/introduction",title:"Introduction",description:"The OpenHIM Mediator Mapping is a generic mapping tool that can help facilitate many common data exchange needs.",source:"@site/docs/gettingStarted/introduction.md",sourceDirName:"gettingStarted",slug:"/gettingStarted/introduction",permalink:"/openhim-mediator-mapping/docs/gettingStarted/introduction",editUrl:"https://github.com/jembi/openhim-mediator-mapping/edit/master/docs/docs/gettingStarted/introduction.md",tags:[],version:"current",frontMatter:{id:"introduction",title:"Introduction",sidebar_label:"Introduction"},sidebar:"someSidebar",next:{title:"Quick Start",permalink:"/openhim-mediator-mapping/docs/gettingStarted/quick-start"}},u=[],d={toc:u};function s(e){var t=e.components,n=(0,o.Z)(e,a);return(0,i.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"The OpenHIM Mediator Mapping is a generic mapping tool that can help facilitate many common data exchange needs."),(0,i.kt)("p",null,"The aim of the OpenHIM Mediator Mapping is to simplify implementing business logic without needing developers to create the business flows."),(0,i.kt)("p",null,"A non-technical person can define the configuration and the Mapping Mediator will do the rest."),(0,i.kt)("p",null,"Some of the features the OpenHIM Mediator Mapping caters for are as follows:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Content Negotiation"),(0,i.kt)("li",{parentName:"ul"},"Validation"),(0,i.kt)("li",{parentName:"ul"},"Transformation"),(0,i.kt)("li",{parentName:"ul"},"Data manipulations"),(0,i.kt)("li",{parentName:"ul"},"External requests"),(0,i.kt)("li",{parentName:"ul"},"State management")),(0,i.kt)("p",null,"What makes the OpenHIM Mediator Mapping so powerful is that it can be used for a wide range of use cases, ranging from the very basic of ensuring data quality by using the validation mechanism, or more complex use cases where it performs data validation, external lookups, data transformation and manipulations."),(0,i.kt)("p",null,"Even more complex workflows can be configured by allowing ",(0,i.kt)("inlineCode",{parentName:"p"},"endpoints")," to call other ",(0,i.kt)("inlineCode",{parentName:"p"},"endpoints")," and chaining them together to achieve a desired workflow."))}s.isMDXComponent=!0}}]);