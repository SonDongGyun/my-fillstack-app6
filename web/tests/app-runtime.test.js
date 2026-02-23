const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/app-runtime.js");

function createEventTarget(){
  const handlers={};
  return {
    addEventListener(type,fn){
      if(!handlers[type])handlers[type]=[];
      handlers[type].push(fn);
    },
    removeEventListener(type,fn){
      handlers[type]=(handlers[type]||[]).filter((h)=>h!==fn);
    },
    emit(type,payload){
      for(const fn of handlers[type]||[])fn(payload);
    },
  };
}

test("app-runtime on/dispose removes listeners",()=>{
  const runtime=create();
  const target=createEventTarget();
  let count=0;
  const handler=()=>{ count+=1; };

  runtime.on(target,"x",handler);
  target.emit("x");
  assert.equal(count,1);

  runtime.dispose();
  target.emit("x");
  assert.equal(count,1);
  assert.equal(runtime.isInitialized(),false);
});

test("app-runtime initialized flag",()=>{
  const runtime=create();
  assert.equal(runtime.isInitialized(),false);
  runtime.setInitialized(true);
  assert.equal(runtime.isInitialized(),true);
});
