(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.GameUiTheme=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {
      restGifEl,
      restCaptionEl,
      emojiFace,
      gameConfig,
      leftEye,
      rightEye,
      leftPupil,
      rightPupil,
      mouthEl,
      statusEl,
      earEl,
      blinkTextEl,
      gazeTextEl,
      previewWrap,
      startCameraBtn,
      resetStateBtn,
      permissionHelp,
      documentRef,
    }=ctx;

    function setEmojiTheme(key){
      const showRest=key==="rule202020";
      if(restGifEl)restGifEl.classList.toggle("hidden",!showRest);
      if(restCaptionEl)restCaptionEl.classList.toggle("hidden",!showRest);
      if(emojiFace)emojiFace.classList.toggle("hidden",showRest);
      if(showRest)return;

      emojiFace.className="emoji";
      if(gameConfig[key]?.emojiClass)emojiFace.classList.add(gameConfig[key].emojiClass);

      leftEye.classList.remove("closed");
      rightEye.classList.remove("closed");
      leftPupil.style.opacity="1";
      rightPupil.style.opacity="1";
      leftPupil.style.transform="translate(-50%, -50%)";
      rightPupil.style.transform="translate(-50%, -50%)";
      mouthEl.style.bottom="20%";
      mouthEl.style.width="27%";
      mouthEl.style.height="10%";
      mouthEl.style.borderBottomWidth="4px";
      mouthEl.style.borderRadius="0 0 48px 48px";
      mouthEl.style.borderBottomColor="#8f4a08";
      mouthEl.style.background="transparent";
      mouthEl.style.boxShadow="none";

      if(key==="blink"){
        leftPupil.style.opacity="0";
        rightPupil.style.opacity="0";
        mouthEl.style.bottom="17.4%";
        mouthEl.style.width="25%";
        mouthEl.style.height="7.4%";
        mouthEl.style.borderBottomWidth="0";
        mouthEl.style.borderRadius="0 0 999px 999px";
        mouthEl.style.background="transparent";
        mouthEl.style.boxShadow="inset 0 -4px 0 #9f653a";
      }
    }

    function toggleRuleOnlyLayout(key){
      const ruleOnly=key==="rule202020";
      const acuityOnly=key==="acuity";
      const minimal=ruleOnly||acuityOnly;

      const topTitle=documentRef.querySelector("#gameView section.panel > h3");
      const controlShell=documentRef.querySelector("#gameView .game-grid > section.panel");
      const gameGridEl=documentRef.querySelector("#gameView .game-grid");
      const emojiWrapEl=documentRef.querySelector("#gameView .game-grid > .emoji-wrap");

      if(gameGridEl)gameGridEl.classList.toggle("acuity-only",acuityOnly);
      if(emojiWrapEl)emojiWrapEl.classList.toggle("hidden",acuityOnly);
      if(controlShell)controlShell.classList.toggle("rule-only-shell",ruleOnly);
      if(topTitle)topTitle.classList.toggle("hidden",minimal);
      if(statusEl)statusEl.classList.toggle("hidden",minimal);
      if(earEl)earEl.classList.add("hidden");
      if(blinkTextEl)blinkTextEl.classList.toggle("hidden",key!=="blink");
      if(gazeTextEl)gazeTextEl.classList.toggle("hidden",minimal);
      if(previewWrap)previewWrap.classList.toggle("hidden",true);
      if(startCameraBtn)startCameraBtn.classList.add("hidden");
      if(resetStateBtn)resetStateBtn.classList.add("hidden");
      if(permissionHelp)permissionHelp.classList.add("hidden");
    }

    return { setEmojiTheme, toggleRuleOnlyLayout };
  }

  return { create };
});
