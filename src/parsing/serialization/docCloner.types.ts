import { IEvent } from "gold-sight";
import { Global } from "../../index.types";

type CloneDocContext = Global;

type ClonePropContext = CloneDocContext & {
  propsState: ClonePropsState;
};

type CloneFluidPropContext = ClonePropContext & {
  style: Record<string, string>;
};

type CloneSpecialPropContext = ClonePropContext & {
  specialProps: Record<string, string>;
};
type ClonePropsState = {
  style: Record<string, string>;
  specialProps: Record<string, string>;
};

type CloneFluidPropResult = {
  style: Record<string, string>;
  event?: IEvent;
};

export {
  CloneDocContext,
  ClonePropContext,
  CloneFluidPropContext,
  ClonePropsState,
  CloneFluidPropResult,
  CloneSpecialPropContext,
};
