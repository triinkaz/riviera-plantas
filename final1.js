// Leitura gráfica das folhas 1, 2 e 4 de fin1.pdf (apartamento comum).
// Posições aproximadas para consulta; não são cotas ou levantamento de obra.
const FINAL1 = {
  floor: [[244,482],[914,482],[914,704],[1038,704],[1038,970],[244,970]],
  center: [641,726], sceneWidth: 1120, sceneHeight: 760,
  structural: [
    [244,482,12,151],[244,640,12,309],[244,482,86,12],[493,482,118,12],
    [700,482,103,12],[803,482,111,12],[902,482,12,223],
    [1026,704,12,266],[244,938,137,12],[455,958,583,12],
    [493,482,13,228],[493,697,190,13],[746,697,56,13],
    [790,482,13,228],[803,697,18,13],[860,697,54,13],
    [244,628,65,12],[642,788,68,12],[642,788,12,171],
    [767,788,12,171],[767,958,12,12],
    [767,790,12,168],[767,774,12,14]
  ],
  // Rafael informou que estes trechos azuis da folha não são drywall.
  // A função estrutural não está comprovada: tratar como alvenaria a confirmar.
  masonry: [[244,640,13,57],[902,493,12,69],[680,697,10,13],[765,697,10,13],[797,697,11,13],
    [755,774,12,24],[642,894,13,64]],
  drywall: [[368,632,13,116],[272,493,12,68],[272,551,56,12],[316,493,12,69]],
  shafts: [[252,493,26,69],[244,642,22,55],[879,493,26,68],[642,894,26,65]],
  wet: [[803,493,100,204],[654,800,113,158],[256,641,111,105]],
  balcony: [[256,494,237,134]],
  ceiling: [[803,493,100,204],[654,800,113,158],[256,642,111,104]],
  labels: [
    [407,568,["VARANDA"]],[315,716,["ÁREA DE","SERVIÇO"]],
    [334,849,["COZINHA"]],[548,842,["SALA"]],
    [645,578,["DORMITÓRIO"]],[851,585,["BANHO","SUÍTE"]],
    [903,854,["SUÍTE"]],[708,866,["BANHO","SOCIAL"]]
  ],
  lights: [[412,562],[476,562],[646,562],[849,564],[317,693],[438,716],[630,685],[318,835],[707,846],[903,834]],
  outlets: [[257,560],[290,630],[257,785],[257,818],[257,850],[257,882],
    [681,690],[769,690],[804,690],[803,630],[866,630],[890,497],
    [1021,834],[786,815],[688,803],[655,956],[726,956],[380,956]],
  switches: [[378,639],[498,640],[680,703],[767,703],[802,707],[765,780],
    [709,792],[381,930],[451,930],[653,800]],
  hydraulic: [[852,582,6,"Banho da suíte"],[704,862,7,"Banho social"],
    [302,800,8,"Cozinha e serviço"],[382,578,9,"Varanda"]],
  stacks: [[900,508,"AP","Água pluvial"],[900,534,"V","Ventilação"],
    [900,558,"E","Esgoto"],[263,651,"E","Esgoto"],
    [651,895,"E","Esgoto"],[651,922,"V","Ventilação"],
    [651,950,"AP","Água pluvial"]],
  drains: [[625,867,"PD","Dreno da sala",5],[677,865,"D","Dreno próximo ao banho social",4]],
  dots: []
};
FINAL1.dots = [
  ...FINAL1.lights.map(([x,y])=>({x,y,layer:"electric",label:""})),
  ...FINAL1.outlets.map(([x,y])=>({x,y,layer:"electric",label:"T"})),
  ...FINAL1.switches.map(([x,y])=>({x,y,layer:"electric",label:"I"})),
  ...FINAL1.hydraulic.map(([x,y,page,room])=>({x,y,layer:"hydraulic",label:"H",title:`Vista hidráulica: ${room}`,page})),
  ...FINAL1.stacks.map(([x,y,,title])=>({x,y,layer:"systems",label:"",title,page:4})),
  ...FINAL1.drains.map(([x,y,,title,page])=>({x,y,layer:"drains",label:"D",title,page})),
  {x:476,y:533,layer:"systems",label:"C",title:"Condensadora de ar condicionado",page:4},
  {x:256,y:684,layer:"systems",label:"G",title:"Tubulação de gás",page:4}
];
function final1Svg() {
  const floorPath=`M${FINAL1.floor.map(([x,y])=>`${x} ${y}`).join("L")}Z`;
  const walls=(values,cls,surface)=>values.map(([x,y,w,h])=>surface?surfaceRect(x,y,w,h,cls,surface):rect(x,y,w,h,cls)).join("");
  const architecture=`<g id="layer-architecture" class="plan-layer">
    ${surfacePath(floorPath,"floor-outline","dry_floor")}
    ${walls(FINAL1.wet,"wet-area","wet_floor")}${walls(FINAL1.balcony,"balcony-area","balcony_floor")}${walls(FINAL1.ceiling,"ceiling-area")}
    <g class="windows">${line(330,487,493,487,"guard-line")}${line(310,633,493,633,"window-line")}${line(610,487,700,487,"window-line")}${line(914,704,1026,704,"window-line")}</g>
    <g class="structural-walls">${walls(FINAL1.structural,"structural-wall","structural")}</g>
    <g class="masonry-walls">${walls(FINAL1.masonry,"masonry-wall","masonry")}</g>
    <g class="drywall-walls">${walls(FINAL1.drywall,"drywall-wall","drywall")}</g>
    <g class="shaft-areas">${walls(FINAL1.shafts,"shaft-box","shaft")}${FINAL1.shafts.map(([x,y,w,h])=>path(`M${x} ${y}l${w} ${h}m0 -${h}l-${w} ${h}`,"shaft-cross")).join("")}</g>
    <g class="fixtures"><rect x="257" y="767" width="42" height="119" class="fixture"/><ellipse cx="853" cy="613" rx="16" ry="12" class="fixture"/><ellipse cx="873" cy="666" rx="13" ry="18" class="fixture"/><ellipse cx="687" cy="827" rx="16" ry="12" class="fixture"/><ellipse cx="685" cy="874" rx="12" ry="18" class="fixture"/><circle cx="283" cy="583" r="15" class="fixture"/></g>
    <g class="door-swing">${path("M380 949A75 75 0 0 1 455 874M380 949h75","door-line")}${path("M684 697A63 63 0 0 1 747 634M684 697h63","door-line")}${path("M804 708A55 55 0 0 1 859 653M804 708h55","door-line")}${path("M767 775A69 69 0 0 1 836 706M767 775h69","door-line")}${path("M708 789A58 58 0 0 1 766 847M708 789h58","door-line")}</g>
  </g>`;
  const labels=`<g id="room-labels">${FINAL1.labels.map(([x,y,rows])=>rows.map((label,i)=>`<text x="${x}" y="${y+(i-(rows.length-1)/2)*19}" class="room-label" text-anchor="middle">${label}</text>`).join("")).join("")}</g>`;
  let electric=FINAL1.lights.map(([x,y])=>point(x,y,"✦","light","Iluminação de teto","Ponto indicado na folha elétrica. Confirme tensão e circuito no imóvel.",2)).join("");
  electric+=FINAL1.outlets.map(([x,y])=>point(x,y,"T","outlet","Tomada indicada","Posição gráfica aproximada. Confira altura, tensão e circuito no ponto real.",2)).join("");
  electric+=FINAL1.switches.map(([x,y])=>point(x,y,"I","switch","Interruptor indicado","Observe a faixa de segurança de 20 cm indicada na folha elétrica.",2)).join("");
  electric+=point(710,847,"EX","systems","Exaustor de teto","Confira a posição na planta elétrica e no apartamento.",2);
  electric+=point(350,948,"Q","switch","Quadro de luz e força","Não execute furos na região do quadro. Consulte a folha 3.",3);
  electric+=point(900,502,"!","shower","Chuveiro elétrico","Ponto 220 V indicado na folha elétrica; confira a instalação real.",2);
  electric+=point(652,901,"!","shower","Chuveiro elétrico","Ponto 220 V indicado na folha elétrica; confira a instalação real.",2);
  const hydro=FINAL1.hydraulic.map(([x,y,p,title])=>`<g class="hydro-zone" role="button" tabindex="0" aria-label="Abrir vista hidráulica: ${title}" data-title="Vista hidráulica: ${title}" data-description="Veja a planta original para localizar os pontos. O trajeto das tubulações não aparece aqui." data-page="${p}" transform="translate(${x} ${y})"><circle r="33" class="zone-ring"/><circle r="17" class="zone-disc"/><text y="5" text-anchor="middle">H</text></g>`).join("");
  let systems=FINAL1.stacks.map(([x,y,code,title])=>point(x,y,code,"stack",title,"Prumada indicada na folha 4. Não execute furos na região; consulte as vistas.",4)).join("");
  systems+=`<g class="system-area" role="button" tabindex="0" aria-label="Área prevista para condensadora" data-title="Condensadora de ar condicionado" data-description="Local previsto na varanda pela folha 4. Preserve ventilação e acesso de manutenção." data-page="4">${rect(460,523,34,60,"condenser-area")}</g>`;
  systems+=`<g class="system-area" role="button" tabindex="0" aria-label="Local previsto para evaporadora" data-title="Evaporadora de ar condicionado" data-description="Local previsto na sala; confirme instalação, dreno e medidas no imóvel." data-page="4">${rect(628,782,14,47,"evaporator-area")}</g>`;
  systems+=line(257,674,257,712,"gas-line")+point(257,682,"G","gas","Tubulação de gás","A folha 4 alerta para tubulação de gás nesta parede. Não fure; confira o traçado real.",4);
  const drains=FINAL1.drains.map(([x,y,code,title,p])=>point(x,y,code,"drain",title,"Ponto indicado na folha técnica. Consulte o detalhe original; o trajeto não está desenhado aqui.",p)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" class="final4-plan" viewBox="180 390 930 640" role="group" aria-label="Planta vetorial do final 1 comum com camadas selecionáveis">
    <defs><pattern id="drawing-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#29251d" stroke-width="0.5"/></pattern></defs>
    <rect x="180" y="390" width="930" height="640" fill="url(#drawing-grid"/>
    ${architecture}${coolingOverlaySvg()}${labels}${dimensionMarkers()}<g id="layer-hydraulic" class="plan-layer overlay-layer">${hydro}</g><g id="layer-systems" class="plan-layer overlay-layer">${systems}</g><g id="layer-drains" class="plan-layer overlay-layer">${drains}</g><g id="layer-electric" class="plan-layer overlay-layer">${electric}</g>${areaMarkers()}
    <text x="245" y="437" class="plate-title">FINAL 1 <tspan> / </tspan> APARTAMENTO COMUM</text>
  </svg>`;
}
