import React, { useState, useEffect } from 'react';
import { Redirect } from '@pawjs/pawjs';
import { logout } from './fake-authenticator';

const Logout: React.FC = () => {
  const onLogoutRedirectUrl = '/login';
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>();

  useEffect(
    () => {
      logout();
      setIsLoggedOut(true);
    },
    [],
  );
  if (isLoggedOut) {
    return <Redirect to={onLogoutRedirectUrl} />;
  }
  return null;
};

export default Logout;
