const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/acuity-ui.js");

function classList(){
  const set=new Set();
  return {
    remove:(...names)=>names.forEach((n)=>set.delete(n)),
    add:(name)=>set.add(name),
    has:(name)=>set.has(name),
  };
}

test("acuity-ui updates fx/count/meta",()=>{
  const acuityFxEl={classList:classList(),textContent:"",get offsetWidth(){return 0;}};
  const acuityCountFxEl={classList:classList(),textContent:"",get offsetWidth(){return 0;}};
  const acuityMeta={textContent:""};
  const APP_STATE={acuity:{deadlineTs:Date.now()+5000,score:3,round:4}};

  const ui=create({acuityFxEl,acuityCountFxEl,acuityMeta,APP_STATE});
  ui.showFx(true,"ok");
  ui.showCount(3,12);
  ui.updateMeta("extra");

  assert.equal(acuityFxEl.textContent,"ok");
  assert.equal(acuityCountFxEl.textContent,"3 / 12");
  assert.match(acuityMeta.textContent,/점수 3\/12/);
});
