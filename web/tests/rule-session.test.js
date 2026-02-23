const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/rule-session.js");

test("rule-session sync delegates to window.syncRulePushUi",async()=>{
  let called=false;
  global.window={
    syncRulePushUi:async()=>{ called=true; },
  };
  const ruleMeta={textContent:""};
  const session=create({ruleMeta});
  const ok=await session.sync();
  assert.equal(ok,true);
  assert.equal(called,true);
});

test("rule-session startDefault delegates to window.startRuleReminder",async()=>{
  let passed=0;
  global.window={
    startRuleReminder:async(ms)=>{ passed=ms; },
  };
  const ruleMeta={textContent:""};
  const session=create({ruleMeta});
  const ok=await session.startDefault(1234);
  assert.equal(ok,true);
  assert.equal(passed,1234);
});
