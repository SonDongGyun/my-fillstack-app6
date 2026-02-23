(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.AppBootstrap=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(){
    function init(ctx){
      const {
        bindAppEvents,
        setupReveal,
        setupHeroStory,
        setupMagnetic,
        setupMarketAppLink,
        setupAuth,
        updateScrollProgress,
        setTotalBlinkDetected,
        APP_STATE,
        updateMetrics,
        loadDavichNews,
        on,
        disposeApp,
      }=ctx;

      bindAppEvents();
      setupReveal();
      setupHeroStory();
      setupMagnetic();
      setupMarketAppLink();
      setupAuth();
      updateScrollProgress();
      setTotalBlinkDetected(APP_STATE.blink.totalDetected);
      updateMetrics();
      loadDavichNews();
      on(window,"beforeunload",disposeApp);
    }

    return{init};
  }

  return{create};
});
