const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/circle-session.js");

test("circle-session start requests camera when not running",async()=>{
  const APP_STATE={
    camera:{running:false},
    circle:{active:false,startTs:0,lastTs:0,durationMs:30000,followMs:0,threshold:0.3,targetX:0,targetY:0,endShown:false},
  };
  const circleMeta={textContent:""};
  const circlePanel={
    classList:{
      remove(){},
      add(){},
    }
  };
  const uiCalls=[];

  const session=create({
    APP_STATE,
    startCamera:async()=>false,
    circleMeta,
    circlePanel,
    updateCircleTrackUi:(...args)=>uiCalls.push(args),
    clamp:(v,min,max)=>Math.min(max,Math.max(min,v)),
  });

  await session.start();

  assert.equal(APP_STATE.circle.active,false);
  assert.match(circleMeta.textContent,/카메라 권한/);
  assert.equal(uiCalls.length,0);
});

test("circle-session start initializes active tracking state",async()=>{
  const APP_STATE={
    camera:{running:true},
    circle:{active:false,startTs:0,lastTs:0,durationMs:30000,followMs:0,threshold:0.3,targetX:0,targetY:0,endShown:false},
  };
  const circleMeta={textContent:""};
  const circlePanel={
    classList:{
      remove(){},
      add(){},
    }
  };
  const uiCalls=[];

  const session=create({
    APP_STATE,
    startCamera:async()=>true,
    circleMeta,
    circlePanel,
    updateCircleTrackUi:(...args)=>uiCalls.push(args),
    clamp:(v,min,max)=>Math.min(max,Math.max(min,v)),
  });

  await session.start();

  assert.equal(APP_STATE.circle.active,true);
  assert.equal(APP_STATE.circle.followMs,0);
  assert.equal(APP_STATE.circle.endShown,false);
  assert.equal(uiCalls.length,1);
  assert.match(circleMeta.textContent,/진행 중/);
});

test("circle-session update completes and reports score",()=>{
  const panelAdds=[];
  const APP_STATE={
    camera:{running:true},
    circle:{
      active:true,
      startTs:performance.now()-10,
      lastTs:performance.now()-10,
      durationMs:0,
      followMs:1,
      threshold:1,
      targetX:0,
      targetY:0,
      endShown:false,
    },
  };
  const circleMeta={textContent:"",innerHTML:""};
  const circlePanel={
    classList:{
      remove(){},
      add:(name)=>panelAdds.push(name),
    },
    get offsetWidth(){ return 0; }
  };

  const session=create({
    APP_STATE,
    startCamera:async()=>true,
    circleMeta,
    circlePanel,
    updateCircleTrackUi:()=>{},
    clamp:(v,min,max)=>Math.min(max,Math.max(min,v)),
  });

  session.update({x:0,y:0});

  assert.equal(APP_STATE.circle.active,false);
  assert.equal(APP_STATE.circle.endShown,true);
  assert.match(circleMeta.innerHTML,/완료/);
  assert.equal(panelAdds.length,1);
});
