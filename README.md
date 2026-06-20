# Charging Battery Widget

An interactive, accessible dark "Charging" battery widget — draggable pill slider,
live readout, and a bottom glow that intensifies with the charge.

```bash
npm install
npm run dev      # open http://localhost:5173
```

## Usage

```jsx
import { useState } from 'react'
import BatteryWidget from './src/BatteryWidget.jsx'

function Example() {
  const [charge, setCharge] = useState(75)
  return <BatteryWidget value={charge} onChange={setCharge} />
}

// Or uncontrolled — it manages its own state:
// <BatteryWidget defaultValue={40} onChange={(v) => console.log(v)} />
```

### Props

| Prop           | Type                  | Default | Description                                   |
| -------------- | --------------------- | ------- | --------------------------------------------- |
| `value`        | `number`              | —       | Controlled charge (0–100). Pair with `onChange`. |
| `defaultValue` | `number`              | `75`    | Initial charge when uncontrolled.             |
| `onChange`     | `(percent) => void`   | —       | Called with the new integer percent on change.|

## Behavior

- **Drag** the white thumb (mouse + touch via Pointer Events with capture); the thumb tracks the cursor 1:1.
- **Click** anywhere on the track to jump to that position.
- **Readout**: `minutesLeft = Math.round((100 - percent) * 0.88)` — 75% → "22 min left", 100% → "Fully charged".
- **Glow**: opacity scales `0.15 → 0.9` with the charge, animated via CSS transition.
- **Keyboard** (thumb focused): ←/↓ −1, →/↑ +1, Shift+Arrow / PageUp / PageDown ±10, Home → 0, End → 100.
- **A11y**: `role="slider"` with `aria-valuemin/max/now/text` and `aria-label="Battery charge"`; visible focus ring.

## Matching the Figma values

The Figma MCP was **not reachable in this environment** (no `get_design_context` /
`get_variable_defs` / `get_screenshot` tool, no logged-in browser, and the design URL is
private), so the exact tokens couldn't be pulled. The visual values were built from the
written spec and are all exposed as CSS custom properties at the top of
[`src/BatteryWidget.css`](src/BatteryWidget.css) — `--bw-bg`, `--bw-radius`, `--bw-text`,
`--bw-muted`, `--bw-track`, `--bw-thumb`, `--bw-thumb-w`, `--bw-track-h`, etc. Drop in the
real Figma hex/radius/font values there and the component matches without touching the JS.
```

## Files

- [`src/BatteryWidget.jsx`](src/BatteryWidget.jsx) — the component (self-contained).
- [`src/BatteryWidget.css`](src/BatteryWidget.css) — styles + design tokens.
- [`src/App.jsx`](src/App.jsx) — demo mount.
