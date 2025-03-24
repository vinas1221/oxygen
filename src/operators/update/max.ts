import { UpdateOptions } from "../../core";
import { AnyObject, ArrayOrObject } from "../../types";
import { compare } from "../../util";
import {
  Action,
  applyUpdate,
  UPDATE_OPTIONS,
  walkExpression
} from "./_internal";

/** Updates the value of the field to a specified value if the specified value is greater than the current value of the field. */
export const $max = (
  obj: AnyObject,
  expr: AnyObject,
  arrayFilters: AnyObject[] = [],
  options: UpdateOptions = UPDATE_OPTIONS
) => {
  return walkExpression(expr, arrayFilters, options, ((val, node, queries) => {
    // If the field does not exist, the $max operator sets the field to the specified value.
    return applyUpdate(
      obj,
      node,
      queries,
      (o: ArrayOrObject, k: string | number) => {
        if (o[k] !== undefined && compare(o[k], val) > -1) return false;
        o[k] = val;
        return true;
      },
      { buildGraph: true }
    );
  }) as Action<number | string>);
};
