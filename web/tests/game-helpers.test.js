const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/game-helpers.js");

test("game-helpers uses logic overrides",()=>{
  const helper=create({
    logic:{
      makeGazeSequence:(rand,count)=>Array.from({length:count},()=>rand()>0.5?"LEFT":"RIGHT"),
      dirLabel:(d)=>`L:${d}`,
      isDirectionMatch:(dir,gaze,cfg)=>dir==="LEFT"&&gaze.x<0&&!!cfg,
    },
    gazeCfg:{x:1},
    rand:()=>0.9,
  });

  const seq=helper.makeGazeSequence();
  assert.equal(seq.length,10);
  assert.equal(seq[0],"LEFT");
  assert.equal(helper.dirLabel("UP"),"L:UP");
  assert.equal(helper.isDirectionMatch("LEFT",{x:-0.2}),true);
});

test("game-helpers fallback values",()=>{
  const helper=create({logic:{},gazeCfg:{},rand:()=>0.1});
  const seq=helper.makeGazeSequence();
  assert.equal(seq.length,10);
  assert.equal(helper.dirLabel("UP"),"Á¤¸é");
  assert.equal(helper.isDirectionMatch("LEFT",{x:-1}),false);
});
