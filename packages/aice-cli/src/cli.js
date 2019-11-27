/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import readline from 'readline';
import chalk from 'chalk';
import emoji from 'node-emoji';
import yargs from 'yargs';
import { getPackageDependencyVersion } from './utils/packageUtils';
import commands from './commands';

class AIceCLI {
  constructor(args, output, exit, { FileManager, aiceUtils, aice, ...services }) {
    this.output = output;
    yargs
      .version('version', 'v')
      .usage('Usage: $0 [command] [options]')
      .help('help')
      .alias('help', 'h');
    this.args = args;
    this.command = commands(this, yargs);
    this.exit = exit;
    this.chalk = chalk;
    this.aiceUtils = aiceUtils;
    if (aice) {
      this.aiceUtils.setAIceClass(aice);
    }
    this.aiceUtils.setServices(services);
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

  error(text, ...opts) {
    this.output.error(text, ...opts);
  }

  done() {
    const hr = process.hrtime(this.hrstart);
    this.log('✨  Done in %ds.', (hr[0] + hr[1] / 100000000).toFixed(2));
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
    this.log(chalk.bold(emoji.emojify(`AIce ${command.name} v${version}`)));
  }

  execute() {
    this.hrstart = process.hrtime();
    this.exec = yargs.parse();
  }
}

const start = (args, output, exit, packages) => {
  const cli = new AIceCLI(args, output, exit, packages);
  cli.execute();
  return cli;
};

export default start;
