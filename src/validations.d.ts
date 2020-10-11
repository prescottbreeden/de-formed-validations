interface ValidationFunction<S> {
  (val: any, state: S): boolean;
}

interface ValidationProps<S> {
  errorMessage: string;
  validation: ValidationFunction<S>;
}

export interface ValidationSchema<S> {
  [key: string]: ValidationProps<S>[];
}

export interface ValidationState {
  [key: string]: {
    isValid: boolean;
    error: string;
  };
}

export interface ValidationObject<S> {
  getError: (property: keyof S) => string;
  getFieldValid: (property: keyof S) => boolean;
  isValid: boolean;
  validate: (
    property: keyof S,
    value: unknown,
    state: S
  ) => boolean | undefined;
  validateAll: (state: S) => boolean;
  validateIfTrue: (
    property: keyof S,
    value: unknown,
    state: S
  ) => boolean | undefined;
  validateOnBlur: (state: S) => (event: any) => unknown;
  validateOnChange: (
    onChange: (event: any) => unknown,
    state: S
  ) => (event: any) => unknown;
  validationErrors: string[];
  validationState: ValidationState;
}

export interface CustomValidation {
  key: string;
  value: any;
  state?: any;
}
