/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AICE from './AICE';

const addIntent = (aice, { name: intentid, inputs, outputs, outputType, topic = '*', previous }, lang = 'fr') => {
  // IntentsInputs
  inputs.forEach(i => aice.addInput(lang, intentid, i.inputMessage, topic, previous));

  // IntentsOutputs
  const answers = outputs.map(o => {
    const tokenizedOutput = aice.OutputExpressionTokenizer.tokenize(o.outputMessage);
    const answer = {
      lang,
      tokenizedOutput,
      preWSs: undefined,
      conditions: o.conditions,
      WSs: o.WSs,
    };

    return answer;
  });

  aice.outputs.push({ intentid, outputType, answers });
};

export default class Loader {
  static fromJSON(json) {
    if (!json) throw new Error('Loader fromJSON - Missing json');

    const aice = new AICE();

    if (json.intents) {
      json.intents.forEach(i => addIntent(aice, i));
    }
    return aice;
  }

  static fromBinary() {
    // TODO a binary format ?
    return new AICE();
  }
}
