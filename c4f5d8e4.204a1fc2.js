/*! For license information please see c4f5d8e4.204a1fc2.js.LICENSE.txt */
(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{136:function(e,t,a){"use strict";a.r(t);var n=a(1),r=a(0),l=a.n(r),c=a(141),o=a.n(c),i=a(147),s=a(146),u=a(142),d=a(145),m=a(137),h=a.n(m),f=[{title:l.a.createElement("span",null,"Validation"),imageUrl:"img/undraw_docusaurus_mountain.svg",description:l.a.createElement("span",null,"Ensure that your data meets the specified criteria to adhere to your data quality standards")},{title:l.a.createElement("span",null,"Orchestration"),imageUrl:"img/undraw_docusaurus_tree.svg",description:l.a.createElement("span",null,"Perform various lookups to external services to fetch data required in the final response")},{title:l.a.createElement("span",null,"Transformation"),imageUrl:"img/undraw_docusaurus_react.svg",description:l.a.createElement("span",null,"Define a new data structure to respond with based on the data gathered within your request")}];function v(e){var t=e.imageUrl,a=e.title,n=e.description,r=Object(d.a)(t);return l.a.createElement("div",{className:o()("col col--4",h.a.feature)},r&&l.a.createElement("div",{className:"text--center"},l.a.createElement("img",{className:h.a.featureImage,src:r,alt:a})),l.a.createElement("h3",null,a),l.a.createElement("p",null,n))}t.default=function(){var e=Object(u.a)().siteConfig,t=void 0===e?{}:e;return l.a.createElement(i.a,{title:"Hello from "+t.title,description:"Description will go into a meta tag in <head />"},l.a.createElement("header",{className:o()("hero hero--primary",h.a.heroBanner)},l.a.createElement("div",{className:"container"},l.a.createElement("h1",{className:"hero__title"},t.title),l.a.createElement("p",{className:"hero__subtitle"},t.tagline),l.a.createElement("div",{className:h.a.buttons},l.a.createElement(s.a,{className:o()("button button--outline button--secondary button--lg",h.a.getStarted),to:Object(d.a)("docs/setup")},"Get Started")))),l.a.createElement("main",null,f&&f.length&&l.a.createElement("section",{className:h.a.features},l.a.createElement("div",{className:"container"},l.a.createElement("div",{className:"row"},f.map((function(e,t){return l.a.createElement(v,Object(n.a)({key:t},e))})))))))}},141:function(e,t,a){var n;!function(){"use strict";var a={}.hasOwnProperty;function r(){for(var e=[],t=0;t<arguments.length;t++){var n=arguments[t];if(n){var l=typeof n;if("string"===l||"number"===l)e.push(n);else if(Array.isArray(n)&&n.length){var c=r.apply(null,n);c&&e.push(c)}else if("object"===l)for(var o in n)a.call(n,o)&&n[o]&&e.push(o)}}return e.join(" ")}e.exports?(r.default=r,e.exports=r):void 0===(n=function(){return r}.apply(t,[]))||(e.exports=n)}()},147:function(e,t,a){"use strict";var n=a(0),r=a.n(n),l=a(153),c=a(142),o=a(145),i=a(1),s=a(9),u=a(146),d=function(){return null},m=a(148),h=a.n(m),f=a(141),v=a.n(f),p=a(118),b=a.n(p),g=function(){return r.a.createElement("span",{className:v()(b.a.toggle,b.a.moon)})},E=function(){return r.a.createElement("span",{className:v()(b.a.toggle,b.a.sun)})},k=function(e){var t=Object(c.a)().isClient;return r.a.createElement(h.a,Object(i.a)({disabled:!t,icons:{checked:r.a.createElement(g,null),unchecked:r.a.createElement(E,null)}},e))},y=function(){var e=n.useState("undefined"!=typeof document?document.documentElement.getAttribute("data-theme"):""),t=e[0],a=e[1];n.useEffect((function(){document.documentElement.setAttribute("data-theme",t)}),[t]),n.useEffect((function(){try{var e=localStorage.getItem("theme");null!==e&&a(e)}catch(t){console.error(t)}}),[a]);var r=n.useCallback((function(e){try{localStorage.setItem("theme",e),a(e)}catch(t){console.error(t)}}),[a]);return[t,r]},_=function(e){var t=Object(n.useState)(!0),a=t[0],r=t[1],l=Object(n.useState)(0),c=l[0],o=l[1],i=Object(n.useState)(0),s=i[0],u=i[1],d=Object(n.useCallback)((function(e){null!==e&&u(e.getBoundingClientRect().height)}),[]),m=function(){var e=window.pageYOffset||document.documentElement.scrollTop,t=document.documentElement.scrollHeight-s,a=window.innerHeight;e<s||(c&&e>c?r(!1):e+a<t&&r(!0),o(e))};return Object(n.useEffect)((function(){if(e)return window.addEventListener("scroll",m),function(){window.removeEventListener("scroll",m)}}),[c,s]),{navbarRef:d,isNavbarVisible:a}},N=a(119),w=a.n(N);function O(e){var t=e.to,a=e.href,n=e.label,l=(e.position,Object(s.a)(e,["to","href","label","position"])),c=Object(o.a)(t);return r.a.createElement(u.a,Object(i.a)({className:"navbar__item navbar__link"},a?{target:"_blank",rel:"noopener noreferrer",href:a}:{activeClassName:"navbar__link--active",to:c},l),n)}var j=function(){var e,t=Object(c.a)().siteConfig,a=void 0===t?{}:t,l=a.baseUrl,s=a.themeConfig,m=void 0===s?{}:s,h=m.navbar,f=void 0===h?{}:h,p=m.disableDarkMode,b=void 0!==p&&p,g=f.title,E=f.logo,N=void 0===E?{}:E,j=f.links,C=void 0===j?[]:j,S=f.hideOnScroll,x=void 0!==S&&S,T=Object(n.useState)(!1),M=T[0],P=T[1],B=Object(n.useState)(!1),F=B[0],X=B[1],L=y(),I=L[0],D=L[1],A=_(x),H=A.navbarRef,R=A.isNavbarVisible,U=Object(n.useCallback)((function(){document.body.style.overflow="hidden",P(!0)}),[P]),q=Object(n.useCallback)((function(){document.body.style.overflow="visible",P(!1)}),[P]),V=Object(n.useCallback)((function(e){return D(e.target.checked?"dark":"")}),[D]),Y=Object(o.a)(N.src);return r.a.createElement("nav",{ref:H,className:v()("navbar","navbar--light","navbar--fixed-top",(e={"navbar-sidebar--show":M},e[w.a.navbarHideable]=x,e[w.a.navbarHidden]=!R,e))},r.a.createElement("div",{className:"navbar__inner"},r.a.createElement("div",{className:"navbar__items"},r.a.createElement("div",{"aria-label":"Navigation bar toggle",className:"navbar__toggle",role:"button",tabIndex:0,onClick:U,onKeyDown:U},r.a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"30",height:"30",viewBox:"0 0 30 30",role:"img",focusable:"false"},r.a.createElement("title",null,"Menu"),r.a.createElement("path",{stroke:"currentColor",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"2",d:"M4 7h22M4 15h22M4 23h22"}))),r.a.createElement(u.a,{className:"navbar__brand",to:l},null!=N&&r.a.createElement("img",{className:"navbar__logo",src:Y,alt:N.alt}),null!=g&&r.a.createElement("strong",{className:F?w.a.hideLogoText:""},g)),C.filter((function(e){return"right"!==e.position})).map((function(e,t){return r.a.createElement(O,Object(i.a)({},e,{key:t}))}))),r.a.createElement("div",{className:"navbar__items navbar__items--right"},C.filter((function(e){return"right"===e.position})).map((function(e,t){return r.a.createElement(O,Object(i.a)({},e,{key:t}))})),!b&&r.a.createElement(k,{className:w.a.displayOnlyInLargeViewport,"aria-label":"Dark mode toggle",checked:"dark"===I,onChange:V}),r.a.createElement(d,{handleSearchBarToggle:X,isSearchBarExpanded:F}))),r.a.createElement("div",{role:"presentation",className:"navbar-sidebar__backdrop",onClick:q}),r.a.createElement("div",{className:"navbar-sidebar"},r.a.createElement("div",{className:"navbar-sidebar__brand"},r.a.createElement(u.a,{className:"navbar__brand",onClick:q,to:l},null!=N&&r.a.createElement("img",{className:"navbar__logo",src:Y,alt:N.alt}),null!=g&&r.a.createElement("strong",null,g)),!b&&M&&r.a.createElement(k,{"aria-label":"Dark mode toggle in sidebar",checked:"dark"===I,onChange:V})),r.a.createElement("div",{className:"navbar-sidebar__items"},r.a.createElement("div",{className:"menu"},r.a.createElement("ul",{className:"menu__list"},C.map((function(e,t){return r.a.createElement("li",{className:"menu__list-item",key:t},r.a.createElement(O,Object(i.a)({className:"menu__link"},e,{onClick:q})))})))))))},C=a(120),S=a.n(C);function x(e){var t=e.to,a=e.href,n=e.label,l=Object(s.a)(e,["to","href","label"]),c=Object(o.a)(t);return r.a.createElement(u.a,Object(i.a)({className:"footer__link-item"},a?{target:"_blank",rel:"noopener noreferrer",href:a}:{to:c},l),n)}var T=function(e){var t=e.url,a=e.alt;return r.a.createElement("img",{className:"footer__logo",alt:a,src:t})};var M=function(){var e=Object(c.a)().siteConfig,t=(void 0===e?{}:e).themeConfig,a=(void 0===t?{}:t).footer,n=a||{},l=n.copyright,i=n.links,s=void 0===i?[]:i,u=n.logo,d=void 0===u?{}:u,m=Object(o.a)(d.src);return a?r.a.createElement("footer",{className:v()("footer",{"footer--dark":"dark"===a.style})},r.a.createElement("div",{className:"container"},s&&s.length>0&&r.a.createElement("div",{className:"row footer__links"},s.map((function(e,t){return r.a.createElement("div",{key:t,className:"col footer__col"},null!=e.title?r.a.createElement("h4",{className:"footer__title"},e.title):null,null!=e.items&&Array.isArray(e.items)&&e.items.length>0?r.a.createElement("ul",{className:"footer__items"},e.items.map((function(e,t){return e.html?r.a.createElement("div",{key:t,dangerouslySetInnerHTML:{__html:e.html}}):r.a.createElement("li",{key:e.href||e.to,className:"footer__item"},r.a.createElement(x,e))}))):null)}))),(d||l)&&r.a.createElement("div",{className:"text--center"},d&&d.src&&r.a.createElement("div",{className:"margin-bottom--sm"},d.href?r.a.createElement("a",{href:d.href,target:"_blank",rel:"noopener noreferrer",className:S.a.footerLogoLink},r.a.createElement(T,{alt:d.alt,url:m})):r.a.createElement(T,{alt:d.alt,url:m})),l))):null};a(121);t.a=function(e){var t=Object(c.a)().siteConfig,a=void 0===t?{}:t,n=a.favicon,i=a.tagline,s=a.title,u=a.themeConfig.image,d=a.url,m=e.children,h=e.title,f=e.noFooter,v=e.description,p=e.image,b=e.keywords,g=e.permalink,E=e.version,k=h||s+" \xb7 "+i,y=p||u,_=d+Object(o.a)(y),N=Object(o.a)(n);return r.a.createElement(r.a.Fragment,null,r.a.createElement(l.a,null,r.a.createElement("html",{lang:"en"}),r.a.createElement("meta",{httpEquiv:"x-ua-compatible",content:"ie=edge"}),k&&r.a.createElement("title",null,k),k&&r.a.createElement("meta",{property:"og:title",content:k}),n&&r.a.createElement("link",{rel:"shortcut icon",href:N}),v&&r.a.createElement("meta",{name:"description",content:v}),v&&r.a.createElement("meta",{property:"og:description",content:v}),E&&r.a.createElement("meta",{name:"docsearch:version",content:E}),b&&b.length&&r.a.createElement("meta",{name:"keywords",content:b.join(",")}),y&&r.a.createElement("meta",{property:"og:image",content:_}),y&&r.a.createElement("meta",{property:"twitter:image",content:_}),y&&r.a.createElement("meta",{name:"twitter:image:alt",content:"Image for "+k}),g&&r.a.createElement("meta",{property:"og:url",content:d+g}),r.a.createElement("meta",{name:"twitter:card",content:"summary"})),r.a.createElement(j,null),r.a.createElement("div",{className:"main-wrapper"},m),!f&&r.a.createElement(M,null))}},148:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e},r=function(){function e(e,t){for(var a=0;a<t.length;a++){var n=t[a];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,a,n){return a&&e(t.prototype,a),n&&e(t,n),t}}(),l=a(0),c=m(l),o=m(a(141)),i=m(a(12)),s=m(a(149)),u=m(a(150)),d=a(151);function m(e){return e&&e.__esModule?e:{default:e}}var h=function(e){function t(e){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t);var a=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return a.handleClick=a.handleClick.bind(a),a.handleTouchStart=a.handleTouchStart.bind(a),a.handleTouchMove=a.handleTouchMove.bind(a),a.handleTouchEnd=a.handleTouchEnd.bind(a),a.handleFocus=a.handleFocus.bind(a),a.handleBlur=a.handleBlur.bind(a),a.previouslyChecked=!(!e.checked&&!e.defaultChecked),a.state={checked:!(!e.checked&&!e.defaultChecked),hasFocus:!1},a}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,e),r(t,[{key:"componentDidUpdate",value:function(e){e.checked!==this.props.checked&&this.setState({checked:!!this.props.checked})}},{key:"handleClick",value:function(e){var t=this.input;if(e.target!==t&&!this.moved)return this.previouslyChecked=t.checked,e.preventDefault(),t.focus(),void t.click();var a=this.props.hasOwnProperty("checked")?this.props.checked:t.checked;this.setState({checked:a})}},{key:"handleTouchStart",value:function(e){this.startX=(0,d.pointerCoord)(e).x,this.activated=!0}},{key:"handleTouchMove",value:function(e){if(this.activated&&(this.moved=!0,this.startX)){var t=(0,d.pointerCoord)(e).x;this.state.checked&&t+15<this.startX?(this.setState({checked:!1}),this.startX=t,this.activated=!0):t-15>this.startX&&(this.setState({checked:!0}),this.startX=t,this.activated=t<this.startX+5)}}},{key:"handleTouchEnd",value:function(e){if(this.moved){var t=this.input;if(e.preventDefault(),this.startX){var a=(0,d.pointerCoord)(e).x;!0===this.previouslyChecked&&this.startX+4>a?this.previouslyChecked!==this.state.checked&&(this.setState({checked:!1}),this.previouslyChecked=this.state.checked,t.click()):this.startX-4<a&&this.previouslyChecked!==this.state.checked&&(this.setState({checked:!0}),this.previouslyChecked=this.state.checked,t.click()),this.activated=!1,this.startX=null,this.moved=!1}}}},{key:"handleFocus",value:function(e){var t=this.props.onFocus;t&&t(e),this.setState({hasFocus:!0})}},{key:"handleBlur",value:function(e){var t=this.props.onBlur;t&&t(e),this.setState({hasFocus:!1})}},{key:"getIcon",value:function(e){var a=this.props.icons;return a?void 0===a[e]?t.defaultProps.icons[e]:a[e]:null}},{key:"render",value:function(){var e=this,t=this.props,a=t.className,r=(t.icons,function(e,t){var a={};for(var n in e)t.indexOf(n)>=0||Object.prototype.hasOwnProperty.call(e,n)&&(a[n]=e[n]);return a}(t,["className","icons"])),l=(0,o.default)("react-toggle",{"react-toggle--checked":this.state.checked,"react-toggle--focus":this.state.hasFocus,"react-toggle--disabled":this.props.disabled},a);return c.default.createElement("div",{className:l,onClick:this.handleClick,onTouchStart:this.handleTouchStart,onTouchMove:this.handleTouchMove,onTouchEnd:this.handleTouchEnd},c.default.createElement("div",{className:"react-toggle-track"},c.default.createElement("div",{className:"react-toggle-track-check"},this.getIcon("checked")),c.default.createElement("div",{className:"react-toggle-track-x"},this.getIcon("unchecked"))),c.default.createElement("div",{className:"react-toggle-thumb"}),c.default.createElement("input",n({},r,{ref:function(t){e.input=t},onFocus:this.handleFocus,onBlur:this.handleBlur,className:"react-toggle-screenreader-only",type:"checkbox"})))}}]),t}(l.PureComponent);t.default=h,h.displayName="Toggle",h.defaultProps={icons:{checked:c.default.createElement(s.default,null),unchecked:c.default.createElement(u.default,null)}},h.propTypes={checked:i.default.bool,disabled:i.default.bool,defaultChecked:i.default.bool,onChange:i.default.func,onFocus:i.default.func,onBlur:i.default.func,className:i.default.string,name:i.default.string,value:i.default.string,id:i.default.string,"aria-labelledby":i.default.string,"aria-label":i.default.string,icons:i.default.oneOfType([i.default.bool,i.default.shape({checked:i.default.node,unchecked:i.default.node})])}},149:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n,r=a(0),l=(n=r)&&n.__esModule?n:{default:n};t.default=function(){return l.default.createElement("svg",{width:"14",height:"11",viewBox:"0 0 14 11"},l.default.createElement("title",null,"switch-check"),l.default.createElement("path",{d:"M11.264 0L5.26 6.004 2.103 2.847 0 4.95l5.26 5.26 8.108-8.107L11.264 0",fill:"#fff",fillRule:"evenodd"}))}},150:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n,r=a(0),l=(n=r)&&n.__esModule?n:{default:n};t.default=function(){return l.default.createElement("svg",{width:"10",height:"10",viewBox:"0 0 10 10"},l.default.createElement("title",null,"switch-x"),l.default.createElement("path",{d:"M9.9 2.12L7.78 0 4.95 2.828 2.12 0 0 2.12l2.83 2.83L0 7.776 2.123 9.9 4.95 7.07 7.78 9.9 9.9 7.776 7.072 4.95 9.9 2.12",fill:"#fff",fillRule:"evenodd"}))}},151:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.pointerCoord=function(e){if(e){var t=e.changedTouches;if(t&&t.length>0){var a=t[0];return{x:a.clientX,y:a.clientY}}var n=e.pageX;if(void 0!==n)return{x:n,y:e.pageY}}return{x:0,y:0}}}}]);