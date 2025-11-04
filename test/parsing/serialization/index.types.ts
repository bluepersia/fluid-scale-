import type { DocClone } from "../../../src/parsing/serialization/docClone";
import type { Master } from "../../index.types";

type GoldSightState = {
  master?: DocClonerMaster;
};

type DocClonerMaster = Master & {
  docClone: DocClone;
};

export type { GoldSightState, DocClonerMaster };
