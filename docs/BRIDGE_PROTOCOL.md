# Bridge Protocol

RN -> WebView 메시지 형식(JSON)

```json
{
  "type": "NATIVE_GAZE_FRAME",
  "payload": {
    "ts": 1739940000000,
    "gazeX": 0.12,
    "gazeY": -0.08,
    "blink": false,
    "confidence": 0.91
  }
}
```

## 필드

- `gazeX`: -1.0 ~ 1.0 (오른쪽 +)
- `gazeY`: -1.0 ~ 1.0 (아래 +)
- `blink`: 깜빡임 여부
- `confidence`: 0.0 ~ 1.0
- `ts`: epoch milliseconds

## 선택 메시지

초기화:

```json
{ "type": "NATIVE_READY" }
```

오류:

```json
{ "type": "NATIVE_ERROR", "payload": { "message": "..." } }
```

