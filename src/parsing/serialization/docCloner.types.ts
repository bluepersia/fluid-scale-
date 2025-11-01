import { Global } from "../../index.types";

type CloneDocContext = Global;

type ClonePropContext = CloneDocContext & {
  propsState: ClonePropsState;
};

type ClonePropsState = {
  style: Record<string, string>;
  specialProps: Record<string, string>;
};

export { CloneDocContext, ClonePropContext, ClonePropsState };
