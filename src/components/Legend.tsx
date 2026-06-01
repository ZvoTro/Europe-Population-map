import { PALETTE, LABELS } from '../lib/colours'

export default function Legend() {
  return (
    <div className="absolute bottom-8 left-4 bg-white rounded-xl shadow-lg p-4 z-10
                    text-xs font-sans min-w-[160px]">
      <p className="font-semibold text-gray-700 mb-2">Population change</p>
      <p className="text-gray-400 mb-3">2011 → 2021</p>
      <ul className="space-y-1">
        {LABELS.map((lbl, i) => (
          <li key={lbl} className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: PALETTE[i] }}
            />
            <span className="text-gray-600">{lbl}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-100">
          <span className="inline-block w-4 h-4 rounded-sm flex-shrink-0 bg-gray-300" />
          <span className="text-gray-400">No data</span>
        </li>
      </ul>
      <p className="text-gray-300 mt-3 text-[10px]">Source: Eurostat GISCO</p>
    </div>
  )
}
