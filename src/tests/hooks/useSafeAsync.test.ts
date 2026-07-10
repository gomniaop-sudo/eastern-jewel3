/**
 * Hook Tests: useSafeAsync, useDebounce, useThrottle, useInterval, useTimeout
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSafeAsync, useDebounce, useThrottle, useInterval, useTimeout } from '../../hooks/useSafeAsync'

describe('useSafeAsync', () => {
  it('returns isMounted()=true after mount', () => {
    const { result } = renderHook(() => useSafeAsync())
    expect(result.current.isMounted()).toBe(true)
  })

  it('returns isMounted()=false after unmount', () => {
    const { result, unmount } = renderHook(() => useSafeAsync())
    unmount()
    expect(result.current.isMounted()).toBe(false)
  })

  it('safeSetState calls setter when mounted', () => {
    const { result } = renderHook(() => useSafeAsync())
    const setter = vi.fn()
    act(() => {
      result.current.safeSetState('new value', setter)
    })
    expect(setter).toHaveBeenCalledWith('new value')
  })

  it('safeSetState does not call setter after unmount', () => {
    const { result, unmount } = renderHook(() => useSafeAsync())
    unmount()
    const setter = vi.fn()
    act(() => {
      result.current.safeSetState('new value', setter)
    })
    expect(setter).not.toHaveBeenCalled()
  })

  it('safeSetState works with function updater', () => {
    const { result } = renderHook(() => useSafeAsync())
    const setter = vi.fn()
    const updater = (prev: number) => prev + 1
    act(() => {
      result.current.safeSetState(updater, setter)
    })
    expect(setter).toHaveBeenCalledWith(updater)
  })
})

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('delays callback execution by specified delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounce(callback, 300))
    act(() => { result.current('arg1') })
    expect(callback).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(300) })
    expect(callback).toHaveBeenCalledWith('arg1')
  })

  it('cancels previous call when invoked again before delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounce(callback, 300))
    act(() => {
      result.current('first')
      result.current('second')
    })
    act(() => { vi.advanceTimersByTime(300) })
    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith('second')
  })

  it('cleans up timeout on unmount', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => useDebounce(callback, 300))
    act(() => { result.current('arg') })
    unmount()
    act(() => { vi.advanceTimersByTime(300) })
    expect(callback).not.toHaveBeenCalled()
  })

  it('allows callback after full delay has passed', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounce(callback, 300))
    act(() => { result.current('first') })
    act(() => { vi.advanceTimersByTime(300) })
    act(() => { result.current('second') })
    act(() => { vi.advanceTimersByTime(300) })
    expect(callback).toHaveBeenCalledTimes(2)
  })
})

describe('useThrottle', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('executes callback on first call immediately', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottle(callback, 300))
    act(() => { result.current('arg1') })
    expect(callback).toHaveBeenCalledWith('arg1')
  })

  it('throttles subsequent calls within delay window', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottle(callback, 300))
    act(() => {
      result.current('first')
      result.current('second') // within delay, throttled
    })
    expect(callback).toHaveBeenCalledOnce()
  })

  it('allows next call after delay window passes', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottle(callback, 300))
    act(() => { result.current('first') })
    act(() => { vi.advanceTimersByTime(300) })
    act(() => { result.current('second') })
    expect(callback).toHaveBeenCalledTimes(2)
  })
})

describe('useInterval', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls callback at each interval', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, 1000))
    act(() => { vi.advanceTimersByTime(3000) })
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('does not call callback when delay is null', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, null))
    act(() => { vi.advanceTimersByTime(5000) })
    expect(callback).not.toHaveBeenCalled()
  })

  it('clears interval on unmount', () => {
    const callback = vi.fn()
    const { unmount } = renderHook(() => useInterval(callback, 1000))
    act(() => { vi.advanceTimersByTime(1000) })
    expect(callback).toHaveBeenCalledTimes(1)
    unmount()
    act(() => { vi.advanceTimersByTime(3000) })
    expect(callback).toHaveBeenCalledTimes(1)
  })
})

describe('useTimeout', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls callback after delay', () => {
    const callback = vi.fn()
    renderHook(() => useTimeout(callback, 2000))
    act(() => { vi.advanceTimersByTime(2000) })
    expect(callback).toHaveBeenCalledOnce()
  })

  it('does not call callback before delay', () => {
    const callback = vi.fn()
    renderHook(() => useTimeout(callback, 2000))
    act(() => { vi.advanceTimersByTime(1999) })
    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback when delay is null', () => {
    const callback = vi.fn()
    renderHook(() => useTimeout(callback, null))
    act(() => { vi.advanceTimersByTime(5000) })
    expect(callback).not.toHaveBeenCalled()
  })

  it('clears timeout on unmount', () => {
    const callback = vi.fn()
    const { unmount } = renderHook(() => useTimeout(callback, 2000))
    unmount()
    act(() => { vi.advanceTimersByTime(2000) })
    expect(callback).not.toHaveBeenCalled()
  })
})
