/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import readline from 'readline';
import emoji from 'node-emoji';
import yargs from 'yargs';
import { getPackageDependencyVersion } from './utils/packageUtils';
import commands from './commands';

class AIceCLI {
  constructor(args, output, exit) {
    this.output = output;
    const version = getPackageDependencyVersion('aice');
    yargs
      .version(version, '-v, --version')
      .usage('Usage: $0 [command] [options]')
      .help('h')
      .alias('h', 'help');
    this.args = args;
    this.command = commands('', this, yargs);
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

  header(command) {
    const version = getPackageDependencyVersion('aice');
    this.log(emoji.emojify(`AICE ${command.name} v${version}`));
  }

  execute() {
    // return this.command.execute();
    this.exec = yargs.parse();
  }
}

const start = (args, output, exit) => {
  const cli = new AIceCLI(args, output, exit);
  cli.execute();
};

export default start;
