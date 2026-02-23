const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/game-ui-theme.js");

function makeClassList(){
  const map=new Map();
  return {
    toggle:(name,force)=>map.set(name,!!force),
    add:(name)=>map.set(name,true),
    remove:(...names)=>names.forEach((n)=>map.delete(n)),
    has:(name)=>map.get(name)===true,
  };
}

test("game-ui-theme toggles rest mode and layout",()=>{
  const statusEl={classList:makeClassList()};
  const earEl={classList:makeClassList()};
  const blinkTextEl={classList:makeClassList()};
  const gazeTextEl={classList:makeClassList()};
  const previewWrap={classList:makeClassList()};
  const startCameraBtn={classList:makeClassList()};
  const resetStateBtn={classList:makeClassList()};
  const permissionHelp={classList:makeClassList()};
  const restGifEl={classList:makeClassList()};
  const restCaptionEl={classList:makeClassList()};
  const emojiFace={classList:makeClassList(),className:"",style:{}};
  const leftEye={classList:makeClassList()};
  const rightEye={classList:makeClassList()};
  const leftPupil={style:{}};
  const rightPupil={style:{}};
  const mouthEl={style:{}};
  const doc={querySelector:()=>({classList:makeClassList()})};

  const ui=create({
    restGifEl,restCaptionEl,emojiFace,gameConfig:{rule202020:{emojiClass:"x"}},
    leftEye,rightEye,leftPupil,rightPupil,mouthEl,statusEl,earEl,blinkTextEl,gazeTextEl,
    previewWrap,startCameraBtn,resetStateBtn,permissionHelp,documentRef:doc,
  });

  ui.setEmojiTheme("rule202020");
  assert.equal(restGifEl.classList.has("hidden"),false);
  assert.equal(emojiFace.classList.has("hidden"),true);

  ui.toggleRuleOnlyLayout("rule202020");
  assert.equal(statusEl.classList.has("hidden"),true);
  assert.equal(startCameraBtn.classList.has("hidden"),true);
});
