/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import IntentResolver from './IntentResolver';
import { Comparator, DamerauLevenshteinStrategy } from '../utils';

export default class SimpleIntentResolver extends IntentResolver {
  constructor({ comparator = new Comparator(new DamerauLevenshteinStrategy()), ...settings } = {}) {
    super({ ...settings, name: 'simple-intents-resolver' });
    this.comparator = comparator;
  }

  async execute(lang, sentence, context) {
    // Preprocess filter lang
    const inputs = await super.execute(lang, sentence, context);

    const result = inputs.map(input => {
      const comparatorResult = this.comparator.compare(input.tokenizedInput, sentence);
      // Case - Fallback (lower score) // NOT SO GOOD even with threshold + infitesimal
      if (input.input === '{{*}}' || input.input === '{{^}}') {
        comparatorResult.confidence = this.settings.threshold + 0.01;
      }
      const score = comparatorResult.match ? comparatorResult.confidence : 0;
      return {
        intentid: input.intentid,
        input: input.input,
        previous: input.previous ? input.previous : [],
        score,
        context: comparatorResult.context,
      };
    });
    return result;
  }
}
