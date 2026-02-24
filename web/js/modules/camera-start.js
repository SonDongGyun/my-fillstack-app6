(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.CameraStart=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {
      APP_STATE,
      IS_NATIVE_WEBVIEW,
      setRunning,
      setPermissionHelp,
      statusEl,
      startCameraBtn,
      cameraOrchestrator,
      videoEl,
      faceMesh,
      getPermissionGuide,
      CameraCtor,
      FaceMeshCtor,
    }=ctx;

    return async function startCamera(){
      if(APP_STATE.camera.running)return true;

      if(IS_NATIVE_WEBVIEW){
        setRunning(true);
        setPermissionHelp(false);
        statusEl.textContent="네이티브 카메라 연동 중";
        startCameraBtn.textContent="네이티브 카메라 실행 중";
        startCameraBtn.disabled=true;
        return true;
      }

      if(typeof CameraCtor==="undefined"||typeof FaceMeshCtor==="undefined"){
        statusEl.textContent="MediaPipe 로드 실패";
        return false;
      }

      statusEl.textContent="카메라 시작 중...";
      const camera=(typeof cameraOrchestrator.createCamera==="function")
        ? cameraOrchestrator.createCamera(videoEl,async()=>{await faceMesh.send({image:videoEl});},640,480)
        : new CameraCtor(videoEl,{onFrame:async()=>{await faceMesh.send({image:videoEl});},width:640,height:480});

      try{
        await camera.start();
        setRunning(true);
        setPermissionHelp(false);
        statusEl.textContent="인식 중";
        startCameraBtn.textContent="카메라 실행 중";
        startCameraBtn.disabled=true;
        return true;
      }catch(err){
        const msg=String(err?.message||"");
        if(err?.name==="NotAllowedError"||/not allowed|denied/i.test(msg)){
          statusEl.textContent="카메라 권한이 거부되었습니다.";
          setPermissionHelp(true,getPermissionGuide());
        }else{
          statusEl.textContent="카메라를 시작할 수 없습니다. 권한/HTTPS 주소를 확인해 주세요.";
          setPermissionHelp(true,getPermissionGuide());
        }
        console.error(err);
        return false;
      }
    };
  }

  return{create};
});
