import { useFetcher } from '@remix-run/react';
import { useCallback, useEffect, useRef } from 'react';

class Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: Error | string) => void;
  constructor() {
    this.resolve = () => {};
    this.reject = () => {};
    this.promise = new Promise<T>((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}

export function usePromisifiedFetcher<T>() {
  const fetcher = useFetcher<T>();
  const $deferred = useRef(new Deferred<T>());

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      $deferred.current.resolve(fetcher.data as T);
      $deferred.current = new Deferred<T>();
    }
  }, [$deferred, fetcher.state, fetcher.data]);

  const submit = useCallback(
    (
      target: Parameters<typeof fetcher.submit>[0],
      options: Parameters<typeof fetcher.submit>[1]
    ) => {
      fetcher.submit(target, options);
      return $deferred.current.promise;
    },
    [$deferred, fetcher]
  );

  return { ...fetcher, submit };
}
