import { describe, test, beforeAll, afterAll } from "vitest";
import {
  initPlaywrightPages,
  JSDOMDocs,
  teardownPlaywrightPages,
} from "../../setup";
import { docClonerCollection } from "./docClonerCollection.ts";
import type { PlaywrightPage } from "../../index.types";
import { type AssertionBlueprint } from "gold-sight";
import { makeEventContext } from "gold-sight";
import { docClonerAssertionMaster } from "./docClonerGoldSight";
import { cloneDoc } from "../../../src/parsing/serialization/docCloner.ts";
import { makeDefaultGlobal } from "../../../src/utils/global.ts";
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
            ...(window as any).makeEventContext(),
            counter: { orderID: -1 },
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
        isBrowser: false,
        counter: { orderID: -1 },
        ...makeEventContext(),
      });

      docClonerAssertionMaster.assertQueue({ master });
    }
  );
});
