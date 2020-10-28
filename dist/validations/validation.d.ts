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
    validate: (property: keyof S, value: unknown, state?: S | undefined) => boolean | undefined;
    validateAll: (state: S, props?: string[]) => boolean;
    validateCustom: (customValidations: CustomValidation[]) => boolean;
    validateIfTrue: (property: keyof S, value: unknown, state?: S | undefined) => boolean | undefined;
    validateOnBlur: (state: S) => (event: any) => void;
    validateOnChange: (onChange: Function, state: S) => (event: any) => any;
}
