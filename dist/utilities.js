"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPropertyValid = exports.all = exports.prop = exports.compose = void 0;
const ramda_1 = require("ramda");
function curry(fn) {
    const arity = fn.length;
    return function $curry(...args) {
        if (args.length < arity) {
            return $curry.bind(null, ...args);
        }
        return fn.call(null, ...args);
    };
}
exports.compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];
exports.prop = curry((p, obj) => (obj ? obj[p] : undefined));
const reduceTruthy = (acc, current) => {
    return current ? acc : false;
};
exports.all = ramda_1.reduce(reduceTruthy, true);
function isPropertyValid(property, validations) {
    return exports.compose(exports.prop('isValid'), exports.prop(property))(validations);
}
exports.isPropertyValid = isPropertyValid;
//# sourceMappingURL=utilities.js.map