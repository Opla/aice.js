/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { spawn } from 'child_process';
import { expect } from 'chai';

const { PATH } = process.env;

const execCommand = async (command, args = [], inputs = []) =>
  new Promise((resolve, reject) => {
    const childProcess = spawn(
      './bin/aice',
      [command].concat(args),
      {
        env: {
          NODE_ENV: 'test',
          PATH,
          ...process.env,
        },
      },
      { encoding: 'utf-8', detached: true, stdio: 'inherit' },
    );
    const lines = [];
    childProcess.stdout.on('data', data => {
      const str = data
        .toString()
        .split('\n')
        .filter(s => s.length !== 0);
      lines.push(...str);
      const isInput = inputs.length > 0;
      if (!isInput) {
        childProcess.stdin.end();
        resolve(lines.map(s => s.trim()));
      } else {
        for (const s of str) {
          if (s === '> ') {
            const input = inputs.shift();
            lines[lines.length - 1] += input;
            childProcess.stdin.write(`${input}\n`);
          }
        }
      }
    });
    childProcess.on('error', error => {
      reject(Object.assign(new Error(error.message)));
    });
  });

describe('AICE CLI default', () => {
  it('No command', async () => {
    const result = await execCommand();
    expect(result[0])
      .to.be.a('string')
      .and.match(/^AICE 🤖 v\d.\d.\d/);
  });
  it('test command', async () => {
    const result = await execCommand('test');
    expect(result[0])
      .to.be.a('string')
      .and.match(/^AICE test v\d.\d.\d/);
  });
  it('version command', async () => {
    const result = await execCommand('version');
    expect(result[0])
      .to.be.a('string')
      .and.match(/^AICE version v\d.\d.\d/);
  });
});

describe('AICE CLI interact', () => {
  it('command #exit', async () => {
    const result = await execCommand('inreact', null, ['#exit']);
    expect(result[0])
      .to.be.a('string')
      .and.match(/^AICE 🤖 v\d.\d.\d/);
    expect(result[1])
      .to.be.a('string')
      .and.eq('> #exit');
    expect(result[2])
      .to.be.a('string')
      .and.eq('bye!');
  });
  it('say hello', async () => {
    const result = await execCommand('inreact', null, ['hello', '#exit']);
    expect(result[0])
      .to.be.a('string')
      .and.match(/^AICE 🤖 v\d.\d.\d/);
    expect(result[1])
      .to.be.a('string')
      .and.eq('> hello');
    expect(result[2])
      .to.be.a('string')
      .and.eq('world!');
  });
  it('say gfgf', async () => {
    const result = await execCommand('inreact', null, ['gfgf', '#exit']);
    expect(result[0])
      .to.be.a('string')
      .and.match(/^AICE 🤖 v\d.\d.\d/);
    expect(result[1])
      .to.be.a('string')
      .and.eq('> gfgf');
    expect(result[2])
      .to.be.a('string')
      .and.eq("Say what? I might have heard 'gfgf'");
  });
});
describe('AICE CLI validate', () => {
  it('No command', async () => {
    const result = await execCommand('validate');
    expect(result[0])
      .to.be.a('string')
      .and.match(/^AICE Validate v\d.\d.\d/);
  });
});
