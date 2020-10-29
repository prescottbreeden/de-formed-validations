"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = void 0;
const utilities_1 = require("../utilities");
const ramda_1 = require("ramda");
class Validation {
    constructor(props) {
        this.createValidationsState = (schema) => {
            return ramda_1.reduce((prev, item) => ({
                ...prev,
                [item]: {
                    isValid: true,
                    error: '',
                },
            }), {}, Object.keys(schema));
        };
        this.allValid = (state) => {
            const keys = Object.keys(state);
            const valid = ramda_1.reduce((prev, current) => {
                return prev ? utilities_1.isPropertyValid(current, this._validationState) : prev;
            }, true, keys);
            return valid;
        };
        this.runAllValidators = (property, value, state) => {
            const runValidator = utilities_1.compose((func) => func(value, state), utilities_1.prop('validation'));
            const bools = ramda_1.map(runValidator, this._validationSchema[property]);
            const isValid = utilities_1.all(bools);
            const index = bools.indexOf(false);
            const error = index > -1
                ? this._validationSchema[property][index].errorMessage
                : '';
            return {
                [property]: { isValid, error },
            };
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
                return utilities_1.isPropertyValid(property, vState);
            }
            return true;
        };
        this.resetValidationState = () => {
            this._validationState = this.createValidationsState(this._validationSchema);
        };
        this.validate = (property, value, state) => {
            if (property in this._validationSchema) {
                const validations = this.runAllValidators(property, value, state);
                this._validationState = {
                    ...this._validationState,
                    ...validations,
                };
                return utilities_1.isPropertyValid(property, validations);
            }
            return undefined;
        };
        this.validateAll = (state, props = Object.keys(this._validationSchema)) => {
            const newState = ramda_1.reduce((acc, property) => {
                const r = this.runAllValidators(property, utilities_1.prop(property, state), state);
                return { ...acc, ...r };
            }, {}, props);
            this._validationState = newState;
            return this.allValid(newState);
        };
        this.validateCustom = (customValidations) => {
            const zip = ramda_1.converge(this.runAllValidators, [
                utilities_1.prop('key'),
                utilities_1.prop('value'),
                utilities_1.prop('state'),
            ]);
            const state = ramda_1.reduce((prev, current) => {
                return {
                    ...prev,
                    ...zip(current),
                };
            }, {}, customValidations);
            this._validationState = state;
            return this.allValid(state);
        };
        this.validateIfTrue = (property, value, state) => {
            if (property in this._validationSchema) {
                const validations = this.runAllValidators(property, value, state);
                if (utilities_1.isPropertyValid(property, validations)) {
                    const updated = { ...this._validationState, ...validations };
                    this._validationState = updated;
                }
                return utilities_1.isPropertyValid(property, validations);
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
        const errors = ramda_1.reduce((prev, curr) => {
            const err = this.getError(curr);
            return err ? [...prev, err] : prev;
        }, [], props);
        return errors;
    }
    get validationState() {
        return this._validationState;
    }
}
exports.Validation = Validation;
//# sourceMappingURL=validation.js.map