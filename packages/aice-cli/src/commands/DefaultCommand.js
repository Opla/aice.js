/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class DefaultCommand {
  constructor(cli) {
    this.cli = cli;
    this.name = '🤖';
  }

  // TODO
  async execute(parameters) {
    this.parameters = parameters;
    this.cli.interact(line => {
      let ret = false;
      switch (line) {
        case 'hello':
          this.cli.log('world!');
          break;
        case '#exit':
          this.cli.log('bye!');
          ret = true;
          break;
        default:
          this.cli.log(`Say what? I might have heard '${line.trim()}'`);
          break;
      }
      return ret;
    });
  }
}
