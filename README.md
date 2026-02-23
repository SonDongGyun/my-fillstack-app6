# my-fullstack-app5

Hybrid (React Native + WebView) eye-health app project.

## Structure

- `mobile/`: React Native (Expo) app
- `web/`: Web app for browser and WebView
- `api/`: Vercel serverless endpoints

## Run

### Web

```bash
cd C:\\develop\\my-fullstack-app5\\web
python -m http.server 5505
```

### Mobile

```bash
cd C:\\develop\\my-fullstack-app5\\mobile
npm install
npm run start
```

`mobile/.env` example:

```env
EXPO_PUBLIC_WEB_URI=http://YOUR_PC_LAN_IP:5505/index.html
```

## Deployment

- web: Vercel
- mobile: Expo / native builds

## Web Push env vars (Vercel)

```env
VAPID_SUBJECT=mailto:admin@example.com
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```
