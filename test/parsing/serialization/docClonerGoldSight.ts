let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}
import AssertionMaster, { type AssertionChainForFunc } from "gold-sight";
import type { DocClonerMaster, GoldSightState } from "./index.types";
import { cloneDoc, wrap } from "../../../src/parsing/serialization/docCloner";
import type { ExpectStatic } from "vitest";

const cloneDocAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneDoc
> = {
  "should clone the document": (
    state: GoldSightState,
    _args: Parameters<typeof cloneDoc>,
    result: ReturnType<typeof cloneDoc>
  ) => {
    expect(result).toEqual(state.master!.docClone);
  },
};

const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
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
}

const docClonerAssertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(docClonerAssertionMaster.cloneDoc);
}

export { wrapAll, docClonerAssertionMaster };
