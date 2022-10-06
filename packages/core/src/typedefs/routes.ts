import { RouteObject as RRRouteObject } from 'react-router-dom';
import { parse } from 'bowser';

export interface RouteObject extends Omit<Omit<RRRouteObject, 'element'>, 'children'> {
  element: () => Promise<{ default: React.ComponentType<any> }>;
  children?: RouteObject[];
  webpack?: string | number;
  module?: string;
  skeleton?: React.ComponentType<any>;
  error?: React.ComponentType<any>;
}

export type RoutesArgs = {
  getLocation: () => URL;
  browserDetect: Promise<() => ReturnType<typeof parse>>;
  userAgent: string;
  isbot: Promise<() => Boolean>;
};

export type Routes = RouteObject[] | (
  (args: RoutesArgs) => Promise<RouteObject[]>
) | ((args: RoutesArgs) => RouteObject[]);
