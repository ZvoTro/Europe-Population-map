import { GridCell, } from '../types'
import { fmtPct, fmtPop, getColour } from '../lib/colours'

interface Props {
  cell: GridCell
  onClose: () => void
}

export default function CellPopup({ cell, onClose }: Props) {
  const colour = getColour(cell.pct_change)
  const change = cell.pct_change

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 min-w-[220px] text-sm font-sans">
      {/* header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">{cell.ctry_name || cell.cntr_id}</p>
          <p className="text-gray-400 text-xs">{cell.grd_id}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-gray-500 ml-4 text-lg leading-none"
        >×</button>
      </div>

      {/* change badge */}
      <div
        className="rounded-lg px-3 py-2 mb-3 text-center font-bold text-base"
        style={{ backgroundColor: colour + '33', color: colour }}
      >
        {fmtPct(change)}
      </div>

      {/* population rows */}
      <table className="w-full text-xs text-gray-600">
        <tbody>
          <tr className="border-b border-gray-50">
            <td className="py-1 text-gray-400">2011 population</td>
            <td className="py-1 text-right font-medium">{fmtPop(cell.tot_p_2011)}</td>
          </tr>
          <tr>
            <td className="py-1 text-gray-400">2021 population</td>
            <td className="py-1 text-right font-medium">{fmtPop(cell.tot_p_2021)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
