"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8422],{1748:(e,t,r)=>{r.d(t,{a:()=>ih,b:()=>iu,c:()=>ig,d:()=>w,e:()=>b,f:()=>h,g:()=>$,h:()=>c});var n,o=r(75102),i=!o.I&&!!o.b,l=()=>void 0,a=e=>null!=e,s=e=>"function"!=typeof e||e.length?e:e(),d=e=>Array.isArray(e)?e:e?[e]:[],u=i?e=>(0,o.B)()?(0,o.M)(e):e:o.M,c=function(e){let[t,r]=(0,o.v)(),n=e?.throw?(e,t)=>{throw r(e instanceof Error?e:Error(t)),e}:(e,t)=>{r(e instanceof Error?e:Error(t))},i=e?.api?Array.isArray(e.api)?e.api:[e.api]:[globalThis.localStorage].filter(Boolean),l=e?.prefix?`${e.prefix}.`:"",a=new Map,s=new Proxy({},{get(t,r){let s=a.get(r);s||(s=(0,o.v)(void 0,{equals:!1}),a.set(r,s)),s[0]();let d=i.reduce((e,t)=>{if(null!==e||!t)return e;try{return t.getItem(`${l}${r}`)}catch(e){return n(e,`Error reading ${l}${r} from ${t.name}`),null}},null);return null!==d&&e?.deserializer?e.deserializer(d,r,e.options):d}});return e?.sync!==!1&&(0,o.N)(()=>{let e=e=>{let t=!1;i.forEach(r=>{try{r!==e.storageArea&&e.key&&e.newValue!==r.getItem(e.key)&&(e.newValue?r.setItem(e.key,e.newValue):r.removeItem(e.key),t=!0)}catch(t){n(t,`Error synching api ${r.name} from storage event (${e.key}=${e.newValue})`)}}),t&&e.key&&a.get(e.key)?.[1]()};"addEventListener"in globalThis?(globalThis.addEventListener("storage",e),(0,o.M)(()=>globalThis.removeEventListener("storage",e))):(i.forEach(t=>t.addEventListener?.("storage",e)),(0,o.M)(()=>i.forEach(t=>t.removeEventListener?.("storage",e))))}),[s,(t,r,o)=>{let s=e?.serializer?e.serializer(r,t,o??e.options):r,d=`${l}${t}`;i.forEach(e=>{try{e.getItem(d)!==s&&e.setItem(d,s)}catch(r){n(r,`Error setting ${l}${t} to ${s} in ${e.name}`)}});let u=a.get(t);u&&u[1]()},{clear:()=>i.forEach(e=>{try{e.clear()}catch(t){n(t,`Error clearing ${e.name}`)}}),error:t,remove:e=>i.forEach(t=>{try{t.removeItem(`${l}${e}`)}catch(r){n(r,`Error removing ${l}${e} from ${t.name}`)}}),toJSON:()=>{let t={},r=(r,n)=>{if(!t.hasOwnProperty(r)){let o=n&&e?.deserializer?e.deserializer(n,r,e.options):n;o&&(t[r]=o)}};return i.forEach(e=>{if("function"==typeof e.getAll){let t;try{t=e.getAll()}catch(t){n(t,`Error getting all values from in ${e.name}`)}for(let e of t)r(e,t[e])}else{let o=0,i;try{for(;i=e.key(o++);)t.hasOwnProperty(i)||r(i,e.getItem(i))}catch(t){n(t,`Error getting all values from ${e.name}`)}}}),t}}]},g=e=>{if(!e)return"";let t="";for(let r in e){if(!e.hasOwnProperty(r))continue;let n=e[r];t+=n instanceof Date?`; ${r}=${n.toUTCString()}`:"boolean"==typeof n?`; ${r}`:`; ${r}=${n}`}return t},f=(e=>("function"==typeof e.clear||(e.clear=()=>{let t;for(;t=e.key(0);)e.removeItem(t)}),e))({_cookies:[globalThis.document,"cookie"],getItem:e=>f._cookies[0][f._cookies[1]].match("(^|;)\\s*"+e+"\\s*=\\s*([^;]+)")?.pop()??null,setItem:(e,t,r)=>{let n=f.getItem(e);f._cookies[0][f._cookies[1]]=`${e}=${t}${g(r)}`;let o=Object.assign(new Event("storage"),{key:e,oldValue:n,newValue:t,url:globalThis.document.URL,storageArea:f});window.dispatchEvent(o)},removeItem:e=>{f._cookies[0][f._cookies[1]]=`${e}=deleted${g({expires:new Date(0)})}`},key:e=>{let t=null,r=0;return f._cookies[0][f._cookies[1]].replace(/(?:^|;)\s*(.+?)\s*=\s*[^;]+/g,(n,o)=>(!t&&o&&r++===e&&(t=o),"")),t},get length(){let e=0;return f._cookies[0][f._cookies[1]].replace(/(?:^|;)\s*.+?\s*=\s*[^;]+/g,t=>(e+=+!!t,"")),e}}),p="bottom",h="system",y=Object.keys(o.R)[0],v=Object.keys(o.L)[0],b=(0,o.q)({client:void 0,onlineManager:void 0,queryFlavor:"",version:"",shadowDOMTarget:void 0});function m(){return(0,o.Y)(b)}var x=(0,o.q)(void 0),w=e=>{let[t,r]=(0,o.v)(null),n=()=>{let e=t();null!=e&&(e.close(),r(null))},i=(n,i)=>{if(null!=t())return;let l=window.open("","TSQD-Devtools-Panel",`width=${n},height=${i},popup`);if(!l)throw Error("Failed to open popup. Please allow popups for this site to view the devtools in picture-in-picture mode.");l.document.head.innerHTML="",l.document.body.innerHTML="",(0,o.m)(l.document),l.document.title="TanStack Query Devtools",l.document.body.style.margin="0",l.addEventListener("pagehide",()=>{e.setLocalStore("pip_open","false"),r(null)}),[...(m().shadowDOMTarget||document).styleSheets].forEach(e=>{try{let t=[...e.cssRules].map(e=>e.cssText).join(""),r=document.createElement("style"),n=e.ownerNode,o="";n&&"id"in n&&(o=n.id),o&&r.setAttribute("id",o),r.textContent=t,l.document.head.appendChild(r)}catch(r){let t=document.createElement("link");if(null==e.href)return;t.rel="stylesheet",t.type=e.type,t.media=e.media.toString(),t.href=e.href,l.document.head.appendChild(t)}}),(0,o.x)(["focusin","focusout","pointermove","keydown","pointerdown","pointerup","click","mousedown","input"],l.document),e.setLocalStore("pip_open","true"),r(l)};(0,o.r)(()=>{"true"!==(e.localStore.pip_open??"false")||e.disabled||i(Number(window.innerWidth),Number(e.localStore.height||500))}),(0,o.r)(()=>{let e=(m().shadowDOMTarget||document).querySelector("#_goober"),r=t();if(e&&r){let t=new MutationObserver(()=>{let t=(m().shadowDOMTarget||r.document).querySelector("#_goober");t&&(t.textContent=e.textContent)});t.observe(e,{childList:!0,subtree:!0,characterDataOldValue:!0}),(0,o.M)(()=>{t.disconnect()})}});let l=(0,o.s)(()=>({pipWindow:t(),requestPipWindow:i,closePipWindow:n,disabled:e.disabled??!1}));return(0,o.o)(x.Provider,{value:l,get children(){return e.children}})},k=()=>(0,o.s)(()=>{let e=(0,o.Y)(x);if(!e)throw Error("usePiPWindow must be used within a PiPProvider");return e()}),$=(0,o.q)(()=>"dark");function S(){return(0,o.Y)($)}var C={À:"A",Á:"A",Â:"A",Ã:"A",Ä:"A",Å:"A",Ấ:"A",Ắ:"A",Ẳ:"A",Ẵ:"A",Ặ:"A",Æ:"AE",Ầ:"A",Ằ:"A",Ȃ:"A",Ç:"C",Ḉ:"C",È:"E",É:"E",Ê:"E",Ë:"E",Ế:"E",Ḗ:"E",Ề:"E",Ḕ:"E",Ḝ:"E",Ȇ:"E",Ì:"I",Í:"I",Î:"I",Ï:"I",Ḯ:"I",Ȋ:"I",Ð:"D",Ñ:"N",Ò:"O",Ó:"O",Ô:"O",Õ:"O",Ö:"O",Ø:"O",Ố:"O",Ṍ:"O",Ṓ:"O",Ȏ:"O",Ù:"U",Ú:"U",Û:"U",Ü:"U",Ý:"Y",à:"a",á:"a",â:"a",ã:"a",ä:"a",å:"a",ấ:"a",ắ:"a",ẳ:"a",ẵ:"a",ặ:"a",æ:"ae",ầ:"a",ằ:"a",ȃ:"a",ç:"c",ḉ:"c",è:"e",é:"e",ê:"e",ë:"e",ế:"e",ḗ:"e",ề:"e",ḕ:"e",ḝ:"e",ȇ:"e",ì:"i",í:"i",î:"i",ï:"i",ḯ:"i",ȋ:"i",ð:"d",ñ:"n",ò:"o",ó:"o",ô:"o",õ:"o",ö:"o",ø:"o",ố:"o",ṍ:"o",ṓ:"o",ȏ:"o",ù:"u",ú:"u",û:"u",ü:"u",ý:"y",ÿ:"y",Ā:"A",ā:"a",Ă:"A",ă:"a",Ą:"A",ą:"a",Ć:"C",ć:"c",Ĉ:"C",ĉ:"c",Ċ:"C",ċ:"c",Č:"C",č:"c",C̆:"C",c̆:"c",Ď:"D",ď:"d",Đ:"D",đ:"d",Ē:"E",ē:"e",Ĕ:"E",ĕ:"e",Ė:"E",ė:"e",Ę:"E",ę:"e",Ě:"E",ě:"e",Ĝ:"G",Ǵ:"G",ĝ:"g",ǵ:"g",Ğ:"G",ğ:"g",Ġ:"G",ġ:"g",Ģ:"G",ģ:"g",Ĥ:"H",ĥ:"h",Ħ:"H",ħ:"h",Ḫ:"H",ḫ:"h",Ĩ:"I",ĩ:"i",Ī:"I",ī:"i",Ĭ:"I",ĭ:"i",Į:"I",į:"i",İ:"I",ı:"i",Ĳ:"IJ",ĳ:"ij",Ĵ:"J",ĵ:"j",Ķ:"K",ķ:"k",Ḱ:"K",ḱ:"k",K̆:"K",k̆:"k",Ĺ:"L",ĺ:"l",Ļ:"L",ļ:"l",Ľ:"L",ľ:"l",Ŀ:"L",ŀ:"l",Ł:"l",ł:"l",Ḿ:"M",ḿ:"m",M̆:"M",m̆:"m",Ń:"N",ń:"n",Ņ:"N",ņ:"n",Ň:"N",ň:"n",ŉ:"n",N̆:"N",n̆:"n",Ō:"O",ō:"o",Ŏ:"O",ŏ:"o",Ő:"O",ő:"o",Œ:"OE",œ:"oe",P̆:"P",p̆:"p",Ŕ:"R",ŕ:"r",Ŗ:"R",ŗ:"r",Ř:"R",ř:"r",R̆:"R",r̆:"r",Ȓ:"R",ȓ:"r",Ś:"S",ś:"s",Ŝ:"S",ŝ:"s",Ş:"S",Ș:"S",ș:"s",ş:"s",Š:"S",š:"s",Ţ:"T",ţ:"t",ț:"t",Ț:"T",Ť:"T",ť:"t",Ŧ:"T",ŧ:"t",T̆:"T",t̆:"t",Ũ:"U",ũ:"u",Ū:"U",ū:"u",Ŭ:"U",ŭ:"u",Ů:"U",ů:"u",Ű:"U",ű:"u",Ų:"U",ų:"u",Ȗ:"U",ȗ:"u",V̆:"V",v̆:"v",Ŵ:"W",ŵ:"w",Ẃ:"W",ẃ:"w",X̆:"X",x̆:"x",Ŷ:"Y",ŷ:"y",Ÿ:"Y",Y̆:"Y",y̆:"y",Ź:"Z",ź:"z",Ż:"Z",ż:"z",Ž:"Z",ž:"z",ſ:"s",ƒ:"f",Ơ:"O",ơ:"o",Ư:"U",ư:"u",Ǎ:"A",ǎ:"a",Ǐ:"I",ǐ:"i",Ǒ:"O",ǒ:"o",Ǔ:"U",ǔ:"u",Ǖ:"U",ǖ:"u",Ǘ:"U",ǘ:"u",Ǚ:"U",ǚ:"u",Ǜ:"U",ǜ:"u",Ứ:"U",ứ:"u",Ṹ:"U",ṹ:"u",Ǻ:"A",ǻ:"a",Ǽ:"AE",ǽ:"ae",Ǿ:"O",ǿ:"o",Þ:"TH",þ:"th",Ṕ:"P",ṕ:"p",Ṥ:"S",ṥ:"s",X́:"X",x́:"x",Ѓ:"Г",ѓ:"г",Ќ:"К",ќ:"к",A̋:"A",a̋:"a",E̋:"E",e̋:"e",I̋:"I",i̋:"i",Ǹ:"N",ǹ:"n",Ồ:"O",ồ:"o",Ṑ:"O",ṑ:"o",Ừ:"U",ừ:"u",Ẁ:"W",ẁ:"w",Ỳ:"Y",ỳ:"y",Ȁ:"A",ȁ:"a",Ȅ:"E",ȅ:"e",Ȉ:"I",ȉ:"i",Ȍ:"O",ȍ:"o",Ȑ:"R",ȑ:"r",Ȕ:"U",ȕ:"u",B̌:"B",b̌:"b",Č̣:"C",č̣:"c",Ê̌:"E",ê̌:"e",F̌:"F",f̌:"f",Ǧ:"G",ǧ:"g",Ȟ:"H",ȟ:"h",J̌:"J",ǰ:"j",Ǩ:"K",ǩ:"k",M̌:"M",m̌:"m",P̌:"P",p̌:"p",Q̌:"Q",q̌:"q",Ř̩:"R",ř̩:"r",Ṧ:"S",ṧ:"s",V̌:"V",v̌:"v",W̌:"W",w̌:"w",X̌:"X",x̌:"x",Y̌:"Y",y̌:"y",A̧:"A",a̧:"a",B̧:"B",b̧:"b",Ḑ:"D",ḑ:"d",Ȩ:"E",ȩ:"e",Ɛ̧:"E",ɛ̧:"e",Ḩ:"H",ḩ:"h",I̧:"I",i̧:"i",Ɨ̧:"I",ɨ̧:"i",M̧:"M",m̧:"m",O̧:"O",o̧:"o",Q̧:"Q",q̧:"q",U̧:"U",u̧:"u",X̧:"X",x̧:"x",Z̧:"Z",z̧:"z"},q=RegExp(Object.keys(C).join("|"),"g"),M={CASE_SENSITIVE_EQUAL:7,EQUAL:6,STARTS_WITH:5,WORD_STARTS_WITH:4,CONTAINS:3,ACRONYM:2,MATCHES:1,NO_MATCH:0};function E(e,t,r){var n;if((r=r||{}).threshold=null!=(n=r.threshold)?n:M.MATCHES,!r.accessors){let n=T(e,t,r);return{rankedValue:e,rank:n,accessorIndex:-1,accessorThreshold:r.threshold,passed:n>=r.threshold}}let o=function(e,t){let r=[];for(let o=0,i=t.length;o<i;o++){var n;let i=t[o],l="function"==typeof(n=i)?L:{...L,...n},a=function(e,t){let r=t;"object"==typeof t&&(r=t.accessor);let n=r(e);return null==n?[]:Array.isArray(n)?n:[String(n)]}(e,i);for(let e=0,t=a.length;e<t;e++)r.push({itemValue:a[e],attributes:l})}return r}(e,r.accessors),i={rankedValue:e,rank:M.NO_MATCH,accessorIndex:-1,accessorThreshold:r.threshold,passed:!1};for(let e=0;e<o.length;e++){let n=o[e],l=T(n.itemValue,t,r),{minRanking:a,maxRanking:s,threshold:d=r.threshold}=n.attributes;l<a&&l>=M.MATCHES?l=a:l>s&&(l=s),(l=Math.min(l,s))>=d&&l>i.rank&&(i.rank=l,i.passed=!0,i.accessorIndex=e,i.accessorThreshold=d,i.rankedValue=n.itemValue)}return i}function T(e,t,r){let n;return(e=F(e,r),(t=F(t,r)).length>e.length)?M.NO_MATCH:e===t?M.CASE_SENSITIVE_EQUAL:(e=e.toLowerCase())===(t=t.toLowerCase())?M.EQUAL:e.startsWith(t)?M.STARTS_WITH:e.includes(` ${t}`)?M.WORD_STARTS_WITH:e.includes(t)?M.CONTAINS:1===t.length?M.NO_MATCH:(n="",e.split(" ").forEach(e=>{e.split("-").forEach(e=>{n+=e.substr(0,1)})}),n).includes(t)?M.ACRONYM:function(e,t){let r=0,n=0;function o(e,t,n){for(let o=n,i=t.length;o<i;o++)if(t[o]===e)return r+=1,o+1;return -1}let i=o(t[0],e,0);if(i<0)return M.NO_MATCH;n=i;for(let r=1,i=t.length;r<i;r++)if(!((n=o(t[r],e,n))>-1))return M.NO_MATCH;var l=n-i;let a=r/t.length;return M.MATCHES+1/l*a}(e,t)}function F(e,t){let{keepDiacritics:r}=t;return e=`${e}`,r||(e=e.replace(q,e=>C[e])),e}var L={maxRanking:1/0,minRanking:-1/0},A={data:""},D=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,z=/\/\*[^]*?\*\/|  +/g,O=/\n+/g,I=(e,t)=>{let r="",n="",o="";for(let i in e){let l=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+l+";":n+="f"==i[1]?I(l,i):i+"{"+I(l,"k"==i[1]?"":t)+"}":"object"==typeof l?n+=I(l,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=l&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=I.p?I.p(i,l):i+":"+l+";")}return r+(t&&o?t+"{"+o+"}":o)+n},K={},P=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+P(e[r]);return t}return e};function H(e){let t,r,n,o=this||{},i=e.call?e(o.p):e;return((e,t,r,n,o)=>{var i,l,a,s;let d=P(e),u=K[d]||(K[d]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(d));if(!K[u]){let t=d!==e?e:(e=>{let t,r,n=[{}];for(;t=D.exec(e.replace(z,""));)t[4]?n.shift():t[3]?(r=t[3].replace(O," ").trim(),n.unshift(n[0][r]=n[0][r]||{})):n[0][t[1]]=t[2].replace(O," ").trim();return n[0]})(e);K[u]=I(o?{["@keyframes "+u]:t}:t,r?"":"."+u)}let c=r&&K.g?K.g:null;return r&&(K.g=K[u]),i=K[u],l=t,a=n,(s=c)?l.data=l.data.replace(s,i):-1===l.data.indexOf(i)&&(l.data=a?i+l.data:l.data+i),u})(i.unshift?i.raw?(t=[].slice.call(arguments,1),r=o.p,i.reduce((e,n,o)=>{let i=t[o];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":I(e,""):!1===e?"":e}return e+n+(null==i?"":i)},"")):i.reduce((e,t)=>Object.assign(e,t&&t.call?t(o.p):t),{}):i,(n=o.target,"object"==typeof window?((n?n.querySelector("#_goober"):window._goober)||Object.assign((n||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:n||A),o.g,o.o,o.k)}function V(){for(var e,t,r=0,n="",o=arguments.length;r<o;r++)(e=arguments[r])&&(t=function e(t){var r,n,o="";if("string"==typeof t||"number"==typeof t)o+=t;else if("object"==typeof t)if(Array.isArray(t)){var i=t.length;for(r=0;r<i;r++)t[r]&&(n=e(t[r]))&&(o&&(o+=" "),o+=n)}else for(n in t)t[n]&&(o&&(o+=" "),o+=n);return o}(e))&&(n&&(n+=" "),n+=t);return n}function R(...e){return(...t)=>{for(let r of e)r&&r(...t)}}H.bind({g:1}),H.bind({k:1});var B=o.I?e=>null!=e&&"object"==typeof e&&"t"in e:e=>e instanceof Element;function Q(e){requestAnimationFrame(()=>requestAnimationFrame(e))}var G=e=>{let t=function(e){return(0,o.s)(()=>{let t=e.name||"s";return{enterActive:(e.enterActiveClass||t+"-enter-active").split(" "),enter:(e.enterClass||t+"-enter").split(" "),enterTo:(e.enterToClass||t+"-enter-to").split(" "),exitActive:(e.exitActiveClass||t+"-exit-active").split(" "),exit:(e.exitClass||t+"-exit").split(" "),exitTo:(e.exitToClass||t+"-exit-to").split(" "),move:(e.moveClass||t+"-move").split(" ")}})}(e);return function(e,t){let r=(0,o.W)(e);if(o.I){let e=r.slice();return()=>e}let{onChange:n}=t,i=new Set(t.appear?void 0:r),l=new WeakSet,[a,s]=(0,o.v)([],{equals:!1}),[d]=(0,o.Z)(),u=e=>{for(let t of(s(t=>(t.push.apply(t,e),t)),e))l.delete(t)},c=(e,t,r)=>e.splice(r,0,t);return(0,o.s)(t=>{let r=a(),s=e();if(s[o.a],(0,o.W)(d))return d(),t;if(r.length){let e=t.filter(e=>!r.includes(e));return r.length=0,n({list:e,added:[],removed:[],unchanged:e,finishRemoved:u}),e}return(0,o.W)(()=>{let e=new Set(s),r=s.slice(),o=[],a=[],d=[];for(let e of s)(i.has(e)?d:o).push(e);let g=!o.length;for(let n=0;n<t.length;n++){let o=t[n];e.has(o)||(l.has(o)||(a.push(o),l.add(o)),c(r,o,n)),g&&o!==r[n]&&(g=!1)}return!a.length&&g?t:(n({list:r,added:o,removed:a,unchanged:d,finishRemoved:u}),i=e,r)})},t.appear?[]:r.slice())}(function(e,t=B,r=B){let n=(0,o.s)(e),i=(0,o.s)(()=>(function e(t,r){if(r(t))return t;if("function"==typeof t&&!t.length)return e(t(),r);if(Array.isArray(t)){let n=[];for(let o of t){let t=e(o,r);t&&(Array.isArray(t)?n.push.apply(n,t):n.push(t))}return n.length?n:null}return null})(n(),o.I?r:t));return i.toArray=()=>{let e=i();return Array.isArray(e)?e:e?[e]:[]},i}(()=>e.children).toArray,{appear:e.appear,onChange({added:r,removed:n,finishRemoved:o,list:i}){let l=t();for(let t of r)!function(e,t,r,n){let{onBeforeEnter:o,onEnter:i,onAfterEnter:l}=t;function a(t){t&&t.target!==r||(r.removeEventListener("transitionend",a),r.removeEventListener("animationend",a),r.classList.remove(...e.enterActive),r.classList.remove(...e.enterTo),l?.(r))}o?.(r),r.classList.add(...e.enter),r.classList.add(...e.enterActive),queueMicrotask(()=>{r.parentNode&&i?.(r,()=>a())}),Q(()=>{r.classList.remove(...e.enter),r.classList.add(...e.enterTo),(!i||i.length<2)&&(r.addEventListener("transitionend",a),r.addEventListener("animationend",a))})}(l,e,t);let a=[];for(let e of i)e.isConnected&&(e instanceof HTMLElement||e instanceof SVGElement)&&a.push({el:e,rect:e.getBoundingClientRect()});for(let t of(queueMicrotask(()=>{let e=[];for(let{el:t,rect:r}of a)if(t.isConnected){let n=t.getBoundingClientRect(),o=r.left-n.left,i=r.top-n.top;(o||i)&&(t.style.transform=`translate(${o}px, ${i}px)`,t.style.transitionDuration="0s",e.push(t))}for(let t of(document.body.offsetHeight,e)){let e=function(r){(r.target===t||/transform$/.test(r.propertyName))&&(t.removeEventListener("transitionend",e),t.classList.remove(...l.move))};t.classList.add(...l.move),t.style.transform=t.style.transitionDuration="",t.addEventListener("transitionend",e)}}),n))!function(e,t,r,n){let{onBeforeExit:o,onExit:i,onAfterExit:l}=t;if(!r.parentNode)return n?.();function a(t){t&&t.target!==r||(n?.(),r.removeEventListener("transitionend",a),r.removeEventListener("animationend",a),r.classList.remove(...e.exitActive),r.classList.remove(...e.exitTo),l?.(r))}o?.(r),r.classList.add(...e.exit),r.classList.add(...e.exitActive),i?.(r,()=>a()),Q(()=>{r.classList.remove(...e.exit),r.classList.add(...e.exitTo),(!i||i.length<2)&&(r.addEventListener("transitionend",a),r.addEventListener("animationend",a))})}(l,e,t,()=>o([t]))}})},U=Symbol("fallback");function N(e){for(let t of e)t.dispose()}function j(e){let{by:t}=e;return(0,o.s)(function(e,t,r,n={}){if(o.I){let t=e(),o=[];if(t&&t.length)for(let e=0,n=t.length;e<n;e++)o.push(r(()=>t[e],()=>e));else n.fallback&&(o=[n.fallback()]);return()=>o}let i=new Map;return(0,o.M)(()=>N(i.values())),()=>{let r=e()||[];return r[o.a],(0,o.W)(()=>{if(!r.length)return(N(i.values()),i.clear(),n.fallback)?[(0,o.u)(e=>(i.set(U,{dispose:e}),n.fallback()))]:[];let e=Array(r.length),a=i.get(U);if(!i.size||a){a?.dispose(),i.delete(U);for(let n=0;n<r.length;n++){let o=r[n],i=t(o,n);l(e,o,n,i)}return e}let s=new Set(i.keys());for(let n=0;n<r.length;n++){let o=r[n],a=t(o,n);s.delete(a);let d=i.get(a);d?(e[n]=d.mapped,d.setIndex?.(n),d.setItem(()=>o)):l(e,o,n,a)}for(let e of s)i.get(e)?.dispose(),i.delete(e);return e})};function l(e,t,n,l){(0,o.u)(a=>{let[s,d]=(0,o.v)(t),u={setItem:d,dispose:a};if(r.length>1){let[e,t]=(0,o.v)(n);u.setIndex=t,u.mapped=r(s,e)}else u.mapped=r(s);i.set(l,u),e[n]=u.mapped})}}(()=>e.each,"function"==typeof t?t:e=>e[t],e.children,"fallback"in e?{fallback:()=>e.fallback}:void 0))}function _(e,t,r){if(o.I)return;let n=new WeakMap,{observe:i,unobserve:u}=function(e,t){if(o.I)return{observe:l,unobserve:l};let r=new ResizeObserver(e);return(0,o.M)(r.disconnect.bind(r)),{observe:e=>r.observe(e,t),unobserve:r.unobserve.bind(r)}}(e=>{for(let r of e){let{contentRect:e,target:o}=r,i=Math.round(e.width),l=Math.round(e.height),a=n.get(o);a&&a.width===i&&a.height===l||(t(e,o,r),n.set(o,{width:i,height:l}))}},r);(0,o.r)(t=>{let r=d(s(e)).filter(a);return!function(e,t,r,n){let o,i,l=e.length,a=t.length,s=0;if(!a){for(;s<l;s++)r(e[s]);return}if(!l){for(;s<a;s++)n(t[s]);return}for(;s<a&&t[s]===e[s];s++);for(o of(t=t.slice(s),e=e.slice(s),t))e.includes(o)||n(o);for(i of e)t.includes(i)||r(i)}(r,t,i,u),r},[])}var W=/((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;function Y(e){let t,r={};for(;t=W.exec(e);)r[t[1]]=t[2];return r}function J(e,t){if("string"==typeof e){if("string"==typeof t)return`${e};${t}`;e=Y(e)}else"string"==typeof t&&(t=Y(t));return{...e,...t}}function X(e,t){let r=[...e],n=r.indexOf(t);return -1!==n&&r.splice(n,1),r}function Z(e){return"[object String]"===Object.prototype.toString.call(e)}function ee(e){return t=>`${e()}-${t}`}function et(e,t){return!!e&&(e===t||e.contains(t))}function er(e,t=!1){let{activeElement:r}=en(e);if(!r?.nodeName)return null;if(eo(r)&&r.contentDocument)return er(r.contentDocument.body,t);if(t){let e=r.getAttribute("aria-activedescendant");if(e){let t=en(r).getElementById(e);if(t)return t}}return r}function en(e){return e?e.ownerDocument||e:document}function eo(e){return"IFRAME"===e.tagName}var ei=(e=>(e.Escape="Escape",e.Enter="Enter",e.Tab="Tab",e.Space=" ",e.ArrowDown="ArrowDown",e.ArrowLeft="ArrowLeft",e.ArrowRight="ArrowRight",e.ArrowUp="ArrowUp",e.End="End",e.Home="Home",e.PageDown="PageDown",e.PageUp="PageUp",e))(ei||{});function el(e){return"undefined"!=typeof window&&null!=window.navigator&&e.test(window.navigator.userAgentData?.platform||window.navigator.platform)}function ea(){return el(/^Mac/i)}function es(e,t){return t&&("function"==typeof t?t(e):t[0](t[1],e)),e?.defaultPrevented}function ed(e){return t=>{for(let r of e)es(t,r)}}function eu(e){if(e)if(function(){if(null==ec){ec=!1;try{document.createElement("div").focus({get preventScroll(){return ec=!0,!0}})}catch(e){}}return ec}())e.focus({preventScroll:!0});else{let t=function(e){let t=e.parentNode,r=[],n=document.scrollingElement||document.documentElement;for(;t instanceof HTMLElement&&t!==n;)(t.offsetHeight<t.scrollHeight||t.offsetWidth<t.scrollWidth)&&r.push({element:t,scrollTop:t.scrollTop,scrollLeft:t.scrollLeft}),t=t.parentNode;return n instanceof HTMLElement&&r.push({element:n,scrollTop:n.scrollTop,scrollLeft:n.scrollLeft}),r}(e);e.focus(),function(e){for(let{element:t,scrollTop:r,scrollLeft:n}of e)t.scrollTop=r,t.scrollLeft=n}(t)}}var ec=null,eg=["input:not([type='hidden']):not([disabled])","select:not([disabled])","textarea:not([disabled])","button:not([disabled])","a[href]","area[href]","[tabindex]","iframe","object","embed","audio[controls]","video[controls]","[contenteditable]:not([contenteditable='false'])"],ef=[...eg,'[tabindex]:not([tabindex="-1"]):not([disabled])'],ep=eg.join(":not([hidden]),")+",[tabindex]:not([disabled]):not([hidden])",eh=ef.join(':not([hidden]):not([tabindex="-1"]),');function ey(e){return ev(e)&&!(0>parseInt(e.getAttribute("tabindex")||"0",10))}function ev(e){return e.matches(ep)&&eb(e)}function eb(e,t){var r,n;return"#comment"!==e.nodeName&&function(e){if(!(e instanceof HTMLElement)&&!(e instanceof SVGElement))return!1;let{display:t,visibility:r}=e.style,n="none"!==t&&"hidden"!==r&&"collapse"!==r;if(n){if(!e.ownerDocument.defaultView)return n;let{getComputedStyle:t}=e.ownerDocument.defaultView,{display:r,visibility:o}=t(e);n="none"!==r&&"hidden"!==o&&"collapse"!==o}return n}(e)&&(r=e,n=t,!r.hasAttribute("hidden")&&("DETAILS"!==r.nodeName||!n||"SUMMARY"===n.nodeName||r.hasAttribute("open")))&&(!e.parentElement||eb(e.parentElement,e))}function em(e){for(;e&&!function(e){let t=window.getComputedStyle(e);return/(auto|scroll)/.test(t.overflow+t.overflowX+t.overflowY)}(e);)e=e.parentElement;return e||document.scrollingElement||document.documentElement}function ex(){}function ew(e,t){return(0,o.K)(e,t)}var ek=new Map,e$=new Set;function eS(){if("undefined"==typeof window)return;let e=t=>{if(!t.target)return;let r=ek.get(t.target);if(r&&(r.delete(t.propertyName),0===r.size&&(t.target.removeEventListener("transitioncancel",e),ek.delete(t.target)),0===ek.size)){for(let e of e$)e();e$.clear()}};document.body.addEventListener("transitionrun",t=>{if(!t.target)return;let r=ek.get(t.target);r||(r=new Set,ek.set(t.target,r),t.target.addEventListener("transitioncancel",e)),r.add(t.propertyName)}),document.body.addEventListener("transitionend",e)}function eC(e,t){let r=eq(e,t,"left"),n=eq(e,t,"top"),o=t.offsetWidth,i=t.offsetHeight,l=e.scrollLeft,a=e.scrollTop,s=l+e.offsetWidth,d=a+e.offsetHeight;r<=l?l=r:r+o>s&&(l+=r+o-s),n<=a?a=n:n+i>d&&(a+=n+i-d),e.scrollLeft=l,e.scrollTop=a}function eq(e,t,r){let n="left"===r?"offsetLeft":"offsetTop",o=0;for(;t.offsetParent&&(o+=t[n],t.offsetParent!==e);){if(t.offsetParent.contains(e)){o-=e[n];break}t=t.offsetParent}return o}"undefined"!=typeof document&&("loading"!==document.readyState?eS():document.addEventListener("DOMContentLoaded",eS));var eM={border:"0",clip:"rect(0 0 0 0)","clip-path":"inset(50%)",height:"1px",margin:"0 -1px -1px 0",overflow:"hidden",padding:"0",position:"absolute",width:"1px","white-space":"nowrap"};function eE(e){return t=>(e(t),()=>e(void 0))}function eT(e,t){let[r,n]=(0,o.v)(eF(t?.()));return(0,o.r)(()=>{n(e()?.tagName.toLowerCase()||eF(t?.()))}),r}function eF(e){return Z(e)?e:void 0}function eL(e){let[t,r]=(0,o.S)(e,["as"]);if(!t.as)throw Error("[kobalte]: Polymorphic is missing the required `as` prop.");return(0,o.o)(o.c,(0,o.K)(r,{get component(){return t.as}}))}var eA=["id","name","validationState","required","disabled","readOnly"],eD=(0,o.q)();function ez(){let e=(0,o.Y)(eD);if(void 0===e)throw Error("[kobalte]: `useFormControlContext` must be used within a `FormControlContext.Provider` component");return e}function eO(e){let t=ez(),r=ew({id:t.generateId("description")},e);return(0,o.r)(()=>(0,o.M)(t.registerDescription(r.id))),(0,o.o)(eL,(0,o.K)({as:"div"},()=>t.dataset(),r))}function eI(e){let t=ez(),r=ew({id:t.generateId("error-message")},e),[n,i]=(0,o.S)(r,["forceMount"]),l=()=>"invalid"===t.validationState();return(0,o.r)(()=>{l()&&(0,o.M)(t.registerErrorMessage(i.id))}),(0,o.o)(o.h,{get when(){return n.forceMount||l()},get children(){return(0,o.o)(eL,(0,o.K)({as:"div"},()=>t.dataset(),i))}})}function eK(e){let t,r=ez(),n=ew({id:r.generateId("label")},e),[i,l]=(0,o.S)(n,["ref"]),a=eT(()=>t,()=>"label");return(0,o.r)(()=>(0,o.M)(r.registerLabel(l.id))),(0,o.o)(eL,(0,o.K)({as:"label",ref(e){let r=R(e=>t=e,i.ref);"function"==typeof r&&r(e)},get for(){return(0,o.J)(()=>"label"===a())()?r.fieldId():void 0}},()=>r.dataset(),l))}function eP(e){let[t,r]=(0,o.v)(e.defaultValue?.()),n=(0,o.s)(()=>e.value?.()!==void 0),i=(0,o.s)(()=>n()?e.value?.():t());return[i,t=>{(0,o.W)(()=>{let o=function(e,...t){return"function"==typeof e?e(...t):e}(t,i());return Object.is(o,i())||(n()||r(o),e.onChange?.(o)),o})}]}function eH(e){let[t,r]=eP(e);return[()=>t()??!1,r]}var eV=Object.defineProperty,eR=(e,t)=>{for(var r in t)eV(e,r,{get:t[r],enumerable:!0})},eB=(0,o.q)();function eQ(e,t){return!!(t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_PRECEDING)}function eG(e,t){let r=function(e){let t=e.map((e,t)=>[t,e]),r=!1;return(t.sort(([e,t],[n,o])=>{let i=t.ref(),l=o.ref();return i!==l&&i&&l?eQ(i,l)?(e>n&&(r=!0),-1):(e<n&&(r=!0),1):0}),r)?t.map(([e,t])=>t):e}(e);e!==r&&t(r)}var eU=new Set(["Avst","Arab","Armi","Syrc","Samr","Mand","Thaa","Mend","Nkoo","Adlm","Rohg","Hebr"]),eN=new Set(["ae","ar","arc","bcc","bqi","ckb","dv","fa","glk","he","ku","mzn","nqo","pnb","ps","sd","ug","ur","yi"]);function ej(){let e="undefined"!=typeof navigator&&(navigator.language||navigator.userLanguage)||"en-US";return{locale:e,direction:!function(e){if(Intl.Locale){let t=new Intl.Locale(e).maximize().script??"";return eU.has(t)}let t=e.split("-")[0];return eN.has(t)}(e)?"ltr":"rtl"}}var e_=ej(),eW=new Set;function eY(){for(let e of(e_=ej(),eW))e(e_)}var eJ=(0,o.q)();function eX(){let e=function(){let e={locale:"en-US",direction:"ltr"},[t,r]=(0,o.v)(e_),n=(0,o.s)(()=>o.I?e:t());return(0,o.N)(()=>{0===eW.size&&window.addEventListener("languagechange",eY),eW.add(r),(0,o.M)(()=>{eW.delete(r),0===eW.size&&window.removeEventListener("languagechange",eY)})}),{locale:()=>n().locale,direction:()=>n().direction}}();return(0,o.Y)(eJ)||e}var eZ=new Map,e0=class e extends Set{anchorKey;currentKey;constructor(t,r,n){super(t),t instanceof e?(this.anchorKey=r||t.anchorKey,this.currentKey=n||t.currentKey):(this.anchorKey=r,this.currentKey=n)}};function e1(e){return ea()||el(/^iPhone/i)||el(/^iPad/i)||ea()&&navigator.maxTouchPoints>1?e.altKey:e.ctrlKey}function e2(e){return ea()?e.metaKey:e.ctrlKey}function e3(e,t){let r=()=>s(e.selectionManager),n=()=>s(e.key),i=()=>s(e.shouldUseVirtualFocus),l=e=>{"none"!==r().selectionMode()&&("single"===r().selectionMode()?r().isSelected(n())&&!r().disallowEmptySelection()?r().toggleSelection(n()):r().replaceSelection(n()):e?.shiftKey?r().extendSelection(n()):"toggle"===r().selectionBehavior()||e2(e)||"pointerType"in e&&"touch"===e.pointerType?r().toggleSelection(n()):r().replaceSelection(n()))},a=()=>s(e.disabled)||r().isDisabled(n()),d=()=>!a()&&r().canSelectItem(n()),u=null,c=(0,o.s)(()=>{if(!(i()||a()))return n()===r().focusedKey()?0:-1}),g=(0,o.s)(()=>s(e.virtualized)?void 0:n());return(0,o.r)((0,o.O)([t,n,i,()=>r().focusedKey(),()=>r().isFocused()],([t,r,n,o,i])=>{t&&r===o&&i&&!n&&document.activeElement!==t&&(e.focus?e.focus():eu(t))})),{isSelected:()=>r().isSelected(n()),isDisabled:a,allowsSelection:d,tabIndex:c,dataKey:g,onPointerDown:t=>{d()&&(u=t.pointerType,"mouse"!==t.pointerType||0!==t.button||s(e.shouldSelectOnPressUp)||l(t))},onPointerUp:t=>{d()&&"mouse"===t.pointerType&&0===t.button&&s(e.shouldSelectOnPressUp)&&s(e.allowsDifferentPressOrigin)&&l(t)},onClick:t=>{d()&&(s(e.shouldSelectOnPressUp)&&!s(e.allowsDifferentPressOrigin)||"mouse"!==u)&&l(t)},onKeyDown:e=>{d()&&["Enter"," "].includes(e.key)&&(e1(e)?r().toggleSelection(n()):l(e))},onMouseDown:e=>{a()&&e.preventDefault()},onFocus:e=>{let o=t();!(i()||a())&&o&&e.target===o&&r().setFocusedKey(n())}}}var e5=class{collection;state;constructor(e,t){this.collection=e,this.state=t}selectionMode(){return this.state.selectionMode()}disallowEmptySelection(){return this.state.disallowEmptySelection()}selectionBehavior(){return this.state.selectionBehavior()}setSelectionBehavior(e){this.state.setSelectionBehavior(e)}isFocused(){return this.state.isFocused()}setFocused(e){this.state.setFocused(e)}focusedKey(){return this.state.focusedKey()}setFocusedKey(e){(null==e||this.collection().getItem(e))&&this.state.setFocusedKey(e)}selectedKeys(){return this.state.selectedKeys()}isSelected(e){if("none"===this.state.selectionMode())return!1;let t=this.getKey(e);return null!=t&&this.state.selectedKeys().has(t)}isEmpty(){return 0===this.state.selectedKeys().size}isSelectAll(){if(this.isEmpty())return!1;let e=this.state.selectedKeys();return this.getAllSelectableKeys().every(t=>e.has(t))}firstSelectedKey(){let e;for(let t of this.state.selectedKeys()){let r=this.collection().getItem(t),n=r?.index!=null&&e?.index!=null&&r.index<e.index;(!e||n)&&(e=r)}return e?.key}lastSelectedKey(){let e;for(let t of this.state.selectedKeys()){let r=this.collection().getItem(t),n=r?.index!=null&&e?.index!=null&&r.index>e.index;(!e||n)&&(e=r)}return e?.key}extendSelection(e){if("none"===this.selectionMode())return;if("single"===this.selectionMode())return void this.replaceSelection(e);let t=this.getKey(e);if(null==t)return;let r=this.state.selectedKeys(),n=r.anchorKey||t,o=new e0(r,n,t);for(let e of this.getKeyRange(n,r.currentKey||t))o.delete(e);for(let e of this.getKeyRange(t,n))this.canSelectItem(e)&&o.add(e);this.state.setSelectedKeys(o)}getKeyRange(e,t){let r=this.collection().getItem(e),n=this.collection().getItem(t);return r&&n?null!=r.index&&null!=n.index&&r.index<=n.index?this.getKeyRangeInternal(e,t):this.getKeyRangeInternal(t,e):[]}getKeyRangeInternal(e,t){let r=[],n=e;for(;null!=n;){let e=this.collection().getItem(n);if(e&&"item"===e.type&&r.push(n),n===t)return r;n=this.collection().getKeyAfter(n)}return[]}getKey(e){let t=this.collection().getItem(e);return t?t&&"item"===t.type?t.key:null:e}toggleSelection(e){if("none"===this.selectionMode())return;if("single"===this.selectionMode()&&!this.isSelected(e))return void this.replaceSelection(e);let t=this.getKey(e);if(null==t)return;let r=new e0(this.state.selectedKeys());r.has(t)?r.delete(t):this.canSelectItem(t)&&(r.add(t),r.anchorKey=t,r.currentKey=t),this.disallowEmptySelection()&&0===r.size||this.state.setSelectedKeys(r)}replaceSelection(e){if("none"===this.selectionMode())return;let t=this.getKey(e);if(null==t)return;let r=this.canSelectItem(t)?new e0([t],t,t):new e0;this.state.setSelectedKeys(r)}setSelectedKeys(e){if("none"===this.selectionMode())return;let t=new e0;for(let r of e){let e=this.getKey(r);if(null!=e&&(t.add(e),"single"===this.selectionMode()))break}this.state.setSelectedKeys(t)}selectAll(){"multiple"===this.selectionMode()&&this.state.setSelectedKeys(new Set(this.getAllSelectableKeys()))}clearSelection(){let e=this.state.selectedKeys();!this.disallowEmptySelection()&&e.size>0&&this.state.setSelectedKeys(new e0)}toggleSelectAll(){this.isSelectAll()?this.clearSelection():this.selectAll()}select(e,t){"none"!==this.selectionMode()&&("single"===this.selectionMode()?this.isSelected(e)&&!this.disallowEmptySelection()?this.toggleSelection(e):this.replaceSelection(e):"toggle"===this.selectionBehavior()||t&&"touch"===t.pointerType?this.toggleSelection(e):this.replaceSelection(e))}isSelectionEqual(e){if(e===this.state.selectedKeys())return!0;let t=this.selectedKeys();if(e.size!==t.size)return!1;for(let r of e)if(!t.has(r))return!1;for(let r of t)if(!e.has(r))return!1;return!0}canSelectItem(e){if("none"===this.state.selectionMode())return!1;let t=this.collection().getItem(e);return null!=t&&!t.disabled}isDisabled(e){let t=this.collection().getItem(e);return!t||t.disabled}getAllSelectableKeys(){let e=[];return(t=>{for(;null!=t;){if(this.canSelectItem(t)){let r=this.collection().getItem(t);if(!r)continue;"item"===r.type&&e.push(t)}t=this.collection().getKeyAfter(t)}})(this.collection().getFirstKey()),e}},e4=class{keyMap=new Map;iterable;firstKey;lastKey;constructor(e){let t;for(let t of(this.iterable=e,e))this.keyMap.set(t.key,t);if(0===this.keyMap.size)return;let r=0;for(let[e,n]of this.keyMap)t?(t.nextKey=e,n.prevKey=t.key):(this.firstKey=e,n.prevKey=void 0),"item"===n.type&&(n.index=r++),(t=n).nextKey=void 0;this.lastKey=t.key}*[Symbol.iterator](){yield*this.iterable}getSize(){return this.keyMap.size}getKeys(){return this.keyMap.keys()}getKeyBefore(e){return this.keyMap.get(e)?.prevKey}getKeyAfter(e){return this.keyMap.get(e)?.nextKey}getFirstKey(){return this.firstKey}getLastKey(){return this.lastKey}getItem(e){return this.keyMap.get(e)}at(e){let t=[...this.getKeys()];return this.getItem(t[e])}},e6=e=>"function"==typeof e?e():e,e9=e=>{let t=(0,o.s)(()=>{let t=e6(e.element);if(t)return getComputedStyle(t)}),r=()=>t()?.animationName??"none",[n,i]=(0,o.v)(e6(e.show)?"present":"hidden"),l="none";return(0,o.r)(n=>{let a=e6(e.show);return(0,o.W)(()=>{if(n===a)return a;let e=l,o=r();a?i("present"):"none"===o||t()?.display==="none"?i("hidden"):!0===n&&e!==o?i("hiding"):i("hidden")}),a}),(0,o.r)(()=>{let t=e6(e.element);if(!t)return;let a=e=>{e.target===t&&(l=r())},s=e=>{let o=r().includes(e.animationName);e.target===t&&o&&"hiding"===n()&&i("hidden")};t.addEventListener("animationstart",a),t.addEventListener("animationcancel",s),t.addEventListener("animationend",s),(0,o.M)(()=>{t.removeEventListener("animationstart",a),t.removeEventListener("animationcancel",s),t.removeEventListener("animationend",s)})}),{present:()=>"present"===n()||"hiding"===n(),state:n}},e8="data-kb-top-layer",e7=!1,te=[];function tt(e){return te.findIndex(t=>t.node===e)}function tr(){return te.filter(e=>e.isPointerBlocking)}function tn(){return tr().length>0}function to(e){let t=tt([...tr()].slice(-1)[0]?.node);return tt(e)<t}var ti={isTopMostLayer:function(e){return te[te.length-1].node===e},isBelowPointerBlockingLayer:to,addLayer:function(e){te.push(e)},removeLayer:function(e){let t=tt(e);t<0||te.splice(t,1)},find:function(e){return te[tt(e)]},assignPointerEventToLayers:function(){for(let{node:e}of te)e.style.pointerEvents=to(e)?"none":"auto"},disableBodyPointerEvents:function(e){if(tn()&&!e7){let t=en(e);n=document.body.style.pointerEvents,t.body.style.pointerEvents="none",e7=!0}},restoreBodyPointerEvents:function(e){if(tn())return;let t=en(e);t.body.style.pointerEvents=n,0===t.body.style.length&&t.body.removeAttribute("style"),e7=!1}};eR({},{Button:()=>ts,Root:()=>ta});var tl=["button","color","file","image","reset","submit"];function ta(e){let t,r=ew({type:"button"},e),[n,i]=(0,o.S)(r,["ref","type","disabled"]),l=eT(()=>t,()=>"button"),a=(0,o.s)(()=>{let e=l();if(null==e)return!1;var t={tagName:e,type:n.type};let r=t.tagName.toLowerCase();return"button"===r||"input"===r&&!!t.type&&-1!==tl.indexOf(t.type)}),s=(0,o.s)(()=>"input"===l()),d=(0,o.s)(()=>"a"===l()&&t?.getAttribute("href")!=null);return(0,o.o)(eL,(0,o.K)({as:"button",ref(e){let r=R(e=>t=e,n.ref);"function"==typeof r&&r(e)},get type(){return a()||s()?n.type:void 0},get role(){return a()||d()?void 0:"button"},get tabIndex(){return a()||d()||n.disabled?void 0:0},get disabled(){return a()||s()?n.disabled:void 0},get"aria-disabled"(){return!(a()||s())&&!!n.disabled||void 0},get"data-disabled"(){return n.disabled?"":void 0}},i))}var ts=ta,td=["top","right","bottom","left"],tu=Math.min,tc=Math.max,tg=Math.round,tf=Math.floor,tp=e=>({x:e,y:e}),th={left:"right",right:"left",bottom:"top",top:"bottom"},ty={start:"end",end:"start"};function tv(e,t){return"function"==typeof e?e(t):e}function tb(e){return e.split("-")[0]}function tm(e){return e.split("-")[1]}function tx(e){return"x"===e?"y":"x"}function tw(e){return"y"===e?"height":"width"}function tk(e){return["top","bottom"].includes(tb(e))?"y":"x"}function t$(e){return e.replace(/start|end/g,e=>ty[e])}function tS(e){return e.replace(/left|right|bottom|top/g,e=>th[e])}function tC(e){return"number"!=typeof e?{top:0,right:0,bottom:0,left:0,...e}:{top:e,right:e,bottom:e,left:e}}function tq(e){let{x:t,y:r,width:n,height:o}=e;return{width:n,height:o,top:r,left:t,right:t+n,bottom:r+o,x:t,y:r}}function tM(e,t,r){let n,{reference:o,floating:i}=e,l=tk(t),a=tx(tk(t)),s=tw(a),d=tb(t),u="y"===l,c=o.x+o.width/2-i.width/2,g=o.y+o.height/2-i.height/2,f=o[s]/2-i[s]/2;switch(d){case"top":n={x:c,y:o.y-i.height};break;case"bottom":n={x:c,y:o.y+o.height};break;case"right":n={x:o.x+o.width,y:g};break;case"left":n={x:o.x-i.width,y:g};break;default:n={x:o.x,y:o.y}}switch(tm(t)){case"start":n[a]-=f*(r&&u?-1:1);break;case"end":n[a]+=f*(r&&u?-1:1)}return n}var tE=async(e,t,r)=>{let{placement:n="bottom",strategy:o="absolute",middleware:i=[],platform:l}=r,a=i.filter(Boolean),s=await (null==l.isRTL?void 0:l.isRTL(t)),d=await l.getElementRects({reference:e,floating:t,strategy:o}),{x:u,y:c}=tM(d,n,s),g=n,f={},p=0;for(let r=0;r<a.length;r++){let{name:i,fn:h}=a[r],{x:y,y:v,data:b,reset:m}=await h({x:u,y:c,initialPlacement:n,placement:g,strategy:o,middlewareData:f,rects:d,platform:l,elements:{reference:e,floating:t}});u=null!=y?y:u,c=null!=v?v:c,f={...f,[i]:{...f[i],...b}},m&&p<=50&&(p++,"object"==typeof m&&(m.placement&&(g=m.placement),m.rects&&(d=!0===m.rects?await l.getElementRects({reference:e,floating:t,strategy:o}):m.rects),{x:u,y:c}=tM(d,g,s)),r=-1)}return{x:u,y:c,placement:g,strategy:o,middlewareData:f}};async function tT(e,t){var r;void 0===t&&(t={});let{x:n,y:o,platform:i,rects:l,elements:a,strategy:s}=e,{boundary:d="clippingAncestors",rootBoundary:u="viewport",elementContext:c="floating",altBoundary:g=!1,padding:f=0}=tv(t,e),p=tC(f),h=a[g?"floating"===c?"reference":"floating":c],y=tq(await i.getClippingRect({element:null==(r=await (null==i.isElement?void 0:i.isElement(h)))||r?h:h.contextElement||await (null==i.getDocumentElement?void 0:i.getDocumentElement(a.floating)),boundary:d,rootBoundary:u,strategy:s})),v="floating"===c?{x:n,y:o,width:l.floating.width,height:l.floating.height}:l.reference,b=await (null==i.getOffsetParent?void 0:i.getOffsetParent(a.floating)),m=await (null==i.isElement?void 0:i.isElement(b))&&await (null==i.getScale?void 0:i.getScale(b))||{x:1,y:1},x=tq(i.convertOffsetParentRelativeRectToViewportRelativeRect?await i.convertOffsetParentRelativeRectToViewportRelativeRect({elements:a,rect:v,offsetParent:b,strategy:s}):v);return{top:(y.top-x.top+p.top)/m.y,bottom:(x.bottom-y.bottom+p.bottom)/m.y,left:(y.left-x.left+p.left)/m.x,right:(x.right-y.right+p.right)/m.x}}function tF(e,t){return{top:e.top-t.height,right:e.right-t.width,bottom:e.bottom-t.height,left:e.left-t.width}}function tL(e){return td.some(t=>e[t]>=0)}async function tA(e,t){let{placement:r,platform:n,elements:o}=e,i=await (null==n.isRTL?void 0:n.isRTL(o.floating)),l=tb(r),a=tm(r),s="y"===tk(r),d=["left","top"].includes(l)?-1:1,u=i&&s?-1:1,c=tv(t,e),{mainAxis:g,crossAxis:f,alignmentAxis:p}="number"==typeof c?{mainAxis:c,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...c};return a&&"number"==typeof p&&(f="end"===a?-1*p:p),s?{x:f*u,y:g*d}:{x:g*d,y:f*u}}function tD(e){return tI(e)?(e.nodeName||"").toLowerCase():"#document"}function tz(e){var t;return(null==e||null==(t=e.ownerDocument)?void 0:t.defaultView)||window}function tO(e){var t;return null==(t=(tI(e)?e.ownerDocument:e.document)||window.document)?void 0:t.documentElement}function tI(e){return e instanceof Node||e instanceof tz(e).Node}function tK(e){return e instanceof Element||e instanceof tz(e).Element}function tP(e){return e instanceof HTMLElement||e instanceof tz(e).HTMLElement}function tH(e){return"undefined"!=typeof ShadowRoot&&(e instanceof ShadowRoot||e instanceof tz(e).ShadowRoot)}function tV(e){let{overflow:t,overflowX:r,overflowY:n,display:o}=tU(e);return/auto|scroll|overlay|hidden|clip/.test(t+n+r)&&!["inline","contents"].includes(o)}function tR(e){return[":popover-open",":modal"].some(t=>{try{return e.matches(t)}catch(e){return!1}})}function tB(e){let t=tQ(),r=tK(e)?tU(e):e;return"none"!==r.transform||"none"!==r.perspective||!!r.containerType&&"normal"!==r.containerType||!t&&!!r.backdropFilter&&"none"!==r.backdropFilter||!t&&!!r.filter&&"none"!==r.filter||["transform","perspective","filter"].some(e=>(r.willChange||"").includes(e))||["paint","layout","strict","content"].some(e=>(r.contain||"").includes(e))}function tQ(){return"undefined"!=typeof CSS&&!!CSS.supports&&CSS.supports("-webkit-backdrop-filter","none")}function tG(e){return["html","body","#document"].includes(tD(e))}function tU(e){return tz(e).getComputedStyle(e)}function tN(e){return tK(e)?{scrollLeft:e.scrollLeft,scrollTop:e.scrollTop}:{scrollLeft:e.scrollX,scrollTop:e.scrollY}}function tj(e){if("html"===tD(e))return e;let t=e.assignedSlot||e.parentNode||tH(e)&&e.host||tO(e);return tH(t)?t.host:t}function t_(e,t,r){var n;void 0===t&&(t=[]),void 0===r&&(r=!0);let o=function e(t){let r=tj(t);return tG(r)?t.ownerDocument?t.ownerDocument.body:t.body:tP(r)&&tV(r)?r:e(r)}(e),i=o===(null==(n=e.ownerDocument)?void 0:n.body),l=tz(o);return i?t.concat(l,l.visualViewport||[],tV(o)?o:[],l.frameElement&&r?t_(l.frameElement):[]):t.concat(o,t_(o,[],r))}function tW(e){let t=tU(e),r=parseFloat(t.width)||0,n=parseFloat(t.height)||0,o=tP(e),i=o?e.offsetWidth:r,l=o?e.offsetHeight:n,a=tg(r)!==i||tg(n)!==l;return a&&(r=i,n=l),{width:r,height:n,$:a}}function tY(e){return tK(e)?e:e.contextElement}function tJ(e){let t=tY(e);if(!tP(t))return tp(1);let r=t.getBoundingClientRect(),{width:n,height:o,$:i}=tW(t),l=(i?tg(r.width):r.width)/n,a=(i?tg(r.height):r.height)/o;return l&&Number.isFinite(l)||(l=1),a&&Number.isFinite(a)||(a=1),{x:l,y:a}}var tX=tp(0);function tZ(e){let t=tz(e);return tQ()&&t.visualViewport?{x:t.visualViewport.offsetLeft,y:t.visualViewport.offsetTop}:tX}function t0(e,t,r,n){var o;void 0===t&&(t=!1),void 0===r&&(r=!1);let i=e.getBoundingClientRect(),l=tY(e),a=tp(1);t&&(n?tK(n)&&(a=tJ(n)):a=tJ(e));let s=(void 0===(o=r)&&(o=!1),n&&(!o||n===tz(l))&&o)?tZ(l):tp(0),d=(i.left+s.x)/a.x,u=(i.top+s.y)/a.y,c=i.width/a.x,g=i.height/a.y;if(l){let e=tz(l),t=n&&tK(n)?tz(n):n,r=e,o=r.frameElement;for(;o&&n&&t!==r;){let e=tJ(o),t=o.getBoundingClientRect(),n=tU(o),i=t.left+(o.clientLeft+parseFloat(n.paddingLeft))*e.x,l=t.top+(o.clientTop+parseFloat(n.paddingTop))*e.y;d*=e.x,u*=e.y,c*=e.x,g*=e.y,d+=i,u+=l,o=(r=tz(o)).frameElement}}return tq({width:c,height:g,x:d,y:u})}function t1(e){return t0(tO(e)).left+tN(e).scrollLeft}function t2(e,t,r){let n;if("viewport"===t)n=function(e,t){let r=tz(e),n=tO(e),o=r.visualViewport,i=n.clientWidth,l=n.clientHeight,a=0,s=0;if(o){i=o.width,l=o.height;let e=tQ();(!e||e&&"fixed"===t)&&(a=o.offsetLeft,s=o.offsetTop)}return{width:i,height:l,x:a,y:s}}(e,r);else if("document"===t)n=function(e){let t=tO(e),r=tN(e),n=e.ownerDocument.body,o=tc(t.scrollWidth,t.clientWidth,n.scrollWidth,n.clientWidth),i=tc(t.scrollHeight,t.clientHeight,n.scrollHeight,n.clientHeight),l=-r.scrollLeft+t1(e),a=-r.scrollTop;return"rtl"===tU(n).direction&&(l+=tc(t.clientWidth,n.clientWidth)-o),{width:o,height:i,x:l,y:a}}(tO(e));else if(tK(t))n=function(e,t){let r=t0(e,!0,"fixed"===t),n=r.top+e.clientTop,o=r.left+e.clientLeft,i=tP(e)?tJ(e):tp(1),l=e.clientWidth*i.x,a=e.clientHeight*i.y;return{width:l,height:a,x:o*i.x,y:n*i.y}}(t,r);else{let r=tZ(e);n={...t,x:t.x-r.x,y:t.y-r.y}}return tq(n)}function t3(e){return"static"===tU(e).position}function t5(e,t){return tP(e)&&"fixed"!==tU(e).position?t?t(e):e.offsetParent:null}function t4(e,t){let r=tz(e);if(tR(e))return r;if(!tP(e)){let t=tj(e);for(;t&&!tG(t);){if(tK(t)&&!t3(t))return t;t=tj(t)}return r}let n=t5(e,t);for(;n&&["table","td","th"].includes(tD(n))&&t3(n);)n=t5(n,t);return n&&tG(n)&&t3(n)&&!tB(n)?r:n||function(e){let t=tj(e);for(;tP(t)&&!tG(t);){if(tB(t))return t;if(tR(t))break;t=tj(t)}return null}(e)||r}var t6=async function(e){let t=this.getOffsetParent||t4,r=this.getDimensions,n=await r(e.floating);return{reference:function(e,t,r){let n=tP(t),o=tO(t),i="fixed"===r,l=t0(e,!0,i,t),a={scrollLeft:0,scrollTop:0},s=tp(0);if(n||!n&&!i)if(("body"!==tD(t)||tV(o))&&(a=tN(t)),n){let e=t0(t,!0,i,t);s.x=e.x+t.clientLeft,s.y=e.y+t.clientTop}else o&&(s.x=t1(o));return{x:l.left+a.scrollLeft-s.x,y:l.top+a.scrollTop-s.y,width:l.width,height:l.height}}(e.reference,await t(e.floating),e.strategy),floating:{x:0,y:0,width:n.width,height:n.height}}},t9={convertOffsetParentRelativeRectToViewportRelativeRect:function(e){let{elements:t,rect:r,offsetParent:n,strategy:o}=e,i="fixed"===o,l=tO(n),a=!!t&&tR(t.floating);if(n===l||a&&i)return r;let s={scrollLeft:0,scrollTop:0},d=tp(1),u=tp(0),c=tP(n);if((c||!c&&!i)&&(("body"!==tD(n)||tV(l))&&(s=tN(n)),tP(n))){let e=t0(n);d=tJ(n),u.x=e.x+n.clientLeft,u.y=e.y+n.clientTop}return{width:r.width*d.x,height:r.height*d.y,x:r.x*d.x-s.scrollLeft*d.x+u.x,y:r.y*d.y-s.scrollTop*d.y+u.y}},getDocumentElement:tO,getClippingRect:function(e){let{element:t,boundary:r,rootBoundary:n,strategy:o}=e,i=[..."clippingAncestors"===r?tR(t)?[]:function(e,t){let r=t.get(e);if(r)return r;let n=t_(e,[],!1).filter(e=>tK(e)&&"body"!==tD(e)),o=null,i="fixed"===tU(e).position,l=i?tj(e):e;for(;tK(l)&&!tG(l);){let t=tU(l),r=tB(l);r||"fixed"!==t.position||(o=null),(i?!r&&!o:!r&&"static"===t.position&&!!o&&["absolute","fixed"].includes(o.position)||tV(l)&&!r&&function e(t,r){let n=tj(t);return!(n===r||!tK(n)||tG(n))&&("fixed"===tU(n).position||e(n,r))}(e,l))?n=n.filter(e=>e!==l):o=t,l=tj(l)}return t.set(e,n),n}(t,this._c):[].concat(r),n],l=i[0],a=i.reduce((e,r)=>{let n=t2(t,r,o);return e.top=tc(n.top,e.top),e.right=tu(n.right,e.right),e.bottom=tu(n.bottom,e.bottom),e.left=tc(n.left,e.left),e},t2(t,l,o));return{width:a.right-a.left,height:a.bottom-a.top,x:a.left,y:a.top}},getOffsetParent:t4,getElementRects:t6,getClientRects:function(e){return Array.from(e.getClientRects())},getDimensions:function(e){let{width:t,height:r}=tW(e);return{width:t,height:r}},getScale:tJ,isElement:tK,isRTL:function(e){return"rtl"===tU(e).direction}},t8=(0,o.q)();function t7(){let e=(0,o.Y)(t8);if(void 0===e)throw Error("[kobalte]: `usePopperContext` must be used within a `Popper` component");return e}var re=(0,o.V)('<svg display="block" viewBox="0 0 30 30" style="transform:scale(1.02)"><g><path fill="none" d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z"></path><path stroke="none" d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z">'),rt={top:180,right:-90,bottom:0,left:90};function rr(e){let t=t7(),r=ew({size:30},e),[n,i]=(0,o.S)(r,["ref","style","size"]),l=()=>t.currentPlacement().split("-")[0],a=function(e){let[t,r]=(0,o.v)();return(0,o.r)(()=>{let t=e();t&&r((en(t).defaultView||window).getComputedStyle(t))}),t}(t.contentRef);return(0,o.o)(eL,(0,o.K)({as:"div",ref(e){let r=R(t.setArrowRef,n.ref);"function"==typeof r&&r(e)},"aria-hidden":"true",get style(){return J({position:"absolute","font-size":`${n.size}px`,width:"1em",height:"1em","pointer-events":"none",fill:a()?.getPropertyValue("background-color")||"none",stroke:a()?.getPropertyValue(`border-${l()}-color`)||"none","stroke-width":2*Number.parseInt(a()?.getPropertyValue(`border-${l()}-width`)||"0px")*(30/n.size)},n.style)}},i,{get children(){let e=re(),t=e.firstChild;return(0,o.t)(()=>(0,o.Q)(t,"transform",`rotate(${rt[l()]} 15 15) translate(0 2)`)),e}}))}function rn(e){let{x:t=0,y:r=0,width:n=0,height:o=0}=e??{};if("function"==typeof DOMRect)return new DOMRect(t,r,n,o);let i={x:t,y:r,width:n,height:o,top:r,right:t+n,bottom:r+o,left:t};return{...i,toJSON:()=>i}}function ro(e){return/^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(e)}var ri={top:"bottom",right:"left",bottom:"top",left:"right"},rl=Object.assign(function(e){let t=ew({getAnchorRect:e=>e?.getBoundingClientRect(),placement:"bottom",gutter:0,shift:0,flip:!0,slide:!0,overlap:!1,sameWidth:!1,fitViewport:!1,hideWhenDetached:!1,detachedPadding:0,arrowPadding:4,overflowPadding:8},e),[r,n]=(0,o.v)(),[i,l]=(0,o.v)(),[a,s]=(0,o.v)(t.placement),d=()=>{var e,r;return e=t.anchorRef?.(),r=t.getAnchorRect,{contextElement:e,getBoundingClientRect:()=>{let t=r(e);return t?rn(t):e?e.getBoundingClientRect():rn()}}},{direction:u}=eX();async function c(){var e,n,o,l,a;let c,g,f=d(),p=r(),h=i();if(!f||!p)return;let y=(h?.clientHeight||0)/2,v="number"==typeof t.gutter?t.gutter+y:t.gutter??y;p.style.setProperty("--kb-popper-content-overflow-padding",`${t.overflowPadding}px`),f.getBoundingClientRect();let b=[(void 0===(e=({placement:e})=>({mainAxis:v,crossAxis:e.split("-")[1]?void 0:t.shift,alignmentAxis:t.shift}))&&(e=0),{name:"offset",options:e,async fn(t){var r,n;let{x:o,y:i,placement:l,middlewareData:a}=t,s=await tA(t,e);return l===(null==(r=a.offset)?void 0:r.placement)&&null!=(n=a.arrow)&&n.alignmentOffset?{}:{x:o+s.x,y:i+s.y,data:{...s,placement:l}}}})];if(!1!==t.flip){let e="string"==typeof t.flip?t.flip.split(" "):void 0;if(void 0!==e&&!e.every(ro))throw Error("`flip` expects a spaced-delimited list of placements");b.push({name:"flip",options:n={padding:t.overflowPadding,fallbackPlacements:e},async fn(e){var t,r,o,i,l;let{placement:a,middlewareData:s,rects:d,initialPlacement:u,platform:c,elements:g}=e,{mainAxis:f=!0,crossAxis:p=!0,fallbackPlacements:h,fallbackStrategy:y="bestFit",fallbackAxisSideDirection:v="none",flipAlignment:b=!0,...m}=tv(n,e);if(null!=(t=s.arrow)&&t.alignmentOffset)return{};let x=tb(a),w=tk(u),k=tb(u)===u,$=await (null==c.isRTL?void 0:c.isRTL(g.floating)),S=h||(k||!b?[tS(u)]:function(e){let t=tS(e);return[t$(e),t,t$(t)]}(u)),C="none"!==v;!h&&C&&S.push(...function(e,t,r,n){let o=tm(e),i=function(e,t,r){let n=["left","right"],o=["right","left"];switch(e){case"top":case"bottom":if(r)return t?o:n;return t?n:o;case"left":case"right":return t?["top","bottom"]:["bottom","top"];default:return[]}}(tb(e),"start"===r,n);return o&&(i=i.map(e=>e+"-"+o),t&&(i=i.concat(i.map(t$)))),i}(u,b,v,$));let q=[u,...S],M=await tT(e,m),E=[],T=(null==(r=s.flip)?void 0:r.overflows)||[];if(f&&E.push(M[x]),p){let e=function(e,t,r){void 0===r&&(r=!1);let n=tm(e),o=tx(tk(e)),i=tw(o),l="x"===o?n===(r?"end":"start")?"right":"left":"start"===n?"bottom":"top";return t.reference[i]>t.floating[i]&&(l=tS(l)),[l,tS(l)]}(a,d,$);E.push(M[e[0]],M[e[1]])}if(T=[...T,{placement:a,overflows:E}],!E.every(e=>e<=0)){let e=((null==(o=s.flip)?void 0:o.index)||0)+1,t=q[e];if(t)return{data:{index:e,overflows:T},reset:{placement:t}};let r=null==(i=T.filter(e=>e.overflows[0]<=0).sort((e,t)=>e.overflows[1]-t.overflows[1])[0])?void 0:i.placement;if(!r)switch(y){case"bestFit":{let e=null==(l=T.filter(e=>{if(C){let t=tk(e.placement);return t===w||"y"===t}return!0}).map(e=>[e.placement,e.overflows.filter(e=>e>0).reduce((e,t)=>e+t,0)]).sort((e,t)=>e[1]-t[1])[0])?void 0:l[0];e&&(r=e);break}case"initialPlacement":r=u}if(a!==r)return{reset:{placement:r}}}return{}}})}(t.slide||t.overlap)&&b.push({name:"shift",options:o={mainAxis:t.slide,crossAxis:t.overlap,padding:t.overflowPadding},async fn(e){let{x:t,y:r,placement:n}=e,{mainAxis:i=!0,crossAxis:l=!1,limiter:a={fn:e=>{let{x:t,y:r}=e;return{x:t,y:r}}},...s}=tv(o,e),d={x:t,y:r},u=await tT(e,s),c=tk(tb(n)),g=tx(c),f=d[g],p=d[c];if(i){let e="y"===g?"top":"left",t="y"===g?"bottom":"right",r=f+u[e],n=f-u[t];f=tc(r,tu(f,n))}if(l){let e="y"===c?"top":"left",t="y"===c?"bottom":"right",r=p+u[e],n=p-u[t];p=tc(r,tu(p,n))}let h=a.fn({...e,[g]:f,[c]:p});return{...h,data:{x:h.x-t,y:h.y-r}}}}),b.push({name:"size",options:l={padding:t.overflowPadding,apply({availableWidth:e,availableHeight:r,rects:n}){let o=Math.round(n.reference.width);e=Math.floor(e),r=Math.floor(r),p.style.setProperty("--kb-popper-anchor-width",`${o}px`),p.style.setProperty("--kb-popper-content-available-width",`${e}px`),p.style.setProperty("--kb-popper-content-available-height",`${r}px`),t.sameWidth&&(p.style.width=`${o}px`),t.fitViewport&&(p.style.maxWidth=`${e}px`,p.style.maxHeight=`${r}px`)}},async fn(e){let t,r,{placement:n,rects:o,platform:i,elements:a}=e,{apply:s=()=>{},...d}=tv(l,e),u=await tT(e,d),c=tb(n),g=tm(n),f="y"===tk(n),{width:p,height:h}=o.floating;"top"===c||"bottom"===c?(t=c,r=g===(await (null==i.isRTL?void 0:i.isRTL(a.floating))?"start":"end")?"left":"right"):(r=c,t="end"===g?"top":"bottom");let y=h-u.top-u.bottom,v=p-u.left-u.right,b=tu(h-u[t],y),m=tu(p-u[r],v),x=!e.middlewareData.shift,w=b,k=m;if(f?k=g||x?tu(m,v):v:w=g||x?tu(b,y):y,x&&!g){let e=tc(u.left,0),t=tc(u.right,0),r=tc(u.top,0),n=tc(u.bottom,0);f?k=p-2*(0!==e||0!==t?e+t:tc(u.left,u.right)):w=h-2*(0!==r||0!==n?r+n:tc(u.top,u.bottom))}await s({...e,availableWidth:k,availableHeight:w});let $=await i.getDimensions(a.floating);return p!==$.width||h!==$.height?{reset:{rects:!0}}:{}}}),t.hideWhenDetached&&b.push({name:"hide",options:a={padding:t.detachedPadding},async fn(e){let{rects:t}=e,{strategy:r="referenceHidden",...n}=tv(a,e);switch(r){case"referenceHidden":{let r=tF(await tT(e,{...n,elementContext:"reference"}),t.reference);return{data:{referenceHiddenOffsets:r,referenceHidden:tL(r)}}}case"escaped":{let r=tF(await tT(e,{...n,altBoundary:!0}),t.floating);return{data:{escapedOffsets:r,escaped:tL(r)}}}default:return{}}}}),h&&b.push({name:"arrow",options:g={element:h,padding:t.arrowPadding},async fn(e){let{x:t,y:r,placement:n,rects:o,platform:i,elements:l,middlewareData:a}=e,{element:s,padding:d=0}=tv(g,e)||{};if(null==s)return{};let u=tC(d),c={x:t,y:r},f=tx(tk(n)),p=tw(f),h=await i.getDimensions(s),y="y"===f,v=y?"clientHeight":"clientWidth",b=o.reference[p]+o.reference[f]-c[f]-o.floating[p],m=c[f]-o.reference[f],x=await (null==i.getOffsetParent?void 0:i.getOffsetParent(s)),w=x?x[v]:0;w&&await (null==i.isElement?void 0:i.isElement(x))||(w=l.floating[v]||o.floating[p]);let k=w/2-h[p]/2-1,$=tu(u[y?"top":"left"],k),S=tu(u[y?"bottom":"right"],k),C=w-h[p]-S,q=w/2-h[p]/2+(b/2-m/2),M=tc($,tu(q,C)),E=!a.arrow&&null!=tm(n)&&q!==M&&o.reference[p]/2-(q<$?$:S)-h[p]/2<0,T=E?q<$?q-$:q-C:0;return{[f]:c[f]+T,data:{[f]:M,centerOffset:q-M-T,...E&&{alignmentOffset:T}},reset:E}}});let m=await ((e,t,r)=>{let n=new Map,o={platform:t9,...r},i={...o.platform,_c:n};return tE(e,t,{...o,platform:i})})(f,p,{placement:t.placement,strategy:"absolute",middleware:b,platform:{...t9,isRTL:()=>"rtl"===u()}});if(s(m.placement),t.onCurrentPlacementChange?.(m.placement),!p)return;p.style.setProperty("--kb-popper-content-transform-origin",function(e,t){let[r,n]=e.split("-"),o=ri[r];return n?"left"===r||"right"===r?`${o} ${"start"===n?"top":"bottom"}`:"start"===n?`${o} ${"rtl"===t?"right":"left"}`:`${o} ${"rtl"===t?"left":"right"}`:`${o} center`}(m.placement,u()));let x=Math.round(m.x),w=Math.round(m.y);if(t.hideWhenDetached&&(c=m.middlewareData.hide?.referenceHidden?"hidden":"visible"),Object.assign(p.style,{top:"0",left:"0",transform:`translate3d(${x}px, ${w}px, 0)`,visibility:c}),h&&m.middlewareData.arrow){let{x:e,y:t}=m.middlewareData.arrow,r=m.placement.split("-")[0];Object.assign(h.style,{left:null!=e?`${e}px`:"",top:null!=t?`${t}px`:"",[r]:"100%"})}}return(0,o.r)(()=>{let e=d(),t=r();if(!e||!t)return;let n=function(e,t,r,n){let o;void 0===n&&(n={});let{ancestorScroll:i=!0,ancestorResize:l=!0,elementResize:a="function"==typeof ResizeObserver,layoutShift:s="function"==typeof IntersectionObserver,animationFrame:d=!1}=n,u=tY(e),c=i||l?[...u?t_(u):[],...t_(t)]:[];c.forEach(e=>{i&&e.addEventListener("scroll",r,{passive:!0}),l&&e.addEventListener("resize",r)});let g=u&&s?function(e,t){let r,n=null,o=tO(e);function i(){var e;clearTimeout(r),null==(e=n)||e.disconnect(),n=null}return!function l(a,s){void 0===a&&(a=!1),void 0===s&&(s=1),i();let{left:d,top:u,width:c,height:g}=e.getBoundingClientRect();if(a||t(),!c||!g)return;let f=tf(u),p=tf(o.clientWidth-(d+c)),h={rootMargin:-f+"px "+-p+"px "+-tf(o.clientHeight-(u+g))+"px "+-tf(d)+"px",threshold:tc(0,tu(1,s))||1},y=!0;function v(e){let t=e[0].intersectionRatio;if(t!==s){if(!y)return l();t?l(!1,t):r=setTimeout(()=>{l(!1,1e-7)},1e3)}y=!1}try{n=new IntersectionObserver(v,{...h,root:o.ownerDocument})}catch(e){n=new IntersectionObserver(v,h)}n.observe(e)}(!0),i}(u,r):null,f=-1,p=null;a&&(p=new ResizeObserver(e=>{let[n]=e;n&&n.target===u&&p&&(p.unobserve(t),cancelAnimationFrame(f),f=requestAnimationFrame(()=>{var e;null==(e=p)||e.observe(t)})),r()}),u&&!d&&p.observe(u),p.observe(t));let h=d?t0(e):null;return d&&function t(){let n=t0(e);h&&(n.x!==h.x||n.y!==h.y||n.width!==h.width||n.height!==h.height)&&r(),h=n,o=requestAnimationFrame(t)}(),r(),()=>{var e;c.forEach(e=>{i&&e.removeEventListener("scroll",r),l&&e.removeEventListener("resize",r)}),null==g||g(),null==(e=p)||e.disconnect(),p=null,d&&cancelAnimationFrame(o)}}(e,t,c,{elementResize:"function"==typeof ResizeObserver});(0,o.M)(n)}),(0,o.r)(()=>{let e=r(),n=t.contentRef?.();e&&n&&queueMicrotask(()=>{e.style.zIndex=getComputedStyle(n).zIndex})}),(0,o.o)(t8.Provider,{value:{currentPlacement:a,contentRef:()=>t.contentRef?.(),setPositionerRef:n,setArrowRef:l},get children(){return t.children}})},{Arrow:rr,Context:t8,usePopperContext:t7,Positioner:function(e){let t=t7(),[r,n]=(0,o.S)(e,["ref","style"]);return(0,o.o)(eL,(0,o.K)({as:"div",ref(e){let n=R(t.setPositionerRef,r.ref);"function"==typeof n&&n(e)},"data-popper-positioner":"",get style(){return J({position:"absolute",top:0,left:0,"min-width":"max-content"},r.style)}},n))}}),ra="interactOutside.pointerDownOutside",rs="interactOutside.focusOutside",rd=(0,o.q)();function ru(e){let t,r=(0,o.Y)(rd),[n,i]=(0,o.S)(e,["ref","disableOutsidePointerEvents","excludedElements","onEscapeKeyDown","onPointerDownOutside","onFocusOutside","onInteractOutside","onDismiss","bypassTopMostLayerCheck"]),l=new Set([]);!function(e,t){let r,n=ex,i=()=>en(t()),l=t=>e.onPointerDownOutside?.(t),a=t=>e.onFocusOutside?.(t),d=t=>e.onInteractOutside?.(t),u=r=>{let n=r.target;return!(!(n instanceof HTMLElement)||n.closest(`[${e8}]`)||!et(i(),n)||et(t(),n))&&!e.shouldExcludeElement?.(n)},c=e=>{function r(){let r=t(),n=e.target;if(!r||!n||!u(e))return;let o=ed([l,d]);n.addEventListener(ra,o,{once:!0});let i=new CustomEvent(ra,{bubbles:!1,cancelable:!0,detail:{originalEvent:e,isContextMenu:2===e.button||(ea()?e.metaKey&&!e.ctrlKey:e.ctrlKey&&!e.metaKey)&&0===e.button}});n.dispatchEvent(i)}"touch"===e.pointerType?(i().removeEventListener("click",r),n=r,i().addEventListener("click",r,{once:!0})):r()},g=e=>{let r=t(),n=e.target;if(!r||!n||!u(e))return;let o=ed([a,d]);n.addEventListener(rs,o,{once:!0});let i=new CustomEvent(rs,{bubbles:!1,cancelable:!0,detail:{originalEvent:e,isContextMenu:!1}});n.dispatchEvent(i)};(0,o.r)(()=>{!o.I&&(s(e.isDisabled)||(r=window.setTimeout(()=>{i().addEventListener("pointerdown",c,!0)},0),i().addEventListener("focusin",g,!0),(0,o.M)(()=>{window.clearTimeout(r),i().removeEventListener("click",n),i().removeEventListener("pointerdown",c,!0),i().removeEventListener("focusin",g,!0)})))})}({shouldExcludeElement:e=>!!t&&(n.excludedElements?.some(t=>et(t(),e))||[...l].some(t=>et(t,e))),onPointerDownOutside:e=>{!(!t||ti.isBelowPointerBlockingLayer(t))&&(n.bypassTopMostLayerCheck||ti.isTopMostLayer(t))&&(n.onPointerDownOutside?.(e),n.onInteractOutside?.(e),e.defaultPrevented||n.onDismiss?.())},onFocusOutside:e=>{n.onFocusOutside?.(e),n.onInteractOutside?.(e),e.defaultPrevented||n.onDismiss?.()}},()=>t);var a={ownerDocument:()=>en(t),onEscapeKeyDown:e=>{t&&ti.isTopMostLayer(t)&&(n.onEscapeKeyDown?.(e),!e.defaultPrevented&&n.onDismiss&&(e.preventDefault(),n.onDismiss()))}};let d=e=>{e.key===ei.Escape&&a.onEscapeKeyDown?.(e)};return(0,o.r)(()=>{if(o.I||s(a.isDisabled))return;let e=a.ownerDocument?.()??en();e.addEventListener("keydown",d),(0,o.M)(()=>{e.removeEventListener("keydown",d)})}),(0,o.N)(()=>{if(!t)return;ti.addLayer({node:t,isPointerBlocking:n.disableOutsidePointerEvents,dismiss:n.onDismiss});let e=r?.registerNestedLayer(t);ti.assignPointerEventToLayers(),ti.disableBodyPointerEvents(t),(0,o.M)(()=>{t&&(ti.removeLayer(t),e?.(),ti.assignPointerEventToLayers(),ti.restoreBodyPointerEvents(t))})}),(0,o.r)((0,o.O)([()=>t,()=>n.disableOutsidePointerEvents],([e,t])=>{if(!e)return;let r=ti.find(e);r&&r.isPointerBlocking!==t&&(r.isPointerBlocking=t,ti.assignPointerEventToLayers()),t&&ti.disableBodyPointerEvents(e),(0,o.M)(()=>{ti.restoreBodyPointerEvents(e)})},{defer:!0})),(0,o.o)(rd.Provider,{value:{registerNestedLayer:e=>{l.add(e);let t=r?.registerNestedLayer(e);return()=>{l.delete(e),t?.()}}},get children(){return(0,o.o)(eL,(0,o.K)({as:"div",ref(e){let r=R(e=>t=e,n.ref);"function"==typeof r&&r(e)}},i))}})}function rc(e={}){let[t,r]=eH({value:()=>s(e.open),defaultValue:()=>!!s(e.defaultOpen),onChange:t=>e.onOpenChange?.(t)}),n=()=>{r(!0)},o=()=>{r(!1)};return{isOpen:t,setIsOpen:r,open:n,close:o,toggle:()=>{t()?o():n()}}}var rg={};eR(rg,{Description:()=>eO,ErrorMessage:()=>eI,Item:()=>rv,ItemControl:()=>rb,ItemDescription:()=>rm,ItemIndicator:()=>rx,ItemInput:()=>rw,ItemLabel:()=>rk,Label:()=>r$,RadioGroup:()=>rC,Root:()=>rS});var rf=(0,o.q)();function rp(){let e=(0,o.Y)(rf);if(void 0===e)throw Error("[kobalte]: `useRadioGroupContext` must be used within a `RadioGroup` component");return e}var rh=(0,o.q)();function ry(){let e=(0,o.Y)(rh);if(void 0===e)throw Error("[kobalte]: `useRadioGroupItemContext` must be used within a `RadioGroup.Item` component");return e}function rv(e){let t=ez(),r=rp(),n=ew({id:`${t.generateId("item")}-${(0,o.w)()}`},e),[i,l]=(0,o.S)(n,["value","disabled","onPointerDown"]),[a,s]=(0,o.v)(),[d,u]=(0,o.v)(),[c,g]=(0,o.v)(),[f,p]=(0,o.v)(),[h,y]=(0,o.v)(!1),v=(0,o.s)(()=>r.isSelectedValue(i.value)),b=(0,o.s)(()=>i.disabled||t.isDisabled()||!1),m=e=>{es(e,i.onPointerDown),h()&&e.preventDefault()},x=(0,o.s)(()=>({...t.dataset(),"data-disabled":b()?"":void 0,"data-checked":v()?"":void 0})),w={value:()=>i.value,dataset:x,isSelected:v,isDisabled:b,inputId:a,labelId:d,descriptionId:c,inputRef:f,select:()=>r.setSelectedValue(i.value),generateId:ee(()=>l.id),registerInput:eE(s),registerLabel:eE(u),registerDescription:eE(g),setIsFocused:y,setInputRef:p};return(0,o.o)(rh.Provider,{value:w,get children(){return(0,o.o)(eL,(0,o.K)({as:"div",role:"group",onPointerDown:m},x,l))}})}function rb(e){let t=ry(),r=ew({id:t.generateId("control")},e),[n,i]=(0,o.S)(r,["onClick","onKeyDown"]);return(0,o.o)(eL,(0,o.K)({as:"div",onClick:e=>{es(e,n.onClick),t.select(),t.inputRef()?.focus()},onKeyDown:e=>{es(e,n.onKeyDown),e.key===ei.Space&&(t.select(),t.inputRef()?.focus())}},()=>t.dataset(),i))}function rm(e){let t=ry(),r=ew({id:t.generateId("description")},e);return(0,o.r)(()=>(0,o.M)(t.registerDescription(r.id))),(0,o.o)(eL,(0,o.K)({as:"div"},()=>t.dataset(),r))}function rx(e){let t=ry(),r=ew({id:t.generateId("indicator")},e),[n,i]=(0,o.S)(r,["ref","forceMount"]),[l,a]=(0,o.v)(),{present:s}=e9({show:()=>n.forceMount||t.isSelected(),element:()=>l()??null});return(0,o.o)(o.h,{get when(){return s()},get children(){return(0,o.o)(eL,(0,o.K)({as:"div",ref(e){let t=R(a,n.ref);"function"==typeof t&&t(e)}},()=>t.dataset(),i))}})}function rw(e){let t=ez(),r=rp(),n=ry(),i=ew({id:n.generateId("input")},e),[l,a]=(0,o.S)(i,["ref","style","aria-labelledby","aria-describedby","onChange","onFocus","onBlur"]),[s,d]=(0,o.v)(!1);return(0,o.r)((0,o.O)([()=>n.isSelected(),()=>n.value()],e=>{if(!e[0]&&e[1]===n.value())return;d(!0);let t=n.inputRef();t?.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0})),t?.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))},{defer:!0})),(0,o.r)(()=>(0,o.M)(n.registerInput(a.id))),(0,o.o)(eL,(0,o.K)({as:"input",ref(e){let t=R(n.setInputRef,l.ref);"function"==typeof t&&t(e)},type:"radio",get name(){return t.name()},get value(){return n.value()},get checked(){return n.isSelected()},get required(){return t.isRequired()},get disabled(){return n.isDisabled()},get readonly(){return t.isReadOnly()},get style(){return J({...eM},l.style)},get"aria-labelledby"(){return[l["aria-labelledby"],n.labelId(),null!=l["aria-labelledby"]&&null!=a["aria-label"]?a.id:void 0].filter(Boolean).join(" ")||void 0},get"aria-describedby"(){return[l["aria-describedby"],n.descriptionId(),r.ariaDescribedBy()].filter(Boolean).join(" ")||void 0},onChange:e=>{es(e,l.onChange),e.stopPropagation(),s()||(r.setSelectedValue(n.value()),e.target.checked=n.isSelected()),d(!1)},onFocus:e=>{es(e,l.onFocus),n.setIsFocused(!0)},onBlur:e=>{es(e,l.onBlur),n.setIsFocused(!1)}},()=>n.dataset(),a))}function rk(e){let t=ry(),r=ew({id:t.generateId("label")},e);return(0,o.r)(()=>(0,o.M)(t.registerLabel(r.id))),(0,o.o)(eL,(0,o.K)({as:"label",get for(){return t.inputId()}},()=>t.dataset(),r))}function r$(e){return(0,o.o)(eK,(0,o.K)({as:"span"},e))}function rS(e){var t;let r,n=ew({id:`radiogroup-${(0,o.w)()}`,orientation:"vertical"},e),[i,l,a]=(0,o.S)(n,["ref","value","defaultValue","onChange","orientation","aria-labelledby","aria-describedby"],eA),[d,u]=eP({value:()=>i.value,defaultValue:()=>i.defaultValue,onChange:e=>i.onChange?.(e)}),{formControlContext:c}=function(e){let t=ew({id:`form-control-${(0,o.w)()}`},e),[r,n]=(0,o.v)(),[i,l]=(0,o.v)(),[a,d]=(0,o.v)(),[u,c]=(0,o.v)();return{formControlContext:{name:()=>s(t.name)??s(t.id),dataset:(0,o.s)(()=>({"data-valid":"valid"===s(t.validationState)?"":void 0,"data-invalid":"invalid"===s(t.validationState)?"":void 0,"data-required":s(t.required)?"":void 0,"data-disabled":s(t.disabled)?"":void 0,"data-readonly":s(t.readOnly)?"":void 0})),validationState:()=>s(t.validationState),isRequired:()=>s(t.required),isDisabled:()=>s(t.disabled),isReadOnly:()=>s(t.readOnly),labelId:r,fieldId:i,descriptionId:a,errorMessageId:u,getAriaLabelledBy:(e,t,n)=>{let o=null!=n||null!=r();return[n,r(),o&&null!=t?e:void 0].filter(Boolean).join(" ")||void 0},getAriaDescribedBy:e=>[a(),u(),e].filter(Boolean).join(" ")||void 0,generateId:ee(()=>s(t.id)),registerLabel:eE(n),registerField:eE(l),registerDescription:eE(d),registerErrorMessage:eE(c)}}}(l);t=()=>u(i.defaultValue??""),(0,o.r)((0,o.O)(()=>r,e=>{var r;if(null==e)return;let n=(r=e).matches("textarea, input, select, button")?r.form:r.closest("form");null!=n&&(n.addEventListener("reset",t,{passive:!0}),(0,o.M)(()=>{n.removeEventListener("reset",t)}))}));let g=()=>c.getAriaDescribedBy(i["aria-describedby"]),f=e=>e===d(),p={ariaDescribedBy:g,isSelectedValue:f,setSelectedValue:e=>{if(!(c.isReadOnly()||c.isDisabled())&&(u(e),r))for(let e of r.querySelectorAll("[type='radio']"))e.checked=f(e.value)}};return(0,o.o)(eD.Provider,{value:c,get children(){return(0,o.o)(rf.Provider,{value:p,get children(){return(0,o.o)(eL,(0,o.K)({as:"div",ref(e){let t=R(e=>r=e,i.ref);"function"==typeof t&&t(e)},role:"radiogroup",get id(){return s(l.id)},get"aria-invalid"(){return"invalid"===c.validationState()||void 0},get"aria-required"(){return c.isRequired()||void 0},get"aria-disabled"(){return c.isDisabled()||void 0},get"aria-readonly"(){return c.isReadOnly()||void 0},get"aria-orientation"(){return i.orientation},get"aria-labelledby"(){return c.getAriaLabelledBy(s(l.id),a["aria-label"],i["aria-labelledby"])},get"aria-describedby"(){return g()}},()=>c.dataset(),a))}})}})}var rC=Object.assign(rS,{Description:eO,ErrorMessage:eI,Item:rv,ItemControl:rb,ItemDescription:rm,ItemIndicator:rx,ItemInput:rw,ItemLabel:rk,Label:r$}),rq=class{collection;ref;collator;constructor(e,t,r){this.collection=e,this.ref=t,this.collator=r}getKeyBelow(e){let t=this.collection().getKeyAfter(e);for(;null!=t;){let e=this.collection().getItem(t);if(e&&"item"===e.type&&!e.disabled)return t;t=this.collection().getKeyAfter(t)}}getKeyAbove(e){let t=this.collection().getKeyBefore(e);for(;null!=t;){let e=this.collection().getItem(t);if(e&&"item"===e.type&&!e.disabled)return t;t=this.collection().getKeyBefore(t)}}getFirstKey(){let e=this.collection().getFirstKey();for(;null!=e;){let t=this.collection().getItem(e);if(t&&"item"===t.type&&!t.disabled)return e;e=this.collection().getKeyAfter(e)}}getLastKey(){let e=this.collection().getLastKey();for(;null!=e;){let t=this.collection().getItem(e);if(t&&"item"===t.type&&!t.disabled)return e;e=this.collection().getKeyBefore(e)}}getItem(e){return this.ref?.()?.querySelector(`[data-key="${e}"]`)??null}getKeyPageAbove(e){let t=this.ref?.(),r=this.getItem(e);if(!t||!r)return;let n=Math.max(0,r.offsetTop+r.offsetHeight-t.offsetHeight),o=e;for(;o&&r&&r.offsetTop>n;)r=null!=(o=this.getKeyAbove(o))?this.getItem(o):null;return o}getKeyPageBelow(e){let t=this.ref?.(),r=this.getItem(e);if(!t||!r)return;let n=Math.min(t.scrollHeight,r.offsetTop-r.offsetHeight+t.offsetHeight),o=e;for(;o&&r&&r.offsetTop<n;)r=null!=(o=this.getKeyBelow(o))?this.getItem(o):null;return o}getKeyForSearch(e,t){let r=this.collator?.();if(!r)return;let n=null!=t?this.getKeyBelow(t):this.getFirstKey();for(;null!=n;){let t=this.collection().getItem(n);if(t){let o=t.textValue.slice(0,e.length);if(t.textValue&&0===r.compare(o,e))return n}n=this.getKeyBelow(n)}}},rM="focusScope.autoFocusOnMount",rE="focusScope.autoFocusOnUnmount",rT={bubbles:!1,cancelable:!0},rF={stack:[],active(){return this.stack[0]},add(e){e!==this.active()&&this.active()?.pause(),this.stack=X(this.stack,e),this.stack.unshift(e)},remove(e){this.stack=X(this.stack,e),this.active()?.resume()}},rL=new WeakMap,rA=[],rD=new Map,rz=e=>{(0,o.r)(()=>{let t=e6(e.style)??{},r=e6(e.properties)??[],n={};for(let r in t)n[r]=e.element.style[r];let i=rD.get(e.key);for(let t of(i?i.activeCount++:rD.set(e.key,{activeCount:1,originalStyles:n,properties:r.map(e=>e.key)}),Object.assign(e.element.style,e.style),r))e.element.style.setProperty(t.key,t.value);(0,o.M)(()=>{let t=rD.get(e.key);if(t){if(1!==t.activeCount)return void t.activeCount--;for(let[r,n]of(rD.delete(e.key),Object.entries(t.originalStyles)))e.element.style[r]=n;for(let r of t.properties)e.element.style.removeProperty(r);0===e.element.style.length&&e.element.removeAttribute("style"),e.cleanup?.()}})})},rO=(e,t)=>{switch(t){case"x":return[e.clientWidth,e.scrollLeft,e.scrollWidth];case"y":return[e.clientHeight,e.scrollTop,e.scrollHeight]}},rI=(e,t)=>{let r=getComputedStyle(e),n="x"===t?r.overflowX:r.overflowY;return"auto"===n||"scroll"===n||"HTML"===e.tagName&&"visible"===n},[rK,rP]=(0,o.v)([]),rH=e=>e.changedTouches[0]?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0],rV=(e,t,r,n)=>{let o=null!==n&&rR(n,e),[i,l]=((e,t,r)=>{let n="x"===t&&"rtl"===window.getComputedStyle(e).direction?-1:1,o=e,i=0,l=0,a=!1;do{let[e,s,d]=rO(o,t),u=d-e-n*s;(0!==s||0!==u)&&rI(o,t)&&(i+=u,l+=s),o===(r??document.documentElement)?a=!0:o=o._$host??o.parentElement}while(o&&!a);return[i,l]})(e,t,o?n:void 0);return!(r>0&&1>=Math.abs(i)||r<0&&1>Math.abs(l))},rR=(e,t)=>{if(e.contains(t))return!0;let r=t;for(;r;){if(r===e)return!0;r=r._$host??r.parentElement}return!1},rB=(0,o.q)();function rQ(){let e=(0,o.Y)(rB);if(void 0===e)throw Error("[kobalte]: `useMenuContext` must be used within a `Menu` component");return e}var rG=(0,o.q)();function rU(){let e=(0,o.Y)(rG);if(void 0===e)throw Error("[kobalte]: `useMenuItemContext` must be used within a `Menu.Item` component");return e}var rN=(0,o.q)();function rj(){let e=(0,o.Y)(rN);if(void 0===e)throw Error("[kobalte]: `useMenuRootContext` must be used within a `MenuRoot` component");return e}function r_(e){let t,r=rj(),n=rQ(),i=ew({id:r.generateId(`item-${(0,o.w)()}`)},e),[l,a]=(0,o.S)(i,["ref","textValue","disabled","closeOnSelect","checked","indeterminate","onSelect","onPointerMove","onPointerLeave","onPointerDown","onPointerUp","onClick","onKeyDown","onMouseDown","onFocus"]),[s,d]=(0,o.v)(),[u,c]=(0,o.v)(),[g,f]=(0,o.v)(),p=()=>n.listState().selectionManager(),h=()=>a.id,y=()=>{l.onSelect?.(),l.closeOnSelect&&setTimeout(()=>{n.close(!0)})},v=function(){let e=(0,o.Y)(eB);if(void 0===e)throw Error("[kobalte]: `useDomCollectionContext` must be used within a `DomCollectionProvider` component");return e}(),b=ew({shouldRegisterItem:!0},{getItem:()=>({ref:()=>t,type:"item",key:h(),textValue:l.textValue??g()?.textContent??t?.textContent??"",disabled:l.disabled??!1})});(0,o.r)(()=>{if(!b.shouldRegisterItem)return;let e=v.registerItem(b.getItem());(0,o.M)(e)});let m=e3({key:h,selectionManager:p,shouldSelectOnPressUp:!0,allowsDifferentPressOrigin:!0,disabled:()=>l.disabled},()=>t),x=e=>{es(e,l.onPointerMove),"mouse"===e.pointerType&&(l.disabled?n.onItemLeave(e):(n.onItemEnter(e),e.defaultPrevented||(eu(e.currentTarget),n.listState().selectionManager().setFocused(!0),n.listState().selectionManager().setFocusedKey(h()))))},w=e=>{es(e,l.onPointerLeave),"mouse"===e.pointerType&&n.onItemLeave(e)},k=e=>{es(e,l.onPointerUp),l.disabled||0!==e.button||y()},$=e=>{if((es(e,l.onKeyDown),!e.repeat)&&!l.disabled)switch(e.key){case"Enter":case" ":y()}},S=(0,o.s)(()=>l.indeterminate?"mixed":null!=l.checked?l.checked:void 0),C=(0,o.s)(()=>({"data-indeterminate":l.indeterminate?"":void 0,"data-checked":l.checked&&!l.indeterminate?"":void 0,"data-disabled":l.disabled?"":void 0,"data-highlighted":p().focusedKey()===h()?"":void 0})),q={isChecked:()=>l.checked,dataset:C,setLabelRef:f,generateId:ee(()=>a.id),registerLabel:eE(d),registerDescription:eE(c)};return(0,o.o)(rG.Provider,{value:q,get children(){return(0,o.o)(eL,(0,o.K)({as:"div",ref(e){let r=R(e=>t=e,l.ref);"function"==typeof r&&r(e)},get tabIndex(){return m.tabIndex()},get"aria-checked"(){return S()},get"aria-disabled"(){return l.disabled},get"aria-labelledby"(){return s()},get"aria-describedby"(){return u()},get"data-key"(){return m.dataKey()},get onPointerDown(){return ed([l.onPointerDown,m.onPointerDown])},get onPointerUp(){return ed([k,m.onPointerUp])},get onClick(){return ed([l.onClick,m.onClick])},get onKeyDown(){return ed([$,m.onKeyDown])},get onMouseDown(){return ed([l.onMouseDown,m.onMouseDown])},get onFocus(){return ed([l.onFocus,m.onFocus])},onPointerMove:x,onPointerLeave:w},C,a))}})}function rW(e){let t=ew({closeOnSelect:!1},e),[r,n]=(0,o.S)(t,["checked","defaultChecked","onChange","onSelect"]),i=function(e={}){let[t,r]=eH({value:()=>s(e.isSelected),defaultValue:()=>!!s(e.defaultIsSelected),onChange:t=>e.onSelectedChange?.(t)});return{isSelected:t,setIsSelected:t=>{s(e.isReadOnly)||s(e.isDisabled)||r(t)},toggle:()=>{s(e.isReadOnly)||s(e.isDisabled)||r(!t())}}}({isSelected:()=>r.checked,defaultIsSelected:()=>r.defaultChecked,onSelectedChange:e=>r.onChange?.(e),isDisabled:()=>n.disabled});return(0,o.o)(r_,(0,o.K)({role:"menuitemcheckbox",get checked(){return i.isSelected()},onSelect:()=>{r.onSelect?.(),i.toggle()}},n))}var rY=(0,o.q)();function rJ(){return(0,o.Y)(rY)}var rX={next:(e,t)=>"ltr"===e?"horizontal"===t?"ArrowRight":"ArrowDown":"horizontal"===t?"ArrowLeft":"ArrowUp",previous:(e,t)=>rX.next("ltr"===e?"rtl":"ltr",t)},rZ={first:e=>"horizontal"===e?"ArrowDown":"ArrowRight",last:e=>"horizontal"===e?"ArrowUp":"ArrowLeft"};function r0(e){let t=rj(),r=rQ(),n=rJ(),{direction:i}=eX(),l=ew({id:t.generateId("trigger")},e),[a,s]=(0,o.S)(l,["ref","id","disabled","onPointerDown","onClick","onKeyDown","onMouseOver","onFocus"]),d=()=>t.value();void 0!==n&&(d=()=>t.value()??a.id,void 0===n.lastValue()&&n.setLastValue(d));let u=eT(()=>r.triggerRef(),()=>"button"),c=(0,o.s)(()=>"a"===u()&&r.triggerRef()?.getAttribute("href")!=null);(0,o.r)((0,o.O)(()=>n?.value(),e=>{c()&&e===d()&&r.triggerRef()?.focus()}));let g=()=>{void 0!==n?r.isOpen()?n.value()===d()&&n.closeMenu():(n.autoFocusMenu()||n.setAutoFocusMenu(!0),r.open(!1)):r.toggle(!0)};return(0,o.r)(()=>(0,o.M)(r.registerTriggerId(a.id))),(0,o.o)(ta,(0,o.K)({ref(e){let t=R(r.setTriggerRef,a.ref);"function"==typeof t&&t(e)},get"data-kb-menu-value-trigger"(){return t.value()},get id(){return a.id},get disabled(){return a.disabled},"aria-haspopup":"true",get"aria-expanded"(){return r.isOpen()},get"aria-controls"(){return(0,o.J)(()=>!!r.isOpen())()?r.contentId():void 0},get"data-highlighted"(){return void 0!==d()&&n?.value()===d()||void 0},get tabIndex(){return void 0!==n?n.value()===d()||n.lastValue()===d()?0:-1:void 0},onPointerDown:e=>{es(e,a.onPointerDown),e.currentTarget.dataset.pointerType=e.pointerType,a.disabled||"touch"===e.pointerType||0!==e.button||g()},onMouseOver:e=>{es(e,a.onMouseOver),r.triggerRef()?.dataset.pointerType!=="touch"&&(a.disabled||void 0===n||void 0===n.value()||n.setValue(d))},onClick:e=>{es(e,a.onClick),a.disabled||"touch"!==e.currentTarget.dataset.pointerType||g()},onKeyDown:e=>{if(es(e,a.onKeyDown),!a.disabled){if(c())switch(e.key){case"Enter":case" ":return}switch(e.key){case"Enter":case" ":case rZ.first(t.orientation()):e.stopPropagation(),e.preventDefault(),function(e,t){if(document.contains(e)){let t=document.scrollingElement||document.documentElement;if("hidden"===window.getComputedStyle(t).overflow){let r=em(e);for(;e&&r&&e!==t&&r!==t;)eC(r,e),r=em(e=r)}else{let{left:t,top:r}=e.getBoundingClientRect();e?.scrollIntoView?.({block:"nearest"});let{left:n,top:o}=e.getBoundingClientRect();(Math.abs(t-n)>1||Math.abs(r-o)>1)&&e.scrollIntoView?.({block:"nearest"})}}}(e.currentTarget),r.open("first"),n?.setAutoFocusMenu(!0),n?.setValue(d);break;case rZ.last(t.orientation()):e.stopPropagation(),e.preventDefault(),r.open("last");break;case rX.next(i(),t.orientation()):if(void 0===n)break;e.stopPropagation(),e.preventDefault(),n.nextMenu();break;case rX.previous(i(),t.orientation()):if(void 0===n)break;e.stopPropagation(),e.preventDefault(),n.previousMenu()}}},onFocus:e=>{es(e,a.onFocus),void 0!==n&&"touch"!==e.currentTarget.dataset.pointerType&&n.setValue(d)},role:void 0!==n?"menuitem":void 0},()=>r.dataset(),s))}var r1=(0,o.q)();function r2(e){let t,r=rj(),n=rQ(),i=rJ(),l=(0,o.Y)(r1),{direction:a}=eX(),c=ew({id:r.generateId(`content-${(0,o.w)()}`)},e),[g,f]=(0,o.S)(c,["ref","id","style","onOpenAutoFocus","onCloseAutoFocus","onEscapeKeyDown","onFocusOutside","onPointerEnter","onPointerMove","onKeyDown","onMouseDown","onFocusIn","onFocusOut"]),p=0,h=()=>null==n.parentMenuContext()&&void 0===i&&r.isModal(),y=function(e,t,r){let n=function(e){let{locale:t}=eX(),r=(0,o.s)(()=>t()+(e?Object.entries(e).sort((e,t)=>e[0]<t[0]?-1:1).join():""));return(0,o.s)(()=>{let n,o=r();return eZ.has(o)&&(n=eZ.get(o)),n||(n=new Intl.Collator(t(),e),eZ.set(o,n)),n})}({usage:"search",sensitivity:"base"});return function(e,t,r){let n=(0,o.K)({selectOnFocus:()=>"replace"===s(e.selectionManager).selectionBehavior()},e),i=()=>t(),{direction:l}=eX(),a={top:0,left:0};!function(e,t,r,n){if(o.I)return;let i=()=>{d(s(e)).forEach(e=>{e&&d(s(t)).forEach(t=>{var n;return n=void 0,e.addEventListener(t,r,n),u(e.removeEventListener.bind(e,t,r,n))})})};"function"==typeof e?(0,o.r)(i):(0,o.t)(i)}(()=>s(n.isVirtualized)?void 0:i(),"scroll",()=>{let e=i();e&&(a={top:e.scrollTop,left:e.scrollLeft})});let{typeSelectHandlers:c}=function(e){let[t,r]=(0,o.v)(""),[n,i]=(0,o.v)(-1);return{typeSelectHandlers:{onKeyDown:o=>{var l,a;if(s(e.isDisabled))return;let d=s(e.keyboardDelegate),u=s(e.selectionManager);if(!d.getKeyForSearch)return;let c=1!==(l=o.key).length&&/^[A-Z]/i.test(l)?"":l;if(!c||o.ctrlKey||o.metaKey)return;" "===c&&t().trim().length>0&&(o.preventDefault(),o.stopPropagation());let g=r(e=>e+c),f=d.getKeyForSearch(g,u.focusedKey())??d.getKeyForSearch(g);null==f&&(a=g).split("").every(e=>e===a[0])&&(g=g[0],f=d.getKeyForSearch(g,u.focusedKey())??d.getKeyForSearch(g)),null!=f&&(u.setFocusedKey(f),e.onTypeSelect?.(f)),clearTimeout(n()),i(window.setTimeout(()=>r(""),500))}}}}({isDisabled:()=>s(n.disallowTypeAhead),keyboardDelegate:()=>s(n.keyboardDelegate),selectionManager:()=>s(n.selectionManager)}),g=()=>s(n.orientation)??"vertical",f=()=>{let e,r=s(n.autoFocus);if(!r)return;let o=s(n.selectionManager),i=s(n.keyboardDelegate);"first"===r&&(e=i.getFirstKey?.()),"last"===r&&(e=i.getLastKey?.());let l=o.selectedKeys();l.size&&(e=l.values().next().value),o.setFocused(!0),o.setFocusedKey(e);let a=t();a&&null==e&&!s(n.shouldUseVirtualFocus)&&eu(a)};return(0,o.N)(()=>{n.deferAutoFocus?setTimeout(f,0):f()}),(0,o.r)((0,o.O)([i,()=>s(n.isVirtualized),()=>s(n.selectionManager).focusedKey()],e=>{let[t,r,o]=e;if(r)o&&n.scrollToKey?.(o);else if(o&&t){let e=t.querySelector(`[data-key="${o}"]`);e&&eC(t,e)}})),{tabIndex:(0,o.s)(()=>{if(!s(n.shouldUseVirtualFocus))return null==s(n.selectionManager).focusedKey()?0:-1}),onKeyDown:e=>{es(e,c.onKeyDown),e.altKey&&"Tab"===e.key&&e.preventDefault();let r=t();if(!r?.contains(e.target))return;let o=s(n.selectionManager),i=s(n.selectOnFocus),a=t=>{null!=t&&(o.setFocusedKey(t),e.shiftKey&&"multiple"===o.selectionMode()?o.extendSelection(t):i&&!e1(e)&&o.replaceSelection(t))},d=s(n.keyboardDelegate),u=s(n.shouldFocusWrap),f=o.focusedKey();switch(e.key){case"vertical"===g()?"ArrowDown":"ArrowRight":if(d.getKeyBelow){let t;e.preventDefault(),null==(t=null!=f?d.getKeyBelow(f):d.getFirstKey?.())&&u&&(t=d.getFirstKey?.(f)),a(t)}break;case"vertical"===g()?"ArrowUp":"ArrowLeft":if(d.getKeyAbove){let t;e.preventDefault(),null==(t=null!=f?d.getKeyAbove(f):d.getLastKey?.())&&u&&(t=d.getLastKey?.(f)),a(t)}break;case"vertical"===g()?"ArrowLeft":"ArrowUp":if(d.getKeyLeftOf){e.preventDefault();let t="rtl"===l();a(null!=f?d.getKeyLeftOf(f):t?d.getFirstKey?.():d.getLastKey?.())}break;case"vertical"===g()?"ArrowRight":"ArrowDown":if(d.getKeyRightOf){e.preventDefault();let t="rtl"===l();a(null!=f?d.getKeyRightOf(f):t?d.getLastKey?.():d.getFirstKey?.())}break;case"Home":if(d.getFirstKey){e.preventDefault();let t=d.getFirstKey(f,e2(e));null!=t&&(o.setFocusedKey(t),e2(e)&&e.shiftKey&&"multiple"===o.selectionMode()?o.extendSelection(t):i&&o.replaceSelection(t))}break;case"End":if(d.getLastKey){e.preventDefault();let t=d.getLastKey(f,e2(e));null!=t&&(o.setFocusedKey(t),e2(e)&&e.shiftKey&&"multiple"===o.selectionMode()?o.extendSelection(t):i&&o.replaceSelection(t))}break;case"PageDown":d.getKeyPageBelow&&null!=f&&(e.preventDefault(),a(d.getKeyPageBelow(f)));break;case"PageUp":d.getKeyPageAbove&&null!=f&&(e.preventDefault(),a(d.getKeyPageAbove(f)));break;case"a":e2(e)&&"multiple"===o.selectionMode()&&!0!==s(n.disallowSelectAll)&&(e.preventDefault(),o.selectAll());break;case"Escape":!e.defaultPrevented&&(e.preventDefault(),s(n.disallowEmptySelection)||o.clearSelection());break;case"Tab":if(!s(n.allowsTabNavigation))if(e.shiftKey)r.focus();else{let e,t,n=function(e,t,r){let n=t?.tabbable?eh:ep,o=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:e=>t?.from?.contains(e)?NodeFilter.FILTER_REJECT:e.matches(n)&&eb(e)&&(!t?.accept||t.accept(e))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP});return t?.from&&(o.currentNode=t.from),o}(r,{tabbable:!0});do(t=n.lastChild())&&(e=t);while(t);e&&!e.contains(document.activeElement)&&eu(e)}}},onMouseDown:e=>{i()===e.target&&e.preventDefault()},onFocusIn:e=>{let t=s(n.selectionManager),r=s(n.keyboardDelegate),o=s(n.selectOnFocus);if(t.isFocused()){e.currentTarget.contains(e.target)||t.setFocused(!1);return}if(e.currentTarget.contains(e.target)){if(t.setFocused(!0),null==t.focusedKey()){let n=e=>{null!=e&&(t.setFocusedKey(e),o&&t.replaceSelection(e))},i=e.relatedTarget;i&&e.currentTarget.compareDocumentPosition(i)&Node.DOCUMENT_POSITION_FOLLOWING?n(t.lastSelectedKey()??r.getLastKey?.()):n(t.firstSelectedKey()??r.getFirstKey?.())}else if(!s(n.isVirtualized)){let e=i();if(e){e.scrollTop=a.top,e.scrollLeft=a.left;let r=e.querySelector(`[data-key="${t.focusedKey()}"]`);r&&(eu(r),eC(e,r))}}}},onFocusOut:e=>{let t=s(n.selectionManager);e.currentTarget.contains(e.relatedTarget)||t.setFocused(!1)}}}({selectionManager:()=>s(e.selectionManager),keyboardDelegate:(0,o.s)(()=>{let r=s(e.keyboardDelegate);return r||new rq(e.collection,t,n)}),autoFocus:()=>s(e.autoFocus),deferAutoFocus:()=>s(e.deferAutoFocus),shouldFocusWrap:()=>s(e.shouldFocusWrap),disallowEmptySelection:()=>s(e.disallowEmptySelection),selectOnFocus:()=>s(e.selectOnFocus),disallowTypeAhead:()=>s(e.disallowTypeAhead),shouldUseVirtualFocus:()=>s(e.shouldUseVirtualFocus),allowsTabNavigation:()=>s(e.allowsTabNavigation),isVirtualized:()=>s(e.isVirtualized),scrollToKey:t=>s(e.scrollToKey)?.(t),orientation:()=>s(e.orientation)},t)}({selectionManager:n.listState().selectionManager,collection:n.listState().collection,autoFocus:n.autoFocus,deferAutoFocus:!0,shouldFocusWrap:!0,disallowTypeAhead:()=>!n.listState().selectionManager().isFocused(),orientation:()=>"horizontal"===r.orientation()?"vertical":"horizontal"},()=>t);!function(e,t){let[r,n]=(0,o.v)(!1),i={pause(){n(!0)},resume(){n(!1)}},l=null,a=t=>e.onMountAutoFocus?.(t),d=t=>e.onUnmountAutoFocus?.(t),u=()=>en(t()),c=()=>{let e=u().createElement("span");return e.setAttribute("data-focus-trap",""),e.tabIndex=0,Object.assign(e.style,eM),e},g=()=>{let e=t();return e?(function e(t,r){let n=Array.from(t.querySelectorAll(ep)).filter(ey);return r&&ey(t)&&n.unshift(t),n.forEach((t,r)=>{if(eo(t)&&t.contentDocument){let o=e(t.contentDocument.body,!1);n.splice(r,1,...o)}}),n})(e,!0).filter(e=>!e.hasAttribute("data-focus-trap")):[]},f=()=>{let e=g();return e.length>0?e[0]:null};(0,o.r)(()=>{if(o.I)return;let e=t();if(!e)return;rF.add(i);let r=er(e);if(!et(e,r)){let t=new CustomEvent(rM,rT);e.addEventListener(rM,a),e.dispatchEvent(t),t.defaultPrevented||setTimeout(()=>{eu(f()),er(e)===r&&eu(e)},0)}(0,o.M)(()=>{e.removeEventListener(rM,a),setTimeout(()=>{let n=new CustomEvent(rE,rT);(()=>{let e=t();if(!e)return!1;let r=er(e);return!(!r||et(e,r))&&ev(r)})()&&n.preventDefault(),e.addEventListener(rE,d),e.dispatchEvent(n),n.defaultPrevented||eu(r??u().body),e.removeEventListener(rE,d),rF.remove(i)},0)})}),(0,o.r)(()=>{if(o.I)return;let n=t();if(!n||!s(e.trapFocus)||r())return;let i=e=>{let t=e.target;t?.closest(`[${e8}]`)||(et(n,t)?l=t:eu(l))},a=e=>{let t=e.relatedTarget??er(n);!t?.closest(`[${e8}]`)&&(et(n,t)||eu(l))};u().addEventListener("focusin",i),u().addEventListener("focusout",a),(0,o.M)(()=>{u().removeEventListener("focusin",i),u().removeEventListener("focusout",a)})}),(0,o.r)(()=>{if(o.I)return;let n=t();if(!n||!s(e.trapFocus)||r())return;let i=c();n.insertAdjacentElement("afterbegin",i);let l=c();function a(e){let t=f(),r=(()=>{let e=g();return e.length>0?e[e.length-1]:null})();e.relatedTarget===t?eu(r):eu(t)}n.insertAdjacentElement("beforeend",l),i.addEventListener("focusin",a),l.addEventListener("focusin",a);let d=new MutationObserver(e=>{for(let t of e)t.previousSibling===l&&(l.remove(),n.insertAdjacentElement("beforeend",l)),t.nextSibling===i&&(i.remove(),n.insertAdjacentElement("afterbegin",i))});d.observe(n,{childList:!0,subtree:!1}),(0,o.M)(()=>{i.removeEventListener("focusin",a),l.removeEventListener("focusin",a),i.remove(),l.remove(),d.disconnect()})})}({trapFocus:()=>h()&&n.isOpen(),onMountAutoFocus:e=>{void 0===i&&g.onOpenAutoFocus?.(e)},onUnmountAutoFocus:g.onCloseAutoFocus},()=>t);let v=e=>{g.onEscapeKeyDown?.(e),i?.setAutoFocusMenu(!1),n.close(!0)},b=e=>{g.onFocusOutside?.(e),r.isModal()&&e.preventDefault()};(0,o.r)(()=>(0,o.M)(n.registerContentId(g.id)));let m={ref:R(e=>{n.setContentRef(e),t=e},g.ref),role:"menu",get id(){return g.id},get tabIndex(){return y.tabIndex()},get"aria-labelledby"(){return n.triggerId()},onKeyDown:ed([g.onKeyDown,y.onKeyDown,e=>{if(et(e.currentTarget,e.target)&&("Tab"===e.key&&n.isOpen()&&e.preventDefault(),void 0!==i&&"true"!==e.currentTarget.getAttribute("aria-haspopup")))switch(e.key){case rX.next(a(),r.orientation()):e.stopPropagation(),e.preventDefault(),n.close(!0),i.setAutoFocusMenu(!0),i.nextMenu();break;case rX.previous(a(),r.orientation()):if(e.currentTarget.hasAttribute("data-closed"))break;e.stopPropagation(),e.preventDefault(),n.close(!0),i.setAutoFocusMenu(!0),i.previousMenu()}}]),onMouseDown:ed([g.onMouseDown,y.onMouseDown]),onFocusIn:ed([g.onFocusIn,y.onFocusIn]),onFocusOut:ed([g.onFocusOut,y.onFocusOut]),onPointerEnter:e=>{es(e,g.onPointerEnter),n.isOpen()&&(n.parentMenuContext()?.listState().selectionManager().setFocused(!1),n.parentMenuContext()?.listState().selectionManager().setFocusedKey(void 0))},onPointerMove:e=>{if(es(e,g.onPointerMove),"mouse"!==e.pointerType)return;let t=e.target,r=p!==e.clientX;et(e.currentTarget,t)&&r&&(n.setPointerDir(e.clientX>p?"right":"left"),p=e.clientX)},get"data-orientation"(){return r.orientation()}};return(0,o.o)(o.h,{get when(){return n.contentPresent()},get children(){return(0,o.o)(o.h,{get when(){return void 0===l||null!=n.parentMenuContext()},get fallback(){return(0,o.o)(eL,(0,o.K)({as:"div"},()=>n.dataset(),m,f))},get children(){return(0,o.o)(rl.Positioner,{get children(){return(0,o.o)(ru,(0,o.K)({get disableOutsidePointerEvents(){return(0,o.J)(()=>!!h())()&&n.isOpen()},get excludedElements(){return[n.triggerRef]},bypassTopMostLayerCheck:!0,get style(){return J({"--kb-menu-content-transform-origin":"var(--kb-popper-content-transform-origin)",position:"relative"},g.style)},onEscapeKeyDown:v,onFocusOutside:b,get onDismiss(){return n.close}},()=>n.dataset(),m,f))}})}})}})}function r3(e){let t,r=rj(),n=rQ(),[i,l]=(0,o.S)(e,["ref"]);return(e=>{let t=(0,o.K)({element:null,enabled:!0,hideScrollbar:!0,preventScrollbarShift:!0,preventScrollbarShiftMode:"padding",restoreScrollPosition:!0,allowPinchZoom:!1},e),r=(0,o.w)(),n=[0,0],i=null,l=null;(0,o.r)(()=>{e6(t.enabled)&&(rP(e=>[...e,r]),(0,o.M)(()=>{rP(e=>e.filter(e=>e!==r))}))}),(0,o.r)(()=>{if(!e6(t.enabled)||!e6(t.hideScrollbar))return;let{body:e}=document,r=window.innerWidth-e.offsetWidth;if(e6(t.preventScrollbarShift)){let n={overflow:"hidden"},o=[];r>0&&("padding"===e6(t.preventScrollbarShiftMode)?n.paddingRight=`calc(${window.getComputedStyle(e).paddingRight} + ${r}px)`:n.marginRight=`calc(${window.getComputedStyle(e).marginRight} + ${r}px)`,o.push({key:"--scrollbar-width",value:`${r}px`}));let i=window.scrollY,l=window.scrollX;rz({key:"prevent-scroll",element:e,style:n,properties:o,cleanup:()=>{e6(t.restoreScrollPosition)&&r>0&&window.scrollTo(l,i)}})}else rz({key:"prevent-scroll",element:e,style:{overflow:"hidden"}})}),(0,o.r)(()=>{rK().indexOf(r)===rK().length-1&&e6(t.enabled)&&(document.addEventListener("wheel",s,{passive:!1}),document.addEventListener("touchstart",a,{passive:!1}),document.addEventListener("touchmove",d,{passive:!1}),(0,o.M)(()=>{document.removeEventListener("wheel",s),document.removeEventListener("touchstart",a),document.removeEventListener("touchmove",d)}))});let a=e=>{n=rH(e),i=null,l=null},s=e=>{let r,n=e.target,o=e6(t.element),i=[(r=e).deltaX,r.deltaY],l=Math.abs(i[0])>Math.abs(i[1])?"x":"y",a="x"===l?i[0]:i[1],s=rV(n,l,a,o);o&&rR(o,n)&&s||!e.cancelable||e.preventDefault()},d=e=>{let r,o=e6(t.element),a=e.target;if(2===e.touches.length)r=!e6(t.allowPinchZoom);else{if(null==i||null===l){let t=rH(e).map((e,t)=>n[t]-e),r=Math.abs(t[0])>Math.abs(t[1])?"x":"y";i=r,l="x"===r?t[0]:t[1]}if("range"===a.type)r=!1;else{let e=rV(a,i,l,o);r=!(o&&rR(o,a))||!e}}r&&e.cancelable&&e.preventDefault()}})({element:()=>t??null,enabled:()=>n.contentPresent()&&r.preventScroll()}),(0,o.o)(r2,(0,o.K)({ref(e){let r=R(e=>{t=e},i.ref);"function"==typeof r&&r(e)}},l))}var r5=(0,o.q)();function r4(e){let t=ew({id:rj().generateId(`group-${(0,o.w)()}`)},e),[r,n]=(0,o.v)(),i={generateId:ee(()=>t.id),registerLabelId:eE(n)};return(0,o.o)(r5.Provider,{value:i,get children(){return(0,o.o)(eL,(0,o.K)({as:"div",role:"group",get"aria-labelledby"(){return r()}},t))}})}function r6(e){let t=function(){let e=(0,o.Y)(r5);if(void 0===e)throw Error("[kobalte]: `useMenuGroupContext` must be used within a `Menu.Group` component");return e}(),r=ew({id:t.generateId("label")},e),[n,i]=(0,o.S)(r,["id"]);return(0,o.r)(()=>(0,o.M)(t.registerLabelId(n.id))),(0,o.o)(eL,(0,o.K)({as:"span",get id(){return n.id},"aria-hidden":"true"},i))}function r9(e){let t=rQ(),r=ew({children:"▼"},e);return(0,o.o)(eL,(0,o.K)({as:"span","aria-hidden":"true"},()=>t.dataset(),r))}function r8(e){return(0,o.o)(r_,(0,o.K)({role:"menuitem",closeOnSelect:!0},e))}function r7(e){let t=rU(),r=ew({id:t.generateId("description")},e),[n,i]=(0,o.S)(r,["id"]);return(0,o.r)(()=>(0,o.M)(t.registerDescription(n.id))),(0,o.o)(eL,(0,o.K)({as:"div",get id(){return n.id}},()=>t.dataset(),i))}function ne(e){let t=rU(),r=ew({id:t.generateId("indicator")},e),[n,i]=(0,o.S)(r,["forceMount"]);return(0,o.o)(o.h,{get when(){return n.forceMount||t.isChecked()},get children(){return(0,o.o)(eL,(0,o.K)({as:"div"},()=>t.dataset(),i))}})}function nt(e){let t=rU(),r=ew({id:t.generateId("label")},e),[n,i]=(0,o.S)(r,["ref","id"]);return(0,o.r)(()=>(0,o.M)(t.registerLabel(n.id))),(0,o.o)(eL,(0,o.K)({as:"div",ref(e){let r=R(t.setLabelRef,n.ref);"function"==typeof r&&r(e)},get id(){return n.id}},()=>t.dataset(),i))}function nr(e){let t=rQ();return(0,o.o)(o.h,{get when(){return t.contentPresent()},get children(){return(0,o.o)(o.g,e)}})}var nn=(0,o.q)();function no(e){let t=ew({id:rj().generateId(`radiogroup-${(0,o.w)()}`)},e),[r,n]=(0,o.S)(t,["value","defaultValue","onChange","disabled"]),[i,l]=eP({value:()=>r.value,defaultValue:()=>r.defaultValue,onChange:e=>r.onChange?.(e)});return(0,o.o)(nn.Provider,{value:{isDisabled:()=>r.disabled,isSelectedValue:e=>e===i(),setSelectedValue:l},get children(){return(0,o.o)(r4,n)}})}function ni(e){let t=function(){let e=(0,o.Y)(nn);if(void 0===e)throw Error("[kobalte]: `useMenuRadioGroupContext` must be used within a `Menu.RadioGroup` component");return e}(),r=ew({closeOnSelect:!1},e),[n,i]=(0,o.S)(r,["value","onSelect"]);return(0,o.o)(r_,(0,o.K)({role:"menuitemradio",get checked(){return t.isSelectedValue(n.value)},onSelect:()=>{n.onSelect?.(),t.setSelectedValue(n.value)}},i))}function nl(e){var t;let r=rj(),n=(0,o.Y)(eB),i=(0,o.Y)(rB),l=rJ(),a=(0,o.Y)(r1),d=ew({placement:"horizontal"===r.orientation()?"bottom-start":"right-start"},e),[u,c]=(0,o.S)(d,["open","defaultOpen","onOpenChange"]),g=0,f=null,p="right",[h,y]=(0,o.v)(),[v,b]=(0,o.v)(),[m,x]=(0,o.v)(),[w,k]=(0,o.v)(),[$,S]=(0,o.v)(!0),[C,q]=(0,o.v)(c.placement),[M,E]=(0,o.v)([]),[T,F]=(0,o.v)([]),{DomCollectionProvider:L}=function(e={}){let[t,r]=function(e){let[t,r]=eP(e);return[()=>t()??[],r]}({value:()=>s(e.items),onChange:t=>e.onItemsChange?.(t)});!function(e,t){if("function"!=typeof IntersectionObserver)return(0,o.r)(()=>{let r=setTimeout(()=>{eG(e(),t)});(0,o.M)(()=>clearTimeout(r))});let r=[];(0,o.r)(()=>{let n=new IntersectionObserver(()=>{let n=!!r.length;r=e(),n&&eG(e(),t)},{root:function(e){let t=e[0],r=e[e.length-1]?.ref(),n=t?.ref()?.parentElement;for(;n;){if(r&&n.contains(r))return n;n=n.parentElement}return en(n).body}(e())});for(let t of e()){let e=t.ref();e&&n.observe(e)}(0,o.M)(()=>n.disconnect())})}(t,r);let n=e=>(r(t=>{let r=function(e,t){let r=t.ref();if(!r)return -1;let n=e.length;if(!n)return -1;for(;n--;){let t=e[n]?.ref();if(t&&eQ(t,r))return n+1}return 0}(t,e);return function(e,t,r=-1){return r in e?[...e.slice(0,r),t,...e.slice(r)]:[...e,t]}(t,e,r)}),()=>{r(t=>{let r=t.filter(t=>t.ref()!==e.ref());return t.length===r.length?t:r})});return{DomCollectionProvider:e=>(0,o.o)(eB.Provider,{value:{registerItem:n},get children(){return e.children}})}}({items:T,onItemsChange:F}),A=rc({open:()=>u.open,defaultOpen:()=>u.defaultOpen,onOpenChange:e=>u.onOpenChange?.(e)}),{present:D}=e9({show:()=>r.forceMount()||A.isOpen(),element:()=>w()??null}),z=function(e){let t=function(e){let t=ew({selectionMode:"none",selectionBehavior:"toggle"},e),[r,n]=(0,o.v)(!1),[i,l]=(0,o.v)(),[a,d]=function(e){let[t,r]=eP(e);return[()=>t()??new e0,r]}({value:(0,o.s)(()=>{let e=s(t.selectedKeys);return null!=e?new e0(e):e}),defaultValue:(0,o.s)(()=>{let e=s(t.defaultSelectedKeys);return null!=e?new e0(e):new e0}),onChange:e=>t.onSelectionChange?.(e)}),[u,c]=(0,o.v)(s(t.selectionBehavior));return(0,o.r)(()=>{let e=a();"replace"===s(t.selectionBehavior)&&"toggle"===u()&&"object"==typeof e&&0===e.size&&c("replace")}),(0,o.r)(()=>{c(s(t.selectionBehavior)??"toggle")}),{selectionMode:()=>s(t.selectionMode),disallowEmptySelection:()=>s(t.disallowEmptySelection)??!1,selectionBehavior:u,setSelectionBehavior:c,isFocused:r,setFocused:n,focusedKey:i,setFocusedKey:l,selectedKeys:a,setSelectedKeys:e=>{(s(t.allowDuplicateSelectionEvents)||!function(e,t){if(e.size!==t.size)return!1;for(let r of e)if(!t.has(r))return!1;return!0}(e,a()))&&d(e)}}}(e),r=function(e,t=[]){return(0,o.s)(()=>{let r=function e(t){let r=t.startIndex??0,n=t.startLevel??0,o=[],i=e=>{if(null==e)return"";let r=t.getKey??"key",n=Z(r)?e[r]:r(e);return null!=n?String(n):""},l=e=>{if(null==e)return"";let r=t.getTextValue??"textValue",n=Z(r)?e[r]:r(e);return null!=n?String(n):""},a=e=>{if(null==e)return!1;let r=t.getDisabled??"disabled";return(Z(r)?e[r]:r(e))??!1},s=e=>{if(null!=e)return Z(t.getSectionChildren)?e[t.getSectionChildren]:t.getSectionChildren?.(e)};for(let d of t.dataSource){if(Z(d)||"number"==typeof d){o.push({type:"item",rawValue:d,key:String(d),textValue:String(d),disabled:a(d),level:n,index:r}),r++;continue}if(null!=s(d)){o.push({type:"section",rawValue:d,key:"",textValue:"",disabled:!1,level:n,index:r}),r++;let i=s(d)??[];if(i.length>0){let l=e({dataSource:i,getKey:t.getKey,getTextValue:t.getTextValue,getDisabled:t.getDisabled,getSectionChildren:t.getSectionChildren,startIndex:r,startLevel:n+1});o.push(...l),r+=l.length}}else o.push({type:"item",rawValue:d,key:i(d),textValue:l(d),disabled:a(d),level:n,index:r}),r++}return o}({dataSource:s(e.dataSource),getKey:s(e.getKey),getTextValue:s(e.getTextValue),getDisabled:s(e.getDisabled),getSectionChildren:s(e.getSectionChildren)});for(let e=0;e<t.length;e++)t[e]();return e.factory(r)})}({dataSource:()=>s(e.dataSource),getKey:()=>s(e.getKey),getTextValue:()=>s(e.getTextValue),getDisabled:()=>s(e.getDisabled),getSectionChildren:()=>s(e.getSectionChildren),factory:t=>new e4(e.filter?e.filter(t):t)},[()=>e.filter]),n=new e5(r,t);return(0,o.p)(()=>{let e=t.focusedKey();null==e||r().getItem(e)||t.setFocusedKey(void 0)}),{collection:r,selectionManager:()=>n}}({selectionMode:"none",dataSource:T}),O=e=>{S(e),A.open()},I=(e=!1)=>{A.close(),e&&i&&i.close(!0)},K=()=>{let e=w();e&&(eu(e),z.selectionManager().setFocused(!0),z.selectionManager().setFocusedKey(void 0))},P=()=>{null!=a?setTimeout(()=>K()):K()},H=e=>{var t;return p===f?.side&&!!(t=f?.area)&&function(e,t){let[r,n]=e,o=!1,i=t.length;for(let e=0,l=i-1;e<i;l=e++){let[a,s]=t[e],[d,u]=t[l],[,c]=t[0===l?i-1:l-1]||[0,0],g=(s-u)*(r-a)-(a-d)*(n-s);if(u<s){if(n>=u&&n<s){if(0===g)return!0;g>0&&(n===u?n>c&&(o=!o):o=!o)}}else if(s<u){if(n>s&&n<=u){if(0===g)return!0;g<0&&(n===u?n<c&&(o=!o):o=!o)}}else if(n==s&&(r>=d&&r<=a||r>=a&&r<=d))return!0}return o}([e.clientX,e.clientY],t)};t={isDisabled:()=>!(null==i&&A.isOpen()&&r.isModal()),targets:()=>[w(),...M()].filter(Boolean)},(0,o.r)(()=>{s(t.isDisabled)||(0,o.M)(function(e,t=document.body){let r=new Set(e),n=new Set,o=e=>{for(let t of e.querySelectorAll(`[data-live-announcer], [${e8}]`))r.add(t);let t=e=>{if(r.has(e)||e.parentElement&&n.has(e.parentElement)&&"row"!==e.parentElement.getAttribute("role"))return NodeFilter.FILTER_REJECT;for(let t of r)if(e.contains(t))return NodeFilter.FILTER_SKIP;return NodeFilter.FILTER_ACCEPT},o=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:t}),l=t(e);if(l===NodeFilter.FILTER_ACCEPT&&i(e),l!==NodeFilter.FILTER_REJECT){let e=o.nextNode();for(;null!=e;)i(e),e=o.nextNode()}},i=e=>{let t=rL.get(e)??0;("true"!==e.getAttribute("aria-hidden")||0!==t)&&(0===t&&e.setAttribute("aria-hidden","true"),n.add(e),rL.set(e,t+1))};rA.length&&rA[rA.length-1].disconnect(),o(t);let l=new MutationObserver(e=>{for(let t of e)if("childList"===t.type&&0!==t.addedNodes.length&&![...r,...n].some(e=>e.contains(t.target))){for(let e of t.removedNodes)e instanceof Element&&(r.delete(e),n.delete(e));for(let e of t.addedNodes)(e instanceof HTMLElement||e instanceof SVGElement)&&("true"===e.dataset.liveAnnouncer||"true"===e.dataset.reactAriaTopLayer)?r.add(e):e instanceof Element&&o(e)}});l.observe(t,{childList:!0,subtree:!0});let a={observe(){l.observe(t,{childList:!0,subtree:!0})},disconnect(){l.disconnect()}};return rA.push(a),()=>{for(let e of(l.disconnect(),n)){let t=rL.get(e);if(null==t)return;1===t?(e.removeAttribute("aria-hidden"),rL.delete(e)):rL.set(e,t-1)}a===rA[rA.length-1]?(rA.pop(),rA.length&&rA[rA.length-1].observe()):rA.splice(rA.indexOf(a),1)}}(s(t.targets),s(t.root)))}),(0,o.r)(()=>{let e=w();if(!e||!i)return;let t=i.registerNestedMenu(e);(0,o.M)(()=>{t()})}),(0,o.r)(()=>{void 0===i&&l?.registerMenu(r.value(),[w(),...M()])}),(0,o.r)(()=>{void 0===i&&void 0!==l&&(l.value()===r.value()?(m()?.focus(),l.autoFocusMenu()&&O(!0)):I())}),(0,o.r)(()=>{void 0===i&&void 0!==l&&A.isOpen()&&l.setValue(r.value())}),(0,o.M)(()=>{void 0===i&&l?.unregisterMenu(r.value())});let V={dataset:(0,o.s)(()=>({"data-expanded":A.isOpen()?"":void 0,"data-closed":A.isOpen()?void 0:""})),isOpen:A.isOpen,contentPresent:D,nestedMenus:M,currentPlacement:C,pointerGraceTimeoutId:()=>g,autoFocus:$,listState:()=>z,parentMenuContext:()=>i,triggerRef:m,contentRef:w,triggerId:h,contentId:v,setTriggerRef:x,setContentRef:k,open:O,close:I,toggle:e=>{S(e),A.toggle()},focusContent:P,onItemEnter:e=>{H(e)&&e.preventDefault()},onItemLeave:e=>{H(e)||P()},onTriggerLeave:e=>{H(e)&&e.preventDefault()},setPointerDir:e=>p=e,setPointerGraceTimeoutId:e=>g=e,setPointerGraceIntent:e=>f=e,registerNestedMenu:e=>{E(t=>[...t,e]);let t=i?.registerNestedMenu(e);return()=>{E(t=>X(t,e)),t?.()}},registerItemToParentDomCollection:n?.registerItem,registerTriggerId:eE(y),registerContentId:eE(b)};return(0,o.o)(L,{get children(){return(0,o.o)(rB.Provider,{value:V,get children(){return(0,o.o)(o.h,{when:void 0===a,get fallback(){return c.children},get children(){return(0,o.o)(rl,(0,o.K)({anchorRef:m,contentRef:w,onCurrentPlacementChange:q},c))}})}})}})}function na(e){let{direction:t}=eX();return(0,o.o)(nl,(0,o.K)({get placement(){return"rtl"===t()?"left-start":"right-start"},flip:!0},e))}var ns={close:(e,t)=>"ltr"===e?["horizontal"===t?"ArrowLeft":"ArrowUp"]:["horizontal"===t?"ArrowRight":"ArrowDown"]};function nd(e){let t=rQ(),r=rj(),[n,i]=(0,o.S)(e,["onFocusOutside","onKeyDown"]),{direction:l}=eX();return(0,o.o)(r2,(0,o.K)({onOpenAutoFocus:e=>{e.preventDefault()},onCloseAutoFocus:e=>{e.preventDefault()},onFocusOutside:e=>{n.onFocusOutside?.(e);let r=e.target;et(t.triggerRef(),r)||t.close()},onKeyDown:e=>{es(e,n.onKeyDown);let o=et(e.currentTarget,e.target),i=ns.close(l(),r.orientation()).includes(e.key),a=null!=t.parentMenuContext();o&&i&&a&&(t.close(),eu(t.triggerRef()))}},i))}var nu=["Enter"," "],nc={open:(e,t)=>"ltr"===e?[...nu,"horizontal"===t?"ArrowRight":"ArrowDown"]:[...nu,"horizontal"===t?"ArrowLeft":"ArrowUp"]};function ng(e){let t,r=rj(),n=rQ(),i=ew({id:r.generateId(`sub-trigger-${(0,o.w)()}`)},e),[l,a]=(0,o.S)(i,["ref","id","textValue","disabled","onPointerMove","onPointerLeave","onPointerDown","onPointerUp","onClick","onKeyDown","onMouseDown","onFocus"]),s=null,d=()=>{o.I||(s&&window.clearTimeout(s),s=null)},{direction:u}=eX(),c=()=>l.id,g=()=>{let e=n.parentMenuContext();if(null==e)throw Error("[kobalte]: `Menu.SubTrigger` must be used within a `Menu.Sub` component");return e.listState().selectionManager()},f=e3({key:c,selectionManager:g,shouldSelectOnPressUp:!0,allowsDifferentPressOrigin:!0,disabled:()=>l.disabled},()=>t),p=e=>{es(e,l.onClick),n.isOpen()||l.disabled||n.open(!0)},h=e=>{es(e,l.onKeyDown),!e.repeat&&!l.disabled&&nc.open(u(),r.orientation()).includes(e.key)&&(e.stopPropagation(),e.preventDefault(),g().setFocused(!1),g().setFocusedKey(void 0),n.isOpen()||n.open("first"),n.focusContent(),n.listState().selectionManager().setFocused(!0),n.listState().selectionManager().setFocusedKey(n.listState().collection().getFirstKey()))};return(0,o.r)(()=>{if(null==n.registerItemToParentDomCollection)throw Error("[kobalte]: `Menu.SubTrigger` must be used within a `Menu.Sub` component");let e=n.registerItemToParentDomCollection({ref:()=>t,type:"item",key:c(),textValue:l.textValue??t?.textContent??"",disabled:l.disabled??!1});(0,o.M)(e)}),(0,o.r)((0,o.O)(()=>n.parentMenuContext()?.pointerGraceTimeoutId(),e=>{(0,o.M)(()=>{window.clearTimeout(e),n.parentMenuContext()?.setPointerGraceIntent(null)})})),(0,o.r)(()=>(0,o.M)(n.registerTriggerId(l.id))),(0,o.M)(()=>{d()}),(0,o.o)(eL,(0,o.K)({as:"div",ref(e){let r=R(e=>{n.setTriggerRef(e),t=e},l.ref);"function"==typeof r&&r(e)},get id(){return l.id},role:"menuitem",get tabIndex(){return f.tabIndex()},"aria-haspopup":"true",get"aria-expanded"(){return n.isOpen()},get"aria-controls"(){return(0,o.J)(()=>!!n.isOpen())()?n.contentId():void 0},get"aria-disabled"(){return l.disabled},get"data-key"(){return f.dataKey()},get"data-highlighted"(){return g().focusedKey()===c()?"":void 0},get"data-disabled"(){return l.disabled?"":void 0},get onPointerDown(){return ed([l.onPointerDown,f.onPointerDown])},get onPointerUp(){return ed([l.onPointerUp,f.onPointerUp])},get onClick(){return ed([p,f.onClick])},get onKeyDown(){return ed([h,f.onKeyDown])},get onMouseDown(){return ed([l.onMouseDown,f.onMouseDown])},get onFocus(){return ed([l.onFocus,f.onFocus])},onPointerMove:e=>{if(es(e,l.onPointerMove),"mouse"!==e.pointerType)return;let t=n.parentMenuContext();if(t?.onItemEnter(e),!e.defaultPrevented){if(l.disabled)return void t?.onItemLeave(e);n.isOpen()||s||(n.parentMenuContext()?.setPointerGraceIntent(null),s=window.setTimeout(()=>{n.open(!1),d()},100)),t?.onItemEnter(e),e.defaultPrevented||(n.listState().selectionManager().isFocused()&&(n.listState().selectionManager().setFocused(!1),n.listState().selectionManager().setFocusedKey(void 0)),eu(e.currentTarget),t?.listState().selectionManager().setFocused(!0),t?.listState().selectionManager().setFocusedKey(c()))}},onPointerLeave:e=>{if(es(e,l.onPointerLeave),"mouse"!==e.pointerType)return;d();let t=n.parentMenuContext(),r=n.contentRef();if(r){t?.setPointerGraceIntent({area:function(e,t,r){let n=e.split("-")[0],o=r.getBoundingClientRect(),i=[],l=t.clientX,a=t.clientY;switch(n){case"top":i.push([l,a+5]),i.push([o.left,o.bottom]),i.push([o.left,o.top]),i.push([o.right,o.top]),i.push([o.right,o.bottom]);break;case"right":i.push([l-5,a]),i.push([o.left,o.top]),i.push([o.right,o.top]),i.push([o.right,o.bottom]),i.push([o.left,o.bottom]);break;case"bottom":i.push([l,a-5]),i.push([o.right,o.top]),i.push([o.right,o.bottom]),i.push([o.left,o.bottom]),i.push([o.left,o.top]);break;case"left":i.push([l+5,a]),i.push([o.right,o.bottom]),i.push([o.left,o.bottom]),i.push([o.left,o.top]),i.push([o.right,o.top])}return i}(n.currentPlacement(),e,r),side:n.currentPlacement().split("-")[0]}),window.clearTimeout(t?.pointerGraceTimeoutId());let o=window.setTimeout(()=>{t?.setPointerGraceIntent(null)},300);t?.setPointerGraceTimeoutId(o)}else{if(t?.onTriggerLeave(e),e.defaultPrevented)return;t?.setPointerGraceIntent(null)}t?.onItemLeave(e)}},()=>n.dataset(),a))}function nf(e){let t=rJ(),r=ew({id:`menu-${(0,o.w)()}`,modal:!0},e),[n,i]=(0,o.S)(r,["id","modal","preventScroll","forceMount","open","defaultOpen","onOpenChange","value","orientation"]),l=rc({open:()=>n.open,defaultOpen:()=>n.defaultOpen,onOpenChange:e=>n.onOpenChange?.(e)}),a={isModal:()=>n.modal??!0,preventScroll:()=>n.preventScroll??a.isModal(),forceMount:()=>n.forceMount??!1,generateId:ee(()=>n.id),value:()=>n.value,orientation:()=>n.orientation??t?.orientation()??"horizontal"};return(0,o.o)(rN.Provider,{value:a,get children(){return(0,o.o)(nl,(0,o.K)({get open(){return l.isOpen()},get onOpenChange(){return l.setIsOpen}},i))}})}function np(e){let t,r=ew({orientation:"horizontal"},e),[n,i]=(0,o.S)(r,["ref","orientation"]),l=eT(()=>t,()=>"hr");return(0,o.o)(eL,(0,o.K)({as:"hr",ref(e){let r=R(e=>t=e,n.ref);"function"==typeof r&&r(e)},get role(){return"hr"!==l()?"separator":void 0},get"aria-orientation"(){return"vertical"===n.orientation?"vertical":void 0},get"data-orientation"(){return n.orientation}},i))}eR({},{Root:()=>np,Separator:()=>nh});var nh=np,ny={};function nv(e){let t=rj(),r=rQ(),[n,i]=(0,o.S)(e,["onCloseAutoFocus","onInteractOutside"]),l=!1;return(0,o.o)(r3,(0,o.K)({onCloseAutoFocus:e=>{n.onCloseAutoFocus?.(e),l||eu(r.triggerRef()),l=!1,e.preventDefault()},onInteractOutside:e=>{n.onInteractOutside?.(e),(!t.isModal()||e.detail.isContextMenu)&&(l=!0)}},i))}function nb(e){let t=ew({id:`dropdownmenu-${(0,o.w)()}`},e);return(0,o.o)(nf,t)}eR(ny,{Arrow:()=>rr,CheckboxItem:()=>rW,Content:()=>nv,DropdownMenu:()=>nm,Group:()=>r4,GroupLabel:()=>r6,Icon:()=>r9,Item:()=>r8,ItemDescription:()=>r7,ItemIndicator:()=>ne,ItemLabel:()=>nt,Portal:()=>nr,RadioGroup:()=>no,RadioItem:()=>ni,Root:()=>nb,Separator:()=>np,Sub:()=>na,SubContent:()=>nd,SubTrigger:()=>ng,Trigger:()=>r0});var nm=Object.assign(nb,{Arrow:rr,CheckboxItem:rW,Content:nv,Group:r4,GroupLabel:r6,Icon:r9,Item:r8,ItemDescription:r7,ItemIndicator:ne,ItemLabel:nt,Portal:nr,RadioGroup:no,RadioItem:ni,Separator:np,Sub:na,SubContent:nd,SubTrigger:ng,Trigger:r0}),nx={colors:{inherit:"inherit",current:"currentColor",transparent:"transparent",black:"#000000",white:"#ffffff",neutral:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},darkGray:{50:"#525c7a",100:"#49536e",200:"#414962",300:"#394056",400:"#313749",500:"#292e3d",600:"#212530",700:"#191c24",800:"#111318",900:"#0b0d10"},gray:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},blue:{25:"#F5FAFF",50:"#EFF8FF",100:"#D1E9FF",200:"#B2DDFF",300:"#84CAFF",400:"#53B1FD",500:"#2E90FA",600:"#1570EF",700:"#175CD3",800:"#1849A9",900:"#194185"},green:{25:"#F6FEF9",50:"#ECFDF3",100:"#D1FADF",200:"#A6F4C5",300:"#6CE9A6",400:"#32D583",500:"#12B76A",600:"#039855",700:"#027A48",800:"#05603A",900:"#054F31"},red:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"},yellow:{25:"#FFFCF5",50:"#FFFAEB",100:"#FEF0C7",200:"#FEDF89",300:"#FEC84B",400:"#FDB022",500:"#F79009",600:"#DC6803",700:"#B54708",800:"#93370D",900:"#7A2E0E"},purple:{25:"#FAFAFF",50:"#F4F3FF",100:"#EBE9FE",200:"#D9D6FE",300:"#BDB4FE",400:"#9B8AFB",500:"#7A5AF8",600:"#6938EF",700:"#5925DC",800:"#4A1FB8",900:"#3E1C96"},teal:{25:"#F6FEFC",50:"#F0FDF9",100:"#CCFBEF",200:"#99F6E0",300:"#5FE9D0",400:"#2ED3B7",500:"#15B79E",600:"#0E9384",700:"#107569",800:"#125D56",900:"#134E48"},pink:{25:"#fdf2f8",50:"#fce7f3",100:"#fbcfe8",200:"#f9a8d4",300:"#f472b6",400:"#ec4899",500:"#db2777",600:"#be185d",700:"#9d174d",800:"#831843",900:"#500724"},cyan:{25:"#ecfeff",50:"#cffafe",100:"#a5f3fc",200:"#67e8f9",300:"#22d3ee",400:"#06b6d4",500:"#0891b2",600:"#0e7490",700:"#155e75",800:"#164e63",900:"#083344"}},alpha:{100:"ff",90:"e5",80:"cc",70:"b3",60:"99",50:"80",40:"66",30:"4d",20:"33",10:"1a",0:"00"},font:{size:{"2xs":"calc(var(--tsqd-font-size) * 0.625)",xs:"calc(var(--tsqd-font-size) * 0.75)",sm:"calc(var(--tsqd-font-size) * 0.875)",md:"var(--tsqd-font-size)",lg:"calc(var(--tsqd-font-size) * 1.125)",xl:"calc(var(--tsqd-font-size) * 1.25)","2xl":"calc(var(--tsqd-font-size) * 1.5)","3xl":"calc(var(--tsqd-font-size) * 1.875)","4xl":"calc(var(--tsqd-font-size) * 2.25)","5xl":"calc(var(--tsqd-font-size) * 3)","6xl":"calc(var(--tsqd-font-size) * 3.75)","7xl":"calc(var(--tsqd-font-size) * 4.5)","8xl":"calc(var(--tsqd-font-size) * 6)","9xl":"calc(var(--tsqd-font-size) * 8)"},lineHeight:{xs:"calc(var(--tsqd-font-size) * 1)",sm:"calc(var(--tsqd-font-size) * 1.25)",md:"calc(var(--tsqd-font-size) * 1.5)",lg:"calc(var(--tsqd-font-size) * 1.75)",xl:"calc(var(--tsqd-font-size) * 2)","2xl":"calc(var(--tsqd-font-size) * 2.25)","3xl":"calc(var(--tsqd-font-size) * 2.5)","4xl":"calc(var(--tsqd-font-size) * 2.75)","5xl":"calc(var(--tsqd-font-size) * 3)","6xl":"calc(var(--tsqd-font-size) * 3.25)","7xl":"calc(var(--tsqd-font-size) * 3.5)","8xl":"calc(var(--tsqd-font-size) * 3.75)","9xl":"calc(var(--tsqd-font-size) * 4)"},weight:{thin:"100",extralight:"200",light:"300",normal:"400",medium:"500",semibold:"600",bold:"700",extrabold:"800",black:"900"}},breakpoints:{xs:"320px",sm:"640px",md:"768px",lg:"1024px",xl:"1280px","2xl":"1536px"},border:{radius:{none:"0px",xs:"calc(var(--tsqd-font-size) * 0.125)",sm:"calc(var(--tsqd-font-size) * 0.25)",md:"calc(var(--tsqd-font-size) * 0.375)",lg:"calc(var(--tsqd-font-size) * 0.5)",xl:"calc(var(--tsqd-font-size) * 0.75)","2xl":"calc(var(--tsqd-font-size) * 1)","3xl":"calc(var(--tsqd-font-size) * 1.5)",full:"9999px"}},size:{0:"0px",.25:"calc(var(--tsqd-font-size) * 0.0625)",.5:"calc(var(--tsqd-font-size) * 0.125)",1:"calc(var(--tsqd-font-size) * 0.25)",1.5:"calc(var(--tsqd-font-size) * 0.375)",2:"calc(var(--tsqd-font-size) * 0.5)",2.5:"calc(var(--tsqd-font-size) * 0.625)",3:"calc(var(--tsqd-font-size) * 0.75)",3.5:"calc(var(--tsqd-font-size) * 0.875)",4:"calc(var(--tsqd-font-size) * 1)",4.5:"calc(var(--tsqd-font-size) * 1.125)",5:"calc(var(--tsqd-font-size) * 1.25)",5.5:"calc(var(--tsqd-font-size) * 1.375)",6:"calc(var(--tsqd-font-size) * 1.5)",6.5:"calc(var(--tsqd-font-size) * 1.625)",7:"calc(var(--tsqd-font-size) * 1.75)",8:"calc(var(--tsqd-font-size) * 2)",9:"calc(var(--tsqd-font-size) * 2.25)",10:"calc(var(--tsqd-font-size) * 2.5)",11:"calc(var(--tsqd-font-size) * 2.75)",12:"calc(var(--tsqd-font-size) * 3)",14:"calc(var(--tsqd-font-size) * 3.5)",16:"calc(var(--tsqd-font-size) * 4)",20:"calc(var(--tsqd-font-size) * 5)",24:"calc(var(--tsqd-font-size) * 6)",28:"calc(var(--tsqd-font-size) * 7)",32:"calc(var(--tsqd-font-size) * 8)",36:"calc(var(--tsqd-font-size) * 9)",40:"calc(var(--tsqd-font-size) * 10)",44:"calc(var(--tsqd-font-size) * 11)",48:"calc(var(--tsqd-font-size) * 12)",52:"calc(var(--tsqd-font-size) * 13)",56:"calc(var(--tsqd-font-size) * 14)",60:"calc(var(--tsqd-font-size) * 15)",64:"calc(var(--tsqd-font-size) * 16)",72:"calc(var(--tsqd-font-size) * 18)",80:"calc(var(--tsqd-font-size) * 20)",96:"calc(var(--tsqd-font-size) * 24)"},shadow:{xs:(e="rgb(0 0 0 / 0.1)")=>"0 1px 2px 0 rgb(0 0 0 / 0.05)",sm:(e="rgb(0 0 0 / 0.1)")=>`0 1px 3px 0 ${e}, 0 1px 2px -1px ${e}`,md:(e="rgb(0 0 0 / 0.1)")=>`0 4px 6px -1px ${e}, 0 2px 4px -2px ${e}`,lg:(e="rgb(0 0 0 / 0.1)")=>`0 10px 15px -3px ${e}, 0 4px 6px -4px ${e}`,xl:(e="rgb(0 0 0 / 0.1)")=>`0 20px 25px -5px ${e}, 0 8px 10px -6px ${e}`,"2xl":(e="rgb(0 0 0 / 0.25)")=>`0 25px 50px -12px ${e}`,inner:(e="rgb(0 0 0 / 0.05)")=>`inset 0 2px 4px 0 ${e}`,none:()=>"none"},zIndices:{hide:-1,auto:"auto",base:0,docked:10,dropdown:1e3,sticky:1100,banner:1200,overlay:1300,modal:1400,popover:1500,skipLink:1600,toast:1700,tooltip:1800}},nw=(0,o.V)('<svg width=14 height=14 viewBox="0 0 14 14"fill=none xmlns=http://www.w3.org/2000/svg><path d="M13 13L9.00007 9M10.3333 5.66667C10.3333 8.244 8.244 10.3333 5.66667 10.3333C3.08934 10.3333 1 8.244 1 5.66667C1 3.08934 3.08934 1 5.66667 1C8.244 1 10.3333 3.08934 10.3333 5.66667Z"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),nk=(0,o.V)('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6M10 10.5V15.5M14 10.5V15.5"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),n$=(0,o.V)('<svg width=10 height=6 viewBox="0 0 10 6"fill=none xmlns=http://www.w3.org/2000/svg><path d="M1 1L5 5L9 1"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),nS=(0,o.V)('<svg width=12 height=12 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 13.3333V2.66667M8 2.66667L4 6.66667M8 2.66667L12 6.66667"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),nC=(0,o.V)('<svg width=12 height=12 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 2.66667V13.3333M8 13.3333L4 9.33333M8 13.3333L12 9.33333"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),nq=(0,o.V)('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M12 2v2m0 16v2M4 12H2m4.314-5.686L4.9 4.9m12.786 1.414L19.1 4.9M6.314 17.69 4.9 19.104m12.786-1.414 1.414 1.414M22 12h-2m-3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nM=(0,o.V)('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M22 15.844a10.424 10.424 0 0 1-4.306.925c-5.779 0-10.463-4.684-10.463-10.462 0-1.536.33-2.994.925-4.307A10.464 10.464 0 0 0 2 11.538C2 17.316 6.684 22 12.462 22c4.243 0 7.896-2.526 9.538-6.156Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nE=(0,o.V)('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 21h8m-4-4v4m-5.2-4h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C22 14.72 22 13.88 22 12.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C19.72 3 18.88 3 17.2 3H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C2 5.28 2 6.12 2 7.8v4.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 17 5.12 17 6.8 17Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nT=(0,o.V)('<svg stroke=currentColor fill=currentColor stroke-width=0 viewBox="0 0 24 24"height=1em width=1em xmlns=http://www.w3.org/2000/svg><path fill=none d="M0 0h24v24H0z"></path><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z">'),nF=(0,o.V)('<svg stroke-width=0 viewBox="0 0 24 24"height=1em width=1em xmlns=http://www.w3.org/2000/svg><path fill=none d="M24 .01c0-.01 0-.01 0 0L0 0v24h24V.01zM0 0h24v24H0V0zm0 0h24v24H0V0z"></path><path d="M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7l2-2zm-4 4a9.793 9.793 0 00-4.49-2.56l3.53 3.53.96-.97zM2 3.05L5.07 6.1C3.6 6.82 2.22 7.78 1 9l1.99 2c1.24-1.24 2.67-2.16 4.2-2.77l2.24 2.24A9.684 9.684 0 005 13v.01L6.99 15a7.042 7.042 0 014.92-2.06L18.98 20l1.27-1.26L3.29 1.79 2 3.05zM9 17l3 3 3-3a4.237 4.237 0 00-6 0z">'),nL=(0,o.V)('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9.3951 19.3711L9.97955 20.6856C10.1533 21.0768 10.4368 21.4093 10.7958 21.6426C11.1547 21.8759 11.5737 22.0001 12.0018 22C12.4299 22.0001 12.8488 21.8759 13.2078 21.6426C13.5667 21.4093 13.8503 21.0768 14.024 20.6856L14.6084 19.3711C14.8165 18.9047 15.1664 18.5159 15.6084 18.26C16.0532 18.0034 16.5678 17.8941 17.0784 17.9478L18.5084 18.1C18.9341 18.145 19.3637 18.0656 19.7451 17.8713C20.1265 17.6771 20.4434 17.3763 20.6573 17.0056C20.8715 16.635 20.9735 16.2103 20.9511 15.7829C20.9286 15.3555 20.7825 14.9438 20.5307 14.5978L19.684 13.4344C19.3825 13.0171 19.2214 12.5148 19.224 12C19.2239 11.4866 19.3865 10.9864 19.6884 10.5711L20.5351 9.40778C20.787 9.06175 20.933 8.65007 20.9555 8.22267C20.978 7.79528 20.8759 7.37054 20.6618 7C20.4479 6.62923 20.131 6.32849 19.7496 6.13423C19.3681 5.93997 18.9386 5.86053 18.5129 5.90556L17.0829 6.05778C16.5722 6.11141 16.0577 6.00212 15.6129 5.74556C15.17 5.48825 14.82 5.09736 14.6129 4.62889L14.024 3.31444C13.8503 2.92317 13.5667 2.59072 13.2078 2.3574C12.8488 2.12408 12.4299 1.99993 12.0018 2C11.5737 1.99993 11.1547 2.12408 10.7958 2.3574C10.4368 2.59072 10.1533 2.92317 9.97955 3.31444L9.3951 4.62889C9.18803 5.09736 8.83798 5.48825 8.3951 5.74556C7.95032 6.00212 7.43577 6.11141 6.9251 6.05778L5.49066 5.90556C5.06499 5.86053 4.6354 5.93997 4.25397 6.13423C3.87255 6.32849 3.55567 6.62923 3.34177 7C3.12759 7.37054 3.02555 7.79528 3.04804 8.22267C3.07052 8.65007 3.21656 9.06175 3.46844 9.40778L4.3151 10.5711C4.61704 10.9864 4.77964 11.4866 4.77955 12C4.77964 12.5134 4.61704 13.0137 4.3151 13.4289L3.46844 14.5922C3.21656 14.9382 3.07052 15.3499 3.04804 15.7773C3.02555 16.2047 3.12759 16.6295 3.34177 17C3.55589 17.3706 3.8728 17.6712 4.25417 17.8654C4.63554 18.0596 5.06502 18.1392 5.49066 18.0944L6.92066 17.9422C7.43133 17.8886 7.94587 17.9979 8.39066 18.2544C8.83519 18.511 9.18687 18.902 9.3951 19.3711Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round></path><path d="M12 15C13.6568 15 15 13.6569 15 12C15 10.3431 13.6568 9 12 9C10.3431 9 8.99998 10.3431 8.99998 12C8.99998 13.6569 10.3431 15 12 15Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nA=(0,o.V)('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M16 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M11.5 12.5L17 7M17 7H12M17 7V12M6.2 21H8.8C9.9201 21 10.4802 21 10.908 20.782C11.2843 20.5903 11.5903 20.2843 11.782 19.908C12 19.4802 12 18.9201 12 17.8V15.2C12 14.0799 12 13.5198 11.782 13.092C11.5903 12.7157 11.2843 12.4097 10.908 12.218C10.4802 12 9.92011 12 8.8 12H6.2C5.0799 12 4.51984 12 4.09202 12.218C3.71569 12.4097 3.40973 12.7157 3.21799 13.092C3 13.5198 3 14.0799 3 15.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nD=(0,o.V)('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path class=copier d="M8 8V5.2C8 4.0799 8 3.51984 8.21799 3.09202C8.40973 2.71569 8.71569 2.40973 9.09202 2.21799C9.51984 2 10.0799 2 11.2 2H18.8C19.9201 2 20.4802 2 20.908 2.21799C21.2843 2.40973 21.5903 2.71569 21.782 3.09202C22 3.51984 22 4.0799 22 5.2V12.8C22 13.9201 22 14.4802 21.782 14.908C21.5903 15.2843 21.2843 15.5903 20.908 15.782C20.4802 16 19.9201 16 18.8 16H16M5.2 22H12.8C13.9201 22 14.4802 22 14.908 21.782C15.2843 21.5903 15.5903 21.2843 15.782 20.908C16 20.4802 16 19.9201 16 18.8V11.2C16 10.0799 16 9.51984 15.782 9.09202C15.5903 8.71569 15.2843 8.40973 14.908 8.21799C14.4802 8 13.9201 8 12.8 8H5.2C4.0799 8 3.51984 8 3.09202 8.21799C2.71569 8.40973 2.40973 8.71569 2.21799 9.09202C2 9.51984 2 10.0799 2 11.2V18.8C2 19.9201 2 20.4802 2.21799 20.908C2.40973 21.2843 2.71569 21.5903 3.09202 21.782C3.51984 22 4.07989 22 5.2 22Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round stroke=currentColor>'),nz=(0,o.V)('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M2.5 21.4998L8.04927 19.3655C8.40421 19.229 8.58168 19.1607 8.74772 19.0716C8.8952 18.9924 9.0358 18.901 9.16804 18.7984C9.31692 18.6829 9.45137 18.5484 9.72028 18.2795L21 6.99982C22.1046 5.89525 22.1046 4.10438 21 2.99981C19.8955 1.89525 18.1046 1.89524 17 2.99981L5.72028 14.2795C5.45138 14.5484 5.31692 14.6829 5.20139 14.8318C5.09877 14.964 5.0074 15.1046 4.92823 15.2521C4.83911 15.4181 4.77085 15.5956 4.63433 15.9506L2.5 21.4998ZM2.5 21.4998L4.55812 16.1488C4.7054 15.7659 4.77903 15.5744 4.90534 15.4867C5.01572 15.4101 5.1523 15.3811 5.2843 15.4063C5.43533 15.4351 5.58038 15.5802 5.87048 15.8703L8.12957 18.1294C8.41967 18.4195 8.56472 18.5645 8.59356 18.7155C8.61877 18.8475 8.58979 18.9841 8.51314 19.0945C8.42545 19.2208 8.23399 19.2944 7.85107 19.4417L2.5 21.4998Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nO=(0,o.V)('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M7.5 12L10.5 15L16.5 9M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nI=(0,o.V)('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9 9L15 15M15 9L9 15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"stroke=#F04438 stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nK=(0,o.V)('<svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 xmlns=http://www.w3.org/2000/svg><rect class=list width=20 height=20 y=2 x=2 rx=2></rect><line class=list-item y1=7 y2=7 x1=6 x2=18></line><line class=list-item y2=12 y1=12 x1=6 x2=18></line><line class=list-item y1=17 y2=17 x1=6 x2=18>'),nP=(0,o.V)('<svg viewBox="0 0 24 24"height=20 width=20 fill=none xmlns=http://www.w3.org/2000/svg><path d="M3 7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nH=(0,o.V)('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nV=(0,o.V)('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round></path><animateTransform attributeName=transform attributeType=XML type=rotate from=0 to=360 dur=2s repeatCount=indefinite>'),nR=(0,o.V)('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M15 9L9 15M9 9L15 15M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nB=(0,o.V)('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9.5 15V9M14.5 15V9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),nQ=(0,o.V)('<svg version=1.0 viewBox="0 0 633 633"><linearGradient x1=-666.45 x2=-666.45 y1=163.28 y2=163.99 gradientTransform="matrix(633 0 0 633 422177 -103358)"gradientUnits=userSpaceOnUse><stop stop-color=#6BDAFF offset=0></stop><stop stop-color=#F9FFB5 offset=.32></stop><stop stop-color=#FFA770 offset=.71></stop><stop stop-color=#FF7373 offset=1></stop></linearGradient><circle cx=316.5 cy=316.5 r=316.5></circle><defs><filter x=-137.5 y=412 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=412 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=610.5 rx=214.5 ry=186 fill=#015064 stroke=#00CFE2 stroke-width=25></ellipse></g><defs><filter x=316.5 y=412 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=412 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=610.5 rx=214.5 ry=186 fill=#015064 stroke=#00CFE2 stroke-width=25></ellipse></g><defs><filter x=-137.5 y=450 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=450 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=648.5 rx=214.5 ry=186 fill=#015064 stroke=#00A8B8 stroke-width=25></ellipse></g><defs><filter x=316.5 y=450 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=450 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=648.5 rx=214.5 ry=186 fill=#015064 stroke=#00A8B8 stroke-width=25></ellipse></g><defs><filter x=-137.5 y=486 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=486 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=684.5 rx=214.5 ry=186 fill=#015064 stroke=#007782 stroke-width=25></ellipse></g><defs><filter x=316.5 y=486 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=486 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=684.5 rx=214.5 ry=186 fill=#015064 stroke=#007782 stroke-width=25></ellipse></g><defs><filter x=272.2 y=308 width=176.9 height=129.3 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=272.2 y=308 width=176.9 height=129.3 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><line x1=436 x2=431 y1=403.2 y2=431.8 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><line x1=291 x2=280 y1=341.5 y2=403.5 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><line x1=332.9 x2=328.6 y1=384.1 y2=411.2 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><linearGradient x1=-670.75 x2=-671.59 y1=164.4 y2=164.49 gradientTransform="matrix(-184.16 -32.472 -11.461 64.997 -121359 -32126)"gradientUnits=userSpaceOnUse><stop stop-color=#EE2700 offset=0></stop><stop stop-color=#FF008E offset=1></stop></linearGradient><path d="m344.1 363 97.7 17.2c5.8 2.1 8.2 6.1 7.1 12.1s-4.7 9.2-11 9.9l-106-18.7-57.5-59.2c-3.2-4.8-2.9-9.1 0.8-12.8s8.3-4.4 13.7-2.1l55.2 53.6z"clip-rule=evenodd fill-rule=evenodd></path><line x1=428.2 x2=429.1 y1=384.5 y2=378 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=395.2 x2=396.1 y1=379.5 y2=373 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=362.2 x2=363.1 y1=373.5 y2=367.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=324.2 x2=328.4 y1=351.3 y2=347.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=303.2 x2=307.4 y1=331.3 y2=327.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line></g><defs><filter x=73.2 y=113.8 width=280.6 height=317.4 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=73.2 y=113.8 width=280.6 height=317.4 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-672.16 x2=-672.16 y1=165.03 y2=166.03 gradientTransform="matrix(-100.18 48.861 97.976 200.88 -83342 -93.059)"gradientUnits=userSpaceOnUse><stop stop-color=#A17500 offset=0></stop><stop stop-color=#5D2100 offset=1></stop></linearGradient><path d="m192.3 203c8.1 37.3 14 73.6 17.8 109.1 3.8 35.4 2.8 75.1-3 119.2l61.2-16.7c-15.6-59-25.2-97.9-28.6-116.6s-10.8-51.9-22.1-99.6l-25.3 4.6"clip-rule=evenodd fill-rule=evenodd></path><g stroke=#2F8A00><linearGradient x1=-660.23 x2=-660.23 y1=166.72 y2=167.72 gradientTransform="matrix(92.683 4.8573 -2.0259 38.657 61680 -3088.6)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m195 183.9s-12.6-22.1-36.5-29.9c-15.9-5.2-34.4-1.5-55.5 11.1 15.9 14.3 29.5 22.6 40.7 24.9 16.8 3.6 51.3-6.1 51.3-6.1z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-661.36 x2=-661.36 y1=164.18 y2=165.18 gradientTransform="matrix(110 5.7648 -6.3599 121.35 73933 -15933)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5s-47.5-8.5-83.2 15.7c-23.8 16.2-34.3 49.3-31.6 99.4 30.3-27.8 52.1-48.5 65.2-61.9 19.8-20.2 49.6-53.2 49.6-53.2z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-656.79 x2=-656.79 y1=165.15 y2=166.15 gradientTransform="matrix(62.954 3.2993 -3.5023 66.828 42156 -8754.1)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m195 183.9c-0.8-21.9 6-38 20.6-48.2s29.8-15.4 45.5-15.3c-6.1 21.4-14.5 35.8-25.2 43.4s-24.4 14.2-40.9 20.1z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-663.07 x2=-663.07 y1=165.44 y2=166.44 gradientTransform="matrix(152.47 7.9907 -3.0936 59.029 101884 -4318.7)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c31.9-30 64.1-39.7 96.7-29s50.8 30.4 54.6 59.1c-35.2-5.5-60.4-9.6-75.8-12.1-15.3-2.6-40.5-8.6-75.5-18z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-662.57 x2=-662.57 y1=164.44 y2=165.44 gradientTransform="matrix(136.46 7.1517 -5.2163 99.533 91536 -11442)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c35.8-7.6 65.6-0.2 89.2 22s37.7 49 42.3 80.3c-39.8-9.7-68.3-23.8-85.5-42.4s-32.5-38.5-46-59.9z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-656.43 x2=-656.43 y1=163.86 y2=164.86 gradientTransform="matrix(60.866 3.1899 -8.7773 167.48 41560 -25168)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c-33.6 13.8-53.6 35.7-60.1 65.6s-3.6 63.1 8.7 99.6c27.4-40.3 43.2-69.6 47.4-88s5.6-44.1 4-77.2z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><path d="m196.5 182.3c-14.8 21.6-25.1 41.4-30.8 59.4s-9.5 33-11.1 45.1"fill=none stroke-linecap=round stroke-width=8></path><path d="m194.9 185.7c-24.4 1.7-43.8 9-58.1 21.8s-24.7 25.4-31.3 37.8"fill=none stroke-linecap=round stroke-width=8></path><path d="m204.5 176.4c29.7-6.7 52-8.4 67-5.1s26.9 8.6 35.8 15.9"fill=none stroke-linecap=round stroke-width=8></path><path d="m196.5 181.4c20.3 9.9 38.2 20.5 53.9 31.9s27.4 22.1 35.1 32"fill=none stroke-linecap=round stroke-width=8></path></g></g><defs><filter x=50.5 y=399 width=532 height=633 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=50.5 y=399 width=532 height=633 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-666.06 x2=-666.23 y1=163.36 y2=163.75 gradientTransform="matrix(532 0 0 633 354760 -102959)"gradientUnits=userSpaceOnUse><stop stop-color=#FFF400 offset=0></stop><stop stop-color=#3C8700 offset=1></stop></linearGradient><ellipse cx=316.5 cy=715.5 rx=266 ry=316.5></ellipse></g><defs><filter x=391 y=-24 width=288 height=283 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=391 y=-24 width=288 height=283 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-664.56 x2=-664.56 y1=163.79 y2=164.79 gradientTransform="matrix(227 0 0 227 151421 -37204)"gradientUnits=userSpaceOnUse><stop stop-color=#FFDF00 offset=0></stop><stop stop-color=#FF9D00 offset=1></stop></linearGradient><circle cx=565.5 cy=89.5 r=113.5></circle><linearGradient x1=-644.5 x2=-645.77 y1=342 y2=342 gradientTransform="matrix(30 0 0 1 19770 -253)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=427 x2=397 y1=89 y2=89 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-641.56 x2=-642.83 y1=196.02 y2=196.07 gradientTransform="matrix(26.5 0 0 5.5 17439 -1025.5)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=430.5 x2=404 y1=55.5 y2=50 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-643.73 x2=-645 y1=185.83 y2=185.9 gradientTransform="matrix(29 0 0 8 19107 -1361)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=431 x2=402 y1=122 y2=130 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-638.94 x2=-640.22 y1=177.09 y2=177.39 gradientTransform="matrix(24 0 0 13 15783 -2145)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=442 x2=418 y1=153 y2=166 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-633.42 x2=-634.7 y1=172.41 y2=173.31 gradientTransform="matrix(20 0 0 19 13137 -3096)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=464 x2=444 y1=180 y2=199 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-619.05 x2=-619.52 y1=170.82 y2=171.82 gradientTransform="matrix(13.83 0 0 22.85 9050 -3703.4)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=491.4 x2=477.5 y1=203 y2=225.9 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-578.5 x2=-578.63 y1=170.31 y2=171.31 gradientTransform="matrix(7.5 0 0 24.5 4860 -3953)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=524.5 x2=517 y1=219.5 y2=244 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=666.5 x2=666.5 y1=170.31 y2=171.31 gradientTransform="matrix(.5 0 0 24.5 231.5 -3944)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=564.5 x2=565 y1=228.5 y2=253 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12>');function nG(){return nw()}function nU(){return nk()}function nN(){return n$()}function nj(){return nS()}function n_(){return nC()}function nW(){var e;return(e=nC()).style.setProperty("transform","rotate(90deg)"),e}function nY(){var e;return(e=nC()).style.setProperty("transform","rotate(-90deg)"),e}function nJ(){return nq()}function nX(){return nM()}function nZ(){return nE()}function n0(){return nT()}function n1(){return nF()}function n2(){return nL()}function n3(){return nA()}function n5(){return nD()}function n4(){return nz()}function n6(e){var t,r;return r=(t=nO()).firstChild,(0,o.t)(()=>(0,o.Q)(r,"stroke","dark"===e.theme?"#12B76A":"#027A48")),t}function n9(){return nI()}function n8(){return nK()}function n7(e){return[(0,o.o)(o.h,{get when(){return e.checked},get children(){var t=nO(),r=t.firstChild;return(0,o.t)(()=>(0,o.Q)(r,"stroke","dark"===e.theme?"#9B8AFB":"#6938EF")),t}}),(0,o.o)(o.h,{get when(){return!e.checked},get children(){var n=nP(),i=n.firstChild;return(0,o.t)(()=>(0,o.Q)(i,"stroke","dark"===e.theme?"#9B8AFB":"#6938EF")),n}})]}function oe(){return nH()}function ot(){return nV()}function or(){return nR()}function on(){return nB()}function oo(){var e,t,r,n,i,l,a,s,d,u,c,g,f,p,h,y,v,b,m,x,w,k,$,S,C,q,M,E,T,F,L,A,D,z,O,I,K,P,H,V,R,B,Q,G,U,N,j,_,W,Y,J,X,Z,ee,et,er,en,eo,ei,el,ea,es,ed,eu,ec,eg,ef,ep,eh,ey,ev,eb,em,ex,ew,ek,e$,eS,eC,eq,eM,eE,eT,eF,eL,eA,eD,ez,eO;let eI=(0,o.w)();return i=(n=(r=(t=(e=nQ()).firstChild).nextSibling).nextSibling).firstChild,a=(l=n.nextSibling).firstChild,u=(d=(s=l.nextSibling).nextSibling).firstChild,g=(c=d.nextSibling).firstChild,h=(p=(f=c.nextSibling).nextSibling).firstChild,v=(y=p.nextSibling).firstChild,x=(m=(b=y.nextSibling).nextSibling).firstChild,k=(w=m.nextSibling).firstChild,C=(S=($=w.nextSibling).nextSibling).firstChild,M=(q=S.nextSibling).firstChild,F=(T=(E=q.nextSibling).nextSibling).firstChild,A=(L=T.nextSibling).firstChild,O=(z=(D=L.nextSibling).nextSibling).firstChild,K=(I=z.nextSibling).firstChild,V=(H=(P=I.nextSibling).firstChild.nextSibling.nextSibling.nextSibling).nextSibling,B=(R=P.nextSibling).firstChild,G=(Q=R.nextSibling).firstChild,ei=(eo=(en=(er=(et=(ee=(Z=(X=(J=(Y=(W=(_=(j=(N=(U=Q.nextSibling).firstChild).nextSibling).nextSibling.firstChild).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling,ea=(el=U.nextSibling).firstChild,ed=(es=el.nextSibling).firstChild,eg=(ec=(eu=es.nextSibling).firstChild).nextSibling,ep=(ef=eu.nextSibling).firstChild,ey=(eh=ef.nextSibling).firstChild,eO=(ez=(eD=(eA=(eL=(eF=(eT=(eE=(eM=(eq=(eC=(eS=(e$=(ek=(ew=(ex=(em=(eb=(ev=eh.nextSibling).firstChild).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling,(0,o.Q)(t,"id",`a-${eI}`),(0,o.Q)(r,"fill",`url(#a-${eI})`),(0,o.Q)(i,"id",`am-${eI}`),(0,o.Q)(l,"id",`b-${eI}`),(0,o.Q)(a,"filter",`url(#am-${eI})`),(0,o.Q)(s,"mask",`url(#b-${eI})`),(0,o.Q)(u,"id",`ah-${eI}`),(0,o.Q)(c,"id",`k-${eI}`),(0,o.Q)(g,"filter",`url(#ah-${eI})`),(0,o.Q)(f,"mask",`url(#k-${eI})`),(0,o.Q)(h,"id",`ae-${eI}`),(0,o.Q)(y,"id",`j-${eI}`),(0,o.Q)(v,"filter",`url(#ae-${eI})`),(0,o.Q)(b,"mask",`url(#j-${eI})`),(0,o.Q)(x,"id",`ai-${eI}`),(0,o.Q)(w,"id",`i-${eI}`),(0,o.Q)(k,"filter",`url(#ai-${eI})`),(0,o.Q)($,"mask",`url(#i-${eI})`),(0,o.Q)(C,"id",`aj-${eI}`),(0,o.Q)(q,"id",`h-${eI}`),(0,o.Q)(M,"filter",`url(#aj-${eI})`),(0,o.Q)(E,"mask",`url(#h-${eI})`),(0,o.Q)(F,"id",`ag-${eI}`),(0,o.Q)(L,"id",`g-${eI}`),(0,o.Q)(A,"filter",`url(#ag-${eI})`),(0,o.Q)(D,"mask",`url(#g-${eI})`),(0,o.Q)(O,"id",`af-${eI}`),(0,o.Q)(I,"id",`f-${eI}`),(0,o.Q)(K,"filter",`url(#af-${eI})`),(0,o.Q)(P,"mask",`url(#f-${eI})`),(0,o.Q)(H,"id",`m-${eI}`),(0,o.Q)(V,"fill",`url(#m-${eI})`),(0,o.Q)(B,"id",`ak-${eI}`),(0,o.Q)(Q,"id",`e-${eI}`),(0,o.Q)(G,"filter",`url(#ak-${eI})`),(0,o.Q)(U,"mask",`url(#e-${eI})`),(0,o.Q)(N,"id",`n-${eI}`),(0,o.Q)(j,"fill",`url(#n-${eI})`),(0,o.Q)(_,"id",`r-${eI}`),(0,o.Q)(W,"fill",`url(#r-${eI})`),(0,o.Q)(Y,"id",`s-${eI}`),(0,o.Q)(J,"fill",`url(#s-${eI})`),(0,o.Q)(X,"id",`q-${eI}`),(0,o.Q)(Z,"fill",`url(#q-${eI})`),(0,o.Q)(ee,"id",`p-${eI}`),(0,o.Q)(et,"fill",`url(#p-${eI})`),(0,o.Q)(er,"id",`o-${eI}`),(0,o.Q)(en,"fill",`url(#o-${eI})`),(0,o.Q)(eo,"id",`l-${eI}`),(0,o.Q)(ei,"fill",`url(#l-${eI})`),(0,o.Q)(ea,"id",`al-${eI}`),(0,o.Q)(es,"id",`d-${eI}`),(0,o.Q)(ed,"filter",`url(#al-${eI})`),(0,o.Q)(eu,"mask",`url(#d-${eI})`),(0,o.Q)(ec,"id",`u-${eI}`),(0,o.Q)(eg,"fill",`url(#u-${eI})`),(0,o.Q)(ep,"id",`ad-${eI}`),(0,o.Q)(eh,"id",`c-${eI}`),(0,o.Q)(ey,"filter",`url(#ad-${eI})`),(0,o.Q)(ev,"mask",`url(#c-${eI})`),(0,o.Q)(eb,"id",`t-${eI}`),(0,o.Q)(em,"fill",`url(#t-${eI})`),(0,o.Q)(ex,"id",`v-${eI}`),(0,o.Q)(ew,"stroke",`url(#v-${eI})`),(0,o.Q)(ek,"id",`aa-${eI}`),(0,o.Q)(e$,"stroke",`url(#aa-${eI})`),(0,o.Q)(eS,"id",`w-${eI}`),(0,o.Q)(eC,"stroke",`url(#w-${eI})`),(0,o.Q)(eq,"id",`ac-${eI}`),(0,o.Q)(eM,"stroke",`url(#ac-${eI})`),(0,o.Q)(eE,"id",`ab-${eI}`),(0,o.Q)(eT,"stroke",`url(#ab-${eI})`),(0,o.Q)(eF,"id",`y-${eI}`),(0,o.Q)(eL,"stroke",`url(#y-${eI})`),(0,o.Q)(eA,"id",`x-${eI}`),(0,o.Q)(eD,"stroke",`url(#x-${eI})`),(0,o.Q)(ez,"id",`z-${eI}`),(0,o.Q)(eO,"stroke",`url(#z-${eI})`),e}var oi=(0,o.V)('<span><svg width=16 height=16 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M6 12L10 8L6 4"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),ol=(0,o.V)('<button title="Copy object to clipboard">'),oa=(0,o.V)('<button title="Remove all items"aria-label="Remove all items">'),os=(0,o.V)('<button title="Delete item"aria-label="Delete item">'),od=(0,o.V)('<button title="Toggle value"aria-label="Toggle value">'),ou=(0,o.V)('<button title="Bulk Edit Data"aria-label="Bulk Edit Data">'),oc=(0,o.V)("<div>"),og=(0,o.V)("<div><button> <span></span> <span> "),of=(0,o.V)("<input>"),op=(0,o.V)("<span>"),oh=(0,o.V)("<div><span>:"),oy=(0,o.V)("<div><div><button> [<!>...<!>]"),ov=e=>{let t=S(),r=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,n=(0,o.s)(()=>"dark"===t()?oq(r):oC(r));return(()=>{var t=oi();return(0,o.t)(()=>(0,o.l)(t,V(n().expander,r`
          transform: rotate(${90*!!e.expanded}deg);
        `,e.expanded&&r`
            & svg {
              top: -1px;
            }
          `))),t})()},ob=e=>{let t=S(),r=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,n=(0,o.s)(()=>"dark"===t()?oq(r):oC(r)),[i,l]=(0,o.v)("NoCopy");return(()=>{var r=ol();return(0,o.j)(r,"click","NoCopy"===i()?()=>{navigator.clipboard.writeText((0,o.U)(e.value)).then(()=>{l("SuccessCopy"),setTimeout(()=>{l("NoCopy")},1500)},e=>{l("ErrorCopy"),setTimeout(()=>{l("NoCopy")},1500)})}:void 0,!0),(0,o.H)(r,(0,o.o)(o.i,{get children(){return[(0,o.o)(o.f,{get when(){return"NoCopy"===i()},get children(){return(0,o.o)(n5,{})}}),(0,o.o)(o.f,{get when(){return"SuccessCopy"===i()},get children(){return(0,o.o)(n6,{get theme(){return t()}})}}),(0,o.o)(o.f,{get when(){return"ErrorCopy"===i()},get children(){return(0,o.o)(n9,{})}})]}})),(0,o.t)(e=>{var t=n().actionButton,l=`${"NoCopy"===i()?"Copy object to clipboard":"SuccessCopy"===i()?"Object copied to clipboard":"Error copying object to clipboard"}`;return t!==e.e&&(0,o.l)(r,e.e=t),l!==e.t&&(0,o.Q)(r,"aria-label",e.t=l),e},{e:void 0,t:void 0}),r})()},om=e=>{let t=S(),r=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,n=(0,o.s)(()=>"dark"===t()?oq(r):oC(r)),i=m().client;return(()=>{var t=oa();return t.$$click=()=>{let t=e.activeQuery.state.data,r=(0,o.X)(t,e.dataPath,[]);i.setQueryData(e.activeQuery.queryKey,r)},(0,o.H)(t,(0,o.o)(n8,{})),(0,o.t)(()=>(0,o.l)(t,n().actionButton)),t})()},ox=e=>{let t=S(),r=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,n=(0,o.s)(()=>"dark"===t()?oq(r):oC(r)),i=m().client;return(()=>{var t=os();return t.$$click=()=>{let t=e.activeQuery.state.data,r=(0,o.y)(t,e.dataPath);i.setQueryData(e.activeQuery.queryKey,r)},(0,o.H)(t,(0,o.o)(nU,{})),(0,o.t)(()=>(0,o.l)(t,V(n().actionButton))),t})()},ow=e=>{let t=S(),r=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,n=(0,o.s)(()=>"dark"===t()?oq(r):oC(r)),i=m().client;return(()=>{var l=od();return l.$$click=()=>{let t=e.activeQuery.state.data,r=(0,o.X)(t,e.dataPath,!e.value);i.setQueryData(e.activeQuery.queryKey,r)},(0,o.H)(l,(0,o.o)(n7,{get theme(){return t()},get checked(){return e.value}})),(0,o.t)(()=>(0,o.l)(l,V(n().actionButton,r`
          width: ${nx.size[3.5]};
          height: ${nx.size[3.5]};
        `))),l})()};function ok(e){return Symbol.iterator in e}function o$(e){var t;let r=S(),n=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,i=(0,o.s)(()=>"dark"===r()?oq(n):oC(n)),l=m().client,[a,s]=(0,o.v)((e.defaultExpanded||[]).includes(e.label)),[d,u]=(0,o.v)([]),c=(0,o.s)(()=>Array.isArray(e.value)?e.value.map((e,t)=>({label:t.toString(),value:e})):null!==e.value&&"object"==typeof e.value&&ok(e.value)&&"function"==typeof e.value[Symbol.iterator]?e.value instanceof Map?Array.from(e.value,([e,t])=>({label:e,value:t})):Array.from(e.value,(e,t)=>({label:t.toString(),value:e})):"object"==typeof e.value&&null!==e.value?Object.entries(e.value).map(([e,t])=>({label:e,value:t})):[]),g=(0,o.s)(()=>Array.isArray(e.value)?"array":null!==e.value&&"object"==typeof e.value&&ok(e.value)&&"function"==typeof e.value[Symbol.iterator]?"Iterable":"object"==typeof e.value&&null!==e.value?"object":typeof e.value),f=(0,o.s)(()=>(function(e,t){let r=0,n=[];for(;r<e.length;)n.push(e.slice(r,r+100)),r+=100;return n})(c(),100)),p=e.dataPath??[];return t=oc(),(0,o.H)(t,(0,o.o)(o.h,{get when(){return f().length},get children(){var h,y,v,b,x,w;return[(w=(x=(b=(v=(y=(h=og()).firstChild).firstChild).nextSibling).nextSibling.nextSibling).firstChild,y.$$click=()=>s(e=>!e),(0,o.H)(y,(0,o.o)(ov,{get expanded(){return a()}}),v),(0,o.H)(b,()=>e.label),(0,o.H)(x,()=>"iterable"===String(g()).toLowerCase()?"(Iterable) ":"",w),(0,o.H)(x,()=>c().length,w),(0,o.H)(x,()=>c().length>1?"items":"item",null),(0,o.H)(h,(0,o.o)(o.h,{get when(){return e.editable},get children(){var k=oc();return(0,o.H)(k,(0,o.o)(ob,{get value(){return e.value}}),null),(0,o.H)(k,(0,o.o)(o.h,{get when(){return e.itemsDeletable&&void 0!==e.activeQuery},get children(){return(0,o.o)(ox,{get activeQuery(){return e.activeQuery},dataPath:p})}}),null),(0,o.H)(k,(0,o.o)(o.h,{get when(){return"array"===g()&&void 0!==e.activeQuery},get children(){return(0,o.o)(om,{get activeQuery(){return e.activeQuery},dataPath:p})}}),null),(0,o.H)(k,(0,o.o)(o.h,{get when(){return(0,o.J)(()=>!!e.onEdit)()&&!(0,o.P)(e.value).meta},get children(){var $=ou();return $.$$click=()=>{e.onEdit?.()},(0,o.H)($,(0,o.o)(n4,{})),(0,o.t)(()=>(0,o.l)($,i().actionButton)),$}}),null),(0,o.t)(()=>(0,o.l)(k,i().actions)),k}}),null),(0,o.t)(e=>{var t=i().expanderButtonContainer,r=i().expanderButton,n=i().info;return t!==e.e&&(0,o.l)(h,e.e=t),r!==e.t&&(0,o.l)(y,e.t=r),n!==e.a&&(0,o.l)(x,e.a=n),e},{e:void 0,t:void 0,a:void 0}),h),(0,o.o)(o.h,{get when(){return a()},get children(){return[(0,o.o)(o.h,{get when(){return 1===f().length},get children(){var C=oc();return(0,o.H)(C,(0,o.o)(j,{get each(){return c()},by:e=>e.label,children:t=>(0,o.o)(o$,{get defaultExpanded(){return e.defaultExpanded},get label(){return t().label},get value(){return t().value},get editable(){return e.editable},get dataPath(){return[...p,t().label]},get activeQuery(){return e.activeQuery},get itemsDeletable(){return"array"===g()||"Iterable"===g()||"object"===g()}})})),(0,o.t)(()=>(0,o.l)(C,i().subEntry)),C}}),(0,o.o)(o.h,{get when(){return f().length>1},get children(){var q=oc();return(0,o.H)(q,(0,o.o)(o.e,{get each(){return f()},children:(t,r)=>{var n,l,a,s,c,g;return(g=(c=(s=(a=(l=(n=oy()).firstChild).firstChild).firstChild).nextSibling).nextSibling.nextSibling).nextSibling,a.$$click=()=>u(e=>e.includes(r)?e.filter(e=>e!==r):[...e,r]),(0,o.H)(a,(0,o.o)(ov,{get expanded(){return d().includes(r)}}),s),(0,o.H)(a,100*r,c),(0,o.H)(a,100*r+100-1,g),(0,o.H)(l,(0,o.o)(o.h,{get when(){return d().includes(r)},get children(){var f=oc();return(0,o.H)(f,(0,o.o)(j,{get each(){return t()},by:e=>e.label,children:t=>(0,o.o)(o$,{get defaultExpanded(){return e.defaultExpanded},get label(){return t().label},get value(){return t().value},get editable(){return e.editable},get dataPath(){return[...p,t().label]},get activeQuery(){return e.activeQuery}})})),(0,o.t)(()=>(0,o.l)(f,i().subEntry)),f}}),null),(0,o.t)(e=>{var t=i().entry,r=i().expanderButton;return t!==e.e&&(0,o.l)(l,e.e=t),r!==e.t&&(0,o.l)(a,e.t=r),e},{e:void 0,t:void 0}),n}})),(0,o.t)(()=>(0,o.l)(q,i().subEntry)),q}})]}})]}}),null),(0,o.H)(t,(0,o.o)(o.h,{get when(){return 0===f().length},get children(){var M=oh(),E=M.firstChild,T=E.firstChild;return(0,o.H)(E,()=>e.label,T),(0,o.H)(M,(0,o.o)(o.h,{get when(){return(0,o.J)(()=>!!(e.editable&&void 0!==e.activeQuery))()&&("string"===g()||"number"===g()||"boolean"===g())},get fallback(){var F;return F=op(),(0,o.H)(F,()=>(0,o.z)(e.value)),(0,o.t)(()=>(0,o.l)(F,i().value)),F},get children(){return[(0,o.o)(o.h,{get when(){return(0,o.J)(()=>!!(e.editable&&void 0!==e.activeQuery))()&&("string"===g()||"number"===g())},get children(){var L=of();return L.addEventListener("change",t=>{let r=e.activeQuery.state.data,n=(0,o.X)(r,p,"number"===g()?t.target.valueAsNumber:t.target.value);l.setQueryData(e.activeQuery.queryKey,n)}),(0,o.t)(e=>{var t="number"===g()?"number":"text",r=V(i().value,i().editableInput);return t!==e.e&&(0,o.Q)(L,"type",e.e=t),r!==e.t&&(0,o.l)(L,e.t=r),e},{e:void 0,t:void 0}),(0,o.t)(()=>L.value=e.value),L}}),(0,o.o)(o.h,{get when(){return"boolean"===g()},get children(){var A=op();return(0,o.H)(A,(0,o.o)(ow,{get activeQuery(){return e.activeQuery},dataPath:p,get value(){return e.value}}),null),(0,o.H)(A,()=>(0,o.z)(e.value),null),(0,o.t)(()=>(0,o.l)(A,V(i().value,i().actions,i().editableInput))),A}})]}}),null),(0,o.H)(M,(0,o.o)(o.h,{get when(){return e.editable&&e.itemsDeletable&&void 0!==e.activeQuery},get children(){return(0,o.o)(ox,{get activeQuery(){return e.activeQuery},dataPath:p})}}),null),(0,o.t)(e=>{var t=i().row,r=i().label;return t!==e.e&&(0,o.l)(M,e.e=t),r!==e.t&&(0,o.l)(E,e.t=r),e},{e:void 0,t:void 0}),M}}),null),(0,o.t)(()=>(0,o.l)(t,i().entry)),t}var oS=(e,t)=>{let{colors:r,font:n,size:o,border:i}=nx,l=(t,r)=>"light"===e?t:r;return{entry:t`
      & * {
        font-size: ${n.size.xs};
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
      }
      position: relative;
      outline: none;
      word-break: break-word;
    `,subEntry:t`
      margin: 0 0 0 0.5em;
      padding-left: 0.75em;
      border-left: 2px solid ${l(r.gray[300],r.darkGray[400])};
      /* outline: 1px solid ${r.teal[400]}; */
    `,expander:t`
      & path {
        stroke: ${r.gray[400]};
      }
      & svg {
        width: ${o[3]};
        height: ${o[3]};
      }
      display: inline-flex;
      align-items: center;
      transition: all 0.1s ease;
      /* outline: 1px solid ${r.blue[400]}; */
    `,expanderButtonContainer:t`
      display: flex;
      align-items: center;
      line-height: ${o[4]};
      min-height: ${o[4]};
      gap: ${o[2]};
    `,expanderButton:t`
      cursor: pointer;
      color: inherit;
      font: inherit;
      outline: inherit;
      height: ${o[5]};
      background: transparent;
      border: none;
      padding: 0;
      display: inline-flex;
      align-items: center;
      gap: ${o[1]};
      position: relative;
      /* outline: 1px solid ${r.green[400]}; */

      &:focus-visible {
        border-radius: ${i.radius.xs};
        outline: 2px solid ${r.blue[800]};
      }

      & svg {
        position: relative;
        left: 1px;
      }
    `,info:t`
      color: ${l(r.gray[500],r.gray[500])};
      font-size: ${n.size.xs};
      margin-left: ${o[1]};
      /* outline: 1px solid ${r.yellow[400]}; */
    `,label:t`
      color: ${l(r.gray[700],r.gray[300])};
      white-space: nowrap;
    `,value:t`
      color: ${l(r.purple[600],r.purple[400])};
      flex-grow: 1;
    `,actions:t`
      display: inline-flex;
      gap: ${o[2]};
      align-items: center;
    `,row:t`
      display: inline-flex;
      gap: ${o[2]};
      width: 100%;
      margin: ${o[.25]} 0px;
      line-height: ${o[4.5]};
      align-items: center;
    `,editableInput:t`
      border: none;
      padding: ${o[.5]} ${o[1]} ${o[.5]} ${o[1.5]};
      flex-grow: 1;
      border-radius: ${i.radius.xs};
      background-color: ${l(r.gray[200],r.darkGray[500])};

      &:hover {
        background-color: ${l(r.gray[300],r.darkGray[600])};
      }
    `,actionButton:t`
      background-color: transparent;
      color: ${l(r.gray[500],r.gray[500])};
      border: none;
      display: inline-flex;
      padding: 0px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: ${o[3]};
      height: ${o[3]};
      position: relative;
      z-index: 1;

      &:hover svg {
        color: ${l(r.gray[600],r.gray[400])};
      }

      &:focus-visible {
        border-radius: ${i.radius.xs};
        outline: 2px solid ${r.blue[800]};
        outline-offset: 2px;
      }
    `}},oC=e=>oS("light",e),oq=e=>oS("dark",e);(0,o.x)(["click"]);var oM=(0,o.V)('<div><div aria-hidden=true></div><button type=button aria-label="Open Tanstack query devtools"class=tsqd-open-btn>'),oE=(0,o.V)("<div>"),oT=(0,o.V)('<aside aria-label="Tanstack query devtools"><div></div><button aria-label="Close tanstack query devtools">'),oF=(0,o.V)("<select name=tsqd-queries-filter-sort>"),oL=(0,o.V)("<select name=tsqd-mutations-filter-sort>"),oA=(0,o.V)("<span>Asc"),oD=(0,o.V)("<span>Desc"),oz=(0,o.V)('<button aria-label="Open in picture-in-picture mode"title="Open in picture-in-picture mode">'),oO=(0,o.V)("<div>Settings"),oI=(0,o.V)("<span>Position"),oK=(0,o.V)("<span>Top"),oP=(0,o.V)("<span>Bottom"),oH=(0,o.V)("<span>Left"),oV=(0,o.V)("<span>Right"),oR=(0,o.V)("<span>Theme"),oB=(0,o.V)("<span>Light"),oQ=(0,o.V)("<span>Dark"),oG=(0,o.V)("<span>System"),oU=(0,o.V)("<span>Disabled Queries"),oN=(0,o.V)("<span>Show"),oj=(0,o.V)("<span>Hide"),o_=(0,o.V)("<div><div class=tsqd-queries-container>"),oW=(0,o.V)("<div><div class=tsqd-mutations-container>"),oY=(0,o.V)('<div><div><div><button aria-label="Close Tanstack query devtools"><span>TANSTACK</span><span> v</span></button></div></div><div><div><div><input aria-label="Filter queries by query key"type=text placeholder=Filter name=tsqd-query-filter-input></div><div></div><button class=tsqd-query-filter-sort-order-btn></button></div><div><button aria-label="Clear query cache"></button><button>'),oJ=(0,o.V)("<option>Sort by "),oX=(0,o.V)("<div class=tsqd-query-disabled-indicator>disabled"),oZ=(0,o.V)("<div class=tsqd-query-static-indicator>static"),o0=(0,o.V)("<button><div></div><code class=tsqd-query-hash>"),o1=(0,o.V)("<div role=tooltip id=tsqd-status-tooltip>"),o2=(0,o.V)("<span>"),o3=(0,o.V)("<button><span></span><span>"),o5=(0,o.V)("<button><span></span> Error"),o4=(0,o.V)('<div><span></span>Trigger Error<select><option value=""disabled selected>'),o6=(0,o.V)('<div class="tsqd-query-details-explorer-container tsqd-query-details-data-explorer">'),o9=(0,o.V)("<form><textarea name=data></textarea><div><span></span><div><button type=button>Cancel</button><button>Save"),o8=(0,o.V)('<div><div>Query Details</div><div><div class=tsqd-query-details-summary><pre><code></code></pre><span></span></div><div class=tsqd-query-details-observers-count><span>Observers:</span><span></span></div><div class=tsqd-query-details-last-updated><span>Last Updated:</span><span></span></div></div><div>Actions</div><div><button><span></span>Refetch</button><button><span></span>Invalidate</button><button><span></span>Reset</button><button><span></span>Remove</button><button><span></span> Loading</button></div><div>Data </div><div>Query Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer">'),o7=(0,o.V)("<option>"),ie=(0,o.V)('<div><div>Mutation Details</div><div><div class=tsqd-query-details-summary><pre><code></code></pre><span></span></div><div class=tsqd-query-details-last-updated><span>Submitted At:</span><span></span></div></div><div>Variables Details</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Context Details</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Data Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Mutations Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer">'),[it,ir]=(0,o.v)(null),[io,ii]=(0,o.v)(null),[il,ia]=(0,o.v)(0),[is,id]=(0,o.v)(!1),iu=e=>{let t,r=S(),n=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,i=(0,o.s)(()=>"dark"===r()?iA(n):iL(n)),l=(0,o.s)(()=>m().onlineManager);(0,o.N)(()=>{let e=l().subscribe(e=>{id(!e)});(0,o.M)(()=>{e()})});let a=k(),s=(0,o.s)(()=>m().buttonPosition||"bottom-right"),d=(0,o.s)(()=>"true"===e.localStore.open||"false"!==e.localStore.open&&(m().initialIsOpen||!1)),u=(0,o.s)(()=>e.localStore.position||m().position||p);(0,o.r)(()=>{let r=t.parentElement,n=e.localStore.height||500,o=e.localStore.width||500,i=u();r.style.setProperty("--tsqd-panel-height",`${"top"===i?"-":""}${n}px`),r.style.setProperty("--tsqd-panel-width",`${"left"===i?"-":""}${o}px`)}),(0,o.N)(()=>{let e=()=>{let e=t.parentElement,r=getComputedStyle(e).fontSize;e.style.setProperty("--tsqd-font-size",r)};e(),window.addEventListener("focus",e),(0,o.M)(()=>{window.removeEventListener("focus",e)})});let c=(0,o.s)(()=>e.localStore.pip_open??"false");return[(0,o.o)(o.h,{get when(){return(0,o.J)(()=>!!a().pipWindow)()&&"true"==c()},get children(){return(0,o.o)(o.g,{get mount(){return a().pipWindow?.document.body},get children(){return(0,o.o)(ic,{get children(){return(0,o.o)(ih,e)}})}})}}),(()=>{var r=oE(),l=t;return"function"==typeof l?(0,o._)(l,r):t=r,(0,o.H)(r,(0,o.o)(G,{name:"tsqd-panel-transition",get children(){return(0,o.o)(o.h,{get when(){return(0,o.J)(()=>!!(d()&&!a().pipWindow))()&&"false"==c()},get children(){return(0,o.o)(ip,{get localStore(){return e.localStore},get setLocalStore(){return e.setLocalStore}})}})}}),null),(0,o.H)(r,(0,o.o)(G,{name:"tsqd-button-transition",get children(){return(0,o.o)(o.h,{get when(){return!d()},get children(){var g=oM(),f=g.firstChild,p=f.nextSibling;return(0,o.H)(f,(0,o.o)(oo,{})),p.$$click=()=>e.setLocalStore("open","true"),(0,o.H)(p,(0,o.o)(oo,{})),(0,o.t)(()=>(0,o.l)(g,V(i().devtoolsBtn,i()[`devtoolsBtn-position-${s()}`],"tsqd-open-btn-container"))),g}})}}),null),(0,o.t)(()=>(0,o.l)(r,V(n`
            & .tsqd-panel-transition-exit-active,
            & .tsqd-panel-transition-enter-active {
              transition:
                opacity 0.3s,
                transform 0.3s;
            }

            & .tsqd-panel-transition-exit-to,
            & .tsqd-panel-transition-enter {
              ${"top"===u()||"bottom"===u()?"transform: translateY(var(--tsqd-panel-height));":"transform: translateX(var(--tsqd-panel-width));"}
            }

            & .tsqd-button-transition-exit-active,
            & .tsqd-button-transition-enter-active {
              transition:
                opacity 0.3s,
                transform 0.3s;
              opacity: 1;
            }

            & .tsqd-button-transition-exit-to,
            & .tsqd-button-transition-enter {
              transform: ${"relative"===s()?"none;":"top-left"===s()?"translateX(-72px);":"top-right"===s()?"translateX(72px);":"translateY(72px);"};
              opacity: 0;
            }
          `,"tsqd-transitions-container"))),r})()]},ic=e=>{let t=k(),r=S(),n=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,i=(0,o.s)(()=>"dark"===r()?iA(n):iL(n));return(0,o.r)(()=>{let e=t().pipWindow,r=()=>{e&&ia(e.innerWidth)};e&&(e.addEventListener("resize",r),r()),(0,o.M)(()=>{e&&e.removeEventListener("resize",r)})}),(()=>{var t=oE();return t.style.setProperty("--tsqd-font-size","16px"),t.style.setProperty("max-height","100vh"),t.style.setProperty("height","100vh"),t.style.setProperty("width","100vw"),(0,o.H)(t,()=>e.children),(0,o.t)(()=>(0,o.l)(t,V(i().panel,(()=>{let{colors:e}=nx,t=(e,t)=>"dark"===r()?t:e;return 796>il()?n`
        flex-direction: column;
        background-color: ${t(e.gray[300],e.gray[600])};
      `:n`
      flex-direction: row;
      background-color: ${t(e.gray[200],e.darkGray[900])};
    `})(),{[n`
            min-width: min-content;
          `]:700>il()},"tsqd-main-panel"))),t})()},ig=e=>{let t,r=S(),n=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,i=(0,o.s)(()=>"dark"===r()?iA(n):iL(n));return(0,o.N)(()=>{_(t,({width:e},r)=>{r===t&&ia(e)})}),(()=>{var l=oE(),a=t;return"function"==typeof a?(0,o._)(a,l):t=l,l.style.setProperty("--tsqd-font-size","16px"),(0,o.H)(l,()=>e.children),(0,o.t)(()=>(0,o.l)(l,V(i().parentPanel,(()=>{let{colors:e}=nx,t=(e,t)=>"dark"===r()?t:e;return 796>il()?n`
        flex-direction: column;
        background-color: ${t(e.gray[300],e.gray[600])};
      `:n`
      flex-direction: row;
      background-color: ${t(e.gray[200],e.darkGray[900])};
    `})(),{[n`
            min-width: min-content;
          `]:700>il()},"tsqd-main-panel"))),l})()},ip=e=>{let t,r=S(),n=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,i=(0,o.s)(()=>"dark"===r()?iA(n):iL(n)),[l,a]=(0,o.v)(!1),s=(0,o.s)(()=>e.localStore.position||m().position||p),d=t=>{let r=t.currentTarget.parentElement;if(!r)return;a(!0);let{height:n,width:i}=r.getBoundingClientRect(),d=t.clientX,u=t.clientY,c=0,g=(0,o.n)(3.5),f=(0,o.n)(12),p=t=>{if(t.preventDefault(),"left"===s()||"right"===s()){(c=Math.round(i+("right"===s()?d-t.clientX:t.clientX-d)))<f&&(c=f),e.setLocalStore("width",String(Math.round(c)));let n=r.getBoundingClientRect().width;Number(e.localStore.width)<n&&e.setLocalStore("width",String(n))}else(c=Math.round(n+("bottom"===s()?u-t.clientY:t.clientY-u)))<g&&(c=g,ir(null)),e.setLocalStore("height",String(Math.round(c)))},h=()=>{l()&&a(!1),document.removeEventListener("mousemove",p,!1),document.removeEventListener("mouseUp",h,!1)};document.addEventListener("mousemove",p,!1),document.addEventListener("mouseup",h,!1)};return(0,o.N)(()=>{_(t,({width:e},r)=>{r===t&&ia(e)})}),(0,o.r)(()=>{let r=t.parentElement?.parentElement?.parentElement;if(!r)return;let n=e.localStore.position||p,i=(0,o.G)("padding",n),l="left"===e.localStore.position||"right"===e.localStore.position,a=(({padding:e,paddingTop:t,paddingBottom:r,paddingLeft:n,paddingRight:o})=>({padding:e,paddingTop:t,paddingBottom:r,paddingLeft:n,paddingRight:o}))(r.style);r.style[i]=`${l?e.localStore.width:e.localStore.height}px`,(0,o.M)(()=>{Object.entries(a).forEach(([e,t])=>{r.style[e]=t})})}),(()=>{var l=oT(),a=l.firstChild,u=a.nextSibling,c=t;return"function"==typeof c?(0,o._)(c,l):t=l,a.$$mousedown=d,u.$$click=()=>e.setLocalStore("open","false"),(0,o.H)(u,(0,o.o)(nN,{})),(0,o.H)(l,(0,o.o)(ih,e),null),(0,o.t)(t=>{var d=V(i().panel,i()[`panel-position-${s()}`],(()=>{let{colors:e}=nx,t=(e,t)=>"dark"===r()?t:e;return 796>il()?n`
        flex-direction: column;
        background-color: ${t(e.gray[300],e.gray[600])};
      `:n`
      flex-direction: row;
      background-color: ${t(e.gray[200],e.darkGray[900])};
    `})(),{[n`
            min-width: min-content;
          `]:700>il()&&("right"===s()||"left"===s())},"tsqd-main-panel"),c="bottom"===s()||"top"===s()?`${e.localStore.height||500}px`:"auto",g="right"===s()||"left"===s()?`${e.localStore.width||500}px`:"auto",f=V(i().dragHandle,i()[`dragHandle-position-${s()}`],"tsqd-drag-handle"),p=V(i().closeBtn,i()[`closeBtn-position-${s()}`],"tsqd-minimize-btn");return d!==t.e&&(0,o.l)(l,t.e=d),c!==t.t&&(null!=(t.t=c)?l.style.setProperty("height",c):l.style.removeProperty("height")),g!==t.a&&(null!=(t.a=g)?l.style.setProperty("width",g):l.style.removeProperty("width")),f!==t.o&&(0,o.l)(a,t.o=f),p!==t.i&&(0,o.l)(u,t.i=p),t},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),l})()},ih=e=>{let t;iS(),iM();let r=S(),n=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,i=(0,o.s)(()=>"dark"===r()?iA(n):iL(n)),l=k(),[a,s]=(0,o.v)("queries"),d=(0,o.s)(()=>e.localStore.sort||y),u=(0,o.s)(()=>Number(e.localStore.sortOrder)||1),c=(0,o.s)(()=>e.localStore.mutationSort||v),g=(0,o.s)(()=>Number(e.localStore.mutationSortOrder)||1),f=(0,o.s)(()=>o.R[d()]),p=(0,o.s)(()=>o.L[c()]),h=(0,o.s)(()=>m().onlineManager),b=(0,o.s)(()=>m().client.getQueryCache()),x=(0,o.s)(()=>m().client.getMutationCache()),w=iC(e=>e().getAll().length,!1),$=(0,o.s)((0,o.O)(()=>[w(),e.localStore.filter,d(),u(),e.localStore.hideDisabledQueries],()=>{let t=b().getAll(),r=e.localStore.filter?t.filter(t=>E(t.queryHash,e.localStore.filter||"").passed):[...t];return"true"===e.localStore.hideDisabledQueries&&(r=r.filter(e=>!e.isDisabled())),f()?r.sort((e,t)=>f()(e,t)*u()):r})),C=iE(e=>e().getAll().length,!1),q=(0,o.s)((0,o.O)(()=>[C(),e.localStore.mutationFilter,c(),g()],()=>{let t=x().getAll(),r=e.localStore.mutationFilter?t.filter(t=>E(`${t.options.mutationKey?JSON.stringify(t.options.mutationKey)+" - ":""}${new Date(t.state.submittedAt).toLocaleString()}`,e.localStore.mutationFilter||"").passed):[...t];return p()?r.sort((e,t)=>p()(e,t)*g()):r})),M=t=>{e.setLocalStore("position",t)},T=e=>{let r=getComputedStyle(t).getPropertyValue("--tsqd-font-size");e.style.setProperty("--tsqd-font-size",r)};return[(()=>{var r=oY(),f=r.firstChild,p=f.firstChild,y=p.firstChild,v=y.firstChild,w=v.nextSibling,k=w.firstChild,S=f.nextSibling,C=S.firstChild,E=C.firstChild,F=E.firstChild,L=E.nextSibling,A=L.nextSibling,D=C.nextSibling,z=D.firstChild,O=z.nextSibling,I=t;return"function"==typeof I?(0,o._)(I,r):t=r,y.$$click=()=>{if(!l().pipWindow&&!e.showPanelViewOnly)return void e.setLocalStore("open","false");e.onClose&&e.onClose()},(0,o.H)(w,()=>m().queryFlavor,k),(0,o.H)(w,()=>m().version,null),(0,o.H)(p,(0,o.o)(rg.Root,{get class(){return V(i().viewToggle)},get value(){return a()},onChange:e=>{s(e),ir(null),ii(null)},get children(){return[(0,o.o)(rg.Item,{value:"queries",class:"tsqd-radio-toggle",get children(){return[(0,o.o)(rg.ItemInput,{}),(0,o.o)(rg.ItemControl,{get children(){return(0,o.o)(rg.ItemIndicator,{})}}),(0,o.o)(rg.ItemLabel,{title:"Toggle Queries View",children:"Queries"})]}}),(0,o.o)(rg.Item,{value:"mutations",class:"tsqd-radio-toggle",get children(){return[(0,o.o)(rg.ItemInput,{}),(0,o.o)(rg.ItemControl,{get children(){return(0,o.o)(rg.ItemIndicator,{})}}),(0,o.o)(rg.ItemLabel,{title:"Toggle Mutations View",children:"Mutations"})]}})]}}),null),(0,o.H)(f,(0,o.o)(o.h,{get when(){return"queries"===a()},get children(){return(0,o.o)(ib,{})}}),null),(0,o.H)(f,(0,o.o)(o.h,{get when(){return"mutations"===a()},get children(){return(0,o.o)(im,{})}}),null),(0,o.H)(E,(0,o.o)(nG,{}),F),F.$$input=t=>{"queries"===a()?e.setLocalStore("filter",t.currentTarget.value):e.setLocalStore("mutationFilter",t.currentTarget.value)},(0,o.H)(L,(0,o.o)(o.h,{get when(){return"queries"===a()},get children(){var K=oF();return K.addEventListener("change",t=>{e.setLocalStore("sort",t.currentTarget.value)}),(0,o.H)(K,()=>Object.keys(o.R).map(e=>(()=>{var t=oJ();return t.firstChild,t.value=e,(0,o.H)(t,e,null),t})())),(0,o.t)(()=>K.value=d()),K}}),null),(0,o.H)(L,(0,o.o)(o.h,{get when(){return"mutations"===a()},get children(){var P=oL();return P.addEventListener("change",t=>{e.setLocalStore("mutationSort",t.currentTarget.value)}),(0,o.H)(P,()=>Object.keys(o.L).map(e=>(()=>{var t=oJ();return t.firstChild,t.value=e,(0,o.H)(t,e,null),t})())),(0,o.t)(()=>P.value=c()),P}}),null),(0,o.H)(L,(0,o.o)(nN,{}),null),A.$$click=()=>{"queries"===a()?e.setLocalStore("sortOrder",String(-1*u())):e.setLocalStore("mutationSortOrder",String(-1*g()))},(0,o.H)(A,(0,o.o)(o.h,{get when(){return("queries"===a()?u():g())===1},get children(){return[oA(),(0,o.o)(nj,{})]}}),null),(0,o.H)(A,(0,o.o)(o.h,{get when(){return("queries"===a()?u():g())===-1},get children(){return[oD(),(0,o.o)(n_,{})]}}),null),z.$$click=()=>{"queries"===a()?(iT({type:"CLEAR_QUERY_CACHE"}),b().clear()):(iT({type:"CLEAR_MUTATION_CACHE"}),x().clear())},(0,o.H)(z,(0,o.o)(nU,{})),O.$$click=()=>{h().setOnline(!h().isOnline())},(0,o.H)(O,(()=>{var e=(0,o.J)(()=>!!is());return()=>e()?(0,o.o)(n1,{}):(0,o.o)(n0,{})})()),(0,o.H)(D,(0,o.o)(o.h,{get when(){return(0,o.J)(()=>!l().pipWindow)()&&!l().disabled},get children(){var H=oz();return H.$$click=()=>{l().requestPipWindow(Number(window.innerWidth),Number(e.localStore.height??500))},(0,o.H)(H,(0,o.o)(n3,{})),(0,o.t)(()=>(0,o.l)(H,V(i().actionsBtn,"tsqd-actions-btn","tsqd-action-open-pip"))),H}}),null),(0,o.H)(D,(0,o.o)(ny.Root,{gutter:4,get children(){return[(0,o.o)(ny.Trigger,{get class(){return V(i().actionsBtn,"tsqd-actions-btn","tsqd-action-settings")},get children(){return(0,o.o)(n2,{})}}),(0,o.o)(ny.Portal,{ref:e=>T(e),get mount(){return(0,o.J)(()=>!!l().pipWindow)()?l().pipWindow.document.body:document.body},get children(){return(0,o.o)(ny.Content,{get class(){return V(i().settingsMenu,"tsqd-settings-menu")},get children(){return[(()=>{var e=oO();return(0,o.t)(()=>(0,o.l)(e,V(i().settingsMenuHeader,"tsqd-settings-menu-header"))),e})(),(0,o.o)(o.h,{get when(){return!e.showPanelViewOnly},get children(){return(0,o.o)(ny.Sub,{overlap:!0,gutter:8,shift:-4,get children(){return[(0,o.o)(ny.SubTrigger,{get class(){return V(i().settingsSubTrigger,"tsqd-settings-menu-sub-trigger","tsqd-settings-menu-sub-trigger-position")},get children(){return[oI(),(0,o.o)(nN,{})]}}),(0,o.o)(ny.Portal,{ref:e=>T(e),get mount(){return(0,o.J)(()=>!!l().pipWindow)()?l().pipWindow.document.body:document.body},get children(){return(0,o.o)(ny.SubContent,{get class(){return V(i().settingsMenu,"tsqd-settings-submenu")},get children(){return[(0,o.o)(ny.Item,{onSelect:()=>{M("top")},as:"button",get class(){return V(i().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-top")},get children(){return[oK(),(0,o.o)(nj,{})]}}),(0,o.o)(ny.Item,{onSelect:()=>{M("bottom")},as:"button",get class(){return V(i().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-bottom")},get children(){return[oP(),(0,o.o)(n_,{})]}}),(0,o.o)(ny.Item,{onSelect:()=>{M("left")},as:"button",get class(){return V(i().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-left")},get children(){return[oH(),(0,o.o)(nW,{})]}}),(0,o.o)(ny.Item,{onSelect:()=>{M("right")},as:"button",get class(){return V(i().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-right")},get children(){return[oV(),(0,o.o)(nY,{})]}})]}})}})]}})}}),(0,o.o)(ny.Sub,{overlap:!0,gutter:8,shift:-4,get children(){return[(0,o.o)(ny.SubTrigger,{get class(){return V(i().settingsSubTrigger,"tsqd-settings-menu-sub-trigger","tsqd-settings-menu-sub-trigger-position")},get children(){return[oR(),(0,o.o)(nN,{})]}}),(0,o.o)(ny.Portal,{ref:e=>T(e),get mount(){return(0,o.J)(()=>!!l().pipWindow)()?l().pipWindow.document.body:document.body},get children(){return(0,o.o)(ny.SubContent,{get class(){return V(i().settingsMenu,"tsqd-settings-submenu")},get children(){return[(0,o.o)(ny.Item,{onSelect:()=>{e.setLocalStore("theme_preference","light")},as:"button",get class(){return V(i().settingsSubButton,"light"===e.localStore.theme_preference&&i().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-top")},get children(){return[oB(),(0,o.o)(nJ,{})]}}),(0,o.o)(ny.Item,{onSelect:()=>{e.setLocalStore("theme_preference","dark")},as:"button",get class(){return V(i().settingsSubButton,"dark"===e.localStore.theme_preference&&i().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-bottom")},get children(){return[oQ(),(0,o.o)(nX,{})]}}),(0,o.o)(ny.Item,{onSelect:()=>{e.setLocalStore("theme_preference","system")},as:"button",get class(){return V(i().settingsSubButton,"system"===e.localStore.theme_preference&&i().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-left")},get children(){return[oG(),(0,o.o)(nZ,{})]}})]}})}})]}}),(0,o.o)(ny.Sub,{overlap:!0,gutter:8,shift:-4,get children(){return[(0,o.o)(ny.SubTrigger,{get class(){return V(i().settingsSubTrigger,"tsqd-settings-menu-sub-trigger","tsqd-settings-menu-sub-trigger-disabled-queries")},get children(){return[oU(),(0,o.o)(nN,{})]}}),(0,o.o)(ny.Portal,{ref:e=>T(e),get mount(){return(0,o.J)(()=>!!l().pipWindow)()?l().pipWindow.document.body:document.body},get children(){return(0,o.o)(ny.SubContent,{get class(){return V(i().settingsMenu,"tsqd-settings-submenu")},get children(){return[(0,o.o)(ny.Item,{onSelect:()=>{e.setLocalStore("hideDisabledQueries","false")},as:"button",get class(){return V(i().settingsSubButton,"true"!==e.localStore.hideDisabledQueries&&i().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-show")},get children(){return[oN(),(0,o.o)(o.h,{get when(){return"true"!==e.localStore.hideDisabledQueries},get children(){return(0,o.o)(oe,{})}})]}}),(0,o.o)(ny.Item,{onSelect:()=>{e.setLocalStore("hideDisabledQueries","true")},as:"button",get class(){return V(i().settingsSubButton,"true"===e.localStore.hideDisabledQueries&&i().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-hide")},get children(){return[oj(),(0,o.o)(o.h,{get when(){return"true"===e.localStore.hideDisabledQueries},get children(){return(0,o.o)(oe,{})}})]}})]}})}})]}})]}})}})]}}),null),(0,o.H)(r,(0,o.o)(o.h,{get when(){return"queries"===a()},get children(){var R=o_(),B=R.firstChild;return(0,o.H)(B,(0,o.o)(j,{by:e=>e.queryHash,get each(){return $()},children:e=>(0,o.o)(iy,{get query(){return e()}})})),(0,o.t)(()=>(0,o.l)(R,V(i().overflowQueryContainer,"tsqd-queries-overflow-container"))),R}}),null),(0,o.H)(r,(0,o.o)(o.h,{get when(){return"mutations"===a()},get children(){var Q=oW(),G=Q.firstChild;return(0,o.H)(G,(0,o.o)(j,{by:e=>e.mutationId,get each(){return q()},children:e=>(0,o.o)(iv,{get mutation(){return e()}})})),(0,o.t)(()=>(0,o.l)(Q,V(i().overflowQueryContainer,"tsqd-mutations-overflow-container"))),Q}}),null),(0,o.t)(e=>{var t=V(i().queriesContainer,796>il()&&(it()||io())&&n`
              height: 50%;
              max-height: 50%;
            `,796>il()&&!(it()||io())&&n`
              height: 100%;
              max-height: 100%;
            `,"tsqd-queries-container"),l=V(i().row,"tsqd-header"),s=i().logoAndToggleContainer,d=V(i().logo,"tsqd-text-logo-container"),c=V(i().tanstackLogo,"tsqd-text-logo-tanstack"),h=V(i().queryFlavorLogo,"tsqd-text-logo-query-flavor"),b=V(i().row,"tsqd-filters-actions-container"),m=V(i().filtersContainer,"tsqd-filters-container"),x=V(i().filterInput,"tsqd-query-filter-textfield-container"),k=V("tsqd-query-filter-textfield"),$=V(i().filterSelect,"tsqd-query-filter-sort-container"),q=`Sort order ${("queries"===a()?u():g())===-1?"descending":"ascending"}`,M=("queries"===a()?u():g())===-1,T=V(i().actionsContainer,"tsqd-actions-container"),I=V(i().actionsBtn,"tsqd-actions-btn","tsqd-action-clear-cache"),K=`Clear ${a()} cache`,P=V(i().actionsBtn,is()&&i().actionsBtnOffline,"tsqd-actions-btn","tsqd-action-mock-offline-behavior"),H=`${is()?"Unset offline mocking behavior":"Mock offline behavior"}`,R=is(),B=`${is()?"Unset offline mocking behavior":"Mock offline behavior"}`;return t!==e.e&&(0,o.l)(r,e.e=t),l!==e.t&&(0,o.l)(f,e.t=l),s!==e.a&&(0,o.l)(p,e.a=s),d!==e.o&&(0,o.l)(y,e.o=d),c!==e.i&&(0,o.l)(v,e.i=c),h!==e.n&&(0,o.l)(w,e.n=h),b!==e.s&&(0,o.l)(S,e.s=b),m!==e.h&&(0,o.l)(C,e.h=m),x!==e.r&&(0,o.l)(E,e.r=x),k!==e.d&&(0,o.l)(F,e.d=k),$!==e.l&&(0,o.l)(L,e.l=$),q!==e.u&&(0,o.Q)(A,"aria-label",e.u=q),M!==e.c&&(0,o.Q)(A,"aria-pressed",e.c=M),T!==e.w&&(0,o.l)(D,e.w=T),I!==e.m&&(0,o.l)(z,e.m=I),K!==e.f&&(0,o.Q)(z,"title",e.f=K),P!==e.y&&(0,o.l)(O,e.y=P),H!==e.g&&(0,o.Q)(O,"aria-label",e.g=H),R!==e.p&&(0,o.Q)(O,"aria-pressed",e.p=R),B!==e.b&&(0,o.Q)(O,"title",e.b=B),e},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0,c:void 0,w:void 0,m:void 0,f:void 0,y:void 0,g:void 0,p:void 0,b:void 0}),(0,o.t)(()=>F.value="queries"===a()?e.localStore.filter||"":e.localStore.mutationFilter||""),r})(),(0,o.o)(o.h,{get when(){return(0,o.J)(()=>"queries"===a())()&&it()},get children(){return(0,o.o)(iw,{})}}),(0,o.o)(o.h,{get when(){return(0,o.J)(()=>"mutations"===a())()&&io()},get children(){return(0,o.o)(ik,{})}})]},iy=e=>{let t=S(),r=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,n=(0,o.s)(()=>"dark"===t()?iA(r):iL(r)),{colors:i,alpha:l}=nx,a=(e,r)=>"dark"===t()?r:e,s=iC(t=>t().find({queryKey:e.query.queryKey})?.state,!0,t=>t.query.queryHash===e.query.queryHash),d=iC(t=>t().find({queryKey:e.query.queryKey})?.isDisabled()??!1,!0,t=>t.query.queryHash===e.query.queryHash),u=iC(t=>t().find({queryKey:e.query.queryKey})?.isStatic()??!1,!0,t=>t.query.queryHash===e.query.queryHash),c=iC(t=>t().find({queryKey:e.query.queryKey})?.isStale()??!1,!0,t=>t.query.queryHash===e.query.queryHash),g=iC(t=>t().find({queryKey:e.query.queryKey})?.getObserversCount()??0,!0,t=>t.query.queryHash===e.query.queryHash),f=(0,o.s)(()=>(0,o.E)({queryState:s(),observerCount:g(),isStale:c()}));return(0,o.o)(o.h,{get when(){return s()},get children(){var p=o0(),h=p.firstChild,y=h.nextSibling;return p.$$click=()=>ir(e.query.queryHash===it()?null:e.query.queryHash),(0,o.H)(h,g),(0,o.H)(y,()=>e.query.queryHash),(0,o.H)(p,(0,o.o)(o.h,{get when(){return d()},get children(){return oX()}}),null),(0,o.H)(p,(0,o.o)(o.h,{get when(){return u()},get children(){return oZ()}}),null),(0,o.t)(t=>{var s=V(n().queryRow,it()===e.query.queryHash&&n().selectedQueryRow,"tsqd-query-row"),d=`Query key ${e.query.queryHash}`,u=V("gray"===f()?r`
        background-color: ${a(i[f()][200],i[f()][700])};
        color: ${a(i[f()][700],i[f()][300])};
      `:r`
      background-color: ${a(i[f()][200]+l[80],i[f()][900])};
      color: ${a(i[f()][800],i[f()][300])};
    `,"tsqd-query-observer-count");return s!==t.e&&(0,o.l)(p,t.e=s),d!==t.t&&(0,o.Q)(p,"aria-label",t.t=d),u!==t.a&&(0,o.l)(h,t.a=u),t},{e:void 0,t:void 0,a:void 0}),p}})},iv=e=>{let t=S(),r=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,n=(0,o.s)(()=>"dark"===t()?iA(r):iL(r)),{colors:i,alpha:l}=nx,a=(e,r)=>"dark"===t()?r:e,s=iE(t=>{let r=t().getAll().find(t=>t.mutationId===e.mutation.mutationId);return r?.state}),d=iE(t=>{let r=t().getAll().find(t=>t.mutationId===e.mutation.mutationId);return!!r&&r.state.isPaused}),u=iE(t=>{let r=t().getAll().find(t=>t.mutationId===e.mutation.mutationId);return r?r.state.status:"idle"}),c=(0,o.s)(()=>(0,o.A)({isPaused:d(),status:u()}));return(0,o.o)(o.h,{get when(){return s()},get children(){var g=o0(),f=g.firstChild,p=f.nextSibling;return g.$$click=()=>{ii(e.mutation.mutationId===io()?null:e.mutation.mutationId)},(0,o.H)(f,(0,o.o)(o.h,{get when(){return"purple"===c()},get children(){return(0,o.o)(on,{})}}),null),(0,o.H)(f,(0,o.o)(o.h,{get when(){return"green"===c()},get children(){return(0,o.o)(oe,{})}}),null),(0,o.H)(f,(0,o.o)(o.h,{get when(){return"red"===c()},get children(){return(0,o.o)(or,{})}}),null),(0,o.H)(f,(0,o.o)(o.h,{get when(){return"yellow"===c()},get children(){return(0,o.o)(ot,{})}}),null),(0,o.H)(p,(0,o.o)(o.h,{get when(){return e.mutation.options.mutationKey},get children(){return[(0,o.J)(()=>JSON.stringify(e.mutation.options.mutationKey))," -"," "]}}),null),(0,o.H)(p,()=>new Date(e.mutation.state.submittedAt).toLocaleString(),null),(0,o.t)(t=>{var s=V(n().queryRow,io()===e.mutation.mutationId&&n().selectedQueryRow,"tsqd-query-row"),d=`Mutation submitted at ${new Date(e.mutation.state.submittedAt).toLocaleString()}`,u=V("gray"===c()?r`
        background-color: ${a(i[c()][200],i[c()][700])};
        color: ${a(i[c()][700],i[c()][300])};
      `:r`
      background-color: ${a(i[c()][200]+l[80],i[c()][900])};
      color: ${a(i[c()][800],i[c()][300])};
    `,"tsqd-query-observer-count");return s!==t.e&&(0,o.l)(g,t.e=s),d!==t.t&&(0,o.Q)(g,"aria-label",t.t=d),u!==t.a&&(0,o.l)(f,t.a=u),t},{e:void 0,t:void 0,a:void 0}),g}})},ib=()=>{let e=iC(e=>e().getAll().filter(e=>"stale"===(0,o.F)(e)).length),t=iC(e=>e().getAll().filter(e=>"fresh"===(0,o.F)(e)).length),r=iC(e=>e().getAll().filter(e=>"fetching"===(0,o.F)(e)).length),n=iC(e=>e().getAll().filter(e=>"paused"===(0,o.F)(e)).length),i=iC(e=>e().getAll().filter(e=>"inactive"===(0,o.F)(e)).length),l=S(),a=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,s=(0,o.s)(()=>"dark"===l()?iA(a):iL(a));return(()=>{var l=oE();return(0,o.H)(l,(0,o.o)(ix,{label:"Fresh",color:"green",get count(){return t()}}),null),(0,o.H)(l,(0,o.o)(ix,{label:"Fetching",color:"blue",get count(){return r()}}),null),(0,o.H)(l,(0,o.o)(ix,{label:"Paused",color:"purple",get count(){return n()}}),null),(0,o.H)(l,(0,o.o)(ix,{label:"Stale",color:"yellow",get count(){return e()}}),null),(0,o.H)(l,(0,o.o)(ix,{label:"Inactive",color:"gray",get count(){return i()}}),null),(0,o.t)(()=>(0,o.l)(l,V(s().queryStatusContainer,"tsqd-query-status-container"))),l})()},im=()=>{let e=iE(e=>e().getAll().filter(e=>"green"===(0,o.A)({isPaused:e.state.isPaused,status:e.state.status})).length),t=iE(e=>e().getAll().filter(e=>"yellow"===(0,o.A)({isPaused:e.state.isPaused,status:e.state.status})).length),r=iE(e=>e().getAll().filter(e=>"purple"===(0,o.A)({isPaused:e.state.isPaused,status:e.state.status})).length),n=iE(e=>e().getAll().filter(e=>"red"===(0,o.A)({isPaused:e.state.isPaused,status:e.state.status})).length),i=S(),l=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,a=(0,o.s)(()=>"dark"===i()?iA(l):iL(l));return(()=>{var i=oE();return(0,o.H)(i,(0,o.o)(ix,{label:"Paused",color:"purple",get count(){return r()}}),null),(0,o.H)(i,(0,o.o)(ix,{label:"Pending",color:"yellow",get count(){return t()}}),null),(0,o.H)(i,(0,o.o)(ix,{label:"Success",color:"green",get count(){return e()}}),null),(0,o.H)(i,(0,o.o)(ix,{label:"Error",color:"red",get count(){return n()}}),null),(0,o.t)(()=>(0,o.l)(i,V(a().queryStatusContainer,"tsqd-query-status-container"))),i})()},ix=e=>{let t,r=S(),n=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,i=(0,o.s)(()=>"dark"===r()?iA(n):iL(n)),{colors:l,alpha:a}=nx,s=(e,t)=>"dark"===r()?t:e,[d,u]=(0,o.v)(!1),[c,g]=(0,o.v)(!1),f=(0,o.s)(()=>!(it()&&1024>il()&&il()>796||796>il()));return(()=>{var r=o3(),p=r.firstChild,h=p.nextSibling,y=t;return"function"==typeof y?(0,o._)(y,r):t=r,r.addEventListener("mouseleave",()=>{u(!1),g(!1)}),r.addEventListener("mouseenter",()=>u(!0)),r.addEventListener("blur",()=>g(!1)),r.addEventListener("focus",()=>g(!0)),(0,o.T)(r,(0,o.K)({get disabled(){return f()},get class(){return V(i().queryStatusTag,!f()&&n`
            cursor: pointer;
            &:hover {
              background: ${s(l.gray[200],l.darkGray[400])}${a[80]};
            }
          `,"tsqd-query-status-tag",`tsqd-query-status-tag-${e.label.toLowerCase()}`)}},()=>d()||c()?{"aria-describedby":"tsqd-status-tooltip"}:{}),!1,!0),(0,o.H)(r,(0,o.o)(o.h,{get when(){return(0,o.J)(()=>!f())()&&(d()||c())},get children(){var v=o1();return(0,o.H)(v,()=>e.label),(0,o.t)(()=>(0,o.l)(v,V(i().statusTooltip,"tsqd-query-status-tooltip"))),v}}),p),(0,o.H)(r,(0,o.o)(o.h,{get when(){return f()},get children(){var b=o2();return(0,o.H)(b,()=>e.label),(0,o.t)(()=>(0,o.l)(b,V(i().queryStatusTagLabel,"tsqd-query-status-tag-label"))),b}}),h),(0,o.H)(h,()=>e.count),(0,o.t)(t=>{var r=V(n`
            width: ${nx.size[1.5]};
            height: ${nx.size[1.5]};
            border-radius: ${nx.border.radius.full};
            background-color: ${nx.colors[e.color][500]};
          `,"tsqd-query-status-tag-dot"),a=V(i().queryStatusCount,e.count>0&&"gray"!==e.color&&n`
              background-color: ${s(l[e.color][100],l[e.color][900])};
              color: ${s(l[e.color][700],l[e.color][300])};
            `,"tsqd-query-status-tag-count");return r!==t.e&&(0,o.l)(p,t.e=r),a!==t.t&&(0,o.l)(h,t.t=a),t},{e:void 0,t:void 0}),r})()},iw=()=>{let e=S(),t=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,r=(0,o.s)(()=>"dark"===e()?iA(t):iL(t)),{colors:n}=nx,i=(t,r)=>"dark"===e()?r:t,l=m().client,[a,s]=(0,o.v)(!1),[d,u]=(0,o.v)("view"),[c,g]=(0,o.v)(!1),f=(0,o.s)(()=>m().errorTypes||[]),p=iC(e=>e().getAll().find(e=>e.queryHash===it()),!1),h=iC(e=>e().getAll().find(e=>e.queryHash===it()),!1),y=iC(e=>e().getAll().find(e=>e.queryHash===it())?.state,!1),v=iC(e=>e().getAll().find(e=>e.queryHash===it())?.state.data,!1),b=iC(e=>{let t=e().getAll().find(e=>e.queryHash===it());return t?(0,o.F)(t):"inactive"}),x=iC(e=>{let t=e().getAll().find(e=>e.queryHash===it());return t?t.state.status:"pending"}),w=iC(e=>e().getAll().find(e=>e.queryHash===it())?.getObserversCount()??0),k=(0,o.s)(()=>(0,o.D)(b())),$=()=>{iT({type:"REFETCH",queryHash:p()?.queryHash});let e=p()?.fetch();e?.catch(()=>{})},C=e=>{let t=p();if(!t)return;iT({type:"TRIGGER_ERROR",queryHash:t.queryHash,metadata:{error:e?.name}});let r=e?.initializer(t)??Error("Unknown error from devtools"),n=t.options;t.setState({status:"error",error:r,fetchMeta:{...t.state.fetchMeta,__previousQueryOptions:n}})};return(0,o.r)(()=>{"fetching"!==b()&&s(!1)}),(0,o.o)(o.h,{get when(){return(0,o.J)(()=>!!p())()&&y()},get children(){var q=o8(),M=q.firstChild,E=M.nextSibling,T=E.firstChild,F=T.firstChild,L=F.firstChild,A=F.nextSibling,D=T.nextSibling,z=D.firstChild.nextSibling,O=D.nextSibling.firstChild.nextSibling,I=E.nextSibling,K=I.nextSibling,P=K.firstChild,R=P.firstChild,B=P.nextSibling,Q=B.firstChild,G=B.nextSibling,U=G.firstChild,N=G.nextSibling,j=N.firstChild,_=N.nextSibling,W=_.firstChild,Y=W.nextSibling,J=K.nextSibling;J.firstChild;var X=J.nextSibling,Z=X.nextSibling;return(0,o.H)(L,()=>(0,o.z)(p().queryKey,!0)),(0,o.H)(A,b),(0,o.H)(z,w),(0,o.H)(O,()=>new Date(y().dataUpdatedAt).toLocaleTimeString()),P.$$click=$,B.$$click=()=>{iT({type:"INVALIDATE",queryHash:p()?.queryHash}),l.invalidateQueries(p())},G.$$click=()=>{iT({type:"RESET",queryHash:p()?.queryHash}),l.resetQueries(p())},N.$$click=()=>{iT({type:"REMOVE",queryHash:p()?.queryHash}),l.removeQueries(p()),ir(null)},_.$$click=()=>{if(p()?.state.data===void 0)s(!0),(()=>{let e=p();if(!e)return;iT({type:"RESTORE_LOADING",queryHash:e.queryHash});let t=e.state,r=e.state.fetchMeta?e.state.fetchMeta.__previousQueryOptions:null;e.cancel({silent:!0}),e.setState({...t,fetchStatus:"idle",fetchMeta:null}),r&&e.fetch(r)})();else{let e=p();if(!e)return;iT({type:"TRIGGER_LOADING",queryHash:e.queryHash});let t=e.options;e.fetch({...t,queryFn:()=>new Promise(()=>{}),gcTime:-1}),e.setState({data:void 0,status:"pending",fetchMeta:{...e.state.fetchMeta,__previousQueryOptions:t}})}},(0,o.H)(_,()=>"pending"===x()?"Restore":"Trigger",Y),(0,o.H)(K,(0,o.o)(o.h,{get when(){return 0===f().length||"error"===x()},get children(){var ee=o5(),et=ee.firstChild,er=et.nextSibling;return ee.$$click=()=>{p().state.error?(iT({type:"RESTORE_ERROR",queryHash:p()?.queryHash}),l.resetQueries(p())):C()},(0,o.H)(ee,()=>"error"===x()?"Restore":"Trigger",er),(0,o.t)(e=>{var r=V(t`
                  color: ${i(n.red[500],n.red[400])};
                `,"tsqd-query-details-actions-btn","tsqd-query-details-action-error"),l="pending"===x(),a=t`
                  background-color: ${i(n.red[500],n.red[400])};
                `;return r!==e.e&&(0,o.l)(ee,e.e=r),l!==e.t&&(ee.disabled=e.t=l),a!==e.a&&(0,o.l)(et,e.a=a),e},{e:void 0,t:void 0,a:void 0}),ee}}),null),(0,o.H)(K,(0,o.o)(o.h,{get when(){return 0!==f().length&&"error"!==x()},get children(){var en=o4(),eo=en.firstChild,ei=eo.nextSibling.nextSibling;return ei.firstChild,ei.addEventListener("change",e=>{C(f().find(t=>t.name===e.currentTarget.value))}),(0,o.H)(ei,(0,o.o)(o.d,{get each(){return f()},children:e=>(()=>{var t=o7();return(0,o.H)(t,()=>e.name),(0,o.t)(()=>t.value=e.name),t})()}),null),(0,o.H)(en,(0,o.o)(nN,{}),null),(0,o.t)(e=>{var n=V(r().actionsSelect,"tsqd-query-details-actions-btn","tsqd-query-details-action-error-multiple"),i=t`
                  background-color: ${nx.colors.red[400]};
                `,l="pending"===x();return n!==e.e&&(0,o.l)(en,e.e=n),i!==e.t&&(0,o.l)(eo,e.t=i),l!==e.a&&(ei.disabled=e.a=l),e},{e:void 0,t:void 0,a:void 0}),en}}),null),(0,o.H)(J,()=>"view"===d()?"Explorer":"Editor",null),(0,o.H)(q,(0,o.o)(o.h,{get when(){return"view"===d()},get children(){var el=o6();return(0,o.H)(el,(0,o.o)(o$,{label:"Data",defaultExpanded:["Data"],get value(){return v()},editable:!0,onEdit:()=>u("edit"),get activeQuery(){return p()}})),(0,o.t)(e=>null!=(e=nx.size[2])?el.style.setProperty("padding",e):el.style.removeProperty("padding")),el}}),X),(0,o.H)(q,(0,o.o)(o.h,{get when(){return"edit"===d()},get children(){var ea=o9(),es=ea.firstChild,ed=es.nextSibling,eu=ed.firstChild,ec=eu.nextSibling,eg=ec.firstChild,ef=eg.nextSibling;return ea.addEventListener("submit",e=>{e.preventDefault();let t=new FormData(e.currentTarget).get("data");try{let e=JSON.parse(t);p().setState({...p().state,data:e}),u("view")}catch(e){g(!0)}}),es.addEventListener("focus",()=>g(!1)),(0,o.H)(eu,()=>c()?"Invalid Value":""),eg.$$click=()=>u("view"),(0,o.t)(e=>{var l=V(r().devtoolsEditForm,"tsqd-query-details-data-editor"),a=r().devtoolsEditTextarea,s=c(),d=r().devtoolsEditFormActions,u=r().devtoolsEditFormError,g=r().devtoolsEditFormActionContainer,f=V(r().devtoolsEditFormAction,t`
                      color: ${i(n.gray[600],n.gray[300])};
                    `),p=V(r().devtoolsEditFormAction,t`
                      color: ${i(n.blue[600],n.blue[400])};
                    `);return l!==e.e&&(0,o.l)(ea,e.e=l),a!==e.t&&(0,o.l)(es,e.t=a),s!==e.a&&(0,o.Q)(es,"data-error",e.a=s),d!==e.o&&(0,o.l)(ed,e.o=d),u!==e.i&&(0,o.l)(eu,e.i=u),g!==e.n&&(0,o.l)(ec,e.n=g),f!==e.s&&(0,o.l)(eg,e.s=f),p!==e.h&&(0,o.l)(ef,e.h=p),e},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0}),(0,o.t)(()=>es.value=JSON.stringify(v(),null,2)),ea}}),X),(0,o.H)(Z,(0,o.o)(o$,{label:"Query",defaultExpanded:["Query","queryKey"],get value(){return h()}})),(0,o.t)(e=>{var l=V(r().detailsContainer,"tsqd-query-details-container"),s=V(r().detailsHeader,"tsqd-query-details-header"),d=V(r().detailsBody,"tsqd-query-details-summary-container"),u=V(r().queryDetailsStatus,"gray"===k()?t`
        background-color: ${i(n[k()][200],n[k()][700])};
        color: ${i(n[k()][700],n[k()][300])};
        border-color: ${i(n[k()][400],n[k()][600])};
      `:t`
      background-color: ${i(n[k()][100],n[k()][900])};
      color: ${i(n[k()][700],n[k()][300])};
      border-color: ${i(n[k()][400],n[k()][600])};
    `),c=V(r().detailsHeader,"tsqd-query-details-header"),g=V(r().actionsBody,"tsqd-query-details-actions-container"),f=V(t`
                color: ${i(n.blue[600],n.blue[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-refetch"),p="fetching"===b(),h=t`
                background-color: ${i(n.blue[600],n.blue[400])};
              `,y=V(t`
                color: ${i(n.yellow[600],n.yellow[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-invalidate"),v="pending"===x(),m=t`
                background-color: ${i(n.yellow[600],n.yellow[400])};
              `,w=V(t`
                color: ${i(n.gray[600],n.gray[300])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-reset"),$="pending"===x(),S=t`
                background-color: ${i(n.gray[600],n.gray[400])};
              `,C=V(t`
                color: ${i(n.pink[500],n.pink[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-remove"),T="fetching"===b(),F=t`
                background-color: ${i(n.pink[500],n.pink[400])};
              `,L=V(t`
                color: ${i(n.cyan[500],n.cyan[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-loading"),D=a(),z=t`
                background-color: ${i(n.cyan[500],n.cyan[400])};
              `,O=V(r().detailsHeader,"tsqd-query-details-header"),H=V(r().detailsHeader,"tsqd-query-details-header"),Y=nx.size[2];return l!==e.e&&(0,o.l)(q,e.e=l),s!==e.t&&(0,o.l)(M,e.t=s),d!==e.a&&(0,o.l)(E,e.a=d),u!==e.o&&(0,o.l)(A,e.o=u),c!==e.i&&(0,o.l)(I,e.i=c),g!==e.n&&(0,o.l)(K,e.n=g),f!==e.s&&(0,o.l)(P,e.s=f),p!==e.h&&(P.disabled=e.h=p),h!==e.r&&(0,o.l)(R,e.r=h),y!==e.d&&(0,o.l)(B,e.d=y),v!==e.l&&(B.disabled=e.l=v),m!==e.u&&(0,o.l)(Q,e.u=m),w!==e.c&&(0,o.l)(G,e.c=w),$!==e.w&&(G.disabled=e.w=$),S!==e.m&&(0,o.l)(U,e.m=S),C!==e.f&&(0,o.l)(N,e.f=C),T!==e.y&&(N.disabled=e.y=T),F!==e.g&&(0,o.l)(j,e.g=F),L!==e.p&&(0,o.l)(_,e.p=L),D!==e.b&&(_.disabled=e.b=D),z!==e.T&&(0,o.l)(W,e.T=z),O!==e.A&&(0,o.l)(J,e.A=O),H!==e.O&&(0,o.l)(X,e.O=H),Y!==e.I&&(null!=(e.I=Y)?Z.style.setProperty("padding",Y):Z.style.removeProperty("padding")),e},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0,c:void 0,w:void 0,m:void 0,f:void 0,y:void 0,g:void 0,p:void 0,b:void 0,T:void 0,A:void 0,O:void 0,I:void 0}),q}})},ik=()=>{let e=S(),t=m().shadowDOMTarget?H.bind({target:m().shadowDOMTarget}):H,r=(0,o.s)(()=>"dark"===e()?iA(t):iL(t)),{colors:n}=nx,i=(t,r)=>"dark"===e()?r:t,l=iE(e=>{let t=e().getAll().find(e=>e.mutationId===io());return!!t&&t.state.isPaused}),a=iE(e=>{let t=e().getAll().find(e=>e.mutationId===io());return t?t.state.status:"idle"}),s=(0,o.s)(()=>(0,o.A)({isPaused:l(),status:a()})),d=iE(e=>e().getAll().find(e=>e.mutationId===io()),!1);return(0,o.o)(o.h,{get when(){return d()},get children(){var u=ie(),c=u.firstChild,g=c.nextSibling,f=g.firstChild,p=f.firstChild,h=p.firstChild,y=p.nextSibling,v=f.nextSibling.firstChild.nextSibling,b=g.nextSibling,x=b.nextSibling,w=x.nextSibling,k=w.nextSibling,$=k.nextSibling,C=$.nextSibling,q=C.nextSibling,M=q.nextSibling;return(0,o.H)(h,(0,o.o)(o.h,{get when(){return d().options.mutationKey},fallback:"No mutationKey found",get children(){return(0,o.z)(d().options.mutationKey,!0)}})),(0,o.H)(y,(0,o.o)(o.h,{get when(){return"purple"===s()},children:"pending"}),null),(0,o.H)(y,(0,o.o)(o.h,{get when(){return"purple"!==s()},get children(){return a()}}),null),(0,o.H)(v,()=>new Date(d().state.submittedAt).toLocaleTimeString()),(0,o.H)(x,(0,o.o)(o$,{label:"Variables",defaultExpanded:["Variables"],get value(){return d().state.variables}})),(0,o.H)(k,(0,o.o)(o$,{label:"Context",defaultExpanded:["Context"],get value(){return d().state.context}})),(0,o.H)(C,(0,o.o)(o$,{label:"Data",defaultExpanded:["Data"],get value(){return d().state.data}})),(0,o.H)(M,(0,o.o)(o$,{label:"Mutation",defaultExpanded:["Mutation"],get value(){return d()}})),(0,o.t)(e=>{var l=V(r().detailsContainer,"tsqd-query-details-container"),a=V(r().detailsHeader,"tsqd-query-details-header"),d=V(r().detailsBody,"tsqd-query-details-summary-container"),f=V(r().queryDetailsStatus,"gray"===s()?t`
        background-color: ${i(n[s()][200],n[s()][700])};
        color: ${i(n[s()][700],n[s()][300])};
        border-color: ${i(n[s()][400],n[s()][600])};
      `:t`
      background-color: ${i(n[s()][100],n[s()][900])};
      color: ${i(n[s()][700],n[s()][300])};
      border-color: ${i(n[s()][400],n[s()][600])};
    `),p=V(r().detailsHeader,"tsqd-query-details-header"),h=nx.size[2],v=V(r().detailsHeader,"tsqd-query-details-header"),m=nx.size[2],S=V(r().detailsHeader,"tsqd-query-details-header"),E=nx.size[2],T=V(r().detailsHeader,"tsqd-query-details-header"),F=nx.size[2];return l!==e.e&&(0,o.l)(u,e.e=l),a!==e.t&&(0,o.l)(c,e.t=a),d!==e.a&&(0,o.l)(g,e.a=d),f!==e.o&&(0,o.l)(y,e.o=f),p!==e.i&&(0,o.l)(b,e.i=p),h!==e.n&&(null!=(e.n=h)?x.style.setProperty("padding",h):x.style.removeProperty("padding")),v!==e.s&&(0,o.l)(w,e.s=v),m!==e.h&&(null!=(e.h=m)?k.style.setProperty("padding",m):k.style.removeProperty("padding")),S!==e.r&&(0,o.l)($,e.r=S),E!==e.d&&(null!=(e.d=E)?C.style.setProperty("padding",E):C.style.removeProperty("padding")),T!==e.l&&(0,o.l)(q,e.l=T),F!==e.u&&(null!=(e.u=F)?M.style.setProperty("padding",F):M.style.removeProperty("padding")),e},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0}),u}})},i$=new Map,iS=()=>{let e=(0,o.s)(()=>m().client.getQueryCache()),t=e().subscribe(t=>{(0,o.k)(()=>{for(let[r,n]of i$.entries())n.shouldUpdate(t)&&n.setter(r(e))})});return(0,o.M)(()=>{i$.clear(),t()}),t},iC=(e,t=!0,r=()=>!0)=>{let n=(0,o.s)(()=>m().client.getQueryCache()),[i,l]=(0,o.v)(e(n),t?void 0:{equals:!1});return(0,o.r)(()=>{l(e(n))}),i$.set(e,{setter:l,shouldUpdate:r}),(0,o.M)(()=>{i$.delete(e)}),i},iq=new Map,iM=()=>{let e=(0,o.s)(()=>m().client.getMutationCache()),t=e().subscribe(()=>{for(let[t,r]of iq.entries())queueMicrotask(()=>{r(t(e))})});return(0,o.M)(()=>{iq.clear(),t()}),t},iE=(e,t=!0)=>{let r=(0,o.s)(()=>m().client.getMutationCache()),[n,i]=(0,o.v)(e(r),t?void 0:{equals:!1});return(0,o.r)(()=>{i(e(r))}),iq.set(e,i),(0,o.M)(()=>{iq.delete(e)}),n},iT=({type:e,queryHash:t,metadata:r})=>{let n=new CustomEvent("@tanstack/query-devtools-event",{detail:{type:e,queryHash:t,metadata:r},bubbles:!0,cancelable:!0});window.dispatchEvent(n)},iF=(e,t)=>{let{colors:r,font:n,size:o,alpha:i,shadow:l,border:a}=nx,s=(t,r)=>"light"===e?t:r;return{devtoolsBtn:t`
      z-index: 100000;
      position: fixed;
      padding: 4px;
      text-align: left;

      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      box-shadow: ${l.md()};
      overflow: hidden;

      & div {
        position: absolute;
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        border-radius: 9999px;

        & svg {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        filter: blur(6px) saturate(1.2) contrast(1.1);
      }

      &:focus-within {
        outline-offset: 2px;
        outline: 3px solid ${r.green[600]};
      }

      & button {
        position: relative;
        z-index: 1;
        padding: 0;
        border-radius: 9999px;
        background-color: transparent;
        border: none;
        height: 40px;
        display: flex;
        width: 40px;
        overflow: hidden;
        cursor: pointer;
        outline: none;
        & svg {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      }
    `,panel:t`
      position: fixed;
      z-index: 9999;
      display: flex;
      gap: ${nx.size[.5]};
      & * {
        box-sizing: border-box;
        text-transform: none;
      }

      & *::-webkit-scrollbar {
        width: 7px;
      }

      & *::-webkit-scrollbar-track {
        background: transparent;
      }

      & *::-webkit-scrollbar-thumb {
        background: ${s(r.gray[300],r.darkGray[200])};
      }

      & *::-webkit-scrollbar-thumb:hover {
        background: ${s(r.gray[400],r.darkGray[300])};
      }
    `,parentPanel:t`
      z-index: 9999;
      display: flex;
      height: 100%;
      gap: ${nx.size[.5]};
      & * {
        box-sizing: border-box;
        text-transform: none;
      }

      & *::-webkit-scrollbar {
        width: 7px;
      }

      & *::-webkit-scrollbar-track {
        background: transparent;
      }

      & *::-webkit-scrollbar-thumb {
        background: ${s(r.gray[300],r.darkGray[200])};
      }

      & *::-webkit-scrollbar-thumb:hover {
        background: ${s(r.gray[400],r.darkGray[300])};
      }
    `,"devtoolsBtn-position-bottom-right":t`
      bottom: 12px;
      right: 12px;
    `,"devtoolsBtn-position-bottom-left":t`
      bottom: 12px;
      left: 12px;
    `,"devtoolsBtn-position-top-left":t`
      top: 12px;
      left: 12px;
    `,"devtoolsBtn-position-top-right":t`
      top: 12px;
      right: 12px;
    `,"devtoolsBtn-position-relative":t`
      position: relative;
    `,"panel-position-top":t`
      top: 0;
      right: 0;
      left: 0;
      max-height: 90%;
      min-height: ${o[14]};
      border-bottom: ${s(r.gray[400],r.darkGray[300])} 1px solid;
    `,"panel-position-bottom":t`
      bottom: 0;
      right: 0;
      left: 0;
      max-height: 90%;
      min-height: ${o[14]};
      border-top: ${s(r.gray[400],r.darkGray[300])} 1px solid;
    `,"panel-position-right":t`
      bottom: 0;
      right: 0;
      top: 0;
      border-left: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      max-width: 90%;
    `,"panel-position-left":t`
      bottom: 0;
      left: 0;
      top: 0;
      border-right: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      max-width: 90%;
    `,closeBtn:t`
      position: absolute;
      cursor: pointer;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      background-color: ${s(r.gray[50],r.darkGray[700])};
      &:hover {
        background-color: ${s(r.gray[200],r.darkGray[500])};
      }
      &:focus-visible {
        outline: 2px solid ${r.blue[600]};
      }
      & svg {
        color: ${s(r.gray[600],r.gray[400])};
        width: ${o[2]};
        height: ${o[2]};
      }
    `,"closeBtn-position-top":t`
      bottom: 0;
      right: ${o[2]};
      transform: translate(0, 100%);
      border-right: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-left: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-top: none;
      border-bottom: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-radius: 0px 0px ${a.radius.sm} ${a.radius.sm};
      padding: ${o[.5]} ${o[1.5]} ${o[1]} ${o[1.5]};

      &::after {
        content: ' ';
        position: absolute;
        bottom: 100%;
        left: -${o[2.5]};
        height: ${o[1.5]};
        width: calc(100% + ${o[5]});
      }

      & svg {
        transform: rotate(180deg);
      }
    `,"closeBtn-position-bottom":t`
      top: 0;
      right: ${o[2]};
      transform: translate(0, -100%);
      border-right: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-left: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-top: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-bottom: none;
      border-radius: ${a.radius.sm} ${a.radius.sm} 0px 0px;
      padding: ${o[1]} ${o[1.5]} ${o[.5]} ${o[1.5]};

      &::after {
        content: ' ';
        position: absolute;
        top: 100%;
        left: -${o[2.5]};
        height: ${o[1.5]};
        width: calc(100% + ${o[5]});
      }
    `,"closeBtn-position-right":t`
      bottom: ${o[2]};
      left: 0;
      transform: translate(-100%, 0);
      border-right: none;
      border-left: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-top: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-bottom: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-radius: ${a.radius.sm} 0px 0px ${a.radius.sm};
      padding: ${o[1.5]} ${o[.5]} ${o[1.5]} ${o[1]};

      &::after {
        content: ' ';
        position: absolute;
        left: 100%;
        height: calc(100% + ${o[5]});
        width: ${o[1.5]};
      }

      & svg {
        transform: rotate(-90deg);
      }
    `,"closeBtn-position-left":t`
      bottom: ${o[2]};
      right: 0;
      transform: translate(100%, 0);
      border-left: none;
      border-right: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-top: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-bottom: ${s(r.gray[400],r.darkGray[300])} 1px solid;
      border-radius: 0px ${a.radius.sm} ${a.radius.sm} 0px;
      padding: ${o[1.5]} ${o[1]} ${o[1.5]} ${o[.5]};

      &::after {
        content: ' ';
        position: absolute;
        right: 100%;
        height: calc(100% + ${o[5]});
        width: ${o[1.5]};
      }

      & svg {
        transform: rotate(90deg);
      }
    `,queriesContainer:t`
      flex: 1 1 700px;
      background-color: ${s(r.gray[50],r.darkGray[700])};
      display: flex;
      flex-direction: column;
      & * {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      }
    `,dragHandle:t`
      position: absolute;
      transition: background-color 0.125s ease;
      &:hover {
        background-color: ${r.purple[400]}${s("",i[90])};
      }
      z-index: 4;
    `,"dragHandle-position-top":t`
      bottom: 0;
      width: 100%;
      height: 3px;
      cursor: ns-resize;
    `,"dragHandle-position-bottom":t`
      top: 0;
      width: 100%;
      height: 3px;
      cursor: ns-resize;
    `,"dragHandle-position-right":t`
      left: 0;
      width: 3px;
      height: 100%;
      cursor: ew-resize;
    `,"dragHandle-position-left":t`
      right: 0;
      width: 3px;
      height: 100%;
      cursor: ew-resize;
    `,row:t`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${nx.size[2]} ${nx.size[2.5]};
      gap: ${nx.size[2.5]};
      border-bottom: ${s(r.gray[300],r.darkGray[500])} 1px solid;
      align-items: center;
      & > button {
        padding: 0;
        background: transparent;
        border: none;
        display: flex;
        gap: ${o[.5]};
        flex-direction: column;
      }
    `,logoAndToggleContainer:t`
      display: flex;
      gap: ${nx.size[3]};
      align-items: center;
    `,logo:t`
      cursor: pointer;
      display: flex;
      flex-direction: column;
      background-color: transparent;
      border: none;
      gap: ${nx.size[.5]};
      padding: 0px;
      &:hover {
        opacity: 0.7;
      }
      &:focus-visible {
        outline-offset: 4px;
        border-radius: ${a.radius.xs};
        outline: 2px solid ${r.blue[800]};
      }
    `,tanstackLogo:t`
      font-size: ${n.size.md};
      font-weight: ${n.weight.bold};
      line-height: ${n.lineHeight.xs};
      white-space: nowrap;
      color: ${s(r.gray[600],r.gray[300])};
    `,queryFlavorLogo:t`
      font-weight: ${n.weight.semibold};
      font-size: ${n.size.xs};
      background: linear-gradient(
        to right,
        ${s("#ea4037, #ff9b11","#dd524b, #e9a03b")}
      );
      background-clip: text;
      -webkit-background-clip: text;
      line-height: 1;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    `,queryStatusContainer:t`
      display: flex;
      gap: ${nx.size[2]};
      height: min-content;
    `,queryStatusTag:t`
      display: flex;
      gap: ${nx.size[1.5]};
      box-sizing: border-box;
      height: ${nx.size[6.5]};
      background: ${s(r.gray[50],r.darkGray[500])};
      color: ${s(r.gray[700],r.gray[300])};
      border-radius: ${nx.border.radius.sm};
      font-size: ${n.size.sm};
      padding: ${nx.size[1]};
      padding-left: ${nx.size[1.5]};
      align-items: center;
      font-weight: ${n.weight.medium};
      border: ${s("1px solid "+r.gray[300],"1px solid transparent")};
      user-select: none;
      position: relative;
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${r.blue[800]};
      }
    `,queryStatusTagLabel:t`
      font-size: ${n.size.xs};
    `,queryStatusCount:t`
      font-size: ${n.size.xs};
      padding: 0 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${s(r.gray[500],r.gray[400])};
      background-color: ${s(r.gray[200],r.darkGray[300])};
      border-radius: 2px;
      font-variant-numeric: tabular-nums;
      height: ${nx.size[4.5]};
    `,statusTooltip:t`
      position: absolute;
      z-index: 1;
      background-color: ${s(r.gray[50],r.darkGray[500])};
      top: 100%;
      left: 50%;
      transform: translate(-50%, calc(${nx.size[2]}));
      padding: ${nx.size[.5]} ${nx.size[2]};
      border-radius: ${nx.border.radius.sm};
      font-size: ${n.size.xs};
      border: 1px solid ${s(r.gray[400],r.gray[600])};
      color: ${s(r.gray[600],r.gray[300])};

      &::before {
        top: 0px;
        content: ' ';
        display: block;
        left: 50%;
        transform: translate(-50%, -100%);
        position: absolute;
        border-color: transparent transparent
          ${s(r.gray[400],r.gray[600])} transparent;
        border-style: solid;
        border-width: 7px;
        /* transform: rotate(180deg); */
      }

      &::after {
        top: 0px;
        content: ' ';
        display: block;
        left: 50%;
        transform: translate(-50%, calc(-100% + 2px));
        position: absolute;
        border-color: transparent transparent
          ${s(r.gray[100],r.darkGray[500])} transparent;
        border-style: solid;
        border-width: 7px;
      }
    `,filtersContainer:t`
      display: flex;
      gap: ${nx.size[2]};
      & > button {
        cursor: pointer;
        padding: ${nx.size[.5]} ${nx.size[1.5]} ${nx.size[.5]}
          ${nx.size[2]};
        border-radius: ${nx.border.radius.sm};
        background-color: ${s(r.gray[100],r.darkGray[400])};
        border: 1px solid ${s(r.gray[300],r.darkGray[200])};
        color: ${s(r.gray[700],r.gray[300])};
        font-size: ${n.size.xs};
        display: flex;
        align-items: center;
        line-height: ${n.lineHeight.sm};
        gap: ${nx.size[1.5]};
        max-width: 160px;
        &:focus-visible {
          outline-offset: 2px;
          border-radius: ${a.radius.xs};
          outline: 2px solid ${r.blue[800]};
        }
        & svg {
          width: ${nx.size[3]};
          height: ${nx.size[3]};
          color: ${s(r.gray[500],r.gray[400])};
        }
      }
    `,filterInput:t`
      padding: ${o[.5]} ${o[2]};
      border-radius: ${nx.border.radius.sm};
      background-color: ${s(r.gray[100],r.darkGray[400])};
      display: flex;
      box-sizing: content-box;
      align-items: center;
      gap: ${nx.size[1.5]};
      max-width: 160px;
      min-width: 100px;
      border: 1px solid ${s(r.gray[300],r.darkGray[200])};
      height: min-content;
      color: ${s(r.gray[600],r.gray[400])};
      & > svg {
        width: ${o[3]};
        height: ${o[3]};
      }
      & input {
        font-size: ${n.size.xs};
        width: 100%;
        background-color: ${s(r.gray[100],r.darkGray[400])};
        border: none;
        padding: 0;
        line-height: ${n.lineHeight.sm};
        color: ${s(r.gray[700],r.gray[300])};
        &::placeholder {
          color: ${s(r.gray[700],r.gray[300])};
        }
        &:focus {
          outline: none;
        }
      }

      &:focus-within {
        outline-offset: 2px;
        border-radius: ${a.radius.xs};
        outline: 2px solid ${r.blue[800]};
      }
    `,filterSelect:t`
      padding: ${nx.size[.5]} ${nx.size[2]};
      border-radius: ${nx.border.radius.sm};
      background-color: ${s(r.gray[100],r.darkGray[400])};
      display: flex;
      align-items: center;
      gap: ${nx.size[1.5]};
      box-sizing: content-box;
      max-width: 160px;
      border: 1px solid ${s(r.gray[300],r.darkGray[200])};
      height: min-content;
      & > svg {
        color: ${s(r.gray[600],r.gray[400])};
        width: ${nx.size[2]};
        height: ${nx.size[2]};
      }
      & > select {
        appearance: none;
        color: ${s(r.gray[700],r.gray[300])};
        min-width: 100px;
        line-height: ${n.lineHeight.sm};
        font-size: ${n.size.xs};
        background-color: ${s(r.gray[100],r.darkGray[400])};
        border: none;
        &:focus {
          outline: none;
        }
      }
      &:focus-within {
        outline-offset: 2px;
        border-radius: ${a.radius.xs};
        outline: 2px solid ${r.blue[800]};
      }
    `,actionsContainer:t`
      display: flex;
      gap: ${nx.size[2]};
    `,actionsBtn:t`
      border-radius: ${nx.border.radius.sm};
      background-color: ${s(r.gray[100],r.darkGray[400])};
      border: 1px solid ${s(r.gray[300],r.darkGray[200])};
      width: ${nx.size[6.5]};
      height: ${nx.size[6.5]};
      justify-content: center;
      display: flex;
      align-items: center;
      gap: ${nx.size[1.5]};
      max-width: 160px;
      cursor: pointer;
      padding: 0;
      &:hover {
        background-color: ${s(r.gray[200],r.darkGray[500])};
      }
      & svg {
        color: ${s(r.gray[700],r.gray[300])};
        width: ${nx.size[3]};
        height: ${nx.size[3]};
      }
      &:focus-visible {
        outline-offset: 2px;
        border-radius: ${a.radius.xs};
        outline: 2px solid ${r.blue[800]};
      }
    `,actionsBtnOffline:t`
      & svg {
        stroke: ${s(r.yellow[700],r.yellow[500])};
        fill: ${s(r.yellow[700],r.yellow[500])};
      }
    `,overflowQueryContainer:t`
      flex: 1;
      overflow-y: auto;
      & > div {
        display: flex;
        flex-direction: column;
      }
    `,queryRow:t`
      display: flex;
      align-items: center;
      padding: 0;
      border: none;
      cursor: pointer;
      color: ${s(r.gray[700],r.gray[300])};
      background-color: ${s(r.gray[50],r.darkGray[700])};
      line-height: 1;
      &:focus {
        outline: none;
      }
      &:focus-visible {
        outline-offset: -2px;
        border-radius: ${a.radius.xs};
        outline: 2px solid ${r.blue[800]};
      }
      &:hover .tsqd-query-hash {
        background-color: ${s(r.gray[200],r.darkGray[600])};
      }

      & .tsqd-query-observer-count {
        padding: 0 ${nx.size[1]};
        user-select: none;
        min-width: ${nx.size[6.5]};
        align-self: stretch;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${n.size.xs};
        font-weight: ${n.weight.medium};
        border-bottom-width: 1px;
        border-bottom-style: solid;
        border-bottom: 1px solid ${s(r.gray[300],r.darkGray[700])};
      }
      & .tsqd-query-hash {
        user-select: text;
        font-size: ${n.size.xs};
        display: flex;
        align-items: center;
        min-height: ${nx.size[6]};
        flex: 1;
        padding: ${nx.size[1]} ${nx.size[2]};
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
        border-bottom: 1px solid ${s(r.gray[300],r.darkGray[400])};
        text-align: left;
        text-overflow: clip;
        word-break: break-word;
      }

      & .tsqd-query-disabled-indicator {
        align-self: stretch;
        display: flex;
        align-items: center;
        padding: 0 ${nx.size[2]};
        color: ${s(r.gray[800],r.gray[300])};
        background-color: ${s(r.gray[300],r.darkGray[600])};
        border-bottom: 1px solid ${s(r.gray[300],r.darkGray[400])};
        font-size: ${n.size.xs};
      }

      & .tsqd-query-static-indicator {
        align-self: stretch;
        display: flex;
        align-items: center;
        padding: 0 ${nx.size[2]};
        color: ${s(r.teal[800],r.teal[300])};
        background-color: ${s(r.teal[100],r.teal[900])};
        border-bottom: 1px solid ${s(r.teal[300],r.teal[700])};
        font-size: ${n.size.xs};
      }
    `,selectedQueryRow:t`
      background-color: ${s(r.gray[200],r.darkGray[500])};
    `,detailsContainer:t`
      flex: 1 1 700px;
      background-color: ${s(r.gray[50],r.darkGray[700])};
      color: ${s(r.gray[700],r.gray[300])};
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      display: flex;
      text-align: left;
    `,detailsHeader:t`
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      position: sticky;
      top: 0;
      z-index: 2;
      background-color: ${s(r.gray[200],r.darkGray[600])};
      padding: ${nx.size[1.5]} ${nx.size[2]};
      font-weight: ${n.weight.medium};
      font-size: ${n.size.xs};
      line-height: ${n.lineHeight.xs};
      text-align: left;
    `,detailsBody:t`
      margin: ${nx.size[1.5]} 0px ${nx.size[2]} 0px;
      & > div {
        display: flex;
        align-items: stretch;
        padding: 0 ${nx.size[2]};
        line-height: ${n.lineHeight.sm};
        justify-content: space-between;
        & > span {
          font-size: ${n.size.xs};
        }
        & > span:nth-child(2) {
          font-variant-numeric: tabular-nums;
        }
      }

      & > div:first-child {
        margin-bottom: ${nx.size[1.5]};
      }

      & code {
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
        margin: 0;
        font-size: ${n.size.xs};
        line-height: ${n.lineHeight.xs};
      }

      & pre {
        margin: 0;
        display: flex;
        align-items: center;
      }
    `,queryDetailsStatus:t`
      border: 1px solid ${r.darkGray[200]};
      border-radius: ${nx.border.radius.sm};
      font-weight: ${n.weight.medium};
      padding: ${nx.size[1]} ${nx.size[2.5]};
    `,actionsBody:t`
      flex-wrap: wrap;
      margin: ${nx.size[2]} 0px ${nx.size[2]} 0px;
      display: flex;
      gap: ${nx.size[2]};
      padding: 0px ${nx.size[2]};
      & > button {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
        font-size: ${n.size.xs};
        padding: ${nx.size[1]} ${nx.size[2]};
        display: flex;
        border-radius: ${nx.border.radius.sm};
        background-color: ${s(r.gray[100],r.darkGray[600])};
        border: 1px solid ${s(r.gray[300],r.darkGray[400])};
        align-items: center;
        gap: ${nx.size[2]};
        font-weight: ${n.weight.medium};
        line-height: ${n.lineHeight.xs};
        cursor: pointer;
        &:focus-visible {
          outline-offset: 2px;
          border-radius: ${a.radius.xs};
          outline: 2px solid ${r.blue[800]};
        }
        &:hover {
          background-color: ${s(r.gray[200],r.darkGray[500])};
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        & > span {
          width: ${o[1.5]};
          height: ${o[1.5]};
          border-radius: ${nx.border.radius.full};
        }
      }
    `,actionsSelect:t`
      font-size: ${n.size.xs};
      padding: ${nx.size[.5]} ${nx.size[2]};
      display: flex;
      border-radius: ${nx.border.radius.sm};
      overflow: hidden;
      background-color: ${s(r.gray[100],r.darkGray[600])};
      border: 1px solid ${s(r.gray[300],r.darkGray[400])};
      align-items: center;
      gap: ${nx.size[2]};
      font-weight: ${n.weight.medium};
      line-height: ${n.lineHeight.sm};
      color: ${s(r.red[500],r.red[400])};
      cursor: pointer;
      position: relative;
      &:hover {
        background-color: ${s(r.gray[200],r.darkGray[500])};
      }
      & > span {
        width: ${o[1.5]};
        height: ${o[1.5]};
        border-radius: ${nx.border.radius.full};
      }
      &:focus-within {
        outline-offset: 2px;
        border-radius: ${a.radius.xs};
        outline: 2px solid ${r.blue[800]};
      }
      & select {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        appearance: none;
        background-color: transparent;
        border: none;
        color: transparent;
        outline: none;
      }

      & svg path {
        stroke: ${nx.colors.red[400]};
      }
      & svg {
        width: ${nx.size[2]};
        height: ${nx.size[2]};
      }
    `,settingsMenu:t`
      display: flex;
      & * {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      }
      flex-direction: column;
      gap: ${o[.5]};
      border-radius: ${nx.border.radius.sm};
      border: 1px solid ${s(r.gray[300],r.gray[700])};
      background-color: ${s(r.gray[50],r.darkGray[600])};
      font-size: ${n.size.xs};
      color: ${s(r.gray[700],r.gray[300])};
      z-index: 99999;
      min-width: 120px;
      padding: ${o[.5]};
    `,settingsSubTrigger:t`
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: ${nx.border.radius.xs};
      padding: ${nx.size[1]} ${nx.size[1]};
      cursor: pointer;
      background-color: transparent;
      border: none;
      color: ${s(r.gray[700],r.gray[300])};
      & svg {
        color: ${s(r.gray[600],r.gray[400])};
        transform: rotate(-90deg);
        width: ${nx.size[2]};
        height: ${nx.size[2]};
      }
      &:hover {
        background-color: ${s(r.gray[200],r.darkGray[500])};
      }
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${r.blue[800]};
      }
      &.data-disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,settingsMenuHeader:t`
      padding: ${nx.size[1]} ${nx.size[1]};
      font-weight: ${n.weight.medium};
      border-bottom: 1px solid ${s(r.gray[300],r.darkGray[400])};
      color: ${s(r.gray[500],r.gray[400])};
      font-size: ${n.size.xs};
    `,settingsSubButton:t`
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: ${s(r.gray[700],r.gray[300])};
      font-size: ${n.size.xs};
      border-radius: ${nx.border.radius.xs};
      padding: ${nx.size[1]} ${nx.size[1]};
      cursor: pointer;
      background-color: transparent;
      border: none;
      & svg {
        color: ${s(r.gray[600],r.gray[400])};
      }
      &:hover {
        background-color: ${s(r.gray[200],r.darkGray[500])};
      }
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${r.blue[800]};
      }
    `,themeSelectedButton:t`
      background-color: ${s(r.purple[100],r.purple[900])};
      color: ${s(r.purple[700],r.purple[300])};
      & svg {
        color: ${s(r.purple[700],r.purple[300])};
      }
      &:hover {
        background-color: ${s(r.purple[100],r.purple[900])};
      }
    `,viewToggle:t`
      border-radius: ${nx.border.radius.sm};
      background-color: ${s(r.gray[200],r.darkGray[600])};
      border: 1px solid ${s(r.gray[300],r.darkGray[200])};
      display: flex;
      padding: 0;
      font-size: ${n.size.xs};
      color: ${s(r.gray[700],r.gray[300])};
      overflow: hidden;

      &:has(:focus-visible) {
        outline: 2px solid ${r.blue[800]};
      }

      & .tsqd-radio-toggle {
        opacity: 0.5;
        display: flex;
        & label {
          display: flex;
          align-items: center;
          cursor: pointer;
          line-height: ${n.lineHeight.md};
        }

        & label:hover {
          background-color: ${s(r.gray[100],r.darkGray[500])};
        }
      }

      & > [data-checked] {
        opacity: 1;
        background-color: ${s(r.gray[100],r.darkGray[400])};
        & label:hover {
          background-color: ${s(r.gray[100],r.darkGray[400])};
        }
      }

      & .tsqd-radio-toggle:first-child {
        & label {
          padding: 0 ${nx.size[1.5]} 0 ${nx.size[2]};
        }
        border-right: 1px solid ${s(r.gray[300],r.darkGray[200])};
      }

      & .tsqd-radio-toggle:nth-child(2) {
        & label {
          padding: 0 ${nx.size[2]} 0 ${nx.size[1.5]};
        }
      }
    `,devtoolsEditForm:t`
      padding: ${o[2]};
      & > [data-error='true'] {
        outline: 2px solid ${s(r.red[200],r.red[800])};
        outline-offset: 2px;
        border-radius: ${a.radius.xs};
      }
    `,devtoolsEditTextarea:t`
      width: 100%;
      max-height: 500px;
      font-family: 'Fira Code', monospace;
      font-size: ${n.size.xs};
      border-radius: ${a.radius.sm};
      field-sizing: content;
      padding: ${o[2]};
      background-color: ${s(r.gray[100],r.darkGray[800])};
      color: ${s(r.gray[900],r.gray[100])};
      border: 1px solid ${s(r.gray[200],r.gray[700])};
      resize: none;
      &:focus {
        outline-offset: 2px;
        border-radius: ${a.radius.xs};
        outline: 2px solid ${s(r.blue[200],r.blue[800])};
      }
    `,devtoolsEditFormActions:t`
      display: flex;
      justify-content: space-between;
      gap: ${o[2]};
      align-items: center;
      padding-top: ${o[1]};
      font-size: ${n.size.xs};
    `,devtoolsEditFormError:t`
      color: ${s(r.red[700],r.red[500])};
    `,devtoolsEditFormActionContainer:t`
      display: flex;
      gap: ${o[2]};
    `,devtoolsEditFormAction:t`
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      font-size: ${n.size.xs};
      padding: ${o[1]} ${nx.size[2]};
      display: flex;
      border-radius: ${a.radius.sm};
      background-color: ${s(r.gray[100],r.darkGray[600])};
      border: 1px solid ${s(r.gray[300],r.darkGray[400])};
      align-items: center;
      gap: ${o[2]};
      font-weight: ${n.weight.medium};
      line-height: ${n.lineHeight.xs};
      cursor: pointer;
      &:focus-visible {
        outline-offset: 2px;
        border-radius: ${a.radius.xs};
        outline: 2px solid ${r.blue[800]};
      }
      &:hover {
        background-color: ${s(r.gray[200],r.darkGray[500])};
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `}},iL=e=>iF("light",e),iA=e=>iF("dark",e);(0,o.x)(["click","mousedown","input"])}}]);