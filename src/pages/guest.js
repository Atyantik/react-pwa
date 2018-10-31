import fetch from 'universal-fetch';
import skeleton from '../components/skeleton';

export default [
  {
    path: '/home',
    exact: true,
    component: import('../components/home'),
  },
  {
    path: '/global-local-css',
    exact: true,
    component: import('../components/global-local-css'),
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
    component: import('../components/skeleton-loading'),
    skeleton,
  },
  {
    path: '/image-optimization',
    exact: true,
    component: import('../components/image-optmization'),
  },
];
