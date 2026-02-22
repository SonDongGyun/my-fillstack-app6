(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.TimerManager=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function createTimerManager(){
    const intervals=new Map();
    const timeouts=new Map();

    function clearIntervalKey(key){
      const id=intervals.get(key);
      if(id){
        clearInterval(id);
        intervals.delete(key);
      }
    }

    function clearTimeoutKey(key){
      const id=timeouts.get(key);
      if(id){
        clearTimeout(id);
        timeouts.delete(key);
      }
    }

    return{
      setInterval(key,fn,ms){
        clearIntervalKey(key);
        const id=setInterval(fn,ms);
        intervals.set(key,id);
        return id;
      },
      setTimeout(key,fn,ms){
        clearTimeoutKey(key);
        const id=setTimeout(()=>{
          timeouts.delete(key);
          fn();
        },ms);
        timeouts.set(key,id);
        return id;
      },
      clearInterval:key=>clearIntervalKey(key),
      clearTimeout:key=>clearTimeoutKey(key),
      clearAll(){
        for(const id of intervals.values())clearInterval(id);
        for(const id of timeouts.values())clearTimeout(id);
        intervals.clear();
        timeouts.clear();
      },
      hasInterval:key=>intervals.has(key),
      hasTimeout:key=>timeouts.has(key),
    };
  }

  return{createTimerManager};
});
