export declare type ValidationFunction<S> = (val: any, state: S) => boolean | ((val: any) => boolean);
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
        errors: string[];
    };
}
export interface ValidationObject<S> {
    forceValidationState: (validationState: ValidationState) => void;
    getError: (property: keyof S) => string | null;
    getAllErrors: (property: keyof S) => string[];
    getFieldValid: (property: keyof S) => boolean;
    isValid: boolean;
    resetValidationState: () => void;
    validate: (property: keyof S, value: unknown, state?: S) => boolean | undefined;
    validateAll: (state: S, keys?: (keyof S)[]) => boolean;
    validateCustom: (vals: CustomValidation[]) => boolean;
    validateIfTrue: (property: keyof S, value: unknown, state?: S) => boolean | undefined;
    validateOnBlur: (state: S) => (event: any) => unknown;
    validateOnChange: (onChange: (event: any) => unknown, state: S) => (event: any) => unknown;
    validationErrors: string[];
    validationState: ValidationState;
}
export interface CustomValidation {
    key: string;
    value: any;
    state?: any;
}
export {};
