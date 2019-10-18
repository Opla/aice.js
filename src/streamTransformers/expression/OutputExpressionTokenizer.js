/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Authors: Morgan Perre
 */

import { DoubleLinkedList } from '../models';
import ExpressionParser from './ExpressionParser';

const parseValue = match => {
  const isText = match.includes("'") || match.includes('"');
  const value = match.trim();

  return isText ? value.slice(1, -1) : { type: 'VARIABLE', value };
};

/**
 * OutputExpressionTokenizer
 */
export default class OutputExpressionTokenizer {
  constructor() {
    /**
     * regex: the regex used to capture an expession
     * parser: the function used to parse the expession captured
     */
    this.expressionParser = new ExpressionParser([
      {
        regex: /{{([^= }]+?)}}/,
        parser: match => {
          const contextName = match;

          return { type: 'OUTPUT', contextName };
        },
      },
      {
        regex: /{{([^ }]+?=[^}]+?)}}/,
        parser: match => {
          const matchs = match.split('=');

          const contextName = matchs[0];
          const value = parseValue(matchs[1]);

          return { type: 'OUTPUT', contextName, value };
        },
      },
      {
        regex: /<<([^ >]+?=[^>]+?)>>/,
        parser: match => {
          const matchs = match.split('=');

          const contextName = matchs[0];
          const value = parseValue(matchs[1]);

          return { type: 'CODE', contextName, value };
        },
      },
    ]);
  }

  /**
   * Tokenize an Intent Output
   * @param {String} stream Raw Intent Output
   * @param {DoubleLinkedList} list A linkedlist that represent the Intent Output (if built by stream)
   * @returns {result} match: true if it matched & context[] that will be used to change user context (contains capture / entities)
   */
  tokenize(stream, list = new DoubleLinkedList()) {
    const outputTokens = this.expressionParser.parseFromText(stream);

    outputTokens.forEach(token => {
      const { text, expression } = token;
      list.append({ text, expression });
    });

    return list;
  }
}
