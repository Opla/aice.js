/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { exec } from 'child_process';
import chai from 'chai';

const { expect } = chai;
const execCommand = async (command, args = []) =>
  new Promise((resolve, reject) => {
    exec(`node "./bin/aice.js" ${command} ${args.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        reject(Object.assign(new Error(error.message), { stdout, stderr }));
      } else {
        const lines = stdout.toString().split('\n');
        resolve(lines);
      }
    });
  });

describe('AICE CLI default', () => {
  it('No command', async () => {
    const result = await execCommand();
    expect(result[0]).to.equal('AICE default');
  });
  it('test command', async () => {
    const result = await execCommand('test');
    expect(result[0]).to.equal('AICE test');
  });
});
