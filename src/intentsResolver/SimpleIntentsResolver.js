/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import IntentsResolver from './IntentsResolver';
import { Comparator, DamerauLevenshteinStrategy } from '../utils';

export default class SimpleIntentsResolver extends IntentsResolver {
  constructor({ settings }, comparator = new Comparator(new DamerauLevenshteinStrategy())) {
    super({ settings, name: 'simple-intents-resolver' });
    this.comparator = comparator;
  }

  execute(lang, sentence, context) {
    // Preprocess filter lang
    const inputs = super.execute(lang, context);

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
