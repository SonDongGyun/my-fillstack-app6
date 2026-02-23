const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/gaze-session.js");

test("gaze-session prepareStart initializes gaze state",()=>{
  const APP_STATE={
    gaze:{
      exerciseActive:false,sequence:[],stepIndex:99,holdMs:1,lastTs:0,lastDirection:"X",lastVibeTs:1,
      neutralX:1,neutralY:1,neutralReady:false,smoothX:1,smoothY:1,emojiPupilX:1,emojiPupilY:1,
      lastAnnouncedTarget:"A",stableDirection:"B",lastClassifiedDir:"C",lastScore:9,
      calibrationMap:null,calibrated:false,
    }
  };
  const session=create();
  const out=session.prepareStart({
    APP_STATE,
    makeGazeSequence:()=>["LEFT","RIGHT"],
    loadCalibration:()=>null,
  });

  assert.equal(APP_STATE.gaze.exerciseActive,true);
  assert.deepEqual(APP_STATE.gaze.sequence,["LEFT","RIGHT"]);
  assert.equal(APP_STATE.gaze.stepIndex,0);
  assert.equal(out.cachedApplied,false);
  assert.equal(out.firstDirection,"LEFT");
});

test("gaze-session applies cached calibration map",()=>{
  const APP_STATE={gaze:{}};
  APP_STATE.gaze={
    exerciseActive:false,sequence:[],stepIndex:0,holdMs:0,lastTs:0,lastDirection:"",lastVibeTs:0,
    neutralX:0,neutralY:0,neutralReady:false,smoothX:0,smoothY:0,emojiPupilX:0,emojiPupilY:0,
    lastAnnouncedTarget:"",stableDirection:"",lastClassifiedDir:"",lastScore:0,
    calibrationMap:null,calibrated:false,
  };
  const map={CENTER:{x:0,y:0}};
  const session=create();
  const out=session.prepareStart({
    APP_STATE,
    makeGazeSequence:()=>["UP"],
    loadCalibration:()=>map,
  });

  assert.equal(out.cachedApplied,true);
  assert.equal(APP_STATE.gaze.calibrationMap,map);
  assert.equal(APP_STATE.gaze.calibrated,true);
});
