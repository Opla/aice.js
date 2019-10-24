/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import emoji from 'node-emoji';
import { DefaultCommand, TestCommand } from './commands';
import { getPackageDependencyVersion } from './utils/packageUtils';

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
    const version = getPackageDependencyVersion('aice');
    return emoji.emojify(`AICE ${this.command.name} v${version} ${out}`);
  }
}

const start = (command, callback) => {
  const cli = new AIceCLI(command);
  cli.execute().then(resolve => {
    callback(resolve);
  });
};

export default start;
