/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class OutputRenderer {
  constructor({ name, outputs = [], ...settings } = {}) {
    if (!name) {
      throw new Error('Invalid OutputRenderer constructor - Missing name');
    }
    this.settings = settings;
    this.name = name;
    this.outputs = outputs;
  }

  train(outputs) {
    this.outputs = outputs || [];
  }

  find(intentid) {
    return this.outputs.find(output => (output.intentid === intentid ? output : undefined));
  }

  // eslint-disable-next-line class-methods-use-this
  async execute() {
    throw new Error('Invalid OutputRenderer - execute() should be implemented in child class');
  }
}
