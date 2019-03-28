import fetch from 'universal-fetch';
import skeleton from '../components/skeleton';
import FeaturesImage from '../resources/img/seo/features.png';
import CSSGlobalLocalImage from '../resources/img/seo/css-global-local.png';
import SkeletonImage from '../resources/img/seo/skeleton-loading.png';
import ImageOptimizationImage from '../resources/img/seo/image-optimization.png';

export default [
  {
    path: '/home',
    exact: true,
    component: () => import('../components/home'),
    seo: {
      title: 'Home | ReactPWA Demo',
      description: 'Feature set offered by ReactPWA with pluggable @pawjs plugins. ReactPWA is highly customizable and once can achieve anything as it is extendable',
      image: FeaturesImage,
    },
  },
  {
    path: '/global-local-css',
    exact: true,
    component: () => import('../components/global-local-css'),
    seo: {
      title: 'CSS - Globally & Locally | ReactPWA Demo',
      description: 'Sometimes we use global css classes like pad-10 but sometimes we need to write class names within modules that do not conflict with other modules, that is where local css comes into the picture',
      image: CSSGlobalLocalImage,
    },
  },
  {
    path: '/typescript-counter',
    exact: true,
    component: () => import('../components/typescript-counter'),
    seo: {
      title: 'TypeScript Counter | ReactPWA Demo',
      description: 'TypeScript is awesome and implementing it with React makes it more awesome. Checkout this simple counter example with react and typescript',
      image: CSSGlobalLocalImage,
    },
  },
  {
    path: '/skeleton-loading',
    exact: true,
    loadData: async () => new Promise((r) => {
      setTimeout(() => {
        fetch('https://www.atyantik.com/wp-json/wp/v2/posts/?per_page=4&_fields[]=title&_fields[]=excerpt&_fields[]=jetpack_featured_media_url')
          .then(res => res.json())
          .then(res => r(res));
      }, 1000);
    }),
    component: () => import('../components/skeleton-loading'),
    skeleton,
    seo: {
      title: 'Skeleton Loading | ReactPWA Demo',
      description: 'Tired of adding ugly loaders? Do not let your users get confused, give them the best user experience of what is getting loaded. Use Skeleton Loading',
      image: SkeletonImage,
    },
  },
  {
    path: '/image-optimization',
    exact: true,
    component: () => import('../components/image-optmization'),
    seo: {
      title: 'Image Optimization | ReactPWA Demo',
      description: 'Serve optimize images automatically with Lazy loading and WebP support with fallback to JPG/PNG of original image.',
      image: ImageOptimizationImage,
    },
  },
  {
    path: '/contribute',
    exact: true,
    component: () => import('../components/contribute'),
    seo: {
      title: 'Contribute | ReactPWA Demo',
      description: 'Be a part of larger family. Get involved with us and support our project ReactPWA',
    },
  },
];
