import { initOptions, Options, PipelineOperator } from "../../core";
import { Iterator } from "../../lazy";
import { Any } from "../../types";
import { assert, has, isObject } from "../../util";
import { $ifNull } from "../expression/conditional/ifNull";
import { $linearFill } from "../window/linearFill";
import { $locf } from "../window/locf";
import { $addFields } from "./addFields";
import { $setWindowFields } from "./setWindowFields";

interface InputExpr {
  partitionBy?: Any;
  partitionByFields?: string[];
  sortBy?: Record<string, 1 | -1>;
  output: Record<string, { value: Any } | { method: "linear" | "locf" }>;
}

const FILL_METHODS: Record<string, string> = {
  locf: "$locf",
  linear: "$linearFill"
};

/**
 * Populates null and missing field values within documents.
 *
 * See {@link https://www.mongodb.com/docs/manual/reference/operator/aggregation/fill/ usage}.
 *
 * @param collection
 * @param expr
 * @param options
 * @returns
 */
export const $fill: PipelineOperator = (
  collection: Iterator,
  expr: InputExpr,
  options: Options
): Iterator => {
  assert(!expr.sortBy || isObject(expr.sortBy), "sortBy must be an object.");
  assert(
    !!expr.sortBy || Object.values(expr.output).every(m => has(m, "value")),
    "sortBy required if any output field specifies a 'method'."
  );
  assert(
    !(expr.partitionBy && expr.partitionByFields),
    "specify either partitionBy or partitionByFields."
  );
  assert(
    !expr.partitionByFields ||
      expr?.partitionByFields?.every(s => s[0] !== "$"),
    "fields in partitionByFields cannot begin with '$'."
  );

  options = initOptions(options);
  options.context.addExpressionOps({ $ifNull });
  options.context.addWindowOps({ $locf, $linearFill });

  const partitionExpr =
    expr.partitionBy || expr?.partitionByFields?.map(s => "$" + s);

  // collect and remove all output fields using 'value' instead of 'method'.
  // if there are any fields remaining, process collection using $setWindowFields.
  // if the collected output fields is non-empty, use $addFields to add them to their respective partitions.

  const valueExpr = {};
  const methodExpr = {};
  for (const [k, m] of Object.entries(expr.output)) {
    if (has(m, "value")) {
      // translate to expression for $addFields
      valueExpr[k] = { $ifNull: [`$$CURRENT.${k}`, m["value"]] };
    } else {
      // translate to output expression for $setWindowFields.
      const fillOp = FILL_METHODS[m["method"] as string];
      assert(!!fillOp, `invalid fill method '${m["method"] as string}'.`);
      methodExpr[k] = { [fillOp]: "$" + k };
    }
  }

  // perform filling with $setWindowFields
  if (Object.keys(methodExpr).length > 0) {
    collection = $setWindowFields(
      collection,
      {
        sortBy: expr.sortBy || {},
        partitionBy: partitionExpr,
        output: methodExpr
      },
      options
    );
  }

  // fill with values
  if (Object.keys(valueExpr).length > 0) {
    collection = $addFields(collection, valueExpr, options);
  }

  return collection;
};
