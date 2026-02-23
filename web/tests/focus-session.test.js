const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/focus-session.js");

test("focus-session start updates meta and sets focus classes",()=>{
  const APP_STATE={app:{currentGame:"focus"}};
  const mouthEl={style:{}};
  const focusMeta={innerHTML:""};
  const classSet=new Set();
  const emojiFace={
    classList:{
      remove:(...names)=>names.forEach((n)=>classSet.delete(n)),
      add:(name)=>classSet.add(name),
    }
  };
  let stepFn=null;
  let tickFn=null;
  const timerManager={
    setInterval:(name,fn)=>{
      if(name==="focus-step")stepFn=fn;
      if(name==="focus-tick")tickFn=fn;
      return {name};
    },
    clearInterval:()=>{},
  };

  global.window={
    speechSynthesis:{cancel(){},speak(){}}
  };
  global.SpeechSynthesisUtterance=function(text){ this.text=text; };

  const session=create({APP_STATE,mouthEl,emojiFace,focusMeta,timerManager});
  session.start();

  assert.match(focusMeta.innerHTML,/단계 1\/6/);
  assert.equal(classSet.has("focus-near"),true);
  assert.equal(typeof stepFn,"function");
  assert.equal(typeof tickFn,"function");
});
