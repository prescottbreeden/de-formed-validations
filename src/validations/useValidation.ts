import { ChangeEvent, useState, useEffect, useCallback } from 'react';
import { compose, prop, map, all } from '../utilities';
import {ValidationSchema, ValidationState, CustomValidation} from './types';

/**
 * A hook that can be used to generate an object containing functions and
 * properties pertaining to the validation state provided.
 * @param validationSchema an object containing all the properties you want to validate
 * @returns object { getError, getFieldValid, isValid, validate, validateAll, validateIfTrue, validateOnBlur, validateOnChange, validationState }
 */
export const useValidation = <S>(validationSchema: ValidationSchema<S>) => {
  // -- Build Validation State Object -------------------------------------
  const createValidationsState = (schema: ValidationSchema<S>) => {
    const keys = Object.keys(schema);
    const vState = keys.reduce((prev: any, item: string) => {
      prev[item] = {
        isValid: true,
        error: '',
      };
      return prev;
    }, {});
    return vState;
  };

  /**
   *  Resets the validation state.
   */
  const resetValidationState = (): void => {
    setValidationState(createValidationsState(validationSchema));
  }

  // -- isValid and validationState ---------------------------------------
  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationState, setValidationState] = useState<ValidationState>(
    createValidationsState(validationSchema)
  );

  /**
   * Executes the value against all provided validation functions and updates
   * the validation state.
   * @param key string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return true/false validation
   */
  const runAllValidators = (property: keyof S, value: any, state: S) => {
    const val = typeof value === 'string' ? value.trim() : value;
    const runValidator = compose(
      (func: Function) => func(val, state),
      prop('validation')
    );
    const bools: boolean[] = map(
      runValidator,
      validationSchema[property as string]
    );
    const isValid: boolean = all(bools);
    const index: number = bools.indexOf(false);
    const error =
      index > -1
        ? validationSchema[property as string][index].errorMessage
        : '';
    const validations: ValidationState = {};
    validations[property as string] = { isValid, error };
    return validations;
  };

  /**
   * Executes a validation function on a value and updates the validation state.
   * @param property string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return boolean | undefined
   */
  const validate = (property: keyof S, value: unknown, state: S) => {
    if (property in validationSchema) {
      const validations = runAllValidators(property, value, state);
      const updated = { ...validationState, ...validations };
      setValidationState(updated);
      return validations[property as string].isValid;
    }
    return undefined;
  };

  /**
   * Takes a unique data set and runs them against the defined schema. Only use
   * if you need to run validations on data where the validation props are
   * unable to follow the names of the properties of an object. Will return a
   * boolean and update validation state.
   * @param props string[] property names to check (optional)
   * @param object optional object
   * @return boolean
   */
  const validateCustom = (
    customValidations: CustomValidation[],
    object?: S
  ) => {
    const bools = map((custom: CustomValidation) => {
      return object
        ? validate(custom.key as keyof S, custom.value, object)
        : validate(custom.key as keyof S, custom.value, {} as S);
    }, customValidations);
    return all(bools);
  };

  /**
   * Updates the validation state if the validation succeeds.
   * @param key string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return boolean | undefined
   */
  const validateIfTrue = (property: keyof S, value: unknown, state: S) => {
    if (property in validationSchema) {
      const validations = runAllValidators(property, value, state);
      if (validations[property as string].isValid) {
        setValidationState({ ...validationState, ...validations });
      }
      return validations[property as string].isValid;
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
    event: ChangeEvent<HTMLInputElement>
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
  const validateOnChange = (onChange: Function, state: S) => (
    event: ChangeEvent<HTMLInputElement>
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
    props: string[] = Object.keys(validationSchema)
  ) => {
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
    setIsValid(result);
    return result;
  };

  /**
   * Get the current error stored for a property on the validation object.
   * @param property the name of the property to retrieve
   * @return string
   */
  const getError = (
    property: string,
    vState: ValidationState = validationState
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
    property: string,
    vState: ValidationState = validationState
  ) => {
    if (property in validationSchema) {
      const val = compose(prop('isValid'), prop(property));
      return val(vState);
    }
    return true;
  };

  // -- array of all current validation errors ----------------------------
  const validationErrors = map(getError, Object.keys(validationState));

  // -- helper to determine if a new validation state is valid ------------
  const allValid = (state: ValidationState) => {
    const keys = Object.keys(state);
    const valid = keys.reduce((prev: boolean, current: string) => {
      return prev ? getFieldValid(current, state) : prev;
    }, true);
    return valid;
  };

  // -- memoized allValid to update state on change detection -------------
  const updateIsValid = useCallback(allValid, [validationState]);

  useEffect(() => {
    setIsValid(updateIsValid(validationState));
  }, [validationState, updateIsValid]);

  return {
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
