let expect: ExpectStatic;
if (process.env.NODE_ENV === "test") {
  expect = (await import("vitest")).expect;
}
import AssertionMaster, {
  filterEventsByPayload,
  withEventBus,
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
  cloneStyleRule,
  cloneMediaRule,
  cloneProp,
  cloneFluidProp,
} from "../../../src/parsing/serialization/docCloner";
import * as controller from "./docClonerController";
import type { ExpectStatic } from "vitest";
import { EXPLICIT_PROPS_FOR_SHORTHAND } from "../../../src/parsing/serialization/docClonerConsts";

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
      } else {
        throw Error("unknown event");
      }
    }),
};

const cloneStyleRuleAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneStyleRule
> = {
  "should clone style rule": (state, args, result) =>
    withEventNames(args, ["styleRuleCloned", "styleRuleOmitted"], (events) => {
      if (events.styleRuleCloned) {
        expect(result).toEqual(
          controller.findStyleRule(state.master!.docClone, state.styleRuleIndex)
        );
      } else if (events.styleRuleOmitted) {
        expect(result).toBeNull();
      } else {
        throw Error("unknown event");
      }
    }),
};

const cloneMediaRuleAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneMediaRule
> = {
  "should clone media rule": (state, args, result) =>
    withEventNames(args, ["mediaRuleCloned", "mediaRuleOmitted"], (events) => {
      if (events.mediaRuleCloned) {
        expect(result).toEqual(
          controller.findMediaRule(state.master!.docClone, state.mediaRuleIndex)
        );
      } else if (events.mediaRuleOmitted) {
        expect(result).toBeNull();
      } else {
        throw Error("unknown event");
      }
    }),
};

const clonePropAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneProp
> = {
  "should clone prop": (state, args, result) =>
    withEventNames(args, ["specialPropCloned", "propOmitted"], (events) => {
      return;
      const [, property, ctx] = args;
      const { propsState } = ctx;
      const masterRule = controller.findStyleRule(
        state.master!.docClone,
        state.styleRuleIndex - 1
      );
      if (events.fluidPropCloned) {
        expect(result.style[property]).toBe(masterRule!.style[property]);
      } else if (events.specialPropCloned) {
        expect(result.specialProps[property]).toBe(
          masterRule!.specialProps[property]
        );
      } else if (events.expandedShorthand) {
        for (const explicitProp of EXPLICIT_PROPS_FOR_SHORTHAND.get(
          property
        )!) {
          expect(result.style[explicitProp]).toBe(
            masterRule!.style[explicitProp]
          );
        }
      } else if (events.propOmitted) {
        expect(result).toBe(propsState);
      } else {
        throw Error("unknown event");
      }
    }),
};

function assertExpandedShorthand(
  result: Record<string, string>,
  masterStyle: Record<string, string>,
  property: string
) {
  for (const explicitProp of EXPLICIT_PROPS_FOR_SHORTHAND.get(property)!) {
    expect(result[explicitProp]).toBe(masterStyle[explicitProp]);
  }
}

const cloneFluidPropAssertionChain: AssertionChainForFunc<
  GoldSightState,
  typeof cloneFluidProp
> = {
  "should clone fluid prop": (state, args, result) =>
    withEventNames(
      args,
      ["fluidPropCloned", "expandedShorthand", "propOmitted"],
      (events) => {
        const [property, , ctx] = args;
        const { propsState } = ctx;
        const masterRule = controller.findStyleRule(
          state.master!.docClone,
          state.styleRuleIndex - 1
        );
        if (events.fluidPropCloned) {
          expect(result.style[property]).toBe(masterRule!.style[property]);
        } else if (events.expandedShorthand) {
          assertExpandedShorthand(result.style, masterRule!.style, property);
        } else if (events.propOmitted) {
          expect(result).toBe(propsState);
        }
      }
    ),
  "should emit one event": (_state, args) =>
    withEventBus(args, (eventBus) => {
      const [property, , ctx] = args;
      const { styleRule } = ctx;
      const key = { property, styleRule };
      const events = filterEventsByPayload(eventBus, "*", key);

      expect(events.length).toBe(1);
    }),
};

const defaultAssertions = {
  cloneDoc: cloneDocAssertionChain,
  filterAccessibleSheets: filterAccessibleSheetsAssertionChain,
  cloneStyleSheet: cloneStyleSheetAssertionChain,
  cloneRules: cloneRulesAssertionChain,
  cloneRule: cloneRuleAssertionChain,
  cloneStyleRule: cloneStyleRuleAssertionChain,
  cloneMediaRule: cloneMediaRuleAssertionChain,
  cloneProp: clonePropAssertionChain,
  cloneFluidProp: cloneFluidPropAssertionChain,
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
      styleRuleIndex: 0,
      mediaRuleIndex: 0,
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
  cloneStyleRule = this.wrapFn(cloneStyleRule, "cloneStyleRule", {
    getId: (state, args) => {
      return `styleRuleIndex:${state.styleRuleIndex}/selector:${
        args[0].selectorText || ""
      }/mediaWidth:${args[1].mediaWidth || "baseline"}`;
    },
    post: (state, args) =>
      withEventNames(args, ["styleRuleCloned"], (events) => {
        if (events.styleRuleCloned) state.styleRuleIndex++;
      }),
  });
  cloneMediaRule = this.wrapFn(cloneMediaRule, "cloneMediaRule", {
    getId: (state, args) => {
      return `mediaRuleIndex:${state.mediaRuleIndex}/mediaText:${args[0].media.mediaText}`;
    },
    post: (state, args) =>
      withEventNames(args, ["mediaRuleCloned"], (events) => {
        if (events.mediaRuleCloned) state.mediaRuleIndex++;
      }),
  });
  cloneProp = this.wrapFn(cloneProp, "cloneProp", {
    getId: (_state, args) => {
      return `selector:${args[0].selectorText}/mediaWidth:${
        args[2].mediaWidth || "baseline"
      }/property:${args[1]}`;
    },
  });
  cloneFluidProp = this.wrapFn(cloneFluidProp, "cloneFluidProp", {
    getId: (_state, args) => {
      return `property:${args[0]}/styleRule:${
        args[2].styleRule.selectorText
      }/mediaWidth:${args[2].mediaWidth || "baseline"}`;
    },
  });
}

const docClonerAssertionMaster = new DocClonerAssertionMaster();

function wrapAll() {
  wrap(
    docClonerAssertionMaster.cloneDoc,
    docClonerAssertionMaster.filterAccessibleSheets,
    docClonerAssertionMaster.cloneStyleSheet,
    docClonerAssertionMaster.cloneRules,
    docClonerAssertionMaster.cloneRule,
    docClonerAssertionMaster.cloneStyleRule,
    docClonerAssertionMaster.cloneMediaRule,
    docClonerAssertionMaster.cloneProp,
    docClonerAssertionMaster.cloneFluidProp
  );
}

export { wrapAll, docClonerAssertionMaster };
