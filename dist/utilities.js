"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allValid = exports.baseValidateAll = exports.baseValidateOnChange = exports.baseValidateOnBlur = exports.baseValidateIfTrue = exports.baseValidateCustom = exports.baseValidate = exports.baseRunAllValidators = exports.all = exports.prop = exports.reduce = exports.map = exports.curry = exports.compose = void 0;
exports.compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];
function curry(fn) {
    const arity = fn.length;
    return function $curry(...args) {
        if (args.length < arity) {
            return $curry.bind(null, ...args);
        }
        return fn.call(null, ...args);
    };
}
exports.curry = curry;
exports.map = curry((f, xs) => xs.map(f));
exports.reduce = curry((f, x, xs) => xs.reduce(f, x));
exports.prop = curry((p, obj) => (obj ? obj[p] : undefined));
const reduceTruthy = (prev, current) => {
    return !!current ? prev : false;
};
exports.all = exports.reduce(reduceTruthy, true);
function baseRunAllValidators(schema) {
    return (property, value, state) => {
        const val = typeof value === 'string' ? value.trim() : value;
        const runValidator = exports.compose((func) => func(val, state), exports.prop('validation'));
        const bools = exports.map(runValidator, schema[property]);
        const isValid = exports.all(bools);
        const index = bools.indexOf(false);
        const error = index > -1
            ? schema[property][index].errorMessage
            : '';
        const validations = {};
        validations[property] = { isValid, error };
        return validations;
    };
}
exports.baseRunAllValidators = baseRunAllValidators;
function baseValidate(schema, setValidationState) {
    const runAllValidators = baseRunAllValidators(schema);
    return (property, value, state) => {
        if (property in schema) {
            const validations = runAllValidators(property, value, state);
            const updated = { ...schema, ...validations };
            setValidationState(updated);
            return validations[property].isValid;
        }
        return undefined;
    };
}
exports.baseValidate = baseValidate;
function baseValidateCustom(validate) {
    return (customValidations, object) => {
        const bools = exports.map((custom) => {
            return object
                ? validate(custom.key, custom.value, object)
                : validate(custom.key, custom.value, {});
        }, customValidations);
        return exports.all(bools);
    };
}
exports.baseValidateCustom = baseValidateCustom;
function baseValidateIfTrue(schema, runAllValidators, setValidationState) {
    return function (property, value, state) {
        if (property in schema) {
            const validations = runAllValidators(property, value, state);
            if (validations[property].isValid) {
                setValidationState({ ...ValidityState, ...validations });
            }
            return validations[property].isValid;
        }
        return undefined;
    };
}
exports.baseValidateIfTrue = baseValidateIfTrue;
function baseValidateOnBlur(validate) {
    return (state) => (event) => {
        const { value, name } = event.target;
        validate(name, value, state);
    };
}
exports.baseValidateOnBlur = baseValidateOnBlur;
function baseValidateOnChange(validateIfTrue) {
    return (onChange, state) => (event) => {
        const { value, name } = event.target;
        validateIfTrue(name, value, state);
        return onChange(event);
    };
}
exports.baseValidateOnChange = baseValidateOnChange;
function baseValidateAll(schema, runAllValidators, setValidationState) {
    return (state, props = Object.keys(schema)) => {
        const newState = props.reduce((acc, property) => {
            const r = runAllValidators(property, state[property], state);
            acc = { ...acc, ...r };
            return acc;
        }, {});
        setValidationState(newState);
        const result = exports.allValid(newState);
        return result;
    };
}
exports.baseValidateAll = baseValidateAll;
exports.allValid = (state) => {
    const keys = Object.keys(state);
    const valid = keys.reduce((prev, current) => {
        return prev ? state[current].isValid : prev;
    }, true);
    return valid;
};
//# sourceMappingURL=utilities.js.map