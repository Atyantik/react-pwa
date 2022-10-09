import React, { lazy as reactLazy, ComponentType, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback as DefaultErrorFallback } from './error.js';

const DefaultFallbackComponent: React.FC<{}> = () => null;

export function lazy(props: {
  element: () => Promise<{ default: ComponentType<any> }>;
  skeleton?: ComponentType<any>;
  error?: ComponentType<any>;
}) {
  const LazyComponent = reactLazy(props.element);
  const ErrorFallback = props.error || DefaultErrorFallback;
  const FallbackComponent = props.skeleton || DefaultFallbackComponent;
  return class extends React.Component {
    // eslint-disable-next-line class-methods-use-this
    render() {
      // Wraps the input component in a container, without mutating it. Good!
      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackComponent />}>
            <LazyComponent />
          </Suspense>
        </ErrorBoundary>
      );
    }
  };
}
