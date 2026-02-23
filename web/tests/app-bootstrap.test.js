const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/app-bootstrap.js");

test("app-bootstrap init calls steps in order",()=>{
  const order=[];
  const bootstrap=create();
  const APP_STATE={blink:{totalDetected:7}};
  global.window={};

  const ctx={
    bindAppEvents:()=>order.push("bind"),
    setupReveal:()=>order.push("reveal"),
    setupHeroStory:()=>order.push("hero"),
    setupMagnetic:()=>order.push("magnetic"),
    setupMarketAppLink:()=>order.push("market"),
    setupAuth:()=>order.push("auth"),
    updateScrollProgress:()=>order.push("scroll"),
    setTotalBlinkDetected:(v)=>order.push(`blink:${v}`),
    APP_STATE,
    updateMetrics:()=>order.push("metrics"),
    loadDavichNews:()=>order.push("news"),
    on:(target,evt)=>order.push(`on:${evt}`),
    disposeApp:()=>{},
  };

  bootstrap.init(ctx);
  assert.deepEqual(order,[
    "bind","reveal","hero","magnetic","market","auth","scroll","blink:7","metrics","news","on:beforeunload"
  ]);
});
