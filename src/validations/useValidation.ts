import { ChangeEvent, useState, useEffect, useCallback } from 'react';
import {
  ValidationSchema,
  ValidationState,
  CustomValidation,
  ValidationFunction,
} from './types';
import { compose, prop, all, isPropertyValid } from '../utilities';
import { map, reduce, converge, mergeRight } from 'ramda';

/**
 * A hook that can be used to generate an object containing functions and
 * properties pertaining to the validation state provided.
 * @param validationSchema an object containing all the properties you want to validate
 * @returns object { getError, getFieldValid, isValid, validate, validateAll, validateIfTrue, validateOnBlur, validateOnChange, validationState }
 */
export const useValidation = <S>(validationSchema: ValidationSchema<S>) => {
  // -- Build Validation State Object -------------------------------------
  const createValidationsState = (schema: ValidationSchema<S>) => {
    return reduce(
      (prev: any, key: keyof S) => ({
        ...prev,
        [key]: {
          isValid: true,
          error: '',
        },
      }),
      {},
      Object.keys(schema) as (keyof S)[],
    );
  };


  // -- isValid and validationState ---------------------------------------
  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationState, setValidationState] = useState<ValidationState>(
    createValidationsState(validationSchema),
  );
  const [validationErrors, setValidationErros] = useState<string[]>([]);

  /**
   *  Resets the validation state.
   */
  const resetValidationState = (): void =>
    compose(setValidationState, createValidationsState)(validationSchema);

  /**
   *  Overrides the existing validation state with another. WARNING: this feature
   *  is experimental and may be removed in future versions.
   *  @param newValidationState ValidationState
   */
  const forceValidationState = (newValidationState: ValidationState): void => {
    setValidationState(newValidationState);
  };

  /**
   * Executes the value against all provided validation functions and updates
   * the validation state.
   * @param key string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return true/false validation
   */
  const runAllValidators = (property: keyof S, value: any, state?: S) => {
    const localState = state ? state : {} as S;
    const runValidator = compose(
      (func: ValidationFunction<S>) => func(value, localState),
      prop('validation'),
    );
    const bools: boolean[] = map(
      runValidator,
      prop(property, validationSchema),
    );
    const allValidationsValid: boolean = all(bools);
    const index: number = bools.indexOf(false);
    const error =
      index > -1
        ? validationSchema[property as string][index].errorMessage
        : '';
    return {
      [property]: { isValid: allValidationsValid, error },
    };
  };

  /**
   * Executes a validation function on a value and updates the validation state.
   * @param property string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return boolean | undefined
   */
  const validate = (property: keyof S, value: unknown, state?: S) => {
    if (property in validationSchema) {
      const validations = runAllValidators(property, value, state);
      const updated = mergeRight(validationState, validations);
      setValidationState(updated);
      return isPropertyValid(property, validations);
    }
    return undefined;
  };

  /**
   * Takes a unique data set and runs them against the defined schema. Only use
   * if you need to run validations on data where the validation props are
   * unable to follow the names of the properties of an object. Will return a
   * boolean and update validation state.
   * @param props string[] property names to check (optional)
   * @return boolean
   */
  const validateCustom = (customValidations: CustomValidation[]) => {
    const zip = converge(runAllValidators, [
      prop('key'),
      prop('value'),
      prop('state'),
    ]);
    const state = reduce(
      (prev: any, current: CustomValidation) => {
        return mergeRight(prev, zip(current));
      },
      {},
      customValidations,
    );
    setValidationState(state);
    return allValid(state);
  };

  /**
   * Updates the validation state if the validation succeeds.
   * @param key string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return boolean | undefined
   */
  const validateIfTrue = (property: keyof S, value: unknown, state?: S) => {
    if (property in validationSchema) {
      const validations = runAllValidators(property, value, state);
      if (isPropertyValid(property, validations)) {
        setValidationState(mergeRight(validationState, validations));
      }
      return isPropertyValid(property, validations);
    }
    return undefined;
  };
  /**
   * Create a new onBlur function that calls validate on a property matching the
   * name of the event whenever a blur event happens.
   * @param state the data controlling the form
   * @return function
   */
  const validateOnBlur = (state: S) => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { value, name } = event.target;
    validate(name as keyof S, value, state);
  };

  /**
   * Create a new onChange function that calls validateIfTrue on a property
   * matching the name of the event whenever a change event happens.
   * @param onChange function to handle onChange events
   * @param state the data controlling the form
   * @return function
   */
  const validateOnChange = (onChange: (event: any) => any, state: S) => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { value, name } = event.target;
    validateIfTrue(name as keyof S, value, state);
    return onChange(event);
  };

  /**
   * Runs all validations against an object with all values and updates/returns
   * isValid state.
   * @param state any an object that contains all values to be validated
   * @param props string[] property names to check (optional)
   * @return boolean
   */
  const validateAll = (
    state: S,
    props: (keyof S)[] = Object.keys(validationSchema) as (keyof S)[],
  ) => {
    const newState = reduce(
      (acc: ValidationState, property: keyof S) => {
        const r = runAllValidators(property, prop(property, state), state);
        return mergeRight(acc, r);
      },
      {},
      props,
    );
    const updated = mergeRight(validationState, newState);
    setValidationState(updated);
    return allValid(newState);
  };

  /**
   * Get the current error stored for a property on the validation object.
   * @param property the name of the property to retrieve
   * @return string
   */
  const getError = (
    property: keyof S,
    vState: ValidationState = validationState,
  ) => {
    if (property in validationSchema) {
      const val = compose(prop('error'), prop(property));
      return val(vState) ? val(vState) : '';
    }
    return '';
  };

  /**
   * Get the current valid state stored for a property on the validation object.
   * If the property does not exist on the validationSchema getFieldValid will
   * return true by default.
   * @param property the name of the property to retrieve
   * @return boolean
   */
  const getFieldValid = (
    property: keyof S,
    vState: ValidationState = validationState,
  ) => {
    if (property in validationSchema) {
      const val = compose(prop('isValid'), prop(property));
      return val(vState);
    }
    return true;
  };

  // -- helper to determine if a new validation state is valid ------------
  const allValid = (state: ValidationState) => {
    return reduce(
      (prev: boolean, curr: keyof S) => {
        return prev ? isPropertyValid(curr, state) : prev;
      },
      true,
      Object.keys(state) as (keyof S)[],
    );
  };

  // -- helper to build array of errors when validation state is invalid ---
  const generateValidationErrors = (state: ValidationState) => {
    return reduce(
      (prev: string[], curr: keyof S) => {
        return getError(curr) ? [...prev, getError(curr)] : prev;
      },
      [],
      Object.keys(state) as (keyof S)[]
    );
  };

  // -- memoized functions to update state on change detection -------------
  const updateIsValid = useCallback(allValid, [validationState]);
  const updateErrors = useCallback(generateValidationErrors, [validationState]);

  useEffect(() => {
    setIsValid(updateIsValid(validationState));
    setValidationErros(updateErrors(validationState));
  }, [validationState, updateIsValid]);

  return {
    forceValidationState,
    getError,
    getFieldValid,
    isValid,
    resetValidationState,
    validate,
    validateAll,
    validateCustom,
    validateIfTrue,
    validateOnBlur,
    validateOnChange,
    validationErrors,
    validationState,
  };
};
