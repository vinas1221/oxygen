// load all operators
// import "../src/init/system";
import { aggregate as srcAggregate, find as srcFind } from "../src";
import {
  computeValue,
  Context,
  initOptions,
  Options,
  ProcessingMode
} from "../src/core";
import { Source } from "../src/lazy";
import * as accumulatorOperators from "../src/operators/accumulator";
import * as expressionOperators from "../src/operators/expression";
import * as pipelineOperators from "../src/operators/pipeline";
import * as projectionOperators from "../src/operators/projection";
import * as queryOperators from "../src/operators/query";
import * as windowOperators from "../src/operators/window";
import { Any, AnyObject, Callback } from "../src/types";
import complexGrades from "./data/grades_complex";
import simpleGrades from "./data/grades_simple";
import person from "./data/person";
import students from "./data/students";

/** The full context of all operators defined in the library. */
const FULL_CONTEXT = Context.init()
  .addAccumulatorOps(accumulatorOperators)
  .addExpressionOps(expressionOperators)
  .addPipelineOps(pipelineOperators)
  .addProjectionOps(projectionOperators)
  .addQueryOps(queryOperators)
  .addWindowOps(windowOperators);

export const DEFAULT_OPTS = initOptions({ context: FULL_CONTEXT });

export const complexGradesData = complexGrades;
export const simpleGradesData = simpleGrades;
export const studentsData = students;
export const personData = person;

export const ISODate = (s: string) => new Date(s);

export const testPath = (filename: string): string =>
  filename.slice(filename.indexOf("test/operators"));

class objectId {
  constructor(readonly _id: string) {}
  toString() {
    return this._id;
  }
  toJSON(): string {
    return this._id;
  }
}
export const ObjectId = (id: string) => new objectId(id);

export const aggregate = (
  coll: Source,
  pipeline: AnyObject[],
  options?: Partial<Options>
) => srcAggregate(coll, pipeline, options ?? DEFAULT_OPTS);

export const find = (
  collection: Source,
  criteria: AnyObject,
  projection?: AnyObject,
  options?: Partial<Options>
) => srcFind(collection, criteria, projection ?? {}, options ?? DEFAULT_OPTS);

