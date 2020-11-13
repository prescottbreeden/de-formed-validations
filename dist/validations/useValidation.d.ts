import { ChangeEvent } from 'react';
import { ValidationSchema, ValidationState, CustomValidation } from './types';
export declare const useValidation: <S>(validationSchema: ValidationSchema<S>) => {
    forceValidationState: (newValidationState: ValidationState) => void;
    getAllErrors: (property: keyof S, vState?: ValidationState) => string[];
    getError: (property: keyof S, vState?: ValidationState) => string | null;
    getFieldValid: (property: keyof S, vState?: ValidationState) => any;
    isValid: boolean;
    resetValidationState: () => void;
    validate: (property: keyof S, value: unknown, state?: S | undefined) => any;
    validateAll: (state: S, props?: (keyof S)[]) => boolean;
    validateCustom: (customValidations: CustomValidation[]) => boolean;
    validateIfTrue: (property: keyof S, value: unknown, state?: S | undefined) => any;
    validateOnBlur: (state: S) => (event: ChangeEvent<HTMLInputElement>) => void;
    validateOnChange: (onChange: (event: any) => any, state: S) => (event: ChangeEvent<HTMLInputElement>) => any;
    validationErrors: string[];
    validationState: ValidationState;
};
