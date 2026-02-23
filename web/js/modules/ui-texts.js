(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.UiTexts=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  return {
    gazeDirectionPrefix:"시선 방향",
    directionSuffix:"방향",
    statusRecognizing:"인식 중",
    statusIdle:"대기 중",
    statusNativeRecognizing:"네이티브 카메라 인식 중",
    statusNativeLowConfidence:"네이티브 카메라 인식 중(신뢰도 낮음)",
  };
});
