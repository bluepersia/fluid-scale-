import { Global, MEDIA_RULE_TYPE, STYLE_RULE_TYPE } from "../../index.types";

class DocClone {
  public sheets: SheetClone[] = [];
  #state: Global;
  constructor(state: Global) {
    this.#state = state;
  }

  public get state(): Global {
    return this.#state;
  }
  addSheet() {
    const sheet = new SheetClone(this.#state);
    this.sheets.push(sheet);
    return sheet;
  }
}

class SheetClone {
  public rules: RuleClone[] = [];
  #state: Global;

  constructor(state: Global) {
    this.#state = state;
  }

  public get state(): Global {
    return this.#state;
  }

  addStyleRule() {
    const rule = new StyleRuleClone(this.#state);
    this.rules.push(rule);
    return rule;
  }

  addMediaRule() {
    const rule = new MediaRuleClone(this.#state);
    this.rules.push(rule);
    return rule;
  }
}

class RuleClone {
  public type: typeof STYLE_RULE_TYPE | typeof MEDIA_RULE_TYPE;
  #state: Global;
  constructor(
    type: typeof STYLE_RULE_TYPE | typeof MEDIA_RULE_TYPE,
    state: Global
  ) {
    this.type = type;
    this.#state = state;
  }

  public get state(): Global {
    return this.#state;
  }
}

class StyleRuleClone extends RuleClone {
  public selector: string = "";
  public style: Record<string, string> = {};
  public specialProperties: Record<string, string> = {};
  constructor(state: Global) {
    super(STYLE_RULE_TYPE, state);
  }
}

class MediaRuleClone extends RuleClone {
  public minWidth: number = 0;
  public rules: StyleRuleClone[] = [];
  constructor(state: Global) {
    super(MEDIA_RULE_TYPE, state);
  }

  public addStyleRule() {
    const rule = new StyleRuleClone(this.state);
    this.rules.push(rule);
    return rule;
  }
}

export { DocClone, SheetClone, RuleClone, StyleRuleClone, MediaRuleClone };
