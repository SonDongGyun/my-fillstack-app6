const introView=document.getElementById("introView"),homeView=document.getElementById("homeView"),gameView=document.getElementById("gameView");
const startAppBtn=document.getElementById("startAppBtn"),backIntroBtn=document.getElementById("backIntroBtn");const hero=document.getElementById("hero"),heroEmoji=document.getElementById("heroEmoji");const newsStatus=document.getElementById("newsStatus"),newsList=document.getElementById("davichNewsList"),marketAppLink=document.getElementById("marketAppLink"),scrollProgress=document.getElementById("scrollProgress");
const kakaoLoginBtn=document.getElementById("kakaoLoginBtn"),authUserBox=document.getElementById("authUserBox"),authNickname=document.getElementById("authNickname"),logoutBtn=document.getElementById("logoutBtn");
const gameTitleEl=document.getElementById("gameTitle"),gameDescEl=document.getElementById("gameDesc"),backHomeBtn=document.getElementById("backHomeBtn");
const videoEl=document.getElementById("video"),gazeOverlay=document.getElementById("gazeOverlay"),previewWrap=document.getElementById("previewWrap"),statusEl=document.getElementById("status"),earEl=document.getElementById("earText"),blinkTextEl=document.getElementById("blinkText"),gazeTextEl=document.getElementById("gazeText");
const startCameraBtn=document.getElementById("startCameraBtn"),resetStateBtn=document.getElementById("resetStateBtn");
const permissionHelp=document.getElementById("permissionHelp"),permissionText=document.getElementById("permissionText");
const evidenceSummaryTitleEl=document.getElementById("evidenceSummaryTitle"),evidenceSummaryTextEl=document.getElementById("evidenceSummaryText"),evidenceSummarySection=document.getElementById("evidenceSummarySection");
const blinkPanel=document.getElementById("blinkPanel"),gazePanel=document.getElementById("gazePanel"),circlePanel=document.getElementById("circlePanel"),focusPanel=document.getElementById("focusPanel"),rulePanel=document.getElementById("rulePanel"),acuityPanel=document.getElementById("acuityPanel");
const blinkStartBtn=document.getElementById("blinkStartBtn"),blinkMeta=document.getElementById("blinkMeta"),blinkCountLine=document.getElementById("blinkCountLine"),blinkTimeLine=document.getElementById("blinkTimeLine"),gazeStartBtn=document.getElementById("gazeStartBtn"),gazeRecalibrateBtn=document.getElementById("gazeRecalibrateBtn"),gazeMeta=document.getElementById("gazeMeta"),circleStartBtn=document.getElementById("circleStartBtn"),circleMeta=document.getElementById("circleMeta"),focusStartBtn=document.getElementById("focusStartBtn"),focusMeta=document.getElementById("focusMeta"),ruleStartBtn=document.getElementById("ruleStartBtn"),ruleMeta=document.getElementById("ruleMeta");
const circleTrackArea=document.getElementById("circleTrackArea"),circleTarget=document.getElementById("circleTarget"),circleCursor=document.getElementById("circleCursor");
const acuityStartBtn=document.getElementById("acuityStartBtn"),acuityUpBtn=document.getElementById("acuityUpBtn"),acuityRightBtn=document.getElementById("acuityRightBtn"),acuityDownBtn=document.getElementById("acuityDownBtn"),acuityLeftBtn=document.getElementById("acuityLeftBtn"),optotypeWrapEl=document.getElementById("optotypeWrap"),optotypeE=document.getElementById("optotypeE"),acuityFireworkEl=document.getElementById("acuityFirework"),acuityMeta=document.getElementById("acuityMeta"),acuityFxEl=document.getElementById("acuityFx"),acuityCountFxEl=document.getElementById("acuityCountFx");
const emojiFace=document.getElementById("emojiFace"),leftEye=document.getElementById("leftEye"),rightEye=document.getElementById("rightEye"),leftPupil=document.getElementById("leftPupil"),rightPupil=document.getElementById("rightPupil"),mouthEl=document.getElementById("mouth"),restGifEl=document.getElementById("restGif"),restCaptionEl=document.getElementById("restCaption"),blinkFloatEl=document.getElementById("blinkFloat"),blinkCornerTimeEl=document.getElementById("blinkCornerTime"),blinkResultFlashEl=document.getElementById("blinkResultFlash");
let isClosed=false,blinkCooldown=false;
const BLINK_ANIM_MS=220,COOLDOWN_MS=260,DEFAULT_CLOSED_THRESHOLD=0.21,DEFAULT_OPEN_THRESHOLD=0.255;
let closedThreshold=DEFAULT_CLOSED_THRESHOLD,openThreshold=DEFAULT_OPEN_THRESHOLD,baselineEar=null;
let directionAudioCtx=null,directionTtsVoice=null;
const GAZE_CFG={
  direction:{enter:0.1,leave:0.06,margin:0.03,horizontalBias:0.9,verticalSwitchBias:0.9,downSwitchBias:0.85},
  match:{tx:0.06,tyDown:0.08,tyUp:0.08},
  gain:{x:1.45,y:1.35},
};
const ua=navigator.userAgent||"";
const isIOS=/iPhone|iPad|iPod/i.test(ua);
if(isIOS&&previewWrap)previewWrap.classList.add("real-world");
function applyViewTransformToGaze(gaze){
  if(isIOS&&previewWrap&&previewWrap.classList.contains("real-world")){
    return{x:-gaze.x,y:gaze.y};
  }
  return gaze;
}
let ruleInterval=null,ruleTick=null,ruleTargetTs=0,focusTimer=null,focusTick=null,focusEndTs=0;
const LEFT_EYE=[33,160,158,133,153,144],RIGHT_EYE=[362,385,387,263,373,380],LEFT_IRIS=[473,474,475,476,477],RIGHT_IRIS=[468,469,470,471,472];
const LEFT_EYE_BOX={left:33,right:133,top:159,bottom:145},RIGHT_EYE_BOX={left:362,right:263,top:386,bottom:374};
const gameConfig={blink:{title:"깜빡임 트레이너",desc:"눈을 감았다 뜨는 리듬을 유지하는 운동입니다.",emojiClass:"emoji-blink"},gaze:{title:"시선 방향 운동",desc:"눈동자 인식으로 방향 운동을 수행합니다.",emojiClass:"emoji-gaze"},circle:{title:"원형 추적 운동",desc:"움직이는 원형 타겟을 눈동자로 따라가는 추적 운동입니다.",emojiClass:"emoji-gaze"},focus:{title:"원근 초점 루틴",desc:"가까운 곳과 먼 곳으로 초점을 번갈아 옮깁니다.",emojiClass:"emoji-focus"},rule202020:{title:"20-20-20 알림",desc:"규칙적인 휴식을 알림으로 유지하는 습관 모드입니다.",emojiClass:"emoji-reminder"},acuity:{title:"시력 반응 테스트",desc:"회전된 E 방향을 맞히는 시력 인지 게임입니다. 의료 진단 목적은 아닙니다.",emojiClass:"emoji-acuity"}};
const evidenceSummaryConfig={blink:{title:"깜빡임 트레이너 근거",text:"의식적으로 깜빡이면 눈 표면이 촉촉해져 화면을 오래 볼 때 생기는 건조감 완화에 도움이 됩니다."},gaze:{title:"시선 방향 운동 근거",text:"한 방향만 보지 않고 시선을 바꿔주면 눈 근육의 긴장을 줄이는 데 도움이 됩니다."},circle:{title:"원형 추적 운동 근거",text:"움직이는 목표를 부드럽게 따라보는 훈련은 시선 추적 능력과 눈 근육 협응에 도움이 됩니다."},focus:{title:"원근 초점 루틴 근거",text:"가까운 곳과 먼 곳을 번갈아 보면 초점 조절 부담이 분산되어 눈의 피로 완화에 유리합니다."},rule202020:{title:"20-20-20 알림 근거",text:"20분마다 20초 쉬는 습관은 디지털 눈피로 관리를 위한 대표적인 생활 수칙입니다."},acuity:{title:"시력 반응 테스트 안내",text:"반응 훈련용 기능이며 진단 도구는 아닙니다. 정확한 시력 평가는 전문 검사가 필요합니다."}};
const logic=window.GameLogic||{};
const clamp=typeof logic.clamp==="function"?logic.clamp:(v,min,max)=>Math.min(max,Math.max(min,v));
const timerManager=(window.TimerManager&&typeof window.TimerManager.createTimerManager==="function")?window.TimerManager.createTimerManager():null;
const APP_STATE={
  app:{currentGame:null,lastDirectionTtsTs:0},
  camera:{running:false,faceVisible:false},
  blink:{totalDetected:0,exerciseActive:false,exerciseCount:0,exerciseTimer:null,exerciseEndTs:0,exerciseLocked:false,finishFxTimer:null,resultFlashTimer:null},
  gaze:{exerciseActive:false,sequence:[],stepIndex:0,holdMs:0,lastTs:0,stepFxTimer:null,lastDirection:"",lastVibeTs:0,neutralX:0,neutralY:0,neutralReady:false,smoothX:0,smoothY:0,stableDirection:"CENTER",emojiPupilX:0,emojiPupilY:0,lastAnnouncedTarget:"",calibrating:false,calibrationStep:0,calibrationHoldMs:0,calibrationSamples:[],calibrationMap:null,calibrated:false,lastClassifiedDir:"CENTER",lastScore:0,nativeX:0,nativeY:0,nativeInit:false},
  acuity:{active:false,round:0,score:0,direction:"UP",size:74,questionTimer:null,deadlineTs:0},
  circle:{active:false,startTs:0,lastTs:0,durationMs:30000,followMs:0,threshold:0.30,targetX:0,targetY:0,endShown:false},
};
function patchState(scope,partial){if(!APP_STATE[scope]||!partial)return;Object.assign(APP_STATE[scope],partial);} 
function setAppState(partial){patchState("app",partial);} 
function setCameraState(partial){patchState("camera",partial);} 
function setBlinkState(partial){patchState("blink",partial);} 
function setGazeState(partial){patchState("gaze",partial);} 
function setAcuityState(partial){patchState("acuity",partial);} 
function setCircleState(partial){patchState("circle",partial);} 
const uiDom=window.UiDom||{};
const setText=typeof uiDom.setText==="function"?uiDom.setText:(el,text)=>{if(el)el.textContent=String(text??"");};
const setHtml=typeof uiDom.setHtml==="function"?uiDom.setHtml:(el,html)=>{if(el)el.innerHTML=String(html??"");};
const uiTexts=window.UiTexts||{};
const UI_LABELS={
  gazeDirectionPrefix:uiTexts.gazeDirectionPrefix||"Gaze direction",
  statusRecognizing:uiTexts.statusRecognizing||"Tracking",
  statusIdle:uiTexts.statusIdle||"Idle",
  statusNativeRecognizing:uiTexts.statusNativeRecognizing||"Native camera tracking",
  statusNativeLowConfidence:uiTexts.statusNativeLowConfidence||"Native camera tracking (low confidence)",
};
const COPY={
  inProgress:"In progress",
  cameraStarting:"Starting camera...",
  cameraRunning:"Camera running",
  cameraPermissionDenied:"Please allow camera permission.",
  cameraStartFailed:"Unable to start camera. Check browser/HTTPS.",
  mediapipeLoadFailed:"MediaPipe load failed",
  allowCameraAndRetry:"Allow camera permission and retry",
  acuityNotStarted:"Game has not started",
  correct:"Correct",
  wrong:"Wrong",
  correctFx:"Correct! ",
  wrongFx:"Wrong! ",
  blinkCount:(count)=>`Blink count: ${count}`,
  timeLeft:(sec)=>`Time left: ${sec}s`,
  gazeFirstTarget:(label)=>`In progress - first target: ${label} - 0.00/3.00s (1/10)`,
  gazeTarget:(label,hold,step)=>`Target: ${label} | ${hold}/3.00s (${step}/10)`,
  gazeDone:"Done: completed all 10 steps",
  circleGuide:"In progress - follow the circular target",
  circleProgress:(acc,remain)=>`In progress - accuracy ${acc}% - ${remain}s left`,
  circleDone:(acc)=>`Done - accuracy ${acc}%`,
  circleRetry:(acc)=>`Done - accuracy ${acc}% (try again)`,
  nextBreak:(time)=>`Next break in ${time}`,
  ruleAlert:"20-20-20 rule: every 20 min, look far for 20 sec.",
};
function setCurrentGame(key){setAppState({currentGame:key});}
function setRunning(v){setCameraState({running:!!v});}
function setFaceVisible(v){setCameraState({faceVisible:!!v});}
function setTotalBlinkDetected(v){setBlinkState({totalDetected:v});}
function getCurrentGame(){return APP_STATE.app.currentGame;}
function isRunning(){return APP_STATE.camera.running;}
function getTotalBlinkDetected(){return APP_STATE.blink.totalDetected;}
function getCtaDockThreshold(key){
  if(key==="intro")return 12;
  if(key==="home")return 12;
  return 12;
}
function setupScrollCtaDocking(){
  document.querySelectorAll("[data-scroll-cta]").forEach((btn)=>{
    const key=btn.dataset.scrollCta,holder=document.querySelector(`[data-cta-placeholder="${key}"]`);
    if(!holder)return;
    btn._placeholder=holder;
    btn._dock={docked:false,anim:false,key,parent:btn.parentElement,triggerY:null};
    btn.style.transform="";
  });
}
function ensureCtaTrigger(btn){
  if(!btn||!btn._dock)return;
  if(btn._dock.docked)return;
  const rect=btn.getBoundingClientRect();
  if(rect.height<=0)return;
  const threshold=getCtaDockThreshold(btn.dataset.scrollCta);
  btn._dock.triggerY=Math.max(0,Math.round(window.scrollY+rect.top-threshold));
}
function dockCta(btn){
  if(!btn||!btn._placeholder||btn._dock?.anim||btn._dock?.docked)return;
  const start=btn.getBoundingClientRect();
  let width=Math.min(Math.max(btn.offsetWidth,start.width),Math.max(160,window.innerWidth-20));
  const height=Math.max(btn.offsetHeight,start.height);
  const isIntro=btn.dataset.scrollCta==="intro";
  const isMobile=window.innerWidth<=768;
  if(isIntro&&isMobile){
    const mobileTarget=Math.round(window.innerWidth*0.64);
    width=Math.max(156,Math.min(width,mobileTarget));
  }
  const targetTop=getCtaDockThreshold(btn.dataset.scrollCta);
  const targetLeft=Math.round((window.innerWidth-width)/2);
  btn._dock.anim=true;
  btn._placeholder.style.height=`${height}px`;
  btn._placeholder.classList.add("active");
  if(btn.parentElement!==document.body)document.body.appendChild(btn);
  btn.classList.add("is-docked");
  btn.style.width=`${width}px`;
  btn.style.left=`${targetLeft}px`;
  btn.style.top=`${targetTop}px`;
  btn.style.position="fixed";
  btn.style.right="auto";
  btn.style.bottom="auto";
  const end=btn.getBoundingClientRect();
  const dx=(start.left-end.left).toFixed(1);
  const dy=(start.top-end.top).toFixed(1);
  btn.style.transition="none";
  btn.style.transform=`translate(${dx}px, ${dy}px)`;
  requestAnimationFrame(()=>{
    btn.style.transition="transform .9s cubic-bezier(.2,.8,.2,1), box-shadow .2s ease";
    btn.style.transform="translate(0px, 0px)";
  });
  window.setTimeout(()=>{
    btn.style.transition="";
    btn._dock.anim=false;
    btn._dock.docked=true;
  },920);
}
function undockCta(btn,immediateOverride=false){
  if(!btn||!btn._placeholder||btn._dock?.anim||!btn._dock?.docked)return;
  const from=btn.getBoundingClientRect();
  const to=btn._placeholder.getBoundingClientRect();
  btn._dock.anim=true;
  const immediate=immediateOverride||btn._dock?.forceImmediate||Math.abs((to.top-from.top))>window.innerHeight*.72;
  if(immediate){
    btn.classList.remove("is-docked");
    btn.style.width="";
    btn.style.left="";
    btn.style.top="";
    btn.style.position="";
    btn.style.right="";
    btn.style.bottom="";
    btn.style.transform="";
    btn.style.transition="";
    if(btn._dock?.parent){
      btn._dock.parent.insertBefore(btn,btn._placeholder);
    }
    btn._placeholder.classList.remove("active");
    btn._placeholder.style.height="";
    btn._dock.anim=false;
    btn._dock.docked=false;
    btn._dock.forceImmediate=false;
    return;
  }
  const dx=(to.left-from.left).toFixed(1);
  const dy=(to.top-from.top).toFixed(1);
  btn.style.transition="transform .48s cubic-bezier(.2,.8,.2,1)";
  btn.style.transform=`translate(${dx}px, ${dy}px)`;
  window.setTimeout(()=>{
    btn.classList.remove("is-docked");
    btn.style.width="";
    btn.style.left="";
    btn.style.top="";
    btn.style.position="";
    btn.style.right="";
    btn.style.bottom="";
    btn.style.transform="";
    btn.style.transition="";
    if(btn._dock?.parent){
      btn._dock.parent.insertBefore(btn,btn._placeholder);
    }
    btn._placeholder.classList.remove("active");
    btn._placeholder.style.height="";
    btn._dock.anim=false;
    btn._dock.docked=false;
    btn._dock.forceImmediate=false;
  },490);
}
function updateScrollCtas(){
  document.querySelectorAll("[data-scroll-cta]").forEach((btn)=>{
    const key=btn.dataset.scrollCta;
    const active=key==="home"?homeView.classList.contains("active"):key==="game"?gameView.classList.contains("active"):introView.classList.contains("active");
    if(!btn._placeholder||!btn._dock)return;
    if(!active){
      if(btn._dock.docked){
        btn._dock.forceImmediate=true;
        undockCta(btn);
      }
      btn._dock.triggerY=null;
      return;
    }
    const threshold=getCtaDockThreshold(key);
    const probeEl=btn._dock.docked?btn._placeholder:btn;
    const probeTop=probeEl.getBoundingClientRect().top;
    const shouldDock=probeTop<=threshold;
    const shouldUndock=probeTop>threshold;
    if(btn._dock.docked){
      const w=btn.offsetWidth||btn.getBoundingClientRect().width;
      btn.style.left=`${Math.round((window.innerWidth-w)/2)}px`;
    }
    if(shouldDock&&!btn._dock.docked)dockCta(btn);
    if(shouldUndock&&btn._dock.docked)undockCta(btn,true);
  });
}
// UI shell and core dependencies
const uiShellFactory=window.EyeUiShell&&typeof window.EyeUiShell.create==="function"?window.EyeUiShell.create:null;
const uiShell=uiShellFactory?uiShellFactory({
  introView,homeView,gameView,evidenceSummarySection,
  hero,heroEmoji,newsStatus,newsList,marketAppLink,scrollProgress,
  kakaoLoginBtn,authUserBox,authNickname,logoutBtn,
  onAfterShowView:updateScrollCtas,
}):null;
const showView=uiShell?uiShell.showView:()=>{};
const isMobileViewport=uiShell?uiShell.isMobileViewport:()=>false;
const applyHeroParallax=uiShell?uiShell.applyHeroParallax:()=>{};
const resetHeroParallax=uiShell?uiShell.resetHeroParallax:()=>{};
const updateScrollProgress=uiShell?uiShell.updateScrollProgress:()=>{};
const setupHeroStory=uiShell?uiShell.setupHeroStory:()=>{};
const setupMarketAppLink=uiShell?uiShell.setupMarketAppLink:()=>{};
const setupReveal=uiShell?uiShell.setupReveal:()=>{};
const setupMagnetic=uiShell?uiShell.setupMagnetic:()=>{};
const setupAuth=uiShell?uiShell.setupAuth:()=>{};
const loadDavichNews=uiShell?uiShell.loadDavichNews:async()=>{};
const gazeCore=window.GazeCore||{};
const blinkCore=window.BlinkCore||{};
const acuityCore=window.AcuityCore||{};
const cameraOrchestrator=window.CameraOrchestrator||{};
function distance(a,b){return typeof gazeCore.distance==="function"?gazeCore.distance(a,b):0;} 
function ear(landmarks,idx){return typeof gazeCore.ear==="function"?gazeCore.ear(landmarks,idx):0;}
function irisCenter(landmarks,ids){return typeof gazeCore.irisCenter==="function"?gazeCore.irisCenter(landmarks,ids):{x:0,y:0};}
function eyeRatio(landmarks,box,center){return typeof gazeCore.eyeRatio==="function"?gazeCore.eyeRatio(landmarks,box,center):{x:0,y:0};}
function estimateGaze(landmarks){return typeof gazeCore.estimateGaze==="function"?gazeCore.estimateGaze(landmarks,LEFT_IRIS,RIGHT_IRIS,LEFT_EYE_BOX,RIGHT_EYE_BOX):{x:0,y:0};}
function smoothGaze(raw){if(typeof gazeCore.smoothGaze!=="function")return{x:0,y:0};const sm=gazeCore.smoothGaze(raw,APP_STATE.gaze.smoothX,APP_STATE.gaze.smoothY,.20);APP_STATE.gaze.smoothX=sm.x;APP_STATE.gaze.smoothY=sm.y;return sm;}
function updateMetrics(){blinkTextEl.textContent=`깜빡임 감지: ${APP_STATE.blink.totalDetected}회`;}
function setEmojiTheme(key){
  const showRest=key==="rule202020";
  if(restGifEl)restGifEl.classList.toggle("hidden",!showRest);
  if(restCaptionEl)restCaptionEl.classList.toggle("hidden",!showRest);
  if(emojiFace)emojiFace.classList.toggle("hidden",showRest);
  if(showRest)return;
  emojiFace.className="emoji";
  if(gameConfig[key]?.emojiClass)emojiFace.classList.add(gameConfig[key].emojiClass);
  leftEye.classList.remove("closed");rightEye.classList.remove("closed");leftPupil.style.opacity="1";rightPupil.style.opacity="1";leftPupil.style.transform="translate(-50%, -50%)";rightPupil.style.transform="translate(-50%, -50%)";mouthEl.style.bottom="20%";mouthEl.style.width="27%";mouthEl.style.height="10%";mouthEl.style.borderBottomWidth="4px";mouthEl.style.borderRadius="0 0 48px 48px";mouthEl.style.borderBottomColor="#8f4a08";mouthEl.style.background="transparent";mouthEl.style.boxShadow="none";if(key==="blink"){leftPupil.style.opacity="0";rightPupil.style.opacity="0";mouthEl.style.bottom="17.4%";mouthEl.style.width="25%";mouthEl.style.height="7.4%";mouthEl.style.borderBottomWidth="0";mouthEl.style.borderRadius="0 0 999px 999px";mouthEl.style.background="transparent";mouthEl.style.boxShadow="inset 0 -4px 0 #9f653a";}}
