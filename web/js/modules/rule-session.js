(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.RuleSession=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const { ruleMeta }=ctx;

    async function sync(){
      if(typeof window!=="undefined"&&typeof window.syncRulePushUi==="function"){
        await window.syncRulePushUi();
        return true;
      }
      if(ruleMeta)ruleMeta.textContent="푸시 상태를 불러올 수 없습니다.";
      return false;
    }

    async function startDefault(intervalMs){
      const value=typeof intervalMs==="number"&&intervalMs>0?intervalMs:(20*60*1000);
      if(typeof window!=="undefined"&&typeof window.startRuleReminder==="function"){
        await window.startRuleReminder(value);
        return true;
      }
      if(ruleMeta)ruleMeta.textContent="푸시 시작 함수를 찾을 수 없습니다.";
      return false;
    }

    return { sync, startDefault };
  }

  return { create };
});
