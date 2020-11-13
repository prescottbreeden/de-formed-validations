import { reduce } from 'ramda';
import { ValidationState } from './validations/types';

type AnyFunction = (...arge: any) => any;

/**
 *  curry :: ((a, b, ...) -> c) -> a -> b -> ... -> c
 */
function curry(fn: AnyFunction) {
  const arity = fn.length;

  return function $curry(...args: any[]): any {
    if (args.length < arity) {
      return $curry.bind(null, ...args);
    }

    return fn.call(null, ...args);
  };
}

/**
 *  compose :: ((a -> b), (b -> c),  ..., (y -> z)) -> a -> z
 */
export const compose = (...fns: AnyFunction[]) => (...args: any[]) =>
  fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];

/**
 *  prop :: String -> {a} -> [a | Undefined]
 */
export const prop = curry((p: string, obj: any) => (obj ? obj[p] : undefined));

const reduceTruthy = (acc: boolean, current: boolean) => {
  return current ? acc : false;
};

/**
 *  all :: [boolean] -> boolean
 */
export const all = reduce(reduceTruthy, true);

export function isPropertyValid<S>(
  property: keyof S,
  validations: ValidationState,
) {
  return compose(prop('isValid'), prop(property))(validations);
}
