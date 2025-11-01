let expect;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}

import AssertionMaster, { AssertionChainForFunc } from "gold-sight";
import { DocClonerMaster, GoldSightState } from "./index.types";
import {
  cloneDoc,
  cloneMediaRule,
  cloneRule,
  cloneRules,
  cloneStyleRule,
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

const cloneStyleRuleAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneStyleRule
> = {
  "should clone the style rule": (state, args, result) =>
    withEventNames(args, ["styleRuleCloned", "styleRuleOmitted"], (events) => {
      if (events.styleRuleCloned) {
        expect(result).toEqual(
          controller.findStyleRule(state.master!.docClone, state.styleRuleIndex)
        );
      } else if (events.styleRuleOmitted) {
        expect(result).toBeNull();
      }
    }),
};

const cloneMediaRuleAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneMediaRule
> = {
  "should clone the media rule": (state, args, result) =>
    withEventNames(args, ["mediaRuleCloned", "mediaRuleOmitted"], (events) => {
      if (events.mediaRuleCloned) {
        expect(result).toEqual(
          controller.findMediaRule(state.master!.docClone, state.mediaRuleIndex)
        );
      } else if (events.mediaRuleOmitted) {
        expect(result).toBeNull();
      }
    }),
};

const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
  getAccessibleSheets: getAccessibleSheetsAssertionChain,
  cloneRules: cloneRulesAssertionChain,
  cloneRule: cloneRuleAssertionChain,
  cloneStyleRule: cloneStyleRuleAssertionChain,
  cloneMediaRule: cloneMediaRuleAssertionChain,
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
      styleRuleIndex: 0,
      mediaRuleIndex: 0,
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
  cloneStyleRule = this.wrapFn(cloneStyleRule, "cloneStyleRule", {
    post: (state, args) =>
      withEventNames(
        args,
        ["styleRuleCloned", "styleRuleOmitted"],
        (events) => {
          if (events.styleRuleCloned) {
            state.styleRuleIndex++;
          }
        }
      ),
  });
  cloneMediaRule = this.wrapFn(cloneMediaRule, "cloneMediaRule", {
    post: (state, args) =>
      withEventNames(
        args,
        ["mediaRuleCloned", "mediaRuleOmitted"],
        (events) => {
          if (events.mediaRuleCloned) {
            state.mediaRuleIndex++;
          }
        }
      ),
  });
}

const docClonerAssertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(
    docClonerAssertionMaster.cloneDoc,
    docClonerAssertionMaster.getAccessibleSheets,
    docClonerAssertionMaster.cloneRules,
    docClonerAssertionMaster.cloneRule,
    docClonerAssertionMaster.cloneStyleRule,
    docClonerAssertionMaster.cloneMediaRule
  );
}

export { wrapAll, docClonerAssertionMaster };
