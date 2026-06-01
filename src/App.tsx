import { useState } from 'react'
import MapView  from './components/MapView'
import Sidebar  from './components/Sidebar'
import Legend   from './components/Legend'

export default function App() {
  const [activeCntr, setActiveCntr] = useState<string | null>(null)

  return (
    <div className="flex h-screen w-screen font-sans">
      {/* Left sidebar — country stats */}
      <Sidebar activeCntr={activeCntr} onSelectCountry={setActiveCntr} />

      {/* Map area */}
      <div className="relative flex-1">
        <MapView activeCntr={activeCntr} />
        <Legend />
      </div>
    </div>
  )
}
