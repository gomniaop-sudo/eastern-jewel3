import { forwardRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  'aria-label'?: string;
  'aria-busy'?: boolean;
  'aria-labelledby'?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, loading, disabled, type = 'button', onClick, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-luxury-black';

    const variants = {
      primary: 'bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light active:bg-luxury-gold-dark',
      secondary: 'bg-luxury-light text-white hover:bg-luxury-gray active:bg-luxury-dark',
      outline: 'border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-luxury-black',
      ghost: 'text-gold-500 hover:bg-luxury-light',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
      >
        {loading ? <span className="sr-only">{props['aria-label'] || 'Loading...'}</span> : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
