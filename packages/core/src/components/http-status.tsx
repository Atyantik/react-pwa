import { FC, ReactElement, useContext } from 'react';
import { NavigateOptions, To, useHref } from 'react-router-dom';
import { statusCodeWithLocations } from '../utils/redirect.js';
import { ReactPWAContext } from './reactpwa.js';

export const HttpStatus: FC<{
  children?: ReactElement | ReactElement[];
  statusCode: number;
  location?: URL | To;
  relative?: NavigateOptions['relative'];
}> = ({
  children, statusCode, location, relative,
}) => {
  let locationStr = location;
  if (typeof location === 'string') {
    // Do nothing we already assigned it to locationStr
  } else if (location instanceof URL) {
    locationStr = location.toString();
  } else if (location) {
    locationStr = useHref(location, { relative });
  }

  if (statusCodeWithLocations.includes(statusCode) && !location) {
    throw new Error(`Error: Status code: ${statusCode} requires location`);
  }
  const { setValue } = useContext(ReactPWAContext);
  setValue('httpStatusCode', statusCode);
  if (locationStr) {
    setValue('httpLocationHeader', locationStr);
  }

  if (!children) {
    return null;
  }
  if (Array.isArray(children)) {
    return <>{children}</>;
  }
  return children;
};
