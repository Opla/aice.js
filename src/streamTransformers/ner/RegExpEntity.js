/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import NamedEntity from './NamedEntity';
import Entity from './Entity';

export default class RegExpEntity extends NamedEntity {
  constructor({ name, scope, regex, resolve }) {
    if (!regex) {
      throw new Error('Invalid Entity constructor - Missing regex');
    }
    super({
      name,
      scope,
      type: 'regex',
      resolve,
    });
    this.addParameter({ regex });
  }

  getRegExp() {
    return new RegExp(this.getParameter('regex'));
  }

  /**
   * Extract matched RegExp from utterance.
   * @param {String} lang Language of the utterance.
   * @param {String} utterance Utterance to be processed.
   * @returns {Entity[]} List of entity that matched RegExp.
   */
  extract(lang, utterance) {
    const regex = this.getRegExp();
    const extracted = [];
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(utterance)) !== null) {
      const v = match[0];
      const entity = new Entity({
        match: v,
        confidence: 1,
        type: this.type,
        name: this.name,
        start: match.index,
        end: match.index + v.length,
        resolution: this.resolve(v),
      });
      extracted.push(entity);
    }
    return extracted;
  }
}
