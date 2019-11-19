/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Command from './Command';

class Test extends Command {
  constructor(cli) {
    super(cli, 'test', 'test [filename] [testset]', 'Test a chatbot using a testset.');
  }

  async execute(argv) {
    super.execute(argv);
    if (this.cli.aiceUtils) {
      const result = await this.cli.aiceUtils.importData(argv.filename);
      this.cli.log('result', result);
    } else {
      this.cli.log('result : no AIce-utils configured');
    }
  }
}

export default cli => new Test(cli);
