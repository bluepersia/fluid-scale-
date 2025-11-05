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

type ClonePropContext = CloneRulesContext & {
  propsState: ClonePropsState;
};

type ClonePropsState = {
  style: Record<string, string>;
  specialProps: Record<string, string>;
};

export type {
  CloneDocContext,
  CloneRulesContext,
  ClonePropsState,
  ClonePropContext,
};
