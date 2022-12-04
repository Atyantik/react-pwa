export type PromiseCallback = () => Promise<any>;

export const wrapPromise = <T extends PromiseCallback>(
  promise: T,
  options?: {
    onFinalize?: () => void;
    syncData?: Awaited<ReturnType<T>>;
  },
) => {
  let status = 'pending';
  let result: Awaited<ReturnType<T>>;
  let suspend = Promise.resolve();
  if (options?.syncData) {
    status = 'success';
    result = options.syncData;
    suspend = Promise.resolve(options.syncData);
  } else {
    suspend = promise()
      .then(
        (res) => {
          status = 'success';
          result = res;
        },
        (err) => {
          status = 'error';
          result = err;
        },
      )
      .finally(() => {
        options?.onFinalize?.();
      });
  }
  return {
    read(): Awaited<ReturnType<T>> {
      if (status === 'pending') {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw suspend;
      } else if (status === 'error') {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw result;
      }
      return result;
    },
  };
};

export type WrappedPromise = ReturnType<typeof wrapPromise>;
