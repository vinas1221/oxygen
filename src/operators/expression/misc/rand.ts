// Miscellaneous Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/rand/#mongodb-expression-exp.-rand

import { Options } from "../../../core";
import { Any, AnyObject } from "../../../types";

/**
 * Returns a random float between 0 and 1.
 *
 * @param {*} _obj The target object for this expression
 * @param {*} _expr The right-hand side of the operator
 * @param {Options} _options Options to use for operation
 */
export const $rand = (_obj: AnyObject, _expr: Any, _options: Options): number =>
  Math.random();
