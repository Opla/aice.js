/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class Validate {
  constructor(cli) {
    this.cli = cli;
    this.name = 'Validate';
    this.commandName = 'validate [filename]';
    this.description = 'Validate some files : OpenNLX v1 & v2, AIce Configuration. and tests files';
    this.builder = [{ name: 'filename', description: 'filename|pathTofiles to validate' }];
  }

  async execute(argv) {
    this.cli.header(this);
    if (this.cli.aiceUtils) {
      const result = await this.cli.aiceUtils.validateData(argv.filename);
      this.cli.log('result', result);
    } else {
      this.cli.log('result : no AIce-utils configured');
    }
  }
}

export default cli => new Validate(cli);
