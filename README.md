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

## Figma values (node 252:22)

The exact tokens were taken from the Figma Inspect panel and applied directly:

- Card background `#1A1A1A`, page background `#F2F2F2`
- Muted text (bolt, "Charging…", scale) `#767676`, readout `#FFFFFF`
- Slider: white fill `#FFFFFF`, remaining segment `#3C3C3C`
- Card 360×360, radius 56px; scale uses slashed-zero numerals; readout uses a hyphen ("75% - 22 min left")

All of these live as CSS custom properties at the top of
[`src/BatteryWidget.css`](src/BatteryWidget.css) (`--bw-bg`, `--bw-radius`, `--bw-muted`,
`--bw-rest`, `--bw-track-h`, etc.), so any further tweak is a one-line change.

## Files

- [`src/BatteryWidget.jsx`](src/BatteryWidget.jsx) — the component (self-contained).
- [`src/BatteryWidget.css`](src/BatteryWidget.css) — styles + design tokens.
- [`src/App.jsx`](src/App.jsx) — demo mount.
