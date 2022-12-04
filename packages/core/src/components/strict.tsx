import React, { StrictMode, FC } from 'react';

export const ReactStrictMode: FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  // @ts-ignore
  if (EnableReactStrictMode) {
    return <StrictMode>{children}</StrictMode>;
  }
  return children;
};
