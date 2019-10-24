/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DefaultCommand, TestCommand } from './commands';

class AIceCLI {
  constructor(command) {
    switch (command[0]) {
      case 'test':
        this.command = new TestCommand(this);
        break;
      default:
        this.command = new DefaultCommand(this);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async execute() {
    const out = this.command.execute();
    return `AICE ${out}`;
  }
}

const start = (command, callback) => {
  const cli = new AIceCLI(command);
  cli.execute().then(resolve => {
    callback(resolve);
  });
};

export default start;
