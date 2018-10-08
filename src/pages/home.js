export default [
  {
    path: '/',
    exact: true,
    component: import('../components/splash'),
    seo: {
      title: 'ReactPWA: A developer friendly boilerplate',
    },
  },
  {
    path: '/home',
    exact: true,
    component: import('../components/home'),
  },
  {
    path: '/login',
    exact: true,
    component: import('../components/login'),
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
