import { forwardRef, type ReactNode } from 'react';

interface SectionProps {
  variant?: 'default' | 'dark' | 'gradient';
  children?: ReactNode;
  className?: string;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className = '', variant = 'default', children }, ref) => {
    const variants = {
      default: 'bg-luxury-black',
      dark: 'bg-luxury-dark',
      gradient: 'bg-gradient-to-b from-luxury-black via-luxury-dark to-luxury-black',
    };

    return (
      <section
        ref={ref}
        className={`py-16 md:py-24 lg:py-32 ${variants[variant]} ${className}`}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

export default Section;
