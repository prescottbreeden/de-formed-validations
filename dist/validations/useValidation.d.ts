import { ChangeEvent } from 'react';
import { ValidationSchema, ValidationState, CustomValidation } from './types';
export declare const useValidation: <S>(validationSchema: ValidationSchema<S>) => {
    getError: (property: string, vState?: ValidationState) => any;
    getFieldValid: (property: string, vState?: ValidationState) => any;
    isValid: boolean;
    resetValidationState: () => void;
    validate: (property: string, value: unknown, state?: S | undefined) => any;
    validateAll: (state: S, props?: string[]) => boolean;
    validateCustom: (customValidations: CustomValidation[]) => boolean;
    validateIfTrue: (property: string, value: unknown, state?: S | undefined) => any;
    validateOnBlur: (state: S) => (event: ChangeEvent<HTMLInputElement>) => void;
    validateOnChange: (onChange: (event: any) => any, state: S) => (event: ChangeEvent<HTMLInputElement>) => any;
    validationErrors: string[];
    validationState: ValidationState;
};
