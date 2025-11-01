import { DocClonerMaster } from "../../../../parsing/serialization/index.types";
import { docClone } from "./docClone/docClone";
const DocClonerMaster: DocClonerMaster = {
  index: 0,
  step: 0,
  docClone,
};

export { DocClonerMaster };
