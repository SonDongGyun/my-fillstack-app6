(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.GazeCalibration=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {
      APP_STATE,
      CALIBRATION_POINTS,
      calibrationStorage,
      gazeMeta,
      calibrationLabel,
      GAZE_CALIBRATION_STEP_MS,
    }=ctx;

    function reset(){
      APP_STATE.gaze.calibrating=false;
      APP_STATE.gaze.calibrationStep=0;
      APP_STATE.gaze.calibrationHoldMs=0;
      APP_STATE.gaze.calibrationSamples=[];
    }

    function begin(){
      reset();
      APP_STATE.gaze.calibrating=true;
      APP_STATE.gaze.calibrated=false;
      APP_STATE.gaze.calibrationMap=null;
      gazeMeta.textContent=`보정 시작: ${calibrationLabel("CENTER")}을 1.5초 바라봐 주세요 (1/5)`;
    }

    function pushSample(gaze){
      APP_STATE.gaze.calibrationSamples.push({x:gaze.x,y:gaze.y});
      if(APP_STATE.gaze.calibrationSamples.length>48)APP_STATE.gaze.calibrationSamples.shift();
    }

    function finishStep(stepDir){
      if(APP_STATE.gaze.calibrationSamples.length===0)return false;
      const mean=APP_STATE.gaze.calibrationSamples.reduce((acc,p)=>({x:acc.x+p.x,y:acc.y+p.y}),{x:0,y:0});
      mean.x/=APP_STATE.gaze.calibrationSamples.length;
      mean.y/=APP_STATE.gaze.calibrationSamples.length;
      if(!APP_STATE.gaze.calibrationMap)APP_STATE.gaze.calibrationMap={};
      APP_STATE.gaze.calibrationMap[stepDir]=mean;
      APP_STATE.gaze.calibrationSamples=[];
      APP_STATE.gaze.calibrationHoldMs=0;
      APP_STATE.gaze.calibrationStep+=1;

      if(APP_STATE.gaze.calibrationStep>=CALIBRATION_POINTS.length){
        APP_STATE.gaze.calibrating=false;
        APP_STATE.gaze.calibrated=true;
        calibrationStorage.save(APP_STATE.gaze.calibrationMap);
        return true;
      }

      const nextDir=CALIBRATION_POINTS[APP_STATE.gaze.calibrationStep];
      gazeMeta.textContent=`보정: ${calibrationLabel(nextDir)}을 1.5초 바라봐 주세요 (${APP_STATE.gaze.calibrationStep+1}/5)`;
      return false;
    }

    function update(gaze,dt){
      if(!APP_STATE.gaze.calibrating)return false;
      const dir=CALIBRATION_POINTS[APP_STATE.gaze.calibrationStep]||"CENTER";
      pushSample(gaze);
      APP_STATE.gaze.calibrationHoldMs+=dt;
      const sec=Math.max(0,(GAZE_CALIBRATION_STEP_MS-APP_STATE.gaze.calibrationHoldMs)/1000);
      gazeMeta.textContent=`보정: ${calibrationLabel(dir)} ${sec.toFixed(1)}초 (${APP_STATE.gaze.calibrationStep+1}/5)`;
      if(APP_STATE.gaze.calibrationHoldMs<GAZE_CALIBRATION_STEP_MS)return false;
      return finishStep(dir);
    }

    function classify(adjusted){
      const map=APP_STATE.gaze.calibrationMap;
      if(!map||!map.CENTER)return{dir:"CENTER",score:0};
      const keys=Object.keys(map);
      if(keys.length===0)return{dir:"CENTER",score:0};
      let best="CENTER",bestDist=Number.POSITIVE_INFINITY;
      keys.forEach((k)=>{
        const p=map[k];
        const dx=adjusted.x-p.x,dy=adjusted.y-p.y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<bestDist){bestDist=d;best=k;}
      });
      const center=map.CENTER;
      const cdx=adjusted.x-center.x,cdy=adjusted.y-center.y;
      const centerDist=Math.sqrt(cdx*cdx+cdy*cdy);
      const score=1-Math.min(1,bestDist/Math.max(centerDist,0.12));
      if(best!=="CENTER"&&score<0.12)return{dir:"CENTER",score:0};
      return{dir:best,score};
    }

    return{reset,begin,update,classify};
  }

  return{create};
});
