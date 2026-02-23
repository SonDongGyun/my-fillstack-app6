const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/app-state-boundary.js");

test("app-state-boundary patches only known scopes",()=>{
  const APP_STATE={
    app:{currentGame:null},
    camera:{running:false},
    blink:{count:0},
    gaze:{step:0},
    acuity:{score:0},
    circle:{active:false},
  };

  const api=create({APP_STATE});
  api.setAppState({currentGame:"gaze"});
  api.setCameraState({running:true});
  api.setBlinkState({count:3});
  api.setGazeState({step:2});
  api.setAcuityState({score:5});
  api.setCircleState({active:true});

  assert.equal(APP_STATE.app.currentGame,"gaze");
  assert.equal(APP_STATE.camera.running,true);
  assert.equal(APP_STATE.blink.count,3);
  assert.equal(APP_STATE.gaze.step,2);
  assert.equal(APP_STATE.acuity.score,5);
  assert.equal(APP_STATE.circle.active,true);
});

test("app-state-boundary ignores unknown scope updates",()=>{
  const APP_STATE={app:{a:1}};
  const api=create({APP_STATE});

  api.setAppState(null);
  assert.deepEqual(APP_STATE,{app:{a:1}});
});


test("app-state-boundary throws when APP_STATE is missing",()=>{
  assert.throws(()=>create({}),/APP_STATE is required/);
});
