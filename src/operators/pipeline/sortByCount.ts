import { Options, PipelineOperator } from "../../core";
import { Iterator } from "../../lazy";
import { Any } from "../../types";
import { $group } from "./group";
import { $sort } from "./sort";

/**
 * Groups incoming documents based on the value of a specified expression,
 * then computes the count of documents in each distinct group.
 *
 * {@link https://docs.mongodb.com/manual/reference/operator/aggregation/sortByCount/ usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $sortByCount: PipelineOperator = (
  collection: Iterator,
  expr: Any,
  options: Options
): Iterator => {
  return $sort(
    $group(collection, { _id: expr, count: { $sum: 1 } }, options),
    { count: -1 },
    options
  );
};
