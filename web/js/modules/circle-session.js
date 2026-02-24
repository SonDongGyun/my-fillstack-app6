(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.CircleSession=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {
      APP_STATE,
      startCamera,
      circleMeta,
      circlePanel,
      updateCircleTrackUi,
      clamp,
    }=ctx;

    async function start(){
      if(!APP_STATE.camera.running){
        if(circleMeta)circleMeta.textContent="카메라 시작 중...";
        const ok=await startCamera();
        if(!ok||!APP_STATE.camera.running){
          if(circleMeta)circleMeta.textContent="카메라 권한을 허용한 뒤 다시 시도해 주세요";
          return;
        }
      }

      APP_STATE.circle.active=true;
      APP_STATE.circle.startTs=performance.now();
      APP_STATE.circle.lastTs=APP_STATE.circle.startTs;
      APP_STATE.circle.followMs=0;
      APP_STATE.circle.endShown=false;
      APP_STATE.circle.targetX=0.45;
      APP_STATE.circle.targetY=0;

      if(circlePanel)circlePanel.classList.remove("set-done-ok","set-done-warn");
      updateCircleTrackUi(APP_STATE.circle.targetX,APP_STATE.circle.targetY,0,0);
      if(circleMeta)circleMeta.textContent="진행 중 · 원형 타겟을 눈으로 따라가세요";
    }

    function update(adjustedGaze){
      if(!APP_STATE.circle.active)return;
      const now=performance.now();
      const elapsed=now-APP_STATE.circle.startTs;
      const dt=clamp(now-APP_STATE.circle.lastTs,0,120);
      APP_STATE.circle.lastTs=now;

      const angle=elapsed*(Math.PI*2/8000);
      APP_STATE.circle.targetX=Math.cos(angle)*0.46;
      APP_STATE.circle.targetY=Math.sin(angle)*0.34;

      const cursorX=clamp(adjustedGaze.x,-1,1);
      const cursorY=clamp(adjustedGaze.y,-1,1);
      const dx=cursorX-APP_STATE.circle.targetX,dy=cursorY-APP_STATE.circle.targetY;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<=APP_STATE.circle.threshold)APP_STATE.circle.followMs+=dt;

      const remain=Math.max(0,Math.ceil((APP_STATE.circle.durationMs-elapsed)/1000));
      const acc=(APP_STATE.circle.followMs/Math.max(1,elapsed))*100;
      updateCircleTrackUi(APP_STATE.circle.targetX,APP_STATE.circle.targetY,cursorX,cursorY);
      if(circleMeta)circleMeta.textContent=`진행 중 · 추적 정확도 ${acc.toFixed(0)}% · 남은 ${remain}초`;
      if(elapsed<APP_STATE.circle.durationMs)return;

      APP_STATE.circle.active=false;
      if(APP_STATE.circle.endShown)return;
      APP_STATE.circle.endShown=true;
      const ok=acc>=55;
      if(circlePanel){
        circlePanel.classList.remove("set-done-ok","set-done-warn");
        void circlePanel.offsetWidth;
        circlePanel.classList.add(ok?"set-done-ok":"set-done-warn");
      }
      if(circleMeta){
        circleMeta.innerHTML=ok
          ? `<span class="ok">완료 · 추적 정확도 ${acc.toFixed(0)}%</span>`
          : `<span class="warn">완료 · 추적 정확도 ${acc.toFixed(0)}% (다시 도전해 보세요)</span>`;
      }
    }

    return { start, update };
  }

  return { create };
});
