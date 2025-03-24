// Custom Aggregation Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#custom-aggregation-expression-operators

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject, Callback } from "../../../types";
import { assert } from "../../../util";

interface FunctionExpr {
  readonly body: Callback<Any>;
  readonly args: Any[];
  readonly lang: "js";
}

/**
 * Defines a custom function.
 *
 * @param {*} obj The target object for this expression
 * @param {*} expr The expression for the operator
 * @param {Options} options Options
 */
export const $function: ExpressionOperator = (
  obj: AnyObject,
  expr: FunctionExpr,
  options: Options
): Any => {
  assert(
    options.scriptEnabled,
    "$function operator requires 'scriptEnabled' option to be true"
  );
  const fn = computeValue(obj, expr, null, options) as FunctionExpr;
  return fn.body.apply(null, fn.args) as Any;
};
