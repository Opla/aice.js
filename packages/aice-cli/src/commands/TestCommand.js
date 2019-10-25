/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class TestCommand {
  constructor(cli) {
    this.cli = cli;
    this.name = 'test';
  }

  // TODO
  async execute(parameters) {
    this.parameters = parameters;
  }
}
