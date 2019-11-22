/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class IntentResolver {
  constructor({ name, trainFunc, executeFunc, evaluateFunc, ...settings } = {}) {
    if (!name) {
      throw new Error('Invalid IntentResolver constructor - Missing name');
    }
    this.settings = settings;
    this.name = name;
    this.doTrain = trainFunc || (inputs => inputs);
    if (executeFunc) {
      this.execute = executeFunc;
    }
    if (evaluateFunc) {
      this.evaluate = evaluateFunc;
    }
    this.inputs = [];
  }

  /**
   * Base train function - Can be redefine to better fit needs (ML)
   */
  async train(inputs = []) {
    this.inputs = this.doTrain(inputs);
  }

  /**
   * Base evaluate function - Need to be redefine in sub-class
   * @returns {Inputs} Inputs filtered by lang
   */
  async execute(lang, sentence, context) {
    const { topic = '*' } = context;
    return this.inputs.filter(i => i.lang === lang && i.topic === topic);
  }

  /**
   * evaluate Intent
   * @returns {Intent} Intent with the best score
   */
  async evaluate(lang, sentence, context) {
    const res = await this.execute(lang, sentence, context);
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
