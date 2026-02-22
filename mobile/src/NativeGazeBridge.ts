import { clamp, smoothSample, type GazeSample } from "./lib/gazeMath";

export type NativeGazeFrame = {
  ts: number;
  gazeX: number;
  gazeY: number;
  blink: boolean;
  confidence: number;
};

export type NativeBridgeMessage =
  | { type: "NATIVE_READY" }
  | { type: "NATIVE_GAZE_FRAME"; payload: NativeGazeFrame }
  | { type: "NATIVE_ERROR"; payload: { message: string } };

type FrameListener = (frame: NativeGazeFrame) => void;

export class NativeGazeBridge {
  private timer: ReturnType<typeof setInterval> | null = null;
  private angle = 0;
  private listeners: FrameListener[] = [];
  private lastSample: GazeSample | null = null;

  constructor(
    private readonly now: () => number = () => Date.now(),
    private readonly alpha = 0.28
  ) {}

  pushSample(sample: GazeSample) {
    const bounded: GazeSample = {
      x: clamp(sample.x, -1, 1),
      y: clamp(sample.y, -1, 1),
      confidence: clamp(sample.confidence ?? 0.5, 0, 1),
      blink: !!sample.blink
    };
    this.lastSample = smoothSample(this.lastSample, bounded, this.alpha);
    const frame: NativeGazeFrame = {
      ts: this.now(),
      gazeX: this.lastSample.x,
      gazeY: this.lastSample.y,
      blink: this.lastSample.blink ?? false,
      confidence: this.lastSample.confidence ?? 0.5
    };
    this.listeners.forEach((fn) => fn(frame));
  }

  startMockStream() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.angle += Math.PI / 45;
      this.pushSample({
        x: Math.cos(this.angle) * 0.45,
        y: Math.sin(this.angle) * 0.3,
        blink: false,
        confidence: 0.8
      });
    }, 66);
  }

  stopMockStream() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  onFrame(listener: FrameListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
