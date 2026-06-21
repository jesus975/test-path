import { useState } from 'react'
import BatteryWidget from './BatteryWidget.jsx'

export default function App() {
  // Controlled usage: the parent owns `charge` and reacts to onChange.
  const [charge, setCharge] = useState(75)

  return (
    <div className="demo">
      {/* Widget is built at native Figma size (720px); display it at 0.5 scale. */}
      <div className="widget-scale">
        <BatteryWidget value={charge} onChange={setCharge} />
      </div>
    </div>
  )
}
