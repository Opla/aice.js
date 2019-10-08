/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const NamedEntity = require('./NamedEntity');
const Entity = require('./Entity');

class EnumEntity extends NamedEntity {
  constructor({ name, scope, enumeration, resolve }) {
    if (!enumeration || enumeration.length < 1) {
      throw new Error('Invalid Entity constructor - Missing enum');
    }
    super({
      name,
      scope,
      type: 'enum',
      resolve,
    });

    this.addParameter({ enumeration });
  }

  getEnumeration() {
    return this.getParameter('enumeration');
  }

  /**
   * Extract matched EnumEntity from utterance.
   * @param {String} lang Language of the utterance.
   * @param {String} utterance Utterance to be processed.
   * @returns {Entity[]} List of entity that matched a value from an enumeration.
   */
  extract(lang, utterance) {
    const enumeration = this.getEnumeration();
    const extracted = [];
    enumeration.forEach(enume => {
      enume.values.forEach(e => {
        const le = e.toLowerCase();
        const located = utterance
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .indexOf(le.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
        if (located >= 0) {
          const entity = new Entity({
            match: utterance.slice(located, located + le.length),
            row: `${this.name}_${enume.key}`.toLocaleLowerCase(),
            confidence: 1,
            type: this.type,
            name: this.name,
            start: located,
            end: located + le.length,
            resolution: this.resolve(le),
          });
          extracted.push(entity);
        }
      });
    });
    return extracted;
  }
}

module.exports = EnumEntity;
