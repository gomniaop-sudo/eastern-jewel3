import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

beforeAll(() => {
  // matchMedia mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })

  // IntersectionObserver mock
  class MockIntersectionObserver {
    observe = () => {}
    unobserve = () => {}
    disconnect = () => {}
    takeRecords = () => []
  }
  const win = window as unknown as Record<string, unknown>
  win.IntersectionObserver = MockIntersectionObserver

  // ResizeObserver mock
  class MockResizeObserver {
    observe = () => {}
    unobserve = () => {}
    disconnect = () => {}
  }
  win.ResizeObserver = MockResizeObserver

  // scrollTo mock
  window.scrollTo = () => {}

  // localStorage mock
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
      get length() {
        return Object.keys(store).length
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
    }
  })()
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

  // URL.createObjectURL mock
  if (!URL.createObjectURL) {
    URL.createObjectURL = () => 'blob:mock-url'
  }
  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = () => {}
  }
})
