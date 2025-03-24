import { Any } from "../../../src/types";
import * as samples from "../../support";

samples.runTestPipeline("operators/pipeline/skip", [
  {
    message: "can skip result with $skip",
    input: samples.studentsData,
    pipeline: [{ $skip: 32 }],
    expected: (result: Any[]) => {
      expect(result.length).toEqual(samples.studentsData.length - 32);
    }
  }
]);
