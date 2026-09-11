import type { Energy } from '../lib/types'
import { ENERGY_LABEL } from '../lib/types'
import { ENERGY_UI } from '../lib/colors'

export function EnergyChip({
  energy,
  onClick,
  size = 'sm',
}: {
  energy: Energy
  /** when provided, clicking downshifts the energy (pillar 2) */
  onClick?: () => void
  size?: 'xs' | 'sm'
}) {
  const ui = ENERGY_UI[energy]
  const pad = size === 'xs' ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'
  return (
    <button
      type="button"
      onClick={onClick}
      title={onClick ? 'Downshift energy' : ENERGY_LABEL[energy]}
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${pad} ${ui.chip} ${
        onClick ? 'cursor-pointer hover:brightness-95' : 'cursor-default'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ui.dot}`} />
      {ENERGY_LABEL[energy]}
    </button>
  )
}
