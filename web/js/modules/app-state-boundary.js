(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.AppStateBoundary=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  /**
   * Create scoped APP_STATE patch helpers to centralize mutation boundaries.
   * @param {Object} options
   * @param {Object} options.APP_STATE
   */
  function create(options){
    const APP_STATE=options?.APP_STATE;
    if(!APP_STATE)throw new Error("APP_STATE is required");

    function patch(scope,partial){
      if(!APP_STATE[scope]||!partial)return;
      Object.assign(APP_STATE[scope],partial);
    }

    function setAppState(partial){patch("app",partial);}
    function setCameraState(partial){patch("camera",partial);}
    function setBlinkState(partial){patch("blink",partial);}
    function setGazeState(partial){patch("gaze",partial);}
    function setAcuityState(partial){patch("acuity",partial);}
    function setCircleState(partial){patch("circle",partial);}

    return{setAppState,setCameraState,setBlinkState,setGazeState,setAcuityState,setCircleState};
  }

  return{create};
});
