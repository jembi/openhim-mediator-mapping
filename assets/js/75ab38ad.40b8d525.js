"use strict";(self.webpackChunkmapping_mediator=self.webpackChunkmapping_mediator||[]).push([[662],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return m}});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),u=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=u(e.components);return a.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),d=u(n),m=r,f=d["".concat(s,".").concat(m)]||d[m]||c[m]||o;return n?a.createElement(f,l(l({ref:t},p),{},{components:n})):a.createElement(f,l({ref:t},p))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,l=new Array(o);l[0]=d;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var u=2;u<o;u++)l[u]=n[u];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},8215:function(e,t,n){var a=n(7294);t.Z=function(e){var t=e.children,n=e.hidden,r=e.className;return a.createElement("div",{role:"tabpanel",hidden:n,className:r},t)}},6396:function(e,t,n){n.d(t,{Z:function(){return d}});var a=n(3117),r=n(7294),o=n(2389),l=n(9443);var i=function(){var e=(0,r.useContext)(l.Z);if(null==e)throw new Error('"useUserPreferencesContext" is used outside of "Layout" component.');return e},s=n(6681),u=n(6010),p="tabItem_1uMI";function c(e){var t,n,o,l=e.lazy,c=e.block,d=e.defaultValue,m=e.values,f=e.groupId,h=e.className,k=r.Children.map(e.children,(function(e){if((0,r.isValidElement)(e)&&void 0!==e.props.value)return e;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')})),g=null!=m?m:k.map((function(e){var t=e.props;return{value:t.value,label:t.label,attributes:t.attributes}})),b=(0,s.lx)(g,(function(e,t){return e.value===t.value}));if(b.length>0)throw new Error('Docusaurus error: Duplicate values "'+b.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.');var v=null===d?d:null!=(t=null!=d?d:null==(n=k.find((function(e){return e.props.default})))?void 0:n.props.value)?t:null==(o=k[0])?void 0:o.props.value;if(null!==v&&!g.some((function(e){return e.value===v})))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+v+'" but none of its children has the corresponding value. Available values are: '+g.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");var y=i(),N=y.tabGroupChoices,w=y.setTabGroupChoices,x=(0,r.useState)(v),q=x[0],T=x[1],C=[],O=(0,s.o5)().blockElementScrollPositionUntilNextRender;if(null!=f){var E=N[f];null!=E&&E!==q&&g.some((function(e){return e.value===E}))&&T(E)}var j=function(e){var t=e.currentTarget,n=C.indexOf(t),a=g[n].value;a!==q&&(O(t),T(a),null!=f&&w(f,a))},S=function(e){var t,n=null;switch(e.key){case"ArrowRight":var a=C.indexOf(e.currentTarget)+1;n=C[a]||C[0];break;case"ArrowLeft":var r=C.indexOf(e.currentTarget)-1;n=C[r]||C[C.length-1]}null==(t=n)||t.focus()};return r.createElement("div",{className:"tabs-container"},r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,u.Z)("tabs",{"tabs--block":c},h)},g.map((function(e){var t=e.value,n=e.label,o=e.attributes;return r.createElement("li",(0,a.Z)({role:"tab",tabIndex:q===t?0:-1,"aria-selected":q===t,key:t,ref:function(e){return C.push(e)},onKeyDown:S,onFocus:j,onClick:j},o,{className:(0,u.Z)("tabs__item",p,null==o?void 0:o.className,{"tabs__item--active":q===t})}),null!=n?n:t)}))),l?(0,r.cloneElement)(k.filter((function(e){return e.props.value===q}))[0],{className:"margin-vert--md"}):r.createElement("div",{className:"margin-vert--md"},k.map((function(e,t){return(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==q})}))))}function d(e){var t=(0,o.Z)();return r.createElement(c,(0,a.Z)({key:String(t)},e))}},9918:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return u},contentTitle:function(){return p},metadata:function(){return c},toc:function(){return d},default:function(){return f}});var a=n(3117),r=n(102),o=(n(7294),n(3905)),l=n(6396),i=n(8215),s=["components"],u={id:"state-management",title:"State Management",sidebar_label:"State Management"},p=void 0,c={unversionedId:"features/state-management",id:"features/state-management",title:"State Management",description:"The State Management features within each endpoints allows the implementer to define a set of values to extract from the available data points within each endpoint request",source:"@site/docs/features/state-management.md",sourceDirName:"features",slug:"/features/state-management",permalink:"/openhim-mediator-mapping/docs/features/state-management",editUrl:"https://github.com/jembi/openhim-mediator-mapping/edit/master/docs/docs/features/state-management.md",tags:[],version:"current",frontMatter:{id:"state-management",title:"State Management",sidebar_label:"State Management"},sidebar:"someSidebar",previous:{title:"Mapping",permalink:"/openhim-mediator-mapping/docs/features/mapping"}},d=[{value:"How does this work?",id:"how-does-this-work",children:[],level:2},{value:"State Management in practice",id:"state-management-in-practice",children:[],level:2},{value:"Include or Exclude saved states",id:"include-or-exclude-saved-states",children:[],level:2}],m={toc:d};function f(e){var t=e.components,n=(0,r.Z)(e,s);return(0,o.kt)("wrapper",(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"The State Management features within each endpoints allows the implementer to define a set of values to extract from the available data points within each endpoint request"),(0,o.kt)("p",null,"These state properties are saved into the database which can be used by a subsequent request to extract and make use of within the current request."),(0,o.kt)("p",null,"By default, some system state values are captured on each request. Currently these include:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Timestamps",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"Start / End timestamps of the main endpoint request"),(0,o.kt)("li",{parentName:"ul"},"Start / End timestamps for each external lookup request that is defined")))),(0,o.kt)("h2",{id:"how-does-this-work"},"How does this work?"),(0,o.kt)("p",null,"When creating a new ",(0,o.kt)("inlineCode",{parentName:"p"},"endpoint")," you can supply a section called ",(0,o.kt)("inlineCode",{parentName:"p"},"state")," to the root of the ",(0,o.kt)("inlineCode",{parentName:"p"},"endpoint")," schema."),(0,o.kt)("p",null,"This object will contain all the details required for extracting your relevant state property."),(0,o.kt)("p",null,"There are currently 4 data points that we are able to extract data values from."),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"requestBody - Values extracted from the incoming request body"),(0,o.kt)("li",{parentName:"ul"},"responseBody - Values extracted outgoing response body"),(0,o.kt)("li",{parentName:"ul"},"query - Values extracted from the query parameters"),(0,o.kt)("li",{parentName:"ul"},"lookupRequests - Values extracted from the incoming request body")),(0,o.kt)("p",null,"Specify your desired values to be extracted from the various data points that exist so that it can be used in any follow up request that is made"),(0,o.kt)("h2",{id:"state-management-in-practice"},"State Management in practice"),(0,o.kt)("p",null,"The example is just to illustrate how to go about storing state values. These state values can then be used when ",(0,o.kt)("a",{parentName:"p",href:"/openhim-mediator-mapping/docs/features/transformation"},"constructing the new response payload")),(0,o.kt)("p",null,"The below state management makes use of the below data points:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"system.timestamps")," - Extract the timestamp of the last time this endpoint was triggered",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"Used to populate the ",(0,o.kt)("inlineCode",{parentName:"li"},"_since")," query parameter for the ",(0,o.kt)("inlineCode",{parentName:"li"},"lookup1")," request"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"requestBody")," - Values extracted from the incoming request body",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"Used to extract the ",(0,o.kt)("inlineCode",{parentName:"li"},"submittedBy"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"organisationId")," and ",(0,o.kt)("inlineCode",{parentName:"li"},"facilityId")," from the incoming request payload"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"responseBody")," - Values extracted outgoing response body",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"Used to extract the ",(0,o.kt)("inlineCode",{parentName:"li"},"totals.count")," from the response payload"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"query")," - Values extracted from the query parameters",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"Used to extract the ",(0,o.kt)("inlineCode",{parentName:"li"},"page")," query parameter from the incoming request"),(0,o.kt)("li",{parentName:"ul"},"Used to populate the ",(0,o.kt)("inlineCode",{parentName:"li"},"page")," query parameter for the ",(0,o.kt)("inlineCode",{parentName:"li"},"lookup1")," request"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"lookupRequests")," - Values extracted from the incoming request body",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"Used to extract the ",(0,o.kt)("inlineCode",{parentName:"li"},"count")," from the ",(0,o.kt)("inlineCode",{parentName:"li"},"lookup1")," response payload and the ",(0,o.kt)("inlineCode",{parentName:"li"},"metrics.queries.count")," from the ",(0,o.kt)("inlineCode",{parentName:"li"},"request1")," response payload")))),(0,o.kt)(l.Z,{defaultValue:"endpoint",values:[{label:"Endpoint Schema",value:"endpoint"},{label:"Request",value:"request"},{label:"Response Payload",value:"response"},{label:"Lookup Payloads",value:"lookup"}],mdxType:"Tabs"},(0,o.kt)(i.Z,{value:"endpoint",mdxType:"TabItem"},(0,o.kt)("p",null,"Below is a basic example of the ",(0,o.kt)("inlineCode",{parentName:"p"},"state")," object within the ",(0,o.kt)("inlineCode",{parentName:"p"},"endpoint")," schema"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json",metastring:"{10-30}","{10-30}":!0},'{\n  "name": "A Sample Endpoint",\n  "endpoint": {\n    "pattern": "/sample-endpoint"\n  },\n  "transformation": {\n    "input": "JSON",\n    "output": "JSON"\n  },\n  "state": {\n    "extract": {\n      "requestBody": {\n        "organisationId": "organisation[0].facilityId"\n      },\n      "responseBody": {\n        "totalProcessed": "totals.count"\n      },\n      "query": {\n        "pageNumber": "page"\n      },\n      "lookupRequests": {\n        "lookup1": {\n          "totalProcessed": "count"\n        },\n        "request1": {\n          "totalProcessed": "metrics.queries.count"\n        }\n      }\n    }\n  },\n  "requests": {\n    "lookup": [\n      {\n        "id": "lookup1",\n        "config": {\n          "method": "get",\n          "url": "http://localhost/lookup",\n          "headers": {\n            "Content-Type": "application/json"\n          },\n          "params": {\n             "query": {\n                "_since": {\n                "path": "state.system.timestamps.lookupRequests.lookup1.requestStart",\n                "prefix": null,\n                "postfix": null\n              },\n              "page": {\n                "path": "state.query.pageNumber",\n                "prefix": null,\n                "postfix": null\n              }\n            }\n          }\n        }\n      }\n    ],\n    "response": [\n      {\n        "id": "request1",\n        "config": {\n          "method": "post",\n          "url": "http://localhost/request",\n          "headers": {\n            "Content-Type": "application/json"\n          }\n        }\n      }\n    ]\n  }\n}\n'))),(0,o.kt)(i.Z,{value:"request",mdxType:"TabItem"},(0,o.kt)("p",null,"The sample ",(0,o.kt)("inlineCode",{parentName:"p"},"state")," schema definition shows us how we extract certain data points but without context of the incoming document it makes it a bit harder to understand."),(0,o.kt)("p",null,"Lets make use of a sample ",(0,o.kt)("inlineCode",{parentName:"p"},"payload.json")," document that will be sent to this endpoint to indicate the data points we will be extracting."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "submittedBy": "e52b5c52-7dd5-4eb3-a5c3-dd9700c649aa",\n  "organisation": [\n    {\n      "organisationId": "bad129c3-fd48-41f3-b074-a9a4a92bb84f",\n    }\n  ],\n  "facility": [\n    {\n      "facilityId": "a0abcf47-e16b-4247-bac2-b70b783a6641",\n    }\n  ]\n}\n')),(0,o.kt)("p",null,"The sample POST request to this endpoint would look like the below:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-curl"},'curl -X POST -d "@payload.xml" -H "Content-Type: application/xml" http://localhost:3003/sample-endpoint?page=10\n'))),(0,o.kt)(i.Z,{value:"response",mdxType:"TabItem"},(0,o.kt)("p",null,"Main response payload:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "totals": {\n    "count": 227\n  }\n}\n'))),(0,o.kt)(i.Z,{value:"lookup",mdxType:"TabItem"},(0,o.kt)("p",null,"Lookup1 response payload:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "count": 20\n}\n')),(0,o.kt)("p",null,"request1 response payload:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "metrics": {\n    "queries": {\n      "count": 45\n    }\n  }\n}\n')))),(0,o.kt)("h2",{id:"include-or-exclude-saved-states"},"Include or Exclude saved states"),(0,o.kt)("p",null,"When using endpoint state we can configure our endpoint to only use saved states if they received a specific http response or no network errors.\nThis is useful for polling data and ignoring request attempts that failed due to network or server issues.\nSee below for an example config:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'  "state": {\n    "config": {\n      "networkErrors": "exclude",\n      "includeStatuses": ["2xx"]\n    },\n    "extract": {...}\n  }\n')),(0,o.kt)("p",null,"The config above would not read any saved state data where there were network errors or where the https status was not in the 2xx range.\nIf the latest state in the DB recorded a network error the next chronological state without errors would be returned."))}f.isMDXComponent=!0}}]);