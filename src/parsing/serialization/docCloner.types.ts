import type { Global } from "../../index.types";

type CloneDocContext = Global & {
  counter: {
    orderID: number;
  };
};

export type { CloneDocContext };
