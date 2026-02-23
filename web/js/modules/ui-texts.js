(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.UiTexts=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  return {
    gazeDirectionPrefix:"\uC2DC\uC120 \uBC29\uD5A5",
    directionSuffix:"\uBC29\uD5A5",
    statusRecognizing:"\uC778\uC2DD \uC911",
    statusIdle:"\uB300\uAE30 \uC911",
    statusNativeRecognizing:"\uB124\uC774\uD2F0\uBE0C \uCE74\uBA54\uB77C \uC778\uC2DD \uC911",
    statusNativeLowConfidence:"\uB124\uC774\uD2F0\uBE0C \uCE74\uBA54\uB77C \uC778\uC2DD \uC911(\uC2E0\uB8B0\uB3C4 \uB0AE\uC74C)",
  };
});
