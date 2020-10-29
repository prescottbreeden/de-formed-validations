import { ValidationState } from './validations/types';
declare type AnyFunction = (...arge: any) => any;
export declare const compose: (...fns: AnyFunction[]) => (...args: any[]) => any;
export declare const prop: (...args: any[]) => any;
export declare const all: (list: readonly any[]) => any;
export declare function isPropertyValid<S>(property: keyof S, validations: ValidationState): any;
export {};
