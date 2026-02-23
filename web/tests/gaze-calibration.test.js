const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/gaze-calibration.js");

function createState(){
  return {
    gaze:{
      calibrating:false,
      calibrated:false,
      calibrationStep:0,
      calibrationHoldMs:0,
      calibrationSamples:[],
      calibrationMap:null,
    }
  };
}

test("gaze calibration begin sets initial state",()=>{
  const APP_STATE=createState();
  const storage={save(){} };
  const gazeMeta={textContent:""};
  const calibration=create({
    APP_STATE,
    CALIBRATION_POINTS:["CENTER","LEFT","RIGHT","UP","DOWN"],
    calibrationStorage:storage,
    gazeMeta,
    calibrationLabel:(d)=>d,
    GAZE_CALIBRATION_STEP_MS:1500,
  });

  calibration.begin();
  assert.equal(APP_STATE.gaze.calibrating,true);
  assert.equal(APP_STATE.gaze.calibrated,false);
  assert.equal(APP_STATE.gaze.calibrationStep,0);
  assert.equal(gazeMeta.textContent.includes("CENTER"),true);
});

test("gaze calibration update completes after enough hold",()=>{
  const APP_STATE=createState();
  let saved=null;
  const storage={save(map){ saved=map; }};
  const gazeMeta={textContent:""};
  const points=["CENTER"];
  const calibration=create({
    APP_STATE,
    CALIBRATION_POINTS:points,
    calibrationStorage:storage,
    gazeMeta,
    calibrationLabel:(d)=>d,
    GAZE_CALIBRATION_STEP_MS:100,
  });

  calibration.begin();
  const done=calibration.update({x:0.1,y:-0.1},120);
  assert.equal(done,true);
  assert.equal(APP_STATE.gaze.calibrating,false);
  assert.equal(APP_STATE.gaze.calibrated,true);
  assert.ok(saved);
  assert.equal(typeof saved.CENTER.x,"number");
});

test("gaze calibration classify returns center when no map",()=>{
  const APP_STATE=createState();
  const calibration=create({
    APP_STATE,
    CALIBRATION_POINTS:["CENTER","LEFT"],
    calibrationStorage:{save(){}},
    gazeMeta:{textContent:""},
    calibrationLabel:(d)=>d,
    GAZE_CALIBRATION_STEP_MS:100,
  });

  const result=calibration.classify({x:0,y:0});
  assert.equal(result.dir,"CENTER");
});
