import type { Global } from "../../index.types";
import type { EventContext } from "gold-sight";

type CloneDocContext = Global &
  EventContext & {
    counter: {
      orderID: number;
    };
  };

type CloneSheetContext = CloneDocContext & {
  sheetIndex?: number;
};

type CloneRulesContext = CloneSheetContext & {
  mediaWidth?: number;
  rulesParent: string;
};

type ClonePropContext = CloneRulesContext & {
  propsState: ClonePropsState;
};

type CloneFluidPropContext = ClonePropContext & {
  styleRule: CSSStyleRule;
};

type CloneSpecialPropContext = ClonePropContext & {
  styleRule: CSSStyleRule;
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
  CloneFluidPropContext,
  CloneSpecialPropContext,
  CloneSheetContext,
};
