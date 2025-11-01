import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { initPlaywrightPages, teardownPlaywrightPages } from "../../setup";
import { docClonerCollection } from "./docClonerCollection";
import { PlaywrightPage } from "../../index.types";
import { AssertionBlueprint, EventBus } from "gold-sight";
import { docClonerAssertionMaster } from "./docClonerGoldSight";
import { JSDOMDocs } from "../../setup";
import { cloneDoc } from "../../../src/parsing/serialization/docCloner";
import { makeDefaultGlobal } from "../../../src/utils/global";
let playwrightPages: PlaywrightPage[] = [];

beforeAll(async () => {
  playwrightPages = await initPlaywrightPages();
});

afterAll(async () => {
  await teardownPlaywrightPages(playwrightPages);
});

describe("docCloner", () => {
  test.each(docClonerCollection)(
    "should clone the document",
    async (master) => {
      const { index } = master;
      const { page } = playwrightPages[index];
      const queue: [number, AssertionBlueprint][] = await page.evaluate(
        (master) => {
          (window as any).docClonerAssertionMaster.master = master;
          (window as any).cloneDoc(document, {
            isBrowser: true,
            event: new (window as any).EventBus(),
            eventUUID: "",
          });

          const queue = (window as any).docClonerAssertionMaster.getQueue();

          return Array.from(queue.entries());
        },
        master
      );

      docClonerAssertionMaster.setQueueFromArray(queue);
      docClonerAssertionMaster.assertQueue({ master });
    }
  );

  test.each(docClonerCollection)(
    "should clone the JSDOM document",
    async (master) => {
      const { index } = master;
      const { doc } = JSDOMDocs[index];

      docClonerAssertionMaster.master = master;
      cloneDoc(doc, {
        ...makeDefaultGlobal(),
        event: new EventBus(),
        eventUUID: "",
      });
      docClonerAssertionMaster.assertQueue();
    }
  );
});
