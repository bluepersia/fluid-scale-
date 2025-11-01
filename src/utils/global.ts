import { Global } from "../index.types";

function makeDefaultGlobal(): Global {
  return {
    isBrowser: false,
  };
}

export { makeDefaultGlobal };
