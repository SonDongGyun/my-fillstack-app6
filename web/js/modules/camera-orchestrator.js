(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.CameraOrchestrator=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function createFaceMesh(options){
    if(typeof FaceMesh==="undefined")throw new Error("FaceMesh unavailable");
    const faceMesh=new FaceMesh({locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
    faceMesh.setOptions(Object.assign({
      maxNumFaces:1,
      refineLandmarks:true,
      minDetectionConfidence:.55,
      minTrackingConfidence:.55,
    },options||{}));
    return faceMesh;
  }

  function createCamera(videoEl,onFrame,width,height){
    if(typeof Camera==="undefined")throw new Error("Camera unavailable");
    return new Camera(videoEl,{
      onFrame:async()=>{await onFrame();},
      width:width||640,
      height:height||480,
    });
  }

  return{createFaceMesh,createCamera};
});
