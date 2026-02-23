const test=require("node:test");
const assert=require("node:assert/strict");

const uiTexts=require("../js/modules/ui-texts.js");

test("ui-texts exports stable default labels",()=>{
  assert.equal(typeof uiTexts.gazeDirectionPrefix,"string");
  assert.equal(typeof uiTexts.directionSuffix,"string");
  assert.equal(typeof uiTexts.statusRecognizing,"string");
  assert.equal(typeof uiTexts.statusNativeRecognizing,"string");
  assert.equal(typeof uiTexts.statusNativeLowConfidence,"string");
  assert.match(uiTexts.gazeDirectionPrefix,/시선/);
});
