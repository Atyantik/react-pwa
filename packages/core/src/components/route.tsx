import React, { lazy as reactLazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { RouteObject } from '../index.js';
import { ErrorFallback as DefaultErrorFallback } from './error.js';
import { ReactPWAContext } from './reactpwa.js';

const DefaultFallbackComponent: React.FC<{}> = () => null;

export function lazy(props: RouteObject) {
  const LazyComponent = reactLazy(props.element);
  const ErrorFallback = props.error || DefaultErrorFallback;
  const FallbackComponent = props.skeleton || DefaultFallbackComponent;
  return class extends React.Component {
    // eslint-disable-next-line class-methods-use-this
    render() {
      return (
        <ReactPWAContext.Consumer>
          {({ setValue, getValue }) => {
            const lazyModules = getValue('lazyModules', new Set());
            props.module?.forEach((module) => lazyModules.add(module));
            setValue('lazyModules', lazyModules);

            const lazyWebpack = getValue('lazyWebpack', new Set());
            props.webpack?.forEach((webpackId) => lazyWebpack.add(webpackId));
            setValue('lazyWebpack', lazyWebpack);

            return (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackComponent />}>
                  <LazyComponent {...(props?.props ?? {})} />
                </Suspense>
              </ErrorBoundary>
            );
          }}
        </ReactPWAContext.Consumer>
      );
    }
  };
}
