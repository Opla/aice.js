/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Command from './Command';

class Validate extends Command {
  constructor(cli) {
    super(
      cli,
      'Validate',
      'validate [filename]',
      'Validate some files : OpenNLX v1 & v2, AIce Configuration. and tests files',
    );
    this.builder = [{ name: 'filename', description: 'filename|pathTofiles to validate' }];
  }

  async execute(argv) {
    super.execute(argv);
    if (this.cli.aiceUtils) {
      const result = await this.cli.aiceUtils.validateData(argv.filename);
      this.cli.log('result', result);
    } else {
      this.cli.log('result : no AIce-utils configured');
    }
  }
}

export default cli => new Validate(cli);
