import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  detectFacesAsync,
  FaceDetectorClassifications,
  FaceDetectorLandmarks,
  FaceDetectorMode,
  type FaceFeature,
} from "expo-face-detector";
import { faceToGaze } from "./lib/faceToGaze";
import { clamp } from "./lib/gazeMath";
import { GAZE_CAMERA_CONFIG } from "./config/gazeCameraConfig";

type Props = {
  active: boolean;
  onSample: (sample: { x: number; y: number; confidence: number; blink: boolean }) => void;
  onStatus: (status: string) => void;
};

type CalibrationState = {
  x: number;
  y: number;
  samples: number;
  ready: boolean;
};

function updateCalibration(calibration: CalibrationState, gaze: { x: number; y: number; confidence: number; blink: boolean }) {
  if (gaze.blink || gaze.confidence < 0.55) return;

  const alpha =
    calibration.samples < GAZE_CAMERA_CONFIG.calibrationSlowdownSample
      ? GAZE_CAMERA_CONFIG.calibrationAlphaEarly
      : GAZE_CAMERA_CONFIG.calibrationAlphaLate;

  calibration.x += (gaze.x - calibration.x) * alpha;
  calibration.y += (gaze.y - calibration.y) * alpha;
  calibration.samples += 1;
  calibration.ready = calibration.samples >= GAZE_CAMERA_CONFIG.calibrationReadySamples;
}

function toCompensatedSample(
  gaze: { x: number; y: number; confidence: number; blink: boolean },
  faceWidth: number,
  calibration: CalibrationState
) {
  const compensatedX = calibration.ready
    ? clamp((gaze.x - calibration.x) * GAZE_CAMERA_CONFIG.xCompensationGain, -1, 1)
    : gaze.x;
  const compensatedY = calibration.ready
    ? clamp((gaze.y - calibration.y) * GAZE_CAMERA_CONFIG.yCompensationGain, -1, 1)
    : gaze.y;
  const sizeConfidence = clamp(faceWidth / 220, 0.4, 1);
  const confidence = clamp(gaze.confidence * 0.8 + sizeConfidence * 0.2, 0.15, 1);

  return {
    x: compensatedX,
    y: compensatedY,
    confidence,
    blink: gaze.blink,
  };
}

function trackFace(
  face: FaceFeature,
  calibration: CalibrationState,
  onSample: Props["onSample"],
  onStatus: Props["onStatus"]
) {
  const faceWidth = face.bounds?.size?.width ?? 0;
  if (faceWidth < GAZE_CAMERA_CONFIG.minFaceWidth) {
    onStatus("face too far - move closer");
    return;
  }

  const gaze = faceToGaze(face);
  if (gaze.confidence < GAZE_CAMERA_CONFIG.minGazeConfidence) {
    onStatus("native camera low confidence");
    return;
  }

  updateCalibration(calibration, gaze);
  const sample = toCompensatedSample(gaze, faceWidth, calibration);
  onSample(sample);
  onStatus(`native camera tracking x:${sample.x.toFixed(2)} y:${sample.y.toFixed(2)} c:${sample.confidence.toFixed(2)}`);
}

export function NativeCameraGaze({ active, onSample, onStatus }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const cameraRef = useRef<any>(null);
  const busyRef = useRef(false);
  const stopRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calibrationRef = useRef<CalibrationState>({ x: 0, y: 0, samples: 0, ready: false });

  const detectorOptions = useMemo(
    () => ({
      mode: FaceDetectorMode.fast,
      detectLandmarks: FaceDetectorLandmarks.all,
      runClassifications: FaceDetectorClassifications.all,
      tracking: true,
      minDetectionInterval: 0,
    }),
    []
  );

  useEffect(() => {
    if (!active) return;
    if (!permission) return;
    if (permission.granted) return;
    requestPermission().catch(() => {
      onStatus("camera permission denied");
    });
  }, [active, onStatus, permission, requestPermission]);

  useEffect(() => {
    if (!active || !ready || !permission?.granted) return;
    stopRef.current = false;

    const tick = async () => {
      if (stopRef.current || busyRef.current) return;
      busyRef.current = true;

      try {
        const shot = await cameraRef.current?.takePictureAsync({
          quality: GAZE_CAMERA_CONFIG.frameQuality,
          skipProcessing: true,
          shutterSound: false,
        });

        if (!shot?.uri) {
          onStatus("camera frame unavailable");
          return;
        }

        const result = await detectFacesAsync(shot.uri, detectorOptions);
        const face = result.faces?.[0];
        if (!face) {
          onStatus("camera ready - no face");
          return;
        }

        trackFace(face, calibrationRef.current, onSample, onStatus);
      } catch {
        onStatus("native camera tracking error");
      } finally {
        busyRef.current = false;
        if (!stopRef.current) {
          timerRef.current = setTimeout(() => {
            void tick();
          }, GAZE_CAMERA_CONFIG.trackLoopIntervalMs);
        }
      }
    };

    void tick();
    return () => {
      stopRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, detectorOptions, onSample, onStatus, permission?.granted, ready]);

  if (!active) return null;

  if (!permission || !permission.granted) {
    return (
      <View style={styles.stateBox}>
        <Text style={styles.stateText}>Camera permission request in progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        mirror
        active={active}
        onCameraReady={() => {
          setReady(true);
          onStatus("camera ready");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 1,
    opacity: 0,
    overflow: "hidden",
  },
  camera: {
    width: 1,
    height: 1,
  },
  stateBox: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  stateText: {
    fontSize: 11,
    color: "#627ba0",
  },
});
