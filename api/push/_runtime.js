const webpush=require("web-push");

const GLOBAL_KEY="__MY_APP5_PUSH_RUNTIME__";

function getRuntime(){
  if(!globalThis[GLOBAL_KEY]){
    globalThis[GLOBAL_KEY]={
      configured:false,
      subscriptions:new Map(),
      running:false,
      intervalSeconds:1200,
      nextFireAtEpochMs:null,
      timer:null,
      lastError:null,
    };
  }
  return globalThis[GLOBAL_KEY];
}

function getVapidConfig(){
  const publicKey=process.env.VAPID_PUBLIC_KEY||"";
  const privateKey=process.env.VAPID_PRIVATE_KEY||"";
  const subject=process.env.VAPID_SUBJECT||"mailto:admin@example.com";
  const configured=Boolean(publicKey&&privateKey);
  return{configured,publicKey,privateKey,subject};
}

function ensureConfigured(){
  const runtime=getRuntime();
  const cfg=getVapidConfig();
  runtime.configured=cfg.configured;
  if(!cfg.configured)return false;
  webpush.setVapidDetails(cfg.subject,cfg.publicKey,cfg.privateKey);
  return true;
}

function parseBody(req){
  if(!req||typeof req.body==="undefined"||req.body===null)return{};
  if(typeof req.body==="string"){
    try{return JSON.parse(req.body);}catch(_){return{};}
  }
  return req.body;
}

function normalizeSubscription(input){
  const sub=input&&input.subscription?input.subscription:input;
  if(!sub||typeof sub!=="object")return null;
  const endpoint=typeof sub.endpoint==="string"?sub.endpoint:"";
  const keys=sub.keys||{};
  const p256dh=typeof keys.p256dh==="string"?keys.p256dh:"";
  const auth=typeof keys.auth==="string"?keys.auth:"";
  if(!endpoint||!p256dh||!auth)return null;
  return{endpoint,keys:{p256dh,auth}};
}

function addSubscription(subscription){
  const runtime=getRuntime();
  runtime.subscriptions.set(subscription.endpoint,subscription);
  return runtime.subscriptions.size;
}

function removeSubscriptionByEndpoint(endpoint){
  const runtime=getRuntime();
  if(!endpoint)return runtime.subscriptions.size;
  runtime.subscriptions.delete(endpoint);
  return runtime.subscriptions.size;
}

function listSubscriptions(){
  return Array.from(getRuntime().subscriptions.values());
}

function clearSchedule(){
  const runtime=getRuntime();
  if(runtime.timer){
    clearInterval(runtime.timer);
    runtime.timer=null;
  }
  runtime.running=false;
  runtime.nextFireAtEpochMs=null;
}

async function sendPushToAll(payload){
  const runtime=getRuntime();
  if(!ensureConfigured()){
    return{sent:0,failed:0,errors:[{type:"not_configured"}]};
  }

  const subs=listSubscriptions();
  const errors=[];
  let sent=0;
  let failed=0;

  await Promise.all(subs.map(async(sub)=>{
    try{
      await webpush.sendNotification(sub,JSON.stringify(payload),{TTL:60});
      sent+=1;
    }catch(err){
      failed+=1;
      const statusCode=Number(err&&err.statusCode)||0;
      const isGone=statusCode===404||statusCode===410;
      if(isGone)removeSubscriptionByEndpoint(sub.endpoint);
      errors.push({
        endpoint:sub.endpoint,
        status_code:statusCode||undefined,
        message:String(err&&err.message?err.message:err),
      });
    }
  }));

  if(errors.length>0)runtime.lastError=errors[0].message;
  else runtime.lastError=null;

  return{sent,failed,errors};
}

function makeReminderPayload(){
  return{
    title:"다비치안경 | 눈건강 휴식 알림",
    body:"눈 피로를 줄이기 위해 잠깐 쉬어주세요. 6m 이상 먼 곳을 20초 바라보고 천천히 5회 깜빡여 주세요.",
    tag:`eye-202020-${Date.now()}`,
    icon:"/static/davich_logo.png",
    badge:"/static/davich_logo.png",
  };
}

function startSchedule(intervalSeconds){
  const runtime=getRuntime();
  clearSchedule();
  runtime.intervalSeconds=Math.max(1,Number(intervalSeconds)||1200);
  runtime.running=true;
  runtime.nextFireAtEpochMs=Date.now()+runtime.intervalSeconds*1000;

  runtime.timer=setInterval(async()=>{
    runtime.nextFireAtEpochMs=Date.now()+runtime.intervalSeconds*1000;
    await sendPushToAll(makeReminderPayload());
  },runtime.intervalSeconds*1000);
}

function getStatus(){
  const runtime=getRuntime();
  const cfg=getVapidConfig();
  return{
    configured:cfg.configured,
    publicKey:cfg.publicKey||null,
    running:runtime.running,
    intervalSeconds:runtime.intervalSeconds,
    nextFireAtEpochMs:runtime.nextFireAtEpochMs,
    subscriptionCount:runtime.subscriptions.size,
    lastError:runtime.lastError,
  };
}

module.exports={
  ensureConfigured,
  parseBody,
  normalizeSubscription,
  addSubscription,
  removeSubscriptionByEndpoint,
  listSubscriptions,
  sendPushToAll,
  makeReminderPayload,
  startSchedule,
  clearSchedule,
  getStatus,
};
