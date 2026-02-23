(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.UiDom=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function setText(el,text){
    if(!el)return;
    el.textContent=String(text??"");
  }

  function setHtml(el,html){
    if(!el)return;
    el.innerHTML=String(html??"");
  }

  function addClasses(el,...classes){
    if(!el)return;
    el.classList.add(...classes.filter(Boolean));
  }

  function removeClasses(el,...classes){
    if(!el)return;
    el.classList.remove(...classes.filter(Boolean));
  }

  function toggleClass(el,className,enabled){
    if(!el||!className)return;
    el.classList.toggle(className,!!enabled);
  }

  return{setText,setHtml,addClasses,removeClasses,toggleClass};
});
