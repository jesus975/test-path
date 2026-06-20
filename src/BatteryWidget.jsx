import { useCallback, useRef, useState } from 'react'
import './BatteryWidget.css'

/**
 * Charging battery widget (Figma node 252:22).
 *
 * Controlled-or-uncontrolled: pass `value` + `onChange` to control it, or just
 * `defaultValue` to let it manage its own state.
 *
 * @param {number}   [defaultValue=75]  Initial charge (0-100) when uncontrolled.
 * @param {number}   [value]            Controlled charge (0-100). When provided, the
 *                                      component renders this value and calls onChange on drag.
 * @param {Function} [onChange]         Called with the new integer percentage on every change.
 */
export default function BatteryWidget({ defaultValue = 75, value, onChange }) {
  const isControlled = value != null
  const [internal, setInternal] = useState(clamp(defaultValue))
  const percent = clamp(isControlled ? value : internal)

  const trackRef = useRef(null)

  const commit = useCallback(
    (next) => {
      const v = clamp(Math.round(next))
      if (!isControlled) setInternal(v)
      onChange?.(v)
    },
    [isControlled, onChange]
  )

  // The white marker fills from the left edge, so the value maps linearly to the
  // pointer's x position across the full track width — 1:1 with the cursor.
  const percentFromClientX = useCallback((clientX) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    return clamp(((clientX - rect.left) / Math.max(1, rect.width)) * 100)
  }, [])

  const handlePointerDown = useCallback(
    (e) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture?.(e.pointerId)
      commit(percentFromClientX(e.clientX)) // click-to-jump
    },
    [commit, percentFromClientX]
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!e.currentTarget.hasPointerCapture?.(e.pointerId)) return // only mid-drag
      commit(percentFromClientX(e.clientX))
    },
    [commit, percentFromClientX]
  )

  const handlePointerUp = useCallback((e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }, [])

  const handleKeyDown = useCallback(
    (e) => {
      let next = percent
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          next = percent - (e.shiftKey ? 10 : 1)
          break
        case 'ArrowRight':
        case 'ArrowUp':
          next = percent + (e.shiftKey ? 10 : 1)
          break
        case 'PageDown':
          next = percent - 10
          break
        case 'PageUp':
          next = percent + 10
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = 100
          break
        default:
          return
      }
      e.preventDefault()
      commit(next)
    },
    [percent, commit]
  )

  // min left = round((100 - percent) * 0.88) — 75% -> 22 min, 100% -> 0.
  const minutesLeft = Math.round((100 - percent) * 0.88)
  const isFull = percent === 100

  // Glow opacity maps 0->100% to 0.15->0.9.
  const glowOpacity = 0.15 + (percent / 100) * (0.9 - 0.15)

  return (
    <div className="bw-card" style={{ '--bw-glow-opacity': glowOpacity }}>
      <div className="bw-glow" aria-hidden="true" />

      <div className="bw-top">
        <div className="bw-status">
          <BoltIcon />
          <span>Charging…</span>
        </div>
        <div className="bw-readout">
          {isFull ? '100% - Fully charged' : `${percent}% - ${minutesLeft} min left`}
        </div>
      </div>

      <div className="bw-bottom">
        <div className="bw-scale" aria-hidden="true">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>

        <div
          ref={trackRef}
          className="bw-track"
          role="slider"
          tabIndex={0}
          aria-label="Battery charge"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={isFull ? 'Fully charged' : `${percent}%, ${minutesLeft} minutes left`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
        >
          {/* White marker overlays the gray base; its width tracks the charge. */}
          <div className="bw-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  )
}

function clamp(n) {
  if (Number.isNaN(n)) return 0
  return Math.min(100, Math.max(0, n))
}

function BoltIcon() {
  return (
    <svg className="bw-bolt" width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true">
      <path
        d="M12.9 1.3 2.2 14.1c-.5.6-.1 1.5.7 1.5h6.2l-1.8 8.6c-.2.9 1 1.4 1.5.7L19.8 12c.5-.6.1-1.5-.7-1.5h-5.9l1.6-8.5c.2-.9-1-1.4-1.5-.7Z"
        fill="currentColor"
      />
    </svg>
  )
}
