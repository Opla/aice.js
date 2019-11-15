/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import readline from 'readline';
import emoji from 'node-emoji';
import yargs from 'yargs';
import aiceUtils from 'aice-utils';
import { getPackageDependencyVersion } from './utils/packageUtils';
import commands from './commands';

class AIceCLI {
  constructor(args, output, exit, FileManager) {
    this.output = output;
    const version = getPackageDependencyVersion('aice');
    yargs
      .version(version, '-v, --version')
      .usage('Usage: $0 [command] [options]')
      .help('h')
      .alias('h', 'help');
    this.args = args;
    this.command = commands(this, yargs);
    this.exit = exit;
    this.aiceUtils = aiceUtils;
    /* istanbul ignore next */
    if (FileManager) {
      const fm = new FileManager();
      fm.cli = this;
      this.setFileManager(fm);
    }
  }

  setFileManager(fm) {
    this.aiceUtils.setFileManager(fm);
  }

  log(text, ...opts) {
    this.output.log(text, ...opts);
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
    this.exec = yargs.parse();
  }
}

const start = (args, output, exit, fm) => {
  const cli = new AIceCLI(args, output, exit, fm);
  cli.execute();
  return cli;
};

export default start;
