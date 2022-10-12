import { useMemo } from 'react';
import { useRoutes, RouteObject as RRRouteObject } from 'react-router-dom';
import { lazy } from './route.js';
import { ErrorFallback } from './error.js';
import { ErrorBoundary, RouteObject } from '../index.js';

const lazifyRoutes = (routes: RouteObject[]): RRRouteObject[] => routes.map((route) => {
  // Remove webpack and module from route
  const {
    webpack, module, element, children, index, props, ...otherProps
  } = route;
  const Element = lazy(route);
  // we are ignoring index route as of now, as we are not supporting
  // post of data
  return {
    ...otherProps,
    element: <Element />,
    children: children?.length ? lazifyRoutes(children) : [],
  };
});

export const App: React.FC<{
  children?: React.ReactNode;
  routes: RouteObject[];
}> = ({ routes }) => {
  const loadableRoutes = useMemo(() => lazifyRoutes(routes), [JSON.stringify(routes)]);

  const routesEle = useRoutes(loadableRoutes);
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{routesEle}</ErrorBoundary>;
};
