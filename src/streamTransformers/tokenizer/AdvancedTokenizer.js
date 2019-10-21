/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Authors: Morgan Perre
 */

import { DoubleLinkedList } from '../models';

const isSeparator = charToken =>
  charToken === '*' ||
  charToken < '0' ||
  (charToken > '9' && charToken < 'A') ||
  (charToken > 'Z' && charToken < 'a') ||
  (charToken > 'z' && charToken.charCodeAt(0) < 127) ||
  charToken < '!';

export default class AdvancedTokenizer {
  static tokenize(stream, list = new DoubleLinkedList(), normalize = true) {
    const normalized = normalize ? stream.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : stream;
    const appendToken = acc => {
      if (acc !== '') {
        list.append({ text: acc, ner: {} });
      }
    };

    let acc = '';
    for (const charToken of normalized) {
      if (isSeparator(charToken)) {
        appendToken(acc);
        acc = '';
      } else {
        acc += charToken;
      }
    }

    appendToken(acc);
    return list;
  }
}
