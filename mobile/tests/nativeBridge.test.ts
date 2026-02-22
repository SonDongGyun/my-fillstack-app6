import assert from "node:assert/strict";
import test from "node:test";
import { NativeGazeBridge } from "../src/NativeGazeBridge";

test("NativeGazeBridge smooths pushed samples", () => {
  let now = 1000;
  const bridge = new NativeGazeBridge(() => now, 0.5);
  const frames: Array<{ x: number; y: number }> = [];
  bridge.onFrame((frame) => frames.push({ x: frame.gazeX, y: frame.gazeY }));

  bridge.pushSample({ x: 1, y: 1, confidence: 1 });
  now += 16;
  bridge.pushSample({ x: 0, y: 0, confidence: 1 });

  assert.equal(frames.length, 2);
  assert.equal(frames[0].x, 1);
  assert.equal(frames[1].x, 0.5);
  assert.equal(frames[1].y, 0.5);
});
