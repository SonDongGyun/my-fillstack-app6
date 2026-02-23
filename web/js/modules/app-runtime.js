(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.AppRuntime=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(){
    const listeners=[];
    let initialized=false;

    function on(target,type,handler,options){
      if(!target||typeof target.addEventListener!=="function")return;
      target.addEventListener(type,handler,options);
      listeners.push(()=>target.removeEventListener(type,handler,options));
    }

    function dispose(clearTimers){
      if(typeof clearTimers==="function")clearTimers();
      listeners.forEach((off)=>{try{off();}catch(_){}});
      listeners.length=0;
      initialized=false;
    }

    function isInitialized(){
      return initialized;
    }

    function setInitialized(value){
      initialized=!!value;
    }

    return{on,dispose,isInitialized,setInitialized};
  }

  return{create};
});
