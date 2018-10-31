import cookie from '../libs/cookie';

export default {
  isLoggedIn: () => (cookie.getItem && typeof cookie.getItem === 'function' && cookie.getItem('secretKey') === 'allowmein'),
  logout: () => (cookie.removeItem && typeof cookie.removeItem === 'function' && cookie.removeItem('secretKey')),
};
