const test=require("node:test");
const assert=require("node:assert/strict");

const {create}=require("../js/modules/calibration-storage.js");

function createMemoryStorage(){
  const map=new Map();
  return {
    getItem(key){ return map.has(key)?map.get(key):null; },
    setItem(key,value){ map.set(key,String(value)); },
    removeItem(key){ map.delete(key); },
  };
}

test("calibration storage save/load round trip",()=>{
  global.localStorage=createMemoryStorage();
  const storage=create({
    storageKey:"test_calib",
    maxAgeMs:1000,
    points:["CENTER","LEFT","RIGHT","UP","DOWN"],
  });

  const map={
    CENTER:{x:0,y:0},
    LEFT:{x:-0.3,y:0},
    RIGHT:{x:0.3,y:0},
    UP:{x:0,y:-0.2},
    DOWN:{x:0,y:0.2},
  };

  storage.save(map);
  const loaded=storage.load();
  assert.deepEqual(loaded,map);
});

test("calibration storage rejects invalid map",()=>{
  global.localStorage=createMemoryStorage();
  const storage=create({
    storageKey:"test_calib_invalid",
    maxAgeMs:1000,
    points:["CENTER","LEFT","RIGHT","UP","DOWN"],
  });

  storage.save({CENTER:{x:0,y:0}});
  const loaded=storage.load();
  assert.equal(loaded,null);
});
