import { parse } from 'bowser';
import { ReactElement } from 'react';
import { RouteObject as RRRouteObject } from 'react-router-dom';
import { IWebManifest } from './typedefs/webmanifest.js';

export { DataContext } from './components/data.js';
export { useData } from './hooks/useData.js';
export { useSyncData } from './hooks/useSyncData.js';
export { SyncDataScript as SyncData } from './components/sync-data-script.js';
export {
  Outlet,
  Link,
  useLocation,
  useParams,
  useSearchParams,
  useHref,
  useMatch,
  useMatches,
  useNavigate,
  useNavigation,
  useNavigationType,
  useOutlet,
  useResolvedPath,
  useRoutes,
  useInRouterContext,
  useLinkClickHandler,
} from 'react-router-dom';
export { useCookies } from 'react-cookie';
export * from 'react-error-boundary';
export { Head } from './components/head/index.js';
export { HttpStatus } from './components/http-status.js';
export { Redirect } from './components/redirect.js';

export type RoutesArgs = {
  getLocation: () => URL;
  browserDetect: () => Promise<ReturnType<typeof parse>>;
  userAgent: string;
  isbot: () => Promise<Boolean>;
  getScoped: <T = any>(
    key: string,
    callback: (() => any) | (() => Promise<any>),
  ) => Promise<T>;
  addToHeadPreStyles: (components: ReactElement | ReactElement[]) => void;
  addToFooter: (components: ReactElement | ReactElement[]) => void;
  addHeaders: (headers: Headers) => void;
};

export type Routes =
  | RouteObject[]
  | ((args: RoutesArgs) => Promise<RouteObject[]>)
  | ((args: RoutesArgs) => RouteObject[]);

export interface RouteObject
  extends Omit<Omit<RRRouteObject, 'element'>, 'children'> {
  element: () => Promise<{ default: React.ComponentType<any> }>;
  children?: RouteObject[];
  webpack?: (string | number)[];
  module?: string[];
  skeleton?: React.ComponentType<any>;
  error?: React.ComponentType<any>;
  props?: Record<string, any>;
  resolveHeadManually?: boolean;
}

export type WebManifest =
  | IWebManifest
  | ((args: RoutesArgs) => Promise<IWebManifest>)
  | ((args: RoutesArgs) => IWebManifest);
