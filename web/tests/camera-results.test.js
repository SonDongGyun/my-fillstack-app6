const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/camera-results.js");

function setWindow(mock){
  Object.defineProperty(globalThis,"window",{value:mock,configurable:true,writable:true});
}

test("camera-results uses UiTexts prefix when no face",()=>{
  const savedWindow=globalThis.window;
  setWindow({UiTexts:{gazeDirectionPrefix:"GAZE"}});

  let cleared=false;
  const gazeTextEl={textContent:""};
  const statusEl={textContent:""};

  const cameraResults=create({
    nativeBridge:null,
    setFaceVisible:()=>{},
    gazeTextEl,
    clearOverlay:()=>{cleared=true;},
    drawIrisGuides:()=>{},
    ear:()=>0,
    LEFT_EYE:[],
    RIGHT_EYE:[],
    updateBaselineFromEar:()=>{},
    estimateGaze:()=>({x:0,y:0}),
    smoothGaze:(v)=>v,
    applyViewTransformToGaze:(v)=>v,
    GAZE_CFG:{gain:{x:1,y:1}},
    APP_STATE:{app:{currentGame:null},gaze:{calibrated:false,calibrationMap:null}},
    moveEmojiPupils:()=>{},
    gazeDirection:()=>"CENTER",
    classifyCalibratedDirection:()=>({dir:"CENTER",score:1}),
    calibrationLabel:(d)=>d,
    vibrateOnGazeDirectionChange:()=>{},
    updateGazeExercise:()=>{},
    updateCircleExercise:()=>{},
    handleBlinkFromEar:()=>{},
    statusEl,
  });

  cameraResults.handleResults({multiFaceLandmarks:[]});

  assert.equal(gazeTextEl.textContent,"GAZE: -");
  assert.equal(cleared,true);

  setWindow(savedWindow);
});

test("camera-results sets recognizing status text from UiTexts",()=>{
  const savedWindow=globalThis.window;
  setWindow({UiTexts:{gazeDirectionPrefix:"GAZE",statusRecognizing:"TRACKING"}});

  const gazeTextEl={textContent:""};
  const statusEl={textContent:""};

  const cameraResults=create({
    nativeBridge:null,
    setFaceVisible:()=>{},
    gazeTextEl,
    clearOverlay:()=>{},
    drawIrisGuides:()=>{},
    ear:()=>0.2,
    LEFT_EYE:[1],
    RIGHT_EYE:[2],
    updateBaselineFromEar:()=>{},
    estimateGaze:()=>({x:0,y:0}),
    smoothGaze:(v)=>v,
    applyViewTransformToGaze:(v)=>v,
    GAZE_CFG:{gain:{x:1,y:1}},
    APP_STATE:{app:{currentGame:null},gaze:{calibrated:false,calibrationMap:null}},
    moveEmojiPupils:()=>{},
    gazeDirection:()=>"CENTER",
    classifyCalibratedDirection:()=>({dir:"CENTER",score:1}),
    calibrationLabel:(d)=>d,
    vibrateOnGazeDirectionChange:()=>{},
    updateGazeExercise:()=>{},
    updateCircleExercise:()=>{},
    handleBlinkFromEar:()=>{},
    statusEl,
  });

  cameraResults.handleResults({multiFaceLandmarks:[[{x:0,y:0},{x:0,y:0},{x:0,y:0}]]});

  assert.equal(gazeTextEl.textContent,"GAZE: CENTER");
  assert.equal(statusEl.textContent,"TRACKING");

  setWindow(savedWindow);
});
