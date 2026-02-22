import assert from "node:assert/strict";
import test from "node:test";
import { faceToGaze } from "../src/lib/faceToGaze";

test("faceToGaze maps yaw and eye landmarks", () => {
  const gaze = faceToGaze({
    bounds: {
      origin: { x: 100, y: 80 },
      size: { width: 200, height: 200 }
    },
    leftEyePosition: { x: 155, y: 150 },
    rightEyePosition: { x: 215, y: 150 },
    leftEyeOpenProbability: 0.9,
    rightEyeOpenProbability: 0.8,
    yawAngle: 20
  } as any);

  assert.ok(gaze.x > 0);
  assert.ok(gaze.y <= 0.9 && gaze.y >= -0.9);
  assert.equal(gaze.blink, false);
  assert.ok(gaze.confidence > 0.5);
});

test("faceToGaze marks blink when both eyes closed", () => {
  const gaze = faceToGaze({
    bounds: {
      origin: { x: 0, y: 0 },
      size: { width: 100, height: 100 }
    },
    leftEyeOpenProbability: 0.1,
    rightEyeOpenProbability: 0.2
  } as any);

  assert.equal(gaze.blink, true);
});
