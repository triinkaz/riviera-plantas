(() => {
  const openButton=document.getElementById("decorado-entry");
  const dialog=document.getElementById("decorado-dialog");
  const closeButton=document.getElementById("decorado-close");
  const video=document.getElementById("decorado-video");
  const source=document.getElementById("decorado-source");
  const error=document.getElementById("decorado-error");
  const versions=[...document.querySelectorAll("[data-decorado-video]")];
  if(!openButton||!dialog||!closeButton||!video||!source||!error||!versions.length)return;
  let selected=versions.find(button=>button.getAttribute("aria-pressed")==="true")||versions[0];
  const selectVersion=async(button,autoplay=false)=>{
    selected=button;
    versions.forEach(choice=>choice.setAttribute("aria-pressed",String(choice===button)));
    error.hidden=true;
    video.pause();
    video.poster=button.dataset.poster;
    video.setAttribute("aria-label",button.dataset.label);
    if(source.getAttribute("src")!==button.dataset.src){
      source.src=button.dataset.src;
      video.load();
    }else{
      video.currentTime=0;
    }
    if(autoplay){try{await video.play();}catch{/* Os controles permitem iniciar manualmente. */}}
  };
  openButton.addEventListener("click",async()=>{
    if(dialog.open)return;
    await selectVersion(selected);
    dialog.showModal();
    try{await video.play();}catch{/* Os controles permitem iniciar manualmente. */}
  });
  versions.forEach(button=>button.addEventListener("click",()=>selectVersion(button,dialog.open)));
  closeButton.addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener("close",()=>{
    video.pause();
    video.currentTime=0;
    openButton.focus();
  });
  const showError=()=>{error.hidden=false;};
  video.addEventListener("error",showError);
  source.addEventListener("error",showError);
})();
