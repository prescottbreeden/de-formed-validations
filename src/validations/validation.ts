import {CustomValidation, ValidationSchema, ValidationState} from './types';
import { all, compose, isPropertyValid, prop } from '../utilities';
import { map, reduce } from 'ramda';

export class Validation<S> {
  private _validationSchema: ValidationSchema<S>;
  private _validationState: ValidationState;

  public get isValid() {
    return this.allValid(this._validationState);
  }

  public get validationErrors() {
    const props = Object.keys(this._validationState);
    const errors = reduce((prev: string[], curr: string) => {
      const err = this.getError(curr as keyof S);
      return err ? [...prev, err] : prev;
    }, [], props);
    return errors;
  }

  public get validationState() {
    return this._validationState;
  }

  constructor(props: ValidationSchema<S>) {
    this._validationSchema = props;
    this._validationState = this.createValidationsState(props);
  }

  private createValidationsState = (schema: ValidationSchema<S>) => {
    return reduce((prev: any, item: string) => ({
      ...prev,
      [item]: {
        isValid: true,
        error: '',
      }
    }), {}, Object.keys(schema));
  };

  private allValid = (state: ValidationState) => {
    const keys = Object.keys(state);
    const valid = reduce((prev: boolean, current: string) => {
      return prev
        ? isPropertyValid(current, this._validationState)
        : prev;
    }, true, keys);
    return valid;
  };

  /**
   * Executes the value against all provided validation functions and updates
   * the validation state.
   * @param key string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return true/false validation
   */
  private runAllValidators = (property: keyof S, value: any, state?: S) => {
    const runValidator = compose(
      (func: Function) => func(value, state),
      prop('validation')
    );
    const bools: boolean[] = map(
      runValidator,
      this._validationSchema[property as string]
    );
    const isValid: boolean = all(bools);
    const index: number = bools.indexOf(false);
    const error =
      index > -1
        ? this._validationSchema[property as string][index].errorMessage
        : '';
    return {
      [property]: { isValid, error }
    }
  };

  /**
   * Get the current error stored for a property on the validation object.
   * @param property the name of the property to retrieve
   * @return string
   */
  public getError = (property: keyof S) => {
    if ((property as string) in this._validationSchema) {
      const val = compose(prop('error'), prop(property));
      return val(this._validationState);
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
  public getFieldValid = (
    property: keyof S,
    vState: ValidationState = this._validationState
  ) => {
    if ((property as string) in this._validationSchema) {
      return isPropertyValid(property, vState);
    }
    return true;
  };

  public resetValidationState = (): void => {
    this._validationState = this.createValidationsState(this._validationSchema);
  }

  /**
   * Executes a validation function on a value and updates the validation state.
   * @param property string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return boolean | undefined
   */
  public validate = (property: keyof S, value: unknown, state?: S) => {
    if (property in this._validationSchema) {
      const validations = this.runAllValidators(property, value, state);
      this._validationState = {
        ...this._validationState,
        ...validations
      };
      return isPropertyValid(property, validations);
    }
    return undefined;
  };

  /**
   * Runs all validations against an object with all values and updates/returns
   * isValid state.
   * @param state any an object that contains all values to be validated
   * @param props string[] property names to check (optional)
   * @return boolean
   */
  public validateAll = (
    state: S,
    props: [keyof S] = Object.keys(this._validationSchema) as [keyof S]
  ) => {
    const newState = reduce((acc: ValidationState, property: keyof S) => {
      const r = this.runAllValidators(
        property,
        prop(property, state),
        state
      );
      return { ...acc, ...r };
    }, {}, props);
    this._validationState = newState;
    return this.allValid(newState);
  };

  /**
   * Takes a unique data set and runs them against the defined schema. Only use
   * if you need to run validations on data where the validation props are
   * unable to follow the names of the properties of an object. Will return a
   * boolean and update validation state.
   * @param props string[] property names to check (optional)
   * @return boolean
   */
  public validateCustom = (customValidations: CustomValidation[]) => {
    const newState = reduce((acc: ValidationState, property: CustomValidation) => {
      const r = this.runAllValidators(
        prop('key', property),
        prop('value', property),
        prop('state', property)
      );
      acc = { ...acc, ...r };
      return acc;
    }, {}, customValidations);
    this._validationState = newState;
    return this.allValid(newState);
  };

  /**
   * Updates the validation state if the validation succeeds.
   * @param key string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return boolean | undefined
   */
  public validateIfTrue = (property: keyof S, value: unknown, state?: S) => {
    if (property in this._validationSchema) {
      const validations = this.runAllValidators(property, value, state);
      if (isPropertyValid(property, validations)) {
        const updated = { ...this._validationState, ...validations };
        this._validationState = updated;
      }
      return isPropertyValid(property, validations)
    }
    return undefined;
  };

  /**
   * Create a new onBlur function that calls validate on a property matching the
   * name of the event whenever a blur event happens.
   * @param state the data controlling the form
   * @return function
   */
  public validateOnBlur = (state: S) => {
    return (event: any) => {
      const { value, name } = event.target;
      this.validate(name as keyof S, value, state);
    };
  };

  /**
   * Create a new onChange function that calls validateIfTrue on a property
   * matching the name of the event whenever a change event happens.
   * @param onChange function to handle onChange events
   * @param state the data controlling the form
   * @return function
   */
  public validateOnChange = (onChange: Function, state: S) => {
    return (event: any) => {
      const { value, name } = event.target;
      this.validateIfTrue(name as keyof S, value, state);
      return onChange(event);
    };
  };
}
