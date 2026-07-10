/**
 * Input Component Tests
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Input from '../../components/ui/Input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders a label when label prop is provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('associates label with input via htmlFor', () => {
    render(<Input label="Email" id="email-input" />)
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email-input')
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows error message with role=alert', () => {
    render(<Input error="This field is required" />)
    const errorEl = screen.getByRole('alert')
    expect(errorEl).toHaveTextContent('This field is required')
  })

  it('sets aria-invalid when error is provided', () => {
    render(<Input label="Name" error="Required" />)
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when no error', () => {
    render(<Input label="Name" />)
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows hint text when hint prop is provided and no error', () => {
    render(<Input hint="We'll never share your email" />)
    expect(screen.getByText("We'll never share your email")).toBeInTheDocument()
  })

  it('hides hint text when error is also present', () => {
    render(<Input hint="Hint text" error="Error text" />)
    expect(screen.queryByText('Hint text')).not.toBeInTheDocument()
    expect(screen.getByText('Error text')).toBeInTheDocument()
  })

  it('shows required asterisk when required', () => {
    render(<Input label="Password" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
    const input = screen.getByLabelText(/Password/i)
    expect(input).toHaveAttribute('aria-required', 'true')
  })

  it('accepts additional HTML input attributes', () => {
    render(<Input type="email" maxLength={100} placeholder="email@example.com" />)
    const input = screen.getByPlaceholderText('email@example.com')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('maxlength', '100')
  })
})
