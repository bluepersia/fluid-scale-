import { MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";
import {
  DocClone,
  MediaRuleClone,
  RuleClone,
  SheetClone,
  StyleRuleClone,
} from "./docClone";
import type { CloneDocContext } from "./docCloner.types";
import {
  FLUID_PROPERTY_NAMES,
  SHORTHAND_PROPERTIES,
  SPECIAL_PROPERTIES,
} from "./docClonerConsts";

let cloneDoc: (doc: Document, ctx: CloneDocContext) => DocClone = (
  doc: Document,
  ctx: CloneDocContext
): DocClone => {
  const docClone = new DocClone(ctx);

  const accessibleSheets = filterAccessibleSheets(doc.styleSheets);

  docClone.sheets = accessibleSheets.map((sheet) =>
    cloneStyleSheet(sheet, ctx)
  );

  return docClone;
};

let cloneStyleSheet: (
  sheet: CSSStyleSheet,
  ctx: CloneDocContext
) => SheetClone = (sheet: CSSStyleSheet, ctx: CloneDocContext): SheetClone => {
  const sheetClone = new SheetClone(ctx);
  sheetClone.rules = cloneRules(sheet.cssRules, ctx);
  return sheetClone;
};

let cloneRules: (rules: CSSRuleList, ctx: CloneDocContext) => RuleClone[] = (
  rules: CSSRuleList,
  ctx: CloneDocContext
): RuleClone[] => {
  return Array.from(rules)
    .map((rule) => cloneRule(rule, ctx))
    .filter((rule) => rule !== null);
};

const cloneRule: (rule: CSSRule, ctx: CloneDocContext) => RuleClone | null = (
  rule: CSSRule,
  ctx: CloneDocContext
): RuleClone | null => {
  const { isBrowser } = ctx;
  if (rule.type === STYLE_RULE_TYPE) {
    const styleRule = rule as CSSStyleRule;
    const styleRuleClone = new StyleRuleClone(ctx);
    styleRuleClone.selector = styleRule.selectorText;
    const style: Record<string, string> = {};
    const specialProps: Record<string, string> = {};

    for (let i = 0; i < styleRule.style.length; i++) {
      const property = styleRule.style[i];
      const value = styleRule.style.getPropertyValue(property);

      if (FLUID_PROPERTY_NAMES.has(property)) {
        const shorthandMap = SHORTHAND_PROPERTIES[property];
        if (shorthandMap) {
          if (isBrowser) {
            continue; //Browser expands shorthands
          } else {
            //TODO: expand shorthands
          }
          continue;
        }
        style[property] = value;
      } else if (SPECIAL_PROPERTIES.has(property)) {
        specialProps[property] = value;
      }
    }

    if (Object.keys(style).length <= 0 && Object.keys(specialProps).length <= 0)
      return null;

    styleRuleClone.style = style;
    styleRuleClone.specialProps = specialProps;

    ctx.counter.orderID++;
    styleRuleClone.orderID = ctx.counter.orderID;
    return styleRuleClone;
  } else if (rule.type === MEDIA_RULE_TYPE) {
    const mediaRule = rule as CSSMediaRule;
    const match = mediaRule.media.mediaText.match(/\(min-width:\s*(\d+)px\)/);

    if (match) {
      const mediaRuleClone = new MediaRuleClone(ctx);
      mediaRuleClone.minWidth = Number(match[1]);
      mediaRuleClone.rules = cloneRules(
        mediaRule.cssRules,
        ctx
      ) as StyleRuleClone[];
      return mediaRuleClone;
    }
    return null;
  }
  return null;
};

let filterAccessibleSheets: (sheets: StyleSheetList) => CSSStyleSheet[] = (
  sheets: StyleSheetList
): CSSStyleSheet[] => {
  return Array.from(sheets).filter((sheet) => {
    try {
      const rules = sheet.cssRules;
      return rules ? true : false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return false;
    }
  });
};

function wrap(
  cloneDocWrapped: typeof cloneDoc,
  filterAccessibleSheetsWrapped: typeof filterAccessibleSheets,
  cloneStyleSheetWrapped: typeof cloneStyleSheet,
  cloneRulesWrapped: typeof cloneRules
) {
  cloneDoc = cloneDocWrapped;
  filterAccessibleSheets = filterAccessibleSheetsWrapped;
  cloneStyleSheet = cloneStyleSheetWrapped;
  cloneRules = cloneRulesWrapped;
}

export {
  cloneDoc,
  cloneRules,
  wrap,
  filterAccessibleSheets,
  cloneStyleSheet,
  cloneRule,
};
