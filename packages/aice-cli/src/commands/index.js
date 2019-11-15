/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import run from './run';
import test from './test';
import version from './version';
import validate from './validate';

const commands = [run, test, validate, version];

export default (cli, yargs) => {
  let y = yargs;
  commands.forEach(init => {
    const command = init(cli);
    const { isDefault } = command;
    let cmd = command.commandName;
    if (isDefault) {
      cmd = [cmd, '$0'];
    }
    let builder = {};
    if (command.builder) {
      builder = yg => {
        command.builder.forEach(el => {
          yg.positional(el.name, {
            describe: el.description,
            default: el.default,
          });
        });
      };
    }
    y = y.command(cmd, command.description, builder, argv => {
      command.execute(argv).then();
    });
  });
};
