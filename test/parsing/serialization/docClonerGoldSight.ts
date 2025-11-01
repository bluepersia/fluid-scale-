let expect;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}

import AssertionMaster, { AssertionChainForFunc } from "gold-sight";
import { DocClonerMaster, GoldSightState } from "./index.types";
import {
  cloneDoc,
  getAccessibleSheets,
} from "../../../src/parsing/serialization/docCloner";
import { wrap } from "../../../src/parsing/serialization/docCloner";

const cloneDocAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneDoc
> = {
  "should clone the document": (state, args, result) => {
    expect(result).toEqual(state.master!.docClone);
  },
};

const getAccessibleSheetsAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof getAccessibleSheets
> = {
  "should get the accessible sheets": (state, args, result) => {
    expect(result.length).toBe(state.master!.docClone.sheets.length);
  },
};

const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
  getAccessibleSheets: getAccessibleSheetsAssertionChain,
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

  getAccessibleSheets = this.wrapFn(getAccessibleSheets, "getAccessibleSheets");
}

const docClonerAssertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(
    docClonerAssertionMaster.cloneDoc,
    docClonerAssertionMaster.getAccessibleSheets
  );
}

export { wrapAll, docClonerAssertionMaster };
