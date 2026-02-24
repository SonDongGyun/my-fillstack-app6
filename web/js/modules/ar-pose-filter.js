(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.ArPoseFilter=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function clamp(v,min,max){
    return Math.max(min,Math.min(max,v));
  }

  function lerp(a,b,t){
    return a+(b-a)*t;
  }

  function dotQuat(a,b){
    return a.qx*b.qx+a.qy*b.qy+a.qz*b.qz+a.qw*b.qw;
  }

  function normalizeQuat(q){
    const n=Math.hypot(q.qx,q.qy,q.qz,q.qw)||1;
    return {qx:q.qx/n,qy:q.qy/n,qz:q.qz/n,qw:q.qw/n};
  }

  function angleBetweenQuats(a,b){
    const d=Math.abs(dotQuat(a,b));
    const clamped=clamp(d,-1,1);
    return 2*Math.acos(clamped);
  }

  function slerpQuat(a,b,t){
    let bq={...b};
    let cos=dotQuat(a,bq);
    if(cos<0){
      cos=-cos;
      bq={qx:-bq.qx,qy:-bq.qy,qz:-bq.qz,qw:-bq.qw};
    }

    if(cos>0.9995){
      return normalizeQuat({
        qx:lerp(a.qx,bq.qx,t),
        qy:lerp(a.qy,bq.qy,t),
        qz:lerp(a.qz,bq.qz,t),
        qw:lerp(a.qw,bq.qw,t),
      });
    }

    const theta=Math.acos(clamp(cos,-1,1));
    const sinTheta=Math.sin(theta)||1e-6;
    const wa=Math.sin((1-t)*theta)/sinTheta;
    const wb=Math.sin(t*theta)/sinTheta;
    return {
      qx:a.qx*wa+bq.qx*wb,
      qy:a.qy*wa+bq.qy*wb,
      qz:a.qz*wa+bq.qz*wb,
      qw:a.qw*wa+bq.qw*wb,
    };
  }

  function limitVecStep(prev,next,maxStep){
    const dx=next.px-prev.px;
    const dy=next.py-prev.py;
    const dz=next.pz-prev.pz;
    const dist=Math.hypot(dx,dy,dz);
    if(dist<=maxStep||dist===0)return next;
    const r=maxStep/dist;
    return {...next,px:prev.px+dx*r,py:prev.py+dy*r,pz:prev.pz+dz*r};
  }

  function create(options){
    const cfg={
      posDeadzone:0.0025,
      rotDeadzoneDeg:0.9,
      scaleDeadzone:0.012,
      alphaMin:0.08,
      alphaMax:0.34,
      motionGain:0.22,
      motionPosScale:90,
      motionRotScale:0.8,
      motionScaleScale:40,
      maxPosPerSec:1.8,
      maxRotDegPerSec:110,
      maxScalePerSec:1.1,
      ...(options||{}),
    };

    let hasState=false;
    let state=null;
    let lastTs=0;

    function reset(){
      hasState=false;
      state=null;
      lastTs=0;
    }

    function update(rawPose,tsMs){
      const now=Number(tsMs)||0;
      const dtSec=lastTs>0?clamp((now-lastTs)/1000,1/120,1/20):1/60;
      lastTs=now;

      const raw={...rawPose,...normalizeQuat(rawPose)};
      if(!hasState){
        state={...raw};
        hasState=true;
        return {...state};
      }

      const posDist=Math.hypot(raw.px-state.px,raw.py-state.py,raw.pz-state.pz);
      const rotRad=angleBetweenQuats(state,raw);
      const rotDeg=rotRad*180/Math.PI;
      const scaleDist=Math.abs(raw.scale-state.scale);

      const motion=Math.max(
        posDist*cfg.motionPosScale,
        rotDeg*cfg.motionRotScale,
        scaleDist*cfg.motionScaleScale
      );
      const alpha=clamp(cfg.alphaMin+(motion*cfg.motionGain*0.01),cfg.alphaMin,cfg.alphaMax);

      let next={...state};
      if(posDist>cfg.posDeadzone){
        next.px=lerp(state.px,raw.px,alpha);
        next.py=lerp(state.py,raw.py,alpha);
        next.pz=lerp(state.pz,raw.pz,alpha);
      }
      if(rotDeg>cfg.rotDeadzoneDeg){
        const q=slerpQuat(state,raw,alpha);
        next.qx=q.qx; next.qy=q.qy; next.qz=q.qz; next.qw=q.qw;
      }
      if(scaleDist>cfg.scaleDeadzone){
        next.scale=lerp(state.scale,raw.scale,alpha);
      }

      const maxPosStep=cfg.maxPosPerSec*dtSec;
      const limitedPos=limitVecStep(state,next,maxPosStep);
      const maxRotStepRad=(cfg.maxRotDegPerSec*Math.PI/180)*dtSec;
      const stepRad=angleBetweenQuats(state,limitedPos);
      if(stepRad>maxRotStepRad&&stepRad>1e-6){
        const r=maxRotStepRad/stepRad;
        const q=slerpQuat(state,limitedPos,r);
        limitedPos.qx=q.qx; limitedPos.qy=q.qy; limitedPos.qz=q.qz; limitedPos.qw=q.qw;
      }

      const maxScaleStep=cfg.maxScalePerSec*dtSec;
      const dScale=limitedPos.scale-state.scale;
      if(Math.abs(dScale)>maxScaleStep){
        limitedPos.scale=state.scale+Math.sign(dScale)*maxScaleStep;
      }

      state={...limitedPos,...normalizeQuat(limitedPos)};
      return {...state};
    }

    return {reset,update};
  }

  return {create};
});
