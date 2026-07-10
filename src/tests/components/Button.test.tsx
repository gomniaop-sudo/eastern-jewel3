/**
 * Button Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../../components/ui/Button'

// Mock framer-motion so tests aren't blocked on animation library
vi.mock('framer-motion', () => ({
  motion: {
    button: vi.fn(({ children, disabled, 'aria-busy': ariaBusy, 'aria-label': ariaLabel, onClick, type, className }: Record<string, unknown>) => (
      <button
        disabled={disabled as boolean}
        aria-busy={ariaBusy as boolean}
        aria-label={ariaLabel as string}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        type={type as 'button' | 'submit' | 'reset'}
        className={className as string}
      >
        {children as React.ReactNode}
      </button>
    )),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled and shows sr-only text when loading', () => {
    render(<Button loading aria-label="Submit">Submit</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.getAttribute('aria-busy')).toBeTruthy()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders with type=submit', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('renders with aria-label', () => {
    render(<Button aria-label="Close dialog">×</Button>)
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
  })

  it('applies className', () => {
    render(<Button className="custom-class">Styled</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('defaults to type=button', () => {
    render(<Button>Default</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})
