// Volume esquemático: a altura dos muros não representa medida do apartamento.
function drawApartment3D(canvas, options) {
  const context = canvas.getContext("2d");
  if (!context) return false;
  const bounds = canvas.getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;
  if (width < 1 || height < 1) return {hits:[]};
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  if(options.decorated){context.fillStyle="#f3f0e8";context.fillRect(0,0,width,height);}
  const light = options.theme !== "dark";

  const { yaw, tilt, zoom, panX, panY } = options.view;
  const custom = options.custom;
  const sinYaw = Math.sin(yaw);
  const cosYaw = Math.cos(yaw);
  const sinTilt = Math.sin(tilt);
  const cosTilt = Math.cos(tilt);
  const scale = Math.min(width / (custom?.sceneWidth || 1500), height / (custom?.sceneHeight || 950)) * zoom;
  const mirrorY = (y) => options.mirrored ? 1570 - y : y;
  const mirrorRect = ([x, y, w, h]) => [x, options.mirrored ? 1570 - y - h : y, w, h];
  const rotate = (x, y) => {
    const dx = x - (custom?.center[0] || 695);
    const dy = y - (custom?.center[1] || 785);
    return [dx * cosYaw - dy * sinYaw, dx * sinYaw + dy * cosYaw];
  };
  const project = ([x, y, z = 0]) => {
    const [rx, ry] = rotate(x, y);
    return [
      width / 2 + panX + rx * scale,
      height / 2 + panY + (ry * cosTilt - z * sinTilt) * scale
    ];
  };
  const depth = ([x, y, z = 0]) => {
    const [, ry] = rotate(x, y);
    return ry * sinTilt + z * cosTilt;
  };
  const polygon = (vertices, fill, stroke, lineWidth = 1) => {
    context.beginPath();
    vertices.forEach((point, i) => {
      const [sx, sy] = project(point);
      if (i) context.lineTo(sx, sy);
      else context.moveTo(sx, sy);
    });
    context.closePath();
    if (fill) { context.fillStyle = fill; context.fill(); }
    if (stroke) { context.strokeStyle = stroke; context.lineWidth = lineWidth; context.stroke(); }
  };
  const rectangle = (values, z = 0) => {
    const [x, y, w, h] = mirrorRect(values);
    return [[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]];
  };
  const surfaceHits = [];
  const markSurface = (vertices,surface) => surfaceHits.push({points:vertices.map(project),surface});

  const floor = (custom?.floor?.map(([x,y])=>[x,y,0]) || [
    [140,330,0],[1250,330,0],[1250,1115,0],
    [1077,1115,0],[1077,1268,0],[140,1268,0]
  ]).map(([x,y,z]) => [x,mirrorY(y),z]);
  polygon(floor, light ? "#fffdf7" : "#191914", light ? "#a68b64" : "#b5925b", 2);
  markSurface(floor,"dry_floor");
  context.save();
  context.beginPath();
  floor.forEach((point, index) => {
    const [x,y] = project(point);
    if (index) context.lineTo(x,y); else context.moveTo(x,y);
  });
  context.closePath();
  context.clip();
  const gridBounds = custom ? {left:245,right:1038,top:467,bottom:955} : {left:140,right:1250,top:330,bottom:1268};
  for (let x = gridBounds.left; x <= gridBounds.right; x += 80) {
    polygon([[x,mirrorY(gridBounds.top),1],[x,mirrorY(gridBounds.bottom),1]], null, light ? "#d9d1c3" : "#343024", .7);
  }
  for (let y = gridBounds.top; y <= gridBounds.bottom; y += 80) {
    polygon([[gridBounds.left,mirrorY(y),1],[gridBounds.right,mirrorY(y),1]], null, light ? "#d9d1c3" : "#343024", .7);
  }
  context.restore();

  if (options.cooling && options.coolingOutline) {
    const zone=options.coolingOutline.map(([x,y])=>[x,mirrorY(y),4]);
    polygon(zone, light ? "#4aa9d366" : "#37b7e177", light ? "#12789e" : "#8ce4ff", 2);
  }

  if (options.layers.architecture) {
    if(custom){
      custom.wet.forEach(values=>{const vertices=rectangle(values,2);polygon(vertices,light?"#aed5dd8c":"#26404b7d",null);markSurface(vertices,"wet_floor");});
      custom.balcony.forEach(values=>{const vertices=rectangle(values,2);polygon(vertices,light?"#dac29573":"#5243295c",null);markSurface(vertices,"balcony_floor");});
      custom.ceiling.forEach(values=>polygon(rectangle(values,3),light?"#c4b79c4d":"#99917d31",null));
    }else{
      [[660,350,150,344],[161,714,346,151]].forEach(values=>{const vertices=rectangle(values,2);polygon(vertices,light?"#aed5dd8c":"#26404b7d",null);markSurface(vertices,"wet_floor");});
      {const vertices=rectangle([830,350,400,230],2);polygon(vertices,light?"#dac29573":"#5243295c",null);markSurface(vertices,"balcony_floor");}
      polygon(rectangle([830,600,390,28],2), light?"#c4b79c4d":"#99917d31", null);
      polygon(rectangle([830,1095,390,28],2), light?"#c4b79c4d":"#99917d31", null);
    }
    options.shafts.forEach(values => {
      const corners = rectangle(values, 4);
      polygon(corners, light?"#e7d9e9":"#342635", light?"#836d89":"#b59cb8", 1.2);
      markSurface(corners,"shaft");
      polygon([corners[0],corners[2]], null, light?"#836d89":"#b59cb8", 1);
      polygon([corners[1],corners[3]], null, light?"#836d89":"#b59cb8", 1);
    });
    if(options.decorated && custom && options.final===4){
      // Estudo visual do final 4 comum: apenas volumes de mobiliário solto.
      // Paredes, shafts, aberturas e área técnica da condensadora não são alterados.
      const box=(x,y,w,h,zTop,top,front,side,zBase=4)=>{
        const low=rectangle([x,y,w,h],zBase),high=rectangle([x,y,w,h],zTop);
        const sides=[
          {vertices:[low[0],low[1],high[1],high[0]],fill:front},
          {vertices:[low[1],low[2],high[2],high[1]],fill:side},
          {vertices:[low[2],low[3],high[3],high[2]],fill:front},
          {vertices:[low[3],low[0],high[0],high[3]],fill:side}
        ].sort((a,b)=>a.vertices.reduce((sum,p)=>sum+depth(p),0)-b.vertices.reduce((sum,p)=>sum+depth(p),0));
        sides.forEach(face=>polygon(face.vertices,face.fill,"#4a3b2a",.75));
        polygon(high,top,"#4a3b2a",.8);
      };
      const rug=(x,y,w,h,color)=>polygon(rectangle([x,y,w,h],4),color,"#796f5d",1.2);
      const bed=(x,y,w,h,accent)=>{
        box(x,y,w,h,20,"#92714e","#6f5339","#5e452f");
        box(x+5,y+5,w-10,h-10,37,"#f2eadb","#d5c9b6","#c4b8a4",20);
        box(x+9,y+55,w-18,h-63,39,accent,accent,"#8d968a",37);
        box(x+11,y+11,(w-28)/2,28,44,"#fffaf0","#e4d8c8","#e4d8c8",37);
        box(x+17+(w-28)/2,y+11,(w-28)/2,28,44,"#fffaf0","#e4d8c8","#e4d8c8",37);
      };
      // Sala e cozinha abertas: assentos, tapete e mesa sem mudanças em instalações.
      rug(523,542,109,145,"#b4c0ad");
      box(568,603,58,85,33,"#e8d7bb","#cbb99e","#bca88d");
      box(610,600,17,91,64,"#efe1cb","#d4c2a8","#c4b195");
      box(566,598,58,16,54,"#efe1cb","#d4c2a8","#c4b195");
      box(543,552,54,33,29,"#aa835c","#83613f","#735335");
      box(553,498,68,23,38,"#a77c54","#835c3e","#725135");
      box(398,564,79,48,52,"#b18a61","#856441","#735435");
      [[385,570],[481,570],[408,617],[452,617]].forEach(([x,y])=>box(x,y,24,22,27,"#d4c4a9","#aa987c","#99886f"));
      box(275,530,28,122,61,"#efe9dd","#d1c5b3","#bdad99");
      polygon(rectangle([278,570,22,37],62),"#e8ece7","#687e80",1.2);
      polygon(rectangle([282,575,14,27],63),"#91b8c0","#5d8089",1.1);
      box(282,657,44,42,78,"#d9d9d2","#b7b9b2","#a7aaa3");
      // Serviço: lavadora acessível, sem fechar shafts ou prumadas.
      box(285,744,53,50,63,"#f0f0e9","#cbd1cf","#b6bebb");
      // Dormitório e suíte: camas e apoios soltos, sem pressupor fixações.
      rug(553,787,173,145,"#d4cbbb");
      bed(581,783,118,137,"#a9b8ad");
      box(517,759,47,28,65,"#9c7856","#755638","#63482f");
      box(709,807,28,33,38,"#a77c54","#825d3b","#715034");
      rug(838,505,164,190,"#d7d0c2");
      bed(858,520,126,151,"#d5b9a5");
      box(808,555,35,105,73,"#a38260","#795a3d","#684c33");
      // Varanda aberta: dois assentos; reserva técnica da condensadora livre.
      box(293,837,48,44,32,"#ddd0b7","#bbaa8e","#a79479");
      box(296,895,48,40,32,"#ddd0b7","#bbaa8e","#a79479");
      polygon(rectangle([464,854,48,57],5),"#66bfd638","#167d97",1.4);
    }
    const faces = [];
    const addBox = (values, material, wallHeight) => {
      const palette = material === "structural"
        ? {sides:light?["#bd945d","#9d784c"]:["#a57c43d9","#806038d9"],top:"#d5ad6f",stroke:light?"#765530":"#deb67a"}
        : material === "masonry"
          ? {sides:light?["#b85c30","#9c4623"]:["#a94f25e8","#813718e8"],top:light?"#cc7441":"#b65c2e",stroke:light?"#713416":"#e99b62"}
          : {sides:light?["#86b6c0","#638f9d"]:["#54899ad9","#355d6cd9"],top:light?"#a8cad2":"#7bb6c5",stroke:light?"#477789":"#8bc3d3"};
      const low = rectangle(values, 3);
      const high = rectangle(values, wallHeight);
      for (let i = 0; i < 4; i++) {
        const next = (i + 1) % 4;
        const face = [low[i],low[next],high[next],high[i]];
        faces.push({
          vertices: face,
          depth: face.reduce((sum, point) => sum + depth(point), 0) / 4,
          fill: palette.sides[i % 2], stroke:palette.stroke, surface:material
        });
      }
      faces.push({
        vertices: high,
        depth: high.reduce((sum, point) => sum + depth(point), 0) / 4,
        fill:palette.top,stroke:palette.stroke,surface:material
      });
    };
    options.structural.forEach(values => addBox(values,"structural",155));
    (options.masonry||[]).forEach(values => addBox(values,"masonry",145));
    options.drywall.forEach(values => addBox(values,"drywall",135));
    faces.sort((a,b)=>a.depth-b.depth);
    faces.forEach(face => {polygon(face.vertices,face.fill,face.stroke,.9);markSurface(face.vertices,face.surface);});
    const labels = custom ? custom.labels.map(([x,y,lines])=>[x,y,lines.join(" ")]) : [
      [400,505,"SUÍTE"],[735,530,"BANHO SUÍTE"],[995,495,"VARANDA"],
      [320,800,"BANHO SOCIAL"],[390,1080,"DORMITÓRIO"],
      [830,950,"SALA"],[1090,900,"COZINHA"],[1115,730,"SERVIÇO"]
    ];
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "12px Georgia";
    labels.forEach(([x,y,label]) => {
      const [sx,sy] = project([x,mirrorY(y),8]);
      context.lineWidth = 3;
      context.strokeStyle = light ? "#fffdf7" : "#15130f";
      context.strokeText(label,sx,sy);
      context.fillStyle = light ? "#2d322d" : "#e7d4ae";
      context.fillText(label,sx,sy);
    });
  }

  const colors = {
    electric:"#61c9ec", hydraulic:"#4f9cf4",
    systems:"#e99559", drains:"#ca82e7"
  };
  const hits = [];
  const compact=width<=660;
  const occupiedBadges=[];
  const kindForDot=(dot)=>{
    const title=(dot.title||"").toLowerCase();
    const declared=String(dot.kind||"").toLowerCase().replaceAll("-","_");
    if(["tv","phone","intercom","bell","bell_button","sconce"].includes(declared))return declared;
    if(dot.layer==="hydraulic")return "water";
    if(dot.layer==="drains")return "drain";
    if(title.includes("arandela"))return "sconce";
    if(title.includes("interfone"))return "intercom";
    if(title.includes("botão")&&title.includes("campainha"))return "bell_button";
    if(title.includes("campainha"))return "bell";
    if(title.includes("telefone"))return "phone";
    if(title.includes("tv")||title.includes("televisão"))return "tv";
    if(title.includes("chuveiro"))return "shower";
    if(title.includes("quadro"))return "panel";
    if(title.includes("exaustor"))return "exhaust";
    if(title.includes("condensadora")||dot.label==="C")return "condenser";
    if(title.includes("evaporadora")||dot.label==="EV")return "ac";
    if(title.includes("gás")||dot.label==="G")return "gas";
    if(dot.layer==="systems")return "stack";
    if(dot.label==="T")return "outlet";
    if(dot.label==="I")return "switch";
    return "light";
  };
  const wallRects=[...options.structural,...(options.masonry||[]),...options.drywall].map(mirrorRect);
  const shaftRects=options.shafts.map(mirrorRect);
  const nearestEdge=(x,y,rectangles)=>{
    let best=null;
    rectangles.forEach(([rx,ry,rw,rh])=>{
      const edges=[
        [rx,Math.max(ry,Math.min(ry+rh,y))],
        [rx+rw,Math.max(ry,Math.min(ry+rh,y))],
        [Math.max(rx,Math.min(rx+rw,x)),ry],
        [Math.max(rx,Math.min(rx+rw,x)),ry+rh]
      ];
      edges.forEach(([px,py])=>{
        const distance=Math.hypot(px-x,py-y);
        if(!best||distance<best.distance)best={x:px,y:py,distance};
      });
    });
    return best;
  };
  // As alturas abaixo são unidades do desenho, não cotas de instalação.
  const heightForKind={outlet:42,switch:88,shower:112,panel:91,ac:118,gas:76,stack:78,condenser:18,drain:4,water:8,light:164,exhaust:164,
    tv:58,phone:55,intercom:98,bell:118,bell_button:88,sconce:126};
  const wallKinds=new Set(["outlet","switch","shower","panel","ac","gas","tv","phone","intercom","bell","bell_button","sconce"]);
  const priorityForKind={shower:4,ac:4,condenser:4,panel:4,gas:3,switch:3,outlet:3,tv:3,phone:3,intercom:3,bell:3,bell_button:3,sconce:3,
    water:2,drain:2,stack:2,light:1,exhaust:1};
  const drawIcon=(kind,x,y,r,color)=>{
    context.save();
    context.translate(x,y);
    context.globalAlpha=Math.max(.7,options.opacity);
    context.fillStyle=light?"#fffdf8f2":"#15130ff2";
    context.strokeStyle=color;
    context.lineWidth=1.8;
    context.beginPath();
    if(typeof context.roundRect==="function")context.roundRect(-r,-r,r*2,r*2,4);
    else context.rect(-r,-r,r*2,r*2);
    context.fill();context.stroke();
    context.strokeStyle=light?"#20343b":"#f6edda";
    context.fillStyle=light?"#20343b":"#f6edda";
    context.lineWidth=1.5;
    context.lineCap="round";
    context.lineJoin="round";
    if(kind==="outlet"){
      context.strokeRect(-6,-6,12,12);
      context.beginPath();context.moveTo(-2,-2);context.lineTo(-2,1);context.moveTo(2,-2);context.lineTo(2,1);context.stroke();
      context.beginPath();context.arc(0,4,1,0,Math.PI*2);context.fill();
    }else if(kind==="switch"){
      context.strokeRect(-6,-6,12,12);
      context.beginPath();context.moveTo(-3,3);context.lineTo(3,-3);context.stroke();
      context.beginPath();context.arc(-3,3,1.3,0,Math.PI*2);context.arc(3,-3,1.3,0,Math.PI*2);context.fill();
    }else if(kind==="tv"){
      context.strokeRect(-7,-5,14,9);
      context.beginPath();context.moveTo(0,4);context.lineTo(0,6);context.moveTo(-3,6);context.lineTo(3,6);context.stroke();
    }else if(kind==="phone"){
      context.beginPath();context.moveTo(-6,-4);context.lineTo(-3,-6);context.lineTo(-1,-3);
      context.bezierCurveTo(-1,0,1,2,3,2);context.lineTo(5,0);context.lineTo(7,3);context.lineTo(4,6);
      context.bezierCurveTo(-1,6,-6,1,-6,-4);context.stroke();
    }else if(kind==="intercom"){
      context.strokeRect(-5,-7,10,14);
      context.beginPath();context.moveTo(-2,-4);context.lineTo(2,-4);context.moveTo(-2,-1);context.lineTo(2,-1);context.stroke();
      context.beginPath();context.arc(0,4,1.3,0,Math.PI*2);context.fill();
    }else if(kind==="bell"){
      context.beginPath();context.moveTo(-5,3);context.lineTo(-3,1);context.lineTo(-3,-2);context.arc(0,-2,3,Math.PI,Math.PI*2);context.lineTo(3,1);context.lineTo(5,3);context.closePath();context.stroke();
      context.beginPath();context.arc(0,5,1,0,Math.PI*2);context.fill();
    }else if(kind==="bell_button"){
      context.strokeRect(-6,-6,12,12);
      context.beginPath();context.arc(0,0,3,0,Math.PI*2);context.stroke();
    }else if(kind==="sconce"){
      context.beginPath();context.moveTo(-6,-6);context.lineTo(-6,6);context.moveTo(-6,0);context.lineTo(-2,0);context.moveTo(-2,-4);context.lineTo(5,-1);context.lineTo(-2,2);context.closePath();context.stroke();
      context.beginPath();context.moveTo(5,-5);context.lineTo(7,-6);context.moveTo(5,3);context.lineTo(7,5);context.stroke();
    }else if(kind==="shower"){
      context.beginPath();context.arc(0,-2,5,Math.PI,Math.PI*2);context.moveTo(-5,-2);context.lineTo(5,-2);
      [-4,0,4].forEach(dx=>{context.moveTo(dx,1);context.lineTo(dx-1,5);});context.stroke();
    }else if(kind==="light"){
      context.beginPath();context.arc(0,0,3,0,Math.PI*2);context.stroke();
      for(let i=0;i<8;i++){const angle=i*Math.PI/4;context.beginPath();context.moveTo(Math.cos(angle)*5,Math.sin(angle)*5);context.lineTo(Math.cos(angle)*7,Math.sin(angle)*7);context.stroke();}
    }else if(kind==="panel"){
      context.strokeRect(-6,-7,12,14);
      [-3,1,5].forEach(dy=>{context.beginPath();context.moveTo(-3,dy);context.lineTo(3,dy);context.stroke();});
    }else if(kind==="ac"){
      context.strokeRect(-8,-5,16,10);
      [-2,1,4].forEach(dy=>{context.beginPath();context.moveTo(-5,dy);context.lineTo(5,dy);context.stroke();});
    }else if(kind==="condenser"||kind==="exhaust"){
      context.strokeRect(-7,-7,14,14);
      context.beginPath();context.arc(0,0,5,0,Math.PI*2);context.stroke();
      for(let i=0;i<4;i++){const angle=i*Math.PI/2;context.beginPath();context.moveTo(0,0);context.lineTo(Math.cos(angle)*4,Math.sin(angle)*4);context.stroke();}
      context.beginPath();context.arc(0,0,1,0,Math.PI*2);context.fill();
    }else if(kind==="water"){
      context.strokeRect(-6,-7,12,14);
      context.beginPath();context.moveTo(0,-4);context.bezierCurveTo(4,0,4,3,0,4);context.bezierCurveTo(-4,3,-4,0,0,-4);context.stroke();
    }else if(kind==="drain"){
      context.strokeRect(-6,-6,12,12);
      [-2,2].forEach(dx=>{context.beginPath();context.moveTo(dx,-5);context.lineTo(dx,5);context.stroke();});
    }else if(kind==="gas"){
      context.beginPath();context.moveTo(0,-7);context.bezierCurveTo(5,-3,3,0,5,2);context.bezierCurveTo(6,6,2,7,0,7);context.bezierCurveTo(-5,7,-7,3,-4,-1);context.bezierCurveTo(-2,1,-1,0,0,-7);context.stroke();
    }else{
      context.strokeRect(-4,-7,8,14);
      context.beginPath();context.moveTo(0,-5);context.lineTo(0,4);context.moveTo(-3,2);context.lineTo(0,5);context.lineTo(3,2);context.stroke();
    }
    context.restore();
  };
  const overlaps=(a,b,pad=5)=>a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;
  const placeMeasure=(cx,cy,w,h,occupied,minY=8,bottom=8)=>{
    const offsets=[[0,0],[0,-52],[0,52],[-115,0],[115,0],[-115,-52],[115,-52],[-115,52],[115,52],[0,-104],[0,104]];
    let chosen=null,best=Infinity;
    offsets.forEach(([dx,dy])=>{
      const x=Math.max(8,Math.min(width-w-8,cx+dx-w/2));
      const y=Math.max(minY,Math.min(height-h-bottom,cy+dy-h/2));
      const box={x,y,w,h};
      const clashes=occupied.reduce((count,used)=>count+(overlaps(box,used)?1:0),0);
      const score=clashes*10000+Math.hypot(dx,dy)*.8+Math.hypot(x+w/2-cx,y+h/2-cy)*.2;
      if(score<best){best=score;chosen=box;}
    });
    return chosen;
  };
  const preparedDots=options.dots.filter(dot=>options.layers[dot.layer]).map(dot=>{
    const kind=kindForDot(dot);
    const originalX=dot.x,originalY=mirrorY(dot.y);
    let anchorX=originalX,anchorY=originalY;
    const nearby=nearestEdge(originalX,originalY,kind==="stack"?shaftRects:wallRects);
    const mounted=!!nearby&&nearby.distance<=(kind==="stack"?95:115)&&(kind==="stack"||wallKinds.has(kind));
    if(mounted){
      anchorX=nearby.x;anchorY=nearby.y;
      if(nearby.distance>2){anchorX+=(originalX-nearby.x)/nearby.distance*5;anchorY+=(originalY-nearby.y)/nearby.distance*5;}
    }
    // Sem uma face próxima, o ponto permanece uma referência no piso, sem sugerir posição de instalação.
    const referenceHeight=!mounted&&(wallKinds.has(kind)||kind==="stack")?18:(heightForKind[kind]||18);
    const [anchorScreenX,anchorScreenY]=project([anchorX,anchorY,referenceHeight]);
    return {dot,kind,originalX,originalY,anchorScreenX,anchorScreenY};
  }).sort((a,b)=>(priorityForKind[b.kind]||1)-(priorityForKind[a.kind]||1));
  const groupOverview=compact&&zoom<1.7&&preparedDots.length>24;
  const soloKinds=new Set(["shower","ac","condenser","panel","gas"]);
  const groups=[];
  preparedDots.forEach(item=>{
    const canJoin=groupOverview&&!soloKinds.has(item.kind);
    const group=canJoin?groups.find(candidate=>candidate.canJoin&&candidate.members.length<10&&
      Math.hypot(candidate.anchorScreenX-item.anchorScreenX,candidate.anchorScreenY-item.anchorScreenY)<38&&
      Math.hypot(candidate.originalX-item.originalX,candidate.originalY-item.originalY)<125):null;
    if(group){
      const n=group.members.length;
      if(group.layer!==item.dot.layer)group.layer="mixed";
      group.anchorScreenX=(group.anchorScreenX*n+item.anchorScreenX)/(n+1);
      group.anchorScreenY=(group.anchorScreenY*n+item.anchorScreenY)/(n+1);
      group.originalX=(group.originalX*n+item.originalX)/(n+1);
      group.originalY=(group.originalY*n+item.originalY)/(n+1);
      group.members.push(item);
    }else groups.push({layer:item.dot.layer,canJoin,members:[item],originalX:item.originalX,originalY:item.originalY,
      anchorScreenX:item.anchorScreenX,anchorScreenY:item.anchorScreenY});
  });
  const visualItems=groups.map(group=>{
    if(group.members.length>1)return {cluster:{layer:group.layer,count:group.members.length,dots:group.members.map(item=>item.dot)},
      radius:14,anchorScreenX:group.anchorScreenX,anchorScreenY:group.anchorScreenY};
    const item=group.members[0];
    const radius=compact?(item.kind==="outlet"||item.kind==="switch"||item.kind==="tv"||item.kind==="phone"?9:
      ["light","stack","water","drain","exhaust","bell","bell_button","sconce","intercom"].includes(item.kind)?8:10):preparedDots.length>45?10:11;
    return {...item,radius};
  });
  const dotPositions=[];
  const offsets=[[0,0],[0,-20],[20,0],[-20,0],[0,20],[20,-20],[-20,-20],[20,20],[-20,20],
    [0,-40],[40,0],[-40,0],[0,40],[40,-20],[-40,-20],[40,20],[-40,20],
    [20,-40],[-20,-40],[20,40],[-20,40],[40,-40],[-40,-40],[40,40],[-40,40],
    [0,-60],[60,0],[-60,0],[0,60]];
  const visibleDots=visualItems.map(item=>{
    const {radius,anchorScreenX,anchorScreenY}=item;
    let best=null,bestScore=Infinity;
    offsets.forEach(([dx,dy])=>{
      const x=anchorScreenX+dx,y=anchorScreenY+dy;
      const outside=x<radius+2||x>width-radius-2||y<radius+2||y>height-radius-2;
      const clashes=dotPositions.reduce((count,used)=>count+(Math.hypot(x-used.x,y-used.y)<radius+used.radius+3?1:0),0);
      const score=(outside?10000:0)+clashes*1000+Math.hypot(dx,dy);
      if(score<bestScore){bestScore=score;best={x,y};}
    });
    const sx=best.x,sy=best.y;
    dotPositions.push({x:sx,y:sy,radius});
    hits.push(item.cluster?{x:sx,y:sy,r:20,priority:4,cluster:item.cluster}:
      {x:sx,y:sy,r:Math.max(radius+5,16),priority:3,dot:item.dot});
    occupiedBadges.push({x:sx-radius-2,y:sy-radius-2,w:(radius+2)*2,h:(radius+2)*2});
    return {...item,sx,sy};
  });
  const drawCluster=(cluster,x,y)=>{
    context.save();context.translate(x,y);context.globalAlpha=Math.max(.8,options.opacity);
    context.fillStyle=light?"#fffdf8f2":"#15130ff2";
    context.strokeStyle=colors[cluster.layer]||"#b18a4d";context.lineWidth=2;
    context.beginPath();
    if(typeof context.roundRect==="function")context.roundRect(-17,-12,34,24,6);
    else context.rect(-17,-12,34,24);
    context.fill();context.stroke();
    context.strokeStyle=light?"#20343b":"#f6edda";context.fillStyle=light?"#20343b":"#f6edda";
    context.lineWidth=1.5;context.lineCap="round";context.lineJoin="round";
    if(cluster.layer==="electric"){
      context.beginPath();context.moveTo(-9,-8);context.lineTo(-13,0);context.lineTo(-8,0);context.lineTo(-11,8);context.lineTo(-4,-2);context.lineTo(-9,-2);context.closePath();context.fill();
    }else if(cluster.layer==="hydraulic"){
      context.strokeRect(-14,-8,12,16);
      context.beginPath();context.moveTo(-8,-5);context.bezierCurveTo(-3,1,-4,5,-8,5);context.bezierCurveTo(-12,5,-13,1,-8,-5);context.stroke();
    }else if(cluster.layer==="drains"){
      context.strokeRect(-14,-7,12,14);
      context.beginPath();context.moveTo(-10,-6);context.lineTo(-10,6);context.moveTo(-6,-6);context.lineTo(-6,6);context.stroke();
    }else if(cluster.layer==="mixed"){
      const stripes=["electric","hydraulic","drains","systems"];
      stripes.forEach((layer,index)=>{context.fillStyle=colors[layer]||"#b18a4d";context.fillRect(-13+index*3,-7,2,14);});
      context.fillStyle=light?"#20343b":"#f6edda";
    }else{
      context.strokeRect(-12,-8,8,16);
      context.beginPath();context.moveTo(-8,-6);context.lineTo(-8,6);context.stroke();
    }
    context.font="bold 11px Arial";context.textAlign="center";context.textBaseline="middle";
    context.fillText(String(cluster.count),8,0);
    context.restore();
  };
  const drawVisibleDots=()=>visibleDots.forEach(item=>{
    const {sx,sy,anchorScreenX,anchorScreenY}=item;
    if(Math.hypot(sx-anchorScreenX,sy-anchorScreenY)>3){
      context.save();context.globalAlpha=.65;context.strokeStyle=colors[item.cluster?.layer||item.dot.layer]||"#b18a4d";context.lineWidth=1;
      context.beginPath();context.moveTo(anchorScreenX,anchorScreenY);context.lineTo(sx,sy);context.stroke();context.restore();
    }
    if(item.cluster)drawCluster(item.cluster,sx,sy);
    else drawIcon(item.kind,sx,sy,item.radius,colors[item.dot.layer]);
  });
  if (options.cooling && options.coolingOutline) {
    const zone=options.coolingOutline.map(([x,y])=>[x,mirrorY(y),4]);
    const center=zone.reduce((sum,[x,y])=>[sum[0]+x/zone.length,sum[1]+y/zone.length],[0,0]);
    const [sx,sy]=project([center[0],center[1],7]);
    const badgeWidth=Math.min(236,Math.max(180,width-16));
    const badgeHeight=70;
    const showAreas=!!options.layers.areas;
    const badgeX=showAreas?10:Math.max(8,Math.min(width-badgeWidth-8,sx-badgeWidth/2));
    const above=showAreas||sy>115;
    const badgeY=showAreas?Math.max(10,Math.min(height-badgeHeight-10,options.layers.dimensions?140:100)):Math.max(10,Math.min(height-badgeHeight-10,above?sy-112:sy+34));
    context.beginPath();
    context.moveTo(badgeX+badgeWidth/2,above?badgeY+badgeHeight:badgeY);
    context.lineTo(sx,sy);
    context.strokeStyle=light?"#117aa4":"#80e1ff";
    context.lineWidth=2;
    context.stroke();
    context.beginPath();
    context.arc(sx,sy,5,0,Math.PI*2);
    context.fillStyle=light?"#08789c":"#9bebff";
    context.fill();
    context.fillStyle=light?"#e7f9feef":"#0d2631f2";
    context.strokeStyle=light?"#1680a4":"#80dfff";
    context.lineWidth=2;
    context.beginPath();
    if (typeof context.roundRect==="function") context.roundRect(badgeX,badgeY,badgeWidth,badgeHeight,8);
    else context.rect(badgeX,badgeY,badgeWidth,badgeHeight);
    context.fill();
    context.stroke();
    context.textAlign="center";
    context.textBaseline="middle";
    context.fillStyle=light?"#114c65":"#e5faff";
    context.font="bold 13px Arial";
    context.fillText("❄ AR 9.000 BTU/h",badgeX+badgeWidth/2,badgeY+19);
    context.font="bold 12px Arial";
    context.fillText("10–15 m² sem sol direto",badgeX+badgeWidth/2,badgeY+39);
    context.font="9px Arial";
    context.fillText("CONTORNO ILUSTRATIVO",badgeX+badgeWidth/2,badgeY+57);
    occupiedBadges.push({x:badgeX,y:badgeY,w:badgeWidth,h:badgeHeight});
  }
  if (options.layers.areas && options.areas) {
    const areas=options.areas.map(area=>({area,point:project([area.x,mirrorY(area.y),18])}));
    if(compact)areas.sort((a,b)=>a.point[1]-b.point[1]);
    areas.forEach(({area,point:[sx,sy]}) => {
      if(compact&&(sx< -24||sx>width+24||sy< -24||sy>height+24))return;
      const label=`≈${Math.round(area.approx)} m²`;
      context.font=compact?"bold 11px Arial":"bold 12px Arial";
      const badgeWidth=Math.max(compact?54:62,context.measureText(label).width+(compact?10:18));
      const badgeHeight=compact?22:25;
      let box={x:sx-badgeWidth/2,y:sy+8,w:badgeWidth,h:badgeHeight};
      let moved=false;
      if(compact){
        let chosen=null,best=Infinity;
        const sides=[8,width-badgeWidth-8];
        const shifts=[0,-24,24,-48,48,-72,72,-96,96,-120,120,-144,144];
        sides.forEach(x=>shifts.forEach(shift=>{
          const y=Math.max(8,Math.min(height-badgeHeight-8,sy-badgeHeight/2+shift));
          const candidate={x,y,w:badgeWidth,h:badgeHeight};
          const clashes=occupiedBadges.reduce((count,used)=>count+(overlaps(candidate,used)?1:0),0);
          const score=clashes*10000+Math.abs(y+badgeHeight/2-sy)*.8+Math.abs(x+badgeWidth/2-sx)*.18;
          if(score<best){best=score;chosen=candidate;}
        }));
        box=chosen;
        moved=true;
      }else if(occupiedBadges.some(used=>overlaps(box,used))){
        box=placeMeasure(sx,sy+8+badgeHeight/2,badgeWidth,badgeHeight,occupiedBadges,56,58);
        moved=true;
      }
      if(moved){
        const nearX=sx<box.x?box.x:sx>box.x+box.w?box.x+box.w:box.x+box.w/2;
        const nearY=Math.max(box.y,Math.min(sy,box.y+box.h));
        context.beginPath();context.moveTo(sx,sy);context.lineTo(nearX,nearY);
        context.strokeStyle=light?"#3d9461":"#8fe1ac";context.lineWidth=1;context.stroke();
        context.beginPath();context.arc(sx,sy,3,0,Math.PI*2);
        context.fillStyle=light?"#3d9461":"#8fe1ac";context.fill();
      }
      context.fillStyle=light?"#e5f6e9f2":"#143824f2";
      context.strokeStyle=light?"#3d9461":"#8fe1ac";
      context.lineWidth=1.5;
      context.beginPath();
      if (typeof context.roundRect==="function") context.roundRect(box.x,box.y,box.w,box.h,6);
      else context.rect(box.x,box.y,box.w,box.h);
      context.fill();
      context.stroke();
      context.fillStyle=light?"#1c6237":"#e7ffed";
      context.textAlign="center";
      context.textBaseline="middle";
      context.fillText(label,box.x+box.w/2,box.y+box.h/2);
      occupiedBadges.push(box);
      const detail={layer:"areas",title:`${area.name}: ${label}`,description:area.open?"Sala, cozinha, serviço e circulação formam um espaço sem paredes separando esses usos. Área estimada; confira no imóvel.":"Área estimada a partir da planta, para planejamento inicial. Confira no apartamento antes de comprar materiais.",page:1};
      hits.push({x:box.x+box.w/2,y:box.y+box.h/2,box,priority:2,dot:detail});
      if(moved)hits.push({x:sx,y:sy,r:8,priority:2,dot:detail});
    });
  }
  if (options.layers.dimensions && options.dimensions) {
    const occupied=[...occupiedBadges];
    const selected=Number.isInteger(options.activeDimension3d)?options.activeDimension3d:0;
    const source={sourceUrl:options.dimensionSource,sourceName:options.dimensionSourceName||"Planta cotada",sourceLinkText:"Abrir planta cotada ↗"};
    options.dimensions.forEach((item,index) => {
      if(compact&&index!==selected)return;
      const [sx,sy]=project([item.x,mirrorY(item.y),18]);
      const title=item.name.toUpperCase();
      const value=item.size;
      context.font="bold 12px Arial";
      const badgeWidth=Math.max(116,context.measureText(value).width+22);
      const badgeHeight=43;
      const box=placeMeasure(sx,sy,badgeWidth,badgeHeight,occupied,compact?8:56,compact?8:58);
      if(Math.hypot(box.x+box.w/2-sx,box.y+box.h/2-sy)>3){
        const nearX=Math.max(box.x,Math.min(sx,box.x+box.w));
        const nearY=Math.max(box.y,Math.min(sy,box.y+box.h));
        context.beginPath();context.moveTo(sx,sy);context.lineTo(nearX,nearY);
        context.strokeStyle=light?"#8c5920":"#f0c878";context.lineWidth=1.5;context.stroke();
      }
      context.fillStyle=light?"#fff9eaf2":"#2b2114f2";
      context.strokeStyle=light?"#9a743c":"#e9c688";
      context.lineWidth=1.5;
      context.beginPath();
      if (typeof context.roundRect==="function") context.roundRect(box.x,box.y,box.w,box.h,6);
      else context.rect(box.x,box.y,box.w,box.h);
      context.fill();
      context.stroke();
      context.textAlign="center";
      context.textBaseline="middle";
      context.fillStyle=light?"#664a25":"#f8e8c9";
      context.font="bold 9px Arial";
      context.fillText(title,box.x+box.w/2,box.y+12);
      context.font="bold 12px Arial";
      context.fillText(value,box.x+box.w/2,box.y+29);
      occupied.push(box);
      hits.push({x:box.x+box.w/2,y:box.y+box.h/2,box,priority:2,dot:{layer:"dimensions",title:`${item.name}: ${item.size}`,description:"Cota da planta para este cômodo. A posição no 3D é esquemática. Confira a medida no apartamento antes de comprar ou executar.",page:1,...source}});
    });
    if(options.segments?.length){
      const segments=options.segments.map(item=>{
        const [x1,y1,x2,y2]=item.line;
        return {
          item,
          a:project([x1,mirrorY(y1),14]),
          b:project([x2,mirrorY(y2),14]),
          preferred:project([item.plate[0],mirrorY(item.plate[1]),18])
        };
      });
      context.save();
      context.strokeStyle=light?"#8c5920":"#f0c878";
      context.fillStyle=light?"#8c5920":"#f0c878";
      context.lineWidth=3;
      segments.forEach(({a,b},index)=>{
        context.globalAlpha=compact&&selected!==options.dimensions.length+index?.45:1;
        context.beginPath();context.moveTo(a[0],a[1]);context.lineTo(b[0],b[1]);context.stroke();
        [a,b].forEach(([x,y])=>{context.beginPath();context.arc(x,y,3,0,Math.PI*2);context.fill();});
      });
      context.globalAlpha=1;
      const badgeWidth=compact?116:146,badgeHeight=compact?35:42;
      segments.forEach(({item,a,b,preferred},index)=>{
        if(compact&&selected!==options.dimensions.length+index)return;
        const anchor=[(a[0]+b[0])/2,(a[1]+b[1])/2];
        const box=placeMeasure(preferred[0],preferred[1],badgeWidth,badgeHeight,occupied,compact?8:56,compact?8:58);
        occupied.push(box);
        const nearX=Math.max(box.x,Math.min(anchor[0],box.x+box.w));
        const nearY=Math.max(box.y,Math.min(anchor[1],box.y+box.h));
        context.beginPath();context.moveTo(anchor[0],anchor[1]);context.lineTo(nearX,nearY);
        context.lineWidth=1.5;context.setLineDash([4,3]);context.stroke();context.setLineDash([]);
        context.fillStyle=light?"#fff9eaf5":"#2b2114f5";
        context.strokeStyle=light?"#8c5920":"#f0c878";
        context.lineWidth=1.5;
        context.beginPath();
        if(typeof context.roundRect==="function")context.roundRect(box.x,box.y,box.w,box.h,5);
        else context.rect(box.x,box.y,box.w,box.h);
        context.fill();context.stroke();
        context.fillStyle=light?"#664a25":"#f8e8c9";
        context.textAlign="center";context.textBaseline="middle";
        context.font=compact?"bold 8px Arial":"bold 9px Arial";
        context.fillText(item.short3d,box.x+box.w/2,box.y+(compact?10:12));
        context.font=compact?"bold 11px Arial":"bold 13px Arial";
        context.fillText(item.size,box.x+box.w/2,box.y+(compact?25:29));
        context.strokeStyle=light?"#8c5920":"#f0c878";
        hits.push({x:box.x+box.w/2,y:box.y+box.h/2,box,priority:2,dot:{layer:"dimensions",title:`${item.name}: ${item.detail} · ${item.size}`,description:"Cota da planta para este trecho; o traço no 3D é esquemático. Confira a medida no apartamento antes de comprar ou executar.",page:1,...source}});
      });
      context.restore();
    }
  }
  // Pontos técnicos ficam por cima das etiquetas e mantêm a prioridade do toque.
  drawVisibleDots();
  return {hits,surfaces:surfaceHits};
}
