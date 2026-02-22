# my-fullstack-app5

`my-fullstack-app4`와 분리된 새 하이브리드(React Native + WebView) 샘플 프로젝트입니다.

## 구조

- `mobile/`: React Native(Expo) 앱
- `web/`: WebView 안에서 실행되는 웹 페이지(브릿지 수신)
- `docs/`: 네이티브-웹 브릿지 프로토콜 문서

## 핵심 아이디어

- 카메라/동공 인식은 네이티브 모듈에서 수행
- 웹은 UI/게임 로직에 집중
- 네이티브에서 WebView로 `postMessage`로 좌표 전달

## web 실행

```bash
cd C:\develop\my-fullstack-app5\web
python -m http.server 5505
```

## mobile 실행

```bash
cd my-fullstack-app5/mobile
npm install
npm run start
```

`mobile/.env`에 아래처럼 넣으면 WebView 타겟을 바꿀 수 있습니다.

```env
EXPO_PUBLIC_WEB_URI=http://YOUR_PC_LAN_IP:5505/index.html
```

같은 Wi-Fi에서 휴대폰 Expo Go를 쓰는 경우 `127.0.0.1`이 아니라 PC의 LAN IP를 써야 합니다.

## web 확인

간단 정적 서버로 `my-fullstack-app5/web/index.html`을 띄우면 됩니다.
