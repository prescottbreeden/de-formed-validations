"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useValidation = void 0;
const react_1 = require("react");
const utilities_1 = require("../utilities");
const ramda_1 = require("ramda");
exports.useValidation = (validationSchema) => {
    const createValidationsState = (schema) => {
        return ramda_1.reduce((acc, key) => ({
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
    const resetValidationState = () => utilities_1.compose(setValidationState, createValidationsState)(validationSchema);
    const forceValidationState = (newValidationState) => {
        setValidationState(newValidationState);
    };
    const runAllValidators = (name, value, state) => {
        const runValidator = utilities_1.compose((func) => func({ ...state, [name]: value }), utilities_1.prop('validation'));
        const bools = ramda_1.map(runValidator, utilities_1.prop(name, validationSchema));
        const errors = bools.reduce((acc, curr, idx) => {
            const errorOf = utilities_1.compose(utilities_1.prop('errorMessage'), utilities_1.prop(idx), utilities_1.prop(name));
            return curr ? acc : [...acc, errorOf(validationSchema)];
        }, []);
        return {
            [name]: {
                isValid: utilities_1.all(bools),
                errors: utilities_1.all(bools) ? [] : errors,
            },
        };
    };
    const validate = (state) => (event) => {
        const { target: { name, value } } = event;
        if (name in validationSchema) {
            const validations = runAllValidators(name, value, state);
            const updated = ramda_1.mergeRight(validationState, validations);
            setValidationState(updated);
            return utilities_1.isPropertyValid(name, validations);
        }
        return true;
    };
    const validateCustom = (customValidations) => {
        const zip = ramda_1.converge(runAllValidators, [
            utilities_1.prop('key'),
            utilities_1.prop('value'),
            utilities_1.prop('state'),
        ]);
        const state = ramda_1.reduce((acc, current) => {
            return ramda_1.mergeRight(acc, zip(current));
        }, {}, customValidations);
        setValidationState(state);
        return allValid(state);
    };
    const validateIfTrue = (state) => (event) => {
        const { target: { name, value } } = event;
        if (name in validationSchema) {
            const validations = runAllValidators(name, value, state);
            if (utilities_1.isPropertyValid(name, validations)) {
                setValidationState(ramda_1.mergeRight(validationState, validations));
            }
            return utilities_1.isPropertyValid(name, validations);
        }
        return true;
    };
    const validateAll = (state, props) => {
        const newState = ramda_1.reduce((acc, property) => {
            const r = runAllValidators(property, utilities_1.prop(property, state), state);
            return ramda_1.mergeRight(acc, r);
        }, {}, props !== null && props !== void 0 ? props : Object.keys(validationSchema));
        setValidationState(newState);
        return allValid(newState);
    };
    const getAllErrors = (property, vState = validationState) => {
        if (property in validationSchema) {
            const val = utilities_1.compose(utilities_1.prop('errors'), utilities_1.prop(property));
            return val(vState);
        }
        return [];
    };
    const getError = (property, vState = validationState) => {
        if (property in validationSchema) {
            const val = utilities_1.compose(ramda_1.head, utilities_1.prop('errors'), utilities_1.prop(property));
            return val(vState) ? val(vState) : '';
        }
        return '';
    };
    const getFieldValid = (property, vState = validationState) => {
        if (property in validationSchema) {
            const val = utilities_1.compose(utilities_1.prop('isValid'), utilities_1.prop(property));
            return val(vState);
        }
        return true;
    };
    const allValid = (state) => {
        return ramda_1.reduce((acc, curr) => {
            return acc ? utilities_1.isPropertyValid(curr, state) : acc;
        }, true, Object.keys(state));
    };
    const generateValidationErrors = (state) => {
        return ramda_1.reduce((acc, curr) => {
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
        validationErrors,
        validationState,
    };
};
//# sourceMappingURL=useValidation.js.map