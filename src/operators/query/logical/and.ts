// Query Logical Operators: https://docs.mongodb.com/manual/reference/operator/query-logical/

import { Options, QueryOperator } from "../../../core";
import { Query } from "../../../query";
import { AnyObject, Callback } from "../../../types";
import { assert, isArray } from "../../../util";

/**
 * Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.
 *
 * @param selector
 * @param rhs
 * @returns {Function}
 */
export const $and: QueryOperator = (
  _: string,
  rhs: AnyObject[],
  options: Options
): Callback<boolean> => {
  assert(
    isArray(rhs),
    "Invalid expression: $and expects value to be an Array."
  );
  const queries = rhs.map(expr => new Query(expr, options));
  return (obj: AnyObject) => queries.every(q => q.test(obj));
};
