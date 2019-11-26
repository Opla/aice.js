/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import issuesFactory from '../issues';

export default class OutputRenderer {
  constructor({ name, outputs = [], services = {}, ...settings } = {}) {
    if (!name) {
      throw new Error('Invalid OutputRenderer constructor - Missing name');
    }
    this.services = services;
    this.settings = settings;
    this.name = name;
    this.outputs = outputs;
    if (this.settings.debug) {
      if (this.services.tracker) {
        this.tracker = this.services.tracker;
      } else {
        this.issues = [];
        this.tracker = {
          addIssues: i => {
            this.issues.push(i);
            return i;
          },
        };
      }
      this.issuesFactory = this.services.issuesFactory || issuesFactory;
    }
  }

  async train(outputs) {
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
