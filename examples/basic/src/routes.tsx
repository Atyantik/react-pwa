import { Routes } from '@reactpwa/core';
import { PageLoader } from '@components/page-loader';

const routes: Routes = [
  {
    path: '/',
    element: () => import('@components/shell'),
    children: [
      {
        path: '/',
        element: () => import('@pages/home'),
        skeleton: PageLoader,
        props: {
          name: 'John',
        },
      },
      {
        path: '/about',
        element: () => import('@pages/about'),
        skeleton: PageLoader,
      },
    ],
  },
  {
    path: '*',
    element: () => import('@components/errors/404'),
  },
];

export default routes;
