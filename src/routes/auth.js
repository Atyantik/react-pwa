export default [
  {
    path: '/login',
    exact: true,
    component: () => import('@pages/login/index'),
    seo: {
      title: 'Login',
      description: 'Login - POS',
    },
  },
];
