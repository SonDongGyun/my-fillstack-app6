const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/native-bridge.js");

function setWindow(mock){
  Object.defineProperty(globalThis,"window",{value:mock,configurable:true,writable:true});
}

function setDocument(mock){
  Object.defineProperty(globalThis,"document",{value:mock,configurable:true,writable:true});
}

test("native-bridge uses UiTexts for low confidence and direction text",()=>{
  const savedWindow=globalThis.window;
  const savedDocument=globalThis.document;

  let windowMessageHandler=null;
  setWindow({
    __NATIVE_SOURCE__:"react-native-webview",
    UiTexts:{
      gazeDirectionPrefix:"GAZE",
      statusNativeRecognizing:"NATIVE-OK",
      statusNativeLowConfidence:"NATIVE-LOW",
    },
    addEventListener:(type,handler)=>{if(type==="message")windowMessageHandler=handler;},
  });
  setDocument({addEventListener:()=>{}});

  const statusEl={textContent:""};
  const gazeTextEl={textContent:""};

  const bridge=create({
    clamp:(v,min,max)=>Math.min(max,Math.max(min,v)),
    statusEl,
    APP_STATE:{
      app:{currentGame:"gaze"},
      gaze:{
        nativeInit:false,nativeX:0,nativeY:0,
        calibrated:false,calibrationMap:null,
        lastClassifiedDir:"CENTER",lastScore:0,
      },
    },
    GAZE_CFG:{gain:{x:1,y:1}},
    setFaceVisible:()=>{},
    moveEmojiPupils:()=>{},
    gazeDirection:()=>"CENTER",
    classifyCalibratedDirection:()=>({dir:"CENTER",score:1}),
    calibrationLabel:(d)=>d,
    gazeTextEl,
    vibrateOnGazeDirectionChange:()=>{},
    updateGazeExercise:()=>{},
    updateCircleExercise:()=>{},
    onBlinkDetected:()=>{},
  });

  bridge.attach();
  assert.equal(typeof windowMessageHandler,"function");

  windowMessageHandler({data:JSON.stringify({type:"NATIVE_GAZE_FRAME",payload:{confidence:0.1}})});
  assert.equal(statusEl.textContent,"NATIVE-LOW");

  windowMessageHandler({data:JSON.stringify({type:"NATIVE_GAZE_FRAME",payload:{confidence:0.9,gazeX:0.2,gazeY:0.1}})});
  assert.equal(gazeTextEl.textContent,"GAZE: CENTER");
  assert.equal(statusEl.textContent,"NATIVE-OK");

  setWindow(savedWindow);
  setDocument(savedDocument);
});
