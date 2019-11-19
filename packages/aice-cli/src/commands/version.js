/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Command from './Command';

class Version extends Command {
  constructor(cli) {
    super(cli, 'version', ['version', '--v', '-version'], 'Return AIce version');
  }
}

export default cli => new Version(cli);
