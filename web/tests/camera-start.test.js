const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/camera-start.js");

function baseCtx(){
  const APP_STATE={camera:{running:false}};
  return {
    APP_STATE,
    IS_NATIVE_WEBVIEW:false,
    setRunning(v){ APP_STATE.camera.running=!!v; },
    setPermissionHelp(){},
    statusEl:{textContent:""},
    startCameraBtn:{textContent:"",disabled:false},
    cameraOrchestrator:{},
    videoEl:{},
    faceMesh:{send:async()=>{}},
    getPermissionGuide(){ return "guide"; },
    CameraCtor:undefined,
    FaceMeshCtor:undefined,
  };
}

test("camera-start returns true immediately on native webview", async()=>{
  const ctx=baseCtx();
  ctx.IS_NATIVE_WEBVIEW=true;
  const start=create(ctx);
  const ok=await start();
  assert.equal(ok,true);
  assert.equal(ctx.APP_STATE.camera.running,true);
  assert.equal(ctx.startCameraBtn.disabled,true);
});

test("camera-start fails when camera libs unavailable", async()=>{
  const ctx=baseCtx();
  const start=create(ctx);
  const ok=await start();
  assert.equal(ok,false);
  assert.equal(ctx.statusEl.textContent,"MediaPipe 로드 실패");
});
