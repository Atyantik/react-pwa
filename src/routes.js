import GuestRoutes from './pages/guest';
import AuthRoutes from './pages/auth';
import SplashScreen from './pages/splash';

export default class Routes {
  // eslint-disable-next-line
  apply(routeHandler) {
    const routes = [
      ...GuestRoutes,
      ...AuthRoutes,
      ...SplashScreen,
    ];

    routeHandler.hooks.initRoutes.tapPromise('AppRoutes', async () => {
      routeHandler.addRoutes(routes);
    });
  }
}
