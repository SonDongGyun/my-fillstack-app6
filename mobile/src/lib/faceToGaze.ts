import { clamp } from "./gazeMath";
import type { FaceFeature } from "expo-face-detector";

export type FaceToGazeResult = {
  x: number;
  y: number;
  confidence: number;
  blink: boolean;
};

export function faceToGaze(face: FaceFeature): FaceToGazeResult {
  const bounds = face.bounds;
  const cx = bounds.origin.x + bounds.size.width / 2;
  const cy = bounds.origin.y + bounds.size.height / 2;

  const leftEye = face.leftEyePosition;
  const rightEye = face.rightEyePosition;

  const eyeX = leftEye && rightEye ? (leftEye.x + rightEye.x) / 2 : cx;
  const eyeY = leftEye && rightEye ? (leftEye.y + rightEye.y) / 2 : cy;
  const eyeDistance =
    leftEye && rightEye
      ? Math.max(1, Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y))
      : Math.max(1, bounds.size.width * 0.35);
  const nose = face.noseBasePosition;

  const relX = bounds.size.width > 0 ? (eyeX - cx) / bounds.size.width : 0;
  const relY = bounds.size.height > 0 ? (eyeY - cy) / bounds.size.height : 0;
  const noseRelX = nose ? (nose.x - eyeX) / eyeDistance : 0;
  const noseRelY = nose ? (nose.y - eyeY) / eyeDistance : 0;

  const yaw = (face.yawAngle ?? 0) / 35;
  const roll = (face.rollAngle ?? 0) / 40;
  const x = clamp(yaw * 0.55 + noseRelX * 0.95 + relX * 0.9, -0.95, 0.95);
  const y = clamp(relY * 1.1 + noseRelY * 0.55 + roll * 0.15, -0.95, 0.95);

  const leftOpen = face.leftEyeOpenProbability ?? 1;
  const rightOpen = face.rightEyeOpenProbability ?? 1;
  const eyeOpenScore = (leftOpen + rightOpen) / 2;
  const sizeScore = clamp(bounds.size.width / 170, 0.25, 1);
  const confidence = clamp(eyeOpenScore * 0.7 + sizeScore * 0.3, 0.15, 1);
  const blink = leftOpen < 0.35 && rightOpen < 0.35;

  return { x, y, confidence, blink };
}
