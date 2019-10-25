/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { /* exec, */ spawn } from 'child_process';
import { expect } from 'chai';

const { PATH } = process.env;

const inputExec = (childProcess, inputs, timeout, lines, callback) => {
  const input = inputs.shift();
  if (input) {
    setTimeout(() => {
      console.log("stdin", input);
      childProcess.stdin.write(`${input}\n`);
      const l = lines;
      l[l.length - 1] += input;
      inputExec(childProcess, inputs, timeout, lines, callback);
    }, timeout);
  } else {
    console.log("stdin close");
    callback();
  }
};

const execCommand = async (command, args = [], inputs = []) =>
  new Promise((resolve, reject) => {
    const childProcess = spawn('node', ['./bin/aice.js', command].concat(args), {
      env: {
        NODE_ENV: 'test',
        PATH,
      },
    });
    let isInput = inputs.length > 0;
    const lines = [];
    childProcess.stdout.on('data', data => {
      const str = data
        .toString()
        .split('\n')
        .filter(s => s.length !== 0);
      lines.push(...str);
      if (!isInput) {
        childProcess.stdin.end();
        resolve(lines.map(s => s.trim()));
      } else {
        console.log("new out", str);
      }
    });
    childProcess.on('error', error => {
      reject(Object.assign(new Error(error.message)));
    });
    if (isInput) {
      childProcess.stdin.setEncoding('utf-8');
      inputExec(childProcess, inputs, 50, lines, () => {
        childProcess.stdin.end();
        isInput = false;
      });
    }
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
});

describe('AICE CLI interact', () => {
  it('command #exit', async () => {
    const result = await execCommand('inreact', null, ['#exit']);
    console.log("result", result);
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
