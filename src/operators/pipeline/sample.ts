// $sample operator -  https://docs.mongodb.com/manual/reference/operator/aggregation/sample/

import { Options, PipelineOperator } from "../../core";
import { Iterator } from "../../lazy";
import { Any } from "../../types";

/**
 * Randomly selects the specified number of documents from its input.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/sample/ usage}.
 *
 * @param collection
 * @param expr
 * @param _options
 * @returns
 */
export const $sample: PipelineOperator = (
  collection: Iterator,
  expr: { size: number },
  _options: Options
): Iterator => {
  return collection.transform((xs: Any[]) => {
    const len = xs.length;
    let i = -1;
    return () => {
      if (++i === expr.size) return { done: true };
      const n = Math.floor(Math.random() * len);
      return { value: xs[n], done: false };
    };
  });
};
