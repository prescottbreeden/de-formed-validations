"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useValidation = void 0;
const react_1 = require("react");
const utilities_1 = require("../utilities");
const ramda_1 = require("ramda");
exports.useValidation = (validationSchema) => {
    const createValidationsState = (schema) => {
        return ramda_1.reduce((prev, key) => ({
            ...prev,
            [key]: {
                isValid: true,
                error: '',
            }
        }), {}, Object.keys(schema));
    };
    const resetValidationState = () => utilities_1.compose(setValidationState, createValidationsState)(validationSchema);
    const [isValid, setIsValid] = react_1.useState(true);
    const [validationState, setValidationState] = react_1.useState(createValidationsState(validationSchema));
    const [validationErrors, setValidationErros] = react_1.useState([]);
    const runAllValidators = (property, value, state) => {
        const runValidator = utilities_1.compose((func) => func(value, state), utilities_1.prop('validation'));
        const bools = ramda_1.map(runValidator, utilities_1.prop(property, validationSchema));
        const isValid = utilities_1.all(bools);
        const index = bools.indexOf(false);
        const error = index > -1
            ? validationSchema[property][index].errorMessage
            : '';
        return {
            [property]: { isValid, error }
        };
    };
    const validate = (property, value, state) => {
        if (property in validationSchema) {
            const validations = runAllValidators(property, value, state);
            const updated = { ...validationState, ...validations };
            setValidationState(updated);
            return utilities_1.isPropertyValid(property, validations);
        }
        return undefined;
    };
    const validateCustom = (customValidations) => {
        const bools = ramda_1.map(ramda_1.converge(validate, [
            utilities_1.prop('key'),
            utilities_1.prop('value'),
            utilities_1.prop('state')
        ]), customValidations);
        return utilities_1.all(bools);
    };
    const validateIfTrue = (property, value, state) => {
        if (property in validationSchema) {
            const validations = runAllValidators(property, value, state);
            if (utilities_1.isPropertyValid(property, validations)) {
                setValidationState({ ...validationState, ...validations });
            }
            return utilities_1.isPropertyValid(property, validations);
        }
        return undefined;
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
        const newState = ramda_1.reduce((acc, property) => {
            const r = runAllValidators(property, utilities_1.prop(property, state), state);
            return {
                ...acc,
                ...r
            };
        }, {}, props);
        setValidationState(newState);
        return allValid(newState);
    };
    const getError = (property, vState = validationState) => {
        if (property in validationSchema) {
            const val = utilities_1.compose(utilities_1.prop('error'), utilities_1.prop(property));
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
        return ramda_1.reduce((prev, curr) => {
            return prev
                ? utilities_1.isPropertyValid(curr, state)
                : prev;
        }, true, Object.keys(state));
    };
    const generateValidationErrors = (state) => {
        return ramda_1.reduce((prev, curr) => {
            return getError(curr)
                ? [...prev, getError(curr)]
                : prev;
        }, [], Object.keys(state));
    };
    const updateIsValid = react_1.useCallback(allValid, [validationState]);
    const updateErrors = react_1.useCallback(generateValidationErrors, [validationState]);
    react_1.useEffect(() => {
        setIsValid(updateIsValid(validationState));
        setValidationErros(updateErrors(validationState));
    }, [validationState, updateIsValid]);
    return {
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