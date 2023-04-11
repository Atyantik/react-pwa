import { FC, ReactElement, useEffect } from 'react';
import {
  To, useNavigate, NavigateOptions, useHref,
} from 'react-router-dom';
import { RedirectStatusCode } from '../utils/redirect.js';
import { HttpStatus } from './http-status.js';

/**
 * Redirect to the provided location, default statusCode 307 (Temporary redirect)
 * @param Redirect Props {
 *   children?: ReactElement | ReactElement[],
 *   to: To | URL,
 *   statusCode: RedirectStatusCode,
 * } & NavigateOptions
 * @returns HttpStatus
 */
export const Redirect: FC<
{
  children?: ReactElement | ReactElement[];
  to: To | URL;
  statusCode?: RedirectStatusCode;
} & NavigateOptions
> = ({
  children,
  to,
  statusCode = 307,
  replace,
  state,
  preventScrollReset,
  relative,
}) => {
  const navigate = useNavigate();
  const href = useHref(to, { relative });
  useEffect(() => {
    navigate(to, {
      replace,
      state,
      preventScrollReset,
      relative,
    });
  }, []);
  return (
    <HttpStatus statusCode={statusCode} location={href} relative={relative}>
      {children}
    </HttpStatus>
  );
};
