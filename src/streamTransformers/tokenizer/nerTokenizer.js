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

export default class NERTokenizer {
  constructor(namedEntityRecognizer) {
    if (!namedEntityRecognizer) {
      throw new Error('Invalid NERTokenizer constructor - NamedEntityRecognizer is required');
    }
    this.namedEntityRecognizer = namedEntityRecognizer;
  }

  tokenize(lang, stream, list = new DoubleLinkedList(), normalize = true) {
    const normalized = normalize ? stream.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : stream;
    const appendToken = (acc, entity = {}) => {
      if (acc !== '') {
        list.append({ text: acc, ner: entity });
      }
    };

    const entities = this.namedEntityRecognizer.findEntitiesFromUtterance(lang, normalized);
    const sortEntities = entities.sort((e1, e2) => e1.start - e2.start);

    let acc = '';
    let index = 0;
    let entity = null;
    for (const charToken of normalized) {
      if (!entity) {
        entity = sortEntities.shift();
      }

      if (entity && index === entity.end - 1) {
        acc += charToken;
        appendToken(acc, entity);
        entity = null;
        acc = '';
      } else if (isSeparator(charToken) && (!entity || index < entity.start)) {
        appendToken(acc);
        acc = '';
      } else {
        acc += charToken;
      }

      // Increment index
      index += 1;
    }

    appendToken(acc);
    return list;
  }
}
