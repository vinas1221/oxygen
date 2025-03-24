/**
 * Type Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#type-expression-operators
 */

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";
import { isNumber, isRegExp, typeOf } from "../../../util";
import { MAX_INT, MIN_INT } from "./_internal";

export const $type: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): string => {
  const v = computeValue(obj, expr, null, options);
  if (options.useStrictMode) {
    if (v === undefined) return "missing";
    if (v === true || v === false) return "bool";
    if (isNumber(v)) {
      if (v % 1 != 0) return "double";
      return v >= MIN_INT && v <= MAX_INT ? "int" : "long";
    }
    if (isRegExp(v)) return "regex";
  }
  return typeOf(v);
};
