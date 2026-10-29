(() => {
  const openButton=document.getElementById("decorado-entry");
  const dialog=document.getElementById("decorado-dialog");
  const closeButton=document.getElementById("decorado-close");
  const video=document.getElementById("decorado-video");
  const source=document.getElementById("decorado-source");
  const error=document.getElementById("decorado-error");
  if(!openButton||!dialog||!closeButton||!video||!source||!error)return;
  openButton.addEventListener("click",async()=>{
    if(dialog.open)return;
    error.hidden=true;
    if(!source.src){source.src=source.dataset.src;video.load();}
    dialog.showModal();
    try{await video.play();}catch{/* Os controles permitem iniciar manualmente. */}
  });
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
