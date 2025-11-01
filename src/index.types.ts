import { EventBus } from "gold-sight";

type Global = Features & UserSettings & EventContext;

type Features = {
  isBrowser?: boolean;
};

type UserSettings = {};

type EventContext = {
  event?: EventBus;
  eventUUID?: string;
};

const STYLE_RULE_TYPE = 1;
const MEDIA_RULE_TYPE = 4;

export {
  Global,
  Features,
  UserSettings,
  STYLE_RULE_TYPE,
  MEDIA_RULE_TYPE,
  EventContext,
};