export const groupByObjectsData = [
  {
    date_buckets: {
      date: "2015-04-29T00:17:03.107Z",
      day: 28,
      hour: 18,
      minute: 17,
      sec: 3,
      hour_minute: "18:17"
    },
    "Keyword ID": "sr3_4VzRD3sp",
    "Creative ID": "5184986203",
    Keyword: "Bathroom Cleaning Tips",
    "Match Type": "be",
    Device: "m",
    Conversions: [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 0, 0, 0, 0, 0
    ],
    Revenues: [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 0, 0, 0, 0, 0
    ],
    account_id: "baron"
  },
  {
    date_buckets: {
      date: "2015-04-29T00:17:03.107Z",
      day: 28,
      hour: 18,
      minute: 17,
      sec: 3,
      hour_minute: "18:17"
    },
    "Keyword ID": "sr3_K1iQOeXy",
    "Creative ID": "5184986241",
    Keyword: "Cleaning Bathroom Tips",
    "Match Type": "bb",
    Device: "c",
    Conversions: [
      5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 5, 0, 0, 0, 0, 0, 0
    ],
    Revenues: [
      5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 5, 0, 0, 0, 0, 0, 0
    ],
    account_id: "baron"
  },
  {
    date_buckets: {
      date: "2015-04-29T00:17:03.108Z",
      day: 28,
      hour: 18,
      minute: 17,
      sec: 3,
      hour_minute: "18:17"
    },
    "Keyword ID": "sr3_sl0C3VAYk",
    "Creative ID": "44210589597",
    Keyword: "best way to clean a bathroom",
    "Match Type": "b",
    Device: "c",
    Conversions: [
      4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 4, 0, 0, 0, 0, 0, 0
    ],
    Revenues: [
      4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 4, 0, 0, 0, 0, 0, 0
    ],
    account_id: "baron"
  },
  {
    date_buckets: {
      date: "2015-04-29T00:17:03.108Z",
      day: 28,
      hour: 18,
      minute: 17,
      sec: 3,
      hour_minute: "18:17"
    },
    "Keyword ID": "sr3_4VzRD3sp",
    "Creative ID": "5184986204",
    Keyword: "Bathroom Cleaning Tips",
    "Match Type": "be",
    Device: "c",
    Conversions: [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 0, 0, 0, 0, 0
    ],
    Revenues: [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 0, 0, 0, 0, 0
    ],
    account_id: "baron"
  },
  {
    date_buckets: {
      date: "2015-04-29T00:17:03.107Z",
      day: 28,
      hour: 18,
      minute: 17,
      sec: 3,
      hour_minute: "18:17"
    },
    "Keyword ID": "sr3_HZAarvKy",
    "Creative ID": "6074827333",
    Keyword: "Drain Clogs",
    "Match Type": "bp",
    Device: "c",
    Conversions: [1, 0, 0, 1, 0, 0, 0, 0, 0],
    Revenues: [5, 0, 0, 5, 0, 0, 0, 0, 0],
    account_id: "baron"
  },
  {
    date_buckets: {
      date: "2015-04-29T00:17:03.107Z",
      day: 28,
      hour: 18,
      minute: 17,
      sec: 3,
      hour_minute: "18:17"
    },
    "Keyword ID": "sr3_irU8fFk0",
    "Creative ID": "6074827289",
    Keyword: "unclog bathtub drain",
    "Match Type": "bp",
    Device: "c",
    Conversions: [1, 0, 0, 1, 0, 0, 0, 0, 0],
    Revenues: [5, 0, 0, 5, 0, 0, 0, 0, 0],
    account_id: "baron"
  }
];

export function runTest(
  description: string,
  suite: Record<string, Any[]>
): void {
  Object.entries(suite).forEach(arr => {
    const operator = arr[0];
    const examples = arr[1] as Any[][];
    describe(description, () => {
      describe(operator, () => {
        examples.forEach(val => {
          let input = val[0] as AnyObject;
          let expected = val[1];
          const ctx = (val[2] || { err: false }) as AnyObject;
          const obj = ctx?.obj || {};

          let field: string | null = operator;
          // use the operator as field if not present in input
          if (!!input && input.constructor === Object) {
            field = Object.keys(input).find(s => s[0] === "$") || null;
            if (!field) {
              field = operator;
            } else {
              input = input[field] as AnyObject;
            }
          }

          const prefix = `can apply ${operator}(${JSON.stringify(input)})`;

          if (ctx.err) {
            it(`${prefix} => Error("${expected as string}")`, () => {
              expect(() => computeValue(obj, input, field)).toThrowError();
            });
          } else {
            it(`${prefix} => ${JSON.stringify(expected)}`, () => {
              let actual = computeValue(obj, input, field, DEFAULT_OPTS);
              // NaNs don't compare
              if (actual !== actual && expected !== expected) {
                actual = expected = 0;
              }
              expect(actual).toEqual(expected);
            });
          }
        });
      });
    });
  });
}

interface PipelineTestSuite {
  input: Any[];
  pipeline: AnyObject[];
  expected: Any;
  message: string;
  options?: Partial<Options>;
}
/**
 * run pipeline test
 */
export function runTestPipeline(
  description: string,
  suite: PipelineTestSuite[]
): void {
  describe(description, () => {
    suite.forEach(unitTest => {
      const { input, pipeline, expected, message, options } = unitTest;
      const actual = aggregate(input, pipeline, {
        ...DEFAULT_OPTS,
        ...options,
        processingMode: ProcessingMode.CLONE_INPUT
      });
      it(message, () => {
        if (typeof expected === "function") {
          const cb = expected as Callback<Any>;
          cb(actual);
        } else {
          expect(actual).toEqual(expected);
        }
      });
    });
  });
}
