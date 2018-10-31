export default [
  {
    path: '/login',
    exact: true,
    component: import('../components/login'),
  },
  {
    path: '/logout',
    exact: true,
    component: import('../components/logout'),
  },
  {
    path: '/dashboard',
    exact: true,
    component: import('../components/dashboard'),
    seo: {
      title: 'User Dashboard',
    },
  },
];
