import { Options } from "../../core";
import { Any, AnyObject, WindowOperatorInput } from "../../types";
import { isNil } from "../../util";
import { $push } from "../accumulator/push";
import { withMemo } from "./_internal";

/**
 * Last observation carried forward. Sets values for null and missing fields in a window to the last non-null value for the field.
 */
export const $locf = (
  _: AnyObject,
  collection: AnyObject[],
  expr: WindowOperatorInput,
  options: Options
): Any => {
  return withMemo(
    collection,
    expr,
    () => {
      const values = $push(collection, expr.inputExpr, options);
      for (let i = 1; i < values.length; i++) {
        if (isNil(values[i])) values[i] = values[i - 1];
      }
      return values;
    },
    (series: Any[]) => series[expr.documentNumber - 1]
  );
};
