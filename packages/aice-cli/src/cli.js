/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class AIceCLI {
  constructor(command) {
    switch (command[0]) {
      case 'test':
        this.command = 'test';
        break;
      default:
        this.command = 'default';
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async execute() {
    return `AICE ${this.command}`;
  }
}

const start = (command, callback) => {
  const cli = new AIceCLI(command);
  cli.execute().then(resolve => {
    callback(resolve);
  });
};

export default start;
