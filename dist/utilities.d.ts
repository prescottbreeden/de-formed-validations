import { ValidationState } from "./validations/types";
export declare const compose: (...fns: Function[]) => (...args: any[]) => any;
export declare const prop: (...args: any[]) => any;
export declare const all: (list: readonly any[]) => any;
export declare function isPropertyValid<S>(property: keyof S, validations: ValidationState): any;
