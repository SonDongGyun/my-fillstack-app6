const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/game-entry.js");

function classList(){
  const map=new Map();
  return {
    toggle(name,force){ map.set(name,!!force); },
    get(name){ return map.get(name); },
  };
}

test("game-entry enterGame toggles panels and syncs rule session",async()=>{
  const blinkPanel={classList:classList()};
  const gazePanel={classList:classList()};
  const circlePanel={classList:classList()};
  const focusPanel={classList:classList()};
  const rulePanel={classList:classList()};
  const acuityPanel={classList:classList()};
  const gazeTextEl={classList:classList()};
  const previewWrap={classList:classList()};
  const blinkCornerTimeEl={classList:classList()};
  const gameTitleEl={textContent:""};
  const gameDescEl={textContent:""};
  const statusEl={textContent:""};

  let currentGame="";
  let showed="";
  let blinkTime=0;
  let synced=false;

  const entry=create({
    setCurrentGame:(v)=>{ currentGame=v; },
    gameTitleEl,
    gameDescEl,
    gameConfig:{rule202020:{title:"r",desc:"d"}},
    renderGameEvidence:()=>{},
    setEmojiTheme:()=>{},
    toggleRuleOnlyLayout:()=>{},
    blinkPanel,
    gazePanel,
    circlePanel,
    focusPanel,
    rulePanel,
    acuityPanel,
    gazeTextEl,
    previewWrap,
    blinkCornerTimeEl,
    updateBlinkCornerTime:(v)=>{ blinkTime=v; },
    showView:(v)=>{ showed=v; },
    statusEl,
    ruleSession:{sync:async()=>{ synced=true; }},
  });

  entry.enterGame("rule202020");
  await new Promise((r)=>setImmediate(r));

  assert.equal(currentGame,"rule202020");
  assert.equal(gameTitleEl.textContent,"r");
  assert.equal(showed,"game");
  assert.equal(statusEl.textContent,"준비 중");
  assert.equal(rulePanel.classList.get("hidden"),false);
  assert.equal(gazePanel.classList.get("hidden"),true);
  assert.equal(blinkTime,0);
  assert.equal(synced,true);
});
