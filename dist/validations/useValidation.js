"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useValidation = void 0;
const react_1 = require("react");
const utilities_1 = require("../utilities");
exports.useValidation = (validationSchema) => {
    const createValidationsState = (schema) => {
        const keys = Object.keys(schema);
        const vState = keys.reduce((prev, item) => {
            prev[item] = {
                isValid: true,
                error: '',
            };
            return prev;
        }, {});
        return vState;
    };
    const resetValidationState = () => {
        setValidationState(createValidationsState(validationSchema));
    };
    const [isValid, setIsValid] = react_1.useState(true);
    const [validationState, setValidationState] = react_1.useState(createValidationsState(validationSchema));
    const [validationErrors, setValidationErros] = react_1.useState([]);
    const runAllValidators = (property, value, state) => {
        const val = typeof value === 'string' ? value.trim() : value;
        const runValidator = utilities_1.compose((func) => func(val, state), utilities_1.prop('validation'));
        const bools = utilities_1.map(runValidator, validationSchema[property]);
        const isValid = utilities_1.all(bools);
        const index = bools.indexOf(false);
        const error = index > -1
            ? validationSchema[property][index].errorMessage
            : '';
        const validations = {};
        validations[property] = { isValid, error };
        return validations;
    };
    const validate = (property, value, state) => {
        if (property in validationSchema) {
            const validations = runAllValidators(property, value, state);
            const updated = { ...validationState, ...validations };
            setValidationState(updated);
            return validations[property].isValid;
        }
        return undefined;
    };
    const validateCustom = (customValidations) => {
        const bools = utilities_1.map((custom) => {
            return validate(custom.key, custom.value, custom.state);
        }, customValidations);
        return utilities_1.all(bools);
    };
    const validateIfTrue = (property, value, state) => {
        if (property in validationSchema) {
            const validations = runAllValidators(property, value, state);
            if (validations[property].isValid) {
                setValidationState({ ...validationState, ...validations });
            }
            return validations[property].isValid;
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
        const newState = props.reduce((acc, property) => {
            const r = runAllValidators(property, state[property], state);
            acc = { ...acc, ...r };
            return acc;
        }, {});
        setValidationState(newState);
        const result = allValid(newState);
        setIsValid(result);
        return result;
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
        const keys = Object.keys(state);
        const valid = keys.reduce((prev, current) => {
            return prev ? getFieldValid(current, state) : prev;
        }, true);
        return valid;
    };
    const generateValidationErrors = (state) => {
        const keys = Object.keys(state);
        return keys.reduce((prev, curr) => {
            return getError(curr)
                ? [...prev, getError(curr)]
                : prev;
        }, []);
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