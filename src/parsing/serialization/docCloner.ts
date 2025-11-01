import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";
import { splitBySpaces } from "../../utils/stringHelpers";
import {
  DocClone,
  MediaRuleClone,
  RuleClone,
  SheetClone,
  StyleRuleClone,
} from "./docClone";
import { CloneDocContext } from "./docCloner.types";
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

let cloneRules = (rules: CSSRuleList, ctx: CloneDocContext): RuleClone[] => {
  const result: RuleClone[] = Array.from(rules)
    .map((rule) => cloneRule(rule, ctx))
    .filter((rule) => rule !== null);

  return result;
};

let cloneRule = (rule: CSSRule, ctx: CloneDocContext): RuleClone | null => {
  const { isBrowser, event } = ctx;
  let result: RuleClone | null = null;
  let type: number | null = null;
  if (rule.type === STYLE_RULE_TYPE) {
    type = STYLE_RULE_TYPE;
    const styleRule = rule as CSSStyleRule;
    const styleRuleClone = new StyleRuleClone(ctx);
    styleRuleClone.selector = normalizeSelector(styleRule.selectorText);

    const style: Record<string, string> = {};
    const specialProps: Record<string, string> = {};

    for (let i = 0; i < styleRule.style.length; i++) {
      const prop = styleRule.style[i];

      if (FLUID_PROPERTY_NAMES.has(prop)) {
        const shorthandMap = SHORTHAND_PROPERTIES[prop];
        if (shorthandMap) {
          if (isBrowser) continue;

          const values = splitBySpaces(styleRule.style.getPropertyValue(prop));
          const valuesCount = values.length;
          const innerShorthandMap = shorthandMap.get(valuesCount)!;
          for (const [index, value] of values.entries()) {
            const valueMap = innerShorthandMap.get(index)!;
            for (const valueProp of valueMap) {
              style[valueProp] = normalizeZero(value);
            }
          }
          continue;
        }
        style[prop] = normalizeZero(styleRule.style.getPropertyValue(prop));
      } else if (SPECIAL_PROPERTIES.has(prop)) {
        specialProps[prop] = styleRule.style.getPropertyValue(prop);
      }
    }

    styleRuleClone.style = style;
    styleRuleClone.specialProperties = specialProps;

    if (Object.keys(style).length > 0 || Object.keys(specialProps).length > 0)
      result = styleRuleClone;
  } else if (rule.type === MEDIA_RULE_TYPE) {
    type = MEDIA_RULE_TYPE;
    const mediaRule = rule as CSSMediaRule;
    const mediaRuleClone = new MediaRuleClone(ctx);

    const match = mediaRule.media.mediaText.match(/\(min-width:\s*(\d+)px\)/);
    if (match) {
      mediaRuleClone.minWidth = Number(match[1]);
      mediaRuleClone.rules = cloneRules(mediaRule.cssRules, ctx).filter(
        (rule) => rule.type === STYLE_RULE_TYPE
      ) as StyleRuleClone[];
    }
    result = mediaRuleClone;
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
  cloneRuleWrapped: typeof cloneRule
) {
  cloneDoc = cloneDocWrapped;
  getAccessibleSheets = getAccessibleSheetsWrapped;
  cloneRules = cloneRulesWrapped;
  cloneRule = cloneRuleWrapped;
}

export { cloneDoc, cloneRule, cloneRules, getAccessibleSheets, wrap };
