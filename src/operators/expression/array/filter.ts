// Array Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#array-expression-operators

import {
  ComputeOptions,
  computeValue,
  ExpressionOperator,
  Options
} from "../../../core";
import { Any, AnyObject } from "../../../types";
import { assert, isArray, isNil, truthy } from "../../../util";

/**
 * Selects a subset of the array to return an array with only the elements that match the filter condition.
 *
 * @param  {AnyObject} obj The current document
 * @param  {*} expr The filter spec
 * @return {*}
 */
export const $filter: ExpressionOperator = (
  obj: AnyObject,
  expr: { input: Any[]; as: string; cond: Any },
  options: Options
): Any[] => {
  const input = computeValue(obj, expr.input, null, options) as Any[];

  if (isNil(input)) return null;
  assert(isArray(input), "$filter 'input' expression must resolve to an array");

  const copts = ComputeOptions.init(options, obj);
  const k = expr.as || "this";
  const local = {
    variables: { [k]: null }
  };
  return input.filter((o: Any) => {
    local.variables[k] = o;
    const b = computeValue(
      obj,
      expr.cond,
      null,
      copts.update(copts.root, local)
    );
    // allow empty strings only in strict MongoDB mode (default).
    return truthy(b, options.useStrictMode);
  });
};
