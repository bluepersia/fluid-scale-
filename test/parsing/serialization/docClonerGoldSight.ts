let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}
import AssertionMaster, {
  withEventNames,
  type AssertionChainForFunc,
} from "gold-sight";
import type { DocClonerMaster, GoldSightState } from "./index.types";
import {
  cloneDoc,
  cloneRules,
  cloneStyleSheet,
  filterAccessibleSheets,
  cloneRule,
  wrap,
} from "../../../src/parsing/serialization/docCloner";
import * as controller from "./docClonerController";
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

const cloneRulesAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneRules
> = {
  "should clone rules": (state, _args, result) => {
    expect(result).toEqual(
      controller.findRules(state.master!.docClone, state.rulesIndex)
    );
  },
};

const cloneRuleAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneRule
> = {
  "should clone rule": (state, args, result) =>
    withEventNames(args, ["ruleCloned", "ruleOmitted"], (events) => {
      if (events.ruleCloned) {
        expect(result).toEqual(
          controller.findRule(state.master!.docClone, state.ruleIndex)
        );
      } else if (events.ruleOmitted) {
        expect(result).toBeNull();
      }
    }),
};

const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
  filterAccessibleSheets: filterAccessibleSheetsAssertionChain,
  cloneStyleSheet: cloneStyleSheetAssertionChain,
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
      sheetIndex: 0,
      rulesIndex: 0,
      ruleIndex: 0,
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
  cloneRules = this.wrapFn(cloneRules, "cloneRules", {
    getId: (state) => {
      return `rulesIndex:${state.rulesIndex}`;
    },
    post: (state) => {
      state.rulesIndex++;
    },
  });
  cloneRule = this.wrapFn(cloneRule, "cloneRule", {
    getId: (state) => {
      return `ruleIndex:${state.ruleIndex}`;
    },
    post: (state, args) =>
      withEventNames(args, ["ruleCloned"], (events) => {
        if (events.ruleCloned) state.ruleIndex++;
      }),
  });
}

const docClonerAssertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(
    docClonerAssertionMaster.cloneDoc,
    docClonerAssertionMaster.filterAccessibleSheets,
    docClonerAssertionMaster.cloneStyleSheet,
    docClonerAssertionMaster.cloneRules,
    docClonerAssertionMaster.cloneRule
  );
}

export { wrapAll, docClonerAssertionMaster };
