// Array Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#array-expression-operators

import { computeValue, ExpressionOperator, Options } from "../../../core";
import { Any, AnyObject } from "../../../types";
import { assert, has, isArray, isObject } from "../../../util";

/**
 * Converts an array of key value pairs to a document.
 */
export const $arrayToObject: ExpressionOperator = (
  obj: AnyObject,
  expr: Any,
  options: Options
): AnyObject => {
  const arr = computeValue(obj, expr, null, options) as Any[][];
  assert(isArray(arr), "$arrayToObject: expression must resolve to an array");

  return arr.reduce((newObj: AnyObject, val: Any) => {
    // flatten
    while (isArray(val) && val.length === 1) val = val[0];

    if (isArray(val) && val.length == 2) {
      newObj[val[0] as string] = val[1];
    } else {
      const valObj = val as { k: string; v: Any };
      assert(
        isObject(valObj) && has(valObj, "k") && has(valObj, "v"),
        "$arrayToObject expression is invalid."
      );
      newObj[valObj.k] = valObj.v;
    }
    return newObj;
  }, {});
};
