(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{135:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return r})),n.d(t,"metadata",(function(){return p})),n.d(t,"rightToc",(function(){return s})),n.d(t,"default",(function(){return l}));var a=n(1),i=n(9),o=(n(0),n(143)),r={id:"endpoints",title:"Endpoints",sidebar_label:"Endpoints"},p={id:"endpoints",title:"Endpoints",description:"## Configuration files",source:"@site/docs/endpoints.md",permalink:"/docs/endpoints",editUrl:"https://github.com/jembi/openhim-mediator-mapping/edit/master/docs/docs/endpoints.md",sidebar_label:"Endpoints",sidebar:"someSidebar",previous:{title:"Setup",permalink:"/docs/setup"},next:{title:"Validation",permalink:"/docs/validation"}},s=[{value:"Configuration files",id:"configuration-files",children:[{value:"1. Meta Data",id:"1-meta-data",children:[]},{value:"2. Input Validation Schema",id:"2-input-validation-schema",children:[]},{value:"3. Input Mapping Schema",id:"3-input-mapping-schema",children:[]},{value:"4. Constants",id:"4-constants",children:[]},{value:"5. Output",id:"5-output",children:[]}]}],c={rightToc:s};function l(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(o.b)("wrapper",Object(a.a)({},c,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("h2",{id:"configuration-files"},"Configuration files"),Object(o.b)("p",null,"The configuration files must be stored in a directory in the root of the project named endpoints. This endpoints directory should be further broken down into sub-directories each containing a minimum of four specific files: ",Object(o.b)("inlineCode",{parentName:"p"},"meta.json"),", ",Object(o.b)("inlineCode",{parentName:"p"},"input-mapping.json"),", ",Object(o.b)("inlineCode",{parentName:"p"},"input-validation.json"),", and ",Object(o.b)("inlineCode",{parentName:"p"},"constants.json"),". ",Object(o.b)("inlineCode",{parentName:"p"},"output.json")," is optional at this point. The endpoints directory should be in the following structure:"),Object(o.b)("pre",null,Object(o.b)("code",Object(a.a)({parentName:"pre"},{className:"language-txt"}),"\u251c\u2500\u2500 Endpoints\n    \u251c\u2500\u2500 Example Patient Mapping\n        \u251c\u2500\u2500 constants.json (optional)\n        \u251c\u2500\u2500 input-mapping.json\n        \u251c\u2500\u2500 input-validation.json\n        \u251c\u2500\u2500 meta.json\n        \u251c\u2500\u2500 output.json (optional)\n    \u251c\u2500\u2500 Example Observation Mapping\n        \u251c\u2500\u2500 constants.json (optional)\n        \u251c\u2500\u2500 input-mapping.json\n        \u251c\u2500\u2500 input-validation.json\n        \u251c\u2500\u2500 meta.json\n        \u251c\u2500\u2500 output.json (optional)\n    \u251c\u2500\u2500 Example Different Patient Mapping\n        \u251c\u2500\u2500 constants.json (optional)\n        \u251c\u2500\u2500 input-mapping.json\n        \u251c\u2500\u2500 input-validation.json\n        \u251c\u2500\u2500 meta.json\n        \u251c\u2500\u2500 output.json (optional)\n")),Object(o.b)("h3",{id:"1-meta-data"},"1. Meta Data"),Object(o.b)("p",null,"The ",Object(o.b)("inlineCode",{parentName:"p"},"meta.json")," file contains the details involved for route setup. The following can be set in the ",Object(o.b)("inlineCode",{parentName:"p"},"meta.json")," file:"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},"Mapping route path"),Object(o.b)("li",{parentName:"ul"},"Expected ",Object(o.b)("strong",{parentName:"li"},"input")," message type"),Object(o.b)("li",{parentName:"ul"},"Desired ",Object(o.b)("strong",{parentName:"li"},"output")," message type")),Object(o.b)("h4",{id:"mapping-route-path"},"Mapping Route Path"),Object(o.b)("p",null,"This is the path on which the OpenHIM Mapping Mediator will listen to trigger a specific message mapping transformation."),Object(o.b)("h4",{id:"expected-input"},"Expected Input"),Object(o.b)("p",null,"Specify the expected input message type for this specific endpoint to allow the OpenHIM Mapping Mediator to successfully parse the incoming message for processing. Current accepted formats are ",Object(o.b)("inlineCode",{parentName:"p"},"JSON")," and ",Object(o.b)("inlineCode",{parentName:"p"},"XML")),Object(o.b)("h4",{id:"desired-output"},"Desired Output"),Object(o.b)("p",null,"Specify the desired output message type for this specific endpoint to allow the OpenHIM Mapping Mediator to successfully parse the outgoing message. Current accepted formats are ",Object(o.b)("inlineCode",{parentName:"p"},"JSON")," and ",Object(o.b)("inlineCode",{parentName:"p"},"XML")),Object(o.b)("h3",{id:"2-input-validation-schema"},"2. Input Validation Schema"),Object(o.b)("p",null,"To ensure good data quality, the Mapping mediator implements a validation middleware layer. This middleware layer will validate the user's input before mapping the output object. Applying the validation middleware is recommended but optional. The level of validation is completely configurable by the user. Any fields that don't require validation can be left out of the validation schema."),Object(o.b)("p",null,"For the validation, the module ",Object(o.b)("a",Object(a.a)({parentName:"p"},{href:"https://www.npmjs.com/package/ajv"}),"AJV")," is used. The validation schema has to be defined in a file named ",Object(o.b)("inlineCode",{parentName:"p"},"input-validation.json")," within your created subdirectory within ",Object(o.b)("inlineCode",{parentName:"p"},"/endpoints"),". By default, the values of the user's input properties can be set to ",Object(o.b)("inlineCode",{parentName:"p"},"nullable"),". To prevent any ",Object(o.b)("inlineCode",{parentName:"p"},"null")," values passing validation supply the following environment variable ",Object(o.b)("strong",{parentName:"p"},"VALIDATION_ACCEPT_NULL_VALUES=false")," on app start up. Below is an example of the validation schema."),Object(o.b)("pre",null,Object(o.b)("code",Object(a.a)({parentName:"pre"},{className:"language-json"}),'{\n  "type": "object",\n  "properties": {\n    "name": {"type": "string"},\n    "surname": {"type": "string", "nullable": true},\n    "emails": {"type": "array", "items": {"type": "string", "format": "email"}},\n    "date": {"type": "string", "format": "date-time"},\n    "id": {"type": "string", "format": "uuid"},\n    "jobs": {\n      "type": "object",\n      "properties": {"marketing": {"type": "string"}},\n      "required": ["marketing"]\n    }\n  },\n  "required": ["name", "id", "emails"]\n}\n')),Object(o.b)("p",null,"Data types such as ",Object(o.b)("inlineCode",{parentName:"p"},"date"),", ",Object(o.b)("inlineCode",{parentName:"p"},"email"),", ",Object(o.b)("inlineCode",{parentName:"p"},"uuid"),", etc. all inherit the type ",Object(o.b)("inlineCode",{parentName:"p"},"string"),". To specify the type, use the keyword ",Object(o.b)("inlineCode",{parentName:"p"},"format")," as seen above."),Object(o.b)("blockquote",null,Object(o.b)("p",{parentName:"blockquote"},"The ",Object(o.b)("a",Object(a.a)({parentName:"p"},{href:"https://github.com/epoberezkin/ajv/blob/master/KEYWORDS.md#format"}),"formats")," that are supported are: ",Object(o.b)("strong",{parentName:"p"},"date"),", ",Object(o.b)("strong",{parentName:"p"},"date-time"),", ",Object(o.b)("strong",{parentName:"p"},"uri"),", ",Object(o.b)("strong",{parentName:"p"},"email"),", ",Object(o.b)("strong",{parentName:"p"},"hostname"),", ",Object(o.b)("strong",{parentName:"p"},"ipv6")," and ",Object(o.b)("strong",{parentName:"p"},"regex"),". More validation rules are available ",Object(o.b)("a",Object(a.a)({parentName:"p"},{href:"https://www.npmjs.com/package/ajv#validation-keywords"}),"here"))),Object(o.b)("h3",{id:"3-input-mapping-schema"},"3. Input Mapping Schema"),Object(o.b)("p",null,"The mapping schema in the ",Object(o.b)("inlineCode",{parentName:"p"},"input-mapping.json")," JSON document defines how the incoming data will be retrieved and used to build up a new object in the desired outcome."),Object(o.b)("p",null,"The basic structure of this schema is ",Object(o.b)("inlineCode",{parentName:"p"},"key:value")," based. This means that the ",Object(o.b)("inlineCode",{parentName:"p"},"key")," of the object defines where to look for a value from the incoming document, and the ",Object(o.b)("inlineCode",{parentName:"p"},"value")," of that ",Object(o.b)("inlineCode",{parentName:"p"},"key")," defines where to populate/build the new property on the outgoing document."),Object(o.b)("p",null,"The root structure of this input mapping schema consists of two properties as defined below"),Object(o.b)("pre",null,Object(o.b)("code",Object(a.a)({parentName:"pre"},{className:"language-javascript"}),'{\n  "input": { ... },\n  "constants": { ... } // optional\n}\n')),Object(o.b)("p",null,"The root ",Object(o.b)("inlineCode",{parentName:"p"},"input")," property is used to define the mapping of the incoming document and populate/build the outgoing object. The ",Object(o.b)("inlineCode",{parentName:"p"},"constants")," property is used to make reference to the ",Object(o.b)("inlineCode",{parentName:"p"},"constants.json")," schema for using static values that do not come from the incoming document."),Object(o.b)("p",null,"The structure for both these properties are the same and are defined as below."),Object(o.b)("pre",null,Object(o.b)("code",Object(a.a)({parentName:"pre"},{className:"language-javascript"}),'{\n  "input": {\n    "rootProperty": "rootProperty", // map incoming root property to an outgoing root property\n    "rootObject.object1.object2.property": "rootObject.property", // map incoming nested property to an outgoing nested property\n    "array[]": "array", // map incoming root array to an outgoing array.\n    "rootArray[1]": "rootArray[1]", // map incoming root array at index 1 to an outgoing array at index 1 (useful when using an output.json template to override a specific index value).\n    "rootArray[].property": "rootArray[].property", // map all incoming array nested property to an outgoing array nested property. Note: not specifying an index for the array will push in the new value, instead of overriding it at the specified index\n    "rootArray[1].property": "rootArray[1].property", // map incoming array nested property at index 1 to an outgoing array nested property at index 1 (useful when using an output.json template to override a specific index value).\n    "rootObject.array[].property": "rootObject.object1.array[].property", // map incoming property that is an array of objects to an outgoing object with a nested object containing an array of objects\n  }\n}\n')),Object(o.b)("h3",{id:"4-constants"},"4. Constants"),Object(o.b)("p",null,"The constants file contains data to be used alongside the client input data. The constants file can contain values for fields required in the output data that weren't available from the original client input."),Object(o.b)("p",null,"Fields in the constants file can be referenced in the mapping schema in the ",Object(o.b)("inlineCode",{parentName:"p"},"constants")," section similar to the user input mapping."),Object(o.b)("h3",{id:"5-output"},"5. Output"),Object(o.b)("hr",null))}l.isMDXComponent=!0},143:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return m}));var a=n(0),i=n.n(a);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=i.a.createContext({}),l=function(e){var t=i.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):p({},t,{},e)),n},u=function(e){var t=l(e.components);return i.a.createElement(c.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},d=Object(a.forwardRef)((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,r=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),u=l(n),d=a,m=u["".concat(r,".").concat(d)]||u[d]||b[d]||o;return n?i.a.createElement(m,p({ref:t},c,{components:n})):i.a.createElement(m,p({ref:t},c))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,r=new Array(o);r[0]=d;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p.mdxType="string"==typeof e?e:a,r[1]=p;for(var c=2;c<o;c++)r[c]=n[c];return i.a.createElement.apply(null,r)}return i.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);