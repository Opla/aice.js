/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const IntentResolver = require('./intentResolver');

const { Comparator, DamerauLevenshteinStrategy } = require('../utils');

class SimpleIntentResolver extends IntentResolver {
  constructor({ settings }, comparator = new Comparator(new DamerauLevenshteinStrategy())) {
    super({ settings, name: 'simple-intents-resolver' });
    this.comparator = comparator;
  }

  process(lang, sentence, topic) {
    // Preprocess filter lang
    const inputs = super.process(lang, topic);

    const result = inputs.map(input => {
      const comparatorResult = this.comparator.compare(input.tokenizedInput, sentence);
      // Case - Fallback (lower score) // NOT SO GOOD even with threshold + infitesimal
      if (input.input === '{{*}}' || input.input === '{{^}}') {
        comparatorResult.confidence = this.settings.threshold + 0.01;
      }
      return {
        intentid: input.intentid,
        input: input.input,
        score: comparatorResult.match ? comparatorResult.confidence : 0,
        context: comparatorResult.context,
      };
    });
    return result;
  }
}

module.exports = SimpleIntentResolver;
