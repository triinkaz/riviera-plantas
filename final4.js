// Leitura gráfica das folhas 1, 2 e 4 do conjunto fin4.pdf (Final 4 comum).
// Coordenadas SVG são aproximadas e não representam cotas para obra.
const FINAL4 = {
  floor: [[245,489],[381,489],[381,467],[1038,467],[1038,738],[916,738],[916,955],[245,955]],
  center: [640,710], sceneWidth: 1120, sceneHeight: 760,
  structural: [
    [245,489,12,255],[245,811,12,144],[245,489,136,12],[369,467,12,23],
    [455,467,583,12],[1026,467,12,271],[916,727,122,12],[903,738,13,217],
    [245,944,82,11],[493,944,118,11],[700,944,216,11],
    [641,479,12,170],[766,479,12,181],[641,638,67,11],
    [493,727,12,228],[493,727,190,12],[767,727,36,12],[858,727,58,12],
    [789,728,13,227],[789,944,114,11],
    [245,797,65,12]
  ],
  masonry: [[369,690,13,118],[655,479,15,65],[879,870,12,73]],
  drywall: [[258,744,11,51],[271,874,55,11],[315,885,11,57]],
  shafts: [[255,744,20,53],[255,874,20,71],[652,479,20,64],[879,868,23,76]],
  wet: [[649,479,117,160],[802,740,101,204],[257,510,236,287]],
  balcony: [[257,811,236,133]],
  ceiling: [[650,479,115,160],[802,740,101,204],[257,744,236,53]],
  labels: [
    [365,600,["COZINHA"]],[328,716,["ÁREA DE","SERVIÇO"]],
    [534,605,["SALA"]],[707,559,["BANHO","SOCIAL"]],
    [905,597,["SUÍTE"]],[637,851,["DORMITÓRIO"]],
    [851,839,["BANHO","SUÍTE"]],[404,875,["VARANDA"]]
  ],
  lights: [[318,592],[511,563],[438,718],[705,688],[710,562],[900,601],[850,868],[646,868],[411,872],[316,744]],
  outlets: [[266,526],[266,586],[289,526],[289,586],[266,620],[289,620],[266,693],[289,693],[463,490],[603,490],[793,542],[788,586],[1017,545],[1017,648],[514,747],[514,843],[681,732],[498,872],[278,817],[865,747]],
  switches: [[363,509],[463,507],[363,523],[405,686],[514,699],[673,769],[867,771],[789,649],[807,652],[996,646],[313,867]],
  hydraulic: [[708,570,7,"Banho social"],[853,847,6,"Banho da suíte"],[326,703,8,"Cozinha e serviço"],[404,875,9,"Varanda"]],
  stacks: [[657,499,"AP","Água pluvial"],[657,521,"V","Ventilação"],[657,544,"E","Esgoto"],[255,772,"E","Esgoto"],[906,882,"E","Esgoto"],[906,918,"V","Ventilação"],[906,946,"AP","Água pluvial"]],
  drains: [[600,535,"PD","Dreno da sala",5],[711,535,"D","Dreno próximo ao banho social",4]],
  dots: []
};
FINAL4.dots = [
  ...FINAL4.lights.map(([x,y])=>({x,y,layer:"electric",label:""})),
  ...FINAL4.outlets.map(([x,y])=>({x,y,layer:"electric",label:"T"})),
  ...FINAL4.switches.map(([x,y])=>({x,y,layer:"electric",label:"I"})),
  ...FINAL4.hydraulic.map(([x,y,page,room])=>({x,y,layer:"hydraulic",label:"H",title:`Vista hidráulica: ${room}`,page})),
  ...FINAL4.stacks.map(([x,y,,title])=>({x,y,layer:"systems",label:"",title,page:4})),
  ...FINAL4.drains.map(([x,y,,title,page])=>({x,y,layer:"drains",label:"D",title,page})),
  {x:720,y:520,layer:"electric",label:"EX",title:"Exaustor de teto",description:"Ponto indicado na folha elétrica. Confirme a posição e preserve a ventilação prevista no imóvel.",page:2},
  {x:252,y:864,layer:"electric",label:"Q",title:"Quadro de luz e força",description:"Não execute furos na região do quadro. Consulte também a folha 3 e confira a posição real.",page:3},
  {x:681,y:544,layer:"electric",label:"!",title:"Chuveiro elétrico",description:"Ponto 220 V indicado na folha elétrica; confirme instalação e circuito no imóvel.",page:2},
  {x:893,y:904,layer:"electric",label:"!",title:"Chuveiro elétrico",description:"Ponto 220 V indicado na folha elétrica; confirme instalação e circuito no imóvel.",page:2},
  {x:487,y:881,layer:"systems",label:"C",title:"Condensadora de ar condicionado",description:"Local previsto na varanda pela folha 4. Preserve ventilação e acesso de manutenção.",page:4},
  {x:635,y:567,layer:"systems",label:"EV",title:"Evaporadora de ar condicionado",description:"Local previsto na folha 4. Confirme instalação, dreno e medidas no imóvel.",page:4},
  {x:253,y:720,layer:"systems",label:"G",title:"Tubulação de gás",description:"A folha 4 alerta para tubulação de gás nesta parede. Não fure; confira o traçado real.",page:4}
];

