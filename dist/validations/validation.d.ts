import { CustomValidation, ValidationSchema, ValidationState } from './types';
export declare class Validation<S> {
    private _validationSchema;
    private _validationState;
    get isValid(): boolean;
    get validationErrors(): string[];
    get validationState(): ValidationState;
    constructor(props: ValidationSchema<S>);
    private createValidationsState;
    resetValidationState: () => void;
    forceValidationState: (newValidationState: ValidationState) => void;
    private allValid;
    private runAllValidators;
    getError: (property: keyof S) => string | null;
    getAllErrors: (property: keyof S) => string[];
    getFieldValid: (property: keyof S, vState?: ValidationState) => any;
    validate: (property: keyof S, value: unknown, state?: S | undefined) => any;
    validateAll: (state: S, props?: (keyof S)[]) => boolean;
    validateCustom: (customValidations: CustomValidation[]) => boolean;
    validateIfTrue: (property: keyof S, value: unknown, state?: S | undefined) => any;
    validateOnBlur: (state: S) => (event: any) => void;
    validateOnChange: (onChange: (event: any) => any, state: S) => (event: any) => any;
}
