/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class NERManager {
  constructor(settings = {}) {
    this.language = settings.language || 'fr';
    this.entities = [];
  }

  /**
   * Adds a new named entity to be managed by the NER.
   * @param {NamedEntity} entity A named entity.
   */
  addNamedEntity(entity) {
    this.entities.push(entity);
  }

  /**
   * Find entities on utterance.
   * @param {String} lang Language of the utterance.
   * @param {String} utterance Utterance to be processed.
   * @param {NamedEntity[]} whitelist List of entities to extract.
   * @returns {Entity[]} A list of extracted entities from the utterance.
   */
  findEntitiesFromUtterance(lang, utterance, whitelist) {
    let entitiesFound = [];
    this.entities
      .filter(e => !whitelist || whitelist.includes(e))
      .forEach(entity => {
        const res = entity.extract(lang, utterance);
        entitiesFound = entitiesFound.concat(res);
      });
    return entitiesFound;
  }

  /**
   * Find entities on utterance, and replace them by the entity name.
   * @param {String} lang Language of the utterance.
   * @param {String} utterance Utterance to be processed.
   * @param {NamedEntity[]} whitelist List of entities to extract.
   * @returns {String} Normalized utterance with entities replaced by entity code name.
   */
  normalizeEntityUtterance(lang, utterance, whitelist) {
    const entities = this.findEntitiesFromUtterance(lang, utterance, whitelist);
    let result = '';
    let index = 0;
    const sortEntities = entities.sort((e1, e2) => e1.index - e2.index);
    sortEntities.forEach(e => {
      const entity = e;
      const beginning = utterance.slice(index, entity.index);
      index = entity.index + entity.match.length;
      result += beginning;
      result += `@{{${e.scope}.${e.type}.${e.name}}}`;
    });

    result += utterance.slice(index);
    return result;
  }
}

module.exports = NERManager;
