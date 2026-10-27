const LAYERS = [
  { id: "architecture", name: "Paredes e pisos", detail: "ambientes e shafts", color: "#cba56a", page: 1 },
  { id: "areas", name: "Áreas", detail: "m² aproximados", color: "#8bd4a3", page: 1 },
  { id: "dimensions", name: "Medidas", detail: "comprimento das paredes", color: "#d8c69e", page: 1 },
  { id: "electric", name: "Elétrica", detail: "pontos e comandos", color: "#61c9ec", page: 2 },
  { id: "hydraulic", name: "Hidráulica", detail: "pontos por ambiente", color: "#4f9cf4", page: 6 },
  { id: "systems", name: "Ar, gás e prumadas", detail: "pontos e cuidados", color: "#e99559", page: 4 },
  { id: "drains", name: "Drenos", detail: "pontos indicados", color: "#ca82e7", page: 4 }
];
const LEGENDA = [
  ["swatch structural", "Alvenaria estrutural"],
  ["swatch drywall", "Drywall"],
  ["swatch shaft", "Shaft / vazio hidráulico"],
  ["swatch electric", "Ponto elétrico"],
  ["swatch hydraulic", "Hidráulica"],
  ["swatch systems", "Ar, gás ou prumada"],
  ["swatch drains", "Dreno"],
  ["swatch areas", "Área aproximada"]
];
const SHEETS = [
  [1, "Arquitetura", "Ambientes, paredes e shafts"],
  [2, "Elétrica", "Pontos e interruptores"],
  [3, "Quadro de luz e força", "Circuitos: conferir na unidade"],
  [4, "Ar, gás e prumadas", "Locais previstos e cuidados"],
  [5, "Dreno da sala", "Detalhe e vista"],
  [6, "Hidráulica: banho suíte", "Vista técnica"],
  [7, "Hidráulica: banho social", "Vista técnica"],
  [8, "Hidráulica: cozinha e serviço", "Vista técnica"],
  [9, "Hidráulica: varanda", "Vista técnica"]
];
const MANUAL_TIPS = [
  { id:"reforma", title:"Antes de iniciar a obra", text:"Encaminhe o Plano de Reforma e a documentação ao síndico ou responsável pela edificação.", page:23, always:true },
  { id:"estrutura", title:"Alvenaria estrutural", text:"O manual proíbe remover ou modificar paredes estruturais e abrir vãos, nichos ou rasgos.", page:43, layers:["architecture"] },
  { id:"furacao", title:"Furação e áreas ocultas", text:"Consulte as vistas: áreas hachuradas, shafts e sancas não devem ser perfurados. O limite de 2 cm não libera áreas proibidas.", page:164, layers:["architecture","hydraulic","systems","drains"] },
  { id:"eletrica", title:"Confira a tensão real", text:"O manual descreve iluminação 127 V e traz orientações gerais para tomadas. Compare com as folhas do final e confira cada ponto instalado.", page:98, layers:["electric"] },
  { id:"impermeabilizacao", title:"Banheiros e cozinha", text:"O manual orienta não quebrar nem perfurar pisos e revestimentos impermeabilizados.", page:58, layers:["hydraulic"] },
  { id:"gas", title:"Gás e ventilação", text:"Instalação e manutenção de equipamentos a gás exigem profissional capacitado e ventilação adequada.", page:92, layers:["systems"] },
  { id:"ar", title:"Condensadora na varanda", text:"A condensadora precisa trocar ar com o exterior; preserve ventilação e acesso para manutenção.", page:106, layers:["systems"] },
  { id:"vidros", title:"Envidraçamento", text:"Consulte a padronização e as regras do condomínio; o manual exige análise do local e responsabilidade técnica.", page:25, layers:["systems"] }
];
const AREA_ESTIMATES = {
  pair: [
    { name:"Suíte", approx:10.2, x:400, y:566 },
    { name:"Dormitório", approx:10.8, x:390, y:1138 },
    { name:"Banho da suíte", approx:3.3, x:733, y:590 },
    { name:"Banho social", approx:3.3, x:330, y:852 },
    { name:"Varanda", approx:5.7, x:999, y:542 },
    { name:"Sala, cozinha, serviço e circulação", approx:21.7, x:868, y:1013, open:true }
  ],
  four: [
    { name:"Suíte", approx:11.0, x:904, y:630 },
    { name:"Dormitório", approx:10.2, x:639, y:894 },
    { name:"Banho da suíte", approx:3.7, x:850, y:903 },
    { name:"Banho social", approx:3.2, x:707, y:611 },
    { name:"Varanda", approx:5.7, x:404, y:914 },
    { name:"Sala, cozinha, serviço e circulação", approx:21.3, x:536, y:658, open:true }
  ]
};
const state = {
  final: 2,
  layers: { architecture: true, electric: false, hydraulic: false, systems: false, drains: false, dimensions: false, areas: false },
  opacity: 0.85, zoom: 1, panX: 0, panY: 0, mode: "2d",
  view3d: { yaw: -0.5, tilt: 0.77, zoom: 1, panX: 0, panY: 0 }
};
const STRUCTURAL_WALLS = [
  [140,330,520,22],[764,330,66,22],[1108,330,142,22],
  [140,330,22,101],[140,582,22,178],[140,862,22,128],[140,1142,22,126],
  [638,330,22,265],[638,694,192,21],[810,330,20,384],
  [140,694,390,20],[140,760,22,102],
  [638,865,22,403],[140,1247,813,21],[1077,1247,2,21],
  [1230,330,20,270],[1138,580,112,20],[1230,600,20,515],
  [1057,1095,193,20],[1057,1095,20,28]
];
const DRYWALL_WALLS = [
  [160,735,128,20],[160,865,365,20],[506,714,20,53],[506,850,20,35],
  [770,350,10,129],[1020,580,20,198],[1210,350,20,120],[1110,350,20,120],
  [1210,600,20,112],[1210,710,20,8],[638,679,20,15]
];
const SHAFTS = [[161,714,121,40],[772,352,39,125],[1201,351,30,119],[1212,600,32,114]];
const LIGHTS = [[400,515],[734,515],[998,462],[1126,675],[857,795],[1126,936],[857,1070],[400,1070],[590,780],[334,780]];
const OUTLETS = [[248,370],[499,370],[338,679],[514,679],[770,678],[1191,558],[1170,745],[1212,745],[1170,874],[1212,874],[1170,967],[1212,967],[1212,1028],[176,1056],[500,1229],[848,1229],[899,1229],[675,878],[514,898],[488,752]];
const SWITCHES = [[248,402],[514,644],[667,581],[1026,567],[1132,478],[514,936],[708,875],[727,875],[898,1195],[1115,1068],[1115,1084],[453,751],[534,752]];
const $ = (selector) => document.querySelector(selector);
const docName = () => state.final===4 ? "final-4-comum" : [2,5].includes(state.final) ? "finais-2-5" : "finais-3-6";
const docUrl = (page = 1) => `assets/docs/${docName()}.pdf#page=${page}`;
const mirrored = () => [3,6].includes(state.final);
const yy = (y) => mirrored() ? 1570 - y : y;
const areaData = () => state.final===4 ? AREA_ESTIMATES.four : AREA_ESTIMATES.pair;
const areaLabel = (approx) => `≈${Math.round(approx)} m²`;
const rect = (x,y,w,h,cls) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"/>`;
const path = (d,cls) => `<path d="${d}" class="${cls}"/>`;
const line = (x1,y1,x2,y2,cls) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
const surfaceAttrs = (surface) => {
  const item=SURFACE_CATALOG[surface];
  return `role="button" tabindex="0" aria-label="${item.title}" data-surface="${surface}" data-title="${item.title}" data-description="${item.description}" data-page="1"`;
};
const surfaceRect = (x,y,w,h,cls,surface) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls} clickable-surface" ${surfaceAttrs(surface)}/>`;
const surfacePath = (d,cls,surface) => `<path d="${d}" class="${cls} clickable-surface" ${surfaceAttrs(surface)}/>`;
const baseShape = () => {
  // Coordinates traced from sheet 1. Finals 3/6 are the vertical mirror shown in their own set.
  let svg = '<g class="floor-area">' +
    surfacePath('M140 330H1250V1115H1077V1268H140Z','floor-outline','dry_floor') +
    surfaceRect(660,350,150,340,'wet-area','wet_floor') +
    surfaceRect(161,714,346,151,'wet-area','wet_floor') +
    rect(660,714,160,12,'ceiling-area') +
    rect(830,600,390,28,'ceiling-area') +
    rect(830,1095,390,28,'ceiling-area') +
    surfaceRect(830,350,400,230,'balcony-area','balcony_floor') +
    '</g>';
  svg += '<g class="windows">' +
    line(150,431,150,582,'window-line')+line(157,431,157,582,'window-line')+
    line(150,990,150,1142,'window-line')+line(157,990,157,1142,'window-line')+
    line(660,344,764,344,'window-line')+
    line(830,586,1020,586,'window-line')+line(830,596,1020,596,'window-line')+
    line(1040,586,1138,586,'window-line')+
    line(830,340,1108,340,'guard-line')+
    line(830,351,1108,351,'guard-line')+
    '</g>';
  svg += '<g class="structural-walls">' + STRUCTURAL_WALLS.map(v => surfaceRect(...v,'structural-wall','structural')).join('') + '</g>';
  svg += '<g class="drywall-walls">' + DRYWALL_WALLS.map(v => surfaceRect(...v,'drywall-wall','drywall')).join('') + '</g>';
  svg += '<g class="shaft-areas">' + SHAFTS.map(v => surfaceRect(...v,'shaft-box','shaft')).join('') + SHAFTS.map(([x,y,w,h]) => path(`M${x} ${y}l${w} ${h}m0 -${h}l-${w} ${h}`,'shaft-cross')).join('') + '</g>';
  svg += '<g class="fixtures">' +
    '<circle cx="1180" cy="520" r="23" class="fixture"/><circle cx="1180" cy="520" r="7" class="fixture"/>' +
    '<rect x="1151" y="852" width="75" height="150" rx="3" class="fixture"/><rect x="1169" y="895" width="42" height="62" rx="8" class="fixture"/>' +
    '<rect x="1145" y="620" width="80" height="77" rx="4" class="fixture"/><ellipse cx="1184" cy="653" rx="26" ry="17" class="fixture"/>' +
    '<ellipse cx="752" cy="560" rx="25" ry="35" class="fixture"/><ellipse cx="782" cy="650" rx="23" ry="23" class="fixture"/>' +
    '<ellipse cx="368" cy="752" rx="23" ry="34" class="fixture"/><ellipse cx="462" cy="739" rx="23" ry="23" class="fixture"/>' +
    '</g>';
  svg += '<g class="door-swing">' +
    path('M953 1247A124 124 0 0 1 1077 1123M953 1247h124','door-line') +
    path('M529 694A109 109 0 0 1 638 585M529 694h109','door-line') +
    path('M638 694A101 101 0 0 1 739 593M638 694h101','door-line') +
    path('M425 851A83 83 0 0 1 508 768M425 851h83','door-line') +
    path('M529 865A109 109 0 0 0 638 974M529 865h109','door-line') +
    '</g>';
  return `<g id="layer-architecture" class="plan-layer">${svg}</g>`;
};
const roomLabels = () => {
  const rows = [
    [399,510,["SUÍTE"]],[730,510,["BANHO","SUÍTE"]],
    [1000,490,["VARANDA"]],[1110,730,["ÁREA DE","SERVIÇO"]],
    [1080,900,["COZINHA"]],[831,950,["SALA"]],[319,815,["BANHO","SOCIAL"]],
    [390,1080,["DORMITÓRIO"]]
  ];
  return `<g id="room-labels">${rows.map(([x,y,lines])=>lines.map((t,i)=>`<text x="${x}" y="${yy(y)+(i-(lines.length-1)/2)*31}" class="room-label" text-anchor="middle">${t}</text>`).join("")).join('')}</g>`;
};
function point(x,y,label,type,title,description,page) {
  return `<g class="poi poi-${type}" role="button" tabindex="0" aria-label="${title}" data-title="${title}" data-description="${description}" data-page="${page}" transform="translate(${x} ${yy(y)})"><circle r="15" class="poi-hit"/><circle r="10" class="poi-disc"/><text text-anchor="middle" y="4.5">${label}</text></g>`;
}
function areaMarkers() {
  if(state.final===1)return '';
  return `<g id="layer-areas" class="plan-layer overlay-layer">${areaData().map(item=>{
    const description=item.open
      ? "Sala, cozinha, serviço e circulação aparecem juntos porque não há paredes separando esses usos. Valor aproximado."
      : "Valor aproximado, calculado a partir da planta. Meça no apartamento antes de comprar materiais.";
    return `<g class="area-marker" role="button" tabindex="0" aria-label="${item.name}: ${areaLabel(item.approx)}" data-title="${item.name}: ${areaLabel(item.approx)}" data-description="${description}" data-page="1" transform="translate(${item.x} ${state.final===4?item.y:yy(item.y)})"><rect x="-48" y="-15" width="96" height="30" rx="4"/><text text-anchor="middle" y="5">${areaLabel(item.approx)}</text></g>`;
  }).join('')}</g>`;
}
const electricPoints = () => {
  let s = LIGHTS.map(([x,y]) => point(x,y,"✦","light","Iluminação de teto","Ponto indicado na folha elétrica. Confirme a tensão e o circuito na unidade.",2)).join('');
  s += OUTLETS.map(([x,y]) => point(x,y,"T","outlet","Tomada indicada","Tomada representada na folha elétrica. Posição gráfica aproximada; confira altura e tensão no ponto real.",2)).join('');
  s += SWITCHES.map(([x,y]) => point(x,y,"I","switch","Interruptor indicado","Interruptor representado na folha elétrica. Observe a faixa de segurança de 20 cm descrita na folha.",2)).join('');
  s += point(754,415,"!","shower","Chuveiro elétrico","Ponto de chuveiro indicado como 220 V na folha elétrica. Confirme instalação e circuito.",2);
  s += point(221,767,"!","shower","Chuveiro elétrico","Ponto de chuveiro indicado como 220 V na folha elétrica. Confirme instalação e circuito.",2);
  s += point(989,1244,"Q","switch","Quadro de luz e força","Não execute furos na região do quadro. Consulte também a folha 3.",3);
  s += point(853,465,"C","systems","Ponto para condensadora","Posição indicada na folha elétrica; confira a folha de ar condicionado e as condições de ventilação.",2);
  return `<g id="layer-electric" class="plan-layer overlay-layer">${s}</g>`;
};
const hydraulicPoints = () => {
  const zones = [
    [735,555,6,"Banho da suíte"],
    [335,798,7,"Banho social"],
    [1107,881,8,"Cozinha e serviço"],
    [991,493,9,"Varanda"]
  ];
  return `<g id="layer-hydraulic" class="plan-layer overlay-layer">${zones.map(([x,y,p,title]) =>
    `<g class="hydro-zone" role="button" tabindex="0" aria-label="Abrir vista hidráulica: ${title}" data-title="Vista hidráulica: ${title}" data-description="Veja a planta original para localizar os pontos. O trajeto das tubulações não aparece aqui." data-page="${p}" transform="translate(${x} ${yy(y)})"><circle r="48" class="zone-ring"/><circle r="21" class="zone-disc"/><text y="6" text-anchor="middle">H</text></g>`).join('')}</g>`;
};
const systemsPoints = () => {
  let s = '';
  const stacks = [
    [188,727,"AP","Água pluvial"],[207,727,"V","Ventilação"],[225,727,"E","Esgoto"],
    [802,359,"AP","Água pluvial"],[802,413,"V","Ventilação"],[802,462,"E","Esgoto"],
    [1235,626,"E","Esgoto"],[1237,677,"G","Gás"]
  ];
  s += stacks.map(([x,y,code,title])=>point(x,y,code,"stack",title,"Prumada ou instalação indicada na folha 4. Não execute furos na região; consulte as vistas técnicas.",4)).join('');
  s += `<g class="system-area" role="button" tabindex="0" aria-label="Área prevista para condensadora" data-title="Condensadora de ar condicionado" data-description="Local previsto na folha 4. Preserve ventilação e acesso para manutenção." data-page="4">${rect(845,mirrored()?1068:403,38,99,"condenser-area")}</g>`;
  s += `<g class="system-area" role="button" tabindex="0" aria-label="Área prevista para evaporadora" data-title="Evaporadora de ar condicionado" data-description="Local previsto na folha 4; confirme instalação, dreno e medidas no imóvel." data-page="4">${rect(692,mirrored()?829:715,99,26,"evaporator-area")}</g>`;
  s += line(1225,yy(692),1225,yy(765),"gas-line");
  s += point(1204,727,"!","gas","Tubulação de gás","A folha 4 alerta sobre tubulação de gás na parede. Não fure; confirme a localização real e consulte as vistas.",4);
  return `<g id="layer-systems" class="plan-layer overlay-layer">${s}</g>`;
};
const drainPoints = () => `<g id="layer-drains" class="plan-layer overlay-layer">${point(783,783,"PD","drain","Ponto de dreno da sala","Indicado na folha 4. A folha 5 mostra o detalhe e a vista do dreno; o trajeto não está desenhado aqui.",5)}${point(783,466,"D","drain","Dreno do banho da suíte","Indicado na folha 4, próximo ao shaft. Consulte a vista hidráulica antes de intervir.",6)}</g>`;
function renderSvg() {
  if(state.final===4){
    $("#plan-stage").innerHTML=final4Svg();
    applyLayers();
    $("#plan-stage").querySelectorAll("[data-title]").forEach(el => {
      el.addEventListener("click", () => selectPoint(el));
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPoint(el); } });
    });
    return;
  }
  const transform = mirrored() ? 'translate(0 1570) scale(1 -1)' : '';
  const structure = `<g transform="${transform}">${baseShape()}</g>`;
  // Source sheet 4 and electrical markers are located on the same plan coordinates.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 260 1200 1080" role="group" aria-label="Planta vetorial do final ${state.final} com camadas selecionáveis">
  <defs><pattern id="drawing-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#29251d" stroke-width="0.6"/></pattern></defs>
  <rect x="100" y="260" width="1200" height="1080" fill="url(#drawing-grid)"/>
  ${structure}${roomLabels()}${hydraulicPoints()}${systemsPoints()}${drainPoints()}${electricPoints()}
  ${areaMarkers()}
  <text x="160" y="296" class="plate-title">FINAL ${state.final} <tspan> / </tspan> ${mirrored() ? "TIPO 3/6" : "TIPO 2/5"}</text>
  </svg>`;
  $("#plan-stage").innerHTML = svg;
  applyLayers();
  $("#plan-stage").querySelectorAll("[data-title]").forEach(el => {
    el.addEventListener("click", () => selectPoint(el));
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPoint(el); } });
  });
}
function get3DDots() {
  if(state.final===4)return FINAL4.dots;
  const make = (pairs,layer,label) => pairs.map(([x,y])=>({x,y,layer,label}));
  return [
    ...make(LIGHTS,"electric",""),
    ...make(OUTLETS,"electric","T"),
    ...make(SWITCHES,"electric","I"),
    ...[[735,555,6,"Banho da suíte"],[335,798,7,"Banho social"],[1107,881,8,"Cozinha e serviço"],[991,493,9,"Varanda"]].map(([x,y,page,room])=>({x,y,layer:"hydraulic",label:"H",page,title:`Vista hidráulica: ${room}`})),
    ...make([[188,727],[207,727],[225,727],[802,359],[802,413],[802,462],[1235,626],[1237,677],[853,465],[740,727],[1204,727]],"systems",""),
    {x:783,y:783,layer:"drains",label:"D",title:"Ponto de dreno da sala",page:5},
    {x:783,y:466,layer:"drains",label:"D",title:"Dreno do banho da suíte",page:6}
  ];
}
function render3D() {
  if (state.mode !== "3d" || state.final===1 || $("#plan-3d").hidden) return;
  const result=drawApartment3D($("#plan-3d"),{
    final:state.final, mirrored:mirrored(), layers:state.layers,
    opacity:state.opacity, view:state.view3d,
    structural:state.final===4?FINAL4.structural:STRUCTURAL_WALLS,
    drywall:state.final===4?FINAL4.drywall:DRYWALL_WALLS,
    shafts:state.final===4?FINAL4.shafts:SHAFTS,
    custom:state.final===4?FINAL4:null,
    dots:get3DDots()
  });
  state.hit3d=result?.hits||[];
  state.surfaceHits3d=result?.surfaces||[];
}
function syncMode() {
  const available = state.final!==1;
  $("#view-2d").disabled = !available;
  $("#view-3d").disabled = !available;
  $("#view-2d").setAttribute("aria-pressed",String(available && state.mode==="2d"));
  $("#view-3d").setAttribute("aria-pressed",String(available && state.mode==="3d"));
  $("#plan-stage").hidden = !available || state.mode!=="2d";
  $("#plan-3d").hidden = !available || state.mode!=="3d";
  $("#gesture-hint").hidden = !available || state.mode!=="3d";
  $("#map-status").textContent = !available ? "INDISPONÍVEL" : state.mode==="3d" ? "VISTA 3D" : "PLANTA 2D";
  $("#map-disclaimer").textContent = !available
    ? "Ainda não temos as plantas completas deste final."
    : state.mode==="3d"
      ? "Vista 3D ilustrativa. Confira medidas e instalações no imóvel antes de reformar."
      : "As posições são aproximadas. Confira medidas e instalações no imóvel antes de reformar.";
  $("#selection-kicker").textContent = !available ? "PLANTAS" : state.mode==="3d" ? "COMO USAR" : "COMO USAR";
  const info=$("#selection-info");
  if(available && state.mode==="3d"){
    info.dataset.view3d="true";
    info.innerHTML='<h2>Explore o 3D</h2><p>Arraste para girar. Toque em uma área ou ponto para ver detalhes e serviços.</p>';
  }else if(available && info.dataset.view3d){
    delete info.dataset.view3d;
    info.innerHTML='<h2>Explore a planta</h2><p>Toque em uma parede, piso ou símbolo para ver detalhes e serviços.</p>';
  }
  updateTransform();
  if (state.mode==="3d" && available) requestAnimationFrame(render3D);
}
function setMode(mode) {
  if (state.final!==1) {
    state.mode = mode;
    syncMode();
    const url=new URL(location.href);
    if(mode==="3d")url.searchParams.set("view","3d");
    else url.searchParams.delete("view");
    history.replaceState(null,"",url);
  }
}
function selectPoint(el) {
  const title = el.dataset.title;
  const description = el.dataset.description;
  const page = Number(el.dataset.page);
  $("#selection-info").innerHTML = `<h2>${title}</h2><a href="${docUrl(page)}" target="_blank" rel="noopener">Abrir planta original ↗</a>`;
  document.querySelectorAll(".selected-point").forEach(node=>node.classList.remove("selected-point"));
  el.classList.add("selected-point");
  const bounds=el.getBoundingClientRect();
  openTechPopover({title,description,page,surface:el.dataset.surface,layer:el.closest(".plan-layer")?.id.replace("layer-","")||"architecture"},{x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2},el);
}
const TECH_CHECKS={
  electric:"Confira a tensão e o circuito no apartamento antes de instalar equipamentos. Há divergência entre os documentos.",
  hydraulic:"Confira os pontos no apartamento e preserve as áreas impermeabilizadas.",
  systems:"Preserve ventilação e acesso de manutenção. Confirme a posição real antes de intervir.",
  drains:"Confira o dreno no apartamento. O desenho não mostra todo o trajeto da tubulação.",
  areas:"Valor aproximado. Meça no apartamento antes de comprar materiais ou planejar móveis."
};
const techPopover=$("#tech-popover");
const servicePopover=$("#service-popover");
let techSource=null;
let activePoint=null;
let compactServiceOpen=false;
function serviceContextFor(detail){
  if(detail.surface)return detail.surface;
  const title=detail.title.toLowerCase();
  if(detail.layer==="areas"){
    if(title.includes("banho"))return "room_wet";
    if(title.includes("varanda"))return "balcony_floor";
    if(title.includes("sala, cozinha"))return "room_mixed";
    return "room_dry";
  }
  if(detail.layer==="electric"){
    if(title.includes("chuveiro"))return "electric_shower";
    if(title.includes("quadro"))return "electric_panel";
    if(title.includes("exaustor"))return "electric_exhaust";
    if(title.includes("condensadora"))return "ac";
    if(title.includes("iluminação"))return "electric_light";
    return "electric_outlet";
  }
  if(detail.layer==="hydraulic")return "hydraulic";
  if(detail.layer==="drains")return "drain";
  if(detail.layer==="systems"){
    if(title.includes("gás"))return "gas";
    if(title.includes("condensadora") || title.includes("evaporadora") || title.includes("ar condicionado"))return "ac";
    return "stack";
  }
  return "room_dry";
}
function serviceIdsFor(detail){
  const context=serviceContextFor(detail);
  return SURFACE_CATALOG[context]?.services||SERVICE_CONTEXTS[context]||["vistoria"];
}
function renderServices(detail){
  const ids=serviceIdsFor(detail);
  $("#service-intro").textContent=`Para ${detail.title.toLowerCase()}, escolha um serviço:`;
  $("#service-list").innerHTML=ids.map(id=>{
    const service=SERVICE_CATALOG[id];
    return `<button type="button" data-service="${id}" aria-pressed="false"><span>${service.name}</span>${service.conditional?'<small>sob análise</small>':''}<b aria-hidden="true">→</b></button>`;
  }).join("");
  $("#service-results").hidden=true;
  $("#service-results").replaceChildren();
}
function positionPopovers(point){
  const bounds=$("#map-frame").getBoundingClientRect();
  const x=point.x-bounds.left,y=point.y-bounds.top;
  const margin=12,topMargin=50,gap=18;
  const keep=(value,min,max)=>Math.max(min,Math.min(max,value));
  const compact=bounds.width<750;
  techPopover.hidden=false;servicePopover.hidden=false;
  techPopover.style.visibility="hidden";servicePopover.style.visibility="hidden";
  $("#tech-services-button").hidden=!compact;
  $("#service-back").hidden=!compact;
  const tw=techPopover.offsetWidth,th=techPopover.offsetHeight;
  const sw=servicePopover.offsetWidth,sh=servicePopover.offsetHeight;
  let tl,sl;
  if(compact){
    tl=x+gap+tw<=bounds.width-margin?x+gap:x-gap-tw>=margin?x-gap-tw:keep(x-tw/2,margin,bounds.width-tw-margin);
    sl=keep(tl,margin,bounds.width-sw-margin);
  }else if(x-gap-sw>=margin && x+gap+tw<=bounds.width-margin){
    sl=x-gap-sw;tl=x+gap;
  }else if(x-gap-tw>=margin && x+gap+sw<=bounds.width-margin){
    tl=x-gap-tw;sl=x+gap;
  }else if(x+gap+tw+12+sw<=bounds.width-margin){
    tl=x+gap;sl=tl+tw+12;
  }else if(x-gap-sw-12-tw>=margin){
    sl=x-gap-sw;tl=sl-12-tw;
  }else{
    tl=margin;sl=bounds.width-margin-sw;
  }
  techPopover.style.left=`${Math.round(tl)}px`;
  techPopover.style.top=`${Math.round(keep(y-th/2,topMargin,bounds.height-th-margin))}px`;
  servicePopover.style.left=`${Math.round(sl)}px`;
  servicePopover.style.top=`${Math.round(keep(y-sh/2,topMargin,bounds.height-sh-margin))}px`;
  techPopover.style.visibility="";servicePopover.style.visibility="";
  if(compact){techPopover.hidden=compactServiceOpen;servicePopover.hidden=!compactServiceOpen;}
}
function openTechPopover({title,description,page=1,layer="architecture",surface},point,source=null){
  const detail={title,description,page,layer,surface};
  const layerName=LAYERS.find(item=>item.id===layer)?.name||"Arquitetura";
  const sheetName=SHEETS.find(item=>item[0]===page)?.[1]||"Planta original";
  $("#tech-layer").textContent=layerName.toUpperCase();
  $("#tech-title").textContent=title;
  $("#tech-description").textContent=description;
  $("#tech-source-name").textContent=`Folha ${page} · ${sheetName}`;
  $("#tech-check-text").textContent=SURFACE_CATALOG[surface]?.check||TECH_CHECKS[layer]||"Compare a marcação com a folha original e confira as condições reais da unidade antes de intervir.";
  $("#tech-source-link").href=docUrl(page);
  techSource=source;
  activePoint=point;
  compactServiceOpen=false;
  renderServices(detail);
  techPopover.classList.remove("is-appearing");
  servicePopover.classList.remove("is-appearing");
  positionPopovers(point);
  void techPopover.offsetWidth;
  techPopover.classList.add("is-appearing");
  if(!servicePopover.hidden)servicePopover.classList.add("is-appearing");
  $("#tech-close").focus();
}
function detailFor3DDot(dot){
  const defaults={
    electric:{title:dot.label==="T"?"Tomada indicada":dot.label==="I"?"Interruptor indicado":"Iluminação de teto",description:"Ponto representado na folha elétrica. A posição no volume é aproximada; confira altura, tensão e circuito na instalação real.",page:2},
    hydraulic:{title:"Vista hidráulica disponível",description:"O ponto indica um ambiente com vista hidráulica. O volume não representa o trajeto das tubulações.",page:6},
    systems:{title:"Prumada ou instalação indicada",description:"Elemento indicado na folha de ar, gás e prumadas. Confira a legenda e a posição real antes de qualquer intervenção.",page:4},
    drains:{title:"Dreno indicado",description:"Ponto de dreno indicado nas folhas técnicas. A posição no volume é aproximada; confira a vista original.",page:4}
  }[dot.layer];
  if(!defaults)return null;
  return {layer:dot.layer,title:dot.title||defaults.title,description:defaults.description,page:dot.page||defaults.page};
}
function detailForSurface(surface){
  const item=SURFACE_CATALOG[surface];
  return item?{layer:"architecture",surface,title:item.title,description:item.description,page:1}:null;
}
function showService(serviceId){
  const service=SERVICE_CATALOG[serviceId];
  if(!service)return;
  $("#service-list").querySelectorAll("button[data-service]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.service===serviceId)));
  const results=$("#service-results");
  results.replaceChildren();
  const heading=document.createElement("h3");heading.textContent=service.name;results.append(heading);
  const explanation=document.createElement("p");explanation.textContent=service.detail;results.append(explanation);
  if(service.conditional){
    const condition=document.createElement("p");condition.className="service-condition";
    condition.textContent="Este escopo depende de avaliação técnica e das autorizações aplicáveis. O anúncio não libera a obra.";
    results.append(condition);
  }
  const sponsors=SPONSORS.filter(item=>item.active && item.services?.includes(serviceId)).slice(0,MAX_SPONSORS_PER_SERVICE);
  if(!sponsors.length){
    const empty=document.createElement("p");empty.className="service-empty";
    empty.textContent="Ainda não há empresas cadastradas neste serviço.";
    results.append(empty);
  }else{
    sponsors.forEach(sponsor=>{
      const card=document.createElement("div");card.className="sponsor-card";
      const badge=document.createElement("small");badge.textContent="PUBLICIDADE";
      const name=document.createElement("strong");name.textContent=sponsor.name;
      card.append(badge,name);
      const phone=String(sponsor.whatsapp||"").replace(/\D/g,"");
      if(/^55\d{10,11}$/.test(phone)){
        const link=document.createElement("a");link.target="_blank";link.rel="noopener";
        link.href=`https://wa.me/${phone}?text=${encodeURIComponent(`Olá, vi seu anúncio de ${service.name} no site das plantas do Riviera.`)}`;
        link.textContent="Pedir orçamento ↗";card.append(link);
      }
      results.append(card);
    });
  }
  results.hidden=false;
  if(activePoint)requestAnimationFrame(()=>positionPopovers(activePoint));
}
$("#service-list").addEventListener("click",e=>{
  const button=e.target.closest("button[data-service]");
  if(button)showService(button.dataset.service);
});
$("#tech-services-button").addEventListener("click",()=>{
  compactServiceOpen=true;
  if(activePoint)positionPopovers(activePoint);
  $("#service-back").focus();
});
$("#service-back").addEventListener("click",()=>{
  compactServiceOpen=false;
  if(activePoint)positionPopovers(activePoint);
  $("#tech-close").focus();
});
function closeTechPopover(restoreFocus=false){
  if(techPopover.hidden && servicePopover.hidden)return;
  techPopover.hidden=true;servicePopover.hidden=true;
  techPopover.classList.remove("is-appearing");servicePopover.classList.remove("is-appearing");
  if(restoreFocus)(techSource?.isConnected?techSource:$(state.mode==="3d"?"#view-3d":"#view-2d")).focus();
  techSource=null;activePoint=null;compactServiceOpen=false;
}
$("#tech-close").addEventListener("click",()=>closeTechPopover(true));
$("#service-close").addEventListener("click",()=>closeTechPopover(true));
document.addEventListener("pointerdown",e=>{if((!techPopover.hidden||!servicePopover.hidden) && !techPopover.contains(e.target) && !servicePopover.contains(e.target) && !e.target.closest("[data-title]"))closeTechPopover();});
document.addEventListener("keydown",e=>{if(e.key==="Escape" && (!techPopover.hidden||!servicePopover.hidden)){e.preventDefault();closeTechPopover(true);}});
function applyLayers() {
  LAYERS.forEach(({id}) => {
    const el = document.getElementById(`layer-${id}`);
    if (el) {
      const visible = !!state.layers[id];
      el.style.display = visible ? "" : "none";
      el.setAttribute("aria-hidden", String(!visible));
      el.querySelectorAll("[tabindex]").forEach(point => point.setAttribute("tabindex", visible ? "0" : "-1"));
      if (!visible && el.querySelector(".selected-point")) {
        $("#selection-info").innerHTML = '<h2>Explore a planta</h2><p>Clique em paredes, pisos ou símbolos para ver detalhes técnicos e serviços relacionados.</p>';
      }
    }
  });
  const labels = document.getElementById("room-labels");
  if (labels) {
    labels.style.display = state.layers.architecture ? "" : "none";
    labels.setAttribute("aria-hidden", String(!state.layers.architecture));
  }
  $("#plan-stage").style.setProperty("--overlay-opacity", state.opacity);
  $("#layer-list").querySelectorAll("input").forEach(input => { input.checked = !!state.layers[input.dataset.layer]; });
  renderDimensions();
  renderAreas();
  renderManualTips();
  render3D();
}
function renderLayerControls() {
  $("#layer-list").innerHTML = LAYERS.map(layer => `<label class="layer-row"><span class="layer-color" style="--layer-color:${layer.color}"></span><span class="layer-copy"><strong>${layer.name}</strong><small>${layer.detail}</small></span><input type="checkbox" data-layer="${layer.id}" ${state.layers[layer.id] ? "checked" : ""}><span class="switch" aria-hidden="true"></span></label>`).join("");
  $("#layer-list").addEventListener("change", e => { if (e.target.matches("input[data-layer]")) { state.layers[e.target.dataset.layer] = e.target.checked; applyLayers(); } });
  $("#legend").innerHTML = LEGENDA.map(([cls,name])=>`<div><i class="${cls}"></i><span>${name}</span></div>`).join("");
}
function renderSources() {
  $("#source-list").innerHTML = SHEETS.map(([page,title,detail])=>`<a href="${docUrl(page)}" target="_blank" rel="noopener"><b>${String(page).padStart(2,"0")}</b><span><strong>${title}</strong><small>${detail}</small></span><i aria-hidden="true">↗</i></a>`).join("");
}
function renderManualTips() {
  const available=state.final!==1;
  const selected=MANUAL_TIPS.filter(tip=>tip.always || (available && tip.layers.some(layer=>state.layers[layer])) || (!available && ["estrutura","furacao"].includes(tip.id)));
  $("#manual-tip-list").innerHTML=selected.map(tip=>`<a class="manual-tip" href="assets/docs/manual-proprietario.pdf#page=${tip.page}" target="_blank" rel="noopener"><strong>${tip.title}</strong><span>${tip.text}</span><small>Manual · p. ${tip.page} ↗</small></a>`).join("");
}
function renderDimensions() {
  const panel=$("#measurement-section");
  const badge=$("#dimension-status");
  panel.hidden=!state.layers.dimensions;
  badge.hidden=!state.layers.dimensions || state.final===1;
  if(panel.hidden)return;
  if(state.final===1){
    $("#measurement-content").innerHTML='<p>Ainda não temos medidas verificadas para o final 1.</p>';
    return;
  }
  $("#measurement-content").innerHTML=`<p><strong>A planta não informa o comprimento de cada parede.</strong> Meça no apartamento antes de comprar materiais ou encomendar móveis.</p><a href="${docUrl(1)}" target="_blank" rel="noopener">Abrir planta original ↗</a>`;
}
function renderAreas() {
  const panel=$("#area-section");
  const badge=$("#area-status");
  panel.hidden=!state.layers.areas;
  badge.hidden=!state.layers.areas || state.final===1;
  if(panel.hidden)return;
  if(state.final===1){
    $("#area-content").innerHTML='<p>Ainda não temos áreas verificadas para o final 1.</p>';
    return;
  }
  $("#area-content").innerHTML=`<p>Valores aproximados para planejamento inicial. Meça no apartamento antes de comprar materiais.</p><div class="area-list">${areaData().map(item=>`<div><span>${item.name}</span><strong>${areaLabel(item.approx)}</strong></div>`).join('')}</div><p>Sala, cozinha, serviço e circulação aparecem juntos porque não há paredes separando esses usos.</p><a href="${docUrl(1)}" target="_blank" rel="noopener">Abrir planta original ↗</a>`;
}
function setFinal(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 6) {
    $("#final-result").innerHTML = '<strong>Digite um final de 1 a 6.</strong>';
    return;
  }
  state.final = n;
  $("#final-input").value = String(n);
  const available = n!==1;
  if (!available) state.mode = "2d";
  $("#final-result").innerHTML = available
    ? `<strong>Final ${n}</strong><span>Plantas disponíveis.</span>`
    : '<strong>Final 1</strong><span>Plantas completas ainda indisponíveis.</span>';
  $("#final-result").classList.toggle("pending", !available);
  document.querySelectorAll("[data-final]").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.final)===n)));
  $("#map-title").textContent = available ? `Planta do final ${n}` : `Final ${n} comum`;
  $("#map-description").textContent = available ? (n===4 ? "Apartamento comum · final 4" : `Plantas dos finais ${[2,5].includes(n) ? "2 e 5" : "3 e 6"}`) : "Plantas completas ainda indisponíveis";
  $(".layers-section").classList.toggle("is-disabled", !available);
  $("#layer-list").querySelectorAll("input").forEach(input => input.disabled = !available);
  $("#show-all").disabled = !available;
  $("#show-base").disabled = !available;
  $("#overlay-opacity").disabled = !available;
  $("#empty-state").hidden = available;
  $(".map-tools").hidden = !available;
  $("#main-source").hidden = !available;
  if (available) {
    $("#main-source").href = docUrl(1);
    renderSvg();
    renderSources();
    $("#selection-info").innerHTML = '<h2>Explore a planta</h2><p>Toque em uma parede, piso ou símbolo para ver detalhes e serviços.</p>';
  } else {
    $("#empty-state").innerHTML = '<div class="empty-symbol">◇</div><h2>Final 1</h2><p>Ainda não temos as plantas completas deste final. Não use a planta de outro final para planejar a reforma.</p>';
    $("#source-list").innerHTML = '<p class="no-sources">As plantas do final 1 ainda não estão disponíveis.</p>';
    $("#selection-info").innerHTML = '<h2>Plantas indisponíveis</h2><p>Peça as plantas oficiais do seu apartamento à administração.</p>';
  }
  renderManualTips();
  renderDimensions();
  renderAreas();
  state.zoom=1; state.panX=0; state.panY=0; syncMode();
  const url = new URL(location.href); url.searchParams.set("final",String(n)); url.searchParams.delete("folha"); if(!available)url.searchParams.delete("view"); history.replaceState(null,"",url);
}
function updateTransform() {
  $("#plan-stage").style.transform = `translate(${state.panX}px,${state.panY}px) scale(${state.zoom})`;
  $("#zoom-value").textContent = `${Math.round((state.mode==="3d"?state.view3d.zoom:state.zoom)*100)}%`;
  render3D();
}
function changeZoom(factor) {
  if (state.mode==="3d") state.view3d.zoom = Math.max(.55,Math.min(3.5,+(state.view3d.zoom*factor).toFixed(2)));
  else state.zoom = Math.max(0.7,Math.min(3.4,+(state.zoom*factor).toFixed(2)));
  updateTransform();
}
const layout=$(".app-layout");
function togglePanel(side){
  const isLeft=side==="left";
  const className=isLeft?"hide-left":"hide-right";
  const button=$(isLeft?"#toggle-controls":"#toggle-details");
  const willHide=!layout.classList.contains(className);
  layout.classList.toggle(className,willHide);
  button.setAttribute("aria-expanded",String(!willHide));
  button.setAttribute("aria-label",`${willHide?"Abrir":"Recolher"} ${isLeft?"controles":"detalhes"}`);
  button.querySelector(".toggle-icon").textContent=isLeft?(willHide?"▶":"◀"):(willHide?"◀":"▶");
  requestAnimationFrame(render3D);
}
$("#toggle-controls").addEventListener("click",()=>togglePanel("left"));
$("#toggle-details").addEventListener("click",()=>togglePanel("right"));
renderLayerControls();
$("#final-submit").addEventListener("click",()=>setFinal($("#final-input").value));
$("#final-input").addEventListener("keydown",e=>{ if(e.key==="Enter") setFinal(e.currentTarget.value); });
$("#final-input").addEventListener("input",e=>{ if (/^[1-6]$/.test(e.currentTarget.value)) setFinal(e.currentTarget.value); });
document.querySelectorAll("[data-final]").forEach(b=>b.addEventListener("click",()=>setFinal(b.dataset.final)));
$("#show-all").addEventListener("click",()=>{ LAYERS.forEach(l=>state.layers[l.id]=true); applyLayers(); });
$("#show-base").addEventListener("click",()=>{ LAYERS.forEach(l=>state.layers[l.id]=l.id==="architecture"); applyLayers(); });
$("#overlay-opacity").addEventListener("input",e=>{ state.opacity=Number(e.target.value)/100; $("#opacity-value").textContent=`${e.target.value}%`; applyLayers(); });
$("#view-2d").addEventListener("click",()=>setMode("2d"));
$("#view-3d").addEventListener("click",()=>setMode("3d"));
$("#zoom-in").addEventListener("click",()=>changeZoom(1.2));
$("#zoom-out").addEventListener("click",()=>changeZoom(1/1.2));
$("#zoom-fit").addEventListener("click",()=>{
  if(state.mode==="3d") state.view3d={yaw:-.5,tilt:.77,zoom:1,panX:0,panY:0};
  else {state.zoom=1;state.panX=0;state.panY=0;}
  updateTransform();
});
$("#map-frame").addEventListener("wheel",e=>{
  if(e.target.closest("#tech-popover,#service-popover"))return;
  if (state.final===1) return;
  e.preventDefault();
  changeZoom(e.deltaY<0?1.1:1/1.1);
},{passive:false});
let drag2d=null;
const activePointers=new Map();
let gesture3d=null;
let tap3d=null;
const frame=$("#map-frame");
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function insidePolygon(x,y,points){
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const [xi,yi]=points[i],[xj,yj]=points[j];
    if((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
  }
  return inside;
}
function pick3D(x,y){
  const dot=(state.hit3d||[]).filter(item=>Math.hypot(item.x-x,item.y-y)<=item.r).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
  if(dot)return {dot,x:dot.x,y:dot.y};
  for(let i=(state.surfaceHits3d||[]).length-1;i>=0;i--){
    const item=state.surfaceHits3d[i];
    if(insidePolygon(x,y,item.points))return {surface:item.surface,x,y};
  }
  return null;
}
function beginTwoFingerGesture(){
  const points=[...activePointers.values()];
  if(points.length<2)return;
  const [a,b]=points;
  gesture3d={
    centerX:(a.x+b.x)/2,centerY:(a.y+b.y)/2,
    distance:Math.max(20,Math.hypot(b.x-a.x,b.y-a.y)),
    angle:Math.atan2(b.y-a.y,b.x-a.x),
    ...state.view3d
  };
}
frame.addEventListener("pointerdown",e=>{
  if (state.final===1 || e.target.closest("button,a,[data-title],#tech-popover,#service-popover")) return;
  frame.setPointerCapture(e.pointerId);
  frame.classList.add("dragging");
  if(state.mode==="2d"){
    drag2d={id:e.pointerId,x:e.clientX,y:e.clientY,panX:state.panX,panY:state.panY};
  }else{
    activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
    if(activePointers.size>=2){tap3d=null;beginTwoFingerGesture();}
    else tap3d={id:e.pointerId,x:e.clientX,y:e.clientY};
  }
});
frame.addEventListener("pointermove",e=>{
  if(state.mode==="2d"){
    if(!drag2d || drag2d.id!==e.pointerId)return;
    state.panX=drag2d.panX+e.clientX-drag2d.x;
    state.panY=drag2d.panY+e.clientY-drag2d.y;
    updateTransform();
    return;
  }
  const previous=activePointers.get(e.pointerId);
  if(!previous){
    if(!e.target.closest("#tech-popover,#service-popover")){
      const bounds=$("#plan-3d").getBoundingClientRect();
      $("#plan-3d").style.cursor=pick3D(e.clientX-bounds.left,e.clientY-bounds.top)?"pointer":"grab";
    }
    return;
  }
  if(tap3d?.id===e.pointerId && Math.hypot(e.clientX-tap3d.x,e.clientY-tap3d.y)>9)tap3d=null;
  activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
  if(activePointers.size>=2 && gesture3d){
    const [a,b]=[...activePointers.values()];
    const centerX=(a.x+b.x)/2;
    const centerY=(a.y+b.y)/2;
    const distance=Math.hypot(b.x-a.x,b.y-a.y);
    const angle=Math.atan2(b.y-a.y,b.x-a.x);
    let rotation=angle-gesture3d.angle;
    if(rotation>Math.PI)rotation-=2*Math.PI;
    if(rotation< -Math.PI)rotation+=2*Math.PI;
    state.view3d.yaw=gesture3d.yaw+rotation;
    state.view3d.tilt=clamp(gesture3d.tilt+(centerY-gesture3d.centerY)*.006,.08,1.25);
    state.view3d.zoom=clamp(gesture3d.zoom*distance/gesture3d.distance,.55,3.5);
    state.view3d.panX=gesture3d.panX+(centerX-gesture3d.centerX);
  }else if(e.pointerType==="mouse" || e.pointerType==="pen"){
    state.view3d.yaw+=(e.clientX-previous.x)*.008;
    state.view3d.tilt=clamp(state.view3d.tilt+(e.clientY-previous.y)*.006,.08,1.25);
  }else{
    state.view3d.panX+=e.clientX-previous.x;
    state.view3d.panY+=e.clientY-previous.y;
  }
  updateTransform();
});
function endPointer(e){
  if(e.type==="pointerup" && state.mode==="3d" && tap3d?.id===e.pointerId && activePointers.size===1){
    const bounds=$("#plan-3d").getBoundingClientRect();
    const x=e.clientX-bounds.left,y=e.clientY-bounds.top;
    const hit=pick3D(x,y);
    if(hit){
      const detail=hit.dot?detailFor3DDot(hit.dot):detailForSurface(hit.surface);
      if(detail)openTechPopover(detail,{x:bounds.left+hit.x,y:bounds.top+hit.y});
    }
  }
  tap3d=null;
  drag2d=null;
  activePointers.delete(e.pointerId);
  gesture3d=null;
  if(activePointers.size>=2)beginTwoFingerGesture();
  if(!activePointers.size)frame.classList.remove("dragging");
}
frame.addEventListener("pointerup",endPointer);
frame.addEventListener("pointercancel",endPointer);
new ResizeObserver(()=>render3D()).observe(frame);
const initialParams = new URLSearchParams(location.search);
state.mode = initialParams.get("view")==="3d" ? "3d" : "2d";
const initial = Number(initialParams.get("final"));
setFinal(Number.isInteger(initial)&&initial>=1&&initial<=6?initial:2);
