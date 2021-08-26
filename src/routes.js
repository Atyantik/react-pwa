import AuthRoutes from './routes/auth';

export default class Routes {
  // eslint-disable-next-line
  apply(routeHandler) {
    const routes = [
      ...AuthRoutes,
    ];

    routeHandler.hooks.initRoutes.tapPromise('AppRoutes', async () => {
      routeHandler.addRoutes(routes);
    });
  }
}
