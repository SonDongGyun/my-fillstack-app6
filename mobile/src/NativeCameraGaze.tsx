import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, type CameraViewRef } from "expo-camera";
import {
  detectFacesAsync,
  FaceDetectorClassifications,
  FaceDetectorLandmarks,
  FaceDetectorMode
} from "expo-face-detector";
import { faceToGaze } from "./lib/faceToGaze";

type Props = {
  active: boolean;
  onSample: (sample: { x: number; y: number; confidence: number; blink: boolean }) => void;
  onStatus: (status: string) => void;
};

export function NativeCameraGaze({ active, onSample, onStatus }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const cameraRef = useRef<CameraViewRef>(null);
  const busyRef = useRef(false);
  const stopRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const detectorOptions = useMemo(
    () => ({
      mode: FaceDetectorMode.fast,
      detectLandmarks: FaceDetectorLandmarks.all,
      runClassifications: FaceDetectorClassifications.all,
      tracking: true,
      minDetectionInterval: 0
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
      if (stopRef.current) return;
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        const shot = await cameraRef.current?.takePicture({
          quality: 0.08,
          skipProcessing: true,
          shutterSound: false
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
        const gaze = faceToGaze(face);
        if (gaze.confidence < 0.33) {
          onStatus("native camera low confidence");
          return;
        }
        onSample(gaze);
        onStatus(`native camera tracking x:${gaze.x.toFixed(2)} y:${gaze.y.toFixed(2)}`);
      } catch {
        onStatus("native camera tracking error");
      } finally {
        busyRef.current = false;
        if (!stopRef.current) {
          timerRef.current = setTimeout(() => {
            void tick();
          }, 260);
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
    overflow: "hidden"
  },
  camera: {
    width: 1,
    height: 1
  },
  stateBox: {
    paddingHorizontal: 12,
    paddingBottom: 8
  },
  stateText: {
    fontSize: 11,
    color: "#627ba0"
  }
});
