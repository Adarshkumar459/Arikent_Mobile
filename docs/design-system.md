# ARKIENT Mobile Design System Reference

The mobile app relies on centralized design tokens located in `src/theme/`.

---

## 1. Visual Color Tokens (`src/theme/colors.ts`)

- **Primary**: `#5B4BFF`
- **Primary Dark**: `#4338CA`
- **Primary Light**: `#EEF0FF`
- **Success**: `#16A34A`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`
- **Info**: `#3B82F6`
- **Background**: `#F8F9FC`
- **Surface**: `#FFFFFF`
- **Text Primary**: `#171827`
- **Text Secondary**: `#6B7280`
- **Text Disabled**: `#A1A1AA`
- **Border**: `#E5E7EB`

---

## 2. 8px Spacing System (`src/theme/spacing.ts`)

- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 20px
- `2xl`: 24px
- `3xl`: 32px
- `4xl`: 40px
- `5xl`: 48px

---

## 3. Corner Radius Tokens (`src/theme/radius.ts`)

- `xs`: 4
- `sm`: 8
- `md`: 12
- `lg`: 16
- `xl`: 20
- `2xl`: 24
- `full`: 9999

---

## 4. Button Component API (`src/components/buttons/Button.tsx`)

```tsx
<Button
  variant="primary" // primary | secondary | outline | ghost | danger
  state="default"   // default | pressed | disabled
  label="Get Started"
  onPress={() => console.log('Pressed')}
/>
```