function final4Svg() {
  const floorPath = `M${FINAL4.floor.map(([x,y])=>`${x} ${y}`).join("L")}Z`;
  const walls = (values,cls,surface) => values.map(([x,y,w,h])=>surface ? surfaceRect(x,y,w,h,cls,surface) : rect(x,y,w,h,cls)).join("");
  const architecture = `<g id="layer-architecture" class="plan-layer">
    ${surfacePath(floorPath,"floor-outline","dry_floor")}
    ${walls(FINAL4.wet,"wet-area","wet_floor")}${walls(FINAL4.balcony,"balcony-area","balcony_floor")}${walls(FINAL4.ceiling,"ceiling-area")}
    <g class="windows">${line(310,803,368,803,"window-line")}${line(382,803,493,803,"window-line")}${line(611,949,700,949,"window-line")}${line(916,732,1026,732,"window-line")}${line(326,950,493,950,"guard-line")}</g>
    <g class="structural-walls">${walls(FINAL4.structural,"structural-wall","structural")}</g>
    <g class="masonry-walls">${walls(FINAL4.masonry,"masonry-wall","masonry")}</g>
    <g class="shaft-areas">${walls(FINAL4.shafts,"shaft-box","shaft")}${FINAL4.shafts.map(([x,y,w,h])=>path(`M${x} ${y}l${w} ${h}m0 -${h}l-${w} ${h}`,"shaft-cross")).join("")}</g>
    <g class="drywall-walls">${walls(FINAL4.drywall,"drywall-wall","drywall")}</g>
    <g class="fixtures"><rect x="257" y="555" width="45" height="89" class="fixture"/><ellipse cx="686" cy="571" rx="17" ry="12" class="fixture"/><ellipse cx="667" cy="610" rx="13" ry="19" class="fixture"/><ellipse cx="871" cy="804" rx="16" ry="17" class="fixture"/><ellipse cx="872" cy="865" rx="21" ry="13" class="fixture"/></g>
    <g class="door-swing">${path("M390 467A65 65 0 0 1 455 532M390 467v65","door-line")}${path("M708 639A57 57 0 0 1 765 582M708 639h57","door-line")}${path("M777 660A62 62 0 0 1 839 722M777 660v62","door-line")}${path("M683 728A63 63 0 0 0 746 791M683 728h63","door-line")}${path("M806 728A52 52 0 0 0 858 780M806 728h52","door-line")}</g>
  </g>`;
  const labels = `<g id="room-labels">${FINAL4.labels.map(([x,y,rows])=>rows.map((label,i)=>`<text x="${x}" y="${y+(i-(rows.length-1)/2)*19}" class="room-label" text-anchor="middle">${label}</text>`).join("")).join("")}</g>`;
  let electric = FINAL4.lights.map(([x,y])=>point(x,y,"✦","light","Iluminação de teto","Ponto indicado na folha elétrica. Confirme tensão e circuito no imóvel.",2)).join("");
  electric += FINAL4.outlets.map(([x,y])=>point(x,y,"T","outlet","Tomada indicada","Posição gráfica aproximada. Confira altura, tensão e circuito no ponto real.",2)).join("");
  electric += FINAL4.switches.map(([x,y])=>point(x,y,"I","switch","Interruptor indicado","Observe a faixa de segurança de 20 cm indicada na folha elétrica.",2)).join("");
  electric += point(720,520,"EX","systems","Exaustor de teto","Confira a posição exata na planta original e no apartamento.",2);
  electric += point(252,864,"Q","switch","Quadro de luz e força","Não execute furos na região do quadro. Consulte a folha 3.",3);
  electric += point(681,544,"!","shower","Chuveiro elétrico","Ponto 220 V indicado na folha elétrica; confira a instalação real.",2);
  electric += point(893,904,"!","shower","Chuveiro elétrico","Ponto 220 V indicado na folha elétrica; confira a instalação real.",2);
  const hydro = FINAL4.hydraulic.map(([x,y,p,title])=>`<g class="hydro-zone" role="button" tabindex="0" aria-label="Abrir vista hidráulica: ${title}" data-title="Vista hidráulica: ${title}" data-description="Veja a planta original para localizar os pontos. O trajeto das tubulações não aparece aqui." data-page="${p}" transform="translate(${x} ${y})"><circle r="33" class="zone-ring"/><circle r="17" class="zone-disc"/><text y="5" text-anchor="middle">H</text></g>`).join("");
  let systems = FINAL4.stacks.map(([x,y,code,title])=>point(x,y,code,"stack",title,"Prumada indicada na folha 4. Não execute furos na região; consulte as vistas.",4)).join("");
  systems += `<g class="system-area" role="button" tabindex="0" aria-label="Área prevista para condensadora" data-title="Condensadora de ar condicionado" data-description="Local previsto na varanda pela folha 4. Preserve ventilação e acesso de manutenção." data-page="4">${rect(464,854,48,57,"condenser-area")}</g>`;
  systems += `<g class="system-area" role="button" tabindex="0" aria-label="Local previsto para evaporadora" data-title="Evaporadora de ar condicionado" data-description="Local previsto na folha 4; confirme instalação, dreno e medidas no imóvel." data-page="4">${rect(628,540,14,55,"evaporator-area")}</g>`;
  systems += line(257,687,257,742,"gas-line")+point(252,715,"G","gas","Tubulação de gás","A folha 4 alerta para tubulação de gás nesta parede. Não fure; confira o traçado real.",4);
  const drains = FINAL4.drains.map(([x,y,code,title,p])=>point(x,y,code,"drain",title,"Ponto indicado na folha técnica. Consulte o detalhe original; o trajeto não está desenhado aqui.",p)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" class="final4-plan" viewBox="180 390 930 640" role="group" aria-label="Planta vetorial do final 4 comum com camadas selecionáveis">
    <defs><pattern id="drawing-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#29251d" stroke-width="0.5"/></pattern></defs>
    <rect x="180" y="390" width="930" height="640" fill="url(#drawing-grid)"/>
    ${architecture}${coolingOverlaySvg()}${labels}${dimensionMarkers()}<g id="layer-hydraulic" class="plan-layer overlay-layer">${hydro}</g><g id="layer-systems" class="plan-layer overlay-layer">${systems}</g><g id="layer-drains" class="plan-layer overlay-layer">${drains}</g><g id="layer-electric" class="plan-layer overlay-layer">${electric}</g>${areaMarkers()}
    <text x="245" y="437" class="plate-title">FINAL 4 <tspan> / </tspan> APARTAMENTO COMUM</text>
  </svg>`;
}
