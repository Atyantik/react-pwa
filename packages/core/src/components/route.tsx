import React, { lazy as reactLazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { DataContext } from './data.js';
import { RouteObject } from '../index.js';
import { ErrorFallback as DefaultErrorFallback } from './error.js';
import { HeadContext } from './head/context.js';

const DefaultFallbackComponent: React.FC<{}> = () => null;

export function lazy(props: RouteObject) {
  const LazyComponent = reactLazy(props.element);
  const ErrorFallback = props.error || DefaultErrorFallback;
  const FallbackComponent = props.skeleton || DefaultFallbackComponent;
  return class extends React.Component {
    resolver = {
      current: () => {},
    };

    // eslint-disable-next-line class-methods-use-this
    render() {
      if (props.resolveHeadManually && typeof window === 'undefined') {
        return (
          <DataContext.Consumer>
            {({ createDataPromise }) => (
              <HeadContext.Consumer>
                {({ setDataPromiseResolver }) => {
                  setDataPromiseResolver(this.resolver);
                  // Create data promise
                  createDataPromise(
                    'CustomHeadResolver',
                    () => new Promise((resolve) => {
                      // @ts-ignore
                      const headResolveTimeout = HeadResolveTimeout || 10000;
                      const timeout = setTimeout(() => {
                        // eslint-disable-next-line no-console
                        console.warn(
                          `WARN:: Forcefully resolving Head after waiting for ${headResolveTimeout}ms.`,
                        );
                        resolve(null);
                      }, headResolveTimeout);
                        //
                      this.resolver.current = () => {
                        clearTimeout(timeout);
                        resolve(null);
                      };
                    }),
                  );
                  return (
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Suspense fallback={<FallbackComponent />}>
                        <LazyComponent {...(props?.props ?? {})} />
                      </Suspense>
                    </ErrorBoundary>
                  );
                }}
              </HeadContext.Consumer>
            )}
          </DataContext.Consumer>
        );
      }
      // Wraps the input component in a container, without mutating it. Good!
      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackComponent />}>
            <LazyComponent {...(props?.props ?? {})} />
          </Suspense>
        </ErrorBoundary>
      );
    }
  };
}
