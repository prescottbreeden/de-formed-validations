"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useValidation = void 0;
const react_1 = require("react");
const utilities_1 = require("../utilities");
const fp_tools_1 = require("fp-tools");
exports.useValidation = (validationSchema) => {
    const createValidationsState = (schema) => {
        return fp_tools_1.reduce((acc, key) => ({
            ...acc,
            [key]: {
                isValid: true,
                errors: [],
            },
        }), {}, Object.keys(schema));
    };
    const [isValid, setIsValid] = react_1.useState(true);
    const [validationState, setValidationState] = react_1.useState(createValidationsState(validationSchema));
    const [validationErrors, setValidationErros] = react_1.useState([]);
    const resetValidationState = () => fp_tools_1.compose(setValidationState, createValidationsState)(validationSchema);
    const forceValidationState = (newValidationState) => {
        setValidationState(newValidationState);
    };
    const runAllValidators = (property, value, state) => {
        const localState = state ? state : {};
        const runValidator = fp_tools_1.compose((func) => func(value, localState), fp_tools_1.prop('validation'));
        const bools = fp_tools_1.map(runValidator, fp_tools_1.prop(property, validationSchema));
        const allValidationsValid = utilities_1.all(bools);
        const errors = bools.reduce((acc, curr, idx) => {
            const errorOf = fp_tools_1.compose(fp_tools_1.prop('errorMessage'), fp_tools_1.prop(idx), fp_tools_1.prop(property));
            return curr ? acc : [...acc, errorOf(validationSchema)];
        }, []);
        return {
            [property]: {
                isValid: allValidationsValid,
                errors: allValidationsValid ? [] : errors,
            },
        };
    };
    const validate = (property, value, state) => {
        if (property in validationSchema) {
            const validations = runAllValidators(property, value, state);
            setValidationState({ ...validationState, ...validations });
            return utilities_1.isPropertyValid(property, validations);
        }
        return true;
    };
    const validateCustom = (customValidations) => {
        const zip = fp_tools_1.converge(runAllValidators, [
            fp_tools_1.prop('key'),
            fp_tools_1.prop('value'),
            fp_tools_1.prop('state'),
        ]);
        const state = fp_tools_1.reduce((acc, current) => {
            return mergeRight(acc, zip(current));
        }, {}, customValidations);
        setValidationState(state);
        return allValid(state);
    };
    const validateIfTrue = (property, value, state) => {
        if (property in validationSchema) {
            const validations = runAllValidators(property, value, state);
            if (utilities_1.isPropertyValid(property, validations)) {
                setValidationState(mergeRight(validationState, validations));
            }
            return utilities_1.isPropertyValid(property, validations);
        }
        return true;
    };
    const validateOnBlur = (state) => (event) => {
        const { value, name } = event.target;
        validate(name, value, state);
    };
    const validateOnChange = (onChange, state) => (event) => {
        const { value, name } = event.target;
        validateIfTrue(name, value, state);
        return onChange(event);
    };
    const validateAll = (state, props = Object.keys(validationSchema)) => {
        const newState = fp_tools_1.reduce((acc, property) => {
            const r = runAllValidators(property, fp_tools_1.prop(property, state), state);
            return mergeRight(acc, r);
        }, {}, props);
        const updated = mergeRight(validationState, newState);
        setValidationState(updated);
        return allValid(newState);
    };
    const getAllErrors = (property, vState = validationState) => {
        if (property in validationSchema) {
            const val = fp_tools_1.compose(fp_tools_1.prop('errors'), fp_tools_1.prop(property));
            return val(vState);
        }
        return [];
    };
    const getError = (property, vState = validationState) => {
        if (property in validationSchema) {
            const val = fp_tools_1.compose(fp_tools_1.head, fp_tools_1.prop('errors'), fp_tools_1.prop(property));
            return val(vState) ? val(vState) : '';
        }
        return '';
    };
    const getFieldValid = (property, vState = validationState) => {
        if (property in validationSchema) {
            const val = fp_tools_1.compose(fp_tools_1.prop('isValid'), fp_tools_1.prop(property));
            return val(vState);
        }
        return true;
    };
    const allValid = (state) => {
        return fp_tools_1.reduce((acc, curr) => {
            return acc ? utilities_1.isPropertyValid(curr, state) : acc;
        }, true, Object.keys(state));
    };
    const generateValidationErrors = (state) => {
        return fp_tools_1.reduce((acc, curr) => {
            return getError(curr) ? [...acc, getError(curr)] : acc;
        }, [], Object.keys(state));
    };
    const updateIsValid = react_1.useCallback(allValid, [validationState]);
    const updateErrors = react_1.useCallback(generateValidationErrors, [validationState]);
    react_1.useEffect(() => {
        setIsValid(updateIsValid(validationState));
        setValidationErros(updateErrors(validationState));
    }, [validationState, updateIsValid]);
    return {
        forceValidationState,
        getAllErrors,
        getError,
        getFieldValid,
        isValid,
        resetValidationState,
        validate,
        validateAll,
        validateCustom,
        validateIfTrue,
        validateOnBlur,
        validateOnChange,
        validationErrors,
        validationState,
    };
};
//# sourceMappingURL=useValidation.js.map