import {
  CustomValidation,
  ForceValidationState,
  GetAllErrors,
  GetError,
  GetFieldValid,
  ResetValidationState,
  Validate,
  ValidateAll,
  ValidateCustom,
  ValidateIfTrue,
  ValidateOnBlur,
  ValidateOnChange,
  ValidationFunction,
  ValidationSchema,
  ValidationState,
} from './types';
import { all, compose, isPropertyValid, prop } from '../utilities';
import { converge, head, map, reduce } from 'ramda';

export class Validation<S> {
  private _validationSchema: ValidationSchema<S>;
  private _validationState: ValidationState;

  public get isValid(): boolean {
    return this.allValid(this._validationState);
  }

  public get validationErrors(): string[] {
    const props = Object.keys(this._validationState);
    const errors = reduce(
      (acc: string[], curr: keyof S) => {
        const err = this.getError(curr);
        return err ? [...acc, err] : acc;
      },
      [],
      props as (keyof S)[],
    );
    return errors;
  }

  public get validationState(): ValidationState {
    return this._validationState;
  }

  constructor(props: ValidationSchema<S>) {
    this._validationSchema = props;
    this._validationState = this.createValidationsState(props);
  }

  private createValidationsState = (
    schema: ValidationSchema<S>,
  ): ValidationState => {
    return reduce(
      (acc: ValidationState, item: keyof S) => ({
        ...acc,
        [item]: {
          isValid: true,
          errors: [],
        },
      }),
      {},
      Object.keys(schema) as (keyof S)[],
    );
  };

  /**
   *  Resets the validation state.
   */
  public resetValidationState: ResetValidationState = (): void => {
    this._validationState = this.createValidationsState(this._validationSchema);
  };

  /**
   *  Overrides the existing validation state with another. WARNING: this feature
   *  is experimental and may be removed in future versions.
   *  @param newValidationState ValidationState
   */
  public forceValidationState: ForceValidationState = (
    newValidationState: ValidationState,
  ): void => {
    this._validationState = newValidationState;
  };

  private allValid = (state: ValidationState): boolean => {
    const keys = Object.keys(state);
    const valid = reduce(
      (acc: boolean, current: string) => {
        return acc ? isPropertyValid(current, this._validationState) : acc;
      },
      true,
      keys,
    );
    return valid;
  };

  /**
   * Executes the value against all provided validation functions and updates
   * the validation state.
   * @param key string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return true/false validation
   */
  private runAllValidators = (
    property: keyof S,
    value: unknown,
    state?: S,
  ): ValidationState => {
    const localState = state ? state : ({} as S);
    const runValidator = compose(
      (func: ValidationFunction<S>) => func(value, localState),
      prop('validation'),
    );
    const bools: boolean[] = map(
      runValidator,
      prop(property, this._validationSchema),
    );
    const allValidationsValid: boolean = all(bools);
    const errors = bools.reduce((acc: string[], curr: boolean, idx: number) => {
      const errorOf = compose(prop('errorMessage'), prop(idx), prop(property));
      return curr ? acc : [...acc, errorOf(this._validationSchema)];
    }, []);
    return {
      [property]: {
        isValid: allValidationsValid,
        errors: allValidationsValid ? [] : errors,
      },
    };
  };

  /**
   * Get the current error stored for a property on the validation object.
   * @param property the name of the property to retrieve
   * @return string
   */
  public getError: GetError<S> = (property: keyof S): string => {
    if (property in this._validationSchema) {
      const val = compose(head, prop('errors'), prop(property));
      return val(this._validationState) ? val(this._validationState) : '';
    }
    return '';
  };

  /**
   * Get the current error stored for a property on the validation object.
   * @param property the name of the property to retrieve
   * @return string[]
   */
  public getAllErrors: GetAllErrors<S> = (property: keyof S): string[] => {
    if (property in this._validationSchema) {
      const val = compose(prop('errors'), prop(property));
      return val(this._validationState);
    }
    return [];
  };

  /**
   * Get the current valid state stored for a property on the validation object.
   * If the property does not exist on the validationSchema getFieldValid will
   * return true by default.
   * @param property the name of the property to retrieve
   * @return boolean
   */
  public getFieldValid: GetFieldValid<S> = (
    property: keyof S,
    vState: ValidationState = this._validationState,
  ): boolean => {
    if (property in this._validationSchema) {
      return isPropertyValid(property, vState);
    }
    return true;
  };

  /**
   * Executes a validation function on a value and updates the validation state.
   * @param property string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return boolean
   */
  public validate: Validate<S> = (
    property: keyof S,
    value: unknown,
    state?: S,
  ): boolean => {
    if (property in this._validationSchema) {
      const validations = this.runAllValidators(property, value, state);
      this._validationState = {
        ...this._validationState,
        ...validations,
      };
      return isPropertyValid(property, validations);
    }
    return true;
  };

  /**
   * Runs all validations against an object with all values and updates/returns
   * isValid state.
   * @param state any an object that contains all values to be validated
   * @param props string[] property names to check (optional)
   * @return boolean
   */
  public validateAll: ValidateAll<S> = (
    state: S,
    props: (keyof S)[] = Object.keys(this._validationSchema) as (keyof S)[],
  ): boolean => {
    const newState = reduce(
      (acc: ValidationState, property: keyof S) => {
        const r = this.runAllValidators(property, prop(property, state), state);
        return { ...acc, ...r };
      },
      {},
      props,
    );
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
  public validateCustom: ValidateCustom = (
    customValidations: CustomValidation[],
  ): boolean => {
    const zip = converge(this.runAllValidators, [
      prop('key'),
      prop('value'),
      prop('state'),
    ]);
    const state = reduce(
      (acc: any, current: CustomValidation) => {
        return {
          ...acc,
          ...zip(current),
        };
      },
      {},
      customValidations,
    );
    this._validationState = state;
    return this.allValid(state);
  };

  /**
   * Updates the validation state if the validation succeeds.
   * @param key string the name of the property being validated
   * @param value any the value to be tested for validation
   * @return boolean
   */
  public validateIfTrue: ValidateIfTrue<S> = (
    property: keyof S,
    value: unknown,
    state?: S,
  ): boolean => {
    if (property in this._validationSchema) {
      const validations = this.runAllValidators(property, value, state);
      if (isPropertyValid(property, validations)) {
        const updated = { ...this._validationState, ...validations };
        this._validationState = updated;
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
  public validateOnBlur: ValidateOnBlur<S> = (state: S) => {
    return (event: any) => {
      const { value, name } = event.target;
      this.validate(name, value, state);
    };
  };

  /**
   * Create a new onChange function that calls validateIfTrue on a property
   * matching the name of the event whenever a change event happens.
   * @param onChange function to handle onChange events
   * @param state the data controlling the form
   * @return function :: (event: any) => any
   */
  public validateOnChange: ValidateOnChange<S> = (
    onChange: (event: any) => any,
    state: S,
  ) => {
    return (event: any) => {
      const { value, name } = event.target;
      this.validateIfTrue(name, value, state);
      return onChange(event);
    };
  };
}
