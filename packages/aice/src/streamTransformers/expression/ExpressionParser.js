/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export default class ExpressionParser {
  constructor(expressionTypes) {
    this.expressionTypes = expressionTypes;
    this.regexString = this.expressionTypes.map(b => b.regex.source).join('|');
  }

  parseFromText(textToParse) {
    const regex = new RegExp(this.regexString, 'g');

    let index = 0;
    const children = [];
    let match = regex.exec(textToParse);
    while (match) {
      // Parse the text between block
      const text = textToParse.slice(index, match.index);
      if (text) {
        // Append text to children
        children.push({ text, expression: undefined });
      }

      const firstElement = match.shift(); // Remove first element who is the global match for get only captured groups
      const type = match.findIndex(e => e); // Get the block type
      /* TODO check this : if (type !== -1) {
        children.push({ text: firstElement, expression: this.expressionTypes[type].parser(match[type]) });
      } */
      children.push({ text: firstElement, expression: this.expressionTypes[type].parser(match[type]) });

      index = regex.lastIndex;
      match = regex.exec(textToParse);
    }

    if (index < textToParse.length) {
      const text = textToParse.slice(index, textToParse.length);
      // Append last text to children
      children.push({ text, expression: undefined });
    }

    return children;
  }
}
