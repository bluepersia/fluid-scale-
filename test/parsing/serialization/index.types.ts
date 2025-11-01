import { DocClone } from "../../../src/parsing/serialization/docClone";
import { Master } from "../../index.types";

type DocClonerMaster = Master & {
  docClone: DocClone;
};

type GoldSightState = {
  master?: DocClonerMaster;
};

export { GoldSightState, DocClonerMaster };
