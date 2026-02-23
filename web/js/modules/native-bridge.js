(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.NativeBridge=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {
      clamp,
      statusEl,
      APP_STATE,
      GAZE_CFG,
      setFaceVisible,
      moveEmojiPupils,
      gazeDirection,
      classifyCalibratedDirection,
      calibrationLabel,
      gazeTextEl,
      vibrateOnGazeDirectionChange,
      updateGazeExercise,
      updateCircleExercise,
      onBlinkDetected,
    }=ctx;

    const uiTexts=(typeof window!=="undefined"&&window.UiTexts)?window.UiTexts:{};
    const gazePrefix=uiTexts.gazeDirectionPrefix||"시선 방향";
    const statusNativeRecognizing=uiTexts.statusNativeRecognizing||"네이티브 카메라 인식 중";
    const statusNativeLowConfidence=uiTexts.statusNativeLowConfidence||"네이티브 카메라 인식 중(신뢰도 낮음)";

    const isNativeWebView=typeof window!=="undefined"&&window.__NATIVE_SOURCE__==="react-native-webview";
    let nativeFrameTs=0;

    function applyFrame(frame){
      nativeFrameTs=Date.now();
      const conf=clamp(Number(frame?.confidence??0.5),0,1);
      if(conf<0.33){
        statusEl.textContent=statusNativeLowConfidence;
        return;
      }

      const x=clamp(Number(frame?.gazeX)||0,-1,1);
      const y=clamp(Number(frame?.gazeY)||0,-1,1);
      const alpha=0.22+(conf*0.34);

      if(!APP_STATE.gaze.nativeInit){
        APP_STATE.gaze.nativeX=x;
        APP_STATE.gaze.nativeY=y;
        APP_STATE.gaze.nativeInit=true;
      }else{
        APP_STATE.gaze.nativeX=APP_STATE.gaze.nativeX+(x-APP_STATE.gaze.nativeX)*alpha;
        APP_STATE.gaze.nativeY=APP_STATE.gaze.nativeY+(y-APP_STATE.gaze.nativeY)*alpha;
      }

      setFaceVisible(true);
      const gaze={x:APP_STATE.gaze.nativeX,y:APP_STATE.gaze.nativeY};
      const adjusted={x:gaze.x*GAZE_CFG.gain.x,y:gaze.y*GAZE_CFG.gain.y};

      if(APP_STATE.app.currentGame==="gaze"||APP_STATE.app.currentGame==="circle")moveEmojiPupils(adjusted);

      let direction=gazeDirection(adjusted);
      if((APP_STATE.app.currentGame==="gaze"||APP_STATE.app.currentGame==="circle")&&APP_STATE.gaze.calibrated&&APP_STATE.gaze.calibrationMap){
        const cls=classifyCalibratedDirection(adjusted);
        APP_STATE.gaze.lastClassifiedDir=cls.dir;
        APP_STATE.gaze.lastScore=cls.score;
        direction=calibrationLabel(cls.dir);
      }

      gazeTextEl.textContent=`${gazePrefix}: ${direction}`;
      if(APP_STATE.app.currentGame==="gaze"||APP_STATE.app.currentGame==="circle")vibrateOnGazeDirectionChange(direction);
      updateGazeExercise(gaze);
      if(APP_STATE.app.currentGame==="circle")updateCircleExercise(adjusted);
      if(APP_STATE.app.currentGame==="blink"&&frame?.blink)onBlinkDetected();
      statusEl.textContent=statusNativeRecognizing;
    }

    function handleMessage(event){
      const raw=event?.data||event?.nativeEvent?.data;
      if(!raw||typeof raw!=="string")return;
      try{
        const msg=JSON.parse(raw);
        if(msg?.type==="NATIVE_GAZE_FRAME")applyFrame(msg.payload||{});
      }catch(_){ }
    }

    function attach(){
      if(!isNativeWebView)return;
      window.addEventListener("message",handleMessage);
      document.addEventListener("message",handleMessage);
    }

    function shouldSkipWebFrame(){
      return isNativeWebView&&Date.now()-nativeFrameTs<2500;
    }

    return{isNativeWebView:()=>isNativeWebView,attach,shouldSkipWebFrame};
  }

  return{create};
});
