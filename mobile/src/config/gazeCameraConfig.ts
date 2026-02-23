export const GAZE_CAMERA_CONFIG = {
  frameQuality: 0.14,
  trackLoopIntervalMs: 180,
  minFaceWidth: 110,
  minGazeConfidence: 0.4,
  calibrationReadySamples: 8,
  calibrationSlowdownSample: 18,
  calibrationAlphaEarly: 0.12,
  calibrationAlphaLate: 0.04,
  xCompensationGain: 1.22,
  yCompensationGain: 1.18,
} as const;
