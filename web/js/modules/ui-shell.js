(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.EyeUiShell=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(deps){
    const {
      introView,homeView,gameView,evidenceSummarySection,
      hero,heroEmoji,newsStatus,newsList,marketAppLink,scrollProgress,
      kakaoLoginBtn,authUserBox,authNickname,logoutBtn,
      onAfterShowView,
    }=deps;

    function isMobileViewport(){return window.matchMedia("(max-width: 1100px)").matches;}

    function formatPublished(v){
      if(!v)return"";
      const d=new Date(v);
      return Number.isNaN(d.getTime())?String(v):d.toLocaleString("ko-KR");
    }

    async function loadDavichNews(){
      if(!newsStatus||!newsList)return;
      newsStatus.textContent="불러오는 중...";
      newsList.innerHTML="";
      try{
        const res=await fetch("/api/news/davich",{cache:"no-store"});
        const data=await res.json();
        const items=Array.isArray(data.items)?data.items:[];
        if(items.length===0){
          newsStatus.textContent="최신 기사를 불러오지 못했습니다.";
          return;
        }
        newsStatus.textContent="최신 기사 3건";
        items.slice(0,3).forEach((it,i)=>{
          const li=document.createElement("li");
          li.className="news-item";
          const a=document.createElement("a");
          a.className="news-title";
          a.href=it.url;
          a.target="_blank";
          a.rel="noopener noreferrer";
          a.textContent=`${i+1}. ${it.title}`;
          const p=document.createElement("p");
          p.className="news-summary";
          p.textContent=it.summary||"기사 요약 정보가 없습니다.";
          const m=document.createElement("div");
          m.className="news-meta";
          const publisherText=(it.publisher||"").trim();
          const publishedText=formatPublished(it.published_at);
          if(publisherText){
            const publisher=document.createElement("span");
            publisher.textContent=`언론사: ${publisherText}`;
            m.appendChild(publisher);
          }
          if(publishedText){
            const published=document.createElement("span");
            published.textContent=`작성시간: ${publishedText}`;
            m.appendChild(published);
          }
          li.appendChild(a);
          li.appendChild(p);
          if(m.children.length>0)li.appendChild(m);
          newsList.appendChild(li);
        });
      }catch(_){
        newsStatus.textContent="네트워크 상태를 확인해 주세요.";
      }
    }

    function showView(view){
      introView.classList.toggle("active",view==="intro");
      homeView.classList.toggle("active",view==="home");
      gameView.classList.toggle("active",view==="game");
      if(evidenceSummarySection)evidenceSummarySection.classList.toggle("hidden",view!=="game");
      if(view==="intro"){
        loadDavichNews();
        window.scrollTo({top:0,behavior:"smooth"});
      }
      if(typeof onAfterShowView==="function"){
        requestAnimationFrame(onAfterShowView);
      }
      requestAnimationFrame(()=>window.dispatchEvent(new Event("resize")));
    }

    function applyHeroParallax(e){
      if(isMobileViewport()||!hero||!heroEmoji)return;
      const r=hero.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      hero.style.transform=`rotateX(${(-y*2).toFixed(2)}deg) rotateY(${(x*2).toFixed(2)}deg)`;
      heroEmoji.style.transform=`translate(${(x*6).toFixed(1)}px, ${(y*5-window.scrollY*0.02).toFixed(1)}px)`;
    }

    function resetHeroParallax(){
      if(!hero||!heroEmoji)return;
      if(isMobileViewport()){
        hero.style.transform="";
        heroEmoji.style.transform="";
        return;
      }
      hero.style.transform="";
      heroEmoji.style.transform=`translateY(${-Math.min(10,window.scrollY*0.04)}px)`;
    }

    function updateScrollProgress(){
      if(!scrollProgress)return;
      const max=document.documentElement.scrollHeight-window.innerHeight;
      const p=max>0?Math.min(100,(window.scrollY/max)*100):0;
      scrollProgress.style.width=`${p}%`;
    }

    function setupHeroStory(){
      if(!hero||isMobileViewport())return;
      const cards=[...document.querySelectorAll(".intro-sections .card")];
      if(cards.length===0||!("IntersectionObserver" in window))return;
      const io=new IntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
          if(!entry.isIntersecting)return;
          const idx=cards.indexOf(entry.target);
          if(idx>=0)hero.dataset.stage=String(idx+1);
        });
      },{threshold:.55});
      cards.forEach((c)=>io.observe(c));
    }

    function setupMarketAppLink(){
      if(!marketAppLink)return;
      const ua=navigator.userAgent||"";
      const isiOS=/iPhone|iPad|iPod/i.test(ua),isAndroid=/Android/i.test(ua);
      if(isiOS){
        marketAppLink.href="https://www.gentlemonster.com/kr";
        marketAppLink.textContent="젠틀몬스터 공식 사이트 바로가기";
      }else if(isAndroid){
        marketAppLink.href="https://www.gentlemonster.com/kr";
        marketAppLink.textContent="젠틀몬스터 공식 사이트 바로가기";
      }else{
        marketAppLink.href="https://www.gentlemonster.com/kr";
        marketAppLink.textContent="젠틀몬스터 공식 사이트 바로가기";
      }
    }

    function setupReveal(){
      const els=[...document.querySelectorAll(".reveal")];
      if(!("IntersectionObserver" in window)){
        els.forEach((el)=>el.classList.add("in"));
        return;
      }
      const io=new IntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
          if(!entry.isIntersecting)return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },{threshold:.18});
      els.forEach((el,i)=>{
        el.style.transitionDelay=`${Math.min(i*.06,.22)}s`;
        io.observe(el);
      });
    }

    function setupMagnetic(){
      if(isMobileViewport())return;
      document.querySelectorAll(".magnetic").forEach((el)=>{
        el.addEventListener("mousemove",(e)=>{
          if(el.classList.contains("is-docked"))return;
          const r=el.getBoundingClientRect();
          const x=(e.clientX-r.left)/r.width-.5;
          const y=(e.clientY-r.top)/r.height-.5;
          el.style.transform=`translate(${(x*8).toFixed(1)}px, ${(y*8).toFixed(1)}px)`;
        });
        el.addEventListener("mouseleave",()=>{
          if(!el.classList.contains("is-docked"))el.style.transform="";
        });
      });
    }

    function updateAuthUI(user){
      if(!kakaoLoginBtn||!authUserBox||!authNickname)return;
      if(user){
        kakaoLoginBtn.classList.add("hidden");
        authUserBox.classList.remove("hidden");
        authNickname.textContent=`${user.nickname||"사용자"} 님`;
      }else{
        kakaoLoginBtn.classList.add("hidden");
        authUserBox.classList.add("hidden");
        authNickname.textContent="";
      }
    }

    async function fetchAuthMe(){
      try{
        const res=await fetch("/api/auth/me",{cache:"no-store"});
        const data=await res.json();
        if(data&&data.logged_in&&data.user){
          updateAuthUI(data.user);
          return;
        }
        updateAuthUI(null);
      }catch(_){
        updateAuthUI(null);
      }
    }

    function setupAuth(){
      if(logoutBtn)logoutBtn.addEventListener("click",()=>{window.location.href="/auth/logout";});
      fetchAuthMe();
    }

    return{
      showView,
      isMobileViewport,
      applyHeroParallax,
      resetHeroParallax,
      updateScrollProgress,
      setupHeroStory,
      setupMarketAppLink,
      setupReveal,
      setupMagnetic,
      setupAuth,
      loadDavichNews,
    };
  }

  return{create};
});
