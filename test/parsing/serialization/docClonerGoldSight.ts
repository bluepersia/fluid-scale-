let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}
import AssertionMaster, { type AssertionChainForFunc } from "gold-sight";
import type { DocClonerMaster, GoldSightState } from "./index.types";
import {
  cloneDoc,
  cloneStyleSheet,
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

const cloneStyleSheetAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneStyleSheet
> = {
  "should clone style sheet": (state, _args, result) => {
    expect(result).toEqual(state.master!.docClone.sheets[state.sheetIndex]);
  },
};
const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
  filterAccessibleSheets: filterAccessibleSheetsAssertionChain,
  cloneStyleSheet: cloneStyleSheetAssertionChain,
};

class DocClonerAssertionMaster extends AssertionMaster<
  GoldSightState,
  DocClonerMaster
> {
  constructor() {
    super(defaultAssertions, "cloneDoc");
  }

  newState(): GoldSightState {
    return {
      sheetIndex: 0,
    };
  }

  cloneDoc = this.wrapTopFn(cloneDoc, "cloneDoc");
  filterAccessibleSheets = this.wrapFn(
    filterAccessibleSheets,
    "filterAccessibleSheets"
  );
  cloneStyleSheet = this.wrapFn(cloneStyleSheet, "cloneStyleSheet", {
    getId: (state, args) => {
      return `sheetIndex:${state.sheetIndex}/href:${args[0].href || ""}`;
    },
    post: (state) => {
      state.sheetIndex++;
    },
  });
}

const docClonerAssertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(
    docClonerAssertionMaster.cloneDoc,
    docClonerAssertionMaster.filterAccessibleSheets,
    docClonerAssertionMaster.cloneStyleSheet
  );
}

export { wrapAll, docClonerAssertionMaster };
