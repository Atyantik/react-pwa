import { FastifyReply, FastifyRequest } from 'fastify';
import FMWRouter from 'find-my-way';

// ...
type HTTPMethod = FMWRouter.HTTPMethod;

type RouteOptions = FMWRouter.RouteOptions;

type Handler = (
  req: FastifyRequest,
  res: FastifyReply,
  params: { [k: string]: string | undefined },
  store: any,
  searchParams: { [k: string]: string }
) => any;

interface ShortHandRoute {
  (path: string, handler: Handler): void;
  (path: string, opts: RouteOptions, handler: Handler): void;
  (path: string, handler: Handler, store: any): void;
  (path: string, opts: RouteOptions, handler: Handler, store: any): void;
}

// @ts-ignore
interface RouterInstance<V extends FMWRouter.HTTPVersion> extends FMWRouter.Instance<V> {
  on(
    method: HTTPMethod | HTTPMethod[],
    path: string,
    handler: Handler
  ): void;
  on(
    method: HTTPMethod | HTTPMethod[],
    path: string,
    options: RouteOptions,
    handler: Handler
  ): void;
  on(
    method: HTTPMethod | HTTPMethod[],
    path: string,
    handler: Handler,
    store: any
  ): void;
  on(
    method: HTTPMethod | HTTPMethod[],
    path: string,
    options: RouteOptions,
    handler: Handler,
    store: any
  ): void;
  off(
    method: HTTPMethod | HTTPMethod[],
    path: string,
    constraints?: { [key: string]: any }
  ): void;
  all: ShortHandRoute;

  acl: ShortHandRoute;
  bind: ShortHandRoute;
  checkout: ShortHandRoute;
  connect: ShortHandRoute;
  copy: ShortHandRoute;
  delete: ShortHandRoute;
  get: ShortHandRoute;
  head: ShortHandRoute;
  link: ShortHandRoute;
  lock: ShortHandRoute;
  'm-search': ShortHandRoute;
  merge: ShortHandRoute;
  mkactivity: ShortHandRoute;
  mkcalendar: ShortHandRoute;
  mkcol: ShortHandRoute;
  move: ShortHandRoute;
  notify: ShortHandRoute;
  options: ShortHandRoute;
  patch: ShortHandRoute;
  post: ShortHandRoute;
  propfind: ShortHandRoute;
  proppatch: ShortHandRoute;
  purge: ShortHandRoute;
  put: ShortHandRoute;
  rebind: ShortHandRoute;
  report: ShortHandRoute;
  search: ShortHandRoute;
  source: ShortHandRoute;
  subscribe: ShortHandRoute;
  trace: ShortHandRoute;
  unbind: ShortHandRoute;
  unlink: ShortHandRoute;
  unlock: ShortHandRoute;
  unsubscribe: ShortHandRoute;
}

const Router = <V extends FMWRouter.HTTPVersion = FMWRouter.HTTPVersion.V1>(
  config: FMWRouter.Config<V>,
  // @ts-ignore
) => FMWRouter(config) as RouterInstance<V>;

export { Router };
