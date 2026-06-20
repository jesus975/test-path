import { useCallback, useEffect, useRef, useState } from 'react'
import './BatteryWidget.css'

/**
 * Charging battery widget.
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
  const thumbRef = useRef(null)

  const commit = useCallback(
    (next) => {
      const v = clamp(Math.round(next))
      if (!isControlled) setInternal(v)
      onChange?.(v)
    },
    [isControlled, onChange]
  )

  // Convert a pointer's clientX into a 0-100 percentage.
  // The thumb is wide, so its travel is (track width - thumb width); we map the
  // pointer to the thumb CENTER so the cursor tracks the thumb 1:1.
  const percentFromClientX = useCallback((clientX) => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    const thumbW = thumb ? thumb.offsetWidth : 0
    const usable = Math.max(1, rect.width - thumbW)
    const x = clientX - rect.left - thumbW / 2
    return clamp((x / usable) * 100)
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
      // Only react while a pointer is captured (i.e. mid-drag).
      if (!e.currentTarget.hasPointerCapture?.(e.pointerId)) return
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

  // min left = round((100 - percent) * 0.88)  — 75% -> 22 min, 100% -> 0.
  const minutesLeft = Math.round((100 - percent) * 0.88)
  const isFull = percent === 100

  // Glow opacity maps 0->100% to 0.15->0.9.
  const glowOpacity = 0.15 + (percent / 100) * (0.9 - 0.15)

  // Thumb travel in px is handled by the wrapper width; we position via percent
  // of the usable track using a CSS calc so the thumb edges never overflow.
  const thumbStyle = { left: `calc(${percent}% )`, transform: `translateX(-${percent}%)` }

  return (
    <div className="bw-card" style={{ '--bw-glow-opacity': glowOpacity }}>
      <div className="bw-glow" aria-hidden="true" />

      <div className="bw-content">
        <div className="bw-status">
          <BoltIcon />
          <span>{isFull ? 'Charged' : 'Charging…'}</span>
        </div>

        <div className="bw-readout">
          {isFull ? (
            <>
              <span className="bw-percent">100%</span>
              <span className="bw-sep"> · </span>
              <span className="bw-time">Fully charged</span>
            </>
          ) : (
            <>
              <span className="bw-percent">{percent}%</span>
              <span className="bw-sep"> · </span>
              <span className="bw-time">{minutesLeft} min left</span>
            </>
          )}
        </div>

        <div className="bw-slider">
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
            <div ref={thumbRef} className="bw-thumb" style={thumbStyle}>
              <span className="bw-thumb-grip" />
            </div>
          </div>

          <div className="bw-scale" aria-hidden="true">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
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
    <svg className="bw-bolt" width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true">
      <path d="M8.2 0 0 10.2h4.9L5.4 18 14 7.3H8.7L8.2 0Z" fill="currentColor" />
    </svg>
  )
}
