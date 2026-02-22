/* Robust CTA docking: handles fast scroll on Chrome/Safari without missing undock timing. */
(()=>{
  const TOP=12;
  const DOCK_IN=10;
  const DOCK_OUT=20;
  const ctas=[...document.querySelectorAll("[data-scroll-cta]")];
  if(ctas.length===0)return;

  const isActive=(key)=>key==="home" ? document.getElementById("homeView")?.classList.contains("active") : key==="game" ? document.getElementById("gameView")?.classList.contains("active") : document.getElementById("introView")?.classList.contains("active");

  const clearTimer=(btn)=>{
    if(btn._dock?.timer){
      clearTimeout(btn._dock.timer);
      btn._dock.timer=null;
    }
  };

  const undockImmediate=(btn)=>{
    const d=btn._dock;
    if(!d||!d.docked)return;
    clearTimer(btn);
    btn.classList.remove("is-docked");
    btn.style.width="";
    btn.style.left="";
    btn.style.top="";
    btn.style.position="";
    btn.style.right="";
    btn.style.bottom="";
    btn.style.transform="";
    btn.style.transition="";
    if(d.parent&&btn.parentElement!==d.parent){
      d.parent.insertBefore(btn,d.placeholder);
    }
    d.placeholder.classList.remove("active");
    d.placeholder.style.height="";
    d.fixedLeft=null;
    d.fixedWidth=null;
    d.docked=false;
  };

  const dockAnimated=(btn)=>{
    const d=btn._dock;
    if(!d||d.docked)return;
    clearTimer(btn);
    const start=btn.getBoundingClientRect();
    let width=Math.min(Math.max(btn.offsetWidth,start.width),Math.max(160,window.innerWidth-20));
    const height=Math.max(btn.offsetHeight,start.height);
    d.placeholder.style.height=`${height}px`;
    d.placeholder.classList.add("active");
    if(btn.parentElement!==document.body)document.body.appendChild(btn);
    btn.classList.add("is-docked");
    btn.style.position="fixed";
    btn.style.top=`${Math.round(start.top)}px`;
    btn.style.left=`${Math.round(start.left)}px`;
    btn.style.width=`${Math.round(start.width)}px`;
    btn.style.right="auto";
    btn.style.bottom="auto";
    btn.style.transform="none";
    btn.style.transition="none";
    if(window.innerWidth<=768){
      btn.style.whiteSpace="nowrap";
      btn.style.width="auto";
      const natural=Math.ceil(btn.getBoundingClientRect().width);
      if(d.key==="intro"){
        width=Math.max(148,Math.min(natural+14,240,window.innerWidth-24));
      }else if(d.key==="home"||d.key==="game"){
        width=Math.max(118,Math.min(natural+16,window.innerWidth-24));
      }
      btn.style.width=`${Math.round(start.width)}px`;
    }
    const left=Math.round((window.innerWidth-width)/2);
    d.fixedLeft=left;
    d.fixedWidth=width;
    requestAnimationFrame(()=>{
      btn.style.transition="top .68s cubic-bezier(.2,.8,.2,1), left .68s cubic-bezier(.2,.8,.2,1), box-shadow .2s ease, background-color .2s ease, border-color .2s ease, color .2s ease";
      btn.style.top=`${TOP}px`;
      btn.style.left=`${left}px`;
      btn.style.width=`${width}px`;
    });
    d.timer=setTimeout(()=>{
      btn.style.transition="";
      d.timer=null;
    },720);
    d.docked=true;
  };

  const syncOne=(btn)=>{
    const d=btn._dock;
    if(!d||!d.placeholder)return;
    if(!isActive(d.key)){
      undockImmediate(btn);
      return;
    }
    const probe=(d.docked?d.placeholder:btn).getBoundingClientRect().top;
    const shouldDock=!d.docked&&probe<=DOCK_IN;
    const shouldUndock=d.docked&&probe>DOCK_OUT;
    if(shouldDock)dockAnimated(btn);
    if(shouldUndock)undockImmediate(btn); // instant restore at original zone
    if(d.docked){
      btn.style.left=`${d.fixedLeft}px`;
      btn.style.width=`${d.fixedWidth}px`;
    }
  };

  ctas.forEach((btn)=>{
    const key=btn.dataset.scrollCta;
    const placeholder=document.querySelector(`[data-cta-placeholder="${key}"]`);
    if(!placeholder)return;
    btn._dock={key,placeholder,parent:btn.parentElement,docked:false,timer:null,fixedLeft:null,fixedWidth:null};
  });

  let ticking=false;
  const schedule=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{
      ticking=false;
      ctas.forEach(syncOne);
    });
  };

  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",schedule);
  window.addEventListener("orientationchange",schedule);
  schedule();
})();

/* Disable legacy docking handlers to prevent state conflicts with robust docking above. */
window.setupScrollCtaDocking=function(){};
window.updateScrollCtas=function(){};

