// Query Evaluation Operators: https://docs.mongodb.com/manual/reference/operator/query-evaluation/

import { computeValue, Options } from "../../../core";
import { Any, Callback } from "../../../types";

/**
 * Allows the use of aggregation expressions within the query language.
 *
 * @param selector
 * @param rhs
 * @returns {Function}
 */
export function $expr(
  _: string,
  rhs: Any,
  options: Options
): Callback<boolean> {
  return obj => computeValue(obj, rhs, null, options) as boolean;
}
