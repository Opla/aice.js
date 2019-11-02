/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class NamedEntity {
  constructor({ name, type, scope, resolve = v => v }) {
    if (!name) {
      throw new Error('Invalid Entity constructor - name are required');
    }

    this.name = name;
    this.type = type || 'named';
    this.scope = scope || 'system';
    this.resolve = resolve;
    this.parameters = [];
    this.hasError = false;
  }

  addParameter(parameter) {
    if (!this.parameters.includes(parameter)) {
      this.parameters.push(parameter);
    }
  }

  getParameter(parameterKey) {
    return this.getParameters().find(p => Object.keys(p).includes(parameterKey))[parameterKey];
  }

  getParameters() {
    return this.parameters;
  }

  extract() {
    this.hasError = true;
    throw new Error('Invalid NamedEntity extraction - Should be implemented in child class');
  }
}
