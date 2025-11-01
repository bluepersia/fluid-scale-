import { DocClone } from "../../../src/parsing/serialization/docClone";
import { Master } from "../../index.types";

type DocClonerMaster = Master & {
  docClone: DocClone;
};

type GoldSightState = {
  master?: DocClonerMaster;
  rulesIndex: number;
  ruleIndex: number;
  styleRuleIndex: number;
  mediaRuleIndex: number;
};

export { GoldSightState, DocClonerMaster };
