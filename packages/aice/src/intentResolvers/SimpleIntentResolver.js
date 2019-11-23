/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import IntentResolver from './IntentResolver';
import { Comparator, ExactStrategy, DamerauLevenshteinStrategy } from '../utils';

export default class SimpleIntentResolver extends IntentResolver {
  constructor({ comparator = new Comparator(new DamerauLevenshteinStrategy()), ...settings } = {}) {
    super({ ...settings, name: 'simple-intents-resolver' });
    this.exactComp = new Comparator(new ExactStrategy());
    this.comparator = comparator;
  }

  async execute(lang, sentence, context) {
    // Preprocess filter lang
    const inputs = await super.execute(lang, sentence, context);
    // TODO Need to exclude here inputs with score=0
    const result = inputs.map((input, index) => {
      const comparatorResult = this.comparator.compare(input.tokenizedInput, sentence);
      // Case - Fallback (lower score) // NOT SO GOOD even with threshold + infitesimal
      if (input.isAnyOrNothing) {
        comparatorResult.confidence = this.settings.threshold + 0.01;
        comparatorResult.score = 0.9;
        comparatorResult.isAnyOrNothing = true;
      }
      const score = comparatorResult.match ? comparatorResult.score : 0;
      return {
        intentid: input.intentid,
        input: input.input,
        inputIndex: index,
        issues: input.issues,
        previous: input.previous ? input.previous : [],
        score,
        isAnyOrNothing: comparatorResult.isAnyOrNothing,
        context: comparatorResult.context,
      };
    });
    return result;
  }
}
