"use strict";(self.webpackChunkmapping_mediator=self.webpackChunkmapping_mediator||[]).push([[534],{3905:function(e,t,n){n.d(t,{Zo:function(){return s},kt:function(){return m}});var a=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=a.createContext({}),u=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},s=function(e){var t=u(e.components);return a.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,p=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),c=u(n),m=i,h=c["".concat(p,".").concat(m)]||c[m]||d[m]||r;return n?a.createElement(h,o(o({ref:t},s),{},{components:n})):a.createElement(h,o({ref:t},s))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=c;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var u=2;u<r;u++)o[u]=n[u];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},8215:function(e,t,n){var a=n(7294);t.Z=function(e){var t=e.children,n=e.hidden,i=e.className;return a.createElement("div",{role:"tabpanel",hidden:n,className:i},t)}},6396:function(e,t,n){n.d(t,{Z:function(){return c}});var a=n(3117),i=n(7294),r=n(2389),o=n(9443);var l=function(){var e=(0,i.useContext)(o.Z);if(null==e)throw new Error('"useUserPreferencesContext" is used outside of "Layout" component.');return e},p=n(6681),u=n(6010),s="tabItem_1uMI";function d(e){var t,n,r,o=e.lazy,d=e.block,c=e.defaultValue,m=e.values,h=e.groupId,f=e.className,v=i.Children.map(e.children,(function(e){if((0,i.isValidElement)(e)&&void 0!==e.props.value)return e;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')})),b=null!=m?m:v.map((function(e){var t=e.props;return{value:t.value,label:t.label,attributes:t.attributes}})),y=(0,p.lx)(b,(function(e,t){return e.value===t.value}));if(y.length>0)throw new Error('Docusaurus error: Duplicate values "'+y.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.');var g=null===c?c:null!=(t=null!=c?c:null==(n=v.find((function(e){return e.props.default})))?void 0:n.props.value)?t:null==(r=v[0])?void 0:r.props.value;if(null!==g&&!b.some((function(e){return e.value===g})))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+g+'" but none of its children has the corresponding value. Available values are: '+b.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");var k=l(),w=k.tabGroupChoices,N=k.setTabGroupChoices,T=(0,i.useState)(g),j=T[0],C=T[1],O=[],E=(0,p.o5)().blockElementScrollPositionUntilNextRender;if(null!=h){var x=w[h];null!=x&&x!==j&&b.some((function(e){return e.value===x}))&&C(x)}var q=function(e){var t=e.currentTarget,n=O.indexOf(t),a=b[n].value;a!==j&&(E(t),C(a),null!=h&&N(h,a))},V=function(e){var t,n=null;switch(e.key){case"ArrowRight":var a=O.indexOf(e.currentTarget)+1;n=O[a]||O[0];break;case"ArrowLeft":var i=O.indexOf(e.currentTarget)-1;n=O[i]||O[O.length-1]}null==(t=n)||t.focus()};return i.createElement("div",{className:"tabs-container"},i.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,u.Z)("tabs",{"tabs--block":d},f)},b.map((function(e){var t=e.value,n=e.label,r=e.attributes;return i.createElement("li",(0,a.Z)({role:"tab",tabIndex:j===t?0:-1,"aria-selected":j===t,key:t,ref:function(e){return O.push(e)},onKeyDown:V,onFocus:q,onClick:q},r,{className:(0,u.Z)("tabs__item",s,null==r?void 0:r.className,{"tabs__item--active":j===t})}),null!=n?n:t)}))),o?(0,i.cloneElement)(v.filter((function(e){return e.props.value===j}))[0],{className:"margin-vert--md"}):i.createElement("div",{className:"margin-vert--md"},v.map((function(e,t){return(0,i.cloneElement)(e,{key:t,hidden:e.props.value!==j})}))))}function c(e){var t=(0,r.Z)();return i.createElement(d,(0,a.Z)({key:String(t)},e))}},1341:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return u},contentTitle:function(){return s},metadata:function(){return d},toc:function(){return c},default:function(){return h}});var a=n(3117),i=n(102),r=(n(7294),n(3905)),o=n(6396),l=n(8215),p=["components"],u={id:"validation",title:"Validation",sidebar_label:"Validation"},s=void 0,d={unversionedId:"features/validation",id:"features/validation",title:"Validation",description:"The Validation feature within each endpoints allows the implementer to define a definition of validation rules that the incoming payload needs to adhere to for it to be considered a valid payload.",source:"@site/docs/features/validation.md",sourceDirName:"features",slug:"/features/validation",permalink:"/openhim-mediator-mapping/docs/features/validation",editUrl:"https://github.com/jembi/openhim-mediator-mapping/edit/master/docs/docs/features/validation.md",tags:[],version:"current",frontMatter:{id:"validation",title:"Validation",sidebar_label:"Validation"},sidebar:"someSidebar",previous:{title:"Content Negotiation",permalink:"/openhim-mediator-mapping/docs/features/content-negotiation"},next:{title:"Orchestrations",permalink:"/openhim-mediator-mapping/docs/features/orchestration"}},c=[{value:"How does this work?",id:"how-does-this-work",children:[],level:2},{value:"Validation in practice",id:"validation-in-practice",children:[],level:2}],m={toc:c};function h(e){var t=e.components,n=(0,i.Z)(e,p);return(0,r.kt)("wrapper",(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"The Validation feature within each endpoints allows the implementer to define a definition of validation rules that the incoming payload needs to adhere to for it to be considered a valid payload.\nThis features can be used completely on its own without having to execute any of the other features if you purely just want to validate a payload to ensure data quality."),(0,r.kt)("p",null,"Applying the validation feature is recommended but optional. The level of validation is completely configurable by the user. Any fields that don't require validation can be left out of the validation schema."),(0,r.kt)("p",null,"For the validation, the module ",(0,r.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/ajv"},"AJV")," is used. The validation section of the Endpoint schema is defined in the ",(0,r.kt)("inlineCode",{parentName:"p"},"inputValidation")," section. By default, the values of the user's input properties can be set to ",(0,r.kt)("inlineCode",{parentName:"p"},"nullable"),". To prevent any ",(0,r.kt)("inlineCode",{parentName:"p"},"null")," values passing validation supply the following ",(0,r.kt)("a",{parentName:"p",href:"/openhim-mediator-mapping/docs/gettingStarted/setup#environment-variables"},"environment variable")," ",(0,r.kt)("strong",{parentName:"p"},"VALIDATION_ACCEPT_NULL_VALUES=false")," on app start up. Below is an example of the validation schema."),(0,r.kt)("h2",{id:"how-does-this-work"},"How does this work?"),(0,r.kt)("p",null,"When creating a new ",(0,r.kt)("inlineCode",{parentName:"p"},"endpoint")," you can supply a section called ",(0,r.kt)("inlineCode",{parentName:"p"},"inputValidation")," to the root of the ",(0,r.kt)("inlineCode",{parentName:"p"},"endpoint")," schema.\nThis object will contain the validation logic to be applied to the relevant data points\nBelow is an example of the structure of the AJV validation schema"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "type": "object",\n  "properties": {\n    "name": {"type": "string"},\n    "surname": {"type": "string", "nullable": true},\n    "emails": {"type": "array", "items": {"type": "string", "format": "email"}},\n    "date": {"type": "string", "format": "date-time"},\n    "id": {"type": "string", "format": "uuid"},\n    "jobs": {\n      "type": "object",\n      "properties": {"marketing": {"type": "string"}},\n      "required": ["marketing"]\n    }\n  },\n  "required": ["name", "id", "emails"]\n}\n')),(0,r.kt)("p",null,"Data types such as ",(0,r.kt)("inlineCode",{parentName:"p"},"date"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"email"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"uuid"),", etc. all inherit the type ",(0,r.kt)("inlineCode",{parentName:"p"},"string"),". To specify the type, use the keyword ",(0,r.kt)("inlineCode",{parentName:"p"},"format")," as seen above."),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"The ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/epoberezkin/ajv/blob/master/KEYWORDS.md#format"},"formats")," that are supported are: ",(0,r.kt)("strong",{parentName:"p"},"date"),", ",(0,r.kt)("strong",{parentName:"p"},"date-time"),", ",(0,r.kt)("strong",{parentName:"p"},"uri"),", ",(0,r.kt)("strong",{parentName:"p"},"email"),", ",(0,r.kt)("strong",{parentName:"p"},"hostname"),", ",(0,r.kt)("strong",{parentName:"p"},"ipv6")," and ",(0,r.kt)("strong",{parentName:"p"},"regex"),". More validation rules are available ",(0,r.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/ajv#validation-keywords"},"here"))),(0,r.kt)("p",null,"Data points that can be validated within the OpenHIM Mediator Mapping include:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"requestBody"),(0,r.kt)("li",{parentName:"ul"},"lookupRequests")),(0,r.kt)("h2",{id:"validation-in-practice"},"Validation in practice"),(0,r.kt)("p",null,"The example is just to illustrate how to go about defining the payload validation for the incoming payload for a specific ",(0,r.kt)("inlineCode",{parentName:"p"},"endpoint"),"."),(0,r.kt)("p",null,"The below Validation settings defines the following"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"Validate on the incoming ",(0,r.kt)("inlineCode",{parentName:"li"},"requestBody")," which should be an ",(0,r.kt)("inlineCode",{parentName:"li"},"Object")),(0,r.kt)("li",{parentName:"ul"},"Within the ",(0,r.kt)("inlineCode",{parentName:"li"},"requestBody")," object we expect 4 required fields to be supplied:",(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"id"),": This incoming field is a required string value that needs to match on the supplied regular expression"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"display"),": This incoming field is a required string"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"height"),": This incoming field is a required string"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"id"),": This incoming field is a required number")))),(0,r.kt)(o.Z,{defaultValue:"endpoint",values:[{label:"Endpoint Schema",value:"endpoint"},{label:"Request",value:"request"}],mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"endpoint",mdxType:"TabItem"},(0,r.kt)("p",null,"Below is a basic example of the ",(0,r.kt)("inlineCode",{parentName:"p"},"state")," object within the ",(0,r.kt)("inlineCode",{parentName:"p"},"endpoint")," schema"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json",metastring:"{6-9}","{6-9}":!0},'{\n  "name": "A Sample Endpoint",\n  "endpoint": {\n    "pattern": "/sample-endpoint"\n  },\n  "transformation": {\n    "input": "JSON",\n    "output": "JSON"\n  },\n  "inputValidation": {\n    "type": "object",\n    "properties": {\n      "requestBody": {\n        "type": "object",\n        "properties": {\n          "id": {\n            "type": "string",\n            "pattern": "[A-Za-z0-9\\\\-\\\\.]{1,64}"\n          },\n          "display": {\n            "type": "string"\n          },\n          "height": {\n            "type": "string"\n          },\n          "weight": {\n            "type": "number"\n          }\n        },\n        "required": ["id", "display", "height", "weight"]\n      }\n    }\n  }\n}\n'))),(0,r.kt)(l.Z,{value:"request",mdxType:"TabItem"},(0,r.kt)("p",null,"The sample ",(0,r.kt)("inlineCode",{parentName:"p"},"inputValidation")," schema definition shows us how the incoming payload will be validated to ensure data quality"),(0,r.kt)("p",null,"Lets make use of a sample ",(0,r.kt)("inlineCode",{parentName:"p"},"payload.json")," payload that will be sent to this endpoint to illustrate the validation of the payload"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "uuid": "e6c2e4fd-fd90-401c-8820-1abb9713944a",\n  "display": "Sample S Patient",\n  "height": "1.77",\n  "weight": "91"\n}\n')),(0,r.kt)("p",null,"The sample POST request to this endpoint would look like the below:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-curl"},'curl -X POST -d "@payload.json" -H "Content-Type: application/json" http://localhost:3003/sample-endpoint\n')))))}h.isMDXComponent=!0}}]);