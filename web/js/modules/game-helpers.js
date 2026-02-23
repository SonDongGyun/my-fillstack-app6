(function(root,factory){
  if(typeof module==="object"&&module.exports){
    module.exports=factory();
    return;
  }
  root.GameHelpers=factory();
})(typeof globalThis!=="undefined"?globalThis:window,function(){
  function create(options){
    const logic=options?.logic||{};
    const gazeCfg=options?.gazeCfg||{};
    const rand=typeof options?.rand==="function"?options.rand:Math.random;

    function makeGazeSequence(){
      if(typeof logic.makeGazeSequence==="function"){
        return logic.makeGazeSequence(rand,10);
      }
      return ["LEFT","RIGHT","UP","DOWN","LEFT","RIGHT","UP","DOWN","LEFT","RIGHT"];
    }

    function dirLabel(dir){
      return typeof logic.dirLabel==="function"?logic.dirLabel(dir):"Á¤¸é";
    }

    function isDirectionMatch(dir,gaze){
      return typeof logic.isDirectionMatch==="function"?logic.isDirectionMatch(dir,gaze,gazeCfg):false;
    }

    return{makeGazeSequence,dirLabel,isDirectionMatch};
  }

  return{create};
});
