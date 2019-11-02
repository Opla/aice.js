/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class Test {
  constructor(cli) {
    this.cli = cli;
    this.name = 'test';
    this.commandName = 'test';
    this.description = 'Test a chatbot.';
  }

  async execute() {
    this.cli.header(this);
  }
}

export default cli => new Test(cli);
