import type { EventContext, Global } from "../../index.types";

type CloneDocContext = Global &
  EventContext & {
    counter: {
      orderID: number;
    };
  };

type CloneRulesContext = CloneDocContext & {
  mediaWidth?: number;
};

export type { CloneDocContext, CloneRulesContext };
