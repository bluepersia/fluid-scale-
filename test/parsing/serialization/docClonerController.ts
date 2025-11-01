import { MEDIA_RULE_TYPE } from "../../../src/index.types";
import {
  DocClone,
  MediaRuleClone,
  RuleClone,
} from "../../../src/parsing/serialization/docClone";
import { AbsCounter } from "gold-sight";

function findRules(doc: DocClone, index: number): RuleClone[] {
  const counter = new AbsCounter(index);
  for (const sheet of doc.sheets) {
    if (counter.match()) return sheet.rules;

    for (const rule of sheet.rules.filter(
      (rule) => rule.type === MEDIA_RULE_TYPE
    )) {
      const mediaRule = rule as MediaRuleClone;
      if (counter.match()) return mediaRule.rules;
    }
  }
  return [];
}

function findRule(doc: DocClone, index: number): RuleClone | null {
  const counter = new AbsCounter(index);
  for (const sheet of doc.sheets) {
    for (const rule of sheet.rules) {
      if (counter.match()) return rule;

      if (rule.type === MEDIA_RULE_TYPE) {
        const mediaRule = rule as MediaRuleClone;
        for (const styleRule of mediaRule.rules) {
          if (counter.match()) return styleRule;
        }
      }
    }
  }
  return null;
}

export { findRule, findRules };
