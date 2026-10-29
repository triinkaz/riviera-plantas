(() => {
  const formUrl="https://docs.google.com/forms/d/e/1FAIpQLSdf92pmIKpQGUMzGYDpxC2nkZ5G6W54YkaZIYAsy1__SufEPA/viewform";
  const services={
    ar:"Instalação de ar-condicionado",
    vidro_ar:"Envidraçamento da varanda com estudo do ar-condicionado",
    box:"Box de banheiro",
    piso:"Pisos e revestimentos",
    telas:"Redes e telas de proteção",
    fechadura:"Fechadura eletrônica",
    automacao:"Automação residencial",
    eletrica:"Elétrica e iluminação",
    pedras:"Bancadas e pedras",
    gesso:"Gesso e forro",
    pintura:"Pintura",
    obra:"Pedreiro e obra geral",
    marcenaria:"Móveis planejados e marcenaria",
    projeto:"Projeto de arquitetura",
    engenharia:"Engenheiro para reforma",
    art_rrt:"ART ou RRT para reforma"
  };
  const countSheet="https://docs.google.com/spreadsheets/d/1bMIsKz-q7VSZJSpy8JNlkC8U6UvoQk7zGgz6d2GUgWY/gviz/tq";
  const countStatus=document.getElementById("collective-count-status");
  const counts=new Map();
  document.querySelectorAll("[data-collective-card]").forEach(card=>{
    const id=card.dataset.collectiveCard;
    if(!Object.hasOwn(services,id))return;
    const compact=card.tagName==="LI";
    const label=document.createElement("span");
    label.className=compact?"collective-mini-count":"collective-count";
    label.textContent="Carregando contagem…";
    label.setAttribute("aria-label",`Contagem de interessados em ${services[id]}: carregando`);
    if(compact){
      const link=card.querySelector("a");
      link.insertBefore(label,link.querySelector("span[aria-hidden]"));
    }else{
      const progress=document.createElement("span");
      progress.className="collective-progress";
      progress.setAttribute("aria-hidden","true");
      progress.append(document.createElement("span"));
      const block=document.createElement("div");
      block.className="collective-count-block";
      block.append(label,progress);
      card.querySelector("a").before(block);
    }
    counts.set(id,{card,label});
  });
  function unavailable(){
    countStatus.textContent="Contagem temporariamente indisponível. Você ainda pode registrar seu interesse.";
    counts.forEach(({label})=>{label.textContent="Contagem indisponível";label.removeAttribute("aria-label")});
  }
  let resolved=false;
  window.rivieraColetivaCountsReady=response=>{
    if(resolved)return;
    const rows=response?.table?.rows;
    if(response?.status!=="ok"||!Array.isArray(rows)){unavailable();resolved=true;return}
    const byName=new Map();
    rows.forEach(row=>{
      const cells=row?.c||[];
      const name=String(cells[0]?.v||"");
      const value=Number(cells[1]?.v);
      const minimum=Number(cells[2]?.v);
      if(name&&Number.isInteger(value)&&value>=0&&Number.isInteger(minimum)&&minimum>0)byName.set(name,{value,minimum});
    });
    if(Object.values(services).some(name=>!byName.has(name))){unavailable();resolved=true;return}
    const minimums=new Set([...byName.values()].map(item=>item.minimum));
    counts.forEach(({card,label},id)=>{
      const {value,minimum}=byName.get(services[id]);
      label.textContent=`${value} de ${minimum} interessados`;
      label.setAttribute("aria-label",`${services[id]}: ${value} de ${minimum} interessados`);
      if(value>=minimum){
        card.classList.add("collective-minimum-reached");
        label.textContent+=` · mínimo atingido`;
      }
      const fill=card.querySelector(".collective-progress span");
      if(fill)fill.style.width=`${Math.min(100,value/minimum*100)}%`;
    });
    const sharedMinimum=minimums.size===1?[...minimums][0]:null;
    countStatus.textContent=`A contagem considera um contato por serviço escolhido. ${sharedMinimum?`Ao chegar a ${sharedMinimum}`:"Ao atingir o mínimo"}, vamos buscar propostas.`;
    resolved=true;
  };
  const countRequest=new URL(countSheet);
  countRequest.searchParams.set("gid","1875703719");
  countRequest.searchParams.set("range","A5:E21");
  countRequest.searchParams.set("headers","1");
  countRequest.searchParams.set("tqx","out:json;responseHandler:rivieraColetivaCountsReady");
  const countScript=document.createElement("script");
  countScript.src=countRequest.href;
  countScript.async=true;
  countScript.onerror=()=>{if(!resolved){unavailable();resolved=true}};
  document.head.append(countScript);
  setTimeout(()=>{if(!resolved){unavailable();resolved=true}},12000);
  const params=new URLSearchParams(location.search);
  const chosenFinal=/^[1-6]$/.test(params.get("final")||"")?params.get("final"):"";
  const chosenService=Object.hasOwn(services,params.get("servico"))?params.get("servico"):"";
  const back=new URL("./",location.href);
  back.search="";
  if(chosenFinal)back.searchParams.set("final",chosenFinal);
  if(params.get("view")==="3d")back.searchParams.set("view","3d");
  document.querySelectorAll("#return-top,#return-bottom").forEach(link=>link.href=back.href);
  if(chosenFinal)document.getElementById("collective-final").textContent=`Final ${chosenFinal} selecionado`;
  const selectedServices=new Set();
  const selectButtons=new Map();
  const selectionBar=document.getElementById("collective-selection-bar");
  const selectionTotal=document.getElementById("collective-selection-total");
  const selectionNames=document.getElementById("collective-selection-names");
  const selectionContinue=document.getElementById("collective-selection-continue");
  function formLinkFor(ids){
    const url=new URL(formUrl);
    url.searchParams.set("usp","pp_url");
    ids.forEach(id=>url.searchParams.append("entry.1183952461",services[id]));
    if(chosenFinal)url.searchParams.set("entry.1242273522",chosenFinal);
    return url.href;
  }
  function updateSelection(){
    selectButtons.forEach((button,id)=>{
      const selected=selectedServices.has(id);
      const card=button.closest("[data-collective-card]");
      card.classList.toggle("is-picked",selected);
      button.setAttribute("aria-pressed",String(selected));
      if(card.tagName==="ARTICLE"){
        button.textContent=selected?"✓ Selecionado · remover":"+ Adicionar à cotação";
        button.setAttribute("aria-label",`${selected?"Remover":"Adicionar"} ${services[id]} ${selected?"da":"à"} cotação`);
      }else{
        button.querySelector("span[aria-hidden]").textContent=selected?"✓":"+";
      }
    });
    const count=selectedServices.size;
    selectionBar.hidden=count===0;
    document.body.classList.toggle("has-collective-selection",count>0);
    selectionTotal.textContent=`${count} ${count===1?"serviço selecionado":"serviços selecionados"}`;
    const names=[...selectedServices].map(id=>services[id]);
    selectionNames.textContent=names.length>2?`${names.slice(0,2).join(" · ")} · +${names.length-2}`:names.join(" · ");
    selectionContinue.textContent=`Continuar com ${count} ${count===1?"serviço":"serviços"} ↗`;
    selectionContinue.href=formLinkFor([...selectedServices]);
  }
  document.querySelectorAll("[data-collective-link]").forEach(link=>{
    const id=link.dataset.collectiveLink;
    const button=document.createElement("button");
    button.type="button";
    button.className="collective-select";
    button.dataset.collectiveSelect=id;
    while(link.firstChild)button.append(link.firstChild);
    link.replaceWith(button);
    selectButtons.set(id,button);
    button.addEventListener("click",()=>{
      if(selectedServices.has(id))selectedServices.delete(id);
      else selectedServices.add(id);
      updateSelection();
    });
  });
  if(chosenService){
    const card=document.querySelector(`[data-collective-card="${chosenService}"]`);
    selectedServices.add(chosenService);
    card.classList.add("is-selected");
    const more=card.closest("details");
    if(more)more.open=true;
    const selected=document.createElement("span");
    selected.className=more?"collective-mini-selected":"collective-selected";
    selected.textContent=more?"Visto na planta":"Você estava vendo este serviço na planta";
    card.prepend(selected);
  }
  updateSelection();
  selectionContinue.addEventListener("click",()=>window.rivieraAnalytics?.track("collective_form_open",{service_count:selectedServices.size}));
  const themeButton=document.getElementById("theme-toggle");
  function syncTheme(){
    const dark=document.documentElement.dataset.theme==="dark";
    themeButton.setAttribute("aria-pressed",String(dark));
    themeButton.setAttribute("aria-label",dark?"Ativar tema claro":"Ativar tema escuro");
    themeButton.querySelector(".theme-icon").textContent=dark?"☀":"☾";
    themeButton.querySelector(".theme-label").textContent=dark?"Tema claro":"Tema escuro";
  }
  syncTheme();
  themeButton.addEventListener("click",()=>{
    const next=document.documentElement.dataset.theme==="dark"?"light":"dark";
    document.documentElement.dataset.theme=next;
    document.getElementById("browser-theme-color").content=next==="dark"?"#0b0b0a":"#f6f2e9";
    try{localStorage.setItem("riviera-theme",next)}catch{}
    syncTheme();
  });
})();
