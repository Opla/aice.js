/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class IntentResolver {
  constructor({ name, settings }) {
    if (!name) {
      throw new Error('Invalid IntentsResolver constructor - Missing name');
    }
    this.settings = settings || {};
    this.name = name;
    this.inputs = [];
  }

  /**
   * Base train function - Can be redefine to better fit needs (ML)
   */
  train(inputs) {
    this.inputs = inputs || [];
  }

  /**
   * Base process function - Need to be redefine in sub-class
   * @returns {Inputs} Inputs filtered by lang
   */
  process(lang, context) {
    const { topic = '*' } = context;
    return this.inputs.filter(i => i.lang === lang && i.topic === topic);
  }

  /**
   * ProcessBest Intent
   * @returns {Intent} Intent with the best score
   */
  processBest(lang, sentence, context) {
    const res = this.process(lang, sentence, context);

    // TODO Input intent conditions

    // Previous handling
    const { previous } = context;
    const r = res.map(i => ({
      intentid: i.intentid,
      input: i.input,
      score: i.previous.length > 0 && !i.previous.includes(previous) ? 0.1 : i.score,
      context: i.context,
    }));
    return r.sort((d1, d2) => parseFloat(d2.score) - parseFloat(d1.score))[0];
  }
}

module.exports = IntentResolver;
