import { useEffect, useState } from 'react'
import { CountryStat } from '../types'
import { fetchCountryStats } from '../lib/supabase'
import { fmtPct, fmtPop, getColour } from '../lib/colours'

interface Props {
  activeCntr: string | null
  onSelectCountry: (cntr_id: string | null) => void
}

export default function Sidebar({ activeCntr, onSelectCountry }: Props) {
  const [stats, setStats]   = useState<CountryStat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    fetchCountryStats()
      .then(d => setStats(d ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = stats.filter(s =>
    !search ||
    s.ctry_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.cntr_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-72 flex-shrink-0">
      {/* title */}
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-sm font-bold text-gray-800 leading-tight">
          European Population Change
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">2011 → 2021 · 10 km grid</p>
      </div>

      {/* search */}
      <div className="px-3 py-2 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search country…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5
                     focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* reset filter */}
      {activeCntr && (
        <button
          onClick={() => onSelectCountry(null)}
          className="mx-3 my-2 text-xs text-blue-500 hover:underline text-left"
        >
          ← Show all countries
        </button>
      )}

      {/* table */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-gray-400 p-4">Loading…</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-50 text-gray-400 font-medium">
              <tr>
                <th className="text-left px-3 py-2">Country</th>
                <th className="text-right px-2 py-2">2021</th>
                <th className="text-right px-3 py-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const active = activeCntr === s.cntr_id
                const colour = getColour(s.pct_change)
                return (
                  <tr
                    key={s.cntr_id}
                    onClick={() => onSelectCountry(active ? null : s.cntr_id)}
                    className={`cursor-pointer border-b border-gray-50 transition-colors
                      ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-3 py-2 font-medium text-gray-700 truncate max-w-[110px]">
                      {s.ctry_name || s.cntr_id}
                    </td>
                    <td className="px-2 py-2 text-right text-gray-500">
                      {fmtPop(s.pop_2021)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold"
                        style={{ color: colour }}>
                      {fmtPct(s.pct_change)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* footer */}
      <div className="p-3 border-t border-gray-100 text-[10px] text-gray-300">
        Eurostat GISCO · NaturalEarth · CartoDB Positron
      </div>
    </div>
  )
}
