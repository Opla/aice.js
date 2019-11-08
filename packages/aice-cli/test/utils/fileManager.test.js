/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import FileManager from '../../src/utils/FileManager';

describe('FileManager', () => {
  it('init', async () => {
    const fm = new FileManager();
    fm.init();
    expect(fm.cli).to.equals(undefined);
  });
  it('getFile no parameters', async () => {
    const fm = new FileManager();
    const file = await fm.getFile();
    expect(file.error).to.not.equals(undefined);
  });
  it('getFile a file', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./package.json');
    expect(file.type).to.equals('file');
    expect(file.filename).to.equals('./package.json');
    expect(file.stats).to.not.equals(undefined);
  });
  it('getFile a dir', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./src');
    expect(file.type).to.equals('dir');
    expect(file.filename).to.equals('./src');
    expect(file.stats).to.not.equals(undefined);
  });
  it('loadAsJson a file', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./package.json');
    const json = await fm.loadAsJson(file);
    expect(json.name).to.equals('aice-cli');
  });
  it('loadAsJson a dir', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./src');
    const res = await fm.loadAsJson(file);
    expect(res.error).to.equals('Not a file');
  });
  it('loadAsJson not json', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./.gitignore');
    const json = await fm.loadAsJson(file);
    expect(json.error).to.equals('Not a valid JSON');
  });
  it('loadAsJson faulty file', async () => {
    const fm = new FileManager();
    const file = { type: 'file' };
    const json = await fm.loadAsJson(file);
    expect(json.error).to.equals('Not a file');
  });
  it('loadAsJson faulty file', async () => {
    const fm = new FileManager();
    const file = { type: 'file', filename: './doo' };
    const json = await fm.loadAsJson(file);
    expect(json.error).to.equals("Can't read file");
  });
});
