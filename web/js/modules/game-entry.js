(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.GameEntry=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {
      setCurrentGame,
      gameTitleEl,
      gameDescEl,
      gameConfig,
      renderGameEvidence,
      setEmojiTheme,
      toggleRuleOnlyLayout,
      blinkPanel,
      gazePanel,
      circlePanel,
      focusPanel,
      rulePanel,
      acuityPanel,
      gazeTextEl,
      previewWrap,
      blinkCornerTimeEl,
      updateBlinkCornerTime,
      showView,
      statusEl,
      ruleSession,
    }=ctx;

    function enterGame(key){
      setCurrentGame(key);
      gameTitleEl.textContent=gameConfig[key].title;
      gameDescEl.textContent=gameConfig[key].desc;
      renderGameEvidence(key);
      setEmojiTheme(key);
      toggleRuleOnlyLayout(key);

      blinkPanel.classList.toggle("hidden",key!=="blink");
      gazePanel.classList.toggle("hidden",key!=="gaze");
      if(circlePanel)circlePanel.classList.toggle("hidden",key!=="circle");
      focusPanel.classList.toggle("hidden",key!=="focus");
      rulePanel.classList.toggle("hidden",key!=="rule202020");
      acuityPanel.classList.toggle("hidden",key!=="acuity");

      gazeTextEl.classList.toggle("hidden",!(key==="gaze"||key==="circle"));
      if(previewWrap)previewWrap.classList.toggle("hidden",!(key==="gaze"||key==="circle"));

      if(blinkCornerTimeEl){
        blinkCornerTimeEl.classList.toggle("hidden",key!=="blink");
        if(key==="blink")updateBlinkCornerTime(20);
      }

      showView("game");
      statusEl.textContent="준비 중";

      if(key==="rule202020"){
        void ruleSession.sync();
      }
    }

    return { enterGame };
  }

  return { create };
});
