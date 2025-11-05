import type { EventContext, Global } from "../../index.types";

type CloneDocContext = Global &
  EventContext & {
    counter: {
      orderID: number;
    };
  };

export type { CloneDocContext };
