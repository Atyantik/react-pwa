import React, { useState, useEffect } from 'react';
import { Redirect } from '@pawjs/pawjs';
import { isLoggedIn } from './fake-authenticator';

const Protected: React.FC<React.PropsWithChildren<{ children?: any }>> = (props) => {
  const redirectUrl = '/login';
  const [initialized, setInitialized] = useState<boolean>();
  const [allow, setAllow] = useState<boolean>();

  useEffect(
    () => {
      setInitialized(true);
      if (isLoggedIn()) {
        setAllow(true);
      }
    },
    [],
  );
  if (!initialized) {
    return null;
  }
  if (allow) {
    return props?.children ?? null;
  }
  return (
    <Redirect to={redirectUrl} />
  );
};
export default Protected;
