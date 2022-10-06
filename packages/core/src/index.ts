import { RouteObject, RoutesArgs } from './typedefs/routes.js';
import { IWebManifest } from './typedefs/webmanifest.js';

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
export { Head } from './components/head.js';
export { HttpStatus } from './components/http-status.js';
export { Redirect } from './components/redirect.js';

export type Routes = RouteObject[] | (
  (args: RoutesArgs) => Promise<RouteObject[]>
) | ((args: RoutesArgs) => RouteObject[]);

export type WebManifest = IWebManifest | (
  (args: RoutesArgs) => Promise<IWebManifest>
) | ((args: RoutesArgs) => IWebManifest);
