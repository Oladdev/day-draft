import { useState } from 'react'
import { Plus, X, LayoutGrid, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { TaskCard } from '../components/TaskCard'

export function BoardView() {
  const boardColumns = useStore((s) => s.boardColumns)
  const tasks = useStore((s) => s.tasks)
  const addColumn = useStore((s) => s.addColumn)
  const removeColumn = useStore((s) => s.removeColumn)
  const moveTaskToColumn = useStore((s) => s.moveTaskToColumn)
  const addTask = useStore((s) => s.addTask)
  const setCapture = useStore((s) => s.setCapture)
  const user = useStore((s) => s.user)
  const setUserModalOpen = useStore((s) => s.setUserModalOpen)

  const [newColTitle, setNewColTitle] = useState('')
  const [addingCol, setAddingCol] = useState(false)
  const [inlineTaskInput, setInlineTaskInput] = useState<{ [colId: string]: string }>({})
  const [activeDragColId, setActiveDragColId] = useState<string | null>(null)
  const [mobileSelectedColId, setMobileSelectedColId] = useState<string>(
    boardColumns[0]?.id || 'inbox'
  )

  const defaultColId = boardColumns[0]?.id || 'inbox'

  const activeMobileCol =
    boardColumns.find((c) => c.id === mobileSelectedColId) || boardColumns[0]

  const handleDragOver = (colId: string, e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (activeDragColId !== colId) {
      setActiveDragColId(colId)
    }
  }

  const handleDragLeave = (colId: string) => {
    if (activeDragColId === colId) {
      setActiveDragColId(null)
    }
  }

  const handleDrop = (colId: string, e: React.DragEvent) => {
    e.preventDefault()
    setActiveDragColId(null)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      moveTaskToColumn(taskId, colId)
    }
  }

  const handleAddInlineTask = (colId: string) => {
    const text = inlineTaskInput[colId]?.trim()
    if (!text) return
    addTask({
      title: text,
      columnId: colId,
      priority: 'medium',
      status: colId === 'done' ? 'done' : 'todo',
    })
    setInlineTaskInput({ ...inlineTaskInput, [colId]: '' })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50/50 pb-16 lg:pb-0">
      {/* Header bar */}
      <header className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 py-3.5 shadow-xs shrink-0 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <LayoutGrid size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">Task Board</h2>
            <p className="text-[11px] font-medium text-slate-400">
              Drag or tap arrows to distribute workflow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User Account Trigger */}
          <button
            onClick={() => setUserModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 min-h-[36px]"
            title="User Profile & Settings"
            aria-label="User Profile & Settings"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white font-bold">
              {user?.avatarUrl || user?.name?.charAt(0).toUpperCase() || '👤'}
            </span>
            <span className="hidden sm:inline">{user?.name || 'Guest'}</span>
          </button>

          <button
            onClick={() => setCapture(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Sparkles size={14} className="text-amber-500" /> Fast Capture
          </button>

          {!addingCol ? (
            <button
              onClick={() => setAddingCol(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-colors"
            >
              <Plus size={15} /> Add Column
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                placeholder="Column name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newColTitle.trim()) {
                    addColumn(newColTitle)
                    setNewColTitle('')
                    setAddingCol(false)
                  }
                }}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                onClick={() => {
                  if (newColTitle.trim()) addColumn(newColTitle)
                  setNewColTitle('')
                  setAddingCol(false)
                }}
                className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Add
              </button>
              <button
                onClick={() => setAddingCol(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE SEGMENTED COLUMN SELECTOR (Auto-fit on phone screens) */}
      <div className="sm:hidden border-b border-slate-200 bg-white px-3 py-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {boardColumns.map((col) => {
            const isSelected = col.id === (activeMobileCol?.id || defaultColId)
            const colTaskCount = tasks.filter((t) => {
              if (t.columnId === col.id) return true
              if (!t.columnId && col.id === defaultColId) return true
              return false
            }).length

            return (
              <button
                key={col.id}
                onClick={() => setMobileSelectedColId(col.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{col.title}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {colTaskCount}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* MOBILE ACTIVE COLUMN VIEW (100% full width, auto-fitting cards) */}
      {activeMobileCol && (
        <div className="sm:hidden flex-1 overflow-y-auto p-4 space-y-3">
          {(() => {
            const col = activeMobileCol
            const colTasks = tasks
              .filter((t) => {
                if (t.columnId === col.id) return true
                if (!t.columnId && col.id === defaultColId) return true
                return false
              })
              .sort((a, b) => a.boardOrder - b.boardOrder)

            return (
              <div className="flex flex-col h-full space-y-3">
                {/* Inline Quick Add for Active Mobile Column */}
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
                  <input
                    type="text"
                    value={inlineTaskInput[col.id] || ''}
                    onChange={(e) =>
                      setInlineTaskInput({ ...inlineTaskInput, [col.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddInlineTask(col.id)
                    }}
                    placeholder={`+ Add task to ${col.title}...`}
                    className="w-full rounded-xl border border-transparent bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                  {inlineTaskInput[col.id]?.trim() && (
                    <button
                      onClick={() => handleAddInlineTask(col.id)}
                      className="rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-500 shrink-0 shadow-xs"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>

                {/* Mobile Tasks List */}
                <div className="space-y-2.5">
                  {colTasks.map((t) => (
                    <TaskCard key={t.id} task={t} showColumnMover={true} />
                  ))}

                  {colTasks.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
                      No tasks in {col.title}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* DESKTOP KANBAN COLUMNS CONTAINER (Multi-column view on tablet & desktop) */}
      <div className="hidden sm:flex flex-1 overflow-x-auto p-4 sm:p-6 select-none min-h-0">
        <div className="flex h-full gap-4 sm:gap-5 items-start">
          {boardColumns.map((col) => {
            // Include tasks with this columnId or tasks without valid columnId mapped to first column
            const colTasks = tasks
              .filter((t) => {
                if (t.columnId === col.id) return true
                if (!t.columnId && col.id === defaultColId) return true
                return false
              })
              .sort((a, b) => a.boardOrder - b.boardOrder)

            const isDragTarget = activeDragColId === col.id

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(col.id, e)}
                onDragLeave={() => handleDragLeave(col.id)}
                onDrop={(e) => handleDrop(col.id, e)}
                className={`flex max-h-full w-72 sm:w-80 shrink-0 flex-col rounded-3xl border transition-all duration-150 p-3 shadow-xs ${
                  isDragTarget
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 bg-slate-100/70'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {col.title}
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                      {colTasks.length}
                    </span>
                  </div>

                  {boardColumns.length > 1 && (
                    <button
                      onClick={() => removeColumn(col.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600 transition-colors"
                      title="Remove column"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Task Cards List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 py-1 px-0.5">
                  {colTasks.map((t) => (
                    <TaskCard key={t.id} task={t} showColumnMover={true} />
                  ))}

                  {colTasks.length === 0 && (
                    <div
                      className={`py-12 text-center text-xs rounded-2xl border-2 border-dashed transition-colors ${
                        isDragTarget
                          ? 'border-emerald-400 text-emerald-800 bg-emerald-50'
                          : 'border-slate-200 text-slate-400 bg-white/50'
                      }`}
                    >
                      Drop tasks here
                    </div>
                  )}
                </div>

                {/* Inline Quick Add Task */}
                <div className="mt-2 pt-2.5 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={inlineTaskInput[col.id] || ''}
                      onChange={(e) =>
                        setInlineTaskInput({ ...inlineTaskInput, [col.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddInlineTask(col.id)
                      }}
                      placeholder={`+ Add task to ${col.title}...`}
                      className="w-full rounded-xl border border-transparent bg-white px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {inlineTaskInput[col.id]?.trim() && (
                      <button
                        onClick={() => handleAddInlineTask(col.id)}
                        className="rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-500 shrink-0 shadow-xs"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
