/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class IntentResolver {
  constructor({ name, cbTrain, cbExecute, cbEvaluate, ...settings } = {}) {
    if (!name) {
      throw new Error('Invalid IntentsResolver constructor - Missing name');
    }
    this.settings = settings;
    this.name = name;
    this.cbTrain = cbTrain;
    this.cbExecute = cbExecute;
    this.cbEvaluate = cbEvaluate;
    this.inputs = [];
  }

  /**
   * Base train function - Can be redefine to better fit needs (ML)
   */
  train(inputs = []) {
    if (this.cbTrain) {
      this.inputs = this.cbTrain(inputs);
    } else {
      this.inputs = inputs;
    }
  }

  /**
   * Base evaluate function - Need to be redefine in sub-class
   * @returns {Inputs} Inputs filtered by lang
   */
  execute(lang, sentence, context) {
    if (this.cbExecute) {
      return this.cbExecute(lang, sentence, context);
    }
    const { topic = '*' } = context;
    return this.inputs.filter(i => i.lang === lang && i.topic === topic);
  }

  /**
   * evaluate Intent
   * @returns {Intent} Intent with the best score
   */
  evaluate(lang, sentence, context) {
    if (this.cbEvaluate) {
      return this.cbEvaluate(lang, sentence, context);
    }
    const res = this.execute(lang, sentence, context);
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
