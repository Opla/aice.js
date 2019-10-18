/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Authors: Morgan Perre
 */

import { DoubleLinkedList } from '../models';
import ExpressionParser from './TMPExpressionParser';

const isSeparator = charToken =>
  charToken < '0' ||
  (charToken > '9' && charToken < 'A') ||
  (charToken > 'Z' && charToken < 'a') ||
  (charToken > '}' && charToken.charCodeAt(0) < 127) ||
  charToken < '!';

/**
 * InputExpressionTokenizer
 */
export default class InputExpressionTokenizer {
  constructor() {
    /**
     * regex: the regex used to capture an expession
     * parser: the function used to parse the expession captured
     */
    this.subExpressionParser = new ExpressionParser([
      {
        regex: /(\*)/,
        parser: () => ({ type: 'ANY' }),
      },
      {
        regex: /(\^)/,
        parser: () => ({ type: 'ANYORNOTHING' }),
      },
      {
        regex: /@([\w_]+)/,
        parser: match => ({ type: 'ENTITY', name: match }),
      },
    ]);

    /**
     * regex: the regex used to capture an expession
     * parser: the function used to parse the expession captured
     */
    this.expressionParser = new ExpressionParser([
      {
        regex: /{{([^ }]+?=[^ }]+?)}}/,
        parser: match => {
          const matchs = match.split('=');

          const { expression } = this.subExpressionParser.parseFromText(matchs[1])[0];
          const contextName = matchs[0];

          return { ...expression, contextName };
        },
      },
      {
        regex: /{{([^= }]+?)}}/,
        parser: match => this.subExpressionParser.parseFromText(match)[0].expression,
      },
    ]);
  }

  /**
   * Tokenize an Intent Input
   * @param {String} stream Raw Intent Input
   * @param {DoubleLinkedList} list A linkedlist that represent the Intent Input (if built by stream)
   * @returns {DoubleLinkedList} A linkedlist that represent a Tokenized Intent Input
   */
  tokenize(stream, list = new DoubleLinkedList(), normalize = true) {
    const normalized = normalize ? stream.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : stream;

    const appendToken = acc => {
      if (acc.text !== '') {
        list.append(acc);
      }
    };

    // Run InputExpressionParser on normalized input
    const inputTokens = this.expressionParser.parseFromText(normalized);

    inputTokens.forEach(token => {
      const { text, expression } = token;

      // CASE - Token is already expressed
      if (expression) {
        appendToken({ text, expression });
        return;
      }

      // CASE - text may need more tokenization
      let word = '';
      for (const charToken of text) {
        if (isSeparator(charToken)) {
          appendToken({ text: word, expression });
          word = '';
        } else {
          word += charToken;
        }
      }
      appendToken({ text: word, expression });
    });

    return list;
  }
}
