const runtime=require("./_runtime");

module.exports=function handler(req,res){
  res.setHeader("Cache-Control","no-store");

  const status=runtime.getStatus();
  if(!status.configured){
    res.status(200).json({
      ok:false,
      error:"push_not_configured",
      running:false,
      interval_seconds:status.intervalSeconds,
      next_fire_at_epoch_ms:null,
      public_key:null,
      subscription_count:status.subscriptionCount,
    });
    return;
  }

  res.status(200).json({
    ok:true,
    running:status.running,
    interval_seconds:status.intervalSeconds,
    next_fire_at_epoch_ms:status.nextFireAtEpochMs,
    public_key:status.publicKey,
    subscription_count:status.subscriptionCount,
  });
};
