(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function t(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(o){if(o.ep)return;o.ep=!0;const s=t(o);fetch(o.href,s)}})();const z={en:{title:"Fish Farm",shop:"Shop",tutorialObjective:"Tutorial Objective",objective:"Level {{level}} Objective",objectiveText:"Make 💵 {{amount}}",day:"Day",nextDay:"Next Day",buy:"Buy",sell:"Sell",fish:"Fish",noFishInCell:"No fish in this cell.",overcrowded:"⚠️Overcrowded⚠️",specialEvent:"Special Event: {{event}}",none:"None",heatwave:"Heatwave",storm:"Storm",cell:"Cell",sunlight:"☀️ Sunlight",food:"🍎 Food",growth:"Growth",value:"Value",wonText:"You won in {{days}} days!",loseText:"Game Over!",gameWon:"Congratulations! You completed the game!",nextLevel:"Next Level",saveGame:"Save Game",loadGame:"Load Game",listSaveSlots:"List Save Slots",deleteSaveSlot:"Delete Save Slot",savePrompt:"Enter save slot name to save to (e.g., Slot1):",loadPrompt:"Enter save slot name to load from (e.g., Slot1):",deletePrompt:"Enter save slot name to delete (e.g., Slot1):",noSaveData:'No save data found for slot "{{slot}}".',gameLoaded:'Game loaded from slot "{{slot}}".',slotDeleted:'Save slot "{{slot}}" deleted.',availableSlots:`Available save slots:
{{slots}}`,Red:"Red",Green:"Green",Yellow:"Yellow",GreenFishDescription:"Green fish like living in groups of their own kind and do not tolerate extreme sunlight.",YellowFishDescription:"Yellow fish like high sunlight and living with fish of other kinds.",RedFishDescription:"Red fish like low sunlight and do not tolerate their own kind."},es:{title:"Granja de Peces",shop:"Tienda",tutorialObjective:"Objetivo del Tutorial",objective:"Objetivo de Nivel {{level}}",objectiveText:"Consigue 💵 {{amount}}",day:"Día",nextDay:"Siguiente Día",buy:"Comprar",sell:"Vender",fish:"Pez",noFishInCell:"No hay peces en esta celda.",overcrowded:"⚠️Superpoblado⚠️",specialEvent:"Evento especial: {{event}}",none:"Ninguno",heatwave:"Ola de calor",storm:"Tormenta",cell:"Celda",sunlight:"☀️ Sol",food:"🍎 Alimento",growth:"Crecimiento",value:"Valor",wonText:"¡Ganaste en {{days}} días!",loseText:"¡Fin del juego!",gameWon:"¡Felicidades! ¡Has completado el juego!",nextLevel:"Siguiente nivel",saveGame:"Guardar Partida",loadGame:"Cargar Partida",listSaveSlots:"Mostrar Ranuras Guardadas",deleteSaveSlot:"Eliminar Ranura Guardada",savePrompt:"Introduce el nombre de la ranura para guardar (por ejemplo: Slot1):",loadPrompt:"Introduce el nombre de la ranura para cargar (por ejemplo: Slot1):",deletePrompt:"Introduce el nombre de la ranura para eliminar (por ejemplo: Slot1):",noSaveData:'No se encontraron datos guardados para la ranura "{{slot}}".',gameLoaded:'Juego cargado desde la ranura "{{slot}}".',slotDeleted:'La ranura guardada "{{slot}}" ha sido eliminada.',availableSlots:`Ranuras guardadas disponibles:
{{slots}}`,Red:"Rojo",Green:"Verde",Yellow:"Amarillo",GreenFishDescription:"A los peces verdes les gusta vivir en grupos de su propia especie y no toleran la luz solar extrema.",YellowFishDescription:"A los peces amarillos les gusta la luz del sol y convivir con peces de otros tipos.",RedFishDescription:"A los peces rojos les gusta la luz solar baja y no toleran a los de su propia especie."},ar:{title:"مزرعة الأسماك",shop:"المتجر",tutorialObjective:"هدف البرنامج التعليمي",objective:"{{level}} الهدف من المستوى",objectiveText:"اكسب 💵 {{amount}}",day:"يوم",nextDay:"اليوم التالي",buy:"شراء",sell:"بيع",fish:"سمكة",noFishInCell:"لا يوجد أسماك في هذه الخلية.",overcrowded:"⚠️مكتظه⚠️",specialEvent:"حدث خاص: {{event}}",none:"اي",heatwave:"موجة الحر",storm:"عاصفة",cell:"خلية",sunlight:"☀️ الشمس",food:"🍎 الطعام",growth:"النمو",value:"القيمة",wonText:"فزت في {{days}} يومًا!",loseText:"انتهت اللعبة!",gameWon:"مبروك! لقد أكملت اللعبة!",nextLevel:"المستوى التالي",saveGame:"حفظ اللعبة",loadGame:"تحميل اللعبة",listSaveSlots:"عرض ملفات الحفظ",deleteSaveSlot:"حذف ملف الحفظ",savePrompt:"أدخل اسم خانة الحفظ (مثال: Slot1):",loadPrompt:"أدخل اسم خانة التحميل (مثال: Slot1):",deletePrompt:"أدخل اسم خانة الحذف (مثال: Slot1):",noSaveData:'لا توجد بيانات حفظ في الخانة "{{slot}}".',gameLoaded:'تم تحميل اللعبة من الخانة "{{slot}}".',slotDeleted:'تم حذف خانة الحفظ "{{slot}}".',availableSlots:`خانات الحفظ المتوفرة:
{{slots}}`,Red:"أحمر",Green:"أخضر",Yellow:"أصفر",GreenFishDescription:"تحب الأسماك الخضراء العيش في مجموعات من نوعها ولا تتسامح مع أشعة الشمس الشديدة.",YellowFishDescription:"الأسماك الصفراء مثل أشعة الشمس العالية وتعيش مع الأسماك من أنواع أخرى.",RedFishDescription:"الأسماك الحمراء تحب ضوء الشمس المنخفض ولا تتسامح مع نوعها."}};let D="en";function k(a){a in z?D=a:(console.warn(`Language "${a}" is not available. Defaulting to English.`),D="en")}function n(a,e={}){const t=z[D][a];return J(t,e)}function J(a,e){return a.replace(/{{(\w+)}}/g,(t,i)=>{var o;return((o=e[i])==null?void 0:o.toString())??""})}const K=1e4,Z=30,Q=2,ee=.2,te=.4,U=3,b=3,G=10,E=10,W=5,ae=2,$=10,T=10,c=150,S=10;function oe(a){const e=[],t=a.length;for(let i=0;i<t;i++){let o=a.charCodeAt(i);if(o>=55296&&o<=56319&&t>i+1){const s=a.charCodeAt(i+1);s>=56320&&s<=57343&&(o=(o-55296)*1024+s-56320+65536,i+=1)}if(o<128){e.push(o);continue}if(o<2048){e.push(o>>6|192),e.push(o&63|128);continue}if(o<55296||o>=57344&&o<65536){e.push(o>>12|224),e.push(o>>6&63|128),e.push(o&63|128);continue}if(o>=65536&&o<=1114111){e.push(o>>18|240),e.push(o>>12&63|128),e.push(o>>6&63|128),e.push(o&63|128);continue}e.push(239,191,189)}return new Uint8Array(e).buffer}function ie(a){return a^=a>>>16,a=Math.imul(a,2246822507),a^=a>>>13,a=Math.imul(a,3266489909),a^=a>>>16,a>>>0}const M=new Uint32Array([3432918353,461845907]);function I(a,e){return a<<e|a>>>32-e}function se(a,e){const t=a.byteLength/4|0,i=new Uint32Array(a,0,t);for(let o=0;o<t;o++)i[o]=Math.imul(i[o],M[0]),i[o]=I(i[o],15),i[o]=Math.imul(i[o],M[1]),e[0]=e[0]^i[o],e[0]=I(e[0],13),e[0]=Math.imul(e[0],5)+3864292196}function ne(a,e){const t=a.byteLength/4|0,i=a.byteLength%4;let o=0;const s=new Uint8Array(a,t*4,i);switch(i){case 3:o=o^s[2]<<16;case 2:o=o^s[1]<<8;case 1:o=o^s[0]<<0,o=Math.imul(o,M[0]),o=I(o,15),o=Math.imul(o,M[1]),e[0]=e[0]^o}}function re(a,e){e[0]=e[0]^a.byteLength,e[0]=ie(e[0])}function le(a,e){if(e=e?e|0:0,typeof a=="string"&&(a=oe(a)),!(a instanceof ArrayBuffer))throw new TypeError("Expected key to be ArrayBuffer or string");const t=new Uint32Array([e]);return se(a,t),ne(a,t),re(a,t),t.buffer}function j(a){return new DataView(le(a)).getUint32(0)%1073741824/1073741824}function m(a){const e=document.createElement("button");return e.innerHTML=a.text,a.div.append(e),e.addEventListener("click",a.onClick),e}function d(a){const e=document.createElement(a.size);return e.innerHTML=a.text,a.div.append(e),e}function y(a,e,t){if(e&&t){const i=Math.ceil(e),o=Math.floor(t);return Math.floor(j(a.toString())*(o-i+1)+i)}else return j(a.toString())}function ce(a){return`
${n(a.type.name)} ${n("fish")} | ${n("growth")}: ${a.growth}/${G}, ${n("food")}: ${a.food}/${U}, ${n("value")}: ${a.value}`}const de=[function(e){e.name("Green"),e.cost(15),e.growthMultiplier(1),e.minValueGain(1),e.growsWhen(({fish:t,cell:i})=>t.growth<b?!0:i.population.filter(s=>s!==t).filter(s=>s.type===t.type).length>=2&&i.state.sunlight<8)},function(e){e.name("Yellow"),e.cost(30),e.growthMultiplier(.75),e.minValueGain(2),e.growsWhen(({fish:t,cell:i})=>t.growth<b?!0:i.population.filter(s=>s!==t).filter(s=>s.type!==t.type).length>=2&&i.state.sunlight>=7)},function(e){e.name("Red"),e.cost(45),e.growthMultiplier(.5),e.minValueGain(3),e.growsWhen(({fish:t,cell:i})=>t.growth<b?!0:i.population.filter(s=>s!==t).filter(s=>s.type===t.type).length==0&&i.state.sunlight<5)}];class he{constructor(){this.name="Green",this.cost=0,this.growthMultiplier=0,this.minValueGain=0}eat(e){if(e.cell.state.food>0)e.fish.food=Math.min(U,e.fish.food+1),e.cell.state.food--;else if(e.fish.food-=1,e.fish.food<0){const t=e.cell.population.indexOf(e.fish);e.cell.population.splice(t,1)}}calculateValue(e,t,i){for(let o=0;o<e.fish.growth-i;o++)e.fish.value+=y([e.cell.state.food,e.cell.population.length,t.currState.day,o,t.currSave.seed,"value"],e.fish.type.minValueGain,e.fish.type.minValueGain+Q)}}function ue(a){const e=new he;return a({name(i){e.name=i},cost(i){e.cost=i},growthMultiplier(i){e.growthMultiplier=i},minValueGain(i){e.minValueGain=i},growsWhen(i){e.grow=o=>{const s=o.cell.population.length-W,l=s>0?Math.max(0,G-s*ae):G,v=e.growthMultiplier,C=o.fish.growth;let f=0;if(C<l&&(f=o.fish.growth+o.fish.food*v,f=Math.min(l,f)),f==0)return o.fish.growth;i(o)&&(o.fish.growth=Math.min(l,f))}}}),e}const _=de.map(ue);function F(a,e){const t=[];for(let i=0;i<a.population.length;i++){const o=a.population[i];o.type.name==e&&o.growth>=b&&t.push(a.population[i])}return t}function pe(){return{sunlight:0,food:0}}function ge(){return{state:pe(),population:[]}}class ve{constructor(e,t){this.x=e,this.y=t,this.details=ge()}draw(e){e.lineWidth=4,e.strokeStyle="lightblue",e.fillStyle="lightcyan",e.strokeRect(this.x,this.y,c,c),e.fillRect(this.x,this.y,c,c),e.font="20px arial",e.lineWidth=1,e.strokeStyle="orange",e.strokeText(`☀️ ${this.details.state.sunlight}`,this.x+10,this.y+30),e.strokeStyle="red",e.strokeText(`🍎 ${this.details.state.food}`,this.x+10,this.y+50),e.strokeStyle="blue",e.strokeText(`🐟 ${this.details.population.length}`,this.x+10,this.y+70)}updateSunlight(e){const t=e.currState.day,i=e.currSave.seed,o=e.specialEffects.minSunlight,s=e.specialEffects.maxSunlight,l=y([this.x,this.y,t,i,"randchange"])<.5?-1:1,v=y([this.x,this.y,t,i,"realchange"])<te?0:l;this.details.state.sunlight=Math.max(o,Math.min(s,this.details.state.sunlight+v))}updateFood(){this.details.state.food=Math.min($,this.details.state.food+this.details.state.sunlight)}updateFish(e){this.details.population.forEach(t=>{const i={fish:t,cell:this.details},o=t.growth;t.type.eat(i),t.type.grow(i),t.type.calculateValue(i,e,o)})}addFish(e,t){for(let i=0;i<t;i++){const o={type:e,growth:0,food:0,value:Math.floor(e.cost/2)};this.details.population.push(o)}}updatePopulation(e){const t=e.currState.day,i=e.currSave.seed;if(this.details.population.length>=2&&this.details.state.food>0){const o=[];o.push(Math.floor(F(this.details,"Green").length/2)),o.push(Math.floor(F(this.details,"Yellow").length/2)),o.push(Math.floor(F(this.details,"Red").length/2));for(let s=0;s<o.length;s++)for(let l=0;l<o[s];l++)y([this.x,this.y,s,l,t,i,"reproduction"])<ee+e.specialEffects.reproductionModifier&&this.details.population.length<E&&this.addFish(_[s],1)}}removeFish(e){const t=this.details.population.indexOf(e);this.details.population.splice(t,1)}}function fe(){return Math.floor(Math.random()*K+1)}class O{constructor(e){this.seed=fe(),this.rows=e.rows,this.cols=e.cols,this.cells=Array.from({length:this.rows},(o,s)=>Array.from({length:this.cols},(l,v)=>new ve(v*c+S/2,s*c+S/2)));const t=3+E*4,i=new ArrayBuffer(this.rows*this.cols*t);this.state=new Uint8Array(i)}draw(e){this.cells.forEach(t=>t.forEach(i=>{i.draw(e)}))}setInitialCellStats(){this.cells.forEach(e=>e.forEach(t=>{t.details.state.sunlight=y([t.x,t.y,this.seed,"sun"],1,T),t.details.state.food=y([t.x,t.y,this.seed,"food"],1,$)})),this.encode()}encode(){let e=0;for(let t=0;t<this.rows;t++)for(let i=0;i<this.cols;i++){const o=this.cells[t][i];this.state[e++]=o.details.state.sunlight,this.state[e++]=o.details.state.food,this.state[e++]=o.details.population.length;for(let s=0;s<E;s++)if(s<o.details.population.length){const l=o.details.population[s];this.state[e++]=l.type.name==="Green"?0:l.type.name==="Yellow"?1:2,this.state[e++]=l.growth,this.state[e++]=l.food,this.state[e++]=l.value}else this.state[e++]=0,this.state[e++]=0,this.state[e++]=0,this.state[e++]=0}}decode(){let e=0;for(let t=0;t<this.rows;t++)for(let i=0;i<this.cols;i++){const o=this.cells[t][i];o.details.state.sunlight=this.state[e++],o.details.state.food=this.state[e++];const s=this.state[e++];o.details.population=[];for(let l=0;l<s;l++){const v=this.state[e++],C=_[v],f=this.state[e++],q=this.state[e++],X=this.state[e++];o.details.population.push({type:C,growth:f,food:q,value:X})}e+=(E-s)*4}}}class me{constructor(){this.coords={row:0,col:0}}draw(e){const t=this.coords.col*c+S/2,i=this.coords.row*c+S/2;e.strokeStyle="limegreen",e.lineWidth=8,e.strokeRect(t,i,c,c)}move(e,t){this.coords.row=e,this.coords.col=t}}function ye(){const a=document.createElement("div");return a.style.position="absolute",a.style.backgroundColor="white",a.style.border="1px solid black",a.style.padding="10px",a.style.display="none",document.body.append(a),a}function Se(a,e){for(let t=0;t<a.availableFishTypes.length;t++)if(a.availableFishTypes[t]==e)return!0;return!1}class we{constructor(e){this.gameManager=e,this.popup=ye()}updateHeader(){const e=document.querySelector("#header");e.innerHTML="",d({text:n("title"),div:e,size:"h1"});const t=d({text:`${n("day")} ${this.gameManager.currState.day}`,div:e,size:"h3"});t.style.display="inline",t.style.marginRight="20px",m({text:n("nextDay"),div:e,onClick:()=>{this.gameManager.nextDay()}});const i=d({text:`💵 ${this.gameManager.currState.money}`,div:e,size:"h2"});i.style.display="inline";let o=n("specialEvent",{event:n("none")});this.gameManager.activeEvent&&(o=n("specialEvent",{event:n(this.gameManager.activeEvent.type.name)}));const s=d({text:o,div:e,size:"h3"});s.style.marginBottom="0px"}updateMoneyUI(e){const t=document.querySelector("#header h2");t&&(t.textContent=`💵 ${e}`)}updateDayUI(e){const t=document.querySelector("#header h3");t&&(t.textContent=`${n("day")} ${e}`)}updateObjectiveUI(){const e=document.querySelector("#objectives");if(e.innerHTML="",d({text:this.gameManager.currState.scenarioIndex==0?n("tutorialObjective"):n("objective",{level:this.gameManager.currState.scenarioIndex}),div:e,size:"h2"}),d({text:this.gameManager.currState.won?`<strike>${n("objectiveText",{amount:this.gameManager.scenario.objectiveMoney})}</strike> ${n("wonText",{days:this.gameManager.currState.dayWon})}`:n("objectiveText",{amount:this.gameManager.scenario.objectiveMoney}),div:e,size:"h4"}),this.gameManager.currState.won&&this.gameManager.currState.scenarioIndex<p.length-1){const t=document.querySelector("#objectives");m({text:n("nextLevel"),div:t,onClick:()=>{this.gameManager.nextScenario(),this.gameManager.autoSave(!0)}})}else this.gameManager.currState.won&&this.gameManager.currState.scenarioIndex>=p.length-1&&d({text:n("gameWon"),div:e,size:"h3"})}updatePopupUI(e){this.popup.innerHTML="",e.details.population.length>0?(e.details.population.length>W&&(d({text:n("overcrowded"),div:this.popup,size:"h3"}).style.margin="0px"),e.details.population.forEach(t=>{d({text:ce(t),div:this.popup,size:"h5"}),m({text:n("sell"),div:this.popup,onClick:()=>{this.gameManager.sellFish(e,t)}})})):d({text:n("noFishInCell"),div:this.popup,size:"h5"})}createFishButton(e,t,i){const o=d({text:`💵 ${i.cost}`,div:t,size:"h5"}),s=m({text:`${n("buy")} ${n(i.name)} ${n("fish")}`,div:t,onClick:()=>{e.currState.money>=i.cost&&(e.changeMoney(-i.cost),e.grid.cells[e.player.coords.row][e.player.coords.col].addFish(i,1),e.autoSave(!0))}});s.append(o),s.title=n(`${i.name}FishDescription`)}createShop(){const e=document.querySelector("#shop");e.innerHTML="",d({text:n("shop"),div:e,size:"h2"}),_.forEach(t=>{Se(this.gameManager.scenario,t.name)&&this.createFishButton(this.gameManager,e,t)})}updateGameUI(){this.updateHeader(),this.createShop(),this.gameManager.updateObjective()}}function Y(){return{minSunlight:1,maxSunlight:T,reproductionModifier:0}}const xe=Y();function A(a,e){a.minSunlight=e.minSunlight,a.maxSunlight=e.maxSunlight,a.reproductionModifier=e.reproductionModifier}const w={heatwave:{minSunlight:8,maxSunlight:T,reproductionModifier:.2},storm:{minSunlight:1,maxSunlight:4,reproductionModifier:-.2}};function R(a,e){A(a,xe),e.updateHeader()}const be={heatwave:{name:"heatwave",effects:w.heatwave,activate:(a,e)=>{A(a,w.heatwave),e.updateHeader()},deactivate:R},storm:{name:"storm",effects:w.storm,activate:(a,e)=>{A(a,w.storm),e.updateHeader()},deactivate:R}},Ee={grid_size:[2,3],available_fish_types:["Green"],objective:250,special_events:[[5,"heatwave",2]]},Me={grid_size:[3,4],available_fish_types:["Green","Yellow"],objective:1e3,special_events:[[5,"heatwave",4],[14,"storm",3]]},Ce={grid_size:[4,5],available_fish_types:["Green","Yellow","Red"],objective:5e3,special_events:[[3,"storm",4],[10,"heatwave",3],[20,"heatwave",4],[26,"storm",3]]},H={tutorial:Ee,level1:Me,level2:Ce},p=[];for(const a in H)p.push(H[a]);function P(a){const e=p[a].objective,t={rows:p[a].grid_size[0],cols:p[a].grid_size[1]},i=p[a].available_fish_types.slice(),o=Array.from(p[a].special_events,s=>({activationDay:s[0],type:be[s[1]],duration:s[2]}));return{index:a,objectiveMoney:e,gridSize:t,availableFishTypes:i,specialEvents:o}}function N(a,e,t,i,o){return{day:t??0,money:i??Z,won:!1,dayWon:0,gridState:Array.from(a.state),scenarioIndex:e,initialScenarioDay:o??0}}class Fe{constructor(){this.scenario=P(0),this.grid=new O(this.scenario.gridSize),this.grid.setInitialCellStats(),this.player=new me,this.clickedCell=this.grid.cells[0][0],this.currSave={seed:this.grid.seed,gameStates:[]},this.currState=N(this.grid,0),this.redoStates=[],this.uiManager=new we(this),this.activeEvent=null,this.specialEffects=Y()}getActiveSpecialEvent(){for(let e=0;e<this.scenario.specialEvents.length;e++){const t=this.scenario.specialEvents[e],i=this.currState.initialScenarioDay+t.activationDay;if(console.log(`Initial scenario day: ${this.currState.initialScenarioDay} Activation day: ${i}`),this.currState.day>=i&&this.currState.day<=i+t.duration)return console.log(`event ${t.type.name} is active`),t}return console.log("no event is active"),null}updateSpecialEvent(){const e=this.getActiveSpecialEvent();if(e&&!this.activeEvent)this.activeEvent=e,e.type.activate(this.specialEffects,this.uiManager);else if(!e&&this.activeEvent){const t=this.activeEvent;this.activeEvent=null,t.type.deactivate(this.specialEffects,this.uiManager)}}setScenario(){this.scenario.index!=this.currState.scenarioIndex&&(this.scenario=P(this.currState.scenarioIndex),this.grid=new O(this.scenario.gridSize),this.clickedCell=this.grid.cells[0][0],this.player.move(0,0),this.uiManager.popup.style.display="none"),this.grid.seed=this.currSave.seed,this.grid.setInitialCellStats(),this.currState=N(this.grid,this.currState.scenarioIndex,this.currState.day,this.currState.money,this.currState.initialScenarioDay),this.updateSpecialEvent(),this.uiManager.updateGameUI()}nextScenario(){this.currState.scenarioIndex++,this.currState.initialScenarioDay=this.currState.day,this.setScenario()}restoreGameState(e){this.currState.day=e.day,this.currState.money=e.money,this.currState.won=e.won,this.currState.dayWon=e.dayWon,this.currState.scenarioIndex=e.scenarioIndex,this.setScenario(),this.grid.state.set(e.gridState),this.grid.decode()}restoreGameSave(e){this.grid.seed=e.seed,this.currSave.seed=e.seed,this.currSave.gameStates=e.gameStates.map(i=>({day:i.day,money:i.money,won:i.won,dayWon:i.dayWon,gridState:i.gridState,scenarioIndex:i.scenarioIndex,initialScenarioDay:i.initialScenarioDay}));const t=this.currSave.gameStates[this.currSave.gameStates.length-1];this.currState={day:t.day,money:t.money,won:t.won,dayWon:t.dayWon,gridState:t.gridState,scenarioIndex:t.scenarioIndex,initialScenarioDay:t.initialScenarioDay},this.restoreGameState(this.currState)}saveToSlot(e){localStorage.setItem(`FishFarm_${e}`,JSON.stringify(this.currSave)),e!=="AutoSave"&&alert(`Game saved to slot "${e}".`)}autoSave(e){this.grid.encode();const t={day:this.currState.day,money:this.currState.money,won:this.currState.won,dayWon:this.currState.dayWon,gridState:Array.from(this.grid.state),scenarioIndex:this.currState.scenarioIndex,initialScenarioDay:this.currState.initialScenarioDay};this.currSave.gameStates.push(t),this.saveToSlot("AutoSave"),e&&(this.redoStates=[])}loadFromSlot(e){const t=localStorage.getItem(`FishFarm_${e}`);if(!t){alert(n("noSaveData",{slot:e}));return}const i=JSON.parse(t);this.restoreGameSave(i),alert(n("gameLoaded",{slot:e}))}deleteSlot(e){localStorage.getItem(`FishFarm_${e}`)?(localStorage.removeItem(`FishFarm_${e}`),alert(n("slotDeleted",{slot:e}))):alert(n("noSaveData",{slot:e}))}displaySaveSlots(){const t=Object.keys(localStorage).filter(i=>i.startsWith("FishFarm_")).map(i=>i.replace("FishFarm_","")).join(", ");alert(n("availableSlots",{slots:t}))}undo(){if(this.currSave.gameStates.length>1){const e=this.currSave.gameStates.pop();this.redoStates.push(e);const t=this.currSave.gameStates.pop();this.restoreGameState(t),this.autoSave(!1)}}redo(){if(this.redoStates.length>0){const e=this.redoStates.pop();this.restoreGameState(e),this.autoSave(!1)}}nextDay(){this.currState.day++,this.updateSpecialEvent(),this.grid.cells.forEach(e=>e.forEach(t=>{t.updateFood(),t.updateFish(this),t.updatePopulation(this),t.updateSunlight(this)})),this.uiManager.updateDayUI(this.currState.day),this.autoSave(!0)}updateObjective(){this.currState.money>=this.scenario.objectiveMoney&&!this.currState.won&&(this.currState.won=!0,this.currState.dayWon=this.currState.day),this.uiManager.updateObjectiveUI()}changeMoney(e){this.currState.money+=e,this.uiManager.updateMoneyUI(this.currState.money),this.updateObjective()}sellFish(e,t){this.changeMoney(t.value),e.removeFish(t),this.autoSave(!0)}}const g=document.getElementById("gameCanvas"),x=g.getContext("2d"),r=new Fe;function B(){g.width=r.grid.cols*c+S,g.height=r.grid.rows*c+S,x&&(x.clearRect(0,0,g.width,g.height),r.grid.draw(x),r.player.draw(x),requestAnimationFrame(B))}B();document.addEventListener("click",a=>{const e=a.target;e!=g&&e.tagName!="BUTTON"&&e.tagName!="H5"?r.uiManager.popup.style.display="none":r.uiManager.updatePopupUI(r.clickedCell)});localStorage.getItem("FishFarm_AutoSave")?confirm("Do you want to load the autosave?")?r.loadFromSlot("AutoSave"):alert("Starting a new game. Autosave will overwrite existing autosave."):(alert("No autosave found. Starting a new game."),r.autoSave(!1));function De(a,e){let t=a.player.coords.row,i=a.player.coords.col;switch(e.key){case"ArrowRight":case"d":case"D":i+=1;break;case"ArrowLeft":case"a":case"A":i-=1;break;case"ArrowUp":case"w":case"W":t-=1;break;case"ArrowDown":case"s":case"S":t+=1;break}t>=0&&t<a.grid.rows&&i>=0&&i<a.grid.cols&&a.player.move(t,i),a.uiManager.popup.style.display="none"}document.addEventListener("keydown",a=>{De(r,a)});g.addEventListener("click",a=>{const e=g.getBoundingClientRect(),t=a.x-e.left,i=a.y-e.top,o=Math.floor(t/c),s=Math.floor(i/c);r.clickedCell=r.grid.cells[s][o],r.player.move(s,o),r.uiManager.updatePopupUI(r.clickedCell),r.uiManager.popup.style.left=`${a.x+10}px`,r.uiManager.popup.style.top=`${a.y+10}px`,r.uiManager.popup.style.display="block"});const h=document.createElement("div");h.style.position="absolute";h.style.top="30px";h.style.left="10px";h.style.display="flex";h.style.flexDirection="row";h.style.justifyContent="flex-start";h.style.gap="20px";h.style.paddingBottom="10px";document.body.appendChild(h);m({text:"↩️",div:h,onClick:()=>{r.undo()}});m({text:"↪️",div:h,onClick:()=>{r.redo()}});const u=document.createElement("div");u.style.position="absolute";u.style.top="80px";u.style.left="10px";u.style.display="flex";h.style.justifyContent="flex-start";u.style.flexDirection="row";u.style.gap="10px";document.body.appendChild(u);const V=[{key:"saveGame",text:n("saveGame"),div:u,onClick:()=>{const a=prompt(n("savePrompt"));a&&r.saveToSlot(a)}},{key:"loadGame",text:n("loadGame"),div:u,onClick:()=>{const a=prompt(n("loadPrompt"));a&&r.loadFromSlot(a)}},{key:"listSaveSlots",text:n("listSaveSlots"),div:u,onClick:()=>{r.displaySaveSlots()}},{key:"deleteSaveSlot",text:n("deleteSaveSlot"),div:u,onClick:()=>{const a=prompt(n("deletePrompt"));a&&r.deleteSlot(a)}}],L=[];V.forEach(a=>{const e=m({text:a.text,div:a.div,onClick:a.onClick});L.push(e)});function Ge(){for(let a=0;a<L.length;a++)L[a].textContent=n(V[a].key)}function Ie(){const a=document.createElement("select");[{code:"en",label:"English"},{code:"es",label:"Español"},{code:"ar",label:"العربية"}].forEach(i=>{const o=document.createElement("option");o.value=i.code,o.textContent=i.label,a.appendChild(o)});const t=localStorage.getItem("language")||"en";a.value=t,k(t),r.uiManager.updateGameUI(),a.addEventListener("change",i=>{const o=i.target.value;k(o),localStorage.setItem("language",o),r.uiManager.updateGameUI(),Ge(),r.uiManager.createShop()}),document.body.prepend(a)}Ie();
