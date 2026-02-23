const test=require("node:test");
const assert=require("node:assert/strict");

const uiDom=require("../js/modules/ui-dom.js");

test("ui-dom setText/setHtml handle nullish values",()=>{
  const el={textContent:"",innerHTML:""};
  uiDom.setText(el,null);
  assert.equal(el.textContent,"");

  uiDom.setHtml(el,0);
  assert.equal(el.innerHTML,"0");
});

test("ui-dom class helpers add/remove/toggle safely",()=>{
  const classes=new Set();
  const el={
    classList:{
      add:(...names)=>names.forEach((n)=>classes.add(n)),
      remove:(...names)=>names.forEach((n)=>classes.delete(n)),
      toggle:(name,enabled)=>{if(enabled)classes.add(name);else classes.delete(name);},
    },
  };

  uiDom.addClasses(el,"a",null,"b");
  assert.equal(classes.has("a"),true);
  assert.equal(classes.has("b"),true);

  uiDom.removeClasses(el,"a");
  assert.equal(classes.has("a"),false);

  uiDom.toggleClass(el,"x",true);
  assert.equal(classes.has("x"),true);
  uiDom.toggleClass(el,"x",false);
  assert.equal(classes.has("x"),false);
});


test("ui-dom ignores null element inputs",()=>{
  assert.doesNotThrow(()=>uiDom.setText(null,"x"));
  assert.doesNotThrow(()=>uiDom.setHtml(null,"<b>x</b>"));
  assert.doesNotThrow(()=>uiDom.addClasses(null,"x"));
  assert.doesNotThrow(()=>uiDom.removeClasses(null,"x"));
  assert.doesNotThrow(()=>uiDom.toggleClass(null,"x",true));
});
