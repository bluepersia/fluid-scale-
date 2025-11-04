let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}
import AssertionMaster, { type AssertionChainForFunc } from "gold-sight";
import type { DocClonerMaster, GoldSightState } from "./index.types";
import {
  cloneDoc,
  filterAccessibleSheets,
  wrap,
} from "../../../src/parsing/serialization/docCloner";
import type { ExpectStatic } from "vitest";

const cloneDocAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneDoc
> = {
  "should clone the document": (state, _args, result) => {
    expect(result).toEqual(state.master!.docClone);
  },
};

const filterAccessibleSheetsAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof filterAccessibleSheets
> = {
  "should filter accessible sheets": (state, _args, result) => {
    expect(result.length).toBe(state.master!.docClone.sheets.length);
  },
};

const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
  filterAccessibleSheets: filterAccessibleSheetsAssertionChain,
};

class DocClonerAssertionMaster extends AssertionMaster<
  GoldSightState,
  DocClonerMaster
> {
  constructor() {
    super(defaultAssertions, "cloneDoc");
  }

  newState(): GoldSightState {
    return {};
  }

  cloneDoc = this.wrapTopFn(cloneDoc, "cloneDoc");
  filterAccessibleSheets = this.wrapFn(
    filterAccessibleSheets,
    "filterAccessibleSheets"
  );
}

const docClonerAssertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(
    docClonerAssertionMaster.cloneDoc,
    docClonerAssertionMaster.filterAccessibleSheets
  );
}

export { wrapAll, docClonerAssertionMaster };
