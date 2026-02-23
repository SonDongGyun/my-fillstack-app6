(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.AcuityUi=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const { acuityFxEl, acuityCountFxEl, acuityMeta, APP_STATE }=ctx;

    function showFx(ok,msg){
      if(!acuityFxEl)return;
      acuityFxEl.classList.remove("show","ok","warn");
      acuityFxEl.textContent=msg;
      acuityFxEl.classList.add(ok?"ok":"warn");
      void acuityFxEl.offsetWidth;
      acuityFxEl.classList.add("show");
    }

    function showCount(round,total){
      if(!acuityCountFxEl)return;
      acuityCountFxEl.classList.remove("show");
      acuityCountFxEl.textContent=`${round} / ${total}`;
      void acuityCountFxEl.offsetWidth;
      acuityCountFxEl.classList.add("show");
    }

    function updateMeta(extra){
      const total=12;
      const remain=Math.max(0,Math.ceil((APP_STATE.acuity.deadlineTs-Date.now())/1000));
      const tail=extra?` | ${extra}`:"";
      acuityMeta.textContent=`점수 ${APP_STATE.acuity.score}/${total} · 시도 ${APP_STATE.acuity.round}${tail} · 남은 ${remain}초`;
    }

    return { showFx, showCount, updateMeta };
  }

  return { create };
});
