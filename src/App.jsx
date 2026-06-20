import { useState } from 'react'
import BatteryWidget from './BatteryWidget.jsx'

export default function App() {
  // Controlled usage: the parent owns `charge` and reacts to onChange.
  const [charge, setCharge] = useState(75)

  return (
    <div className="demo">
      <BatteryWidget value={charge} onChange={setCharge} />
      <p className="demo-readout">Parent state: {charge}%</p>
    </div>
  )
}
