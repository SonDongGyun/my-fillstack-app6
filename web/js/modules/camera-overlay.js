(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.CameraOverlay=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(ctx){
    const {
      clamp,
      APP_STATE,
      leftPupil,
      rightPupil,
      gazeOverlay,
      videoEl,
      previewWrap,
      irisCenter,
      LEFT_IRIS,
      RIGHT_IRIS,
      LEFT_EYE_BOX,
      RIGHT_EYE_BOX,
    }=ctx;

    function moveEmojiPupils(gaze){
      const tx=clamp(gaze.x,-1,1)*7.2;
      const ty=clamp(gaze.y,-1,1)*6.6;
      APP_STATE.gaze.emojiPupilX=APP_STATE.gaze.emojiPupilX*.68+tx*.32;
      APP_STATE.gaze.emojiPupilY=APP_STATE.gaze.emojiPupilY*.68+ty*.32;
      const t=`translate(calc(-50% + ${APP_STATE.gaze.emojiPupilX.toFixed(2)}px), calc(-50% + ${APP_STATE.gaze.emojiPupilY.toFixed(2)}px))`;
      leftPupil.style.transform=t;
      rightPupil.style.transform=t;
    }

    function clearOverlay(){
      if(!gazeOverlay)return;
      const ctx2d=gazeOverlay.getContext("2d");
      if(!ctx2d)return;
      ctx2d.clearRect(0,0,gazeOverlay.width,gazeOverlay.height);
    }

    function mapPt(p,w,h){
      return{x:p.x*w,y:p.y*h};
    }

    function drawIrisGuides(landmarks){
      if(!gazeOverlay||!videoEl||!landmarks)return;
      const w=Math.max(1,videoEl.clientWidth);
      const h=Math.max(1,videoEl.clientHeight);
      if(gazeOverlay.width!==w||gazeOverlay.height!==h){
        gazeOverlay.width=w;
        gazeOverlay.height=h;
      }
      const ctx2d=gazeOverlay.getContext("2d");
      if(!ctx2d)return;

      ctx2d.clearRect(0,0,w,h);
      const li=irisCenter(landmarks,LEFT_IRIS);
      const ri=irisCenter(landmarks,RIGHT_IRIS);
      const lBoxL=landmarks[LEFT_EYE_BOX.left];
      const lBoxR=landmarks[LEFT_EYE_BOX.right];
      const rBoxL=landmarks[RIGHT_EYE_BOX.left];
      const rBoxR=landmarks[RIGHT_EYE_BOX.right];
      const lEye=mapPt({x:(lBoxL.x+lBoxR.x)/2,y:(lBoxL.y+lBoxR.y)/2},w,h);
      const rEye=mapPt({x:(rBoxL.x+rBoxR.x)/2,y:(rBoxL.y+rBoxR.y)/2},w,h);
      const lIris=mapPt(li,w,h);
      const rIris=mapPt(ri,w,h);
      const mirrored=!!(previewWrap&&previewWrap.classList.contains("real-world"));
      if(mirrored){
        lEye.x=w-lEye.x;
        rEye.x=w-rEye.x;
        lIris.x=w-lIris.x;
        rIris.x=w-rIris.x;
      }

      const drawArrow=(from,to,color,label)=>{
        const dx=to.x-from.x;
        const dy=to.y-from.y;
        const len=Math.max(1,Math.hypot(dx,dy));
        const ux=dx/len;
        const uy=dy/len;
        const ex=from.x+ux*Math.min(34,len*1.3);
        const ey=from.y+uy*Math.min(34,len*1.3);
        ctx2d.lineWidth=2;
        ctx2d.strokeStyle=color;
        ctx2d.fillStyle=color;
        ctx2d.beginPath();
        ctx2d.moveTo(from.x,from.y);
        ctx2d.lineTo(ex,ey);
        ctx2d.stroke();
        const ah=8;
        const aw=5;
        ctx2d.beginPath();
        ctx2d.moveTo(ex,ey);
        ctx2d.lineTo(ex-ux*ah-uy*aw,ey-uy*ah+ux*aw);
        ctx2d.lineTo(ex-ux*ah+uy*aw,ey-uy*ah-ux*aw);
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.fillStyle="rgba(255,255,255,.95)";
        ctx2d.font="700 10px sans-serif";
        ctx2d.fillText(label,from.x+8,from.y-8);
      };

      const leftOnScreenIsL=lEye.x<=rEye.x;
      const lLabel=leftOnScreenIsL?"L":"R";
      const rLabel=leftOnScreenIsL?"R":"L";
      drawArrow(lEye,lIris,"rgba(0,201,255,.95)",lLabel);
      drawArrow(rEye,rIris,"rgba(255,183,77,.95)",rLabel);
      for(const p of [lIris,rIris]){
        ctx2d.beginPath();
        ctx2d.fillStyle="rgba(255,255,255,.98)";
        ctx2d.arc(p.x,p.y,5.5,0,Math.PI*2);
        ctx2d.fill();
        ctx2d.beginPath();
        ctx2d.fillStyle="rgba(21,67,121,.98)";
        ctx2d.arc(p.x,p.y,3.2,0,Math.PI*2);
        ctx2d.fill();
      }
    }

    return{moveEmojiPupils,clearOverlay,drawIrisGuides};
  }

  return{create};
});
