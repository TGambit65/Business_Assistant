import React, { memo, lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading fallback component
 */
export const LoadingFallback: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  </div>
);

/**
 * Error boundary for lazy loaded components
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <p className="text-destructive">Failed to load component</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Reload page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Create a lazy loaded component with error boundary and loading state
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  loadingText?: string
) {
  const LazyComponent = lazy(importFn);

  return memo((props: React.ComponentProps<T>) => (
    <LazyErrorBoundary>
      <Suspense fallback={<LoadingFallback text={loadingText} />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  ));
}

/**
 * Optimized list item component
 * Uses React.memo with custom comparison
 */
interface ListItemProps {
  id: string;
  data: any;
  onClick?: (id: string) => void;
  isSelected?: boolean;
}

export const OptimizedListItem = memo<ListItemProps>(
  ({ id, data, onClick, isSelected }) => {
    const handleClick = () => onClick?.(id);

    return (
      <div
        className={`p-4 border rounded cursor-pointer transition-colors ${
          isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
        }`}
        onClick={handleClick}
      >
        {/* Render your item content here */}
        <div>{JSON.stringify(data)}</div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    // Only re-render if these specific props change
    return (
      prevProps.id === nextProps.id &&
      prevProps.isSelected === nextProps.isSelected &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    );
  }
);

OptimizedListItem.displayName = 'OptimizedListItem';

/**
 * Virtual scrolling list component
 */
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T, index: number) => string;
}

export const VirtualList = memo(<T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  getItemKey
}: VirtualListProps<T>) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const scrollElementRef = React.useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={scrollElementRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={getItemKey(item, startIndex + index)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

/**
 * Intersection observer wrapper for lazy loading
 */
interface LazyLoadWrapperProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  threshold?: number | number[];
}

export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = memo(({
  children,
  placeholder = <div style={{ minHeight: 200 }} />,
  rootMargin = '100px',
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={containerRef}>
      {isVisible ? children : placeholder}
    </div>
  );
});

LazyLoadWrapper.displayName = 'LazyLoadWrapper';