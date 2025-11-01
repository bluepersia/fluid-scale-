import { DocClone } from "../../../../../../src/parsing/serialization/docClone";

function writeUtils(docClone: DocClone) {
  const sheet = docClone.addSheet();
  let styleRule;

  styleRule = sheet.addStyleRule();
  styleRule.selector = ".u-container";
  styleRule.style = {
    "padding-top": "0px",
    "padding-right": "1.14rem",
    "padding-bottom": "0px",
    "padding-left": "1.14rem",
  };
}

export { writeUtils };
