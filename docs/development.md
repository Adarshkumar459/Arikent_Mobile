# Mobile Development & Wireless Debugging Guide - ARKIENT

## Quick Start
```bash
cd mobile
npm install
npx expo start -c
```

---

## Wireless Debugging via Expo Go

1. Connect your physical phone and development PC to the **same local Wi-Fi network**.
2. Run `npx expo start -c`.
3. Scan the generated QR code using **Expo Go**.

---

## Network API Configuration

In `src/config/env.ts`, `API_BASE_URL` points to your laptop's local LAN IP (e.g. `http://192.168.1.7:5000/api/v1`) so your physical phone can reach the Node backend API.