function toggleRuleOnlyLayout(key){
  const ruleOnly = key === "rule202020";
  const acuityOnly = key === "acuity";
  const minimal = ruleOnly || acuityOnly;
  const topTitle = document.querySelector("#gameView section.panel > h3");
  const controlShell = document.querySelector("#gameView .game-grid > section.panel");
  const gameGridEl = document.querySelector("#gameView .game-grid");
  const emojiWrapEl = document.querySelector("#gameView .game-grid > .emoji-wrap");
  if(gameGridEl) gameGridEl.classList.toggle("acuity-only", acuityOnly);
  if(emojiWrapEl) emojiWrapEl.classList.toggle("hidden", acuityOnly);
  if(controlShell) controlShell.classList.toggle("rule-only-shell", ruleOnly);
  if(topTitle) topTitle.classList.toggle("hidden", minimal);
  if(statusEl) statusEl.classList.toggle("hidden", minimal);
  if(earEl) earEl.classList.add("hidden");
  if(blinkTextEl) blinkTextEl.classList.toggle("hidden", key!=="blink");
  if(gazeTextEl) gazeTextEl.classList.toggle("hidden", minimal);
  if(previewWrap) previewWrap.classList.toggle("hidden", true);
  if(startCameraBtn) startCameraBtn.classList.add("hidden");
  if(resetStateBtn) resetStateBtn.classList.add("hidden");
  if(permissionHelp) permissionHelp.classList.add("hidden");
}
function renderGameEvidence(key){if(!evidenceSummaryTitleEl||!evidenceSummaryTextEl)return;const v=evidenceSummaryConfig[key]||{title:"눈운동 근거 쉬운 설명",text:"게임을 선택하면 해당 운동과 관련된 쉬운 설명이 여기 표시됩니다."};evidenceSummaryTitleEl.textContent=v.title;evidenceSummaryTextEl.textContent=v.text;}
function updateBlinkCornerTime(sec){if(!blinkCornerTimeEl)return;const s=Math.max(0,Math.ceil(sec));blinkCornerTimeEl.textContent=`남은 ${s}초`;}
function enterGame(key){
  setCurrentGame(key);
  gameTitleEl.textContent=gameConfig[key].title;
  gameDescEl.textContent=gameConfig[key].desc;

  renderGameEvidence(key);
  setEmojiTheme(key);
  toggleRuleOnlyLayout(key);

  blinkPanel.classList.toggle("hidden",key!=="blink");
  gazePanel.classList.toggle("hidden",key!=="gaze");
  if(circlePanel)circlePanel.classList.toggle("hidden",key!=="circle");
  focusPanel.classList.toggle("hidden",key!=="focus");
  rulePanel.classList.toggle("hidden",key!=="rule202020");
  acuityPanel.classList.toggle("hidden",key!=="acuity");

  const showGazeOverlay=key==="gaze"||key==="circle";
  gazeTextEl.classList.toggle("hidden",!showGazeOverlay);
  if(previewWrap)previewWrap.classList.toggle("hidden",!showGazeOverlay);

  if(blinkCornerTimeEl){
    blinkCornerTimeEl.classList.toggle("hidden",key!=="blink");
    if(key==="blink")updateBlinkCornerTime(20);
  }

  showView("game");
  statusEl.textContent=UI_LABELS.statusIdle;

  if(key==="rule202020"&&typeof window.syncRulePushUi==="function"){
    window.syncRulePushUi();
  }
}
function setEmojiClosed(closed){
  leftEye.classList.toggle("closed",closed);
  rightEye.classList.toggle("closed",closed);
}

