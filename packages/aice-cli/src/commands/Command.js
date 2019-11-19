/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class Command {
  constructor(cli, name, commandName, description, isDefault = false) {
    this.cli = cli;
    this.name = name;
    this.commandName = commandName;
    this.description = description;
    this.isDefault = isDefault;
  }

  async execute() {
    this.cli.header(this);
  }
}
