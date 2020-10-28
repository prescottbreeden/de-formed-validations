"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = void 0;
const utilities_1 = require("../utilities");
class Validation {
    constructor(props) {
        this.createValidationsState = (schema) => {
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
        this.allValid = (state) => {
            const keys = Object.keys(state);
            const valid = keys.reduce((prev, current) => {
                return prev
                    ? this.getFieldValid(current, this._validationState)
                    : prev;
            }, true);
            return valid;
        };
        this.runAllValidators = (property, value, state) => {
            const runValidator = utilities_1.compose((func) => func(value, state), utilities_1.prop('validation'));
            const bools = utilities_1.map(runValidator, this._validationSchema[property]);
            const isValid = utilities_1.all(bools);
            const index = bools.indexOf(false);
            const error = index > -1
                ? this._validationSchema[property][index].errorMessage
                : '';
            const validations = {};
            validations[property] = { isValid, error };
            return validations;
        };
        this.getError = (property) => {
            if (property in this._validationSchema) {
                const val = utilities_1.compose(utilities_1.prop('error'), utilities_1.prop(property));
                return val(this._validationState);
            }
            return '';
        };
        this.getFieldValid = (property, vState = this._validationState) => {
            if (property in this._validationSchema) {
                const val = utilities_1.compose(utilities_1.prop('isValid'), utilities_1.prop(property));
                return val(vState);
            }
            return true;
        };
        this.resetValidationState = () => {
            this._validationState = this.createValidationsState(this._validationSchema);
        };
        this.validate = (property, value, state) => {
            if (property in this._validationSchema) {
                const validations = this.runAllValidators(property, value, state);
                const updated = { ...this._validationState, ...validations };
                this._validationState = updated;
                const bool = validations[property].isValid;
                return bool;
            }
            return undefined;
        };
        this.validateAll = (state, props = Object.keys(this._validationSchema)) => {
            const newState = props.reduce((acc, property) => {
                const r = this.runAllValidators(property, state[property], state);
                acc = { ...acc, ...r };
                return acc;
            }, {});
            this._validationState = newState;
            const result = this.allValid(newState);
            return result;
        };
        this.validateCustom = (customValidations) => {
            const newState = customValidations.reduce((acc, property) => {
                const r = this.runAllValidators(property.key, property.value, property.state);
                acc = { ...acc, ...r };
                return acc;
            }, {});
            this._validationState = newState;
            const result = this.allValid(newState);
            return result;
        };
        this.validateIfTrue = (property, value, state) => {
            if (property in this._validationSchema) {
                const validations = this.runAllValidators(property, value, state);
                if (validations[property].isValid) {
                    const updated = { ...this._validationState, ...validations };
                    this._validationState = updated;
                }
                return validations[property].isValid;
            }
            return undefined;
        };
        this.validateOnBlur = (state) => {
            return (event) => {
                const { value, name } = event.target;
                this.validate(name, value, state);
            };
        };
        this.validateOnChange = (onChange, state) => {
            return (event) => {
                const { value, name } = event.target;
                this.validateIfTrue(name, value, state);
                return onChange(event);
            };
        };
        this._validationSchema = props;
        this._validationState = this.createValidationsState(props);
    }
    get isValid() {
        return this.allValid(this._validationState);
    }
    get validationErrors() {
        const props = Object.keys(this._validationState);
        const errors = props.reduce((prev, curr) => {
            const err = this.getError(curr);
            return err ? [...prev, err] : prev;
        }, []);
        return errors;
    }
    get validationState() {
        return this._validationState;
    }
}
exports.Validation = Validation;
//# sourceMappingURL=validation.js.map