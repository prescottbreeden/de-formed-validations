import { ChangeEvent, useState, useEffect, useCallback } from 'react';
import {
  ValidationSchema,
  ValidationState,
  CustomValidation,
  ValidationFunction,
  ValidationObject,
  ResetValidationState,
  ForceValidationState,
  Validate,
  ValidateCustom,
  ValidateIfTrue,
  ValidateOnBlur,
  ValidateOnChange,
  GetFieldValid,
  GetAllErrors,
  GetError,
  ValidateAll,
} from './types';
import { compose, prop, all, isPropertyValid } from '../utilities';
import { map, reduce, converge, mergeRight, head } from 'ramda';

/**
 * A hook that can be used to generate an object containing functions and
 * properties pertaining to the validation state provided.
 * @param validationSchema an object containing all the properties you want to validate
 * @returns validationObject { forceValidationState, getError, getAllErrors, getFieldValid, isValid, resetValidationState, validate, validateAll, validateIfTrue, validateOnBlur, validateOnChange, validationState }
 */
export const useValidation = <S>(
  validationSchema: ValidationSchema<S>,
): ValidationObject<S> => {
  // -- Build Validation State Object -------------------------------------
  const createValidationsState = (schema: ValidationSchema<S>) => {
    return reduce(
      (acc: ValidationState, key: keyof S) => ({
        ...acc,
        [key]: {
          isValid: true,
          errors: [],
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
  const resetValidationState: ResetValidationState = (): void =>
    compose(setValidationState, createValidationsState)(validationSchema);

  /**
   *  Overrides the existing validation state with another.
   *  @param newValidationState ValidationState
   */
  const forceValidationState: ForceValidationState = (
    newValidationState: ValidationState,
  ): void => {
    setValidationState(newValidationState);
  };

  /**
   * Executes the value against all provided validation functions and updates
   * the validation state.
   * @param key string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return true/false validation
   */
  const runAllValidators = (
    property: keyof S,
    data: S | Partial<S>,
  ): ValidationState => {
    const runValidator = compose(
      (func: ValidationFunction<S>) => func(prop(property, data)),
      prop('validation'),
    );
    const bools: boolean[] = map(
      runValidator,
      prop(property, validationSchema),
    );
    const allValidationsValid: boolean = all(bools);
    const errors = bools.reduce((acc: string[], curr: boolean, idx: number) => {
      const errorOf = compose(prop('errorMessage'), prop(idx), prop(property));
      return curr ? acc : [...acc, errorOf(validationSchema)];
    }, []);
    return {
      [property]: {
        isValid: allValidationsValid,
        errors: allValidationsValid ? [] : errors,
      },
    };
  };

  /**
   * Executes a validation function on a value and updates the validation state.
   * @param property string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return boolean
   */
  const validate: Validate<S> = (
    property: keyof S,
    state: S | Partial<S>,
  ): boolean => {
    if (property in validationSchema) {
      const validations = runAllValidators(property, state);
      const updated = mergeRight(validationState, validations);
      setValidationState(updated);
      return isPropertyValid(property, validations);
    }
    return true;
  };

  /**
   * Takes a unique data set and runs them against the defined schema. Only use
   * if you need to run validations on data where the validation props are
   * unable to follow the names of the properties of an object. Will return a
   * boolean and update validation state.
   * @param customValidations CustomValidation[]
   * @return boolean
   */
  const validateCustom: ValidateCustom = (
    customValidations: CustomValidation[],
  ): boolean => {
    const zip = converge(runAllValidators, [
      prop('key'),
      prop('value'),
      prop('state'),
    ]);
    const state = reduce(
      (acc: any, current: CustomValidation) => {
        return mergeRight(acc, zip(current));
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
   * @return boolean
   */
  const validateIfTrue: ValidateIfTrue<S> = (
    property: keyof S,
    data: S | Partial<S>,
  ): boolean => {
    if (property in validationSchema) {
      const validations = runAllValidators(property, data);
      if (isPropertyValid(property, validations)) {
        setValidationState(mergeRight(validationState, validations));
      }
      return isPropertyValid(property, validations);
    }
    return true;
  };

  /**
   * Create a new onBlur function that calls validate on a property matching the
   * name of the event whenever a blur event happens.
   * @param state the data controlling the form
   * @return function :: (event: any) => any
   */
  const validateOnBlur: ValidateOnBlur<S> = (state: S) => (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const { value, name } = event.target;
    validate(name as keyof S, { ...state, [name]: value });
  };

  /**
   * Create a new onChange function that calls validateIfTrue on a property
   * matching the name of the event whenever a change event happens.
   * @param onChange function to handle onChange events
   * @param state the data controlling the form
   * @return function :: (event: any) => any
   */
  const validateOnChange: ValidateOnChange<S> = (
    onChange: (event: any) => any,
    state: S,
  ) => (event: any): unknown => {
    const { value, name } = event.target;
    validateIfTrue(
      name as keyof S,
      {
        ...state,
        [name]: value
      }
    );


    return onChange(event);
  };

  /**
   * Runs all validations against an object with all values and updates/returns
   * isValid state.
   * @param state any an object that contains all values to be validated
   * @param props string[] property names to check (optional)
   * @return boolean
   */
  const validateAll: ValidateAll<S> = (
    state: S,
    props: (keyof S)[] = Object.keys(validationSchema) as (keyof S)[],
  ): boolean => {
    const newState = reduce(
      (acc: ValidationState, property: keyof S) => {
        const r = runAllValidators(property, state);
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
  const getAllErrors: GetAllErrors<S> = (
    property: keyof S,
    vState: ValidationState = validationState,
  ): string[] => {
    if (property in validationSchema) {
      const val = compose(prop('errors'), prop(property));
      return val(vState);
    }
    return [];
  };

  /**
   * Get the current error stored for a property on the validation object.
   * @param property the name of the property to retrieve
   * @return string
   */
  const getError: GetError<S> = (
    property: keyof S,
    vState: ValidationState = validationState,
  ): string => {
    if (property in validationSchema) {
      const val = compose(head, prop('errors'), prop(property));
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
  const getFieldValid: GetFieldValid<S> = (
    property: keyof S,
    vState: ValidationState = validationState,
  ): boolean => {
    if (property in validationSchema) {
      const val = compose(prop('isValid'), prop(property));
      return val(vState);
    }
    return true;
  };

  // -- helper to determine if a new validation state is valid ------------
  const allValid = (state: ValidationState): boolean => {
    return reduce(
      (acc: boolean, curr: keyof S) => {
        return acc ? isPropertyValid(curr, state) : acc;
      },
      true,
      Object.keys(state) as (keyof S)[],
    );
  };

  // -- helper to build array of errors when validation state is invalid ---
  const generateValidationErrors = (state: ValidationState): string[] => {
    return reduce(
      (acc: string[], curr: keyof S) => {
        return getError(curr) ? [...acc, getError(curr) as string] : acc;
      },
      [],
      Object.keys(state) as (keyof S)[],
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
    getAllErrors,
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
