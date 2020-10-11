/**
 *  compose :: ((a -> b), (b -> c),  ..., (y -> z)) -> a -> z
 */
export const compose = (...fns: Function[]) => (...args: any[]) =>
  fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];

/**
 *  curry :: ((a, b, ...) -> c) -> a -> b -> ... -> c
 */
export function curry(fn: Function) {
  const arity = fn.length;

  return function $curry(...args: any[]): any {
    if (args.length < arity) {
      return $curry.bind(null, ...args);
    }

    return fn.call(null, ...args);
  };
}

/**
 *  map :: (a -> b) -> [a] -> [b]
 */
export const map = curry((f: any, xs: any[]) => xs.map(f));

/**
 *  reduce :: ((b, a) -> b) -> b -> [a] -> b
 */
export const reduce = curry((f: any, x: any, xs: any[]) => xs.reduce(f, x));

/**
 *  prop :: String -> {a} -> [a | Undefined]
 */
export const prop = curry((p: string, obj: any) => (obj ? obj[p] : undefined));

const reduceTruthy = (prev: any, current: any) => {
  return !!current ? prev : false;
};

export const all = reduce(reduceTruthy, true);

