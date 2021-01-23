export type ValidationFunction<T> = (data: T | Partial<T>) => boolean;
export type ForceValidationState = (validationdata: ValidationState) => void;
export type GetAllErrors<T> = (property: keyof T) => string[];
export type GetError<T> = (property: keyof T) => string;
export type GetFieldValid<T> = (property: keyof T) => boolean;
export type ResetValidationState = () => void;
export type Validate<T> = (
  property: keyof T,
  data: T,
) => boolean;
export type ValidateAll<T> = (data: T) => boolean;
export type ValidateCustom = (vals: CustomValidation[]) => boolean;
export type ValidateIfTrue<T> = (
  property: keyof T,
  data: T | Partial<T>,
) => boolean;
export type ValidateOnBlur<T> = (data: T) => (event: any) => any;
export type ValidateOnChange<T> = (
  onChange: (event: any) => any,
  data: T,
) => (event: any) => any;

export interface ValidationObject<T> {
  forceValidationState: ForceValidationState;
  getError: GetError<T>;
  getAllErrors: GetAllErrors<T>;
  getFieldValid: GetFieldValid<T>;
  isValid: boolean;
  resetValidationState: ResetValidationState;
  validate: Validate<T>;
  validateAll: ValidateAll<T>;
  validateCustom: ValidateCustom;
  validateIfTrue: ValidateIfTrue<T>;
  validateOnBlur: ValidateOnBlur<T>;
  validateOnChange: ValidateOnChange<T>;
  validationErrors: string[];
  validationState: ValidationState;
}

export interface ValidationProps<T> {
  errorMessage: string;
  validation: ValidationFunction<T>;
}

export interface ValidationSchema<T> {
  [key: string]: ValidationProps<T>[];
}

export interface ValidationState {
  [key: string]: {
    isValid: boolean;
    errors: string[];
  };
}

export interface CustomValidation {
  key: string;
  data: any;
}
