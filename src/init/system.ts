// load all operators
import { useOperators } from "../core";
import * as accumulatorOperators from "../operators/accumulator";
import * as expressionOperators from "../operators/expression";
import * as pipelineOperators from "../operators/pipeline";
import * as projectionOperators from "../operators/projection";
import * as queryOperators from "../operators/query";
import * as windowOperators from "../operators/window";

useOperators("accumulator", accumulatorOperators);
useOperators("expression", expressionOperators);
useOperators("pipeline", pipelineOperators);
useOperators("projection", projectionOperators);
useOperators("query", queryOperators);
useOperators("window", windowOperators);
