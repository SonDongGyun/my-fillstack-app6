import assert from "node:assert/strict";
import test from "node:test";
import { clamp, lerp, smoothSample } from "../src/lib/gazeMath";

test("clamp bounds value", () => {
  assert.equal(clamp(2, -1, 1), 1);
  assert.equal(clamp(-2, -1, 1), -1);
  assert.equal(clamp(0.4, -1, 1), 0.4);
});

test("lerp uses alpha and bounds alpha range", () => {
  assert.equal(lerp(0, 10, 0.5), 5);
  assert.equal(lerp(0, 10, 2), 10);
  assert.equal(lerp(0, 10, -1), 0);
});

test("smoothSample interpolates when previous exists", () => {
  const out = smoothSample(
    { x: 0, y: 0, confidence: 0.4, blink: false },
    { x: 1, y: -1, confidence: 0.8, blink: true },
    0.25
  );
  assert.equal(out.x, 0.25);
  assert.equal(out.y, -0.25);
  assert.equal(out.confidence, 0.8);
  assert.equal(out.blink, true);
});
