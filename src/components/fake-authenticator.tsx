import cookie from '../libs/cookie';

export const isLoggedIn = () => (
  cookie.getItem
  && typeof cookie.getItem === 'function'
  && cookie.getItem('secretKey') === 'allowmein'
);

export const login = () => (
  cookie.setItem
  && typeof cookie.setItem === 'function'
  && cookie.setItem('secretKey', 'allowmein')
);

export const logout = () => (
  cookie.removeItem
  && typeof cookie.removeItem === 'function'
  && cookie.removeItem('secretKey')
);
