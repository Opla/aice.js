/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SimpleIntentResolver = require('./simpleIntentResolver');
const { Utils } = require('../utils');

class IntentResolverManager {
  constructor({ settings }) {
    this.settings = { threshold: 0.75, ...settings };
    this.intentResolvers = [];
    if (this.settings.intentResolvers && this.settings.intentResolvers.length > 0) {
      this.intentResolvers = this.settings.intentResolvers;
    } else {
      this.intentResolvers = [new SimpleIntentResolver({ settings: this.settings })];
    }
  }

  /**
   * Train all IntentsResolvers
   * @returns {Intents}
   */
  train(inputs) {
    this.intentResolvers.forEach(ir => ir.train(inputs));
  }

  /**
   * Process sentence througth all IntentsResolvers
   * @returns {Intents}
   */
  process(lang, sentence, topic) {
    const res = Utils.flatten(this.intentResolvers.map(ir => ir.process(lang, sentence, topic))).sort(
      (d1, d2) => parseFloat(d2.score) - parseFloat(d1.score),
    );
    return res;
  }

  /**
   * Process utterance througth all IntentsResolvers and return best scores
   * @returns {Intents}
   */
  processBest(lang, utterance, topic) {
    let res;
    // Try to match current topic (domain)
    res = Utils.flatten(this.intentResolvers.map(ir => ir.processBest(lang, utterance, topic))).sort(
      (d1, d2) => parseFloat(d2.score) - parseFloat(d1.score),
    );

    // It wasn't the main one and has no result
    if (res[0] && res[0].score < this.settings.threshold && topic !== '*') {
      res = Utils.flatten(this.intentResolvers.map(ir => ir.processBest(lang, utterance, '*'))).sort(
        (d1, d2) => parseFloat(d2.score) - parseFloat(d1.score),
      );
    }

    return res;
  }
}

module.exports = IntentResolverManager;
