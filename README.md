# ARKIENT Mobile Application

> **Tagline:** Everything that matters, together.

The frontend mobile application for **ARKIENT** is a React Native + TypeScript app powered by React Navigation and a centralized Design System.

---

## Repository Architecture

This folder is an **independent Git repository** (`mobile/.git`). It contains all screen components, navigation routers, theme tokens, and network abstractions.

---

## Tech Stack
- **Framework**: React Native with TypeScript
- **Tooling**: Expo SDK 52
- **Navigation**: React Navigation (Native Stack)
- **HTTP Client**: Axios abstraction (`src/services/api/client.ts`)
- **Offline Readiness**: Repository Abstraction (`src/repositories/BaseRepository.ts`)
- **Design Tokens**: Centralized visual theme (`src/theme/`)

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start Expo Metro Bundler
npx expo start -c

# Type-check code
npx tsc --noEmit
```

---

## Design System Tokens

All UI screens consume centralized design tokens from `src/theme/`:
- **Colors**: Primary (`#5B4BFF`), Surface (`#FFFFFF`), Text Primary (`#171827`), Background (`#F8F9FC`), Error (`#EF4444`).
- **Typography**: Inter font family hierarchy (`Display`, `H1`-`H3`, `Body`, `Caption`, `Button`).
- **Spacing**: 8px system tokens (`xs: 4` to `5xl: 48`).
- **Button Component**: `<Button variant="primary" label="Get Started" />`.
