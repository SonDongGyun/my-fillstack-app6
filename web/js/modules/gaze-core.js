(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.GazeCore=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
  function distance(a,b){const dx=a.x-b.x,dy=a.y-b.y;return Math.sqrt(dx*dx+dy*dy);}
  function ear(landmarks,idx){
    const [p1,p2,p3,p4,p5,p6]=idx.map((i)=>landmarks[i]);
    return (distance(p2,p6)+distance(p3,p5))/(2*distance(p1,p4));
  }
  function irisCenter(landmarks,ids){
    let x=0,y=0;
    for(const id of ids){x+=landmarks[id].x;y+=landmarks[id].y;}
    return{x:x/ids.length,y:y/ids.length};
  }
  function eyeRatio(landmarks,box,center){
    const l=landmarks[box.left],r=landmarks[box.right],t=landmarks[box.top],b=landmarks[box.bottom];
    const minX=Math.min(l.x,r.x),maxX=Math.max(l.x,r.x),minY=Math.min(t.y,b.y),maxY=Math.max(t.y,b.y);
    const rx=(center.x-minX)/Math.max(1e-6,maxX-minX),ry=(center.y-minY)/Math.max(1e-6,maxY-minY);
    return{x:clamp((rx-.5)*2,-1,1),y:clamp((ry-.5)*2,-1,1)};
  }
  function estimateGaze(landmarks,leftIris,rightIris,leftEyeBox,rightEyeBox){
    const li=irisCenter(landmarks,leftIris),ri=irisCenter(landmarks,rightIris);
    const gl=eyeRatio(landmarks,leftEyeBox,li),gr=eyeRatio(landmarks,rightEyeBox,ri);
    return{x:-((gl.x+gr.x)/2),y:(gl.y+gr.y)/2};
  }
  function smoothGaze(raw,prevX,prevY,alpha){
    const a=typeof alpha==="number"?alpha:.28;
    const x=prevX*(1-a)+raw.x*a;
    const y=prevY*(1-a)+raw.y*a;
    return{x,y};
  }
  return{distance,ear,irisCenter,eyeRatio,estimateGaze,smoothGaze};
});
