import { computeValue, Options } from "../../core";
import { Any, AnyObject, WindowOperatorInput } from "../../types";

/**
 * Returns the value from an expression applied to a document in a specified
 * position relative to the current document in the $setWindowFields stage partition.
 */
export const $shift = (
  obj: AnyObject,
  collection: AnyObject[],
  expr: WindowOperatorInput,
  options: Options
): Any => {
  const input = expr.inputExpr as {
    output: Any;
    by: number;
    default?: Any;
  };

  const shiftedIndex = expr.documentNumber - 1 + input.by;
  if (shiftedIndex < 0 || shiftedIndex > collection.length - 1) {
    return input.default
      ? computeValue(obj, input.default, null, options)
      : null;
  }
  return computeValue(collection[shiftedIndex], input.output, null, options);
};
