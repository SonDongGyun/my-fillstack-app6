const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/camera-overlay.js");

test("camera-overlay moves pupils with smoothing",()=>{
  const leftPupil={style:{transform:""}};
  const rightPupil={style:{transform:""}};
  const APP_STATE={gaze:{emojiPupilX:0,emojiPupilY:0}};

  const overlay=create({
    clamp:(v,min,max)=>Math.min(max,Math.max(min,v)),
    APP_STATE,
    leftPupil,
    rightPupil,
    gazeOverlay:null,
    videoEl:null,
    previewWrap:null,
    irisCenter:()=>({x:0.5,y:0.5}),
    LEFT_IRIS:[],
    RIGHT_IRIS:[],
    LEFT_EYE_BOX:{left:0,right:1},
    RIGHT_EYE_BOX:{left:0,right:1},
  });

  overlay.moveEmojiPupils({x:1,y:-1});
  assert.match(leftPupil.style.transform,/translate\(/);
  assert.equal(leftPupil.style.transform,rightPupil.style.transform);
  assert.notEqual(APP_STATE.gaze.emojiPupilX,0);
  assert.notEqual(APP_STATE.gaze.emojiPupilY,0);
});

test("camera-overlay clearOverlay clears current canvas",()=>{
  let cleared=false;
  const ctx2d={clearRect:()=>{cleared=true;}};
  const gazeOverlay={width:320,height:180,getContext:()=>ctx2d};

  const overlay=create({
    clamp:(v)=>v,
    APP_STATE:{gaze:{emojiPupilX:0,emojiPupilY:0}},
    leftPupil:{style:{}},
    rightPupil:{style:{}},
    gazeOverlay,
    videoEl:{clientWidth:320,clientHeight:180},
    previewWrap:null,
    irisCenter:()=>({x:0.5,y:0.5}),
    LEFT_IRIS:[],
    RIGHT_IRIS:[],
    LEFT_EYE_BOX:{left:0,right:1},
    RIGHT_EYE_BOX:{left:0,right:1},
  });

  overlay.clearOverlay();
  assert.equal(cleared,true);
});
