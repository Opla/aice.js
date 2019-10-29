/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class Version {
  constructor(cli) {
    this.cli = cli;
    this.name = 'version';
    this.commandName = ['version', '--v', '-version'];
    this.description = 'Return AIce version';
  }

  async execute() {
    this.cli.header(this);
  }
}

export default cli => new Version(cli);
