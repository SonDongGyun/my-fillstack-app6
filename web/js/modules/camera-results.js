(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.CameraResults=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {
      nativeBridge,
      setFaceVisible,
      gazeTextEl,
      clearOverlay,
      drawIrisGuides,
      ear,
      LEFT_EYE,
      RIGHT_EYE,
      updateBaselineFromEar,
      estimateGaze,
      smoothGaze,
      applyViewTransformToGaze,
      GAZE_CFG,
      APP_STATE,
      moveEmojiPupils,
      gazeDirection,
      classifyCalibratedDirection,
      calibrationLabel,
      vibrateOnGazeDirectionChange,
      updateGazeExercise,
      updateCircleExercise,
      handleBlinkFromEar,
      statusEl,
    }=ctx;

    const uiTexts=(typeof window!=="undefined"&&window.UiTexts)?window.UiTexts:{};
    const gazePrefix=uiTexts.gazeDirectionPrefix||"시선 방향";
    const statusRecognizing=uiTexts.statusRecognizing||"인식 중";

    function handleResults(results){
      if(nativeBridge&&nativeBridge.shouldSkipWebFrame())return;

      if(!results.multiFaceLandmarks||results.multiFaceLandmarks.length===0){
        setFaceVisible(false);
        gazeTextEl.textContent=`${gazePrefix}: -`;
        clearOverlay();
        return;
      }

      setFaceVisible(true);
      const landmarks=results.multiFaceLandmarks[0];
      drawIrisGuides(landmarks);

      const leftEar=ear(landmarks,LEFT_EYE);
      const rightEar=ear(landmarks,RIGHT_EYE);
      const avgEar=(leftEar+rightEar)/2;
      updateBaselineFromEar(avgEar);

      const rawGaze=estimateGaze(landmarks);
      const smoothed=smoothGaze(rawGaze);
      const gaze=applyViewTransformToGaze(smoothed);
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
      if(APP_STATE.app.currentGame==="blink")handleBlinkFromEar(avgEar);

      statusEl.textContent=statusRecognizing;
    }

    return{handleResults};
  }

  return{create};
});
