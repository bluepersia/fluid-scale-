type Global = Features & UserSettings;

type Features = {
  isBrowser?: boolean;
};

type UserSettings = {};

const STYLE_RULE_TYPE = 1;
const MEDIA_RULE_TYPE = 4;

export { Global, Features, UserSettings, STYLE_RULE_TYPE, MEDIA_RULE_TYPE };
