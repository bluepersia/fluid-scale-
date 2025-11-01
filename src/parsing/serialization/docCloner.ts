import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";
import { splitBySpaces } from "../../utils/stringHelpers";
import {
  DocClone,
  MediaRuleClone,
  RuleClone,
  SheetClone,
  StyleRuleClone,
} from "./docClone";
import {
  CloneDocContext,
  CloneFluidPropContext,
  CloneFluidPropResult,
  ClonePropContext,
  ClonePropsState,
} from "./docCloner.types";
import {
  FLUID_PROPERTY_NAMES,
  SHORTHAND_PROPERTIES,
  SPECIAL_PROPERTIES,
} from "./docClonerConsts";

let cloneDoc = (doc: Document, ctx: CloneDocContext): DocClone => {
  const docClone = new DocClone(ctx);

  const accessibleSheets = getAccessibleSheets(doc);

  for (const sheet of accessibleSheets) {
    const sheetClone = new SheetClone(ctx);
    sheetClone.rules = cloneRules(sheet.cssRules, ctx);
    docClone.sheets.push(sheetClone);
  }

  return docClone;
};
let getAccessibleSheets = (doc: Document): CSSStyleSheet[] => {
  return Array.from(doc.styleSheets).filter((sheet) => {
    try {
      const rules = sheet.cssRules;
      return rules ? true : false;
    } catch (error) {
      return false;
    }
  });
};

let cloneRules = (rules: CSSRuleList, ctx: CloneDocContext): RuleClone[] => {
  const result: RuleClone[] = Array.from(rules)
    .map((rule) => cloneRule(rule, ctx))
    .filter((rule) => rule !== null);

  return result;
};

let cloneRule = (rule: CSSRule, ctx: CloneDocContext): RuleClone | null => {
  const { event } = ctx;
  let result: RuleClone | null = null;
  let type: number | null = null;
  if (rule.type === STYLE_RULE_TYPE) {
    type = STYLE_RULE_TYPE;
    result = cloneStyleRule(rule as CSSStyleRule, ctx);
  } else if (rule.type === MEDIA_RULE_TYPE) {
    type = MEDIA_RULE_TYPE;
    result = cloneMediaRule(rule as CSSMediaRule, ctx);
  }

  if (event) {
    if (result) event.emit("ruleCloned", ctx, { result });
    else {
      event.emit("ruleOmitted", ctx, {
        why: type ? "nullResult" : "unsupportedRuleType",
      });
    }
  }
  return result;
};

let cloneStyleRule = (
  styleRule: CSSStyleRule,
  ctx: CloneDocContext
): StyleRuleClone | null => {
  const { event } = ctx;
  const styleRuleClone = new StyleRuleClone(ctx);
  styleRuleClone.selector = normalizeSelector(styleRule.selectorText);

  let propsState: ClonePropsState = {
    style: {},
    specialProps: {},
  };

  for (let i = 0; i < styleRule.style.length; i++) {
    const prop = styleRule.style[i];
    propsState = cloneProp(styleRule, prop, { ...ctx, propsState });
  }

  const { style, specialProps } = propsState;

  if (Object.keys(style).length <= 0 && Object.keys(specialProps).length <= 0) {
    event?.emit("styleRuleOmitted", ctx, {
      why: "noStyleOrSpecialProps",
    });
    return null;
  }

  styleRuleClone.style = style;
  styleRuleClone.specialProperties = specialProps;

  event?.emit("styleRuleCloned", ctx, { result: styleRuleClone });
  return styleRuleClone;
};

let cloneProp = (
  styleRule: CSSStyleRule,
  prop: string,
  ctx: ClonePropContext
): ClonePropsState => {
  const { event } = ctx;
  let { propsState } = ctx;
  let { style, specialProps } = propsState;
  if (FLUID_PROPERTY_NAMES.has(prop)) {
    const fluidPropResult = cloneFluidProp(styleRule, prop, { ...ctx, style });
    if (event) {
      event.emit(
        fluidPropResult.event!.name,
        ctx,
        fluidPropResult.event!.payload
      );
    }
    return { style: fluidPropResult.style, specialProps };
  } else if (SPECIAL_PROPERTIES.has(prop)) {
    specialProps = { ...specialProps };
    specialProps[prop] = styleRule.style.getPropertyValue(prop);
    event?.emit("specialPropCloned", ctx, { prop, value: specialProps[prop] });
    return { style, specialProps };
  }
  event?.emit("propOmitted", ctx, { prop, why: "notFluidOrSpecial" });
  return propsState;
};

