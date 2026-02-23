const runtime=require("./_runtime");

module.exports=async function handler(req,res){
  if(req.method!=="POST"){
    res.setHeader("Allow","POST");
    res.status(405).json({ok:false,error:"method_not_allowed"});
    return;
  }

  res.setHeader("Cache-Control","no-store");
  if(!runtime.ensureConfigured()){
    res.status(200).json({ok:false,error:"push_not_configured"});
    return;
  }

  const body=runtime.parseBody(req);
  const intervalSeconds=Math.max(1,Math.round(Number(body.interval_seconds)||1200));

  const immediate=await runtime.sendPushToAll(runtime.makeReminderPayload());
  runtime.startSchedule(intervalSeconds);
  const status=runtime.getStatus();

  res.status(200).json({
    ok:true,
    running:status.running,
    interval_seconds:status.intervalSeconds,
    next_fire_at_epoch_ms:status.nextFireAtEpochMs,
    immediate,
    subscription_count:status.subscriptionCount,
  });
};
