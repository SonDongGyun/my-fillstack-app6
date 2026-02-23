const test=require("node:test");
const assert=require("node:assert/strict");

const {bindAppEvents}=require("../js/modules/app-events.js");

function setWindow(mock){
  Object.defineProperty(globalThis,"window",{value:mock,configurable:true,writable:true});
}

function setDocument(mock){
  Object.defineProperty(globalThis,"document",{value:mock,configurable:true,writable:true});
}

test("app-events uses UiTexts statuses on backHome",()=>{
  const savedWindow=globalThis.window;
  const savedDocument=globalThis.document;

  const handlers=[];
  const on=(target,type,handler)=>{handlers.push({target,type,handler});};
  const backHomeBtn={id:"backHomeBtn"};
  const statusEl={textContent:""};
  const APP_STATE={camera:{running:false}};

  setWindow({UiTexts:{statusRecognizing:"TRACKING",statusIdle:"IDLE"}});
  setDocument({querySelectorAll:()=>[]});

  bindAppEvents({
    on,
    enterGame:()=>{},
    showView:()=>{},
    clearTimers:()=>{},
    setPermissionHelp:()=>{},
    statusEl,
    APP_STATE,
    startCamera:()=>{},
    resetExerciseState:()=>{},
    startBlinkExercise:()=>{},
    startGazeExercise:()=>{},
    requestGazeRecalibration:()=>{},
    startCircleExercise:()=>{},
    startFocusRoutine:()=>{},
    startAcuityGame:()=>{},
    answerAcuity:()=>{},
    applyHeroParallax:()=>{},
    resetHeroParallax:()=>{},
    updateScrollProgress:()=>{},
    startAppBtn:{},
    backIntroBtn:null,
    hero:null,
    backHomeBtn,
    startCameraBtn:{},
    resetStateBtn:{},
    blinkStartBtn:{},
    gazeStartBtn:{},
    gazeRecalibrateBtn:null,
    circleStartBtn:null,
    focusStartBtn:{},
    acuityStartBtn:{},
    acuityUpBtn:{},
    acuityRightBtn:{},
    acuityDownBtn:{},
    acuityLeftBtn:{},
    setCurrentGame:()=>{},
  });

  const backHomeHandler=handlers.find((h)=>h.target===backHomeBtn&&h.type==="click");
  assert.ok(backHomeHandler);

  backHomeHandler.handler();
  assert.equal(statusEl.textContent,"IDLE");

  APP_STATE.camera.running=true;
  backHomeHandler.handler();
  assert.equal(statusEl.textContent,"TRACKING");

  setWindow(savedWindow);
  setDocument(savedDocument);
});
