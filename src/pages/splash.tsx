import { Route } from '@pawjs/pawjs/src/@types/route';
import SplashImage from '../resources/img/seo/home-splash-screen.png';

const SplashRoutes: Route[] = [
  {
    path: '/',
    exact: true,
    component: () => import('../components/splash'),
    seo: {
      title: 'ReactPWA: A developer friendly ReactJS boilerplate | ReactPWA Demo',
      description: 'Create Upgradable, SEO friendly Progressive web applications with ReactPWA. Its fast and developer friendly and more importantly its UPGRADABLE!',
      image: SplashImage,
    },
  },
];

export default SplashRoutes;
