import {ValidationState, ValidationSchema, CustomValidation} from "./validations/types";

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

/**
 *  all :: [bool] -> bool
 */
export const all = reduce(reduceTruthy, true);

/**
  * Executes the value against all provided validation functions and updates
  * the validation state.
  * @param key string the name of the property being validated
  * @param value any the value to be tested for validation
  * @param schema validation schema
  * @return true/false validation
  */
export function baseRunAllValidators<S>(schema: ValidationSchema<S>) {
  return (property: keyof S, value: any, state?: S) => {
    const val = typeof value === 'string' ? value.trim() : value;
    const runValidator = compose(
      (func: Function) => func(val, state),
      prop('validation')
    );
    const bools: boolean[] = map(
      runValidator,
      schema[property as string]
    );
    const isValid: boolean = all(bools);
    const index: number = bools.indexOf(false);
    const error = index > -1
        ? schema[property as string][index].errorMessage
        : '';
    const validations: ValidationState = {};
    validations[property as string] = { isValid, error };
    return validations;
  };
}

export function baseValidate<S>(
  schema: ValidationSchema<S>,
  setValidationState: Function
) {
  const runAllValidators = baseRunAllValidators<S>(schema);
  return (property: keyof S, value: unknown, state?: S) => {
    if (property in schema) {
      const validations = runAllValidators(property, value, state);
      const updated = { ...schema, ...validations };
      setValidationState(updated);
      return validations[property as string].isValid;
    }
    return undefined;
  };
}

export function baseValidateCustom<S>(validate: Function) {
  return (customValidations: CustomValidation[], object?: S) => {
    const bools = map((custom: CustomValidation) => {
      return object
        ? validate(custom.key as keyof S, custom.value, object)
        : validate(custom.key as keyof S, custom.value, {} as S);
    }, customValidations);
    return all(bools);
  };
}

export function baseValidateIfTrue<S>(
  schema: ValidationSchema<S>,
  runAllValidators: Function,
  setValidationState: Function
) {
  return function (property: keyof S, value: unknown, state: S) {
    if (property in schema) {
      const validations = runAllValidators(property, value, state);
      if (validations[property as string].isValid) {
        setValidationState({ ...ValidityState, ...validations });
      }
      return validations[property as string].isValid;
    }
    return undefined;
  };
}

export function baseValidateOnBlur<S>(validate: Function) {
  return (state: S) => (event: any) => {
    const { value, name } = event.target;
    validate(name as keyof S, value, state);
  };
}
  
export function baseValidateOnChange<S>(validateIfTrue: Function) {
  return (onChange: Function, state: S) => (event: any) => {
    const { value, name } = event.target;
    validateIfTrue(name as keyof S, value, state);
    return onChange(event);
  };
}

export function baseValidateAll<S>(
  schema: ValidationSchema<S>,
  runAllValidators: Function,
  setValidationState: Function
) {
  return (state: S, props: string[] = Object.keys(schema)) => {
    const newState = props.reduce((acc, property) => {
      const r = runAllValidators(
        property as keyof S,
        state[property as keyof S],
        state
      );
      acc = { ...acc, ...r };
      return acc;
    }, {});
    setValidationState(newState);
    const result = allValid(newState);
    // setIsValid(result);
    return result;
  };
}

export const allValid = (state: ValidationState) => {
  const keys = Object.keys(state);
  const valid = keys.reduce((prev: boolean, current: string) => {
    return prev ? state[current].isValid : prev;
  }, true);
  return valid;
};