let cloneFluidProp = (
  styleRule: CSSStyleRule,
  prop: string,
  ctx: CloneFluidPropContext
): CloneFluidPropResult => {
  const { isBrowser, event } = ctx;
  let { style } = ctx;
  const shorthandMap = SHORTHAND_PROPERTIES[prop];
  if (shorthandMap) {
    if (isBrowser) {
      const omitted = event?.emit("propOmitted", ctx, {
        why: "browserHandlesShorthands",
      });
      return { style, event: omitted };
    }

    style = { ...style };
    const values = splitBySpaces(styleRule.style.getPropertyValue(prop));
    const valuesCount = values.length;
    const innerShorthandMap = shorthandMap.get(valuesCount)!;
    for (const [index, value] of values.entries()) {
      const valueMap = innerShorthandMap.get(index)!;
      for (const valueProp of valueMap) {
        style[valueProp] = normalizeZero(value);
      }
    }
    const expanded = event?.emit("shorthandExpanded", ctx, { style });
    return { style, event: expanded };
  }
  style = { ...style };
  style[prop] = normalizeZero(styleRule.style.getPropertyValue(prop));
  const standardPropCloned = event?.emit("fluidPropCloned", ctx, {
    prop,
    value: style[prop],
  });
  return { style, event: standardPropCloned };
};

let cloneMediaRule = (
  mediaRule: CSSMediaRule,
  ctx: CloneDocContext
): MediaRuleClone | null => {
  const { event } = ctx;
  const mediaRuleClone = new MediaRuleClone(ctx);

  const match = mediaRule.media.mediaText.match(/\(min-width:\s*(\d+)px\)/);
  if (match) {
    mediaRuleClone.minWidth = Number(match[1]);
    mediaRuleClone.rules = cloneRules(mediaRule.cssRules, ctx).filter(
      (rule) => rule.type === STYLE_RULE_TYPE
    ) as StyleRuleClone[];
    event?.emit("mediaRuleCloned", ctx, { result: mediaRuleClone });
    return mediaRuleClone;
  }
  event?.emit("mediaRuleOmitted", ctx, {
    why: "noMinWidth",
  });
  return null;
};

function normalizeZero(input: string): string {
  return input.replace(
    /(?<![\d.])0+(?:\.0+)?(?![\d.])(?!(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)\b)/g,
    "0px"
  );
}

function normalizeSelector(selector: string): string {
  return selector
    .replace(/\*::(before|after)\b/g, "::$1")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function wrap(
  cloneDocWrapped: typeof cloneDoc,
  getAccessibleSheetsWrapped: typeof getAccessibleSheets,
  cloneRulesWrapped: typeof cloneRules,
  cloneRuleWrapped: typeof cloneRule,
  cloneStyleRuleWrapped: typeof cloneStyleRule,
  cloneMediaRuleWrapped: typeof cloneMediaRule,
  clonePropWrapped: typeof cloneProp,
  cloneFluidPropWrapped: typeof cloneFluidProp
) {
  cloneDoc = cloneDocWrapped;
  getAccessibleSheets = getAccessibleSheetsWrapped;
  cloneRules = cloneRulesWrapped;
  cloneRule = cloneRuleWrapped;
  cloneStyleRule = cloneStyleRuleWrapped;
  cloneMediaRule = cloneMediaRuleWrapped;
  cloneProp = clonePropWrapped;
  cloneFluidProp = cloneFluidPropWrapped;
}

export {
  cloneDoc,
  cloneRule,
  cloneRules,
  getAccessibleSheets,
  wrap,
  cloneStyleRule,
  cloneMediaRule,
  cloneProp,
  cloneFluidProp,
};
