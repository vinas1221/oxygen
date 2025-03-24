import { UpdateOptions } from "../../core";
import { Any, AnyObject, ArrayOrObject } from "../../types";
import { has, intersection, isObject, unique } from "../../util";
import {
  applyUpdate,
  clone,
  UPDATE_OPTIONS,
  walkExpression
} from "./_internal";

/** Adds a value to an array unless the value is already present. */
export const $addToSet = (
  obj: AnyObject,
  expr: AnyObject,
  arrayFilters: AnyObject[] = [],
  options: UpdateOptions = UPDATE_OPTIONS
) => {
  return walkExpression(expr, arrayFilters, options, (val, node, queries) => {
    const args = { $each: [val] };
    if (isObject(val) && has(val as AnyObject, "$each")) {
      Object.assign(args, val);
    }
    return applyUpdate(
      obj,
      node,
      queries,
      (o: ArrayOrObject, k: string) => {
        const prev = (o[k] ||= []) as Any[];
        const common = intersection([prev, args.$each]);
        if (common.length === args.$each.length) return false;
        o[k] = clone(options.cloneMode, unique(prev.concat(args.$each)));
        return true;
      },
      { buildGraph: true }
    );
  });
};
