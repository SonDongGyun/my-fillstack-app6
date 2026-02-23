const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/exercise-reset.js");

test("exercise-reset run clears state and updates labels",()=>{
  const APP_STATE={
    app:{currentGame:"gaze",lastDirectionTtsTs:5},
    camera:{running:false},
    blink:{exerciseLocked:true,resultFlashTimer:1,exerciseCount:3},
    gaze:{sequence:["LEFT"],stepIndex:2,holdMs:10,lastDirection:"LEFT",lastVibeTs:3,lastAnnouncedTarget:"A",smoothX:1,smoothY:1,emojiPupilX:1,emojiPupilY:1,stableDirection:"LEFT",lastClassifiedDir:"LEFT",lastScore:4,nativeX:1,nativeY:1,nativeInit:true},
    circle:{active:true,followMs:9,endShown:true},
    acuity:{active:true,round:9,score:8},
  };

  const makeClassList=()=>({
    remove(){},
    add(){},
  });

  const blinkMeta={textContent:""};
  const gazeMeta={textContent:""};
  const circleMeta={textContent:""};
  const focusMeta={textContent:""};
  const ruleMeta={textContent:""};
  const acuityMeta={textContent:""};
  const blinkCountLine={textContent:""};
  const blinkTimeLine={textContent:""};
  const statusEl={textContent:""};
  const acuityFxEl={classList:makeClassList(),textContent:"X"};
  const acuityCountFxEl={classList:makeClassList(),textContent:"Y"};

  let blinkTotal=-1;
  let blinkCorner=-1;
  let circleArgs=null;
  let clearCalled=false;
  let resetCalib=false;

  global.window={speechSynthesis:{cancel(){}}};
  global.clearTimeout=()=>{ clearCalled=true; };

  const reset=create({
    clearTimers:()=>{},
    APP_STATE,
    blinkPanel:{classList:makeClassList()},
    circlePanel:{classList:makeClassList()},
    acuityPanel:{classList:makeClassList()},
    optotypeWrapEl:{classList:makeClassList()},
    emojiFace:{classList:makeClassList()},
    blinkResultFlashEl:{classList:makeClassList()},
    setTotalBlinkDetected:(v)=>{ blinkTotal=v; },
    updateMetrics:()=>{},
    resetGazeCalibration:()=>{ resetCalib=true; },
    blinkCountLine,
    blinkTimeLine,
    updateBlinkCornerTime:(v)=>{ blinkCorner=v; },
    blinkMeta,
    gazeMeta,
    circleMeta,
    focusMeta,
    ruleMeta,
    acuityMeta,
    circleTrackArea:{},
    updateCircleTrackUi:(...args)=>{ circleArgs=args; },
    acuityFxEl,
    acuityCountFxEl,
    statusEl,
  });

  reset.run();

  assert.equal(APP_STATE.blink.exerciseLocked,false);
  assert.equal(APP_STATE.gaze.stepIndex,0);
  assert.equal(APP_STATE.gaze.lastClassifiedDir,"CENTER");
  assert.equal(APP_STATE.acuity.round,0);
  assert.equal(blinkTotal,0);
  assert.equal(blinkCorner,20);
  assert.deepEqual(circleArgs,[0.45,0,0,0]);
  assert.equal(resetCalib,true);
  assert.equal(clearCalled,true);
  assert.equal(statusEl.textContent,"대기 중");
});
