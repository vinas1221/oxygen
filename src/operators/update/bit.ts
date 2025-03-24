import { UpdateOptions } from "../../core";
import { AnyObject, ArrayOrObject } from "../../types";
import { assert, isNumber } from "../../util";
import {
  Action,
  applyUpdate,
  UPDATE_OPTIONS,
  walkExpression
} from "./_internal";

const BIT_OPS = new Set(["and", "or", "xor"]);

/** Performs a bitwise update of a field. The operator supports AND, OR, and XOR.*/
export const $bit = (
  obj: AnyObject,
  expr: AnyObject,
  arrayFilters: AnyObject[] = [],
  options: UpdateOptions = UPDATE_OPTIONS
) => {
  return walkExpression(expr, arrayFilters, options, ((val, node, queries) => {
    const op = Object.keys(val);
    assert(
      op.length === 1 && BIT_OPS.has(op[0]),
      `Invalid bit operator '${op[0]}'. Must be one of 'and', 'or', or 'xor'.`
    );
    return applyUpdate(
      obj,
      node,
      queries,
      (o: ArrayOrObject, k: number) => {
        let n = o[k] as number;
        const v = val[op[0]] as number;
        if (n !== undefined && !(isNumber(n) && isNumber(v))) return false;
        n = n || 0;

        switch (op[0]) {
          case "and":
            o[k] = n & v;
            break;
          case "or":
            o[k] = n | v;
            break;
          case "xor":
            o[k] = n ^ v;
            break;
        }
        return o[k] !== n;
      },
      { buildGraph: true }
    );
  }) as Action<AnyObject>);
};
