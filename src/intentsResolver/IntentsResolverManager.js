/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import SimpleIntentResolver from './SimpleIntentsResolver';
import { Utils } from '../utils';

export default class IntentResolverManager {
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
   * Execute sentence througth all IntentsResolvers
   * @returns {Intents}
   */
  execute(lang, sentence, context = {}) {
    const { topic = '*' } = context;
    const res = Utils.flatten(this.intentResolvers.map(ir => ir.execute(lang, sentence, topic))).sort(
      (d1, d2) => parseFloat(d2.score) - parseFloat(d1.score),
    );
    return res;
  }

  match(lang, utterance, context) {
    return Utils.flatten(this.intentResolvers.map(ir => ir.evaluate(lang, utterance, context))).sort(
      (d1, d2) => parseFloat(d2.score) - parseFloat(d1.score),
    );
  }

  /**
   * Evaluate utterance througth all IntentsResolvers and return best scores
   * @returns {Intents}
   */
  evaluate(lang, utterance, context = {}) {
    let res;

    const { topic = '*' } = context;
    // Try to match current topic (domain)
    res = this.match(lang, utterance, context);
    // It wasn't the main one and has no result
    if (res[0] && res[0].score < this.settings.threshold && topic !== '*') {
      res = this.match(lang, utterance, { ...context, topic: '*' });

      // Assign new topic
      res.forEach(r => {
        // eslint-disable-next-line no-param-reassign
        r.context.topic = '*';
      });
    }
    return res;
  }
}
