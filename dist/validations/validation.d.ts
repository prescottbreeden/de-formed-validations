import { CustomValidation, ValidationSchema, ValidationState } from './types';
export declare class Validation<S> {
    private _validationSchema;
    private _validationState;
    get isValid(): boolean;
    get validationErrors(): string[];
    get validationState(): ValidationState;
    constructor(props: ValidationSchema<S>);
    private createValidationsState;
    private allValid;
    private runAllValidators;
    getError: (property: keyof S) => any;
    getFieldValid: (property: keyof S, vState?: ValidationState) => any;
    resetValidationState: () => void;
    validate: (property: keyof S, value: unknown, state?: S | undefined) => any;
    validateAll: (state: S, props?: [keyof S]) => boolean;
    validateCustom: (customValidations: CustomValidation[]) => boolean;
    validateIfTrue: (property: keyof S, value: unknown, state?: S | undefined) => any;
    validateOnBlur: (state: S) => (event: any) => void;
    validateOnChange: (onChange: Function, state: S) => (event: any) => any;
}
