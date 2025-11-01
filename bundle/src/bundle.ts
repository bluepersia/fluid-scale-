import { getQueue, EventBus } from "gold-sight";

import {
  docClonerAssertionMaster,
  wrapAll as wrapAllCloneDoc,
} from "../../test/parsing/serialization//docClonerGoldSight";

wrapAllCloneDoc();

import { cloneDoc } from "../../src/parsing/serialization/docCloner";

export { getQueue, cloneDoc, docClonerAssertionMaster, EventBus };
