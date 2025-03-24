import * as samples from "../../support";

samples.runTestPipeline("operators/pipeline/sample", [
  {
    message: "can $sample pipeline input",
    input: [
      { _id: 1, name: "dave123", q1: true, q2: true },
      { _id: 2, name: "dave2", q1: false, q2: false },
      { _id: 3, name: "ahn", q1: true, q2: true },
      { _id: 4, name: "li", q1: true, q2: false },
      { _id: 5, name: "annT", q1: false, q2: true },
      { _id: 6, name: "li", q1: true, q2: true },
      { _id: 7, name: "ty", q1: false, q2: true },
    ],
    pipeline: [{ $sample: { size: 3 } }, { $count: "size" }],
    expected: [{ size: 3 }],
  },
]);
