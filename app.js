const LAYERS = [
  { id: "architecture", name: "Paredes e pisos", detail: "ambientes e shafts", color: "#cba56a", page: 1 },
  { id: "areas", name: "Áreas", detail: "m² aproximados", color: "#8bd4a3", page: 1 },
  { id: "dimensions", name: "Medidas", detail: "quartos e paredes identificadas", color: "#d8c69e", page: 1 },
  { id: "electric", name: "Elétrica", detail: "pontos e comandos", color: "#61c9ec", page: 2 },
  { id: "hydraulic", name: "Hidráulica", detail: "pontos por ambiente", color: "#4f9cf4", page: 6 },
  { id: "systems", name: "Ar, gás e prumadas", detail: "pontos e cuidados", color: "#e99559", page: 4 },
  { id: "drains", name: "Drenos", detail: "pontos indicados", color: "#ca82e7", page: 4 }
];
const LEGENDA = [
  ["swatch structural", "Alvenaria estrutural"],
  ["swatch masonry", "Alvenaria (não estrutural)"],
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
  one: [
    { name:"Dormitório", approx:10.2, x:646, y:578 },
    { name:"Suíte", approx:11.0, x:901, y:858 },
    { name:"Banho da suíte", approx:3.7, x:851, y:579 },
    { name:"Banho social", approx:3.2, x:706, y:860 },
    { name:"Varanda", approx:5.7, x:403, y:566 },
    { name:"Sala, cozinha, serviço e circulação", approx:26.5, x:515, y:840, open:true }
  ],
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
const ROOM_DIMENSIONS = {
  pair: [
    { name:"Suíte", size:"3,76 × 2,71 m", x:400, y:450 },
    { name:"Dormitório", size:"3,76 × 2,86 m", x:390, y:1010 }
  ],
  four: [
    { name:"Suíte", size:"3,31 × 3,31 m", x:904, y:530 },
    { name:"Dormitório", size:"3,76 × 2,71 m", x:637, y:800 }
  ],
  one: [
    { name:"Suíte", size:"3,31 × 3,31 m", x:904, y:780 },
    { name:"Dormitório", size:"3,76 × 2,71 m", x:644, y:551 }
  ]
};
// Cotas de trechos legíveis nas folhas, sem tratá-las como dimensões totais de ambientes irregulares.
const SEGMENT_DIMENSIONS = {
  pair: [
    { name:"Sala", detail:"parede da sala junto à entrada", size:"3,16 m", label:"SALA · PAREDE DA ENTRADA", short3d:"SALA · ENTRADA", line:[660,1226,953,1226], plate:[805,1167,214] },
    { name:"Cozinha", detail:"parede da cozinha junto à bancada", size:"3,17 m", label:"COZINHA · PAREDE DA BANCADA", short3d:"COZINHA · BANCADA", line:[1208,780,1208,1080], plate:[1085,1010,218] },
    { name:"Área de serviço", detail:"parede que separa o serviço da sala", size:"1,40 m" },
    { name:"Banho social", detail:"parede do banheiro junto à porta", size:"2,71 m" },
    { name:"Banho da suíte", detail:"parede lateral entre banheiro e suíte", size:"2,70 m" },
    { name:"Varanda", detail:"borda externa reta da varanda", size:"2,20 m", label:"VARANDA · BORDA EXTERNA", short3d:"VARANDA · BORDA", line:[835,358,1108,358], plate:[972,411,196] },
    { name:"Hall", detail:"passagem entre dormitório e banho social", size:"1,05 m" }
  ],
  four: [
    { name:"Sala", detail:"parede entre sala e banho social", size:"2,25 m", label:"SALA · PAREDE DO BANHO", short3d:"SALA · BANHO", line:[639,484,639,637], plate:[545,555,150] },
    { name:"Cozinha", detail:"parede da cozinha junto à bancada", size:"1,65 m", label:"COZINHA · BANCADA", short3d:"COZINHA · BANCADA", line:[257,508,370,508], plate:[314,551,142] },
    { name:"Área de serviço", detail:"parede lateral da área de serviço", size:"1,40 m" },
    { name:"Banho social", detail:"parede curta entre suíte e shaft", size:"1,19 m" },
    { name:"Banho da suíte", detail:"parede curta junto ao shaft", size:"1,04 m" },
    { name:"Varanda", detail:"parede lateral junto ao dormitório", size:"1,81 m", label:"VARANDA · LATERAL", short3d:"VARANDA · LATERAL", line:[484,813,484,942], plate:[396,915,140] }
  ],
  one: [
    { name:"Sala", detail:"parede da sala junto à entrada", size:"2,45 m", label:"SALA · ENTRADA", short3d:"SALA · ENTRADA", line:[455,960,642,960], plate:[550,913,150] },
    { name:"Cozinha", detail:"parede da cozinha junto à bancada", size:"3,17 m", label:"COZINHA · BANCADA", short3d:"COZINHA · BANCADA", line:[250,715,250,940], plate:[339,841,156] },
    { name:"Área de serviço", detail:"parede lateral da área de serviço", size:"1,40 m" },
    { name:"Banho social", detail:"parede curta junto ao shaft", size:"1,04 m" },
    { name:"Banho da suíte", detail:"parede curta junto ao shaft", size:"1,19 m" },
    { name:"Varanda", detail:"borda externa reta da varanda", size:"2,20 m", label:"VARANDA · BORDA", short3d:"VARANDA · BORDA", line:[330,486,492,486], plate:[408,535,150] }
  ]
};
const state = {
  final: 2,
  layers: { architecture: true, electric: false, hydraulic: false, systems: false, drains: false, dimensions: false, areas: false },
  cooling: false,
  opacity: 0.85, zoom: 1, panX: 0, panY: 0, mode: "2d",
  activeDimension3d: 0,
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
// Rafael informou em 28/10/2026 que, nos finais comuns de todas as torres,
// Na churrasqueira e no serviço, só os trechos colados às paredes são drywall.
// A divisória central do serviço é alvenaria informada; a planta original diverge.
const MASONRY_WALLS = [
  [160,735,128,20],[160,865,365,20],[506,714,20,53],[506,850,20,35],
  [770,350,10,129],
  [1020,580,20,198],[638,679,20,15]
];
const DRYWALL_WALLS = [[1210,600,20,112],[1210,710,20,8],[1210,350,20,120],[1110,350,20,120]];
const SHAFTS = [[161,714,121,40],[772,352,39,125],[1201,351,30,119],[1212,600,32,114]];
const LIGHTS = [[400,515],[734,515],[998,462],[1126,675],[857,795],[1126,936],[857,1070],[400,1070],[590,780],[334,780]];
const OUTLETS = [[248,370],[499,370],[338,679],[514,679],[770,678],[1191,558],[1170,745],[1212,745],[1170,874],[1212,874],[1170,967],[1212,967],[1212,1028],[176,1056],[500,1229],[848,1229],[899,1229],[675,878],[514,898],[488,752]];
const SWITCHES = [[248,402],[514,644],[667,581],[1026,567],[1132,478],[514,936],[708,875],[727,875],[898,1195],[1115,1068],[1115,1084],[453,751],[534,752]];
const $ = (selector) => document.querySelector(selector);
const themeToggle = $("#theme-toggle");
function applyTheme(theme,save=false){
  const dark=theme==="dark";
  document.documentElement.dataset.theme=dark?"dark":"light";
  themeToggle.setAttribute("aria-pressed",String(dark));
  themeToggle.setAttribute("aria-label",dark?"Ativar tema claro":"Ativar tema escuro");
  themeToggle.querySelector(".theme-icon").textContent=dark?"☀":"☾";
  themeToggle.querySelector(".theme-label").textContent=dark?"Tema claro":"Tema escuro";
  $("#browser-theme-color").content=dark?"#0b0b0a":"#f6f2e9";
  if(save){try{localStorage.setItem("riviera-theme",dark?"dark":"light")}catch{}}
  render3D();
}
themeToggle.addEventListener("click",()=>applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark",true));
applyTheme(document.documentElement.dataset.theme);
const docName = () => state.final===1 ? "final-1-comum" : state.final===4 ? "final-4-comum" : [2,5].includes(state.final) ? "finais-2-5" : "finais-3-6";
const docUrl = (page = 1) => `assets/docs/${docName()}.pdf#page=${page}`;
const mirrored = () => [3,6].includes(state.final);
const yy = (y) => mirrored() ? 1570 - y : y;
const areaData = () => state.final===1 ? AREA_ESTIMATES.one : state.final===4 ? AREA_ESTIMATES.four : AREA_ESTIMATES.pair;
const areaLabel = (approx) => `≈${Math.round(approx)} m²`;
const dimensionData = () => state.final===1?ROOM_DIMENSIONS.one:state.final===4?ROOM_DIMENSIONS.four:ROOM_DIMENSIONS.pair;
const segmentData = () => state.final===1?SEGMENT_DIMENSIONS.one:state.final===4?SEGMENT_DIMENSIONS.four:SEGMENT_DIMENSIONS.pair;
const dimensionDocUrl = () => `assets/docs/cotadas/final-${({2:5,6:3})[state.final]||state.final}.pdf`;
function dimensionMarkers() {
  const small=[1,4].includes(state.final);
  return `<g id="layer-dimensions" class="plan-layer overlay-layer dimension-markers" aria-label="Medidas cotadas de cômodos e trechos">${dimensionData().map(item=>{
    const x=item.x,y=small?item.y:yy(item.y),width=small?205:278,height=small?47:62;
    return `<g transform="translate(${x} ${y})"><rect x="${-width/2}" y="${-height/2}" width="${width}" height="${height}" rx="6"/><text y="${small?-5:-7}" text-anchor="middle" class="dimension-room">${item.name.toUpperCase()}</text><text y="${small?16:22}" text-anchor="middle" class="dimension-value">${item.size}</text></g>`;
  }).join("")}${segmentData().filter(item=>item.line).map(item=>{
    const [x1,rawY1,x2,rawY2]=item.line,[cx,rawCy,width]=item.plate;
    const y1=small?rawY1:yy(rawY1),y2=small?rawY2:yy(rawY2),cy=small?rawCy:yy(rawCy);
    const horizontal=y1===y2,height=small?36:48,tick=small?7:10;
    const ticks=horizontal
      ? `<path d="M${x1} ${y1-tick}V${y1+tick}M${x2} ${y2-tick}V${y2+tick}"/>`
      : `<path d="M${x1-tick} ${y1}H${x1+tick}M${x2-tick} ${y2}H${x2+tick}"/>`;
    const leader=horizontal
      ? `M${cx} ${cy+(cy<y1?height/2:-height/2)}V${y1}`
      : `M${cx+(cx<x1?width/2:-width/2)} ${cy}H${x1}`;
    return `<g class="segment-measure" aria-label="${item.name}: ${item.detail}, ${item.size}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><path d="${ticks}"/><path class="measure-leader" d="${leader}"/><rect x="${cx-width/2}" y="${cy-height/2}" width="${width}" height="${height}" rx="5"/><text x="${cx}" y="${cy-(small?3:5)}" text-anchor="middle" class="segment-room">${item.label}</text><text x="${cx}" y="${cy+(small?11:16)}" text-anchor="middle" class="segment-value">${item.size}</text></g>`;
  }).join("")}</g>`;
}
const coolingOutline = () => state.final===1
  ? [[395,740],[637,740],[637,929],[395,929]]
  : state.final===4 ? [[390,493],[630,493],[630,710],[390,710]]
  : [[680,750],[1015,750],[1015,1080],[680,1080]];
function coolingOverlaySvg() {
  const shape=coolingOutline().map(([x,y])=>`${x},${y}`).join(" ");
  const transform=mirrored()? ' transform="translate(0 1570) scale(1 -1)"' : '';
  const small=[1,4].includes(state.final);
  const centerX=state.final===1?515:small?510:847;
  const top=state.final===1?748:small?503:mirrored()?502:762;
  const width=small?224:284;
  const height=small?64:77;
  return `<g id="cooling-overlay" class="cooling-overlay" aria-hidden="true"><polygon points="${shape}"${transform}/><rect class="cooling-label-plate" x="${centerX-width/2}" y="${top}" width="${width}" height="${height}" rx="7"/><text x="${centerX}" y="${top+(small?18:24)}" text-anchor="middle">❄ AR 9.000 BTU/h</text><text x="${centerX}" y="${top+(small?39:48)}" text-anchor="middle" class="cooling-range">10–15 m² sem sol direto</text><text x="${centerX}" y="${top+(small?55:67)}" text-anchor="middle" class="cooling-subtitle">CONTORNO ILUSTRATIVO</text></g>`;
}
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
  svg += '<g class="masonry-walls">' + MASONRY_WALLS.map(v => surfaceRect(...v,'masonry-wall','masonry')).join('') + '</g>';
  svg += '<g class="shaft-areas">' + SHAFTS.map(v => surfaceRect(...v,'shaft-box','shaft')).join('') + SHAFTS.map(([x,y,w,h]) => path(`M${x} ${y}l${w} ${h}m0 -${h}l-${w} ${h}`,'shaft-cross')).join('') + '</g>';
  svg += '<g class="drywall-walls">' + DRYWALL_WALLS.map(v => surfaceRect(...v,'drywall-wall','drywall')).join('') + '</g>';
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
  return `<g id="layer-areas" class="plan-layer overlay-layer">${areaData().map(item=>{
    const description=item.open
      ? "Sala, cozinha, serviço e circulação aparecem juntos porque não há paredes separando esses usos. Valor aproximado."
      : "Valor aproximado, calculado a partir da planta. Meça no apartamento antes de comprar materiais.";
    return `<g class="area-marker" role="button" tabindex="0" aria-label="${item.name}: ${areaLabel(item.approx)}" data-title="${item.name}: ${areaLabel(item.approx)}" data-description="${description}" data-page="1" transform="translate(${item.x} ${[1,4].includes(state.final)?item.y:yy(item.y)})"><rect x="-48" y="-15" width="96" height="30" rx="4"/><text text-anchor="middle" y="5">${areaLabel(item.approx)}</text></g>`;
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
  if([1,4].includes(state.final)){
    $("#plan-stage").innerHTML=state.final===1?final1Svg():final4Svg();
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
  ${structure}${coolingOverlaySvg()}${roomLabels()}${dimensionMarkers()}${hydraulicPoints()}${systemsPoints()}${drainPoints()}${electricPoints()}
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
  if(state.final===1)return FINAL1.dots;
  if(state.final===4)return FINAL4.dots;
  const make = (pairs,layer,label) => pairs.map(([x,y])=>({x,y,layer,label}));
  const stacks = [
    [188,727,"AP","Água pluvial"],[207,727,"V","Ventilação"],[225,727,"E","Esgoto"],
    [802,359,"AP","Água pluvial"],[802,413,"V","Ventilação"],[802,462,"E","Esgoto"],
    [1235,626,"E","Esgoto"],[1237,677,"G","Gás"]
  ];
  const dots=[
    ...make(LIGHTS,"electric",""),
    ...make(OUTLETS,"electric","T"),
    ...make(SWITCHES,"electric","I"),
    {x:754,y:415,layer:"electric",label:"!",title:"Chuveiro elétrico",description:"Ponto de chuveiro indicado como 220 V na folha elétrica. Confirme instalação e circuito no imóvel.",page:2},
    {x:221,y:767,layer:"electric",label:"!",title:"Chuveiro elétrico",description:"Ponto de chuveiro indicado como 220 V na folha elétrica. Confirme instalação e circuito no imóvel.",page:2},
    {x:989,y:1244,layer:"electric",label:"Q",title:"Quadro de luz e força",description:"Não execute furos na região do quadro. Consulte também a folha 3 e confira a posição real.",page:3},
    {x:853,y:465,id:"condenser-electric",layer:"electric",label:"C",title:"Ponto para condensadora",description:"Ponto indicado na folha elétrica. Confira a folha de ar condicionado e preserve ventilação e acesso de manutenção.",page:2},
    ...[[735,555,6,"Banho da suíte"],[335,798,7,"Banho social"],[1107,881,8,"Cozinha e serviço"],[991,493,9,"Varanda"]].map(([x,y,page,room])=>({x,y,layer:"hydraulic",label:"H",page,title:`Vista hidráulica: ${room}`})),
    ...stacks.map(([x,y,label,title])=>({x,y,layer:"systems",label,title,description:title==="Gás"?"Prumada de gás indicada na folha 4. Não fure; confira a posição real antes de intervir.":"Prumada indicada na folha 4. Preserve o acesso e consulte as vistas técnicas antes de intervir.",page:4})),
    {x:864,y:452,id:"condenser-systems",layer:"systems",label:"C",title:"Condensadora de ar condicionado",description:"Local previsto na folha 4. Preserve ventilação e acesso de manutenção; confirme a posição no imóvel.",page:4},
    {x:741,y:728,layer:"systems",label:"EV",title:"Evaporadora de ar condicionado",description:"Local previsto na folha 4. Confirme instalação, dreno e medidas no imóvel.",page:4},
    {x:1204,y:727,layer:"systems",label:"!",title:"Tubulação de gás",description:"A folha 4 alerta sobre tubulação de gás nesta parede. Não fure; confira a localização real e consulte as vistas.",page:4},
    {x:783,y:783,layer:"drains",label:"D",title:"Ponto de dreno da sala",page:5},
    {x:783,y:466,layer:"drains",label:"D",title:"Dreno do banho da suíte",page:6}
  ];
  if(state.layers.electric&&state.layers.systems){
    return dots.filter(dot=>dot.id!=="condenser-electric"&&dot.id!=="condenser-systems").concat({x:859,y:459,layer:"systems",label:"C",title:"Condensadora: elétrica e local previsto",description:"A folha 2 indica o ponto elétrico; a folha 4 mostra o local previsto para a condensadora. Confirme posição, circuito, ventilação e acesso no imóvel.",page:4,secondaryPage:2});
  }
  return dots;
}
function dimensionEntries3D(){
  return [...dimensionData().map(item=>({name:item.name,size:item.size,detail:"medida do cômodo"})),...segmentData().filter(item=>item.line).map(item=>({name:item.name,size:item.size,detail:item.detail}))];
}
function updateDimensionNav(){
  const entries=dimensionEntries3D();
  state.activeDimension3d=Math.max(0,Math.min(entries.length-1,state.activeDimension3d));
  const selected=entries[state.activeDimension3d];
  const setText=(selector,value)=>{const element=$(selector);if(element.textContent!==value)element.textContent=value;};
  setText("#measure-count",`MEDIDAS · ${state.activeDimension3d+1}/${entries.length}`);
  setText("#measure-name",`${selected.name} · ${selected.size}`);
  setText("#measure-detail",selected.detail);
  $("#measure-prev").disabled=state.activeDimension3d===0;
  $("#measure-next").disabled=state.activeDimension3d===entries.length-1;
}
function render3D() {
  const canvas=$("#plan-3d");
  const compact=state.mode==="3d"&&!canvas.hidden&&canvas.getBoundingClientRect().width<=660;
  $("#measure-nav").hidden=!(compact&&state.layers.dimensions);
  if(!$("#measure-nav").hidden)updateDimensionNav();
  if (state.mode !== "3d" || canvas.hidden) return;
  const custom=state.final===1?FINAL1:state.final===4?FINAL4:null;
  const result=drawApartment3D(canvas,{
    final:state.final, mirrored:mirrored(), layers:state.layers,
    theme:document.documentElement.dataset.theme,
    opacity:state.opacity, view:state.view3d,
    cooling:state.cooling, coolingOutline:coolingOutline(), areas:areaData(), dimensions:dimensionData(), segments:segmentData().filter(item=>item.line),
    activeDimension3d:state.activeDimension3d,dimensionSource:dimensionDocUrl(),dimensionSourceName:`Planta cotada · final ${({2:5,6:3})[state.final]||state.final}`,
    structural:custom?.structural||STRUCTURAL_WALLS,
    masonry:custom?.masonry||MASONRY_WALLS,
    drywall:custom?.drywall||DRYWALL_WALLS,
    shafts:custom?.shafts||SHAFTS,
    custom,
    dots:get3DDots()
  });
  state.hit3d=result?.hits||[];
  state.surfaceHits3d=result?.surfaces||[];
}
function syncMode() {
  const available = true;
  $("#cooling-toggle").disabled = !available;
  $("#view-2d").disabled = !available;
  $("#view-3d").disabled = !available;
  $("#view-2d").setAttribute("aria-pressed",String(available && state.mode==="2d"));
  $("#view-3d").setAttribute("aria-pressed",String(available && state.mode==="3d"));
  $("#plan-stage").hidden = !available || state.mode!=="2d";
  $("#plan-3d").hidden = !available || state.mode!=="3d";
  $("#gesture-hint").hidden = !available || state.mode!=="3d";
  $("#map-status").textContent = !available ? "CONSULTA PARCIAL" : state.mode==="3d" ? "VISTA 3D" : "PLANTA 2D";
  $("#map-disclaimer").textContent = !available
    ? "Cotas de arquitetura disponíveis. Demais camadas técnicas pendentes; confira medidas no imóvel."
    : state.mode==="3d"
      ? "Vista 3D ilustrativa. Laranja escuro: alvenaria não estrutural informada pelo proprietário; a planta original marca drywall. Confirme no imóvel."
      : "Laranja escuro: alvenaria não estrutural informada pelo proprietário; a planta original marca drywall. Confirme no imóvel antes de intervir.";
  $("#selection-kicker").textContent = !available ? "PLANTAS" : state.mode==="3d" ? "COMO USAR" : "COMO USAR";
  const info=$("#selection-info");
  if(available && state.mode==="3d"){
    info.dataset.view3d="true";
    info.innerHTML='<h2>Explore o 3D</h2><p>Arraste com um dedo para girar e inclinar. Use dois dedos para aproximar. Toque em uma área ou ponto para ver detalhes e serviços.</p>';
  }else if(available && info.dataset.view3d){
    delete info.dataset.view3d;
    info.innerHTML='<h2>Explore a planta</h2><p>Toque em uma parede, piso ou símbolo para ver detalhes e serviços.</p>';
  }
  updateTransform();
  requestAnimationFrame(render3D);
}
function setMode(mode) {
  if (state.final>=1) {
    const changed=state.mode!==mode;
    state.mode = mode;
    syncMode();
    const url=new URL(location.href);
    if(mode==="3d")url.searchParams.set("view","3d");
    else url.searchParams.delete("view");
    history.replaceState(null,"",url);
    if(changed)window.rivieraAnalytics?.track("view_changed",{view_mode:mode});
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
  areas:"Valor aproximado. Meça no apartamento antes de comprar materiais ou planejar móveis.",
  dimensions:"Cota da planta, não medição no imóvel. Confira antes de comprar materiais ou executar a obra."
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
  if(detail.layer==="dimensions")return ["vistoria"];
  const context=serviceContextFor(detail);
  return SURFACE_CATALOG[context]?.services||SERVICE_CONTEXTS[context]||["vistoria"];
}
function renderServices(detail){
  const ids=serviceIdsFor(detail);
  servicePopover.classList.remove("global-mode");
  servicePopover.querySelector(".section-kicker").textContent="SERVIÇOS PARA ESTA ÁREA";
  $("#service-title").textContent="O que você quer fazer aqui?";
  $("#service-intro").textContent=`Para ${detail.title.toLowerCase()}, escolha um serviço:`;
  $("#service-list").innerHTML=ids.map(id=>{
    const service=SERVICE_CATALOG[id];
    return `<button type="button" data-service="${id}" aria-pressed="false"><span>${service.name}</span>${service.conditional?'<small>sob análise</small>':''}<b aria-hidden="true">→</b></button>`;
  }).join("");
  $("#service-results").hidden=true;
  $("#service-results").replaceChildren();
  $("#independent-toggle").hidden=true;
  $("#independent-toggle").setAttribute("aria-expanded","false");
  $("#independent-list").hidden=true;
  $("#independent-list").replaceChildren();
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
function openTechPopover({title,description,page=1,layer="architecture",surface,sourceUrl,sourceName,sourceLinkText,secondaryPage},point,source=null){
  window.rivieraAnalytics?.track("detail_opened",{plan_layer:layer,surface_type:surface||"point"});
  globalServiceButtons.forEach(button=>button.setAttribute("aria-expanded","false"));
  const detail={title,description,page,layer,surface};
  const layerName=LAYERS.find(item=>item.id===layer)?.name||"Arquitetura";
  const sheetName=SHEETS.find(item=>item[0]===page)?.[1]||"Planta original";
  const structural=surface==="structural";
  techPopover.classList.toggle("is-structural",structural);
  $("#tech-layer").textContent=structural?"⚠ ATENÇÃO · PAREDE ESTRUTURAL":layerName.toUpperCase();
  $("#tech-check-label").textContent=structural?"NÃO ALTERAR ESTA PAREDE":"ANTES DE REFORMAR";
  $("#tech-title").textContent=title;
  $("#tech-description").textContent=description;
  $("#tech-evidence-label").textContent=sourceUrl?"PLANTA COTADA":"PLANTA ORIGINAL";
  $("#tech-source-name").textContent=sourceName||`Folha ${page} · ${sheetName}`;
  $("#tech-check-text").textContent=SURFACE_CATALOG[surface]?.check||TECH_CHECKS[layer]||"Compare a marcação com a folha original e confira as condições reais da unidade antes de intervir.";
  $("#tech-source-link").href=sourceUrl||docUrl(page);
  $("#tech-source-link").textContent=sourceLinkText||"Abrir planta original ↗";
  const second=$("#tech-secondary-source-link");
  second.hidden=!secondaryPage;
  if(secondaryPage){second.href=docUrl(secondaryPage);second.textContent=`Abrir folha ${secondaryPage} ↗`;}
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
    drains:{title:"Dreno indicado",description:"Ponto de dreno indicado nas folhas técnicas. A posição no volume é aproximada; confira a vista original.",page:4},
    areas:{title:"Área aproximada",description:"Estimativa obtida da planta. Meça no apartamento antes de planejar compras ou obra.",page:1},
    dimensions:{title:"Medida da planta",description:"Cota da planta; confira a medida no apartamento antes de comprar ou executar.",page:1}
  }[dot.layer];
  if(!defaults)return null;
  return {layer:dot.layer,title:dot.title||defaults.title,description:dot.description||defaults.description,page:dot.page||defaults.page,sourceUrl:dot.sourceUrl,sourceName:dot.sourceName,sourceLinkText:dot.sourceLinkText,secondaryPage:dot.secondaryPage};
}
function detailForSurface(surface){
  const item=SURFACE_CATALOG[surface];
  return item?{layer:"architecture",surface,title:item.title,description:item.description,page:1}:null;
}
function createProviderCard(provider,service,independent,serviceId){
  const card=document.createElement("div");
  card.className=independent?"independent-card":"sponsor-card";
  const campaign=provider.campaign;
  const compactPremium=campaign?.premium && campaign.compactServices?.includes(serviceId);
  if(campaign?.premium)card.classList.add("sponsor-card--premium");
  const badge=document.createElement("small");
  badge.textContent=independent?"PUBLICIDADE · PROFISSIONAL INDEPENDENTE":campaign?.premium&&!compactPremium?"PUBLICIDADE · PARCERIA ESPECIAL":"PUBLICIDADE";
  const name=document.createElement("strong");name.textContent=provider.name;
  if(campaign?.premium)name.className="premium-name";
  card.append(badge,name);
  if(campaign?.offer){
    const offer=document.createElement("span");offer.className="premium-offer";offer.textContent=compactPremium?"20% de desconto":campaign.offer;
    if(compactPremium)offer.setAttribute("aria-label",campaign.offer);
    card.append(offer);
    if(!compactPremium){
      const copy=document.createElement("p");copy.className="premium-copy";copy.textContent=campaign.description;
      card.append(copy);
    }
  }
  if(!compactPremium && campaign?.event && Date.now()<Date.parse(campaign.event.endAt)){
    const calendar=document.createElement("section");calendar.className="premium-calendar";
    calendar.setAttribute("aria-label","Datas do coquetel");
    const title=document.createElement("div");title.className="premium-calendar-title";title.textContent="COQUETEL · OUTUBRO 2026";
    const days=document.createElement("div");days.className="premium-calendar-days";
    campaign.event.days.forEach(item=>{
      const day=document.createElement("div");day.className="premium-calendar-day";day.setAttribute("aria-label",item.label);
      const week=document.createElement("span");week.textContent=item.week;
      const number=document.createElement("strong");number.textContent=item.day;
      day.append(week,number);days.append(day);
    });
    const note=document.createElement("p");note.className="premium-calendar-note";note.textContent=campaign.event.note;
    calendar.append(title,days,note);card.append(calendar);
  }
  const phone=String(provider.whatsapp||"").replace(/\D/g,"");
  if(/^55\d{10,11}$/.test(phone)){
    const link=document.createElement("a");link.target="_blank";link.rel="noopener";
    const message=provider.message||`Olá, vi seu contato para ${service.name} no site das plantas do Riviera.`;
    link.href=`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    link.addEventListener("click",()=>window.rivieraAnalytics?.track("provider_contact",{service_id:serviceId,listing_type:independent?"independent":"sponsor"}));
    link.textContent=provider.cta||"Pedir orçamento ↗";card.append(link);
  }
  return card;
}
function showService(serviceId){
  const service=SERVICE_CATALOG[serviceId];
  if(!service)return;
  window.rivieraAnalytics?.track("service_selected",{service_id:serviceId});
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
  const independents=INDEPENDENT_PROVIDERS.filter(item=>item.active && item.services?.includes(serviceId));
  const featured=[...sponsors,...independents.slice(0,MAX_SPONSORS_PER_SERVICE-sponsors.length)];
  if(!featured.length){
    const empty=document.createElement("p");empty.className="service-empty";
    empty.textContent="Ainda não há profissionais cadastrados neste serviço.";
    results.append(empty);
  }else{
    sponsors.forEach(sponsor=>results.append(createProviderCard(sponsor,service,false,serviceId)));
    featured.slice(sponsors.length).forEach(provider=>results.append(createProviderCard(provider,service,true,serviceId)));
  }
  results.hidden=false;
  const independentList=$("#independent-list");
  independentList.replaceChildren();
  if(independents.length){
    independents.forEach(provider=>independentList.append(createProviderCard(provider,service,true,serviceId)));
  }else{
    const empty=document.createElement("p");empty.className="service-empty";
    empty.textContent="Ainda não há profissionais independentes cadastrados para este serviço.";
    independentList.append(empty);
  }
  independentList.hidden=true;
  const toggle=$("#independent-toggle");toggle.hidden=!independents.length;toggle.setAttribute("aria-expanded","false");
  if(activePoint)requestAnimationFrame(()=>positionPopovers(activePoint));
}
const globalServiceButtons=[...document.querySelectorAll("[data-global-service]")];
function openGlobalService(button){
  const serviceId=button.dataset.globalService;
  if(!SERVICE_CATALOG[serviceId])return;
  if(!servicePopover.hidden && servicePopover.classList.contains("global-mode") && button.getAttribute("aria-expanded")==="true"){
    closeTechPopover(true);
    return;
  }
  closeTechPopover();
  techPopover.hidden=true;
  techSource=button;
  activePoint=null;
  compactServiceOpen=false;
  servicePopover.classList.add("global-mode");
  servicePopover.classList.remove("is-appearing");
  servicePopover.style.left="";
  servicePopover.style.top="";
  servicePopover.querySelector(".section-kicker").textContent="PROFISSIONAIS PARA SUA REFORMA";
  $("#service-title").textContent="Para todo o apartamento";
  $("#service-intro").textContent="Escolha quem pode ajudar no seu projeto.";
  $("#service-list").replaceChildren();
  $("#service-back").hidden=true;
  servicePopover.hidden=false;
  globalServiceButtons.forEach(item=>item.setAttribute("aria-expanded",String(item===button)));
  showService(serviceId);
  void servicePopover.offsetWidth;
  servicePopover.classList.add("is-appearing");
  $("#service-close").focus();
}
globalServiceButtons.forEach(button=>button.addEventListener("click",()=>openGlobalService(button)));
$("#independent-toggle").addEventListener("click",()=>{
  const toggle=$("#independent-toggle");
  const expanded=toggle.getAttribute("aria-expanded")!=="true";
  toggle.setAttribute("aria-expanded",String(expanded));
  $("#independent-list").hidden=!expanded;
  if(activePoint)requestAnimationFrame(()=>positionPopovers(activePoint));
});
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
  techPopover.classList.remove("is-appearing");servicePopover.classList.remove("is-appearing","global-mode");
  if(restoreFocus)(techSource?.isConnected?techSource:$(state.mode==="3d"?"#view-3d":"#view-2d")).focus();
  globalServiceButtons.forEach(button=>button.setAttribute("aria-expanded","false"));
  techSource=null;activePoint=null;compactServiceOpen=false;
}
$("#tech-close").addEventListener("click",()=>closeTechPopover(true));
$("#service-close").addEventListener("click",()=>closeTechPopover(true));
document.addEventListener("pointerdown",e=>{if((!techPopover.hidden||!servicePopover.hidden) && !techPopover.contains(e.target) && !servicePopover.contains(e.target) && !e.target.closest("[data-title],[data-global-service]"))closeTechPopover();});
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
  const coolingOverlay=$("#cooling-overlay");
  if(coolingOverlay)coolingOverlay.style.display=state.cooling?"":"none";
  $("#layer-list").querySelectorAll("input").forEach(input => { input.checked = !!state.layers[input.dataset.layer]; });
  renderDimensions();
  renderAreas();
  renderManualTips();
  render3D();
}
function renderLayerControls() {
  $("#layer-list").innerHTML = LAYERS.map(layer => `<label class="layer-row"><span class="layer-color" style="--layer-color:${layer.color}"></span><span class="layer-copy"><strong>${layer.name}</strong><small>${layer.detail}</small></span><input type="checkbox" data-layer="${layer.id}" ${state.layers[layer.id] ? "checked" : ""}><span class="switch" aria-hidden="true"></span></label>`).join("");
  $("#layer-list").addEventListener("change", e => { if (e.target.matches("input[data-layer]")) { state.layers[e.target.dataset.layer] = e.target.checked; applyLayers(); window.rivieraAnalytics?.track("layer_toggled",{plan_layer:e.target.dataset.layer,enabled:e.target.checked?"yes":"no"}); } });
  $("#legend").innerHTML = LEGENDA.map(([cls,name])=>`<div><i class="${cls}"></i><span>${name}</span></div>`).join("");
}
function renderSources() {
  $("#source-list").innerHTML = SHEETS.map(([page,title,detail])=>`<a href="${docUrl(page)}" target="_blank" rel="noopener"><b>${String(page).padStart(2,"0")}</b><span><strong>${title}</strong><small>${detail}</small></span><i aria-hidden="true">↗</i></a>`).join("");
}
function renderManualTips() {
  const selected=MANUAL_TIPS.filter(tip=>tip.always || tip.layers.some(layer=>state.layers[layer]));
  $("#manual-tip-list").innerHTML=selected.map(tip=>`<a class="manual-tip" href="assets/docs/manual-proprietario.pdf#page=${tip.page}" target="_blank" rel="noopener"><strong>${tip.title}</strong><span>${tip.text}</span><small>Manual · p. ${tip.page} ↗</small></a>`).join("");
}
function renderDimensions() {
  const panel=$("#measurement-section");
  const badge=$("#dimension-status");
  panel.hidden=!state.layers.dimensions;
  badge.hidden=!state.layers.dimensions;
  if(panel.hidden)return;
  const paired=state.final===2||state.final===6;
  const sourceFinal=state.final===2?5:state.final===6?3:state.final;
  const note=paired?`Estas cotas vêm da tipologia compartilhada com o final ${sourceFinal}; não recebemos folha cotada com o número ${state.final}.`
    : "Cotas lidas da planta recebida para este final.";
  const guide=`Nas vistas 2D e 3D, as linhas douradas apontam as paredes da sala e cozinha e ${state.final===4?"a parede lateral":"a borda externa"} da varanda. As demais medidas estão descritas abaixo e na folha cotada.`;
  $("#measurement-content").innerHTML=`<p>${note}</p><h3>Quartos</h3><div class="dimension-list">${dimensionData().map(item=>`<div><span>${item.name}</span><strong>${item.size}</strong></div>`).join("")}</div><h3>${[1,4].includes(state.final)?"Paredes e varanda":"Paredes, varanda e passagem"}</h3><p>${guide}</p><div class="dimension-list segment-list">${segmentData().map(item=>`<div><span><b>${item.name}</b><small>${item.detail}</small></span><strong>${item.size}</strong></div>`).join("")}</div><p><strong>Desenho cotado, não medição no imóvel.</strong> Os ambientes com recortes não têm uma única largura × profundidade. Confira as dimensões no apartamento antes de comprar materiais ou encomendar móveis.</p><a href="${dimensionDocUrl()}" target="_blank" rel="noopener">Abrir planta cotada · final ${sourceFinal} ↗</a>`;
}
function renderAreas() {
  const panel=$("#area-section");
  const badge=$("#area-status");
  panel.hidden=!state.layers.areas;
  badge.hidden=!state.layers.areas;
  if(panel.hidden)return;
  $("#area-content").innerHTML=`<p>Valores aproximados para planejamento inicial. Meça no apartamento antes de comprar materiais.</p><div class="area-list">${areaData().map(item=>`<div><span>${item.name}</span><strong>${areaLabel(item.approx)}</strong></div>`).join('')}</div><p>Sala, cozinha, serviço e circulação aparecem juntos porque não há paredes separando esses usos.</p><a href="${docUrl(1)}" target="_blank" rel="noopener">Abrir planta original ↗</a>`;
}
function setFinal(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 6) {
    $("#final-result").innerHTML = '<strong>Digite um final de 1 a 6.</strong>';
    return;
  }
  const changed=state.final!==n;
  state.final = n;
  if(changed)state.activeDimension3d=0;
  state.cooling=false;
  syncCooling();
  $("#final-input").value = String(n);
  $("#final-result").innerHTML = `<strong>Final ${n}</strong><span>Plantas disponíveis.</span>`;
  $("#final-result").classList.remove("pending");
  document.querySelectorAll("[data-final]").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.final)===n)));
  $("#map-title").textContent = `Planta do final ${n}`;
  $("#map-description").textContent = [1,4].includes(n) ? `Apartamento comum · final ${n}` : `Plantas dos finais ${[2,5].includes(n) ? "2 e 5" : "3 e 6"}`;
  $(".layers-section").classList.remove("has-limited-layers");
  $("#layer-list").querySelectorAll("input").forEach(input => {
    input.disabled = false;
    input.checked = !!state.layers[input.dataset.layer];
  });
  $("#show-all").disabled = false;
  $("#show-base").disabled = false;
  $("#overlay-opacity").disabled = false;
  $("#empty-state").hidden = true;
  $(".map-tools").hidden = false;
  $("#main-source").hidden = false;
  $("#main-source").href = docUrl(1);
  $("#cooling-electric-source").href=docUrl(3);
  $("#cooling-open-area").textContent=String(Math.round(areaData().find(item=>item.open).approx));
  renderSvg();
  renderSources();
  $("#selection-info").innerHTML = '<h2>Explore a planta</h2><p>Toque em uma parede, piso ou símbolo para ver detalhes e serviços.</p>';
  renderManualTips();
  renderDimensions();
  renderAreas();
  state.zoom=1; state.panX=0; state.panY=0; syncMode();
  const url = new URL(location.href); url.searchParams.set("final",String(n)); url.searchParams.delete("folha"); history.replaceState(null,"",url);
  if(mobileView.matches && !drawerBackdrop.hidden)closeMobilePanels();
  if(changed)window.rivieraAnalytics?.track("final_selected",{final_type:String(n)});
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
const mobileView=window.matchMedia("(max-width:660px), (max-width:900px) and (max-height:500px)");
const drawerBackdrop=document.createElement("button");
drawerBackdrop.id="mobile-drawer-backdrop";
drawerBackdrop.type="button";
drawerBackdrop.setAttribute("aria-label","Fechar menu lateral");
drawerBackdrop.hidden=true;
layout.prepend(drawerBackdrop);
[["#control-panel","Final e camadas"],["#info-panel","Detalhes da planta"]].forEach(([selector,title])=>{
  const header=document.createElement("div");
  header.className="drawer-header";
  header.innerHTML=`<strong>${title}</strong><button type="button" class="drawer-close" aria-label="Fechar ${title.toLowerCase()}">×</button>`;
  $(selector).prepend(header);
  header.querySelector("button").addEventListener("click",closeMobilePanels);
});
const mobileFinalButton=document.createElement("button");
mobileFinalButton.id="mobile-final-button";
mobileFinalButton.type="button";
mobileFinalButton.textContent="Trocar final";
$(".map-heading").firstElementChild.after(mobileFinalButton);
mobileFinalButton.addEventListener("click",()=>openMobilePanel("left"));
let mobileReturnFocus=null;
function updatePanelButtons(){
  const mobile=mobileView.matches;
  [["left","#toggle-controls","controles"],["right","#toggle-details","detalhes"]].forEach(([side,selector,name])=>{
    const button=$(selector);
    const expanded=!layout.classList.contains(side==="left"?"hide-left":"hide-right");
    button.setAttribute("aria-expanded",String(expanded));
    button.setAttribute("aria-label",`${expanded?"Recolher":"Abrir"} ${mobile&&side==="left"?"final e camadas":name}`);
    button.querySelector(".toggle-icon").textContent=side==="left"?(expanded?"◀":"▶"):(expanded?"▶":"◀");
    button.querySelector(".panel-label").textContent=side==="left"?(mobile?"Camadas":"Controles"):"Detalhes";
  });
  const open=mobile && (!layout.classList.contains("hide-left")||!layout.classList.contains("hide-right"));
  drawerBackdrop.hidden=!open;
  document.body.classList.toggle("mobile-drawer-open",open);
}
function closeMobilePanels(){
  if(!mobileView.matches)return;
  const wasOpen=!drawerBackdrop.hidden;
  layout.classList.add("hide-left","hide-right");
  updatePanelButtons();
  if(wasOpen&&mobileReturnFocus?.isConnected)mobileReturnFocus.focus();
  mobileReturnFocus=null;
  requestAnimationFrame(render3D);
}
function openMobilePanel(side){
  if(!mobileView.matches)return;
  mobileReturnFocus=document.activeElement;
  layout.classList.add("hide-left","hide-right");
  layout.classList.remove(side==="left"?"hide-left":"hide-right");
  updatePanelButtons();
  const panel=$(side==="left"?"#control-panel":"#info-panel");
  panel.scrollTop=0;
  panel.querySelector(".drawer-close").focus();
  requestAnimationFrame(render3D);
}
function syncMobileView(){
  layout.classList.toggle("mobile-mode",mobileView.matches);
  layout.classList.remove("hide-left","hide-right");
  if(mobileView.matches)layout.classList.add("hide-left","hide-right");
  updatePanelButtons();
  requestAnimationFrame(render3D);
}
function togglePanel(side){
  if(mobileView.matches){
    const hidden=layout.classList.contains(side==="left"?"hide-left":"hide-right");
    if(hidden)openMobilePanel(side);else closeMobilePanels();
    return;
  }
  const isLeft=side==="left";
  const className=isLeft?"hide-left":"hide-right";
  const willHide=!layout.classList.contains(className);
  layout.classList.toggle(className,willHide);
  updatePanelButtons();
  requestAnimationFrame(render3D);
}
$("#toggle-controls").addEventListener("click",()=>togglePanel("left"));
$("#toggle-details").addEventListener("click",()=>togglePanel("right"));
drawerBackdrop.addEventListener("click",closeMobilePanels);
mobileView.addEventListener("change",syncMobileView);
syncMobileView();
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&mobileView.matches&&!drawerBackdrop.hidden)closeMobilePanels();});
document.querySelectorAll("#dimension-status,#area-status").forEach(link=>link.addEventListener("click",e=>{
  if(!mobileView.matches)return;
  e.preventDefault();
  openMobilePanel("right");
  $(link.getAttribute("href")).scrollIntoView({block:"start"});
}));
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
$("#measure-prev").addEventListener("click",()=>{state.activeDimension3d=Math.max(0,state.activeDimension3d-1);render3D();});
$("#measure-next").addEventListener("click",()=>{state.activeDimension3d=Math.min(dimensionEntries3D().length-1,state.activeDimension3d+1);render3D();});
function syncCooling(){
  $("#cooling-toggle").setAttribute("aria-pressed",String(state.cooling));
  $("#cooling-toggle").textContent=state.cooling?"❄ Ocultar área do ar":"❄ Área do ar";
  $("#cooling-panel").hidden=!state.cooling;
  const overlay=$("#cooling-overlay");
  if(overlay)overlay.style.display=state.cooling?"":"none";
  render3D();
}
$("#cooling-toggle").addEventListener("click",()=>{state.cooling=!state.cooling;syncCooling();});
$("#zoom-in").addEventListener("click",()=>changeZoom(1.2));
$("#zoom-out").addEventListener("click",()=>changeZoom(1/1.2));
$("#zoom-fit").addEventListener("click",()=>{
  if(state.mode==="3d") state.view3d={yaw:-.5,tilt:.77,zoom:1,panX:0,panY:0};
  else {state.zoom=1;state.panX=0;state.panY=0;}
  updateTransform();
});
$("#map-frame").addEventListener("wheel",e=>{
  if(e.target.closest("#tech-popover,#service-popover,.whole-home-actions"))return;
  e.preventDefault();
  changeZoom(e.deltaY<0?1.1:1/1.1);
},{passive:false});
let drag2d=null;
const activePointers=new Map();
let gesture2d=null;
let gesture3d=null;
let tap3d=null;
let last3DOpen=null;
let last3DPointerEnd=null;
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
  const dot=(state.hit3d||[]).filter(item=>item.box
    ? x>=item.box.x&&x<=item.box.x+item.box.w&&y>=item.box.y&&y<=item.box.y+item.box.h
    : Math.hypot(item.x-x,item.y-y)<=item.r
  ).sort((a,b)=>(b.priority||0)-(a.priority||0)||Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
  if(dot)return {dot:dot.dot,x:dot.x,y:dot.y};
  for(let i=(state.surfaceHits3d||[]).length-1;i>=0;i--){
    const item=state.surfaceHits3d[i];
    if(insidePolygon(x,y,item.points))return {surface:item.surface,x,y};
  }
  return null;
}
function open3DAt(clientX,clientY){
  const bounds=$("#plan-3d").getBoundingClientRect();
  const hit=pick3D(clientX-bounds.left,clientY-bounds.top);
  if(!hit)return false;
  const detail=hit.dot?detailFor3DDot(hit.dot):detailForSurface(hit.surface);
  if(!detail)return false;
  openTechPopover(detail,{x:bounds.left+hit.x,y:bounds.top+hit.y});
  last3DOpen={time:performance.now(),x:clientX,y:clientY};
  return true;
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
function beginTwoFingerGesture2D(){
  const points=[...activePointers.values()];
  if(points.length<2)return;
  const [a,b]=points;
  gesture2d={
    centerX:(a.x+b.x)/2,centerY:(a.y+b.y)/2,
    distance:Math.max(20,Math.hypot(b.x-a.x,b.y-a.y)),
    zoom:state.zoom,panX:state.panX,panY:state.panY
  };
  drag2d=null;
}
frame.addEventListener("pointerdown",e=>{
  if (e.target.closest("button,a,#tech-popover,#service-popover,.whole-home-actions")) return;
  const onPoint=!!e.target.closest("[data-title]");
  if(onPoint && e.pointerType!=="touch")return;
  const capture=!onPoint;
  if(capture)frame.setPointerCapture(e.pointerId);
  if(state.mode==="2d"){
    activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
    if(activePointers.size>=2){
      for(const id of activePointers.keys())if(!frame.hasPointerCapture(id))frame.setPointerCapture(id);
      frame.classList.add("dragging");
      beginTwoFingerGesture2D();
    }else drag2d={id:e.pointerId,x:e.clientX,y:e.clientY,panX:state.panX,panY:state.panY,captured:capture};
  }else{
    frame.classList.add("dragging");
    activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
    if(activePointers.size>=2){tap3d=null;beginTwoFingerGesture();}
    else tap3d={id:e.pointerId,x:e.clientX,y:e.clientY};
  }
});
frame.addEventListener("pointermove",e=>{
  if(state.mode==="2d"){
    if(!activePointers.has(e.pointerId))return;
    activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
    if(activePointers.size>=2 && gesture2d){
      const [a,b]=[...activePointers.values()];
      const centerX=(a.x+b.x)/2,centerY=(a.y+b.y)/2;
      const distance=Math.hypot(b.x-a.x,b.y-a.y);
      const nextZoom=clamp(gesture2d.zoom*distance/gesture2d.distance,.7,3.4);
      const frameBounds=frame.getBoundingClientRect();
      const frameCenterX=frameBounds.left+frameBounds.width/2;
      const stage=$("#plan-stage");
      const frameCenterY=frameBounds.top+stage.offsetTop+stage.offsetHeight/2;
      const ratio=nextZoom/gesture2d.zoom;
      state.zoom=nextZoom;
      state.panX=centerX-frameCenterX-ratio*(gesture2d.centerX-frameCenterX-gesture2d.panX);
      state.panY=centerY-frameCenterY-ratio*(gesture2d.centerY-frameCenterY-gesture2d.panY);
      updateTransform();
      return;
    }
    if(!drag2d || drag2d.id!==e.pointerId)return;
    if(!drag2d.captured){
      if(Math.hypot(e.clientX-drag2d.x,e.clientY-drag2d.y)<7)return;
      frame.setPointerCapture(e.pointerId);
      drag2d.captured=true;
    }
    frame.classList.add("dragging");
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
  }else{
    if(e.pointerType==="touch" && tap3d?.id===e.pointerId)return;
    state.view3d.yaw+=(e.clientX-previous.x)*.008;
    state.view3d.tilt=clamp(state.view3d.tilt+(e.clientY-previous.y)*.006,.08,1.25);
  }
  updateTransform();
});
function endPointer(e){
  if(state.mode==="2d"){
    activePointers.delete(e.pointerId);
    gesture2d=null;
    drag2d=null;
    if(activePointers.size===1){
      const [id,point]=activePointers.entries().next().value;
      drag2d={id,x:point.x,y:point.y,panX:state.panX,panY:state.panY,captured:frame.hasPointerCapture(id)};
    }else if(activePointers.size>=2)beginTwoFingerGesture2D();
    if(!activePointers.size)frame.classList.remove("dragging");
    return;
  }
  const was3DPointer=state.mode==="3d" && activePointers.has(e.pointerId);
  const was3DGesture=was3DPointer && (e.type==="pointercancel" || !tap3d);
  if(e.type==="pointerup" && state.mode==="3d" && tap3d?.id===e.pointerId && activePointers.size===1){
    open3DAt(e.clientX,e.clientY);
  }
  if(was3DPointer)last3DPointerEnd={time:performance.now(),drag:was3DGesture};
  tap3d=null;
  drag2d=null;
  activePointers.delete(e.pointerId);
  gesture3d=null;
  if(activePointers.size>=2)beginTwoFingerGesture();
  if(!activePointers.size)frame.classList.remove("dragging");
}
frame.addEventListener("pointerup",endPointer);
frame.addEventListener("pointercancel",endPointer);
frame.addEventListener("lostpointercapture",e=>{
  if(drag2d?.id===e.pointerId)drag2d=null;
  if(activePointers.delete(e.pointerId)){
    tap3d=null;
    gesture2d=null;
    gesture3d=null;
  }
  if(!activePointers.size)frame.classList.remove("dragging");
});
// Mantém o clique no 3D funcional quando o navegador não entrega o pointerup capturado.
frame.addEventListener("click",e=>{
  if(state.mode!=="3d" || (e.target!==frame && e.target!==$("#plan-3d")))return;
  const now=performance.now();
  if(last3DPointerEnd?.drag && now-last3DPointerEnd.time<700)return;
  if(last3DOpen && now-last3DOpen.time<700 && Math.hypot(e.clientX-last3DOpen.x,e.clientY-last3DOpen.y)<10)return;
  open3DAt(e.clientX,e.clientY);
});
new ResizeObserver(()=>render3D()).observe(frame);
const initialParams = new URLSearchParams(location.search);
state.mode = initialParams.get("view")==="3d" ? "3d" : "2d";
const initial = Number(initialParams.get("final"));
setFinal(Number.isInteger(initial)&&initial>=1&&initial<=6?initial:2);
