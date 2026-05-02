import { useState } from 'react'
import { type AppToolUseBlock } from '../../types'

export function ToolUseBlockView({ block }: { block: AppToolUseBlock }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/20 border border-white/10 text-xs text-white/50 font-mono hover:text-white/70 hover:border-white/20 transition-all"
      >
        <span className="text-orange-300/70">⚙</span>
        {block.name}
        {block.result !== undefined && <span className="text-white/30 ml-0.5">✓</span>}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-0 z-101 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto w-150 max-h-[70vh] bg-black/80 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                <span className="text-sm font-mono text-white/70">
                  <span className="text-orange-300/80">⚙</span> {block.name}
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/30 hover:text-white/60 transition-colors text-lg leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Input</div>
                  <pre className="text-xs bg-black/30 rounded-lg p-3 overflow-x-auto text-white/60 font-mono">
                    {JSON.stringify(block.input, null, 2)}
                  </pre>
                </div>
                {block.result !== undefined && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Result</div>
                    <pre className="text-xs bg-black/30 rounded-lg p-3 overflow-x-auto text-white/60 font-mono">
                      {JSON.stringify(block.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
