import { ForceValidationState, GetAllErrors, GetError, GetFieldValid, ResetValidationState, Validate, ValidateAll, ValidateCustom, ValidateIfTrue, ValidationSchema, ValidationState } from './types';
export declare class Validation<S> {
    private _validationSchema;
    private _validationState;
    get isValid(): boolean;
    get validationErrors(): string[];
    get validationState(): ValidationState;
    constructor(props: ValidationSchema<S>);
    private createValidationsState;
    resetValidationState: ResetValidationState;
    forceValidationState: ForceValidationState;
    private allValid;
    private runAllValidators;
    getError: GetError<S>;
    getAllErrors: GetAllErrors<S>;
    getFieldValid: GetFieldValid<S>;
    validate: Validate<S>;
    validateAll: ValidateAll<S>;
    validateCustom: ValidateCustom;
    validateIfTrue: ValidateIfTrue<S>;
}
