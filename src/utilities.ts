import {reduce} from "ramda";
import {ValidationState} from "./validations/types";

/**
 *  curry :: ((a, b, ...) -> c) -> a -> b -> ... -> c
 */
function curry(fn: Function) {
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
export const compose = (...fns: Function[]) => (...args: any[]) =>
  fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];

/**
 *  prop :: String -> {a} -> [a | Undefined]
 */
export const prop = curry((p: string, obj: any) => (obj ? obj[p] : undefined));

const reduceTruthy = (prev: any, current: any) => {
  return !!current ? prev : false;
};

/**
 *  all :: [bool] -> bool
 */
export const all = reduce(reduceTruthy, true);

export function isPropertyValid<S>(
  property: keyof S,
  validations: ValidationState
) {
  return compose(
    prop('isValid'),
    prop(property)
  )(validations);
};
