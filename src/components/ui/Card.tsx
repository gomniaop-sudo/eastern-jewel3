import { forwardRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered';
  hover?: boolean;
  children?: ReactNode;
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', hover = true, children }, ref) => {
    const baseStyles = 'relative overflow-hidden';

    const variants = {
      default: 'bg-luxury-dark',
      elevated: 'bg-luxury-dark shadow-2xl shadow-black/50',
      bordered: 'bg-luxury-dark border border-luxury-border',
    };

    const hoverStyles = hover ? 'hover:border-gold-500/30 transition-all duration-500' : '';

    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4 } : undefined}
        className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
