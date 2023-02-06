import React, { createContext, ReactNode, useRef } from 'react';
import { delay } from '../utils/delay.js';
import { WrappedPromise, wrapPromise } from '../utils/promise.js';
import { DataEventEmitter } from '../utils/event-emmiter.js';

export type GetPendingCount = () => number;

/**
 * List of all the wrapped promises
 */
type DataPromise = {
  id: string;
  promise: WrappedPromise;
  done: boolean;
};

const initialContextValue = {
  createDataPromise: (() => ({ read: () => {} })) as <
    T extends () => Promise<any>,
  >(
    id: string,
    cb: T,
  ) => { read: () => Awaited<ReturnType<T>> },
  awaitDataCompletion: (() => ({ read: () => {} })) as (id: string) => {
    read: () => void;
  },
  removeDataPromise: (() => {}) as (id: string) => void,
};

/**
 * The data context, we can use it route wise in the future,
 * but I am willing to keep it global as of now
 */
export const DataContext = createContext<typeof initialContextValue>(initialContextValue);

const getSyncData = (id: string) => {
  try {
    if (typeof window !== 'undefined') {
      const dataScript = document.querySelector(`[data-sync-id="${id}"]`);
      if (dataScript && dataScript.innerHTML) {
        // eslint-disable-next-line no-eval
        return eval(`(${dataScript.innerHTML})`);
      }
    }
  } catch {
    // Do nothing as of now
  }

  return undefined;
};

/**
 * I would rather not prefer having any state for data provider.
 * We would be using state for making sure we do not create more than
 * one instance of eventEmitter
 * Thus avoiding any child components to re-render.
 */
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const eventEmitter = useRef(new DataEventEmitter());
  /**
   * All promises are recorded at single place
   * This way we can understand how many promises are being
   * created and executed
   */
  const pendingPromisesRef = useRef<DataPromise[]>([]);

  /**
   * Get length of pending promises
   * @returns number
   */
  const hasPendingPromises = async () => {
    /**
     * At serverside there is no extra time for loading
     * split chunks, thus we can safely assume we need a timeout of approx
     * 10 miliseconds before the useData is called anywhere in components
     *
     * However on clientside it might take from 10 miliseconds to 1s to load the
     * component before the hook useData is called!
     */
    const isClient = typeof window !== 'undefined';
    if (pendingPromisesRef.current.length === 0) {
      await delay(isClient ? 1000 : 10);
    }
    return pendingPromisesRef.current.some((p) => p.done === false);
  };

  const observerPromisesRef = useRef<DataPromise[]>([]);
  function createDataPromise<T extends () => Promise<any>>(id: string, cb: T) {
    const previousPromise = pendingPromisesRef.current.find(
      (dc) => dc.id === id,
    );
    if (previousPromise) {
      return previousPromise.promise as { read: () => Awaited<ReturnType<T>> };
    }

    const syncData: Awaited<ReturnType<T>> | undefined = getSyncData(id);

    /**
     * Create a wrapped promise on runtime
     * and give the appropriate callback to it.
     * We need to make sure we do not store the data of
     * the promise execution in the memory or else it can
     * clog up the memory and cause issues.
     */
    const wrapped = wrapPromise(cb, {
      // On finalize of the promise,
      // i.e. on error or success.
      onFinalize: async () => {
        await delay(10);
        const promiseIndex = pendingPromisesRef.current.findIndex(
          (dc) => dc.id === id,
        );
        if (promiseIndex !== -1) {
          pendingPromisesRef.current[promiseIndex].done = true;
        }
        // Remove promise reference from array on done
        // pendingPromisesRef.current.splice(promiseIndex, 1);
        eventEmitter.current.emit('DataPromiseFinalise');
      },
      syncData,
    });

    pendingPromisesRef.current.push({
      id,
      promise: wrapped,
      done: false,
    });
    return wrapped as { read: () => Awaited<ReturnType<T>> };
  }

  function removeDataPromise(id: string) {
    const promiseIndex = pendingPromisesRef.current.findIndex(
      (dc) => dc.id === id,
    );
    if (promiseIndex !== -1) {
      pendingPromisesRef.current.splice(promiseIndex, 1);
    }
  }

  function awaitDataCompletion(id: string) {
    const previousPromise = observerPromisesRef.current.find(
      (dc) => dc.id === id,
    );
    if (previousPromise) {
      return previousPromise.promise as { read: () => Awaited<null> };
    }

    /**
     * Create a wrapped promise on runtime
     * and give the appropriate callback to it.
     * We need to make sure we do not store the data of
     * the promise execution in the memory or else it can
     * clog up the memory and cause issues.
     */
    const wrapped = wrapPromise(
      () => new Promise((r) => {
        (async () => {
          if (await hasPendingPromises()) {
            eventEmitter.current.on('DataPromiseFinalise', async () => {
              if (!(await hasPendingPromises())) {
                r(null);
              }
            });
          } else {
            r(null);
          }
        })();
      }),
      {
        // On finalize of the promise,
        // i.e. on error or success.
        onFinalize: () => {
          /**
           * CAUTION
           * @todo: Any way to get rid of timeout?
           * I am stuck in look if we do not give timeout. New promises are created again.
           * Causing memory leak and infinite looping
           * Thus making it super difficult to garbage collect observerPromisesRef
           * .Check if manual garbage collect is even required
           */
          setTimeout(() => {
            const promiseIndex = observerPromisesRef.current.findIndex(
              (dc) => dc.id === id,
            );
            // Remove promise reference from array on done
            observerPromisesRef.current.splice(promiseIndex, 1);
          }, 10);
        },
      },
    );

    observerPromisesRef.current.push({
      id,
      promise: wrapped,
      done: false,
    });
    return wrapped as { read: () => Awaited<null> };
  }

  return (
    <DataContext.Provider
      value={{ createDataPromise, awaitDataCompletion, removeDataPromise }}
    >
      {children}
    </DataContext.Provider>
  );
};
