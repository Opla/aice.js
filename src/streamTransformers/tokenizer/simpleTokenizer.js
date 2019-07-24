/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Authors: Morgan Perre
 */

const { DoubleLinkedList } = require('../models/');

class SimpleTokenizer {
  static tokenize(stream, list = new DoubleLinkedList(), normalize = true) {
    const normalized = normalize ? stream.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : stream;
    normalized.split(/[^a-z0-9äâàéèëêïîöôùüûœç]+/i).forEach(token => {
      if (token !== '') {
        list.append({ text: token, ner: {} });
      }
    });

    return list;
  }
}

module.exports = SimpleTokenizer;
