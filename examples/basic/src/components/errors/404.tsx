import { HttpStatus } from '@reactpwa/core';

const NotFoundComponent: React.FC = () => (
  <HttpStatus statusCode={404}>
    <h1>404 Not found.</h1>
    <p>The page you are looking for, does not exists</p>
  </HttpStatus>
);

export default NotFoundComponent;
