import { UpdateOptions } from "../../core";
import { AnyObject, ArrayOrObject } from "../../types";
import {
  Action,
  applyUpdate,
  UPDATE_OPTIONS,
  walkExpression
} from "./_internal";

/** Multiply the value of a field by a number. */
export const $mul = (
  obj: AnyObject,
  expr: Record<string, number>,
  arrayFilters: AnyObject[] = [],
  options: UpdateOptions = UPDATE_OPTIONS
) => {
  return walkExpression(expr, arrayFilters, options, ((val, node, queries) => {
    return applyUpdate(
      obj,
      node,
      queries,
      (o: ArrayOrObject, k: string | number) => {
        const prev = o[k] as number;
        o[k] = o[k] === undefined ? 0 : o[k] * val;
        return o[k] !== prev;
      },
      { buildGraph: true }
    );
  }) as Action<number>);
};
