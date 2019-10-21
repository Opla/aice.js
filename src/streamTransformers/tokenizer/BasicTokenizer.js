/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Authors: Morgan Perre
 */

import { DoubleLinkedList } from '../models';

export default class BasicTokenizer {
  static tokenize(stream, list = new DoubleLinkedList(), normalize = true) {
    const normalized = normalize ? stream.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : stream;
    normalized.split(/[^a-z0-9äâàéèëêïîöôùüûœç]+/i).forEach(token => {
      // Is this "if" is mandatory ?
      /* if (token !== '') {
        list.append({ text: token, ner: {} });
      } */
      list.append({ text: token, ner: {} });
    });

    return list;
  }
}
