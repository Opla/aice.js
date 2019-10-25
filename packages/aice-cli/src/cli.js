/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import readline from 'readline';
import emoji from 'node-emoji';
import { DefaultCommand, TestCommand } from './commands';
import { getPackageDependencyVersion } from './utils/packageUtils';

class AIceCLI {
  constructor(command, output, exit) {
    this.output = output;
    switch (command[0]) {
      case 'test':
        this.command = new TestCommand(this);
        break;
      default:
        this.command = new DefaultCommand(this);
    }
    this.exit = exit;
  }

  log(text) {
    this.output.log(text);
  }

  interact(callback) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> ',
    });
    rl.prompt();

    rl.on('line', async line => {
      if (callback(line.trim())) {
        this.exit(0);
      }
      rl.prompt();
    }).on('close', () => {
      this.exit(0);
    });
  }

  async execute(parameters) {
    const version = getPackageDependencyVersion('aice');
    this.log(emoji.emojify(`AICE ${this.command.name} v${version}`));
    return this.command.execute(parameters);
  }
}

const start = (command, output, exit) => {
  const cli = new AIceCLI(command, output, exit);
  const parameters = [];
  cli.execute(parameters).then();
};

export default start;
