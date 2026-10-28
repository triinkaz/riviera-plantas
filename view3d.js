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
    const faces = [];
    const addBox = (values, material, wallHeight) => {
      const low = rectangle(values, 3);
      const high = rectangle(values, wallHeight);
      for (let i = 0; i < 4; i++) {
        const next = (i + 1) % 4;
        const face = [low[i],low[next],high[next],high[i]];
        faces.push({
          vertices: face,
          depth: face.reduce((sum, point) => sum + depth(point), 0) / 4,
          fill: material === "structural" ? (light ? (i % 2 ? "#9d784c" : "#bd945d") : (i % 2 ? "#806038d9" : "#a57c43d9")) : (light ? (i % 2 ? "#638f9d" : "#86b6c0") : (i % 2 ? "#355d6cd9" : "#54899ad9")),
          stroke: material === "structural" ? (light?"#765530":"#deb67a") : (light?"#477789":"#8bc3d3"), surface:material
        });
      }
      faces.push({
        vertices: high,
        depth: high.reduce((sum, point) => sum + depth(point), 0) / 4,
        fill: material === "structural" ? "#d5ad6f" : (light?"#a8cad2":"#7bb6c5"),
        stroke: material === "structural" ? (light?"#765530":"#ffe1a3") : (light?"#477789":"#b1e3ec"), surface:material
      });
    };
    options.structural.forEach(values => addBox(values,"structural",155));
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
  options.dots.forEach(dot => {
    if (!options.layers[dot.layer]) return;
    const [sx,sy] = project([dot.x,mirrorY(dot.y),18]);
    const radius = dot.layer === "hydraulic" ? 10 : 6;
    hits.push({x:sx,y:sy,r:Math.max(radius+7,14),dot});
    context.globalAlpha = options.opacity;
    context.beginPath();
    context.arc(sx,sy,radius+4,0,Math.PI*2);
    context.fillStyle = "#0e0d0bd9";
    context.fill();
    context.beginPath();
    context.arc(sx,sy,radius,0,Math.PI*2);
    context.fillStyle = colors[dot.layer];
    context.fill();
    context.strokeStyle = "#fff3d7";
    context.lineWidth = 1.2;
    context.stroke();
    if (dot.label) {
      context.fillStyle = "#0c0b09";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = "bold 7px Arial";
      context.fillText(dot.label,sx,sy+.5);
    }
    context.globalAlpha = 1;
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
  }
  if (options.layers.areas && options.areas) {
    options.areas.forEach(area => {
      const [sx,sy]=project([area.x,mirrorY(area.y),18]);
      const label=`≈${Math.round(area.approx)} m²`;
      context.font="bold 12px Arial";
      const badgeWidth=Math.max(62,context.measureText(label).width+18);
      const badgeHeight=25;
      const badgeX=sx-badgeWidth/2;
      const badgeY=sy+8;
      context.fillStyle=light?"#e5f6e9f2":"#143824f2";
      context.strokeStyle=light?"#3d9461":"#8fe1ac";
      context.lineWidth=1.5;
      context.beginPath();
      if (typeof context.roundRect==="function") context.roundRect(badgeX,badgeY,badgeWidth,badgeHeight,6);
      else context.rect(badgeX,badgeY,badgeWidth,badgeHeight);
      context.fill();
      context.stroke();
      context.fillStyle=light?"#1c6237":"#e7ffed";
      context.textAlign="center";
      context.textBaseline="middle";
      context.fillText(label,sx,badgeY+badgeHeight/2);
      hits.push({x:sx,y:badgeY+badgeHeight/2,r:Math.max(21,badgeWidth/2),dot:{layer:"areas",title:`${area.name}: ${label}`,description:area.open?"Sala, cozinha, serviço e circulação formam um espaço sem paredes separando esses usos. Valor aproximado; confira as medidas no imóvel.":"Valor aproximado obtido da planta. Confira as medidas no imóvel.",page:1}});
    });
  }
  if (options.layers.dimensions && options.dimensions) {
    options.dimensions.forEach(item => {
      const [sx,sy]=project([item.x,mirrorY(item.y),18]);
      const title=item.name.toUpperCase();
      const value=item.size;
      context.font="bold 12px Arial";
      const badgeWidth=Math.max(116,context.measureText(value).width+22);
      const badgeHeight=43;
      const badgeX=sx-badgeWidth/2;
      const badgeY=sy-badgeHeight/2;
      context.fillStyle=light?"#fff9eaf2":"#2b2114f2";
      context.strokeStyle=light?"#9a743c":"#e9c688";
      context.lineWidth=1.5;
      context.beginPath();
      if (typeof context.roundRect==="function") context.roundRect(badgeX,badgeY,badgeWidth,badgeHeight,6);
      else context.rect(badgeX,badgeY,badgeWidth,badgeHeight);
      context.fill();
      context.stroke();
      context.textAlign="center";
      context.textBaseline="middle";
      context.fillStyle=light?"#664a25":"#f8e8c9";
      context.font="bold 9px Arial";
      context.fillText(title,sx,badgeY+12);
      context.font="bold 12px Arial";
      context.fillText(value,sx,badgeY+29);
    });
  }
  return {hits,surfaces:surfaceHits};
}
