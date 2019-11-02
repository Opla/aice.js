/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import run from './run';
import test from './test';
import version from './version';

const commands = [run, test, version];

export default (commandName, cli, yargs) => {
  let y = yargs;
  commands.forEach(init => {
    // const init = commands[name];
    const command = init(cli);
    const { isDefault } = command;
    let cmd = command.commandName;
    if (isDefault) {
      cmd = [cmd, '$0'];
    }
    y = y.command(cmd, command.description, command.builder || {}, () => {
      command.execute().then();
    });
  });
};
