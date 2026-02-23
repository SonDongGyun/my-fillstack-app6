import test from "node:test";
import assert from "node:assert/strict";
import { parseNativeWebCommand } from "../src/nativeWebBridge";

test("parseNativeWebCommand accepts known command types", () => {
  const start = parseNativeWebCommand(JSON.stringify({ type: "NATIVE_PUSH_START", payload: { intervalSeconds: 300 } }));
  const stop = parseNativeWebCommand(JSON.stringify({ type: "NATIVE_PUSH_STOP" }));
  const sync = parseNativeWebCommand(JSON.stringify({ type: "NATIVE_PUSH_SYNC" }));

  assert.equal(start?.type, "NATIVE_PUSH_START");
  assert.equal(stop?.type, "NATIVE_PUSH_STOP");
  assert.equal(sync?.type, "NATIVE_PUSH_SYNC");
});

test("parseNativeWebCommand rejects unknown or invalid payload", () => {
  assert.equal(parseNativeWebCommand(""), null);
  assert.equal(parseNativeWebCommand("not-json"), null);
  assert.equal(parseNativeWebCommand(JSON.stringify({ type: "UNKNOWN" })), null);
  assert.equal(parseNativeWebCommand(JSON.stringify({})), null);
});