function triggerEmojiBlink(){
  setEmojiClosed(true);
  setTimeout(()=>setEmojiClosed(false),BLINK_ANIM_MS);
} 
function showBlinkFloat(count){
  if(!blinkFloatEl||APP_STATE.app.currentGame!=="blink"||!gameView.classList.contains("active"))return;
  const left=58+Math.random()*24;
  const top=24+Math.random()*18;
  blinkFloatEl.style.left=`${left.toFixed(1)}%`;
  blinkFloatEl.style.top=`${top.toFixed(1)}%`;
  blinkFloatEl.textContent=`${count}회`;
  blinkFloatEl.classList.remove("show");
  void blinkFloatEl.offsetWidth;
  blinkFloatEl.classList.add("show");
}
function showBlinkResultFlash(ok){
  if(!blinkResultFlashEl||APP_STATE.app.currentGame!=="blink"||!gameView.classList.contains("active"))return;
  blinkResultFlashEl.classList.remove("hidden","show","ok","warn");
  blinkResultFlashEl.textContent=ok?"성공! 목표 달성":"미달성 · 다시 도전";
  blinkResultFlashEl.classList.add(ok?"ok":"warn");
  void blinkResultFlashEl.offsetWidth;
  blinkResultFlashEl.classList.add("show");
  if(APP_STATE.blink.resultFlashTimer)clearTimeout(APP_STATE.blink.resultFlashTimer);
  APP_STATE.blink.resultFlashTimer=setTimeout(()=>{if(blinkResultFlashEl)blinkResultFlashEl.classList.add("hidden");},1650);
}
function moveEmojiPupils(gaze){
  const tx=clamp(gaze.x,-1,1)*7.2,ty=clamp(gaze.y,-1,1)*6.6;
  APP_STATE.gaze.emojiPupilX=APP_STATE.gaze.emojiPupilX*.68+tx*.32;
  APP_STATE.gaze.emojiPupilY=APP_STATE.gaze.emojiPupilY*.68+ty*.32;
  const t=`translate(calc(-50% + ${APP_STATE.gaze.emojiPupilX.toFixed(2)}px), calc(-50% + ${APP_STATE.gaze.emojiPupilY.toFixed(2)}px))`;
  leftPupil.style.transform=t;
  rightPupil.style.transform=t;
}
function clearOverlay(){
  if(!gazeOverlay)return;
  const ctx=gazeOverlay.getContext("2d");
  if(!ctx)return;
  ctx.clearRect(0,0,gazeOverlay.width,gazeOverlay.height);
}
function setPermissionHelp(show,text){
  if(!permissionHelp)return;
  permissionHelp.classList.toggle("hidden",!show);
  if(show&&permissionText&&text)setText(permissionText,text);
}
function getPermissionGuide(){
  const ua=navigator.userAgent||"";
  if(/iPhone|iPad|iPod/i.test(ua))return"iPhone: 설정 > Safari > 카메라 > 허용 후 Safari를 다시 열어 주세요.";
  if(/Android/i.test(ua)&&/SamsungBrowser|SM-|SAMSUNG/i.test(ua))return"갤럭시: 설정 > 애플리케이션 > 사용 중 브라우저 > 권한 > 카메라 > 허용";
  if(/Android/i.test(ua))return"Android: 브라우저 주소창 자물쇠 > 권한 > 카메라 허용으로 바꿔 주세요.";
  return"브라우저 주소창의 자물쇠 아이콘에서 카메라 권한을 허용해 주세요.";
}
const nativeAlert=window.alert?window.alert.bind(window):null;
window.alert=(msg)=>{
  const text=String(msg||"");
  if(/Failed to acquire camera feed/i.test(text)){
    statusEl.textContent="카메라 권한이 거부되었습니다.";
    setPermissionHelp(true,getPermissionGuide());
    return;
  }
  if(nativeAlert)nativeAlert(msg);
};
function mapPt(p,w,h){return{x:p.x*w,y:p.y*h};}
function drawIrisGuides(landmarks){
  if(!gazeOverlay||!videoEl||!landmarks)return;
  const w=Math.max(1,videoEl.clientWidth),h=Math.max(1,videoEl.clientHeight);
  if(gazeOverlay.width!==w||gazeOverlay.height!==h){gazeOverlay.width=w;gazeOverlay.height=h;}
  const ctx=gazeOverlay.getContext("2d");if(!ctx)return;
  ctx.clearRect(0,0,w,h);
  const li=irisCenter(landmarks,LEFT_IRIS),ri=irisCenter(landmarks,RIGHT_IRIS);
  const lBoxL=landmarks[LEFT_EYE_BOX.left],lBoxR=landmarks[LEFT_EYE_BOX.right],rBoxL=landmarks[RIGHT_EYE_BOX.left],rBoxR=landmarks[RIGHT_EYE_BOX.right];
  const lEye=mapPt({x:(lBoxL.x+lBoxR.x)/2,y:(lBoxL.y+lBoxR.y)/2},w,h),rEye=mapPt({x:(rBoxL.x+rBoxR.x)/2,y:(rBoxL.y+rBoxR.y)/2},w,h),lIris=mapPt(li,w,h),rIris=mapPt(ri,w,h);
  const mirrored=!!(previewWrap&&previewWrap.classList.contains("real-world"));
  if(mirrored){
    lEye.x=w-lEye.x; rEye.x=w-rEye.x;
    lIris.x=w-lIris.x; rIris.x=w-rIris.x;
  }
  const drawArrow=(from,to,color,label)=>{
    const dx=to.x-from.x,dy=to.y-from.y;
    const len=Math.max(1,Math.hypot(dx,dy));
    const ux=dx/len,uy=dy/len;
    const ex=from.x+ux*Math.min(34,len*1.3),ey=from.y+uy*Math.min(34,len*1.3);
    ctx.lineWidth=2;
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
    ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(ex,ey);ctx.stroke();
    const ah=8,aw=5;
    ctx.beginPath();
    ctx.moveTo(ex,ey);
    ctx.lineTo(ex-ux*ah-uy*aw,ey-uy*ah+ux*aw);
    ctx.lineTo(ex-ux*ah+uy*aw,ey-uy*ah-ux*aw);
    ctx.closePath();ctx.fill();
    ctx.fillStyle="rgba(255,255,255,.95)";
    ctx.font="700 10px sans-serif";
    ctx.fillText(label,from.x+8,from.y-8);
  };
  const leftOnScreenIsL=lEye.x<=rEye.x;
  const lLabel=leftOnScreenIsL?"L":"R";
  const rLabel=leftOnScreenIsL?"R":"L";
  drawArrow(lEye,lIris,"rgba(0,201,255,.95)",lLabel);
  drawArrow(rEye,rIris,"rgba(255,183,77,.95)",rLabel);
  for(const p of [lIris,rIris]){
    ctx.beginPath();ctx.fillStyle="rgba(255,255,255,.98)";ctx.arc(p.x,p.y,5.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.fillStyle="rgba(21,67,121,.98)";ctx.arc(p.x,p.y,3.2,0,Math.PI*2);ctx.fill();
  }
}
function gazeDirection(gaze){
  if(typeof logic.nextGazeDirection!=="function")return"정면";
  APP_STATE.gaze.stableDirection=logic.nextGazeDirection(gaze,APP_STATE.gaze.stableDirection,GAZE_CFG);
  return APP_STATE.gaze.stableDirection;
}
function ensureDirectionAudio(){
  try{
    if(directionAudioCtx)return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    directionAudioCtx=new AC();
  }catch(_){}
  try{
    if(!("speechSynthesis" in window))return;
    const pickVoice=()=>{
      const voices=window.speechSynthesis.getVoices()||[];
      if(voices.length===0)return;
      const ko=voices.filter((v)=>/^ko(-|_)?/i.test(v.lang||"")||/korean|한국/i.test(v.name||""));
      const female=ko.find((v)=>/female|woman|여성|seoyeon|yuna|sunhi|sora|ji|min|na-rae|sohee|seyoung/i.test(v.name||""));
      directionTtsVoice=female||ko[0]||voices[0];
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged=pickVoice;
  }catch(_){}
}
function playDirectionCue(){
  try{
    if(!directionAudioCtx)return;
    if(directionAudioCtx.state==="suspended")directionAudioCtx.resume();
    const now=directionAudioCtx.currentTime;
    const osc=directionAudioCtx.createOscillator();
    const gain=directionAudioCtx.createGain();
    osc.type="sine";
    osc.frequency.setValueAtTime(740,now);
    gain.gain.setValueAtTime(0.0001,now);
    gain.gain.exponentialRampToValueAtTime(0.03,now+0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001,now+0.07);
    osc.connect(gain);
    gain.connect(directionAudioCtx.destination);
    osc.start(now);
    osc.stop(now+0.08);
  }catch(_){}
}
function speakDirectionCue(dir){
  try{
    if(!dir)return;
    const now=Date.now();
    if(now-APP_STATE.app.lastDirectionTtsTs<240)return;
    APP_STATE.app.lastDirectionTtsTs=now;
    if(!("speechSynthesis" in window)){playDirectionCue();return;}
    const label=dirLabel(dir);
    const u=new SpeechSynthesisUtterance(`${label} 방향`);
    u.lang="ko-KR";
    u.rate=.9;
    u.pitch=1.03;
    u.volume=1;
    if(directionTtsVoice)u.voice=directionTtsVoice;
    window.speechSynthesis.cancel();
    try{window.speechSynthesis.resume();}catch(_){}
    window.speechSynthesis.speak(u);
  }catch(_){playDirectionCue();}
}
function vibrateOnGazeDirectionChange(direction){
  if(!direction||direction===APP_STATE.gaze.lastDirection)return;
  const now=Date.now();
  if(now-APP_STATE.gaze.lastVibeTs<350){APP_STATE.gaze.lastDirection=direction;return;}
  APP_STATE.gaze.lastDirection=direction;
  APP_STATE.gaze.lastVibeTs=now;
  const ua=navigator.userAgent||"";
  const isMobile=/Android|iPhone|iPad|iPod/i.test(ua),isIOS=/iPhone|iPad|iPod/i.test(ua);
  if(isMobile&&navigator.vibrate&&!isIOS){navigator.vibrate([8,16,8]);return;}
  if(isMobile)playDirectionCue();
}
function resetThreshold(){
  baselineEar=null;
  closedThreshold=DEFAULT_CLOSED_THRESHOLD;
  openThreshold=DEFAULT_OPEN_THRESHOLD;
}

function updateThresholdsFromBaseline(){
  if(!baselineEar)return;
  closedThreshold=Math.max(.15,baselineEar-.09);
  openThreshold=Math.max(closedThreshold+.03,baselineEar-.04);
} 
function triggerBlinkCompleteFx(ok,count){
  if(blinkPanel){
    blinkPanel.classList.remove("set-done-ok","set-done-warn");
    void blinkPanel.offsetWidth;
    blinkPanel.classList.add(ok?"set-done-ok":"set-done-warn");
  }
  if(emojiFace){
    emojiFace.classList.remove("session-finish-pop","finish-ok","finish-warn");
    void emojiFace.offsetWidth;
    emojiFace.classList.add("session-finish-pop");
    emojiFace.classList.add(ok?"finish-ok":"finish-warn");
    if(APP_STATE.blink.finishFxTimer)clearTimeout(APP_STATE.blink.finishFxTimer);
    APP_STATE.blink.finishFxTimer=setTimeout(()=>emojiFace.classList.remove("session-finish-pop","finish-ok","finish-warn"),1200);
  }
  showBlinkResultFlash(ok);
  blinkMeta.innerHTML=ok
    ? `<div class="blink-finish-card ok"><div class="finish-title">20초 세트 완료</div><div class="finish-body">총 ${count}회 깜빡임 달성 · 눈이 촉촉해지는 좋은 습관이에요.</div><div class="finish-tip">다음 세트를 시작하려면 5초 쉬고 다시 진행해 주세요.</div></div>`
    : `<div class="blink-finish-card warn"><div class="finish-title">20초 세트 완료</div><div class="finish-body">총 ${count}회 깜빡임 기록 · 목표(12회)까지 조금만 더!</div><div class="finish-tip">어깨 힘을 빼고 천천히 완전 깜빡임으로 다시 도전해 보세요.</div></div>`;
}
function onBlinkDetected(){
  if(APP_STATE.app.currentGame==="blink"&&APP_STATE.blink.exerciseLocked)return;

  setTotalBlinkDetected(APP_STATE.blink.totalDetected+1);
  updateMetrics();
  triggerEmojiBlink();

  if(APP_STATE.blink.exerciseActive){
    setBlinkState({exerciseCount:APP_STATE.blink.exerciseCount+1});
    if(blinkCountLine)setText(blinkCountLine,COPY.blinkCount(APP_STATE.blink.exerciseCount));
    showBlinkFloat(APP_STATE.blink.exerciseCount);
    return;
  }

  showBlinkFloat(APP_STATE.blink.totalDetected);
}

function formatMMSS(sec){return typeof logic.formatMMSS==="function"?logic.formatMMSS(sec):"00:00";}
function clearTimers(){
  if(timerManager){
    timerManager.clearAll();
  }else{
    if(APP_STATE.blink.exerciseTimer)clearInterval(APP_STATE.blink.exerciseTimer);
    if(ruleInterval)clearInterval(ruleInterval);
    if(ruleTick)clearInterval(ruleTick);
    if(focusTimer)clearInterval(focusTimer);
    if(focusTick)clearInterval(focusTick);
    if(APP_STATE.acuity.questionTimer)clearInterval(APP_STATE.acuity.questionTimer);
  }
  APP_STATE.blink.exerciseTimer=ruleInterval=ruleTick=focusTimer=focusTick=APP_STATE.acuity.questionTimer=null;
  setBlinkState({exerciseActive:false});
  setGazeState({exerciseActive:false});
  setCircleState({active:false});
  setAcuityState({active:false});
}
function resetExerciseState(){
  clearTimers();
  setBlinkState({exerciseLocked:false});

  if(blinkPanel)blinkPanel.classList.remove("set-done-ok","set-done-warn");
  if(circlePanel)circlePanel.classList.remove("set-done-ok","set-done-warn");
  if(acuityPanel)acuityPanel.classList.remove("set-done-ok","set-done-warn");
  if(optotypeWrapEl)optotypeWrapEl.classList.remove("set-done-ok","set-done-warn");
  if(emojiFace)emojiFace.classList.remove("session-finish-pop","finish-ok","finish-warn","gaze-step-success","focus-near","focus-far");

  if(APP_STATE.blink.resultFlashTimer)clearTimeout(APP_STATE.blink.resultFlashTimer);
  if(blinkResultFlashEl)blinkResultFlashEl.classList.add("hidden");

  setTotalBlinkDetected(0);
  updateMetrics();

  setBlinkState({exerciseCount:0});

  APP_STATE.gaze.sequence=[];
  setGazeState({
    stepIndex:0,
    holdMs:0,
    lastDirection:"",
    lastVibeTs:0,
    lastAnnouncedTarget:"",
    smoothX:0,
    smoothY:0,
    emojiPupilX:0,
    emojiPupilY:0,
    stableDirection:"CENTER",
    lastClassifiedDir:"CENTER",
    lastScore:0,
    nativeX:0,
    nativeY:0,
    nativeInit:false,
  });
  setAppState({lastDirectionTtsTs:0});

  try{
    if("speechSynthesis" in window)window.speechSynthesis.cancel();
  }catch(_){ }

  resetGazeCalibration();

  setCircleState({active:false,followMs:0,endShown:false});
  setAcuityState({active:false,round:0,score:0});

  if(blinkCountLine)setText(blinkCountLine,COPY.blinkCount(0));
  if(blinkTimeLine)setText(blinkTimeLine,COPY.timeLeft(20));
  updateBlinkCornerTime(20);

  setText(blinkMeta,"Ready");
  setText(gazeMeta,"Ready");
  if(circleMeta)setText(circleMeta,"Ready");
  setText(focusMeta,"Ready");
  setText(ruleMeta,"Waiting");
  setText(acuityMeta,"Ready");

  if(circleTrackArea)updateCircleTrackUi(0.45,0,0,0);

  if(acuityFxEl){
    acuityFxEl.classList.remove("show","ok","warn");
    setText(acuityFxEl,"");
  }
  if(acuityCountFxEl){
    acuityCountFxEl.classList.remove("show");
    setText(acuityCountFxEl,"0 / 12");
  }

  setText(statusEl,APP_STATE.camera.running?UI_LABELS.statusRecognizing:UI_LABELS.statusIdle);
}

function acuityAngle(dir){
  if(typeof acuityCore.angle==="function"){
    return acuityCore.angle(dir);
  }
  return 180;
}
function showAcuityFx(ok,msg){
  if(!acuityFxEl)return;
  acuityFxEl.classList.remove("show","ok","warn");
  acuityFxEl.textContent=msg;
  acuityFxEl.classList.add(ok?"ok":"warn");
  void acuityFxEl.offsetWidth;
  acuityFxEl.classList.add("show");
}
function showAcuityCountFx(round,total){
  if(!acuityCountFxEl)return;
  acuityCountFxEl.classList.remove("show");
  acuityCountFxEl.textContent=`${round} / ${total}`;
  void acuityCountFxEl.offsetWidth;
  acuityCountFxEl.classList.add("show");
}
function updateAcuityMeta(extra){
  const total=12;
  const remain=Math.max(0,Math.ceil((APP_STATE.acuity.deadlineTs-Date.now())/1000));
  const tail=extra?` | ${extra}`:"";
  acuityMeta.textContent=`성공 ${APP_STATE.acuity.score}/${total} · 시도 ${APP_STATE.acuity.round}${tail} · 남은 ${remain}초`;
}
function drawAcuityRound(){
  APP_STATE.acuity.direction=typeof acuityCore.nextDirection==="function"
    ? acuityCore.nextDirection(APP_STATE.acuity.direction,Math.random)
    : APP_STATE.acuity.direction;
  APP_STATE.acuity.size=typeof acuityCore.sizeByRound==="function"
    ? acuityCore.sizeByRound(APP_STATE.acuity.round)
    : APP_STATE.acuity.size;
  optotypeE.style.fontSize=`${APP_STATE.acuity.size}px`;
  optotypeE.style.transform=`rotate(${acuityAngle(APP_STATE.acuity.direction)}deg)`;
}
function finishAcuityGame(success){
  setAcuityState({active:false});
  if(APP_STATE.acuity.questionTimer)clearInterval(APP_STATE.acuity.questionTimer);
  APP_STATE.acuity.questionTimer=null;
  const total=12;
  if(success){
    if(optotypeWrapEl){optotypeWrapEl.classList.remove("set-done-warn","set-done-ok");void optotypeWrapEl.offsetWidth;optotypeWrapEl.classList.add("set-done-ok");}
    showAcuityFx(true,"성공 완료 · 눈 건강 습관이 잘 유지되고 있어요");
    acuityMeta.innerHTML=`<span class="ok"><strong>성공 완료</strong><br/>12개를 모두 달성했습니다.<br/>좋은 집중 습관이 눈 피로 관리에 도움됩니다.</span>`;
    return;
  }
  if(optotypeWrapEl){optotypeWrapEl.classList.remove("set-done-ok","set-done-warn");void optotypeWrapEl.offsetWidth;optotypeWrapEl.classList.add("set-done-warn");}
  showAcuityFx(false,`미달성 인터랙션 · ${APP_STATE.acuity.score}/${total}`);
  acuityMeta.innerHTML=`<span class="warn">미달성: 40초 내 12개를 맞추지 못했습니다 (${APP_STATE.acuity.score}/${total})</span>`;
}
function startAcuityGame(){
  setAcuityState({active:true,round:0,score:0,direction:"UP"});
  if(acuityPanel)acuityPanel.classList.remove("set-done-ok","set-done-warn");
  if(optotypeWrapEl)optotypeWrapEl.classList.remove("set-done-ok","set-done-warn");
  if(acuityFxEl){acuityFxEl.classList.remove("show","ok","warn");acuityFxEl.textContent="";}
  showAcuityCountFx(0,12);
  setAcuityState({deadlineTs:Date.now()+40000});
  if(APP_STATE.acuity.questionTimer)clearInterval(APP_STATE.acuity.questionTimer);
  const tickAcuity=()=>{
    if(!APP_STATE.acuity.active)return;
    const remain=APP_STATE.acuity.deadlineTs-Date.now();
    updateAcuityMeta();
    if(remain<=0)finishAcuityGame(false);
  };
  setAcuityState({questionTimer:timerManager?timerManager.setInterval("acuity-question",tickAcuity,120):setInterval(tickAcuity,120)});
  drawAcuityRound();
  updateAcuityMeta("시작");
}
function answerAcuity(answer){
  if(!APP_STATE.acuity.active){
    setText(acuityMeta,COPY.acuityNotStarted);
    return;
  }

  const correct=answer===APP_STATE.acuity.direction;
  const nextRound=APP_STATE.acuity.round+1;
  const nextScore=correct?APP_STATE.acuity.score+1:APP_STATE.acuity.score;
  setAcuityState({round:nextRound,score:nextScore});

  optotypeE.classList.remove("acuity-hit","acuity-miss");
  void optotypeE.offsetWidth;
  optotypeE.classList.add(correct?"acuity-hit":"acuity-miss");

  showAcuityCountFx(APP_STATE.acuity.score,12);
  showAcuityFx(correct,(correct?COPY.correctFx:COPY.wrongFx)+APP_STATE.acuity.score+"/12");

  if(APP_STATE.acuity.score>=12){
    finishAcuityGame(true);
    return;
  }

  drawAcuityRound();
  updateAcuityMeta(correct?COPY.correct:COPY.wrong);
}

async function startCamera(){
  if(APP_STATE.camera.running)return true;

  if(IS_NATIVE_WEBVIEW){
    setRunning(true);
    setPermissionHelp(false);
    setText(statusEl,UI_LABELS.statusNativeRecognizing);
    setText(startCameraBtn,UI_LABELS.statusNativeRecognizing);
    startCameraBtn.disabled=true;
    return true;
  }

  if(typeof Camera==="undefined"||typeof FaceMesh==="undefined"){
    setText(statusEl,COPY.mediapipeLoadFailed);
    return false;
  }

  setText(statusEl,COPY.cameraStarting);

  const onFrame=async()=>{await faceMesh.send({image:videoEl});};
  const camera=(typeof cameraOrchestrator.createCamera==="function")
    ? cameraOrchestrator.createCamera(videoEl,onFrame,640,480)
    : new Camera(videoEl,{onFrame:onFrame,width:640,height:480});

  try{
    await camera.start();
    setRunning(true);
    setPermissionHelp(false);
    setText(statusEl,UI_LABELS.statusRecognizing);
    setText(startCameraBtn,COPY.cameraRunning);
    startCameraBtn.disabled=true;
    return true;
  }catch(err){
    const msg=String(err?.message||"");
    if(err?.name==="NotAllowedError"||/not allowed|denied/i.test(msg)){
      setText(statusEl,COPY.cameraPermissionDenied);
      setPermissionHelp(true,getPermissionGuide());
    }else{
      setText(statusEl,COPY.cameraStartFailed);
      setPermissionHelp(true,getPermissionGuide());
    }
    console.error(err);
    return false;
  }
}

async function startBlinkExercise(){
  if(!APP_STATE.camera.running){
    setText(blinkMeta,COPY.cameraStarting);
    const ok=await startCamera();
    if(!ok||!APP_STATE.camera.running){
      setText(blinkMeta,COPY.allowCameraAndRetry);
      return;
    }
  }

  setBlinkState({exerciseLocked:false});

  if(blinkPanel)blinkPanel.classList.remove("set-done-ok","set-done-warn");
  if(emojiFace)emojiFace.classList.remove("session-finish-pop","finish-ok","finish-warn","gaze-step-success");

  if(APP_STATE.blink.resultFlashTimer)clearTimeout(APP_STATE.blink.resultFlashTimer);
  if(blinkResultFlashEl)blinkResultFlashEl.classList.add("hidden");

  setBlinkState({exerciseActive:true,exerciseCount:0,exerciseEndTs:Date.now()+20000});

  if(blinkCountLine)setText(blinkCountLine,COPY.blinkCount(0));
  if(blinkTimeLine)setText(blinkTimeLine,COPY.timeLeft(20));
  updateBlinkCornerTime(20);
  setText(blinkMeta,COPY.inProgress);

  if(APP_STATE.blink.exerciseTimer)clearInterval(APP_STATE.blink.exerciseTimer);

  const blinkTick=()=>{
    const sec=typeof blinkCore.remainSeconds==="function"
      ? blinkCore.remainSeconds(APP_STATE.blink.exerciseEndTs,Date.now())
      : Math.max(0,Math.ceil((APP_STATE.blink.exerciseEndTs-Date.now())/1000));

    if(blinkTimeLine)setText(blinkTimeLine,COPY.timeLeft(sec));
    updateBlinkCornerTime(sec);

    if(sec>0)return;

    if(APP_STATE.blink.exerciseTimer)clearInterval(APP_STATE.blink.exerciseTimer);
    setBlinkState({exerciseTimer:null,exerciseActive:false,exerciseLocked:true});

    const ok=typeof blinkCore.isGoalMet==="function"
      ? blinkCore.isGoalMet(APP_STATE.blink.exerciseCount,12)
      : APP_STATE.blink.exerciseCount>=12;
    triggerBlinkCompleteFx(ok,APP_STATE.blink.exerciseCount);
  };

  const exerciseTimer=timerManager
    ? timerManager.setInterval("blink-exercise",blinkTick,200)
    : setInterval(blinkTick,200);
  setBlinkState({exerciseTimer});
}

function makeGazeSequence(){return typeof logic.makeGazeSequence==="function"?logic.makeGazeSequence(Math.random,10):["LEFT","RIGHT","UP","DOWN","LEFT","RIGHT","UP","DOWN","LEFT","RIGHT"];} 
function dirLabel(dir){return typeof logic.dirLabel==="function"?logic.dirLabel(dir):"정면";} 
function isDirectionMatch(dir,gaze){return typeof logic.isDirectionMatch==="function"?logic.isDirectionMatch(dir,gaze,GAZE_CFG):false;} 
const CALIBRATION_POINTS=["CENTER","LEFT","RIGHT","UP","DOWN"];
const GAZE_CALIBRATION_STORAGE_KEY="gaze_calibration_v1";
const GAZE_CALIBRATION_MAX_AGE_MS=1000*60*60*24*30;
const GAZE_CALIBRATION_STEP_MS=1500;
function calibrationLabel(dir){
  if(dir==="LEFT")return"왼쪽";
  if(dir==="RIGHT")return"오른쪽";
  if(dir==="UP")return"위";
  if(dir==="DOWN")return"아래";
  return"정면";
}
function resetGazeCalibration(){
  APP_STATE.gaze.calibrating=false;
  APP_STATE.gaze.calibrationStep=0;
  APP_STATE.gaze.calibrationHoldMs=0;
  APP_STATE.gaze.calibrationSamples=[];
}
function isValidCalibrationMap(map){
  if(!map||typeof map!=="object")return false;
  for(const key of CALIBRATION_POINTS){
    const p=map[key];
    if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
  }
  return true;
}
function saveGazeCalibrationToStorage(map){
  try{
    if(!isValidCalibrationMap(map))return;
    const payload={savedAt:Date.now(),map};
    localStorage.setItem(GAZE_CALIBRATION_STORAGE_KEY,JSON.stringify(payload));
  }catch(_){}
}
function clearGazeCalibrationStorage(){
  try{localStorage.removeItem(GAZE_CALIBRATION_STORAGE_KEY);}catch(_){}
}
function loadGazeCalibrationFromStorage(){
  try{
    const raw=localStorage.getItem(GAZE_CALIBRATION_STORAGE_KEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw);
    if(!parsed||!parsed.map||!Number.isFinite(parsed.savedAt))return null;
    if(Date.now()-parsed.savedAt>GAZE_CALIBRATION_MAX_AGE_MS)return null;
    if(!isValidCalibrationMap(parsed.map))return null;
    return parsed.map;
  }catch(_){
    return null;
  }
}
function beginGazeCalibration(){
  resetGazeCalibration();
  APP_STATE.gaze.calibrating=true;
  APP_STATE.gaze.calibrated=false;
  APP_STATE.gaze.calibrationMap=null;
  gazeMeta.textContent=`보정 시작: ${calibrationLabel("CENTER")}을 1.5초 바라봐 주세요 (1/5)`;
}
function pushCalibrationSample(gaze){
  APP_STATE.gaze.calibrationSamples.push({x:gaze.x,y:gaze.y});
  if(APP_STATE.gaze.calibrationSamples.length>48)APP_STATE.gaze.calibrationSamples.shift();
}
function finishCalibrationStep(stepDir){
  if(APP_STATE.gaze.calibrationSamples.length===0)return false;
  const mean=APP_STATE.gaze.calibrationSamples.reduce((acc,p)=>({x:acc.x+p.x,y:acc.y+p.y}),{x:0,y:0});
  mean.x/=APP_STATE.gaze.calibrationSamples.length;
  mean.y/=APP_STATE.gaze.calibrationSamples.length;
  if(!APP_STATE.gaze.calibrationMap)APP_STATE.gaze.calibrationMap={};
  APP_STATE.gaze.calibrationMap[stepDir]=mean;
  APP_STATE.gaze.calibrationSamples=[];
  APP_STATE.gaze.calibrationHoldMs=0;
  APP_STATE.gaze.calibrationStep+=1;
  if(APP_STATE.gaze.calibrationStep>=CALIBRATION_POINTS.length){
    APP_STATE.gaze.calibrating=false;
    APP_STATE.gaze.calibrated=true;
    saveGazeCalibrationToStorage(APP_STATE.gaze.calibrationMap);
    return true;
  }
  const nextDir=CALIBRATION_POINTS[APP_STATE.gaze.calibrationStep];
  gazeMeta.textContent=`보정: ${calibrationLabel(nextDir)}을 1.5초 바라봐 주세요 (${APP_STATE.gaze.calibrationStep+1}/5)`;
  return false;
}
function updateGazeCalibration(gaze,dt){
  if(!APP_STATE.gaze.calibrating)return false;
  const dir=CALIBRATION_POINTS[APP_STATE.gaze.calibrationStep]||"CENTER";
  pushCalibrationSample(gaze);
  APP_STATE.gaze.calibrationHoldMs+=dt;
  const sec=Math.max(0,(GAZE_CALIBRATION_STEP_MS-APP_STATE.gaze.calibrationHoldMs)/1000);
  gazeMeta.textContent=`보정: ${calibrationLabel(dir)} ${sec.toFixed(1)}초 (${APP_STATE.gaze.calibrationStep+1}/5)`;
  if(APP_STATE.gaze.calibrationHoldMs<GAZE_CALIBRATION_STEP_MS)return false;
  return finishCalibrationStep(dir);
}
function classifyCalibratedDirection(adjusted){
  const map=APP_STATE.gaze.calibrationMap;
  if(!map||!map.CENTER)return{dir:"CENTER",score:0};
  const keys=Object.keys(map);
  if(keys.length===0)return{dir:"CENTER",score:0};
  let best="CENTER",bestDist=Number.POSITIVE_INFINITY;
  keys.forEach((k)=>{
    const p=map[k];
    const dx=adjusted.x-p.x,dy=adjusted.y-p.y;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d<bestDist){bestDist=d;best=k;}
  });
  const center=map.CENTER;
  const cdx=adjusted.x-center.x,cdy=adjusted.y-center.y;
  const centerDist=Math.sqrt(cdx*cdx+cdy*cdy);
  const score=1-Math.min(1,bestDist/Math.max(centerDist,0.12));
  if(best!=="CENTER"&&score<0.12)return{dir:"CENTER",score:0};
  return{dir:best,score};
}
function isDirectionMatchCalibrated(targetDir,adjusted){
  const r=classifyCalibratedDirection(adjusted);
  APP_STATE.gaze.lastClassifiedDir=r.dir;
  APP_STATE.gaze.lastScore=r.score;
  return r.dir===targetDir&&r.score>=0.1;
}
async function requestGazeRecalibration(){
  if(!APP_STATE.camera.running){
    gazeMeta.textContent="카메라 시작 중...";
    const ok=await startCamera();
    if(!ok||!APP_STATE.camera.running){
      gazeMeta.textContent="카메라 권한을 허용한 뒤 다시 시도해 주세요";
      return;
    }
  }
  clearGazeCalibrationStorage();
  setGazeState({exerciseActive:true});
  setGazeState({stepIndex:0});
  setGazeState({holdMs:0});
  setGazeState({lastTs:performance.now()});
  setGazeState({lastAnnouncedTarget:""});
  setGazeState({lastClassifiedDir:"CENTER"});
  setGazeState({lastScore:0});
  beginGazeCalibration();
}
function triggerGazeStepSuccessFx(){
  if(!emojiFace)return;

  emojiFace.classList.remove("gaze-step-success");
  void emojiFace.offsetWidth;
  emojiFace.classList.add("gaze-step-success");

  if(APP_STATE.gaze.stepFxTimer)clearTimeout(APP_STATE.gaze.stepFxTimer);
  if(timerManager){
    APP_STATE.gaze.stepFxTimer=timerManager.setTimeout("gaze-step-fx",()=>emojiFace.classList.remove("gaze-step-success"),520);
  }else{
    APP_STATE.gaze.stepFxTimer=setTimeout(()=>emojiFace.classList.remove("gaze-step-success"),520);
  }

  const ua=navigator.userAgent||"";
  const isMobile=/Android|iPhone|iPad|iPod/i.test(ua);
  if(isMobile&&navigator.vibrate)navigator.vibrate(40);
}
async function startGazeExercise(){
  ensureDirectionAudio();

  if(!APP_STATE.camera.running){
    setText(gazeMeta,COPY.cameraStarting);
    const ok=await startCamera();
    if(!ok||!APP_STATE.camera.running){
      setText(gazeMeta,COPY.allowCameraAndRetry);
      return;
    }
  }

  setGazeState({exerciseActive:true});
  APP_STATE.gaze.sequence=makeGazeSequence();
  setGazeState({
    stepIndex:0,
    holdMs:0,
    lastTs:performance.now(),
    lastDirection:"",
    lastVibeTs:0,
    neutralX:0,
    neutralY:0,
    neutralReady:true,
    smoothX:0,
    smoothY:0,
    emojiPupilX:0,
    emojiPupilY:0,
    lastAnnouncedTarget:"",
    stableDirection:"CENTER",
    lastClassifiedDir:"CENTER",
    lastScore:0,
  });

  const cachedMap=loadGazeCalibrationFromStorage();
  if(cachedMap){
    APP_STATE.gaze.calibrationMap=cachedMap;
    APP_STATE.gaze.calibrated=true;
    resetGazeCalibration();
    setText(gazeMeta,"In progress · first target: "+dirLabel(APP_STATE.gaze.sequence[0])+" · 0.00/3.00s (1/10)");
    speakDirectionCue(APP_STATE.gaze.sequence[0]);
    setGazeState({lastAnnouncedTarget:APP_STATE.gaze.sequence[0]});
    return;
  }

  beginGazeCalibration();
}

function updateGazeExercise(gaze){
  if(!APP_STATE.gaze.exerciseActive||APP_STATE.gaze.stepIndex>=APP_STATE.gaze.sequence.length)return;

  const now=performance.now();
  const dt=clamp(now-APP_STATE.gaze.lastTs,0,120);
  setGazeState({lastTs:now});

  const adjusted={x:gaze.x*GAZE_CFG.gain.x,y:gaze.y*GAZE_CFG.gain.y};

  if(APP_STATE.gaze.calibrating){
    const done=updateGazeCalibration(adjusted,dt);
    if(!done)return;

    setGazeState({holdMs:0,stepIndex:0,lastAnnouncedTarget:APP_STATE.gaze.sequence[0]});
    setText(gazeMeta,"Target: "+dirLabel(APP_STATE.gaze.sequence[0])+" · 0.00/3.00s (1/10)");
    speakDirectionCue(APP_STATE.gaze.sequence[0]);
    return;
  }

  const target=APP_STATE.gaze.sequence[APP_STATE.gaze.stepIndex];
  if(target!==APP_STATE.gaze.lastAnnouncedTarget){
    speakDirectionCue(target);
    setGazeState({lastAnnouncedTarget:target});
  }

  const matched=APP_STATE.gaze.calibrated
    ? isDirectionMatchCalibrated(target,adjusted)
    : isDirectionMatch(target,adjusted);

  if(matched)setGazeState({holdMs:APP_STATE.gaze.holdMs+dt});

  const hold=(APP_STATE.gaze.holdMs/1000).toFixed(2);
  const detectedLabel=calibrationLabel(APP_STATE.gaze.lastClassifiedDir||"CENTER");
  setText(gazeMeta,"Target: "+dirLabel(target)+" · "+hold+"/3.00s ("+(APP_STATE.gaze.stepIndex+1)+"/10) | Detected: "+detectedLabel);

  if(APP_STATE.gaze.holdMs<3000)return;

  triggerGazeStepSuccessFx();
  const nextStep=APP_STATE.gaze.stepIndex+1;
  setGazeState({stepIndex:nextStep,holdMs:0});

  if(nextStep>=APP_STATE.gaze.sequence.length){
    setGazeState({exerciseActive:false});
    setHtml(gazeMeta,'<span class="ok">'+COPY.gazeDone+'</span>');
    return;
  }

  setText(gazeMeta,"Target: "+dirLabel(APP_STATE.gaze.sequence[nextStep])+" · 0.00/3.00s ("+(nextStep+1)+"/10)");
}

function updateCircleTrackUi(targetX,targetY,cursorX,cursorY){
  if(!circleTrackArea||!circleTarget||!circleCursor)return;
  const toPct=(v)=>`${(50+clamp(v,-1,1)*38).toFixed(2)}%`;
  circleTarget.style.left=toPct(targetX);
  circleTarget.style.top=toPct(targetY);
  circleCursor.style.left=toPct(cursorX);
  circleCursor.style.top=toPct(cursorY);
}
async function startCircleExercise(){
  if(!APP_STATE.camera.running){
    if(circleMeta)setText(circleMeta,COPY.cameraStarting);
    const ok=await startCamera();
    if(!ok||!APP_STATE.camera.running){
      if(circleMeta)setText(circleMeta,COPY.allowCameraAndRetry);
      return;
    }
  }

  const now=performance.now();
  setCircleState({
    active:true,
    startTs:now,
    lastTs:now,
    followMs:0,
    endShown:false,
    targetX:0.45,
    targetY:0,
  });

  if(circlePanel)circlePanel.classList.remove("set-done-ok","set-done-warn");
  updateCircleTrackUi(APP_STATE.circle.targetX,APP_STATE.circle.targetY,0,0);
  if(circleMeta)setText(circleMeta,"In progress · follow the circular target");
}

function updateCircleExercise(adjustedGaze){
  if(!APP_STATE.circle.active)return;

  const now=performance.now();
  const elapsed=now-APP_STATE.circle.startTs;
  const dt=clamp(now-APP_STATE.circle.lastTs,0,120);

  const angle=elapsed*(Math.PI*2/8000);
  const targetX=Math.cos(angle)*0.46;
  const targetY=Math.sin(angle)*0.34;

  const cursorX=clamp(adjustedGaze.x,-1,1);
  const cursorY=clamp(adjustedGaze.y,-1,1);

  const dx=cursorX-targetX;
  const dy=cursorY-targetY;
  const d=Math.sqrt(dx*dx+dy*dy);
  const followMs=(d<=APP_STATE.circle.threshold)?(APP_STATE.circle.followMs+dt):APP_STATE.circle.followMs;

  setCircleState({lastTs:now,targetX:targetX,targetY:targetY,followMs:followMs});

  const remain=Math.max(0,Math.ceil((APP_STATE.circle.durationMs-elapsed)/1000));
  const acc=(APP_STATE.circle.followMs/Math.max(1,elapsed))*100;

  updateCircleTrackUi(APP_STATE.circle.targetX,APP_STATE.circle.targetY,cursorX,cursorY);
  if(circleMeta)setText(circleMeta,"In progress · accuracy "+acc.toFixed(0)+"% · "+remain+"s left");

  if(elapsed<APP_STATE.circle.durationMs)return;

  setCircleState({active:false});
  if(APP_STATE.circle.endShown)return;
  setCircleState({endShown:true});

  const ok=acc>=55;
  if(circlePanel){
    circlePanel.classList.remove("set-done-ok","set-done-warn");
    void circlePanel.offsetWidth;
    circlePanel.classList.add(ok?"set-done-ok":"set-done-warn");
  }

  if(circleMeta){
    setHtml(circleMeta,ok
      ? '<span class="ok">Done · accuracy '+acc.toFixed(0)+'%</span>'
      : '<span class="warn">Done · accuracy '+acc.toFixed(0)+'% (try again)</span>'
    );
  }
}

function speakFocusCue(text){
  try{
    if(!("speechSynthesis" in window))return;
    const u=new SpeechSynthesisUtterance(text);
    u.lang="ko-KR";
    u.rate=.95;
    u.pitch=1.0;
    u.volume=.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }catch(_){}
}
function setFocusMotion(near){
  if(!emojiFace||APP_STATE.app.currentGame!=="focus")return;
  emojiFace.classList.remove("focus-near","focus-far");
  emojiFace.classList.add(near?"focus-near":"focus-far");
  mouthEl.style.width=near?"32%":"26%";
}
function renderFocusMeta(near,remainSec,phaseRemain){
  const phaseText=near?"가까운 물체 보기":"먼 물체 보기";
  focusMeta.innerHTML=`<span class="focus-phase ${near?"near":"far"}">${phaseText}</span> · 단계 ${Math.max(1,Math.ceil((60-remainSec)/10))}/6 · 단계 남은 ${phaseRemain}초 · 전체 남은 ${remainSec}초`;
}
function startFocusRoutine(){
  focusEndTs=Date.now()+60000;
  mouthEl.style.bottom="20%";
  let near=true;
  let phaseEndTs=Date.now()+10000;
  if(focusTimer)clearInterval(focusTimer);
  if(focusTick)clearInterval(focusTick);
  setFocusMotion(near);
  speakFocusCue("가까운 물체를 10초 동안 바라보세요.");
  const stepFocus=()=>{
    near=!near;
    phaseEndTs=Date.now()+10000;
    setFocusMotion(near);
    speakFocusCue(near?"가까운 물체를 바라보세요.":"먼 물체를 바라보세요.");
  };
  const tickFocus=()=>{
    const now=Date.now();
    const remainSec=Math.max(0,Math.ceil((focusEndTs-now)/1000));
    const phaseRemain=Math.max(0,Math.ceil((phaseEndTs-now)/1000));
    renderFocusMeta(near,remainSec,phaseRemain);
    if(remainSec<=0){
      if(focusTimer)clearInterval(focusTimer);
      if(focusTick)clearInterval(focusTick);
      focusTimer=null;
      focusTick=null;
      if(emojiFace)emojiFace.classList.remove("focus-near","focus-far");
      focusMeta.innerHTML=`<span class="ok">루틴 완료 (60초) · 눈이 한결 편안해졌어요</span>`;
    }
  };
  renderFocusMeta(near,60,10);
  focusTimer=timerManager?timerManager.setInterval("focus-step",stepFocus,10000):setInterval(stepFocus,10000);
  focusTick=timerManager?timerManager.setInterval("focus-tick",tickFocus,300):setInterval(tickFocus,300);
}
function startRuleReminder(intervalMs){
  if(ruleInterval)clearInterval(ruleInterval);
  if(ruleTick)clearInterval(ruleTick);

  const updateCountdown=()=>{
    const sec=Math.max(0,Math.ceil((ruleTargetTs-Date.now())/1000));
    setText(ruleMeta,COPY.nextBreak(formatMMSS(sec)));
  };

  const scheduleNext=()=>{
    ruleTargetTs=Date.now()+intervalMs;
    updateCountdown();
  };

  scheduleNext();
  ruleTick=setInterval(updateCountdown,1000);
  ruleInterval=setInterval(()=>{
    alert(COPY.ruleAlert);
    scheduleNext();
  },intervalMs);
}

const IS_NATIVE_WEBVIEW=typeof window!=="undefined"&&window.__NATIVE_SOURCE__==="react-native-webview";
let nativeFrameTs=0;
function applyNativeGazeFrame(frame){
  nativeFrameTs=Date.now();
  const conf=clamp(Number(frame?.confidence??0.5),0,1);
  if(conf<0.33){
    statusEl.textContent="네이티브 카메라 인식 중(신뢰도 낮음)";
    return;
  }
  const x=clamp(Number(frame?.gazeX)||0,-1,1);
  const y=clamp(Number(frame?.gazeY)||0,-1,1);
  const alpha=0.22+(conf*0.34);
  if(!APP_STATE.gaze.nativeInit){
    APP_STATE.gaze.nativeX=x;
    APP_STATE.gaze.nativeY=y;
    APP_STATE.gaze.nativeInit=true;
  }else{
    APP_STATE.gaze.nativeX=APP_STATE.gaze.nativeX+(x-APP_STATE.gaze.nativeX)*alpha;
    APP_STATE.gaze.nativeY=APP_STATE.gaze.nativeY+(y-APP_STATE.gaze.nativeY)*alpha;
  }
  setFaceVisible(true);
  const gaze={x:APP_STATE.gaze.nativeX,y:APP_STATE.gaze.nativeY};
  const adjusted={x:gaze.x*GAZE_CFG.gain.x,y:gaze.y*GAZE_CFG.gain.y};
  if(APP_STATE.app.currentGame==="gaze"||APP_STATE.app.currentGame==="circle")moveEmojiPupils(adjusted);
  let direction=gazeDirection(adjusted);
  if((APP_STATE.app.currentGame==="gaze"||APP_STATE.app.currentGame==="circle")&&APP_STATE.gaze.calibrated&&APP_STATE.gaze.calibrationMap){
    const cls=classifyCalibratedDirection(adjusted);
    APP_STATE.gaze.lastClassifiedDir=cls.dir;
    APP_STATE.gaze.lastScore=cls.score;
    direction=calibrationLabel(cls.dir);
  }
  gazeTextEl.textContent=`시선 방향: ${direction}`;
  if(APP_STATE.app.currentGame==="gaze"||APP_STATE.app.currentGame==="circle")vibrateOnGazeDirectionChange(direction);
  updateGazeExercise(gaze);
  if(APP_STATE.app.currentGame==="circle")updateCircleExercise(adjusted);
  if(APP_STATE.app.currentGame==="blink"&&frame?.blink){
    onBlinkDetected();
  }
  statusEl.textContent="네이티브 카메라 인식 중";
}
function handleNativeBridgeMessage(event){
  const raw=event?.data||event?.nativeEvent?.data;
  if(!raw||typeof raw!=="string")return;
  try{
    const msg=JSON.parse(raw);
    if(msg?.type==="NATIVE_GAZE_FRAME")applyNativeGazeFrame(msg.payload||{});
  }catch(_){}
}
if(IS_NATIVE_WEBVIEW){
  window.addEventListener("message",handleNativeBridgeMessage);
  document.addEventListener("message",handleNativeBridgeMessage);
}
const faceMesh=(typeof cameraOrchestrator.createFaceMesh==="function")
  ? cameraOrchestrator.createFaceMesh({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:.55,minTrackingConfidence:.55})
  : new FaceMesh({locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
if(typeof cameraOrchestrator.createFaceMesh!=="function"){
  faceMesh.setOptions({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:.55,minTrackingConfidence:.55});
}
function handleFaceMeshResults(results){
  if(IS_NATIVE_WEBVIEW&&Date.now()-nativeFrameTs<2500){
    return;
  }

  if(!results.multiFaceLandmarks||results.multiFaceLandmarks.length===0){
    setFaceVisible(false);
    gazeTextEl.textContent=`${UI_LABELS.gazeDirectionPrefix}: -`;
    clearOverlay();
    return;
  }

  setFaceVisible(true);
  const landmarks=results.multiFaceLandmarks[0];
  drawIrisGuides(landmarks);

  const leftEar=ear(landmarks,LEFT_EYE);
  const rightEar=ear(landmarks,RIGHT_EYE);
  const avgEar=(leftEar+rightEar)/2;

  if(!baselineEar)baselineEar=avgEar;
  else baselineEar=baselineEar*.96+avgEar*.04;
  updateThresholdsFromBaseline();

  const rawGaze=estimateGaze(landmarks);
  const smoothed=smoothGaze(rawGaze);
  const gaze=applyViewTransformToGaze(smoothed);
  const adjusted={x:gaze.x*GAZE_CFG.gain.x,y:gaze.y*GAZE_CFG.gain.y};
  const isGazeOrCircle=APP_STATE.app.currentGame==="gaze"||APP_STATE.app.currentGame==="circle";

  if(isGazeOrCircle)moveEmojiPupils(adjusted);

  let direction=gazeDirection(adjusted);
  if(isGazeOrCircle&&APP_STATE.gaze.calibrated&&APP_STATE.gaze.calibrationMap){
    const cls=classifyCalibratedDirection(adjusted);
    APP_STATE.gaze.lastClassifiedDir=cls.dir;
    APP_STATE.gaze.lastScore=cls.score;
    direction=calibrationLabel(cls.dir);
  }

  gazeTextEl.textContent=`${UI_LABELS.gazeDirectionPrefix}: ${direction}`;
  if(isGazeOrCircle)vibrateOnGazeDirectionChange(direction);

  updateGazeExercise(gaze);
  if(APP_STATE.app.currentGame==="circle")updateCircleExercise(adjusted);

  if(APP_STATE.app.currentGame==="blink"){
    if(!blinkCooldown&&!isClosed&&avgEar<closedThreshold){
      isClosed=true;
      setEmojiClosed(true);
    }else if(isClosed&&avgEar>openThreshold){
      isClosed=false;
      setEmojiClosed(false);
      blinkCooldown=true;
      onBlinkDetected();
      setTimeout(()=>{blinkCooldown=false;},COOLDOWN_MS);
    }
  }

  statusEl.textContent=UI_LABELS.statusRecognizing;
}

faceMesh.onResults(handleFaceMeshResults);
const APP_RUNTIME={listeners:[],initialized:false};
function on(target,type,handler,options){
  if(!target||typeof target.addEventListener!=="function")return;
  target.addEventListener(type,handler,options);
  APP_RUNTIME.listeners.push(()=>target.removeEventListener(type,handler,options));
}
// App lifecycle binding
function bindAppEvents(){
  document.querySelectorAll(".menu-btn[data-game]").forEach((btn)=>{
    on(btn,"click",()=>enterGame(btn.dataset.game));
  });
  on(startAppBtn,"click",()=>showView("home"));
  if(backIntroBtn)on(backIntroBtn,"click",()=>showView("intro"));
  if(hero){
    on(hero,"mousemove",applyHeroParallax);
    on(hero,"mouseleave",resetHeroParallax);
  }
  on(window,"scroll",()=>{resetHeroParallax();updateScrollProgress();},{passive:true});
  on(window,"resize",()=>{updateScrollProgress();resetHeroParallax();});
  on(backHomeBtn,"click",()=>{setCurrentGame(null);showView("home");clearTimers();setPermissionHelp(false);statusEl.textContent=APP_STATE.camera.running?"인식 중":"대기 중";});
  on(startCameraBtn,"click",startCamera);
  on(resetStateBtn,"click",resetExerciseState);
  on(blinkStartBtn,"click",startBlinkExercise);
  on(gazeStartBtn,"click",startGazeExercise);
  if(gazeRecalibrateBtn)on(gazeRecalibrateBtn,"click",requestGazeRecalibration);
  if(circleStartBtn)on(circleStartBtn,"click",startCircleExercise);
  on(focusStartBtn,"click",startFocusRoutine);
  on(ruleStartBtn,"click",()=>startRuleReminder(20*60*1000));
  on(acuityStartBtn,"click",startAcuityGame);
  on(acuityUpBtn,"click",()=>answerAcuity("UP"));
  on(acuityRightBtn,"click",()=>answerAcuity("RIGHT"));
  on(acuityDownBtn,"click",()=>answerAcuity("DOWN"));
  on(acuityLeftBtn,"click",()=>answerAcuity("LEFT"));
}

function disposeApp(){
  clearTimers();
  APP_RUNTIME.listeners.forEach((off)=>{try{off();}catch(_){ }});
  APP_RUNTIME.listeners=[];
  APP_RUNTIME.initialized=false;
}

function initApp(){
  if(APP_RUNTIME.initialized)return;
  APP_RUNTIME.initialized=true;
  bindAppEvents();
  setupReveal();
  setupHeroStory();
  setupMagnetic();
  setupMarketAppLink();
  setupAuth();
  updateScrollProgress();
  setTotalBlinkDetected(APP_STATE.blink.totalDetected);
  updateMetrics();
  loadDavichNews();
  on(window,"beforeunload",disposeApp);
}

initApp();











