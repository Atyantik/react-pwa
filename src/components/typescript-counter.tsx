import * as React from 'react';
import GuestLayout from './guest-layout';

const { useState } = React;

export default function () {
  const [counter, setCounter] = useState(0);
  const incrementCounter = (): void => {
    setCounter(counter + 1);
  };
  const decrementCounter = (): void => {
    if (counter > 0) {
      setCounter(counter - 1);
    }
  };
  return (
    <GuestLayout>
      <div className="container p-b-md p-r-md p-l-md has-text-centered">
        <hr />
        Counter:
        <h1 className="title is-size-1">{counter}</h1>
        <button className="button" onClick={decrementCounter}>
          - Decrement
        </button>
        {' '}
        <button className="button" onClick={incrementCounter}>
          Increment +
        </button>
      </div>
    </GuestLayout>
  );
}
