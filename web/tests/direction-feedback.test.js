const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/direction-feedback.js");

function makeSpeech(){
  return {
    voices:[{lang:"ko-KR",name:"Korean Female"}],
    spoken:[],
    getVoices(){return this.voices;},
    cancel(){},
    resume(){},
    speak(utter){this.spoken.push(utter.text);},
    onvoiceschanged:null,
  };
}

function setNavigator(mock){
  Object.defineProperty(globalThis,"navigator",{
    value:mock,
    configurable:true,
    writable:true,
  });
}

function setWindow(mock){
  Object.defineProperty(globalThis,"window",{
    value:mock,
    configurable:true,
    writable:true,
  });
}

test("direction-feedback speaks and throttles cue",()=>{
  const savedWindow=globalThis.window;
  const savedNavigator=globalThis.navigator;
  const savedUtter=globalThis.SpeechSynthesisUtterance;

  const speech=makeSpeech();
  globalThis.SpeechSynthesisUtterance=function(text){this.text=text;};
  setNavigator({userAgent:"Android"});
  setWindow({speechSynthesis:speech});

  const APP_STATE={app:{lastDirectionTtsTs:0},gaze:{lastDirection:"",lastVibeTs:0}};
  const feedback=create({APP_STATE,dirLabel:(d)=>d});
  feedback.speakDirectionCue("LEFT");
  feedback.speakDirectionCue("RIGHT");

  assert.equal(speech.spoken.length,1);
  assert.match(speech.spoken[0],/LEFT/);

  setWindow(savedWindow);
  setNavigator(savedNavigator);
  globalThis.SpeechSynthesisUtterance=savedUtter;
});

test("direction-feedback vibrates on mobile non-iOS",()=>{
  const savedWindow=globalThis.window;
  const savedNavigator=globalThis.navigator;

  let vibrated=false;
  setWindow({});
  setNavigator({
    userAgent:"Android",
    vibrate:()=>{vibrated=true;},
  });

  const APP_STATE={app:{lastDirectionTtsTs:0},gaze:{lastDirection:"",lastVibeTs:0}};
  const feedback=create({APP_STATE,dirLabel:(d)=>d});
  feedback.vibrateOnGazeDirectionChange("LEFT");

  assert.equal(vibrated,true);

  setWindow(savedWindow);
  setNavigator(savedNavigator);
});
