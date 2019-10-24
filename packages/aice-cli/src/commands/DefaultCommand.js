/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getPackageDependencyVersion } from '../utils/packageUtils';

export default class DefaultCommand {
  constructor(cli) {
    this.cli = cli;
  }

  // TODO
  execute(parameters) {
    this.parameters = parameters;
    const version = getPackageDependencyVersion('aice');
    return `v${version}`;
  }
}
