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
  const subscription=runtime.normalizeSubscription(body);
  if(!subscription){
    res.status(400).json({ok:false,error:"invalid_subscription"});
    return;
  }

  const count=runtime.addSubscription(subscription);
  res.status(200).json({ok:true,subscription_count:count});
};
