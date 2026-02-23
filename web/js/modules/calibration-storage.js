(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.CalibrationStorage=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(options){
    const storageKey=options?.storageKey||"gaze_calibration_v1";
    const maxAgeMs=options?.maxAgeMs||1000*60*60*24*30;
    const points=Array.isArray(options?.points)?options.points:["CENTER","LEFT","RIGHT","UP","DOWN"];

    function isValidMap(map){
      if(!map||typeof map!=="object")return false;
      for(const key of points){
        const p=map[key];
        if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
      }
      return true;
    }

    function save(map){
      try{
        if(!isValidMap(map))return;
        const payload={savedAt:Date.now(),map};
        localStorage.setItem(storageKey,JSON.stringify(payload));
      }catch(_){ }
    }

    function clear(){
      try{localStorage.removeItem(storageKey);}catch(_){ }
    }

    function load(){
      try{
        const raw=localStorage.getItem(storageKey);
        if(!raw)return null;
        const parsed=JSON.parse(raw);
        if(!parsed||!parsed.map||!Number.isFinite(parsed.savedAt))return null;
        if(Date.now()-parsed.savedAt>maxAgeMs)return null;
        if(!isValidMap(parsed.map))return null;
        return parsed.map;
      }catch(_){
        return null;
      }
    }

    return{isValidMap,save,clear,load};
  }

  return{create};
});
