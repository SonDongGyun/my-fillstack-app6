export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(prev: number, next: number, alpha: number): number {
  const a = clamp(alpha, 0, 1);
  return prev + (next - prev) * a;
}

export type GazeSample = {
  x: number;
  y: number;
  confidence?: number;
  blink?: boolean;
};

export function smoothSample(
  prev: GazeSample | null,
  next: GazeSample,
  alpha: number
): GazeSample {
  if (!prev) return next;
  return {
    x: lerp(prev.x, next.x, alpha),
    y: lerp(prev.y, next.y, alpha),
    confidence: next.confidence ?? prev.confidence ?? 0,
    blink: next.blink ?? false
  };
}
