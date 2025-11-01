let expect;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}

import AssertionMaster, { AssertionChainForFunc } from "gold-sight";
import { DocClonerMaster, GoldSightState } from "./index.types";
import {
  cloneDoc,
  cloneRule,
  cloneRules,
  getAccessibleSheets,
} from "../../../src/parsing/serialization/docCloner";
import { wrap } from "../../../src/parsing/serialization/docCloner";
import * as controller from "./docClonerController";
import { withEventNames } from "gold-sight";

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

const cloneRulesAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneRules
> = {
  "should clone the rules": (state, args, result) => {
    expect(result).toEqual(
      controller.findRules(state.master!.docClone, state.rulesIndex)
    );
  },
};

const cloneRuleAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneRule
> = {
  "should clone the rule": (state, args, result) =>
    withEventNames(args, ["ruleCloned", "ruleOmitted"], (events) => {
      if (events.ruleCloned) {
        expect(result).toEqual(
          controller.findRule(state.master!.docClone, state.ruleIndex)
        );
      } else if (events.ruleOmitted) {
        if (
          events.ruleOmitted.payload.why === "nullResult" ||
          events.ruleOmitted.payload.why === "unsupportedRuleType"
        ) {
          expect(result).toBeNull();
        }
      }
    }),
};

const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
  getAccessibleSheets: getAccessibleSheetsAssertionChain,
  cloneRules: cloneRulesAssertionChain,
  cloneRule: cloneRuleAssertionChain,
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
      rulesIndex: 0,
      ruleIndex: 0,
    };
  }

  cloneDoc = this.wrapTopFn(cloneDoc, "cloneDoc");
  getAccessibleSheets = this.wrapFn(getAccessibleSheets, "getAccessibleSheets");
  cloneRules = this.wrapFn(cloneRules, "cloneRules", {
    post: (state) => {
      state.rulesIndex++;
    },
  });
  cloneRule = this.wrapFn(cloneRule, "cloneRule", {
    post: (state, args) =>
      withEventNames(args, ["ruleCloned", "ruleOmitted"], (events) => {
        if (events.ruleCloned) {
          state.ruleIndex++;
        }
      }),
  });
}

const docClonerAssertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(
    docClonerAssertionMaster.cloneDoc,
    docClonerAssertionMaster.getAccessibleSheets,
    docClonerAssertionMaster.cloneRules,
    docClonerAssertionMaster.cloneRule
  );
}

export { wrapAll, docClonerAssertionMaster };
