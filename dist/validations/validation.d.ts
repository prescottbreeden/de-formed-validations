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
    getError: (property: string) => any;
    getFieldValid: (property: string, vState?: ValidationState) => any;
    resetValidationState: () => void;
    validate: (property: string, value: unknown, state?: S | undefined) => any;
    validateAll: (state: S, props?: string[]) => boolean;
    validateCustom: (customValidations: CustomValidation[]) => boolean;
    validateIfTrue: (property: string, value: unknown, state?: S | undefined) => any;
    validateOnBlur: (state: S) => (event: any) => void;
    validateOnChange: (onChange: (event: any) => any, state: S) => (event: any) => any;
}
