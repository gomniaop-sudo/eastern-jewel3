import { forwardRef, type ReactNode } from 'react';

interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children?: ReactNode;
  className?: string;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = '', size = 'lg', children }, ref) => {
    const sizes = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-8xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;
