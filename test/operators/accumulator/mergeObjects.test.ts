import * as samples from "../../support";

samples.runTestPipeline("operators/accumulator/mergeObjects", [
  {
    message: "$mergeObjects as an Accumulator",
    input: [
      {
        _id: 1,
        year: 2017,
        item: "A",
        quantity: { "2017Q1": 500, "2017Q2": 500 }
      },
      {
        _id: 2,
        year: 2016,
        item: "A",
        quantity: { "2016Q1": 400, "2016Q2": 300, "2016Q3": 0, "2016Q4": 0 }
      },
      { _id: 3, year: 2017, item: "B", quantity: { "2017Q1": 300 } },
      {
        _id: 4,
        year: 2016,
        item: "B",
        quantity: { "2016Q3": 100, "2016Q4": 250 }
      }
    ],
    pipeline: [
      { $group: { _id: "$item", mergedSales: { $mergeObjects: "$quantity" } } }
    ],
    expected: [
      {
        _id: "A",
        mergedSales: {
          "2017Q1": 500,
          "2017Q2": 500,
          "2016Q1": 400,
          "2016Q2": 300,
          "2016Q3": 0,
          "2016Q4": 0
        }
      },
      {
        _id: "B",
        mergedSales: { "2017Q1": 300, "2016Q3": 100, "2016Q4": 250 }
      }
    ]
  }
]);
