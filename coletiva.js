(() => {
  const formUrl="https://docs.google.com/forms/d/e/1FAIpQLSdf92pmIKpQGUMzGYDpxC2nkZ5G6W54YkaZIYAsy1__SufEPA/viewform";
  const services={box:"Box de banheiro",piso:"Pisos e revestimentos",ar:"Instalação de ar-condicionado"};
  const params=new URLSearchParams(location.search);
  const chosenFinal=/^[1-6]$/.test(params.get("final")||"")?params.get("final"):"";
  const chosenService=Object.hasOwn(services,params.get("servico"))?params.get("servico"):"";
  const back=new URL("./",location.href);
  back.search="";
  if(chosenFinal)back.searchParams.set("final",chosenFinal);
  if(params.get("view")==="3d")back.searchParams.set("view","3d");
  document.querySelectorAll("#return-top,#return-bottom").forEach(link=>link.href=back.href);
  if(chosenFinal)document.getElementById("collective-final").textContent=`Final ${chosenFinal} selecionado`;
  document.querySelectorAll("[data-collective-link]").forEach(link=>{
    const id=link.dataset.collectiveLink;
    const url=new URL(formUrl);
    url.searchParams.set("usp","pp_url");
    url.searchParams.set("entry.1183952461",services[id]);
    if(chosenFinal)url.searchParams.set("entry.1242273522",chosenFinal);
    link.href=url.href;
    link.target="_blank";
    link.rel="noopener";
    link.addEventListener("click",()=>window.rivieraAnalytics?.track("collective_form_open",{service_id:id}));
  });
  if(chosenService){
    const card=document.querySelector(`[data-collective-card="${chosenService}"]`);
    card.classList.add("is-selected");
    const selected=document.createElement("span");
    selected.className="collective-selected";
    selected.textContent="Você estava vendo este serviço na planta";
    card.prepend(selected);
  }
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
