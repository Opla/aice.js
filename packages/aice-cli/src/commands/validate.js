/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import aiceUtils from 'aice-utils';

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
    const result = await aiceUtils.validateData(argv.filename);
    this.cli.log('result', result);
  }
}

export default cli => new Validate(cli);
