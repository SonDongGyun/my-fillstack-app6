const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/ar-pose-filter.js");

function qFromYaw(yaw){
  const h=yaw*0.5;
  return {qx:0,qy:Math.sin(h),qz:0,qw:Math.cos(h)};
}

function pose(x,y,z,yaw,scale){
  const q=qFromYaw(yaw);
  return {px:x,py:y,pz:z,scale,qx:q.qx,qy:q.qy,qz:q.qz,qw:q.qw};
}

function yawFromQ(q){
  return Math.atan2(2*(q.qw*q.qy),1-2*(q.qy*q.qy));
}

test("ar-pose-filter reduces jitter for small noise",()=>{
  const f=create();
  let out=f.update(pose(0,0,0,0,1),0);
  let rawWobble=0;
  let filteredWobble=0;

  for(let i=1;i<=120;i++){
    const jitter=((i%2)===0?1:-1);
    const raw=pose(0.004*jitter,0.003*jitter,0,0.03*jitter,1+0.01*jitter);
    out=f.update(raw,i*16);
    rawWobble+=Math.abs(raw.px)+Math.abs(raw.py)+Math.abs(raw.scale-1)+Math.abs(raw.qy);
    filteredWobble+=Math.abs(out.px)+Math.abs(out.py)+Math.abs(out.scale-1)+Math.abs(out.qy);
  }

  assert.ok(filteredWobble<rawWobble*0.55,`filtered=${filteredWobble} raw=${rawWobble}`);
});

test("ar-pose-filter follows large movement without freezing",()=>{
  const f=create();
  let out=f.update(pose(0,0,0,0,1),0);

  for(let i=1;i<=20;i++){
    out=f.update(pose(0.20,0.06,0,0.35,1.16),i*16);
  }

  const yaw=yawFromQ(out);
  assert.ok(out.px>0.12,`px=${out.px}`);
  assert.ok(out.py>0.02,`py=${out.py}`);
  assert.ok(yaw>0.18,`yaw=${yaw}`);
  assert.ok(out.scale>1.08,`scale=${out.scale}`);
});

test("ar-pose-filter rate-limits one-frame spikes",()=>{
  const f=create();
  let out=f.update(pose(0,0,0,0,1),0);
  out=f.update(pose(0,0,0,0,1),16);
  const jumped=f.update(pose(0.6,0,0,1.2,1.5),32);

  const posStep=Math.hypot(jumped.px-out.px,jumped.py-out.py,jumped.pz-out.pz);
  const yawStep=Math.abs(yawFromQ(jumped)-yawFromQ(out));

  assert.ok(posStep<0.09,`posStep=${posStep}`);
  assert.ok(yawStep<0.11,`yawStep=${yawStep}`);
});
