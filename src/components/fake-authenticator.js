import cookie from '../libs/cookie';

const fakeAuth = {
  isLoggedIn: (cookie.getItem && cookie.getItem && cookie.getItem('secretKey') === 'allowmein'),
};
