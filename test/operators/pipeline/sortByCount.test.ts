import { AnyObject } from "../../../src/types";
import * as samples from "../../support";

samples.runTestPipeline("operators/pipeline/sortByCount", [
  {
    message: "can sort by count",
    input: [
      {
        _id: 1,
        title: "The Pillars of Society",
        artist: "Grosz",
        year: 1926,
        tags: ["painting", "satire", "Expressionism", "caricature"]
      },
      {
        _id: 2,
        title: "Melancholy III",
        artist: "Munch",
        year: 1902,
        tags: ["woodcut", "Expressionism"]
      },
      {
        _id: 3,
        title: "Dancer",
        artist: "Miro",
        year: 1925,
        tags: ["oil", "Surrealism", "painting"]
      },
      {
        _id: 4,
        title: "The Great Wave off Kanagawa",
        artist: "Hokusai",
        tags: ["woodblock", "ukiyo-e"]
      },
      {
        _id: 5,
        title: "The Persistence of Memory",
        artist: "Dali",
        year: 1931,
        tags: ["Surrealism", "painting", "oil"]
      },
      {
        _id: 6,
        title: "Composition VII",
        artist: "Kandinsky",
        year: 1913,
        tags: ["oil", "painting", "abstract"]
      },
      {
        _id: 7,
        title: "The Scream",
        artist: "Munch",
        year: 1893,
        tags: ["Expressionism", "painting", "oil"]
      },
      {
        _id: 8,
        title: "Blue Flower",
        artist: "O'Keefe",
        year: 1918,
        tags: ["abstract", "painting"]
      }
    ],

    pipeline: [{ $unwind: "$tags" }, { $sortByCount: "$tags" }],

    expected: (result: AnyObject[]) => {
      expect(result.every(o => Object.keys(o).length === 2)).toEqual(true);
      expect(result[0]["count"]).toEqual(6);
      expect(result[7]["count"]).toEqual(1);
    }
  }
]);
