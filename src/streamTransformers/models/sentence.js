/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class Sentence {
  constructor(stream = '') {
    this.raw = '';
    this.write(stream);
  }

  write(stream) {
    this.raw += stream;
    // this.linkedListNER += NERTokenizer.tokenize(stream, this.linkedListNER);
    // this.normalized += Normalizer.normalize(stream);
    // this.linkedListWords = ComplexeTokenizer.tokenize(stream, this.linkedListWords);
    // this.linkedListIDK = ComplexeTokenizer.tokenize(stream, this.linkedListIDK);
  }
}
